# 🛒 Catálogo Público — Guía de Integración Web (Storefront)

**Versión:** 1.0.0
**Fecha:** 2026-08-30
**Audiencia:** Frontend / Tienda (Next.js)
**Base URL:** `/api/v1`
**Formato:** JSON
**Autenticación:** Ninguna (endpoints públicos)
**Envelope:** `{ success: boolean, message: string, data: ... }`
**Relacionado:** [`storefront-product-catalog.md`](./storefront-product-catalog.md) (spec backend) · [`product-module.md`](./product-module.md)

> Guía de consumo de los **5 endpoints públicos del catálogo**. Describe el
> contrato exacto que devuelve la API **ya implementada** (recursos reales de
> `app/Modules/Product/Resources/StoreFront`), los tipos TypeScript sugeridos y
> cómo mapearlos a las páginas de Next.js.

---

## 1. Endpoints

| Método | Ruta                                           | Propósito                                                                         |
| ------ | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| GET    | `/api/v1/products`                             | Listado paginado (cursor) con filtros, orden y búsqueda                           |
| GET    | `/api/v1/catalog/filters`                      | Facetas: categorías, sabores, sellos, atributos (swatches) y rango de precio      |
| GET    | `/api/v1/catalog/categories/by-path/{slug...}` | Resuelve la ruta de categoría (multi-segmento) + breadcrumb + subcategorías + SEO |
| GET    | `/api/v1/products/{slug}`                      | Detalle de producto por slug (SEO-friendly)                                       |
| GET    | `/api/v1/sitemap`                              | URLs públicas (categorías con ruta + productos publicados con `updated_at`)       |

Todas responden el envelope `{ success, message, data }` con HTTP `200`.

---

## 2. Envelope y errores

### Éxito

```json
{ "success": true, "message": "Catálogo de productos obtenido correctamente.", "data": { ... } }
```

### Error 404 (producto, categoría o ruta inexistente)

```json
{ "success": false, "message": "Producto no encontrado.", "errors": null }
```

Mensajes: `Producto no encontrado.` (detalle) · `Ruta de categoría no encontrada.` (listado por categoría y `by-path`).

### Error 422 por query params inválidos (`per_page`, `sort`, `in_stock`…)

Aquí **no** se usa el envelope: Laravel devuelve `{ message, errors }` (validación del `ProductCatalogRequest`).

```json
{
  "message": "El campo sort seleccionado es inválido.",
  "errors": { "sort": ["El campo sort seleccionado es inválido."] }
}
```

### Error 422 por `?variant=` inválido en el detalle

Sí usa el envelope (lo responde el controller).

```json
{
  "success": false,
  "message": "La variante indicada no existe para este producto.",
  "errors": { "variant": ["La variante 'WTC-X' no pertenece al producto."] }
}
```

> ⚠️ Para `fetch`, valida primero `response.ok`; si es `false`, usa el body tal cual
> (a veces sin `success`). Un `data` con `null` no es un error.

---

## 3. `GET /api/v1/products` — Listado con filtros

### 3.1 Query params

