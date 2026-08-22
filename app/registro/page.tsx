'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Users,
  User,
  Plus,
  Trash2,
  Ticket,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Tag,
  Shirt,
  Info,
  Calendar,
  Lock,
  Loader2,
} from 'lucide-react';
import { ParticipantInput, PricingStage, EventConfig, AmbassadorCode } from '@/lib/types';
import { defaultEventConfig, defaultPricingStages } from '@/lib/db';

function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birth = new Date(birthDateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

const emptyParticipant = (): ParticipantInput => ({
  fullName: '',
  birthDate: '',
  age: 0,
  gender: 'Varonil',
  category: 'Libre Varonil (18 a 39 años)',
  email: '',
  phone: '',
  city: 'Paraíso',
  state: 'Tabasco',
  emergencyContact: '',
  emergencyPhone: '',
  shirtSize: 'M',
  clubOrTeam: '',
  waiverAccepted: false,
  privacyAccepted: false,
});

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [config, setConfig] = useState<EventConfig>(defaultEventConfig);
  const [stages, setStages] = useState<PricingStage[]>(defaultPricingStages);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Buyer Contact (Comprador)
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Participants list
  const [participants, setParticipants] = useState<ParticipantInput[]>([emptyParticipant()]);

  // Ambassador discount code
  const [ambassadorCodeInput, setAmbassadorCodeInput] = useState('');
  const [appliedAmbassador, setAppliedAmbassador] = useState<AmbassadorCode | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | 'demo'>('mercadopago');
  const [transferReceiptUrl, setTransferReceiptUrl] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Load initial event & stage configuration
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [configRes, stagesRes] = await Promise.all([
          fetch('/api/event/config'),
          fetch('/api/stages'),
        ]);
        if (configRes.ok) {
          const cData = await configRes.json();
          if (cData.data) setConfig(cData.data);
        }
        if (stagesRes.ok) {
          const sData = await stagesRes.json();
          if (sData.data) setStages(sData.data);
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Check query params for initial quantity
    const initialQty = parseInt(searchParams.get('qty') || '1', 10);
    if (initialQty > 1 && initialQty <= 10) {
      const list = Array.from({ length: initialQty }, () => emptyParticipant());
      setParticipants(list);
    }
  }, [searchParams]);

  // Pricing calculations
  const count = participants.length;
  const activeStage = stages.find(s => s.active) || stages[0];
  const unitPrice = activeStage?.price || 350;
  const subtotal = unitPrice * count;

  let totalDiscount = 0;
  if (appliedAmbassador) {
    if (appliedAmbassador.discountType === 'percentage') {
      totalDiscount = (subtotal * appliedAmbassador.discountValue) / 100;
    } else {
      totalDiscount = appliedAmbassador.discountValue * count;
    }
  }

  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // Handlers for participants
  const handleAddParticipant = () => {
    if (participants.length >= 10) {
      alert('El límite máximo por transacción es de 10 corredores. Para grupos mayores contáctanos directamente.');
      return;
    }
    setParticipants([...participants, emptyParticipant()]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length <= 1) return;
    const next = [...participants];
    next.splice(index, 1);
    setParticipants(next);
  };

  const updateParticipant = (index: number, field: keyof ParticipantInput, value: any) => {
    const next = [...participants];
    const item = { ...next[index], [field]: value };

    if (field === 'birthDate') {
      item.age = calculateAge(value);
      // Auto suggest category
      if (item.gender === 'Femenil') {
        item.category = item.age >= 40 ? 'Master Femenil (40 años y más)' : 'Libre Femenil (18 a 39 años)';
      } else if (item.gender === 'Varonil') {
        item.category = item.age >= 40 ? 'Master Varonil (40 años y más)' : 'Libre Varonil (18 a 39 años)';
      }
      if (item.age >= 14 && item.age < 18) {
        item.category = 'Juvenil Mixto (14 a 17 años)';
      }
    }

    if (field === 'gender') {
      if (value === 'Femenil') {
        item.category = item.age >= 40 ? 'Master Femenil (40 años y más)' : 'Libre Femenil (18 a 39 años)';
      } else if (value === 'Varonil') {
        item.category = item.age >= 40 ? 'Master Varonil (40 años y más)' : 'Libre Varonil (18 a 39 años)';
      }
    }

    next[index] = item;
    setParticipants(next);
  };

  // Sync first runner to buyer if requested
  const copyBuyerToFirstRunner = () => {
    if (!buyerName || !buyerEmail) return;
    updateParticipant(0, 'fullName', buyerName);
    updateParticipant(0, 'email', buyerEmail);
    updateParticipant(0, 'phone', buyerPhone);
  };

  // Validate Ambassador Code
  const handleValidateAmbassador = async () => {
    if (!ambassadorCodeInput.trim()) return;
    setValidatingCode(true);
    setCodeMessage(null);
    try {
      const res = await fetch('/api/ambassadors/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ambassadorCodeInput.trim() }),
      });
      const data = await res.json();
      if (data.valid && data.ambassador) {
        setAppliedAmbassador(data.ambassador);
        setCodeMessage({
          text: `¡Código válido! Descuento aplicado: ${data.ambassador.discountValue}${data.ambassador.discountType === 'percentage' ? '%' : ' MXN'}`,
          success: true,
        });
      } else {
        setAppliedAmbassador(null);
        setCodeMessage({ text: data.message || 'Código no válido', success: false });
      }
    } catch {
      setCodeMessage({ text: 'Error al verificar el código', success: false });
    } finally {
      setValidatingCode(false);
    }
  };

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate buyer
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setErrorMessage('Por favor ingresa los datos de contacto del comprador/titular.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate each runner
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.fullName.trim()) {
        setErrorMessage(`Por favor completa el nombre completo del Corredor #${i + 1}.`);
        return;
      }
      if (!p.birthDate) {
        setErrorMessage(`Por favor ingresa la fecha de nacimiento del Corredor #${i + 1}.`);
        return;
      }
      if (!p.email.trim() || !p.phone.trim()) {
        setErrorMessage(`Por favor ingresa correo y teléfono del Corredor #${i + 1}.`);
        return;
      }
      if (!p.emergencyContact.trim() || !p.emergencyPhone.trim()) {
        setErrorMessage(`Por favor ingresa el contacto y teléfono de emergencia del Corredor #${i + 1}.`);
        return;
      }
      if (!p.waiverAccepted || !p.privacyAccepted) {
        setErrorMessage(`El Corredor #${i + 1} debe aceptar el reglamento, carta responsiva y aviso de privacidad.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: buyerName.trim(),
        customerEmail: buyerEmail.trim(),
        customerPhone: buyerPhone.trim(),
        participants,
        ambassadorCode: appliedAmbassador?.code,
        paymentMethod,
        transferReceiptUrl: paymentMethod === 'transfer' ? transferReceiptUrl : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al procesar la inscripción.');
      }

      const { order, preference } = json.data;

      // Handle redirect based on payment method
      if (paymentMethod === 'mercadopago') {
        if (preference?.initPoint) {
          // Redirect to Mercado Pago Checkout Pro (or sandbox / demo simulator)
          window.location.href = preference.initPoint;
        } else {
          router.push(`/confirmacion/${order.id}?status=pending`);
        }
      } else if (paymentMethod === 'demo') {
        // Direct approval in demo mode
        router.push(`/confirmacion/${order.id}?status=approved`);
      } else {
        // Bank transfer pending
        router.push(`/confirmacion/${order.id}?status=transfer_pending`);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado. Intenta de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Ticket className="w-3.5 h-3.5 text-cyan-400" />
            Registro Oficial 6K
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            INSCRIPCIÓN DE CORREDORES
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Completa los datos de cada corredor. Recibirás tu folio oficial y código QR para recoger tu kit.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Atención requerida:</strong>
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT & CENTER: Forms (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. BUYER CONTACT INFO CARD */}
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Datos de Contacto del Comprador</h2>
                    <p className="text-xs text-slate-400">A este correo se enviarán los recibos y notificaciones de pago.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre Completo del Comprador *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Ej. Juan Carlos Pérez Morales"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Teléfono celular (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder="993 123 4567"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. PARTICIPANTS LIST */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-950 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Participantes Inscritos ({participants.length})
                    </h2>
                    <p className="text-xs text-slate-400">Cada corredor debe tener su información individual completa.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyBuyerToFirstRunner}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline p-1"
                  >
                    Copiar mis datos al Corredor 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                  >
                    <Shirt className="w-3.5 h-3.5 text-cyan-400" />
                    Guía de Tallas
                  </button>
                </div>
              </div>

              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="font-extrabold text-white text-base">
                        Corredor {index + 1} {participant.fullName && `· ${participant.fullName}`}
                      </span>
                    </div>

                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(index)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Nombre Completo del Corredor *
                      </label>
                      <input
                        type="text"
                        required
                        value={participant.fullName}
                        onChange={e => updateParticipant(index, 'fullName', e.target.value)}
                        placeholder="Nombre(s) y Apellidos"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        required
                        value={participant.birthDate}
                        onChange={e => updateParticipant(index, 'birthDate', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                      {participant.age > 0 && (
                        <span className="text-[11px] text-cyan-400 mt-1 block font-semibold">
                          Edad: {participant.age} años
                        </span>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Género *
                      </label>
                      <select
                        value={participant.gender}
                        onChange={e => updateParticipant(index, 'gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
                      >
                        <option value="Varonil">Varonil</option>
                        <option value="Femenil">Femenil</option>
                        <option value="Otro">Otro / Prefiero no decir</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Categoría *
                      </label>
                      <select
                        value={participant.category}
                        onChange={e => updateParticipant(index, 'category', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
                      >
                        {config.categories.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shirt Size */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Talla de Playera *
                      </label>
                      <select
                        value={participant.shirtSize}
                        onChange={e => updateParticipant(index, 'shirtSize', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-cyan-400 text-sm text-cyan-300"
                      >
                        <option value="XS">XS (Extra Chica)</option>
                        <option value="S">S (Chica)</option>
                        <option value="M">M (Mediana)</option>
                        <option value="L">L (Grande)</option>
                        <option value="XL">XL (Extra Grande)</option>
                        <option value="XXL">XXL (Doble Extra Grande)</option>
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Correo del Corredor *
                      </label>
                      <input
                        type="email"
                        required
                        value={participant.email}
                        onChange={e => updateParticipant(index, 'email', e.target.value)}
                        placeholder="corredor@correo.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Teléfono del Corredor *
                      </label>
                      <input
                        type="tel"
                        required
                        value={participant.phone}
                        onChange={e => updateParticipant(index, 'phone', e.target.value)}
                        placeholder="993 123 4567"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    {/* City & State */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Ciudad y Estado
                      </label>
                      <input
                        type="text"
                        value={`${participant.city}, ${participant.state}`}
                        onChange={e => {
                          const parts = e.target.value.split(',');
                          updateParticipant(index, 'city', parts[0]?.trim() || 'Paraíso');
                          if (parts[1]) updateParticipant(index, 'state', parts[1].trim());
                        }}
                        placeholder="Paraíso, Tabasco"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    {/* Club / Gym */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Club, Gym o Empresa (Opcional)
                      </label>
                      <input
                        type="text"
                        value={participant.clubOrTeam || ''}
                        onChange={e => updateParticipant(index, 'clubOrTeam', e.target.value)}
                        placeholder="Ej. Club Runners Paraíso"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    {/* Emergency Contact Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Contacto de Emergencia *
                      </label>
                      <input
                        type="text"
                        required
                        value={participant.emergencyContact}
                        onChange={e => updateParticipant(index, 'emergencyContact', e.target.value)}
                        placeholder="Nombre y Parentesco"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    {/* Emergency Phone */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Teléfono de Emergencia *
                      </label>
                      <input
                        type="tel"
                        required
                        value={participant.emergencyPhone}
                        onChange={e => updateParticipant(index, 'emergencyPhone', e.target.value)}
                        placeholder="993 765 4321"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Consents per runner */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2.5">
                    <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={participant.waiverAccepted}
                        onChange={e => updateParticipant(index, 'waiverAccepted', e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>
                        He leído y acepto el <strong>Reglamento Oficial</strong> y la <strong>Carta de Exoneración y Responsiva</strong> de Neon Night Run Paraíso 2026.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={participant.privacyAccepted}
                        onChange={e => updateParticipant(index, 'privacyAccepted', e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>
                        Acepto el <strong>Aviso de Privacidad</strong> para el uso de mis datos personales en la logística del evento.
                      </span>
                    </label>
                  </div>
                </div>
              ))}

              {/* Add runner button */}
              <button
                type="button"
                onClick={handleAddParticipant}
                className="w-full py-4 border-2 border-dashed border-cyan-500/40 rounded-3xl hover:border-cyan-400 hover:bg-cyan-950/20 text-cyan-300 font-extrabold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5 text-cyan-400" />
                Agregar otro corredor a esta compra ({participants.length}/10)
              </button>
            </div>
          </div>

          {/* RIGHT: SUMMARY & PAYMENT SELECTION (1 Col on lg) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sticky top-20 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-400" />
                Resumen de Compra
              </h3>

              {/* Stage & Items breakdown */}
              <div className="space-y-3 pb-4 border-b border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Etapa activa:</span>
                  <strong className="text-white font-semibold">{activeStage?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Inscripciones:</span>
                  <span className="text-white font-mono">{count} x ${unitPrice} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white font-mono">${subtotal} MXN</span>
                </div>

                {appliedAmbassador && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Descuento ({appliedAmbassador.code}):</span>
                    <span>-${totalDiscount} MXN</span>
                  </div>
                )}
              </div>

              {/* Ambassador Code Input */}
              <div className="py-4 border-b border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  ¿Tienes código de embajador?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ambassadorCodeInput}
                    onChange={e => setAmbassadorCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej. NEONRUNNER10"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    disabled={validatingCode || !ambassadorCodeInput.trim()}
                    onClick={handleValidateAmbassador}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl shrink-0 disabled:opacity-50"
                  >
                    {validatingCode ? '...' : 'Aplicar'}
                  </button>
                </div>
                {codeMessage && (
                  <span className={`text-[11px] font-semibold mt-1.5 block ${codeMessage.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {codeMessage.text}
                  </span>
                )}
              </div>

              {/* Total Calculation */}
              <div className="py-4 border-b border-slate-800">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-300">Total a Pagar:</span>
                  <span className="text-3xl font-black text-cyan-300 font-mono">
                    ${grandTotal} <span className="text-xs text-slate-400 font-normal">MXN</span>
                  </span>
                </div>
                {count >= 5 && (
                  <span className="text-[11px] text-fuchsia-400 font-semibold block mt-1">
                    ✓ Tarifa grupal aplicada automáticamente ($400/persona)
                  </span>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="py-4 border-b border-slate-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Método de Pago
                </label>

                {/* Option 1: Mercado Pago */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'mercadopago'
                      ? 'bg-cyan-950/40 border-cyan-400 glow-cyan'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mercadopago"
                    checked={paymentMethod === 'mercadopago'}
                    onChange={() => setPaymentMethod('mercadopago')}
                    className="mt-1 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      Mercado Pago Checkout Pro
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tarjetas de crédito/débito, OXXO en efectivo, SPEI y saldo Mercado Pago. Confirmación inmediata.
                    </p>
                  </div>
                </label>

                {/* Option 2: Direct Bank Transfer */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'transfer'
                      ? 'bg-fuchsia-950/40 border-fuchsia-400 glow-magenta'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                    className="mt-1 text-fuchsia-500 focus:ring-0"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-fuchsia-400" />
                      Transferencia Bancaria SPEI
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      BBVA México. Pago directo con revisión administrativa (aprobación en menos de 24 hrs).
                    </p>
                  </div>
                </label>

                {/* Option 3: Demo Mode One-Click */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'demo'
                      ? 'bg-yellow-950/40 border-yellow-400 glow-yellow'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo"
                    checked={paymentMethod === 'demo'}
                    onChange={() => setPaymentMethod('demo')}
                    className="mt-1 text-yellow-500 focus:ring-0"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-yellow-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      Simulador de Prueba Rápida
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Genera folios, códigos QR y confirmación inmediata sin realizar cobro bancario real.
                    </p>
                  </div>
                </label>
              </div>

              {/* Bank Details Preview if transfer selected */}
              {paymentMethod === 'transfer' && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-1.5">
                  <div className="text-cyan-400 font-bold">Datos para Transferencia SPEI:</div>
                  <div>Banco: <strong>{config.bankDetails.bankName}</strong></div>
                  <div>Beneficiario: <strong>{config.bankDetails.accountHolder}</strong></div>
                  <div>CLABE: <strong className="font-mono">{config.bankDetails.clabe}</strong></div>
                  <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                    *Al finalizar tu registro recibirás tu número de referencia para transferir.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 text-slate-950 font-black text-sm rounded-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 glow-cyan flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Procesando inscripción...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-slate-950" />
                      <span>Completar Pago Seguro (${grandTotal} MXN)</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 mt-3">
                <Lock className="w-3 h-3 text-cyan-400" />
                Conexión encriptada SSL · Registro oficial garantizado
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-300 relative shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-cyan-400" />
                Guía Oficial de Tallas (Playera Unisex Dry-Fit)
              </h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <p className="text-slate-300">
                Medidas en centímetros tomadas de frente sobre prenda plana. Recomendamos seleccionar una talla superior si prefieres un ajuste holgado.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-cyan-400 font-bold">
                      <th className="py-2">Talla</th>
                      <th className="py-2">Pecho (A)</th>
                      <th className="py-2">Largo (B)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr><td className="py-2 font-bold">XS (Extra Chica)</td><td>46 cm</td><td>66 cm</td></tr>
                    <tr><td className="py-2 font-bold">S (Chica)</td><td>49 cm</td><td>69 cm</td></tr>
                    <tr><td className="py-2 font-bold">M (Mediana)</td><td>52 cm</td><td>72 cm</td></tr>
                    <tr><td className="py-2 font-bold">L (Grande)</td><td>55 cm</td><td>75 cm</td></tr>
                    <tr><td className="py-2 font-bold">XL (Extra Grande)</td><td>58 cm</td><td>78 cm</td></tr>
                    <tr><td className="py-2 font-bold">XXL (Doble Extra)</td><td>61 cm</td><td>80 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400 text-xs"
              >
                Cerrar Guía
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
          <div className="text-cyan-400 font-bold flex items-center gap-2">
            <span>Cargando formulario oficial de registro...</span>
          </div>
        </div>
      }
    >
      <RegistroForm />
    </Suspense>
  );
}
