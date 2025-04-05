
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilePlus2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';

interface ExcelImportExportProps {
  onImport: (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => Promise<void>;
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
}

const ExcelImportExport: React.FC<ExcelImportExportProps> = ({ 
  onImport, 
  komponenOutput,
  subKomponen,
  akun
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Template structure for download
  const templateData = [
    {
      'Program Pembebanan': 'Contoh: 054.01.GG',
      'Kegiatan': 'Contoh: 2896',
      'Rincian Output': 'Contoh: 2896.BMA',
      'Komponen Output': komponenOutput || 'Contoh: 2896.BMA.004',
      'Sub Komponen': subKomponen || 'Contoh: SK123',
      'Akun': akun || 'Contoh: 522151',
      'Uraian': 'Deskripsi Anggaran',
      'Volume Semula': '1',
      'Satuan Semula': 'Paket',
      'Harga Satuan Semula': '1000000',
      'Volume Menjadi': '1',
      'Satuan Menjadi': 'Paket',
      'Harga Satuan Menjadi': '1000000',
    }
  ];

  // Function to download template
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Generate column widths
    const columnWidths = [
      { wch: 20 }, // Program Pembebanan
      { wch: 15 }, // Kegiatan
      { wch: 20 }, // Rincian Output
      { wch: 25 }, // Komponen Output
      { wch: 15 }, // Sub Komponen
      { wch: 15 }, // Akun
      { wch: 40 }, // Uraian
      { wch: 15 }, // Volume Semula
      { wch: 15 }, // Satuan Semula
      { wch: 20 }, // Harga Satuan Semula
      { wch: 15 }, // Volume Menjadi
      { wch: 15 }, // Satuan Menjadi
      { wch: 20 }, // Harga Satuan Menjadi
    ];
    
    worksheet['!cols'] = columnWidths;
    
    XLSX.writeFile(workbook, 'budget_template.xlsx');
    toast({
      title: "Template diunduh",
      description: "Template Excel berhasil diunduh"
    });
  };

  // Function to handle file import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const data = await readExcelFile(file);
      
      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "File tidak berisi data"
        });
        return;
      }
      
      // Validate required fields
      const validatedData = validateData(data);
      
      if (validatedData.length > 0) {
        await onImport(validatedData);
        toast({
          title: "Berhasil",
          description: `${validatedData.length} item berhasil diimpor`
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengimpor data. Periksa kembali file Anda."
      });
    } finally {
      setIsLoading(false);
      // Reset the input field
      e.target.value = '';
    }
  };

  // Function to read Excel file
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  // Function to validate data
  const validateData = (data: any[]): Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] => {
    const validItems: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] = [];
    
    let invalidCount = 0;
    
    data.forEach((row, index) => {
      // Check required fields
      const requiredFields = [
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
        'Volume Menjadi',
        'Satuan Menjadi',
        'Harga Satuan Menjadi'
      ];
      
      const missingFields = requiredFields.filter(field => !row[field]);
      
      if (missingFields.length > 0) {
        invalidCount++;
        return;
      }
      
      // Convert numeric fields
      const volumeSemula = Number(row['Volume Semula']);
      const hargaSatuanSemula = Number(row['Harga Satuan Semula']);
      const volumeMenjadi = Number(row['Volume Menjadi']);
      const hargaSatuanMenjadi = Number(row['Harga Satuan Menjadi']);
      
      // Validate numeric fields
      if (isNaN(volumeSemula) || isNaN(hargaSatuanSemula) || isNaN(volumeMenjadi) || isNaN(hargaSatuanMenjadi)) {
        invalidCount++;
        return;
      }
      
      // Create valid item
      const validItem = {
        uraian: row['Uraian'],
        volumeSemula,
        satuanSemula: row['Satuan Semula'],
        hargaSatuanSemula,
        volumeMenjadi,
        satuanMenjadi: row['Satuan Menjadi'],
        hargaSatuanMenjadi,
        komponenOutput: row['Komponen Output'],
        programPembebanan: row['Program Pembebanan'],
        kegiatan: row['Kegiatan'],
        rincianOutput: row['Rincian Output'],
        subKomponen: row['Sub Komponen'],
        akun: row['Akun'],
        isApproved: false
      };
      
      validItems.push(validItem);
    });
    
    if (invalidCount > 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: `${invalidCount} baris dilewati karena data tidak lengkap atau tidak valid`
      });
    }
    
    return validItems;
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        onClick={downloadTemplate}
      >
        <Download className="h-4 w-4 mr-2" /> 
        Download Template
      </Button>
      
      <div className="relative">
        <Input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        <Button 
          variant="outline" 
          disabled={isLoading}
        >
          <FilePlus2 className="h-4 w-4 mr-2" /> 
          {isLoading ? 'Importing...' : 'Import Excel'}
        </Button>
      </div>
    </div>
  );
};

export default ExcelImportExport;
