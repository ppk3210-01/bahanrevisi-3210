
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
      
      if (result.validItems.length > 0) {
        await onImport(result.validItems);
        
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
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Tidak ada data valid dalam file. ${result.errorMessages.join(' ')}`
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengimpor data. Periksa kembali format file Anda."
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          resolve(jsonData);
        } catch (error) {
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

    // Check if first row has the required headers
    if (data.length > 0) {
      const firstRow = data[0];
      const missingHeaders = requiredFields.filter(field => !(field in firstRow));
      if (missingHeaders.length > 0) {
        errorMessages.push(`Kolom yang diperlukan tidak ditemukan: ${missingHeaders.join(', ')}.`);
      }
    }
    
    data.forEach((row, index) => {
      let isRowValid = true;
      const rowErrors: string[] = [];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => !row[field] && row[field] !== 0);
      
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
        volumeSemula = typeof row['Volume Semula'] === 'number' ? row['Volume Semula'] : Number(String(row['Volume Semula']).replace(/,/g, ''));
        hargaSatuanSemula = typeof row['Harga Satuan Semula'] === 'number' ? row['Harga Satuan Semula'] : Number(String(row['Harga Satuan Semula']).replace(/,/g, ''));
        volumeMenjadi = typeof row['Volume Menjadi'] === 'number' ? row['Volume Menjadi'] : Number(String(row['Volume Menjadi']).replace(/,/g, ''));
        hargaSatuanMenjadi = typeof row['Harga Satuan Menjadi'] === 'number' ? row['Harga Satuan Menjadi'] : Number(String(row['Harga Satuan Menjadi']).replace(/,/g, ''));
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
      const validItem = {
        uraian: String(row['Uraian']),
        volumeSemula,
        satuanSemula: String(row['Satuan Semula']),
        hargaSatuanSemula,
        volumeMenjadi,
        satuanMenjadi: String(row['Satuan Menjadi']),
        hargaSatuanMenjadi,
        komponenOutput: String(row['Komponen Output']),
        programPembebanan: String(row['Program Pembebanan']),
        kegiatan: String(row['Kegiatan']),
        rincianOutput: String(row['Rincian Output']),
        subKomponen: String(row['Sub Komponen']),
        akun: String(row['Akun']),
        isApproved: false
      };
      
      validItems.push(validItem);
    });
    
    return { validItems, invalidCount, errorMessages };
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Panduan Import Excel</DialogTitle>
            <DialogDescription>
              Petunjuk cara mengimpor data menggunakan file Excel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Format File</h3>
            <p>File Excel (.xlsx atau .xls) harus memiliki format berikut:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 p-2">Kolom</th>
                    <th className="border border-gray-200 p-2">Tipe Data</th>
                    <th className="border border-gray-200 p-2">Format</th>
                    <th className="border border-gray-200 p-2">Contoh</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-2">Program Pembebanan</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">054.01.GG</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Kegiatan</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">2896</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Rincian Output</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">2896.BMA</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Komponen Output</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">2896.BMA.004</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Sub Komponen</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">005</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Akun</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">522151</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Uraian</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">Belanja Jasa Profesi</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Volume Semula</td>
                    <td className="border border-gray-200 p-2">Number</td>
                    <td className="border border-gray-200 p-2">General atau Number</td>
                    <td className="border border-gray-200 p-2">1</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Satuan Semula</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">Paket</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Harga Satuan Semula</td>
                    <td className="border border-gray-200 p-2">Number</td>
                    <td className="border border-gray-200 p-2">General, Number atau Currency</td>
                    <td className="border border-gray-200 p-2">1000000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Volume Menjadi</td>
                    <td className="border border-gray-200 p-2">Number</td>
                    <td className="border border-gray-200 p-2">General atau Number</td>
                    <td className="border border-gray-200 p-2">1</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Satuan Menjadi</td>
                    <td className="border border-gray-200 p-2">Text</td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2">Paket</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">Harga Satuan Menjadi</td>
                    <td className="border border-gray-200 p-2">Number</td>
                    <td className="border border-gray-200 p-2">General, Number atau Currency</td>
                    <td className="border border-gray-200 p-2">1200000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h3 className="text-lg font-medium">Petunjuk Import</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Unduh template dengan klik tombol <strong>Download Template</strong>.</li>
              <li>Buka file template dengan Microsoft Excel atau aplikasi spreadsheet lainnya.</li>
              <li>Isikan data sesuai format yang telah ditentukan. Pastikan semua kolom terisi dengan benar.</li>
              <li>Simpan file Excel setelah selesai mengisi data.</li>
              <li>Klik tombol <strong>Import Excel</strong> dan pilih file yang telah diisi.</li>
              <li>Tunggu hingga proses import selesai.</li>
            </ol>
            
            <h3 className="text-lg font-medium">Tips Import</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Pastikan format kolom numerik sudah benar (Volume dan Harga Satuan).</li>
              <li>Jangan mengubah nama kolom pada baris pertama.</li>
              <li>Pastikan tidak ada sel yang kosong pada baris data.</li>
              <li>Jika menggunakan template dari aplikasi ini, format kolom sudah diatur dengan benar.</li>
              <li>Pastikan nilai numerik tidak menggunakan tanda pemisah ribuan seperti titik atau koma.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelImportExport;
