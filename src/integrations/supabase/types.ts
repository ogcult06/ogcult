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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          line_total: number
          order_id: string
          product_handle: string
          product_id: string | null
          product_title: string
          quantity: number
          size: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          line_total: number
          order_id: string
          product_handle?: string
          product_id?: string | null
          product_title: string
          quantity: number
          size: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          line_total?: number
          order_id?: string
          product_handle?: string
          product_id?: string | null
          product_title?: string
          quantity?: number
          size?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string
          admin_notes: string
          city: string
          cod_charge: number
          confirmation_email_sent_at: string | null
          confirmed_at: string | null
          country: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_notes: string
          customer_phone: string
          discount: number
          fulfillment_status: string
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_signature: string | null
          id: string
          items_total: number
          landmark: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          pincode: string
          public_token: string
          shipping_charge: number
          state: string
          supplier_reference: string | null
          total: number
          tracking_courier: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string
          admin_notes?: string
          city: string
          cod_charge?: number
          confirmation_email_sent_at?: string | null
          confirmed_at?: string | null
          country?: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_notes?: string
          customer_phone: string
          discount?: number
          fulfillment_status?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_signature?: string | null
          id?: string
          items_total?: number
          landmark?: string
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode: string
          public_token?: string
          shipping_charge?: number
          state: string
          supplier_reference?: string | null
          total?: number
          tracking_courier?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string
          admin_notes?: string
          city?: string
          cod_charge?: number
          confirmation_email_sent_at?: string | null
          confirmed_at?: string | null
          country?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_notes?: string
          customer_phone?: string
          discount?: number
          fulfillment_status?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_signature?: string | null
          id?: string
          items_total?: number
          landmark?: string
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode?: string
          public_token?: string
          shipping_charge?: number
          state?: string
          supplier_reference?: string | null
          total?: number
          tracking_courier?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway_order_id: string | null
          gateway_payment_id: string | null
          id: string
          order_id: string | null
          provider: string
          raw_event: Json | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          order_id?: string | null
          provider?: string
          raw_event?: Json | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          order_id?: string | null
          provider?: string
          raw_event?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          available: boolean
          created_at: string
          currency: string
          id: string
          position: number
          price: number
          product_id: string
          size: string
          stock: number | null
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          currency?: string
          id?: string
          position?: number
          price: number
          product_id: string
          size: string
          stock?: number | null
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          currency?: string
          id?: string
          position?: number
          price?: number
          product_id?: string
          size?: string
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          compare_at_price: number | null
          created_at: string
          description: string
          handle: string
          id: string
          images: Json
          product_type: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          compare_at_price?: number | null
          created_at?: string
          description?: string
          handle: string
          id?: string
          images?: Json
          product_type?: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          compare_at_price?: number | null
          created_at?: string
          description?: string
          handle?: string
          id?: string
          images?: Json
          product_type?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          cod_charge: number
          cod_enabled: boolean
          currency: string
          free_shipping_threshold: number
          id: boolean
          next_order_number: number
          order_prefix: string
          prepaid_enabled: boolean
          processing_note: string
          shipping_charge: number
          store_email: string
          support_email: string
          support_phone: string
          updated_at: string
        }
        Insert: {
          cod_charge?: number
          cod_enabled?: boolean
          currency?: string
          free_shipping_threshold?: number
          id?: boolean
          next_order_number?: number
          order_prefix?: string
          prepaid_enabled?: boolean
          processing_note?: string
          shipping_charge?: number
          store_email?: string
          support_email?: string
          support_phone?: string
          updated_at?: string
        }
        Update: {
          cod_charge?: number
          cod_enabled?: boolean
          currency?: string
          free_shipping_threshold?: number
          id?: boolean
          next_order_number?: number
          order_prefix?: string
          prepaid_enabled?: boolean
          processing_note?: string
          shipping_charge?: number
          store_email?: string
          support_email?: string
          support_phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_order_number: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      order_status:
        | "pending_payment"
        | "confirmed"
        | "processing"
        | "ordered_from_supplier"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "returned"
        | "refunded"
      payment_method: "prepaid" | "cod"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "cod_due"
        | "cod_collected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user"],
      order_status: [
        "pending_payment",
        "confirmed",
        "processing",
        "ordered_from_supplier",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      payment_method: ["prepaid", "cod"],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "cod_due",
        "cod_collected",
      ],
    },
  },
} as const
