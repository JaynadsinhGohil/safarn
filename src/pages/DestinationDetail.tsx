import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { exploreService } from '@/services/exploreService';
import type { ExploreDestination, ExploreActivity } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTrip } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Heart, MapPin, Clock, Calendar, IndianRupee, 
  Check, Plus, ChevronRight, Star, Compass 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<ExploreDestination | null>(null);
  const [activities, setActivities] = useState<ExploreActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add to Trip state
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');

  const { isDestinationWishlisted, toggleDestinationWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const { trips, activeTrip, addCity } = useTrip();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    exploreService.getDestinationById(id).then(dest => {
      if (dest) {
        setDestination(dest);
        exploreService.getActivitiesForDestination(dest.id).then(setActivities);
      }
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
            <div className="h-64 bg-surface-container rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!destination) {
    return (
      <PageContainer maxWidth="wide" className="py-24 text-center flex flex-col items-center">
        <Compass className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="font-heading text-2xl font-bold mb-2">Destination Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the destination you're looking for.</p>
        <Button onClick={() => navigate('/explore')}>Return to Explore</Button>
      </PageContainer>
    );
  }

  const wishlisted = isDestinationWishlisted(destination.id);

  const handleAddToTrip = () => {
    // If we have an active trip, use it, otherwise use selected
    const targetTripId = activeTrip?.id || selectedTripId;
    if (!targetTripId) return;

    const trip = activeTrip?.id === targetTripId ? activeTrip : trips.find(t => t.id === targetTripId);
    if (!trip) return;

    addCity({
      id: `stop-${Date.now()}`,
      tripId: targetTripId,
      destinationId: destination.id,
      name: destination.name,
      nights: destination.suggestedDays - 1,
      order: trip.cities.length,
    });

    toast({ title: `${destination.name} added!`, description: `Added to ${trip.name}.` });
    setAddingToTrip(false);
  };

  const handleOpenAdd = () => {
    if (activeTrip) {
      // Direct add if there's an active trip context
      handleAddToTrip();
    } else {
      setAddingToTrip(true);
    }
  };

  return (
    <PageContainer maxWidth="wide" className="py-6 md:py-8 pb-32">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] max-h-[500px] rounded-3xl overflow-hidden mb-10 group">
        <img src={destination.image} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20">
              {destination.region}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium">
              <MapPin className="w-4 h-4" /> {destination.state}, {destination.country}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-sm">{destination.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <span className="flex items-center gap-1.5"><Star className="w-5 h-5 fill-amber-400 text-amber-400" /> <span className="font-semibold text-lg">{destination.rating}</span></span>
            <span className="flex items-center gap-1.5"><Clock className="w-5 h-5 opacity-80" /> {destination.suggestedDays} Days Suggested</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-5 h-5 opacity-80" /> Best: {destination.bestFor.join(', ')}</span>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <button 
            onClick={() => toggleDestinationWishlist(destination.id)}
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
            <h2 className="font-heading text-2xl font-semibold mb-4">About {destination.name}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {destination.description}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mb-4">Why Visit?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {destination.highlights.map(h => (
                <div key={h} className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container border border-border/40">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-medium">{h}</span>
                </div>
              ))}
            </div>
          </section>

          {activities.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-semibold">Top Experiences</h2>
                <Button variant="ghost" asChild>
                  <Link to={`/explore/activities?dest=${destination.id}`}>View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {activities.map(a => (
                  <Link key={a.id} to={`/explore/activity/${a.id}`} className="group flex items-center gap-4 p-3 bg-surface rounded-2xl border border-border/40 hover:border-primary/40 hover:shadow-sm transition-all">
                    <img src={a.image} alt={a.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{a.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {a.duration}</span>
                        <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1" /> {formatFromINR(a.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-surface-container/50 border border-border/50 rounded-3xl sticky top-24">
            <h3 className="font-heading font-semibold text-xl mb-6">Trip Planning</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Ideal Duration</span>
                <span className="font-semibold">{destination.suggestedDays} Days</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Avg. Daily Cost</span>
                <span className="font-semibold">{formatFromINR(destination.avgCostPerDay)}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Best Time</span>
                <span className="font-semibold text-right max-w-[140px] leading-tight">{destination.bestFor[0]}</span>
              </div>
            </div>

            <Button size="lg" className="w-full text-base h-14 rounded-2xl shadow-sm" onClick={handleOpenAdd}>
              <Plus className="w-5 h-5 mr-2" /> 
              {activeTrip ? `Add to ${activeTrip.name}` : 'Add to Trip'}
            </Button>
            
            {activeTrip && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Adds a {destination.suggestedDays - 1}-night stop to your active trip.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Select Trip Dialog */}
      <Dialog open={addingToTrip} onOpenChange={setAddingToTrip}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Add to Trip</DialogTitle>
            <DialogDescription>
              Select an existing trip or create a new one to add {destination.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {trips.filter(t => t.status !== 'completed').map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTripId(t.id)}
                className={cn('w-full flex flex-col items-start p-4 rounded-2xl border transition-all text-left', 
                  selectedTripId === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/40 bg-surface'
                )}
              >
                <span className="font-semibold text-base">{t.name}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {t.cities.length} cities • {t.startDate}
                </span>
              </button>
            ))}
            
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground uppercase font-medium tracking-wider">Or</span></div>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-xl border-dashed" onClick={() => navigate('/trips/new')}>
              <Plus className="w-4 h-4 mr-2" /> Create New Trip
            </Button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddingToTrip(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleAddToTrip} disabled={!selectedTripId} className="flex-1 rounded-xl">
              <Check className="w-4 h-4 mr-2" /> Add Destination
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
