
import React from 'react';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

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
    <div className="sticky top-[65px] z-20 bg-gray-50 py-1 border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center text-[10px]">
        <div className="flex items-center gap-2">
          <div>
            <span className="text-gray-600 mr-1">Pagu Anggaran Semula:</span>
            <span className="font-semibold">{formatCurrency(roundToThousands(totalSemula))}</span>
          </div>
          
          <div>
            <span className="text-gray-600 mr-1">Pagu Anggaran Menjadi:</span>
            <span className="font-semibold">{formatCurrency(roundToThousands(totalMenjadi))}</span>
          </div>
        </div>
        
        <div>
          <span className="text-gray-600 mr-1">Selisih:</span>
          <span className={`font-semibold ${totalSelisih === 0 ? 'text-green-600' : totalSelisih > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(roundToThousands(totalSelisih))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
