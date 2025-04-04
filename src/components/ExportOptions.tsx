
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  items: BudgetItem[];
  komponenOutput: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ items, komponenOutput }) => {
  // Function to export to Excel (in a real app, this would use xlsx.js)
  const exportToExcel = () => {
    // In a real implementation, this would create an Excel file
    toast.success('Berhasil mengunduh file Excel');
    console.log('Exporting to Excel:', items);
    
    // Simulated download delay for demo purposes
    setTimeout(() => {
      toast.info('File Excel "Anggaran_Semula_Menjadi.xlsx" telah diunduh');
    }, 1500);
  };

  // Function to export to PDF (in a real app, this would use jsPDF)
  const exportToPDF = () => {
    // In a real implementation, this would create a PDF file
    toast.success('Berhasil mengunduh file PDF');
    console.log('Exporting to PDF:', items);
    
    // Simulated download delay for demo purposes
    setTimeout(() => {
      toast.info('File PDF "Anggaran_Semula_Menjadi.pdf" telah diunduh');
    }, 1500);
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
