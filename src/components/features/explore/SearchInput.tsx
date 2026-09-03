import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { exploreService } from '@/services/exploreService';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search destinations...', className }: SearchInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    if (!value || value.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      const results = await exploreService.getAutocomplete(value);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 250);
    setTimer(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-10 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
        />
        {value && (
          <button
            onClick={() => { onChange(''); setSuggestions([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-container"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { onChange(s.split(',')[0]); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container transition-colors flex items-center gap-3"
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
