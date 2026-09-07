import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neon Night Run Paraíso 2026 - Carrera Nocturna 6K',
  description: 'Inscripciones abiertas para la carrera nocturna más vibrante de Tabasco. 6K con luces neón, música DJ en vivo, kit completo y premios en especie.',
  openGraph: {
    title: 'Neon Night Run Paraíso 2026 - Carrera Nocturna 6K',
    description: 'Inscripciones abiertas para la carrera nocturna más vibrante de Tabasco. 6K con luces neón, música DJ en vivo, kit completo y premios en especie.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="bg-[#060913] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}

