
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
          const processedItems = result.validItems.map(item => ({
            ...item,
            volumeSemula: Number(item.volumeSemula),
            hargaSatuanSemula: Number(item.hargaSatuanSemula),
            volumeMenjadi: Number(item.volumeMenjadi),
            hargaSatuanMenjadi: Number(item.hargaSatuanMenjadi),
            // Ensure these fields are never sent as they are computed
            jumlahSemula: undefined,
            jumlahMenjadi: undefined,
            selisih: undefined
          }));
          
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
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
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
      
      // Convert and validate numeric fields
      let volumeSemula: number;
      let hargaSatuanSemula: number;
      let volumeMenjadi: number;
      let hargaSatuanMenjadi: number;
      
      try {
        // Parse numeric values, handling different formats
        volumeSemula = parseNumericValue(row['Volume Semula']);
        hargaSatuanSemula = parseNumericValue(row['Harga Satuan Semula']);
        volumeMenjadi = parseNumericValue(row['Volume Menjadi']);
        hargaSatuanMenjadi = parseNumericValue(row['Harga Satuan Menjadi']);
        
        console.log(`Parsed values for row ${index}:`, {
          volumeSemula,
          hargaSatuanSemula,
          volumeMenjadi,
          hargaSatuanMenjadi
        });
      } catch (e) {
        isRowValid = false;
        rowErrors.push(`Baris ${index + 1}: Format angka tidak valid.`);
        volumeSemula = 0;
        hargaSatuanSemula = 0;
        volumeMenjadi = 0;
        hargaSatuanMenjadi = 0;
      }
      
      // Validate numeric fields
      if (isNaN(volumeSemula) || isNaN(hargaSatuanSemula) || isNaN(volumeMenjadi) || isNaN(hargaSatuanMenjadi)) {
        isRowValid = false;
        rowErrors.push(`Baris ${index + 1}: Kolom numerik berisi nilai yang bukan angka.`);
      }
      
      // Make sure numeric values are positive
      if (volumeSemula < 0 || hargaSatuanSemula < 0 || volumeMenjadi < 0 || hargaSatuanMenjadi < 0) {
        isRowValid = false;
        rowErrors.push(`Baris ${index + 1}: Nilai volume dan harga satuan tidak boleh negatif.`);
      }
      
      if (!isRowValid) {
        invalidCount++;
        errorMessages.push(...rowErrors);
        return;
      }
      
      // Create valid item
      const validItem: any = {
        uraian: String(row['Uraian']),
        volumeSemula,
        satuanSemula: String(row['Satuan Semula']),
        hargaSatuanSemula,
        volumeMenjadi,
        satuanMenjadi: String(row['Satuan Menjadi']),
        hargaSatuanMenjadi,
        komponenOutput: String(row['Komponen Output']),
        programPembebanan: row['Program Pembebanan'] ? String(row['Program Pembebanan']) : undefined,
        kegiatan: row['Kegiatan'] ? String(row['Kegiatan']) : undefined,
        rincianOutput: row['Rincian Output'] ? String(row['Rincian Output']) : undefined,
        subKomponen: String(row['Sub Komponen']),
        akun: String(row['Akun']),
        isApproved: false
      };
      
      console.log(`Valid item for row ${index}:`, validItem);
      validItems.push(validItem);
    });
    
    return { validItems, invalidCount, errorMessages };
  };

  // Helper function to parse numeric values from different formats
  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // Convert to string first
    const stringValue = String(value);
    
    // Remove any non-numeric characters except decimal point and minus sign
    const cleanedValue = stringValue.replace(/[^\d.-]/g, '');
    
    // Parse to float
    const numValue = parseFloat(cleanedValue);
    
    if (isNaN(numValue)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }
    
    return numValue;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
        
        <Button 
          variant="outline" 
          onClick={() => setShowHelpDialog(true)}
        >
          <AlertCircle className="h-4 w-4 mr-2" /> 
          Panduan Import
        </Button>
      </div>
      
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Panduan Import Excel</DialogTitle>
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
