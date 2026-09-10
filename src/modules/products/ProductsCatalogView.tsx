'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { ProductCard } from '@/modules/products/components/ProductCard';
import type { CatalogQueryParams } from '@/modules/products/repository/types';
import { getClientCatalogRepository } from '@/modules/products/services/client-catalog';
import type {
  CatalogFilters,
  ProductCard as CatalogProductCard,
  CategoryPath,
  Pagination,
} from '@/modules/products/types/catalog';
import {
  buildActiveFilters,
  type ActiveFilter,
  type FilterKey,
} from '@/modules/products/utils/catalog-filters';
import {
  buildCatalogQueryString,
  parseCatalogSearchParams,
} from '@/modules/products/utils/catalog-query';
import { Container } from '@/shared/components/custom-ui/Container';
import { InfiniteScroll } from '@/shared/components/custom-ui/InfiniteScroll';
import { PageBreadcrumb } from '@/shared/components/custom-ui/PageBreadcrumb';
import { PageHeroBanner } from '@/shared/components/custom-ui/PageHeroBanner';
import { CatalogSidebar } from './components/catalog/CatalogSidebar';
import { ProductCardSkeleton } from './components/catalog/CatalogSkeleton';

interface ProductsCatalogViewProps {
  slug: string[];
  category: CategoryPath | null;
  products: CatalogProductCard[];
  pagination: Pagination;
  filters: CatalogFilters;
}

export function ProductsCatalogView({
  slug,
  category,
  products,
  pagination,
  filters,
}: ProductsCatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = parseCatalogSearchParams(Object.fromEntries(searchParams.entries()));

  const [isNavigating, setIsNavigating] = useState(false);

  const categoryPath = slug.join('/');
  const categoryName = category?.category.name ?? 'Catálogo';

  const {
    items: displayedItems,
    hasMore,
    isLoadingMore,
    hasError,
    sentinelRef,
    loadMore,
    reset,
  } = useInfiniteScroll({
    initialItems: products,
    initialCursor: pagination.next_cursor,
    initialHasMore: pagination.has_more,
    rootMargin: '300px',
    onError: () => toast.error('No se pudieron cargar más productos'),
    fetchNextPage: async (cursor) => {
      const repository = getClientCatalogRepository();
      const response = await repository.getProducts({
        ...currentParams,
        category: categoryPath || undefined,
        cursor: cursor ?? undefined,
      });

      return {
        items: response.items,
        nextCursor: response.pagination.next_cursor,
        hasMore: response.pagination.has_more,
      };
    },
  });

  const activeFilters = buildActiveFilters(currentParams, filters);

  const navigateTo = (target: string) => {
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    // Evita navegar a la URL actual (no-op): no activaría el remount y el
    // skeleton quedaría cargando para siempre.
    if (target === current) return;
    setIsNavigating(true);
    router.push(target, { scroll: false });
  };

  const navigateWith = (params: CatalogQueryParams, includeCursor = false) => {
    navigateTo(`${pathname}${buildCatalogQueryString(params, includeCursor)}`);
  };

  const resetLoadedState = () => {
    reset();
  };

  const toggleListValue = (key: FilterKey, value: string) => {
    const current = currentParams[key] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    resetLoadedState();
    navigateWith({ ...currentParams, [key]: next.length > 0 ? next : undefined });
  };

  const applyPrice = (min?: number, max?: number) => {
    resetLoadedState();
    navigateWith({ ...currentParams, priceMin: min, priceMax: max });
  };

  // Categorías por ID: multi-select en un solo `category_ids` (CSV con OR,
  // incluye descendientes). Navega desde `/catalogo` para no combinar un
  // filtro por ID con una ruta de categoría en la URL.
  const toggleCategoryFilter = (value: string) => {
    const current = currentParams.categoryIds ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    resetLoadedState();
    navigateTo(
      `/catalogo${buildCatalogQueryString({ ...currentParams, categoryIds: next }, false)}`,
    );
  };

  const changeSort = (value: string) => {
    resetLoadedState();
    navigateWith({ ...currentParams, sort: value || undefined });
  };

  const removeFilter = (filter: ActiveFilter) => {
    if (
      filter.key === 'flavorIds' ||
      filter.key === 'attributionIds' ||
      filter.key === 'attributeOptionIds'
    ) {
      toggleListValue(filter.key, filter.value);
      return;
    }
    if (filter.key === 'categoryIds') {
      toggleCategoryFilter(filter.value);
      return;
    }
    if (filter.key === 'priceMin') {
      resetLoadedState();
      navigateWith({ ...currentParams, priceMin: undefined });
      return;
    }
    if (filter.key === 'priceMax') {
      resetLoadedState();
      navigateWith({ ...currentParams, priceMax: undefined });
      return;
    }
    if (filter.key === 'search') {
      resetLoadedState();
      navigateWith({ ...currentParams, search: undefined });
    }
  };

  const clearAllFilters = () => {
    resetLoadedState();
    navigateWith({});
  };

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo', href: '/catalogo' },

    ...(category?.breadcrumb ?? [])
      .filter((item) => item.id !== null)
      .map((item, index, items) => {
        const segments = items.slice(0, index + 1).map((segment) => segment.slug);

        return {
          label: item.name,
          href: `/catalogo/${segments.join('/')}`,
        };
      }),
  ];

  console.log('breadcrumbitems:', breadcrumbItems);

  const resultText = `${displayedItems.length} resultado${displayedItems.length === 1 ? '' : 's'}`;
  const sort = currentParams.sort ?? '';

  return (
    <main>
      <Container className="mt-4">
        <PageBreadcrumb items={breadcrumbItems} className="mb-4" />
      </Container>
      <PageHeroBanner title={categoryName} imageUrl="/banner-static.png" className="mb-6" />

      <Container className="py-4 md:py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <CatalogSidebar
            filters={filters}
            currentParams={currentParams}
            activeFilters={activeFilters}
            onToggleList={toggleListValue}
            onToggleCategory={toggleCategoryFilter}
            onApplyPrice={applyPrice}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
          />

          <section className="space-y-4">
            <div className="flex flex-col gap-3 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                {resultText} para <span className="font-medium text-gray-800">{categoryName}</span>
              </p>

              <label className="flex items-center gap-2 text-xs tracking-[0.2em] text-gray-400 uppercase">
                <span>Ordenar</span>
                <select
                  value={sort}
                  onChange={(event) => changeSort(event.target.value)}
                  className="bg-white text-xs tracking-normal text-gray-700 outline-0"
                >
                  <option value="">Relevancia</option>
                  <option value="price">Precio menor a mayor</option>
                  <option value="-price">Precio mayor a menor</option>
                  <option value="-rating">Mejor calificados</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {isNavigating
                ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
                : displayedItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>

            {displayedItems.length === 0 && (
              <div className="border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                No encontramos productos con esos filtros.
              </div>
            )}

            <InfiniteScroll
              ref={sentinelRef}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              hasError={hasError}
              onRetry={() => void loadMore()}
            />
            {/* <div className="flex items-center justify-start pt-2 text-sm text-gray-500">
              <span>Mostrando {displayedItems.length} productos</span>
            </div> */}
          </section>
        </div>
      </Container>
    </main>
  );
}
