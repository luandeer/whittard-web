import type { BannerSlide } from '@/shared/components/custom-ui/banner';
import { Banner } from '@/shared/components/custom-ui/banner';

import type { LandingBannerSlide } from '../types/landing';

function toBannerSlides(value: unknown): BannerSlide[] {
  if (!Array.isArray(value)) return [];

  const slides: BannerSlide[] = [];

  (value as LandingBannerSlide[]).forEach((slide, index) => {
    const id = `hero-${index}`;

    if (slide.type === 'video') {
      if (slide.video_url) {
        slides.push({
          id,
          isActive: true,
          type: 'video',
          videoUrl: slide.video_url,
          ...(slide.link_url ? { linkUrl: slide.link_url } : {}),
        });
      }

      return;
    }

    if (!slide.desktop_image_url) return;

    const image: BannerSlide = {
      id,
      isActive: true,
      type: 'image',
      desktopImageUrl: slide.desktop_image_url,
      ...(slide.link_url ? { linkUrl: slide.link_url } : {}),
    };

    if (slide.mobile_image_url) image.mobileImageUrl = slide.mobile_image_url;

    slides.push(image);
  });

  return slides;
}

/**
 * Sección 1 · Hero Banner.
 *
 * Reutiliza el componente `Banner` del Home: la landing solo aporta los slides
 * con el contrato que ese componente espera (imagen desktop/móvil o video).
 */
export function LandingBanner({ data }: { data: unknown }) {
  const slides = toBannerSlides(data);

  if (slides.length === 0) return null;

  return <Banner slides={slides} />;
}
