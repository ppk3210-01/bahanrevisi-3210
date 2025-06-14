import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

// Helper function to normalize column names for matching
export const normalizeColumnName = (name: string): string => {
  if (!name) return '';
  return name.toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
    .trim();
};

// Expected column names and their variations
export const expectedColumns = {
  uraian: ["uraian", "keterangan", "item", "description"],
  volumeSemula: ["volumesemula", "volume semula", "volume awal", "jumlah semula", "volume1"],
  satuanSemula: ["satuansemula", "satuan semula", "satuan awal", "unit semula", "satuan1"],
  hargaSatuanSemula: ["hargasatuansemula", "harga satuan semula", "harga semula", "harga awal", "price semula", "hargasatuan1", "hargasemula"],
  volumeMenjadi: ["volumemenjadi", "volume menjadi", "volume akhir", "jumlah menjadi", "volume2"],
  satuanMenjadi: ["satuanmenjadi", "satuan menjadi", "satuan akhir", "unit menjadi", "satuan2"],
  hargaSatuanMenjadi: ["hargasatuanmenjadi", "harga satuan menjadi", "harga menjadi", "harga akhir", "price menjadi", "hargasatuan2", "hargamenjadi"],
  sisaAnggaran: ["sisaanggaran", "sisa anggaran", "budget tersisa", "anggaran tersisa", "remaining budget", "sisa budget"],
  programPembebanan: ["programpembebanan", "program pembebanan", "program"],
  kegiatan: ["kegiatan", "activity"],
  rincianOutput: ["rincianoutput", "rincian output", "output", "detail output"],
  komponenOutput: ["komponenoutput", "komponen output", "component", "komponen"],
  subKomponen: ["subkomponen", "sub komponen", "subcomponent", "subcomp"],
  akun: ["akun", "account"]
};

// Create a template workbook for export
export const createTemplateWorkbook = (komponenOutput?: string, subKomponen?: string, akun?: string) => {
  const wb = XLSX.utils.book_new();
  
  const headers = [
    "Program Pembebanan", 
    "Kegiatan", 
    "Rincian Output", 
    "Komponen Output", 
    "Sub Komponen", 
    "Akun", 
    "Uraian", 
    "Volume Semula", 
    "Satuan Semula", 
    "Harga Satuan Semula", 
    "Volume Menjadi", 
    "Satuan Menjadi", 
    "Harga Satuan Menjadi",
    "Sisa Anggaran"
  ];
  
  const data = [headers, [
    "Program Pembebanan Contoh",
    "Kegiatan Contoh",
    "Rincian Output Contoh",
    komponenOutput || "Komponen Output Contoh",
    subKomponen || "Sub Komponen Contoh",
    akun || "Akun Contoh",
    "Contoh item anggaran", 
    1, 
    "Paket", 
    1000000, 
    1, 
    "Paket", 
    1200000,
    500000
  ]];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = [
    { width: 25 },  // Program Pembebanan
    { width: 25 },  // Kegiatan
    { width: 25 },  // Rincian Output
    { width: 25 },  // Komponen Output
    { width: 25 },  // Sub Komponen
    { width: 25 },  // Akun
    { width: 40 },  // Uraian
    { width: 12 },  // Volume Semula
    { width: 15 },  // Satuan Semula
    { width: 20 },  // Harga Satuan Semula
    { width: 12 },  // Volume Menjadi
    { width: 15 },  // Satuan Menjadi
    { width: 20 },  // Harga Satuan Menjadi
    { width: 20 },  // Sisa Anggaran
  ];
  
  ws["!cols"] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  
  return wb;
};

// Find the header row in an Excel file
export const findHeaderRow = (rows: any[]): { headerRowIndex: number, headerRowMatches: number } => {
  let headerRowIndex = -1;
  let headerRowMatches = 0;
  let bestHeaderMatches = 0;
  
  // Check each of the first several rows to find the one with most column matches
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;
    
    let matches = 0;
    for (let j = 0; j < row.length; j++) {
      const cellValue = row[j];
      if (!cellValue || typeof cellValue !== 'string') continue;
      
      const normalizedCell = normalizeColumnName(cellValue);
      
      // Check if this cell matches any of our expected column names
      for (const [key, variations] of Object.entries(expectedColumns)) {
        if (variations.some(v => normalizedCell.includes(normalizeColumnName(v)))) {
          matches++;
          break;
        }
      }
    }
    
    if (matches > bestHeaderMatches) {
      bestHeaderMatches = matches;
      headerRowIndex = i;
      headerRowMatches = matches;
    }
  }
  
  console.log("Header row found at index:", headerRowIndex, "with", headerRowMatches, "matches");
  
  return { headerRowIndex, headerRowMatches };
};

