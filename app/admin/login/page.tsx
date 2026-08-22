'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck, Sparkles, User, ArrowRight, AlertCircle } from 'lucide-react';
import { setStoredAdminUser } from '@/lib/admin-auth';
import { AdminRole, AdminUser } from '@/lib/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@neonnightrun.com');
  const [password, setPassword] = useState('admin2026');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Validate demo credentials
    if (email === 'admin@neonnightrun.com') {
      const user: AdminUser = {
        id: 'admin-1',
        email: 'admin@neonnightrun.com',
        name: 'Director de Carrera',
        role: 'admin',
      };
      setStoredAdminUser(user);
      router.push('/admin');
    } else if (email === 'kits@neonnightrun.com') {
      const user: AdminUser = {
        id: 'staff-1',
        email: 'kits@neonnightrun.com',
        name: 'Staff Entrega de Kits',
        role: 'kits_staff',
      };
      setStoredAdminUser(user);
      router.push('/admin/entrega-kits');
    } else {
      // Default to admin user for testing
      const user: AdminUser = {
        id: 'user-custom',
        email: email || 'staff@neonnightrun.com',
        name: 'Administrador Registrado',
        role: 'admin',
      };
      setStoredAdminUser(user);
      router.push('/admin');
    }
  };

  const handleQuickLogin = (role: AdminRole, name: string, emailStr: string) => {
    const user: AdminUser = {
      id: `quick-${role}`,
      email: emailStr,
      name: name,
      role,
    };
    setStoredAdminUser(user);
    if (role === 'kits_staff') {
      router.push('/admin/entrega-kits');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 glow-cyan mb-4">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          PANEL DE ADMINISTRACIÓN
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Neon Night Run Paraíso · Control Operativo y Entrega de Kits
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0b1120] py-8 px-6 sm:px-10 border border-cyan-500/30 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 font-black text-sm rounded-xl hover:brightness-110 transition-all glow-cyan flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>Iniciar Sesión</span>
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="pt-4 border-t border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Acceso Rápido de Prueba (Demo Roles)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Director General', 'admin@neonnightrun.com')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold text-center flex flex-col items-center justify-center transition-colors"
              >
                <span>🛡️ Director Admin</span>
                <span className="text-[10px] text-slate-400 font-normal mt-0.5">Acceso Total</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kits_staff', 'Módulo de Entrega', 'kits@neonnightrun.com')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-fuchsia-300 rounded-xl text-xs font-bold text-center flex flex-col items-center justify-center transition-colors"
              >
                <span>📦 Staff de Kits</span>
                <span className="text-[10px] text-slate-400 font-normal mt-0.5">Escáner QR</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
              ← Volver al sitio público de la carrera
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
