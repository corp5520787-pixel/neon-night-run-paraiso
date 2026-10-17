'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Ticket,
  CheckCircle2,
  Search,
  MessageCircle,
} from 'lucide-react';
import { EventConfig } from '@/lib/types';
import {
  calculateRegistrationTimeLeft,
  getPublicRegistrationPhase,
  PublicRegistrationPhase,
  TimeLeft,
} from '@/lib/registration-deadline';

interface RegistrationClosingCountdownProps {
  config?: Partial<EventConfig>;
}

export default function RegistrationClosingCountdown({ config }: RegistrationClosingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isClosed: false,
  });
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<PublicRegistrationPhase>('upcoming');

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      const now = Date.now();
      const calculated = calculateRegistrationTimeLeft(config, now);
      setTimeLeft(calculated);
      setPhase(getPublicRegistrationPhase(config, now));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (!mounted) {
    return (
      <div className="w-full max-w-3xl mx-auto my-6 p-6 rounded-3xl bg-[#0b1120]/90 border border-cyan-500/30 text-center animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded-full mx-auto mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-800/80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Before the public window, show the reopening announcement and live timer.
  // --------------------------------------------------------------------------
  if (phase === 'upcoming') {
    return (
      <section className="w-full max-w-3xl mx-auto my-8 relative overflow-hidden rounded-3xl border border-fuchsia-400/60 bg-gradient-to-br from-[#240b34] via-[#10152a] to-[#061b2a] p-6 sm:p-10 text-center shadow-[0_0_65px_rgba(217,70,239,0.22)]">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-72 h-72 rounded-full bg-cyan-400/15 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-4 py-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
            <Sparkles className="w-4 h-4" /> Una última oportunidad
          </div>
          <h2 className="mt-5 text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-white">
            ¡Ustedes lo pidieron! <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400">Volvemos a abrir inscripciones</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-lg text-slate-200 leading-relaxed">
            Solo el <strong className="text-white">sábado 17 de octubre</strong> podrás inscribirte de <strong className="text-yellow-300">8:00 a. m. a 10:00 p. m.</strong> (hora Ciudad de México). Después, los registros volverán a cerrar.
          </p>
          <p className="mt-7 text-xs font-bold uppercase tracking-widest text-cyan-200">Abrimos en</p>
          <div className="mt-3 flex justify-center gap-2 sm:gap-3" aria-label="Tiempo restante para abrir inscripciones">
            {[
              ['Días', timeLeft.days], ['Horas', timeLeft.hours],
              ['Minutos', timeLeft.minutes], ['Segundos', timeLeft.seconds],
            ].map(([label, value]) => (
              <div key={label} className="min-w-16 sm:min-w-24 rounded-2xl border border-cyan-400/30 bg-slate-950/65 px-2 py-3 sm:py-4">
                <span className="block font-mono text-2xl sm:text-4xl font-black text-white">{String(value).padStart(2, '0')}</span>
                <span className="block mt-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-cyan-300">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/participante" className="rounded-xl border border-cyan-400/50 px-5 py-3 text-sm font-bold text-cyan-200 hover:bg-cyan-400/10">Consultar mi folio</Link>
            <Link href="#kit" className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">Ver kit y detalles</Link>
          </div>
        </div>
      </section>
    );
  }

  // After the public window, restore the closed notice.
  if (phase === 'closed') {
    return (
      <div className="w-full max-w-3xl mx-auto my-8 relative overflow-hidden rounded-3xl border-2 border-rose-500/60 bg-gradient-to-b from-[#190913] via-[#0b1120] to-[#070b14] p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center animate-in fade-in duration-500">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-rose-500/20 blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-black uppercase tracking-widest shadow-md">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Inscripciones concluidas</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
            ¡YA HEMOS CERRADO LOS REGISTROS!
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            El plazo para registrarse a la <strong className="text-white">Neon Night Run Paraíso 2026</strong> finalizó el <strong className="text-rose-400">sábado 17 de octubre a las 10:00 p. m.</strong> (hora Ciudad de México).
          </p>

          {/* Information banner for existing registrants */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-left max-w-xl mx-auto text-xs sm:text-sm text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>¿Ya te habías registrado previamente?</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Si apartaste tu lugar y tienes pendiente subir tu comprobante de pago o deseas consultar tu código QR y folio oficial, tus datos siguen protegidos en nuestro sistema.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/participante"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:brightness-110 flex items-center justify-center gap-2 shadow-lg glow-cyan transition-all"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>Consultar Mi Folio / Estatus</span>
            </Link>

            <a
              href="https://wa.me/529931234567?text=Hola,%20tengo%20dudas%20sobre%20mi%20inscripción%20en%20la%20Neon%20Night%20Run%20Paraíso"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/60 flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp de Soporte</span>
            </a>

            <Link
              href="#kit"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-300 bg-slate-900/80 border border-slate-700 hover:text-white transition-all"
            >
              <span>Ver Kit y Detalles</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // The public window is open until 10 p.m. Mexico City time.
  // --------------------------------------------------------------------------
  const hoursLeft = (timeLeft.days * 24) + timeLeft.hours;

  return (
    <div className="w-full max-w-3xl mx-auto my-6 relative overflow-hidden rounded-3xl border-2 border-yellow-400/60 bg-gradient-to-b from-[#181305] via-[#0b1120] to-[#070b14] p-5 sm:p-7 shadow-[0_0_45px_rgba(234,179,8,0.2)] text-center animate-in fade-in duration-500">
      {/* Glow ambient background */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-yellow-500/15 blur-[90px] pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Urgency Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-950/90 border border-yellow-400/60 text-yellow-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg glow-yellow animate-pulse">
          <Clock className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>¡ÚLTIMA OPORTUNIDAD! CERRAMOS HOY A LAS 10:00 P. M.</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
          ¡Ustedes lo pidieron! Inscripciones abiertas
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Solo por hoy, sábado 17 de octubre, puedes apartar tu lugar. El registro público cierra a las <strong className="text-yellow-400">10:00 p. m. (hora Ciudad de México)</strong>.
        </p>

        {/* Live Countdown Clock */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-md mx-auto py-2">
          {/* Days (if > 0, otherwise show hours) */}
          {timeLeft.days > 0 && (
            <div className="bg-[#0f172a]/95 border border-yellow-500/40 rounded-2xl p-3 text-center shadow-lg">
              <div className="text-2xl sm:text-4xl font-black text-yellow-400 font-mono">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-yellow-200/80 font-bold mt-1">
                Días
              </div>
            </div>
          )}

          {/* Hours */}
          <div className="bg-[#0f172a]/95 border border-yellow-500/40 rounded-2xl p-3 text-center shadow-lg">
            <div className="text-2xl sm:text-4xl font-black text-yellow-400 font-mono">
              {String(hoursLeft).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-yellow-200/80 font-bold mt-1">
              Horas
            </div>
          </div>

          {/* Minutes */}
          <div className="bg-[#0f172a]/95 border border-yellow-500/40 rounded-2xl p-3 text-center shadow-lg">
            <div className="text-2xl sm:text-4xl font-black text-yellow-400 font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-yellow-200/80 font-bold mt-1">
              Minutos
            </div>
          </div>

          {/* Seconds */}
          <div className="bg-[#0f172a]/95 border border-cyan-500/50 rounded-2xl p-3 text-center shadow-lg glow-cyan">
            <div className="text-2xl sm:text-4xl font-black text-cyan-300 font-mono animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-200/80 font-bold mt-1">
              Segundos
            </div>
          </div>
        </div>

        {/* Fast Action CTA */}
        <div className="pt-2">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 hover:from-yellow-300 hover:to-amber-200 transition-all transform hover:-translate-y-0.5 glow-yellow shadow-xl"
          >
            <Ticket className="w-4 h-4 text-slate-950" />
            <span>Inscribirme ahora</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>
      </div>
    </div>
  );
}