// Map column indices to expected columns
export const mapColumnIndices = (headerRow: any[]): { 
  columnIndices: Record<string, number>, 
  missingRequiredColumns: string[] 
} => {
  const columnIndices: Record<string, number> = {};
  const missingRequiredColumns: string[] = [];
  
  const requiredColumns = [
    'uraian', 
    'volumeSemula', 
    'satuanSemula', 
    'hargaSatuanSemula', 
    'volumeMenjadi', 
    'satuanMenjadi', 
    'hargaSatuanMenjadi'
  ];
  
  console.log("Header row contents:", headerRow);
  
  // Match header cells to expected columns with a more exact matching algorithm
  headerRow.forEach((header: any, index: number) => {
    if (!header) return;
    
    const normalizedHeader = normalizeColumnName(header);
    let matched = false;
    let bestMatch = '';
    let bestMatchScore = 0;
    
    // First try direct equality matches
    for (const [key, variations] of Object.entries(expectedColumns)) {
      for (const variation of variations) {
        const normalizedVariation = normalizeColumnName(variation);
        
        if (normalizedHeader === normalizedVariation) {
          columnIndices[key] = index;
          matched = true;
          console.log(`Exact match: column "${header}" at index ${index} to "${key}"`);
          break;
        }
        
        // Calculate similarity score (simple contains check)
        if (normalizedHeader.includes(normalizedVariation) || 
            normalizedVariation.includes(normalizedHeader)) {
          const score = normalizedVariation.length;
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = key;
          }
        }
      }
      if (matched) break;
    }
    
    // If no exact match, use the best partial match
    if (!matched && bestMatch && !columnIndices[bestMatch]) {
      columnIndices[bestMatch] = index;
      console.log(`Partial match: column "${header}" at index ${index} to "${bestMatch}"`);
    }
    
    if (!matched && !bestMatch) {
      console.log(`Could not match column "${header}" at index ${index}`);
    }
  });
  
  // Special handling for important columns that might have been missed
  const specialColumns = [
    { key: 'hargaSatuanSemula', patterns: ['harga', 'semula'] },
    { key: 'hargaSatuanMenjadi', patterns: ['harga', 'menjadi'] },
    { key: 'sisaAnggaran', patterns: ['sisa', 'anggaran'] }
  ];
  
  headerRow.forEach((header: any, index: number) => {
    if (!header) return;
    const normalizedHeader = normalizeColumnName(header);
    
    specialColumns.forEach(specialCol => {
      if (!columnIndices[specialCol.key] && 
          specialCol.patterns.every(pattern => normalizedHeader.includes(normalizeColumnName(pattern)))) {
        columnIndices[specialCol.key] = index;
        console.log(`Special match: column "${header}" at index ${index} to "${specialCol.key}"`);
      }
    });
  });
  
  console.log("Mapped column indices:", columnIndices);
  
  // Check for missing required columns
  requiredColumns.forEach(col => {
    if (typeof columnIndices[col] === 'undefined') {
      missingRequiredColumns.push(col);
    }
  });
  
  return { columnIndices, missingRequiredColumns };
};

