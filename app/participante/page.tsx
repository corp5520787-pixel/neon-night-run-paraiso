'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, Ticket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ConsultarFolioPage() {
  const router = useRouter();
  const [folio, setFolio] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = folio.trim();
    if (!value) return;
    router.push(`/participante/${encodeURIComponent(value)}`);
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <section className="w-full max-w-lg rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-[#101b31] via-[#0b1120] to-[#1a0b28] p-7 sm:p-10 text-center shadow-[0_0_55px_rgba(34,211,238,0.13)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-400/40 bg-fuchsia-400/10">
            <Ticket className="h-8 w-8 text-fuchsia-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Consulta tu folio</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Escribe el folio que recibiste al registrarte para consultar tu inscripción, estatus y código QR.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 text-left">
            <label htmlFor="folio" className="block text-sm font-bold text-cyan-200 mb-2">Tu folio</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="folio"
                name="folio"
                type="text"
                autoComplete="off"
                required
                value={folio}
                onChange={event => setFolio(event.target.value)}
                placeholder="Ej. NNR-000123"
                className="w-full rounded-xl border border-slate-600 bg-slate-950/80 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-6 py-4 font-black text-slate-950 hover:from-cyan-300 hover:to-fuchsia-300">
              Consultar mi inscripción <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400">
            ¿No encuentras tu folio? <Link href="https://wa.me/529931234567?text=Hola,%20necesito%20ayuda%20para%20consultar%20mi%20inscripci%C3%B3n%20en%20la%20Neon%20Night%20Run%20Para%C3%ADso" className="font-bold text-cyan-300 hover:underline">Contacta a soporte</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
