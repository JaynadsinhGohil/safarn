import type { Expense } from '@/types';

export const SEED_EXPENSES: Expense[] = [
  // Rajasthan Royal Tour (trip-1)
  { id: 'exp-1', tripId: 'trip-1', title: 'Delhi to Jaipur Flight', amount: 5800, currency: 'INR', category: 'transport', date: '2026-09-14', paidBy: 'Aditi Sharma', notes: 'Both tickets included' },
  { id: 'exp-2', tripId: 'trip-1', title: 'Hotel Samode Haveli (3 nights)', amount: 18000, currency: 'INR', category: 'accommodation', date: '2026-09-14', paidBy: 'Aditi Sharma' },
  { id: 'exp-3', tripId: 'trip-1', title: 'Amber Fort Entry & Guide', amount: 1600, currency: 'INR', category: 'activities', date: '2026-09-15', paidBy: 'Aditi Sharma' },
  { id: 'exp-4', tripId: 'trip-1', title: 'Rajasthani Thali Dinner', amount: 1400, currency: 'INR', category: 'food', date: '2026-09-15', paidBy: 'Aditi Sharma' },
  { id: 'exp-5', tripId: 'trip-1', title: 'Jaipur to Udaipur Cab', amount: 3500, currency: 'INR', category: 'transport', date: '2026-09-17', paidBy: 'Aditi Sharma' },
  // Goa Weekend Getaway (trip-2)
  { id: 'exp-6', tripId: 'trip-2', title: 'Mumbai to Goa Train', amount: 3200, currency: 'INR', category: 'transport', date: '2026-07-31', paidBy: 'Aditi Sharma', notes: '4 tickets AC2' },
  { id: 'exp-7', tripId: 'trip-2', title: 'Beach Resort (3 nights)', amount: 14400, currency: 'INR', category: 'accommodation', date: '2026-07-31', paidBy: 'Aditi Sharma' },
  { id: 'exp-8', tripId: 'trip-2', title: 'Water Sports Package', amount: 6000, currency: 'INR', category: 'activities', date: '2026-08-01', paidBy: 'Aditi Sharma', notes: 'For all 4 people' },
  { id: 'exp-9', tripId: 'trip-2', title: 'Seafood Dinner at Beach Shack', amount: 3600, currency: 'INR', category: 'food', date: '2026-08-01', paidBy: 'Aditi Sharma' },
];
