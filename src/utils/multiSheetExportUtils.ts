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

// ... rest of the code remains unchanged
