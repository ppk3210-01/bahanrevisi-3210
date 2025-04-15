
// Account codes map
export const ACCOUNT_GROUP_MAP: Record<string, string> = {
  "511": "Belanja Gaji dan Tunjangan PNS",
  "512": "Belanja Gaji dan Tunjangan Non-PNS",
  "521": "Belanja Barang",
  "522": "Belanja Jasa",
  "523": "Belanja Pemeliharaan",
  "524": "Belanja Perjalanan Dinas",
  "525": "Belanja Sewa",
  "526": "Belanja Barang Operasional Lainnya",
  "527": "Belanja Barang Non Operasional Lainnya",
  "531": "Belanja Modal Tanah",
  "532": "Belanja Modal Peralatan dan Mesin",
  "533": "Belanja Modal Gedung dan Bangunan",
  "534": "Belanja Modal Jalan, Irigasi, dan Jaringan",
  "535": "Belanja Modal Aset Tetap Lainnya",
  "536": "Belanja Modal Aset Lainnya",
  "541": "Belanja Hibah",
  "542": "Belanja Bantuan Sosial",
  "551": "Belanja Subsidi",
  "552": "Belanja Bantuan Keuangan",
  "553": "Belanja Bagi Hasil",
  "561": "Belanja Tidak Terduga",
  "571": "Belanja Transfer ke Daerah dan Dana Desa",
};

// Hierarchy data
export const HIERARCHY_DATA = {
  programPembebanan: [
    { id: "PP001", name: "Program Pembebanan 1" },
    { id: "PP002", name: "Program Pembebanan 2" },
    { id: "PP003", name: "Program Pembebanan 3" },
  ],
  kegiatan: {
    PP001: [
      { id: "K001", name: "Kegiatan 1.1" },
      { id: "K002", name: "Kegiatan 1.2" },
    ],
    PP002: [
      { id: "K003", name: "Kegiatan 2.1" },
      { id: "K004", name: "Kegiatan 2.2" },
    ],
    PP003: [
      { id: "K005", name: "Kegiatan 3.1" },
      { id: "K006", name: "Kegiatan 3.2" },
    ],
  },
  rincianOutput: {
    K001: [
      { id: "RO001", name: "Rincian Output 1.1.1" },
      { id: "RO002", name: "Rincian Output 1.1.2" },
    ],
    K002: [
      { id: "RO003", name: "Rincian Output 1.2.1" },
      { id: "RO004", name: "Rincian Output 1.2.2" },
    ],
    K003: [
      { id: "RO005", name: "Rincian Output 2.1.1" },
      { id: "RO006", name: "Rincian Output 2.1.2" },
    ],
    K004: [
      { id: "RO007", name: "Rincian Output 2.2.1" },
      { id: "RO008", name: "Rincian Output 2.2.2" },
    ],
    K005: [
      { id: "RO009", name: "Rincian Output 3.1.1" },
      { id: "RO010", name: "Rincian Output 3.1.2" },
    ],
    K006: [
      { id: "RO011", name: "Rincian Output 3.2.1" },
      { id: "RO012", name: "Rincian Output 3.2.2" },
    ],
  },
  komponenOutput: {
    RO001: [
      { id: "KO001", name: "Komponen Output 1.1.1.1" },
      { id: "KO002", name: "Komponen Output 1.1.1.2" },
    ],
    RO002: [
      { id: "KO003", name: "Komponen Output 1.1.2.1" },
      { id: "KO004", name: "Komponen Output 1.1.2.2" },
    ],
    RO003: [
      { id: "KO005", name: "Komponen Output 1.2.1.1" },
      { id: "KO006", name: "Komponen Output 1.2.1.2" },
    ],
    RO004: [
      { id: "KO007", name: "Komponen Output 1.2.2.1" },
      { id: "KO008", name: "Komponen Output 1.2.2.2" },
    ],
    RO005: [
      { id: "KO009", name: "Komponen Output 2.1.1.1" },
      { id: "KO010", name: "Komponen Output 2.1.1.2" },
    ],
    RO006: [
      { id: "KO011", name: "Komponen Output 2.1.2.1" },
      { id: "KO012", name: "Komponen Output 2.1.2.2" },
    ],
    RO007: [
      { id: "KO013", name: "Komponen Output 2.2.1.1" },
      { id: "KO014", name: "Komponen Output 2.2.1.2" },
    ],
    RO008: [
      { id: "KO015", name: "Komponen Output 2.2.2.1" },
      { id: "KO016", name: "Komponen Output 2.2.2.2" },
    ],
    RO009: [
      { id: "KO017", name: "Komponen Output 3.1.1.1" },
      { id: "KO018", name: "Komponen Output 3.1.1.2" },
    ],
    RO010: [
      { id: "KO019", name: "Komponen Output 3.1.2.1" },
      { id: "KO020", name: "Komponen Output 3.1.2.2" },
    ],
    RO011: [
      { id: "KO021", name: "Komponen Output 3.2.1.1" },
      { id: "KO022", name: "Komponen Output 3.2.1.2" },
    ],
    RO012: [
      { id: "KO023", name: "Komponen Output 3.2.2.1" },
      { id: "KO024", name: "Komponen Output 3.2.2.2" },
    ],
  },
  subKomponen: {
    PP001: [
      { id: "SK001", name: "Sub Komponen 1.1" },
      { id: "SK002", name: "Sub Komponen 1.2" },
    ],
    PP002: [
      { id: "SK003", name: "Sub Komponen 2.1" },
      { id: "SK004", name: "Sub Komponen 2.2" },
    ],
    PP003: [
      { id: "SK005", name: "Sub Komponen 3.1" },
      { id: "SK006", name: "Sub Komponen 3.2" },
    ],
  },
  akun: [
    { id: "511111", name: "511111 - Belanja Gaji Pokok PNS" },
    { id: "512211", name: "512211 - Belanja Gaji Pokok Non PNS" },
    { id: "521111", name: "521111 - Belanja Keperluan Perkantoran" },
    { id: "522111", name: "522111 - Belanja Jasa Konsultan" },
    { id: "523111", name: "523111 - Belanja Pemeliharaan Gedung" },
    { id: "524111", name: "524111 - Belanja Perjalanan Dinas Dalam Negeri" },
    { id: "525111", name: "525111 - Belanja Sewa Gedung" },
    { id: "526111", name: "526111 - Belanja Operasional Lainnya" },
    { id: "527111", name: "527111 - Belanja Non Operasional" },
    { id: "531111", name: "531111 - Belanja Modal Pengadaan Tanah" },
    { id: "532111", name: "532111 - Belanja Modal Peralatan Kantor" },
    { id: "533111", name: "533111 - Belanja Modal Gedung Kantor" },
  ],
  monthNames: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
};

export const UNIT_OPTIONS = [
  "Paket",
  "Bulan",
  "Tahun",
  "Orang",
  "Kegiatan",
  "Kali",
  "Dokumen",
  "Unit",
  "Laporan",
  "Jam",
  "Hari",
  "Minggu",
  "Bulan",
  "Triwulan",
  "Semester",
  "Tahun",
  "Set",
  "Lembar",
  "Rim",
  "Pack",
  "Box",
  "Botol",
  "Buku",
  "Stel",
  "Pasang",
  "Potong",
  "Buah",
  "Batang",
  "Roll",
  "Meter",
  "M2",
  "M3",
  "Kilometer",
  "Ton",
  "Kg",
  "Liter"
];
