'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  User,
  Ticket,
  ShieldCheck,
  Building2,
  ArrowRight,
  AlertCircle,
  Shirt,
  Calendar,
  Loader2,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  Zap,
  Sparkles,
  Trophy,
  Timer,
  CheckCircle2,
  Users,
  X,
} from 'lucide-react';
import { PricingStage, EventConfig, AmbassadorCode, ShirtSize, RaceModality } from '@/lib/types';
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

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawModalidad = searchParams.get('modalidad');
  const hasPreselectedModality = rawModalidad === 'Competitiva' || rawModalidad === 'Recreativa';

  // Event and pricing configuration
  const [config, setConfig] = useState<EventConfig>(defaultEventConfig);
  const [stages, setStages] = useState<PricingStage[]>(defaultPricingStages);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Single Runner Form State
  const [modality, setModality] = useState<RaceModality>('Competitiva');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Varonil' | 'Femenil'>('Varonil');
  const [category, setCategory] = useState('Varonil');
  const [shirtSize, setShirtSize] = useState<ShirtSize>('M');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Paraíso');
  const [state, setState] = useState('Tabasco');
  const [clubOrTeam, setClubOrTeam] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Ambassador discount code
  const [ambassadorCodeInput, setAmbassadorCodeInput] = useState('');
  const [appliedAmbassador, setAppliedAmbassador] = useState<AmbassadorCode | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Helpers
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const runnerAge = calculateAge(birthDate);

  const handleSelectModality = (newModality: RaceModality) => {
    setModality(newModality);
    if (newModality === 'Recreativa') {
      setCategory(gender === 'Femenil' ? 'Recreativa Femenil' : 'Recreativa Varonil');
    } else {
      setCategory(gender === 'Femenil' ? 'Femenil' : 'Varonil');
    }
  };

  const handleCopyClabe = (clabe: string) => {
    navigator.clipboard.writeText(clabe);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  // Read modality from query parameters on mount
  useEffect(() => {
    if (rawModalidad === 'Competitiva' || rawModalidad === 'Recreativa') {
      setModality(rawModalidad);
      if (rawModalidad === 'Recreativa') {
        setCategory(gender === 'Femenil' ? 'Recreativa Femenil' : 'Recreativa Varonil');
      } else {
        setCategory(gender === 'Femenil' ? 'Femenil' : 'Varonil');
      }
    }
  }, [rawModalidad, gender]);

  // Load initial event configuration
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
  }, []);

  // Pricing calculations (Single participant based on chosen modality)
  const activeStage = stages.find(s => s.active) || stages[0];
  const competitivePrice = activeStage?.price || 350;
  const recreationalPrice = 250;
  const unitPrice = modality === 'Recreativa' ? recreationalPrice : competitivePrice;
  const subtotal = unitPrice;

  let totalDiscount = 0;
  if (appliedAmbassador) {
    if (appliedAmbassador.discountType === 'fixed') {
      totalDiscount = appliedAmbassador.discountValue;
    } else {
      totalDiscount = Math.round((subtotal * appliedAmbassador.discountValue) / 100);
    }
  }

  const grandTotal = Math.max(0, subtotal - totalDiscount);

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

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!birthDate) {
      setErrorMessage('Por favor ingresa tu fecha de nacimiento.');
      return;
    }
    if (!email.trim() || !phone.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico y teléfono celular.');
      return;
    }
    if (!emergencyContact.trim() || !emergencyPhone.trim()) {
      setErrorMessage('Por favor ingresa el nombre y teléfono de tu contacto de emergencia.');
      return;
    }
    if (!waiverAccepted || !privacyAccepted) {
      setErrorMessage('Debes aceptar el reglamento, carta responsiva y aviso de privacidad para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        participants: [
          {
            fullName: fullName.trim(),
            birthDate,
            age: runnerAge,
            gender,
            category,
            modality,
            email: email.trim(),
            phone: phone.trim(),
            city: city.trim() || 'Paraíso',
            state: state.trim() || 'Tabasco',
            emergencyContact: emergencyContact.trim(),
            emergencyPhone: emergencyPhone.trim(),
            shirtSize,
            clubOrTeam: clubOrTeam.trim() || undefined,
            waiverAccepted,
            privacyAccepted,
          },
        ],
        ambassadorCode: appliedAmbassador?.code,
        paymentMethod: 'transfer',
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

      const { order } = json.data;
      router.push(`/confirmacion/${order.id}?status=transfer_pending`);
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
            Registro Oficial Individual 6K
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            FORMULARIO DE INSCRIPCIÓN
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Ingresa tus datos como participante. Al confirmar recibirás tu folio oficial y número de referencia para transferir.
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
          {/* LEFT: Single Runner Form (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            {/* PASO 1: COMPARATIVE MODALITY SELECTOR OR COMPACT PRESELECTED BANNER */}
            {!hasPreselectedModality ? (
              <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                      Paso 1 · Selecciona tu Experiencia
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      ¿Cómo deseas correr la Neon Night Run?
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Elige entre la modalidad Competitiva con premiación y kit completo, o la modalidad Recreativa.
                    </p>
                  </div>
                </div>

                {/* Side-by-Side Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Modalidad Competitiva */}
                  <div
                    onClick={() => handleSelectModality('Competitiva')}
                    className={`cursor-pointer rounded-2xl p-5 sm:p-6 transition-all relative flex flex-col justify-between border-2 ${
                      modality === 'Competitiva'
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-xl shadow-cyan-950/60 ring-1 ring-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          Competitiva 6K
                        </span>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        Carrera Competitiva
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                        Para corredores que buscan superar su marca con paquete completo e hidratación oficial.
                      </p>

                      <div className="flex items-baseline gap-1.5 pb-4 border-b border-slate-800/80 mb-4">
                        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                          ${competitivePrice}
                        </span>
                        <span className="text-xs font-bold text-slate-400">MXN</span>
                        <span className="text-[11px] text-cyan-400 ml-auto font-bold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          Kit completo
                        </span>
                      </div>

                      {/* Inclusions Checklist */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white font-bold">Número de competidor</strong> oficial</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white font-bold">Medalla conmemorativa</strong> oficial</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white font-bold">Playera técnica deportiva oficial</strong> Dry-Fit</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong className="text-cyan-300 font-bold">Hidratación oficial</strong> durante el evento</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong className="text-cyan-300 font-bold">Kit Neón luminoso</strong> (pulseras, pintura y accesorios)</span>
                        </div>
                      </div>
                    </div>

                    {/* Selector Radio / Indicator Button */}
                    <div className="pt-5 mt-5 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectModality('Competitiva');
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 ${
                          modality === 'Competitiva'
                            ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {modality === 'Competitiva' ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Modalidad Seleccionada ($350 MXN)</span>
                          </>
                        ) : (
                          <span>Seleccionar Competitiva ($350 MXN)</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. Modalidad Recreativa / Convivencia */}
                  <div
                    onClick={() => handleSelectModality('Recreativa')}
                    className={`cursor-pointer rounded-2xl p-5 sm:p-6 transition-all relative flex flex-col justify-between border-2 ${
                      modality === 'Recreativa'
                        ? 'bg-fuchsia-950/40 border-fuchsia-400 shadow-xl shadow-fuchsia-950/60 ring-1 ring-fuchsia-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40">
                          <Sparkles className="w-3 h-3 text-fuchsia-400" />
                          RECREATIVA 3K
                        </span>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        Carrera Recreativa 3K
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                        Modalidad libre para disfrutar trotando o caminando en una gran noche deportiva.
                      </p>

                      <div className="flex items-baseline gap-1.5 pb-4 border-b border-slate-800/80 mb-4">
                        <span className="text-3xl sm:text-4xl font-black text-fuchsia-300 font-mono tracking-tight">
                          ${recreationalPrice}
                        </span>
                        <span className="text-xs font-bold text-slate-400">MXN</span>
                        <span className="text-[11px] text-fuchsia-400 ml-auto font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Solo Medalla y Playera
                        </span>
                      </div>

                      {/* Inclusions Checklist: Solo Medalla y Playera */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white font-bold">Medalla conmemorativa</strong> al cruzar la meta</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white font-bold">Playera técnica deportiva oficial</strong> Dry-Fit</span>
                        </div>
                        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-slate-400 text-[11px] mt-2">
                          <div className="text-slate-300 font-bold mb-1">Nota importante:</div>
                          <div>• <strong className="text-fuchsia-300">Solo incluye medalla y playera</strong>.</div>
                          <div>• No incluye Kit Neón luminoso.</div>
                          <div>• No incluye hidratación ni premiación a primeros lugares.</div>
                        </div>
                      </div>
                    </div>

                    {/* Selector Radio / Indicator Button */}
                    <div className="pt-5 mt-5 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectModality('Recreativa');
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 ${
                          modality === 'Recreativa'
                            ? 'bg-fuchsia-400 text-slate-950 shadow-md shadow-fuchsia-400/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {modality === 'Recreativa' ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Modalidad Seleccionada ($250 MXN)</span>
                          </>
                        ) : (
                          <span>Seleccionar Recreativa 3K ($250 MXN)</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    modality === 'Competitiva'
                      ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'
                      : 'bg-fuchsia-950/80 border-fuchsia-500/40 text-fuchsia-400'
                  }`}>
                    {modality === 'Competitiva' ? <Zap className="w-6 h-6 text-cyan-400 animate-pulse" /> : <Sparkles className="w-6 h-6 text-fuchsia-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Modalidad de Carrera Seleccionada
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
                      {modality === 'Competitiva' ? 'Carrera Competitiva 6K' : 'Carrera Recreativa 3K'}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                        modality === 'Competitiva'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                          : 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/30'
                      }`}>
                        {modality === 'Competitiva' ? `$${competitivePrice} MXN` : `$${recreationalPrice} MXN`}
                      </span>
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    router.replace('/registro');
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-center"
                >
                  Cambiar Modalidad
                </button>
              </div>
            )}

            {/* 2. RUNNER INFORMATION */}
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Datos del Corredor</h2>
                    <p className="text-xs text-slate-400">Información personal para tu kit, folio y registro oficial.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 self-start sm:self-auto border border-slate-700"
                >
                  <Shirt className="w-3.5 h-3.5 text-cyan-400" />
                  Guía de Tallas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre Completo del Corredor *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Domínguez"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Aquí recibirás tu confirmación y folio.</span>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    Teléfono Celular (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="993 123 4567"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                  {runnerAge > 0 && (
                    <span className="text-[11px] text-cyan-400 mt-1 block font-semibold">
                      Edad calculada: {runnerAge} años
                    </span>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Rama / Género *
                  </label>
                  <select
                    value={gender}
                    onChange={e => {
                      const val = e.target.value as 'Varonil' | 'Femenil';
                      setGender(val);
                      if (modality === 'Recreativa') {
                        setCategory(val === 'Femenil' ? 'Recreativa Femenil' : 'Recreativa Varonil');
                      } else {
                        setCategory(val);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm font-semibold"
                  >
                    <option value="Varonil">Varonil</option>
                    <option value="Femenil">Femenil</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Categoría Oficial *
                  </label>
                  {modality === 'Competitiva' ? (
                    <select
                      value={category}
                      onChange={e => {
                        setCategory(e.target.value);
                        if (e.target.value === 'Varonil' || e.target.value === 'Femenil') {
                          setGender(e.target.value as 'Varonil' | 'Femenil');
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 text-sm"
                    >
                      <option value="Varonil">Varonil (Competitiva 6K)</option>
                      <option value="Femenil">Femenil (Competitiva 6K)</option>
                    </select>
                  ) : (
                    <select
                      value={category}
                      onChange={e => {
                        setCategory(e.target.value);
                        if (e.target.value === 'Recreativa Varonil') setGender('Varonil');
                        if (e.target.value === 'Recreativa Femenil') setGender('Femenil');
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-fuchsia-300 font-bold focus:outline-none focus:border-fuchsia-400 text-sm"
                    >
                      <option value="Recreativa Varonil">Recreativa Varonil (RECREATIVA 3K)</option>
                      <option value="Recreativa Femenil">Recreativa Femenil (RECREATIVA 3K)</option>
                    </select>
                  )}
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {modality === 'Competitiva'
                      ? '⚡ Incluye número, medalla, playera, hidratación y kit neón.'
                      : '🌟 Modalidad RECREATIVA 3K con medalla y playera.'}
                  </span>
                </div>

                {/* Shirt Size */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Talla de Playera *</span>
                  </label>
                  <select
                    value={shirtSize}
                    onChange={e => setShirtSize(e.target.value as ShirtSize)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 text-sm"
                  >
                    <option value="XS">XS (Extra Chica)</option>
                    <option value="S">S (Chica)</option>
                    <option value="M">M (Mediana)</option>
                    <option value="L">L (Grande)</option>
                    <option value="XL">XL (Extra Grande)</option>
                    <option value="XXL">XXL (Doble Extra Grande)</option>
                  </select>
                </div>

                {/* City & State */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Ciudad y Estado
                  </label>
                  <input
                    type="text"
                    value={`${city}, ${state}`}
                    onChange={e => {
                      const parts = e.target.value.split(',');
                      setCity(parts[0]?.trim() || 'Paraíso');
                      if (parts[1]) setState(parts[1].trim());
                    }}
                    placeholder="Paraíso, Tabasco"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                {/* Club / Gym */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Club, Gym o Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={clubOrTeam}
                    onChange={e => setClubOrTeam(e.target.value)}
                    placeholder="Ej. Club Runners Paraíso"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. EMERGENCY CONTACT */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-950 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Contacto de Emergencia</h3>
                  <p className="text-xs text-slate-400">Familiar o persona de confianza durante el evento.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre del Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    placeholder="Ej. María Domínguez (Esposa / Madre)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Teléfono de Emergencia *
                  </label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="993 765 4321"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. LEGAL WAIVER & PRIVACY */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
              <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={waiverAccepted}
                  onChange={e => setWaiverAccepted(e.target.checked)}
                  className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4"
                />
                <span className="leading-relaxed">
                  He leído y acepto el <strong>Reglamento Oficial</strong> y la <strong>Carta de Exoneración y Responsiva</strong> de Neon Night Run Paraíso 2026, declarando estar en condiciones físicas óptimas para participar.
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={e => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4"
                />
                <span className="leading-relaxed">
                  Acepto el <strong>Aviso de Privacidad</strong> para el tratamiento de mis datos en la logística del evento y entrega de kit oficial.
                </span>
              </label>
            </div>
          </div>

          {/* RIGHT: SUMMARY & SPEI PAYMENT (1 Col on lg) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sticky top-20 shadow-2xl space-y-5">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-400" />
                Resumen de Inscripción
              </h3>

              {/* Stage & Items breakdown */}
              <div className="space-y-3 pb-4 border-b border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Modalidad:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 ${
                    modality === 'Competitiva'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40'
                  }`}>
                    {modality === 'Competitiva' ? (
                      <>
                        <Zap className="w-3 h-3 text-cyan-400" />
                        Competitiva ($350)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-fuchsia-400" />
                        Recreativa ($250)
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Etapa activa:</span>
                  <strong className="text-white font-semibold">{activeStage?.name}</strong>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span>Concepto:</span>
                  <span className="text-white font-medium text-right">
                    {modality === 'Competitiva'
                      ? '1x Carrera Competitiva 6K (Número, Medalla, Playera, Hidratación y Kit Neón)'
                      : '1x RECREATIVA 3K (Solo Medalla y Playera)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white font-mono font-bold">${subtotal} MXN</span>
                </div>

                {appliedAmbassador && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Descuento ({appliedAmbassador.code}):</span>
                    <span>-${totalDiscount} MXN</span>
                  </div>
                )}
              </div>

              {/* Ambassador Code Input */}
              <div className="py-2 border-b border-slate-800">
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
              <div className="py-2 border-b border-slate-800">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-300">Total a Transferir:</span>
                  <span className="text-3xl font-black text-cyan-300 font-mono">
                    ${grandTotal} <span className="text-xs text-slate-400 font-normal">MXN</span>
                  </span>
                </div>
              </div>

              {/* Bank Details Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-xs text-cyan-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Transferencia Bancaria SPEI
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Beneficiario:</span>
                    <strong className="text-white font-bold">{config.bankDetails.accountHolder || 'Night run Paraíso'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Concepto de Pago:</span>
                    <strong className="text-yellow-300 font-bold">{fullName.trim() || 'Tu Nombre'}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">CLABE Interbancaria:</span>
                      <strong className="font-mono text-cyan-300 text-xs tracking-wider">{config.bankDetails.clabe || '646180402345488997'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyClabe(config.bankDetails.clabe || '646180402345488997')}
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedClabe ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 transition-all glow-cyan flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Registrando inscripción...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Registro (${grandTotal} MXN)</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registro 100% oficial · Folio asignado al instante</span>
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
