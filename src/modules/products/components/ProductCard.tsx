'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn, formatCurrency } from '@/lib/utils';
import { useCart } from '@/modules/cart/hooks/useCart';
import { DEFAULT_PRODUCT_IMAGE } from '@/modules/products/constants';
import type { ProductCard as CatalogProductCard } from '@/modules/products/types/catalog';
import { AppImage } from '@/shared/components/custom-ui/app-image';
import { useFavorites } from '../hooks/useFavorites';
import { Stars } from './Stars';

interface ProductCardProps {
  product: CatalogProductCard;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleAsync, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);

  const variant = product.default_variant;

  // `default_variant` es la única fuente de precio, oferta, stock e imágenes.
  const onSale =
    variant.on_sale &&
    variant.effective_price !== null &&
    variant.price !== null &&
    variant.effective_price < variant.price;

  const effective = variant.effective_price ?? variant.price ?? 0;
  const regular = variant.price ?? effective;

  const active = isFavorite(product.id, variant.id);
  const lowStock = variant.available_stock > 0 && variant.available_stock <= 5;
  const isOutOfStock = variant.available_stock === 0;
  const image =
    hovered && variant.hover_image_url
      ? variant.hover_image_url
      : (variant.image_url ?? DEFAULT_PRODUCT_IMAGE);

  const badges = (Array.isArray(product.attributions) ? product.attributions : []).map(
    (attribution) => ({
      label: attribution.name,
      imageUrl: attribution.image_url,
    }),
  );

  return (
    <article
      className="group flex h-full flex-col gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <Link href={`/producto/${product.slug}`} className="block">
          <div className="border-brand-primary/50 relative aspect-square w-full overflow-hidden rounded-xs border">
            <AppImage
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="h-full w-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
              skeleton={false}
              fallback={
                <div className="flex size-full items-center justify-center p-4 text-center text-xs font-medium">
                  Error imagen {product.name}
                </div>
              }
            />
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            const wasFavorite = active;
            const item = {
              productId: product.id,
              variantId: variant.id,
              slug: product.slug,
              name: product.name,
              price: effective,
              image: variant.image_url ?? DEFAULT_PRODUCT_IMAGE,
            };
            toast.promise(toggleAsync(item), {
              loading: wasFavorite ? 'Eliminando de favoritos...' : 'Guardando en favoritos...',
              success: () =>
                wasFavorite
                  ? `${product.name} se eliminó de favoritos`
                  : `${product.name} se agregó a favoritos`,
              error: 'Error al actualizar favoritos',
            });
          }}
          className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/80 shadow-xs transition-colors hover:bg-white"
          aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            className={cn(
              'size-4',
              active
                ? 'fill-red-500 text-red-500'
                : 'text-brand-primary hover:fill-red-500 hover:text-red-500',
            )}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {product.brand && (
          <span className="text-[10px] tracking-[0.18em] text-gray-400 uppercase">
            {product.brand}
          </span>
        )}

        <Link href={`/producto/${product.slug}`} className="block">
          <span className="line-clamp-2 text-sm leading-tight font-medium text-gray-800">
            {product.name}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {onSale ? (
            <>
              <span className="text-brand-primary text-sm font-bold">
                {formatCurrency(effective)}
              </span>
              <span className="text-xs text-gray-400 line-through">{formatCurrency(regular)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">{formatCurrency(effective)}</span>
          )}
        </div>

        <Stars rating={product.rating?.avg ?? 0} />

        {badges.length > 0 && (
          <div className="flex items-center gap-1.5">
            {badges.map((badge) =>
              badge.imageUrl ? (
                <AppImage
                  key={badge.label}
                  src={badge.imageUrl}
                  alt={badge.label}
                  width={20}
                  height={20}
                  className="rounded-full border border-gray-200 bg-white object-contain"
                  skeleton={false}
                />
              ) : (
                <span
                  key={badge.label}
                  title={badge.label}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                >
                  {badge.label}
                </span>
              ),
            )}
          </div>
        )}

        {lowStock && (
          <span className="text-xs font-medium text-orange-600">
            ¡Solo quedan {variant.available_stock}!
          </span>
        )}

        {isOutOfStock && <span className="text-xs font-medium text-red-600">Agotado</span>}
      </div>

      {!isOutOfStock && (
        <button
          type="button"
          onClick={() => {
            addItem({
              productId: product.id,
              variantId: variant.id,
              sku: variant.sku,
              name: product.name,
              slug: product.slug,
              image: variant.image_url ?? DEFAULT_PRODUCT_IMAGE,
              unitPrice: onSale ? regular : effective,
              promoPrice: onSale ? effective : null,
              stock: variant.available_stock,
              maxQuantity: variant.available_stock,
            });
            toast.success(`${product.name} agregado al carrito`);
          }}
          className="bg-brand-primary hover:border-brand-primary inline-flex h-10 items-center justify-center border border-gray-300 px-3 py-2 text-sm font-medium text-white opacity-100 transition-colors md:mt-auto md:border-0 md:px-0 md:py-0 md:text-left md:opacity-0 md:group-hover:opacity-100"
        >
          Agregar al carrito
        </button>
      )}
    </article>
  );
}
