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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_group_lookup: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      account_lookup: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          akun: string | null
          created_at: string | null
          harga_satuan_menjadi: number
          harga_satuan_semula: number
          id: string
          is_approved: boolean | null
          jumlah_menjadi: number
          jumlah_semula: number
          kegiatan: string | null
          komponen_output: string | null
          program_pembebanan: string | null
          rincian_output: string | null
          satuan_menjadi: string | null
          satuan_semula: string | null
          selisih: number | null
          sisa_anggaran: number | null
          status: string
          sub_komponen: string | null
          updated_at: string | null
          uraian: string
          volume_menjadi: number
          volume_semula: number
        }
        Insert: {
          akun?: string | null
          created_at?: string | null
          harga_satuan_menjadi?: number
          harga_satuan_semula?: number
          id?: string
          is_approved?: boolean | null
          jumlah_menjadi?: number
          jumlah_semula?: number
          kegiatan?: string | null
          komponen_output?: string | null
          program_pembebanan?: string | null
          rincian_output?: string | null
          satuan_menjadi?: string | null
          satuan_semula?: string | null
          selisih?: number | null
          sisa_anggaran?: number | null
          status?: string
          sub_komponen?: string | null
          updated_at?: string | null
          uraian: string
          volume_menjadi?: number
          volume_semula?: number
        }
        Update: {
          akun?: string | null
          created_at?: string | null
          harga_satuan_menjadi?: number
          harga_satuan_semula?: number
          id?: string
          is_approved?: boolean | null
          jumlah_menjadi?: number
          jumlah_semula?: number
          kegiatan?: string | null
          komponen_output?: string | null
          program_pembebanan?: string | null
          rincian_output?: string | null
          satuan_menjadi?: string | null
          satuan_semula?: string | null
          selisih?: number | null
          sisa_anggaran?: number | null
          status?: string
          sub_komponen?: string | null
          updated_at?: string | null
          uraian?: string
          volume_menjadi?: number
          volume_semula?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rencana_penarikan_dana: {
        Row: {
          agustus: number
          april: number
          budget_item_id: string | null
          created_at: string | null
          desember: number
          februari: number
          id: string
          januari: number
          juli: number
          juni: number
          maret: number
          mei: number
          november: number
          oktober: number
          september: number
          updated_at: string | null
        }
        Insert: {
          agustus?: number
          april?: number
          budget_item_id?: string | null
          created_at?: string | null
          desember?: number
          februari?: number
          id?: string
          januari?: number
          juli?: number
          juni?: number
          maret?: number
          mei?: number
          november?: number
          oktober?: number
          september?: number
          updated_at?: string | null
        }
        Update: {
          agustus?: number
          april?: number
          budget_item_id?: string | null
          created_at?: string | null
          desember?: number
          februari?: number
          id?: string
          januari?: number
          juli?: number
          juni?: number
          maret?: number
          mei?: number
          november?: number
          oktober?: number
          september?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rencana_penarikan_dana_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      budget_summary_by_account_group: {
        Row: {
          account_group: string | null
          account_group_name: string | null
          changed_items: number | null
          new_items: number | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_akun: {
        Row: {
          akun: string | null
          akun_name: string | null
          changed_items: number | null
          new_items: number | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_akun_group: {
        Row: {
          akun_group: string | null
          akun_group_name: string | null
          changed_items: number | null
          new_items: number | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_kegiatan: {
        Row: {
          changed_items: number | null
          kegiatan: string | null
          new_items: number | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_komponen: {
        Row: {
          changed_items: number | null
          komponen_output: string | null
          new_items: number | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_program_pembebanan: {
        Row: {
          changed_items: number | null
          new_items: number | null
          program_pembebanan: string | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_rincian_output: {
        Row: {
          changed_items: number | null
          new_items: number | null
          rincian_output: string | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
      budget_summary_by_sub_komponen: {
        Row: {
          changed_items: number | null
          new_items: number | null
          sub_komponen: string | null
          total_blokir: number | null
          total_items: number | null
          total_menjadi: number | null
          total_selisih: number | null
          total_semula: number | null
          total_sisa_anggaran: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_rpd_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          agustus: number
          april: number
          desember: number
          februari: number
          harga_satuan_menjadi: number
          id: string
          januari: number
          juli: number
          jumlah_menjadi: number
          jumlah_rpd: number
          juni: number
          maret: number
          mei: number
          november: number
          oktober: number
          satuan_menjadi: string
          september: number
          status: string
          uraian: string
          volume_menjadi: number
        }[]
      }
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
