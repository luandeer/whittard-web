'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { cn, formatCurrency } from '@/lib/utils';
import { useCart } from '@/modules/cart/hooks/useCart';
import { DEFAULT_PRODUCT_IMAGE } from '@/modules/products/constants';
import type {
  ProductCard as CatalogProductCard,
  ProductDetail,
  Variant,
} from '@/modules/products/types/catalog';
import { AppImage } from '@/shared/components/custom-ui/app-image';
import { Heading } from '@/shared/components/custom-ui/Heading';
import { Button } from '@/shared/components/shadcn-ui/button';
import { Checkbox } from '@/shared/components/shadcn-ui/checkbox';

interface BundleItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  regularPrice: number;
  promoPrice: number | null;
  quantity: number;
  stock: number;
  inStock: boolean;
  note?: string;
  fixed?: boolean;
}

interface BuyTogetherSectionProps {
  product: ProductDetail;
  selectedVariant: Variant;
  quantity: number;
  className?: string;
}

function itemKey(item: Pick<BundleItem, 'productId' | 'variantId'>): string {
  return `${item.productId}_${item.variantId}`;
}

function chargePerUnit(item: BundleItem): number {
  return item.promoPrice ?? item.regularPrice;
}

function cardToBundleItem(card: CatalogProductCard): BundleItem {
  const variant = card.default_variant;
  const effective = variant.effective_price ?? variant.price ?? 0;
  const regular = variant.price ?? effective;
  const onSale = variant.on_sale && effective < regular;

  return {
    productId: card.id,
    variantId: variant.id,
    sku: variant.sku,
    name: card.name,
    slug: card.slug,
    image: variant.image_url ?? DEFAULT_PRODUCT_IMAGE,
    regularPrice: regular,
    promoPrice: onSale ? effective : null,
    quantity: 1,
    stock: variant.available_stock,
    inStock: variant.in_stock,
  };
}

export function BuyTogetherSection({
  product,
  selectedVariant,
  quantity,
  className,
}: BuyTogetherSectionProps) {
  const { addItem } = useCart();

  const combinables = useMemo(
    () =>
      (product.combinable_products ?? [])
        .filter((card) => card.id !== product.id)
        .map(cardToBundleItem),
    [product.combinable_products, product.id],
  );

  const currentItem: BundleItem | null = useMemo(() => {
    const effective = selectedVariant.effective_price ?? selectedVariant.price ?? 0;
    const regular = selectedVariant.price ?? effective;
    const onSale = selectedVariant.on_sale && effective < regular;
    const attributes = Object.values(selectedVariant.attributes ?? {})
      .filter(Boolean)
      .join(' · ');
    const detail = quantity > 1 ? `Cantidad ${quantity}` : undefined;

    return {
      productId: product.id,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      name: product.name,
      slug: product.slug,
      image:
        selectedVariant.media?.find((media) => media.type === 'IMAGE')?.url ??
        DEFAULT_PRODUCT_IMAGE,
      regularPrice: regular,
      promoPrice: onSale ? effective : null,
      quantity,
      stock: selectedVariant.available_stock,
      inStock: selectedVariant.in_stock,
      note: [attributes, detail].filter(Boolean).join(' · ') || undefined,
      fixed: true,
    };
  }, [product, selectedVariant, quantity]);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(combinables.filter((item) => item.inStock).map(itemKey)),
  );

  const rows = useMemo(
    () => [...(currentItem ? [currentItem] : []), ...combinables],
    [currentItem, combinables],
  );

  const selectedCombinables = useMemo(
    () => combinables.filter((item) => item.inStock && selectedKeys.has(itemKey(item))),
    [combinables, selectedKeys],
  );

  const itemsToAdd = useMemo(() => {
    if (!currentItem?.inStock) return [];
    return [currentItem, ...selectedCombinables];
  }, [currentItem, selectedCombinables]);

  const itemCount = itemsToAdd.reduce((sum, item) => sum + item.quantity, 0);
  const total = itemsToAdd.reduce((sum, item) => sum + chargePerUnit(item) * item.quantity, 0);
  const canAdd = itemsToAdd.length > 0 && selectedCombinables.length > 0;

  const toggleItem = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAddAll = () => {
    itemsToAdd.forEach((item) =>
      addItem({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        slug: item.slug,
        image: item.image,
        unitPrice: item.regularPrice,
        promoPrice: item.promoPrice,
        quantity: item.quantity,
        maxQuantity: item.stock,
        stock: item.stock,
      }),
    );

    const articles = itemCount === 1 ? 'artículo' : 'artículos';
    toast.success(`Se añadieron ${itemCount} ${articles} a la cesta`);
  };

  if (rows.length === 0) return null;

  return (
    <section className={cn('w-full', className)}>
      <div className="border-brand-primary/20 bg-brand-primary/[0.02] space-y-4 rounded-sm border p-5 sm:p-6">
        <div>
          <Heading as="h2" variant="subheading" className="font-brand-elephant">
            Cómpralos juntos
          </Heading>
          <p className="mt-1 text-sm text-gray-500">
            Elige los productos que combinan con {product.name} y añádelos a la cesta de una sola
            vez.
          </p>
        </div>

        <ul className="divide-y divide-gray-100">
          {rows.map((item) => {
            const isCurrent = item.fixed === true;
            const isChecked = isCurrent || selectedKeys.has(itemKey(item));
            const disabled = !item.inStock;

            return (
              <li
                key={itemKey(item)}
                className={cn('flex items-center gap-3 py-3', !item.inStock && 'opacity-60')}
              >
                <Checkbox
                  checked={isChecked}
                  disabled={disabled || isCurrent}
                  onCheckedChange={() => toggleItem(itemKey(item))}
                  aria-label={`Incluir ${item.name}`}
                  className="data-checked:bg-brand-primary data-checked:border-brand-primary"
                />

                <div className="relative size-14 shrink-0 overflow-hidden rounded-xs border border-gray-200 bg-gray-100">
                  <AppImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    skeleton={false}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                  {item.note && <p className="truncate text-xs text-gray-400">{item.note}</p>}
                  {isCurrent && (
                    <p className="text-brand-primary truncate text-xs font-medium">
                      Incluye tu selección
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                  {!item.inStock ? (
                    <span className="text-xs font-medium text-red-600">Agotado</span>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(chargePerUnit(item) * item.quantity)}
                      </span>
                      {item.promoPrice !== null && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(item.regularPrice * item.quantity)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-500">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'} en total
            </p>
            <p className="text-brand-primary text-xl font-bold">{formatCurrency(total)}</p>
          </div>

          <Button
            size="lg"
            disabled={!canAdd}
            onClick={handleAddAll}
            className="h-10 w-full cursor-pointer rounded-xs text-sm font-semibold tracking-widest uppercase sm:w-auto"
          >
            {canAdd
              ? `Añadir ${itemsToAdd.length} productos a la cesta`
              : 'Selecciona productos para combinar'}
          </Button>
        </div>
      </div>
    </section>
  );
}
