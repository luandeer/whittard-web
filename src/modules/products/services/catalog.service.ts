import { ApiServer } from '@/lib/http/server/api-server';

import { RemoteCatalogRepository } from '../repository/catalog.repository';
import type {
  CatalogQueryParams,
  CatalogRepository,
  CatalogRequestOptions,
} from '../repository/types';
import type {
  CatalogFilters,
  CatalogResponse,
  CategoryPath,
  ProductDetail,
  Sitemap,
} from '../types/catalog';

/**
 * Endpoints públicos de solo lectura: se cachean con ISR (revalidate) y se
 * invalidan al crear/actualizar un producto en el backend.
 */
export const STORE_PUBLIC_REVALIDATE = 60;

const PUBLIC_OPTIONS: CatalogRequestOptions = {
  auth: false,
  cache: 'force-cache',
  next: { revalidate: STORE_PUBLIC_REVALIDATE },
};

const serverRepository: CatalogRepository = new RemoteCatalogRepository(ApiServer);

/** Servicio para Server Components (SSR/ISR). */
export const CatalogService = {
  getProducts(params?: CatalogQueryParams): Promise<CatalogResponse> {
    return serverRepository.getProducts(params, PUBLIC_OPTIONS);
  },

  getFilters(): Promise<CatalogFilters> {
    return serverRepository.getFilters(PUBLIC_OPTIONS);
  },

  getCategoryByPath(path: string): Promise<CategoryPath> {
    return serverRepository.getCategoryByPath(path, PUBLIC_OPTIONS);
  },

  getProductBySlug(slug: string, variant?: string): Promise<ProductDetail> {
    return serverRepository.getProductBySlug(slug, variant, PUBLIC_OPTIONS);
  },

  getSitemap(): Promise<Sitemap> {
    return serverRepository.getSitemap({ auth: false });
  },
};
