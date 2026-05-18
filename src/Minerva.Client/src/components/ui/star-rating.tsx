import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      className={filled ? 'text-accent-gold' : 'text-ink-faint'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function StarRating({ rating, size = 14, className }: StarRatingProps) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= rating} size={size} />
      ))}
    </div>
  );
}
