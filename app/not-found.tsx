import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#0b1120] border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-6xl font-black text-cyan-400 mb-2">404</h1>
        <h2 className="text-xl font-bold text-white mb-3">Página no encontrada</h2>
        <p className="text-slate-400 text-sm mb-6">
          La ruta que intentas visitar no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-wider text-xs"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
