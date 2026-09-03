import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileRepository {
  /**
   * Fetches the current user's profile.
   */
  static async getCurrentProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
    return data;
  }

  /**
   * Updates a user profile.
   */
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileRow> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
