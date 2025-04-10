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
          created_at: string | null
          id: string
          kode: string
          nama: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kode: string
          nama: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kode?: string
          nama?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          akun: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          harga_satuan_menjadi: number | null
          harga_satuan_semula: number | null
          id: string
          jumlah_menjadi: number | null
          jumlah_semula: number | null
          kegiatan: string | null
          komponen_output: string | null
          program_pembebanan: string | null
          rincian_output: string | null
          satuan_menjadi: string | null
          satuan_semula: string | null
          selisih: number | null
          status: string | null
          sub_komponen: string | null
          updated_at: string | null
          uraian: string
          volume_menjadi: number | null
          volume_semula: number | null
        }
        Insert: {
          akun?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          harga_satuan_menjadi?: number | null
          harga_satuan_semula?: number | null
          id?: string
          jumlah_menjadi?: number | null
          jumlah_semula?: number | null
          kegiatan?: string | null
          komponen_output?: string | null
          program_pembebanan?: string | null
          rincian_output?: string | null
          satuan_menjadi?: string | null
          satuan_semula?: string | null
          selisih?: number | null
          status?: string | null
          sub_komponen?: string | null
          updated_at?: string | null
          uraian: string
          volume_menjadi?: number | null
          volume_semula?: number | null
        }
        Update: {
          akun?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          harga_satuan_menjadi?: number | null
          harga_satuan_semula?: number | null
          id?: string
          jumlah_menjadi?: number | null
          jumlah_semula?: number | null
          kegiatan?: string | null
          komponen_output?: string | null
          program_pembebanan?: string | null
          rincian_output?: string | null
          satuan_menjadi?: string | null
          satuan_semula?: string | null
          selisih?: number | null
          status?: string | null
          sub_komponen?: string | null
          updated_at?: string | null
          uraian?: string
          volume_menjadi?: number | null
          volume_semula?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      komponen_output: {
        Row: {
          created_at: string | null
          id: string
          kode: string
          nama: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kode: string
          nama: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kode?: string
          nama?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      sub_komponen: {
        Row: {
          created_at: string | null
          id: string
          kode: string
          komponen_output_id: string | null
          nama: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kode: string
          komponen_output_id?: string | null
          nama: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kode?: string
          komponen_output_id?: string | null
          nama?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_komponen_komponen_output_id_fkey"
            columns: ["komponen_output_id"]
            isOneToOne: false
            referencedRelation: "komponen_output"
            referencedColumns: ["id"]
          },
        ]
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
      budget_summary_by_kegiatan: {
        Row: {
          changed_items: number | null
          kegiatan: string | null
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
      budget_summary_by_program_pembebanan: {
        Row: {
          changed_items: number | null
          new_items: number | null
          program_pembebanan: string | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }
        Relationships: []
      }
      budget_summary_by_rincian_output: {
        Row: {
          changed_items: number | null
          new_items: number | null
          rincian_output: string | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }
        Relationships: []
      }
      budget_summary_by_sub_komponen: {
        Row: {
          changed_items: number | null
          new_items: number | null
          sub_komponen: string | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
