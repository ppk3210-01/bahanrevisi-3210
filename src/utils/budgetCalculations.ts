
import { BudgetItem, BudgetSummary } from '@/types/budget';

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

// Calculate amount (same as calculateTotal but exported with a different name)
export const calculateAmount = (volume: number, unitPrice: number): number => {
  return volume * unitPrice;
};

// Calculate the difference between two values
export const calculateDifference = (value1: number, value2: number): number => {
  return value2 - value1;
};

// Round a number to thousands
export const roundToThousands = (value: number): number => {
  return Math.round(value / 1000) * 1000;
};

// Update the status of a budget item based on changes
export const updateItemStatus = (item: BudgetItem): BudgetItem => {
  const updatedItem = { ...item };
  
  // Check if any values have changed between "semula" and "menjadi"
  if (item.volumeSemula !== item.volumeMenjadi || 
      item.satuanSemula !== item.satuanMenjadi ||
      item.hargaSatuanSemula !== item.hargaSatuanMenjadi ||
      item.jumlahSemula !== item.jumlahMenjadi) {
    updatedItem.status = 'changed';
  } else {
    updatedItem.status = 'unchanged';
  }
  
  return updatedItem;
};

// Generate styling for table rows based on item status
export const getRowStyle = (item: BudgetItem): string => {
  switch (item.status) {
    case 'new':
      return 'bg-green-50';
    case 'changed':
      return 'bg-yellow-50';
    case 'deleted':
      return 'bg-red-50';
    default:
      return '';
  }
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
export const createBudgetItem = (input: Partial<BudgetItem>, id?: string): BudgetItem => {
  const jumlahSemula = calculateTotal(input.volumeSemula || 0, input.hargaSatuanSemula || 0);
  const jumlahMenjadi = calculateTotal(input.volumeMenjadi || 0, input.hargaSatuanMenjadi || 0);
  const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
  
  return {
    id: id || crypto.randomUUID(),
    uraian: input.uraian || '',
    volumeSemula: input.volumeSemula || 0,
    satuanSemula: input.satuanSemula || '',
    hargaSatuanSemula: input.hargaSatuanSemula || 0,
    jumlahSemula,
    volumeMenjadi: input.volumeMenjadi || 0,
    satuanMenjadi: input.satuanMenjadi || '',
    hargaSatuanMenjadi: input.hargaSatuanMenjadi || 0,
    jumlahMenjadi,
    selisih,
    status: input.status || 'new',
    isApproved: input.isApproved || false,
    komponenOutput: input.komponenOutput || '',
    programPembebanan: input.programPembebanan,
    kegiatan: input.kegiatan,
    rincianOutput: input.rincianOutput,
    subKomponen: input.subKomponen,
    akun: input.akun
  };
};

// Update a budget item with calculated fields
export const updateBudgetItem = (item: BudgetItem, input: Partial<BudgetItem>): BudgetItem => {
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
  if (input.isApproved !== undefined) updatedItem.isApproved = input.isApproved;
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
