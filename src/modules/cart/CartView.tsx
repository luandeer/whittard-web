'use client';

import { formatCurrency } from '@/lib/utils';
import { ProductCarousel } from '@/modules/products/components/product-carousel/ProductCarousel';
import type { ProductCard } from '@/modules/products/types/catalog';
import { Container } from '@/shared/components/custom-ui/Container';
import { PageBreadcrumb } from '@/shared/components/custom-ui/PageBreadcrumb';
import { useState } from 'react';
import { CartItemCard } from './components/CartItemCard';
import { CouponSection } from './components/CouponSection';
import { OrderSummary } from './components/OrderSummary';
import { useCart } from './hooks/useCart';

const CART_BREADCRUMBS = [{ label: 'Inicio', href: '/' }, { label: 'Carrito' }];

function card(
  id: string,
  name: string,
  slug: string,
  price: number,
  promoPrice: number | null,
  stock: number,
  rating: number,
): ProductCard {
  return {
    id,
    name,
    slug,
    brand: null,
    category: null,
    default_variant: {
      id: `${id}a`,
      sku: `SKU-${id}`,
      price,
      effective_price: promoPrice ?? price,
      sale_price: promoPrice,
      sale_price_starts_at: null,
      sale_price_ends_at: null,
      on_sale: promoPrice !== null,
      available_stock: stock,
      in_stock: stock > 0,
      attributes: {},
      image_url: '/producto1.png',
      hover_image_url: null,
    },
    rating: { avg: rating, count: 0 },
    flavors: [],
    attributions: [],
  };
}

const RELATED_PRODUCTS: ProductCard[] = [
  card('1', 'Covent Garden Blend Loose Tea', 'covent-garden-blend', 12.98, null, 18, 4.8),
  card('2', 'English Breakfast Loose Tea', 'english-breakfast', 12.98, null, 14, 4.7),
  card('3', 'Earl Grey Classic Loose Tea', 'earl-grey-classic', 12.98, null, 6, 4.9),
  card('4', 'Jasmine Green Tea Loose Tea', 'jasmine-green-tea', 12.98, null, 20, 4.6),
];

export function CartView() {
  const { items, totals, isLoading, updateQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const shippingLeft = Math.max(50 - totals.subtotal, 0);

  if (isLoading) {
    return (
      <Container as="main" className="flex flex-1 items-center justify-center py-20">
        <p className="text-lg text-gray-500">Cargando carrito...</p>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container as="main" className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <PageBreadcrumb items={CART_BREADCRUMBS} className="mb-6 w-full" />
        <h1 className="font-brand-elephant text-brand-primary text-3xl md:text-4xl">Mi Carrito</h1>
        <p className="text-lg text-gray-500">Tu carrito está vacío</p>
        <p className="text-sm text-gray-400">Agrega productos para empezar tu compra</p>
      </Container>
    );
  }

  return (
    <Container as="main" className="py-6 md:py-10">
      <PageBreadcrumb items={CART_BREADCRUMBS} className="mb-6" />

      <section className="space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="font-brand-elephant text-brand-primary text-3xl md:text-4xl">
            Mi Carrito
          </h1>
          <p className="text-base text-gray-600">
            {shippingLeft > 0 ? (
              <>
                Falta {formatCurrency(shippingLeft)} para aplicar tu{' '}
                <span className="font-semibold text-amber-600">Delivery Gratis</span>
              </>
            ) : (
              <>
                Tienes envío gratis.{' '}
                <span className="font-semibold text-amber-600">Aprovecha tu compra</span>
              </>
            )}
          </p>
        </header>

        <div className="w-full space-y-8">
          <div className="w-full divide-y divide-gray-200 border-y border-gray-300">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={(id, quantity) => {
                  const [productId, variantId] = id.split('_');
                  updateQuantity(productId, variantId, quantity);
                }}
                onRemove={(id) => {
                  const [productId, variantId] = id.split('_');
                  removeItem(productId, variantId);
                }}
              />
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.5fr] lg:items-start">
            <CouponSection
              coupon={coupon}
              couponState={couponState}
              onCouponChange={setCoupon}
              onApplyCoupon={() =>
                setCouponState(coupon.trim().toLowerCase() === 'whittard10' ? 'valid' : 'invalid')
              }
            />

            <OrderSummary
              subtotal={totals.subtotal}
              delivery={totals.shipping}
              total={totals.total}
            />
          </div>
        </div>

        <ProductCarousel products={RELATED_PRODUCTS} title="Productos Similares" />
      </section>
    </Container>
  );
}
