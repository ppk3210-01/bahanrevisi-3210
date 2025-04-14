export const UNIT_OPTIONS = [
  'BLN',
  'BS',
  'Desa',
  'Dok',
  'liter',
  'Lmbr',
  'M2',
  'OB',
  'OK',
  'OP',
  'OJP',
  'Paket',
  'Pasar',
  'RT',
  'Sls',
  'SET',
  'Stel',
  'Tahun'
];

// Hierarchical data structure
export const HIERARCHY_DATA = {
  programPembebanan: [
    { id: '054.01.GG', name: 'Program Penyediaan dan Pelayanan Informasi Statistik (054.01.GG)' },
    { id: '054.01.WA', name: 'Program Dukungan Manajemen (054.01.WA)' }
  ],
  kegiatan: {
    '054.01.GG': [
      { id: '2896', name: 'Pengembangan dan Analisis Statistik (2896)' },
      { id: '2897', name: 'Pelayanan dan Pengembangan Diseminasi Informasi Statistik (2897)' },
      { id: '2898', name: 'Penyediaan dan Pengembangan Statistik Neraca Pengeluaran (2898)' },
      { id: '2899', name: 'Penyediaan dan Pengembangan Statistik Neraca Produksi (2899)' },
      { id: '2900', name: 'Pengembangan Metodologi Sensus dan Survei (2900)' },
      { id: '2901', name: 'Pengembangan Sistem Informasi Statistik (2901)' },
      { id: '2902', name: 'Penyediaan dan Pengembangan Statistik Distribusi (2902)' },
      { id: '2903', name: 'Penyediaan dan Pengembangan Statistik Harga (2903)' },
      { id: '2904', name: 'Penyediaan dan Pengembangan Statistik Industri, Pertambangan dan Penggalian, Energi, dan Konstruksi (2904)' },
      { id: '2905', name: 'Penyediaan dan Pengembangan Statistik Kependudukan dan Ketenagakerjaan (2905)' },
      { id: '2906', name: 'Penyediaan dan Pengembangan Statistik Kesejahteraan Rakyat (2906)' },
      { id: '2907', name: 'Penyediaan dan Pengembangan Statistik Ketahanan Sosial (2907)' },
      { id: '2908', name: 'Penyediaan dan Pengembangan Statistik Keuangan, Teknologi Informasi, dan Pariwisata (2908)' },
      { id: '2909', name: 'Penyediaan dan Pengembangan Statistik Peternakan, Perikanan, dan Kehutanan (2909)' },
      { id: '2910', name: 'Penyediaan dan Pengembangan Statistik Tanaman Pangan, Hortikultura, dan Perkebunan (2910)' }
    ],
    '054.01.WA': [
      { id: '2886', name: 'Dukungan Manajemen dan Pelaksanaan Tugas Teknis Lainnya BPS Provinsi (2886)' }
    ]
  },
  rincianOutput: {
    '2896': [
      { id: '2896.BMA', name: 'Data dan Informasi Publik (2896.BMA)' }
    ],
    '2897': [
      { id: '2897.BMA', name: 'Data dan Informasi Publik (2897.BMA)' },
      { id: '2897.QDB', name: 'Fasilitasi dan Pembinaan Lembaga (2897.QDB)' }
    ],
    '2898': [
      { id: '2898.BMA', name: 'Data dan Informasi Publik (2898.BMA)' }
    ],
    '2899': [
      { id: '2899.BMA', name: 'Data dan Informasi Publik (2899.BMA)' }
    ],
    '2900': [
      { id: '2900.BMA', name: 'Data dan Informasi Publik (2900.BMA)' }
    ],
    '2901': [
      { id: '2901.CAN', name: 'Sarana Bidang Teknologi Informasi dan Komunikasi (2901.CAN)' }
    ],
    '2902': [
      { id: '2902.BMA', name: 'Data dan Informasi Publik (2902.BMA)' }
    ],
    '2903': [
      { id: '2903.BMA', name: 'Data dan Informasi Publik (2903.BMA)' },
      { id: '2903.QMA', name: 'Data dan Informasi Publik (2903.QMA)' }
    ],
    '2904': [
      { id: '2904.BMA', name: 'Data dan Informasi Publik (2904.BMA)' }
    ],
    '2905': [
      { id: '2905.BMA', name: 'Data dan Informasi Publik (2905.BMA)' }
    ],
    '2906': [
      { id: '2906.BMA', name: 'Data dan Informasi Publik (2906.BMA)' }
    ],
    '2907': [
      { id: '2907.BMA', name: 'Data dan Informasi Publik (2907.BMA)' }
    ],
    '2908': [
      { id: '2908.BMA', name: 'Data dan Informasi Publik (2908.BMA)' }
    ],
    '2909': [
      { id: '2909.BMA', name: 'Data dan Informasi Publik (2909.BMA)' }
    ],
    '2910': [
      { id: '2910.BMA', name: 'Data dan Informasi Publik (2910.BMA)' }
    ],
    '2886': [
      { id: '2886.EBA', name: 'Data dan Informasi Publik (2886.EBA)' },
      { id: '2886.EBD', name: 'Data dan Informasi Publik (2886.EBD)' }
    ]
  },
  komponenOutput: {
    '2896.BMA': [
      { id: '2896.BMA.004', name: 'PUBLIKASI/LAPORAN ANALISIS DAN PENGEMBANGAN STATISTIK (2896.BMA.004)' }
    ],
    '2897.BMA': [
      { id: '2897.BMA.004', name: 'LAPORAN DISEMINASI DAN METADATA STATISTIK (2897.BMA.004)' }
    ],
    '2897.QDB': [
      { id: '2897.QDB.003', name: 'PENGUATAN PENYELENGGARAAN PEMBINAAN STATISTIK SEKTORAL (2897.QDB.003)' }
    ],
    '2898.BMA': [
      { id: '2898.BMA.007', name: 'PUBLIKASI/LAPORAN STATISTIK NERACA PENGELUARAN (2898.BMA.007)' }
    ],
    '2899.BMA': [
      { id: '2899.BMA.006', name: 'PUBLIKASI/LAPORAN NERACA PRODUKSI (2899.BMA.006)' }
    ],
    '2900.BMA': [
      { id: '2900.BMA.005', name: 'DOKUMEN/LAPORAN PENGEMBANGAN METODOLOGI KEGIATAN STATISTIK (2900.BMA.005)' }
    ],
    '2901.CAN': [
      { id: '2901.CAN.004', name: 'Pengembangan Infrastruktur dan Layanan Teknologi Informasi dan Komunikasi (2901.CAN.004)' }
    ],
    '2902.BMA': [
      { id: '2902.BMA.004', name: 'PUBLIKASI/LAPORAN STATISTIK DISTRIBUSI (2902.BMA.004)' },
      { id: '2902.BMA.006', name: 'PUBLIKASI/LAPORAN SENSUS EKONOMI (2902.BMA.006)' }
    ],
    '2903.BMA': [
      { id: '2903.BMA.009', name: 'PUBLIKASI/LAPORAN STATISTIK HARGA (2903.BMA.009)' }
    ],
    '2903.QMA': [
      { id: '2903.QMA.006', name: 'PUBLIKASI/LAPORAN PENYUSUNAN INFLASI (2903.QMA.006)' }
    ],
    '2904.BMA': [
      { id: '2904.BMA.006', name: 'PUBLIKASI/LAPORAN STATISTIK INDUSTRI, PERTAMBANGAN DAN PENGGALIAN, ENERGI, DAN KONSTRUksi (2904.BMA.006)' }
    ],
    '2905.BMA': [
      { id: '2905.BMA.004', name: 'PUBLIKASI/LAPORAN SAKERNAS (2905.BMA.004)' },
      { id: '2905.BMA.006', name: 'PUBLIKASI/LAPORAN SURVEI PENDUDUK ANTAR SENSUS (2905.BMA.006)' }
    ],
    '2906.BMA': [
      { id: '2906.BMA.003', name: 'PUBLIKASI/LAPORAN STATISTIK KESEJAHTERAAN RAKYAT (2906.BMA.003)' },
      { id: '2906.BMA.006', name: 'PUBLIKASI/LAPORAN SUSENAS (2906.BMA.006)' }
    ],
    '2907.BMA': [
      { id: '2907.BMA.006', name: 'PUBLIKASI/LAPORAN STATISTIK KETAHANAN SOSIAL (2907.BMA.006)' },
      { id: '2907.BMA.008', name: 'PUBLIKASI/LAPORAN PENDATAAN PODES (2907.BMA.008)' }
    ],
    '2908.BMA': [
      { id: '2908.BMA.004', name: 'PUBLIKASI/LAPORAN STATISTIK KEUANGAN, TEKNOLOGI INFORMASI, DAN PARIWISATA (2908.BMA.004)' },
      { id: '2908.BMA.009', name: 'PUBLIKASI/LAPORAN STATISTIK E-COMMERCE (2908.BMA.009)' }
    ],
    '2909.BMA': [
      { id: '2909.BMA.005', name: 'PUBLIKASI/LAPORAN STATISTIK PETERNAKAN, PERIKANAN, DAN KEHUTANAN (2909.BMA.005)' }
    ],
    '2910.BMA': [
      { id: '2910.BMA.007', name: 'PUBLIKASI/ LAPORAN STATISTIK TANAMAN PANGAN (2910.BMA.007)' },
      { id: '2910.BMA.008', name: 'PUBLIKASI/LAPORAN STATISTIK HORTIKULTURA DAN PERKEBUNAN (2910.BMA.008)' }
    ],
    '2886.EBA': [
      { id: '2886.EBA.956', name: 'Layanan BMN (2886.EBA.956)' },
      { id: '2886.EBA.962', name: 'Layanan Umum (2886.EBA.962)' },
      { id: '2886.EBA.994', name: 'Layanan Perkantoran (2886.EBA.994)' }
    ],
    '2886.EBD': [
      { id: '2886.EBD.955', name: 'Layanan Manajemen Keuangan (2886.EBD.955)' }
    ]
  },
  subKomponen: {
    '054.01.GG': [
      { id: '005', name: 'Dukungan Penyelenggaraan Tugas dan Fungsi Unit (005)' },
      { id: '051_GG', name: 'PERSIAPAN (051)' },
      { id: '052', name: 'PENGUMPULAN DATA (052)' },
      { id: '053', name: 'PENGOLAHAN DAN ANALISIS (053)' },
      { id: '054', name: 'DISEMINASI DAN EVALUASI (054)' },
      { id: '056', name: 'Pengembangan Infrastruktur dan Layanan Teknologi Informasi dan Komunikasi (056)' },
      { id: '506', name: 'Pemutakhiran Kerangka Geospasial dan Muatan Wilkerstat (506)' },
      { id: '516', name: 'Updating Direktori Usaha/Perusahaan Ekonomi Lanjutan (516)' },
      { id: '519', name: 'Penyusunan Bahan Publisitas (519)' }
    ],
    '054.01.WA': [
      { id: '051_WA', name: 'Tanpa Komponen (051)' },
      { id: '001', name: 'Gaji dan Tunjangan (001)' },
      { id: '002', name: 'Operasional dan Pemeliharaan Kantor (002)' }
    ]
  },
  akun: [
    { id: '511111', name: 'Belanja Gaji Pokok PNS (511111)' },
    { id: '511119', name: 'Belanja Pembulatan Gaji PNS (511119)' },
    { id: '511121', name: 'Belanja Tunjangan Suami/Istri PNS (511121)' },
    { id: '511122', name: 'Belanja Tunjangan Anak PNS (511122)' },
    { id: '511123', name: 'Belanja Tunjangan Struktural PNS (511123)' },
    { id: '511124', name: 'Belanja Tunjangan Fungsional PNS (511124)' },
    { id: '511125', name: 'Belanja Tunjangan PPh PNS (511125)' },
    { id: '511126', name: 'Belanja Tunjangan Beras PNS (511126)' },
    { id: '511129', name: 'Belanja Uang Makan PNS (511129)' },
    { id: '511151', name: 'Belanja Tunjangan Umum PNS (511151)' },
    { id: '512211', name: 'Belanja Gaji Pokok Non-PNS (512211)' },
    { id: '512411', name: 'Belanja Tunjangan Non-PNS (512411)' },
    { id: '521111', name: 'Belanja Barang Operasional (521111)' },
    { id: '521115', name: 'Belanja Barang Non-Operasional (521115)' },
    { id: '521119', name: 'Belanja Barang Lainnya (521119)' },
    { id: '521211', name: 'Belanja Barang Persediaan (521211)' },
    { id: '521213', name: 'Belanja Barang Non-Persediaan (521213)' },
    { id: '521219', name: 'Belanja Barang Non Operasional Lainnya (521219)' },
    { id: '521811', name: 'Belanja Barang untuk Kegiatan Khusus (521811)' },
    { id: '522111', name: 'Belanja Langganan Listrik (522111)' },
    { id: '522112', name: 'Belanja Langganan Air (522112)' },
    { id: '522119', name: 'Belanja Langganan Daya dan Jasa Lainnya (522119)' },
    { id: '522151', name: 'Belanja Jasa Profesi (522151)' },
    { id: '522191', name: 'Belanja Jasa Lainnya (522191)' },
    { id: '523111', name: 'Belanja Pemeliharaan Gedung dan Bangunan (523111)' },
    { id: '523121', name: 'Belanja Pemeliharaan Peralatan dan Mesin (523121)' },
    { id: '524111', name: 'Belanja Perjalanan Dinas Dalam Negeri (524111)' },
    { id: '524113', name: 'Belanja Perjalanan Dinas Luar Negeri (524113)' },
    { id: '524114', name: 'Belanja Perjalanan Dinas Lainnya (524114)' }
  ]
};

