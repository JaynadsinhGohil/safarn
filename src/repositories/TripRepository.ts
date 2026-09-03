import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type TripRow = Database['public']['Tables']['trips']['Row'];
type TripInsert = Database['public']['Tables']['trips']['Insert'];

export class TripRepository {
  /**
   * Fetches all trips for the authenticated user.
   */
  static async getTrips(): Promise<TripRow[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Creates a new trip.
   */
  static async createTrip(trip: TripInsert): Promise<TripRow> {
    const { data, error } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
