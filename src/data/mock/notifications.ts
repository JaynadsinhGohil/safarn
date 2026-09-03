import type { Notification } from '@/types';

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'trip_reminder',
    title: 'Rajasthan Royal Tour in 14 days!',
    message: 'Your trip to Jaipur & Udaipur starts soon. Make sure your hotel bookings and travel documents are in order.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    link: '/trips/trip-1',
    tripId: 'trip-1',
  },
  {
    id: 'notif-2',
    type: 'budget_alert',
    title: 'You\'re close to your Goa trip budget',
    message: 'Your Goa Weekend Getaway expenses have reached 94% of the estimated budget. Consider reviewing your remaining activities.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: '/budget',
    tripId: 'trip-2',
  },
  {
    id: 'notif-3',
    type: 'recommendation',
    title: 'Spiti Valley — Plan before October',
    message: 'The Spiti Valley road closes for winter in late October. This is the last window to plan an incredible high-altitude adventure.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    link: '/explore',
  },
  {
    id: 'notif-4',
    type: 'itinerary_update',
    title: 'Itinerary update for Rajasthan Tour',
    message: 'You added 3 new activities to Day 2 — Amber Fort, Hawa Mahal, and the Pink City walking tour.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    link: '/trips/trip-1/itinerary/view',
    tripId: 'trip-1',
  },
  {
    id: 'notif-5',
    type: 'share_activity',
    title: 'Priya Mehta saved your Goa itinerary',
    message: 'Your friend Priya Mehta saved a copy of your Goa Weekend Getaway itinerary. They love your planning!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    link: '/trips/trip-2',
    tripId: 'trip-2',
  },
  {
    id: 'notif-6',
    type: 'recommendation',
    title: 'Kerala Backwater season is here',
    message: 'October to February is the best time to cruise Kerala\'s backwaters. Start planning your houseboat experience!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    link: '/explore',
  },
  {
    id: 'notif-7',
    type: 'trip_reminder',
    title: 'Long weekend alert: Dussehra Oct 2–5',
    message: 'Make the most of the 4-day Dussehra long weekend. Udaipur and Mysore are great picks for the festive season.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    link: '/trips/new',
  },
];
