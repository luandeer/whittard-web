import { API_BACKEND_URL } from '@/config/env';

import type { MegaMenuData, MegaMenuRoot } from '../types/megamenu.types';

/**
 * Servicio server del mega menú (endpoint público y de solo lectura).
 *
 * Usa `fetch` con ISR en lugar de `ApiServer`: leer cookies marcaría la ruta
 * como dinámica y desactivaría el render estático del resto del storefront.
 * Cualquier fallo degrada a un árbol vacío (el navbar se oculta, nunca tumba el layout).
 */
export const NAVIGATION_REVALIDATE = 60;

const NAVIGATION_ENDPOINT = 'api/v1/navigation/megamenu';

async function fetchMegaMenu(): Promise<MegaMenuRoot[]> {
  if (!API_BACKEND_URL) return [];

  const response = await fetch(`${API_BACKEND_URL}/${NAVIGATION_ENDPOINT}`, {
    headers: { Accept: 'application/json' },
    cache: 'force-cache',
    next: { revalidate: NAVIGATION_REVALIDATE },
  });

  if (!response.ok) return [];

  const body = (await response.json()) as { data?: MegaMenuData };
  return Array.isArray(body.data?.categories) ? body.data.categories : [];
}

export const NavigationService = {
  async getMegaMenu(): Promise<MegaMenuRoot[]> {
    try {
      return await fetchMegaMenu();
    } catch (error) {
      console.error('[navigation] No se pudo obtener el mega menú:', error);
      return [];
    }
  },
};
