'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Container } from '@/shared/components/custom-ui/Container';

import { MegaMenuDesktop } from './desktop/MegaMenuDesktop';
import type { MegaMenuRoot } from './types/megamenu.types';
import { hasMegamenuContent } from './utils/megamenu';

interface CategoryNavigationProps {
  categories: MegaMenuRoot[];
}

export function CategoryNavigation({ categories }: CategoryNavigationProps) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const openCategory = openSlug
    ? categories.find((category) => category.slug === openSlug)
    : undefined;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleCloseMenu = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenSlug(null);
      closeTimerRef.current = null;
    }, 120);
  }, [clearCloseTimer]);

  const openMenuNow = useCallback(
    (category: MegaMenuRoot) => {
      clearCloseTimer();
      if (hasMegamenuContent(category)) setOpenSlug(category.slug);
    },
    [clearCloseTimer],
  );

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpenSlug(null);
  }, [clearCloseTimer]);

  const handleNavigate = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearCloseTimer();
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeMenu, clearCloseTimer]);

  if (categories.length === 0) return null;

  return (
    <div ref={navRef} className="relative z-30 hidden lg:block" onMouseLeave={scheduleCloseMenu}>
      <Container
        as="nav"
        size="full"
        aria-label="Navegación de categorías"
        className="bg-brand-primary"
      >
        <div className="flex h-10 items-center justify-center overflow-x-auto text-sm font-medium">
          <ul className="text-brand-white flex h-full items-center whitespace-nowrap">
            {categories.map((category) => {
              const isOpen = openSlug === category.slug;

              return (
                <li key={category.id} className="relative h-full">
                  <div
                    className={cn(
                      'flex h-full items-stretch border-b-2 transition-colors',
                      isOpen ? 'border-brand-white' : 'border-transparent',
                    )}
                  >
                    <Link
                      href={category.url}
                      onClick={handleNavigate}
                      onMouseEnter={() => openMenuNow(category)}
                      onFocus={() => openMenuNow(category)}
                      className="hover:text-brand-white relative inline-flex items-center px-6 transition-colors"
                    >
                      {category.name}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>

      {openCategory ? (
        <div
          id={`megamenu-${openCategory.slug}`}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleCloseMenu}
        >
          <MegaMenuDesktop root={openCategory} onNavigate={handleNavigate} />
        </div>
      ) : null}
    </div>
  );
}
