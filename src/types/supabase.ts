
import { Database } from '@/integrations/supabase/types';

export type BudgetItemRecord = Database['public']['Tables']['budget_items']['Row'];
export type KomponenOutputRecord = Database['public']['Tables']['komponen_output']['Row'];
export type SubKomponenRecord = Database['public']['Tables']['sub_komponen']['Row'];
export type AkunRecord = Database['public']['Tables']['akun']['Row'];

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
    };
    Views: {
      budget_summary_by_account_group: {
        Row: {
          account_group: string | null;
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
    };
    Functions: {
      get_budget_summary_by_account_group: {
        Args: Record<string, never>;
        Returns: {
          account_group: string | null;
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
    };
  };
};
