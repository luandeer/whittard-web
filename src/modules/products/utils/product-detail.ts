import { DEFAULT_PRODUCT_IMAGE } from '../constants';
import type { Attribute, ProductDetail, Variant } from '../types/catalog';
import type { ProductInformationSection, ProductMedia, VariantGroup } from '../types/productDetail';

/** Variante primaria (is_primary) o la primera activa. */
export function getPrimaryVariant(product: ProductDetail): Variant | null {
  const variants = product.variants ?? [];
  return (
    variants.find((variant) => variant.is_primary) ??
    variants.find((variant) => variant.in_stock) ??
    variants[0] ??
    null
  );
}

/** Media de una variante mapeada al modelo de galería del frontend. */
export function toProductMedia(product: ProductDetail, variant: Variant | null): ProductMedia[] {
  const medias = variant?.media ?? [];
  const mapped: ProductMedia[] = medias
    .filter((media) => media.url)
    .map((media) => ({
      type: media.type === 'VIDEO' ? 'video' : ('image' as const),
      url: media.url as string,
      alt: product.name,
    }));

  // Sin media: usamos la imagen por defecto para no dejar la galería vacía.
  if (mapped.length === 0) {
    return [{ type: 'image', url: DEFAULT_PRODUCT_IMAGE, alt: product.name }];
  }

  return mapped;
}

function optionDiscountBadge(variant: Variant): string | undefined {
  if (
    !variant.on_sale ||
    variant.price === null ||
    variant.effective_price === null ||
    variant.effective_price >= variant.price ||
    variant.price <= 0
  ) {
    return undefined;
  }
  const percent = Math.round((1 - variant.effective_price / variant.price) * 100);
  return `-${percent}%`;
}

/** ¿Existe una variante en stock con ese valor de atributo compatible con la selección actual? */
export function isOptionAvailable(
  variants: Variant[],
  selectedValues: Record<string, string>,
  attributeType: string,
  value: string,
): boolean {
  const otherSelections = { ...selectedValues, [attributeType]: undefined };

  return variants.some((variant) => {
    const matchesOthers = Object.entries(otherSelections).every(
      ([type, selectedValue]) => !selectedValue || variant.attributes[type] === selectedValue,
    );
    return matchesOthers && variant.attributes[attributeType] === value && variant.in_stock;
  });
}

/** Precio efectivo de la variante que coincide con la selección (o null). */
export function findVariantForSelection(
  variants: Variant[],
  selectedValues: Record<string, string>,
): Variant | null {
  const entries = Object.entries(selectedValues).filter(([, value]) => value);
  if (entries.length === 0) return null;

  return (
    variants.find((variant) =>
      entries.every(([type, value]) => variant.attributes[type] === value),
    ) ?? null
  );
}

function attributeGroups(
  product: ProductDetail,
): { attribute: Attribute | null; type: string; label: string }[] {
  const { attributes, variants } = product;
  const types = [...new Set(variants.flatMap((variant) => Object.keys(variant.attributes ?? {})))];

  return types.map((type) => {
    const attribute = attributes?.find((item) => item.type === type) ?? null;
    return { attribute, type, label: attribute?.label ?? type };
  });
}

/**
 * Construye los grupos de variantes (selector) a partir de los atributos y
 * variantes del detalle del backend. Cada opción se mapea a una variante real
 * (precio, oferta y stock) para que la selección actualice precio/disponibilidad.
 */
export function buildVariantGroups(product: ProductDetail): VariantGroup[] {
  const { variants } = product;
  if (!variants?.length) return [];

  return attributeGroups(product)
    .map(({ attribute, type, label }): VariantGroup | null => {
      const options = (attribute?.options ?? []).map((option) => {
        const variant =
          variants.find((item) => item.attributes[type] === option.value && item.in_stock) ??
          variants.find((item) => item.attributes[type] === option.value);

        return {
          id: option.value,
          label: option.value,
          sublabel: undefined,
          price: variant?.effective_price ?? undefined,
          iconUrl: option.image_url ?? undefined,
          colorHex: option.color_hex ?? undefined,
          discountBadge: variant ? optionDiscountBadge(variant) : undefined,
          isAvailable: isOptionAvailable(variants, {}, type, option.value),
        };
      });

      if (options.length === 0) return null;

      const hasSwatches = options.some((option) => option.iconUrl || option.colorHex);

      return {
        // El id del grupo es el `type` del atributo para poder emparejar la
        // selección con `variants[].attributes[type]`.
        id: type,
        name: label,
        type: hasSwatches ? ('icon-grid' as const) : ('pills' as const),
        options,
      };
    })
    .filter((group): group is VariantGroup => group !== null);
}

/**
 * Resuelve una selección de variantes válida a partir de la deseada: si una
 * opción ya no es compatible con la selección actual (o no está en stock), se
 * reemplaza por la primera opción disponible del grupo. Procesa los grupos en
 * orden para que cada elección respete las anteriores.
 */
export function resolveValidSelection(
  variants: Variant[],
  groups: VariantGroup[],
  desired: Record<string, string>,
): Record<string, string> {
  const selection: Record<string, string> = {};

  for (const group of groups) {
    const current = desired[group.id];
    const isCurrentValid = !!current && isOptionAvailable(variants, selection, group.id, current);

    const chosen = isCurrentValid
      ? current
      : (group.options.find((option) => isOptionAvailable(variants, selection, group.id, option.id))
          ?.id ?? current);

    if (chosen) selection[group.id] = chosen;
  }

  return selection;
}

/** Secciones de información (acordeón) a partir de las descripciones del backend. */
export function buildInformationSections(product: ProductDetail): ProductInformationSection[] {
  const sections: ProductInformationSection[] = [];

  const descriptions: { id: string; title: string; content: string | null }[] = [
    { id: 'description', title: 'Descripción', content: product.descriptions?.long ?? null },
    {
      id: 'ingredients',
      title: 'Ingredientes',
      content: product.descriptions?.ingredients ?? null,
    },
    {
      id: 'specifications',
      title: 'Especificaciones',
      content: product.descriptions?.specifications ?? null,
    },
  ];

  for (const section of descriptions) {
    if (section.content) {
      sections.push({ id: section.id, title: section.title, content: section.content });
    }
  }

  return sections;
}
