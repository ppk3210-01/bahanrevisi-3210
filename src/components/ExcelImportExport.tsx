
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilePlus2, Download, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { 
  Tooltip,
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
      'Volume Semula': 1,
      'Satuan Semula': 'Paket',
      'Harga Satuan Semula': 1000000,
      'Volume Menjadi': 1,
      'Satuan Menjadi': 'Paket',
      'Harga Satuan Menjadi': 1000000,
    },
    {
      'Program Pembebanan': '054.01.GG',
      'Kegiatan': '2896',
      'Rincian Output': '2896.BMA',
      'Komponen Output': '2896.BMA.004',
      'Sub Komponen': 'SK123',
      'Akun': '522151',
      'Uraian': 'Contoh Isian Data 1',
      'Volume Semula': 2,
      'Satuan Semula': 'Bulan',
      'Harga Satuan Semula': 500000,
      'Volume Menjadi': 3,
      'Satuan Menjadi': 'Bulan',
      'Harga Satuan Menjadi': 500000,
    },
    {
      'Program Pembebanan': '054.01.GG',
      'Kegiatan': '2896',
      'Rincian Output': '2896.BMA',
      'Komponen Output': '2896.BMA.004',
      'Sub Komponen': 'SK123',
      'Akun': '522151',
      'Uraian': 'Contoh Isian Data 2',
      'Volume Semula': 1,
      'Satuan Semula': 'Paket',
      'Harga Satuan Semula': 2500000,
      'Volume Menjadi': 1,
      'Satuan Menjadi': 'Paket',
      'Harga Satuan Menjadi': 3000000,
    }
  ];

  const templateInstructions = `
PETUNJUK PENGISIAN:
1. Baris pertama adalah contoh format (tidak perlu dihapus)
2. Data dimulai dari baris kedua
3. Semua kolom harus diisi
4. Format data:
   - Program Pembebanan, Kegiatan, Rincian Output, Komponen Output, Sub Komponen, Akun: teks
   - Uraian: teks
   - Volume Semula, Volume Menjadi: angka positif
   - Satuan Semula, Satuan Menjadi: teks (contoh: Paket, Bulan, OB, OH, dll)
   - Harga Satuan Semula, Harga Satuan Menjadi: angka positif tanpa titik/koma
5. Pastikan tidak ada sel yang kosong
  `;

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
    
    // Add instruction sheet
    const instructionSheet = XLSX.utils.aoa_to_sheet([
      ['PETUNJUK PENGISIAN TEMPLATE'],
      [''],
      ['1. Baris pertama adalah contoh format (tidak perlu dihapus)'],
      ['2. Data dimulai dari baris kedua'],
      ['3. Semua kolom harus diisi dengan lengkap sesuai format'],
      ['4. Format data untuk masing-masing kolom:'],
      ['   - Program Pembebanan: teks (contoh: 054.01.GG)'],
      ['   - Kegiatan: teks (contoh: 2896)'],
      ['   - Rincian Output: teks (contoh: 2896.BMA)'],
      ['   - Komponen Output: teks (contoh: 2896.BMA.004)'],
      ['   - Sub Komponen: teks (contoh: SK123)'],
      ['   - Akun: teks (contoh: 522151)'],
      ['   - Uraian: teks - deskripsi anggaran'],
      ['   - Volume Semula: angka positif'],
      ['   - Satuan Semula: teks (contoh: Paket, Bulan, OB, OH, dll)'],
      ['   - Harga Satuan Semula: angka positif tanpa titik/koma'],
      ['   - Volume Menjadi: angka positif'],
      ['   - Satuan Menjadi: teks (contoh: Paket, Bulan, OB, OH, dll)'],
      ['   - Harga Satuan Menjadi: angka positif tanpa titik/koma'],
      ['5. Pastikan tidak ada sel yang kosong'],
      ['6. Jangan mengubah format kolom, seperti menambah atau mengurangi kolom'],
      ['7. Semua nilai angka harus diisi tanpa format pemisah ribuan (titik/koma)'],
      [''],
      ['Contoh format yang benar:'],
      ['Program Pembebanan: 054.01.GG'],
      ['Kegiatan: 2896'],
      ['Rincian Output: 2896.BMA'],
      ['Komponen Output: 2896.BMA.004'],
      ['Sub Komponen: SK123'],
      ['Akun: 522151'],
      ['Uraian: Honor Narasumber'],
      ['Volume Semula: 2'],
      ['Satuan Semula: Orang'],
      ['Harga Satuan Semula: 1000000  (tulis sebagai angka tanpa pemisah ribuan)'],
      ['Volume Menjadi: 3'],
      ['Satuan Menjadi: Orang'],
      ['Harga Satuan Menjadi: 1000000  (tulis sebagai angka tanpa pemisah ribuan)'],
    ]);
    
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Petunjuk');
    
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
          if (!data) {
            reject(new Error('Failed to read file data'));
            return;
          }
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Parsed Excel data:', jsonData);
          resolve(jsonData);
        } catch (error) {
          console.error('Error parsing Excel:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  };

  // Function to validate data
  const validateData = (data: any[]): Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] => {
    const validItems: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] = [];
    
    let invalidCount = 0;
    
    data.forEach((row, index) => {
      console.log(`Validating row ${index + 1}:`, row);
      
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
      
      const missingFields = requiredFields.filter(field => {
        const hasField = field in row && row[field] !== undefined && row[field] !== null && row[field] !== '';
        if (!hasField) {
          console.log(`Missing field in row ${index + 1}: ${field}`);
        }
        return !hasField;
      });
      
      if (missingFields.length > 0) {
        console.log(`Row ${index + 1} has missing fields:`, missingFields);
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
        console.log(`Row ${index + 1} has invalid numeric fields:`, {
          volumeSemula,
          hargaSatuanSemula,
          volumeMenjadi,
          hargaSatuanMenjadi
        });
        invalidCount++;
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
      
      console.log(`Row ${index + 1} is valid:`, validItem);
      validItems.push(validItem);
    });
    
    if (invalidCount > 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: `${invalidCount} baris dilewati karena data tidak lengkap atau tidak valid`
      });
    }
    
    console.log('Valid items:', validItems);
    return validItems;
  };

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" /> 
            Download Template
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4 text-sm">
          <p className="font-bold mb-1">Format Template Excel:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Template berisi 13 kolom wajib diisi</li>
            <li>Kolom number (Volume & Harga) format angka biasa tanpa pemisah ribuan</li>
            <li>File berisi sheet contoh dan petunjuk lengkap</li>
            <li>Ikuti contoh yang ada di template</li>
          </ul>
        </TooltipContent>
      </Tooltip>
      
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
          className="w-full sm:w-auto"
        >
          <FilePlus2 className="h-4 w-4 mr-2" /> 
          {isLoading ? 'Importing...' : 'Import Excel'}
        </Button>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4 text-blue-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4 text-sm">
          <p className="font-bold mb-1">Panduan Import Excel:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Download template terlebih dahulu</li>
            <li>Isi sesuai format yang telah ditentukan</li>
            <li>Pastikan semua kolom diisi dengan benar</li>
            <li>Hindari penggunaan format khusus seperti mata uang</li>
            <li>Simpan file dalam format .xlsx</li>
            <li>Upload file melalui tombol Import Excel</li>
          </ol>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ExcelImportExport;
