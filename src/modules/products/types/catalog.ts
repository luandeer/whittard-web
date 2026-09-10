/**
 * Tipos del catálogo público del backend.
 *
 * Contrato real de los 5 endpoints públicos del módulo Product:
 *   - GET /api/v1/products
 *   - GET /api/v1/catalog/filters
 *   - GET /api/v1/catalog/categories/by-path/{slug...}
 *   - GET /api/v1/products/{slug}
 *   - GET /api/v1/sitemap
 *
 * Ver `docs/specs/productos/storefront-product-catalog-web-integration.md`.
 */

export interface Pagination {
  per_page: number;
  has_more: boolean;
  next_cursor: string | null;
  prev_cursor: string | null;
}

export interface Seo {
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  canonical_url: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  structured_data: Record<string, unknown> | null;
  noindex: boolean;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  parent?: CategoryRef | null;
}

export interface DefaultVariant {
  id: string;
  sku: string;
  price: number | null;
  effective_price: number | null;
  sale_price: number | null;
  sale_price_starts_at: string | null;
  sale_price_ends_at: string | null;
  on_sale: boolean;
  available_stock: number;
  in_stock: boolean;
  attributes: Record<string, string>;
  image_url: string | null;
  hover_image_url: string | null;
}

export interface Attribution {
  id: string;
  name: string;
  image_url: string | null;
}

export interface Flavor {
  id: string;
  name: string;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: CategoryRef | null;
  default_variant: DefaultVariant;
  rating: { avg: number; count: number };
  flavors: Flavor[];
  attributions: Attribution[];
}

export interface AttributeOption {
  id: string;
  value: string;
  image_url: string | null;
  color_hex: string | null;
  order: number;
  products_count?: number;
}

export interface Attribute {
  id: string;
  type: string;
  label: string;
  options: AttributeOption[];
}

export interface VariantMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string | null;
  is_primary: boolean;
  order: number;
}

export interface Variant {
  id: string;
  sku: string;
  order: number;
  price: number | null;
  effective_price: number | null;
  sale_price: number | null;
  sale_price_starts_at: string | null;
  sale_price_ends_at: string | null;
  on_sale: boolean;
  available_stock: number;
  in_stock: boolean;
  is_primary: boolean;
  attributes: Record<string, string>;
  media: VariantMedia[];
}

export interface ProductDetail extends Omit<ProductCard, 'default_variant'> {
  country_of_origin: string | null;
  descriptions: {
    short: string | null;
    long: string | null;
    ingredients: string | null;
    specifications: string | null;
  };
  seo: Seo | null;
  attributes: Attribute[];
  variants: Variant[];
  combinable_products: ProductCard[];
  similar_products: ProductCard[];
}

export interface FilterCategory {
  id: string;
  name: string;
  slug: string;
  products_count: number;
  children?: FilterCategory[];
}

export interface FilterOption {
  id: string;
  name: string;
  products_count: number;
}

export interface CatalogFilters {
  categories: FilterCategory[];
  flavors: FilterOption[];
  attributions: (Attribution & { products_count: number })[];
  attributes: Attribute[];
  price: { min: number; max: number };
  total_products: number;
}

export interface CategoryPath {
  category: { id: string; name: string; slug: string; products_count: number };
  breadcrumb: { id: string | null; name: string; slug: string }[];
  children: { id: string; name: string; slug: string; products_count: number }[];
  parent: { id: string; name: string; slug: string } | null;
  seo: Seo | null;
}

export interface CatalogResponse {
  items: ProductCard[];
  pagination: Pagination;
}

export interface Sitemap {
  categories: { slug: string }[];
  products: { slug: string; updated_at: string }[];
}
