'use client';

import React, { useState, useEffect } from 'react';
import { Sponsor } from '@/lib/types';

interface SponsorSliderProps {
  initialSponsors?: Sponsor[];
}

export default function SponsorSlider({ initialSponsors = [] }: SponsorSliderProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const res = await fetch('/api/sponsors?active=true');
        if (res.ok) {
          const data = await res.json();
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            setSponsors(data.data);
          }
        }
      } catch (err) {
        console.error('Error loading sponsors for slider:', err);
      }
    };

    loadSponsors();
  }, []);

  const activeSponsors = sponsors.filter(s => s.active !== false);

  if (activeSponsors.length === 0) {
    return null;
  }

  // Duplicate elements multiple times to achieve 100% gapless continuous marquee loop
  const duplicatedSponsors = [
    ...activeSponsors,
    ...activeSponsors,
    ...activeSponsors,
    ...activeSponsors,
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-[#060913] via-[#080d1a] to-[#060913] border-y border-slate-800/80 overflow-hidden">
      {/* Dynamic ambient backlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-64 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-64 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 relative z-10">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
          PATROCINADORES OFICIALES:
        </h3>
      </div>

      {/* INFINITE CAROUSEL CONTAINER */}
      <div className="relative w-full overflow-hidden py-4 select-none">
        {/* Soft edge gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-[#060913] via-[#060913]/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-[#060913] via-[#060913]/90 to-transparent z-20 pointer-events-none" />

        {/* Continuous Track */}
        <div
          className="flex items-center gap-4 sm:gap-6 w-max will-change-transform animate-sponsor-marquee py-2"
        >
          {duplicatedSponsors.map((sp, idx) => {
            const cardInner = (
              <div className="w-52 h-28 sm:w-64 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/60 hover:border-cyan-400 bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105 group relative cursor-pointer">
                {/* Image fills 100% of the rounded box edge-to-edge */}
                {sp.logoUrl ? (
                  <img
                    src={sp.logoUrl}
                    alt={sp.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-slate-800 text-slate-200 font-bold text-sm sm:text-base text-center">
                    {sp.name}
                  </div>
                )}
              </div>
            );

            return sp.websiteUrl ? (
              <a
                key={`${sp.id}-${idx}`}
                href={sp.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block outline-none cursor-pointer"
                title={sp.name}
              >
                {cardInner}
              </a>
            ) : (
              <div key={`${sp.id}-${idx}`} className="block">
                {cardInner}
              </div>
            );
          })}
        </div>
      </div>

      {/* SMOOTH KEYFRAMES WITH HARDWARE ACCELERATION */}
      <style jsx global>{`
        @keyframes sponsorMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-sponsor-marquee {
          animation: sponsorMarquee 35s linear infinite;
        }
        .animate-sponsor-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

