import { parseISO, differenceInDays, eachDayOfInterval, format, isValid } from 'date-fns';
import type { ItineraryDay } from '@/types';

/**
 * Calculates the number of nights between two dates.
 */
export function calculateNights(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isValid(start) || !isValid(end)) return 0;
  
  const diff = differenceInDays(end, start);
  return diff > 0 ? diff : 0;
}

/**
 * Calculates the total number of days (nights + 1)
 */
export function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  return calculateNights(startDate, endDate) + 1;
}

import type { CityStop, Activity, Trip } from '@/types';

export interface OrphanedActivity {
  activity: Activity;
  originalDayId: string;
  originalCityId: string;
}

export interface DateAnalysisResult {
  requiresReconciliation: boolean;
  orphanedActivities: OrphanedActivity[];
}

/**
 * Analyzes proposed date/city changes to identify any activities that would be lost.
 */
export function analyzeDateChanges(
  trip: Trip,
  proposedStartDate: string,
  proposedEndDate: string,
  proposedCities: CityStop[]
): DateAnalysisResult {
  const orphanedActivities: OrphanedActivity[] = [];
  
  if (!isValid(parseISO(proposedStartDate)) || !isValid(parseISO(proposedEndDate))) {
    return { requiresReconciliation: false, orphanedActivities };
  }

  const daysInInterval = eachDayOfInterval({ start: parseISO(proposedStartDate), end: parseISO(proposedEndDate) });
  
  // Group existing days by city
  const oldDaysByCity: Record<string, ItineraryDay[]> = {};
  trip.days.forEach(day => {
    if (!oldDaysByCity[day.cityId]) oldDaysByCity[day.cityId] = [];
    oldDaysByCity[day.cityId].push(day);
  });

  let dateIndex = 0;
  
  for (let i = 0; i < proposedCities.length; i++) {
    const city = proposedCities[i];
    const isLastCity = i === proposedCities.length - 1;
    let daysToAllocate = city.nights;
    if (isLastCity) {
      daysToAllocate = Math.max(daysInInterval.length - dateIndex, 1);
    }
    
    const oldCityDays = oldDaysByCity[city.id] || [];
    
    // Any day beyond daysToAllocate for this city is orphaned
    if (oldCityDays.length > daysToAllocate) {
      for (let orphanIdx = daysToAllocate; orphanIdx < oldCityDays.length; orphanIdx++) {
        oldCityDays[orphanIdx].activities.forEach(activity => {
          orphanedActivities.push({
            activity,
            originalDayId: oldCityDays[orphanIdx].id,
            originalCityId: city.id
          });
        });
      }
    }
    
    dateIndex += daysToAllocate;
  }
  
  // Also check for cities that were completely removed (though UI prevents city removal if it has activities, but let's be safe)
  const proposedCityIds = new Set(proposedCities.map(c => c.id));
  trip.cities.forEach(oldCity => {
    if (!proposedCityIds.has(oldCity.id)) {
      const days = oldDaysByCity[oldCity.id] || [];
      days.forEach(day => {
        day.activities.forEach(activity => {
          orphanedActivities.push({
            activity,
            originalDayId: day.id,
            originalCityId: oldCity.id
          });
        });
      });
    }
  });

  return {
    requiresReconciliation: orphanedActivities.length > 0,
    orphanedActivities
  };
}

/**
 * Generates an array of day objects between startDate and endDate.
 * Allocates days to cities sequentially based on their `nights` property.
 */
export function generateItineraryDays(
  tripId: string, 
  startDate: string, 
  endDate: string, 
  cities: CityStop[],
  oldDays: ItineraryDay[] = []
): ItineraryDay[] {
  if (!startDate || !endDate) return [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  if (!isValid(start) || !isValid(end)) return [];
  if (end < start) return [];

  const daysInInterval = eachDayOfInterval({ start, end });
  
  const oldDaysByCity: Record<string, ItineraryDay[]> = {};
  oldDays.forEach(day => {
    if (!oldDaysByCity[day.cityId]) {
      oldDaysByCity[day.cityId] = [];
    }
    oldDaysByCity[day.cityId].push(day);
  });

  const newDays: ItineraryDay[] = [];
  let dateIndex = 0;
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const isLastCity = i === cities.length - 1;
    
    let daysToAllocate = city.nights;
    if (isLastCity) {
      daysToAllocate = Math.max(daysInInterval.length - dateIndex, 1);
    }
    
    const oldCityDays = oldDaysByCity[city.id] || [];
    
    for (let dayOffset = 0; dayOffset < daysToAllocate; dayOffset++) {
      if (dateIndex >= daysInInterval.length) break;
      
      const date = daysInInterval[dateIndex];
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      let activities: Activity[] = [];
      let oldDayId = `day-${Date.now()}-${dateIndex}`;
      
      if (dayOffset < oldCityDays.length) {
        activities = [...oldCityDays[dayOffset].activities];
        oldDayId = oldCityDays[dayOffset].id;
      }
      
      // Removed the automatic compression/absorption of orphaned activities!
      // The UI must now handle reassigning them before this function is called, 
      // or the activities will simply be dropped.

      newDays.push({
        id: oldDayId,
        tripId,
        date: formattedDate,
        dayNumber: dateIndex + 1,
        cityId: city.id,
        activities
      });
      
      dateIndex++;
    }
  }

  while (dateIndex < daysInInterval.length) {
    const date = daysInInterval[dateIndex];
    newDays.push({
      id: `day-${Date.now()}-${dateIndex}`,
      tripId,
      date: format(date, 'yyyy-MM-dd'),
      dayNumber: dateIndex + 1,
      cityId: '',
      activities: []
    });
    dateIndex++;
  }

  return newDays;
}
