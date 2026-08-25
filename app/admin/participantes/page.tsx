'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  Shirt,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X,
  Loader2,
  UserPlus,
  Building2,
  Sparkles,
  Ticket,
  QrCode,
  Banknote,
} from 'lucide-react';
import { Participant, ShirtSize } from '@/lib/types';

export default function AdminParticipantesPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [kitFilter, setKitFilter] = useState('all');

  // Modal states
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showCourtesyModal, setShowCourtesyModal] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);

  // Manual / Courtesy form states
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualBirthDate, setManualBirthDate] = useState('1996-05-15');
  const [manualGender, setManualGender] = useState<'Varonil' | 'Femenil'>('Varonil');
  const [manualCategory, setManualCategory] = useState('Varonil');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('Paraíso');
  const [manualState, setManualState] = useState('Tabasco');
  const [manualSize, setManualSize] = useState<ShirtSize>('M');
  const [manualEmergencyContact, setManualEmergencyContact] = useState('');
  const [manualEmergencyPhone, setManualEmergencyPhone] = useState('');
  const [manualClub, setManualClub] = useState('');
  const [manualPaymentType, setManualPaymentType] = useState<'cash' | 'transfer' | 'courtesy' | 'pending'>('cash');
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/participants');
      if (res.ok) {
        const data = await res.json();
        if (data.data) setParticipants(data.data);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  // Filtered items
  const filtered = participants.filter(p => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.fullName.toLowerCase().includes(term) ||
      p.folio.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;

    const matchesSize =
      sizeFilter === 'all' || p.shirtSize === sizeFilter;

    const matchesKit =
      kitFilter === 'all' ||
      (kitFilter === 'delivered' && p.kitDelivered) ||
      (kitFilter === 'pending' && !p.kitDelivered);

    return matchesSearch && matchesStatus && matchesSize && matchesKit;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (participants.length === 0) return;
    const headers = [
      'Folio',
      'Nombre Completo',
      'Edad',
      'Género',
      'Categoría',
      'Talla Playera',
      'Email',
      'Teléfono',
      'Contacto Emergencia',
      'Teléfono Emergencia',
      'Club / Equipo',
      'Estado Inscripción',
      'Kit Entregado',
      'Fecha Registro',
    ];

    const rows = participants.map(p => [
      p.folio,
      `"${p.fullName}"`,
      p.age,
      p.gender,
      `"${p.category}"`,
      p.shirtSize,
      p.email,
      p.phone,
      `"${p.emergencyContact}"`,
      p.emergencyPhone,
      `"${p.clubOrTeam || ''}"`,
      p.status,
      p.kitDelivered ? 'SI' : 'NO',
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NeonNightRun_Participantes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;
    setSubmittingModal(true);
    try {
      const res = await fetch(`/api/participants/${editingParticipant.folio}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editingParticipant.fullName,
          phone: editingParticipant.phone,
          shirtSize: editingParticipant.shirtSize,
          category: editingParticipant.category,
          emergencyContact: editingParticipant.emergencyContact,
          emergencyPhone: editingParticipant.emergencyPhone,
          clubOrTeam: editingParticipant.clubOrTeam,
        }),
      });
      if (res.ok) {
        setEditingParticipant(null);
        fetchParticipants();
      }
    } catch (err) {
      console.error('Error saving participant:', err);
    } finally {
      setSubmittingModal(false);
    }
  };

  // Helper to compute age from birthdate
  const computeAge = (birthDateString: string): number => {
    if (!birthDateString) return 25;
    const today = new Date();
    const birth = new Date(birthDateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(1, age);
  };

  // Handle Create Manual / Presencial Participant
  const handleCreateManualParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModal(true);
    setModalErrorMsg(null);
    setModalSuccessMsg(null);

    try {
      if (!manualName.trim() || !manualEmail.trim() || !manualPhone.trim()) {
        throw new Error('Nombre completo, correo y teléfono son obligatorios.');
      }

      const age = computeAge(manualBirthDate);
      const isApprovedDirectly = manualPaymentType === 'cash' || manualPaymentType === 'courtesy' || manualPaymentType === 'transfer';

      const payload = {
        customerName: manualName.trim(),
        customerEmail: manualEmail.trim(),
        customerPhone: manualPhone.trim(),
        paymentMethod: manualPaymentType === 'courtesy' ? 'demo' : 'transfer',
        participants: [
          {
            fullName: manualName.trim(),
            birthDate: manualBirthDate,
            age,
            gender: manualGender,
            category: manualCategory,
            email: manualEmail.trim(),
            phone: manualPhone.trim(),
            city: manualCity.trim() || 'Paraíso',
            state: manualState.trim() || 'Tabasco',
            emergencyContact: manualEmergencyContact.trim() || 'Contacto de Emergencia',
            emergencyPhone: manualEmergencyPhone.trim() || manualPhone.trim(),
            shirtSize: manualSize,
            clubOrTeam: manualClub.trim() || undefined,
            waiverAccepted: true,
            privacyAccepted: true,
          },
        ],
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al registrar participante.');
      }

      const createdOrder = data.data.order;
      const createdRunner = data.data.participants?.[0];

      // If approved directly (cash or direct transfer or courtesy), ensure status is approved in the database
      if (isApprovedDirectly && createdOrder && createdOrder.paymentStatus !== 'approved') {
        await fetch(`/api/orders/${createdOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: 'approved' }),
        });
      }

      setModalSuccessMsg(`¡Participante registrado exitosamente! Folio: ${createdRunner?.folio || 'Asignado'}`);
      
      // Reset form
      setTimeout(() => {
        setShowManualModal(false);
        setManualName('');
        setManualEmail('');
        setManualPhone('');
        setManualEmergencyContact('');
        setManualEmergencyPhone('');
        setManualClub('');
        setModalSuccessMsg(null);
        fetchParticipants();
      }, 1200);

    } catch (err: any) {
      setModalErrorMsg(err.message || 'Error al registrar participante');
    } finally {
      setSubmittingModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Base de Datos Oficial
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PARTICIPANTES ({participants.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control de folios, tallas de playeras, estatus y exportación para cronometraje.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchParticipants}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition-all glow-cyan shadow-lg"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>+ Registro Manual / Presencial</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por folio, nombre, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Todos los Estados</option>
            <option value="confirmed">Confirmados</option>
            <option value="pending">Pendientes de Pago</option>
          </select>

          {/* Size */}
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Todas las Tallas</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>

          {/* Kit */}
          <select
            value={kitFilter}
            onChange={e => setKitFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Todos los Kits</option>
            <option value="delivered">Kit Entregado</option>
            <option value="pending">Kit Pendiente</option>
          </select>
        </div>
      </div>

      {/* PARTICIPANTS TABLE */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Folio</th>
                <th className="py-3.5 px-4">Corredor</th>
                <th className="py-3.5 px-4">Categoría / Edad</th>
                <th className="py-3.5 px-4">Talla</th>
                <th className="py-3.5 px-4">Contacto Emergencia</th>
                <th className="py-3.5 px-4">Estatus Pago</th>
                <th className="py-3.5 px-4">Entrega Kit</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron participantes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-yellow-300">
                      {p.folio}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400">{p.email} · {p.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{p.category}</div>
                      <div className="text-[11px] text-slate-400">{p.age} años ({p.gender})</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-cyan-300 text-sm">
                      {p.shirtSize}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{p.emergencyContact}</div>
                      <div className="text-[11px] text-slate-400">{p.emergencyPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {p.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.kitDelivered
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.kitDelivered ? '✓ Entregado' : 'No entregado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingParticipant(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/participante/${p.folio}`}
                          target="_blank"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-lg"
                          title="Ver Boleto / QR"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PARTICIPANT MODAL */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                Editar Corredor: {editingParticipant.folio}
              </h3>
              <button
                onClick={() => setEditingParticipant(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editingParticipant.fullName}
                  onChange={e => setEditingParticipant({ ...editingParticipant, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Talla de Playera</label>
                  <select
                    value={editingParticipant.shirtSize}
                    onChange={e => setEditingParticipant({ ...editingParticipant, shirtSize: e.target.value as ShirtSize })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    required
                    value={editingParticipant.phone}
                    onChange={e => setEditingParticipant({ ...editingParticipant, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Contacto de Emergencia</label>
                  <input
                    type="text"
                    required
                    value={editingParticipant.emergencyContact}
                    onChange={e => setEditingParticipant({ ...editingParticipant, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tel. Emergencia</label>
                  <input
                    type="tel"
                    required
                    value={editingParticipant.emergencyPhone}
                    onChange={e => setEditingParticipant({ ...editingParticipant, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Club o Empresa</label>
                <input
                  type="text"
                  value={editingParticipant.clubOrTeam || ''}
                  onChange={e => setEditingParticipant({ ...editingParticipant, clubOrTeam: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400"
                >
                  {submittingModal ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL PARTICIPANT REGISTRATION MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1120] border border-cyan-500/50 rounded-3xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 sticky top-0 bg-[#0b1120] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Registro Manual de Participante
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Módulo presencial, efectivo, cortesía oficial o transferencia confirmada
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowManualModal(false);
                  setModalErrorMsg(null);
                  setModalSuccessMsg(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalErrorMsg && (
              <div className="mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300">
                {modalErrorMsg}
              </div>
            )}

            {modalSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateManualParticipant} className="py-4 space-y-4 text-xs">
              {/* Payment & Registration Type */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  1. Modalidad de Pago / Origen del Registro
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualPaymentType('cash')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      manualPaymentType === 'cash'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo ($350)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualPaymentType('transfer')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      manualPaymentType === 'transfer'
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>SPEI Confirmado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualPaymentType('courtesy')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      manualPaymentType === 'courtesy'
                        ? 'bg-fuchsia-950/70 border-fuchsia-500 text-fuchsia-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Cortesía ($0)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualPaymentType('pending')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      manualPaymentType === 'pending'
                        ? 'bg-yellow-950/70 border-yellow-500 text-yellow-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Pendiente Pago</span>
                  </button>
                </div>
              </div>

              {/* Personal Data */}
              <div className="space-y-3">
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  2. Datos del Corredor
                </span>

                <div>
                  <label className="block text-slate-400 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Domínguez"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={manualEmail}
                      onChange={e => setManualEmail(e.target.value)}
                      placeholder="carlos@correo.com"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Teléfono WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={manualPhone}
                      onChange={e => setManualPhone(e.target.value)}
                      placeholder="993 123 4567"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      required
                      value={manualBirthDate}
                      onChange={e => setManualBirthDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Género *</label>
                    <select
                      value={manualGender}
                      onChange={e => setManualGender(e.target.value as 'Varonil' | 'Femenil')}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Varonil">Varonil</option>
                      <option value="Femenil">Femenil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Talla de Playera *</label>
                    <select
                      value={manualSize}
                      onChange={e => setManualSize(e.target.value as ShirtSize)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                    >
                      <option value="XS">XS (Extra Chica)</option>
                      <option value="S">S (Chica)</option>
                      <option value="M">M (Mediana)</option>
                      <option value="L">L (Grande)</option>
                      <option value="XL">XL (Extra Grande)</option>
                      <option value="XXL">XXL (Doble Extra Grande)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Categoría Oficial *</label>
                    <select
                      value={manualCategory}
                      onChange={e => {
                        setManualCategory(e.target.value);
                        if (e.target.value === 'Varonil' || e.target.value === 'Femenil') {
                          setManualGender(e.target.value as 'Varonil' | 'Femenil');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    >
                      <option value="Varonil">Varonil (Única 6K)</option>
                      <option value="Femenil">Femenil (Única 6K)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Club / Equipo / Patrocinador</label>
                    <input
                      type="text"
                      value={manualClub}
                      onChange={e => setManualClub(e.target.value)}
                      placeholder="Ej. Paraíso Runners / Prensa"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={manualCity}
                      onChange={e => setManualCity(e.target.value)}
                      placeholder="Paraíso"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Estado</label>
                    <input
                      type="text"
                      value={manualState}
                      onChange={e => setManualState(e.target.value)}
                      placeholder="Tabasco"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Contacto de Emergencia</label>
                    <input
                      type="text"
                      value={manualEmergencyContact}
                      onChange={e => setManualEmergencyContact(e.target.value)}
                      placeholder="Nombre del familiar"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Teléfono Emergencia</label>
                    <input
                      type="tel"
                      value={manualEmergencyPhone}
                      onChange={e => setManualEmergencyPhone(e.target.value)}
                      placeholder="993 987 6543"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  {manualPaymentType !== 'pending' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Se activará folio oficial y código QR de inmediato.
                    </span>
                  ) : (
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Quedará registrado en espera de comprobante.
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualModal(false);
                      setModalErrorMsg(null);
                      setModalSuccessMsg(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingModal}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-950"
                  >
                    {submittingModal ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <QrCode className="w-4 h-4 text-slate-950" />
                    )}
                    <span>Registrar y Generar Folio</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
