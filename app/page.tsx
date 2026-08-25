'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import StickyMobileBar from '@/components/StickyMobileBar';
import SponsorSlider from '@/components/SponsorSlider';
import {
  Sparkles,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Flame,
  Award,
  Shirt,
  Droplets,
  ShieldCheck,
  Music,
  Users,
  ChevronDown,
  ArrowRight,
  Zap,
  Camera,
  HeartHandshake,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EventConfig, PricingStage } from '@/lib/types';
import { defaultEventConfig, defaultPricingStages } from '@/lib/db';

export default function HomePage() {
  const [config, setConfig] = useState<EventConfig>(defaultEventConfig);
  const [stages, setStages] = useState<PricingStage[]>(defaultPricingStages);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('Todas');

  useEffect(() => {
    // Fetch live config & stages from API
    async function loadData() {
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
        console.log('Using default local state:', err);
      }
    }
    loadData();
  }, []);

  const activeStage = stages.find(s => s.active && s.id !== 'stage-team') || stages[1] || stages[0];
  const quotaPercent = Math.min(100, Math.round((config.currentTotalRegistered / config.maxTotalQuota) * 100));
  const spotsLeft = Math.max(0, config.maxTotalQuota - config.currentTotalRegistered);

  const faqCategories = ['Todas', 'Inscripción', 'Kits', 'Logística', 'Evento', 'Pagos'];
  const filteredFaqs = activeFaqCategory === 'Todas'
    ? config.faqs
    : config.faqs.filter(f => f.category === activeFaqCategory);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      {/* ---------------------------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Ambient Neon Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline / Subtitle Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-xs sm:text-sm font-bold uppercase tracking-wider glow-cyan mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>7 NOVIEMBRE 2026 · 6 KM · PARAÍSO, TABASCO</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white uppercase mb-4 leading-none">
            NEON NIGHT RUN <br />
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
              PARAÍSO
            </span>
          </h1>

          {/* Slogan */}
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-fuchsia-400 tracking-wide mb-8 text-glow-magenta uppercase">
            ¡Ilumina tu camino!
          </p>

          {/* Countdown Timer */}
          <div className="my-8">
            <CountdownTimer targetDate={config.isoDate} />
          </div>

          {/* Active Pricing & Quota Live Pill */}
          <div className="max-w-xl mx-auto bg-[#0b1120]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 sm:p-5 mb-8 text-left shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  {activeStage?.name || 'Inscripciones Abiertas'}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">
                ${activeStage?.price || 350} MXN
              </span>
            </div>

            {/* Quota bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
              <span>{config.currentTotalRegistered} corredores inscritos</span>
              <span className="font-semibold text-cyan-300">¡Quedan {spotsLeft} lugares disponibles!</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/registro"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 transition-all transform hover:-translate-y-1 active:translate-y-0 glow-cyan flex items-center justify-center gap-3 shadow-xl"
            >
              <Ticket className="w-5 h-5 text-slate-950" />
              <span>Inscribirme ahora</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </Link>

            <Link
              href="#kit"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm text-slate-200 bg-slate-900/80 border border-slate-700 hover:border-cyan-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Shirt className="w-4 h-4 text-cyan-400" />
              <span>Ver Kit Oficial y Ruta</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. QUICK METRIC STRIP */}
      {/* ---------------------------------------------------------------------- */}
      <section className="border-y border-slate-800 bg-[#090e1a] py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold">Fecha</div>
                <div className="text-sm sm:text-base font-bold text-white">7 Noviembre 2026</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold">Horario</div>
                <div className="text-sm sm:text-base font-bold text-white">19:30 hrs (Noche)</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-yellow-950/80 border border-yellow-500/40 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold">Ubicación</div>
                <div className="text-sm sm:text-base font-bold text-white">Malecón de Paraíso, Tab.</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold">Distancia</div>
                <div className="text-sm sm:text-base font-bold text-white">6 KM (Glow Night)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* PATROCINADORES Y MARCAS ALIADAS (SLIDER AUTOMÁTICO) */}
      {/* ---------------------------------------------------------------------- */}
      <SponsorSlider initialSponsors={config.sponsors} />

      {/* ---------------------------------------------------------------------- */}
      {/* 3. EXPERIENCIA NOCTURNA */}
      {/* ---------------------------------------------------------------------- */}
      <section id="experiencia" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full">
            La Experiencia
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            MÁS QUE UNA CARRERA, <br />
            <span className="text-fuchsia-400">UN FESTIVAL DE LUZ Y ENERGÍA</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Diseñada tanto para corredores experimentados que buscan romper su marca de 6K como para familias, amigos y grupos recreativos que desean vivir una fiesta deportiva inolvidable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 hover:border-cyan-400 transition-all glow-cyan flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">Zonas de Luz Negra & Polvo UV</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Durante el trayecto cruzarás arcos iluminados con luz ultravioleta, donde tu playera reflectante, pulseras y pintura corporal brillarán intensamente.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-cyan-300">
              5 puntos de animación lumínica
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0b1120] border border-fuchsia-500/30 rounded-3xl p-6 sm:p-8 hover:border-fuchsia-400 transition-all glow-magenta flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-950 border border-fuchsia-500/40 flex items-center justify-center mb-6">
                <Music className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">DJ en Vivo & Sound Tunnels</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Música electrónica y ritmos de alta frecuencia en la salida, meta y túneles intermedios para mantener tu pulso y motivación al 100%.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-fuchsia-300">
              Ambiente 100% familiar y seguro
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0b1120] border border-yellow-500/30 rounded-3xl p-6 sm:p-8 hover:border-yellow-400 transition-all glow-yellow flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-950 border border-yellow-500/40 flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">Medalla Glow & After-Party</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Al cruzar la meta recibirás tu medalla conmemorativa que brilla en la oscuridad, hidratación fría y acceso exclusivo al concierto de clausura.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-yellow-300">
              Celebración oficial de meta
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. CONTENIDO DEL KIT OFICIAL */}
      {/* ---------------------------------------------------------------------- */}
      <section id="kit" className="py-20 bg-[#090e1a] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-fuchsia-400 uppercase tracking-widest bg-fuchsia-950/80 border border-fuchsia-500/30 px-3 py-1 rounded-full">
              Kit de Corredor
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
              TODO LO QUE INCLUYE TU INSCRIPCIÓN
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Equipamiento técnico de alta calidad y artículos luminosos para hacer de tu 6K una noche mágica.
            </p>
          </div>

          {/* Visual Showcase: Shirt & Medal Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Playera Oficial Card */}
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Playera Oficial 2026
                </span>
                <span className="text-xs text-yellow-400 font-semibold bg-yellow-950/60 px-2 py-0.5 rounded">
                  *Diseño conmemorativo provisional
                </span>
              </div>

              {/* Graphic container */}
              <div className="h-64 rounded-2xl bg-gradient-to-b from-slate-900 to-[#060913] border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative group">
                <div className="w-24 h-24 rounded-full bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center glow-cyan mb-3">
                  <Shirt className="w-12 h-12 text-cyan-300" />
                </div>
                <div className="text-lg font-black text-white tracking-wide">
                  PLAYERA TÉCNICA DRY-FIT NEÓN
                </div>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Tejido ultraligero transpirable, corte ergonómico y serigrafía reflectante reactiva a luz negra.
                </p>
                <div className="flex gap-2 mt-4 text-[11px] font-bold text-cyan-400">
                  <span>XS</span> · <span>S</span> · <span>M</span> · <span>L</span> · <span>XL</span> · <span>XXL</span>
                </div>
              </div>
            </div>

            {/* Medalla Oficial Card */}
            <div className="bg-[#0b1120] border border-fuchsia-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-950 border border-fuchsia-500/40 text-fuchsia-300">
                  Medalla de Finalista
                </span>
                <span className="text-xs text-yellow-400 font-semibold bg-yellow-950/60 px-2 py-0.5 rounded">
                  *Esmalte Glow in the Dark
                </span>
              </div>

              {/* Graphic container */}
              <div className="h-64 rounded-2xl bg-gradient-to-b from-slate-900 to-[#060913] border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative group">
                <div className="w-24 h-24 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/60 flex items-center justify-center glow-magenta mb-3">
                  <Award className="w-12 h-12 text-fuchsia-300" />
                </div>
                <div className="text-lg font-black text-white tracking-wide">
                  MEDALLA CONMEMORATIVA 85MM
                </div>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Fundición de zinc con relieve tridimensional, elementos fotoluminiscentes y listón sublimado de alta resistencia.
                </p>
                <div className="text-[11px] font-bold text-fuchsia-400 mt-4">
                  Para todos los corredores que crucen la meta
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Kit Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.kitItems.map(item => (
              <div key={item.id} className="bg-[#0b1120]/80 border border-slate-800 p-5 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.description}</p>
                  {item.provisionalNote && (
                    <span className="text-[10px] text-yellow-400 font-semibold block mt-1.5">
                      *{item.provisionalNote}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Kit pickup details callout */}
          <div className="mt-12 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Logística de Entrega de Kits
              </div>
              <div className="text-base font-bold text-white">
                {config.kitPickupDates}
              </div>
              <div className="text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-cyan-400" />
                {config.kitPickupLocation}
              </div>
            </div>

            <Link
              href="/registro"
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm rounded-xl shrink-0 transition-colors"
            >
              Asegurar mi Kit ahora
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. PRECIOS Y DISPONIBILIDAD DE CUPOS */}
      {/* ---------------------------------------------------------------------- */}
      <section id="etapas" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest bg-yellow-950/80 border border-yellow-500/30 px-3 py-1 rounded-full">
            Tarifa Oficial
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            INSCRIPCIÓN GENERAL 6K
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Cupo limitado a {config.maxTotalQuota} corredores para garantizar la seguridad, hidratación y entrega de todos los kits completos.
          </p>
        </div>

        {/* Single Pricing Highlight Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-[#0b1120] border-2 border-cyan-400 glow-cyan rounded-3xl p-8 sm:p-10 relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 text-xs font-black uppercase rounded-full tracking-wider shadow-md mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Precio Oficial Único Vigente</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
              Boleto Corredor 6K
            </h3>
            <p className="text-sm text-cyan-300 font-semibold max-w-md mx-auto mb-6">
              Incluye: Playera, medalla y número oficial de corredor.
            </p>

            <div className="text-5xl sm:text-6xl font-black text-white font-mono my-4 flex items-center justify-center gap-2">
              $350 <span className="text-base sm:text-lg text-cyan-400 font-bold uppercase">MXN</span>
            </div>

            {/* Quota Progress inside card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 my-6 text-left">
              <div className="flex justify-between items-center text-xs text-slate-300 mb-2 font-semibold">
                <span>Inscritos: {config.currentTotalRegistered} de {config.maxTotalQuota} lugares</span>
                <span className="text-cyan-400 font-bold font-mono">¡Solo quedan {spotsLeft} lugares!</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>

            <Link
              href="/registro"
              className="w-full py-4 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 transition-all transform hover:-translate-y-1 active:translate-y-0 glow-cyan flex items-center justify-center gap-3 shadow-xl"
            >
              <Ticket className="w-5 h-5 text-slate-950" />
              <span>Inscribirme ahora por $350 MXN</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </Link>
          </div>
        </div>

        {/* Fast Registration Reminder */}
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-fuchsia-950/80 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
              Inscripción Rápida en Línea
            </span>
            <h3 className="text-2xl font-black text-white">Registro 100% Individual y Directo</h3>
            <p className="text-slate-300 text-sm max-w-2xl">
              Llena tus datos en menos de 2 minutos, asegura tu kit oficial con playera a tu medida y obtén tu folio oficial con número de referencia para transferencia SPEI.
            </p>
          </div>

          <Link
            href="/registro"
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-slate-950 font-black text-sm rounded-xl shrink-0 transition-all shadow-lg flex items-center gap-2"
          >
            <Ticket className="w-4 h-4 text-slate-950" />
            <span>Inscribirme Ahora</span>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 6. CATEGORÍAS Y PREMIOS */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-[#090e1a] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full">
              Competencia y Premios
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
              CATEGORÍAS Y BOLSA DE PREMIACIÓN
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Trofeos conmemorativos luminosos y premios en efectivo para los primeros lugares de las ramas competitivas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categorías Card */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Categorías Disponibles
              </h3>
              <div className="space-y-3">
                {config.categories.map(cat => (
                  <div key={cat.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-white text-sm sm:text-base">{cat.name}</div>
                      <div className="text-xs text-slate-400">Rango: {cat.ageRange} años · Rama: {cat.gender}</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      cat.type === 'Competitiva'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        : 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30'
                    }`}>
                      {cat.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premios Card */}
            <div className="bg-[#0b1120] border border-yellow-500/30 rounded-3xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Bolsa de Premios
                </h3>
                <span className="text-[11px] text-yellow-400 font-semibold bg-yellow-950/60 px-2 py-0.5 rounded">
                  *Provisional sujeta a convocatoria oficial
                </span>
              </div>

              <div className="space-y-4">
                {config.prizes.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="font-bold text-yellow-300 text-sm mb-2">{p.category}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg text-center border border-yellow-500/20">
                        <span className="text-[10px] text-slate-400 block">1er Lugar</span>
                        <strong className="text-yellow-400 block font-mono mt-0.5">{p.firstPlace}</strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg text-center border border-slate-700">
                        <span className="text-[10px] text-slate-400 block">2do Lugar</span>
                        <strong className="text-slate-200 block font-mono mt-0.5">{p.secondPlace}</strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg text-center border border-slate-700">
                        <span className="text-[10px] text-slate-400 block">3er Lugar</span>
                        <strong className="text-slate-300 block font-mono mt-0.5">{p.thirdPlace}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 7. RUTA 6K Y PUNTOS DE ANIMACIÓN */}
      {/* ---------------------------------------------------------------------- */}
      <section id="ruta" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-fuchsia-400 uppercase tracking-widest bg-fuchsia-950/80 border border-fuchsia-500/30 px-3 py-1 rounded-full">
            Recorrido Oficial
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            CIRCUITO NOCTURNO 6K
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Recorrido plano, pavimentado y 100% resguardado que bordea el Malecón Turístico, zonas costeras y monumentos emblemáticos de Paraíso, Tabasco.
          </p>
        </div>

        {/* Route Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {config.routePoints.map((pt, i) => (
            <div key={i} className="bg-[#0b1120] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-950 text-cyan-300 text-xs font-mono font-bold rounded-bl-xl border-l border-b border-cyan-500/30">
                {pt.kilometer}
              </div>
              <div>
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <h4 className="font-bold text-white text-sm mb-2">{pt.name}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{pt.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-fuchsia-400">
                ★ {pt.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* Map Placeholder Graphic Container */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-slate-950 via-[#060913] to-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center glow-cyan mb-4">
              <MapPin className="w-8 h-8 text-cyan-400 animate-bounce" />
            </div>
            <h4 className="text-xl font-bold text-white">Mapa de Ruta 6K Certificada</h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1">
              Salida y Meta: Malecón Turístico de Paraíso · Recorrido plano de asfalto con señalización lumínica cada 500 metros.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-cyan-400" /> 2 Puntos de Hidratación
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Resguardo Vial Municipal
              </span>
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4 text-fuchsia-400" /> 3 Estaciones de DJ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 8. ENTRENAMIENTOS "DE CERO A 6K" & SEGURIDAD */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-[#090e1a] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Program De Cero a 6K */}
            <div className="space-y-6">
              <span className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest bg-yellow-950/80 border border-yellow-500/30 px-3 py-1 rounded-full">
                Preparación Deportiva
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                PROGRAMA GRATUITO <br />
                <span className="text-yellow-400">“DE CERO A 6K”</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                ¿Es tu primera carrera? Te acompañamos paso a paso con entrenamientos grupales nocturnos en Paraíso y planes de acondicionamiento físico de 6 semanas para llegar con tu mejor energía.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs sm:text-sm text-slate-300">
                    <strong>Entrenamientos presenciales:</strong> Martes y Jueves a las 19:30 hrs en el Malecón.
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-fuchsia-400 shrink-0" />
                  <div className="text-xs sm:text-sm text-slate-300">
                    <strong>Guía de Hidratación:</strong> Consejos de nutrición e hidratación adaptados al clima nocturno de Tabasco.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Security & Medical */}
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                Seguridad y Protocolo Médico
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Tu bienestar es nuestra máxima prioridad. Contamos con un despliegue operativo integral coordinado con las autoridades de protección civil y tránsito de Paraíso.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Ambulancia de terapia intensiva y paramédicos en bicicleta a lo largo de toda la ruta.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Cierre vial total del circuito coordinado con Tránsito Municipal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Zona de guardarropa vigilado para pertenencias personales en la zona de meta.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Seguro de gastos médicos para corredores formalmente inscritos.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* PREGUNTAS FRECUENTES (FAQ) */}
      {/* ---------------------------------------------------------------------- */}
      <section id="faq" className="py-20 bg-[#090e1a] border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full">
              Resolvemos tus Dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4 tracking-tight">
              PREGUNTAS FRECUENTES
            </h2>
          </div>

          {/* FAQ Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {faqCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFaqCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFaqCategory === cat
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion list */}
          <div className="space-y-3">
            {filteredFaqs.map(faq => {
              const isOpen = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-cyan-400 transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 11. FINAL HIGH-IMPACT CTA */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4 leading-tight">
            ¿LISTO PARA ILUMINAR <br />
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-yellow-400 bg-clip-text text-transparent">
              LAS NOCHES DE TABASCO?
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Inscríbete hoy mismo de forma individual o con tu equipo. ¡Los lugares y tallas se agotan con rapidez!
          </p>

          <Link
            href="/registro"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 transition-all transform hover:-translate-y-1 active:translate-y-0 glow-cyan shadow-2xl"
          >
            <Ticket className="w-6 h-6 text-slate-950" />
            <span>Inscribirme a la carrera</span>
            <ArrowRight className="w-6 h-6 text-slate-950" />
          </Link>
        </div>
      </section>

      {/* Sticky mobile action bar */}
      <StickyMobileBar
        currentPrice={activeStage?.price || 450}
        stageName={activeStage?.name || 'Inscripción General'}
      />

      <Footer />
    </div>
  );
}
