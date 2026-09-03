import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTrip } from '@/context/TripContext';
import { weatherService } from '@/services/weatherService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, getDay, isSameMonth, isToday, addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, List, MapPin, Pencil, Cloud, Sun, CloudRain } from 'lucide-react';
import type { Trip, ItineraryDay, WeatherDay } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'timeline';

function WeatherIcon({ condition }: { condition: WeatherDay['condition'] }) {
  if (condition === 'sunny') return <Sun className="w-3.5 h-3.5 text-amber-500" />;
  if (condition === 'rainy' || condition === 'stormy') return <CloudRain className="w-3.5 h-3.5 text-blue-500" />;
  return <Cloud className="w-3.5 h-3.5 text-muted-foreground" />;
}

export function CalendarView() {
  const { trips } = useTrip();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [selectedTripId, setSelectedTripId] = useState<string>('all');
  const [weather, setWeather] = useState<WeatherDay[]>([]);

  // Get all days from all (or selected) trips
  const filteredTrips = selectedTripId === 'all' ? trips : trips.filter(t => t.id === selectedTripId);

  const allDays: (ItineraryDay & { trip: Trip })[] = filteredTrips.flatMap(trip =>
    (trip.days ?? []).map(day => ({ ...day, trip }))
  );

  // Get weather for the first destination of the selected/first trip
  useEffect(() => {
    const targetTrip = filteredTrips[0];
    if (targetTrip?.cities?.[0]?.destinationId) {
      weatherService.getForDestination(targetTrip.cities[0].destinationId).then(setWeather);
    }
  }, [selectedTripId, trips]);

  // Month grid days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sunday

  const getDayEvents = (date: Date) => allDays.filter(d => isSameDay(parseISO(d.date), date));
  const getWeatherForDate = (date: Date) => weather.find(w => isSameDay(parseISO(w.date), date));

  return (
    <PageContainer maxWidth="wide" className="py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><CalendarDays className="w-4 h-4" /><span>Timeline</span></div>
          <h1 className="font-heading text-3xl font-bold">Calendar</h1>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Trip filter */}
          <select value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)} className="px-3 py-2 rounded-xl border border-border/50 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">All Trips</option>
            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border/50">
            <button onClick={() => setView('month')} className={cn('px-3 py-2 text-sm flex items-center gap-1.5 transition-colors', view === 'month' ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:bg-surface-container')}>
              <CalendarDays className="w-4 h-4" /> Month
            </button>
            <button onClick={() => setView('timeline')} className={cn('px-3 py-2 text-sm flex items-center gap-1.5 transition-colors', view === 'timeline' ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:bg-surface-container')}>
              <List className="w-4 h-4" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="text-center py-20">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-4">Create a trip to see your itinerary on the calendar.</p>
          <Button asChild><Link to="/trips/new">Plan a Trip</Link></Button>
        </div>
      )}

      {trips.length > 0 && view === 'month' && (
        <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between p-5 border-b border-border/40">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 hover:bg-surface-container rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-heading font-semibold text-xl">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 hover:bg-surface-container rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border/40">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-3 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {/* Padding cells */}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="border-r border-b border-border/20 min-h-[90px] p-2 bg-surface-container/30" />
            ))}
            {daysInMonth.map((day, idx) => {
              const events = getDayEvents(day);
              const w = getWeatherForDate(day);
              const isCurrentDay = isToday(day);
              return (
                <div
                  key={idx}
                  className={cn('border-r border-b border-border/20 min-h-[90px] p-2 transition-colors', isCurrentDay && 'bg-primary/5', !isSameMonth(day, currentMonth) && 'opacity-40')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full', isCurrentDay ? 'bg-primary text-primary-foreground' : 'text-foreground')}>{format(day, 'd')}</span>
                    {w && <WeatherIcon condition={w.condition} />}
                  </div>
                  {/* Weather temp */}
                  {w && <p className="text-[10px] text-muted-foreground mb-1">{w.high}°/{w.low}°</p>}
                  {/* Events */}
                  {events.slice(0, 2).map(ev => (
                    <Link
                      key={ev.id}
                      to={`/trips/${ev.tripId}/edit`}
                      className="block mb-0.5 px-1.5 py-0.5 bg-primary/15 text-primary text-[10px] rounded-md truncate hover:bg-primary/25 transition-colors"
                    >
                      {ev.trip.name}
                    </Link>
                  ))}
                  {events.length > 2 && <p className="text-[10px] text-muted-foreground">+{events.length - 2} more</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {trips.length > 0 && view === 'timeline' && (
        <div className="space-y-4">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="bg-surface rounded-2xl border border-border/40 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <div>
                  <h3 className="font-heading font-semibold">{trip.name}</h3>
                  <p className="text-sm text-muted-foreground">{trip.startDate} → {trip.endDate} · {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/trips/${trip.id}/edit`}><Pencil className="w-3 h-3 mr-1.5" />Edit</Link>
                </Button>
              </div>
              <div className="divide-y divide-border/30">
                {(trip.days ?? []).map(day => {
                  const w = weather.find(ww => isSameDay(parseISO(ww.date), parseISO(day.date)));
                  const cityStop = trip.cities.find(c => c.id === day.cityId);
                  return (
                    <div key={day.id} className="p-4 flex gap-4">
                      <div className="shrink-0 text-center w-14">
                        <p className="text-xs font-medium text-muted-foreground">Day {day.dayNumber}</p>
                        <p className="text-sm font-semibold">{format(parseISO(day.date), 'dd MMM')}</p>
                        {w && (
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            <WeatherIcon condition={w.condition} />
                            <span className="text-[10px] text-muted-foreground">{w.high}°</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {cityStop && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />{cityStop.name}
                          </div>
                        )}
                        {day.activities.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No activities planned</p>
                        ) : (
                          <div className="space-y-1">
                            {day.activities.map(act => (
                              <div key={act.id} className="flex items-center gap-2 text-sm">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                <span className="truncate">{act.title}</span>
                                {act.time && <span className="text-xs text-muted-foreground shrink-0">{act.time}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
