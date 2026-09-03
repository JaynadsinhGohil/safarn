import { useTrip } from '@/context/TripContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, Compass, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

export function Dashboard() {
  const { trips, loading } = useTrip();

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </PageContainer>
    );
  }

  const upcomingTrips = trips
    .filter(t => t.status === 'upcoming' || (t.startDate && isAfter(parseISO(t.startDate), new Date())))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  const recentTrips = trips.filter(t => t.id !== nextTrip?.id).slice(0, 3);

  return (
    <PageContainer maxWidth="wide" className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Good morning, Explorer</h1>
          <p className="text-muted-foreground">You have {upcomingTrips.length} upcoming adventure{upcomingTrips.length !== 1 ? 's' : ''} planned.</p>
        </div>
        <Button size="lg" className="rounded-full gap-2 shadow-lg hover:shadow-xl transition-all" asChild>
          <Link to="/trips/new">
            <Plus className="w-5 h-5" /> Plan New Trip
          </Link>
        </Button>
      </div>

      {trips.length === 0 ? (
        // Empty State
        <Card className="border-dashed border-2 border-border/60 bg-surface/50">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Your journey begins here</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start building your perfect itinerary. Discover destinations, manage your budget, and keep everything in one place.
            </p>
            <Button size="lg" asChild>
              <Link to="/trips/new">Start Planning</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Upcoming Trip Hero */}
            {nextTrip && (
              <section>
                <h2 className="text-xl font-heading font-semibold mb-4">Up Next</h2>
                <Link to={`/trips/${nextTrip.id}/itinerary/view`} className="group block">
                  <Card className="overflow-hidden border-border/40 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <div className="relative h-64 md:h-80 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                      <img 
                        src={nextTrip.coverImage} 
                        alt={nextTrip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white">
                        <div className="flex items-center gap-2 text-white/80 mb-2 text-sm font-medium">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(parseISO(nextTrip.startDate), 'MMM d')} - {format(parseISO(nextTrip.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h3 className="text-3xl font-heading font-bold mb-2">{nextTrip.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/90">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {nextTrip.cities.length} Stops</span>
                          <span className="flex items-center gap-1">• {nextTrip.travelers} Travelers</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </section>
            )}

            {/* Recent Trips */}
            {recentTrips.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-semibold">Recent Trips</h2>
                  <Link to="/trips" className="text-sm font-medium text-primary hover:underline">View All</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentTrips.map(trip => (
                    <Link key={trip.id} to={`/trips/${trip.id}/itinerary/view`}>
                      <Card className="group hover:border-primary/50 transition-colors h-full">
                        <CardContent className="p-0 flex h-32">
                          <div className="w-1/3 h-full overflow-hidden rounded-l-lg">
                            <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="w-2/3 p-4 flex flex-col justify-center">
                            <h4 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">{trip.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(parseISO(trip.startDate), 'MMM yyyy')} • {trip.cities.length > 0 ? trip.cities[0].name : 'Custom'}
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-xs font-medium px-2 py-1 bg-surface-container rounded-md capitalize">
                                {trip.status}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Budget Snapshot */}
            {nextTrip && (
              <Card className="border-border/40 bg-surface/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Budget Snapshot</h3>
                  <p className="text-sm text-muted-foreground mb-1">{nextTrip.name}</p>
                  <div className="flex items-end gap-1 mb-6">
                    <IndianRupee className="w-6 h-6 text-foreground mb-1" />
                    <span className="text-4xl font-heading font-bold">{(nextTrip.budget.totalEstimated).toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Flights & Travel</span>
                        <span className="font-medium">₹{nextTrip.budget.categories.travel.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(nextTrip.budget.categories.travel / nextTrip.budget.totalEstimated) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Accommodation</span>
                        <span className="font-medium">₹{nextTrip.budget.categories.accommodation.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${(nextTrip.budget.categories.accommodation / nextTrip.budget.totalEstimated) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions / Inspirations */}
            <Card className="border-border/40 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary">Inspiration</h3>
                <div className="space-y-4">
                  <Link to="#" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1595815771614-ade9d6527620?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="Kashmir" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">Winter in Kashmir</p>
                      <p className="text-xs text-muted-foreground">Trending destination</p>
                    </div>
                  </Link>
                  <Link to="#" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="Goa" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">Goa Long Weekend</p>
                      <p className="text-xs text-muted-foreground">Perfect for groups</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
