'use client';

import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useMounted } from '@/lib/hooks/useMounted';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/custom-ui/carousel';
import { Container } from '@/shared/components/custom-ui/Container';
import { Heading } from '@/shared/components/custom-ui/Heading';

import type { LandingCard } from '../types/landing';

interface LandingCardCarouselProps {
  data: unknown;
}

function toCards(value: unknown): LandingCard[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();

  return (value as LandingCard[])
    .filter((card) => Boolean(card.id && card.title && card.url))
    .filter((card) => (seen.has(card.id) ? false : (seen.add(card.id), true)));
}

/**
 * Sección 4 · Carrusel de landings destacadas.
 *
 * Nuevo componente: muestra otras landings con su miniatura y su nombre,
 * enlazando a la landing correspondiente.
 */
export function LandingCardCarousel({ data }: LandingCardCarouselProps) {
  const cards = toCards(data);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const isMounted = useMounted();

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };

    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  if (cards.length === 0) return null;

  const showControls = cards.length > 2;

  return (
    <section className="py-14">
      <Container size="container" className="space-y-8">
        <div className="flex items-center justify-between">
          <Heading as="h2" variant="heading" className="font-brand-elephant">
            Landings destacadas
          </Heading>

          {showControls && isMounted && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                disabled={!canPrev}
                className={`rounded-full border border-gray-200 bg-white p-2 shadow-xs transition-all ${
                  canPrev
                    ? 'cursor-pointer text-gray-800 hover:bg-gray-50 active:scale-95'
                    : 'cursor-not-allowed text-gray-300 opacity-50'
                }`}
                aria-label="Anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                disabled={!canNext}
                className={`rounded-full border border-gray-200 bg-white p-2 shadow-xs transition-all ${
                  canNext
                    ? 'cursor-pointer text-gray-800 hover:bg-gray-50 active:scale-95'
                    : 'cursor-not-allowed text-gray-300 opacity-50'
                }`}
                aria-label="Siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: false,
            duration: 20,
            watchSlides: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 sm:-ml-6 lg:-ml-8">
            {cards.map((card) => (
              <CarouselItem
                key={card.id}
                className="basis-1/2 pl-4 sm:basis-1/3 sm:pl-6 md:basis-1/4 lg:basis-1/5 lg:pl-8"
              >
                <Link
                  href={card.url}
                  className="group bg-brand-primary relative flex h-56 w-full overflow-hidden rounded-md"
                >
                  {card.thumbnail_url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${card.thumbnail_url})` }}
                      aria-hidden
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/35" aria-hidden />
                  <span className="font-brand-elephant text-brand-white relative mt-auto block p-4 text-lg leading-snug">
                    {card.title}
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
