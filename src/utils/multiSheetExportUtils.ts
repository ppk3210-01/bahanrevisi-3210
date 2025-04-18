import * as XLSX from 'xlsx';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { formatCurrency, roundToThousands } from './budgetCalculations';
import { RPDItem } from '@/hooks/useRPDData';

// Function to create Excel workbook with multiple sheets
export const createMultiSheetWorkbook = async (
  budgetItems: BudgetItem[],
  rpdItems: RPDItem[] | undefined = undefined,
  summaries: any = {},
  filters: FilterSelection = {
    programPembebanan: 'all',
    kegiatan: 'all',
    rincianOutput: 'all',
    komponenOutput: 'all',
    subKomponen: 'all',
    akun: 'all'
  }
) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    addSummarySheet(wb, budgetItems, summaries);
    
    // Add sheets for each filter category
    addProgramPembebananSheet(wb, budgetItems, filters);
    addKegiatanSheet(wb, budgetItems, filters);
    addRincianOutputSheet(wb, budgetItems, filters);
    addKomponenOutputSheet(wb, budgetItems, filters);
    addSubKomponenSheet(wb, budgetItems, filters);
    addAkunSheet(wb, budgetItems, filters);
    addAkunGroupSheet(wb, budgetItems, summaries);
    addAccountGroupSheet(wb, budgetItems, summaries);
    
    // Add RPD data sheet if available
    if (rpdItems && rpdItems.length > 0) {
      addRPDSheet(wb, rpdItems);
    }
    
    // Add full data sheet
    addFullDataSheet(wb, budgetItems);

    return wb;
  } catch (error) {
    console.error('Error creating multi-sheet workbook:', error);
    throw error;
  }
};

