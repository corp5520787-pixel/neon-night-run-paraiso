'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, MapPin, Menu, X, ShieldAlert, Ticket, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#060913]/90 backdrop-blur-md border-b border-cyan-500/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-fuchsia-500 flex items-center justify-center p-0.5 glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              NEON NIGHT RUN <span className="text-cyan-400 text-sm font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">6K</span>
            </span>
            <span className="block text-[11px] font-semibold text-fuchsia-400 tracking-wider uppercase">
              Paraíso, Tabasco · ¡Ilumina tu camino!
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/#kit" className="hover:text-cyan-400 transition-colors">
            Kit y Medalla
          </Link>
          <Link href="/#etapas" className="hover:text-cyan-400 transition-colors">
            Precios y Cupos
          </Link>
          <Link href="/#faq" className="hover:text-cyan-400 transition-colors">
            Preguntas
          </Link>
          <Link href="/admin" className="text-slate-400 hover:text-white flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Panel Admin</span>
          </Link>
        </div>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/registro"
            className="px-5 py-2.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 transition-all glow-cyan flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Ticket className="w-4 h-4 text-slate-950" />
            Inscribirme ahora
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b1120] border-b border-cyan-500/30 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-2.5 text-sm font-medium text-slate-200">
            <Link
              href="/#kit"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Kit Oficial y Medalla
            </Link>
            <Link
              href="/#etapas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Precios y Etapas
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Preguntas Frecuentes
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 flex items-center justify-between"
            >
              <span>Panel Administrativo / Módulo Kits</span>
              <UserCheck className="w-4 h-4" />
            </Link>
          </div>
          <div className="pt-2">
            <Link
              href="/registro"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-fuchsia-400 flex items-center justify-center gap-2 glow-cyan"
            >
              <Ticket className="w-4 h-4" />
              Inscribirme ahora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
