'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO string e.g. 2026-11-07T19:30:00
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto py-2">
        {['Días', 'Horas', 'Min', 'Seg'].map((label, i) => (
          <div key={i} className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-3 text-center">
            <div className="text-2xl sm:text-4xl font-black text-cyan-400">00</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto py-3">
      <div className="bg-[#0b1120]/90 backdrop-blur border border-cyan-500/40 rounded-2xl p-3 sm:p-4 text-center glow-cyan transition-transform hover:scale-105">
        <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-cyan-300 font-mono">
          {String(timeLeft.days).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-200/70 font-bold mt-1">Días</div>
      </div>

      <div className="bg-[#0b1120]/90 backdrop-blur border border-fuchsia-500/40 rounded-2xl p-3 sm:p-4 text-center glow-magenta transition-transform hover:scale-105">
        <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-fuchsia-400 font-mono">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-fuchsia-200/70 font-bold mt-1">Horas</div>
      </div>

      <div className="bg-[#0b1120]/90 backdrop-blur border border-yellow-500/40 rounded-2xl p-3 sm:p-4 text-center glow-yellow transition-transform hover:scale-105">
        <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-yellow-400 font-mono">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-yellow-200/70 font-bold mt-1">Minutos</div>
      </div>

      <div className="bg-[#0b1120]/90 backdrop-blur border border-blue-500/40 rounded-2xl p-3 sm:p-4 text-center transition-transform hover:scale-105">
        <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-blue-400 font-mono animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-blue-200/70 font-bold mt-1">Segundos</div>
      </div>
    </div>
  );
}
