'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Order } from '@/lib/types';

export default function PagoSimuladoPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data) setOrder(data.data);
        }
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleSimulateAction = async (action: 'approve' | 'reject' | 'pending') => {
    setProcessing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/mercadopago/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'approve') {
          router.push(`/confirmacion/${orderId}?status=approved`);
        } else if (action === 'reject') {
          router.push(`/confirmacion/${orderId}?status=rejected`);
        } else {
          router.push(`/confirmacion/${orderId}?status=pending`);
        }
      } else {
        setActionMessage(data.error || 'Error al simular pago');
        setProcessing(false);
      }
    } catch {
      setActionMessage('Error de comunicación con el simulador');
      setProcessing(false);
    }
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
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Orden no encontrada</h2>
          <p className="text-slate-400 text-sm mb-6">El identificador de orden no existe o ha expirado.</p>
          <a href="/registro" className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl">
            Volver al registro
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-12">
        {/* Environment banner */}
        <div className="bg-yellow-950/80 border border-yellow-500/50 rounded-2xl p-4 mb-8 text-yellow-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Simulador de Mercado Pago (Entorno de Desarrollo)</strong>
            Esta pantalla te permite probar las respuestas de pago de forma segura en local sin hacer cargos reales a tarjetas bancarias.
          </div>
        </div>

        {/* Mock Checkout Window */}
        <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                MP
              </div>
              <div>
                <h1 className="font-bold text-white text-base">Mercado Pago Checkout Pro</h1>
                <span className="text-xs text-cyan-400 font-mono">Modo Sandbox / Prueba</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Total a pagar</div>
              <div className="text-2xl font-black text-cyan-300 font-mono">${order.totalAmount} MXN</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="py-6 space-y-3 text-xs text-slate-300 border-b border-slate-800">
            <div className="flex justify-between">
              <span>Orden:</span>
              <strong className="text-white font-mono">{order.orderNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>Concepto:</span>
              <span className="text-white">{order.stageName} ({order.participantsCount} corredor/es)</span>
            </div>
            <div className="flex justify-between">
              <span>Titular:</span>
              <span className="text-white">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Email de confirmación:</span>
              <span className="text-white">{order.customerEmail}</span>
            </div>
          </div>

          {/* Action Simulator Controls */}
          <div className="py-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Selecciona el resultado a simular:
            </label>

            {/* Approve Button */}
            <button
              onClick={() => handleSimulateAction('approve')}
              disabled={processing}
              className="w-full p-4 bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/80 rounded-2xl text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="font-black text-sm text-emerald-300">Simular Pago Aprobado</div>
                  <div className="text-[11px] text-slate-400">Genera folios oficiales, códigos QR y confirmación inmediata.</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Pending Button */}
            <button
              onClick={() => handleSimulateAction('pending')}
              disabled={processing}
              className="w-full p-4 bg-yellow-950/60 border border-yellow-500/50 hover:bg-yellow-900/80 rounded-2xl text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="font-black text-sm text-yellow-300">Simular Pago Pendiente (OXXO / SPEI en proceso)</div>
                  <div className="text-[11px] text-slate-400">Marca la orden como pendiente de acreditación.</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Reject Button */}
            <button
              onClick={() => handleSimulateAction('reject')}
              disabled={processing}
              className="w-full p-4 bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900/80 rounded-2xl text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-400" />
                <div>
                  <div className="font-black text-sm text-rose-300">Simular Pago Rechazado</div>
                  <div className="text-[11px] text-slate-400">Fondos insuficientes o tarjeta declinada.</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {actionMessage && (
            <div className="p-3 bg-rose-950 border border-rose-500 rounded-xl text-rose-300 text-xs">
              {actionMessage}
            </div>
          )}

          <div className="pt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            Simulador exclusivo para desarrollo y validación local
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
