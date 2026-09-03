import type { Destination, Trip } from '@/types';
import { addDays, format } from 'date-fns';
import { generateItineraryDays } from '@/lib/dateUtils';
import { SEED_EXPENSES } from '@/data/mock/expenses';

export const SEED_DESTINATIONS: Destination[] = [
  { id: 'dest-1', name: 'Goa', state: 'Goa', country: 'India', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' },
  { id: 'dest-2', name: 'Jaipur', state: 'Rajasthan', country: 'India', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop' },
  { id: 'dest-3', name: 'Kerala', state: 'Kerala', country: 'India', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop' },
  { id: 'dest-4', name: 'Manali', state: 'Himachal Pradesh', country: 'India', image: 'https://images.unsplash.com/photo-1626621341517-bbf3e9990a23?q=80&w=800&auto=format&fit=crop' },
  { id: 'dest-5', name: 'Udaipur', state: 'Rajasthan', country: 'India', image: 'https://images.unsplash.com/photo-1615966650071-855b15f29ad1?q=80&w=800&auto=format&fit=crop' },
  { id: 'dest-6', name: 'Kashmir', state: 'Jammu & Kashmir', country: 'India', image: 'https://images.unsplash.com/photo-1595815771614-ade9d6527620?q=80&w=800&auto=format&fit=crop' },
];

const today = new Date();

// Trip 1: Rajasthan — 7 nights total (Jaipur 3 + Udaipur 4 remaining)
const trip1Cities = [
  { id: 'stop-1', tripId: 'trip-1', destinationId: 'dest-2', name: 'Jaipur', nights: 3, order: 0 },
  { id: 'stop-2', tripId: 'trip-1', destinationId: 'dest-5', name: 'Udaipur', nights: 4, order: 1 },
];

// Trip 2: Goa — 3 nights
const trip2Cities = [
  { id: 'stop-3', tripId: 'trip-2', destinationId: 'dest-1', name: 'Goa', nights: 3, order: 0 },
];

export const SEED_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    userId: 'user-1',
    name: 'Rajasthan Royal Tour',
    // 7 nights: Sep 17 → Sep 24 (relative to today+14 → today+21)
    startDate: format(addDays(today, 14), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 21), 'yyyy-MM-dd'),
    type: 'Cultural',
    travelers: 2,
    coverImage: SEED_DESTINATIONS[1].image,
    status: 'upcoming',
    budget: {
      totalEstimated: 45000,
      currency: 'INR',
      categories: { travel: 12000, accommodation: 20000, activities: 13000 }
    },
    cities: trip1Cities,
    travelSegments: [
      { id: 'seg-1', fromCityId: 'stop-1', toCityId: 'stop-2', mode: 'cab', estimatedCost: 3500, estimatedTime: '6h' }
    ],
    days: generateItineraryDays(
      'trip-1',
      format(addDays(today, 14), 'yyyy-MM-dd'),
      format(addDays(today, 21), 'yyyy-MM-dd'),
      trip1Cities
    ),
    expenses: SEED_EXPENSES.filter(e => e.tripId === 'trip-1'),
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'trip-2',
    userId: 'user-1',
    name: 'Goa Weekend Getaway',
    startDate: format(addDays(today, -30), 'yyyy-MM-dd'),
    endDate: format(addDays(today, -27), 'yyyy-MM-dd'),
    type: 'Relaxation',
    travelers: 4,
    coverImage: SEED_DESTINATIONS[0].image,
    status: 'completed',
    budget: {
      totalEstimated: 25000,
      totalActual: 27500,
      currency: 'INR',
      categories: { travel: 8000, accommodation: 12000, activities: 5000 }
    },
    cities: trip2Cities,
    travelSegments: [],
    days: generateItineraryDays(
      'trip-2',
      format(addDays(today, -30), 'yyyy-MM-dd'),
      format(addDays(today, -27), 'yyyy-MM-dd'),
      trip2Cities
    ),
    expenses: SEED_EXPENSES.filter(e => e.tripId === 'trip-2'),
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
