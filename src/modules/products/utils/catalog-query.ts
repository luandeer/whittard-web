import type { CatalogQueryParams } from '../repository/types';

type SearchParams = Record<string, string | string[] | undefined>;

const QUERY_KEYS = {
  sort: 'sort',
  search: 'search',
  categoryIds: 'category_ids',
  flavorIds: 'flavor_ids',
  attributionIds: 'attribution_ids',
  attributeOptionIds: 'attribute_option_ids',
  priceMin: 'price_min',
  priceMax: 'price_max',
  inStock: 'in_stock',
  cursor: 'cursor',
} as const;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toIdList(value: string | string[] | undefined): string[] | undefined {
  const raw = firstValue(value);
  if (!raw) return undefined;
  const list = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

/**
 * Convierte los searchParams de la URL en los query params del endpoint
 * `GET /api/v1/products` (nombres `filter[...]` se resuelven en el repositorio).
 */
export function parseCatalogSearchParams(searchParams: SearchParams): CatalogQueryParams {
  const sort = firstValue(searchParams[QUERY_KEYS.sort]);
  const priceMin = Number(firstValue(searchParams[QUERY_KEYS.priceMin]));
  const priceMax = Number(firstValue(searchParams[QUERY_KEYS.priceMax]));

  const inStockRaw = firstValue(searchParams[QUERY_KEYS.inStock]);

  return {
    search: firstValue(searchParams[QUERY_KEYS.search]),
    categoryIds: toIdList(searchParams[QUERY_KEYS.categoryIds]),
    flavorIds: toIdList(searchParams[QUERY_KEYS.flavorIds]),
    attributionIds: toIdList(searchParams[QUERY_KEYS.attributionIds]),
    attributeOptionIds: toIdList(searchParams[QUERY_KEYS.attributeOptionIds]),
    priceMin: Number.isFinite(priceMin) ? priceMin : undefined,
    priceMax: Number.isFinite(priceMax) ? priceMax : undefined,
    // `in_stock` es un flag: solo tiene efecto en `true`; `false`/ausente = sin filtro.
    inStock: inStockRaw === 'true' ? true : undefined,
    sort: sort && sort.length > 0 ? sort : undefined,
    cursor: firstValue(searchParams[QUERY_KEYS.cursor]) ?? undefined,
  };
}

/** Serializa los query params del catálogo a un query string de la URL. */
export function buildCatalogQueryString(params: CatalogQueryParams, includeCursor = true): string {
  const searchParams = new URLSearchParams();

  const set = (key: string, value: string | number | boolean | undefined) => {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  };

  set(QUERY_KEYS.sort, params.sort);
  set(QUERY_KEYS.search, params.search);
  set(QUERY_KEYS.categoryIds, params.categoryIds?.join(','));
  set(QUERY_KEYS.flavorIds, params.flavorIds?.join(','));
  set(QUERY_KEYS.attributionIds, params.attributionIds?.join(','));
  set(QUERY_KEYS.attributeOptionIds, params.attributeOptionIds?.join(','));
  set(QUERY_KEYS.priceMin, params.priceMin);
  set(QUERY_KEYS.priceMax, params.priceMax);
  set(QUERY_KEYS.inStock, params.inStock === true ? 'true' : undefined);
  set(QUERY_KEYS.cursor, includeCursor ? params.cursor : undefined);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
