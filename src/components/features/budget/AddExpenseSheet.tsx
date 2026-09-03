import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Expense, ExpenseCategory } from '@/types';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be positive'),
  category: z.enum(['transport', 'accommodation', 'activities', 'food', 'other']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'transport', label: 'Transport', icon: '✈️' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { value: 'activities', label: 'Activities', icon: '🎯' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

interface AddExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  editExpense?: Expense | null;
  tripId: string;
  paidBy: string;
}

export function AddExpenseSheet({ open, onClose, onSave, editExpense, tripId, paidBy }: AddExpenseSheetProps) {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'other', date: new Date().toISOString().slice(0, 10) },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (editExpense) {
      reset({
        title: editExpense.title,
        amount: editExpense.amount,
        category: editExpense.category,
        date: editExpense.date,
        notes: editExpense.notes ?? '',
      });
    } else {
      reset({ category: 'other', date: new Date().toISOString().slice(0, 10), title: '', notes: '' });
    }
  }, [editExpense, reset, open]);

  const onSubmit = (data: FormValues) => {
    onSave({
      tripId,
      title: data.title,
      amount: data.amount,
      currency: 'INR',
      category: data.category,
      date: data.date,
      paidBy,
      notes: data.notes,
      ...(editExpense ? { id: editExpense.id } : {}),
    } as Omit<Expense, 'id'>);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} aria-hidden />
      <div className="fixed bottom-0 left-0 right-0 md:inset-y-0 md:right-0 md:left-auto md:w-96 bg-background z-50 flex flex-col shadow-2xl rounded-t-2xl md:rounded-none">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="font-heading font-semibold text-lg">{editExpense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue('category', c.value)}
                  className={`p-2 rounded-xl border text-center transition-all ${selectedCategory === c.value ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
                >
                  <span className="text-xl block">{c.icon}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5 truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <input {...register('title')} className="w-full h-10 px-3 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Hotel Check-in" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
            <input {...register('amount', { valueAsNumber: true })} type="number" step="1" className="w-full h-10 px-3 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <input {...register('date')} type="date" className="w-full h-10 px-3 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
            <input {...register('notes')} className="w-full h-10 px-3 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. For 2 people" />
          </div>

          <Button type="submit" className="w-full">{editExpense ? 'Update Expense' : 'Add Expense'}</Button>
        </form>
      </div>
    </>
  );
}
