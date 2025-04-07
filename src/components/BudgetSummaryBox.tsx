
import React from 'react';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetSummaryBoxProps {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
}

// Format numbers to thousands by rounding to the nearest thousand
const formatToThousands = (value: number): string => {
  // Round to nearest thousand
  const roundedValue = Math.round(value / 1000) * 1000;
  return formatCurrency(roundedValue);
};

const BudgetSummaryBox: React.FC<BudgetSummaryBoxProps> = ({ 
  totalSemula, 
  totalMenjadi,
  totalSelisih
}) => {
  return (
    <div className="sticky top-[65px] z-20 bg-gradient-to-r from-blue-50 to-sky-50 py-2 border-b border-blue-200 shadow-sm">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-600 mr-2">Pagu Anggaran Semula:</span>
            <span className="font-bold">{formatToThousands(totalSemula)}</span>
          </div>
          
          <div>
            <span className="text-gray-600 mr-2">Pagu Anggaran Menjadi:</span>
            <span className="font-bold">{formatToThousands(totalMenjadi)}</span>
          </div>
        </div>
        
        <div>
          <span className="text-gray-600 mr-2">Selisih:</span>
          <span className={`font-bold ${totalSelisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatToThousands(totalSelisih)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
