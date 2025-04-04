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
          id: string
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
          uraian: string
          volume_menjadi: number
          volume_semula: number
        }
        Insert: {
          akun?: string | null
          created_at?: string | null
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
          status?: string
          sub_komponen?: string | null
          updated_at?: string | null
          uraian: string
          volume_menjadi: number
          volume_semula: number
        }
        Update: {
          akun?: string | null
          created_at?: string | null
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
          id: string
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
          id: string
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
