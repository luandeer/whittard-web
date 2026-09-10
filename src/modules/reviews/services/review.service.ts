import { ApiClient } from '@/lib/http/client/api-client';
import { ApiResponse } from '@/lib/types';
import { buildQueryString } from '@/lib/utils';

import type {
  CreateReviewPayload,
  ProductReview,
  ProductReviewsData,
  ReviewQuery,
} from '../types/review';

const STORE_V1_BASE = 'api/v1';

function reviewsEndpoint(productId: string): string {
  return `${STORE_V1_BASE}/products/${productId}/reviews`;
}

/** Servicio de reseñas para componentes del navegador (cliente). */
export const reviewService = {
  /**
   * Listado público de reseñas aprobadas del producto.
   * El backend pagina con `page` (default 10 por página).
   */
  async list(productId: string, query: ReviewQuery = {}): Promise<ProductReviewsData> {
    const querystring = buildQueryString({ page: query.page });
    const endpoint = `${reviewsEndpoint(productId)}${querystring ? `?${querystring}` : ''}`;

    const response = await ApiClient.get<ProductReviewsData>(endpoint, {
      credentials: 'include',
    });

    return response.data;
  },

  /** Crea una reseña. Requiere sesión autenticada (el backend la deja en "pending"). */
  create(productId: string, payload: CreateReviewPayload): Promise<ApiResponse<ProductReview>> {
    return ApiClient.post<ProductReview, CreateReviewPayload>(reviewsEndpoint(productId), payload, {
      credentials: 'include',
    });
  },
};
