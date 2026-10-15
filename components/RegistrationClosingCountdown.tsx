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
  TimeLeft,
  DEFAULT_REGISTRATION_CLOSING_TEXT,
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

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      const calculated = calculateRegistrationTimeLeft(config);
      setTimeLeft(calculated);
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
  // STATE A: REGISTRATIONS ARE OFFICIALLY CLOSED (8:00 PM or manual close)
  // --------------------------------------------------------------------------
  if (timeLeft.isClosed) {
    return (
      <div className="w-full max-w-3xl mx-auto my-8 relative overflow-hidden rounded-3xl border-2 border-rose-500/60 bg-gradient-to-b from-[#190913] via-[#0b1120] to-[#070b14] p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center animate-in fade-in duration-500">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-rose-500/20 blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-black uppercase tracking-widest shadow-md">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Inscripciones Concluidas · Hoy a las 8:00 PM</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
            ¡YA HEMOS CERRADO LOS REGISTROS!
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            El plazo oficial para registrarse a la <strong className="text-white">Neon Night Run Paraíso 2026</strong> finalizó hoy a las <strong className="text-rose-400">8:00 de la noche</strong> (hora Ciudad de México).
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
  // STATE B: REGISTRATIONS OPEN WITH ACTIVE COUNTDOWN TO TODAY 8:00 PM
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
          <span>¡ATENCIÓN! REGISTROS FINALIZAN HOY A LAS 8:00 PM</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
          CIERRE DEFINITIVO DE INSCRIPCIONES
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          El sistema cerrará automáticamente los registros hoy a las <strong className="text-yellow-400">8:00 de la noche (Hora CDMX)</strong>. ¡Quedan pocas horas para apartar tu lugar!
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
            <span>Inscribirme antes de las 8:00 PM</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>
      </div>
    </div>
  );
}
