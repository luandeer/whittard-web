import type { ProductCard } from '@/modules/products/types/catalog';

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

export const MOCK_WISHLIST: ProductCard[] = [
  card('w1', 'Covent Garden Blend Loose Tea', 'covent-garden-blend', 12.98, null, 18, 4.8),
  card('w2', 'English Breakfast Loose Tea', 'english-breakfast', 12.98, 9.99, 14, 4.7),
  card('w3', 'Earl Grey Classic Loose Tea', 'earl-grey-classic', 12.98, null, 6, 4.9),
  card('w4', 'Jasmine Green Tea Loose Tea', 'jasmine-green-tea', 14.5, null, 20, 4.6),
  card('w5', 'Matcha Latte Cremoso', 'matcha-latte', 18.0, 14.5, 0, 4.9),
  card('w6', 'Chocolate Caliente Especiado', 'chocolate-caliente', 25.0, null, 8, 4.5),
  card('w7', 'Set de Té Gourmet - Colección Especial', 'set-te-gourmet', 89.9, 69.9, 3, 5.0),
  card('w8', 'Café Colombia Supremo', 'colombia-supremo', 42.0, null, 12, 4.7),
  card('w9', 'Breakfast Tea Selection Box', 'breakfast-tea-box', 89.9, null, 10, 4.4),
  card('w10', 'Té Helado de Durazno', 'te-helado-durazno', 22.0, 18.0, 0, 4.3),
];
