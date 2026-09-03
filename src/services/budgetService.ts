import type { Trip, ExpenseCategory } from '@/types';

export interface BudgetSummary {
  tripId: string;
  tripName: string;
  estimated: number;
  actual: number;
  remaining: number;
  isOverBudget: boolean;
  perPersonEstimated: number;
  perPersonActual: number;
  categoryBreakdown: { category: ExpenseCategory; estimated: number; actual: number }[];
  savingsSuggestions: string[];
}

export const budgetService = {
  getSummary(trip: Trip): BudgetSummary {
    const expenses = trip.expenses ?? [];
    const travelers = trip.travelers || 1;
    const estimated = trip.budget?.totalEstimated ?? 0;
    const actual = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categories: ExpenseCategory[] = ['transport', 'accommodation', 'activities', 'food', 'other'];
    const estimatedByCategory: Record<ExpenseCategory, number> = {
      transport: trip.budget?.categories?.travel ?? 0,
      accommodation: trip.budget?.categories?.accommodation ?? 0,
      activities: trip.budget?.categories?.activities ?? 0,
      food: trip.budget?.categories?.food ?? 0,
      other: trip.budget?.categories?.other ?? 0,
    };

    const categoryBreakdown = categories.map(cat => ({
      category: cat,
      estimated: estimatedByCategory[cat],
      actual: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    }));

    const remaining = estimated - actual;
    const pct = estimated > 0 ? (actual / estimated) * 100 : 0;

    // Contextual, travel-product insights (not generic accounting copy)
    const savingsSuggestions: string[] = [];

    if (estimated === 0) {
      // no budget set — no suggestions to show
    } else if (actual === 0) {
      // No spending yet
      const topCategory = [...categoryBreakdown]
        .filter(c => c.estimated > 0)
        .sort((a, b) => b.estimated - a.estimated)[0];
      if (topCategory) {
        const LABELS: Record<string, string> = { transport: 'Transport', accommodation: 'Accommodation', activities: 'Activities', food: 'Food', other: 'Other' };
        savingsSuggestions.push(`${LABELS[topCategory.category]} is your largest planned expense. Add expenses as you go to stay on track.`);
      }
    } else {
      // Active spending
      if (!remaining || remaining <= 0) {
        savingsSuggestions.push(`You've reached or exceeded your planned budget of ₹${estimated.toLocaleString('en-IN')}.`);
      } else if (pct < 50) {
        savingsSuggestions.push(`You're well within budget — ${Math.round(100 - pct)}% remaining.`);
      } else if (pct < 80) {
        savingsSuggestions.push(`You've used ${Math.round(pct)}% of your budget. You're on track.`);
      } else {
        savingsSuggestions.push(`You've used ${Math.round(pct)}% of your budget — keep a close eye on spending.`);
      }

      const overCategories = categoryBreakdown.filter(c => c.estimated > 0 && c.actual > c.estimated);
      const LABELS: Record<string, string> = { transport: 'Transport', accommodation: 'Accommodation', activities: 'Activities', food: 'Food', other: 'Other' };
      for (const cat of overCategories.slice(0, 1)) {
        savingsSuggestions.push(`Your ${LABELS[cat.category]} costs are ₹${(cat.actual - cat.estimated).toLocaleString('en-IN')} over estimate.`);
      }

      const activitiesCategory = categoryBreakdown.find(c => c.category === 'activities');
      if (activitiesCategory && remaining > 0 && activitiesCategory.actual === 0 && activitiesCategory.estimated === 0) {
        savingsSuggestions.push(`You have ₹${remaining.toLocaleString('en-IN')} left — great budget for experiences and activities.`);
      }
    }

    return {
      tripId: trip.id,
      tripName: trip.name,
      estimated,
      actual,
      remaining,
      isOverBudget: estimated > 0 && actual > estimated,
      perPersonEstimated: travelers > 0 ? Math.round(estimated / travelers) : 0,
      perPersonActual: travelers > 0 ? Math.round(actual / travelers) : 0,
      categoryBreakdown,
      savingsSuggestions,
    };
  },
};
