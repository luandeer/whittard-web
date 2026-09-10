'use client';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Heading } from '@/shared/components/custom-ui/Heading';
import { Button } from '@/shared/components/shadcn-ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/shadcn-ui/dialog';
import { Skeleton } from '@/shared/components/shadcn-ui/skeleton';
import Link from 'next/link';
import { useState } from 'react';

import { useProductReviews } from '../hooks/useProductReviews';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { ReviewsSummary } from './ReviewsSummary';

interface ReviewsSectionProps {
  productId: string;
  productSlug: string;
  className?: string;
}

function ReviewsLoading() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <Skeleton className="h-56 rounded-xl" />
      </aside>
      <div className="flex flex-col gap-6 lg:col-span-8">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 border-b border-gray-100 pb-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsSection({ productId, productSlug, className }: ReviewsSectionProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { reviews, rating, total, hasMore, isLoading, isLoadingMore, error, loadMore, reload } =
    useProductReviews(productId);

  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const loginHref = `/login?redirect=${encodeURIComponent(`/producto/${productSlug}`)}`;

  const handleCreated = () => {
    setIsComposerOpen(false);
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className={cn('flex scroll-mt-24 flex-col gap-8', className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading as="h2" variant="subheading" id="reviews-title" className="font-brand-elephant">
            Reseñas de clientes
          </Heading>
          {total > 0 && <p className="text-sm text-gray-500">{total} reseñas publicadas</p>}
        </div>

        {isAuthenticated && (
          <Button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="h-10 cursor-pointer rounded-md px-5 text-xs font-semibold tracking-widest uppercase"
          >
            Escribir reseña
          </Button>
        )}
      </div>

      <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto bg-transparent p-0 shadow-none ring-0 sm:max-w-xl"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">Escribe tu reseña</DialogTitle>
          <ReviewForm
            productId={productId}
            onCreated={handleCreated}
            onCancel={() => setIsComposerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <ReviewsLoading />
      ) : error && reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/70 px-8 py-12 text-center">
          <p className="text-brand-secondary text-sm">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={reload}
            className="cursor-pointer rounded-md"
          >
            Reintentar
          </Button>
        </div>
      ) : rating && rating.count > 0 ? (
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <ReviewsSummary rating={rating} />
            </div>
          </aside>

          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs">
              {reviews.map((review) => (
                <div key={review.id} className="px-5 py-5 sm:px-6 sm:py-6">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>

            {error && reviews.length > 0 && <p className="text-destructive text-xs">{error}</p>}

            {hasMore && (
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="mx-auto cursor-pointer rounded-md px-8"
              >
                {isLoadingMore ? 'Cargando...' : 'Ver más reseñas'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-8 py-14 text-center">
          <p className="text-brand-primary text-base font-semibold">
            Aún no hay reseñas para este producto
          </p>
          {isAuthenticated ? (
            <p className="text-brand-secondary text-sm">
              Sé el primero en compartir tu experiencia.
            </p>
          ) : null}
        </div>
      )}

      {!isAuthenticated && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/70 px-6 py-6 sm:flex-row">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p className="text-brand-primary text-base font-semibold">¿Probaste este producto?</p>
            <p className="text-brand-secondary text-sm">
              Inicia sesión para escribir una reseña y ayudar a otros clientes.
            </p>
          </div>
          <Button variant="outline" className="cursor-pointer rounded-md" asChild>
            <Link href={loginHref}>Iniciar sesión</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