| Param                          | Tipo               | Comportamiento                                                                                                                                                                           |
| ------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filter[category]`             | string             | Slug **o ruta** `padre/hijo`. Incluye descendientes. Ruta inexistente → **404**                                                                                                          |
| `filter[category_ids]`         | UUID / CSV / array | Filtra por **categorías** por ID (uno o varios). Acepta CSV (`A,B`) o array (`[]=A&[]=B`) con **OR**; cada ID incluye sus descendientes (unión sin duplicados). ID inexistente → **404** |
| `filter[search]`               | string             | LIKE sobre `name`, `slug`, `brand` (NO busca por `code`)                                                                                                                                 |
| `filter[sku]`                  | string             | LIKE sobre `variants.sku`. La variante que matchea se convierte en el `default_variant` de la tarjeta                                                                                    |
| `filter[flavor_ids]`           | csv                | Productos con **al menos uno** de los sabores (OR)                                                                                                                                       |
| `filter[attribution_ids]`      | csv                | Productos con **al menos uno** de los sellos (OR)                                                                                                                                        |
| `filter[attribute_option_ids]` | csv                | Productos con una variante activa cuyo `attributes` contenga **todos** esos valores (AND)                                                                                                |
| `filter[price_min]`            | number             | Precio **efectivo** ≥ valor                                                                                                                                                              |
| `filter[price_max]`            | number             | Precio **efectivo** ≤ valor                                                                                                                                                              |
| `filter[in_stock]`             | `true/false/1/0`   | `true` → solo productos con stock disponible (`stock - reserved_qty > 0`)                                                                                                                |
| `sort`                         | string             | `name`, `price` (efectivo min), `rating`, `created_at`; prefijo `-` = desc. Default `-created_at`                                                                                        |
| `per_page`                     | int                | Default `24`. Se **cap a 48** (valores mayores devuelven 48; `< 1` → 422)                                                                                                                |
| `cursor`                       | string             | Cursor opaco para scroll infinito (ver §3.3). `null`/ausente → primera página                                                                                                            |

> Combinaciones de filtros: **AND entre dimensiones**, **OR dentro** de `flavor_ids`/`attribution_ids`/`category_ids`.
>
> **Filtro estándar de categorías:** envía **todos** los IDs que hayas seleccionado
> (raíces y subcategorías) en **un solo** `filter[category_ids]` con OR:
> `filter[category_ids]=A,B,C` (o array). Como cada ID incluye sus descendientes,
> el resultado es la unión sin duplicados (mandar una raíz y su sub es redundante
> pero inofensivo). `filter[category]` queda para rutas legibles (drill-down).

### 3.2 Respuesta (200)

```json
{
  "success": true,
  "message": "Catálogo de productos obtenido correctamente.",
  "data": {
    "items": [
      {
        "id": "uuid-prod-1",
        "name": "Té Verde Matcha Ceremonial",
        "slug": "te-verde-matcha-ceremonial",
        "brand": "Whittard of Chelsea",
        "category": {
          "id": "uuid-subcat-88",
          "name": "Matcha",
          "slug": "matcha",
          "parent": { "id": "uuid-cat-10", "name": "Té Verde", "slug": "te-verde" }
        },
        "default_variant": {
          "id": "uuid-var-1",
          "sku": "WTC-MAT-LAT-100",
          "price": 28.5,
          "effective_price": 28.5,
          "sale_price": null,
          "sale_price_starts_at": null,
          "sale_price_ends_at": null,
          "on_sale": false,
          "available_stock": 15,
          "in_stock": true,
          "attributes": { "presentation": "Lata Metálica", "weight": "100g" },
          "image_url": "https://cdn.tudominio.com/products/matcha-lata-front.jpg",
          "hover_image_url": "https://cdn.tudominio.com/products/matcha-lata-side.jpg"
        },
        "rating": { "avg": 4.7, "count": 23 },
        "flavors": [{ "id": "uuid-flavor-1", "name": "Natural / Umami" }],
        "attributions": [
          {
            "id": "uuid-attr-01",
            "name": "100% Orgánico",
            "image_url": "https://cdn.tudominio.com/badges/organic.png"
          }
        ]
      }
    ],
    "pagination": {
      "per_page": 24,
      "has_more": true,
      "next_cursor": "eyJzY29wZSI6...",
      "prev_cursor": null
    }
  }
}
```

Reglas para el front:

- `default_variant` es la **única fuente** de precio, oferta, stock e imágenes de la tarjeta. **No** hay `price_from`/`price_to`/`on_sale`/`in_stock` a nivel producto.
- `effective_price` = lo que paga el cliente. `sale_price` + fechas = para mostrar el precio tachado. `on_sale` = si la oferta está vigente.
- `available_stock` = `stock - reserved_qty` (nunca se expone el `stock` crudo).
- `attributes` siempre objeto (nunca `null`).
- `rating.avg` = `0` y `count` = `0` si no hay reseñas aprobadas.
- La tarjeta **no** incluye `code`, `status` ni el array completo `variants`.
- `image_url`/`hover_image_url` pueden ser `null` si no hay media.

### 3.3 Scroll infinito (cursor)

- Primera llamada: `GET /api/v1/products` (sin `cursor`).
- Mientras `has_more === true`, pide `GET /api/v1/products?cursor={next_cursor}` **conservando los mismos filtros y sort**.
- Última página: `has_more: false` y `next_cursor: null`.
- `cursor` es **opaco**: no construirlo ni modificarlo, solo reenviarlo tal cual.
- No uses `page`/`offset` en este endpoint.

---

## 4. `GET /api/v1/catalog/filters` — Facetas

### Respuesta (200)

```json
{
  "success": true,
  "message": "Opciones de filtrado del catálogo obtenidas correctamente.",
  "data": {
    "categories": [
      {
        "id": "uuid-cat-10",
        "name": "Té",
        "slug": "te",
        "products_count": 40,
        "children": [
          { "id": "uuid-subcat-88", "name": "Matcha", "slug": "matcha", "products_count": 12 }
        ]
      }
    ],
    "flavors": [{ "id": "uuid-flavor-1", "name": "Natural / Umami", "products_count": 30 }],
    "attributions": [
      {
        "id": "uuid-attr-01",
        "name": "100% Orgánico",
        "image_url": "https://cdn.tudominio.com/badges/organic.png",
        "products_count": 8
      }
    ],
    "attributes": [
      {
        "id": "uuid-attr-presentation",
        "type": "presentation",
        "label": "Presentación",
        "options": [
          {
            "id": "uuid-opt-1",
            "value": "Lata Metálica",
            "image_url": "https://cdn.tudominio.com/swatches/lata.png",
            "color_hex": null,
            "order": 1,
            "products_count": 12
          }
        ]
      }
    ],
    "price": { "min": 12.5, "max": 420 },
    "total_products": 87
  }
}
```

Notas:

- `categories` es un árbol raíz → `children` recursivo. Solo incluye niveles con productos publicados.
- `products_count` es un **hint** (facetas estáticas, no aplican filtros activos): úsalo para deshabilitar opciones sin resultados.
- `attributes[].options` tienen `image_url`/`color_hex`/`order` (swatches para el selector de variantes).
- `price.min`/`price.max` = rango del **precio efectivo** global.

---

## 5. `GET /api/v1/catalog/categories/by-path/{slug...}`

- `{slug...}` acepta múltiples segmentos: `/api/v1/catalog/categories/by-path/hombre/zapatillas`.
- Resuelve la categoría más profunda validando que **cada segmento sea hijo del anterior**.
- Segmento inexistente o ruta inventada → **404** (`Ruta de categoría no encontrada.`).

### Respuesta (200)

```json
{
  "success": true,
  "message": "Categoría resuelta correctamente.",
  "data": {
    "category": {
      "id": "uuid-subcat-88",
      "name": "Zapatillas",
      "slug": "zapatillas",
      "products_count": 12
    },
    "breadcrumb": [
      { "id": null, "name": "Inicio", "slug": "catalogo" },
      { "id": "uuid-cat-10", "name": "Hombre", "slug": "hombre" },
      { "id": "uuid-subcat-88", "name": "Zapatillas", "slug": "zapatillas" }
    ],
    "children": [
      { "id": "uuid-subcat-89", "name": "Running", "slug": "running", "products_count": 4 }
    ],
    "parent": { "id": "uuid-cat-10", "name": "Hombre", "slug": "hombre" },
    "seo": {
      "meta_title": "Zapatillas para Hombre | Whittard",
      "meta_description": "…",
      "keywords": ["zapatillas", "hombre"],
      "canonical_url": "https://tienda.whittard.com/catalogo/hombre/zapatillas",
      "robots": "index, follow",
      "og_title": "…",
      "og_description": "…",
      "og_image": null,
      "structured_data": {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://tienda.whittard.com/catalogo"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Hombre",
            "item": "https://tienda.whittard.com/catalogo/hombre"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Zapatillas",
            "item": "https://tienda.whittard.com/catalogo/hombre/zapatillas"
          }
        ]
      },
      "noindex": false
    }
  }
}
```

Notas:

- `breadcrumb[0]` es el home sintético: **`id` viene `null`** — usa `slug` (`catalogo`) para armar `/catalogo`. Los demás items tienen `id` real.
- `children` = subcategorías **directas** con su `products_count` (incluye descendientes).
- `parent` = categoría inmediata (`null` si es raíz).
- `seo` puede venir `null` si la categoría no tiene registro SEO.
- `canonical_url` y `structured_data` (JSON-LD `BreadcrumbList`) los genera el backend; `structured_data` es para inyectar `<script type="application/ld+json">`.

---

## 6. `GET /api/v1/products/{slug}` — Detalle

- Busca por `slug` y `status = published`. No existe / no publicado / sin variantes activas → **404**.
- Solo devuelve variantes **activas**, ordenadas por `order`.
- `?variant={sku}` preselecciona una variante; SKU que no pertenece → **422**.

### Respuesta (200)

```json
{
  "success": true,
  "message": "Detalle del producto obtenido correctamente.",
  "data": {
    "id": "uuid-prod-1",
    "name": "Té Verde Matcha Ceremonial",
    "slug": "te-verde-matcha-ceremonial",
    "brand": "Whittard of Chelsea",
    "country_of_origin": "Japón",
    "flavors": [{ "id": "uuid-flavor-1", "name": "Natural / Umami" }],
    "descriptions": {
      "short": "Té verde en polvo de grado ceremonial de alta calidad.",
      "long": "<p>Cosechado a mano en Uji, Japón.</p>",
      "ingredients": "<ul><li>100% Hoja de té verde molida.</li></ul>",
      "specifications": "<table><tr><td>Conservación</td></tr></table>"
    },
    "seo": {
      "meta_title": "Té Verde Matcha Ceremonial | Whittard",
      "meta_description": "…",
      "keywords": ["matcha", "té verde"],
      "canonical_url": "https://tienda.whittard.com/producto/te-verde-matcha-ceremonial",
      "robots": "index, follow",
      "og_title": "…",
      "og_description": "…",
      "og_image": "https://cdn.tudominio.com/products/matcha-lata-front.jpg",
      "structured_data": {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "…",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": 28.5,
          "highPrice": 40,
          "priceCurrency": "PEN"
        }
      },
      "noindex": false
    },
    "attributions": [
      {
        "id": "uuid-attr-01",
        "name": "100% Orgánico",
        "image_url": "https://cdn.tudominio.com/badges/organic.png"
      }
    ],
    "category": {
      "id": "uuid-subcat-88",
      "name": "Matcha",
      "slug": "matcha",
      "parent": { "id": "uuid-cat-10", "name": "Té Verde", "slug": "te-verde" }
    },
    "rating": { "avg": 4.7, "count": 23 },
    "attributes": [
      {
        "id": "uuid-attr-presentation",
        "type": "presentation",
        "label": "Presentación",
        "options": [
          {
            "id": "uuid-opt-1",
            "value": "Lata Metálica",
            "image_url": "https://cdn.tudominio.com/swatches/lata.png",
            "color_hex": null,
            "order": 1
          },
          {
            "id": "uuid-opt-2",
            "value": "Bolsa Recargable",
            "image_url": null,
            "color_hex": "#F0E68C",
            "order": 2
          }
        ]
      }
    ],
    "variants": [
      {
        "id": "uuid-var-1",
        "sku": "WTC-MAT-LAT-100",
        "order": 1,
        "price": 28.5,
        "effective_price": 28.5,
        "sale_price": null,
        "sale_price_starts_at": null,
        "sale_price_ends_at": null,
        "on_sale": false,
        "available_stock": 15,
        "in_stock": true,
        "is_primary": true,
        "attributes": { "presentation": "Lata Metálica", "weight": "100g" },
        "media": [
          {
            "id": "uuid-media-1",
            "type": "IMAGE",
            "url": "https://cdn.tudominio.com/products/matcha-lata-front.jpg",
            "is_primary": true,
            "order": 1
          }
        ]
      }
    ],
    "combinable_products": [],
    "similar_products": []
  }
}
```

Notas de variante:

- `order` = orden de renderizado (selector de variantes).
- `effective_price` es el precio final a mostrar; `sale_price` + fechas para el tachado; `on_sale` para el badge.
- `available_stock`/`in_stock`: `stock` crudo y `reserved_qty` **no** se exponen.
- `attributes` siempre objeto. `media[].type` en **mayúsculas** (`IMAGE`/`VIDEO`).
- `combinable_products`/`similar_products` son tarjetas (misma forma que `data.items` del listado) y pueden venir **vacías** (`[]`).
- `seo` puede venir `null`.

---

## 7. `GET /api/v1/sitemap`

### Respuesta (200)

```json
{
  "success": true,
  "message": "Sitemap obtenido correctamente.",
  "data": {
    "categories": [{ "slug": "hombre" }, { "slug": "hombre/zapatillas" }],
    "products": [
      { "slug": "te-verde-matcha-ceremonial", "updated_at": "2026-08-25T01:00:00+00:00" }
    ]
  }
}
```

- `categories` = solo categorías con ≥1 producto publicado, con su **ruta completa** de slugs (armar `/catalogo/{slug}`).
- `products` = productos publicados con `updated_at` ISO8601 (para `<lastmod>`).
- Sin paginación. `robots.txt` es estático en el front.

---

## 8. Integración con Next.js

### Mapeo de URLs

| Ruta Next.js                  | Llamadas a la API                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/catalogo`                   | `GET /products` + `GET /catalog/filters`                                                                    |
| `/catalogo/hombre`            | `GET /catalog/categories/by-path/hombre` + `GET /products?filter[category]=hombre` + `GET /catalog/filters` |
| `/catalogo/hombre/zapatillas` | `by-path/hombre/zapatillas` + `products?filter[category]=hombre/zapatillas` + `filters`                     |
| `/producto/[slug]`            | `GET /products/{slug}` (+ `?variant={sku}` si viene) + `GET /products/{id}/reviews`                         |
| `/sitemap.xml`                | `GET /sitemap`                                                                                              |

