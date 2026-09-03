import type { ExploreDestination, ExploreActivity } from '@/types';
import { EXPLORE_DESTINATIONS } from '@/data/mock/destinations';
import { EXPLORE_ACTIVITIES } from '@/data/mock/activities';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export interface DestinationFilters {
  query?: string;
  region?: string;
  travelStyle?: string;
  budgetLevel?: string;
  bestFor?: string;
}

export interface ActivityFilters {
  query?: string;
  category?: string;
  destinationId?: string;
  maxPrice?: number;
  minRating?: number;
}

export const exploreService = {
  async getDestinations(filters?: DestinationFilters): Promise<ExploreDestination[]> {
    await delay(200);
    let results = [...EXPLORE_DESTINATIONS];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.travelStyles.some(s => s.toLowerCase().includes(q))
      );
    }
    if (filters?.region && filters.region !== 'All') {
      results = results.filter(d => d.region === filters.region);
    }
    if (filters?.travelStyle && filters.travelStyle !== 'All') {
      results = results.filter(d => d.travelStyles.includes(filters.travelStyle!));
    }
    if (filters?.budgetLevel && filters.budgetLevel !== 'All') {
      results = results.filter(d => d.budgetLevel === filters.budgetLevel);
    }
    if (filters?.bestFor && filters.bestFor !== 'All') {
      results = results.filter(d => d.bestFor.includes(filters.bestFor!));
    }
    return results;
  },

  async getDestinationById(id: string): Promise<ExploreDestination | undefined> {
    await delay(100);
    return EXPLORE_DESTINATIONS.find(d => d.id === id);
  },

  async getAutocomplete(query: string): Promise<string[]> {
    await delay(100);
    if (!query) return [];
    const q = query.toLowerCase();
    return EXPLORE_DESTINATIONS
      .filter(d => d.name.toLowerCase().startsWith(q) || d.state.toLowerCase().startsWith(q))
      .slice(0, 5)
      .map(d => `${d.name}, ${d.state}`);
  },

  async getActivities(filters?: ActivityFilters): Promise<ExploreActivity[]> {
    await delay(200);
    let results = [...EXPLORE_ACTIVITIES];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.destinationName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    if (filters?.category && filters.category !== 'All') {
      results = results.filter(a => a.category === filters.category);
    }
    if (filters?.destinationId) {
      results = results.filter(a => a.destinationId === filters.destinationId);
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter(a => a.price <= filters.maxPrice!);
    }
    if (filters?.minRating !== undefined) {
      results = results.filter(a => a.rating >= filters.minRating!);
    }
    return results;
  },

  async getActivityById(id: string): Promise<ExploreActivity | undefined> {
    await delay(100);
    return EXPLORE_ACTIVITIES.find(a => a.id === id);
  },

  async getActivitiesForDestination(destinationId: string): Promise<ExploreActivity[]> {
    await delay(150);
    return EXPLORE_ACTIVITIES.filter(a => a.destinationId === destinationId);
  },
};
