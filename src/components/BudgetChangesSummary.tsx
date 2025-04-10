
import React from 'react';
import { BudgetItem } from '@/types/budget';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetChangesSummaryProps {
  items: BudgetItem[];
}

const BudgetChangesSummary: React.FC<BudgetChangesSummaryProps> = ({ items }) => {
  // Calculate summary data
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  // Group by status
  const unchangedItems = items.filter(item => item.status === 'unchanged');
  const changedItems = items.filter(item => item.status === 'changed');
  const newItems = items.filter(item => item.status === 'new');
  const deletedItems = items.filter(item => item.status === 'deleted');
  
  const totalUnchangedSemula = unchangedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalUnchangedMenjadi = unchangedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  
  const totalChangedSemula = changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalChangedMenjadi = changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalChangedSelisih = totalChangedMenjadi - totalChangedSemula;
  
  const totalNewSemula = newItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalNewMenjadi = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalNewSelisih = totalNewMenjadi - totalNewSemula;
  
  const totalDeletedSemula = deletedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalDeletedMenjadi = deletedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalDeletedSelisih = totalDeletedMenjadi - totalDeletedSemula;

  // Create conclusion text
  const getConclusionText = () => {
    const totalItemsChanged = changedItems.length + newItems.length + deletedItems.length;
    const changeDirection = totalSelisih > 0 ? "bertambah" : totalSelisih < 0 ? "berkurang" : "tetap";
    
    return (
      <div className="space-y-2 text-sm">
        <p>
          Berdasarkan hasil analisis terhadap alokasi anggaran, total pagu anggaran semula sebesar {formatCurrency(totalSemula)} 
          mengalami perubahan menjadi {formatCurrency(totalMenjadi)}, dengan selisih {formatCurrency(Math.abs(totalSelisih))} 
          atau {changeDirection}.
        </p>
        <p>
          Perubahan ini terdiri dari {changedItems.length} komponen anggaran yang mengalami penyesuaian nilai, 
          {newItems.length} komponen anggaran baru yang ditambahkan, dan {deletedItems.length} komponen anggaran yang dihapus.
        </p>
        <p>
          Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan 
          prioritas program dan kegiatan yang telah ditetapkan. Dengan adanya {totalItemsChanged} perubahan ini, 
          diharapkan pelaksanaan program dapat berjalan dengan lebih efektif dan efisien.
        </p>
        <p>
          Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Conclusion Card - Added as requested */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardDescription className="text-blue-800 font-medium text-base">Kesimpulan</CardDescription>
        </CardHeader>
        <CardContent>
          {getConclusionText()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Anggaran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Semula:</span>
                <span className="font-medium">{formatCurrency(totalSemula)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Menjadi:</span>
                <span className="font-medium">{formatCurrency(totalMenjadi)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selisih:</span>
                <span className={`font-medium ${totalSelisih !== 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(totalSelisih)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jumlah Item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Item:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Tidak Berubah:</span>
                <span className="font-medium">{unchangedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Berubah:</span>
                <span className="font-medium">{changedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Baru:</span>
                <span className="font-medium">{newItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Dihapus:</span>
                <span className="font-medium">{deletedItems.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rincian Perubahan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Item Tidak Berubah */}
              <div>
                <h4 className="text-sm font-medium mb-2">Item Tidak Berubah</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jumlah:</span>
                    <span className="text-sm">{unchangedItems.length} item</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-sm">{formatCurrency(totalUnchangedSemula)}</span>
                  </div>
                </div>
              </div>
              
              {/* Item Berubah */}
              <div>
                <h4 className="text-sm font-medium mb-2">Item Berubah</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jumlah:</span>
                    <span className="text-sm">{changedItems.length} item</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Semula:</span>
                    <span className="text-sm">{formatCurrency(totalChangedSemula)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Menjadi:</span>
                    <span className="text-sm">{formatCurrency(totalChangedMenjadi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Selisih:</span>
                    <span className={`text-sm ${totalChangedSelisih !== 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(totalChangedSelisih)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Item Baru */}
              <div>
                <h4 className="text-sm font-medium mb-2">Item Baru</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jumlah:</span>
                    <span className="text-sm">{newItems.length} item</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-sm">{formatCurrency(totalNewMenjadi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Selisih:</span>
                    <span className={`text-sm ${totalNewSelisih !== 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(totalNewSelisih)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Item Dihapus */}
              <div>
                <h4 className="text-sm font-medium mb-2">Item Dihapus</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jumlah:</span>
                    <span className="text-sm">{deletedItems.length} item</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-sm">{formatCurrency(totalDeletedSemula)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Selisih:</span>
                    <span className={`text-sm ${totalDeletedSelisih !== 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(totalDeletedSelisih)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetChangesSummary;
