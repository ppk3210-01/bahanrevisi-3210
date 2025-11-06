
import { BudgetItemRecord } from './database';

export type BudgetItem = {
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
  sisaAnggaran: number;
  selisih: number;
  blokir: number;
  status: string;
  isApproved: boolean;
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
  subKomponen: string;
  akun: string;
};

export type FilterSelection = {
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
  subKomponen: string;
  akun: string;
};

export const convertToBudgetItem = (record: BudgetItemRecord) => {
  return {
    id: record.id,
    uraian: record.uraian,
    volumeSemula: record.volume_semula,
    satuanSemula: record.satuan_semula || '',
    hargaSatuanSemula: record.harga_satuan_semula,
    jumlahSemula: record.jumlah_semula,
    volumeMenjadi: record.volume_menjadi,
    satuanMenjadi: record.satuan_menjadi || '',
    hargaSatuanMenjadi: record.harga_satuan_menjadi,
    jumlahMenjadi: record.jumlah_menjadi,
    sisaAnggaran: record.sisa_anggaran || 0,
    selisih: record.selisih || 0,
    blokir: record.blokir || 0,
    status: record.status,
    isApproved: record.is_approved || false,
    programPembebanan: record.program_pembebanan || '',
    kegiatan: record.kegiatan || '',
    rincianOutput: record.rincian_output || '',
    komponenOutput: record.komponen_output || '',
    subKomponen: record.sub_komponen || '',
    akun: record.akun || '',
  };
};

export const convertToBudgetItemRecord = (item: Partial<any>) => {
  const record: Partial<BudgetItemRecord> = {};
  
  if ('uraian' in item) record.uraian = item.uraian;
  if ('volumeSemula' in item) record.volume_semula = item.volumeSemula;
  if ('satuanSemula' in item) record.satuan_semula = item.satuanSemula;
  if ('hargaSatuanSemula' in item) record.harga_satuan_semula = item.hargaSatuanSemula;
  if ('jumlahSemula' in item) record.jumlah_semula = item.jumlahSemula;
  if ('volumeMenjadi' in item) record.volume_menjadi = item.volumeMenjadi;
  if ('satuanMenjadi' in item) record.satuan_menjadi = item.satuanMenjadi;
  if ('hargaSatuanMenjadi' in item) record.harga_satuan_menjadi = item.hargaSatuanMenjadi;
  if ('jumlahMenjadi' in item) record.jumlah_menjadi = item.jumlahMenjadi;
  if ('sisaAnggaran' in item) record.sisa_anggaran = item.sisaAnggaran;
  if ('selisih' in item) record.selisih = item.selisih;
  if ('blokir' in item) record.blokir = item.blokir;
  if ('status' in item) record.status = item.status;
  if ('isApproved' in item) record.is_approved = item.isApproved;
  if ('programPembebanan' in item) record.program_pembebanan = item.programPembebanan;
  if ('kegiatan' in item) record.kegiatan = item.kegiatan;
  if ('rincianOutput' in item) record.rincian_output = item.rincianOutput;
  if ('komponenOutput' in item) record.komponen_output = item.komponenOutput;
  if ('subKomponen' in item) record.sub_komponen = item.subKomponen;
  if ('akun' in item) record.akun = item.akun;
  
  return record;
};
