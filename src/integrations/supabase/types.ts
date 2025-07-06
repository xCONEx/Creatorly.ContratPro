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
      admin_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agencies: {
        Row: {
          cnpj: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          status: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          status?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          status?: string | null
        }
        Relationships: []
      }
      agency_collaborators: {
        Row: {
          added_at: string | null
          agency_id: string | null
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          agency_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          agency_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_collaborators_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_invitations: {
        Row: {
          agency_id: string
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string
          message: string | null
          responded_at: string | null
          role: string
          status: string
        }
        Insert: {
          agency_id: string
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by: string
          message?: string | null
          responded_at?: string | null
          role?: string
          status?: string
        }
        Update: {
          agency_id?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string
          message?: string | null
          responded_at?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          agency_id: string | null
          cnpj: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          cnpj?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          cnpj?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          client_id: string
          contract_file_name: string | null
          contract_file_url: string | null
          content: string | null
          created_at: string
          description: string | null
          due_date: string | null
          end_date: string | null
          expires_at: string | null
          id: string
          sent_at: string | null
          signature_token: string | null
          signed_at: string | null
          start_date: string | null
          status: string | null
          template_used: string | null
          title: string
          total_value: number | null
          updated_at: string
          user_address: string | null
          user_cnpj: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
          user_phone: string | null
          value: number | null
        }
        Insert: {
          client_id: string
          contract_file_name?: string | null
          contract_file_url?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          expires_at?: string | null
          id?: string
          sent_at?: string | null
          signature_token?: string | null
          signed_at?: string | null
          start_date?: string | null
          status?: string | null
          template_used?: string | null
          title: string
          total_value?: number | null
          updated_at?: string
          user_address?: string | null
          user_cnpj?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
          user_phone?: string | null
          value?: number | null
        }
        Update: {
          client_id?: string
          contract_file_name?: string | null
          contract_file_url?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          expires_at?: string | null
          id?: string
          sent_at?: string | null
          signature_token?: string | null
          signed_at?: string | null
          start_date?: string | null
          status?: string | null
          template_used?: string | null
          title?: string
          total_value?: number | null
          updated_at?: string
          user_address?: string | null
          user_cnpj?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          user_phone?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts_counter: {
        Row: {
          count: number
          id: string
          month: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          count?: number
          id?: string
          month: number
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          count?: number
          id?: string
          month?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          agency_id: string | null
          banned: boolean | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          image_user: string | null
          logo_base64: string | null
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["agency_role"] | null
          subscription: Database["public"]["Enums"]["subscription_type"] | null
          subscription_data: Json | null
          subscription_given_by_agency: boolean | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          banned?: boolean | null
          company?: string | null
          created_at?: string | null
          email: string
          id: string
          image_user?: string | null
          logo_base64?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["agency_role"] | null
          subscription?: Database["public"]["Enums"]["subscription_type"] | null
          subscription_data?: Json | null
          subscription_given_by_agency?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          banned?: boolean | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          image_user?: string | null
          logo_base64?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["agency_role"] | null
          subscription?: Database["public"]["Enums"]["subscription_type"] | null
          subscription_data?: Json | null
          subscription_given_by_agency?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          api_access: boolean | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          max_contracts_per_month: number | null
          name: string
          price: number | null
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string | null
        }
        Insert: {
          api_access?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_contracts_per_month?: number | null
          name: string
          price?: number | null
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string | null
        }
        Update: {
          api_access?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_contracts_per_month?: number | null
          name?: string
          price?: number | null
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          contract_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_sync_enabled: boolean | null
          contract_reminders: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_sync_enabled?: boolean | null
          contract_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_sync_enabled?: boolean | null
          contract_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan_id: string
          start_date: string | null
          status: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string | null
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string | null
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage_tracking: {
        Row: {
          count: number
          created_at: string | null
          id: string
          reset_date: string
          updated_at: string | null
          usage_type: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string | null
          id?: string
          reset_date: string
          updated_at?: string | null
          usage_type: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string | null
          id?: string
          reset_date?: string
          updated_at?: string | null
          usage_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_profiles: {
        Row: {
          address: string | null
          agency_id: string | null
          banned: boolean | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string | null
          image_user: string | null
          logo_base64: string | null
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["agency_role"] | null
          subscription: Database["public"]["Enums"]["subscription_type"] | null
          subscription_data: Json | null
          subscription_given_by_agency: boolean | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          banned?: boolean | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          image_user?: string | null
          logo_base64?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["agency_role"] | null
          subscription?: Database["public"]["Enums"]["subscription_type"] | null
          subscription_data?: Json | null
          subscription_given_by_agency?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          banned?: boolean | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          image_user?: string | null
          logo_base64?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["agency_role"] | null
          subscription?: Database["public"]["Enums"]["subscription_type"] | null
          subscription_data?: Json | null
          subscription_given_by_agency?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agency_role: "admin" | "editor" | "viewer" | "member"
      contract_status: "draft" | "active" | "completed" | "cancelled"
      priority_level: "low" | "medium" | "high"
      subscription_type: "free" | "basic" | "professional" | "enterprise"
      task_status: "todo" | "in_progress" | "review" | "completed"
      user_type: "individual" | "company" | "agency"
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
    Enums: {
      agency_role: ["admin", "editor", "viewer", "member"],
      contract_status: ["draft", "active", "completed", "cancelled"],
      priority_level: ["low", "medium", "high"],
      subscription_type: ["free", "basic", "professional", "enterprise"],
      task_status: ["todo", "in_progress", "review", "completed"],
      user_type: ["individual", "company", "agency"],
    },
  },
} as const
