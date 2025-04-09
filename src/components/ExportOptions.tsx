
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExportOptionsProps {
  items: BudgetItem[];
  komponenOutput: string;
  onClose?: () => void; // Added this optional property
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ items, komponenOutput, onClose }) => {
  // Prepare data for export
  const prepareExportData = () => {
    return items.map((item, index) => ({
      'No': index + 1,
      'Program Pembebanan': item.programPembebanan || '-',
      'Kegiatan': item.kegiatan || '-',
      'Rincian Output': item.rincianOutput || '-',
      'Komponen Output': item.komponenOutput || '-',
      'Sub Komponen': item.subKomponen || '-',
      'Akun': item.akun || '-',
      'Uraian': item.uraian,
      'Volume Semula': item.volumeSemula,
      'Satuan Semula': item.satuanSemula,
      'Harga Satuan Semula': item.hargaSatuanSemula, // Keep original value without rounding
      'Jumlah Semula': roundToThousands(item.jumlahSemula), // Apply rounding to thousands
      'Volume Menjadi': item.volumeMenjadi,
      'Satuan Menjadi': item.satuanMenjadi,
      'Harga Satuan Menjadi': item.hargaSatuanMenjadi, // Keep original value without rounding
      'Jumlah Menjadi': roundToThousands(item.jumlahMenjadi), // Apply rounding to thousands
      'Selisih': roundToThousands(item.jumlahMenjadi - item.jumlahSemula), // Ensure calculation is correct
      'Status': item.status
    }));
  };

  // Function to export to Excel
  const exportToExcel = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: "Tidak ada data untuk diekspor"
      });
      return;
    }

    try {
      const exportData = prepareExportData();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Budget");
      
      // Add footer with totals
      const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
      const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
      const totalSelisih = roundToThousands(totalMenjadi - totalSemula); // Ensure calculation is correct
      
      XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "TOTAL", "", "", "", "", "", "", "", "", "", totalSemula, "", "", "", totalMenjadi, totalSelisih, ""]
      ], {origin: -1});
      
      // Generate Excel file
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file Excel"
      });
      
      // Call onClose if it exists
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal mengunduh file. Silakan coba lagi."
      });
    }
  };

  return (
    <Button variant="outline" onClick={exportToExcel}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Export Excel
    </Button>
  );
};

export default ExportOptions;
