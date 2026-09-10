import { ProductCarousel } from '@/modules/products/components/product-carousel/ProductCarousel';
import { Container } from '@/shared/components/custom-ui/Container';

import type { LandingContent } from '../types/landing';
import { LandingBanner } from './LandingBanner';
import { LandingCardCarousel } from './LandingCardCarousel';
import { LandingCategories } from './LandingCategories';
import { LandingEditorial } from './LandingEditorial';
import { LandingEmpty } from './LandingEmpty';

interface LandingRendererProps {
  content: LandingContent;
  title?: string;
  categorySlug?: string | null;
}

/**
 * Renderiza las 5 secciones de la landing en orden fijo (ver `landing-final.md`):
 * 1. Hero Banner, 2. Carrusel de categorías, 3. Productos recomendados,
 * 4. Carrusel de landings destacadas y 5. Sección editorial.
 *
 * Las secciones vacías se omiten. El backend ya entrega los datos resueltos y
 * solo las secciones con contenido. Si no hay ninguna sección se muestra un
 * respaldo (LandingEmpty) para que la página nunca se vea en blanco.
 */
export function LandingRenderer({ content, title, categorySlug }: LandingRendererProps) {
  const hasBanner = Array.isArray(content.banner) && content.banner.length > 0;
  const hasCategories = Array.isArray(content.categories) && content.categories.length > 0;
  const hasProducts = Array.isArray(content.products) && content.products.length > 0;
  const hasLandings = Array.isArray(content.landings) && content.landings.length > 0;
  const hasFinalSection = Boolean(content.final_section);

  if (!hasBanner && !hasCategories && !hasProducts && !hasLandings && !hasFinalSection) {
    return <LandingEmpty title={title} categorySlug={categorySlug} />;
  }

  return (
    <>
      {hasBanner ? <LandingBanner data={content.banner} /> : null}

      {hasCategories ? <LandingCategories data={content.categories} /> : null}

      {hasProducts ? (
        <section className="py-14">
          <Container size="container" className="space-y-8">
            <ProductCarousel products={content.products ?? []} title="Productos recomendados" />
          </Container>
        </section>
      ) : null}

      {hasLandings ? <LandingCardCarousel data={content.landings} /> : null}

      {hasFinalSection ? <LandingEditorial data={content.final_section} /> : null}
    </>
  );
}
