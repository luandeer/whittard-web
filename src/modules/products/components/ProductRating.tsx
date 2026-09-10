'use client';

import { cn } from '@/lib/utils';
import { useId, useState, type MouseEvent } from 'react';

interface ProductRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Permite elegir medias estrellas (ej: 4.5) haciendo clic en la mitad izquierda de una estrella. */
  allowHalf?: boolean;
}

const sizeMap = { sm: 'size-4', md: 'size-5', lg: 'size-6' };

function StarIcon({ fill, className }: { fill: number; className?: string }) {
  const uniqueId = useId();

  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={`rating-fill-${uniqueId}`}>
          <stop offset={`${fill * 100}%`} stopColor="#E7A81B" />
          <stop offset={`${fill * 100}%`} stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#rating-fill-${uniqueId})`}
        className="stroke-transparent"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

function resolvePointerRating(event: MouseEvent<HTMLButtonElement>, star: number): number {
  const rect = event.currentTarget.getBoundingClientRect();
  const isLeftHalf = rect.width > 0 && event.clientX - rect.left < rect.width / 2;

  const rating = isLeftHalf ? star - 0.5 : star;

  return Math.max(1, rating);
}

export function ProductRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  allowHalf = false,
}: ProductRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const handleMove = (event: MouseEvent<HTMLButtonElement>, star: number) => {
    if (readonly) return;
    setHovered(allowHalf ? resolvePointerRating(event, star) : star);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>, star: number) => {
    if (readonly) return;
    onChange?.(allowHalf ? resolvePointerRating(event, star) : star);
  };

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => {
        const starFill = Math.max(0, Math.min(1, display - star + 1));
        const checked = value === star || value === star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            role="radio"
            aria-checked={checked}
            aria-label={`${star} de 5 estrellas`}
            onClick={(event) => handleClick(event, star)}
            onMouseMove={(event) => handleMove(event, star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              'transition-transform',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            )}
          >
            <StarIcon fill={starFill} className={cn(sizeMap[size])} />
          </button>
        );
      })}
    </div>
  );
}
