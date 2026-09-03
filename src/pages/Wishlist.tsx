import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useSettings } from '@/context/SettingsContext';
import { EXPLORE_DESTINATIONS } from '@/data/mock/destinations';
import { EXPLORE_ACTIVITIES } from '@/data/mock/activities';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MapPin, Trash2, Compass, Zap, Star, Clock, IndianRupee, ArrowLeft
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import { ActivityDetailSheet } from '@/components/features/explore/ActivityDetailSheet';
import type { ExploreActivity, ExploreDestination } from '@/types';
import { useTrip } from '@/context/TripContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type Tab = 'destinations' | 'activities';

export function Wishlist() {
  const [tab, setTab] = useState<Tab>('destinations');
  const [selectedActivity, setSelectedActivity] = useState<ExploreActivity | null>(null);
  const [addingDest, setAddingDest] = useState<ExploreDestination | null>(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  
  const { wishlist, toggleDestinationWishlist, toggleActivityWishlist } = useSettings();
  const { formatFromINR } = useCurrency();
  const { trips, activeTrip, addCity } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();

  const savedDestinations = EXPLORE_DESTINATIONS.filter(d => wishlist.destinations.includes(d.id));
  const savedActivities = EXPLORE_ACTIVITIES.filter(a => wishlist.activities.includes(a.id));

  const handleAddDestToTrip = () => {
    if (!addingDest) return;
    const targetTripId = activeTrip?.id || selectedTripId;
    if (!targetTripId) return;

    const trip = activeTrip?.id === targetTripId ? activeTrip : trips.find(t => t.id === targetTripId);
    if (!trip) return;

    addCity({
      id: `stop-${Date.now()}`,
      tripId: targetTripId,
      destinationId: addingDest.id,
      name: addingDest.name,
      nights: addingDest.suggestedDays - 1,
      order: trip.cities.length,
    });

    toast({ title: `${addingDest.name} added!`, description: `Added to ${trip.name}.` });
    setAddingDest(null);
  };

  return (
    <PageContainer maxWidth="default" className="py-8 md:py-12 pb-32">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link
          to="/explore"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase tracking-wider font-semibold">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span>Saved Items</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Your Wishlist</h1>
        <p className="text-muted-foreground mt-2">
          {wishlist.destinations.length + wishlist.activities.length} saved items
        </p>
      </motion.div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-8">
        {([['destinations', 'Destinations', Compass], ['activities', 'Activities', Zap]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              tab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-semibold',
              tab === key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {key === 'destinations' ? savedDestinations.length : savedActivities.length}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'destinations' && (
          <motion.div
            key="destinations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {savedDestinations.length === 0 ? (
              <EmptyState
                type="destinations"
                description="Save destinations from Explore to build your travel wishlist."
                link="/explore"
                linkLabel="Browse Destinations"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {savedDestinations.map((dest, i) => (
                    <motion.div
                      key={dest.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.04 }}
                      className="group relative rounded-2xl overflow-hidden bg-surface border border-border/40 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <button
                          onClick={() => toggleDestinationWishlist(dest.id)}
                          aria-label={`Remove ${dest.name} from wishlist`}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 hover:bg-destructive/80 backdrop-blur-sm flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-heading font-bold text-white text-lg leading-tight">{dest.name}</h3>
                          <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {dest.state}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium capitalize">
                            {dest.budgetLevel}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                            {dest.suggestedDays} days
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {dest.rating}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{dest.description}</p>
                        <div className="flex gap-2 pt-1">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeTrip) {
                                setAddingDest(dest);
                                setSelectedTripId(activeTrip.id);
                              } else {
                                setAddingDest(dest);
                              }
                            }}
                          >
                            Add to Trip
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            asChild
                          >
                            <Link to={`/explore/destination/${dest.id}`}>Details</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleDestinationWishlist(dest.id)}
                            className="text-destructive hover:bg-destructive/5 border-destructive/30"
                          >
                            <Heart className="w-4 h-4 fill-destructive text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {savedActivities.length === 0 ? (
              <EmptyState
                type="activities"
                description="Save activities from Explore to remember what you want to do."
                link="/explore/activities"
                linkLabel="Browse Activities"
              />
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {savedActivities.map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border/40 hover:border-border transition-colors group cursor-pointer"
                      onClick={() => setSelectedActivity(act)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity(act)}
                      aria-label={`View details for ${act.name}`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={act.image} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold truncate">{act.name}</h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {act.rating}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" /> {act.destinationName}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {act.duration}</span>
                          <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {formatFromINR(act.price)}</span>
                          <span className="capitalize px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{act.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleActivityWishlist(act.id); }}
                        aria-label={`Remove ${act.name} from wishlist`}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Detail Sheet */}
      <ActivityDetailSheet
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      {/* Select Trip Dialog for Destinations */}
      <Dialog open={!!addingDest} onOpenChange={(open) => !open && setAddingDest(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Add to Trip</DialogTitle>
            <DialogDescription>
              Select an existing trip or create a new one to add {addingDest?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {trips.filter(t => t.status !== 'completed').map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTripId(t.id)}
                className={cn('w-full flex flex-col items-start p-4 rounded-2xl border transition-all text-left', 
                  (selectedTripId || activeTrip?.id) === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/40 bg-surface'
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
              <Zap className="w-4 h-4 mr-2" /> Create New Trip
            </Button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddingDest(null)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleAddDestToTrip} disabled={!(selectedTripId || activeTrip?.id)} className="flex-1 rounded-xl">
              Add Destination
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function EmptyState({ type, description, link, linkLabel }: {
  type: 'destinations' | 'activities';
  description: string;
  link: string;
  linkLabel: string;
}) {
  const Icon = type === 'destinations' ? Compass : Zap;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="font-heading text-xl font-bold mb-2">Nothing saved yet</h2>
      <p className="text-muted-foreground max-w-xs mb-6">{description}</p>
      <Button asChild>
        <Link to={link}>{linkLabel}</Link>
      </Button>
    </div>
  );
}
