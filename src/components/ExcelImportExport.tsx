import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilePlus2, Download, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExcelImportExportProps {
  onImport: (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => Promise<void>;
  items?: BudgetItem[];
  isActive?: boolean;
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
  const [showHelpDialog, setShowHelpDialog] = useState(false);

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
    
    // Add formatting and styles
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:M2');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = {c: C, r: R};
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!worksheet[cell_ref]) continue;

        // Add format for numeric cells
        if (cell_ref.match(/^(H|J|K|M)[0-9]+$/)) {
          worksheet[cell_ref].t = 'n';
          worksheet[cell_ref].z = '#,##0';
        }
      }
    }
    
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
      console.log("Parsed Excel data:", data);
      
      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "File tidak berisi data"
        });
        setIsLoading(false);
        return;
      }
      
      // Validate required fields and structure
      const result = validateExcelData(data);
      console.log("Validation result:", result);
      
      if (result.validItems.length > 0) {
        try {
          // Convert numeric fields explicitly to ensure they are numbers
          const processedItems = result.validItems.map(item => {
            // Normalize and clean numeric values
            const volumeSemula = parseNumericValue(item.volumeSemula);
            const hargaSatuanSemula = parseNumericValue(item.hargaSatuanSemula);
            const volumeMenjadi = parseNumericValue(item.volumeMenjadi);
            const hargaSatuanMenjadi = parseNumericValue(item.hargaSatuanMenjadi);
            
            return {
              ...item,
              volumeSemula,
              hargaSatuanSemula,
              volumeMenjadi,
              hargaSatuanMenjadi
            };
          });
          
          console.log("Processed items to import:", processedItems);
          
          await onImport(processedItems);
          
          if (result.validItems.length === data.length) {
            toast({
              title: "Berhasil",
              description: `${result.validItems.length} item berhasil diimpor`
            });
          } else {
            toast({
              title: "Perhatian",
              description: `${result.validItems.length} item berhasil diimpor. ${result.invalidCount} item gagal diimpor.`
            });
          }
        } catch (importError: any) {
          console.error('Import processing error:', importError);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Gagal memproses data: ${importError.message || 'Periksa kembali format data Anda.'}`
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Tidak ada data valid dalam file. ${result.errorMessages.join(' ')}`
        });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Gagal mengimpor data: ${error.message || 'Periksa kembali format file Anda.'}`
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
          if (!data) {
            reject(new Error("Failed to read file data"));
            return;
          }
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert all cells to text initially to prevent type conversion issues
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,  // Return formatted text for all cells
            defval: ""   // Default empty cells to empty string
          });
          
          console.log("Raw Excel data:", jsonData);
          resolve(jsonData);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          reject(new Error("Format file tidak valid atau rusak. Pastikan file Excel (.xlsx atau .xls) yang valid."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  // Function to validate excel data
  const validateExcelData = (data: any[]): { 
    validItems: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[],
    invalidCount: number,
    errorMessages: string[]
  } => {
    const validItems: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] = [];
    let invalidCount = 0;
    const errorMessages: string[] = [];
    
    // Validate required headers
    const requiredFields = [
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
    
    // Optional fields that should be checked if present
    const optionalFields = [
      'Program Pembebanan',
      'Kegiatan',
      'Rincian Output'
    ];

    // Check if first row has the required headers
    if (data.length > 0) {
      const firstRow = data[0];
      console.log("First row data:", firstRow);
      const missingHeaders = requiredFields.filter(field => !(field in firstRow));
      if (missingHeaders.length > 0) {
        errorMessages.push(`Kolom yang diperlukan tidak ditemukan: ${missingHeaders.join(', ')}.`);
      }
    }
    
    // Process each row in the data
    data.forEach((row, index) => {
      console.log(`Processing row ${index}:`, row);
      let isRowValid = true;
      const rowErrors: string[] = [];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => {
        const value = row[field];
        return value === undefined || value === "" || value === null;
      });
      
      if (missingFields.length > 0) {
        isRowValid = false;
        rowErrors.push(`Baris ${index + 1}: Field yang diperlukan tidak diisi: ${missingFields.join(', ')}.`);
      }
      
      // Try to create the valid item before validating numeric fields
      // This helps identify if we can at least extract all necessary fields
      let itemToPush: any = {};
      try {
        // Map fields from Excel to the expected format
        itemToPush = {
          uraian: String(row['Uraian'] || ''),
          volumeSemula: row['Volume Semula'],
          satuanSemula: String(row['Satuan Semula'] || ''),
          hargaSatuanSemula: row['Harga Satuan Semula'],
          volumeMenjadi: row['Volume Menjadi'],
          satuanMenjadi: String(row['Satuan Menjadi'] || ''),
          hargaSatuanMenjadi: row['Harga Satuan Menjadi'],
          komponenOutput: String(row['Komponen Output'] || ''),
          programPembebanan: row['Program Pembebanan'] ? String(row['Program Pembebanan']) : undefined,
          kegiatan: row['Kegiatan'] ? String(row['Kegiatan']) : undefined,
          rincianOutput: row['Rincian Output'] ? String(row['Rincian Output']) : undefined,
          subKomponen: String(row['Sub Komponen'] || ''),
          akun: String(row['Akun'] || ''),
          isApproved: false
        };
      } catch (err) {
        isRowValid = false;
        rowErrors.push(`Baris ${index + 1}: Format data tidak valid.`);
      }
      
      // Now validate numeric fields
      try {
        // We'll validate without modifying the original values yet
        const volumeSemula = cleanNumericString(row['Volume Semula']);
        const hargaSatuanSemula = cleanNumericString(row['Harga Satuan Semula']);
        const volumeMenjadi = cleanNumericString(row['Volume Menjadi']);
        const hargaSatuanMenjadi = cleanNumericString(row['Harga Satuan Menjadi']);
        
        // Check if any of these are not valid numbers after cleaning
        if (
          isNaN(parseFloat(volumeSemula)) || 
          isNaN(parseFloat(hargaSatuanSemula)) || 
          isNaN(parseFloat(volumeMenjadi)) || 
          isNaN(parseFloat(hargaSatuanMenjadi))
        ) {
          isRowValid = false;
          rowErrors.push(`Baris ${index + 1}: Nilai volume atau harga satuan bukan angka yang valid.`);
        }
      } catch (e) {
        isRowValid = false;
        rowErrors.push(`Baris ${index + 1}: Format angka tidak valid.`);
      }
      
      if (!isRowValid) {
        invalidCount++;
        errorMessages.push(...rowErrors);
        return;
      }
      
      // Item is valid, add it to the list
      validItems.push(itemToPush);
      console.log(`Valid item for row ${index}:`, itemToPush);
    });
    
    return { validItems, invalidCount, errorMessages };
  };

  // Helper function to clean numeric strings before parsing
  const cleanNumericString = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '0';
    }
    
    // Convert to string
    const stringValue = String(value);
    
    // Remove thousands separators and other non-numeric characters
    // Keep decimal point and minus sign
    return stringValue
      .replace(/[^\d.-]/g, '') // Remove any non-numeric character except decimal point and minus sign
      .replace(/,/g, '.'); // Replace comma with dot for decimal separator
  };

  // Helper function to parse numeric values from different formats
  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // First clean the string
    const cleanedValue = cleanNumericString(value);
    
    // Parse to float
    const numValue = parseFloat(cleanedValue);
    
    // Return 0 if not a valid number
    if (isNaN(numValue)) {
      return 0;
    }
    
    return numValue;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={downloadTemplate}
          size="sm"
        >
          <Download className="h-3 w-3 mr-1" /> 
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
            size="sm"
          >
            <FilePlus2 className="h-3 w-3 mr-1" /> 
            {isLoading ? 'Importing...' : 'Import Excel'}
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowHelpDialog(true)}
          size="sm"
        >
          <AlertCircle className="h-3 w-3 mr-1" /> 
          Panduan Import
        </Button>
      </div>
      
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-sm max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Panduan Import Excel</DialogTitle>
            <DialogDescription className="text-xs">
              Petunjuk cara mengimpor data menggunakan file Excel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 text-xs">
            <h3 className="text-xs font-medium">Format File</h3>
            <p className="text-xs">File Excel (.xlsx atau .xls) harus memiliki format berikut:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-[10px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 p-1">Kolom</th>
                    <th className="border border-gray-200 p-1">Tipe Data</th>
                    <th className="border border-gray-200 p-1">Contoh</th>
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  <tr>
                    <td className="border border-gray-200 p-1">Program Pembebanan</td>
                    <td className="border border-gray-200 p-1">Text</td>
                    <td className="border border-gray-200 p-1">054.01.GG</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-1">Kegiatan</td>
                    <td className="border border-gray-200 p-1">Text</td>
                    <td className="border border-gray-200 p-1">2896</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-1">Komponen Output</td>
                    <td className="border border-gray-200 p-1">Text</td>
                    <td className="border border-gray-200 p-1">2896.BMA.004</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-1">Uraian</td>
                    <td className="border border-gray-200 p-1">Text</td>
                    <td className="border border-gray-200 p-1">Belanja Jasa</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-1">Volume</td>
                    <td className="border border-gray-200 p-1">Number</td>
                    <td className="border border-gray-200 p-1">1</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-1">Satuan</td>
                    <td className="border border-gray-200 p-1">Text</td>
                    <td className="border border-gray-200 p-1">Paket</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-1">Harga Satuan</td>
                    <td className="border border-gray-200 p-1">Number</td>
                    <td className="border border-gray-200 p-1">1000000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h3 className="text-xs font-medium mt-2">Petunjuk Import</h3>
            <ol className="list-decimal list-inside space-y-0.5 text-[10px] pl-1">
              <li>Unduh template dengan klik tombol Download Template</li>
              <li>Isi data sesuai format yang ditentukan</li>
              <li>Klik tombol Import Excel dan pilih file</li>
              <li>Tunggu hingga proses import selesai</li>
            </ol>
            
            <h3 className="text-xs font-medium mt-2">Tips Import</h3>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1">
              <li>Pastikan format kolom numerik sudah benar</li>
              <li>Jangan mengubah nama kolom pada baris pertama</li>
              <li>Pastikan tidak ada sel yang kosong pada baris data</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelImportExport;
