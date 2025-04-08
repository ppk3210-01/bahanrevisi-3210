
import React from 'react';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetSummaryBoxProps {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  isLoading?: boolean;
  newItems?: number;
  changedItems?: number;
  totalItems?: number;
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
  totalSelisih,
  isLoading = false,
  newItems = 0,
  changedItems = 0,
  totalItems = 0
}) => {
  const getSelisihDescription = (selisih: number): string => {
    if (selisih > 0) return 'Bertambah';
    if (selisih < 0) return 'Berkurang';
    return 'Tetap';
  };

  return (
    <div className="sticky top-[65px] z-20 bg-white py-3 px-4 border rounded-md shadow-sm">
      <div className="flex flex-col text-xs space-y-2">
        {isLoading ? (
          <div className="w-full text-center py-2">Loading...</div>
        ) : (
          <>
            <div className="font-semibold border-b pb-2 mb-1 text-sm">Ringkasan Anggaran</div>
            
            <div>
              <span className="text-gray-600 mr-1">Pagu Anggaran Semula:</span>
              <span className="font-semibold">{formatToThousands(totalSemula)}</span>
            </div>
            
            <div>
              <span className="text-gray-600 mr-1">Pagu Anggaran Menjadi:</span>
              <span className="font-semibold">{formatToThousands(totalMenjadi)}</span>
            </div>
            
            <div>
              <span className="text-gray-600 mr-1">Selisih:</span>
              <span className={`font-semibold ${totalSelisih === 0 ? 'text-gray-600' : totalSelisih > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatToThousands(totalSelisih)} ({getSelisihDescription(totalSelisih)})
              </span>
            </div>
            
            <div className="border-t pt-2 mt-1">
              <div>
                <span className="text-gray-600 mr-1">Item Baru:</span>
                <span className="font-semibold">{newItems} item</span>
              </div>
              
              <div>
                <span className="text-gray-600 mr-1">Item Diubah:</span>
                <span className="font-semibold">{changedItems} item</span>
              </div>
              
              <div>
                <span className="text-gray-600 mr-1">Total Item:</span>
                <span className="font-semibold">{totalItems} item</span>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 italic">
                Ringkasan ini menunjukkan perbandingan anggaran dengan total selisih {formatCurrency(totalSelisih)} 
                yang {getSelisihDescription(totalSelisih).toLowerCase()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