// Process data rows into budget items
export const processDataRows = (
  rows: any[], 
  headerRowIndex: number, 
  columnIndices: Record<string, number>,
  komponenOutput?: string,
  subKomponen?: string,
  akun?: string
): Partial<BudgetItem>[] => {
  return rows.slice(headerRowIndex + 1)
    .filter(row => {
      if (!row || row.length < Math.max(...Object.values(columnIndices))) return false;
      // Ensure uraian exists and is not empty
      return row[columnIndices.uraian] && String(row[columnIndices.uraian]).trim() !== '';
    })
    .map(row => {
      const item: Partial<BudgetItem> = {
        uraian: String(row[columnIndices.uraian] || ''),
        volumeSemula: parseFloat(row[columnIndices.volumeSemula]) || 0,
        satuanSemula: String(row[columnIndices.satuanSemula] || 'Paket'),
        hargaSatuanSemula: parseFloat(row[columnIndices.hargaSatuanSemula]) || 0,
        volumeMenjadi: parseFloat(row[columnIndices.volumeMenjadi]) || 0,
        satuanMenjadi: String(row[columnIndices.satuanMenjadi] || 'Paket'),
        hargaSatuanMenjadi: parseFloat(row[columnIndices.hargaSatuanMenjadi]) || 0
      };
      
      // Add sisa anggaran if available
      if ('sisaAnggaran' in columnIndices && row[columnIndices.sisaAnggaran] !== undefined) {
        const sisaValue = parseFloat(row[columnIndices.sisaAnggaran]);
        if (!isNaN(sisaValue)) {
          item.sisaAnggaran = sisaValue;
        }
      }
      
      // Add optional fields if they exist in the file
      if ('programPembebanan' in columnIndices) 
        item.programPembebanan = String(row[columnIndices.programPembebanan] || '');
      
      if ('kegiatan' in columnIndices) 
        item.kegiatan = String(row[columnIndices.kegiatan] || '');
      
      if ('rincianOutput' in columnIndices) 
        item.rincianOutput = String(row[columnIndices.rincianOutput] || '');
      
      if ('komponenOutput' in columnIndices) 
        item.komponenOutput = String(row[columnIndices.komponenOutput] || '') || komponenOutput || '';
      
      if ('subKomponen' in columnIndices) 
        item.subKomponen = String(row[columnIndices.subKomponen] || '') || subKomponen || '';
      
      if ('akun' in columnIndices) 
        item.akun = String(row[columnIndices.akun] || '') || akun || '';
      
      return item;
    });
};

// Get friendly names for missing columns
export const getFriendlyColumnNames = (missingColumns: string[]): string => {
  const friendlyNames: Record<string, string> = {
    uraian: "Uraian",
    volumeSemula: "Volume Semula", 
    satuanSemula: "Satuan Semula",
    hargaSatuanSemula: "Harga Satuan Semula",
    volumeMenjadi: "Volume Menjadi",
    satuanMenjadi: "Satuan Menjadi",
    hargaSatuanMenjadi: "Harga Satuan Menjadi",
    sisaAnggaran: "Sisa Anggaran"
  };
  
  return missingColumns
    .map(col => friendlyNames[col] || col)
    .join(', ');
};

// ENHANCED EXCEL EXPORT FUNCTIONS

// Apply common worksheet styling
export const applyWorksheetStyling = (worksheet: XLSX.WorkSheet): void => {
  // Set default column widths if not already set
  if (!worksheet['!cols']) {
    worksheet['!cols'] = Array(20).fill({ wch: 15 });
  }
  
  // Freeze the top row (header)
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomRight' };
};

// Format cell for currency
export const applyCurrencyFormat = (worksheet: XLSX.WorkSheet, cellRef: string): void => {
  if (worksheet[cellRef]) {
    worksheet[cellRef].z = '#,##0';
  }
};

// Apply standard header style to a worksheet
export const applyHeaderStyle = (worksheet: XLSX.WorkSheet): void => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Apply styling to the header row
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[cellRef]) continue;
    
    // Set bold font for header
    if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
    worksheet[cellRef].s = { 
      font: { bold: true },
      fill: { fgColor: { rgb: "E6E6E6" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };
  }
};

// Get combined Pembebanan code
export const getCombinedPembebananCode = (item: BudgetItem): string => {
  const program = item.programPembebanan || '';
  const komponen = item.komponenOutput || '';
  const subKomponen = item.subKomponen || '';
  const akun = item.akun || '';
  
  if (program && komponen && subKomponen && akun) {
    return `${program}.${komponen}.${subKomponen}.A.${akun}`;
  }
  
  return program || '-';
};

