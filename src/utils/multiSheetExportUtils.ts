
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
  // Group items by program pembebanan
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    const key = item.programPembebanan || 'Tidak Ada';
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Program Pembebanan', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([program, programItems]) => {
    const totalSemula = roundToThousands(programItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(programItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      program,
      programItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 },  // Program Pembebanan
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Program Pembebanan");
};

// Function to add Kegiatan sheet
const addKegiatanSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Group items by kegiatan
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    const key = item.kegiatan || 'Tidak Ada';
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Kegiatan', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([kegiatan, kegiatanItems]) => {
    const totalSemula = roundToThousands(kegiatanItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(kegiatanItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      kegiatan,
      kegiatanItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 },  // Kegiatan
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Kegiatan");
};

// Function to add Rincian Output sheet
const addRincianOutputSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Group items by rincian output
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    const key = item.rincianOutput || 'Tidak Ada';
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Rincian Output', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([rincian, rincianItems]) => {
    const totalSemula = roundToThousands(rincianItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(rincianItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      rincian,
      rincianItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 },  // Rincian Output
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Rincian Output");
};

// Function to add Komponen Output sheet
const addKomponenOutputSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Group items by komponen output
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    const key = item.komponenOutput || 'Tidak Ada';
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Komponen Output', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([komponen, komponenItems]) => {
    const totalSemula = roundToThousands(komponenItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(komponenItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      komponen,
      komponenItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 },  // Komponen Output
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Komponen Output");
};

// Function to add Sub Komponen sheet
const addSubKomponenSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Group items by sub komponen
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    const key = item.subKomponen || 'Tidak Ada';
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Sub Komponen', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([subKomponen, subKomponenItems]) => {
    const totalSemula = roundToThousands(subKomponenItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(subKomponenItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      subKomponen,
      subKomponenItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 },  // Sub Komponen
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Sub Komponen");
};

