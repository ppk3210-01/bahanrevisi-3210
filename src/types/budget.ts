
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

// Add the missing conversion functions
export const convertToBudgetItem = (item: any): BudgetItem => {
  return {
    id: item.id,
    uraian: item.uraian,
    volumeSemula: item.volume_semula,
    satuanSemula: item.satuan_semula,
    hargaSatuanSemula: item.harga_satuan_semula,
    jumlahSemula: item.jumlah_semula,
    volumeMenjadi: item.volume_menjadi,
    satuanMenjadi: item.satuan_menjadi,
    hargaSatuanMenjadi: item.harga_satuan_menjadi,
    jumlahMenjadi: item.jumlah_menjadi,
    selisih: item.selisih,
    status: item.status,
    isApproved: item.is_approved,
    programPembebanan: item.program_pembebanan,
    kegiatan: item.kegiatan,
    rincianOutput: item.rincian_output,
    komponenOutput: item.komponen_output,
    subKomponen: item.sub_komponen,
    akun: item.akun
  };
};

export const convertToBudgetItemRecord = (item: Partial<BudgetItem>): any => {
  const record: any = {};
  
  if ('uraian' in item) record.uraian = item.uraian;
  if ('volumeSemula' in item) record.volume_semula = item.volumeSemula;
  if ('satuanSemula' in item) record.satuan_semula = item.satuanSemula;
  if ('hargaSatuanSemula' in item) record.harga_satuan_semula = item.hargaSatuanSemula;
  if ('jumlahSemula' in item) record.jumlah_semula = item.jumlahSemula;
  if ('volumeMenjadi' in item) record.volume_menjadi = item.volumeMenjadi;
  if ('satuanMenjadi' in item) record.satuan_menjadi = item.satuanMenjadi;
  if ('hargaSatuanMenjadi' in item) record.harga_satuan_menjadi = item.hargaSatuanMenjadi;
  if ('jumlahMenjadi' in item) record.jumlah_menjadi = item.jumlahMenjadi;
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
