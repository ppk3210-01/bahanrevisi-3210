
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetSummaryBoxProps {
  totalSemula: number;
  totalMenjadi: number;
}

const BudgetSummaryBox: React.FC<BudgetSummaryBoxProps> = ({ totalSemula, totalMenjadi }) => {
  const selisih = totalMenjadi - totalSemula;
  const hasSelisih = selisih !== 0;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">PAGU Semula</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalSemula)}</p>
          </div>
          
          <div className="p-4 bg-yellow-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">PAGU Menjadi</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalMenjadi)}</p>
          </div>
          
          <div className={`p-4 rounded-md ${hasSelisih ? 'bg-red-50' : 'bg-green-50'}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Selisih PAGU</h3>
            <p className={`text-2xl font-bold ${hasSelisih ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(selisih)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSummaryBox;
