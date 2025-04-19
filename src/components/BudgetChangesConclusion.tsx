
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetChangesConclusionProps {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  changedItems: number;
  newItems: number;
  deletedItems: number;
}

const BudgetChangesConclusion: React.FC<BudgetChangesConclusionProps> = ({
  totalSemula,
  totalMenjadi,
  totalSelisih,
  changedItems,
  newItems,
  deletedItems,
}) => {
  return (
    <Card className="bg-blue-50/50 border-blue-100">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Kesimpulan</h2>
        
        <div className="space-y-2 text-sm text-left">
          <p>
            Berdasarkan hasil analisis terhadap alokasi anggaran, total pagu anggaran semula sebesar {formatCurrency(totalSemula)} mengalami perubahan menjadi {formatCurrency(totalMenjadi)}, dengan selisih {formatCurrency(totalSelisih == 0 ? totalSelisih : Math.abs(totalSelisih))} {totalSelisih > 0 ? 'penambahan' : totalSelisih < 0 ? 'pengurangan' : 'atau tetap'}.
          </p>
          <p>
            Perubahan ini terdiri dari {changedItems} komponen anggaran yang mengalami penyesuaian nilai, {newItems} komponen anggaran baru yang ditambahkan, dan {deletedItems} komponen anggaran yang dihapus.
          </p>
          <p>
            Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan prioritas program dan kegiatan yang telah ditetapkan. Dengan adanya {changedItems + newItems} perubahan ini, diharapkan pelaksanaan program dapat berjalan dengan lebih efektif dan efisien.
          </p>
          <p>
            Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetChangesConclusion;
