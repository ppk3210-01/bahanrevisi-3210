
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';

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
    "Harga Satuan Menjadi"
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
    1200000
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
    { key: 'hargaSatuanMenjadi', patterns: ['harga', 'menjadi'] }
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
    hargaSatuanMenjadi: "Harga Satuan Menjadi"
  };
  
  return missingColumns
    .map(col => friendlyNames[col] || col)
    .join(', ');
};
