
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency } from './budgetCalculations';

export const exportToJpeg = async (element: HTMLElement, fileName: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const link = document.createElement('a');
    link.download = `${fileName}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    throw new Error('Failed to export to JPEG');
  }
};

export const exportToPdf = async (element: HTMLElement, fileName: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};

export const exportToExcel = async (data: any[], fileName: string) => {
  try {
    // Format the data for Excel
    const formattedData = data.map(item => ({
      'Nama': item.name,
      'Total Semula': formatCurrency(item.totalSemula, false),
      'Total Menjadi': formatCurrency(item.totalMenjadi, false),
      'Selisih': formatCurrency(item.totalSelisih, false),
      'Item Baru': item.newItems,
      'Item Berubah': item.changedItems,
      'Total Item': item.totalItems
    }));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate Excel file
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};
