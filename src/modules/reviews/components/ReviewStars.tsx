import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const STAR_COLOR = '#E7A81B';

interface ReviewStarsProps {
  rating: number;
  /** Tamaño en píxeles de cada estrella. */
  size?: number;
  className?: string;
}

/** Estrellas de solo lectura que soportan calificaciones fraccionarias (ej: 4.3). */
export function ReviewStars({ rating, size = 16, className }: ReviewStarsProps) {
  const safeRating = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));

  return (
    <div
      role="img"
      aria-label={`${safeRating.toFixed(1)} de 5 estrellas`}
      className={cn('flex items-center gap-0.5', className)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, safeRating - index));

        return (
          <div
            key={index}
            className="relative"
            style={{ width: size, height: size }}
            aria-hidden="true"
          >
            <Star
              className="text-gray-300"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-[#E7A81B]"
                style={{ width: size, height: size, fill: STAR_COLOR }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
