import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { exploreService } from '@/services/exploreService';
import type { ExploreActivity } from '@/types';
import { SearchInput } from '@/components/features/explore/SearchInput';
import { ActivityCard } from '@/components/features/explore/ActivityCard';
import { ActivityDetailSheet } from '@/components/features/explore/ActivityDetailSheet';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'adventure', 'culture', 'food', 'nature', 'relaxation', 'sightseeing', 'spiritual'];
const PRICE_RANGES = [
  { label: 'All', max: undefined },
  { label: 'Free', max: 0 },
  { label: 'Under ₹1,000', max: 1000 },
  { label: 'Under ₹3,000', max: 3000 },
  { label: 'Under ₹8,000', max: 8000 },
];

export function ExploreActivities() {
  const [activities, setActivities] = useState<ExploreActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [selected, setSelected] = useState<ExploreActivity | null>(null);

  useEffect(() => {
    setLoading(true);
    const priceMax = PRICE_RANGES[priceRange].max;
    exploreService.getActivities({
      query: query || undefined,
      category: category !== 'All' ? category : undefined,
      maxPrice: priceMax === 0 ? 0 : priceMax,
      minRating: minRating > 0 ? minRating : undefined,
    }).then(results => {
      setActivities(results);
      setLoading(false);
    });
  }, [query, category, priceRange, minRating]);

  return (
    <PageContainer maxWidth="wide" className="py-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <Link to="/explore" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Destinations
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Zap className="w-4 h-4" />
          <span>Activities</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-1">Find Activities</h1>
        <p className="text-muted-foreground">Discover unique experiences across India and beyond</p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search rafting, yoga, food tour..." />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-surface/30 p-3 rounded-2xl border border-border/40 mb-6">
        
        <div className="w-full sm:w-auto min-w-[140px]">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={cn("h-10 rounded-xl bg-surface capitalize", category !== 'All' && "border-primary text-primary font-medium")}>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c === 'All' ? 'Any Category' : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto min-w-[140px]">
          <Select value={priceRange.toString()} onValueChange={(v) => setPriceRange(parseInt(v))}>
            <SelectTrigger className={cn("h-10 rounded-xl bg-surface", priceRange !== 0 && "border-primary text-primary font-medium")}>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((p, i) => (
                <SelectItem key={i.toString()} value={i.toString()}>{p.label === 'All' ? 'Any Price' : p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto min-w-[140px]">
          <Select value={minRating.toString()} onValueChange={(v) => setMinRating(parseFloat(v))}>
            <SelectTrigger className={cn("h-10 rounded-xl bg-surface", minRating !== 0 && "border-primary text-primary font-medium")}>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              {[0, 4, 4.5].map(r => (
                <SelectItem key={r.toString()} value={r.toString()}>{r === 0 ? 'Any Rating' : r === 4 ? '4+ ★' : '4.5+ ★'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(category !== 'All' || priceRange !== 0 || minRating !== 0) && (
          <Button 
            variant="ghost" 
            onClick={() => { setCategory('All'); setPriceRange(0); setMinRating(0); }}
            className="h-10 rounded-xl text-muted-foreground hover:text-foreground shrink-0 px-3"
          >
            <X className="w-4 h-4 mr-2" /> Clear
          </Button>
        )}

      </div>

      {/* Results count */}
      {!loading && <p className="text-sm text-muted-foreground mb-4">{activities.length} activit{activities.length === 1 ? 'y' : 'ies'} found</p>}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/40 animate-pulse">
              <div className="aspect-video bg-surface-container" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-container rounded w-3/4" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-20">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold mb-2">No activities found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={() => { setQuery(''); setCategory('All'); setPriceRange(0); setMinRating(0); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Grid */}
      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activities.map(a => (
            <ActivityCard key={a.id} activity={a} onClick={() => setSelected(a)} />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      {selected && <ActivityDetailSheet activity={selected} onClose={() => setSelected(null)} />}
    </PageContainer>
  );
}
