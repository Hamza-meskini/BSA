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
      analytics_cache: {
        Row: {
          id: string
          brand: string
          period: string
          result: Json
          created_at: string
        }
        Insert: {
          id?: string
          brand: string
          period: string
          result: Json
          created_at?: string
        }
        Update: {
          id?: string
          brand?: string
          period?: string
          result?: Json
          created_at?: string
        }
      }
    }
  }
} 