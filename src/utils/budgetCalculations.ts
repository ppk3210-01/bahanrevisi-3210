
/**
 * Calculate the amount based on volume and unit price
 */
export const calculateAmount = (volume: number, unitPrice: number): number => {
  return volume * unitPrice;
};

/**
 * Calculate the difference between original and new amount
 * Positive difference means the item costs LESS now (savings)
 * Negative difference means the item costs MORE now (additional cost)
 * Original Amount - New Amount
 */
export const calculateDifference = (originalAmount: number, newAmount: number): number => {
  return originalAmount - newAmount;
};

/**
 * Get row style based on item status
 */
export const getRowStyle = (status: string): string => {
  switch (status) {
    case 'deleted':
      return 'row-deleted';
    case 'changed':
      return 'row-changed';
    case 'new':
      return 'row-new';
    default:
      return '';
  }
};

/**
 * Format a number as currency (IDR)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Round a number to the nearest thousands
 */
export const roundToThousands = (value: number): number => {
  return Math.round(value / 1000) * 1000;
};
