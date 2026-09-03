import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import type { BudgetSummary } from '@/services/budgetService';
import { cn } from '@/lib/utils';

interface BudgetSummaryProps {
  summary: BudgetSummary;
  travelers: number;
}

function getBudgetHealth(pct: number, isOverBudget: boolean, estimated: number) {
  if (estimated === 0) return null;
  if (isOverBudget) return { label: 'Over Budget', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle };
  if (pct >= 80) return { label: 'Getting Close', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', icon: TrendingUp };
  if (pct >= 50) return { label: 'On Track', color: 'text-primary', bg: 'bg-primary/5 border-primary/20', icon: Minus };
  return { label: 'Well Within Budget', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800', icon: CheckCircle2 };
}

export function BudgetSummaryCards({ summary, travelers }: BudgetSummaryProps) {
  const { formatFromINR } = useCurrency();
  const pct = summary.estimated > 0 ? (summary.actual / summary.estimated) * 100 : 0;
  const health = getBudgetHealth(pct, summary.isOverBudget, summary.estimated);
  const remainingPct = summary.estimated > 0 ? Math.max(0, 100 - pct) : 0;

  return (
    <div className="space-y-5">

      {/* === PRIMARY BUDGET FIGURE === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Dominant total */}
        <div className="md:col-span-1 bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <p className="text-xs font-medium uppercase tracking-widest opacity-70 mb-1">Total Estimated</p>
          <p className="font-heading text-4xl font-bold leading-none mb-3">
            {summary.estimated > 0 ? formatFromINR(summary.estimated) : '—'}
          </p>
          {travelers > 1 && summary.estimated > 0 && (
            <p className="text-sm opacity-75">
              {formatFromINR(summary.perPersonEstimated)} per person
            </p>
          )}
          {summary.estimated === 0 && (
            <p className="text-sm opacity-70">No budget set yet</p>
          )}
        </div>

        {/* Spent + Remaining stacked */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Spent */}
          <div className="bg-surface rounded-2xl border border-border/40 p-5 flex flex-col justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Spent</p>
            <div>
              <p className={cn('font-heading text-2xl font-bold', summary.isOverBudget ? 'text-destructive' : 'text-foreground')}>
                {formatFromINR(summary.actual)}
              </p>
              {travelers > 1 && summary.actual > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{formatFromINR(summary.perPersonActual)} / person</p>
              )}
              {summary.actual === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No expenses yet</p>
              )}
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-surface rounded-2xl border border-border/40 p-5 flex flex-col justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              {summary.remaining < 0 ? 'Over by' : 'Remaining'}
            </p>
            <div>
              <p className={cn('font-heading text-2xl font-bold', summary.remaining < 0 ? 'text-destructive' : summary.estimated > 0 ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground')}>
                {summary.estimated > 0 ? formatFromINR(Math.abs(summary.remaining)) : '—'}
              </p>
              {summary.estimated > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.remaining < 0 ? 'over planned budget' : `${Math.round(remainingPct)}% of budget left`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === BUDGET HEALTH + PROGRESS === */}
      {summary.estimated > 0 && (
        <div className={cn('rounded-2xl border p-4', health?.bg ?? 'bg-surface border-border/40')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {health && <health.icon className={cn('w-4 h-4', health.color)} />}
              <span className={cn('font-semibold text-sm', health?.color)}>{health?.label}</span>
            </div>
            <span className={cn('text-sm font-bold tabular-nums', pct >= 100 ? 'text-destructive' : pct >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-green-700 dark:text-green-400')}>
              {Math.round(Math.min(pct, 100))}% used
            </span>
          </div>
          <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary')}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          {summary.isOverBudget && (
            <p className={cn('text-xs mt-2', health?.color)}>
              You've exceeded your planned budget by {formatFromINR(summary.actual - summary.estimated)}.
            </p>
          )}
          {!summary.isOverBudget && pct >= 80 && (
            <p className={cn('text-xs mt-2', health?.color)}>
              Only {formatFromINR(summary.remaining)} remaining — keep an eye on spending.
            </p>
          )}
          {!summary.isOverBudget && pct < 80 && summary.actual > 0 && (
            <p className={cn('text-xs mt-2', health?.color)}>
              You have {formatFromINR(summary.remaining)} left to spend across your trip.
            </p>
          )}
          {!summary.isOverBudget && summary.actual === 0 && (
            <p className={cn('text-xs mt-2', health?.color)}>
              Start tracking expenses to see your budget health.
            </p>
          )}
        </div>
      )}

      {/* === CONTEXTUAL INSIGHTS === */}
      {summary.estimated > 0 && (
        <BudgetInsights summary={summary} formatFromINR={formatFromINR} />
      )}
    </div>
  );
}

function BudgetInsights({ summary, formatFromINR }: { summary: BudgetSummary; formatFromINR: (n: number) => string }) {
  const insights: { icon: string; text: string }[] = [];

  // Remaining insight
  if (!summary.isOverBudget && summary.remaining > 0 && summary.actual > 0) {
    insights.push({ icon: '🎯', text: `You have ${formatFromINR(summary.remaining)} left for the rest of your trip.` });
  }

  // Biggest category
  const topActual = [...summary.categoryBreakdown]
    .filter(c => c.actual > 0)
    .sort((a, b) => b.actual - a.actual)[0];
  const LABELS: Record<string, string> = { transport: 'Transport', accommodation: 'Accommodation', activities: 'Activities', food: 'Food', other: 'Other' };
  if (topActual) {
    insights.push({ icon: '📊', text: `${LABELS[topActual.category] || topActual.category} is your largest expense so far.` });
  }

  // Over-category alert
  const overCat = summary.categoryBreakdown.find(c => c.estimated > 0 && c.actual > c.estimated);
  if (overCat) {
    const over = overCat.actual - overCat.estimated;
    insights.push({ icon: '⚠️', text: `You're ${formatFromINR(over)} over your ${LABELS[overCat.category] || overCat.category} estimate.` });
  }

  // Accommodation is largest estimated
  const topEstimated = [...summary.categoryBreakdown]
    .filter(c => c.estimated > 0)
    .sort((a, b) => b.estimated - a.estimated)[0];
  if (topEstimated && topEstimated.actual === 0) {
    insights.push({ icon: '🏠', text: `${LABELS[topEstimated.category] || topEstimated.category} is your largest planned expense.` });
  }

  if (!insights.length) return null;

  return (
    <div className="bg-surface border border-border/40 rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <TrendingDown className="w-3.5 h-3.5" /> Budget Insights
      </p>
      <ul className="space-y-2">
        {insights.slice(0, 3).map((insight, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className="shrink-0">{insight.icon}</span>
            <span className="text-foreground/80">{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
