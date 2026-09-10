import type { ReviewRatingSummary } from '../types/review';
import { ReviewStars } from './ReviewStars';

interface ReviewsSummaryProps {
  rating: ReviewRatingSummary;
}

export function ReviewsSummary({ rating }: ReviewsSummaryProps) {
  const parsedAverage = Number(rating.avg ?? 0);
  const average = Number.isFinite(parsedAverage) ? parsedAverage : 0;

  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-xs">
      <span className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
        Calificación promedio
      </span>

      <p className="text-brand-primary mt-3 text-5xl leading-none font-bold">
        {average.toFixed(1)}
      </p>

      <div className="mt-4">
        <ReviewStars rating={average} size={20} />
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Basado en {rating.count} {rating.count === 1 ? 'reseña' : 'reseñas'}
      </p>
    </div>
  );
}
