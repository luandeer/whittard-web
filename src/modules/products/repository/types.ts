import type { ApiResponse } from '@/lib/types';

import type {
  CatalogFilters,
  CatalogResponse,
  CategoryPath,
  ProductDetail,
  Sitemap,
} from '../types/catalog';

export interface CatalogQueryParams {
  /** Ruta completa de categoría (ej: `tea/black-tea`). Incluye descendientes. */
  category?: string;
  /** IDs de categorías seleccionadas — `filter[category_ids]` CSV con OR. Incluye descendientes. */
  categoryIds?: string[];
  /** LIKE sobre name, slug y brand. */
  search?: string;
  /** LIKE sobre variants.sku. */
  sku?: string;
  /** IDs de sabores (OR). */
  flavorIds?: string[];
  /** IDs de sellos (OR). */
  attributionIds?: string[];
  /** IDs de opciones de atributo (AND). */
  attributeOptionIds?: string[];
  /** Precio efectivo mínimo. */
  priceMin?: number;
  /** Precio efectivo máximo. */
  priceMax?: number;
  /** Solo productos con stock disponible. */
  inStock?: boolean;
  /** `name`, `price`, `rating`, `created_at`; prefijo `-` = desc. */
  sort?: string;
  /** Items por página (default 24, tope 48). */
  perPage?: number;
  /** Cursor opaco para scroll infinito. */
  cursor?: string;
}

export type CatalogRequestOptions = {
  auth?: boolean | 'optional';
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  /** Cabeceras extra; compartido por ApiServer y ApiClient (evita el cast en el repo). */
  headers?: Record<string, string>;
};

export interface CatalogHttpClient {
  get<T>(endpoint: string, options?: CatalogRequestOptions): Promise<ApiResponse<T>>;
}

export interface CatalogRepository {
  getProducts(
    params?: CatalogQueryParams,
    options?: CatalogRequestOptions,
  ): Promise<CatalogResponse>;
  getFilters(options?: CatalogRequestOptions): Promise<CatalogFilters>;
  getCategoryByPath(path: string, options?: CatalogRequestOptions): Promise<CategoryPath>;
  getProductBySlug(
    slug: string,
    variant?: string,
    options?: CatalogRequestOptions,
  ): Promise<ProductDetail>;
  getSitemap(options?: CatalogRequestOptions): Promise<Sitemap>;
}
