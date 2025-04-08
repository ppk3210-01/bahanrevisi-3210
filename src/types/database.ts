import { Database } from '@/integrations/supabase/tempTypes';

// Define user roles as a strict union type
export type UserRole = 'admin' | 'user';

// Export database types
export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type BudgetItemRecord = Tables['budget_items']['Row'];
export type KomponenOutputRecord = Tables['komponen_output']['Row'];
export type SubKomponenRecord = Tables['sub_komponen']['Row'];
export type AkunRecord = Tables['akun']['Row'];

// Create union types for different summary records
export type BudgetSummaryByAccountGroupRecord = Views['budget_summary_by_account_group']['Row'];
export type BudgetSummaryByKomponenRecord = Views['budget_summary_by_komponen']['Row'];
export type BudgetSummaryByAkunRecord = Views['budget_summary_by_akun']['Row'];

// Base type with common fields
export type BudgetSummaryBase = {
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

// Refined summary types with specific fields
export type BudgetSummaryByAccountGroup = BudgetSummaryBase & {
  account_group: string | null;
  type: 'account_group';
};

export type BudgetSummaryByKomponen = BudgetSummaryBase & {
  komponen_output: string | null;
  type: 'komponen_output';
};

export type BudgetSummaryByAkun = BudgetSummaryBase & {
  akun: string | null;
  type: 'akun';
};

// Summary types by different groupings
export interface BudgetSummaryByAccountGroup {
  account_group: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'account_group';
}

export interface BudgetSummaryByKomponen {
  komponen_output: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'komponen_output';
}

export interface BudgetSummaryByAkun {
  akun: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'akun';
}

export interface BudgetSummaryByProgramPembebanan {
  program_pembebanan: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'program_pembebanan';
}

export interface BudgetSummaryByKegiatan {
  kegiatan: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'kegiatan';
}

export interface BudgetSummaryByRincianOutput {
  rincian_output: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'rincian_output';
}

export interface BudgetSummaryBySubKomponen {
  sub_komponen: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
  type: 'sub_komponen';
}

// Union type for all budget summary types
export type BudgetSummaryRecord = 
  | BudgetSummaryByAccountGroup 
  | BudgetSummaryByKomponen 
  | BudgetSummaryByAkun
  | BudgetSummaryByProgramPembebanan
  | BudgetSummaryByKegiatan
  | BudgetSummaryByRincianOutput
  | BudgetSummaryBySubKomponen;

export type UserProfile = Tables['profiles']['Row'];

// Helper type to make specific fields optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Auth response type
export type AuthResponse = {
  user: any;
  session: any;
  weakPassword?: any;
} | {
  user: null;
  session: null;
  weakPassword?: null;
};
