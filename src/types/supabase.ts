
import { Database } from '@/integrations/supabase/types';

// Define record types directly instead of trying to access them from the Database type
export type BudgetItemRecord = Database['public']['Tables']['budget_items']['Row'];

// Define missing record types
export type KomponenOutputRecord = {
  id: string;
  name: string;
  created_at?: string | null;
};

export type SubKomponenRecord = {
  id: string;
  name: string;
  komponen_output_id?: string | null;
};

export type AkunRecord = {
  id: string;
  code: string;
  name: string;
};

export type BudgetSummaryRecord = {
  account_group?: string;
  akun?: string;
  komponen_output?: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
};

// Define user role type to ensure consistency
export type UserRole = 'admin' | 'user';

// Define profile record type that matches the profiles table
export type ProfileRecord = Database['public']['Tables']['profiles']['Row'];

// This is a simplified version of the Database type that includes our tables
export type TemporaryDatabase = {
  public: {
    Tables: {
      budget_items: {
        Row: BudgetItemRecord;
        Insert: Omit<BudgetItemRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Omit<BudgetItemRecord, 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      komponen_output: {
        Row: KomponenOutputRecord;
        Insert: Omit<KomponenOutputRecord, 'created_at'> & {
          created_at?: string | null;
        };
        Update: Partial<Omit<KomponenOutputRecord, 'created_at'>> & {
          created_at?: string | null;
        };
      };
      sub_komponen: {
        Row: SubKomponenRecord;
        Insert: SubKomponenRecord;
        Update: Partial<SubKomponenRecord>;
      };
      akun: {
        Row: AkunRecord;
        Insert: AkunRecord;
        Update: Partial<AkunRecord>;
      };
      profiles: {
        Row: ProfileRecord;
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        }>;
      };
      rencana_penarikan_dana: {
        Row: {
          id: string;
          budget_item_id: string;
          januari: number;
          februari: number;
          maret: number;
          april: number;
          mei: number;
          juni: number;
          juli: number;
          agustus: number;
          september: number;
          oktober: number;
          november: number;
          desember: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          budget_item_id: string;
          januari?: number;
          februari?: number;
          maret?: number;
          april?: number;
          mei?: number;
          juni?: number;
          juli?: number;
          agustus?: number;
          september?: number;
          oktober?: number;
          november?: number;
          desember?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          januari?: number;
          februari?: number;
          maret?: number;
          april?: number;
          mei?: number;
          juni?: number;
          juli?: number;
          agustus?: number;
          september?: number;
          oktober?: number;
          november?: number;
          desember?: number;
          updated_at?: string;
        }>;
      };
    };
    Views: {
      budget_summary_by_account_group: {
        Row: {
          account_group: string | null;
          account_group_name: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_komponen: {
        Row: {
          komponen_output: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_akun: {
        Row: {
          akun: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_program_pembebanan: {
        Row: {
          program_pembebanan: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_kegiatan: {
        Row: {
          kegiatan: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_rincian_output: {
        Row: {
          rincian_output: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_sub_komponen: {
        Row: {
          sub_komponen: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
      budget_summary_by_akun_group: {
        Row: {
          akun_group: string | null;
          akun_group_name: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        };
      };
    };
    Functions: {
      get_budget_summary_by_account_group: {
        Args: Record<string, never>;
        Returns: {
          account_group: string | null;
          account_group_name: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_budget_summary_by_komponen: {
        Args: Record<string, never>;
        Returns: {
          komponen_output: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_budget_summary_by_akun: {
        Args: Record<string, never>;
        Returns: {
          akun: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_budget_summary_by_program_pembebanan: {
        Args: Record<string, never>;
        Returns: {
          program_pembebanan: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_budget_summary_by_kegiatan: {
        Args: Record<string, never>;
        Returns: {
          kegiatan: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_budget_summary_by_rincian_output: {
        Args: Record<string, never>;
        Returns: {
          rincian_output: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_budget_summary_by_sub_komponen: {
        Args: Record<string, never>;
        Returns: {
          sub_komponen: string | null;
          total_semula: number | null;
          total_menjadi: number | null;
          total_selisih: number | null;
          new_items: number | null;
          changed_items: number | null;
          total_items: number | null;
        }[];
      };
      get_rpd_data: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          uraian: string;
          volume_menjadi: number;
          satuan_menjadi: string;
          harga_satuan_menjadi: number;
          jumlah_menjadi: number;
          januari: number;
          februari: number;
          maret: number;
          april: number;
          mei: number;
          juni: number;
          juli: number;
          agustus: number;
          september: number;
          oktober: number;
          november: number;
          desember: number;
          jumlah_rpd: number;
          status: string;
        }[];
      };
    };
  };
};
