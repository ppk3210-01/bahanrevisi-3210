
import { BudgetItemRecord, KomponenOutputRecord, SubKomponenRecord, AkunRecord, BudgetSummaryRecord } from './database';

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

// BudgetItemRecord to BudgetItem converter
export const convertToBudgetItem = (record: BudgetItemRecord): BudgetItem => {
  return {
    id: record.id,
    uraian: record.uraian,
    volumeSemula: Number(record.volume_semula),
    satuanSemula: record.satuan_semula,
    hargaSatuanSemula: Number(record.harga_satuan_semula),
    jumlahSemula: Number(record.jumlah_semula || 0),
    volumeMenjadi: Number(record.volume_menjadi),
    satuanMenjadi: record.satuan_menjadi,
    hargaSatuanMenjadi: Number(record.harga_satuan_menjadi),
    jumlahMenjadi: Number(record.jumlah_menjadi || 0),
    selisih: Number(record.selisih || 0),
    status: record.status as "unchanged" | "changed" | "new" | "deleted",
    isApproved: record.is_approved,
    komponenOutput: record.komponen_output,
    programPembebanan: record.program_pembebanan || '',
    kegiatan: record.kegiatan || '',
    rincianOutput: record.rincian_output || '',
    subKomponen: record.sub_komponen || '',
    akun: record.akun || ''
  };
};

// BudgetItem to BudgetItemRecord converter
export const convertToBudgetItemRecord = (item: Partial<BudgetItem>): Partial<BudgetItemRecord> => {
  const record: Partial<BudgetItemRecord> = {};
  
  if ('uraian' in item) record.uraian = item.uraian!;
  if ('volumeSemula' in item) record.volume_semula = item.volumeSemula!;
  if ('satuanSemula' in item) record.satuan_semula = item.satuanSemula!;
  if ('hargaSatuanSemula' in item) record.harga_satuan_semula = item.hargaSatuanSemula!;
  if ('jumlahSemula' in item) record.jumlah_semula = item.jumlahSemula!;
  if ('volumeMenjadi' in item) record.volume_menjadi = item.volumeMenjadi!;
  if ('satuanMenjadi' in item) record.satuan_menjadi = item.satuanMenjadi!;
  if ('hargaSatuanMenjadi' in item) record.harga_satuan_menjadi = item.hargaSatuanMenjadi!;
  if ('jumlahMenjadi' in item) record.jumlah_menjadi = item.jumlahMenjadi!;
  if ('selisih' in item) record.selisih = item.selisih!;
  if ('status' in item) record.status = item.status!;
  if ('isApproved' in item) record.is_approved = item.isApproved!;
  if ('komponenOutput' in item) record.komponen_output = item.komponenOutput!;
  if ('programPembebanan' in item) record.program_pembebanan = item.programPembebanan;
  if ('kegiatan' in item) record.kegiatan = item.kegiatan;
  if ('rincianOutput' in item) record.rincian_output = item.rincianOutput;
  if ('subKomponen' in item) record.sub_komponen = item.subKomponen;
  if ('akun' in item) record.akun = item.akun;
  
  return record;
};
