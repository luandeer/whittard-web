'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { reviewService } from '../services/review.service';
import type { ProductReview, ReviewRatingSummary } from '../types/review';

interface UseProductReviewsResult {
  reviews: ProductReview[];
  rating: ReviewRatingSummary | null;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  reload: () => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'No se pudieron cargar las reseñas.';
}

/**
 * Listado paginado de reseñas aprobadas de un producto.
 * El resumen (`rating`) y la paginación vienen siempre del backend.
 */
export function useProductReviews(productId: string): UseProductReviewsResult {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState<ReviewRatingSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(0);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const requestId = ++requestIdRef.current;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingMore(false);
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await reviewService.list(productId, { page });

        if (requestId !== requestIdRef.current) return;

        currentPageRef.current = data.pagination.current_page;
        setReviews((prev) => (append ? [...prev, ...data.items] : data.items));
        setRating(data.rating);
        setTotal(data.pagination.total);
        setHasMore(data.pagination.current_page < data.pagination.last_page);
      } catch (caught) {
        if (requestId !== requestIdRef.current) return;
        setError(getErrorMessage(caught));
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [productId],
  );

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    reviewService
      .list(productId, { page: 1 })
      .then((data) => {
        if (requestId !== requestIdRef.current) return;

        currentPageRef.current = data.pagination.current_page;
        setReviews(data.items);
        setRating(data.rating);
        setTotal(data.pagination.total);
        setHasMore(data.pagination.current_page < data.pagination.last_page);
      })
      .catch((caught) => {
        if (requestId === requestIdRef.current) {
          setError(getErrorMessage(caught));
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [productId]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    void fetchPage(currentPageRef.current + 1, true);
  }, [fetchPage, hasMore, isLoadingMore]);

  const reload = useCallback(() => {
    void fetchPage(1, false);
  }, [fetchPage]);

  return {
    reviews,
    rating,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    reload,
  };
}
