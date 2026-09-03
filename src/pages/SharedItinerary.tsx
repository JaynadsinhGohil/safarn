import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useEffect, useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { sharingService } from '@/services/sharingService';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import {
  MapPin, Calendar, Users, Share2, Copy, Clock, Globe, ExternalLink
} from 'lucide-react';
import type { Trip } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function SharedItinerary() {
  const { shareId } = useParams<{ shareId: string }>();
  const { getTripByShareId, duplicateTrip } = useTrip();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    // Architecture: In production, replace this with GET /api/share/:shareId
    if (shareId) {
      const found = getTripByShareId(shareId);
      setTrip(found ?? null);
    }
    setTimeout(() => setLoading(false), 300);
  }, [shareId, getTripByShareId]);

  const handleCopy = async () => {
    if (!shareId) return;
    await sharingService.copyLink(shareId);
    toast({ title: 'Link copied!', description: 'Share it with anyone.' });
  };

  const handleShare = async () => {
    if (!shareId || !trip) return;
    const shared = await sharingService.nativeShare(shareId, trip.name);
    if (!shared) {
      // Fallback to copy
      await handleCopy();
    }
  };

  const handleCopyTrip = () => {
    if (!trip) return;
    duplicateTrip(trip.id);
    toast({ title: 'Trip Copied!', description: 'You can now edit this trip in your Dashboard.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">Itinerary not found</h1>
          <p className="text-muted-foreground mb-6">This itinerary may have been made private or the link has expired.</p>
          <Button asChild><Link to="/">Go to Safarn</Link></Button>
        </div>
      </div>
    );
  }

  const days = trip.days ?? [];
  const totalDays = days.length;
  const nights = Math.max(0, totalDays - 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</div>
            <span className="font-heading font-bold text-primary">Safarn</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-surface-container px-2 py-1 rounded-full">Read-only</span>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Link
            </Button>
            <Button size="sm" onClick={handleCopyTrip} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Trip
            </Button>
            <Button size="sm" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
            </Button>
          </div>
        </div>
      </header>

      <PageContainer maxWidth="default" className="py-8 pb-20">
        {/* Trip hero */}
        {trip.coverImage && (
          <div className="relative aspect-[3/1] rounded-2xl overflow-hidden mb-6">
            <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Trip meta */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">{trip.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {trip.cities.length > 0 && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{trip.cities.map(c => c.name).join(' → ')}</span>
            )}
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(parseISO(trip.startDate), 'dd MMM')} – {format(parseISO(trip.endDate), 'dd MMM yyyy')}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{totalDays} Day{totalDays !== 1 ? 's' : ''}, {nights} Night{nights !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{trip.travelers} Traveler{trip.travelers !== 1 ? 's' : ''}</span>
          </div>
          {trip.notes && <p className="mt-3 text-muted-foreground leading-relaxed">{trip.notes}</p>}
        </div>

        {/* Sharing actions */}
        <div className="flex flex-wrap gap-2 mb-8 p-4 bg-surface rounded-xl border border-border/40">
          <p className="w-full text-sm font-medium mb-1">Share this itinerary</p>
          <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="w-3.5 h-3.5 mr-1.5" />Copy Link</Button>
          <a
            href={sharingService.getWhatsAppUrl(shareId!, trip.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <a
            href={sharingService.getFacebookUrl(shareId!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Facebook
          </a>
        </div>

        {/* Day-by-day itinerary */}
        <div className="space-y-6">
          {days.map(day => {
            const cityStop = trip.cities.find(c => c.id === day.cityId);
            return (
              <div key={day.id} className="bg-surface rounded-2xl border border-border/40 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border/40 bg-surface-container/30">
                  <div>
                    <p className="font-heading font-bold">Day {day.dayNumber}</p>
                    <p className="text-sm text-muted-foreground">{format(parseISO(day.date), 'EEEE, dd MMMM yyyy')}</p>
                  </div>
                  {cityStop && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {cityStop.name}
                    </div>
                  )}
                </div>
                <div className="divide-y divide-border/30">
                  {day.activities.length === 0 ? (
                    <p className="p-5 text-sm text-muted-foreground italic">No activities planned for this day.</p>
                  ) : (
                    day.activities.map((act, idx) => (
                      <div key={act.id} className="flex gap-4 p-5">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                          {idx < day.activities.length - 1 && <div className="w-0.5 flex-1 bg-border/50 mt-2" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{act.title}</p>
                            {act.time && <span className="text-xs text-muted-foreground shrink-0 bg-surface-container px-2 py-0.5 rounded-full">{act.time}</span>}
                          </div>
                          {act.location && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{act.location}</p>}
                          {act.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{act.description}</p>}
                          {act.estimatedCost !== undefined && act.estimatedCost > 0 && (
                            <p className="text-xs text-primary mt-1 font-medium">~₹{act.estimatedCost.toLocaleString('en-IN')} per person</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {days.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border/40">
            <p className="text-muted-foreground">This itinerary has no planned days yet.</p>
          </div>
        )}

        {/* Footer attribution */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">Created with <Link to="/" className="text-primary hover:underline">Safarn</Link></p>
        </div>
      </PageContainer>
    </div>
  );
}
