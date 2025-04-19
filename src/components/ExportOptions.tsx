
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  FileImage, 
  FileText 
} from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { exportComprehensiveExcel } from '@/utils/excelUtils';
import { BudgetSummaryRecord } from '@/types/database';

// Add type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportOptionsProps {
  items: BudgetItem[];
  komponenOutput: string;
  summaryData?: BudgetSummaryRecord[];
  onClose?: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  items, 
  komponenOutput, 
  summaryData = [],
  onClose 
}) => {
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
      toast({
        title: "Memproses",
        description: "Menyiapkan file Excel..."
      });
      
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}`;
      exportComprehensiveExcel(items, summaryData, fileName);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file Excel"
      });
      
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

  const exportToJPEG = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: "Tidak ada data untuk diekspor"
      });
      return;
    }

    try {
      toast({
        title: "Memproses",
        description: "Menyiapkan gambar..."
      });

      // Create a temporary container for the table in the DOM
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.padding = '20px';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);
      
      // Add a title
      const title = document.createElement('h2');
      title.textContent = `Anggaran ${komponenOutput || ''}`;
      title.style.marginBottom = '10px';
      container.appendChild(title);
      
      // Create the table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.border = '1px solid #ddd';
      
      // Create header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const headers = [
        'No', 'Uraian', 'Volume Semula', 'Satuan Semula', 'Harga Satuan Semula', 
        'Jumlah Semula', 'Volume Menjadi', 'Satuan Menjadi', 'Harga Satuan Menjadi', 
        'Jumlah Menjadi', 'Selisih', 'Status'
      ];
      
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.padding = '8px';
        th.style.border = '1px solid #ddd';
        th.style.backgroundColor = '#f2f2f2';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create tbody
      const tbody = document.createElement('tbody');
      
      // Add data rows
      items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        
        const cells = [
          index + 1,
          item.uraian,
          item.volumeSemula,
          item.satuanSemula,
          formatCurrency(roundToThousands(item.hargaSatuanSemula)),
          formatCurrency(roundToThousands(item.jumlahSemula)),
          item.volumeMenjadi,
          item.satuanMenjadi,
          formatCurrency(roundToThousands(item.hargaSatuanMenjadi)),
          formatCurrency(roundToThousands(item.jumlahMenjadi)),
          formatCurrency(roundToThousands(item.jumlahMenjadi - item.jumlahSemula)),
          item.status
        ];
        
        cells.forEach((cellText, idx) => {
          const td = document.createElement('td');
          td.textContent = cellText !== null ? String(cellText) : '';
          td.style.padding = '8px';
          td.style.border = '1px solid #ddd';
          
          // Center align specific columns
          if ([0, 2, 3, 6, 7, 11].includes(idx)) {
            td.style.textAlign = 'center';
          } else if ([4, 5, 8, 9, 10].includes(idx)) {
            td.style.textAlign = 'right';
          }
          
          row.appendChild(td);
        });
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      
      // Add footer row
      const tfoot = document.createElement('tfoot');
      const footerRow = document.createElement('tr');
      footerRow.style.backgroundColor = '#f2f2f2';
      footerRow.style.fontWeight = 'bold';
      
      const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
      const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
      const totalSelisih = totalMenjadi - totalSemula;
      
      const footerCells = [
        '', 'TOTAL', '', '', '', 
        formatCurrency(totalSemula), '', '', '',
        formatCurrency(totalMenjadi), formatCurrency(totalSelisih), ''
      ];
      
      footerCells.forEach((cellText, idx) => {
        const td = document.createElement('td');
        td.textContent = cellText;
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        
        // Right-align currency columns
        if ([5, 9, 10].includes(idx)) {
          td.style.textAlign = 'right';
        }
        
        footerRow.appendChild(td);
      });
      
      tfoot.appendChild(footerRow);
      table.appendChild(tfoot);
      
      // Add the table to the container
      container.appendChild(table);
      
      // Use html2canvas to convert the table into a canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Increased scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Create a link element to trigger download
      const link = document.createElement('a');
      link.download = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      document.body.removeChild(container);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file JPEG"
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error exporting to JPEG:', error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal mengunduh file. Silakan coba lagi."
      });
    }
  };

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
      toast({
        title: "Memproses",
        description: "Menyiapkan PDF..."
      });

      // Create new jsPDF document (landscape orientation)
      const pdf = new jsPDF('landscape');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`Anggaran ${komponenOutput || ''}`, 14, 20);
      
      // Prepare table data
      const tableData = items.map((item, index) => [
        index + 1,
        item.uraian,
        item.volumeSemula,
        item.satuanSemula,
        formatCurrency(roundToThousands(item.hargaSatuanSemula)),
        formatCurrency(roundToThousands(item.jumlahSemula)),
        item.volumeMenjadi,
        item.satuanMenjadi,
        formatCurrency(roundToThousands(item.hargaSatuanMenjadi)),
        formatCurrency(roundToThousands(item.jumlahMenjadi)),
        formatCurrency(roundToThousands(item.jumlahMenjadi - item.jumlahSemula)),
        item.status
      ]);
      
      // Define headers
      const headers = [
        'No', 'Uraian', 'Vol Semula', 'Sat Semula', 'HS Semula', 
        'Jml Semula', 'Vol Menjadi', 'Sat Menjadi', 'HS Menjadi', 
        'Jml Menjadi', 'Selisih', 'Status'
      ];
      
      // Calculate totals
      const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
      const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
      const totalSelisih = totalMenjadi - totalSemula;
      
      // Add total row
      tableData.push([
        '', 'TOTAL', '', '', '', 
        formatCurrency(totalSemula), '', '', '',
        formatCurrency(totalMenjadi), formatCurrency(totalSelisih), ''
      ]);
      
      // Generate the table using autoTable plugin
      pdf.autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headerStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        footerStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' }, // No
          1: { cellWidth: 70 }, // Uraian
          2: { cellWidth: 15, halign: 'center' }, // Volume Semula
          3: { cellWidth: 15, halign: 'center' }, // Satuan Semula
          4: { cellWidth: 20, halign: 'right' }, // Harga Satuan Semula
          5: { cellWidth: 20, halign: 'right' }, // Jumlah Semula
          6: { cellWidth: 15, halign: 'center' }, // Volume Menjadi
          7: { cellWidth: 15, halign: 'center' }, // Satuan Menjadi
          8: { cellWidth: 20, halign: 'right' }, // Harga Satuan Menjadi
          9: { cellWidth: 20, halign: 'right' }, // Jumlah Menjadi
          10: { cellWidth: 20, halign: 'right' }, // Selisih
          11: { cellWidth: 15, halign: 'center' } // Status
        },
        margin: { top: 30 }
      });
      
      // Generate and save the PDF file directly
      const pdfOutput = pdf.output('blob');
      const url = URL.createObjectURL(pdfOutput);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file PDF"
      });
      
      if (onClose) {
        onClose();
      }
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
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={exportToExcel}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" onClick={exportToJPEG}>
        <FileImage className="mr-2 h-4 w-4" />
        JPEG
      </Button>
      <Button variant="outline" onClick={exportToPDF}>
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
};

export default ExportOptions;
