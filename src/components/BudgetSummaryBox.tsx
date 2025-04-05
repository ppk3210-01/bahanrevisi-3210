
import React from 'react';
import { formatCurrency } from '@/utils/budgetCalculations';
import { Card, CardContent } from '@/components/ui/card';

interface BudgetSummaryBoxProps {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
}

const BudgetSummaryBox: React.FC<BudgetSummaryBoxProps> = ({ 
  totalSemula, 
  totalMenjadi,
  totalSelisih
}) => {
  return (
    <div className="sticky top-[84px] z-10 bg-gray-50 pt-2 pb-2">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-2 border-blue-300 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">Anggaran Semula</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalSemula)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-300 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">Anggaran Menjadi</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalMenjadi)}</p>
          </CardContent>
        </Card>
        
        <Card className={`border-2 ${totalSelisih !== 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'} shadow-sm`}>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">Selisih</h3>
            <p className={`text-2xl font-bold ${totalSelisih !== 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totalSelisih)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