// Create comprehensive Excel export with multiple sheets
export const createCompleteExcelExport = (
  items: BudgetItem[], 
  summaryData: BudgetSummaryRecord[] = []
): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();
  
  // Create budget items sheet (Data Tabel Anggaran)
  const itemsSheet = createItemsSheet(items);
  XLSX.utils.book_append_sheet(workbook, itemsSheet, "Data Tabel Anggaran");
  
  // Create summary sheet (Kesimpulan)
  const summarySheet = createSummarySheet(items);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Kesimpulan");
  
  // Create changed items sheet (Pagu Anggaran Berubah)
  const changedItemsSheet = createChangedItemsSheet(items);
  XLSX.utils.book_append_sheet(workbook, changedItemsSheet, "Pagu Anggaran Berubah");
  
  // Create new items sheet (Pagu Anggaran Baru)
  const newItemsSheet = createNewItemsSheet(items);
  XLSX.utils.book_append_sheet(workbook, newItemsSheet, "Pagu Anggaran Baru");
  
  // Create program_pembebanan summary sheet
  const programItems = summaryData.filter(item => 'program_pembebanan' in item);
  if (programItems.length > 0) {
    const programSheet = createGroupSummarySheet(programItems, 'Program Pembebanan');
    XLSX.utils.book_append_sheet(workbook, programSheet, "Ringkasan Program");
  }
  
  // Create kegiatan summary sheet
  const kegiatanItems = summaryData.filter(item => 'kegiatan' in item);
  if (kegiatanItems.length > 0) {
    const kegiatanSheet = createGroupSummarySheet(kegiatanItems, 'Kegiatan');
    XLSX.utils.book_append_sheet(workbook, kegiatanSheet, "Ringkasan Kegiatan");
  }
  
  // Create rincian_output summary sheet
  const rincianItems = summaryData.filter(item => 'rincian_output' in item);
  if (rincianItems.length > 0) {
    const rincianSheet = createGroupSummarySheet(rincianItems, 'Rincian Output');
    XLSX.utils.book_append_sheet(workbook, rincianSheet, "Ringkasan Rincian Output");
  }
  
  // Create komponen summary sheet
  const komponentItems = summaryData.filter(item => 'komponen_output' in item);
  if (komponentItems.length > 0) {
    const komponenSheet = createGroupSummarySheet(komponentItems, 'Komponen Output');
    XLSX.utils.book_append_sheet(workbook, komponenSheet, "Ringkasan Komponen Output");
  }
  
  // Create sub_komponen summary sheet
  const subKomponenItems = summaryData.filter(item => 'sub_komponen' in item);
  if (subKomponenItems.length > 0) {
    const subKomponenSheet = createGroupSummarySheet(subKomponenItems, 'Sub Komponen');
    XLSX.utils.book_append_sheet(workbook, subKomponenSheet, "Ringkasan Sub Komponen");
  }
  
  // Create akun summary sheet
  const akunItems = summaryData.filter(item => 'akun' in item);
  if (akunItems.length > 0) {
    const akunSheet = createGroupSummarySheet(akunItems, 'Akun');
    XLSX.utils.book_append_sheet(workbook, akunSheet, "Ringkasan Akun");
  }
  
  // Create account group summary sheet
  const accountGroupItems = summaryData.filter(item => 'account_group' in item);
  if (accountGroupItems.length > 0) {
    const accountGroupSheet = createGroupSummarySheet(accountGroupItems, 'Kelompok Akun');
    XLSX.utils.book_append_sheet(workbook, accountGroupSheet, "Ringkasan Kelompok Akun");
  }
  
  return workbook;
};

