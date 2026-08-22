'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Calendar,
  Building2,
  MapPin,
  Award,
  Save,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { EventConfig } from '@/lib/types';
import { defaultEventConfig } from '@/lib/db';

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<EventConfig>(defaultEventConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/event/config');
      if (res.ok) {
        const data = await res.json();
        if (data.data) setConfig(data.data);
      }
    } catch (err) {
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/event/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Ajustes Globales
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            CONFIGURACIÓN DEL EVENTO
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Edita fechas, ubicación, cuentas de depósito bancario y datos institucionales.
          </p>
        </div>

        <button
          onClick={fetchConfig}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>¡Configuración guardada exitosamente! Los cambios ya se reflejan en el sitio público.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Event Basic Info */}
        <div className="bg-[#0b1120] border border-cyan-500/30 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Información General de la Carrera
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nombre Oficial del Evento</label>
              <input
                type="text"
                value={config.name}
                onChange={e => setConfig({ ...config, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Eslogan</label>
              <input
                type="text"
                value={config.slogan}
                onChange={e => setConfig({ ...config, slogan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Fecha Formateada</label>
              <input
                type="text"
                value={config.dateText}
                onChange={e => setConfig({ ...config, dateText: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Hora de Salida</label>
              <input
                type="text"
                value={config.scheduleTime}
                onChange={e => setConfig({ ...config, scheduleTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Ubicación / Sede</label>
              <input
                type="text"
                value={config.location}
                onChange={e => setConfig({ ...config, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Cupo Máximo Total de Corredores</label>
              <input
                type="number"
                value={config.maxTotalQuota}
                onChange={e => setConfig({ ...config, maxTotalQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* 2. Bank Details */}
        <div className="bg-[#0b1120] border border-fuchsia-500/30 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-fuchsia-400" />
            Datos Bancarios Oficiales para Transferencias SPEI
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Banco Receptor</label>
              <input
                type="text"
                value={config.bankDetails.bankName}
                onChange={e => setConfig({
                  ...config,
                  bankDetails: { ...config.bankDetails, bankName: e.target.value },
                })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Nombre del Titular / Razón Social</label>
              <input
                type="text"
                value={config.bankDetails.accountHolder}
                onChange={e => setConfig({
                  ...config,
                  bankDetails: { ...config.bankDetails, accountHolder: e.target.value },
                })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">CLABE Interbancaria (18 dígitos)</label>
              <input
                type="text"
                value={config.bankDetails.clabe}
                onChange={e => setConfig({
                  ...config,
                  bankDetails: { ...config.bankDetails, clabe: e.target.value },
                })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">WhatsApp de Soporte para Pagos</label>
              <input
                type="text"
                value={config.contactWhatsapp}
                onChange={e => setConfig({ ...config, contactWhatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* 3. Kit Pickup Details */}
        <div className="bg-[#0b1120] border border-yellow-500/30 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            Lugar y Horarios de Entrega de Kits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Fechas y Horarios de Entrega</label>
              <input
                type="text"
                value={config.kitPickupDates}
                onChange={e => setConfig({ ...config, kitPickupDates: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Lugar de Entrega</label>
              <input
                type="text"
                value={config.kitPickupLocation}
                onChange={e => setConfig({ ...config, kitPickupLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl transition-all glow-cyan flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>Guardar Configuración Global</span>
          </button>
        </div>
      </form>
    </div>
  );
}
