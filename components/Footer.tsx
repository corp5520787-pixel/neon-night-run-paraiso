'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Mail, Phone, ShieldCheck, FileText, Lock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState<'privacy' | 'waiver' | null>(null);

  return (
    <footer className="bg-[#04060d] border-t border-slate-800 text-slate-400 pt-16 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center p-0.5 glow-cyan">
                <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="font-black text-lg text-white">NEON NIGHT RUN</div>
                <div className="text-xs font-semibold text-fuchsia-400">PARAÍSO, TABASCO</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La fiesta deportiva nocturna más electrizante de Tabasco. 6 kilómetros de música, luz negra, polvos neón y energía inolvidable.
            </p>
            <div className="text-xs text-slate-500">
              Sábado 7 de Noviembre de 2026 · 19:30 hrs
            </div>
          </div>

          {/* Col 2: Enlaces Rápidos */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-400 pl-2">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/registro" className="hover:text-cyan-400 transition-colors">
                  Inscripción en Línea
                </Link>
              </li>
              <li>
                <Link href="/#kit" className="hover:text-cyan-400 transition-colors">
                  Contenido del Kit Oficial
                </Link>
              </li>
              <li>
                <Link href="/#etapas" className="hover:text-cyan-400 transition-colors">
                  Fases de Precio y Cupo
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-cyan-400 transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Portal de Administrador
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal y Documentos */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-fuchsia-400 pl-2">
              Legal y Seguridad
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setModalOpen('waiver')}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
                  Carta Responsiva y Exoneración
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalOpen('privacy')}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Aviso de Privacidad
                </button>
              </li>
              <li>
                <span className="text-xs text-slate-500 block pt-1">
                  Pagos procesados de forma segura con encriptación SSL y Mercado Pago Checkout Pro.
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-yellow-400 pl-2">
              Contacto y Soporte
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/529331134405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors font-semibold"
                >
                  WhatsApp: 9331134405
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Neon Night Run Paraíso. Todos los derechos reservados. Evento deportivo y recreativo.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Certificación de Seguridad 6K
            </span>
          </div>
        </div>
      </div>

      {/* Modal for Privacy or Waiver */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-slate-300 relative shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {modalOpen === 'privacy' ? <Lock className="w-5 h-5 text-cyan-400" /> : <FileText className="w-5 h-5 text-fuchsia-400" />}
                {modalOpen === 'privacy' ? 'Aviso de Privacidad y Tratamiento de Datos' : 'Carta de Exoneración y Responsiva'}
              </h3>
              <button
                onClick={() => setModalOpen(null)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm leading-relaxed text-slate-300">
              {modalOpen === 'privacy' ? (
                <>
                  <p>
                    <strong>Identidad del Responsable:</strong> El Comité Organizador de Neon Night Run Paraíso 2026 es el responsable del tratamiento y resguardo de sus datos personales.
                  </p>
                  <p>
                    <strong>Finalidades Primarias:</strong> Los datos personales solicitados (nombre, fecha de nacimiento, correo, teléfono, talla de playera y contacto de emergencia) serán utilizados exclusivamente para:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>Gestionar su registro, folio y código QR oficial para la carrera.</li>
                    <li>Asignar la talla correcta de la playera técnica conmemorativa.</li>
                    <li>Contar con información médica y de contacto inmediato ante cualquier eventualidad durante la ruta.</li>
                    <li>Envío de confirmaciones transaccionales y logística de entrega de kits.</li>
                  </ul>
                  <p>
                    <strong>Protección Financiera:</strong> Este sitio no procesa ni almacena información bancaria ni números de tarjeta de crédito/débito. Las transacciones se realizan bajo los estándares de seguridad de Mercado Pago Checkout Pro.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Declaración del Participante:</strong> Manifiesto bajo protesta de decir verdad que me encuentro en condiciones físicas y de salud óptimas para participar en la carrera recreativa y competitiva <em>Neon Night Run Paraíso 6K</em> a celebrarse el sábado 7 de noviembre de 2026.
                  </p>
                  <p>
                    <strong>Asunción de Riesgos:</strong> Reconozco voluntariamente los riesgos inherentes a una actividad atlética nocturna (tropezones, fatiga muscular, deshidratación) y libero al Comité Organizador, patrocinadores, autoridades municipales y staff de cualquier responsabilidad médica derivada de condiciones preexistentes.
                  </p>
                  <p>
                    <strong>Derechos de Imagen:</strong> Autorizo de manera no exclusiva el uso de fotografías y grabaciones de video en las que aparezca dentro del marco del evento para fines conmemorativos y de difusión deportiva sin fines de lucro.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setModalOpen(null)}
                className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400 transition-colors"
              >
                Entendido y de acuerdo
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
