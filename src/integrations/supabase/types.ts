export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          company: string | null
          logo_base64: string | null
          image_user: string | null
          user_type: Database['public']['Enums']['user_type']
          banned: boolean
          agency_id: string | null
          role: Database['public']['Enums']['agency_role']
          created_at: string | null
          updated_at: string | null
          subscription: Database['public']['Enums']['subscription_type']
          subscription_data: Json | null
          subscription_given_by_agency: boolean
          address: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          phone?: string | null
          company?: string | null
          logo_base64?: string | null
          image_user?: string | null
          user_type?: Database['public']['Enums']['user_type']
          banned?: boolean
          agency_id?: string | null
          role?: Database['public']['Enums']['agency_role']
          created_at?: string | null
          updated_at?: string | null
          subscription?: Database['public']['Enums']['subscription_type']
          subscription_data?: Json | null
          subscription_given_by_agency?: boolean
          address?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          company?: string | null
          logo_base64?: string | null
          image_user?: string | null
          user_type?: Database['public']['Enums']['user_type']
          banned?: boolean
          agency_id?: string | null
          role?: Database['public']['Enums']['agency_role']
          created_at?: string | null
          updated_at?: string | null
          subscription?: Database['public']['Enums']['subscription_type']
          subscription_data?: Json | null
          subscription_given_by_agency?: boolean
          address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number
          price_yearly: number
          max_contracts_per_month: number
          features: Json
          api_access: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          max_contracts_per_month?: number
          features?: Json
          api_access?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          max_contracts_per_month?: number
          features?: Json
          api_access?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          plan_id: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          plan_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          plan_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          started_at: string | null
          expires_at: string | null
          trial_ends_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          started_at?: string | null
          expires_at?: string | null
          trial_ends_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          started_at?: string | null
          expires_at?: string | null
          trial_ends_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          email_notifications: boolean
          contract_reminders: boolean
          theme: string
          language: string
          timezone: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          contract_reminders?: boolean
          theme?: string
          language?: string
          timezone?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          contract_reminders?: boolean
          theme?: string
          language?: string
          timezone?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          user_id: string
          company_id: string | null
          name: string
          phone: string | null
          email: string | null
          address: string | null
          cnpj: string | null
          description: string | null
          created_at: string | null
          updated_at: string | null
          user_email: string | null
          origin: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          cnpj?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_email?: string | null
          origin?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          cnpj?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_email?: string | null
          origin?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contract_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          content: string
          category: string | null
          variables: Json
          is_default: boolean
          is_public: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          content: string
          category?: string | null
          variables?: Json
          is_default?: boolean
          is_public?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          content?: string
          category?: string | null
          variables?: Json
          is_default?: boolean
          is_public?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          id: string
          client_id: string
          user_id: string
          title: string
          description: string | null
          content: string | null
          value: number
          start_date: string | null
          end_date: string | null
          status: string
          contract_file_url: string | null
          contract_file_name: string | null
          signature_token: string | null
          signed_at: string | null
          sent_at: string | null
          expires_at: string | null
          due_date: string | null
          total_value: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          title: string
          description?: string | null
          content?: string | null
          value?: number
          start_date?: string | null
          end_date?: string | null
          status?: string
          contract_file_url?: string | null
          contract_file_name?: string | null
          signature_token?: string | null
          signed_at?: string | null
          sent_at?: string | null
          expires_at?: string | null
          due_date?: string | null
          total_value?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          title?: string
          description?: string | null
          content?: string | null
          value?: number
          start_date?: string | null
          end_date?: string | null
          status?: string
          contract_file_url?: string | null
          contract_file_name?: string | null
          signature_token?: string | null
          signed_at?: string | null
          sent_at?: string | null
          expires_at?: string | null
          due_date?: string | null
          total_value?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      contract_events: {
        Row: {
          id: string
          contract_id: string | null
          event_type: string
          event_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          contract_id?: string | null
          event_type: string
          event_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string | null
          event_type?: string
          event_data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          data: Json
          generated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          data?: Json
          generated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          data?: Json
          generated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      client_origin: 'manual' | 'financeflow' | 'import'
      contract_status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
      user_type: 'individual' | 'company' | 'agency'
      agency_role: 'owner' | 'admin' | 'editor' | 'viewer' | 'member'
      subscription_type: 'free' | 'basic' | 'premium' | 'enterprise' | 'pro' | 'business' | 'annual' | 'monthly'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
