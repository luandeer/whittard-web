import type { ProductDetail } from '@/modules/products/types/catalog';
import { ReviewsSection } from '@/modules/reviews/components/ReviewsSection';
import { Container } from '@/shared/components/custom-ui/Container';
import { PageBreadcrumb } from '@/shared/components/custom-ui/PageBreadcrumb';
import { ProductHero } from './components/hero/ProductHero';
import { ProductCarousel } from './components/product-carousel/ProductCarousel';

interface DetailProductViewProps {
  product: ProductDetail;
}

export function DetailProductView({ product }: DetailProductViewProps) {
  const similarProducts = (product.similar_products ?? []).filter((card) => card.id !== product.id);
  const parent = product.category?.parent;

  const categoryPath = [parent?.slug, product.category?.slug].filter(Boolean).join('/');

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    ...(parent ? [{ label: parent.name, href: `/catalogo/${parent.slug}` }] : []),
    ...(product.category
      ? [{ label: product.category.name, href: `/catalogo/${categoryPath}` }]
      : []),
    { label: product.name },
  ];

  return (
    <Container as="main" className="py-6 md:py-10">
      <PageBreadcrumb items={breadcrumbItems} className="mb-6" />

      <ProductHero key={product.id} product={product} />

      <ReviewsSection
        productId={product.id}
        productSlug={product.slug}
        className="border-brand-primary/15 my-16 border-t pt-10 md:my-20 md:pt-12"
      />

      {similarProducts.length > 0 && (
        <ProductCarousel products={similarProducts} title="También te puede gustar" />
      )}
    </Container>
  );
}
