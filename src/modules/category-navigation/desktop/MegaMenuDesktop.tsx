'use client';

import { Container } from '@/shared/components/custom-ui/Container';

import type { MegaMenuRoot } from '../types/megamenu.types';
import { MegaMenuLandingColumn } from './MegaMenuLandingColumn';
import { MegaMenuSectionColumn } from './MegaMenuSectionColumn';

interface MegaMenuDesktopProps {
  root: MegaMenuRoot;
  onNavigate?: () => void;
}

const PANEL_CLASS =
  'absolute top-full left-0 w-full border-b border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]';

function MegaMenuPanel({ root, onNavigate }: { root: MegaMenuRoot; onNavigate?: () => void }) {
  const sections = root.sections.filter((section) => section.items.length > 0);
  if (sections.length === 0 && !root.landing) return null;

  return (
    <div className={PANEL_CLASS}>
      <Container size="container" className="px-4 py-10">
        <div className="mx-auto flex w-full max-w-5xl items-start justify-center gap-12">
          {sections.length > 0 ? (
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-10 gap-y-8">
                {sections.map((section) => (
                  <MegaMenuSectionColumn
                    key={section.id ?? section.title}
                    section={section}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {root.landing ? (
            <MegaMenuLandingColumn landing={root.landing} onNavigate={onNavigate} />
          ) : null}
        </div>
      </Container>
    </div>
  );
}

export function MegaMenuDesktop({ root, onNavigate }: MegaMenuDesktopProps) {
  return <MegaMenuPanel root={root} onNavigate={onNavigate} />;
}
