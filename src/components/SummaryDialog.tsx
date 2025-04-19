
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { BudgetSummaryRecord } from '@/types/database';
import { exportComprehensiveExcel } from '@/utils/excelUtils';
import { toast } from '@/hooks/use-toast';

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BudgetItem[];
  summaryData?: BudgetSummaryRecord[];
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ 
  open, 
  onOpenChange,
  items,
  summaryData = []
}) => {
  // Calculate summary data
  const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const totalSelisih = roundToThousands(totalMenjadi - totalSemula);
  const newItems = items.filter(item => item.status === 'new').length;
  const changedItems = items.filter(item => item.status === 'changed').length;
  const deletedItems = items.filter(item => item.status === 'deleted').length;
  
  const getSelisihDescription = (selisih: number): string => {
    if (selisih > 0) return 'Bertambah';
    if (selisih < 0) return 'Berkurang';
    return 'Tetap';
  };

  const handleExportAll = () => {
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
      
      exportComprehensiveExcel(items, summaryData, "Ringkasan_Anggaran_Komprehensif");
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh file Excel"
      });
      
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Ringkasan Perubahan Pagu Anggaran</DialogTitle>
        </DialogHeader>
        
        {/* Display summary data according to the image */}
        <div className="space-y-4 p-4">
          {/* Kesimpulan section - moved to the top as requested */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Kesimpulan</h3>
            <p className="text-sm mb-2">
              Total Pagu anggaran semula sebesar {formatCurrency(totalSemula)} berubah menjadi {formatCurrency(totalMenjadi)}, dengan selisih sebesar {formatCurrency(totalSelisih)} ({getSelisihDescription(totalSelisih)}).
            </p>
            <p className="text-sm mb-2">
              Terdapat {changedItems} detil anggaran yang diubah, {newItems} detil anggaran baru, dan {deletedItems} detil anggaran yang dihapus.
            </p>
            <p className="text-sm mb-2">
              Perubahan ini diperlukan untuk mengoptimalkan alokasi anggaran sesuai dengan prioritas program dan kegiatan.
            </p>
            <p className="text-sm">
              Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white border rounded-md p-4 w-full md:w-[30%] flex-grow">
              <div className="text-sm font-medium mb-2">Total Pagu Semula</div>
              <div className="text-lg font-bold">{formatCurrency(totalSemula)}</div>
            </div>
            
            <div className="bg-white border rounded-md p-4 w-full md:w-[30%] flex-grow">
              <div className="text-sm font-medium mb-2">Total Pagu Menjadi</div>
              <div className="text-lg font-bold">{formatCurrency(totalMenjadi)}</div>
            </div>
            
            <div className={`border rounded-md p-4 w-full md:w-[30%] flex-grow ${totalSelisih > 0 ? 'bg-red-50' : totalSelisih < 0 ? 'bg-blue-50' : 'bg-white'}`}>
              <div className="text-sm font-medium mb-2">Selisih</div>
              <div className={`text-lg font-bold ${totalSelisih > 0 ? 'text-red-600' : totalSelisih < 0 ? 'text-blue-600' : ''}`}>
                {formatCurrency(totalSelisih)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="default"
              onClick={handleExportAll}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              <span>Export Excel Komprehensif</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
