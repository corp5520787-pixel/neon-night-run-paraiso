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
              <span>Ver Kit Oficial</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* PATROCINADORES Y MARCAS ALIADAS (SLIDER AUTOMÁTICO) */}
      {/* ---------------------------------------------------------------------- */}
      <SponsorSlider initialSponsors={config.sponsors} />

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
              QUE INCLUYE TU INSCRIPCIÓN
            </h2>
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
              Incluye: Playera, medalla y Kit Neon.
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
              Premio en carrera recreativa en especie para los primeros lugares de las ramas varonil y femenil.
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
                      <div className="text-xs text-slate-400">Rango: {cat.ageRange} · Rama: {cat.gender}</div>
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
                  Premio en carrera recreativa en especie
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
      {/* 8. ENTRENAMIENTOS EN POWERFIT */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-[#090e1a] border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0b1120] border border-yellow-500/30 rounded-3xl p-6 sm:p-10 space-y-6 text-center">
            <span className="inline-block text-xs font-extrabold text-yellow-400 uppercase tracking-widest bg-yellow-950/80 border border-yellow-500/30 px-3 py-1 rounded-full">
              Preparación Deportiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ENTRÉNATE EN <span className="text-yellow-400">“POWERFIT”</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              ¡Prepárate con todo para la carrera! Te invitamos a sumarte a los entrenamientos en <strong>Powerfit</strong>. Acércate y pregunta por el <strong>precio especial exclusivo</strong> para participantes de la Carrera Neón.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs sm:text-sm text-slate-300">
                  <strong>Acondicionamiento y fuerza:</strong> Entrenamientos funcionales y preparación física guiada en Powerfit.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
                <div className="text-xs sm:text-sm text-slate-300">
                  <strong>Precio especial para corredores:</strong> Menciona que eres participante de la Neon Night Run para acceder a tu tarifa preferencial.
                </div>
              </div>
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

          {/* Accordion list */}
          <div className="space-y-3">
            {config.faqs.map(faq => {
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
