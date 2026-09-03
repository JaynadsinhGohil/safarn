import type { Currency } from '@/types';

// Mock exchange rates relative to INR
const RATES_FROM_INR: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Convert amount from one currency to another using mock rates.
 * Architecture: Replace RATES_FROM_INR with real API response in production.
 */
export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  // Convert to INR first, then to target
  const inrAmount = from === 'INR' ? amount : amount / RATES_FROM_INR[from];
  return inrAmount * RATES_FROM_INR[to];
}

/**
 * Format a number as a currency string.
 * All UI formatting must go through this function — no inline formatting.
 */
export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const symbol = SYMBOLS[currency];
  if (currency === 'INR') {
    // Indian number formatting
    return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`;
}

/**
 * Format amount converting from INR to the target currency.
 */
export function formatFromINR(amountINR: number, targetCurrency: Currency): string {
  const converted = convert(amountINR, 'INR', targetCurrency);
  return formatCurrency(converted, targetCurrency);
}

export const currencyService = {
  convert,
  format: formatCurrency,
  formatFromINR,
  getSymbol: (c: Currency) => SYMBOLS[c],
  getCurrencies: (): Currency[] => ['INR', 'USD', 'EUR', 'GBP'],
};
