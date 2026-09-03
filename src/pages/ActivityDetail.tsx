import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { exploreService } from '@/services/exploreService';
import type { ExploreActivity, Activity } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTrip } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Heart, MapPin, Clock, IndianRupee, 
  Check, Plus, Star, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ExploreActivity | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Add to Trip state
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedDayId, setSelectedDayId] = useState('');

  const { isActivityWishlisted, toggleActivityWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const { trips, activeTrip, addActivity } = useTrip();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    exploreService.getActivityById(id).then(act => {
      setActivity(act || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <PageContainer maxWidth="wide" className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-[40vh] bg-surface-container rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-surface-container rounded w-1/3" />
              <div className="h-4 bg-surface-container rounded w-full" />
              <div className="h-4 bg-surface-container rounded w-full" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!activity) {
    return (
      <PageContainer maxWidth="wide" className="py-24 text-center flex flex-col items-center">
        <Zap className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="font-heading text-2xl font-bold mb-2">Activity Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the activity you're looking for.</p>
        <Button onClick={() => navigate('/explore/activities')}>Return to Activities</Button>
      </PageContainer>
    );
  }

  const wishlisted = isActivityWishlisted(activity.id);

  // Default selected trip to active trip if not chosen yet
  const displayTripId = selectedTripId || (activeTrip ? activeTrip.id : '');
  const selectedTrip = trips.find(t => t.id === displayTripId);

  const handleAddToTrip = () => {
    if (!displayTripId || !selectedDayId) return;

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
    toast({ title: `${activity.name} added!`, description: 'Successfully added to your itinerary.' });
    setAddingToTrip(false);
  };

  return (
    <PageContainer maxWidth="wide" className="py-6 md:py-8 pb-32">
      <Link to="/explore/activities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Activities
      </Link>

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] max-h-[500px] rounded-3xl overflow-hidden mb-10 group">
        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider capitalize border border-white/20">
              {activity.category}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium">
              <MapPin className="w-4 h-4" /> {activity.destinationName}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-sm">{activity.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <span className="flex items-center gap-1.5"><Star className="w-5 h-5 fill-amber-400 text-amber-400" /> <span className="font-semibold text-lg">{activity.rating}</span></span>
            <span className="flex items-center gap-1.5"><Clock className="w-5 h-5 opacity-80" /> {activity.duration}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5 opacity-80" /> {activity.location}</span>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <button 
            onClick={() => toggleActivityWishlist(activity.id)}
            className={cn("w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all border", 
              wishlisted ? "bg-red-500/90 border-red-400 text-white" : "bg-black/30 border-white/20 text-white hover:bg-black/50"
            )}
          >
            <Heart className={cn("w-5 h-5", wishlisted && "fill-current")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="font-heading text-2xl font-semibold mb-4">About this Activity</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {activity.description}
            </p>
          </section>

          {/* We can mock up inclusions or what to expect if needed, but keeping it simple for now */}
          <section>
            <h2 className="font-heading text-xl font-semibold mb-4">What to Expect</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container border border-border/40">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium text-sm">Professional Guide</span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container border border-border/40">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium text-sm">All equipment provided</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-surface-container/50 border border-border/50 rounded-3xl sticky top-24">
            <h3 className="font-heading font-semibold text-xl mb-6">Booking Info</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Price</span>
                <span className="font-semibold">{activity.price === 0 ? 'Free' : formatFromINR(activity.price)}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                <span className="font-semibold">{activity.duration}</span>
              </div>
            </div>

            <Button size="lg" className="w-full text-base h-14 rounded-2xl shadow-sm" onClick={() => setAddingToTrip(true)}>
              <Plus className="w-5 h-5 mr-2" /> Add to Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Select Trip & Day Dialog */}
      <Dialog open={addingToTrip} onOpenChange={setAddingToTrip}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Add to Trip</DialogTitle>
            <DialogDescription>
              Select an itinerary day to add {activity.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            
            {/* Step 1: Select Trip */}
            <div>
              <p className="text-sm font-medium mb-2">1. Select Trip</p>
              <div className="space-y-2">
                {trips.filter(t => t.status !== 'completed').map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTripId(t.id); setSelectedDayId(''); }}
                    className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left text-sm', 
                      displayTripId === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20 font-medium' : 'border-border/50 hover:border-primary/40 bg-surface'
                    )}
                  >
                    <span>{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.startDate}</span>
                  </button>
                ))}
                {trips.filter(t => t.status !== 'completed').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No active trips found. <Link to="/trips/new" className="text-primary underline">Create one</Link>
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Select Day */}
            {selectedTrip && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm font-medium mb-2">2. Select Day</p>
                <div className="space-y-2">
                  {selectedTrip.days.map(day => {
                    const city = selectedTrip.cities.find(c => c.id === day.cityId);
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left text-sm', 
                          selectedDayId === day.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20 font-medium' : 'border-border/50 hover:border-primary/40 bg-surface'
                        )}
                      >
                        <div>
                          <span className="font-semibold mr-2">Day {day.dayNumber}</span>
                          <span className="text-muted-foreground">{day.date}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-surface-container rounded-md truncate max-w-[120px]">
                          {city?.name || 'Transit'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddingToTrip(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleAddToTrip} disabled={!displayTripId || !selectedDayId} className="flex-1 rounded-xl">
              <Check className="w-4 h-4 mr-2" /> Add Activity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
