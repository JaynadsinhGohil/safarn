export type TripStatus = 'upcoming' | 'ongoing' | 'completed' | 'draft';
export type TravelMode = 'flight' | 'train' | 'bus' | 'self-drive' | 'cab';
export type ExpenseCategory = 'transport' | 'accommodation' | 'activities' | 'food' | 'other';
export type BudgetLevel = 'budget' | 'mid-range' | 'luxury';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Budget {
  totalEstimated: number;
  totalActual?: number;
  currency: string;
  categories: {
    travel: number;
    accommodation: number;
    activities: number;
    food?: number;
    other?: number;
  };
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  paidBy: string;
  notes?: string;
}

export interface Activity {
  id: string;
  dayId: string;
  title: string;
  description?: string;
  time?: string;
  location?: string;
  estimatedCost?: number;
  type?: 'sightseeing' | 'food' | 'relaxation' | 'adventure' | 'custom';
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  date: string;
  dayNumber: number;
  cityId: string;
  activities: Activity[];
}

export interface TravelSegment {
  id: string;
  fromCityId: string;
  toCityId: string;
  mode: TravelMode;
  estimatedTime?: string;
  estimatedCost?: number;
  departureTime?: string;
  arrivalTime?: string;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  country: string;
  image: string;
  description?: string;
}

export interface ExploreDestination {
  id: string;
  name: string;
  state: string;
  country: string;
  image: string;
  description: string;
  highlights: string[];
  region: 'North India' | 'South India' | 'East India' | 'West India' | 'Central India' | 'Northeast India' | 'International';
  travelStyles: string[];
  budgetLevel: BudgetLevel;
  bestFor: string[];
  suggestedDays: number;
  avgCostPerDay: number; // INR
  rating: number;
  popularActivities: string[];
  coordinates?: { lat: number; lng: number };
}

export interface ExploreActivity {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  category: 'adventure' | 'culture' | 'food' | 'nature' | 'relaxation' | 'sightseeing' | 'spiritual';
  image: string;
  duration: string;
  price: number; // INR
  rating: number;
  description: string;
  location: string;
}

export interface WeatherDay {
  date: string;
  high: number;
  low: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'stormy' | 'snowy';
  humidity: number;
  description: string;
}

export interface CityStop {
  id: string;
  tripId: string;
  destinationId: string;
  name: string;
  nights: number;
  order: number;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  travelers: number;
  coverImage?: string;
  status: TripStatus;
  notes?: string;
  budget: Budget;
  cities: CityStop[];
  travelSegments: TravelSegment[];
  days: ItineraryDay[];
  expenses?: Expense[];
  isPublic?: boolean;
  shareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'trip_reminder' | 'budget_alert' | 'itinerary_update' | 'recommendation' | 'share_activity';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  tripId?: string;
}

export interface UserSettings {
  currency: Currency;
  language: string;
  units: 'metric' | 'imperial';
  notifications: {
    tripReminders: boolean;
    activityAlerts: boolean;
    budgetAlerts: boolean;
    productUpdates: boolean;
  };
}

export interface WishlistState {
  destinations: string[];
  activities: string[];
}
