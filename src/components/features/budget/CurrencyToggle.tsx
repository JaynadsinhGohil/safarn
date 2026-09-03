import { ChevronDown } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import type { Currency } from '@/types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
];

interface CurrencyToggleProps {
  className?: string;
}

export function CurrencyToggle({ className }: CurrencyToggleProps) {
  const { currency, setCurrency } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = CURRENCY_OPTIONS.find(c => c.value === currency) ?? CURRENCY_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/50 bg-surface text-sm font-medium hover:border-primary/40 transition-colors"
      >
        <span className="font-bold text-primary">{current.symbol}</span>
        <span>{current.value}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-background border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden w-44">
          {CURRENCY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setCurrency(opt.value); setOpen(false); }}
              className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container transition-colors flex items-center gap-2', currency === opt.value && 'text-primary font-medium bg-primary/5')}
            >
              <span className="font-bold w-4">{opt.symbol}</span>
              <span>{opt.value}</span>
              <span className="text-xs text-muted-foreground ml-auto">{opt.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
