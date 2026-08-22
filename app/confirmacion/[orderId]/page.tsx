'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Building2,
  ArrowRight,
  Shirt,
  User,
  Loader2,
} from 'lucide-react';
import { Order, Participant } from '@/lib/types';

function ConfirmacionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;
  const statusParam = searchParams.get('status');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setOrder(json.data);
            if (json.data.paymentStatus === 'approved' || statusParam === 'approved') {
              // Trigger confetti celebration
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00f3ff', '#ff007f', '#facc15', '#2563eb'],
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, statusParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-24 px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Orden no encontrada</h2>
          <p className="text-slate-400 text-sm mb-6">El folio de la orden no existe o ha expirado.</p>
          <Link href="/" className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isApproved = order.paymentStatus === 'approved' || statusParam === 'approved';
  const isPendingTransfer = order.paymentMethod === 'transfer' && order.paymentStatus === 'pending';
  const isRejected = order.paymentStatus === 'rejected' || statusParam === 'rejected';

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Status Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          {isApproved ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto mb-4 glow-cyan">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                ¡Inscripción 100% Confirmada!
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight mt-3 mb-2">
                ¡NOS VEMOS EN LA META NEÓN!
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Orden: <strong className="text-cyan-300 font-mono">{order.orderNumber}</strong>. Presenta tus códigos QR para recoger tus kits oficiales.
              </p>
            </>
          ) : isPendingTransfer ? (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-950/80 border border-yellow-500/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest bg-yellow-950/80 px-3 py-1 rounded-full border border-yellow-500/30">
                Pendiente de Revisión Bancaria
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-3 mb-2">
                TRANSFERENCIA EN PROCESO
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Tu lugar está apartado. Una vez que el administrador verifique el depósito SPEI (menos de 24 hrs), tus códigos QR se activarán automáticamente.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-rose-400" />
              </div>
              <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-rose-950/80 px-3 py-1 rounded-full border border-rose-500/30">
                Pago no completado
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-3 mb-2">
                ESTADO DEL PAGO: {order.paymentStatus.toUpperCase()}
              </h1>
              <p className="text-slate-300 text-sm">
                Puedes reintentar el pago o contactarnos por WhatsApp para asistencia.
              </p>
            </>
          )}
        </div>

        {/* Print / Action Toolbar (hidden during print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-[#0b1120] border border-slate-800 rounded-2xl p-4 mb-8">
          <div className="text-xs text-slate-400">
            Total pagado: <strong className="text-cyan-300 font-mono text-sm">${order.totalAmount} MXN</strong> ({order.participantsCount} corredor/es)
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              Imprimir Boletos / QR
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold rounded-xl transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* INDIVIDUAL PARTICIPANT TICKETS WITH QR */}
        <div className="space-y-8">
          {order.participants?.map((p, idx) => (
            <div
              key={p.id || idx}
              className="bg-[#0b1120] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black"
            >
              {/* Glowing decorative background watermark */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Ticket Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-black">
                <div>
                  <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block mb-1">
                    Boleto Oficial de Corredor · 6 Kilómetros
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase print:text-black">
                    {p.fullName}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Folio Oficial</span>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono tracking-wider print:text-black">
                    {p.folio}
                  </div>
                </div>
              </div>

              {/* Ticket Body: QR & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-800 print:border-black">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-700 print:border-black print:bg-white">
                  {p.qrCodeDataUrl ? (
                    <img
                      src={p.qrCodeDataUrl}
                      alt={`QR Folio ${p.folio}`}
                      className="w-44 h-44 rounded-xl bg-white p-2 border border-slate-300"
                    />
                  ) : (
                    <div className="w-44 h-44 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400 text-center p-4">
                      Código QR se activará al confirmar pago
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 mt-2 text-center uppercase font-mono">
                    Token: {p.qrToken.substring(0, 18)}...
                  </span>
                </div>

                {/* Runner Details */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Categoría:</span>
                    <strong className="text-white text-sm block font-bold mt-0.5 print:text-black">{p.category}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Talla de Playera:</span>
                    <strong className="text-cyan-300 text-sm block font-black mt-0.5 print:text-black">
                      {p.shirtSize} (Unisex Dry-Fit)
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Edad / Fecha Nacimiento:</span>
                    <strong className="text-white block mt-0.5 print:text-black">
                      {p.age} años ({p.birthDate})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Club / Equipo:</span>
                    <strong className="text-white block mt-0.5 print:text-black">
                      {p.clubOrTeam || 'Independiente'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Contacto de Emergencia:</span>
                    <strong className="text-white block mt-0.5 print:text-black">
                      {p.emergencyContact} ({p.emergencyPhone})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Estado del Kit:</span>
                    <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 ${
                      p.kitDelivered ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-cyan-300'
                    }`}>
                      {p.kitDelivered ? '✓ Kit Entregado' : 'Pendiente de entrega en parque'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup info footer */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Sábado 7 de Noviembre 2026 · 19:30 hrs · Malecón de Paraíso</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <span>Kits: Explanada del Parque Central (Nov 6 y 7)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BANK TRANSFER INSTRUCTIONS IF PENDING */}
        {isPendingTransfer && (
          <div className="mt-8 bg-slate-900 border border-yellow-500/40 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-yellow-400" />
              Instrucciones para completar tu Pago SPEI
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Transfiere el monto exacto de <strong className="text-yellow-400 font-mono text-base">${order.totalAmount} MXN</strong> dentro de las próximas 24 horas usando los siguientes datos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Banco Destino:</span>
                <strong className="text-white text-sm">BBVA México</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Beneficiario:</span>
                <strong className="text-white text-sm">Neon Night Run Producciones S.A. de C.V.</strong>
              </div>
              <div>
                <span className="text-slate-400 block">CLABE Interbancaria:</span>
                <strong className="text-cyan-300 font-mono text-sm">012790001234567890</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Concepto de Pago (Indispensable):</span>
                <strong className="text-yellow-400 font-mono text-sm">{order.orderNumber}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Una vez realizada tu transferencia, el administrador cotejará el folio de la orden con el estado de cuenta y recibirás tu confirmación activa por correo electrónico.
            </p>
          </div>
        )}
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
          <div className="text-cyan-400 font-bold flex items-center gap-2">
            <span>Cargando confirmación y boletos oficiales...</span>
          </div>
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  );
}
