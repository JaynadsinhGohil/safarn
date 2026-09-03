import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTrip } from '@/context/TripContext';
import { budgetService } from '@/services/budgetService';
import { BudgetSummaryCards } from '@/components/features/budget/BudgetSummary';
import { BudgetCharts } from '@/components/features/budget/BudgetCharts';
import { ExpenseList } from '@/components/features/budget/ExpenseList';
import { AddExpenseSheet } from '@/components/features/budget/AddExpenseSheet';
import { CurrencyToggle } from '@/components/features/budget/CurrencyToggle';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, ChevronDown, Edit2, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import type { Expense } from '@/types';
import type { BudgetSummary } from '@/services/budgetService';
import { useSettings } from '@/context/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

export function Budget() {
  const { trips, activeTrip, setActiveTrip, addExpense, updateExpense, removeExpense, updateActiveTrip } = useTrip();
  const { profile } = useSettings();
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripDropOpen, setTripDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Edit budget dialog
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ total: 0, travel: 0, accommodation: 0, activities: 0, food: 0, other: 0 });

  // Select first trip by default
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      const firstTrip = trips[0];
      setSelectedTripId(firstTrip.id);
      setActiveTrip(firstTrip.id);
    }
  }, [trips]);

  // Recalculate summary when activeTrip changes
  useEffect(() => {
    if (activeTrip) {
      setSummary(budgetService.getSummary(activeTrip));
    }
  }, [activeTrip]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setTripDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setActiveTrip(tripId);
    setTripDropOpen(false);
  };

  const handleSaveExpense = (expense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      updateExpense({ ...expense, id: editingExpense.id } as Expense);
    } else {
      addExpense(expense);
    }
    setEditingExpense(null);
  };

  const openEditBudget = () => {
    if (!activeTrip) return;
    setBudgetForm({
      total: activeTrip.budget?.totalEstimated || 0,
      travel: activeTrip.budget?.categories?.travel || 0,
      accommodation: activeTrip.budget?.categories?.accommodation || 0,
      activities: activeTrip.budget?.categories?.activities || 0,
      food: activeTrip.budget?.categories?.food || 0,
      other: activeTrip.budget?.categories?.other || 0,
    });
    setEditBudgetOpen(true);
  };

  const handleSaveBudget = () => {
    if (!activeTrip) return;
    updateActiveTrip({
      budget: {
        ...activeTrip.budget,
        totalEstimated: budgetForm.total,
        categories: {
          travel: budgetForm.travel,
          accommodation: budgetForm.accommodation,
          activities: budgetForm.activities,
          food: budgetForm.food,
          other: budgetForm.other,
        }
      }
    });
    setEditBudgetOpen(false);
  };

  const currentTrip = trips.find(t => t.id === selectedTripId) ?? activeTrip;
  const expenses = activeTrip?.expenses ?? [];
  const tripNights = currentTrip ? differenceInDays(parseISO(currentTrip.endDate), parseISO(currentTrip.startDate)) : 0;
  const tripDays = tripNights + 1;
  const hasNoBudget = activeTrip && (!activeTrip.budget?.totalEstimated || activeTrip.budget.totalEstimated === 0);

  // Build city route string
  const cityRoute = currentTrip?.cities.map(c => c.name).join(' → ') || '';

  return (
    <PageContainer maxWidth="wide" className="py-8 pb-24">
      {/* ==================== NO TRIPS STATE ==================== */}
      {trips.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">No trips to budget</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">Create your first trip to start planning and tracking your travel budget.</p>
          <Button variant="outline" onClick={() => window.location.href = '/create'}>
            Plan a New Trip <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {trips.length > 0 && (
        <div className="space-y-8">
          {/* ==================== PAGE HEADER ==================== */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
                <Wallet className="w-4 h-4" />
                <span>Budget Tracker</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight">Trip Budget</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <CurrencyToggle />
              <Button variant="outline" onClick={openEditBudget} disabled={!activeTrip}>
                <Edit2 className="w-4 h-4 mr-2" />
                {hasNoBudget ? 'Set Budget' : 'Edit Estimate'}
              </Button>
              <Button
                onClick={() => { setEditingExpense(null); setSheetOpen(true); }}
                disabled={!activeTrip}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </div>
          </div>

          {/* ==================== TRIP SELECTOR ==================== */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setTripDropOpen(!tripDropOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/50 rounded-xl text-sm font-medium hover:border-primary/40 transition-colors"
            >
              <span>{currentTrip?.name ?? 'Select a trip'}</span>
              <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', tripDropOpen && 'rotate-180')} />
            </button>
            {tripDropOpen && (
              <div className="absolute top-full left-0 mt-1.5 bg-background border border-border/50 rounded-2xl shadow-xl z-20 min-w-64 overflow-hidden">
                {trips.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrip(t.id)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-container transition-colors border-b border-border/30 last:border-0 ${selectedTripId === t.id ? 'text-primary font-semibold bg-primary/5' : ''}`}
                  >
                    <span className="block">{t.name}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {format(parseISO(t.startDate), 'dd MMM')} – {format(parseISO(t.endDate), 'dd MMM yyyy')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== TRIP CONTEXT HERO ==================== */}
          {currentTrip && (
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-surface">
              {/* Subtle background image if available */}
              {currentTrip.coverImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10"
                  style={{ backgroundImage: `url(${currentTrip.coverImage})` }}
                />
              )}
              <div className="relative p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl md:text-2xl mb-2">{currentTrip.name}</h2>
                    {cityRoute && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{cityRoute}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(currentTrip.startDate), 'dd MMM')} – {format(parseISO(currentTrip.endDate), 'dd MMM yyyy')}
                        <span className="text-xs text-muted-foreground/60">({tripDays} day{tripDays !== 1 ? 's' : ''})</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {currentTrip.travelers} Traveler{currentTrip.travelers !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <span className={cn(
                      'text-xs font-semibold px-3 py-1 rounded-full capitalize',
                      currentTrip.status === 'ongoing' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      currentTrip.status === 'completed' ? 'bg-surface-container text-muted-foreground' :
                      'bg-primary/10 text-primary'
                    )}>
                      {currentTrip.status === 'ongoing' ? 'In Progress' : currentTrip.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ZERO BUDGET SETUP STATE ==================== */}
          {hasNoBudget && !sheetOpen && (
            <div className="bg-surface border border-primary/20 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Plan your trip budget</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                Set an estimated budget to start tracking your spending and stay on course.
              </p>
              <Button onClick={openEditBudget}>
                Set Budget <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ==================== BUDGET SUMMARY & CHARTS ==================== */}
          {summary && (
            <>
              <BudgetSummaryCards summary={summary} travelers={currentTrip?.travelers ?? 1} />
              <BudgetCharts summary={summary} />
            </>
          )}

          {/* ==================== EXPENSES ==================== */}
          {activeTrip && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading font-semibold text-xl">Expenses</h2>
                  {expenses.length > 0 && (
                    <p className="text-sm text-muted-foreground">{expenses.length} recorded expense{expenses.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                {expenses.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingExpense(null); setSheetOpen(true); }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                  </Button>
                )}
              </div>
              <ExpenseList
                expenses={expenses}
                onEdit={(exp) => { setEditingExpense(exp); setSheetOpen(true); }}
                onDelete={removeExpense}
                onAdd={() => { setEditingExpense(null); setSheetOpen(true); }}
              />
            </div>
          )}
        </div>
      )}

      {/* ==================== ADD/EDIT EXPENSE SHEET ==================== */}
      <AddExpenseSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingExpense(null); }}
        onSave={handleSaveExpense}
        editExpense={editingExpense}
        tripId={selectedTripId}
        paidBy={profile.name}
      />

      {/* ==================== EDIT BUDGET DIALOG ==================== */}
      <Dialog open={editBudgetOpen} onOpenChange={setEditBudgetOpen}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-background border-border/40">
          <DialogHeader className="px-6 py-5 border-b border-border/40 bg-surface/50">
            <DialogTitle className="font-heading">
              {hasNoBudget ? 'Set Your Budget' : 'Edit Budget Estimates'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {hasNoBudget
                ? 'Set an overall budget and allocate to categories.'
                : 'Update your estimated spend for this trip.'}
            </p>
          </DialogHeader>
          <div className="p-6 space-y-5">
            {/* Total */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Total Estimated Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input
                  type="number"
                  value={budgetForm.total || ''}
                  onChange={e => setBudgetForm({ ...budgetForm, total: Number(e.target.value) })}
                  placeholder="e.g. 40000"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Category estimates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category Estimates</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'travel', label: '✈️ Transport' },
                  { key: 'accommodation', label: '🏨 Accommodation' },
                  { key: 'activities', label: '🎯 Activities' },
                  { key: 'food', label: '🍽️ Food' },
                  { key: 'other', label: '📦 Other' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      value={(budgetForm as Record<string, number>)[key] || ''}
                      onChange={e => setBudgetForm({ ...budgetForm, [key]: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              {/* Auto-sum hint */}
              {(budgetForm.travel + budgetForm.accommodation + budgetForm.activities + budgetForm.food + budgetForm.other) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Category total: ₹{(budgetForm.travel + budgetForm.accommodation + budgetForm.activities + budgetForm.food + budgetForm.other).toLocaleString()}
                  {budgetForm.total > 0 && (budgetForm.travel + budgetForm.accommodation + budgetForm.activities + budgetForm.food + budgetForm.other) > budgetForm.total && (
                    <span className="text-amber-600 dark:text-amber-400 ml-1">· exceeds total budget</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-surface/50">
            <Button variant="outline" onClick={() => setEditBudgetOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBudget}>Save Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
