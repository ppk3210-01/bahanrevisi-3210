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
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportOptionsProps {
  items: BudgetItem[];
  komponenOutput: string;
  onClose?: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ items, komponenOutput, onClose }) => {
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
      'Harga Satuan Semula': item.hargaSatuanSemula, 
      'Jumlah Semula': roundToThousands(item.jumlahSemula),
      'Volume Menjadi': item.volumeMenjadi,
      'Satuan Menjadi': item.satuanMenjadi,
      'Harga Satuan Menjadi': item.hargaSatuanMenjadi, 
      'Jumlah Menjadi': roundToThousands(item.jumlahMenjadi),
      'Selisih': roundToThousands(item.jumlahMenjadi - item.jumlahSemula),
      'Status': item.status
    }));
  };

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
      
      const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
      const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
      const totalSelisih = roundToThousands(totalMenjadi - totalSemula);
      
      XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "TOTAL", "", "", "", "", "", "", "", "", "", totalSemula, "", "", "", totalMenjadi, totalSelisih, ""]
      ], {origin: -1});
      
      const fileName = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
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

      const tempTable = document.createElement('table');
      tempTable.style.borderCollapse = 'collapse';
      tempTable.style.width = '100%';
      tempTable.style.fontFamily = 'Arial, sans-serif';
      tempTable.style.fontSize = '12px';
      
      const headerRow = document.createElement('tr');
      headerRow.style.backgroundColor = '#f0f0f0';
      
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
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
      });
      
      tempTable.appendChild(headerRow);
      
      items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        
        const cells = [
          index + 1,
          item.uraian,
          item.volumeSemula,
          item.satuanSemula,
          formatCurrency(item.hargaSatuanSemula),
          formatCurrency(item.jumlahSemula),
          item.volumeMenjadi,
          item.satuanMenjadi,
          formatCurrency(item.hargaSatuanMenjadi),
          formatCurrency(item.jumlahMenjadi),
          formatCurrency(item.jumlahMenjadi - item.jumlahSemula),
          item.status
        ];
        
        cells.forEach(cellText => {
          const td = document.createElement('td');
          td.textContent = String(cellText);
          td.style.padding = '8px';
          td.style.border = '1px solid #ddd';
          row.appendChild(td);
        });
        
        tempTable.appendChild(row);
      });
      
      const footerRow = document.createElement('tr');
      footerRow.style.backgroundColor = '#f0f0f0';
      footerRow.style.fontWeight = 'bold';
      
      const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
      const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
      const totalSelisih = totalMenjadi - totalSemula;
      
      const footerCells = [
        '', 'TOTAL', '', '', '', 
        formatCurrency(totalSemula), '', '', '',
        formatCurrency(totalMenjadi), formatCurrency(totalSelisih), ''
      ];
      
      footerCells.forEach((cellText, index) => {
        const td = document.createElement('td');
        td.textContent = String(cellText);
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        if (index === 1) {
          td.style.textAlign = 'left';
        } else if (index === 5 || index === 9 || index === 10) {
          td.style.textAlign = 'right';
        }
        footerRow.appendChild(td);
      });
      
      tempTable.appendChild(footerRow);
      
      const titleDiv = document.createElement('div');
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.fontSize = '16px';
      titleDiv.style.marginBottom = '10px';
      titleDiv.textContent = `Anggaran ${komponenOutput || ''}`;
      
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.maxWidth = '1200px';
      container.appendChild(titleDiv);
      container.appendChild(tempTable);
      
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      const canvas = await html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      
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

      const pdf = new jsPDF('landscape', 'pt', 'a4');
      
      pdf.setFontSize(16);
      pdf.text(`Anggaran ${komponenOutput || ''}`, 40, 40);
      
      const tableData = items.map((item, index) => [
        index + 1,
        item.uraian,
        item.volumeSemula,
        item.satuanSemula,
        formatCurrency(item.hargaSatuanSemula),
        formatCurrency(item.jumlahSemula),
        item.volumeMenjadi,
        item.satuanMenjadi,
        formatCurrency(item.hargaSatuanMenjadi),
        formatCurrency(item.jumlahMenjadi),
        formatCurrency(item.jumlahMenjadi - item.jumlahSemula),
        item.status
      ]);
      
      const headers = [
        'No', 'Uraian', 'Vol Semula', 'Sat Semula', 'HS Semula', 
        'Jml Semula', 'Vol Menjadi', 'Sat Menjadi', 'HS Menjadi', 
        'Jml Menjadi', 'Selisih', 'Status'
      ];
      
      const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
      const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
      const totalSelisih = totalMenjadi - totalSemula;
      
      tableData.push([
        '', 'TOTAL', '', '', '', 
        formatCurrency(totalSemula), '', '', '',
        formatCurrency(totalMenjadi), formatCurrency(totalSelisih), ''
      ]);
      
      pdf.autoTable({
        head: [headers],
        body: tableData,
        startY: 60,
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 120 }
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249]
        },
        rowStyles: {
          0: { fontStyle: 'bold' }
        }
      });
      
      pdf.save(`Anggaran_${komponenOutput ? komponenOutput.replace(/\s+/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
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
