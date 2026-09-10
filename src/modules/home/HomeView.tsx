import { ProductCarousel } from '@/modules/products/components/product-carousel/ProductCarousel';
import type { ProductCard } from '@/modules/products/types/catalog';
import { RecipeCarousel } from '@/modules/recipes/components/recipe-carousel/RecipeCarousel';
import { MOCK_RECIPES } from '@/modules/recipes/mocks/recipes.mock';
import { Container } from '@/shared/components/custom-ui/Container';
import type { BannerSlide } from '@/shared/components/custom-ui/banner';
import { Banner } from '@/shared/components/custom-ui/banner';
import { CategoriesCarousel } from './components/CarouselCategories';
import { SummerFavorites } from './components/SummerFavorites';
import { CategorySlide } from './types/categories';

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: '1',
    isActive: true,
    type: 'image',
    desktopImageUrl: '/home/banner/portada.jpg',
    mobileImageUrl: '/home/banner/portadamobil.webp',
  },
  {
    id: '2',
    isActive: true,
    type: 'image',
    desktopImageUrl: '/home/banner/portada.jpg',
    mobileImageUrl: '/home/banner/portadamobil.webp',
    linkUrl: 'https://whittard.com/envios',
  },
  {
    id: '3',
    isActive: true,
    type: 'video',
    videoUrl: '/home/banner/video.mp4',
  },
];

export const CATEGORY_SLIDES: CategorySlide[] = [
  {
    name: 'Tés',
    imageUrl: '/categoria1.png',
    slug: 'tea',
  },
  {
    name: 'Cafés',
    imageUrl: '/categoria1.png',
    slug: 'coffee',
  },
  {
    name: 'Chocolate',
    imageUrl: '/categoria1.png',
    slug: 'hot-chocolate',
  },
  {
    name: 'Regalos',
    imageUrl: '/categoria1.png',
    slug: 'gifts',
  },
  {
    name: 'Accesorios',
    imageUrl: '/categoria1.png',
    slug: 'equipment',
  },
  {
    name: 'Galletas',
    imageUrl: '/categoria1.png',
    slug: 'biscuits-chocolates',
  },
];

const SUMMER_FAVORITES = {
  imageUrl: '/imagenventasverano.png',
  title: 'Discover NEW Summer Favourites',
  description:
    'From calming infusions and refreshing instant teas to indulgent hot chocolates and buttery biscuits, expect bright tartness, soft florals, and a touch of nostalgic sweetness.',
};

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

const PRODUCTS: ProductCard[] = [
  card('1', 'Earl Grey Classic', 'earl-grey-classic', 45.0, 35.0, 12, 0),
  card('2', 'English Breakfast', 'english-breakfast', 42.0, null, 8, 4.6),
  card('3', 'Jasmine Green Tea', 'jasmine-green-tea', 48.0, 38.0, 3, 4.9),
  card('4', 'Manzanilla & Miel', 'chamomile-honey', 38.0, null, 20, 4.5),
  card('5', 'Matcha Premium Ceremonial', 'matcha-premium', 65.0, 55.0, 5, 4.7),
  card('6', 'Chocolate Caliente Deluxe', 'hot-chocolate-deluxe', 52.0, null, 0, 4.4),
];

export default function HomeView() {
  return (
    <Container as="main" size="full" className="mb-8 flex-1">
      <Banner slides={BANNER_SLIDES} />
      <Container className="mt-14 space-y-14">
        <CategoriesCarousel slides={CATEGORY_SLIDES} />
        <SummerFavorites content={SUMMER_FAVORITES} />
        <ProductCarousel products={PRODUCTS} title="¿Qué hay de nuevo esta temporada?" />
        <SummerFavorites content={SUMMER_FAVORITES} />
        <RecipeCarousel title="¿Has visto...?" recipes={MOCK_RECIPES} />
      </Container>
    </Container>
  );
}
