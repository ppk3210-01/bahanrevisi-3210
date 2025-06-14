
import { Database } from '@/integrations/supabase/types';

// Define user roles as a strict union type
export type UserRole = 'admin' | 'user';

// Export database types
export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type BudgetItemRecord = Tables['budget_items']['Row'] & {
  sisa_anggaran?: number | null;
};

// These type definitions needed to be fixed - using proper type assertions
export type KomponenOutputRecord = { id: string, name: string, code: string };
export type SubKomponenRecord = { id: string, name: string, code: string };
export type AkunRecord = { id: string, name: string, code: string };

// Create union types for different summary records
export type BudgetSummaryByKomponenRecord = Views['budget_summary_by_komponen']['Row'];
export type BudgetSummaryByAkunRecord = Views['budget_summary_by_akun']['Row'] & { akun_name?: string };
export type BudgetSummaryByProgramPembebananRecord = Views['budget_summary_by_program_pembebanan']['Row'];
export type BudgetSummaryByKegiatanRecord = Views['budget_summary_by_kegiatan']['Row']; 
export type BudgetSummaryByRincianOutputRecord = Views['budget_summary_by_rincian_output']['Row']; 
export type BudgetSummaryBySubKomponenRecord = Views['budget_summary_by_sub_komponen']['Row'];
export type BudgetSummaryByAccountGroupRecord = Views['budget_summary_by_account_group']['Row'];
export type BudgetSummaryByAkunGroupRecord = Views['budget_summary_by_akun_group']['Row'];

// Base type with common fields
export type BudgetSummaryBase = {
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

// Summary types by different groupings
export interface BudgetSummaryByKomponen extends BudgetSummaryBase {
  komponen_output: string | null;
  type: 'komponen_output';
}

export interface BudgetSummaryByAkun extends BudgetSummaryBase {
  akun: string | null;
  akun_name?: string | null;
  type: 'akun';
}

export interface BudgetSummaryByProgramPembebanan extends BudgetSummaryBase {
  program_pembebanan: string | null;
  type: 'program_pembebanan';
}

export interface BudgetSummaryByKegiatan extends BudgetSummaryBase {
  kegiatan: string | null;
  type: 'kegiatan';
}

export interface BudgetSummaryByRincianOutput extends BudgetSummaryBase {
  rincian_output: string | null;
  type: 'rincian_output';
}

export interface BudgetSummaryBySubKomponen extends BudgetSummaryBase {
  sub_komponen: string | null;
  type: 'sub_komponen';
}

export interface BudgetSummaryByAccountGroup extends BudgetSummaryBase {
  account_group: string | null;
  account_group_name: string | null;
  type: 'account_group';
}

export interface BudgetSummaryByAkunGroup extends BudgetSummaryBase {
  akun_group: string | null;
  akun_group_name: string | null;
  type: 'akun_group';
}

// Union type for all budget summary types
export type BudgetSummaryRecord = 
  | BudgetSummaryByKomponen 
  | BudgetSummaryByAkun
  | BudgetSummaryByProgramPembebanan
  | BudgetSummaryByKegiatan
  | BudgetSummaryByRincianOutput
  | BudgetSummaryBySubKomponen
  | BudgetSummaryByAccountGroup
  | BudgetSummaryByAkunGroup;

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
