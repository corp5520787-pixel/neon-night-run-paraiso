'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  TrendingUp,
  Percent,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';
import { AmbassadorCode } from '@/lib/types';

export default function AdminEmbajadoresPage() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New code form state
  const [code, setCode] = useState('');
  const [ambassadorName, setAmbassadorName] = useState('');
  const [ambassadorEmail, setAmbassadorEmail] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [maxUses, setMaxUses] = useState(100);

  const fetchAmbassadors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ambassadors');
      if (res.ok) {
        const data = await res.json();
        if (data.data) setAmbassadors(data.data);
      }
    } catch (err) {
      console.error('Error fetching ambassadors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          ambassadorName,
          ambassadorEmail,
          discountType,
          discountValue: Number(discountValue),
          commissionPercent: Number(commissionPercent),
          maxUses: Number(maxUses),
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setCode('');
        setAmbassadorName('');
        setAmbassadorEmail('');
        fetchAmbassadors();
      }
    } catch (err) {
      console.error('Error creating code:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/ambassadors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current }),
      });
      fetchAmbassadors();
    } catch (err) {
      console.error('Error toggling code:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este código de embajador por completo?')) return;
    try {
      const res = await fetch(`/api/ambassadors/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAmbassadors();
      } else {
        alert('Error al eliminar el código');
      }
    } catch (err) {
      console.error('Error deleting ambassador:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Marketing & Convenios
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            CÓDIGOS DE EMBAJADORES ({ambassadors.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control de comisiones, clubes aliados, gimnasios y cupones de descuento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAmbassadors}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors glow-cyan"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Nuevo Código</span>
          </button>
        </div>
      </div>

      {/* AMBASSADORS TABLE */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Embajador / Alianza</th>
                <th className="py-3.5 px-4">Descuento Corredor</th>
                <th className="py-3.5 px-4">Comisión %</th>
                <th className="py-3.5 px-4 text-center">Usos / Límite</th>
                <th className="py-3.5 px-4 text-right">Ventas Totales</th>
                <th className="py-3.5 px-4 text-right">Comisión a Pagar</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ambassadors.map(amb => (
                <tr key={amb.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-cyan-300 text-sm">
                    {amb.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{amb.ambassadorName}</div>
                    <div className="text-[11px] text-slate-400">{amb.ambassadorEmail}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {amb.discountValue}{amb.discountType === 'percentage' ? '%' : ' MXN'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {amb.commissionPercent || 10}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                    {amb.usedCount || 0} / {amb.maxUses}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                    ${(amb.totalRevenue || 0).toLocaleString()} MXN
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                    ${Math.round(((amb.totalRevenue || 0) * (amb.commissionPercent || 10)) / 100).toLocaleString()} MXN
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      amb.active
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                    }`}>
                      {amb.active ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleActive(amb.id, amb.active)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        title={amb.active ? 'Pausar Código' : 'Activar Código'}
                      >
                        {amb.active ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(amb.id)}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400 rounded-lg transition-colors"
                        title="Eliminar Código"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                Crear Código de Embajador
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Código Promocional (Mayúsculas) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej. RUNNERSTABASCO"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Embajador / Club *</label>
                  <input
                    type="text"
                    required
                    value={ambassadorName}
                    onChange={e => setAmbassadorName(e.target.value)}
                    placeholder="Ej. Club de Corredores Paraíso"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Correo de Contacto *</label>
                  <input
                    type="email"
                    required
                    value={ambassadorEmail}
                    onChange={e => setAmbassadorEmail(e.target.value)}
                    placeholder="embajador@correo.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Descuento (%) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Comisión (%) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={commissionPercent}
                    onChange={e => setCommissionPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Límite Usos *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxUses}
                    onChange={e => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400"
                >
                  {submitting ? 'Guardando...' : 'Crear Código'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
