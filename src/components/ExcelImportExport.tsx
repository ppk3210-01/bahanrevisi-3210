
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
import { createTemplateWorkbook } from '@/utils/excelUtils';
import ImportHandler from './ImportHandler';

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

  const buttonClass = smallText ? "text-xs px-2 py-1 h-8" : "";
  const { handleImportFile } = ImportHandler({
    onImport,
    komponenOutput,
    subKomponen,
    akun,
    onComplete: () => {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  // Template handling
  const downloadTemplate = () => {
    // Create a template workbook
    const wb = createTemplateWorkbook(komponenOutput, subKomponen, akun);
    
    // Save the file
    XLSX.writeFile(wb, "Budget_Import_Template.xlsx");
  };

  // Trigger file input click when the import button is clicked
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    handleImportFile(file);
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
