
import { Database } from '@/integrations/supabase/types';

// Define user roles as a strict union type
export type UserRole = 'admin' | 'user';

// Export database tables directly
export type Tables = {
  budget_items: Database['public']['Tables']['budget_items']['Row'];
  profiles: Database['public']['Tables']['profiles']['Row'];
  rencana_penarikan_dana: Database['public']['Tables']['rencana_penarikan_dana']['Row'];
};

export type BudgetItemRecord = Tables['budget_items'];

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

// Map for account groups (first digit of akun code)
export const ACCOUNT_GROUP_MAP: Record<string, string> = {
  '5': 'Belanja',
  '51': 'Belanja Pegawai',
  '52': 'Belanja Barang dan Jasa',
  '53': 'Belanja Modal',
  '54': 'Belanja Pembayaran Kewajiban Utang'
};

// Map for akun groups (first 3 digits of akun code)
export const AKUN_GROUP_MAP: Record<string, string> = {
  '511': 'Belanja Pegawai',
  '521': 'Belanja Barang',
  '522': 'Belanja Perjalanan Dinas',
  '523': 'Belanja Barang Operasional Lainnya',
  '524': 'Belanja Barang Non Operasional Lainnya',
  '525': 'Belanja Pemeliharaan',
  '526': 'Belanja Sewa',
  '531': 'Belanja Modal Tanah',
  '532': 'Belanja Modal Peralatan dan Mesin',
  '533': 'Belanja Modal Gedung dan Bangunan',
  '534': 'Belanja Modal Jalan, Irigasi, dan Jaringan',
  '535': 'Belanja Modal Aset Tetap Lainnya',
  '536': 'Belanja Modal Aset Lainnya',
  '537': 'Belanja Modal Lainnya',
  '541': 'Belanja Hibah',
  '542': 'Belanja Bantuan Sosial',
  '551': 'Belanja Subsidi',
  '552': 'Belanja Bantuan Keuangan',
  '553': 'Belanja Bagi Hasil',
  '561': 'Belanja Tidak Terduga',
  '571': 'Belanja Transfer ke Daerah dan Dana Desa'
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
