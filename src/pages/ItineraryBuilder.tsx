import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Plus, Undo, Redo, Plane, Train, Bus, Car, Search, Check, Clock, Edit2, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableActivity } from '@/components/features/itinerary/SortableActivity';
import { SortableCity } from '@/components/features/itinerary/SortableCity';
import type { Activity, TravelMode, Trip } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { generateItineraryDays, analyzeDateChanges, type OrphanedActivity } from '@/lib/dateUtils';
import { EXPLORE_DESTINATIONS } from '@/data/mock/destinations';
import { EXPLORE_ACTIVITIES } from '@/data/mock/activities';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReconciliationModal } from '@/components/features/itinerary/ReconciliationModal';

export function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const { 
    activeTrip, setActiveTrip, loading, saving, addActivity, updateActivity, reorderActivities, removeActivity,
    undo, redo, canUndo, canRedo, addCity, updateActiveTrip, reorderCities, updateTravelMode
  } = useTrip();
  const { toast } = useToast();

  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityDestId, setNewCityDestId] = useState('');
  const [newCityNights, setNewCityNights] = useState(2);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const [addActivityDayId, setAddActivityDayId] = useState<string | null>(null);
  const [activityMode, setActivityMode] = useState<'catalog' | 'custom'>('catalog');
  const [selectedActId, setSelectedActId] = useState('');
  const [customAct, setCustomAct] = useState({ title: '', desc: '', time: '', cost: '' });
  const [actSearchQuery, setActSearchQuery] = useState('');

  const [editActivityState, setEditActivityState] = useState<{ dayId: string; activity: Activity } | null>(null);
  const [editCustomAct, setEditCustomAct] = useState({ title: '', desc: '', time: '', cost: '' });

  // Edit Trip Details
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [editTripData, setEditTripData] = useState({ name: '', startDate: '', endDate: '', travelers: 1 });

  // Reconciliation State
  const [reconciliationState, setReconciliationState] = useState<{
    open: boolean;
    pendingUpdate: Partial<Trip> | null;
    orphanedActivities: OrphanedActivity[];
    proposedTrip: Trip | null;
  }>({ open: false, pendingUpdate: null, orphanedActivities: [], proposedTrip: null });



  useEffect(() => {
    if (id && (!activeTrip || activeTrip.id !== id)) {
      setActiveTrip(id);
    }
  }, [id, activeTrip, setActiveTrip]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (active.data.current?.type === 'City') {
        reorderCities(active.id as string, over.id as string);
        return;
      }
      
      const dayId = active.data.current?.dayId;
      if (dayId) {
        reorderActivities(dayId, active.id as string, over.id as string);
      }
    }
  };

  const handleAddCityConfirm = () => {
    if (!activeTrip) return;
    if (!newCityDestId) {
      toast({ title: 'Select a destination', variant: 'destructive' });
      return;
    }
    if (newCityNights < 1) {
      toast({ title: 'Nights must be at least 1', variant: 'destructive' });
      return;
    }

    const dest = EXPLORE_DESTINATIONS.find(d => d.id === newCityDestId);
    if (!dest) return;

    if (activeTrip.cities.some(c => c.destinationId === dest.id)) {
      toast({ title: 'City already in itinerary', description: 'This destination has already been added.', variant: 'destructive' });
      return;
    }

    const maxNightsAllowed = differenceInDays(parseISO(activeTrip.endDate), parseISO(activeTrip.startDate));
    const currentAllocated = activeTrip.cities.reduce((sum, c) => sum + c.nights, 0);
    
    if (currentAllocated + newCityNights > maxNightsAllowed) {
      toast({ 
        title: 'Not enough days in trip', 
        description: `Your trip is ${maxNightsAllowed} nights. You have ${Math.max(0, maxNightsAllowed - currentAllocated)} nights remaining to allocate.`, 
        variant: 'destructive' 
      });
      return;
    }

    addCity({
      id: `stop-${dest.id}-${Date.now()}`,
      tripId: activeTrip.id,
      destinationId: dest.id,
      name: dest.name,
      nights: newCityNights,
      order: activeTrip.cities.length
    });

    setShowAddCity(false);
    setNewCityDestId('');
    setNewCityNights(2);
    setCitySearchQuery('');
  };

  const processTripUpdate = (pendingUpdate: Partial<Trip>) => {
    if (!activeTrip) return;

    const proposedStartDate = pendingUpdate.startDate || activeTrip.startDate;
    const proposedEndDate = pendingUpdate.endDate || activeTrip.endDate;
    const proposedCities = pendingUpdate.cities || activeTrip.cities;

    const { requiresReconciliation, orphanedActivities } = analyzeDateChanges(activeTrip, proposedStartDate, proposedEndDate, proposedCities);

    if (requiresReconciliation) {
      // Simulate the new days so the modal can show available target days
      const proposedDays = generateItineraryDays(activeTrip.id, proposedStartDate, proposedEndDate, proposedCities, activeTrip.days);
      const proposedTrip = { ...activeTrip, ...pendingUpdate, days: proposedDays };
      
      setReconciliationState({
        open: true,
        pendingUpdate,
        orphanedActivities,
        proposedTrip
      });
    } else {
      updateActiveTrip(pendingUpdate);
      setShowEditTrip(false);
    }
  };

  const handleUpdateNights = (cityId: string, delta: number) => {
    if (!activeTrip) return;
    const city = activeTrip.cities.find(c => c.id === cityId);
    if (!city) return;
    
    const newNights = city.nights + delta;
    if (newNights < 1) return;

    const maxNightsAllowed = differenceInDays(parseISO(activeTrip.endDate), parseISO(activeTrip.startDate));
    const currentAllocated = activeTrip.cities.reduce((sum, c) => sum + (c.id === cityId ? newNights : c.nights), 0);
    
    if (currentAllocated > maxNightsAllowed) {
      toast({ 
        title: 'Not enough days in trip', 
        description: 'Reduce nights elsewhere or extend trip dates.', 
        variant: 'destructive' 
      });
      return;
    }

    const newCities = activeTrip.cities.map(c => c.id === cityId ? { ...c, nights: newNights } : c);
    processTripUpdate({ cities: newCities });
  };

  const handleDeleteCity = (cityId: string) => {
    if (!activeTrip) return;
    // Check if city has activities — if so, route through reconciliation
    const cityHasActivities = activeTrip.days.some(d => d.cityId === cityId && d.activities.length > 0);
    const newCities = activeTrip.cities.filter(c => c.id !== cityId);
    if (cityHasActivities) {
      // Use processTripUpdate so the ReconciliationModal intercepts this
      processTripUpdate({ cities: newCities });
    } else {
      // No activities, safe to remove directly
      updateActiveTrip({ cities: newCities });
    }
  };

  const handleAddActivityConfirm = () => {
    if (!activeTrip || !addActivityDayId) return;

    if (activityMode === 'catalog') {
      if (!selectedActId) {
        toast({ title: 'Select an activity', variant: 'destructive' });
        return;
      }
      const act = EXPLORE_ACTIVITIES.find(a => a.id === selectedActId);
      if (!act) return;

      addActivity(addActivityDayId, {
        id: `act-${Date.now()}`,
        dayId: addActivityDayId,
        title: act.name,
        description: act.description,
        location: act.location,
        estimatedCost: act.price,
        type: act.category === 'food' ? 'food' : 'sightseeing',
        time: '10:00 AM'
      });
    } else {
      if (!customAct.title) {
        toast({ title: 'Enter activity name', variant: 'destructive' });
        return;
      }
      addActivity(addActivityDayId, {
        id: `act-${Date.now()}`,
        dayId: addActivityDayId,
        title: customAct.title,
        description: customAct.desc,
        estimatedCost: Number(customAct.cost) || 0,
        time: customAct.time || '10:00 AM',
        type: 'custom'
      });
    }

    setAddActivityDayId(null);
    setSelectedActId('');
    setCustomAct({ title: '', desc: '', time: '', cost: '' });
    setActSearchQuery('');
  };

  const openEditActivity = (dayId: string, activity: Activity) => {
    setEditCustomAct({
      title: activity.title,
      desc: activity.description || '',
      time: activity.time || '',
      cost: activity.estimatedCost?.toString() || ''
    });
    setEditActivityState({ dayId, activity });
  };

  const handleEditActivityConfirm = () => {
    if (!editActivityState || !editCustomAct.title) {
      toast({ title: 'Enter activity name', variant: 'destructive' });
      return;
    }
    
    updateActivity(editActivityState.dayId, editActivityState.activity.id, {
      title: editCustomAct.title,
      description: editCustomAct.desc,
      time: editCustomAct.time,
      estimatedCost: Number(editCustomAct.cost) || 0,
    });
    
    setEditActivityState(null);
  };

  const openEditTrip = () => {
    if (!activeTrip) return;
    setEditTripData({
      name: activeTrip.name,
      startDate: activeTrip.startDate,
      endDate: activeTrip.endDate,
      travelers: activeTrip.travelers
    });
    setShowEditTrip(true);
  };

  const handleEditTripSave = () => {
    if (!activeTrip) return;
    processTripUpdate({
      name: editTripData.name,
      startDate: editTripData.startDate,
      endDate: editTripData.endDate,
      travelers: editTripData.travelers
    });
  };

  const handleReconciliationConfirm = (resolutions: Record<string, { action: 'move' | 'delete', targetDayId?: string }>) => {
    if (!activeTrip || !reconciliationState.pendingUpdate || !reconciliationState.proposedTrip) return;

    const { pendingUpdate, proposedTrip } = reconciliationState;
    const newDays = [...proposedTrip.days];

    // Apply moves to the proposed days
    Object.entries(resolutions).forEach(([activityId, res]) => {
      if (res.action === 'move' && res.targetDayId) {
        const orphan = reconciliationState.orphanedActivities.find(oa => oa.activity.id === activityId);
        if (orphan) {
          const targetDay = newDays.find(d => d.id === res.targetDayId);
          if (targetDay) {
            targetDay.activities = [...targetDay.activities, orphan.activity];
          }
        }
      }
    });

    // Instead of letting TripContext regenerate the days and drop our manual moves,
    // we must pass the fully resolved days down to updateActiveTrip.
    updateActiveTrip({ ...pendingUpdate, days: newDays });
    setReconciliationState({ open: false, pendingUpdate: null, orphanedActivities: [], proposedTrip: null });
    setShowEditTrip(false);
  };



  if (loading || !activeTrip) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter available destinations
  const filteredDestinations = EXPLORE_DESTINATIONS.filter(d => 
    d.name.toLowerCase().includes(citySearchQuery.toLowerCase()) || 
    d.state.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Filter available activities for the current city
  const activeDay = activeTrip.days.find(d => d.id === addActivityDayId);
  const activeCityDestId = activeTrip.cities.find(c => c.id === activeDay?.cityId)?.destinationId;
  const filteredActivities = EXPLORE_ACTIVITIES.filter(a => 
    (!activeCityDestId || a.destinationId === activeCityDestId) &&
    a.name.toLowerCase().includes(actSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Builder Toolbar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2 group cursor-pointer" onClick={openEditTrip}>
            {activeTrip.name}
            <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </h2>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(activeTrip.startDate), 'MMM d')} – {format(parseISO(activeTrip.endDate), 'MMM d, yyyy')} • {activeTrip.cities.length} Stops • {activeTrip.travelers} Travelers
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saving && <span className="text-xs text-muted-foreground mr-2 hidden md:inline">Autosaving...</span>}
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={undo} disabled={!canUndo}><Undo className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={redo} disabled={!canRedo}><Redo className="w-4 h-4" /></Button>
          <Button size="sm" className="ml-2 shadow-md shrink-0" onClick={() => setShowAddCity(true)}>
            <Plus className="w-4 h-4 mr-2 shrink-0" /> Add City
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-12 pb-24 lg:pl-8">
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeTrip.cities.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {/* Timeline of cities and travel */}
              {activeTrip.cities.map((city, index) => {
                const nextCity = activeTrip.cities[index + 1];
                const segment = nextCity 
                  ? activeTrip.travelSegments.find(s => s.fromCityId === city.id && s.toCityId === nextCity.id)
                  : null;

                return (
                  <SortableCity key={city.id} city={city}>
                    <div className="space-y-8 bg-background relative rounded-xl transition-colors">
                      {/* City Header */}
                      <div className="flex flex-wrap items-end justify-between border-b border-border/40 pb-4 ml-8 lg:ml-0 gap-4">
                        <div>
                          <h3 className="text-2xl font-heading font-bold text-primary">{city.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground">{city.nights} Nights</span>
                            <div className="flex items-center bg-surface-container-low rounded-md border border-border/50">
                              <button className="px-2 py-0.5 text-xs hover:bg-surface-container transition-colors" onClick={() => handleUpdateNights(city.id, -1)}>-</button>
                              <span className="px-2 text-xs font-medium border-x border-border/50">{city.nights}</span>
                              <button className="px-2 py-0.5 text-xs hover:bg-surface-container transition-colors" onClick={() => handleUpdateNights(city.id, 1)}>+</button>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => handleDeleteCity(city.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Remove City
                        </Button>
                      </div>

                      {/* Days in City */}
                      <div className="space-y-6 ml-8 lg:ml-0">
                        {activeTrip.days.filter(d => d.cityId === city.id).map(day => (
                          <div key={day.id} className="border border-border/50 rounded-xl bg-surface/50 overflow-hidden shadow-sm">
                            <div className="bg-surface-container-low px-4 py-3 flex flex-wrap items-center justify-between border-b border-border/50 gap-2">
                              <h4 className="font-semibold text-sm">Day {day.dayNumber}: {format(parseISO(day.date), 'MMM d, yyyy')}</h4>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAddActivityDayId(day.id)}>
                                <Plus className="w-3 h-3 mr-1"/> Activity
                              </Button>
                            </div>
                            <div className="p-4">
                              <SortableContext items={day.activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                {day.activities.length === 0 ? (
                                  <div className="text-center py-6">
                                    <p className="text-sm text-muted-foreground mb-3">No activities planned yet.</p>
                                    <Button variant="outline" size="sm" onClick={() => setAddActivityDayId(day.id)}>
                                      <Plus className="w-3 h-3 mr-2" /> Add Activity
                                    </Button>
                                  </div>
                                ) : (
                                  day.activities.map(activity => (
                                    <SortableActivity 
                                      key={activity.id} 
                                      activity={activity} 
                                      onEdit={() => openEditActivity(day.id, activity)} 
                                      onDelete={(id) => removeActivity(day.id, id)} 
                                    />
                                  ))
                                )}
                              </SortableContext>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Travel Segment */}
                      {segment && nextCity && (
                        <div className="relative flex items-center justify-center py-6 ml-8 lg:ml-0">
                          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border/60 border-dashed" />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="relative z-10 bg-background border border-border/60 rounded-full px-4 py-2 flex items-center gap-3 shadow-sm hover:border-primary/50 hover:bg-surface-container-low cursor-pointer transition-colors group">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                  {segment.mode === 'flight' && <Plane className="w-3 h-3 text-primary" />}
                                  {segment.mode === 'train' && <Train className="w-3 h-3 text-primary" />}
                                  {segment.mode === 'bus' && <Bus className="w-3 h-3 text-primary" />}
                                  {segment.mode === 'cab' && <Car className="w-3 h-3 text-primary" />}
                                </div>
                                <span className="text-sm font-medium">Travel to {nextCity.name}</span>
                                <Edit2 className="w-3 h-3 text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-40">
                              {(['flight', 'train', 'bus', 'cab'] as TravelMode[]).map(mode => (
                                <DropdownMenuItem key={mode} onClick={() => updateTravelMode(segment.id, mode)} className="capitalize flex items-center gap-2">
                                  {mode === 'flight' && <Plane className="w-4 h-4" />}
                                  {mode === 'train' && <Train className="w-4 h-4" />}
                                  {mode === 'bus' && <Bus className="w-4 h-4" />}
                                  {mode === 'cab' && <Car className="w-4 h-4" />}
                                  {mode}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </div>
                      )}
                    </div>
                  </SortableCity>
                );
              })}
            </SortableContext>
          </DndContext>

          {activeTrip.cities.length === 0 && (
             <div className="text-center py-20">
               <h3 className="text-lg font-medium mb-2">Your itinerary is empty</h3>
               <p className="text-muted-foreground mb-6">Start by adding your first destination city.</p>
               <Button size="lg" onClick={() => setShowAddCity(true)}><Plus className="w-4 h-4 mr-2" /> Add First City</Button>
             </div>
          )}
        </div>
      </div>

      {/* Add City Dialog */}
      <Dialog open={showAddCity} onOpenChange={setShowAddCity}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 py-4 border-b border-border/40 bg-surface/50">
            <DialogTitle>Add a Destination</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search cities..." 
                className="pl-9" 
                value={citySearchQuery} 
                onChange={(e) => setCitySearchQuery(e.target.value)} 
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {filteredDestinations.map(dest => (
                <div 
                  key={dest.id} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    newCityDestId === dest.id ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/40"
                  )}
                  onClick={() => setNewCityDestId(dest.id)}
                >
                  <img src={dest.image} alt={dest.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{dest.name}</p>
                    <p className="text-xs text-muted-foreground">{dest.state}</p>
                  </div>
                  {newCityDestId === dest.id && <Check className="w-4 h-4 text-primary" />}
                </div>
              ))}
              {filteredDestinations.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No destinations found.</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">How many nights?</label>
              <Input type="number" min={1} value={newCityNights} onChange={e => setNewCityNights(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-surface/50">
            <Button variant="outline" onClick={() => setShowAddCity(false)}>Cancel</Button>
            <Button onClick={handleAddCityConfirm}>Add to Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog open={!!addActivityDayId} onOpenChange={(open) => !open && setAddActivityDayId(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 py-4 border-b border-border/40 bg-surface/50">
            <DialogTitle>Add Activity</DialogTitle>
            <p className="text-sm text-muted-foreground">
              For Day {activeDay?.dayNumber} — {activeDay && format(parseISO(activeDay.date), 'MMM d')}
            </p>
          </DialogHeader>
          
          <div className="flex border-b border-border/40">
            <button 
              className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activityMode === 'catalog' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              onClick={() => setActivityMode('catalog')}
            >
              Browse Catalog
            </button>
            <button 
              className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activityMode === 'custom' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              onClick={() => setActivityMode('custom')}
            >
              Custom Activity
            </button>
          </div>

          <div className="p-6 max-h-[400px] overflow-y-auto">
            {activityMode === 'catalog' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search activities..." className="pl-9" value={actSearchQuery} onChange={e => setActSearchQuery(e.target.value)} />
                </div>
                <div className="space-y-2">
                  {filteredActivities.map(act => (
                    <div 
                      key={act.id} 
                      className={cn(
                        "flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                        selectedActId === act.id ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/40"
                      )}
                      onClick={() => setSelectedActId(act.id)}
                    >
                      <img src={act.image} alt={act.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{act.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> {act.duration}</p>
                        <p className="text-xs font-medium text-primary mt-1">₹{act.price}</p>
                      </div>
                      <div className="flex items-center">
                        {selectedActId === act.id && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </div>
                  ))}
                  {filteredActivities.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No activities found.</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Name</label>
                  <Input value={customAct.title} onChange={e => setCustomAct({...customAct, title: e.target.value})} placeholder="E.g., Dinner at Local Restaurant" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input value={customAct.time} onChange={e => setCustomAct({...customAct, time: e.target.value})} placeholder="E.g., 7:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Cost</label>
                    <Input type="number" value={customAct.cost} onChange={e => setCustomAct({...customAct, cost: e.target.value})} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={customAct.desc} onChange={e => setCustomAct({...customAct, desc: e.target.value})} placeholder="Optional notes" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-surface/50">
            <Button variant="outline" onClick={() => setAddActivityDayId(null)}>Cancel</Button>
            <Button onClick={handleAddActivityConfirm}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={!!editActivityState} onOpenChange={(open) => !open && setEditActivityState(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 py-4 border-b border-border/40 bg-surface/50">
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Name</label>
              <Input value={editCustomAct.title} onChange={e => setEditCustomAct({...editCustomAct, title: e.target.value})} placeholder="Activity Name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input value={editCustomAct.time} onChange={e => setEditCustomAct({...editCustomAct, time: e.target.value})} placeholder="E.g., 7:00 PM" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost</label>
                <Input type="number" value={editCustomAct.cost} onChange={e => setEditCustomAct({...editCustomAct, cost: e.target.value})} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={editCustomAct.desc} onChange={e => setEditCustomAct({...editCustomAct, desc: e.target.value})} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-surface/50">
            <Button variant="outline" onClick={() => setEditActivityState(null)}>Cancel</Button>
            <Button onClick={handleEditActivityConfirm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Details Dialog */}
      <Dialog open={showEditTrip} onOpenChange={setShowEditTrip}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trip Name</label>
              <Input value={editTripData.name} onChange={e => setEditTripData({...editTripData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={editTripData.startDate} onChange={e => {
                  setEditTripData({...editTripData, startDate: e.target.value});
                }} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={editTripData.endDate} onChange={e => {
                  setEditTripData({...editTripData, endDate: e.target.value});
                }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Travelers</label>
              <Input type="number" min={1} value={editTripData.travelers} onChange={e => setEditTripData({...editTripData, travelers: parseInt(e.target.value) || 1})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTrip(false)}>Cancel</Button>
            <Button onClick={handleEditTripSave}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReconciliationModal
        open={reconciliationState.open}
        onOpenChange={(open) => {
          if (!open) {
            setReconciliationState(prev => ({ ...prev, open: false }));
          }
        }}
        orphanedActivities={reconciliationState.orphanedActivities}
        proposedTrip={reconciliationState.proposedTrip!}
        onConfirm={handleReconciliationConfirm}
      />
    </div>
  );
}
