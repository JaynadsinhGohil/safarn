import type { WishlistState } from '@/types';

const WISHLIST_KEY = 'globetrotter_wishlist';

const getWishlist = (): WishlistState => {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : { destinations: [], activities: [] };
};

const saveWishlist = (wishlist: WishlistState): void => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
};

export const wishlistService = {
  get(): WishlistState {
    return getWishlist();
  },

  toggleDestination(id: string): WishlistState {
    const w = getWishlist();
    const updated: WishlistState = {
      ...w,
      destinations: w.destinations.includes(id)
        ? w.destinations.filter(d => d !== id)
        : [...w.destinations, id],
    };
    saveWishlist(updated);
    return updated;
  },

  toggleActivity(id: string): WishlistState {
    const w = getWishlist();
    const updated: WishlistState = {
      ...w,
      activities: w.activities.includes(id)
        ? w.activities.filter(a => a !== id)
        : [...w.activities, id],
    };
    saveWishlist(updated);
    return updated;
  },

  isDestinationSaved(id: string): boolean {
    return getWishlist().destinations.includes(id);
  },

  isActivitySaved(id: string): boolean {
    return getWishlist().activities.includes(id);
  },

  clear(): void {
    saveWishlist({ destinations: [], activities: [] });
  },
};
