import { buildSeoMetadata } from '@/lib/seo';
import { SeoJsonLd } from '@/lib/seo-json-ld';
import { DetailProductView } from '@/modules/products/DetailProductView';
import { CatalogService } from '@/modules/products/services/catalog.service';
import { isNotFoundError } from '@/modules/products/utils/errors';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await CatalogService.getProductBySlug(slug);

    return buildSeoMetadata({
      seo: product.seo,
      defaults: {
        title: product.name,
        description: product.descriptions?.short ?? undefined,
        image: product.variants?.[0]?.media?.[0]?.url ?? undefined,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) return {};
    throw error;
  }
}

export async function generateStaticParams() {
  try {
    const sitemap = await CatalogService.getSitemap();
    return sitemap.products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { variant } = await searchParams;

  let product;
  try {
    product = await CatalogService.getProductBySlug(slug, variant);
    console.log('producto:', product);
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  return (
    <>
      <DetailProductView product={product} />
      <SeoJsonLd data={product.seo?.structured_data} />
    </>
  );
}
