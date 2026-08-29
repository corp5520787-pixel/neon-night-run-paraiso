'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  X,
  Loader2,
  Sparkles,
  Info,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Sponsor } from '@/lib/types';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [tier, setTier] = useState<Sponsor['tier']>('Oficial');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState<number>(1);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSponsors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sponsors');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSponsors(data.data);
        } else {
          setError(data.error || 'No se pudieron cargar los patrocinadores.');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error del servidor al obtener patrocinadores.');
      }
    } catch (err) {
      console.error('Error fetching sponsors:', err);
      setError('No se pudo establecer conexión para consultar los patrocinadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const openCreateModal = () => {
    setEditingSponsor(null);
    setName('');
    setTier('Oficial');
    setLogoUrl('');
    setWebsiteUrl('');
    setActive(true);
    setOrder(sponsors.length + 1);
    setUploadError(null);
    setShowModal(true);
  };

  const openEditModal = (sp: Sponsor) => {
    setEditingSponsor(sp);
    setName(sp.name);
    setTier(sp.tier);
    setLogoUrl(sp.logoUrl || '');
    setWebsiteUrl(sp.websiteUrl || '');
    setActive(sp.active !== false);
    setOrder(sp.order || 1);
    setUploadError(null);
    setShowModal(true);
  };

  // Handle local file upload & convert to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('La imagen es demasiado pesada. El tamaño máximo recomendado es 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setUploadError('Error al procesar la imagen seleccionada.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        tier,
        logoUrl: logoUrl.trim(),
        websiteUrl: websiteUrl.trim(),
        active,
        order: Number(order) || 1,
      };

      if (editingSponsor) {
        // Update
        const res = await fetch('/api/sponsors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSponsor.id,
            ...payload,
          }),
        });
        if (res.ok) {
          await fetchSponsors();
          setShowModal(false);
        }
      } else {
        // Create
        const res = await fetch('/api/sponsors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchSponsors();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('Error saving sponsor:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (sp: Sponsor) => {
    try {
      const res = await fetch('/api/sponsors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sp.id,
          active: !sp.active,
        }),
      });
      if (res.ok) {
        setSponsors(prev =>
          prev.map(item => (item.id === sp.id ? { ...item, active: !item.active } : item))
        );
      }
    } catch (err) {
      console.error('Error toggling sponsor active state:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sponsors?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSponsors(prev => prev.filter(item => item.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Error deleting sponsor:', err);
    }
  };

  const getTierBadge = (t: Sponsor['tier']) => {
    switch (t) {
      case 'Diamante':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
      case 'Oro':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40';
      case 'Plata':
        return 'bg-slate-400/20 text-slate-200 border-slate-400/40';
      case 'Institucional':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      case 'Oficial':
      default:
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40';
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Módulo de Patrocinios y Alianzas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            PATROCINADORES Y MARCAS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gestiona los logos y marcas aliadas que se muestran en el slider automático de la landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSponsors}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Patrocinador</span>
          </button>
        </div>
      </div>

      {/* RECOMMENDED DIMENSIONS INFO BANNER */}
      <div className="bg-gradient-to-r from-[#0d1627] via-[#0b1120] to-[#120f24] border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Info className="w-4 h-4" />
              <span>Guía de Medidas y Especificaciones para Logos</span>
            </div>
            <h3 className="text-lg font-black text-white">
              Dimensiones Recomendadas: <span className="text-cyan-300 font-mono">600 x 340 px</span> o <span className="text-fuchsia-300 font-mono">500 x 280 px</span> (Proporción Rectangular 16:9)
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              La imagen que subas cubrirá todo el recuadro redondeado de extremo a extremo sin márgenes internos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <span className="font-bold text-cyan-400 block">📐 Proporción:</span>
                Rectangular 16:9 (600x340 px o 500x280 px).
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <span className="font-bold text-fuchsia-400 block">🖼️ Formato:</span>
                JPG o PNG a todo color (la imagen llena todo el recuadro).
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <span className="font-bold text-yellow-400 block">⚡ Peso Recomendado:</span>
                Menos de 1 MB (100 a 500 KB).
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center w-full md:w-auto">
            <div className="text-xs text-slate-400 mb-1">Patrocinadores Activos</div>
            <div className="text-3xl font-black text-white font-mono">
              {sponsors.filter(s => s.active !== false).length} <span className="text-sm font-normal text-slate-500">/ {sponsors.length}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              ✓ Visibles en Slider en vivo
            </div>
          </div>
        </div>
      </div>

      {/* SPONSORS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mr-3" />
          <span className="text-sm font-medium">Cargando patrocinadores...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-[#0b1120] border border-rose-500/20 rounded-3xl p-8 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30 text-rose-400 mx-auto">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white">Error al cargar patrocinadores</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {error}. Tus patrocinadores e imágenes registradas están completamente seguros. Este inconveniente se debe temporalmente a que tu base de datos de Firebase alcanzó el límite diario de lecturas del plan gratuito (Spark).
          </p>
          <div className="text-[11px] text-slate-500 max-w-md mx-auto leading-normal bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-left">
            💡 Las cuotas se reinician de manera automática todos los días a la medianoche (hora del Pacífico - 1:00 AM hora CDMX) o puedes actualizar a un plan sin límites en tu consola de Firebase.
          </div>
          <button
            onClick={fetchSponsors}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl inline-flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Reintentar cargar patrocinadores
          </button>
        </div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-16 bg-[#0b1120] border border-slate-800 rounded-3xl p-8">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No hay patrocinadores registrados</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            Agrega tu primer patrocinador para que su logo comience a girar en el slider de la página de inicio.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl"
          >
            Agregar Patrocinador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sponsors.map(sp => (
            <div
              key={sp.id}
              className={`bg-[#0b1120] border rounded-3xl p-5 flex flex-col justify-between transition-all relative ${
                sp.active !== false
                  ? 'border-slate-800 hover:border-cyan-500/50 shadow-lg'
                  : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                {/* TOP BAR OF CARD */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getTierBadge(sp.tier)}`}>
                    {sp.tier}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(sp)}
                      title={sp.active !== false ? 'Desactivar de la landing' : 'Activar en la landing'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        sp.active !== false
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {sp.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* LOGO PREVIEW BOX (Edge to edge image) */}
                <div className="w-full h-32 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-center mb-4 overflow-hidden group relative">
                  {sp.logoUrl ? (
                    <img
                      src={sp.logoUrl}
                      alt={sp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block font-semibold">{sp.name}</span>
                    </div>
                  )}
                </div>

                {/* NAME & INFO */}
                <h4 className="font-bold text-white text-sm line-clamp-1 mb-1" title={sp.name}>
                  {sp.name}
                </h4>

                {sp.websiteUrl ? (
                  <a
                    href={sp.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 line-clamp-1 mb-3"
                  >
                    <span>{sp.websiteUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <div className="text-[11px] text-slate-500 mb-3">Sin enlace web</div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Pos: #{sp.order || 1}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(sp)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors border border-slate-800"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(sp.id)}
                    className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl transition-colors border border-rose-900/30"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white">
                  {editingSponsor ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre de la Marca o Institución *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Electrolit, Innovasport, Hotel Paraíso"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Tier & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nivel / Categoría
                  </label>
                  <select
                    value={tier}
                    onChange={e => setTier(e.target.value as Sponsor['tier'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Diamante">Diamante</option>
                    <option value="Oro">Oro</option>
                    <option value="Plata">Plata</option>
                    <option value="Institucional">Institucional</option>
                    <option value="Oficial">Oficial / Aliado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={e => setOrder(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Logo Upload & URL */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Logo / Imagen del Patrocinador
                </label>

                {/* Drag & drop / Click Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-950/60 rounded-2xl p-4 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-white mb-0.5">
                    Haz clic aquí para subir una imagen desde tu equipo
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Recomendado: 400x400 px o 500x500 px (PNG transparente o JPG)
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 font-semibold">{uploadError}</p>
                )}

                {/* Or paste URL */}
                <div>
                  <div className="text-xs text-slate-400 mb-1">O escribe la dirección URL directa de la imagen:</div>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/logo-patrocinador.png"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Logo Preview */}
                {logoUrl && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 bg-slate-900 rounded-lg flex items-center justify-center p-1 border border-slate-800 overflow-hidden">
                        <img
                          src={logoUrl}
                          alt="Vista previa"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-xs text-slate-300 font-medium">Vista previa de imagen</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Sitio Web o Red Social (Opcional)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.facebook.com/empresa"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:outline-none accent-cyan-400 cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-slate-200 cursor-pointer">
                  Activar de inmediato en el carrusel de la página de inicio
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSponsor ? 'Guardar Cambios' : 'Agregar Patrocinador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">¿Eliminar este patrocinador?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esta acción quitará el logo del carrusel de inicio permanentemente.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-600/30"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
