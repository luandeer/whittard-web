/**
 * Contrato real de `GET /api/v1/navigation/megamenu`.
 *
 * El backend solo entrega el menú **configurado** (`sections`). Si no hay
 * configuración devuelve `categories: []` y el navbar se oculta (sin fallback
 * automático del catálogo).
 *
 * Ver `docs/specs/productos/megamenu-web-integration.md`.
 */

export type MegaMenuItemType = 'custom_url' | 'subcategory';

export interface MegaMenuItem {
  /** `null` si es la sección virtual "Categorías" (auto_children). */
  id: number | null;
  type: MegaMenuItemType;
  label: string;
  /** URL relativa interna completa (`/catalogo/…`, `/landing/…`, …). */
  url: string;
}

export interface MegaMenuSection {
  id: number | null;
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuLanding {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  url: string;
}

/** Nodo raíz del navbar (el admin define columnas e ítems). */
export interface MegaMenuRoot {
  id: string;
  name: string;
  slug: string;
  url: string;
  landing?: MegaMenuLanding | null;
  sections: MegaMenuSection[];
}

export interface MegaMenuData {
  categories: MegaMenuRoot[];
}