// Create a sheet with overall summary
export const createSummarySheet = (items: BudgetItem[]) => {
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  const newItems = items.filter(item => item.status === 'new').length;
  const changedItems = items.filter(item => item.status === 'changed').length;
  const deletedItems = items.filter(item => item.status === 'deleted').length;
  
  const selisihDescription = totalSelisih > 0 ? "Bertambah" : totalSelisih < 0 ? "Berkurang" : "Tetap";
  
  const data = [
    ["Ringkasan Perubahan Pagu Anggaran", "", ""],
    ["", "", ""],
    ["Total Pagu Semula", roundToThousands(totalSemula), ""],
    ["Total Pagu Menjadi", roundToThousands(totalMenjadi), ""],
    ["Selisih", roundToThousands(totalSelisih), selisihDescription],
    ["", "", ""],
    ["Kesimpulan", "", ""],
    [`Total Pagu anggaran semula sebesar ${formatCurrency(roundToThousands(totalSemula))} berubah menjadi ${formatCurrency(roundToThousands(totalMenjadi))}, dengan selisih sebesar ${formatCurrency(roundToThousands(totalSelisih))}.`, "", ""],
    [`Terdapat ${changedItems} detil anggaran yang diubah, ${newItems} detil anggaran baru, dan ${deletedItems} detil anggaran yang dihapus.`, "", ""],
    ["Perubahan ini diperlukan untuk mengoptimalkan alokasi anggaran sesuai dengan prioritas program dan kegiatan.", "", ""],
    ["", "", ""],
    ["Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.", "", ""],
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 50 },  // Column A width
    { wch: 20 },  // Column B width
    { wch: 15 },  // Column C width
  ];
  
  // Apply currency formatting
  ["B3", "B4", "B5"].forEach(cell => {
    applyCurrencyFormat(worksheet, cell);
  });
  
  // Apply styling to the summary section
  worksheet["A7"].s = { font: { bold: true, color: { rgb: "0000FF" } } };
  
  // Apply some basic styling
  applyWorksheetStyling(worksheet);
  
  return worksheet;
};

// Create a sheet with changed budget items
export const createChangedItemsSheet = (items: BudgetItem[]) => {
  const headers = [
    "No",
    "Pembebanan",
    "Uraian",
    "Detail Perubahan",
    "Jumlah Semula",
    "Jumlah Menjadi",
    "Selisih"
  ];
  
  const changedItems = items.filter(item => item.status === 'changed');
  
  const data = changedItems.map((item, index) => {
    const volumeChanged = item.volumeSemula !== item.volumeMenjadi;
    const satuanChanged = item.satuanSemula !== item.satuanMenjadi;
    const hargaChanged = item.hargaSatuanSemula !== item.hargaSatuanMenjadi;
    
    let detailPerubahan = "";
    if (volumeChanged) detailPerubahan += `Volume: ${item.volumeSemula} → ${item.volumeMenjadi}\n`;
    if (satuanChanged) detailPerubahan += `Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}\n`;
    if (hargaChanged) detailPerubahan += `Harga: ${formatCurrency(item.hargaSatuanSemula, false)} → ${formatCurrency(item.hargaSatuanMenjadi, false)}`;
    
    return [
      index + 1,
      getCombinedPembebananCode(item),
      item.uraian,
      detailPerubahan,
      roundToThousands(item.jumlahSemula),
      roundToThousands(item.jumlahMenjadi),
      roundToThousands(item.jumlahMenjadi - item.jumlahSemula)
    ];
  });
  
  // Add total row
  const totalSemula = roundToThousands(changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const totalMenjadi = roundToThousands(changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const totalSelisih = totalMenjadi - totalSemula;
  
  data.push([
    "",
    "TOTAL",
    "",
    "",
    totalSemula,
    totalMenjadi,
    totalSelisih
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Pembebanan
    { wch: 50 },  // Uraian
    { wch: 40 },  // Detail Perubahan
    { wch: 20 },  // Jumlah Semula
    { wch: 20 },  // Jumlah Menjadi
    { wch: 20 },  // Selisih
  ];
  
  // Apply styling
  applyWorksheetStyling(worksheet);
  applyHeaderStyle(worksheet);
  
  // Apply currency formatting to amount columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; ++R) {
    for (let C of [4, 5, 6]) {
      const cell_address = {c: C, r: R};
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      applyCurrencyFormat(worksheet, cell_ref);
    }
  }
  
  // Style the total row
  if (data.length > 0) {
    const totalRowIndex = data.length;
    const totalRow = XLSX.utils.encode_row(totalRowIndex);
    
    for (let C = 0; C <= 6; ++C) {
      const cellRef = XLSX.utils.encode_cell({r: totalRowIndex, c: C});
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFF2CC" } } // Light orange background
        };
      }
    }
  }
  
  return worksheet;
};

