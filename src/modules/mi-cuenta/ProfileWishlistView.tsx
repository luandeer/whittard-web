'use client';

import { useState } from 'react';

import { ProductCard } from '@/modules/products/components/ProductCard';
import { Pagination } from '@/shared/components/custom-ui/Pagination';
import { PageHeader } from './components/PageHeader';
import { MOCK_WISHLIST } from './mocks/wishlist.mock';

const ITEMS_PER_PAGE = 6;

export function ProfileWishlistView() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(MOCK_WISHLIST.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const items = MOCK_WISHLIST.slice(start, start + ITEMS_PER_PAGE);

  return (
    <>
      <PageHeader title="Lista de Deseos" subtitle="Sobre mi cuenta" />

      {MOCK_WISHLIST.length === 0 ? (
        <div className="border-brand-200 rounded-lg border bg-white p-12 text-center">
          <p className="text-brand-secondary text-sm">No tienes productos guardados.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}
