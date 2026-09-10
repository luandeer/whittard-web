'use client';

import type { Ref } from 'react';

import { cn } from '@/lib/utils/shadcn-cn';

interface InfiniteScrollProps {
  ref?: Ref<HTMLDivElement>;
  hasMore: boolean;
  isLoadingMore: boolean;
  hasError: boolean;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * 🧱 Sentinel de scroll infinito: se monta junto al hook `useInfiniteScroll`
 * y renderiza el loader, el botón de reintento o nada cuando no hay más datos.
 */
export function InfiniteScroll({
  ref,
  hasMore,
  isLoadingMore,
  hasError,
  onRetry,
  retryLabel = 'Reintentar',
  className,
}: InfiniteScrollProps) {
  if (!hasMore) return null;

  return (
    <div ref={ref} className={cn('flex items-center justify-center gap-3 py-6', className)}>
      {isLoadingMore ? (
        <span className="border-t-brand-primary inline-block size-6 animate-spin rounded-full border-2 border-gray-200" />
      ) : hasError ? (
        <button
          type="button"
          onClick={onRetry}
          className="bg-brand-primary hover:bg-brand-primary/90 cursor-pointer px-4 py-2 text-xs font-medium text-white transition-colors"
        >
          {retryLabel}
        </button>
      ) : (
        <span className="h-1.5 w-24 animate-pulse rounded-full bg-gray-200" />
      )}
    </div>
  );
}
