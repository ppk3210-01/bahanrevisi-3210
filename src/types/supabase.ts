
// Temporary type definitions that match our database schema
// This will be replaced by the Supabase generated types once they are available

export type BudgetItemRecord = {
  id: string;
  uraian: string;
  volume_semula: number;
  satuan_semula: string;
  harga_satuan_semula: number;
  jumlah_semula: number | null;
  volume_menjadi: number;
  satuan_menjadi: string;
  harga_satuan_menjadi: number;
  jumlah_menjadi: number | null;
  selisih: number | null;
  status: string;
  is_approved: boolean;
  komponen_output: string;
  program_pembebanan: string | null;
  kegiatan: string | null;
  rincian_output: string | null;
  sub_komponen: string | null;
  akun: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type KomponenOutputRecord = {
  id: string;
  nama: string;
  created_at?: string | null;
};

export type SubKomponenRecord = {
  id: string;
  nama: string;
  program_pembebanan: string;
};

export type AkunRecord = {
  id: string;
  nama: string;
  urutan: number;
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
export type ProfileRecord = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

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
        Row: BudgetSummaryRecord;
      };
      budget_summary_by_komponen: {
        Row: BudgetSummaryRecord;
      };
      budget_summary_by_akun: {
        Row: BudgetSummaryRecord;
      };
    };
    Functions: {
      get_budget_summary_by_account_group: {
        Args: Record<string, never>;
        Returns: BudgetSummaryRecord[];
      };
      get_budget_summary_by_komponen: {
        Args: Record<string, never>;
        Returns: BudgetSummaryRecord[];
      };
      get_budget_summary_by_akun: {
        Args: Record<string, never>;
        Returns: BudgetSummaryRecord[];
      };
    };
  };
};
