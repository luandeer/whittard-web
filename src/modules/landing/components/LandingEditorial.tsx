import { Container } from '@/shared/components/custom-ui/Container';
import { Heading } from '@/shared/components/custom-ui/Heading';
import { RichText } from '@/shared/components/custom-ui/rich-text';

import type { LandingFinalSection } from '../types/landing';

function toSection(value: unknown): LandingFinalSection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const block = value as Record<string, unknown>;
  const title = typeof block.title === 'string' ? block.title : '';
  const imageUrl = typeof block.image_url === 'string' ? block.image_url : '';
  const contentHtml = typeof block.content_html === 'string' ? block.content_html : '';

  if (!title && !imageUrl && !contentHtml) return null;

  return {
    ...(title ? { title } : {}),
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(contentHtml ? { content_html: contentHtml } : {}),
  };
}

interface LandingEditorialProps {
  data: unknown;
}

/**
 * Sección 5 · Contenido editorial / libre.
 *
 * Sección final con título, imagen opcional y contenido HTML enriquecido.
 */
export function LandingEditorial({ data }: LandingEditorialProps) {
  const section = toSection(data);

  if (!section) return null;

  const hasImage = Boolean(section.image_url);

  return (
    <section className="py-14">
      <Container size="container">
        <div className={`grid items-center gap-10 ${hasImage ? 'lg:grid-cols-2' : ''}`}>
          {hasImage ? (
            <div
              className="aspect-[4/3] w-full rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${section.image_url})` }}
              role="img"
              aria-label={section.title ?? 'Imagen de la sección'}
            />
          ) : null}

          <div className="flex flex-col gap-5">
            {section.title ? (
              <Heading as="h2" variant="heading" className="font-brand-elephant">
                {section.title}
              </Heading>
            ) : null}
            {section.content_html ? <RichText html={section.content_html} /> : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
