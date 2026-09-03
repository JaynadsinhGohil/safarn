import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, MapPin, Calendar, Users, Copy, Edit, Trash, Share2, IndianRupee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function MyTrips() {
  const { trips, deleteTrip, duplicateTrip, updateTripPrivacy, loading } = useTrip();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [shareTripId, setShareTripId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDuplicate = async (id: string) => {
    await duplicateTrip(id);
    toast({ title: "Trip duplicated successfully" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      await deleteTrip(id);
      toast({ title: "Trip deleted" });
    }
  };

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const tripToShare = trips.find(t => t.id === shareTripId);

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide" className="py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Trips</h1>
          <p className="text-muted-foreground">Manage and track all your travel plans.</p>
        </div>
        <Button size="lg" className="rounded-full shadow-lg" asChild>
          <Link to="/trips/new">
            <Plus className="w-5 h-5 mr-2" /> Plan New Trip
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface/50 p-2 rounded-xl border border-border/40">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-transparent h-12 w-full md:w-auto justify-start overflow-x-auto">
            <TabsTrigger value="all" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Ongoing</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search trips..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-background border-border/60"
          />
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <Card className="border-dashed border-2 border-border/60 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-4">No trips found matching your criteria.</p>
            {search && <Button variant="outline" onClick={() => setSearch('')}>Clear Search</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrips.map(trip => (
            <Card key={trip.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/40 flex flex-col">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={trip.coverImage} 
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md capitalize bg-background/90 text-foreground backdrop-blur-md shadow-sm`}>
                    {trip.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm backdrop-blur-md">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to={`/trips/${trip.id}/itinerary/view`} className="cursor-pointer flex items-center">
                          <Search className="w-4 h-4 mr-2" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/trips/${trip.id}/edit`} className="cursor-pointer flex items-center">
                          <Edit className="w-4 h-4 mr-2" /> Edit Itinerary
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShareTripId(trip.id)} className="cursor-pointer flex items-center">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(trip.id)} className="cursor-pointer flex items-center">
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(trip.id)} className="cursor-pointer flex items-center text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <span>{trip.type}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {(trip.budget.totalEstimated).toLocaleString('en-IN')}</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                  <Link to={`/trips/${trip.id}/itinerary/view`}>{trip.name}</Link>
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0 text-foreground/40" />
                    <span>{format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-foreground/40" />
                    <span className="line-clamp-1">{trip.cities.length > 0 ? trip.cities.map(c => c.name).join(' → ') : 'No cities added'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0 text-foreground/40" />
                    <span>{trip.travelers} Traveler{trip.travelers !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Share Trip Dialog */}
      <Dialog open={!!shareTripId} onOpenChange={(open) => !open && setShareTripId(null)}>
        <DialogContent className="sm:max-w-md bg-background border-border/40">
          <DialogHeader>
            <DialogTitle>Share Trip</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {tripToShare?.name}
            </p>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-surface/50">
              <div>
                <p className="font-medium text-sm">Public Link</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
              </div>
              <Button 
                variant={tripToShare?.isPublic ? "default" : "outline"} 
                size="sm"
                onClick={() => {
                  if (tripToShare) {
                    updateTripPrivacy(tripToShare.id, !tripToShare.isPublic);
                  }
                }}
              >
                {tripToShare?.isPublic ? 'Enabled' : 'Enable Link'}
              </Button>
            </div>

            {tripToShare?.isPublic && tripToShare.shareId && (
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/share/${tripToShare.shareId}`} 
                  className="bg-muted/50"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/${tripToShare.shareId}`);
                    toast({ title: 'Link copied to clipboard!' });
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground pt-2">
              Note: This is a frontend-only demo. Links will only work on this browser unless a real backend is implemented.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
