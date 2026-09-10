'use client';

import { useMemo, useState } from 'react';

import type { ProductDetail } from '@/modules/products/types/catalog';
import {
  buildVariantGroups,
  findVariantForSelection,
  resolveValidSelection,
  toProductMedia,
} from '@/modules/products/utils/product-detail';
import { BuyTogetherSection } from '../buy-together/BuyTogetherSection';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';

interface ProductHeroProps {
  product: ProductDetail;
}

export function ProductHero({ product }: ProductHeroProps) {
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const groups = useMemo(() => buildVariantGroups(product), [product]);

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() =>
    resolveValidSelection(variants, groups, {}),
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => findVariantForSelection(variants, selectedValues) ?? variants[0] ?? null,
    [variants, selectedValues],
  );

  const media = useMemo(() => toProductMedia(product, selectedVariant), [product, selectedVariant]);

  const combinables = useMemo(
    () => (product.combinable_products ?? []).filter((card) => card.id !== product.id),
    [product.combinable_products, product.id],
  );

  // Si cambia la variante, ajusta la cantidad al stock disponible de la nueva.
  const handleOptionChange = (groupId: string, optionId: string) => {
    const nextValues = resolveValidSelection(variants, groups, {
      ...selectedValues,
      [groupId]: optionId,
    });
    setSelectedValues(nextValues);

    const nextVariant = findVariantForSelection(variants, nextValues) ?? variants[0] ?? null;
    if (nextVariant) {
      setQuantity((current) => Math.min(current, Math.max(1, nextVariant.available_stock ?? 1)));
    }
  };

  return (
    <>
      <div className="mb-16 grid gap-8 md:mb-20 md:grid-cols-2 md:gap-12">
        <ProductGallery images={media} />
        <ProductInfo
          product={product}
          groups={groups}
          selectedValues={selectedValues}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onOptionChange={handleOptionChange}
          onQuantityChange={setQuantity}
        />
      </div>

      {selectedVariant && combinables.length > 0 && (
        <BuyTogetherSection
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          className="mb-16 md:mb-20"
        />
      )}
    </>
  );
}
