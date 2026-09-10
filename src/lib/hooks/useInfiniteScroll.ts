'use client';

import { useCallback, useRef, useState } from 'react';

import { useIntersectionObserver } from './useIntersectionObserver';

export interface InfiniteScrollPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type FetchNextPage<T> = (cursor: string | null) => Promise<InfiniteScrollPage<T>>;

interface UseInfiniteScrollOptions<T> {
  initialItems: T[];
  initialCursor: string | null;
  initialHasMore: boolean;
  fetchNextPage: FetchNextPage<T>;
  rootMargin?: string;
  threshold?: number | number[];
  onError?: (error: unknown) => void;
}

export function useInfiniteScroll<T>({
  initialItems,
  initialCursor,
  initialHasMore,
  fetchNextPage,
  rootMargin = '200px',
  threshold = 0,
  onError,
}: UseInfiniteScrollOptions<T>) {
  const initialStateRef = useRef({ initialItems, initialCursor, initialHasMore });
  const [items, setItems] = useState<T[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setHasError(false);
    try {
      const page = await fetchNextPage(cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (error) {
      setHasError(true);
      onError?.(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, fetchNextPage, hasMore, isLoadingMore, onError]);

  const reset = useCallback(() => {
    const {
      initialItems: initial,
      initialCursor: cursorToRestore,
      initialHasMore: moreToRestore,
    } = initialStateRef.current;
    setItems(initial);
    setCursor(cursorToRestore);
    setHasMore(moreToRestore);
    setIsLoadingMore(false);
    setHasError(false);
  }, []);

  const sentinelRef = useIntersectionObserver<HTMLDivElement>(
    () => {
      void loadMore();
    },
    { rootMargin, threshold, enabled: hasMore && !isLoadingMore && !hasError },
  );

  return {
    items,
    nextCursor: cursor,
    hasMore,
    isLoadingMore,
    hasError,
    sentinelRef,
    loadMore,
    reset,
  };
}
