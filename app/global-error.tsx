'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-[#060913] text-white flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full bg-[#0b1120] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Error del Sistema</h2>
          <p className="text-slate-400 text-sm mb-6">
            Ocurrió un error global en la aplicación.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-wider text-xs"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
