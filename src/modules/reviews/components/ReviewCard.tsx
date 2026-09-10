'use client';

import { formatDate } from '@/lib/utils';
import { UserAvatar } from '@/shared/components/custom-ui/UserAvatar';
import { BadgeCheck } from 'lucide-react';
import Image from 'next/image';

import type { ProductReview } from '../types/review';
import { ReviewStars } from './ReviewStars';

interface ReviewCardProps {
  review: ProductReview;
}

function toISODate(value: string | null): string | null {
  if (!value) return null;
  return value.includes('T') ? value : value.replace(' ', 'T');
}

export function ReviewCard({ review }: ReviewCardProps) {
  const authorName = review.customer?.name ?? 'Cliente';

  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={authorName} size="sm" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium text-gray-800">{authorName}</span>
            {review.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <BadgeCheck className="size-3.5" />
                Compra verificada
              </span>
            )}
          </div>
        </div>

        {review.created_at && (
          <time
            className="text-xs text-gray-400"
            dateTime={toISODate(review.created_at) ?? undefined}
          >
            {formatDate(toISODate(review.created_at))}
          </time>
        )}
      </div>

      <ReviewStars rating={review.rating} size={16} />

      {review.body && <p className="text-brand-secondary text-sm leading-relaxed">{review.body}</p>}

      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.images.map((image) => (
            <Image
              key={image}
              src={image}
              alt="Imagen de la reseña"
              width={64}
              height={64}
              unoptimized
              className="rounded-lg border border-gray-200 object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}
