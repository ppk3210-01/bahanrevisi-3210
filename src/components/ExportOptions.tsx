import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  FileImage, 
  FileText,
  Loader2 
} from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { toast } from '@/hooks/use-toast';
import { exportComprehensiveExcel } from '@/utils/excelUtils';
import { BudgetSummaryRecord } from '@/types/database';

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
  const [isExporting, setIsExporting] = useState<{
    excel: boolean;
    jpeg: boolean;
    pdf: boolean;
  }>({
    excel: false,
    jpeg: false,
    pdf: false
  });

  const exportToExcel = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: "Tidak ada data untuk diekspor"
      });
      return;
    }

    try {
      setIsExporting(prev => ({ ...prev, excel: true }));
      
      toast({
        title: "Memproses",
        description: "Menyiapkan file Excel..."
      });
      
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}`;
      await exportComprehensiveExcel(items, summaryData, fileName);
      
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
    } finally {
      setIsExporting(prev => ({ ...prev, excel: false }));
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
      setIsExporting(prev => ({ ...prev, jpeg: true }));
      
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
      
      // Import formatter from budgetCalculations
      const { formatCurrency, roundToThousands } = await import('@/utils/budgetCalculations');
      
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
      
      // Import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Use html2canvas to convert the table into a canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Increased scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
        onclone: (document, element) => {
          // Make sure all elements are visible
          const allElements = element.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              el.style.display = window.getComputedStyle(el).display;
            }
          }
        }
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
        description: "Gagal mengunduh file. Silakan coba lagi. " + (error instanceof Error ? error.message : '')
      });
    } finally {
      setIsExporting(prev => ({ ...prev, jpeg: false }));
    }
  };

  const exportToPDF = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: "Tidak ada data untuk diekspor"
      });
      return;
    }

    try {
      setIsExporting(prev => ({ ...prev, pdf: true }));
      
      toast({
        title: "Memproses",
        description: "Menyiapkan PDF..."
      });

      // Import dependencies
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      // Import jsPDF-AutoTable as an ES module
      await import('jspdf-autotable');
      const { formatCurrency, roundToThousands } = await import('@/utils/budgetCalculations');
      
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
      // Explicitly cast pdf to any to access the autoTable method added by the plugin
      (pdf as any).autoTable({
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
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' }, // No
          1: { cellWidth: 40 }, // Uraian - reduced width to fit on page
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
        didDrawPage: (data) => {
          // Add page number
          const str = 'Page ' + pdf.getNumberOfPages();
          pdf.setFontSize(8);
          const pageWidth = pdf.internal.pageSize.width;
          pdf.text(str, pageWidth - 20, pdf.internal.pageSize.height - 10);
        }
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
        description: "Gagal mengunduh file. Silakan coba lagi. " + (error instanceof Error ? error.message : '')
      });
    } finally {
      setIsExporting(prev => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={exportToExcel} disabled={isExporting.excel}>
        {isExporting.excel ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4" />
        )}
        Excel
      </Button>
      <Button variant="outline" onClick={exportToJPEG} disabled={isExporting.jpeg}>
        {isExporting.jpeg ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileImage className="mr-2 h-4 w-4" />
        )}
        JPEG
      </Button>
      <Button variant="outline" onClick={exportToPDF} disabled={isExporting.pdf}>
        {isExporting.pdf ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        PDF
      </Button>
    </div>
  );
};

export default ExportOptions;
