import Link from 'next/link';

import { Container } from '@/shared/components/custom-ui/Container';
import { Heading } from '@/shared/components/custom-ui/Heading';

interface LandingEmptyProps {
  title?: string;
  categorySlug?: string | null;
}

/**
 * Respaldo visual cuando la landing no tiene secciones publicadas:
 * nunca se muestra un cuerpo en blanco.
 */
export function LandingEmpty({ title, categorySlug }: LandingEmptyProps) {
  const categoryUrl = categorySlug ? `/catalogo/${categorySlug}` : '/catalogo';

  return (
    <section className="py-20">
      <Container size="container" className="flex flex-col items-center gap-5 text-center">
        {title ? (
          <Heading as="h1" variant="heading" className="font-brand-elephant">
            {title}
          </Heading>
        ) : null}
        <p className="text-brand-secondary max-w-xl text-sm leading-relaxed md:text-base">
          Estamos preparando el contenido de esta página. Mientras tanto puedes explorar todos los
          productos de la categoría.
        </p>
        <Link
          href={categoryUrl}
          className="bg-brand-primary text-brand-white inline-flex items-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
        >
          Ver catálogo
        </Link>
      </Container>
    </section>
  );
}
