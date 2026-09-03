import type { WeatherDay } from '@/types';
import { WEATHER_FORECASTS, DEFAULT_WEATHER } from '@/data/mock/weather';

/**
 * Weather service abstraction.
 * Architecture: In production, replace getForDestination() with a real API call
 * (e.g., OpenWeatherMap, Tomorrow.io) using the destination coordinates.
 * The WeatherDay interface maps cleanly to most weather APIs.
 */
export const weatherService = {
  /**
   * Get 10-day mock forecast for a destination.
   * Falls back to a generic forecast if destination not found.
   */
  async getForDestination(destinationId: string): Promise<WeatherDay[]> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 150));
    return WEATHER_FORECASTS[destinationId] ?? DEFAULT_WEATHER;
  },

  /**
   * Get weather for a specific date range (subset of the 10-day forecast).
   */
  async getForDateRange(destinationId: string, startDate: string, endDate: string): Promise<WeatherDay[]> {
    const forecast = await weatherService.getForDestination(destinationId);
    return forecast.filter(day => day.date >= startDate && day.date <= endDate);
  },
};
