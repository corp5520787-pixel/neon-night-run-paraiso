'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Server,
  Layers,
  HardDrive,
  FileText,
  DollarSign,
  Clock,
  Info,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { DatabaseUsageStats } from '@/lib/types';

export default function AdminDatabaseUsagePage() {
  const [stats, setStats] = useState<DatabaseUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/admin/db-usage');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
          setError(null);
          setLastUpdated(new Date());
        } else {
          setError(json.error || 'No se pudieron obtener los datos de consumo.');
        }
      } else {
        setError('Error al conectar con el servidor de métricas de base de datos.');
      }
    } catch (err) {
      console.error('Error fetching db usage stats:', err);
      setError('Fallo de red al consultar el uso de base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchUsage();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300 animate-pulse">
          Calculando telemetría de base de datos en tiempo real...
        </p>
      </div>
    );
  }

  const readsPercentage = stats?.currentUsage.readsPercentage || 0;
  const writesPercentage = stats?.currentUsage.writesPercentage || 0;
  const isBlazeActive = stats?.tierStatus === 'blaze_active' || readsPercentage > 100;
  const isWarning = stats?.tierStatus === 'free_warning' || (readsPercentage >= 70 && readsPercentage <= 100);

  // Visual width for the progress meter: 0 to 100 represents 0% to 100% of the free tier.
  // Above 100%, it overflows into the Blaze segment visually.
  const visualFreeTierProgress = Math.min(100, readsPercentage);
  const visualBlazeProgress = Math.max(0, Math.min(100, readsPercentage - 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                Uso de Base de Datos
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 normal-case tracking-normal">
                  Firestore Telemetry
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Monitoreo en tiempo real de operaciones de lectura, escritura y cuotas del Plan Gratuito vs Plan de Pago.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-colors ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{autoRefresh ? 'En vivo (cada 15s)' : 'En pausa'}</span>
          </button>

          <button
            onClick={() => fetchUsage()}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-95 transition-all text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar Ahora</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TIER STATUS BANNER */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isBlazeActive
            ? 'bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900/60 border-purple-500/40 shadow-xl shadow-purple-950/20'
            : isWarning
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/60 border-amber-500/40'
            : 'bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/60 border-emerald-500/30 shadow-xl shadow-emerald-950/10'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full animate-ping ${
                  isBlazeActive ? 'bg-purple-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Estado Actual del Servidor
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  isBlazeActive
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : isWarning
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                }`}
              >
                {stats?.tierLabel || 'Plan Gratuito Spark'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isBlazeActive
                ? 'Operando con Tarjeta / Facturación Blaze'
                : isWarning
                ? 'Consumiendo más del 70% de la cuota diaria gratuita'
                : '100% Dentro del Plan Gratuito (Sin Costo)'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {isBlazeActive
                ? `Has superado las 50,000 lecturas diarias sin interrupciones. El excedente se factura a una tarifa ultra-baja de $0.06 USD (~$1.20 MXN) por cada 100,000 operaciones adicionales.`
                : `Firebase te regala 50,000 lecturas y 20,000 escrituras TODOS los días de manera permanente. Se restablece cada 24 horas a medianoche.`}
            </p>
          </div>

          {/* Cost Estimate Block */}
          <div className="bg-[#070b14]/90 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-w-[220px] text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Costo Extra de Hoy
            </span>
            <div className="text-3xl font-black text-cyan-400 mt-1">
              ${stats?.estimatedExtraCostMXN.toFixed(2) || '0.00'}{' '}
              <span className="text-xs font-normal text-slate-400">MXN</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {stats?.estimatedExtraCostUSD && stats.estimatedExtraCostUSD > 0
                ? `($${stats.estimatedExtraCostUSD.toFixed(4)} USD excedente)`
                : '✅ $0.00 Cargos generados'}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN VISUAL BAR: PLAN GRATIS vs PLAN DE PAGO */}
      <div className="p-6 sm:p-8 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Medidor de Cuota Diaria (Lecturas de Base de Datos)
            </h3>
            <p className="text-xs text-slate-400">
              Límite diario gratuito: 50,000 lecturas | Uso actual:{' '}
              <strong className="text-white">{stats?.currentUsage.readsToday.toLocaleString()} lecturas</strong> ({readsPercentage}%)
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-cyan-300">{readsPercentage}%</span>
            <span className="text-xs text-slate-400 block font-medium">del Plan Gratuito Consumido</span>
          </div>
        </div>

        {/* Visual Dual Scale Bar */}
        <div className="space-y-2">
          {/* Label segments above the bar */}
          <div className="grid grid-cols-12 text-[11px] font-bold tracking-wider uppercase mb-1">
            <div className="col-span-8 text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Zona 1: Plan Gratuito (0 a 50,000 ops / día)</span>
            </div>
            <div className="col-span-4 text-right text-purple-400 flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Zona 2: Plan Blaze (Pago x Uso)</span>
            </div>
          </div>

          {/* Master Progress Track */}
          <div className="h-6 w-full bg-slate-950 rounded-2xl p-1 border border-slate-800 flex relative overflow-hidden">
            {/* Free Tier Segment (occupies 66.6% of the bar) */}
            <div className="w-2/3 h-full rounded-l-xl bg-slate-900 border-r-2 border-dashed border-slate-600 relative overflow-hidden flex items-center">
              <div
                className={`h-full transition-all duration-700 rounded-xl ${
                  isWarning
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-400 shadow-lg shadow-amber-500/50'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-lg shadow-cyan-500/40'
                }`}
                style={{ width: `${visualFreeTierProgress}%` }}
              />
            </div>

            {/* Blaze Overflow Segment (occupies 33.3% of the bar) */}
            <div className="w-1/3 h-full rounded-r-xl bg-slate-900/60 relative overflow-hidden flex items-center">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-rose-500 transition-all duration-700 rounded-r-xl shadow-lg shadow-purple-500/50"
                style={{ width: `${visualBlazeProgress}%` }}
              />
            </div>
          </div>

          {/* Scale Markers */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>0 ops (0%)</span>
            <span>25,000 ops (50%)</span>
            <span className="text-amber-400 font-bold">50,000 ops (100% Cuota Gratis)</span>
            <span className="text-purple-400 font-bold">+100,000 ops (Blaze $0.06 USD)</span>
          </div>
        </div>

        {/* Status Callout Pill */}
        <div className="p-4 rounded-2xl bg-[#060913] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300">
              {readsPercentage < 100 ? (
                <>
                  Te restan{' '}
                  <strong className="text-emerald-400 font-bold">
                    {(50000 - (stats?.currentUsage.readsToday || 0)).toLocaleString()} lecturas gratuitas
                  </strong>{' '}
                  para el día de hoy antes de usar el saldo de tarjeta.
                </>
              ) : (
                <>
                  Has utilizado{' '}
                  <strong className="text-purple-300 font-bold">
                    {((stats?.currentUsage.readsToday || 0) - 50000).toLocaleString()} lecturas
                  </strong>{' '}
                  en el Plan Blaze. Tu base de datos continúa operando con velocidad máxima.
                </>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Última lectura: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Hace un momento'}
            </span>
          </div>
        </div>

        {/* CLARIFICATION ON 0.1% - 0.5% USAGE */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5 font-black text-[11px]">
            %
          </div>
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-white">
              ¿Por qué el porcentaje se mantiene bajo (ej. entre 0.1% y 0.5%)?
            </p>
            <p className="text-slate-400 text-[11px]">
              Firebase asigna una cuota gratuita masiva de <strong>50,000 lecturas y 20,000 escrituras cada día</strong>. Consultar la lista completa de todos los participantes (~96 registros) requiere solo ~96 operaciones de lectura, lo que representa exactamente el <strong>0.19%</strong> del cupo diario. El bajo porcentaje indica una arquitectura altamente optimizada con caché en memoria y cero consultas redundantes.
            </p>
          </div>
        </div>
      </div>

      {/* 4 CORE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* READS CARD */}
        <div className="p-5 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lecturas Hoy</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats?.currentUsage.readsToday.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ 50,000 gratis</span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  readsPercentage > 100
                    ? 'bg-purple-500'
                    : readsPercentage > 70
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, readsPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Uso: {readsPercentage}%</span>
              <span>{Math.max(0, 50000 - (stats?.currentUsage.readsToday || 0)).toLocaleString()} restan</span>
            </div>
          </div>
        </div>

        {/* WRITES CARD */}
        <div className="p-5 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escrituras Hoy</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats?.currentUsage.writesToday.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ 20,000 gratis</span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, writesPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Uso: {writesPercentage}%</span>
              <span>{Math.max(0, 20000 - (stats?.currentUsage.writesToday || 0)).toLocaleString()} restan</span>
            </div>
          </div>
        </div>

        {/* DELETES CARD */}
        <div className="p-5 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eliminaciones</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats?.currentUsage.deletesToday.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ 20,000 gratis</span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full"
                style={{ width: `${Math.min(100, stats?.currentUsage.deletesPercentage || 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Uso: {stats?.currentUsage.deletesPercentage || 0}%</span>
              <span>Cuota intacta</span>
            </div>
          </div>
        </div>

        {/* STORAGE CARD */}
        <div className="p-5 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Almacenamiento</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats?.currentUsage.estimatedStorageMB || '0.00'} MB
            </span>
            <span className="text-xs text-slate-400">/ 1,024 MB (1GB)</span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.min(100, (stats?.currentUsage.storagePercentage || 0) * 10)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Total Docs: {stats?.collectionBreakdown.totalDocuments}</span>
              <span>{stats?.currentUsage.storagePercentage || 0}% de 1GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: COLLECTIONS BREAKDOWN & ACTIVE OPTIMIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLLECTIONS IN FIRESTORE */}
        <div className="p-6 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-white uppercase tracking-tight text-sm sm:text-base">
              Distribución de Documentos en Firestore
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Corredores Registrados</span>
              <span className="text-xl font-black text-cyan-400 mt-1">
                {stats?.collectionBreakdown.participantsCount || 0}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">collection: participants</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Órdenes de Pago</span>
              <span className="text-xl font-black text-emerald-400 mt-1">
                {stats?.collectionBreakdown.ordersCount || 0}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">collection: orders</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Etapas de Precio</span>
              <span className="text-xl font-black text-purple-400 mt-1">
                {stats?.collectionBreakdown.stagesCount || 0}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">collection: stages</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Embajadores</span>
              <span className="text-xl font-black text-amber-400 mt-1">
                {stats?.collectionBreakdown.ambassadorsCount || 0}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">collection: ambassadors</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Registros de Auditoría</span>
              <span className="text-xl font-black text-slate-300 mt-1">
                {stats?.collectionBreakdown.logsCount || 0}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">collection: audit_logs</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col">
              <span className="text-[10px] font-bold text-cyan-300 uppercase">Total en Base de Datos</span>
              <span className="text-xl font-black text-white mt-1">
                {stats?.collectionBreakdown.totalDocuments || 0}
              </span>
              <span className="text-[9px] text-cyan-400/80 font-mono">docs almacenados</span>
            </div>
          </div>
        </div>

        {/* ACTIVE SHIELD & OPTIMIZATIONS */}
        <div className="p-6 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white uppercase tracking-tight text-sm sm:text-base">
              Optimizaciones Activas de Ahorro
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block">Caché en Memoria (TTL 30s)</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Las consultas a configuración de carrera, patrocinadores y etapas se retienen en memoria. Si 100 corredores entran al mismo tiempo, solo se realiza 1 lectura a Firestore.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block">Contadores Atómicos (`increment`)</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  La numeración de folios y órdenes utiliza documentos contadores. Ya no se descargan colecciones enteras para asignar números consecutivos.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block">Prevención de Bucles N+1</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Las consultas en el panel administrativo procesan participantes y órdenes en una sola pasada en lugar de realizar una petición por cada registro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT DB OPERATIONS TABLE */}
      <div className="p-6 bg-[#090e1a] rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-white uppercase tracking-tight text-sm sm:text-base">
              Actividad Reciente del Servidor
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Últimos eventos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4 rounded-l-xl">Hora</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Colección / Objetivo</th>
                <th className="py-2.5 px-4 rounded-r-xl text-right">Cantidad de Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recentOperations && stats.recentOperations.length > 0 ? (
                stats.recentOperations.map((op, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(op.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          op.type === 'READ'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : op.type === 'WRITE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : op.type === 'CACHE_HIT'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {op.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-200">
                      {op.target}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-white">
                      {op.count} {op.count === 1 ? 'doc' : 'docs'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No se han registrado operaciones en esta sesión.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
