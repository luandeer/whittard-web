'use client';

import { MenuIcon } from 'lucide-react';

import { Button } from '@/shared/components/shadcn-ui/button';
import { ScrollArea } from '@/shared/components/shadcn-ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/shadcn-ui/sheet';

import type { MegaMenuRoot } from '../types/megamenu.types';
import { MobileAccordion } from './MobileAccordion';

interface MobileNavigationProps {
  categories: MegaMenuRoot[];
}

export function MobileNavigation({ categories }: MobileNavigationProps) {
  if (categories.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-brand-white hover:bg-transparent hover:text-white lg:hidden"
          aria-label="Abrir menú de navegación"
        >
          <MenuIcon strokeWidth={1.5} className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full max-w-sm p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left text-base">Categorías</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <MobileAccordion
            categories={categories}
            onNavigate={() => {
              const closeButton = document.querySelector('[data-slot="sheet-close"]');
              if (closeButton instanceof HTMLElement) closeButton.click();
            }}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