// Create a sheet with new budget items
export const createNewItemsSheet = (items: BudgetItem[]) => {
  const headers = [
    "No",
    "Pembebanan",
    "Uraian",
    "Volume",
    "Satuan",
    "Harga Satuan",
    "Jumlah"
  ];
  
  const newItems = items.filter(item => item.status === 'new');
  
  const data = newItems.map((item, index) => [
    index + 1,
    getCombinedPembebananCode(item),
    item.uraian,
    item.volumeMenjadi,
    item.satuanMenjadi,
    roundToThousands(item.hargaSatuanMenjadi),
    roundToThousands(item.jumlahMenjadi)
  ]);
  
  // Add total row
  const totalMenjadi = roundToThousands(newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  
  data.push([
    "",
    "TOTAL",
    "",
    "",
    "",
    "",
    totalMenjadi
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Pembebanan
    { wch: 50 },  // Uraian
    { wch: 10 },  // Volume
    { wch: 15 },  // Satuan
    { wch: 20 },  // Harga Satuan
    { wch: 20 },  // Jumlah
  ];
  
  // Apply styling
  applyWorksheetStyling(worksheet);
  applyHeaderStyle(worksheet);
  
  // Apply currency formatting to amount columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; ++R) {
    for (let C of [5, 6]) {
      const cell_address = {c: C, r: R};
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      applyCurrencyFormat(worksheet, cell_ref);
    }
  }
  
  // Style the total row
  if (data.length > 0) {
    const totalRowIndex = data.length;
    const totalRow = XLSX.utils.encode_row(totalRowIndex);
    
    for (let C = 0; C <= 6; ++C) {
      const cellRef = XLSX.utils.encode_cell({r: totalRowIndex, c: C});
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "E2EFDA" } } // Light green background
        };
      }
    }
  }
  
  return worksheet;
};

// Create a sheet with all budget items
export const createItemsSheet = (items: BudgetItem[]) => {
  const headers = [
    "Komponen Output",
    "Sub Komponen",
    "Akun",
    "Uraian",
    "Volume Semula",
    "Satuan Semula", 
    "Harga Satuan Semula",
    "Jumlah Semula",
    "Volume Menjadi", 
    "Satuan Menjadi",
    "Harga Satuan Menjadi",
    "Jumlah Menjadi",
    "Sisa Anggaran",
    "Selisih",
    "Status"
  ];
  
  const data = items.map(item => [
    item.komponenOutput,
    item.subKomponen,
    item.akun,
    item.uraian,
    item.volumeSemula,
    item.satuanSemula,
    roundToThousands(item.hargaSatuanSemula),
    roundToThousands(item.jumlahSemula),
    item.volumeMenjadi,
    item.satuanMenjadi,
    roundToThousands(item.hargaSatuanMenjadi),
    roundToThousands(item.jumlahMenjadi),
    item.sisaAnggaran ? roundToThousands(item.sisaAnggaran) : '',
    roundToThousands(item.jumlahMenjadi - item.jumlahSemula),
    item.status
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Komponen Output
    { wch: 15 }, // Sub Komponen
    { wch: 15 }, // Akun
    { wch: 40 }, // Uraian
    { wch: 15 }, // Volume Semula
    { wch: 15 }, // Satuan Semula
    { wch: 20 }, // Harga Satuan Semula
    { wch: 20 }, // Jumlah Semula
    { wch: 15 }, // Volume Menjadi
    { wch: 15 }, // Satuan Menjadi
    { wch: 20 }, // Harga Satuan Menjadi
    { wch: 20 }, // Jumlah Menjadi
    { wch: 20 }, // Sisa Anggaran
    { wch: 20 }, // Selisih
    { wch: 15 }, // Status
  ];
  
  // Apply styling
  applyWorksheetStyling(worksheet);
  applyHeaderStyle(worksheet);
  
  // Apply number formatting to numeric columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; ++R) {
    for (let C of [6, 7, 10, 11, 12, 13]) {
      const cell_address = {c: C, r: R};
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      applyCurrencyFormat(worksheet, cell_ref);
    }
    
    // Color-code status column
    const statusCell = XLSX.utils.encode_cell({c: 14, r: R});
    if (worksheet[statusCell]) {
      const status = worksheet[statusCell].v;
      let fillColor;
      
      switch(status) {
        case 'new':
          fillColor = "E2EFDA"; // Light green
          break;
        case 'changed':
          fillColor = "FFF2CC"; // Light orange
          break;
        case 'deleted':
          fillColor = "FCE4D6"; // Light red
          break;
      }
      
      if (fillColor) {
        worksheet[statusCell].s = {
          fill: { fgColor: { rgb: fillColor } }
        };
      }
    }
  }
  
  return worksheet;
};

