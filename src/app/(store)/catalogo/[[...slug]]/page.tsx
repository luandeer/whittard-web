import { buildSeoMetadata } from '@/lib/seo';
import { SeoJsonLd } from '@/lib/seo-json-ld';
import { ProductsCatalogView } from '@/modules/products/ProductsCatalogView';
import { CatalogService } from '@/modules/products/services/catalog.service';
import type { CategoryPath } from '@/modules/products/types/catalog';
import { parseCatalogSearchParams } from '@/modules/products/utils/catalog-query';
import { isNotFoundError } from '@/modules/products/utils/errors';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface CatalogPageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Pick<CatalogPageProps, 'params'>): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray ?? [];
  if (slug.length === 0) return {};

  try {
    const category = await CatalogService.getCategoryByPath(slug.join('/'));
    return buildSeoMetadata({
      seo: category.seo,
      defaults: { title: category.category.name },
    });
  } catch (error) {
    if (isNotFoundError(error)) return {};
    throw error;
  }
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { slug: slugArray } = await params;
  const query = await searchParams;
  const slug = slugArray ?? [];

  let category: CategoryPath | null = null;
  if (slug.length > 0) {
    try {
      category = await CatalogService.getCategoryByPath(slug.join('/'));
    } catch (error) {
      if (isNotFoundError(error)) notFound();
      throw error;
    }
  }
  console.log('categoria:', category);

  const productsParams = {
    ...parseCatalogSearchParams(query),
    ...(slug.length > 0 ? { category: slug.join('/') } : {}),
  };

  const [productsResponse, filters] = await Promise.all([
    CatalogService.getProducts(productsParams),
    CatalogService.getFilters(),
  ]);

  console.log('product:', productsResponse);

  // Cada cambio de filtros cambia el query string: el `key` remonta la vista
  // (reset de estado local: página 1, inputs de precio, scroll infinito).
  const viewKey = Object.keys(query)
    .sort()
    .map((key) => `${key}=${Array.isArray(query[key]) ? query[key].join(',') : query[key]}`)
    .join('&');

  return (
    <>
      <ProductsCatalogView
        key={viewKey}
        slug={slug}
        category={category}
        products={productsResponse.items}
        pagination={productsResponse.pagination}
        filters={filters}
      />
      <SeoJsonLd data={category?.seo?.structured_data} />
    </>
  );
}
