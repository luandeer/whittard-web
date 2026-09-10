import { Container } from '@/shared/components/custom-ui/Container';
import { Skeleton } from '@/shared/components/shadcn-ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Skeleton className="aspect-square w-full rounded-xs" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <main>
      <Container className="mt-4">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-16" />
        </div>
      </Container>

      <Skeleton className="mb-6 h-44 w-full rounded-none" />

      <Container className="py-4 md:py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-xs border border-gray-200 bg-white p-4">
              <Skeleton className="h-5 w-24" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-xs" />
                    <Skeleton className="h-3 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="flex items-center justify-between border border-gray-200 bg-white px-4 py-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
