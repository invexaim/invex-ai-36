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
      bill_items: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          price?: number
          product_id: string
          product_name: string
          quantity?: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          bill_number: string
          created_at: string
          customer_email: string
          id: string
          total: number
          updated_at: string
        }
        Insert: {
          bill_number: string
          created_at?: string
          customer_email: string
          id?: string
          total?: number
          updated_at?: string
        }
        Update: {
          bill_number?: string
          created_at?: string
          customer_email?: string
          id?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          purchase_count: number
          total_purchases: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          purchase_count?: number
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          purchase_count?: number
          total_purchases?: number
          updated_at?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          account_holder_name: string
          account_number: string
          address: string
          bank_name: string
          company_name: string
          created_at: string
          email: string
          gstin: string
          id: string
          ifsc_code: string
          logo_url: string | null
          phone: string
          signature_url: string | null
          state: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_holder_name?: string
          account_number?: string
          address?: string
          bank_name?: string
          company_name?: string
          created_at?: string
          email?: string
          gstin?: string
          id?: string
          ifsc_code?: string
          logo_url?: string | null
          phone?: string
          signature_url?: string | null
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          address?: string
          bank_name?: string
          company_name?: string
          created_at?: string
          email?: string
          gstin?: string
          id?: string
          ifsc_code?: string
          logo_url?: string | null
          phone?: string
          signature_url?: string | null
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          product_id: string
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price?: number
          product_id: string
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          product_id?: string
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_data: {
        Row: {
          clients: Json | null
          created_at: string | null
          id: string
          payments: Json | null
          products: Json | null
          sales: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clients?: Json | null
          created_at?: string | null
          id?: string
          payments?: Json | null
          products?: Json | null
          sales?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clients?: Json | null
          created_at?: string | null
          id?: string
          payments?: Json | null
          products?: Json | null
          sales?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
