# MEGA MENÚ + LANDINGS — Guía de Integración Web (Storefront / Next.js)

**Versión:** 1.0
**Fecha:** 2026-09-06
**Audiencia:** Frontend Web (Next.js)
**Base URL:** `/api/v1`
**Autenticación:** Ninguna (endpoints públicos)
**Envelope:** `{ success: boolean, message: string, data }`
**Relacionado:** [`megamenu.md`](./megamenu.md) (backend menú) · [`landings.md`](./landings.md) (backend landings) · [`admin-megamenu-integration.md`](./admin-megamenu-integration.md) (admin)
**Backend ya implementado.** `content-general.md` **no se usa** para esto.

> Guía para construir el navbar dinámico y las páginas de landing en la web.
> La API ya entrega **URLs completas** (`/catalogo/…`, `/landing/…`): el front **no
> construye rutas**, solo renderiza la respuesta.

---

## 1. Endpoints

| Método | Ruta                          | Propósito                           |
| ------ | ----------------------------- | ----------------------------------- |
| GET    | `/api/v1/navigation/megamenu` | Menú de navegación (navbar)         |
| GET    | `/api/v1/landings/{slug}`     | Página de landing (contenido + SEO) |

Ambos públicos, envelope `{ success, message, data }`, HTTP `200`.

---

## 2. `GET /api/v1/navigation/megamenu`

El backend responde en **dos estados** según si el admin configuró el menú:

### 2.1 Menú CONFIGURADO (existe al menos una raíz activa en el CMS)

```jsonc
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "01a055f5-2f7b-7343-b5f4-cbd0676c9854",
        "name": "Té",
        "slug": "te",
        "url": "/landing/te", // la categoría raíz tiene landing publicada
        "sections": [
          {
            "id": 1, // null si es la sección virtual "Categorías" (auto_children)
            "title": "Enlaces",
            "items": [
              { "id": 12, "type": "custom_url", "label": "Promociones", "url": "/promociones" },
            ],
          },
        ],
      },
    ],
  },
}
```

### 2.2 Menú SIN configurar

Cuando no hay ninguna raíz activa en el CMS, el backend devuelve `categories: []`:

```jsonc
{ "success": true, "data": { "categories": [] } }
```

> El front debe **ocultar el navbar** cuando `categories` es `[]`. No hay árbol ni
> datos por defecto.

### 2.3 Reglas para el front

- Nivel 1 (`categories[]`) = ítems del navbar.
- Columnas = `sections[]`; links = `items[]`. El `url` de una raíz ya resuelve a su
  landing si la categoría principal la tiene.
- `data.categories` puede ser `[]` → ocultar el navbar (no es error).
- Las subcategorías **nunca** tienen landing propia (solo las categorías raíz), así que
  sus items apuntan a `/catalogo/{path}`.
- Toda `url` es relativa interna; úsala con el router (`next/link`).

---

## 3. `GET /api/v1/landings/{slug}` — página de landing

```jsonc
{
  "success": true,
  "data": {
    "landing": {
      "id": "…uuid…",
      "title": "Té",
      "slug": "te",
      "url": "/landing/te",
      "category_id": "01a055f5-…",
    },
    "seo": {
      "meta_title": "…",
      "meta_description": "…",
      "keywords": [],
      "canonical_url": "https://…/landing/te",
      "robots": "index, follow",
      "og_title": "…",
      "og_description": "…",
      "og_image": "…",
      "structured_data": null,
      "noindex": false,
    },
    "content": { "hero": { "title": "…", "is_visible": true } },
  },
}
```

- Ruta web: `/landing/[slug]`.
- `content` es un **mapa de bloques por clave** (`hero`, `banners`, `cards`…). Cada
  bloque es un objeto con su propio esquema visual; pueden traer `is_visible`
  (el backend ya **omite** los invisibles: si `content` viene `{}`, no hay nada que renderizar).
- El front **no conoce la estructura interna**: renderiza cada clave con su componente
  según `type`/convención del proyecto (p. ej. `hero`, `banner`, `cards`). Esto se
  acuerda con el contenido que edita el admin (spec admin).
