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
      akun: {
        Row: {
          id: string
          nama: string
          urutan: number
        }
        Insert: {
          id?: string
          nama: string
          urutan: number
        }
        Update: {
          id?: string
          nama?: string
          urutan?: number
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          akun: string | null
          created_at: string | null
          created_by: string | null
          harga_satuan_menjadi: number
          harga_satuan_semula: number
          id: string
          is_approved: boolean
          jumlah_menjadi: number | null
          jumlah_semula: number | null
          kegiatan: string | null
          komponen_output: string
          program_pembebanan: string | null
          rincian_output: string | null
          satuan_menjadi: string
          satuan_semula: string
          selisih: number | null
          status: string
          sub_komponen: string | null
          updated_at: string | null
          updated_by: string | null
          uraian: string
          volume_menjadi: number
          volume_semula: number
        }
        Insert: {
          akun?: string | null
          created_at?: string | null
          created_by?: string | null
          harga_satuan_menjadi: number
          harga_satuan_semula: number
          id?: string
          is_approved?: boolean
          jumlah_menjadi?: number | null
          jumlah_semula?: number | null
          kegiatan?: string | null
          komponen_output: string
          program_pembebanan?: string | null
          rincian_output?: string | null
          satuan_menjadi: string
          satuan_semula: string
          selisih?: number | null
          status: string
          sub_komponen?: string | null
          updated_at?: string | null
          updated_by?: string | null
          uraian: string
          volume_menjadi: number
          volume_semula: number
        }
        Update: {
          akun?: string | null
          created_at?: string | null
          created_by?: string | null
          harga_satuan_menjadi?: number
          harga_satuan_semula?: number
          id?: string
          is_approved?: boolean
          jumlah_menjadi?: number | null
          jumlah_semula?: number | null
          kegiatan?: string | null
          komponen_output?: string
          program_pembebanan?: string | null
          rincian_output?: string | null
          satuan_menjadi?: string
          satuan_semula?: string
          selisih?: number | null
          status?: string
          sub_komponen?: string | null
          updated_at?: string | null
          updated_by?: string | null
          uraian?: string
          volume_menjadi?: number
          volume_semula?: number
        }
        Relationships: []
      }
      komponen_output: {
        Row: {
          created_at: string | null
          id: string
          nama: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nama: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nama?: string
        }
        Relationships: []
      }
      sub_komponen: {
        Row: {
          id: string
          nama: string
          program_pembebanan: string
        }
        Insert: {
          id?: string
          nama: string
          program_pembebanan: string
        }
        Update: {
          id?: string
          nama?: string
          program_pembebanan?: string
        }
        Relationships: []
      }
    }
    Views: {
      budget_summary_by_account_group: {
        Row: {
          account_group: string | null
          changed_items: number | null
          new_items: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }
        Relationships: []
      }
      budget_summary_by_akun: {
        Row: {
          akun: string | null
          changed_items: number | null
          new_items: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }
        Relationships: []
      }
      budget_summary_by_komponen: {
        Row: {
          changed_items: number | null
          komponen_output: string | null
          new_items: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_budget_summary_by_account_group: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_group: string | null
          changed_items: number | null
          new_items: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }[]
      }
      get_budget_summary_by_akun: {
        Args: Record<PropertyKey, never>
        Returns: {
          akun: string | null
          changed_items: number | null
          new_items: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }[]
      }
      get_budget_summary_by_komponen: {
        Args: Record<PropertyKey, never>
        Returns: {
          changed_items: number | null
          komponen_output: string | null
          new_items: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "admin" | "user" | "viewer"
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
      user_role: ["admin", "user", "viewer"],
    },
  },
} as const
