import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '@/context/TripContext';
import { EXPLORE_DESTINATIONS } from '@/data/mock/destinations';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Sparkles, Plus, Minus, MapPin, Users, Quote, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateNights, generateItineraryDays } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

const createTripSchema = z.object({
  name: z.string().min(3, "Trip name must be at least 3 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  type: z.string().min(1, "Trip type is required"),
  travelers: z.number().min(1, "Must have at least 1 traveler"),
  destinationId: z.string().min(1, "Primary destination is required"),
  notes: z.string().optional(),
});

type CreateTripValues = z.infer<typeof createTripSchema>;

const TRIP_TYPES = [
  { id: 'Relaxation', label: 'Relaxation & Leisure' },
  { id: 'Cultural', label: 'Cultural Deep Dive' },
  { id: 'Adventure', label: 'Action & Adventure' },
  { id: 'Romantic', label: 'Romantic Getaway' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export function CreateTrip() {
  const navigate = useNavigate();
  const { createTrip, saving } = useTrip();
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<string>('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateTripValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      travelers: 2,
      type: 'Relaxation'
    }
  });

  const selectedDestId = watch('destinationId');
  const tripName = watch('name');
  const travelers = watch('travelers');
  const tripType = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Autofetch mock destination image when destination changes
  useEffect(() => {
    if (selectedDestId) {
      const dest = EXPLORE_DESTINATIONS.find(d => d.id === selectedDestId);
      if (dest) {
        setCoverImage(dest.image);
        if (!tripName) {
          setValue('name', `Trip to ${dest.name}`);
        }
      }
    }
  }, [selectedDestId, setValue, tripName]);

  const onSubmit = async (data: CreateTripValues) => {
    try {
      const dest = EXPLORE_DESTINATIONS.find(d => d.id === data.destinationId);
      
      const tripData = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        travelers: data.travelers,
        notes: data.notes,
        coverImage: coverImage || dest?.image,
        cities: dest ? [{ 
          id: `stop-1`, 
          tripId: '',
          destinationId: dest.id,
          name: dest.name,
          nights: calculateNights(data.startDate, data.endDate),
          order: 0
        }] : [],
        days: dest ? generateItineraryDays('', data.startDate, data.endDate, [{ 
          id: `stop-1`, 
          tripId: '',
          destinationId: dest.id,
          name: dest.name,
          nights: calculateNights(data.startDate, data.endDate),
          order: 0
        }]) : []
      };

      const newTrip = await createTrip(tripData);
      
      toast({
        title: "Trip created!",
        description: "Navigating to Itinerary Builder...",
      });
      
      // Navigate to Itinerary Builder
      navigate(`/trips/${newTrip.id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create trip.",
        variant: "destructive"
      });
    }
  };

  const selectedDest = EXPLORE_DESTINATIONS.find(d => d.id === selectedDestId);

  return (
    <div className="bg-background pb-32 md:pb-12 pt-4">
      {/* Header */}
      <div className="pb-8">
        <PageContainer className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0 rounded-full hover:bg-surface-container transition-colors">
            <Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <h1 className="font-heading font-semibold text-2xl tracking-tight">Plan New Trip</h1>
        </PageContainer>
      </div>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 relative">
          
          {/* Left Column: Form Sections */}
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.form 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible"
              className="space-y-12"
            >
              
              {/* SECTION 1: TRIP DETAILS */}
              <motion.section variants={itemVariants} className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                  <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Trip Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/90">Where are you going?</label>
                    <Select onValueChange={(val) => setValue('destinationId', val)}>
                      <SelectTrigger className={cn("h-14 text-base bg-surface border-border/60 focus:ring-primary/20", errors.destinationId && "border-destructive focus:ring-destructive/20")}>
                        <SelectValue placeholder="Select a destination..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPLORE_DESTINATIONS.map(dest => (
                          <SelectItem key={dest.id} value={dest.id} className="py-3">
                            <span className="font-medium">{dest.name}</span>
                            <span className="text-muted-foreground ml-1">, {dest.state}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.destinationId && <p className="text-sm text-destructive">{errors.destinationId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/90">What should we call this trip?</label>
                    <Input 
                      placeholder="e.g. Summer in Goa" 
                      {...register('name')}
                      className={cn("h-14 text-base bg-surface border-border/60 focus:border-primary", errors.name && "border-destructive focus:border-destructive")}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/90">Start Date</label>
                      <Input 
                        type="date"
                        {...register('startDate')}
                        className={cn("h-14 text-base bg-surface border-border/60", errors.startDate && "border-destructive")}
                      />
                      {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/90">End Date</label>
                      <Input 
                        type="date"
                        {...register('endDate')}
                        className={cn("h-14 text-base bg-surface border-border/60", errors.endDate && "border-destructive")}
                      />
                      {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* SECTION 2: TRAVEL DETAILS */}
              <motion.section variants={itemVariants} className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                  <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Users className="w-4 h-4" /> Travel Details
                  </h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/90">Trip Type</label>
                    {/* Visual Pill Group acting as radio buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {TRIP_TYPES.map(type => {
                        const isSelected = tripType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setValue('type', type.id)}
                            className={cn(
                              "relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isSelected 
                                ? "border-primary bg-primary/5 text-primary shadow-sm" 
                                : "border-border/60 bg-surface text-muted-foreground hover:border-border hover:bg-surface-container"
                            )}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Hidden input to register with react-hook-form properly */}
                    <input type="hidden" {...register('type')} />
                    {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/90">Number of Travelers</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-surface border border-border/60 rounded-xl p-1 shadow-sm">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => travelers > 1 && setValue('travelers', travelers - 1)}
                          disabled={travelers <= 1}
                          className="h-10 w-10 rounded-lg hover:bg-surface-container"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="w-16 text-center font-medium text-lg">
                          {travelers}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setValue('travelers', travelers + 1)}
                          className="h-10 w-10 rounded-lg hover:bg-surface-container"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {travelers === 1 ? 'Person' : 'People'}
                      </span>
                    </div>
                    {/* Hidden input to register with react-hook-form */}
                    <input type="hidden" {...register('travelers', { valueAsNumber: true })} />
                    {errors.travelers && <p className="text-sm text-destructive">{errors.travelers.message}</p>}
                  </div>
                </div>
              </motion.section>

              {/* SECTION 3: ADDITIONAL DETAILS */}
              <motion.section variants={itemVariants} className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                  <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Quote className="w-4 h-4" /> Additional Details
                  </h2>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Notes (Optional)</label>
                  <Textarea 
                    placeholder="Any specific places you want to visit, dietary requirements, or ideas?"
                    className="min-h-[120px] resize-none text-base bg-surface border-border/60 focus:border-primary"
                    {...register('notes')}
                  />
                </div>
              </motion.section>

              {/* Desktop Save Action (Hidden on Mobile) */}
              <motion.div variants={itemVariants} className="hidden md:flex items-center gap-4 pt-8 border-t border-border/40">
                <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Create Trip
                </Button>
                {saving && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Autosaving...
                  </span>
                )}
              </motion.div>

            </motion.form>
          </div>
          
          {/* Right Column: Visual Summary */}
          <div className="lg:col-span-5 xl:col-span-4 order-first lg:order-last mb-8 lg:mb-0">
            <div className="sticky top-28 space-y-6">
              
              <AnimatePresence mode="popLayout">
                {selectedDest ? (
                  <motion.div 
                    key="destination-preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full aspect-[4/3] rounded-3xl overflow-hidden relative shadow-xl shadow-black/5 border border-border/20 group"
                  >
                    <img 
                      src={coverImage || selectedDest.image} 
                      alt={selectedDest.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1">{selectedDest.state}</p>
                      <h3 className="font-heading text-3xl font-bold">{selectedDest.name}</h3>
                    </div>

                    <Button 
                      variant="secondary" 
                      onClick={(e) => {
                        e.preventDefault();
                        const url = window.prompt("Enter new image URL (e.g. from Unsplash):", coverImage);
                        if (url) setCoverImage(url);
                      }}
                      className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Change Image
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full aspect-[4/3] rounded-3xl bg-surface-container border border-dashed border-border/60 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 shadow-sm text-muted-foreground">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="font-medium text-foreground mb-2">Select a destination</h3>
                    <p className="text-sm text-muted-foreground">Choose where you're going to see a preview of your destination.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Smart Suggestions */}
              <AnimatePresence>
                {selectedDest && startDate && endDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 text-primary">Travel Tip</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          For a {calculateNights(startDate, endDate)}-night trip to {selectedDest.name}, we recommend allocating time for both popular attractions and local hidden gems.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </PageContainer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border/40 z-40 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          {saving && (
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </span>
          )}
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} size="lg" className="w-full rounded-full shadow-lg shadow-primary/20">
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Create Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