- 404 con envelope si no existe o está en `draft` → `next notFound()`.
- SEO: mapea `data.seo` a `generateMetadata` (mismos campos que productos/categorías).

---

## 4. Tipos TypeScript sugeridos

```ts
// lib/api/navigation.ts
export interface MegaMenuItem {
  id: number | null;
  type: 'custom_url' | 'subcategory';
  label: string;
  url: string;
}
export interface MegaMenuSection {
  id: number | null;
  title: string;
  items: MegaMenuItem[];
}
export interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;
  url: string;
  sections: MegaMenuSection[];
}

export interface MegaMenuData {
  categories: MegaMenuCategory[];
}

export interface LandingSeo {
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[];
  canonical_url: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  structured_data: unknown;
  noindex: boolean;
}
export interface LandingPage {
  landing: { id: string; title: string; slug: string; url: string; category_id: string };
  seo: LandingSeo;
  content: Record<string, unknown>;
}
```

---

## 5. Integración en Next.js (App Router)

### 5.1 Navbar — server component

```tsx
// app/components/navbar.tsx
export async function Navbar() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/navigation/megamenu`, {
    next: { revalidate: 300 }, // o tag 'navigation' para invalidar al guardar en el admin
  });
  if (!res.ok) return null;

  const { data } = (await res.json()) as { data: MegaMenuData };
  if (!data?.categories?.length) return null;

  return (
    <nav aria-label="Categorías">
      <ul>
        {data.categories.map((root) => (
          <li key={root.id}>
            {/* Enlace principal: root.url (puede ser /landing/… o /catalogo/…) */}
            <a href={root.url}>{root.name}</a>
            {root.sections.length > 0 && (
              <div className="panel">
                {root.sections.map((s) => (
                  <div key={s.id ?? s.title}>
                    <strong>{s.title}</strong>
                    <ul>
                      {s.items.map((it) => (
                        <li key={it.id ?? `${it.type}-${it.url}`}>
                          <a href={it.url}>{it.label}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- Un solo fetch para todo el navbar; render en el server.
- Para rutas internas usa `next/link` con las `url` tal cual.

### 5.2 Landing — `/landing/[slug]/page.tsx`

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { data } = await getLanding(params.slug);
  if (!data) return {};
  return { title: data.seo.meta_title ?? data.landing.title,
           description: data.seo.meta_description ?? undefined, robots: data.seo.noindex ? 'noindex' : undefined, ... };
}

export default async function LandingPage({ params }) {
  const { data } = await getLanding(params.slug);
  if (!data) return notFound();

  return <LandingRenderer content={data.content} />; // renderiza bloques por clave
}

async function getLanding(slug: string) {
  const res = await fetch(`${API}/api/v1/landings/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) return { data: null };
  const body = await res.json();
  return body.success ? { data: body.data } : { data: null };
}
```

- `LandingRenderer`: itera `Object.entries(content)` y renderiza el componente
  correspondiente a cada clave/bloque (los invisibles ya vienen filtrados).
- 404 si `draft`/inexistente.

---

## 6. Caché / performance

- Endpoints públicos y de solo lectura: usa `fetch` con `revalidate`/`ISR` o tags
  (`'navigation'`, `'landing'`) e invalida al publicar/guardar desde el admin.
- El navbar no debe llamarse desde el cliente en cada render.
- Degradación: si el fetch falla o `categories` vacío → ocultar el mega menú (nunca
  romper el header). En `/landing` fallo/404 → `notFound()`.

---

## 7. Checklist de aceptación (web)

- [ ] El navbar se construye desde `GET /api/v1/navigation/megamenu`.
- [ ] Si `categories` viene `[]`, el navbar se oculta (sin datos por defecto).
- [ ] Los enlaces usan las `url` de la API (`/catalogo/…` y `/landing/…`) sin construir rutas a mano.
- [ ] Con `categories: []` el navbar se oculta sin errores.
- [ ] `/landing/[slug]` renderiza contenido + SEO; 404 si la landing no está publicada.
- [ ] No hay dependencia del CMS "Contenido General" (`/content/*` no se usa para esto).
- [ ] Caché por revalidate/tags; sin llamadas al cliente por render.
