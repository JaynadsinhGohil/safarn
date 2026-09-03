import { useSettings } from '@/context/SettingsContext';
import { currencyService } from '@/services/currencyService';
import type { Currency } from '@/types';

/**
 * useCurrency — the single hook for all currency formatting in the app.
 * All components must use this hook rather than formatting amounts inline.
 */
export function useCurrency() {
  const { currency, setCurrency } = useSettings();

  return {
    currency,
    setCurrency,
    /** Format an amount already in the current currency */
    format: (amount: number) => currencyService.format(amount, currency),
    /** Format an amount that is stored in INR, converting to current currency */
    formatFromINR: (amountINR: number) => currencyService.formatFromINR(amountINR, currency),
    /** Convert from INR to current currency */
    convertFromINR: (amountINR: number) => currencyService.convert(amountINR, 'INR', currency),
    /** Get current currency symbol */
    symbol: currencyService.getSymbol(currency),
    /** List of all available currencies */
    currencies: currencyService.getCurrencies() as Currency[],
  };
}
