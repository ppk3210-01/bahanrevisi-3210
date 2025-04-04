
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
      'Pembebanan': item.komponenOutput,
      'Volume Semula': item.volumeSemula,
      'Satuan Semula': item.satuanSemula,
      'Harga Satuan Semula': item.hargaSatuanSemula,
      'Jumlah Semula': roundToThousands(item.jumlahSemula),
      'Volume Menjadi': item.volumeMenjadi,
      'Satuan Menjadi': item.satuanMenjadi,
      'Harga Satuan Menjadi': item.hargaSatuanMenjadi,
      'Jumlah Menjadi': roundToThousands(item.jumlahMenjadi),
      'Selisih': roundToThousands(item.selisih),
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
      const totalSelisih = roundToThousands(totalMenjadi - totalSemula);
      
      XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "TOTAL", "", "", "", "", totalSemula, "", "", "", totalMenjadi, totalSelisih, ""]
      ], {origin: -1});
      
      // Generate Excel file
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file Excel"
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal mengunduh file. Silakan coba lagi."
      });
    }
  };

  // Function to export to PDF using jsPDF
  const exportToPDF = () => {
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
      const doc = new jsPDF('landscape', 'mm', 'a4') as any; // using any to avoid TypeScript issues with jsPDF-autotable
      
      // Add title
      doc.setFontSize(14);
      doc.text('Anggaran Semula vs Menjadi', 14, 10);
      doc.setFontSize(12);
      doc.text(`Komponen Output: ${komponenOutput || 'Semua Data'}`, 14, 18);
      
      // Create table structure for PDF
      const tableColumn = [
        'No', 'Uraian', 'Pembebanan', 'Volume Semula', 'Satuan Semula', 'Harga Satuan Semula', 
        'Jumlah Semula', 'Volume Menjadi', 'Satuan Menjadi', 'Harga Satuan Menjadi', 
        'Jumlah Menjadi', 'Selisih'
      ];
      
      // Convert our data to a format jsPDF-autotable can use
      const tableRows = exportData.map(item => [
        item['No'],
        item['Uraian'],
        item['Pembebanan'],
        item['Volume Semula'],
        item['Satuan Semula'],
        formatCurrency(item['Harga Satuan Semula']),
        formatCurrency(item['Jumlah Semula']),
        item['Volume Menjadi'],
        item['Satuan Menjadi'],
        formatCurrency(item['Harga Satuan Menjadi']),
        formatCurrency(item['Jumlah Menjadi']),
        formatCurrency(item['Selisih'])
      ]);
      
      // Calculate totals
      const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
      const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
      const totalSelisih = roundToThousands(totalMenjadi - totalSemula);
      
      // Add total row
      tableRows.push([
        '', 'TOTAL', '', '', '', '', 
        formatCurrency(totalSemula), '', '', '', 
        formatCurrency(totalMenjadi), formatCurrency(totalSelisih)
      ]);
      
      // Generate PDF with autotable
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 } }
      });
      
      // Save the PDF with a filename
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file PDF"
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal mengunduh file. Silakan coba lagi."
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={exportToExcel}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
      
      <Button variant="outline" onClick={exportToPDF}>
        <FileText className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
};

export default ExportOptions;
