import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const REGIONS = ['All', 'North India', 'South India', 'East India', 'West India', 'Northeast India', 'International'];
const TRAVEL_STYLES = ['All', 'Beach', 'Adventure', 'Cultural', 'Nature', 'Relaxation', 'Spiritual', 'Heritage'];
const BUDGET_LEVELS = ['All', 'budget', 'mid-range', 'luxury'];
const BEST_FOR = ['All', 'Couples', 'Solo', 'Families', 'Friends'];

export interface FilterState {
  region: string;
  travelStyle: string;
  budgetLevel: string;
  bestFor: string;
}

interface ExploreFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function ExploreFilters({ filters, onChange }: ExploreFiltersProps) {
  
  const hasActiveFilters = filters.region !== 'All' || filters.travelStyle !== 'All' || filters.budgetLevel !== 'All' || filters.bestFor !== 'All';

  const handleClear = () => {
    onChange({ region: 'All', travelStyle: 'All', budgetLevel: 'All', bestFor: 'All' });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center bg-surface/30 p-3 rounded-2xl border border-border/40">
      
      <div className="w-full sm:w-auto min-w-[140px]">
        <Select value={filters.region} onValueChange={(v) => onChange({ ...filters, region: v })}>
          <SelectTrigger className={cn("h-10 rounded-xl bg-surface", filters.region !== 'All' && "border-primary text-primary font-medium")}>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map(r => (
              <SelectItem key={r} value={r}>{r === 'All' ? 'Any Region' : r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto min-w-[140px]">
        <Select value={filters.travelStyle} onValueChange={(v) => onChange({ ...filters, travelStyle: v })}>
          <SelectTrigger className={cn("h-10 rounded-xl bg-surface", filters.travelStyle !== 'All' && "border-primary text-primary font-medium")}>
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            {TRAVEL_STYLES.map(s => (
              <SelectItem key={s} value={s}>{s === 'All' ? 'Any Style' : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto min-w-[140px]">
        <Select value={filters.budgetLevel} onValueChange={(v) => onChange({ ...filters, budgetLevel: v })}>
          <SelectTrigger className={cn("h-10 rounded-xl bg-surface", filters.budgetLevel !== 'All' && "border-primary text-primary font-medium")}>
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_LEVELS.map(b => (
              <SelectItem key={b} value={b}>{b === 'All' ? 'Any Budget' : b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto min-w-[140px]">
        <Select value={filters.bestFor} onValueChange={(v) => onChange({ ...filters, bestFor: v })}>
          <SelectTrigger className={cn("h-10 rounded-xl bg-surface", filters.bestFor !== 'All' && "border-primary text-primary font-medium")}>
            <SelectValue placeholder="Best For" />
          </SelectTrigger>
          <SelectContent>
            {BEST_FOR.map(f => (
              <SelectItem key={f} value={f}>{f === 'All' ? 'Anyone' : f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={handleClear}
          className="h-10 rounded-xl text-muted-foreground hover:text-foreground shrink-0 px-3"
        >
          <X className="w-4 h-4 mr-2" /> Clear
        </Button>
      )}

    </div>
  );
}
