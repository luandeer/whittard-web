import type { MegaMenuRoot } from '../types/megamenu.types';

/** ¿El ítem de navbar tiene contenido que abre un panel? (si no, es un link directo). */
export function hasMegamenuContent(category: MegaMenuRoot): boolean {
  return category.sections.some((section) => section.items.length > 0);
}