// Create a sheet with group summaries (account groups, komponens, or akuns)
export const createGroupSummarySheet = (groupData: BudgetSummaryRecord[], groupType: string) => {
  let headers: string[];
  let dataRows: any[] = [];

  headers = [
    groupType,
    "Pagu Semula",
    "Pagu Menjadi",
    "Selisih",
    "Item Baru",
    "Item Berubah",
    "Jumlah Item"
  ];

  groupData.forEach(record => {
    let rowData: any[] = [];
    
    if ('komponen_output' in record) {
      rowData = [
        record.komponen_output,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    } else if ('akun' in record) {
      rowData = [
        record.akun,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    } else if ('program_pembebanan' in record) {
      rowData = [
        record.program_pembebanan,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    } else if ('kegiatan' in record) {
      rowData = [
        record.kegiatan,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    } else if ('rincian_output' in record) {
      rowData = [
        record.rincian_output,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    } else if ('sub_komponen' in record) {
      rowData = [
        record.sub_komponen,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    } else if ('account_group' in record) {
      rowData = [
        record.account_group,
        record.total_semula,
        record.total_menjadi,
        record.total_selisih,
        record.new_items,
        record.changed_items,
        record.total_items
      ];
    }
    
    if (rowData.length > 0) {
      dataRows.push(rowData);
    }
  });
  
  // Add total row
  const totalSemula = dataRows.reduce((sum, row) => sum + (row[1] || 0), 0);
  const totalMenjadi = dataRows.reduce((sum, row) => sum + (row[2] || 0), 0);
  const totalSelisih = totalMenjadi - totalSemula;
  const totalNewItems = dataRows.reduce((sum, row) => sum + (row[4] || 0), 0);
  const totalChangedItems = dataRows.reduce((sum, row) => sum + (row[5] || 0), 0);
  const totalItems = dataRows.reduce((sum, row) => sum + (row[6] || 0), 0);
  
  dataRows.push([
    "TOTAL",
    totalSemula,
    totalMenjadi,
    totalSelisih,
    totalNewItems,
    totalChangedItems,
    totalItems
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Group name
    { wch: 20 }, // Pagu Semula
    { wch: 20 }, // Pagu Menjadi
    { wch: 20 }, // Selisih
    { wch: 15 }, // Item Bertambah
    { wch: 15 }, // Item Berubah
    { wch: 15 }, // Jumlah Item
  ];
  
  // Apply styling
  applyWorksheetStyling(worksheet);
  applyHeaderStyle(worksheet);
  
  // Apply number formatting to numeric columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; ++R) {
    for (let C of [1, 2, 3]) {
      const cell_address = {c: C, r: R};
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      applyCurrencyFormat(worksheet, cell_ref);
    }
    
    // Color-code rows with significant changes
    const selisihCell = XLSX.utils.encode_cell({c: 3, r: R});
    if (worksheet[selisihCell] && typeof worksheet[selisihCell].v === 'number') {
      const selisih = worksheet[selisihCell].v;
      
      if (Math.abs(selisih) > 0) {
        for (let C = 0; C <= 6; ++C) {
          const cell = XLSX.utils.encode_cell({c: C, r: R});
          if (worksheet[cell]) {
            worksheet[cell].s = {
              ...(worksheet[cell].s || {}),
              fill: { 
                fgColor: { rgb: selisih > 0 ? "E2EFDA" : "FCE4D6" }
              }
            };
          }
        }
      }
    }
  }
  
  // Style the total row
  const totalRowIndex = dataRows.length;
  for (let C = 0; C <= 6; ++C) {
    const cellRef = XLSX.utils.encode_cell({r: totalRowIndex, c: C});
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E6E6E6" } }
      };
    }
  }
  
  return worksheet;
};

// Export function with comprehensive multi-sheet Excel file
export const exportComprehensiveExcel = (items: BudgetItem[], summaryData: BudgetSummaryRecord[] = [], fileName: string = "Anggaran_Komprehensif") => {
  if (items.length === 0) {
    throw new Error("Tidak ada data untuk diekspor");
  }

  try {
    const workbook = createCompleteExcelExport(items, summaryData);
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error("Error exporting comprehensive Excel:", error);
    throw new Error("Gagal mengekspor file Excel");
  }
};
