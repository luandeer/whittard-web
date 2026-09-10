'use client';

import Link from 'next/link';

import type { MegaMenuLanding } from '../types/megamenu.types';

interface MegaMenuLandingColumnProps {
  landing: MegaMenuLanding;
  onNavigate?: () => void;
}

/**
 * Última columna del panel del mega menú: muestra la landing de la categoría
 * (miniatura + nombre) cuando existe una publicada. Al hacer clic lleva a la
 * landing.
 */
export function MegaMenuLandingColumn({ landing, onNavigate }: MegaMenuLandingColumnProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col">
      <h3 className="text-[0.72rem] font-semibold tracking-widest text-slate-400 uppercase">
        Destacado
      </h3>

      <Link
        href={landing.url}
        onClick={onNavigate}
        className="group mt-4 flex flex-col gap-3"
        aria-label={`Ver ${landing.title}`}
      >
        <div className="bg-brand-primary relative aspect-[4/3] w-full overflow-hidden rounded-md">
          {landing.thumbnail_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${landing.thumbnail_url})` }}
              aria-hidden
            />
          ) : null}
          <div className="absolute inset-0 bg-black/30" aria-hidden />
          <span className="font-brand-elephant text-brand-white relative mt-auto block p-3 text-sm leading-snug">
            {landing.title}
          </span>
        </div>

        <span className="text-brand-primary text-xs font-semibold underline underline-offset-4">
          Ver la landing
        </span>
      </Link>
    </aside>
  );
}
