import { API_BACKEND_URL } from '@/config/env';

import type { LandingData } from '../types/landing';

/**
 * Servicio server de landings (endpoint público y de solo lectura).
 *
 * Usa `fetch` con ISR en lugar de `ApiServer` (leer cookies volvería la ruta
 * dinámica). Devuelve `null` cuando la landing no existe o no está publicada:
 * el caller decide (`notFound()`), nunca lanza.
 */
export const LANDING_REVALIDATE = 60;

interface LandingEnvelope {
  success: boolean;
  data?: LandingData | null;
}

async function fetchLanding(slug: string): Promise<LandingData | null> {
  if (!API_BACKEND_URL) return null;

  const response = await fetch(`${API_BACKEND_URL}/api/v1/landings/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    cache: 'force-cache',
    next: { revalidate: LANDING_REVALIDATE },
  });

  if (!response.ok) return null;

  const body = (await response.json()) as LandingEnvelope;
  return body.success && body.data ? body.data : null;
}

export const LandingService = {
  async getBySlug(slug: string): Promise<LandingData | null> {
    try {
      return await fetchLanding(slug);
    } catch (error) {
      console.error('[landing] No se pudo obtener la landing:', error);
      return null;
    }
  },
};
