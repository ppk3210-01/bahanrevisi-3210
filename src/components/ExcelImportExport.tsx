
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { FileSpreadsheet, Upload, HelpCircle } from 'lucide-react';
import ExportOptions from './ExportOptions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExcelImportExportProps {
  items: BudgetItem[];
  onImport: (items: Partial<BudgetItem>[]) => Promise<void>;
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
  smallText?: boolean;
}

const ExcelImportExport: React.FC<ExcelImportExportProps> = ({
  items,
  onImport,
  komponenOutput,
  subKomponen,
  akun,
  smallText = false
}) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonClass = smallText 
    ? "text-xs px-2 py-1 h-8" 
    : "";

  // Template handling
  const downloadTemplate = () => {
    // Create a template workbook
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
      "Komponen Output Contoh",
      "Sub Komponen Contoh",
      "Akun Contoh",
      "Contoh item anggaran", 
      1, 
      "Paket", 
      1000000, 
      1, 
      "Paket", 
      1200000
    ]];
    
    // Pre-fill selected values if available
    const prefillData = {
      "Program Pembebanan": "",
      "Kegiatan": "",
      "Rincian Output": "",
      "Komponen Output": komponenOutput || "",
      "Sub Komponen": subKomponen || "",
      "Akun": akun || ""
    };
    
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
    
    // Save the file
    XLSX.writeFile(wb, "Budget_Import_Template.xlsx");
  };

  // Trigger file input click when the import button is clicked
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Helper function to normalize column names for matching
  const normalizeColumnName = (name: string): string => {
    return name.toString()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '')
      .trim();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Convert to array of objects and validate
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        console.log("Excel rows:", rows);
        
        if (rows.length <= 1) {
          toast({
            title: "Data tidak lengkap",
            description: "File Excel tidak berisi data yang cukup.",
            variant: "destructive",
          });
          setIsImporting(false);
          if (event.target) event.target.value = '';
          return;
        }
        
        // Expected column names and their variations
        const expectedColumns = {
          uraian: ["uraian", "keterangan", "item", "description"],
          volumeSemula: ["volumesemula", "volume semula", "volume awal", "jumlah semula", "volume1"],
          satuanSemula: ["satuansemula", "satuan semula", "satuan awal", "unit semula", "satuan1"],
          hargaSatuanSemula: ["hargasatuansemula", "harga satuan semula", "harga awal", "price semula", "hargasatuan1"],
          volumeMenjadi: ["volumemenjadi", "volume menjadi", "volume akhir", "jumlah menjadi", "volume2"],
          satuanMenjadi: ["satuanmenjadi", "satuan menjadi", "satuan akhir", "unit menjadi", "satuan2"],
          hargaSatuanMenjadi: ["hargasatuanmenjadi", "harga satuan menjadi", "harga akhir", "price menjadi", "hargasatuan2"],
          programPembebanan: ["programpembebanan", "program pembebanan", "program"],
          kegiatan: ["kegiatan", "activity"],
          rincianOutput: ["rincianoutput", "rincian output", "output", "detail output"],
          komponenOutput: ["komponenoutput", "komponen output", "component"],
          subKomponen: ["subkomponen", "sub komponen", "subcomponent", "subcomp"],
          akun: ["akun", "account"]
        };
        
        // Find header row
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
        
        if (headerRowIndex === -1 || headerRowMatches < 3) {
          toast({
            title: "Format tidak valid",
            description: "File Excel tidak berisi header kolom yang diharapkan. Gunakan template yang disediakan.",
            variant: "destructive",
          });
          setIsImporting(false);
          if (event.target) event.target.value = '';
          return;
        }
        
        // Map column indices to column types
        const headerRow = rows[headerRowIndex];
        const columnIndices: Record<string, number> = {};
        const missingRequiredColumns: string[] = [];
        
        const requiredColumns = ['uraian', 'volumeSemula', 'satuanSemula', 'hargaSatuanSemula', 
                              'volumeMenjadi', 'satuanMenjadi', 'hargaSatuanMenjadi'];
        
        console.log("Header row contents:", headerRow);
        
        // Match header cells to expected columns
        headerRow.forEach((header: any, index: number) => {
          if (!header) return;
          
          const normalizedHeader = normalizeColumnName(header);
          let matched = false;
          
          for (const [key, variations] of Object.entries(expectedColumns)) {
            if (variations.some(v => normalizedHeader.includes(normalizeColumnName(v)))) {
              columnIndices[key] = index;
              matched = true;
              console.log(`Matched column "${header}" at index ${index} to "${key}"`);
              break;
            }
          }
          
          if (!matched) {
            console.log(`Could not match column "${header}" at index ${index}`);
          }
        });
        
        console.log("Mapped column indices:", columnIndices);
        
        // Check for missing required columns
        requiredColumns.forEach(col => {
          if (typeof columnIndices[col] === 'undefined') {
            missingRequiredColumns.push(col);
          }
        });
        
        if (missingRequiredColumns.length > 0) {
          const friendlyNames = {
            uraian: "Uraian",
            volumeSemula: "Volume Semula", 
            satuanSemula: "Satuan Semula",
            hargaSatuanSemula: "Harga Satuan Semula",
            volumeMenjadi: "Volume Menjadi",
            satuanMenjadi: "Satuan Menjadi",
            hargaSatuanMenjadi: "Harga Satuan Menjadi"
          };
          
          const missingColumnsDisplay = missingRequiredColumns
            .map(col => friendlyNames[col as keyof typeof friendlyNames])
            .join(', ');
          
          toast({
            title: "Kolom tidak lengkap",
            description: `Kolom berikut tidak ditemukan: ${missingColumnsDisplay}`,
            variant: "destructive",
          });
          setIsImporting(false);
          if (event.target) event.target.value = '';
          return;
        }
        
        // Skip header row and process data rows
        const dataRows = rows.slice(headerRowIndex + 1)
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
        
        console.log("Processed data rows:", dataRows);
        
        if (dataRows.length === 0) {
          toast({
            title: "Tidak ada data",
            description: "File Excel tidak berisi data item anggaran yang valid.",
            variant: "destructive",
          });
          setIsImporting(false);
          if (event.target) event.target.value = '';
          return;
        }
        
        onImport(dataRows)
          .then(() => {
            toast({
              title: "Import berhasil",
              description: `Berhasil mengimport ${dataRows.length} item anggaran.`,
            });
            setIsImporting(false);
            if (event.target) event.target.value = '';
          })
          .catch((error) => {
            console.error("Import error:", error);
            toast({
              title: "Import gagal",
              description: "Terjadi kesalahan saat mengimport data.",
              variant: "destructive",
            });
            setIsImporting(false);
            if (event.target) event.target.value = '';
          });
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast({
          title: "Format tidak valid",
          description: "Terjadi kesalahan saat membaca file Excel.",
          variant: "destructive",
        });
        setIsImporting(false);
        if (event.target) event.target.value = '';
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast({
        title: "Error",
        description: "Gagal membaca file.",
        variant: "destructive",
      });
      setIsImporting(false);
      if (event.target) event.target.value = '';
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className={`flex items-center ${buttonClass}`}
          size={smallText ? "sm" : undefined}
        >
          <FileSpreadsheet className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span>Download Template</span>
        </Button>
        
        <Button 
          variant="outline" 
          className={`flex items-center cursor-pointer ${buttonClass}`}
          size={smallText ? "sm" : undefined}
          onClick={triggerFileInput}
          disabled={isImporting}
        >
          <Upload className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span>Import Excel</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleImport}
          className="hidden"
          disabled={isImporting}
        />
        
        <Button
          variant="ghost"
          onClick={() => setIsGuideDialogOpen(true)}
          className={`flex items-center ${buttonClass}`}
          size={smallText ? "sm" : undefined}
        >
          <HelpCircle className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span>Panduan Import</span>
        </Button>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ekspor Data ke Excel</DialogTitle>
            <DialogDescription>
              Pilih opsi ekspor untuk data anggaran.
            </DialogDescription>
          </DialogHeader>
          <ExportOptions 
            items={items} 
            komponenOutput={komponenOutput || 'Default'}
            onClose={() => setIsExportDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Panduan Import Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>Untuk mengimport data anggaran dari Excel, silakan ikuti langkah-langkah berikut:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Download template Excel yang telah disediakan.</li>
              <li>Isi data sesuai dengan format template.</li>
              <li>Pastikan kolom Uraian terisi untuk setiap baris.</li>
              <li>Jangan mengubah header pada template.</li>
              <li>Nilai numerik (volume dan harga) harus berupa angka.</li>
              <li>Satuan bisa diisi dengan teks seperti "Paket", "Bulan", dll.</li>
              <li>Simpan file Excel setelah selesai mengisi data.</li>
              <li>Klik tombol "Import Excel" dan pilih file yang telah diisi.</li>
            </ol>
            <p className="text-amber-600 font-medium">
              Catatan: Pastikan semua filter (Komponen Output, Sub Komponen, Akun) telah dipilih sebelum melakukan import untuk hasil terbaik.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExcelImportExport;
