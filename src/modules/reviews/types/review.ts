/**
 * Tipos del módulo de reseñas (storefront).
 *
 * Contrato real de los endpoints del módulo Review del backend:
 *   - GET  /api/v1/products/{product}/reviews   (público — solo aprobadas)
 *   - POST /api/v1/products/{product}/reviews   (autenticado — queda "pending")
 *
 * Ver `routes/storefront.php` y `app/Modules/Review` en whittard-general-api.
 */

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewCustomer {
  name: string | null;
}

export interface ProductReview {
  id: string;
  product_id: string;
  /** 1 a 5 (admite decimales, ej: 4.5). */
  rating: number;
  body: string;
  /** URLs de imágenes adjuntas (opcional). */
  images: string[] | null;
  is_verified: boolean;
  status: ReviewStatus;
  /** Solo se incluye cuando la relación está cargada. */
  customer: ReviewCustomer | null;
  /** Formato del backend: `toDateTimeString()` (ej. `2026-09-08 12:34:56`). */
  created_at: string | null;
}

export interface ReviewRatingSummary {
  /** null cuando aún no hay reseñas aprobadas. */
  avg: number | null;
  count: number;
}

export interface ReviewPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ProductReviewsData {
  items: ProductReview[];
  rating: ReviewRatingSummary;
  pagination: ReviewPagination;
}

export interface ReviewQuery {
  page?: number;
}

export interface CreateReviewPayload {
  rating: number;
  body: string;
}
