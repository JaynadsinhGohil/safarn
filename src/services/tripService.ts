import type { Trip, TripStatus } from '@/types';
import { mockDb } from './mockDb';
import { parseISO, isAfter, isBefore, isToday } from 'date-fns';

/**
 * Derive a sensible trip status from its date range.
 * Manual overrides (e.g. 'draft') remain as-is unless dates clearly contradict.
 */
export function deriveTripStatus(startDate: string, endDate: string, currentStatus?: TripStatus): TripStatus {
  // Preserve intentional 'draft' status
  if (currentStatus === 'draft') return 'draft';

  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const now = new Date();

    if (isBefore(end, now) && !isToday(end)) return 'completed';
    if (isAfter(start, now) && !isToday(start)) return 'upcoming';
    return 'ongoing'; // trip is happening now (today falls within range)
  } catch {
    return currentStatus ?? 'upcoming';
  }
}

export const tripService = {
  getTrips: async (): Promise<Trip[]> => {
    return mockDb.getTrips();
  },

  getTripById: async (id: string): Promise<Trip | undefined> => {
    const trips = await mockDb.getTrips();
    return trips.find(t => t.id === id);
  },

  createTrip: async (tripData: Partial<Trip>): Promise<Trip> => {
    const trips = await mockDb.getTrips();

    const startDate = tripData.startDate || new Date().toISOString().split('T')[0];
    const endDate = tripData.endDate || startDate;
    const status = deriveTripStatus(startDate, endDate, tripData.status);

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      userId: 'user-1',
      name: tripData.name || 'Untitled Trip',
      startDate,
      endDate,
      type: tripData.type || 'Custom',
      travelers: tripData.travelers || 1,
      coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
      status,
      budget: tripData.budget || {
        totalEstimated: 0,
        currency: 'INR',
        categories: { travel: 0, accommodation: 0, activities: 0 }
      },
      cities: tripData.cities || [],
      travelSegments: tripData.travelSegments || [],
      days: tripData.days || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mockDb.saveTrips([newTrip, ...trips]);
    return newTrip;
  },

  updateTrip: async (id: string, tripData: Partial<Trip>): Promise<Trip> => {
    const trips = await mockDb.getTrips();
    const index = trips.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Trip not found');

    const existing = trips[index];

    // Recalculate status if dates changed and status is not manually 'draft'
    let status = tripData.status ?? existing.status;
    if ((tripData.startDate || tripData.endDate) && status !== 'draft') {
      status = deriveTripStatus(
        tripData.startDate ?? existing.startDate,
        tripData.endDate ?? existing.endDate,
        status
      );
    }

    const updatedTrip: Trip = {
      ...existing,
      ...tripData,
      status,
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    await mockDb.saveTrips(trips);
    return updatedTrip;
  },

  deleteTrip: async (id: string): Promise<void> => {
    const trips = await mockDb.getTrips();
    await mockDb.saveTrips(trips.filter(t => t.id !== id));
  },

  duplicateTrip: async (id: string): Promise<Trip> => {
    const trip = await tripService.getTripById(id);
    if (!trip) throw new Error('Trip not found');

    const { id: _id, ...rest } = trip;
    return tripService.createTrip({
      ...rest,
      name: `${trip.name} (Copy)`,
      status: 'draft',
    });
  }
};
