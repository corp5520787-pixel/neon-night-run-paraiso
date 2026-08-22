'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, Sparkles } from 'lucide-react';

interface StickyMobileBarProps {
  currentPrice: number;
  stageName: string;
}

export default function StickyMobileBar({ currentPrice, stageName }: StickyMobileBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060913]/95 backdrop-blur-lg border-t border-cyan-500/30 p-3 px-4 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold truncate max-w-[130px]">
            {stageName}
          </div>
          <div className="text-xl font-black text-cyan-300 font-mono flex items-baseline gap-1">
            ${currentPrice} <span className="text-xs text-slate-400 font-normal">MXN</span>
          </div>
        </div>

        <Link
          href="/registro"
          className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 active:scale-95 text-slate-950 font-extrabold text-sm rounded-xl text-center flex items-center justify-center gap-2 glow-cyan shadow-lg shadow-cyan-500/20"
        >
          <Ticket className="w-4 h-4 text-slate-950" />
          <span>Inscribirme ahora</span>
        </Link>
      </div>
    </div>
  );
}
