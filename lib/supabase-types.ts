export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          shift_id: string | null
          status: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          shift_id?: string | null
          status?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          shift_id?: string | null
          status?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_user_id: string | null
          created_at: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          blocked_user_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          blocked_user_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          company_inn: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          id: string
          legal_address: string | null
          shifts_published: number | null
          user_id: string | null
        }
        Insert: {
          company_inn?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          id?: string
          legal_address?: string | null
          shifts_published?: number | null
          user_id?: string | null
        }
        Update: {
          company_inn?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          id?: string
          legal_address?: string | null
          shifts_published?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          favorite_user_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          favorite_user_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          favorite_user_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_favorite_user_id_fkey"
            columns: ["favorite_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          platform_fee: number | null
          shift_id: string | null
          status: string | null
          worker_id: string | null
          yukassa_payment_id: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          shift_id?: string | null
          status?: string | null
          worker_id?: string | null
          yukassa_payment_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          shift_id?: string | null
          status?: string | null
          worker_id?: string | null
          yukassa_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          from_user_id: string | null
          id: string
          rating: number | null
          shift_id: string | null
          to_user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          rating?: number | null
          shift_id?: string | null
          to_user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          rating?: number | null
          shift_id?: string | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_workers: {
        Row: {
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_photo_url: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          id: string
          shift_id: string | null
          status: string | null
          worker_id: string | null
        }
        Insert: {
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_photo_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          shift_id?: string | null
          status?: string | null
          worker_id?: string | null
        }
        Update: {
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_photo_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          shift_id?: string | null
          status?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_workers_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          category: string
          client_id: string | null
          created_at: string | null
          date: string
          description: string | null
          end_time: string
          id: string
          location_address: string
          location_lat: number | null
          location_lng: number | null
          pay_amount: number
          required_rating: number | null
          required_workers: number | null
          start_time: string
          status: string | null
          title: string
          tools_required: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          client_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          end_time: string
          id?: string
          location_address: string
          location_lat?: number | null
          location_lng?: number | null
          pay_amount: number
          required_rating?: number | null
          required_workers?: number | null
          start_time: string
          status?: string | null
          title: string
          tools_required?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          client_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          location_address?: string
          location_lat?: number | null
          location_lng?: number | null
          pay_amount?: number
          required_rating?: number | null
          required_workers?: number | null
          start_time?: string
          status?: string | null
          title?: string
          tools_required?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          applications: boolean | null
          check_in_alerts: boolean | null
          created_at: string | null
          id: string
          messages: boolean | null
          new_shifts: boolean | null
          payments: boolean | null
          ratings: boolean | null
          shift_reminders: boolean | null
          system: boolean | null
          user_id: string | null
        }
        Insert: {
          applications?: boolean | null
          check_in_alerts?: boolean | null
          created_at?: string | null
          id?: string
          messages?: boolean | null
          new_shifts?: boolean | null
          payments?: boolean | null
          ratings?: boolean | null
          shift_reminders?: boolean | null
          system?: boolean | null
          user_id?: string | null
        }
        Update: {
          applications?: boolean | null
          check_in_alerts?: boolean | null
          created_at?: string | null
          id?: string
          messages?: boolean | null
          new_shifts?: boolean | null
          payments?: boolean | null
          ratings?: boolean | null
          shift_reminders?: boolean | null
          system?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          gosuslugi_verified: boolean | null
          id: string
          is_verified: boolean | null
          phone: string
          rating: number | null
          role: string
          successful_shifts: number | null
          telegram_id: number | null
          total_shifts: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          gosuslugi_verified?: boolean | null
          id?: string
          is_verified?: boolean | null
          phone: string
          rating?: number | null
          role: string
          successful_shifts?: number | null
          telegram_id?: number | null
          total_shifts?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          gosuslugi_verified?: boolean | null
          id?: string
          is_verified?: boolean | null
          phone?: string
          rating?: number | null
          role?: string
          successful_shifts?: number | null
          telegram_id?: number | null
          total_shifts?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      worker_profiles: {
        Row: {
          ban_reason: string | null
          ban_until: string | null
          bio: string | null
          categories: string[] | null
          created_at: string | null
          experience_years: number | null
          id: string
          status: string | null
          tools_available: string[] | null
          user_id: string | null
        }
        Insert: {
          ban_reason?: string | null
          ban_until?: string | null
          bio?: string | null
          categories?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          status?: string | null
          tools_available?: string[] | null
          user_id?: string | null
        }
        Update: {
          ban_reason?: string | null
          ban_until?: string | null
          bio?: string | null
          categories?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          status?: string | null
          tools_available?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Type exports for commonly used tables
export type Shift = Tables<'shifts'>
export type User = Tables<'users'>
export type Application = Tables<'applications'>
export type ClientProfile = Tables<'client_profiles'>
export type WorkerProfile = Tables<'worker_profiles'>
export type Payment = Tables<'payments'>
export type Rating = Tables<'ratings'>
export type ShiftWorker = Tables<'shift_workers'>
export type Notification = Tables<'notifications'>
