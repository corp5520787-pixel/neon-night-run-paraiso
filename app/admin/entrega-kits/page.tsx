'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shirt,
  User,
  Calendar,
  RefreshCw,
  Camera,
  CameraOff,
  ShieldCheck,
  Zap,
  Loader2,
} from 'lucide-react';
import { Participant } from '@/lib/types';

export default function AdminEntregaKitsPage() {
  const [manualFolioOrToken, setManualFolioOrToken] = useState('');
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null);
  const [alreadyDelivered, setAlreadyDelivered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [deliveredCountToday, setDeliveredCountToday] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Search participant by folio or token
  const handleVerify = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setStatusMessage(null);
    setScannedParticipant(null);
    setAlreadyDelivered(false);

    try {
      const res = await fetch('/api/participants/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();

      if (data.valid && data.participant) {
        setScannedParticipant(data.participant);
        if (data.participant.kitDelivered) {
          setAlreadyDelivered(true);
          const delDate = data.participant.kitDeliveredAt ? new Date(data.participant.kitDeliveredAt).toLocaleString() : 'previamente';
          setStatusMessage({
            type: 'warning',
            text: `⚠️ ATENCIÓN: El kit de este corredor YA FUE ENTREGADO (${delDate}) por ${data.participant.kitDeliveredBy || 'Staff'}.`,
          });
        } else {
          setStatusMessage({
            type: 'success',
            text: '✓ Corredor verificado con pago activo. Listo para entregar kit.',
          });
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Código o Folio no válido o pago pendiente.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Error de comunicación con el servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark kit as delivered
  const handleDeliverKit = async () => {
    if (!scannedParticipant) return;
    setDelivering(true);
    try {
      const res = await fetch('/api/participants/deliver-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: scannedParticipant.id,
          deliveredBy: 'Staff Módulo Central',
        }),
      });
      const data = await res.json();
      if (data.success && data.participant) {
        setScannedParticipant(data.participant);
        setAlreadyDelivered(true);
        setDeliveredCountToday(prev => prev + 1);
        setStatusMessage({
          type: 'success',
          text: `🎉 ¡KIT ENTREGADO EXITOSAMENTE a ${data.participant.fullName}!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'No se pudo registrar la entrega',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Error al registrar entrega',
      });
    } finally {
      setDelivering(false);
    }
  };

  // Reset to scan next runner
  const handleScanNext = () => {
    setManualFolioOrToken('');
    setScannedParticipant(null);
    setAlreadyDelivered(false);
    setStatusMessage(null);
  };

  // Camera handling (WebRTC)
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (err) {
        console.error('Camera access error:', err);
        alert('No se pudo acceder a la cámara. Puedes ingresar el folio o token manualmente.');
      }
    }
  };

  useEffect(() => {
    const currentVideo = videoRef.current;
    return () => {
      if (currentVideo && currentVideo.srcObject) {
        const stream = currentVideo.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
          <QrCode className="w-3.5 h-3.5 text-cyan-400" />
          Módulo de Entrega de Kits
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          ESCÁNER DE CÓDIGOS QR
        </h1>
        <p className="text-xs text-slate-400">
          Verificación instantánea de registro, validación de talla y registro seguro anti-duplicados.
        </p>
      </div>

      {/* CAMERA SCANNER BOX */}
      <div className="bg-[#0b1120] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            Cámara del Dispositivo
          </span>
          <button
            onClick={toggleCamera}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              cameraActive ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-cyan-500 text-slate-950'
            }`}
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Apagar Cámara</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Encender Cámara</span>
              </>
            )}
          </button>
        </div>

        {/* Video stream container */}
        <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          {!cameraActive && (
            <div className="text-center p-6 space-y-2">
              <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Presiona &quot;Encender Cámara&quot; para escanear boletos con tu celular o tablet, o ingresa el folio abajo.
              </p>
            </div>
          )}

          {cameraActive && (
            <div className="absolute inset-0 border-2 border-dashed border-cyan-400/70 pointer-events-none rounded-2xl flex items-center justify-center">
              <span className="text-[10px] uppercase font-bold bg-slate-950/80 px-2 py-0.5 rounded text-cyan-300">
                Apunta al código QR del corredor
              </span>
            </div>
          )}
        </div>

        {/* MANUAL INPUT FALLBACK */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Búsqueda Manual por Folio o Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualFolioOrToken}
              onChange={e => setManualFolioOrToken(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleVerify(manualFolioOrToken)}
              placeholder="Ej. NNR-000001"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleVerify(manualFolioOrToken)}
              disabled={loading || !manualFolioOrToken.trim()}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-colors shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : 'Verificar'}
            </button>
          </div>
        </div>
      </div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-start gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : statusMessage.type === 'warning'
              ? 'bg-yellow-950/80 border-yellow-500 text-yellow-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : statusMessage.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>{statusMessage.text}</div>
        </div>
      )}

      {/* VERIFIED PARTICIPANT RESULT CARD */}
      {scannedParticipant && (() => {
        const isRecreativa = scannedParticipant.modality === 'Recreativa' || scannedParticipant.category?.toLowerCase().includes('recreativ');
        return (
          <div className={`border-2 rounded-3xl p-6 shadow-2xl space-y-6 transition-all duration-300 ${
            isRecreativa
              ? 'bg-[#180f08] border-amber-500 shadow-amber-950/40 glow-amber'
              : 'bg-[#0b1120] border-fuchsia-500/50 shadow-fuchsia-950/40 glow-magenta'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                  Folio Oficial
                </span>
                <div className="text-2xl font-black text-yellow-400 font-mono">
                  {scannedParticipant.folio}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                ✓ Pago Confirmado
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">Nombre del Corredor:</span>
              <h2 className="text-2xl font-black text-white uppercase mt-0.5">
                {scannedParticipant.fullName}
              </h2>
            </div>

            {/* HIGH-IMPACT FLASHING WARNING FOR RECREATIVA STAFF SAFETY */}
            {isRecreativa && (
              <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-4 text-center animate-pulse space-y-2">
                <div className="text-red-400 font-black text-sm flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>⛔ ATENCIÓN: MODALIDAD RECREATIVA ⛔</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Este participante se inscribió por <strong className="text-red-400 font-extrabold text-xs">Precio de Promoción ($250 MXN)</strong>.
                  <br />
                  <strong className="text-white font-extrabold">NO INCLUYE EL PORTAFOLIO/KIT COMPLETO DE ACCESORIOS NEÓN NI NÚMERO DE COMPETIDOR CON CHIP.</strong>
                </p>
              </div>
            )}

            {/* DUAL DIVISION ACTIONS (SÍ vs NO ENTREGAR) */}
            {isRecreativa ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SI ENTREGAR (PLAYERA) */}
                <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-400 text-center shadow-lg shadow-emerald-950/60">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">
                    🟢 SÍ ENTREGAR
                  </span>
                  <div className="text-4xl font-black text-white font-mono tracking-tight my-1">
                    TALLA {scannedParticipant.shirtSize}
                  </div>
                  <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block mt-1">
                    Playera Oficial Dry-Fit
                  </span>
                </div>

                {/* NO ENTREGAR (KIT COMPLETO) */}
                <div className="p-5 rounded-2xl bg-red-950/70 border-2 border-red-600 text-center shadow-lg shadow-red-950/60">
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest block mb-1">
                    🔴 NO ENTREGAR
                  </span>
                  <div className="text-xl font-black text-white uppercase tracking-tight my-2 leading-tight">
                    KIT COMPLETO NEÓN / NÚMERO
                  </div>
                  <span className="text-[10px] text-red-300 font-extrabold uppercase tracking-wider block mt-1">
                    Solo inscrito para 3K Libre
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* TALLA PLAYERA */}
                <div className="p-5 rounded-2xl bg-cyan-950/60 border-2 border-cyan-400 text-center glow-cyan">
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-widest block mb-1">
                    👕 PLAYERA A ENTREGAR
                  </span>
                  <div className="text-4xl font-black text-white font-mono tracking-tight my-1">
                    TALLA {scannedParticipant.shirtSize}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold block mt-1">
                    Playera Técnica Unisex Dry-Fit
                  </span>
                </div>

                {/* SÍ ENTREGAR COMPLETO */}
                <div className="p-5 rounded-2xl bg-fuchsia-950/60 border-2 border-fuchsia-400 text-center glow-magenta">
                  <span className="text-xs font-black text-fuchsia-300 uppercase tracking-widest block mb-1">
                    🎁 KIT COMPLETO NEÓN
                  </span>
                  <div className="text-xl font-black text-white uppercase tracking-tight my-2 leading-tight">
                    SÍ ENTREGAR TODO
                  </div>
                  <span className="text-[10px] text-fuchsia-400 font-semibold block mt-1">
                    Incluye Neón, Hidratación + Número
                  </span>
                </div>
              </div>
            )}

            {/* Quick runner info grid */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="col-span-2 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">Modalidad de Carrera:</span>
                  <strong className={`text-sm font-bold ${
                    isRecreativa ? 'text-fuchsia-300' : 'text-cyan-300'
                  }`}>
                    {isRecreativa ? '🌟 Carrera Recreativa 3K ($250)' : '⚡ Carrera Competitiva 6K ($350)'}
                  </strong>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                  isRecreativa
                    ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {isRecreativa ? 'Recreativo' : 'Competitivo'}
                </span>
              </div>

              {/* Inclusions checklist indicator for staff */}
              <div className={`col-span-2 p-3 rounded-xl border text-xs ${
                isRecreativa
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <span>📦 Checklist de Entrega para el Staff:</span>
                </div>
                {isRecreativa ? (
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span>✓ ENTREGAR: Playera oficial Dry-Fit</span>
                      <span className="font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30 text-white text-xs uppercase">{scannedParticipant.shirtSize}</span>
                    </div>
                    <div className="text-slate-400">
                      <span>🚫 NO ENTREGAR: Accesorios Neón luminoso (pulseras, lentes, pintura)</span>
                    </div>
                    <div className="text-slate-400">
                      <span>🚫 NO ENTREGAR: Número oficial de competidor con chip</span>
                    </div>
                    <div className="text-amber-400 font-medium pt-1 border-t border-slate-800">
                      📌 Nota: La medalla se entrega únicamente en Meta cruzando la línea de llegada.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-1 text-cyan-300 font-bold">
                      <span>✓ ENTREGAR: Playera oficial Dry-Fit</span>
                      <span className="font-mono bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30 text-white text-xs uppercase">{scannedParticipant.shirtSize}</span>
                    </div>
                    <div className="text-cyan-300">✓ ENTREGAR: Número oficial de competidor con Chip</div>
                    <div className="text-cyan-300">✓ ENTREGAR: Kit Neón oficial (accesorios neón)</div>
                    <div className="text-cyan-300">✓ ENTREGAR: Boleto para hidratación oficial</div>
                    <div className="text-fuchsia-400 font-medium pt-1 border-t border-slate-800">
                      📌 Nota: La medalla se entrega únicamente en Meta cruzando la línea de llegada.
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Categoría:</span>
                <strong className="text-white">{scannedParticipant.category}</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Edad / Rama:</span>
                <strong className="text-white">{scannedParticipant.age} años ({scannedParticipant.gender})</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Contacto de Emergencia:</span>
                <strong className="text-white">{scannedParticipant.emergencyContact}</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Tel. Emergencia:</span>
                <strong className="text-white">{scannedParticipant.emergencyPhone}</strong>
              </div>
            </div>

            {/* Deliver / Duplicate Button */}
            <div className="pt-2">
              {!alreadyDelivered ? (
                <button
                  onClick={handleDeliverKit}
                  disabled={delivering}
                  className={`w-full py-4 text-slate-950 font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl ${
                    isRecreativa
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 glow-amber'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 glow-cyan'
                  }`}
                >
                  {delivering ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-slate-950" />
                  )}
                  <span>Marcar Kit como Entregado</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-yellow-950/70 border border-yellow-500/50 text-yellow-300 rounded-xl text-xs font-bold text-center">
                    ⚠️ ESTE REGISTRO YA FUE ENTREGADO ANTERIORMENTE
                  </div>
                  <button
                    onClick={handleScanNext}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                  >
                    Escanear Siguiente Corredor
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* QUICK STATS PILL */}
      <div className="text-center text-xs text-slate-400">
        Kits entregados en esta sesión: <strong className="text-emerald-400 font-mono">{deliveredCountToday}</strong>
      </div>
    </div>
  );
}
