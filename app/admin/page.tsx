'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  QrCode,
  TrendingUp,
  Award,
  Shirt,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { DashboardStats, Order, Participant } from '@/lib/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        } else {
          setError(data.error || 'No se pudieron cargar las métricas en tiempo real.');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error del servidor al obtener las métricas.');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('No se pudo establecer conexión para consultar las métricas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-cyan-400 text-sm font-semibold animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando métricas en tiempo real...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[#0b1120] rounded-3xl border border-rose-500/20 max-w-xl mx-auto space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30 text-rose-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Métricas no disponibles</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            {error || 'Ocurrió un inconveniente al consultar las estadísticas en tiempo real.'}
          </p>
        </div>
        
        <div className="w-full p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 space-y-2.5">
          <p className="font-bold text-yellow-400 flex items-center gap-1.5">
            ⚠️ Límite de Cuota de Firebase Excedido
          </p>
          <p className="leading-relaxed">
            Tu base de datos de Firestore ha alcanzado el límite de lecturas gratuitas diarias del plan Spark de Firebase.
          </p>
          <p className="text-slate-400 leading-relaxed">
            La cuota se restablece automáticamente cada día a la medianoche (hora del Pacífico), o puedes actualizar tu base de datos a un plan de pago sin límites en la consola de Firebase.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          Reintentar cargar métricas
        </button>
      </div>
    );
  }

  const quotaPercent = Math.min(100, Math.round((stats.totalRegistered / stats.totalQuota) * 100));
  const kitDeliveredPercent = stats.totalConfirmed > 0
    ? Math.round((stats.kitsDeliveredCount / stats.totalConfirmed) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Tablero de Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PANEL DE CONTROL
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitoreo en vivo de inscripciones, recaudación, cupos y entrega de kits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Actualizar
          </button>
          <Link
            href="/admin/entrega-kits"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors glow-cyan"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            Escanear QR Kits
          </Link>
        </div>
      </div>

      {/* 4 HIGHLIGHT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Registered */}
        <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Corredores Inscritos</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.totalRegistered} <span className="text-xs text-slate-400 font-normal">/ {stats.totalQuota}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
            <span>{quotaPercent}% del cupo total</span>
            <span className="text-cyan-300 font-semibold">{stats.totalQuota - stats.totalRegistered} restantes</span>
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div className="bg-[#0b1120] border border-fuchsia-500/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Recaudación Total</span>
            <div className="w-9 h-9 rounded-xl bg-fuchsia-950 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-fuchsia-300 font-mono">
            ${stats.totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MXN</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-3 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.totalConfirmed} inscripciones pagadas</span>
          </div>
        </div>

        {/* Metric 3: Pending Transfers */}
        <div className="bg-[#0b1120] border border-yellow-500/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Transferencias Pendientes</span>
            <div className="w-9 h-9 rounded-xl bg-yellow-950 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-yellow-300 font-mono">
            {stats.pendingTransfersCount} <span className="text-xs text-slate-400 font-normal">órdenes</span>
          </div>
          <div className="mt-3">
            <Link
              href="/admin/pagos"
              className="text-[11px] font-bold text-yellow-400 hover:underline flex items-center gap-1"
            >
              <span>Revisar y validar pagos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 4: Kits Delivered */}
        <div className="bg-[#0b1120] border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Kits Entregados</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono">
            {stats.kitsDeliveredCount} <span className="text-xs text-slate-400 font-normal">/ {stats.totalConfirmed}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all"
              style={{ width: `${kitDeliveredPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {kitDeliveredPercent}% entregados en módulo
          </div>
        </div>
      </div>

      {/* MID SECTION: SHIRT SIZES & AMBASSADORS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* T-Shirt Size Breakdown */}
        <div className="lg:col-span-1 bg-[#0b1120] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Shirt className="w-4 h-4 text-cyan-400" />
              Inventario de Playeras
            </h3>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase">Tallas Unisex</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.sizeBreakdown).map(([size, count]) => {
              const pct = stats.totalRegistered > 0 ? Math.round((count / stats.totalRegistered) * 100) : 0;
              return (
                <div key={size} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">Talla {size}</span>
                    <span className="text-slate-400 font-mono">{count} pzas ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Ambassador Leaderboard */}
        <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Tag className="w-4 h-4 text-fuchsia-400" />
              Rendimiento de Embajadores & Convenios
            </h3>
            <Link href="/admin/embajadores" className="text-xs text-fuchsia-400 hover:underline">
              Gestionar Códigos →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Código</th>
                  <th className="pb-3">Embajador / Club</th>
                  <th className="pb-3 text-center">Usos</th>
                  <th className="pb-3 text-right">Venta Generada</th>
                  <th className="pb-3 text-right">Comisión Acumulada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.ambassadorLeaderboard.map((amb, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-3 font-mono font-bold text-cyan-300">{amb.code}</td>
                    <td className="py-3 font-medium text-white">{amb.name}</td>
                    <td className="py-3 text-center font-mono font-bold">{amb.usageCount}</td>
                    <td className="py-3 text-right font-mono text-slate-200">
                      ${amb.totalSales.toLocaleString()} MXN
                    </td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-bold">
                      ${amb.commissionEarned.toLocaleString()} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT REGISTRATIONS TABLE */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Últimos Corredores Registrados
          </h3>
          <Link href="/admin/participantes" className="text-xs text-cyan-400 hover:underline">
            Ver Todos ({stats.totalRegistered}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th className="pb-3">Folio</th>
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Talla</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Kit</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.recentParticipants.map(p => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-mono font-bold text-yellow-300">{p.folio}</td>
                  <td className="py-3 font-medium text-white">{p.fullName}</td>
                  <td className="py-3 text-slate-300">{p.category}</td>
                  <td className="py-3 font-bold text-cyan-300">{p.shirtSize}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'confirmed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {p.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.kitDelivered ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.kitDelivered ? '✓ Entregado' : 'No entregado'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/participante/${p.folio}`}
                      target="_blank"
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Boleto QR →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
