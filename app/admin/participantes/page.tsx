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
  AlertTriangle,
  Building2,
  Sparkles,
  Ticket,
  QrCode,
  Banknote,
  Mail,
  Trophy,
  Package,
  UserX,
} from 'lucide-react';
import { Participant, ShirtSize } from '@/lib/types';

export default function AdminParticipantesPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [kitFilter, setKitFilter] = useState('all');
  const [modalityFilter, setModalityFilter] = useState('all');

  // Modal states
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showCourtesyModal, setShowCourtesyModal] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [resendingEmailFolio, setResendingEmailFolio] = useState<string | null>(null);
  const [recentlySentFolio, setRecentlySentFolio] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    subtitle?: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (title: string, subtitle?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, title, subtitle, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 5500);
  };

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
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/participants');
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setParticipants(data.data);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error del servidor al obtener participantes.');
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('No se pudo establecer conexión para consultar participantes.');
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
      statusFilter === 'all' || (statusFilter === 'active' ? p.status !== 'cancelled' : p.status === statusFilter);

    const matchesSize =
      sizeFilter === 'all' || p.shirtSize === sizeFilter;

    const matchesKit =
      kitFilter === 'all' ||
      (kitFilter === 'delivered' && p.kitDelivered) ||
      (kitFilter === 'pending' && !p.kitDelivered);

    const isRec = p.modality === 'Recreativa' || p.category?.toLowerCase().includes('recreativ');
    const matchesModality =
      modalityFilter === 'all' ||
      (modalityFilter === 'recreativa' && isRec) ||
      (modalityFilter === 'competitiva' && !isRec);

    return matchesSearch && matchesStatus && matchesSize && matchesKit && matchesModality;
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Export CSV
  const handleExportCSV = () => {
    if (participants.length === 0) return;
    const headers = [
      'Folio',
      'Nombre Completo',
      'Modalidad',
      'Categoría',
      'Incluye Kit Completo',
      'Edad',
      'Género',
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

    const rows = participants.map(p => {
      const isRec = p.modality === 'Recreativa' || p.category?.toLowerCase().includes('recreativ');
      const modalityLabel = isRec ? 'Recreativa (3K)' : 'Competitiva (6K)';
      const includesKitLabel = isRec ? 'NO (Solo Medalla y Playera)' : 'SI (Kit Completo Neón + Chip)';
      return [
        p.folio,
        `"${p.fullName}"`,
        `"${modalityLabel}"`,
        `"${p.category}"`,
        `"${includesKitLabel}"`,
        p.age,
        p.gender,
        p.shirtSize,
        p.email,
        p.phone,
        `"${p.emergencyContact}"`,
        p.emergencyPhone,
        `"${p.clubOrTeam || ''}"`,
        p.status,
        p.kitDelivered ? 'SI' : 'NO',
        new Date(p.createdAt).toLocaleDateString(),
      ];
    });

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
      const res = await fetch(`/api/participants/${editingParticipant.folio || editingParticipant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editingParticipant.fullName,
          email: editingParticipant.email,
          phone: editingParticipant.phone,
          shirtSize: editingParticipant.shirtSize,
          category: editingParticipant.category,
          modality: editingParticipant.modality,
          status: editingParticipant.status,
          kitDelivered: editingParticipant.kitDelivered,
          emergencyContact: editingParticipant.emergencyContact,
          emergencyPhone: editingParticipant.emergencyPhone,
          clubOrTeam: editingParticipant.clubOrTeam,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const name = editingParticipant.fullName;
        const folio = editingParticipant.folio;
        setEditingParticipant(null);
        showToast('¡Información guardada con éxito!', `Los datos de ${name} (${folio}) se actualizaron correctamente.`, 'success');
        fetchParticipants();
      } else {
        showToast('Error al guardar', data.error || 'No se pudieron guardar los cambios del participante.', 'error');
      }
    } catch (err: any) {
      console.error('Error saving participant:', err);
      showToast('Error de conexión', 'No se pudo conectar con el servidor para guardar.', 'error');
    } finally {
      setSubmittingModal(false);
    }
  };

  const confirmDeleteParticipant = async () => {
    if (!participantToDelete) return;
    const deletedName = participantToDelete.fullName;
    const deletedFolio = participantToDelete.folio;
    setSubmittingModal(true);
    try {
      const res = await fetch(`/api/participants/${participantToDelete.folio || participantToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setParticipantToDelete(null);
        showToast('¡Participante eliminado con éxito!', `El registro de ${deletedName} (${deletedFolio}) fue eliminado de la base de datos.`, 'success');
        fetchParticipants();
      } else {
        showToast('Error al eliminar', data.error || 'No se pudo eliminar el registro del participante.', 'error');
      }
    } catch (err: any) {
      console.error('Error deleting participant:', err);
      showToast('Error de conexión', 'No se pudo conectar con el servidor para eliminar.', 'error');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleCancelAndReleaseSpot = async (p: Participant) => {
    setSubmittingModal(true);
    try {
      const res = await fetch(`/api/participants/${p.folio || p.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Lugar liberado por falta de pago (más de 5 días). Conservado para futuras carreras.',
          notifyUser: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setParticipantToDelete(null);
        showToast('¡Lugar liberado con éxito!', `El cupo de ${p.fullName} (${p.folio}) fue liberado y se conservó en No Pagados.`, 'success');
        fetchParticipants();
      } else {
        showToast('Error al liberar lugar', data.error || 'No se pudo liberar el lugar.', 'error');
      }
    } catch (err: any) {
      console.error('Error cancelling and releasing spot:', err);
      showToast('Error de conexión', 'No se pudo conectar con el servidor para liberar lugar.', 'error');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleToggleKitDelivery = async (p: Participant) => {
    try {
      if (!p.kitDelivered) {
        const res = await fetch(`/api/participants/${p.folio || p.id}/deliver-kit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffEmail: 'admin@neonnightrunparaiso.mx',
            staffName: 'Administrador (Panel)',
            notes: 'Entrega manual registrada desde tabla de participantes',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          showToast('¡Kit entregado con éxito!', `Se registró la entrega del kit oficial a ${p.fullName} (${p.folio}).`, 'success');
          fetchParticipants();
        } else {
          showToast('Error al entregar kit', data.message || 'No se pudo registrar la entrega.', 'error');
        }
      } else {
        const res = await fetch(`/api/participants/${p.folio || p.id}/revert-kit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: 'admin@neonnightrunparaiso.mx',
            adminName: 'Administrador',
            reason: 'Revertido manualmente desde tabla de participantes',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          showToast('¡Entrega de kit revertida!', `Se desmarcó la entrega del kit a ${p.fullName} (${p.folio}).`, 'info');
          fetchParticipants();
        } else {
          showToast('Error al revertir kit', data.message || 'No se pudo revertir la entrega.', 'error');
        }
      }
    } catch (err: any) {
      console.error('Error toggling kit delivery:', err);
      showToast('Error de conexión', 'No se pudo actualizar la entrega de kit.', 'error');
    }
  };

  const handleResendEmail = async (p: Participant) => {
    setResendingEmailFolio(p.folio);
    try {
      const res = await fetch(`/api/participants/${p.folio}/resend-email`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setRecentlySentFolio(p.folio);
        showToast('¡Correo reenviado con éxito!', `Boleto y código QR oficial enviados a ${p.email}.`, 'success');

        // Update participant state locally so the UI immediately reflects the dispatch
        setParticipants(prev =>
          prev.map(item => {
            if (item.folio === p.folio || item.id === p.id) {
              return {
                ...item,
                lastEmailSentAt: new Date().toISOString(),
                emailSentCount: (item.emailSentCount || 1) + 1,
              };
            }
            return item;
          })
        );

        setTimeout(() => {
          setRecentlySentFolio(null);
        }, 5000);
      } else {
        showToast('Error al enviar correo', data.error || 'No se pudo enviar el correo oficial.', 'error');
      }
    } catch (err: any) {
      console.error('Error resending email:', err);
      showToast('Error de conexión', 'No se pudo conectar con el servidor de correos.', 'error');
    } finally {
      setResendingEmailFolio(null);
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
        isManualAdmin: true,
        customerName: manualName.trim(),
        customerEmail: manualEmail.trim(),
        customerPhone: manualPhone.trim(),
        paymentMethod: manualPaymentType === 'courtesy' ? 'courtesy' : manualPaymentType === 'cash' ? 'cash' : 'transfer',
        paymentStatus: isApprovedDirectly ? 'approved' : 'pending',
        participants: [
          {
            fullName: manualName.trim(),
            birthDate: manualBirthDate,
            age,
            gender: manualGender,
            category: manualCategory,
            modality: manualCategory === 'Recreativa' ? 'Recreativa' : 'Competitiva',
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

      const createdRunner = data.data.participants?.[0];

      setModalSuccessMsg(`¡Participante registrado exitosamente! Folio: ${createdRunner?.folio || 'Asignado'}`);
      
      // Reset form and show toast on main screen
      setTimeout(() => {
        setShowManualModal(false);
        setManualName('');
        setManualEmail('');
        setManualPhone('');
        setManualEmergencyContact('');
        setManualEmergencyPhone('');
        setManualClub('');
        setModalSuccessMsg(null);
        showToast(
          '¡Registro manual exitoso!',
          `Corredor ${createdRunner?.fullName || manualName.trim()} guardado con folio ${createdRunner?.folio || 'asignado'}.`,
          'success'
        );
        fetchParticipants();
      }, 1000);

    } catch (err: any) {
      setModalErrorMsg(err.message || 'Error al registrar participante');
      showToast('Error en el registro', err.message || 'No se pudo completar el registro.', 'error');
    } finally {
      setSubmittingModal(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* RICH FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 max-w-md border-2 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success'
            ? 'bg-[#051c14] border-emerald-400 text-emerald-200'
            : toast.type === 'error'
            ? 'bg-[#2a080c] border-rose-500 text-rose-200'
            : 'bg-[#061826] border-cyan-400 text-cyan-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-white text-sm font-extrabold">{toast.title}</div>
              {toast.subtitle && (
                <div className="text-[11px] opacity-90 font-normal mt-0.5">{toast.subtitle}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          <Link
            href="/admin/no-pagados"
            className="px-3.5 py-2.5 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Ver No Pagados</span>
          </Link>
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

      {feedbackMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{feedbackMessage}</span>
        </div>
      )}

      {/* MODALITY & KIT SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Card */}
        <div
          onClick={() => { setModalityFilter('all'); setKitFilter('all'); }}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
            modalityFilter === 'all' && kitFilter === 'all'
              ? 'bg-slate-900/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
              : 'bg-[#0b1120] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corredores Inscritos</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {participants.filter(p => p.status !== 'cancelled').length} <span className="text-xs font-normal text-slate-500">/ 350 cupo</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {participants.filter(p => p.status === 'confirmed').length} confirmados • {participants.filter(p => p.status === 'pending').length} pendientes ({participants.length} en base de datos)
          </div>
        </div>

        {/* Competitiva Card */}
        <div
          onClick={() => setModalityFilter(modalityFilter === 'competitiva' ? 'all' : 'competitiva')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
            modalityFilter === 'competitiva'
              ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
              : 'bg-[#0b1120] border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              Competitiva (6K)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Kit Completo
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {participants.filter(p => p.modality !== 'Recreativa' && !p.category?.toLowerCase().includes('recreativ')).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Incluye kit completo, dorsal con número
          </div>
        </div>

        {/* Recreativa Card */}
        <div
          onClick={() => setModalityFilter(modalityFilter === 'recreativa' ? 'all' : 'recreativa')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
            modalityFilter === 'recreativa'
              ? 'bg-fuchsia-950/40 border-fuchsia-400 shadow-md ring-1 ring-fuchsia-400/40'
              : 'bg-[#0b1120] border-slate-800 hover:border-fuchsia-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              Recreativa (3K)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30">
              Solo Medalla + Playera
            </span>
          </div>
          <div className="text-2xl font-black text-fuchsia-300 mt-1">
            {participants.filter(p => p.modality === 'Recreativa' || p.category?.toLowerCase().includes('recreativ')).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ⚠️ <strong className="text-fuchsia-300">NO incluye kit</strong> (solo playera y medalla)
          </div>
        </div>

        {/* Kit Delivery Status Card */}
        <div
          onClick={() => setKitFilter(kitFilter === 'delivered' ? 'all' : 'delivered')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
            kitFilter === 'delivered'
              ? 'bg-emerald-950/40 border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
              : 'bg-[#0b1120] border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              Kits Entregados
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              Entrega
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {participants.filter(p => p.kitDelivered).length} <span className="text-xs font-normal text-slate-500">entregados</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {participants.filter(p => !p.kitDelivered).length} pendientes por recoger
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
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
          {/* Modality Filter */}
          <select
            value={modalityFilter}
            onChange={e => setModalityFilter(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none transition-colors ${
              modalityFilter === 'recreativa'
                ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-300'
                : modalityFilter === 'competitiva'
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-cyan-400'
            }`}
          >
            <option value="all">Todas las Modalidades</option>
            <option value="competitiva">Competitiva (6K) - Con Kit Completo</option>
            <option value="recreativa">Recreativa (3K) - Solo Medalla y Playera</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Todos los Registros ({participants.length})</option>
            <option value="active">Inscritos Activos ({participants.filter(p => p.status !== 'cancelled').length})</option>
            <option value="confirmed">Confirmados ({participants.filter(p => p.status === 'confirmed').length})</option>
            <option value="pending">Pendientes de Pago ({participants.filter(p => p.status === 'pending').length})</option>
            <option value="cancelled">No Pagados / Cancelados ({participants.filter(p => p.status === 'cancelled').length})</option>
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

          {(modalityFilter !== 'all' || statusFilter !== 'all' || sizeFilter !== 'all' || kitFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setModalityFilter('all');
                setStatusFilter('all');
                setSizeFilter('all');
                setKitFilter('all');
                setSearch('');
              }}
              className="px-2.5 py-2 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              title="Limpiar todos los filtros"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* PARTICIPANTS TABLE */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Folio</th>
                <th className="py-3.5 px-4">Fecha Registro</th>
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
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Cargando corredores inscritos...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="py-12 px-6 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="text-rose-400 font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                        <span>Error al cargar participantes</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {error}. El sistema cuenta con respaldo local sincronizado. Si la cuota diaria gratuita de Firestore se ha alcanzado, se restablece automáticamente a medianoche hora CDMX o puedes actualizar a un plan Blaze sin límites en la consola de Firebase.
                      </p>
                      <button
                        onClick={fetchParticipants}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 text-cyan-400" />
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No se encontraron participantes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-yellow-300">
                      {p.folio}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.createdAt ? new Date(p.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>{p.email}</span>
                        <span>·</span>
                        <span>{p.phone}</span>
                        {p.lastEmailSentAt && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
                            title={`Correo enviado: ${new Date(p.lastEmailSentAt).toLocaleString()}`}
                          >
                            <Mail className="w-2.5 h-2.5 text-emerald-400" /> Correo QR enviado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const isRec = p.modality === 'Recreativa' || p.category?.toLowerCase().includes('recreativ');
                        return (
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="text-slate-200 font-semibold">{p.category}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                isRec
                                  ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {isRec ? 'Recreativa (3K)' : 'Competitiva (6K)'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">{p.age} años ({p.gender})</span>
                              <span className="text-slate-600">•</span>
                              <span className={`text-[10px] font-bold ${isRec ? 'text-amber-400' : 'text-cyan-400'}`}>
                                {isRec ? 'Sin kit (Playera + Medalla)' : 'Incluye Kit Neón'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
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
                          : p.status === 'cancelled'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {p.status === 'confirmed' ? 'Confirmado' : p.status === 'cancelled' ? 'No Pagó (Liberado)' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const isRec = p.modality === 'Recreativa' || p.category?.toLowerCase().includes('recreativ');
                        return (
                          <div>
                            <button
                              type="button"
                              onClick={() => handleToggleKitDelivery(p)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                p.kitDelivered
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/60 shadow-sm'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                              }`}
                              title={p.kitDelivered ? 'Clic para revertir entrega de kit' : 'Clic para marcar kit como entregado'}
                            >
                              {p.kitDelivered ? '✓ Entregado' : 'No entregado'}
                            </button>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {isRec ? (
                                <span className="text-fuchsia-300/90 font-medium">Solo entrega playera</span>
                              ) : (
                                <span className="text-cyan-300/80 font-medium">Entrega kit completo</span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
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
                        <button
                          onClick={() => handleResendEmail(p)}
                          disabled={resendingEmailFolio === p.folio}
                          className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                            recentlySentFolio === p.folio
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                              : resendingEmailFolio === p.folio
                              ? 'bg-slate-800 text-cyan-300 opacity-80 cursor-wait'
                              : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                          }`}
                          title={`Reenviar correo oficial con código QR a ${p.email}`}
                        >
                          {resendingEmailFolio === p.folio ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                              <span className="hidden xl:inline text-[11px] font-medium text-cyan-300">Enviando...</span>
                            </>
                          ) : recentlySentFolio === p.folio ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span className="hidden xl:inline text-[11px] font-bold text-white">¡Enviado!</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline text-[11px] font-medium">Reenviar QR</span>
                            </>
                          )}
                        </button>
                        <Link
                          href={`/participante/${p.folio}`}
                          target="_blank"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-lg"
                          title="Ver Boleto / QR"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setParticipantToDelete(p)}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400 rounded-lg transition-colors"
                          title="Eliminar Corredor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Modalidad del Evento</label>
                  <select
                    value={
                      editingParticipant.modality === 'Recreativa' || editingParticipant.category?.toLowerCase().includes('recreativ')
                        ? 'Recreativa'
                        : 'Competitiva'
                    }
                    onChange={e => {
                      const newMod = e.target.value as 'Competitiva' | 'Recreativa';
                      let newCat = editingParticipant.category;
                      if (newMod === 'Recreativa') {
                        newCat = 'Recreativa (Caminata/Trote)';
                      } else if (newCat?.toLowerCase().includes('recreativ')) {
                        newCat = 'Libre Varonil';
                      }
                      setEditingParticipant({
                        ...editingParticipant,
                        modality: newMod,
                        category: newCat,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  >
                    <option value="Competitiva">Competitiva (6K) - Incluye Kit Completo</option>
                    <option value="Recreativa">Recreativa (3K) - Solo Medalla y Playera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    required
                    value={editingParticipant.category}
                    onChange={e => setEditingParticipant({ ...editingParticipant, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Ej. Libre Varonil, Master, Recreativa..."
                  />
                </div>
              </div>

              {/* Kit notice */}
              <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                editingParticipant.modality === 'Recreativa' || editingParticipant.category?.toLowerCase().includes('recreativ')
                  ? 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-300'
                  : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
              }`}>
                <Package className="w-4 h-4 flex-shrink-0" />
                <span>
                  {editingParticipant.modality === 'Recreativa' || editingParticipant.category?.toLowerCase().includes('recreativ')
                    ? '⚠️ Esta categoría Recreativa NO incluye kit completo (solo medalla conmemorativa y playera oficial).'
                    : '✓ Esta categoría Competitiva incluye kit oficial completo: dorsal con número, pulsera neón, playera y medalla.'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editingParticipant.email}
                    onChange={e => setEditingParticipant({ ...editingParticipant, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Estatus del Registro</label>
                  <select
                    value={editingParticipant.status}
                    onChange={e => setEditingParticipant({ ...editingParticipant, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-bold"
                  >
                    <option value="confirmed">Confirmado (Con Folio Oficial Activo)</option>
                    <option value="pending">Pendiente de Pago (En Espera)</option>
                    <option value="cancelled">Cancelado / No Pagado (Lugar Liberado)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Entrega de Kit Oficial</label>
                  <select
                    value={editingParticipant.kitDelivered ? 'yes' : 'no'}
                    onChange={e => setEditingParticipant({ ...editingParticipant, kitDelivered: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-bold"
                  >
                    <option value="no">No entregado (Pendiente)</option>
                    <option value="yes">✓ Entregado</option>
                  </select>
                </div>
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
                  <label className="block text-slate-400 mb-1">Club o Empresa</label>
                  <input
                    type="text"
                    value={editingParticipant.clubOrTeam || ''}
                    onChange={e => setEditingParticipant({ ...editingParticipant, clubOrTeam: e.target.value })}
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
                    <label className="block text-slate-400 mb-1">Modalidad y Categoría Oficial *</label>
                    <select
                      value={manualCategory}
                      onChange={e => {
                        setManualCategory(e.target.value);
                        if (e.target.value === 'Varonil') {
                          setManualGender('Varonil');
                        } else if (e.target.value === 'Femenil') {
                          setManualGender('Femenil');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    >
                      <option value="Varonil">Competitiva 6K - Varonil (Kit Completo)</option>
                      <option value="Femenil">Competitiva 6K - Femenil (Kit Completo)</option>
                      <option value="Recreativa">Recreativa 3K - Caminata/Trote (Solo Medalla + Playera)</option>
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

                {manualCategory === 'Recreativa' ? (
                  <div className="p-2.5 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/40 text-[11px] text-fuchsia-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 text-fuchsia-400" />
                    <span>
                      ⚠️ <strong>Modalidad Recreativa 3K:</strong> Solamente incluye medalla conmemorativa y playera oficial (NO incluye chip ni kit completo).
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-[11px] text-cyan-300 flex items-center gap-2">
                    <Trophy className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                    <span>
                      ✓ <strong>Modalidad Competitiva 6K:</strong> Incluye kit oficial completo con dorsal con número, pulsera neón, playera y medalla.
                    </span>
                  </div>
                )}

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

      {/* Custom Delete / Release Confirmation Modal */}
      {participantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <div className="p-2 bg-amber-950/50 rounded-xl border border-amber-500/20 text-amber-400">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Gestionar participante</h3>
                <p className="text-xs text-slate-400">¿Qué acción deseas realizar con este registro?</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              Participante: <strong className="text-white">{participantToDelete.fullName}</strong> (<strong className="text-yellow-400 font-mono">{participantToDelete.folio}</strong>)
              <br />
              <span className="text-xs text-slate-400 block mt-1">
                Registrado el {participantToDelete.createdAt ? new Date(participantToDelete.createdAt).toLocaleDateString() : 'Fecha no disponible'} · Estatus actual: <strong className="text-cyan-300 capitalize">{participantToDelete.status}</strong>
              </span>
            </p>

            <div className="space-y-3 mb-6">
              {/* Option 1: Release spot */}
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between mb-1">
                  <span>Opción 1: Liberar Cupo (Recomendado)</span>
                  <span className="text-[10px] uppercase bg-amber-900/60 px-2 py-0.5 rounded text-amber-200">Conserva datos</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Su lugar de los 350 se libera para otro corredor y se mueve a la lista de &quot;No Pagados&quot;. Se guardan sus datos para invitarlo a futuras ediciones.
                </p>
                <button
                  type="button"
                  onClick={() => handleCancelAndReleaseSpot(participantToDelete)}
                  disabled={submittingModal}
                  className="mt-2.5 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <UserX className="w-4 h-4" />
                  <span>{submittingModal ? 'Procesando...' : 'Liberar Lugar y Guardar en No Pagados'}</span>
                </button>
              </div>

              {/* Option 2: Delete permanently */}
              <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                <div className="text-xs font-bold text-rose-300 flex items-center justify-between mb-1">
                  <span>Opción 2: Eliminación Total</span>
                  <span className="text-[10px] uppercase bg-rose-900/60 px-2 py-0.5 rounded text-rose-200">Irreversible</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Borra el participante completamente tanto de la base de datos local como de Firebase Firestore. Su folio y registro desaparecerán de inmediato.
                </p>
                <button
                  type="button"
                  onClick={confirmDeleteParticipant}
                  disabled={submittingModal}
                  className="mt-2.5 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{submittingModal ? 'Eliminando...' : 'Eliminar Definitivamente de la Base de Datos'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setParticipantToDelete(null)}
                className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold transition-colors text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
