
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExportOptionsProps {
  items: BudgetItem[];
  komponenOutput: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ items, komponenOutput }) => {
  // Prepare data for export
  const prepareExportData = () => {
    return items.map((item, index) => ({
      'No': index + 1,
      'Uraian': item.uraian,
      'Volume Semula': item.volumeSemula,
      'Satuan Semula': item.satuanSemula,
      'Harga Satuan Semula': item.hargaSatuanSemula,
      'Jumlah Semula': item.jumlahSemula,
      'Volume Menjadi': item.volumeMenjadi,
      'Satuan Menjadi': item.satuanMenjadi,
      'Harga Satuan Menjadi': item.hargaSatuanMenjadi,
      'Jumlah Menjadi': item.jumlahMenjadi,
      'Selisih': item.selisih,
      'Status': item.status
    }));
  };

  // Function to export to Excel
  const exportToExcel = () => {
    if (items.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const exportData = prepareExportData();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Budget");
      
      // Add footer with totals
      const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
      const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
      const totalSelisih = totalMenjadi - totalSemula;
      
      XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "TOTAL", "", "", "", totalSemula, "", "", "", totalMenjadi, totalSelisih, ""]
      ], {origin: -1});
      
      // Generate Excel file
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Berhasil mengunduh file Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Gagal mengunduh file. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={exportToExcel}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
};

export default ExportOptions;
