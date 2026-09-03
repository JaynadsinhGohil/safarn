import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/useCurrency';
import type { Expense } from '@/types';
import { format, parseISO } from 'date-fns';

const CATEGORY_ICONS: Record<string, string> = {
  transport: '✈️',
  accommodation: '🏨',
  activities: '🎯',
  food: '🍽️',
  other: '📦',
};
const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activities: 'Activities',
  food: 'Food',
  other: 'Other',
};
const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-blue-50 dark:bg-blue-950/40',
  accommodation: 'bg-purple-50 dark:bg-purple-950/40',
  activities: 'bg-green-50 dark:bg-green-950/40',
  food: 'bg-orange-50 dark:bg-orange-950/40',
  other: 'bg-surface-container-low',
};

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function ExpenseList({ expenses, onEdit, onDelete, onAdd }: ExpenseListProps) {
  const { formatFromINR } = useCurrency();

  if (expenses.length === 0) {
    return (
      <div className="bg-surface border border-border/40 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💳</span>
        </div>
        <h4 className="font-heading font-semibold text-base mb-1.5">No expenses yet</h4>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
          Start tracking your trip spending to see how your actual costs compare with your plan.
        </p>
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add your first expense
        </Button>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    const date = e.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-1">
      {sortedDates.map(date => {
        const dayTotal = grouped[date].reduce((s, e) => s + e.amount, 0);
        return (
          <div key={date} className="mb-4">
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {format(parseISO(date), 'EEE, dd MMM yyyy')}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">{formatFromINR(dayTotal)}</p>
            </div>

            <div className="space-y-1.5">
              {grouped[date].map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-border/40 hover:border-border/70 transition-all group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${CATEGORY_COLORS[expense.category]}`}>
                    {CATEGORY_ICONS[expense.category]}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{expense.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{CATEGORY_LABELS[expense.category]}</span>
                      {expense.notes && <><span>·</span><span className="truncate">{expense.notes}</span></>}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className="font-bold text-sm shrink-0">{formatFromINR(expense.amount)}</p>

                  {/* Actions — visible on hover */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(expense)}
                      title="Edit expense"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(expense.id)}
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Total row */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40 px-1">
        <p className="text-sm text-muted-foreground">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
        <p className="font-heading font-bold text-base">{formatFromINR(total)}</p>
      </div>
    </div>
  );
}
