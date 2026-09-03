import { Heart, MapPin, Clock, Star } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/hooks/useCurrency';
import type { ExploreDestination } from '@/types';
import { cn } from '@/lib/utils';

interface DestinationCardProps {
  destination: ExploreDestination;
  onClick: () => void;
}

const BUDGET_LABELS = { budget: 'Budget', 'mid-range': 'Mid-Range', luxury: 'Luxury' };
const BUDGET_COLORS = { budget: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50', 'mid-range': 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50', luxury: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50' };

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  const { isDestinationWishlisted, toggleDestinationWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const wishlisted = isDestinationWishlisted(destination.id);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-surface border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); toggleDestinationWishlist(destination.id); }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all',
            wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-red-500'
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
        </button>

        {/* Budget badge */}
        <span className={cn('absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium', BUDGET_COLORS[destination.budgetLevel])}>
          {BUDGET_LABELS[destination.budgetLevel]}
        </span>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-white text-lg leading-tight">{destination.name}</h3>
          <p className="text-white/80 text-xs">{destination.state}, {destination.country}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{destination.description}</p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{destination.suggestedDays} days</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{destination.region.replace(' India', '')}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-medium text-foreground">{destination.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div>
            <p className="text-xs text-muted-foreground">Avg / day</p>
            <p className="text-sm font-semibold text-primary">{formatFromINR(destination.avgCostPerDay)}</p>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {destination.travelStyles.slice(0, 2).map(s => (
              <span key={s} className="px-2 py-0.5 bg-surface-container rounded-full text-xs text-muted-foreground">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
