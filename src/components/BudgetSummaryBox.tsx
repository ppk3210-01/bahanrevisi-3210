
import React from 'react';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetSummaryBoxProps {
  totalSemula?: number;
  totalMenjadi?: number;
  totalSelisih?: number;
  isLoading?: boolean;
  newItems?: number;
  changedItems?: number;
  totalItems?: number;
  // Add missing props that are used in BudgetComparison.tsx
  title?: string;
  totalValue?: number;
  details?: string;
  valueType?: string;
}

// Format numbers to thousands by rounding to the nearest thousand
const formatToThousands = (value: number): string => {
  // Round to nearest thousand
  const roundedValue = Math.round(value / 1000) * 1000;
  return formatCurrency(roundedValue);
};

const BudgetSummaryBox: React.FC<BudgetSummaryBoxProps> = ({ 
  totalSemula = 0, 
  totalMenjadi = 0,
  totalSelisih = 0,
  isLoading = false,
  title,
  totalValue,
  details,
  valueType
}) => {
  const getSelisihDescription = (selisih: number): string => {
    if (selisih > 0) return 'Bertambah';
    if (selisih < 0) return 'Berkurang';
    return 'Tetap';
  };

  // Support both old and new prop patterns
  const displayValue = totalValue !== undefined ? totalValue : totalSelisih;
  const displayTitle = title || 'Ringkasan Anggaran';
  const displayDetails = details || '';

  return (
    <div className="bg-white py-3 px-4 border rounded-md shadow-sm">
      <div className="flex flex-col text-xs space-y-2">
        {isLoading ? (
          <div className="w-full text-center py-2">Loading...</div>
        ) : (
          <>
            <div className="font-semibold border-b pb-2 mb-1 text-sm">{displayTitle}</div>
            
            {totalSemula !== undefined && (
              <div>
                <span className="text-gray-600 mr-1">Pagu Anggaran Semula:</span>
                <span className="font-semibold">{formatToThousands(totalSemula)}</span>
              </div>
            )}
            
            {totalMenjadi !== undefined && (
              <div>
                <span className="text-gray-600 mr-1">Pagu Anggaran Menjadi:</span>
                <span className="font-semibold">{formatToThousands(totalMenjadi)}</span>
              </div>
            )}
            
            <div>
              <span className="text-gray-600 mr-1">{title ? '' : 'Selisih:'}</span>
              <span className={`font-semibold ${valueType || (totalSelisih === 0 ? 'text-gray-600' : totalSelisih > 0 ? 'text-blue-600' : 'text-red-600')}`}>
                {formatToThousands(displayValue)} {title ? displayDetails : `(${getSelisihDescription(totalSelisih)})`}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetSummaryBox;
