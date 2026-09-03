import type { WeatherDay } from '@/types';
import { format, addDays } from 'date-fns';

const today = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

const CONDITIONS: WeatherDay['condition'][] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'sunny', 'sunny', 'partly-cloudy', 'sunny', 'cloudy', 'rainy'];

function generateForecast(highs: number[], lows: number[], descriptions: string[]): WeatherDay[] {
  return Array.from({ length: 10 }, (_, i) => ({
    date: fmt(addDays(today, i)),
    high: highs[i],
    low: lows[i],
    condition: CONDITIONS[i],
    humidity: 55 + Math.floor(Math.random() * 30),
    description: descriptions[i],
  }));
}

export const WEATHER_FORECASTS: Record<string, WeatherDay[]> = {
  'dest-goa': generateForecast(
    [32, 31, 33, 30, 32, 33, 31, 30, 32, 31],
    [26, 25, 26, 24, 25, 26, 25, 24, 25, 26],
    ['Hot and humid', 'Partly cloudy skies', 'Clear and sunny', 'Chance of rain', 'Hot and sunny', 'Sunny spells', 'Mostly cloudy', 'Pleasant & breezy', 'Hazy sunshine', 'Evening showers']
  ),
  'dest-jaipur': generateForecast(
    [36, 37, 35, 38, 36, 35, 37, 36, 38, 37],
    [24, 25, 23, 26, 24, 23, 25, 24, 25, 24],
    ['Hot and dry', 'Scorching afternoon', 'Dry and sunny', 'Very hot day', 'Clear blue skies', 'Dry conditions', 'Sunny and warm', 'Hot winds', 'Dusty afternoon', 'Warm and clear']
  ),
  'dest-kerala': generateForecast(
    [30, 29, 31, 28, 29, 30, 28, 27, 29, 30],
    [23, 22, 24, 21, 22, 23, 21, 20, 22, 23],
    ['Humid with showers', 'Light rainfall', 'Warm and pleasant', 'Monsoon showers', 'Partly cloudy', 'Intermittent rain', 'Heavy showers', 'Misty morning', 'Sunny spells', 'Light rain']
  ),
  'dest-manali': generateForecast(
    [18, 17, 20, 16, 19, 18, 15, 17, 20, 19],
    [8, 7, 10, 6, 9, 8, 5, 7, 10, 9],
    ['Cool mountain air', 'Partly cloudy', 'Sunny and pleasant', 'Chance of rain', 'Clear and bright', 'Cool breeze', 'Overcast', 'Pleasant trekking', 'Sunny day', 'Light clouds']
  ),
  'dest-udaipur': generateForecast(
    [34, 35, 33, 36, 34, 33, 35, 34, 36, 35],
    [22, 23, 21, 24, 22, 21, 23, 22, 24, 23],
    ['Warm and sunny', 'Hot afternoon', 'Clear skies', 'Very warm', 'Sunny and dry', 'Hot day', 'Clear and hot', 'Lake breeze', 'Warm evening', 'Dry and clear']
  ),
  'dest-rishikesh': generateForecast(
    [28, 29, 27, 30, 28, 27, 29, 28, 30, 29],
    [18, 19, 17, 20, 18, 17, 19, 18, 20, 19],
    ['Warm and clear', 'Partly cloudy', 'Sunny spells', 'Mild showers', 'Clear morning', 'Warm afternoon', 'Mostly sunny', 'Pleasant', 'Clear skies', 'Light breeze']
  ),
};

// Fallback for unknown destinations
export const DEFAULT_WEATHER: WeatherDay[] = generateForecast(
  [30, 29, 31, 28, 30, 31, 29, 28, 30, 31],
  [20, 19, 21, 18, 20, 21, 19, 18, 20, 21],
  ['Partly cloudy', 'Warm day', 'Sunny', 'Clear skies', 'Warm and breezy', 'Sunny spells', 'Mostly clear', 'Pleasant', 'Warm afternoon', 'Clear evening']
);
