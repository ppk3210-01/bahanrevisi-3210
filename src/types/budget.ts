
export interface BudgetItem {
  id: string;
  uraian: string;
  volumeSemula: number;
  satuanSemula: string;
  hargaSatuanSemula: number;
  jumlahSemula: number;
  volumeMenjadi: number;
  satuanMenjadi: string;
  hargaSatuanMenjadi: number;
  jumlahMenjadi: number;
  selisih: number;
  status: 'unchanged' | 'changed' | 'new' | 'deleted';
  isApproved: boolean;
  komponenOutput: string;
  programPembebanan?: string;
  kegiatan?: string;
  rincianOutput?: string;
  subKomponen?: string;
  akun?: string;
}

export interface BudgetSummary {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  changedItems: BudgetItem[];
  newItems: BudgetItem[];
  deletedItems: BudgetItem[];
}

export interface FilterOption {
  id: string;
  name: string;
}

export interface HierarchyData {
  programPembebanan: FilterOption[];
  kegiatan: Record<string, FilterOption[]>;
  rincianOutput: Record<string, FilterOption[]>;
  komponenOutput: Record<string, FilterOption[]>;
  subKomponen: Record<string, FilterOption[]>;
  akun: FilterOption[];
}

export interface FilterSelection {
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
  subKomponen: string;
  akun: string;
}

export interface BudgetDataHook {
  budgetItems: BudgetItem[];
  loading: boolean;
  error: string | null;
  addBudgetItem: (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => Promise<BudgetItem | undefined>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<BudgetItem | undefined>;
  deleteBudgetItem: (id: string) => Promise<void>;
  approveBudgetItem: (id: string) => Promise<void>;
  rejectBudgetItem: (id: string) => Promise<void>;
  importBudgetItems: (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => Promise<BudgetItem[] | undefined>;
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
}
