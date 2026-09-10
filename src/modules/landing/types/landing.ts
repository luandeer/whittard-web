/**
 * Contrato real de `GET /api/v1/landings/{slug}`.
 *
 * La landing pertenece a una categoría principal y su `content` trae las
 * 5 secciones resueltas (ver `landing-final.md`):
 *  - banner         → slides del Hero (contrato del componente Banner del Home)
 *  - categories     → categorías destacadas enlazadas al catálogo
 *  - products       → tarjetas completas de producto (ProductCardResource)
 *  - landings       → otras landings destacadas (miniatura + nombre)
 *  - final_section  → sección editorial (título, imagen opcional y HTML)
 */

import type { ProductCard } from '@/modules/products/types/catalog';

export type LandingProductCard = ProductCard;

export interface LandingSeo {
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[];
  canonical_url: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  structured_data: Record<string, unknown> | null;
  noindex: boolean;
}

export interface LandingResource {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  url: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface LandingData {
  landing: LandingResource;
  seo: LandingSeo | null;
  content: LandingContent;
}

export type LandingBannerSlideType = 'image' | 'video';

export interface LandingBannerSlide {
  type: LandingBannerSlideType;
  link_url?: string | null;
  desktop_image_url: string;
  mobile_image_url?: string | null;
  video_url?: string | null;
}

export interface LandingCategoryItem {
  id: string;
  name: string;
  slug: string;
  /** Ruta de catálogo sin prefijo (slugs de ancestros + propio). */
  path: string;
  image_url?: string | null;
}

export interface LandingCard {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  url: string;
}

export interface LandingFinalSection {
  title?: string | null;
  image_url?: string | null;
  content_html?: string | null;
}

export interface LandingContent {
  banner?: LandingBannerSlide[];
  categories?: LandingCategoryItem[];
  products?: LandingProductCard[];
  landings?: LandingCard[];
  final_section?: LandingFinalSection | null;
}
