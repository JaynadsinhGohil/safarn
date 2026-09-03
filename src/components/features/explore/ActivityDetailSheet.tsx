import { useState } from 'react';
import { X, Heart, MapPin, Clock, Star, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTrip } from '@/context/TripContext';
import type { ExploreActivity, Activity } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';

interface ActivityDetailSheetProps {
  activity: ExploreActivity | null;
  onClose: () => void;
}

export function ActivityDetailSheet({ activity, onClose }: ActivityDetailSheetProps) {
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedDayId, setSelectedDayId] = useState('');
  const { isActivityWishlisted, toggleActivityWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const { trips, addActivity } = useTrip();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!activity) return null;
  const wishlisted = isActivityWishlisted(activity.id);
  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const handleAddToTrip = () => {
    if (!selectedTripId || !selectedDayId) return;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      dayId: selectedDayId,
      title: activity.name,
      description: activity.description,
      location: activity.location,
      estimatedCost: activity.price,
      type: activity.category as Activity['type'],
    };
    addActivity(selectedDayId, newActivity);
    toast({ title: `${activity.name} added!`, description: 'Open the Itinerary Builder to view it.' });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} aria-hidden />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Hero */}
        <div className="relative h-56 shrink-0">
          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleActivityWishlist(activity.id)}
            className={cn('absolute top-4 right-16 w-9 h-9 rounded-full flex items-center justify-center transition-all', wishlisted ? 'bg-red-500 text-white' : 'bg-black/40 backdrop-blur-sm text-white')}
          >
            <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">{activity.category}</span>
          <h2 className="font-heading text-xl font-bold mt-2">{activity.name}</h2>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{activity.location}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-surface-container rounded-xl">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">{activity.duration}</p>
            </div>
            <div className="text-center p-3 bg-surface-container rounded-xl">
              <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="text-sm font-semibold">{activity.rating}/5</p>
            </div>
            <div className="text-center p-3 bg-surface-container rounded-xl">
              <p className="text-primary font-bold text-base mx-auto mb-1">{activity.price === 0 ? '₹0' : activity.price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Per Person</p>
              <p className="text-sm font-semibold">{activity.price === 0 ? 'Free' : formatFromINR(activity.price)}</p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 bg-background shrink-0 space-y-3">
          {addingToTrip ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Select a trip:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {trips.filter(t => t.status !== 'completed').map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTripId(t.id); setSelectedDayId(''); }}
                    className={cn('w-full text-left p-3 rounded-xl border text-sm transition-colors', selectedTripId === t.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30')}
                  >
                    {t.name}
                  </button>
                ))}
                {trips.filter(t => t.status !== 'completed').length === 0 && (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    <button onClick={() => navigate('/trips/new')} className="text-primary underline">Create a trip first</button>
                  </p>
                )}
              </div>
              {selectedTrip && (
                <>
                  <p className="text-sm font-medium">Select a day:</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedTrip.days.map(day => (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        className={cn('w-full text-left p-2 rounded-lg border text-xs transition-colors', selectedDayId === day.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30')}
                      >
                        Day {day.dayNumber} — {day.date}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setAddingToTrip(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAddToTrip} disabled={!selectedDayId}>
                  <Check className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toggleActivityWishlist(activity.id)} className={cn('flex-1', wishlisted && 'text-red-500')}>
                <Heart className={cn('w-4 h-4 mr-2', wishlisted && 'fill-current')} /> {wishlisted ? 'Saved' : 'Save'}
              </Button>
              <Button variant="secondary" asChild className="flex-1 bg-surface-container hover:bg-surface-container/80">
                <Link to={`/explore/activity/${activity.id}`}>Details</Link>
              </Button>
              <Button className="flex-1" onClick={() => setAddingToTrip(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
