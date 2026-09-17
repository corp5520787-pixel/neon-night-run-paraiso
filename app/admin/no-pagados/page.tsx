'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserX,
  Search,
  RefreshCw,
  Mail,
  Calendar,
  AlertTriangle,
  Download,
  Clock,
  Play,
  CheckCircle2,
  Phone,
  ArrowLeft,
  Loader2,
  RotateCcw,
  Send,
  MessageCircle,
  ShieldAlert,
  Info,
  X,
  Check,
} from 'lucide-react';
import { Participant } from '@/lib/types';

interface OverdueParticipant extends Participant {
  daysPending?: number;
  orderNumber?: string;
  isOverduePending?: boolean;
}

export default function NoPagadosPage() {
  const [items, setItems] = useState<OverdueParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'retained' | 'released'>('all');
  const [modalityFilter, setModalityFilter] = useState('all');

  // Action states
  const [sendingReminderForFolio, setSendingReminderForFolio] = useState<string | null>(null);
  const [executingGlobalReminders, setExecutingGlobalReminders] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Manual spot liberation modal state
  const [releaseModalData, setReleaseModalData] = useState<{
    participant: OverdueParticipant;
    notifyUser: boolean;
    reason: string;
  } | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const [currentTime, setCurrentTime] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    setCurrentTime(Date.now());
    try {
      // 1. Fetch both audit of overdue pending & cancelled participants
      const resAudit = await fetch('/api/admin/audit-overdue');
      const dataAudit = await resAudit.json();

      const combined: OverdueParticipant[] = [];

      if (resAudit.ok && dataAudit.success) {
        // Pending with > 5 days (Cupo aún retenido)
        if (Array.isArray(dataAudit.overduePending)) {
          dataAudit.overduePending.forEach((item: any) => {
            combined.push({
              ...item,
              isOverduePending: true,
              status: 'pending',
            });
          });
        }

        // Already cancelled / liberated spots
        if (Array.isArray(dataAudit.alreadyCancelled)) {
          dataAudit.alreadyCancelled.forEach((item: any) => {
            combined.push({
              ...item,
              isOverduePending: false,
              status: 'cancelled',
            });
          });
        }
      } else {
        // Fallback to participants endpoint
        const resCancelled = await fetch('/api/participants?status=cancelled');
        const dataCancelled = await resCancelled.json();
        if (dataCancelled.success && Array.isArray(dataCancelled.data)) {
          dataCancelled.data.forEach((p: Participant) => {
            combined.push({
              ...p,
              isOverduePending: false,
              status: 'cancelled',
            });
          });
        }
      }

      setItems(combined);
    } catch (err) {
      console.error('Error loading data for no-pagados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.fullName?.toLowerCase().includes(term) ||
        item.folio?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.includes(term);

      const isRec = item.modality === 'Recreativa' || item.category?.toLowerCase().includes('recreativ');
      const matchesModality =
        modalityFilter === 'all' ||
        (modalityFilter === 'recreativa' && isRec) ||
        (modalityFilter === 'competitiva' && !isRec);

      const matchesType =
        filterType === 'all' ||
        (filterType === 'retained' && item.isOverduePending) ||
        (filterType === 'released' && !item.isOverduePending);

      return matchesSearch && matchesModality && matchesType;
    });
  }, [items, search, filterType, modalityFilter]);

  // Counts
  const retainedCount = items.filter(i => i.isOverduePending).length;
  const releasedCount = items.filter(i => !i.isOverduePending).length;

  // Individual Reminder (24h check)
  const handleSendSingleReminder = async (item: OverdueParticipant, force = false) => {
    setSendingReminderForFolio(item.folio);
    try {
      const res = await fetch(`/api/participants/${item.folio}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Recordatorio #${data.reminderCount} enviado con éxito a ${item.fullName} (${item.email}).`,
        });
        loadData();
      } else if (data.cooldown) {
        if (
          confirm(
            `${data.message}\n\n¿Deseas FORZAR el envío de este recordatorio de todos modos ahora mismo?`
          )
        ) {
          handleSendSingleReminder(item, true);
          return;
        }
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'No se pudo enviar el recordatorio.',
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Error de conexión al enviar recordatorio.',
      });
    } finally {
      setSendingReminderForFolio(null);
    }
  };

  // Global Reminders (Evaluates 24h window for all overdue pending)
  const handleSendGlobalReminders = async () => {
    if (retainedCount === 0) {
      alert('No hay corredores pendientes con más de 5 días para enviar recordatorios.');
      return;
    }

    setExecutingGlobalReminders(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/cron/reminders', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Se revisaron las inscripciones: se enviaron ${data.remindersSent} recordatorio(s) por correo a los corredores que ya cumplían su lapso de 24 horas.`,
        });
        loadData();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'Error al ejecutar el envío global de recordatorios.',
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Error de conexión.',
      });
    } finally {
      setExecutingGlobalReminders(false);
    }
  };

  // Open Manual Release Modal
  const openReleaseModal = (participant: OverdueParticipant) => {
    setReleaseModalData({
      participant,
      notifyUser: true,
      reason: `Lugar liberado manualmente por el administrador (más de ${participant.daysPending || 5} días sin registrar pago).`,
    });
  };

  // Confirm Manual Spot Liberation
  const handleConfirmManualRelease = async () => {
    if (!releaseModalData) return;
    const { participant, notifyUser, reason } = releaseModalData;

    setIsReleasing(true);
    try {
      const res = await fetch(`/api/participants/${participant.folio}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || 'Lugar liberado manualmente por falta de pago.',
          notifyUser,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `¡Lugar liberado con éxito! El folio ${participant.folio} de ${participant.fullName} se movió a lugares liberados del cupo de 350. Sus datos se conservan en la base de datos.`,
        });
        setReleaseModalData(null);
        loadData();
      } else {
        alert(data.error || 'Error al liberar el lugar.');
      }
    } catch (err: any) {
      alert(err.message || 'Error de comunicación con el servidor.');
    } finally {
      setIsReleasing(false);
    }
  };

  // Reactivate Participant (if they come in person to pay)
  const handleReactivateParticipant = async (p: OverdueParticipant) => {
    if (
      !confirm(
        `¿Deseas reactivar al participante ${p.fullName} (${p.folio}) como PENDIENTE para que pueda registrar su pago?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/participants/${p.folio}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pending',
          cancellationReason: 'Reactivado manualmente por el administrador',
        }),
      });

      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: `El participante ${p.fullName} ha sido reactivado como PENDIENTE.`,
        });
        loadData();
      } else {
        alert('No se pudo reactivar al participante.');
      }
    } catch (err: any) {
      alert(err.message || 'Error al reactivar participante.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      'Folio',
      'Nombre Completo',
      'Modalidad',
      'Categoría',
      'Talla',
      'Email',
      'Teléfono',
      'Fecha Registro',
      'Días Sin Pagar',
      'Estado Cupo',
      'Recordatorios Enviados',
      'Último Recordatorio',
      'Motivo / Observación',
    ];

    const rows = filteredItems.map(p => {
      const isRec = p.modality === 'Recreativa' || p.category?.toLowerCase().includes('recreativ');
      const isRetained = p.isOverduePending;
      return [
        p.folio,
        `"${p.fullName}"`,
        `"${isRec ? 'Recreativa (3K)' : 'Competitiva (6K)'}"`,
        `"${p.category || 'General'}"`,
        p.shirtSize || '—',
        p.email,
        p.phone,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-MX') : '—',
        p.daysPending ? `${p.daysPending} días` : '—',
        isRetained ? '"Cupo Retenido (Pendiente)"' : '"Lugar Liberado"',
        p.paymentReminderCount || 0,
        p.lastPaymentReminderAt
          ? new Date(p.lastPaymentReminderAt).toLocaleDateString('es-MX')
          : 'Nunca',
        `"${p.cancellationReason || (isRetained ? 'Pendiente con más de 5 días' : 'Lugar liberado')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Participantes_No_Pagados_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to calculate hours since last reminder
  const getReminderStatus = (p: OverdueParticipant) => {
    if (!p.lastPaymentReminderAt) {
      return { canSendNow: true, label: 'Listo para enviar', text: 'Nunca enviado' };
    }
    const lastMs = new Date(p.lastPaymentReminderAt).getTime();
    const nowMs = currentTime || lastMs;
    const diffMs = Math.max(0, nowMs - lastMs);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));

    if (hours >= 24) {
      return {
        canSendNow: true,
        label: 'Listo para enviar (24h cumplidas)',
        text: `Último hace ${hours}h`,
      };
    } else {
      const waitHours = 24 - hours;
      return {
        canSendNow: false,
        label: `Enviado hace ${hours}h (Próximo en ${waitHours}h)`,
        text: `Hace ${hours}h`,
      };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/participantes"
              className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-xl hover:bg-slate-900 transition-colors"
              title="Volver a Participantes"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-950/40">
                <UserX className="w-6 h-6" />
              </span>
              <span>No Pagados (+5 Días)</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Personas con más de 5 días sin pagar. Aquí puedes enviarles recordatorios periódicos cada 24 horas y{' '}
            <strong className="text-rose-300">liberar su lugar manualmente</strong> cuando lo decidas para que otro corredor tome el cupo de 350. Sus datos quedan guardados para futuras carreras.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSendGlobalReminders}
            disabled={executingGlobalReminders || retainedCount === 0}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Envía correo de recordatorio a todos los que cumplan 24 horas desde su último envío"
          >
            {executingGlobalReminders ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4 text-slate-950 fill-current" />
            )}
            <span>Enviar Recordatorios (Cada 24h)</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredItems.length === 0}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-40"
            title="Descargar lista en CSV / Excel"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-lg ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : actionMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
              : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total en No Pagados
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              {items.length}
            </div>
            <span className="text-[10px] text-slate-500">
              Corredores registrados sin pago formalizado
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Cupo Retenido (+5 Días)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {retainedCount}
            </div>
            <span className="text-[10px] text-amber-400/70">
              Puedes liberar su lugar manualmente
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Lugares Ya Liberados
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {releasedCount}
            </div>
            <span className="text-[10px] text-emerald-400/70">
              Disponibles en el cupo de 350 corredores
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* FILTER TABS */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === 'all'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>Todos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-black">
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setFilterType('retained')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === 'retained'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Pendientes (+5 días) - Cupo Retenido</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-black">
                {retainedCount}
              </span>
            </button>

            <button
              onClick={() => setFilterType('released')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === 'released'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Lugares Ya Liberados</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-black">
                {releasedCount}
              </span>
            </button>
          </div>

          {/* MODALITY SELECT */}
          <div className="w-full md:w-auto">
            <select
              value={modalityFilter}
              onChange={e => setModalityFilter(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-semibold"
            >
              <option value="all">Todas las Modalidades</option>
              <option value="competitiva">Competitiva (6K)</option>
              <option value="recreativa">Recreativa (3K)</option>
            </select>
          </div>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por folio, nombre del corredor, correo electrónico o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-4 px-4">Folio</th>
                <th className="py-4 px-4">Fecha Registro</th>
                <th className="py-4 px-4">Tiempo Sin Pagar</th>
                <th className="py-4 px-4">Corredor</th>
                <th className="py-4 px-4">Modalidad</th>
                <th className="py-4 px-4">Contacto</th>
                <th className="py-4 px-4">Recordatorios (24h)</th>
                <th className="py-4 px-4">Estado Cupo</th>
                <th className="py-4 px-4 text-right">Acción Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2.5 text-cyan-400 font-semibold text-xs">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Consultando participantes con más de 5 días sin pagar...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <UserX className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-semibold text-slate-400">No se encontraron corredores con este filtro.</p>
                      <p className="text-[11px] text-slate-600">
                        Los corredores que lleven más de 5 días pendientes sin pagar aparecerán automáticamente en este apartado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isRec = item.modality === 'Recreativa' || item.category?.toLowerCase().includes('recreativ');
                  const isRetained = item.isOverduePending;
                  const reminderStatus = getReminderStatus(item);
                  const isSendingReminder = sendingReminderForFolio === item.folio;

                  // Pre-filled WhatsApp link
                  const waText = encodeURIComponent(
                    `Hola ${item.fullName}, te contactamos de Neon Night Run Paraíso 2026. Vemos que tienes tu registro pendiente con folio ${item.folio}. ¿Podemos ayudarte a completar tu pago antes de liberar tu lugar?`
                  );
                  const waLink = `https://wa.me/52${item.phone?.replace(/\D/g, '')}?text=${waText}`;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isRetained ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* FOLIO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isRetained ? 'text-amber-400' : 'text-rose-400/80 line-through'
                          }`}
                        >
                          {item.folio}
                        </span>
                      </td>

                      {/* FECHA REGISTRO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium text-xs">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </div>
                      </td>

                      {/* TIEMPO SIN PAGAR */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isRetained ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-950/80 text-rose-300 border border-rose-500/40">
                            {item.daysPending || 5} días
                          </span>
                        ) : (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Liberado
                            </span>
                            {item.cancelledAt && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(item.cancelledAt).toLocaleDateString('es-MX')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* CORREDOR */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-xs">{item.fullName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.age ? `${item.age} años` : ''} {item.gender ? `(${item.gender})` : ''} · Talla {item.shirtSize || 'M'}
                        </div>
                      </td>

                      {/* MODALIDAD */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isRec
                              ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {isRec ? 'Recreativa (3K)' : 'Competitiva (6K)'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.category || 'General'}</div>
                      </td>

                      {/* CONTACTO */}
                      <td className="py-4 px-4">
                        <div className="text-slate-300 text-xs truncate max-w-[180px]" title={item.email}>
                          {item.email}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{item.phone}</span>
                          </span>
                          {item.phone && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-emerald-100 transition-colors"
                              title="Enviar mensaje por WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* RECORDATORIOS CADA 24H */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                            {item.paymentReminderCount || 0} enviado(s)
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1" title={reminderStatus.label}>
                          {reminderStatus.text}
                        </div>

                        {/* BUTTON ENVIAR RECORDATORIO INDIVIDUAL */}
                        {isRetained && (
                          <button
                            onClick={() => handleSendSingleReminder(item)}
                            disabled={isSendingReminder}
                            className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all ${
                              reminderStatus.canSendNow
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                            title={
                              reminderStatus.canSendNow
                                ? 'Enviar recordatorio de pago con datos bancarios'
                                : `${reminderStatus.label}. Haz clic para forzar si lo deseas.`
                            }
                          >
                            {isSendingReminder ? (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                            ) : (
                              <Mail className="w-3 h-3 text-amber-400" />
                            )}
                            <span>{reminderStatus.canSendNow ? 'Enviar Recordatorio' : 'Reenviar (24h)'}</span>
                          </button>
                        )}
                      </td>

                      {/* ESTADO CUPPO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isRetained ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/40">
                              Cupo Retenido
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-500/30">
                            Lugar Liberado
                          </span>
                        )}
                      </td>

                      {/* ACCIÓN MANUAL */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {isRetained ? (
                          <button
                            onClick={() => openReleaseModal(item)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40 hover:scale-[1.02] active:scale-95"
                            title="Liberar manualmente el lugar de este corredor para el cupo de 350"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Liberar Lugar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateParticipant(item)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-slate-700"
                            title="Reactivar como participante pendiente si acude a pagar"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reactivar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL SPOT LIBERATION CONFIRMATION MODAL */}
      {releaseModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border-2 border-rose-500/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-rose-950/60 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Liberar Lugar Manualmente
                  </h3>
                  <p className="text-xs text-rose-300">
                    Neon Night Run Paraíso 2026 · Cupo 350
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReleaseModalData(null)}
                disabled={isReleasing}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Corredor:</span>
                <span className="font-bold text-white text-sm">{releaseModalData.participant.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Folio:</span>
                <span className="font-mono font-bold text-yellow-400">{releaseModalData.participant.folio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Días sin pagar:</span>
                <span className="font-bold text-rose-400">
                  {releaseModalData.participant.daysPending || 5} días transcurridos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Modalidad:</span>
                <span className="text-slate-200">
                  {releaseModalData.participant.modality || releaseModalData.participant.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recordatorios previos:</span>
                <span className="text-amber-300">
                  {releaseModalData.participant.paymentReminderCount || 0} enviados
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-200/90 leading-relaxed">
                ⚡ <strong>Efectos de esta acción manual:</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-300 text-[11px]">
                  <li>El cupo de 350 corredores se liberará para permitir que otra persona se inscriba.</li>
                  <li>Los datos del corredor (correo, teléfono y nombre) se conservarán intactos en la base de datos para invitaciones a futuras carreras.</li>
                </ul>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Motivo de la liberación:
                </label>
                <input
                  type="text"
                  value={releaseModalData.reason}
                  onChange={e =>
                    setReleaseModalData({ ...releaseModalData, reason: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={releaseModalData.notifyUser}
                  onChange={e =>
                    setReleaseModalData({ ...releaseModalData, notifyUser: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-700 text-rose-500 focus:ring-rose-500 bg-slate-900"
                />
                <span>Enviar correo de cortesía notificando la liberación del lugar</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReleaseModalData(null)}
                disabled={isReleasing}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmManualRelease}
                disabled={isReleasing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-950/50"
              >
                {isReleasing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserX className="w-4 h-4" />
                )}
                <span>Sí, Liberar Lugar Manualmente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
