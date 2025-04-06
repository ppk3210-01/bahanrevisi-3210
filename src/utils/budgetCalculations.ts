
import { BudgetItem, BudgetItemInput, BudgetSummary } from '@/types/budget';

// Helper to format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper to format numbers in thousands (K)
export const formatInThousands = (value: number): string => {
  return (Math.round(value / 1000)).toLocaleString() + 'K';
};

// Calculate the total value for an item (volume * unit price)
export const calculateTotal = (volume: number, unitPrice: number): number => {
  return volume * unitPrice;
};

// Calculate the difference between two values
export const calculateDifference = (value1: number, value2: number): number => {
  return value2 - value1;
};

// Generate a summary of budget changes
export const generateBudgetSummary = (items: BudgetItem[]): BudgetSummary => {
  // Items that have been changed (but not deleted)
  const changedItems = items.filter(item => item.status === 'changed');
  
  // New items that have been added
  const newItems = items.filter(item => item.status === 'new');
  
  // Items that have been deleted
  const deletedItems = items.filter(item => item.status === 'deleted');
  
  // Calculate totals
  const totalSemula = items.reduce((total, item) => total + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((total, item) => total + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  return {
    changedItems,
    newItems,
    deletedItems,
    totalSemula,
    totalMenjadi,
    totalSelisih,
  };
};

// Create a budget item with calculated fields
export const createBudgetItem = (input: BudgetItemInput, id?: string): BudgetItem => {
  const jumlahSemula = calculateTotal(input.volumeSemula, input.hargaSatuanSemula);
  const jumlahMenjadi = calculateTotal(input.volumeMenjadi, input.hargaSatuanMenjadi);
  const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
  
  return {
    id: id || crypto.randomUUID(),
    uraian: input.uraian,
    volumeSemula: input.volumeSemula,
    satuanSemula: input.satuanSemula,
    hargaSatuanSemula: input.hargaSatuanSemula,
    jumlahSemula,
    volumeMenjadi: input.volumeMenjadi,
    satuanMenjadi: input.satuanMenjadi,
    hargaSatuanMenjadi: input.hargaSatuanMenjadi,
    jumlahMenjadi,
    selisih,
    status: input.status || 'new',
    approved: input.approved || false,
    komponenOutput: input.komponenOutput,
    subKomponen: input.subKomponen,
    akun: input.akun,
  };
};

// Update a budget item with calculated fields
export const updateBudgetItem = (item: BudgetItem, input: Partial<BudgetItemInput>): BudgetItem => {
  const updatedItem = { ...item };
  
  // Update fields that have changed
  if (input.uraian !== undefined) updatedItem.uraian = input.uraian;
  if (input.volumeSemula !== undefined) updatedItem.volumeSemula = input.volumeSemula;
  if (input.satuanSemula !== undefined) updatedItem.satuanSemula = input.satuanSemula;
  if (input.hargaSatuanSemula !== undefined) updatedItem.hargaSatuanSemula = input.hargaSatuanSemula;
  if (input.volumeMenjadi !== undefined) updatedItem.volumeMenjadi = input.volumeMenjadi;
  if (input.satuanMenjadi !== undefined) updatedItem.satuanMenjadi = input.satuanMenjadi;
  if (input.hargaSatuanMenjadi !== undefined) updatedItem.hargaSatuanMenjadi = input.hargaSatuanMenjadi;
  if (input.status !== undefined) updatedItem.status = input.status;
  if (input.approved !== undefined) updatedItem.approved = input.approved;
  if (input.komponenOutput !== undefined) updatedItem.komponenOutput = input.komponenOutput;
  if (input.subKomponen !== undefined) updatedItem.subKomponen = input.subKomponen;
  if (input.akun !== undefined) updatedItem.akun = input.akun;
  
  // Recalculate derived values
  updatedItem.jumlahSemula = calculateTotal(updatedItem.volumeSemula, updatedItem.hargaSatuanSemula);
  updatedItem.jumlahMenjadi = calculateTotal(updatedItem.volumeMenjadi, updatedItem.hargaSatuanMenjadi);
  updatedItem.selisih = calculateDifference(updatedItem.jumlahSemula, updatedItem.jumlahMenjadi);
  
  return updatedItem;
};

// Calculate the difference in percentage between two values
export const calculatePercentageDifference = (value1: number, value2: number): number => {
  if (value1 === 0) return value2 === 0 ? 0 : 100;
  return ((value2 - value1) / value1) * 100;
};
