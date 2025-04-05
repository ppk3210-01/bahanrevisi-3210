
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { FilterSelection } from '@/types/budget';
import { calculateAmount, calculateDifference } from '@/utils/budgetCalculations';

interface BudgetImportExportProps {
  filters: FilterSelection;
  onImport: (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] | null) => void;
  areFiltersComplete: boolean;
}

const BudgetImportExport: React.FC<BudgetImportExportProps> = ({ 
  filters, 
  onImport,
  areFiltersComplete 
}) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  
  // Generate template for download
  const downloadTemplate = () => {
    try {
      const template = [
        {
          'Uraian': 'Contoh Uraian',
          'Volume Semula': 1,
          'Satuan Semula': 'Paket',
          'Harga Satuan Semula': 1000000,
          'Volume Menjadi': 1,
          'Satuan Menjadi': 'Paket',
          'Harga Satuan Menjadi': 1000000,
          'Program Pembebanan': filters.programPembebanan || '(wajib diisi)',
          'Kegiatan': filters.kegiatan || '(wajib diisi)',
          'Rincian Output': filters.rincianOutput || '(wajib diisi)',
          'Komponen Output': filters.komponenOutput || '(wajib diisi)',
          'Sub Komponen': filters.subKomponen || '(wajib diisi)',
          'Akun': filters.akun || '(wajib diisi)'
        }
      ];
      
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      
      // Add instructions sheet
      const instructionsData = [
        ['Petunjuk Pengisian:'],
        ['1. Semua kolom wajib diisi'],
        ['2. Satuan Semula dan Satuan Menjadi diisi dengan: Paket, Kegiatan, Bulan, Tahun, Orang, Laporan, dll'],
        ['3. Volume dan Harga Satuan tidak boleh negatif'],
        ['4. ID dan kode untuk kolom berikut harus sesuai dengan yang tersedia di aplikasi:'],
        ['   - Program Pembebanan'],
        ['   - Kegiatan'],
        ['   - Rincian Output'],
        ['   - Komponen Output'],
        ['   - Sub Komponen'],
        ['   - Akun']
      ];
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
      XLSX.utils.book_append_sheet(wb, wsInstructions, "Petunjuk");
      
      XLSX.writeFile(wb, "Template_Import_Anggaran.xlsx");
      
      toast({
        title: "Berhasil!",
        description: "Template berhasil diunduh"
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal mengunduh template. Silakan coba lagi."
      });
    }
  };
  
  // Handle file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!areFiltersComplete) {
      toast({
        variant: "destructive",
        title: "Filter tidak lengkap",
        description: "Silakan pilih semua filter terlebih dahulu"
      });
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          throw new Error("File tidak berisi data");
        }
        
        // Validate and transform data
        const transformedItems = data.map((row: any, index) => {
          if (!row['Uraian'] || 
              row['Volume Semula'] === undefined || 
              !row['Satuan Semula'] || 
              row['Harga Satuan Semula'] === undefined ||
              row['Volume Menjadi'] === undefined || 
              !row['Satuan Menjadi'] || 
              row['Harga Satuan Menjadi'] === undefined) {
            throw new Error(`Baris ${index + 1}: Data tidak lengkap`);
          }
          
          const volumeSemula = Number(row['Volume Semula']);
          const hargaSatuanSemula = Number(row['Harga Satuan Semula']);
          const volumeMenjadi = Number(row['Volume Menjadi']);
          const hargaSatuanMenjadi = Number(row['Harga Satuan Menjadi']);
          
          if (isNaN(volumeSemula) || isNaN(hargaSatuanSemula) || isNaN(volumeMenjadi) || isNaN(hargaSatuanMenjadi)) {
            throw new Error(`Baris ${index + 1}: Volume atau harga satuan tidak valid`);
          }
          
          if (volumeSemula < 0 || hargaSatuanSemula < 0 || volumeMenjadi < 0 || hargaSatuanMenjadi < 0) {
            throw new Error(`Baris ${index + 1}: Volume atau harga satuan tidak boleh negatif`);
          }
          
          return {
            uraian: String(row['Uraian']),
            volumeSemula: volumeSemula,
            satuanSemula: String(row['Satuan Semula']),
            hargaSatuanSemula: hargaSatuanSemula,
            volumeMenjadi: volumeMenjadi,
            satuanMenjadi: String(row['Satuan Menjadi']),
            hargaSatuanMenjadi: hargaSatuanMenjadi,
            komponenOutput: filters.komponenOutput,
            programPembebanan: filters.programPembebanan,
            kegiatan: filters.kegiatan,
            rincianOutput: filters.rincianOutput,
            subKomponen: filters.subKomponen,
            akun: filters.akun,
            isApproved: false
          };
        });
        
        onImport(transformedItems);
        
        toast({
          title: "Berhasil!",
          description: `${transformedItems.length} item berhasil diimpor`
        });
      } catch (error: any) {
        console.error('Error importing file:', error);
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: error.message || "Gagal mengimpor file. Silakan coba lagi."
        });
        onImport(null);
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal membaca file. Silakan coba lagi."
      });
      setIsImporting(false);
      e.target.value = '';
    };
    
    reader.readAsBinaryString(file);
  };
  
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        onClick={downloadTemplate}
        className="flex items-center"
      >
        <Download className="mr-1 h-4 w-4" />
        Template
      </Button>
      
      <div className="relative">
        <Button
          variant="outline"
          className={`flex items-center ${!areFiltersComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!areFiltersComplete || isImporting}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="mr-1 h-4 w-4" />
          {isImporting ? 'Mengimpor...' : 'Import Excel'}
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
          disabled={!areFiltersComplete || isImporting}
        />
      </div>
    </div>
  );
};

export default BudgetImportExport;