// Function to add Akun sheet
const addAkunSheet = (wb: XLSX.WorkBook, items: BudgetItem[], filters: FilterSelection) => {
  // Group items by akun
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    const key = item.akun || 'Tidak Ada';
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Akun', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([akun, akunItems]) => {
    const totalSemula = roundToThousands(akunItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(akunItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      akun,
      akunItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 },  // Akun
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Akun");
};

// Function to add Akun Group sheet (for mapping akun to their groups)
const addAkunGroupSheet = (wb: XLSX.WorkBook, items: BudgetItem[], summaries: any) => {
  // This would typically use the account groups data from the database
  // For now, implement a simple version
  const akunGroups = {
    '52': 'Belanja Pegawai',
    '52110': 'Belanja Gaji dan Tunjangan',
    '52120': 'Belanja Honorarium',
    '52210': 'Belanja Barang Operasional',
    '52220': 'Belanja Jasa',
    '52230': 'Belanja Pemeliharaan',
    '52240': 'Belanja Perjalanan Dinas',
    '52250': 'Belanja Barang Non Operasional'
  };
  
  // Group items by akun
  const groupedItems: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    if (!item.akun) return;
    
    const key = item.akun;
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [['Akun', 'Kelompok Akun', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih']];
  
  Object.entries(groupedItems).forEach(([akun, akunItems]) => {
    // Get akun group based on the first 2-5 digits
    const akunGroup = Object.entries(akunGroups).find(([groupCode]) => akun.startsWith(groupCode));
    const groupName = akunGroup ? akunGroup[1] : 'Lainnya';
    
    const totalSemula = roundToThousands(akunItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(akunItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    data.push([
      akun,
      groupName,
      akunItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih)
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  data.push([
    'TOTAL',
    '',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih)
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 15 },  // Akun
    { width: 30 },  // Kelompok Akun
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Kelompok Akun");
};

// Function to add Account Group sheet (summary by account group)
const addAccountGroupSheet = (wb: XLSX.WorkBook, items: BudgetItem[], summaries: any) => {
  const akunGroups = {
    '52': 'Belanja Pegawai',
    '52110': 'Belanja Gaji dan Tunjangan',
    '52120': 'Belanja Honorarium',
    '52210': 'Belanja Barang Operasional',
    '52220': 'Belanja Jasa',
    '52230': 'Belanja Pemeliharaan',
    '52240': 'Belanja Perjalanan Dinas',
    '52250': 'Belanja Barang Non Operasional'
  };
  
  // Group items by account group
  const groupedByAccountGroup: Record<string, BudgetItem[]> = {};
  
  items.forEach(item => {
    if (!item.akun) return;
    
    let groupKey = 'Lainnya';
    let groupName = 'Lainnya';
    
    // Find matching group
    for (const [groupCode, name] of Object.entries(akunGroups)) {
      if (item.akun.startsWith(groupCode)) {
        groupKey = groupCode;
        groupName = name;
        break;
      }
    }
    
    if (!groupedByAccountGroup[groupKey]) {
      groupedByAccountGroup[groupKey] = [];
    }
    
    groupedByAccountGroup[groupKey].push(item);
  });
  
  // Create data for the sheet
  const data: any[][] = [
    ['Kode Kelompok', 'Kelompok Akun', 'Jumlah Item', 'Total Semula', 'Total Menjadi', 'Selisih', 'Item Baru', 'Item Berubah']
  ];
  
  Object.entries(groupedByAccountGroup).forEach(([groupCode, groupItems]) => {
    const groupName = akunGroups[groupCode as keyof typeof akunGroups] || 'Lainnya';
    
    const totalSemula = roundToThousands(groupItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
    const totalMenjadi = roundToThousands(groupItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
    const selisih = totalMenjadi - totalSemula;
    
    const newItems = groupItems.filter(item => item.status === 'new').length;
    const changedItems = groupItems.filter(item => item.status === 'changed').length;
    
    data.push([
      groupCode,
      groupName,
      groupItems.length,
      formatCurrency(totalSemula),
      formatCurrency(totalMenjadi),
      formatCurrency(selisih),
      newItems,
      changedItems
    ]);
  });
  
  // Calculate grand total
  const grandTotalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const grandTotalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;
  
  const totalNewItems = items.filter(item => item.status === 'new').length;
  const totalChangedItems = items.filter(item => item.status === 'changed').length;
  
  data.push([
    'TOTAL',
    '',
    items.length,
    formatCurrency(grandTotalSemula),
    formatCurrency(grandTotalMenjadi),
    formatCurrency(grandTotalSelisih),
    totalNewItems,
    totalChangedItems
  ]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { width: 15 },  // Kode Kelompok
    { width: 30 },  // Kelompok Akun
    { width: 15 },  // Jumlah Item
    { width: 20 },  // Total Semula
    { width: 20 },  // Total Menjadi
    { width: 20 },  // Selisih
    { width: 15 },  // Item Baru
    { width: 15 },  // Item Berubah
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Ringkasan Kelompok");
};

// Function to add RPD sheet for Rencana Penarikan Dana data
const addRPDSheet = (wb: XLSX.WorkBook, rpdItems: RPDItem[]) => {
  // Create headers
  const headers = [
    'Budget Item ID',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
    'Total'
  ];
  
  // Prepare data
  const data = rpdItems.map(item => {
    const total = roundToThousands(
      item.januari +
      item.februari +
      item.maret +
      item.april +
      item.mei +
      item.juni +
      item.juli +
      item.agustus +
      item.september +
      item.oktober +
      item.november +
      item.desember
    );
    
    return [
      item.id, // Changed from budget_item_id to id as per the RPDItem type
      formatCurrency(item.januari),
      formatCurrency(item.februari),
      formatCurrency(item.maret),
      formatCurrency(item.april),
      formatCurrency(item.mei),
      formatCurrency(item.juni),
      formatCurrency(item.juli),
      formatCurrency(item.agustus),
      formatCurrency(item.september),
      formatCurrency(item.oktober),
      formatCurrency(item.november),
      formatCurrency(item.desember),
      formatCurrency(total)
    ];
  });
  
  // Calculate totals
  const totalJanuari = roundToThousands(rpdItems.reduce((sum, item) => sum + item.januari, 0));
  const totalFebruari = roundToThousands(rpdItems.reduce((sum, item) => sum + item.februari, 0));
  const totalMaret = roundToThousands(rpdItems.reduce((sum, item) => sum + item.maret, 0));
  const totalApril = roundToThousands(rpdItems.reduce((sum, item) => sum + item.april, 0));
  const totalMei = roundToThousands(rpdItems.reduce((sum, item) => sum + item.mei, 0));
  const totalJuni = roundToThousands(rpdItems.reduce((sum, item) => sum + item.juni, 0));
  const totalJuli = roundToThousands(rpdItems.reduce((sum, item) => sum + item.juli, 0));
  const totalAgustus = roundToThousands(rpdItems.reduce((sum, item) => sum + item.agustus, 0));
  const totalSeptember = roundToThousands(rpdItems.reduce((sum, item) => sum + item.september, 0));
  const totalOktober = roundToThousands(rpdItems.reduce((sum, item) => sum + item.oktober, 0));
  const totalNovember = roundToThousands(rpdItems.reduce((sum, item) => sum + item.november, 0));
  const totalDesember = roundToThousands(rpdItems.reduce((sum, item) => sum + item.desember, 0));
  
  const grandTotal = roundToThousands(
    totalJanuari +
    totalFebruari +
    totalMaret +
    totalApril +
    totalMei +
    totalJuni +
    totalJuli +
    totalAgustus +
    totalSeptember +
    totalOktober +
    totalNovember +
    totalDesember
  );
  
  // Add total row
  data.push([
    'TOTAL',
    formatCurrency(totalJanuari),
    formatCurrency(totalFebruari),
    formatCurrency(totalMaret),
    formatCurrency(totalApril),
    formatCurrency(totalMei),
    formatCurrency(totalJuni),
    formatCurrency(totalJuli),
    formatCurrency(totalAgustus),
    formatCurrency(totalSeptember),
    formatCurrency(totalOktober),
    formatCurrency(totalNovember),
    formatCurrency(totalDesember),
    formatCurrency(grandTotal)
  ]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  const colWidths = Array(14).fill({ width: 15 });
  colWidths[0] = { width: 36 }; // Budget Item ID column wider
  
  ws['!cols'] = colWidths;
  
  // Add to workbook
  XLSX.utils.book_append_sheet(wb, ws, "RPD Data");
};

// Function to add full data sheet
const addFullDataSheet = (wb: XLSX.WorkBook, items: BudgetItem[]) => {
  // Create headers
  const headers = [
    'ID',
    'Program Pembebanan',
    'Kegiatan',
    'Rincian Output',
    'Komponen Output',
    'Sub Komponen',
    'Akun',
    'Uraian',
    'Volume Semula',
    'Satuan Semula',
    'Harga Satuan Semula',
    'Jumlah Semula',
    'Volume Menjadi',
    'Satuan Menjadi',
    'Harga Satuan Menjadi',
    'Jumlah Menjadi',
    'Selisih',
    'Status'
  ];
  
  // Prepare data
  const data = items.map(item => [
    item.id,
    item.programPembebanan || '',
    item.kegiatan || '',
    item.rincianOutput || '',
    item.komponenOutput || '',
    item.subKomponen || '',
    item.akun || '',
    item.uraian || '',
    item.volumeSemula,
    item.satuanSemula || '',
    formatCurrency(item.hargaSatuanSemula),
    formatCurrency(item.jumlahSemula),
    item.volumeMenjadi,
    item.satuanMenjadi || '',
    formatCurrency(item.hargaSatuanMenjadi),
    formatCurrency(item.jumlahMenjadi),
    formatCurrency(item.jumlahMenjadi - item.jumlahSemula),
    item.status
  ]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  ws['!cols'] = [
    { width: 36 },  // ID
    { width: 20 },  // Program Pembebanan
    { width: 20 },  // Kegiatan
    { width: 20 },  // Rincian Output
    { width: 20 },  // Komponen Output
    { width: 20 },  // Sub Komponen
    { width: 15 },  // Akun
    { width: 40 },  // Uraian
    { width: 15 },  // Volume Semula
    { width: 15 },  // Satuan Semula
    { width: 18 },  // Harga Satuan Semula
    { width: 18 },  // Jumlah Semula
    { width: 15 },  // Volume Menjadi
    { width: 15 },  // Satuan Menjadi
    { width: 18 },  // Harga Satuan Menjadi
    { width: 18 },  // Jumlah Menjadi
    { width: 18 },  // Selisih
    { width: 15 },  // Status
  ];
  
  // Add to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Data Lengkap");
};

// Function to export to multi-sheet Excel file
export const exportToMultiSheetExcel = async (
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
    const wb = await createMultiSheetWorkbook(budgetItems, rpdItems, summaries, filters);
    XLSX.writeFile(wb, "Laporan_Anggaran_Lengkap.xlsx");
    return true;
  } catch (error) {
    console.error("Error exporting to multi-sheet Excel:", error);
    return false;
  }
};

