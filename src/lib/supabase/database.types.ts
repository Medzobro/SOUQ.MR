/**
 * Supabase database types — hand-written to match supabase/migrations/0001_initial_schema.sql
 *
 * To regenerate from a live Supabase instance:
 *   supabase gen types typescript --local > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'buyer' | 'seller' | 'admin';
export type Locale = 'ar' | 'fr' | 'en';
export type ProductCondition = 'new' | 'like_new' | 'used' | 'refurbished';
export type ProductStatus = 'active' | 'sold' | 'hidden' | 'pending';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          city: string | null;
          preferred_locale: Locale;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          city?: string | null;
          preferred_locale?: Locale;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          city?: string | null;
          preferred_locale?: Locale;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_fr: string | null;
          name_en: string | null;
          icon: string | null;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_fr?: string | null;
          name_en?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: {
          slug?: string;
          name_ar?: string;
          name_fr?: string | null;
          name_en?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          city: string | null;
          address: string | null;
          phone: string | null;
          whatsapp: string | null;
          is_verified: boolean;
          rating: number;
          reviews_count: number;
          followers_count: number;
          products_count: number;
          opening_hours: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          city?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          is_verified?: boolean;
          opening_hours?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          city?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          is_verified?: boolean;
          opening_hours?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string | null;
          seller_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          price: number;
          currency: string;
          condition: ProductCondition;
          city: string | null;
          address: string | null;
          status: ProductStatus;
          badge: string | null;
          is_negotiable: boolean;
          views_count: number;
          favorites_count: number;
          search_vector: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id?: string | null;
          seller_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          price: number;
          currency?: string;
          condition?: ProductCondition;
          city?: string | null;
          address?: string | null;
          status?: ProductStatus;
          badge?: string | null;
          is_negotiable?: boolean;
        };
        Update: {
          store_id?: string | null;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          condition?: ProductCondition;
          city?: string | null;
          address?: string | null;
          status?: ProductStatus;
          badge?: string | null;
          is_negotiable?: boolean;
          views_count?: number;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: { id?: string; product_id: string; url: string; sort_order?: number };
        Update: { url?: string; sort_order?: number };
        Relationships: [];
      };
      favorites: {
        Row: { user_id: string; product_id: string; created_at: string };
        Insert: { user_id: string; product_id: string };
        Update: { user_id?: string; product_id?: string };
        Relationships: [];
      };
      followers: {
        Row: { follower_id: string; store_id: string; created_at: string };
        Insert: { follower_id: string; store_id: string };
        Update: { follower_id?: string; store_id?: string };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string | null;
          last_message_at: string;
          last_message_preview: string | null;
          buyer_unread_count: number;
          seller_unread_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id?: string | null;
        };
        Update: {
          buyer_unread_count?: number;
          seller_unread_count?: number;
          last_message_at?: string;
          last_message_preview?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          attachment_url: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          attachment_url?: string | null;
        };
        Update: { read_at?: string | null };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          store_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          reviewer_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: { rating?: number; comment?: string | null };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          link?: string | null;
        };
        Update: { read_at?: string | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Convenience aliases ------------------------------------------------
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Store = Database['public']['Tables']['stores']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductImage = Database['public']['Tables']['product_images']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
