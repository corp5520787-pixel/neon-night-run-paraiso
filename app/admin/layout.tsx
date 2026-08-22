'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  Tag,
  Settings,
  Flame,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { getStoredAdminUser, setStoredAdminUser } from '@/lib/admin-auth';
import { AdminUser } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If login page, don't wrap with navigation
    if (pathname === '/admin/login') return;

    const stored = getStoredAdminUser();
    if (!stored) {
      // Auto assign default admin if not logged in
      const defaultUser: AdminUser = {
        id: 'admin-auto',
        email: 'admin@neonnightrun.com',
        name: 'Administrador General',
        role: 'admin',
      };
      setStoredAdminUser(defaultUser);
      setUser(defaultUser);
    } else {
      setUser(stored);
    }
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    setStoredAdminUser(null);
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'finance'] },
    { href: '/admin/participantes', label: 'Participantes', icon: Users, roles: ['admin', 'staff'] },
    { href: '/admin/pagos', label: 'Pagos & Órdenes', icon: CreditCard, roles: ['admin', 'finance'] },
    { href: '/admin/entrega-kits', label: 'Entrega de Kits (QR)', icon: QrCode, roles: ['admin', 'staff', 'kits_staff'] },
    { href: '/admin/embajadores', label: 'Embajadores', icon: Tag, roles: ['admin'] },
    { href: '/admin/etapas', label: 'Etapas de Precios', icon: Layers, roles: ['admin'] },
    { href: '/admin/configuracion', label: 'Configuración', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user) return true;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col md:flex-row selection:bg-cyan-500 selection:text-slate-950">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0b1120] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-black text-sm text-white tracking-wider">PANEL DE CONTROL</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#090e1a] border-r border-slate-800 flex-shrink-0 flex flex-col justify-between z-30`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 hidden md:block">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center glow-cyan group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  NEON NIGHT RUN
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Control Operativo 6K
                </div>
              </div>
            </Link>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                  Rol: {user.role}
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
          )}

          {/* Links List */}
          <nav className="px-3 py-2 space-y-1">
            {filteredNavItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 glow-cyan shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <span>Ver Sitio Público</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