### `app/catalogo/[[...slug]]/page.tsx`

```tsx
// Next.js 15: params y searchParams son Promises → se "await"
export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug: slugArray } = await params; // /catalogo → undefined
  const query = await searchParams;
  const slug = slugArray ?? [];

  // 1) Resolver la ruta de categoría (404 si no existe)
  const category = slug.length
    ? await api.get(`/api/v1/catalog/categories/by-path/${slug.join('/')}`)
    : null;

  // 2) Listar productos con la ruta como filtro + resto de query params
  const products = await api.get('/api/v1/products', {
    ...query,
    ...(category ? { 'filter[category]': slug.join('/') } : {}),
  });

  // 3) Facetas para los controles laterales
  const filters = await api.get('/api/v1/catalog/filters');

  return <CatalogoView slug={slug} category={category} products={products} filters={filters} />;
}
```

> **Next.js 14:** `params`/`searchParams` son síncronos — quita los `await`.

### `app/producto/[slug]/page.tsx`

```tsx
export default async function ProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { slug } = await params;
  const { variant } = await searchParams;

  const product = await api.get(`/api/v1/products/${slug}`, variant ? { variant } : {});

  return <ProductoView product={product} />;
}
```

> La catch-all del catálogo **no** captura slugs de producto: el detalle vive en
> `/producto/[slug]` (carpeta aparte, sin conflicto).

