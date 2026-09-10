import { ApiClient } from '@/lib/http/client/api-client';

import { RemoteCatalogRepository } from '../repository/catalog.repository';
import type { CatalogRepository } from '../repository/types';

let clientRepository: CatalogRepository | null = null;

/** Repositorio para el navegador (scroll infinito, refetches desde el cliente). */
export function getClientCatalogRepository(): CatalogRepository {
  if (!clientRepository) {
    clientRepository = new RemoteCatalogRepository(ApiClient);
  }
  return clientRepository;
}
