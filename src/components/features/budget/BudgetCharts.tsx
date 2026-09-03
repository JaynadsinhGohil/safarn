import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import type { BudgetSummary } from '@/services/budgetService';

const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activities: 'Activities',
  food: 'Food',
  other: 'Other',
};

const CATEGORY_ICONS: Record<string, string> = {
  transport: '✈️',
  accommodation: '🏨',
  activities: '🎯',
  food: '🍽️',
  other: '📦',
};

// Warm brand palette: primary teal, secondary warm, muted accent
const BAR_COLORS = {
  estimated: 'hsl(var(--primary) / 0.25)',
  actual: 'hsl(var(--primary))',
};
const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(185 80% 45%)',
  'hsl(17 45% 60%)',
  'hsl(185 20% 65%)',
];

interface BudgetChartsProps {
  summary: BudgetSummary;
}

// Custom tooltip for bar chart
function CustomBarTooltip({ active, payload, label, formatFromINR }: {
  active?: boolean; payload?: { name: string; value: number }[]; label?: string; formatFromINR: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border/50 rounded-xl shadow-lg p-3 min-w-[140px]">
      <p className="font-semibold text-sm mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-semibold">{formatFromINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Custom tooltip for pie
function CustomPieTooltip({ active, payload, formatFromINR }: {
  active?: boolean; payload?: { name: string; value: number }[]; formatFromINR: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-background border border-border/50 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold">{p.name}</p>
      <p className="text-muted-foreground">{formatFromINR(p.value)}</p>
    </div>
  );
}

export function BudgetCharts({ summary }: BudgetChartsProps) {
  const { formatFromINR } = useCurrency();

  const barData = summary.categoryBreakdown
    .filter(c => c.estimated > 0 || c.actual > 0)
    .map(c => ({
      name: CATEGORY_ICONS[c.category] + ' ' + CATEGORY_LABELS[c.category],
      Estimated: c.estimated,
      Actual: c.actual,
      over: c.actual > c.estimated && c.estimated > 0,
    }));

  const pieData = summary.categoryBreakdown
    .filter(c => c.actual > 0)
    .map(c => ({ name: CATEGORY_LABELS[c.category], value: c.actual, icon: CATEGORY_ICONS[c.category] }));

  const hasData = summary.actual > 0 || summary.estimated > 0;

  if (!hasData) {
    return (
      <div className="bg-surface border border-border/40 rounded-2xl p-10 text-center">
        <p className="text-3xl mb-3">📊</p>
        <p className="font-semibold text-sm mb-1">No data to chart yet</p>
        <p className="text-sm text-muted-foreground">Set your budget estimate and add expenses to see visualizations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* === CATEGORY COMPARISON BAR CHART === */}
      {barData.length > 0 && (
        <div className="bg-surface border border-border/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-semibold">Estimated vs Actual</h3>
              <p className="text-xs text-muted-foreground mt-0.5">By spending category</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm opacity-40 bg-primary inline-block" /> Estimated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Actual
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={4} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<CustomBarTooltip formatFromINR={formatFromINR} />} cursor={{ fill: 'hsl(var(--muted) / 0.5)', radius: 6 }} />
              <Bar dataKey="Estimated" fill={BAR_COLORS.estimated} radius={[4, 4, 0, 0]} name="Estimated" />
              <Bar dataKey="Actual" radius={[4, 4, 0, 0]} name="Actual">
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.over ? 'hsl(var(--destructive))' : BAR_COLORS.actual} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* === CATEGORY BREAKDOWN ROW (always show if bar data exists) === */}
      {barData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {summary.categoryBreakdown
            .filter(c => c.estimated > 0 || c.actual > 0)
            .map(c => {
              const pct = c.estimated > 0 ? Math.min((c.actual / c.estimated) * 100, 100) : 0;
              const over = c.estimated > 0 && c.actual > c.estimated;
              return (
                <div key={c.category} className="bg-surface border border-border/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base">{CATEGORY_ICONS[c.category]}</span>
                    {over && <span className="text-xs text-destructive font-medium">Over</span>}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{CATEGORY_LABELS[c.category]}</p>
                  <p className="font-semibold text-sm">{formatFromINR(c.actual)}</p>
                  {c.estimated > 0 && (
                    <>
                      <div className="h-1 bg-border/30 rounded-full mt-2 overflow-hidden">
                        <div
                          className={over ? 'h-full bg-destructive rounded-full' : 'h-full bg-primary rounded-full transition-all'}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">of {formatFromINR(c.estimated)}</p>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* === PIE CHART (only when actual spending exists) === */}
      {pieData.length > 0 && (
        <div className="bg-surface border border-border/40 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-heading font-semibold">Spending Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Where your money is going</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip formatFromINR={formatFromINR} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend as readable list */}
            <div className="flex-1 w-full space-y-2">
              {pieData.map((d, index) => {
                const pct = summary.actual > 0 ? Math.round((d.value / summary.actual) * 100) : 0;
                return (
                  <div key={d.name} className="flex items-center justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{d.icon} {d.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <span className="font-semibold">{formatFromINR(d.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
