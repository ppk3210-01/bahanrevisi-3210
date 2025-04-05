
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
  // Determine the color based on selisih value
  const getSelisihColor = () => {
    if (totalSelisih === 0) return "bg-green-50 border-green-200";
    return "bg-red-50 border-red-200"; // red for both positive and negative selisih
  };

  const getTextColor = () => {
    if (totalSelisih === 0) return "text-green-600";
    return totalSelisih > 0 ? "text-red-600" : "text-red-600";
  };

  return (
    <div className={`rounded-lg border ${getSelisihColor()} shadow-sm p-6`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Anggaran Semula</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalSemula)}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Anggaran Menjadi</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalMenjadi)}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Selisih</h3>
          <p className={`text-2xl font-bold ${getTextColor()}`}>
            {formatCurrency(totalSelisih)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
