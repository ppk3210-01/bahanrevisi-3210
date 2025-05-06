
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency } from './budgetCalculations';

export const exportToJpeg = async (element: HTMLElement, fileName: string) => {
  try {
    // Wait for any pending renders to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    
    // Apply styles to make sure the element is fully visible
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.width = element.offsetWidth + 'px';
    clonedElement.style.background = '#ffffff';
    
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff',
      // Wait for images and resources to load
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
    
    // Clean up the cloned element
    document.body.removeChild(clonedElement);
    
    // Create and trigger download link
    const link = document.createElement('a');
    link.download = `${fileName}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    throw new Error('Failed to export to JPEG');
  }
};

export const exportToPdf = async (element: HTMLElement, fileName: string) => {
  try {
    // Wait for any pending renders to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    
    // Apply styles to make sure the element is fully visible
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.width = element.offsetWidth + 'px';
    clonedElement.style.background = '#ffffff';
    
    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      // Wait for images and resources to load
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
    
    // Clean up the cloned element
    document.body.removeChild(clonedElement);
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Calculate the PDF dimensions based on the canvas
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF with appropriate dimensions
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
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
