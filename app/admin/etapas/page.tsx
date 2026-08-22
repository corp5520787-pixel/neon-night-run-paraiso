'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { PricingStage } from '@/lib/types';

export default function AdminEtapasPage() {
  const [stages, setStages] = useState<PricingStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState<PricingStage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stages');
      if (res.ok) {
        const data = await res.json();
        if (data.data) setStages(data.data);
      }
    } catch (err) {
      console.error('Error fetching stages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stages/${editingStage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingStage.name,
          price: Number(editingStage.price),
          quota: Number(editingStage.quota),
          description: editingStage.description,
          active: editingStage.active,
        }),
      });
      if (res.ok) {
        setEditingStage(null);
        fetchStages();
      }
    } catch (err) {
      console.error('Error saving stage:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (stage: PricingStage) => {
    try {
      await fetch(`/api/stages/${stage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !stage.active }),
      });
      fetchStages();
    } catch (err) {
      console.error('Error toggling stage:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Estrategia Comercial
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            ETAPAS DE PRECIOS Y CUPOS ({stages.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Configuración dinámica de tarifas tempranas, regulares, grupos y cupos máximos.
          </p>
        </div>

        <button
          onClick={fetchStages}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* STAGES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stages.map(stage => {
          const quotaPercent = Math.min(100, Math.round((stage.soldCount / stage.quota) * 100));

          return (
            <div
              key={stage.id}
              className={`bg-[#0b1120] border rounded-3xl p-6 relative flex flex-col justify-between transition-all ${
                stage.active
                  ? 'border-cyan-400/80 glow-cyan'
                  : 'border-slate-800 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    stage.active
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400'
                  }`}>
                    {stage.active ? 'Activa en Plataforma' : 'Inactiva / Pausada'}
                  </span>

                  <button
                    onClick={() => setEditingStage(stage)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>

                <h3 className="text-xl font-black text-white">{stage.name}</h3>
                <div className="text-3xl font-black text-yellow-400 font-mono my-2">
                  ${stage.price} <span className="text-xs text-slate-400 font-normal">MXN</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{stage.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Cupo asignado:</span>
                    <strong className="text-white font-mono">{stage.soldCount} / {stage.quota} corredores</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 h-2 rounded-full"
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-400 font-mono">{quotaPercent}% completado</span>
                  <button
                    onClick={() => handleToggleActive(stage)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      stage.active
                        ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/30'
                        : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30'
                    }`}
                  >
                    {stage.active ? 'Desactivar Etapa' : 'Activar Etapa'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT MODAL */}
      {editingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                Editar Etapa: {editingStage.name}
              </h3>
              <button
                onClick={() => setEditingStage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre de la Etapa *</label>
                <input
                  type="text"
                  required
                  value={editingStage.name}
                  onChange={e => setEditingStage({ ...editingStage, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Precio Unitario (MXN) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingStage.price}
                    onChange={e => setEditingStage({ ...editingStage, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cupo Límite *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingStage.quota}
                    onChange={e => setEditingStage({ ...editingStage, quota: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descripción para el público</label>
                <textarea
                  rows={2}
                  value={editingStage.description}
                  onChange={e => setEditingStage({ ...editingStage, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingStage.active}
                  onChange={e => setEditingStage({ ...editingStage, active: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                />
                <span>Habilitar como etapa activa para inscripciones</span>
              </label>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStage(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400"
                >
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
