/**
 * Sharing Service
 * Architecture: In production, replace localStorage lookups with backend API calls.
 * The shareId pattern is intentionally backend-replaceable:
 *   - POST /api/trips/:id/share → returns { shareId }
 *   - GET  /api/share/:shareId  → returns public Trip data
 *
 * For the Phase 5 frontend mock:
 *   - shareId is stored on the Trip object in localStorage
 *   - /share/:shareId route does a localStorage lookup
 */

const generateShareId = (): string => {
  return Math.random().toString(36).substring(2, 10) +
         Math.random().toString(36).substring(2, 10);
};

const getShareUrl = (shareId: string): string => {
  return `${window.location.origin}/share/${shareId}`;
};

export const sharingService = {
  generateShareId,
  getShareUrl,

  async copyLink(shareId: string): Promise<boolean> {
    const url = getShareUrl(shareId);
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      return true;
    }
  },

  async nativeShare(shareId: string, tripName: string): Promise<boolean> {
    const url = getShareUrl(shareId);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GlobeTrotter — ${tripName}`,
          text: `Check out my travel itinerary for ${tripName}!`,
          url,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  getWhatsAppUrl(shareId: string, tripName: string): string {
    const url = encodeURIComponent(getShareUrl(shareId));
    const text = encodeURIComponent(`Check out my travel itinerary for ${tripName}! `);
    return `https://wa.me/?text=${text}${url}`;
  },

  getFacebookUrl(shareId: string): string {
    const url = encodeURIComponent(getShareUrl(shareId));
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  },
};