### `app/sitemap.ts`

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await api.get('/api/v1/sitemap');
  const base = 'https://tienda.whittard.com';

  return [
    ...data.categories.map((c: { slug: string }) => ({ url: `${base}/catalogo/${c.slug}` })),
    ...data.products.map((p: { slug: string; updated_at: string }) => ({
      url: `${base}/producto/${p.slug}`,
      lastModified: p.updated_at,
    })),
  ];
}
```

### `app/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://tienda.whittard.com/sitemap.xml
```

---

## 9. Tipos TypeScript sugeridos

```ts
interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Pagination {
  per_page: number;
  has_more: boolean;
  next_cursor: string | null;
  prev_cursor: string | null;
}

interface Seo {
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

interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  parent?: CategoryRef | null;
}

interface ProductCard {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: CategoryRef | null;
  default_variant: {
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
  };
  rating: { avg: number; count: number };
  flavors: { id: string; name: string }[];
  attributions: { id: string; name: string; image_url: string | null }[];
}

interface ProductDetail extends Omit<ProductCard, 'default_variant'> {
  country_of_origin: string | null;
  descriptions: {
    short: string | null;
    long: string | null;
    ingredients: string | null;
    specifications: string | null;
  };
  seo: Seo | null;
  attributes: { id: string; type: string; label: string; options: AttributeOption[] }[];
  variants: VariantStorefront[];
  combinable_products: ProductCard[];
  similar_products: ProductCard[];
}

