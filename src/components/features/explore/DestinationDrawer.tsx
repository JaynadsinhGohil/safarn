import { useState, useEffect } from 'react';
import { X, Heart, MapPin, Clock, Star, Calendar, IndianRupee, Plus, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTrip } from '@/context/TripContext';
import { exploreService } from '@/services/exploreService';
import type { ExploreDestination, ExploreActivity } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DestinationDrawerProps {
  destination: ExploreDestination | null;
  onClose: () => void;
}

export function DestinationDrawer({ destination, onClose }: DestinationDrawerProps) {
  const [activities, setActivities] = useState<ExploreActivity[]>([]);
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const { isDestinationWishlisted, toggleDestinationWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const { trips, addCity } = useTrip();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!destination) return;
    exploreService.getActivitiesForDestination(destination.id).then(setActivities);
  }, [destination]);

  if (!destination) return null;

  const wishlisted = isDestinationWishlisted(destination.id);

  const handleAddToTrip = () => {
    if (!selectedTripId) return;
    const trip = trips.find(t => t.id === selectedTripId);
    if (!trip) return;
    addCity({
      id: `stop-${Date.now()}`,
      tripId: selectedTripId,
      destinationId: destination.id,
      name: destination.name,
      nights: destination.suggestedDays - 1,
      order: trip.cities.length,
    });
    toast({ title: `${destination.name} added to ${trip.name}!`, description: 'Open the Itinerary Builder to plan your days.' });
    setAddingToTrip(false);
    setSelectedTripId('');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} aria-hidden />
      
      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Hero */}
        <div className="relative h-72 shrink-0">
          <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => toggleDestinationWishlist(destination.id)}
            className={cn('absolute top-4 right-16 w-9 h-9 rounded-full flex items-center justify-center transition-all', wishlisted ? 'bg-red-500 text-white' : 'bg-black/40 backdrop-blur-sm text-white hover:bg-red-500')}
          >
            <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
          </button>
          
          <div className="absolute bottom-5 left-5">
            <h2 className="font-heading text-3xl font-bold text-white">{destination.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-white/80 text-sm"><MapPin className="w-3.5 h-3.5" />{destination.state}, {destination.country}</span>
              <span className="flex items-center gap-1 text-amber-400 text-sm"><Star className="w-3.5 h-3.5 fill-current" />{destination.rating}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-surface-container rounded-xl">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Suggested</p>
              <p className="font-semibold text-sm">{destination.suggestedDays} Days</p>
            </div>
            <div className="text-center p-3 bg-surface-container rounded-xl">
              <IndianRupee className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Avg / Day</p>
              <p className="font-semibold text-sm">{formatFromINR(destination.avgCostPerDay)}</p>
            </div>
            <div className="text-center p-3 bg-surface-container rounded-xl">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Best For</p>
              <p className="font-semibold text-sm">{destination.bestFor[0]}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{destination.description}</p>

          {/* Highlights */}
          <div>
            <h3 className="font-heading font-semibold mb-3">Highlights</h3>
            <ul className="space-y-2">
              {destination.highlights.map(h => (
                <li key={h} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Activities */}
          {activities.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold mb-3">Top Activities</h3>
              <div className="space-y-2">
                {activities.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                    <img src={a.image} alt={a.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.duration} • {formatFromINR(a.price)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 space-y-3 bg-background shrink-0">
          {addingToTrip ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Select a trip to add {destination.name}:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {trips.filter(t => t.status !== 'completed').map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTripId(t.id)}
                    className={cn('w-full text-left p-3 rounded-xl border text-sm transition-colors', selectedTripId === t.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30')}
                  >
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.startDate} – {t.endDate}</p>
                  </button>
                ))}
                {trips.filter(t => t.status !== 'completed').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming trips found. <button onClick={() => navigate('/trips/new')} className="text-primary underline">Create one?</button></p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setAddingToTrip(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAddToTrip} disabled={!selectedTripId}>
                  <Plus className="w-4 h-4 mr-2" /> Add to Trip
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toggleDestinationWishlist(destination.id)} className={cn('flex-1', wishlisted && 'text-red-500 border-red-200')}>
                <Heart className={cn('w-4 h-4 mr-2', wishlisted && 'fill-current')} />
                {wishlisted ? 'Wishlisted' : 'Save'}
              </Button>
              <Button variant="secondary" asChild className="flex-1 bg-surface-container hover:bg-surface-container/80">
                <Link to={`/explore/destination/${destination.id}`}>Details</Link>
              </Button>
              <Button className="flex-2 flex-1" onClick={() => setAddingToTrip(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
