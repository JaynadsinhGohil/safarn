import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Trip, TripStatus, CityStop, Activity, TravelMode, TravelSegment, Expense } from '@/types';
import { tripService } from '@/services/tripService';
import { arrayMove } from '@dnd-kit/sortable';
import { generateItineraryDays } from '@/lib/dateUtils';
import { sharingService } from '@/services/sharingService';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  loading: boolean;
  saving: boolean;
  loadTrips: () => Promise<void>;
  setActiveTrip: (id: string | null) => Promise<void>;
  createTrip: (data: Partial<Trip>) => Promise<Trip>;
  updateActiveTrip: (data: Partial<Trip>) => void;
  deleteTrip: (id: string) => Promise<void>;
  duplicateTrip: (id: string) => Promise<void>;
  
  // Itinerary Builder Actions
  addCity: (city: CityStop) => void;
  reorderCities: (activeId: string, overId: string) => void;
  removeCity: (cityId: string) => void;
  updateTravelMode: (segmentId: string, mode: TravelMode) => void;
  addActivity: (dayId: string, activity: Activity) => void;
  updateActivity: (dayId: string, activityId: string, data: Partial<Activity>) => void;
  removeActivity: (dayId: string, activityId: string) => void;
  reorderActivities: (dayId: string, activeId: string, overId: string) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Budget / Expense Actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;

  // Privacy / Sharing
  updateTripPrivacy: (tripId: string, isPublic: boolean) => void;
  getTripByShareId: (shareId: string) => Trip | undefined;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTripState] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // History State
  const [history, setHistory] = useState<Trip[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const enhanceTripsWithStatus = (rawTrips: Trip[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // normalize to start of today for fair comparison
    return rawTrips.map(trip => {
      let status: TripStatus = 'upcoming';
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      
      if (now > end) {
        status = 'completed';
      } else if (now >= start && now <= end) {
        status = 'ongoing';
      }
      return { ...trip, status };
    });
  };

  const loadTrips = useCallback(async () => {
    setLoading(true);
    const data = await tripService.getTrips();
    setTrips(enhanceTripsWithStatus(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const setActiveTrip = async (id: string | null) => {
    if (!id) {
      setActiveTripState(null);
      setHistory([]);
      setHistoryIndex(-1);
      return;
    }
    const trip = await tripService.getTripById(id);
    setActiveTripState(trip || null);
    if (trip) {
      setHistory([trip]);
      setHistoryIndex(0);
    }
  };

  const createTrip = async (data: Partial<Trip>) => {
    const newTrip = await tripService.createTrip(data);
    await loadTrips();
    return newTrip;
  };

  const updateActiveTrip = useCallback((data: Partial<Trip>) => {
    setActiveTripState(prev => {
      if (!prev) return null;
      
      let updated = { ...prev, ...data };

      // Safe Date Reconciliation is delegated to the UI before calling updateActiveTrip.
      // If the UI allows date shrinking, it must handle the orphaned days/activities.
      // We still regenerate the empty days here if dates changed and cities changed, 
      // but without destroying activities silently.
      if (data.startDate !== undefined || data.endDate !== undefined || data.cities !== undefined) {
        updated.days = generateItineraryDays(
          updated.id, 
          updated.startDate, 
          updated.endDate, 
          updated.cities, 
          prev.days
        );
      }

      // Reconcile travel segments if cities changed
      if (data.cities !== undefined) {
        const newSegments: TravelSegment[] = [];
        for (let i = 0; i < updated.cities.length - 1; i++) {
          const fromCity = updated.cities[i];
          const toCity = updated.cities[i + 1];
          const existing = prev.travelSegments.find(s => s.fromCityId === fromCity.id && s.toCityId === toCity.id);
          if (existing) {
            newSegments.push(existing);
          } else {
            newSegments.push({
              id: `seg-${fromCity.id}-${toCity.id}-${Date.now()}`,
              fromCityId: fromCity.id,
              toCityId: toCity.id,
              mode: 'flight'
            });
          }
        }
        updated.travelSegments = newSegments;
      }
      
      // Update history
      setHistory(curr => {
        const newHistory = curr.slice(0, historyIndex + 1);
        newHistory.push(updated);
        // Keep last 20 states
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex(curr => Math.min(curr + 1, 19));
      
      // Fire and forget save
      setSaving(true);
      tripService.updateTrip(prev.id, updated)
        .then(() => {
          setSaving(false);
          // Update trips list quietly
          setTrips(current => current.map(t => t.id === prev.id ? updated : t));
        })
        .catch(console.error);
        
      return updated;
    });
  }, [historyIndex]);

  const deleteTrip = async (id: string) => {
    await tripService.deleteTrip(id);
    await loadTrips();
    if (activeTrip?.id === id) setActiveTripState(null);
  };

  const duplicateTrip = async (id: string) => {
    await tripService.duplicateTrip(id);
    await loadTrips();
  };

  // --- Itinerary Helper Actions ---
  
  const addCity = (city: CityStop) => {
    if (!activeTrip) return;
    const newCities = [...activeTrip.cities, city];
    updateActiveTrip({ cities: newCities });
  };

  const reorderCities = (activeId: string, overId: string) => {
    if (!activeTrip) return;
    const oldIndex = activeTrip.cities.findIndex(c => c.id === activeId);
    const newIndex = activeTrip.cities.findIndex(c => c.id === overId);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newCities = arrayMove(activeTrip.cities, oldIndex, newIndex);
      updateActiveTrip({ cities: newCities });
    }
  };

  const removeCity = (cityId: string) => {
    if (!activeTrip) return;
    const newCities = activeTrip.cities.filter(c => c.id !== cityId);
    updateActiveTrip({ cities: newCities });
  };

  const updateTravelMode = (segmentId: string, mode: TravelMode) => {
    if (!activeTrip) return;
    const newSegments = activeTrip.travelSegments.map(s => s.id === segmentId ? { ...s, mode } : s);
    updateActiveTrip({ travelSegments: newSegments });
  };

  const addActivity = (dayId: string, activity: Activity) => {
    if (!activeTrip) return;
    const newDays = activeTrip.days.map(day => {
      if (day.id === dayId) {
        return { ...day, activities: [...day.activities, activity] };
      }
      return day;
    });
    updateActiveTrip({ days: newDays });
  };

  const updateActivity = (dayId: string, activityId: string, data: Partial<Activity>) => {
    if (!activeTrip) return;
    const newDays = activeTrip.days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities.map(a => a.id === activityId ? { ...a, ...data } : a)
        };
      }
      return day;
    });
    updateActiveTrip({ days: newDays });
  };

  const removeActivity = (dayId: string, activityId: string) => {
    if (!activeTrip) return;
    const newDays = activeTrip.days.map(day => {
      if (day.id === dayId) {
        return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
      }
      return day;
    });
    updateActiveTrip({ days: newDays });
  };

  const reorderActivities = (dayId: string, activeId: string, overId: string) => {
    if (!activeTrip) return;
    const newDays = activeTrip.days.map(day => {
      if (day.id === dayId) {
        const oldIndex = day.activities.findIndex(a => a.id === activeId);
        const newIndex = day.activities.findIndex(a => a.id === overId);
        return { ...day, activities: arrayMove(day.activities, oldIndex, newIndex) };
      }
      return day;
    });
    updateActiveTrip({ days: newDays });
  };

  // --- History Helpers ---
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevTrip = history[historyIndex - 1];
      setActiveTripState(prevTrip);
      setHistoryIndex(historyIndex - 1);
      
      setSaving(true);
      tripService.updateTrip(prevTrip.id, prevTrip).then(() => setSaving(false));
      setTrips(current => current.map(t => t.id === prevTrip.id ? prevTrip : t));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextTrip = history[historyIndex + 1];
      setActiveTripState(nextTrip);
      setHistoryIndex(historyIndex + 1);
      
      setSaving(true);
      tripService.updateTrip(nextTrip.id, nextTrip).then(() => setSaving(false));
      setTrips(current => current.map(t => t.id === nextTrip.id ? nextTrip : t));
    }
  }, [history, historyIndex]);

  // --- Expense Actions ---
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    if (!activeTrip) return;
    const newExpense: Expense = { ...expense, id: `exp-${Date.now()}` };
    const current = activeTrip.expenses ?? [];
    updateActiveTrip({ expenses: [...current, newExpense] });
  };

  const updateExpense = (expense: Expense) => {
    if (!activeTrip) return;
    const updated = (activeTrip.expenses ?? []).map(e => e.id === expense.id ? expense : e);
    updateActiveTrip({ expenses: updated });
  };

  const removeExpense = (expenseId: string) => {
    if (!activeTrip) return;
    const updated = (activeTrip.expenses ?? []).filter(e => e.id !== expenseId);
    updateActiveTrip({ expenses: updated });
  };

  // --- Privacy / Sharing ---
  const updateTripPrivacy = (tripId: string, isPublic: boolean) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const shareId = isPublic ? (trip.shareId ?? sharingService.generateShareId()) : trip.shareId;
    const updated = { ...trip, isPublic, shareId };
    tripService.updateTrip(tripId, updated).then(() => {
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, ...updated, updatedAt: new Date().toISOString() } : t));
      if (activeTrip?.id === tripId) setActiveTripState(updated);
    });
  };

  const getTripByShareId = (shareId: string): Trip | undefined => {
    return trips.find(t => t.shareId === shareId && t.isPublic);
  };

  return (
    <TripContext.Provider value={{
      trips, activeTrip, loading, saving,
      loadTrips, setActiveTrip, createTrip, updateActiveTrip, deleteTrip, duplicateTrip,
      addCity, reorderCities, removeCity, updateTravelMode,
      addActivity, updateActivity, removeActivity, reorderActivities,
      undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
      addExpense, updateExpense, removeExpense,
      updateTripPrivacy, getTripByShareId,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