interface VariantStorefront {
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
  media: {
    id: string;
    type: 'IMAGE' | 'VIDEO';
    url: string | null;
    is_primary: boolean;
    order: number;
  }[];
}

interface AttributeOption {
  id: string;
  value: string;
  image_url: string | null;
  color_hex: string | null;
  order: number;
  products_count?: number;
}

interface CategoryPath {
  category: { id: string; name: string; slug: string; products_count: number };
  breadcrumb: { id: string | null; name: string; slug: string }[];
  children: { id: string; name: string; slug: string; products_count: number }[];
  parent: { id: string; name: string; slug: string } | null;
  seo: Seo | null;
}

interface CatalogFilters {
  categories: (CategoryRef & { products_count: number; children?: CatalogFilters['categories'] })[];
  flavors: { id: string; name: string; products_count: number }[];
  attributions: { id: string; name: string; image_url: string | null; products_count: number }[];
  attributes: { id: string; type: string; label: string; options: AttributeOption[] }[];
  price: { min: number; max: number };
  total_products: number;
}
```

---

## 10. Convenciones / pendientes

- **Precios:** siempre number (JSON serializa `40.0` como `40` — trata los precios como `number`, no strings).
- **`effective_price`** es el único precio "real" para mostrar como final.
- **Stock:** `available_stock` = `stock - reserved_qty`; agotado = `in_stock: false` pero el producto sigue visible.
- **Caché:** los 5 endpoints son públicos y de solo lectura; conviene cachear (`revalidateTag` / ISR) e invalidar al crear/actualizar producto.
- **Paginación admin** usa `page`/`total`/`last_page`; la del storefront usa **cursor**. No mezclarlas.
- Mejora futura: facetas con conteo refinado (aplicar filtros activos a `products_count`) y cache de catálogo con tags.
