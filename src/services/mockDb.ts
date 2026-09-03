import type { Trip } from '@/types';
import { SEED_TRIPS, SEED_DESTINATIONS } from '@/data/mock/seedData';
import { generateItineraryDays } from '@/lib/dateUtils';

const DB_KEY = 'globetrotter_trips';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
  // Initialize the database with seed data if it's empty
  init() {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_TRIPS));
    } else {
      // Migration: Ensure existing trips have properly structured days
      try {
        const trips: Trip[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
        let migrated = false;
        const migratedTrips = trips.map(trip => {
          // Ensure required fields exist
          const safeCities = Array.isArray(trip.cities) ? trip.cities : [];
          const safeSegments = Array.isArray(trip.travelSegments) ? trip.travelSegments : [];
          const safeExpenses = Array.isArray(trip.expenses) ? trip.expenses : [];

          if (!trip.days || trip.days.length === 0) {
            migrated = true;
            return {
              ...trip,
              cities: safeCities,
              travelSegments: safeSegments,
              // Regenerate days using the actual cities array
              days: generateItineraryDays(trip.id, trip.startDate, trip.endDate, safeCities),
              expenses: safeExpenses,
              isPublic: trip.isPublic ?? false,
            };
          }
          return {
            ...trip,
            cities: safeCities,
            travelSegments: safeSegments,
            expenses: safeExpenses,
            isPublic: trip.isPublic ?? false,
          };
        });
        if (migrated) {
          localStorage.setItem(DB_KEY, JSON.stringify(migratedTrips));
        } else {
          // Still write back with safe fields ensured
          localStorage.setItem(DB_KEY, JSON.stringify(migratedTrips));
        }
      } catch (e) {
        // If localStorage is corrupt, reset to seed data
        console.warn('Safarn: localStorage corrupt, resetting to seed data.', e);
        localStorage.setItem(DB_KEY, JSON.stringify(SEED_TRIPS));
      }
    }
  },

  // Get all trips
  getTrips: async (): Promise<Trip[]> => {
    await delay(300); // Network delay
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Save trips back to local storage
  saveTrips: async (trips: Trip[]): Promise<void> => {
    await delay(200);
    localStorage.setItem(DB_KEY, JSON.stringify(trips));
  },

  // Get all destinations (read-only reference data)
  getDestinations: async () => {
    await delay(200);
    return SEED_DESTINATIONS;
  }
};
