'use client';

import { useMounted } from '@/lib/hooks/useMounted';
import { ProductCard } from '@/modules/products/components/ProductCard';
import type { ProductCard as CatalogProductCard } from '@/modules/products/types/catalog';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/custom-ui/carousel';
import { Heading } from '@/shared/components/custom-ui/Heading';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductCarouselProps {
  products: CatalogProductCard[];
  title?: string;
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
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
    api.on('reInit', onSelect); // Re-evalúa si cambia el tamaño de pantalla

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  // Si tu diseño requiere que las flechas aparezcan solo cuando hay suficientes productos, puedes usar esto:
  const showControls = products.length > 2;

  return (
    <section className="w-full space-y-6">
      {/* Cabecera: Título + Controles */}
      <div className="flex items-center justify-between">
        {title && (
          <Heading as="h2" variant="subheading" className="font-brand-elephant">
            {title}
          </Heading>
        )}

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
            >
              <ChevronLeft className="size-5" />
              <span className="sr-only">Anterior</span>
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
            >
              <ChevronRight className="size-5" />
              <span className="sr-only">Siguiente</span>
            </button>
          </div>
        )}
      </div>

      {/* Carrusel */}
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
        <CarouselContent className="-ml-4 sm:-ml-6 lg:-ml-12">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 pl-4 sm:basis-1/3 sm:pl-6 md:basis-1/4 lg:basis-1/5 lg:pl-12"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
