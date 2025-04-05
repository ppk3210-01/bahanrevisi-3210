
import React from 'react';
import { formatCurrency } from '@/utils/budgetCalculations';

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
  // Determine the color for selisih box
  const getSelisihColor = () => {
    if (totalSelisih === 0) return "bg-green-100 border-green-300";
    return "bg-red-100 border-red-300";
  };

  const getTextColor = () => {
    if (totalSelisih === 0) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className="flex gap-4 sticky top-0 z-10 mb-6">
      <div className="rounded-lg border border-blue-300 bg-blue-50 shadow-sm p-3 flex-1">
        <h3 className="text-sm font-medium text-blue-700">Anggaran Semula</h3>
        <p className="text-lg font-bold">{formatCurrency(totalSemula)}</p>
      </div>
      
      <div className="rounded-lg border border-purple-300 bg-purple-50 shadow-sm p-3 flex-1">
        <h3 className="text-sm font-medium text-purple-700">Anggaran Menjadi</h3>
        <p className="text-lg font-bold">{formatCurrency(totalMenjadi)}</p>
      </div>
      
      <div className={`rounded-lg border shadow-sm p-3 flex-1 ${getSelisihColor()}`}>
        <h3 className="text-sm font-medium text-gray-700">Selisih</h3>
        <p className={`text-lg font-bold ${getTextColor()}`}>
          {formatCurrency(totalSelisih)}
        </p>
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
