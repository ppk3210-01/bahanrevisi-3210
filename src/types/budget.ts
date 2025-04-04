
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
}

export interface FilterSelection {
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
}
