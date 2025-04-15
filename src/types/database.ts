
import { Database } from '@/integrations/supabase/types';

// Define user roles as a strict union type
export type UserRole = 'admin' | 'user';

// Export database tables directly using the Database type
export type Tables = Database['public']['Tables'];
export type BudgetItemRecord = Tables['budget_items']['Row'];

// We need to define these manually since they aren't correctly typed in the generated types
// This is a workaround for the missing tables in the types
export type KomponenOutputRecord = {
  id: string;
  name: string;
  created_at?: string;
};

export type SubKomponenRecord = {
  id: string;
  name: string;
  komponen_output_id?: string;
};

export type AkunRecord = {
  id: string;
  name: string;
  code: string;
};

// Create union types for different summary records
// Define manual types for summary views since they aren't in the generated types
export type BudgetSummaryByKomponenRecord = {
  komponen_output: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryByAkunRecord = {
  akun: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryByProgramPembebananRecord = {
  program_pembebanan: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryByKegiatanRecord = {
  kegiatan: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryByRincianOutputRecord = {
  rincian_output: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryBySubKomponenRecord = {
  sub_komponen: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryByAccountGroupRecord = {
  account_group: string | null;
  account_group_name: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

export type BudgetSummaryByAkunGroupRecord = {
  akun_group: string | null;
  akun_group_name: string | null;
  total_semula: number | null;
  total_menjadi: number | null;
  total_selisih: number | null;
  new_items: number | null;
  changed_items: number | null;
  total_items: number | null;
};

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

export type UserProfile = Database['public']['Tables']['profiles']['Row'];

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
