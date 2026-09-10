import { buildSeoMetadata } from '@/lib/seo';
import { SeoJsonLd } from '@/lib/seo-json-ld';
import { LandingRenderer } from '@/modules/landing/components/LandingRenderer';
import { LandingService } from '@/modules/landing/services/landing.service';
import { Container } from '@/shared/components/custom-ui/Container';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface LandingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await LandingService.getBySlug(slug);
  if (!data) return {};

  return buildSeoMetadata({
    seo: data.seo,
    defaults: { title: data.landing.title },
  });
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { slug } = await params;
  const data = await LandingService.getBySlug(slug);
  if (!data) notFound();

  return (
    <>
      <Container as="main" size="full" className="mb-8 flex-1">
        <LandingRenderer
          content={data.content}
          title={data.landing.title}
          categorySlug={data.landing.category?.slug}
        />
      </Container>
      <SeoJsonLd data={data.seo?.structured_data ?? null} />
    </>
  );
}
