'use client';

import Link from 'next/link';

import Autoplay from 'embla-carousel-autoplay';
import { useMemo } from 'react';

import { Carousel, CarouselContent, CarouselItem } from '@/shared/components/custom-ui/carousel';
import { Container } from '@/shared/components/custom-ui/Container';
import { Heading } from '@/shared/components/custom-ui/Heading';

import type { LandingCategoryItem } from '../types/landing';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function CategoryVisual({ item }: { item: LandingCategoryItem }) {
  if (item.image_url) {
    return (
      <div
        className="size-full rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url(${item.image_url})` }}
        role="img"
        aria-label={item.name}
      />
    );
  }

  return (
    <div className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 flex size-full items-center justify-center rounded-full border">
      <span className="font-brand-elephant text-3xl">{initials(item.name)}</span>
    </div>
  );
}

interface LandingCategoriesProps {
  data: unknown;
}

/**
 * Sección 2 · Carrusel de categorías.
 *
 * Misma línea visual que el carrusel de categorías del Home: círculo con la
 * imagen (o iniciales como respaldo) + nombre, enlazando al catálogo.
 */
export function LandingCategories({ data }: LandingCategoriesProps) {
  const items = Array.isArray(data) ? (data as LandingCategoryItem[]) : [];
  const categories = items.filter((item) => Boolean(item.id && item.name && item.path));

  const autoplay = useMemo(
    () =>
      Autoplay({ delay: 4000, playOnInit: true, stopOnInteraction: false, stopOnMouseEnter: true }),
    [],
  );

  if (categories.length === 0) return null;

  return (
    <section className="py-14">
      <Container size="container" className="space-y-8">
        <Heading as="h2" variant="heading" className="font-brand-elephant">
          Categorías destacadas
        </Heading>

        <Carousel
          plugins={[autoplay]}
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4 sm:-ml-6 lg:-ml-8 xl:-ml-12">
            {categories.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-1/2 pl-4 sm:basis-1/3 sm:pl-6 md:basis-1/4 lg:basis-1/5 lg:pl-8 xl:basis-1/6 xl:pl-12"
              >
                <Link
                  href={`/catalogo/${item.path}`}
                  className="flex size-full flex-col items-center gap-3"
                >
                  <div className="inline-flex aspect-square h-full w-full">
                    <CategoryVisual item={item} />
                  </div>
                  <span className="text-brand-primary text-center text-sm font-medium underline">
                    {item.name}
                  </span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Container>
    </section>
  );
}
