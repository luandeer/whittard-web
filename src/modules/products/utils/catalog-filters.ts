import { formatCurrency } from '@/lib/utils';

import type { CatalogQueryParams } from '../repository/types';
import type { CatalogFilters } from '../types/catalog';

export type FilterKey = 'flavorIds' | 'attributionIds' | 'attributeOptionIds';

export interface ActiveFilter {
  key: FilterKey | 'categoryIds' | 'priceMin' | 'priceMax' | 'search';
  value: string;
  label: string;
}

export function resolveFilterLabel(
  key: ActiveFilter['key'],
  value: string,
  filters: CatalogFilters,
): string {
  switch (key) {
    case 'flavorIds':
      return filters.flavors.find((flavor) => flavor.id === value)?.name ?? value;
    case 'attributionIds':
      return filters.attributions.find((attribution) => attribution.id === value)?.name ?? value;
    case 'attributeOptionIds':
      return (
        filters.attributes
          .flatMap((attribute) => attribute.options)
          .find((option) => option.id === value)?.value ?? value
      );
    case 'categoryIds':
      return (
        filters.categories
          .flatMap((category) => [category, ...(category.children ?? [])])
          .find((item) => item.id === value)?.name ?? value
      );
    default:
      return value;
  }
}

export function buildActiveFilters(
  params: CatalogQueryParams,
  filters: CatalogFilters,
): ActiveFilter[] {
  return [
    ...(params.flavorIds ?? []).map((value) => ({
      key: 'flavorIds' as const,
      value,
      label: resolveFilterLabel('flavorIds', value, filters),
    })),
    ...(params.attributionIds ?? []).map((value) => ({
      key: 'attributionIds' as const,
      value,
      label: resolveFilterLabel('attributionIds', value, filters),
    })),
    ...(params.attributeOptionIds ?? []).map((value) => ({
      key: 'attributeOptionIds' as const,
      value,
      label: resolveFilterLabel('attributeOptionIds', value, filters),
    })),
    ...(params.categoryIds ?? []).map((value) => ({
      key: 'categoryIds' as const,
      value,
      label: resolveFilterLabel('categoryIds', value, filters),
    })),
    ...(params.priceMin !== undefined
      ? [
          {
            key: 'priceMin' as const,
            value: String(params.priceMin),
            label: `Desde ${formatCurrency(params.priceMin)}`,
          },
        ]
      : []),
    ...(params.priceMax !== undefined
      ? [
          {
            key: 'priceMax' as const,
            value: String(params.priceMax),
            label: `Hasta ${formatCurrency(params.priceMax)}`,
          },
        ]
      : []),
    ...(params.search
      ? [
          {
            key: 'search' as const,
            value: params.search,
            label: `Búsqueda: ${params.search}`,
          },
        ]
      : []),
  ];
}
