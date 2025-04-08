
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
    
    const headers = ["Uraian", "Volume Semula", "Satuan Semula", "Harga Satuan Semula", 
                    "Volume Menjadi", "Satuan Menjadi", "Harga Satuan Menjadi"];
    
    const data = [headers, ["Contoh item anggaran", 1, "Paket", 1000000, 1, "Paket", 1200000]];
    
    // If komponen, subKomponen, or akun are provided, add them to the template
    if (komponenOutput || subKomponen || akun) {
      data.unshift(["Metadata:", "", "", "", "", "", ""]);
      if (komponenOutput) data.unshift(["Komponen Output:", komponenOutput, "", "", "", "", ""]);
      if (subKomponen) data.unshift(["Sub Komponen:", subKomponen, "", "", "", "", ""]);
      if (akun) data.unshift(["Akun:", akun, "", "", "", "", ""]);
      data.unshift(["", "", "", "", "", "", ""]);
    }
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const colWidths = [
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
        
        // Look for the header row
        const headerRowIndex = rows.findIndex(row => 
          row.length >= 7 && 
          typeof row[0] === 'string' && 
          row[0].toLowerCase().includes('uraian')
        );
        
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
        
        // Skip header row and process data rows
        const dataRows = rows.slice(headerRowIndex + 1)
          .filter(row => row.length >= 7 && row[0])
          .map(row => ({
            uraian: String(row[0]),
            volumeSemula: Number(row[1]) || 0,
            satuanSemula: String(row[2] || 'Paket'),
            hargaSatuanSemula: Number(row[3]) || 0,
            volumeMenjadi: Number(row[4]) || 0,
            satuanMenjadi: String(row[5] || 'Paket'),
            hargaSatuanMenjadi: Number(row[6]) || 0,
            komponenOutput: komponenOutput || '',
            subKomponen: subKomponen || '',
            akun: akun || ''
          }));
        
        if (dataRows.length === 0) {
          toast({
            title: "Tidak ada data",
            description: "File Excel tidak berisi data item anggaran yang valid.",
            variant: "destructive",
          });
        } else {
          onImport(dataRows)
            .then(() => {
              toast({
                title: "Import berhasil",
                description: `Berhasil mengimport ${dataRows.length} item anggaran.`,
              });
            })
            .catch(() => {
              toast({
                title: "Import gagal",
                description: "Terjadi kesalahan saat mengimport data.",
                variant: "destructive",
              });
            });
        }
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast({
          title: "Format tidak valid",
          description: "Terjadi kesalahan saat membaca file Excel.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        event.target.value = '';
      }
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
