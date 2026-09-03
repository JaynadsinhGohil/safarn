import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { exploreService } from '@/services/exploreService';
import type { ExploreDestination } from '@/types';
import { SearchInput } from '@/components/features/explore/SearchInput';
import { ExploreFilters, type FilterState } from '@/components/features/explore/ExploreFilters';
import { DestinationCard } from '@/components/features/explore/DestinationCard';
import { DestinationDrawer } from '@/components/features/explore/DestinationDrawer';
import { Link } from 'react-router-dom';
import { Compass, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Explore() {
  const [destinations, setDestinations] = useState<ExploreDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ region: 'All', travelStyle: 'All', budgetLevel: 'All', bestFor: 'All' });
  const [selectedDest, setSelectedDest] = useState<ExploreDestination | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    exploreService.getDestinations({
      query: query || undefined,
      region: filters.region !== 'All' ? filters.region : undefined,
      travelStyle: filters.travelStyle !== 'All' ? filters.travelStyle : undefined,
      budgetLevel: filters.budgetLevel !== 'All' ? filters.budgetLevel : undefined,
      bestFor: filters.bestFor !== 'All' ? filters.bestFor : undefined,
    }).then(results => {
      setDestinations(results);
      setLoading(false);
    });
  }, [query, filters]);

  const featured = destinations.slice(0, 3);
  const rest = destinations.slice(3);

  return (
    <PageContainer maxWidth="wide" className="py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-1">Explore Destinations</h1>
        <p className="text-muted-foreground">Handpicked destinations across India and beyond</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Search India, Goa, Kerala..." className="flex-1" />
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="shrink-0">
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/explore/activities">Activities</Link>
          </Button>
        </div>
        {showFilters && <ExploreFilters filters={filters} onChange={setFilters} />}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/40 animate-pulse">
              <div className="aspect-[4/3] bg-surface-container" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-container rounded w-3/4" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && destinations.length === 0 && (
        <div className="text-center py-20">
          <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold mb-2">No destinations found</h3>
          <p className="text-muted-foreground mb-4">Try a different search or clear your filters.</p>
          <Button variant="outline" onClick={() => { setQuery(''); setFilters({ region: 'All', travelStyle: 'All', budgetLevel: 'All', bestFor: 'All' }); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Featured Row */}
      {!loading && featured.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg mb-4">✨ Featured Destinations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(dest => (
              <DestinationCard key={dest.id} destination={dest} onClick={() => setSelectedDest(dest)} />
            ))}
          </div>
        </div>
      )}

      {/* All Destinations */}
      {!loading && rest.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4">All Destinations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {rest.map(dest => (
              <DestinationCard key={dest.id} destination={dest} onClick={() => setSelectedDest(dest)} />
            ))}
          </div>
        </div>
      )}

      {/* Destination Drawer */}
      {selectedDest && (
        <DestinationDrawer destination={selectedDest} onClose={() => setSelectedDest(null)} />
      )}
    </PageContainer>
  );
}
