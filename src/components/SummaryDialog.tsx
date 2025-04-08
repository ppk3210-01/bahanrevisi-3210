
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/budgetCalculations';
import { BudgetSummary } from '@/types/budget';
import DetailedSummaryView from '@/components/DetailedSummaryView';

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: BudgetSummary;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ 
  open, 
  onOpenChange,
  summary
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ringkasan Perubahan Anggaran</DialogTitle>
          <DialogDescription>
            Detail perubahan pada anggaran yang tersedia.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Total Anggaran Semula</p>
              <p className="text-lg font-bold">{formatCurrency(summary.totalSemula)}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Total Anggaran Menjadi</p>
              <p className="text-lg font-bold">{formatCurrency(summary.totalMenjadi)}</p>
            </div>
            
            <div className={`p-3 rounded-lg ${summary.totalSelisih >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={`text-xs mb-1 ${summary.totalSelisih >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                Selisih ({summary.totalSelisih >= 0 ? '+' : '-'})
              </p>
              <p className="text-lg font-bold">{formatCurrency(Math.abs(summary.totalSelisih))}</p>
            </div>
          </div>
          
          <Tabs defaultValue="changed">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="changed">
                Item Diubah ({summary.changedItems.length})
              </TabsTrigger>
              <TabsTrigger value="new">
                Item Baru ({summary.newItems.length})
              </TabsTrigger>
              <TabsTrigger value="deleted">
                Item Dihapus ({summary.deletedItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="changed">
              <DetailedSummaryView items={summary.changedItems} type="changed" />
            </TabsContent>
            
            <TabsContent value="new">
              <DetailedSummaryView items={summary.newItems} type="new" />
            </TabsContent>
            
            <TabsContent value="deleted">
              <DetailedSummaryView items={summary.deletedItems} type="deleted" />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
