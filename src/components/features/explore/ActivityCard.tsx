import { Heart, MapPin, Clock, Star } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/hooks/useCurrency';
import type { ExploreActivity } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  culture: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  food: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  nature: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  relaxation: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  sightseeing: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
  spiritual: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
};

interface ActivityCardProps {
  activity: ExploreActivity;
  onClick: () => void;
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const { isActivityWishlisted, toggleActivityWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const wishlisted = isActivityWishlisted(activity.id);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-surface border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <button
          onClick={e => { e.stopPropagation(); toggleActivityWishlist(activity.id); }}
          className={cn('absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all', wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-red-500')}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
        </button>

        <span className={cn('absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium capitalize', CATEGORY_COLORS[activity.category] ?? CATEGORY_COLORS.sightseeing)}>
          {activity.category}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{activity.name}</h3>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{activity.destinationName}</span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-current" />{activity.rating}</span>
          </div>
          <p className="text-sm font-semibold text-primary">
            {activity.price === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : formatFromINR(activity.price)}
          </p>
        </div>
      </div>
    </div>
  );
}
