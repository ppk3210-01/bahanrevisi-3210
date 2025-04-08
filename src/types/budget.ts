
// Create or update this file with the following content
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
  createdBy?: string; // User ID who created the item
  updatedBy?: string; // User ID who last updated the item
}

export interface BudgetSummary {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  changedItems: BudgetItem[];
  newItems: BudgetItem[];
  deletedItems: BudgetItem[];
}

export interface FilterSelection {
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
  subKomponen: string;
  akun: string;
}
