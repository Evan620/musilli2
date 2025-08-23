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
          email: string
          name: string
          phone: string | null
          role: 'admin' | 'provider' | 'user'
          status: 'email_unconfirmed' | 'pending' | 'approved' | 'rejected' | 'suspended'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          role?: 'admin' | 'provider' | 'user'
          status?: 'email_unconfirmed' | 'pending' | 'approved' | 'rejected' | 'suspended'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'admin' | 'provider' | 'user'
          status?: 'email_unconfirmed' | 'pending' | 'approved' | 'rejected' | 'suspended'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_email: string
          business_phone: string
          city: string
          subscription_status: 'active' | 'inactive' | 'expired' | 'cancelled'
          subscription_plan: 'basic' | 'premium' | 'enterprise' | null
          total_listings: number
          total_views: number
          total_inquiries: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_email: string
          business_phone: string
          city: string
          subscription_status?: 'active' | 'inactive' | 'expired' | 'cancelled'
          subscription_plan?: 'basic' | 'premium' | 'enterprise' | null
          total_listings?: number
          total_views?: number
          total_inquiries?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_email?: string
          business_phone?: string
          city?: string
          subscription_status?: 'active' | 'inactive' | 'expired' | 'cancelled'
          subscription_plan?: 'basic' | 'premium' | 'enterprise' | null
          total_listings?: number
          total_views?: number
          total_inquiries?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          type: 'house' | 'apartment' | 'land' | 'commercial' | 'airbnb'
          category: 'sale' | 'rent' | 'short-term-rental'
          status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'sold' | 'rented'
          price: number
          currency: string
          provider_id: string
          views: number
          inquiries: number
          is_featured: boolean
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'house' | 'apartment' | 'land' | 'commercial' | 'airbnb'
          category: 'sale' | 'rent' | 'short-term-rental'
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'sold' | 'rented'
          price: number
          currency?: string
          provider_id: string
          views?: number
          inquiries?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'house' | 'apartment' | 'land' | 'commercial' | 'airbnb'
          category?: 'sale' | 'rent' | 'short-term-rental'
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'sold' | 'rented'
          price?: number
          currency?: string
          provider_id?: string
          views?: number
          inquiries?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      property_locations: {
        Row: {
          id: string
          property_id: string
          address: string
          city: string
          state: string
          country: string
          zip_code: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          address: string
          city: string
          state: string
          country?: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          address?: string
          city?: string
          state?: string
          country?: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      property_features: {
        Row: {
          id: string
          property_id: string
          bedrooms: number | null
          bathrooms: number | null
          area: number
          area_unit: 'sqft' | 'sqm' | 'acres' | 'hectares'
          parking: number | null
          furnished: boolean
          pet_friendly: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          bedrooms?: number | null
          bathrooms?: number | null
          area: number
          area_unit: 'sqft' | 'sqm' | 'acres' | 'hectares'
          parking?: number | null
          furnished?: boolean
          pet_friendly?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number
          area_unit?: 'sqft' | 'sqm' | 'acres' | 'hectares'
          parking?: number | null
          furnished?: boolean
          pet_friendly?: boolean
          created_at?: string
        }
      }
      property_amenities: {
        Row: {
          id: string
          property_id: string
          amenity: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          amenity: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          amenity?: string
          created_at?: string
        }
      }
      property_utilities: {
        Row: {
          id: string
          property_id: string
          utility: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          utility: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          utility?: string
          created_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          alt_text: string | null
          is_primary: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          alt_text?: string | null
          is_primary?: boolean
          display_order: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          alt_text?: string | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          property_id: string
          inquirer_name: string
          inquirer_email: string
          inquirer_phone: string | null
          message: string
          status: 'new' | 'responded' | 'closed'
          response: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          inquirer_name: string
          inquirer_email: string
          inquirer_phone?: string | null
          message: string
          status?: 'new' | 'responded' | 'closed'
          response?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          inquirer_name?: string
          inquirer_email?: string
          inquirer_phone?: string | null
          message?: string
          status?: 'new' | 'responded' | 'closed'
          response?: string | null
          responded_at?: string | null
          created_at?: string
        }
      }
      property_views: {
        Row: {
          id: string
          property_id: string
          viewer_ip: string | null
          viewer_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          property_id: string
          viewer_ip?: string | null
          viewer_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          viewer_ip?: string | null
          viewer_id?: string | null
          viewed_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