// Function to add summary sheet
const addSummarySheet = (wb: XLSX.WorkBook, items: BudgetItem[], summaries: any) => {
  // Calculate summary values
  const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const totalSelisih = roundToThousands(totalMenjadi - totalSemula);
  
  const newItems = items.filter(item => item.status === 'new').length;
  const changedItems = items.filter(item => item.status === 'changed').length;
  const deletedItems = items.filter(item => item.status === 'deleted').length;
  const unchangedItems = items.filter(item => item.status === 'unchanged').length;
  const totalItems = items.length;

  // Create summary data
  const summaryData = [
    ['RINGKASAN PERUBAHAN ANGGARAN', '', '', ''],
    ['', '', '', ''],
    ['Total Anggaran Semula', formatCurrency(totalSemula), '', ''],
    ['Total Anggaran Menjadi', formatCurrency(totalMenjadi), '', ''],
    ['Selisih', formatCurrency(totalSelisih), '', ''],
    ['', '', '', ''],
    ['Jumlah Item Total', totalItems, '', ''],
    ['Jumlah Item Berubah', changedItems, '', ''],
    ['Jumlah Item Baru', newItems, '', ''],
    ['Jumlah Item Dihapus', deletedItems, '', ''],
    ['Jumlah Item Tidak Berubah', unchangedItems, '', ''],
    ['', '', '', ''],
    ['KESIMPULAN', '', '', ''],
    [`Berdasarkan hasil analisis terhadap alokasi anggaran, total pagu anggaran semula sebesar ${formatCurrency(totalSemula)} mengalami perubahan menjadi ${formatCurrency(totalMenjadi)}, dengan selisih ${formatCurrency(Math.abs(totalSelisih))} ${totalSelisih > 0 ? 'penambahan' : totalSelisih < 0 ? 'pengurangan' : 'atau tetap'}.`, '', '', ''],
    [`Perubahan ini terdiri dari ${changedItems} komponen anggaran yang mengalami penyesuaian nilai, ${newItems} komponen anggaran baru yang ditambahkan, dan ${deletedItems} komponen anggaran yang dihapus.`, '', '', ''],
    ['Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan prioritas program dan kegiatan yang telah ditetapkan.', '', '', ''],
    ['Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.', '', '', ''],
  ];

  // Add changed items table
  summaryData.push(['', '', '', ''], ['PAGU ANGGARAN BERUBAH', '', '', '']);
  
  // Headers for changed items
  summaryData.push(['No', 'Pembebanan', 'Uraian', 'Detail Perubahan', 'Jumlah Semula', 'Jumlah Menjadi', 'Selisih']);
  
  // Add changed items data
  const changedItemsList = items.filter(item => item.status === 'changed');
  changedItemsList.forEach((item, index) => {
    summaryData.push([
      index + 1, 
      item.programPembebanan || '-', 
      item.uraian, 
      `Volume: ${item.volumeSemula} ${item.satuanSemula} → ${item.volumeMenjadi} ${item.satuanMenjadi}, Harga: ${formatCurrency(item.hargaSatuanSemula)} → ${formatCurrency(item.hargaSatuanMenjadi)}`,
      formatCurrency(item.jumlahSemula),
      formatCurrency(item.jumlahMenjadi),
      formatCurrency(item.jumlahMenjadi - item.jumlahSemula)
    ]);
  });

  // Add new items table
  summaryData.push(['', '', '', ''], ['PAGU ANGGARAN BARU', '', '', '']);
  
  // Headers for new items
  summaryData.push(['No', 'Pembebanan', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']);
  
  // Add new items data
  const newItemsList = items.filter(item => item.status === 'new');
  newItemsList.forEach((item, index) => {
    summaryData.push([
      index + 1, 
      item.programPembebanan || '-', 
      item.uraian, 
      item.volumeMenjadi,
      item.satuanMenjadi,
      formatCurrency(item.hargaSatuanMenjadi),
      formatCurrency(item.jumlahMenjadi)
    ]);
  });

  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  const colWidths = [
    { width: 40 },  // A
    { width: 25 },  // B
    { width: 25 },  // C
    { width: 40 },  // D
    { width: 20 },  // E
    { width: 20 },  // F
    { width: 20 },  // G
  ];
  
  ws['!cols'] = colWidths;
  
  // Merge cells for headers
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
    { s: { r: 12, c: 0 }, e: { r: 12, c: 3 } }, // KESIMPULAN
    { s: { r: 13, c: 0 }, e: { r: 13, c: 3 } }, // Line 1
    { s: { r: 14, c: 0 }, e: { r: 14, c: 3 } }, // Line 2
    { s: { r: 15, c: 0 }, e: { r: 15, c: 3 } }, // Line 3
    { s: { r: 16, c: 0 }, e: { r: 16, c: 3 } }, // Line 4
    { s: { r: 18, c: 0 }, e: { r: 18, c: 6 } }, // PAGU ANGGARAN BERUBAH
    { s: { r: changedItemsList.length + 20, c: 0 }, e: { r: changedItemsList.length + 20, c: 6 } } // PAGU ANGGARAN BARU
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Ringkasan Perubahan");
};

// Function to add Program Pembebanan sheet
const addProgramPembebananSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Group and aggregate data by Program Pembebanan
  const programGroups = new Map();
  
  items.forEach(item => {
    if (!item.programPembebanan) return;
    
    const key = item.programPembebanan;
    if (!programGroups.has(key)) {
      programGroups.set(key, {
        programPembebanan: key,
        totalSemula: 0,
        totalMenjadi: 0,
        totalSelisih: 0,
        changedItems: 0,
        newItems: 0,
        items: []
      });
    }
    
    const group = programGroups.get(key);
    group.totalSemula += item.jumlahSemula;
    group.totalMenjadi += item.jumlahMenjadi;
    group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
    
    if (item.status === 'changed') group.changedItems++;
    if (item.status === 'new') group.newItems++;
    
    group.items.push(item);
  });
  
  // Convert to array and sort by program name
  const programData = Array.from(programGroups.values())
    .sort((a, b) => a.programPembebanan.localeCompare(b.programPembebanan));
  
  // Create sheet data
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN PROGRAM PEMBEBANAN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Program Pembebanan', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  // Add data rows
  programData.forEach(program => {
    sheetData.push([
      program.programPembebanan,
      formatCurrency(roundToThousands(program.totalSemula)),
      formatCurrency(roundToThousands(program.totalMenjadi)),
      formatCurrency(roundToThousands(program.totalSelisih)),
      program.changedItems,
      program.newItems,
      program.items.length
    ]);
  });
  
  // Add total row
  const totalSemula = programData.reduce((sum, p) => sum + p.totalSemula, 0);
  const totalMenjadi = programData.reduce((sum, p) => sum + p.totalMenjadi, 0);
  const totalSelisih = programData.reduce((sum, p) => sum + p.totalSelisih, 0);
  const totalChangedItems = programData.reduce((sum, p) => sum + p.changedItems, 0);
  const totalNewItems = programData.reduce((sum, p) => sum + p.newItems, 0);
  const totalItems = programData.reduce((sum, p) => sum + p.items.length, 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  const colWidths = [
    { width: 40 },  // Program Pembebanan
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!cols'] = colWidths;
  
  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Program Pembebanan");
};

// Function to add Kegiatan sheet
const addKegiatanSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Similar structure to Program Pembebanan sheet
  const kegiatanGroups = new Map();
  
  items.forEach(item => {
    if (!item.kegiatan) return;
    
    const key = item.kegiatan;
    if (!kegiatanGroups.has(key)) {
      kegiatanGroups.set(key, {
        kegiatan: key,
        totalSemula: 0,
        totalMenjadi: 0,
        totalSelisih: 0,
        changedItems: 0,
        newItems: 0,
        items: []
      });
    }
    
    const group = kegiatanGroups.get(key);
    group.totalSemula += item.jumlahSemula;
    group.totalMenjadi += item.jumlahMenjadi;
    group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
    
    if (item.status === 'changed') group.changedItems++;
    if (item.status === 'new') group.newItems++;
    
    group.items.push(item);
  });
  
  // Convert to array and sort
  const kegiatanData = Array.from(kegiatanGroups.values())
    .sort((a, b) => a.kegiatan.localeCompare(b.kegiatan));
  
  // Create sheet data
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN KEGIATAN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Kegiatan', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  // Add data rows
  kegiatanData.forEach(kegiatan => {
    sheetData.push([
      kegiatan.kegiatan,
      formatCurrency(roundToThousands(kegiatan.totalSemula)),
      formatCurrency(roundToThousands(kegiatan.totalMenjadi)),
      formatCurrency(roundToThousands(kegiatan.totalSelisih)),
      kegiatan.changedItems,
      kegiatan.newItems,
      kegiatan.items.length
    ]);
  });
  
  // Add total row
  const totalSemula = kegiatanData.reduce((sum, k) => sum + k.totalSemula, 0);
  const totalMenjadi = kegiatanData.reduce((sum, k) => sum + k.totalMenjadi, 0);
  const totalSelisih = kegiatanData.reduce((sum, k) => sum + k.totalSelisih, 0);
  const totalChangedItems = kegiatanData.reduce((sum, k) => sum + k.changedItems, 0);
  const totalNewItems = kegiatanData.reduce((sum, k) => sum + k.newItems, 0);
  const totalItems = kegiatanData.reduce((sum, k) => sum + k.items.length, 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  const colWidths = [
    { width: 40 },  // Kegiatan
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!cols'] = colWidths;
  
  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Kegiatan");
};

// Function to add Rincian Output sheet
const addRincianOutputSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Similar structure to previous sheets
  const rincianGroups = new Map();
  
  items.forEach(item => {
    if (!item.rincianOutput) return;
    
    const key = item.rincianOutput;
    if (!rincianGroups.has(key)) {
      rincianGroups.set(key, {
        rincianOutput: key,
        totalSemula: 0,
        totalMenjadi: 0,
        totalSelisih: 0,
        changedItems: 0,
        newItems: 0,
        items: []
      });
    }
    
    const group = rincianGroups.get(key);
    group.totalSemula += item.jumlahSemula;
    group.totalMenjadi += item.jumlahMenjadi;
    group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
    
    if (item.status === 'changed') group.changedItems++;
    if (item.status === 'new') group.newItems++;
    
    group.items.push(item);
  });
  
  // Convert to array and sort
  const rincianData = Array.from(rincianGroups.values())
    .sort((a, b) => a.rincianOutput.localeCompare(b.rincianOutput));
  
  // Create sheet data with the same structure
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN RINCIAN OUTPUT', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Rincian Output', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  // Add data rows
  rincianData.forEach(rincian => {
    sheetData.push([
      rincian.rincianOutput,
      formatCurrency(roundToThousands(rincian.totalSemula)),
      formatCurrency(roundToThousands(rincian.totalMenjadi)),
      formatCurrency(roundToThousands(rincian.totalSelisih)),
      rincian.changedItems,
      rincian.newItems,
      rincian.items.length
    ]);
  });
  
  // Add total row
  const totalSemula = rincianData.reduce((sum, r) => sum + r.totalSemula, 0);
  const totalMenjadi = rincianData.reduce((sum, r) => sum + r.totalMenjadi, 0);
  const totalSelisih = rincianData.reduce((sum, r) => sum + r.totalSelisih, 0);
  const totalChangedItems = rincianData.reduce((sum, r) => sum + r.changedItems, 0);
  const totalNewItems = rincianData.reduce((sum, r) => sum + r.newItems, 0);
  const totalItems = rincianData.reduce((sum, r) => sum + r.items.length, 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 40 },  // Rincian Output
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Rincian Output");
};

// Function to add Komponen Output sheet
const addKomponenOutputSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Similar implementation as previous sheets
  const komponenGroups = new Map();
  
  items.forEach(item => {
    if (!item.komponenOutput) return;
    
    const key = item.komponenOutput;
    if (!komponenGroups.has(key)) {
      komponenGroups.set(key, {
        komponenOutput: key,
        totalSemula: 0,
        totalMenjadi: 0,
        totalSelisih: 0,
        changedItems: 0,
        newItems: 0,
        items: []
      });
    }
    
    const group = komponenGroups.get(key);
    group.totalSemula += item.jumlahSemula;
    group.totalMenjadi += item.jumlahMenjadi;
    group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
    
    if (item.status === 'changed') group.changedItems++;
    if (item.status === 'new') group.newItems++;
    
    group.items.push(item);
  });
  
  const komponenData = Array.from(komponenGroups.values())
    .sort((a, b) => a.komponenOutput.localeCompare(b.komponenOutput));
  
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN KOMPONEN OUTPUT', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Komponen Output', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  komponenData.forEach(komponen => {
    sheetData.push([
      komponen.komponenOutput,
      formatCurrency(roundToThousands(komponen.totalSemula)),
      formatCurrency(roundToThousands(komponen.totalMenjadi)),
      formatCurrency(roundToThousands(komponen.totalSelisih)),
      komponen.changedItems,
      komponen.newItems,
      komponen.items.length
    ]);
  });
  
  const totalSemula = komponenData.reduce((sum, k) => sum + k.totalSemula, 0);
  const totalMenjadi = komponenData.reduce((sum, k) => sum + k.totalMenjadi, 0);
  const totalSelisih = komponenData.reduce((sum, k) => sum + k.totalSelisih, 0);
  const totalChangedItems = komponenData.reduce((sum, k) => sum + k.changedItems, 0);
  const totalNewItems = komponenData.reduce((sum, k) => sum + k.newItems, 0);
  const totalItems = komponenData.reduce((sum, k) => sum + k.items.length, 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  ws['!cols'] = [
    { width: 40 },  // Komponen Output
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Komponen Output");
};

// Function to add Sub Komponen sheet
const addSubKomponenSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Similar implementation as previous sheets
  const subKomponenGroups = new Map();
  
  items.forEach(item => {
    if (!item.subKomponen) return;
    
    const key = item.subKomponen;
    if (!subKomponenGroups.has(key)) {
      subKomponenGroups.set(key, {
        subKomponen: key,
        totalSemula: 0,
        totalMenjadi: 0,
        totalSelisih: 0,
        changedItems: 0,
        newItems: 0,
        items: []
      });
    }
    
    const group = subKomponenGroups.get(key);
    group.totalSemula += item.jumlahSemula;
    group.totalMenjadi += item.jumlahMenjadi;
    group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
    
    if (item.status === 'changed') group.changedItems++;
    if (item.status === 'new') group.newItems++;
    
    group.items.push(item);
  });
  
  const subKomponenData = Array.from(subKomponenGroups.values())
    .sort((a, b) => a.subKomponen.localeCompare(b.subKomponen));
  
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN SUB KOMPONEN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Sub Komponen', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  subKomponenData.forEach(subKomponen => {
    sheetData.push([
      subKomponen.subKomponen,
      formatCurrency(roundToThousands(subKomponen.totalSemula)),
      formatCurrency(roundToThousands(subKomponen.totalMenjadi)),
      formatCurrency(roundToThousands(subKomponen.totalSelisih)),
      subKomponen.changedItems,
      subKomponen.newItems,
      subKomponen.items.length
    ]);
  });
  
  const totalSemula = subKomponenData.reduce((sum, sk) => sum + sk.totalSemula, 0);
  const totalMenjadi = subKomponenData.reduce((sum, sk) => sum + sk.totalMenjadi, 0);
  const totalSelisih = subKomponenData.reduce((sum, sk) => sum + sk.totalSelisih, 0);
  const totalChangedItems = subKomponenData.reduce((sum, sk) => sum + sk.changedItems, 0);
  const totalNewItems = subKomponenData.reduce((sum, sk) => sum + sk.newItems, 0);
  const totalItems = subKomponenData.reduce((sum, sk) => sum + sk.items.length, 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  ws['!cols'] = [
    { width: 40 },  // Sub Komponen
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Sub Komponen");
};

// Function to add Akun sheet
const addAkunSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Similar implementation as previous sheets
  const akunGroups = new Map();
  
  items.forEach(item => {
    if (!item.akun) return;
    
    const key = item.akun;
    if (!akunGroups.has(key)) {
      akunGroups.set(key, {
        akun: key,
        totalSemula: 0,
        totalMenjadi: 0,
        totalSelisih: 0,
        changedItems: 0,
        newItems: 0,
        items: []
      });
    }
    
    const group = akunGroups.get(key);
    group.totalSemula += item.jumlahSemula;
    group.totalMenjadi += item.jumlahMenjadi;
    group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
    
    if (item.status === 'changed') group.changedItems++;
    if (item.status === 'new') group.newItems++;
    
    group.items.push(item);
  });
  
  const akunData = Array.from(akunGroups.values())
    .sort((a, b) => a.akun.localeCompare(b.akun));
  
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN AKUN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Akun', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  akunData.forEach(akun => {
    sheetData.push([
      akun.akun,
      formatCurrency(roundToThousands(akun.totalSemula)),
      formatCurrency(roundToThousands(akun.totalMenjadi)),
      formatCurrency(roundToThousands(akun.totalSelisih)),
      akun.changedItems,
      akun.newItems,
      akun.items.length
    ]);
  });
  
  const totalSemula = akunData.reduce((sum, a) => sum + a.totalSemula, 0);
  const totalMenjadi = akunData.reduce((sum, a) => sum + a.totalMenjadi, 0);
  const totalSelisih = akunData.reduce((sum, a) => sum + a.totalSelisih, 0);
  const totalChangedItems = akunData.reduce((sum, a) => sum + a.changedItems, 0);
  const totalNewItems = akunData.reduce((sum, a) => sum + a.newItems, 0);
  const totalItems = akunData.reduce((sum, a) => sum + a.items.length, 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  ws['!cols'] = [
    { width: 40 },  // Akun
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Akun");
};

// Functions for Akun Group and Account Group sheets
const addAkunGroupSheet = (wb: XLSX.WorkBook, items: BudgetItem[], summaries: any) => {
  // Use summary data if available, otherwise group the data
  let akunGroupData = [];
  
  if (summaries && summaries.akunGroup && summaries.akunGroup.length > 0) {
    akunGroupData = summaries.akunGroup;
  } else {
    // Default implementation if summaries not provided
    const akunGroups = new Map();
    
    items.forEach(item => {
      if (!item.akun) return;
      
      // Extract akun group from akun code (first 2 digits)
      const akunCode = item.akun.split(' ')[0];
      const akunGroup = akunCode.substring(0, 2);
      
      if (!akunGroups.has(akunGroup)) {
        akunGroups.set(akunGroup, {
          akunGroup: akunGroup,
          akunGroupName: `Belanja ${akunGroup}`,  // Default name
          totalSemula: 0,
          totalMenjadi: 0,
          totalSelisih: 0,
          changedItems: 0,
          newItems: 0,
          items: []
        });
      }
      
      const group = akunGroups.get(akunGroup);
      group.totalSemula += item.jumlahSemula;
      group.totalMenjadi += item.jumlahMenjadi;
      group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
      
      if (item.status === 'changed') group.changedItems++;
      if (item.status === 'new') group.newItems++;
      
      group.items.push(item);
    });
    
    akunGroupData = Array.from(akunGroups.values());
  }
  
  // Sort by akun group code
  akunGroupData.sort((a, b) => {
    const codeA = a.akunGroup || a.akun_group || '';
    const codeB = b.akunGroup || b.akun_group || '';
    return codeA.localeCompare(codeB);
  });
  
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN KELOMPOK AKUN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Kelompok Akun', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  akunGroupData.forEach(group => {
    sheetData.push([
      `${group.akunGroup || group.akun_group} - ${group.akunGroupName || group.akun_group_name || ''}`,
      formatCurrency(roundToThousands(group.totalSemula || group.total_semula || 0)),
      formatCurrency(roundToThousands(group.totalMenjadi || group.total_menjadi || 0)),
      formatCurrency(roundToThousands(group.totalSelisih || group.total_selisih || 0)),
      group.changedItems || group.changed_items || 0,
      group.newItems || group.new_items || 0,
      group.items?.length || group.total_items || 0
    ]);
  });
  
  // Calculate totals
  const totalSemula = akunGroupData.reduce((sum, g) => sum + (g.totalSemula || g.total_semula || 0), 0);
  const totalMenjadi = akunGroupData.reduce((sum, g) => sum + (g.totalMenjadi || g.total_menjadi || 0), 0);
  const totalSelisih = akunGroupData.reduce((sum, g) => sum + (g.totalSelisih || g.total_selisih || 0), 0);
  const totalChangedItems = akunGroupData.reduce((sum, g) => sum + (g.changedItems || g.changed_items || 0), 0);
  const totalNewItems = akunGroupData.reduce((sum, g) => sum + (g.newItems || g.new_items || 0), 0);
  const totalItems = akunGroupData.reduce((sum, g) => sum + (g.items?.length || g.total_items || 0), 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  ws['!cols'] = [
    { width: 40 },  // Kelompok Akun
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Kelompok Akun");
};

const addAccountGroupSheet = (wb: XLSX.WorkBook, items: BudgetItem[], summaries: any) => {
  // Similar implementation as Akun Group sheet
  let accountGroupData = [];
  
  if (summaries && summaries.accountGroup && summaries.accountGroup.length > 0) {
    accountGroupData = summaries.accountGroup;
  } else {
    // Default implementation if summaries not provided
    const accountGroups = new Map();
    
    items.forEach(item => {
      if (!item.akun) return;
      
      // Extract account group from akun code (first digit)
      const akunCode = item.akun.split(' ')[0];
      const accountGroup = akunCode.substring(0, 1);
      
      if (!accountGroups.has(accountGroup)) {
        accountGroups.set(accountGroup, {
          accountGroup: accountGroup,
          accountGroupName: `Belanja ${accountGroup}000000`,  // Default name
          totalSemula: 0,
          totalMenjadi: 0,
          totalSelisih: 0,
          changedItems: 0,
          newItems: 0,
          items: []
        });
      }
      
      const group = accountGroups.get(accountGroup);
      group.totalSemula += item.jumlahSemula;
      group.totalMenjadi += item.jumlahMenjadi;
      group.totalSelisih += (item.jumlahMenjadi - item.jumlahSemula);
      
      if (item.status === 'changed') group.changedItems++;
      if (item.status === 'new') group.newItems++;
      
      group.items.push(item);
    });
    
    accountGroupData = Array.from(accountGroups.values());
  }
  
  // Sort by account group code
  accountGroupData.sort((a, b) => {
    const codeA = a.accountGroup || a.account_group || '';
    const codeB = b.accountGroup || b.account_group || '';
    return codeA.localeCompare(codeB);
  });
  
  const sheetData = [
    ['REKAP PERUBAHAN ANGGARAN BERDASARKAN KELOMPOK BELANJA', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Kelompok Belanja', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Berubah', 'Item Baru', 'Total Item']
  ];
  
  accountGroupData.forEach(group => {
    sheetData.push([
      `${group.accountGroup || group.account_group} - ${group.accountGroupName || group.account_group_name || ''}`,
      formatCurrency(roundToThousands(group.totalSemula || group.total_semula || 0)),
      formatCurrency(roundToThousands(group.totalMenjadi || group.total_menjadi || 0)),
      formatCurrency(roundToThousands(group.totalSelisih || group.total_selisih || 0)),
      group.changedItems || group.changed_items || 0,
      group.newItems || group.new_items || 0,
      group.items?.length || group.total_items || 0
    ]);
  });
  
  // Calculate totals
  const totalSemula = accountGroupData.reduce((sum, g) => sum + (g.totalSemula || g.total_semula || 0), 0);
  const totalMenjadi = accountGroupData.reduce((sum, g) => sum + (g.totalMenjadi || g.total_menjadi || 0), 0);
  const totalSelisih = accountGroupData.reduce((sum, g) => sum + (g.totalSelisih || g.total_selisih || 0), 0);
  const totalChangedItems = accountGroupData.reduce((sum, g) => sum + (g.changedItems || g.changed_items || 0), 0);
  const totalNewItems = accountGroupData.reduce((sum, g) => sum + (g.newItems || g.new_items || 0), 0);
  const totalItems = accountGroupData.reduce((sum, g) => sum + (g.items?.length || g.total_items || 0), 0);
  
  sheetData.push(
    ['TOTAL', 
     formatCurrency(roundToThousands(totalSemula)), 
     formatCurrency(roundToThousands(totalMenjadi)), 
     formatCurrency(roundToThousands(totalSelisih)),
     totalChangedItems,
     totalNewItems,
     totalItems
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  ws['!cols'] = [
    { width: 40 },  // Kelompok Belanja
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Berubah
    { width: 15 },  // Item Baru
    { width: 15 },  // Total Item
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Kelompok Belanja");
};

// Function to add RPD sheet
const addRPDSheet = (wb: XLSX.WorkBook, rpdItems: RPDItem[]) => {
  const sheetData = [
    ['RENCANA PENARIKAN DANA', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [
      'No', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah Pagu',
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
      'Total RPD', 'Selisih', 'Status'
    ]
  ];
  
  // Add data rows
  rpdItems.forEach((item, index) => {
    sheetData.push([
      index + 1,
      item.uraian,
      item.volume_menjadi,
      item.satuan_menjadi,
      item.harga_satuan_menjadi,
      item.jumlah_menjadi,
      item.januari || 0,
      item.februari || 0,
      item.maret || 0,
      item.april || 0,
      item.mei || 0,
      item.juni || 0,
      item.juli || 0,
      item.agustus || 0,
      item.september || 0,
      item.oktober || 0,
      item.november || 0,
      item.desember || 0,
      item.jumlah_rpd || 0,
      item.selisih || 0,
      item.status
    ]);
  });
  
  // Calculate totals
  const totalPagu = rpdItems.reduce((sum, item) => sum + (item.jumlah_menjadi || 0), 0);
  const totalJan = rpdItems.reduce((sum, item) => sum + (item.januari || 0), 0);
  const totalFeb = rpdItems.reduce((sum, item) => sum + (item.februari || 0), 0);
  const totalMar = rpdItems.reduce((sum, item) => sum + (item.maret || 0), 0);
  const totalApr = rpdItems.reduce((sum, item) => sum + (item.april || 0), 0);
  const totalMei = rpdItems.reduce((sum, item) => sum + (item.mei || 0), 0);
  const totalJun = rpdItems.reduce((sum, item) => sum + (item.juni || 0), 0);
  const totalJul = rpdItems.reduce((sum, item) => sum + (item.juli || 0), 0);
  const totalAgu = rpdItems.reduce((sum, item) => sum + (item.agustus || 0), 0);
  const totalSep = rpdItems.reduce((sum, item) => sum + (item.september || 0), 0);
  const totalOkt = rpdItems.reduce((sum, item) => sum + (item.oktober || 0), 0);
  const totalNov = rpdItems.reduce((sum, item) => sum + (item.november || 0), 0);
  const totalDes = rpdItems.reduce((sum, item) => sum + (item.desember || 0), 0);
  const totalRPD = rpdItems.reduce((sum, item) => sum + (item.jumlah_rpd || 0), 0);
  const totalSelisih = rpdItems.reduce((sum, item) => sum + (item.selisih || 0), 0);
  
  sheetData.push([
    '', 'TOTAL', '', '', '', 
    formatCurrency(roundToThousands(totalPagu)),
    formatCurrency(roundToThousands(totalJan)),
    formatCurrency(roundToThousands(totalFeb)),
    formatCurrency(roundToThousands(totalMar)),
    formatCurrency(roundToThousands(totalApr)),
    formatCurrency(roundToThousands(totalMei)),
    formatCurrency(roundToThousands(totalJun)),
    formatCurrency(roundToThousands(totalJul)),
    formatCurrency(roundToThousands(totalAgu)),
    formatCurrency(roundToThousands(totalSep)),
    formatCurrency(roundToThousands(totalOkt)),
    formatCurrency(roundToThousands(totalNov)),
    formatCurrency(roundToThousands(totalDes)),
    formatCurrency(roundToThousands(totalRPD)),
    formatCurrency(roundToThousands(totalSelisih)),
    ''
  ]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 5 },   // No
    { width: 40 },  // Uraian
    { width: 10 },  // Volume
    { width: 10 },  // Satuan
    { width: 15 },  // Harga Satuan
    { width: 15 },  // Jumlah Pagu
    { width: 12 },  // Jan
    { width: 12 },  // Feb
    { width: 12 },  // Mar
    { width: 12 },  // Apr
    { width: 12 },  // Mei
    { width: 12 },  // Jun
    { width: 12 },  // Jul
    { width: 12 },  // Agu
    { width: 12 },  // Sep
    { width: 12 },  // Okt
    { width: 12 },  // Nov
    { width: 12 },  // Des
    { width: 15 },  // Total RPD
    { width: 15 },  // Selisih
    { width: 15 },  // Status
  ];
  
  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 20 } } // Title
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Rencana Penarikan Dana");
};

// Function to add Full Data sheet
const addFullDataSheet = (wb: XLSX.WorkBook, items: BudgetItem[]) => {
  const data = items.map((item, index) => ({
    'No': index + 1,
    'Program Pembebanan': item.programPembebanan || '-',
    'Kegiatan': item.kegiatan || '-',
    'Rincian Output': item.rincianOutput || '-',
    'Komponen Output': item.komponenOutput || '-',
    'Sub Komponen': item.subKomponen || '-',
    'Akun': item.akun || '-',
    'Uraian': item.uraian,
    'Volume Semula': item.volumeSemula,
    'Satuan Semula': item.satuanSemula,
    'Harga Satuan Semula': item.hargaSatuanSemula,
    'Jumlah Semula': item.jumlahSemula,
    'Volume Menjadi': item.volumeMenjadi,
    'Satuan Menjadi': item.satuanMenjadi,
    'Harga Satuan Menjadi': item.hargaSatuanMenjadi,
    'Jumlah Menjadi': item.jumlahMenjadi,
    'Selisih': item.jumlahMenjadi - item.jumlahSemula,
    'Status': item.status
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 5 },   // No
    { width: 20 },  // Program Pembebanan
    { width: 20 },  // Kegiatan
    { width: 20 },  // Rincian Output
    { width: 20 },  // Komponen Output
    { width: 20 },  // Sub Komponen
    { width: 20 },  // Akun
    { width: 40 },  // Uraian
    { width: 12 },  // Volume Semula
    { width: 12 },  // Satuan Semula
    { width: 15 },  // Harga Satuan Semula
    { width: 15 },  // Jumlah Semula
    { width: 12 },  // Volume Menjadi
    { width: 12 },  // Satuan Menjadi
    { width: 15 },  // Harga Satuan Menjadi
    { width: 15 },  // Jumlah Menjadi
    { width: 15 },  // Selisih
    { width: 15 },  // Status
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Data Lengkap");
};

export const exportToMultiSheetExcel = async (
  budgetItems: BudgetItem[],
  rpdItems?: RPDItem[],
  summaries?: any,
  filters?: FilterSelection,
  fileName = 'rekap-anggaran'
) => {
  try {
    // Ensure filters has the required properties
    const safeFilters: FilterSelection = filters || {
      programPembebanan: 'all',
      kegiatan: 'all',
      rincianOutput: 'all',
      komponenOutput: 'all',
      subKomponen: 'all',
      akun: 'all'
    };
    
    const wb = await createMultiSheetWorkbook(budgetItems, rpdItems, summaries, safeFilters);
    
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};
