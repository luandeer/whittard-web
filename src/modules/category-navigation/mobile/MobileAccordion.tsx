'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/shadcn-ui/accordion';

import type { MegaMenuRoot } from '../types/megamenu.types';

interface MobileAccordionProps {
  categories: MegaMenuRoot[];
  onNavigate?: () => void;
}

function LinkRow({
  href,
  label,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'block py-2 text-[15px] text-slate-600 transition-colors hover:text-slate-900',
        className,
      )}
    >
      {label}
    </Link>
  );
}

function MegaMenuContent({ root, onNavigate }: { root: MegaMenuRoot; onNavigate?: () => void }) {
  const sections = root.sections.filter((section) => section.items.length > 0);

  return (
    <div className="space-y-5 pb-2">
      <LinkRow
        href={root.url}
        label="Ver todo"
        onNavigate={onNavigate}
        className="font-medium text-slate-800"
      />

      {sections.map((section, index) => (
        <div key={section.id ?? `${section.title}-${index}`}>
          {section.title ? (
            <p className="text-[0.7rem] font-semibold tracking-widest text-slate-400 uppercase">
              {section.title}
            </p>
          ) : null}
          <ul className="mt-1 space-y-0.5">
            {section.items.map((item) => (
              <li key={item.id ?? `${item.type}-${item.url}`}>
                <LinkRow href={item.url} label={item.label} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function MobileAccordion({ categories, onNavigate }: MobileAccordionProps) {
  return (
    <Accordion type="multiple" className="px-4">
      {categories.map((category) => {
        const openable = category.sections.some((section) => section.items.length > 0);

        if (!openable) {
          return (
            <LinkRow
              key={category.id}
              href={category.url}
              label={category.name}
              onNavigate={onNavigate}
              className="py-3 font-medium text-slate-800"
            />
          );
        }

        return (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="py-3 text-base font-medium text-slate-800">
              {category.name}
            </AccordionTrigger>
            <AccordionContent>
              <MegaMenuContent root={category} onNavigate={onNavigate} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
