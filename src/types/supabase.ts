export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_catalog: {
        Row: {
          id: string
          destination_id: string | null
          name: string
          category: string | null
          image: string | null
          duration: string | null
          price: number | null
          rating: number | null
          description: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          destination_id?: string | null
          name: string
          category?: string | null
          image?: string | null
          duration?: string | null
          price?: number | null
          rating?: number | null
          description?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          destination_id?: string | null
          name?: string
          category?: string | null
          image?: string | null
          duration?: string | null
          price?: number | null
          rating?: number | null
          description?: string | null
          location?: string | null
          created_at?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          id: string
          budget_id: string
          category: Database['public']['Enums']['expense_category']
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          category: Database['public']['Enums']['expense_category']
          amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          category?: Database['public']['Enums']['expense_category']
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'budget_categories_budget_id_fkey'
            columns: ['budget_id']
            referencedRelation: 'budgets'
            referencedColumns: ['id']
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          trip_id: string
          total_estimated: number
          total_actual: number | null
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          total_estimated: number
          total_actual?: number | null
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          total_estimated?: number
          total_actual?: number | null
          currency?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'budgets_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      city_stops: {
        Row: {
          id: string
          trip_id: string
          destination_id: string | null
          name: string
          nights: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id?: string | null
          name: string
          nights?: number
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          destination_id?: string | null
          name?: string
          nights?: number
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'city_stops_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          title: string
          amount: number
          currency: string
          category: Database['public']['Enums']['expense_category']
          date: string
          paid_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          title: string
          amount: number
          currency?: string
          category: Database['public']['Enums']['expense_category']
          date: string
          paid_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          title?: string
          amount?: number
          currency?: string
          category?: Database['public']['Enums']['expense_category']
          date?: string
          paid_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expenses_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      itinerary_days: {
        Row: {
          id: string
          trip_id: string
          city_id: string
          date: string
          day_number: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          city_id: string
          date: string
          day_number: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          city_id?: string
          date?: string
          day_number?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'itinerary_days_city_id_fkey'
            columns: ['city_id']
            referencedRelation: 'city_stops'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'itinerary_days_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: Database['public']['Enums']['notification_type']
          title: string
          message: string
          read: boolean
          link: string | null
          trip_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: Database['public']['Enums']['notification_type']
          title: string
          message: string
          read?: boolean
          link?: string | null
          trip_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: Database['public']['Enums']['notification_type']
          title?: string
          message?: string
          read?: boolean
          link?: string | null
          trip_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_shares: {
        Row: {
          id: string
          trip_id: string
          share_id: string
          owner_id: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          share_id: string
          owner_id: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          share_id?: string
          owner_id?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'public_shares_owner_id_fkey'
            columns: ['owner_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_shares_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      travel_segments: {
        Row: {
          id: string
          trip_id: string
          from_city_id: string
          to_city_id: string
          mode: Database['public']['Enums']['travel_mode']
          estimated_time: string | null
          estimated_cost: number | null
          departure_time: string | null
          arrival_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          from_city_id: string
          to_city_id: string
          mode: Database['public']['Enums']['travel_mode']
          estimated_time?: string | null
          estimated_cost?: number | null
          departure_time?: string | null
          arrival_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          from_city_id?: string
          to_city_id?: string
          mode?: Database['public']['Enums']['travel_mode']
          estimated_time?: string | null
          estimated_cost?: number | null
          departure_time?: string | null
          arrival_time?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'travel_segments_from_city_id_fkey'
            columns: ['from_city_id']
            referencedRelation: 'city_stops'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'travel_segments_to_city_id_fkey'
            columns: ['to_city_id']
            referencedRelation: 'city_stops'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'travel_segments_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      trip_activities: {
        Row: {
          id: string
          trip_id: string
          day_id: string
          catalog_activity_id: string | null
          title: string
          description: string | null
          time: string | null
          location: string | null
          estimated_cost: number | null
          type: Database['public']['Enums']['activity_type'] | null
          order_index: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day_id: string
          catalog_activity_id?: string | null
          title: string
          description?: string | null
          time?: string | null
          location?: string | null
          estimated_cost?: number | null
          type?: Database['public']['Enums']['activity_type'] | null
          order_index?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day_id?: string
          catalog_activity_id?: string | null
          title?: string
          description?: string | null
          time?: string | null
          location?: string | null
          estimated_cost?: number | null
          type?: Database['public']['Enums']['activity_type'] | null
          order_index?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trip_activities_catalog_activity_id_fkey'
            columns: ['catalog_activity_id']
            referencedRelation: 'activity_catalog'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trip_activities_day_id_fkey'
            columns: ['day_id']
            referencedRelation: 'itinerary_days'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trip_activities_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          }
        ]
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: Database['public']['Enums']['trip_role']
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          role?: Database['public']['Enums']['trip_role']
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          role?: Database['public']['Enums']['trip_role']
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trip_members_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trip_members_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          type: string
          travelers: number
          cover_image: string | null
          status: Database['public']['Enums']['trip_status']
          notes: string | null
          is_public: boolean
          share_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          type: string
          travelers?: number
          cover_image?: string | null
          status?: Database['public']['Enums']['trip_status']
          notes?: string | null
          is_public?: boolean
          share_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          start_date?: string
          end_date?: string
          type?: string
          travelers?: number
          cover_image?: string | null
          status?: Database['public']['Enums']['trip_status']
          notes?: string | null
          is_public?: boolean
          share_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trips_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          currency: string
          language: string
          units: string
          trip_reminders: boolean
          activity_alerts: boolean
          budget_alerts: boolean
          product_updates: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency?: string
          language?: string
          units?: string
          trip_reminders?: boolean
          activity_alerts?: boolean
          budget_alerts?: boolean
          product_updates?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          language?: string
          units?: string
          trip_reminders?: boolean
          activity_alerts?: boolean
          budget_alerts?: boolean
          product_updates?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          item_type: Database['public']['Enums']['wishlist_item_type']
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: Database['public']['Enums']['wishlist_item_type']
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: Database['public']['Enums']['wishlist_item_type']
          item_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wishlists_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_trip: {
        Args: {
          check_trip_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | 'sightseeing'
        | 'food'
        | 'relaxation'
        | 'adventure'
        | 'culture'
        | 'nature'
        | 'spiritual'
        | 'custom'
      expense_category:
        | 'transport'
        | 'accommodation'
        | 'activities'
        | 'food'
        | 'other'
      notification_type:
        | 'trip_reminder'
        | 'budget_alert'
        | 'itinerary_update'
        | 'recommendation'
        | 'share_activity'
      travel_mode: 'flight' | 'train' | 'bus' | 'cab' | 'self-drive'
      trip_role: 'owner' | 'member' | 'viewer'
      trip_status: 'upcoming' | 'ongoing' | 'completed' | 'draft'
      wishlist_item_type: 'destination' | 'activity'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
