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
      profiles: {
        Row: {
          id: string
          email: string | null
          username: string | null
          preferred_transport_mode: 'bike' | 'car' | 'walk'
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          username?: string | null
          preferred_transport_mode?: 'bike' | 'car' | 'walk'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          preferred_transport_mode?: 'bike' | 'car' | 'walk'
          created_at?: string
        }
      }
      favorite_spots: {
        Row: {
          id: number
          user_id: string
          sport_facility_id: string
          sport_facility_name: string
          sport_facility_lat: number
          sport_facility_lng: number
          preferred_parking_id: string | null
          preferred_parking_name: string | null
          preferred_parking_type: 'car' | 'bike' | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          sport_facility_id: string
          sport_facility_name: string
          sport_facility_lat: number
          sport_facility_lng: number
          preferred_parking_id?: string | null
          preferred_parking_name?: string | null
          preferred_parking_type?: 'car' | 'bike' | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          sport_facility_id?: string
          sport_facility_name?: string
          sport_facility_lat?: number
          sport_facility_lng?: number
          preferred_parking_id?: string | null
          preferred_parking_name?: string | null
          preferred_parking_type?: 'car' | 'bike' | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