// Sample budget data for initial demo
export const SAMPLE_BUDGET_ITEMS = [
  {
    id: '1',
    uraian: 'Biaya operasional kantor',
    volumeSemula: 12,
    satuanSemula: 'BLN',
    hargaSatuanSemula: 5000000,
    jumlahSemula: 60000000,
    volumeMenjadi: 12,
    satuanMenjadi: 'BLN',
    hargaSatuanMenjadi: 5000000,
    jumlahMenjadi: 60000000,
    selisih: 0,
    status: 'unchanged' as 'unchanged',
    isApproved: false,
    komponenOutput: '2886.EBA.956'
  },
  {
    id: '2',
    uraian: 'Pengadaan alat tulis kantor',
    volumeSemula: 4,
    satuanSemula: 'Paket',
    hargaSatuanSemula: 2500000,
    jumlahSemula: 10000000,
    volumeMenjadi: 5,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 2500000,
    jumlahMenjadi: 12500000,
    selisih: 2500000,
    status: 'changed' as 'changed',
    isApproved: false,
    komponenOutput: '2886.EBA.962'
  },
  {
    id: '3',
    uraian: 'Biaya pemeliharaan gedung',
    volumeSemula: 2,
    satuanSemula: 'Paket',
    hargaSatuanSemula: 15000000,
    jumlahSemula: 30000000,
    volumeMenjadi: 2,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 20000000,
    jumlahMenjadi: 40000000,
    selisih: 10000000,
    status: 'changed' as 'changed',
    isApproved: false,
    komponenOutput: '2886.EBA.956'
  },
  {
    id: '4',
    uraian: 'Pengembangan aplikasi statistik',
    volumeSemula: 0,
    satuanSemula: '',
    hargaSatuanSemula: 0,
    jumlahSemula: 0,
    volumeMenjadi: 1,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 25000000,
    jumlahMenjadi: 25000000,
    selisih: 25000000,
    status: 'new' as 'new',
    isApproved: false,
    komponenOutput: '2901.CAN.004'
  }
];
