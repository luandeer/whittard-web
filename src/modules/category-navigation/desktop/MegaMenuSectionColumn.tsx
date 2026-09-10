'use client';

import { NavigationLink } from '../shared/NavigationLink';
import type { MegaMenuSection } from '../types/megamenu.types';

interface MegaMenuSectionColumnProps {
  section: MegaMenuSection;
  onNavigate?: () => void;
}

export function MegaMenuSectionColumn({ section, onNavigate }: MegaMenuSectionColumnProps) {
  return (
    <div>
      {section.title ? (
        <h3 className="text-[0.72rem] font-semibold tracking-widest text-slate-400 uppercase">
          {section.title}
        </h3>
      ) : null}
      <ul className={section.title ? 'mt-4 space-y-3' : 'space-y-3'}>
        {section.items.map((item) => (
          <li key={item.id ?? `${item.type}-${item.url}`}>
            <NavigationLink href={item.url} onNavigate={onNavigate}>
              {item.label}
            </NavigationLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
