
import { BudgetItem, BudgetSummary } from "@/types/budget";

// Calculate the amount based on volume and unit price
export const calculateAmount = (volume: number, unitPrice: number): number => {
  return volume * unitPrice;
};

// Calculate the difference between the initial and new amounts (Jumlah Menjadi - Jumlah Semula)
export const calculateDifference = (initialAmount: number, newAmount: number): number => {
  return newAmount - initialAmount; // Ensure the calculation is correct: Menjadi - Semula
};

// Round to thousands
export const roundToThousands = (value: number): number => {
  // Round to the nearest thousand
  return Math.round(value / 1000) * 1000;
};

// Format number as currency (e.g., Rp 1.000.000)
export const formatCurrency = (value: number, shouldRound: boolean = true): string => {
  const valueToFormat = shouldRound ? roundToThousands(value) : value;
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valueToFormat);
};

// Format without rounding - specifically for unit prices
export const formatWithoutRounding = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Check if an item has been changed
export const hasItemChanged = (item: BudgetItem): boolean => {
  return (
    item.volumeSemula !== item.volumeMenjadi ||
    item.satuanSemula !== item.satuanMenjadi ||
    item.hargaSatuanSemula !== item.hargaSatuanMenjadi
  );
};

// Update item status based on its values
export const updateItemStatus = (item: BudgetItem): BudgetItem => {
  let status: 'unchanged' | 'changed' | 'new' | 'deleted' = 'unchanged';
  
  if (item.volumeSemula === 0 && item.hargaSatuanSemula === 0 && (item.volumeMenjadi > 0 || item.hargaSatuanMenjadi > 0)) {
    status = 'new';
  } else if (hasItemChanged(item)) {
    status = 'changed';
  }
  
  return {
    ...item,
    status
  };
};

// Calculate the row style based on status
export const getRowStyle = (status: string): string => {
  switch (status) {
    case 'changed':
      return 'row-changed';
    case 'new':
      return 'row-new';
    case 'deleted':
      return 'row-deleted';
    default:
      return '';
  }
};

// Generate the budget summary from the list of items
export const generateBudgetSummary = (items: BudgetItem[]): BudgetSummary => {
  // Round the totals to thousands
  const totalSemula = roundToThousands(items.reduce((total, item) => total + roundToThousands(item.jumlahSemula), 0));
  const totalMenjadi = roundToThousands(items.reduce((total, item) => total + roundToThousands(item.jumlahMenjadi), 0));
  const totalSelisih = roundToThousands(totalMenjadi - totalSemula); // Ensure calculation is correct: Menjadi - Semula

  const changedItems = items.filter(item => item.status === 'changed');
  const newItems = items.filter(item => item.status === 'new');
  const deletedItems = items.filter(item => item.status === 'deleted');

  return {
    totalSemula,
    totalMenjadi,
    totalSelisih,
    changedItems,
    newItems,
    deletedItems
  };
};

// Approve budget item - move "menjadi" values to "semula"
export const approveBudgetItem = (item: BudgetItem): BudgetItem => {
  return {
    ...item,
    volumeSemula: item.volumeMenjadi,
    satuanSemula: item.satuanMenjadi,
    hargaSatuanSemula: item.hargaSatuanMenjadi,
    jumlahSemula: item.jumlahMenjadi,
    volumeMenjadi: item.volumeMenjadi,
    satuanMenjadi: item.satuanMenjadi,
    hargaSatuanMenjadi: item.hargaSatuanMenjadi,
    jumlahMenjadi: item.jumlahMenjadi,
    selisih: 0,
    status: 'unchanged',
    isApproved: true
  };
};
