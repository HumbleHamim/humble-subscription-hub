import { Star } from 'lucide-react';

export function Rating({
  rating,
  count,
  size = 'sm',
  showEmpty = true,
}: {
  rating: number;
  count?: number;
  size?: 'xs' | 'sm' | 'md';
  showEmpty?: boolean;
}) {
  const starSize = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const textSize = size === 'xs' ? 'text-[10px]' : size === 'md' ? 'text-sm' : 'text-xs';

  if (!showEmpty && rating <= 0) return null;

  if (rating <= 0) {
    return (
      <div className={`flex items-center gap-1.5 ${textSize} font-semibold text-gray-400`}>
        <div className="flex items-center text-gray-200">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={`${starSize} fill-current`} strokeWidth={0} />
          ))}
        </div>
        <span>No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center text-yellow-400`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`${starSize} ${index < Math.round(rating) ? 'fill-current' : 'fill-none text-gray-200'}`}
            strokeWidth={index < Math.round(rating) ? 0 : 1.5}
            stroke="currentColor"
          />
        ))}
      </div>
      <span className={`${textSize} font-semibold text-gray-400`}>
        {rating.toFixed(1)}
        {typeof count === 'number' ? ` (${count})` : ''}
      </span>
    </div>
  );
}
