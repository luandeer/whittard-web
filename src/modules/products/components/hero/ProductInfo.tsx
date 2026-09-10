'use client';

import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/modules/cart/hooks/useCart';
import { Stars } from '@/modules/products/components/Stars';
import { DEFAULT_PRODUCT_IMAGE } from '@/modules/products/constants';
import type { ProductDetail, Variant } from '@/modules/products/types/catalog';
import type { VariantGroup } from '@/modules/products/types/productDetail';
import { buildInformationSections } from '@/modules/products/utils/product-detail';
import { Badge } from '@/shared/components/shadcn-ui/badge';
import { Button } from '@/shared/components/shadcn-ui/button';
import { AlertTriangle } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { FavoriteButton } from './FavoriteButton';
import { ProductAttributeBadges } from './ProductAttributeBadges';
import { ProductInformationAccordion } from './ProductInformationAccordion';
import { ProductShare } from './ProductShare';
import { QuantitySelector } from './QuantitySelector';
import { VariantSelector } from './VariantSelector';

interface ProductInfoProps {
  product: ProductDetail;
  groups: VariantGroup[];
  selectedValues: Record<string, string>;
  selectedVariant: Variant | null;
  quantity: number;
  onOptionChange: (groupId: string, optionId: string) => void;
  onQuantityChange: (quantity: number) => void;
}

export function ProductInfo({
  product,
  groups,
  selectedValues,
  selectedVariant,
  quantity,
  onOptionChange,
  onQuantityChange,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const hasVariants = groups.length > 0;

  const effectivePrice = selectedVariant?.effective_price ?? selectedVariant?.price ?? 0;
  const regularPrice = selectedVariant?.price ?? effectivePrice;
  const onSale =
    selectedVariant?.on_sale && selectedVariant.price !== null && effectivePrice < regularPrice;
  const isOutOfStock = selectedVariant ? !selectedVariant.in_stock : true;
  const maxStock = selectedVariant?.available_stock ?? 0;

  const badges: string[] = [
    ...(onSale ? ['Oferta'] : []),
    ...(product.attributions ?? []).map((attribution) => attribution.name),
  ];

  const handleOptionChange = useCallback(
    (groupId: string, optionId: string) => onOptionChange(groupId, optionId),
    [onOptionChange],
  );

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedVariant.in_stock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      name: product.name,
      slug: product.slug,
      image:
        selectedVariant.media.find((media) => media.type === 'IMAGE')?.url ?? DEFAULT_PRODUCT_IMAGE,
      unitPrice: regularPrice,
      promoPrice: onSale ? effectivePrice : null,
      stock: selectedVariant.available_stock,
      maxQuantity: selectedVariant.available_stock,
      quantity,
    });
    toast.success(`${product.name} agregado a la cesta`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="text-[11px] tracking-wider uppercase"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <h1 className="font-brand-elephant text-brand-primary text-2xl leading-tight md:text-3xl">
          {product.name}
        </h1>

        {product.brand && (
          <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">{product.brand}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          {onSale ? (
            <>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(effectivePrice)}
              </span>
              <span className="text-brand-secondary text-lg line-through">
                {formatCurrency(regularPrice)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">{formatCurrency(effectivePrice)}</span>
          )}
        </div>

        {product.rating.count > 0 && (
          <a
            href="#reviews"
            aria-label={`Ver reseñas del producto (${product.rating.count})`}
            title="Ver reseñas y escribir tu opinión"
            className="flex cursor-pointer items-center gap-1.5 border-l border-gray-200 pl-3 transition-opacity hover:opacity-80"
          >
            <Stars rating={product.rating.avg} />
            <span className="text-xs text-gray-500 underline-offset-4 hover:underline">
              ({product.rating.count})
            </span>
          </a>
        )}
      </div>

      {hasVariants && (
        <VariantSelector
          groups={groups}
          variants={product.variants ?? []}
          selectedOptions={selectedValues}
          onOptionChange={handleOptionChange}
        />
      )}

      <div className="flex flex-col gap-2">
        <label className="text-brand-primary text-sm font-medium tracking-wide">Cantidad</label>
        <div className="flex items-center gap-2">
          <QuantitySelector
            quantity={quantity}
            max={Math.max(1, maxStock)}
            onChange={onQuantityChange}
          />
          <Button
            size="lg"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="h-10 flex-1 cursor-pointer rounded-xs text-sm font-semibold tracking-widest uppercase"
          >
            {isOutOfStock ? 'Agotado' : 'Agregar a Cesta'}
          </Button>
          <FavoriteButton product={product} variantId={selectedVariant?.id ?? product.id} />
        </div>
        {!isOutOfStock && maxStock <= 5 && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            ¡Solo quedan {maxStock} unidades!
          </p>
        )}
      </div>

      {product.descriptions?.short && (
        <p className="text-brand-secondary text-sm leading-relaxed">{product.descriptions.short}</p>
      )}

      {product.country_of_origin && (
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">Origen:</span> {product.country_of_origin}
        </p>
      )}

      <ProductAttributeBadges attributions={product.attributions ?? []} />
      <ProductInformationAccordion sections={buildInformationSections(product)} />

      <ProductShare title={product.name} />
    </div>
  );
}
