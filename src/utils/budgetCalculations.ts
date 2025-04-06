
import { BudgetItem, BudgetSummary } from "@/types/budget";

// Calculate the amount based on volume and unit price
export const calculateAmount = (volume: number, unitPrice: number): number => {
  return volume * unitPrice;
};

// Calculate the difference between the initial and new amounts (Jumlah Semula - Jumlah Menjadi)
export const calculateDifference = (initialAmount: number, newAmount: number): number => {
  return initialAmount - newAmount;
};

// Round to thousands
export const roundToThousands = (amount: number): number => {
  return Math.round(amount / 1000) * 1000;
};

// Format number as currency (e.g., Rp 1.000.000)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
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
  const totalSelisih = roundToThousands(totalSemula - totalMenjadi); // Corrected: Jumlah Semula - Jumlah Menjadi

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
