
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetChangesConclusionProps {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  changedItems: number;
  newItems: number;
  deletedItems: number;
}

export const BudgetChangesConclusion: React.FC<BudgetChangesConclusionProps> = ({
  totalSemula,
  totalMenjadi,
  totalSelisih,
  changedItems,
  newItems,
  deletedItems
}) => {
  const totalChanges = changedItems + newItems + deletedItems;
  
  return (
    <Card className="bg-blue-50 p-6 mb-4">
      <h3 className="text-blue-800 text-lg font-semibold mb-4">Kesimpulan</h3>
      <div className="space-y-3 text-gray-700">
        <p>
          Berdasarkan hasil analisis terhadap alokasi anggaran, total pagu anggaran semula sebesar {formatCurrency(totalSemula)} mengalami perubahan menjadi {formatCurrency(totalMenjadi)}, dengan selisih {formatCurrency(totalSelisih)} atau {totalSelisih === 0 ? 'tetap' : totalSelisih > 0 ? 'bertambah' : 'berkurang'}.
        </p>
        <p>
          Perubahan ini terdiri dari {changedItems} komponen anggaran yang mengalami penyesuaian nilai, {newItems} komponen anggaran baru yang ditambahkan, dan {deletedItems} komponen anggaran yang dihapus.
        </p>
        <p>
          Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan prioritas program dan kegiatan yang telah ditetapkan. Dengan adanya {totalChanges} perubahan ini, diharapkan pelaksanaan program dapat berjalan dengan lebih efektif dan efisien.
        </p>
        <p>
          Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
        </p>
      </div>
    </Card>
  );
};
