
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
  return (
    <div className="sticky top-[65px] z-20 bg-gray-50 py-2 border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-600 mr-2">Pagu Anggaran Semula:</span>
            <span className="font-bold">{formatCurrency(totalSemula)}</span>
          </div>
          
          <div>
            <span className="text-gray-600 mr-2">Pagu Anggaran Menjadi:</span>
            <span className="font-bold">{formatCurrency(totalMenjadi)}</span>
          </div>
        </div>
        
        <div>
          <span className="text-gray-600 mr-2">Selisih:</span>
          <span className={`font-bold ${totalSelisih !== 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(totalSelisih)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
