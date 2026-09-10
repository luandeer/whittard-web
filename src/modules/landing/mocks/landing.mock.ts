import type { ProductCard } from '@/modules/products/types/catalog';

import type { LandingContent } from '../types/landing';

function card(
  id: string,
  name: string,
  slug: string,
  price: number,
  promoPrice: number | null,
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
      available_stock: 10,
      in_stock: true,
      attributes: {},
      image_url: '/producto1.png',
      hover_image_url: null,
    },
    rating: { avg: 4.6, count: 8 },
    flavors: [],
    attributions: [],
  };
}

/**
 * Contenido de ejemplo con la forma final (`landing-final.md`) para previsualizar
 * las secciones en desarrollo.
 */
export const sampleLandingContent: LandingContent = {
  banner: [
    {
      type: 'image',
      desktop_image_url:
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1600&q=80',
      mobile_image_url:
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      link_url: '/catalogo/te',
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Té Verde', slug: 'te-verde', path: 'te/te-verde' },
    { id: 'cat-2', name: 'Té Negro', slug: 'te-negro', path: 'te/te-negro' },
    { id: 'cat-3', name: 'Matcha', slug: 'matcha', path: 'te/matcha' },
    { id: 'cat-4', name: 'Infusiones', slug: 'infusiones', path: 'te/infusiones' },
  ],
  products: [
    card('p1', 'Earl Grey Classic', 'earl-grey-classic', 45.0, 35.0),
    card('p2', 'English Breakfast', 'english-breakfast', 42.0, null),
    card('p3', 'Jasmine Green Tea', 'jasmine-green-tea', 48.0, 38.0),
    card('p4', 'Matcha Premium', 'matcha-premium', 65.0, null),
  ],
  landings: [
    {
      id: 'l1',
      title: 'Café de especialidad',
      slug: 'cafe',
      thumbnail_url: '/landing-cafe.png',
      url: '/landing/cafe',
    },
    {
      id: 'l2',
      title: 'Rituales de matcha',
      slug: 'rituales-matcha',
      thumbnail_url: '/landing-matcha.png',
      url: '/landing/rituales-matcha',
    },
  ],
  final_section: {
    title: 'Nuestro compromiso',
    image_url:
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=900&q=80',
    content_html:
      '<p>Desde 1886 seleccionamos los mejores tés del mundo para el momento perfecto.</p><p>Cada mezcla es <strong>artesanal</strong> y pensada para disfrutarse.</p>',
  },
};
