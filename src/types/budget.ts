
export interface FilterSelection {
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
  subKomponen: string;
  akun: string;
}

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
  status: 'changed' | 'unchanged' | 'new' | 'deleted';
  isApproved: boolean;
  programPembebanan?: string;
  kegiatan?: string;
  rincianOutput?: string;
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
}

export interface BudgetItemRPD {
  id: string;
  budget_item_id?: string;
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
  status: 'ok' | 'belum_isi' | 'belum_lengkap' | 'sisa';
}
