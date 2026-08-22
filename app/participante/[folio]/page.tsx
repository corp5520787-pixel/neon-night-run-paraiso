'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Ticket,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  MapPin,
  Shirt,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Participant, Order } from '@/lib/types';

export default function ParticipanteTicketPage() {
  const params = useParams();
  const folio = params?.folio as string;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParticipant() {
      if (!folio) return;
      try {
        const res = await fetch(`/api/participants/${folio}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setParticipant(json.data.participant);
            setOrder(json.data.order);
          }
        }
      } catch (err) {
        console.error('Error fetching participant:', err);
      } finally {
        setLoading(false);
      }
    }
    loadParticipant();
  }, [folio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-24 px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Participante no encontrado</h2>
          <p className="text-slate-400 text-sm mb-6">El folio {folio} no está registrado en el sistema.</p>
          <Link href="/" className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isConfirmed = participant.status === 'confirmed';

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="no-print mb-6 flex justify-between items-center">
          <Link href="/" className="text-xs text-cyan-400 hover:underline">
            ← Volver al inicio
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Imprimir Boleto
          </button>
        </div>

        {/* TICKET CARD */}
        <div className="bg-[#0b1120] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-black">
            <div>
              <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block mb-1">
                Boleto Oficial de Corredor · 6 Kilómetros
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase print:text-black">
                {participant.fullName}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Folio Oficial</span>
              <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono tracking-wider print:text-black">
                {participant.folio}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-800 print:border-black">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-700 print:border-black print:bg-white">
              {participant.qrCodeDataUrl ? (
                <img
                  src={participant.qrCodeDataUrl}
                  alt={`QR Folio ${participant.folio}`}
                  className="w-44 h-44 rounded-xl bg-white p-2 border border-slate-300"
                />
              ) : (
                <div className="w-44 h-44 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400 text-center p-4">
                  Código QR pendiente
                </div>
              )}
              <span className="text-[10px] text-slate-400 mt-2 text-center uppercase font-mono">
                {participant.folio}
              </span>
            </div>

            {/* Runner Details */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Estado de Inscripción:</span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 ${
                  isConfirmed ? 'bg-emerald-950 text-emerald-400' : 'bg-yellow-950 text-yellow-400'
                }`}>
                  {isConfirmed ? '✓ Pagado y Confirmado' : 'Pendiente de Pago'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Talla de Playera:</span>
                <strong className="text-cyan-300 text-sm block font-black mt-0.5 print:text-black">
                  {participant.shirtSize} (Unisex Dry-Fit)
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Categoría:</span>
                <strong className="text-white text-sm block font-bold mt-0.5 print:text-black">
                  {participant.category}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Edad / Fecha Nacimiento:</span>
                <strong className="text-white block mt-0.5 print:text-black">
                  {participant.age} años ({participant.birthDate})
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Contacto de Emergencia:</span>
                <strong className="text-white block mt-0.5 print:text-black">
                  {participant.emergencyContact} ({participant.emergencyPhone})
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Entrega de Kit Oficial:</span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 ${
                  participant.kitDelivered ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-cyan-300'
                }`}>
                  {participant.kitDelivered ? '✓ Kit Entregado' : 'Pendiente en Parque Central'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Sábado 7 de Noviembre 2026 · 19:30 hrs · Malecón de Paraíso</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span>Módulo de Kits: Parque Central (Nov 6 y 7)</span>
            </div>
          </div>
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
