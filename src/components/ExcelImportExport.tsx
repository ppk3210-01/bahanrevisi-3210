
import React, { useState } from 'react';
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
        
        // Look for the header row - search for column names we expect
        const expectedHeaders = [
          "uraian", "volume semula", "satuan semula", "harga satuan semula", 
          "volume menjadi", "satuan menjadi", "harga satuan menjadi"
        ];
        
        let headerRowIndex = -1;
        
        // Find the header row by looking for expected headers (case insensitive)
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const row = rows[i];
          if (!row || row.length < 7) continue;
          
          // Convert row items to lowercase strings for comparison
          const lowercaseRow = row.map(item => 
            typeof item === 'string' ? item.toLowerCase() : String(item).toLowerCase()
          );
          
          // Check if any of the expected headers are found in this row
          const foundHeaders = expectedHeaders.filter(header => 
            lowercaseRow.some(cell => cell.includes(header))
          );
          
          if (foundHeaders.length >= 3) { // If we find at least 3 of the expected headers
            headerRowIndex = i;
            break;
          }
        }
        
        if (headerRowIndex === -1) {
          toast({
            title: "Format tidak valid",
            description: "File Excel tidak berisi header yang diharapkan. Gunakan template yang disediakan.",
            variant: "destructive",
          });
          setIsImporting(false);
          event.target.value = '';
          return;
        }
        
        // Extract column indices based on header names
        const headerRow = rows[headerRowIndex];
        const columnIndices: Record<string, number> = {};
        
        headerRow.forEach((header: any, index: number) => {
          const headerText = String(header).toLowerCase().trim();
          
          if (headerText.includes("program pembebanan")) columnIndices.programPembebanan = index;
          else if (headerText.includes("kegiatan")) columnIndices.kegiatan = index;
          else if (headerText.includes("rincian output")) columnIndices.rincianOutput = index;
          else if (headerText.includes("komponen output")) columnIndices.komponenOutput = index;
          else if (headerText.includes("sub komponen")) columnIndices.subKomponen = index;
          else if (headerText.includes("akun")) columnIndices.akun = index;
          else if (headerText.includes("uraian")) columnIndices.uraian = index;
          else if (headerText.includes("volume semula")) columnIndices.volumeSemula = index;
          else if (headerText.includes("satuan semula")) columnIndices.satuanSemula = index;
          else if (headerText.includes("harga satuan semula")) columnIndices.hargaSatuanSemula = index;
          else if (headerText.includes("volume menjadi")) columnIndices.volumeMenjadi = index;
          else if (headerText.includes("satuan menjadi")) columnIndices.satuanMenjadi = index;
          else if (headerText.includes("harga satuan menjadi")) columnIndices.hargaSatuanMenjadi = index;
        });
        
        // Validate that we have the required columns
        const requiredColumns = ['uraian', 'volumeSemula', 'satuanSemula', 'hargaSatuanSemula', 
                                'volumeMenjadi', 'satuanMenjadi', 'hargaSatuanMenjadi'];
        
        const missingColumns = requiredColumns.filter(col => typeof columnIndices[col] === 'undefined');
        
        if (missingColumns.length > 0) {
          toast({
            title: "Kolom tidak lengkap",
            description: `Kolom berikut tidak ditemukan: ${missingColumns.join(', ')}`,
            variant: "destructive",
          });
          setIsImporting(false);
          event.target.value = '';
          return;
        }
        
        // Skip header row and process data rows
        const dataRows = rows.slice(headerRowIndex + 1)
          .filter(row => row?.length >= Math.max(...Object.values(columnIndices)) && row[columnIndices.uraian])
          .map(row => {
            const item: Partial<BudgetItem> = {
              uraian: String(row[columnIndices.uraian] || ''),
              volumeSemula: Number(row[columnIndices.volumeSemula]) || 0,
              satuanSemula: String(row[columnIndices.satuanSemula] || 'Paket'),
              hargaSatuanSemula: Number(row[columnIndices.hargaSatuanSemula]) || 0,
              volumeMenjadi: Number(row[columnIndices.volumeMenjadi]) || 0,
              satuanMenjadi: String(row[columnIndices.satuanMenjadi] || 'Paket'),
              hargaSatuanMenjadi: Number(row[columnIndices.hargaSatuanMenjadi]) || 0
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
        
        if (dataRows.length === 0) {
          toast({
            title: "Tidak ada data",
            description: "File Excel tidak berisi data item anggaran yang valid.",
            variant: "destructive",
          });
          setIsImporting(false);
          event.target.value = '';
          return;
        }
        
        onImport(dataRows)
          .then(() => {
            toast({
              title: "Import berhasil",
              description: `Berhasil mengimport ${dataRows.length} item anggaran.`,
            });
            setIsImporting(false);
            event.target.value = '';
          })
          .catch((error) => {
            console.error("Import error:", error);
            toast({
              title: "Import gagal",
              description: "Terjadi kesalahan saat mengimport data.",
              variant: "destructive",
            });
            setIsImporting(false);
            event.target.value = '';
          });
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast({
          title: "Format tidak valid",
          description: "Terjadi kesalahan saat membaca file Excel.",
          variant: "destructive",
        });
        setIsImporting(false);
        event.target.value = '';
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
      event.target.value = '';
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
        
        <label htmlFor="excel-import">
          <Button 
            variant="outline" 
            className={`flex items-center cursor-pointer ${buttonClass}`}
            size={smallText ? "sm" : undefined}
          >
            <Upload className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            <span>Import Excel</span>
          </Button>
          <input
            id="excel-import"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleImport}
            className="sr-only"
            disabled={isImporting}
          />
        </label>
        
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
