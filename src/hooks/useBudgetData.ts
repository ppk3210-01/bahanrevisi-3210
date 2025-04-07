import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { 
  calculateAmount, 
  calculateDifference, 
  updateItemStatus 
} from '@/utils/budgetCalculations';

// Mock data for initial budget items
const initialBudgetItems: BudgetItem[] = [
  {
    id: uuidv4(),
    uraian: 'Pengadaan Laptop',
    volumeSemula: 2,
    satuanSemula: 'Unit',
    hargaSatuanSemula: 15000000,
    jumlahSemula: 30000000,
    volumeMenjadi: 3,
    satuanMenjadi: 'Unit',
    hargaSatuanMenjadi: 15000000,
    jumlahMenjadi: 45000000,
    selisih: 15000000,
    status: 'changed',
    isApproved: false,
    komponenOutput: 'Perangkat Keras',
    subKomponen: 'Peralatan Elektronik',
    akun: '532111',
    programPembebanan: 'Program Statistik',
    kegiatan: 'Pengadaan',
    rincianOutput: 'Peralatan Kantor'
  },
  {
    id: uuidv4(),
    uraian: 'Pengadaan Printer',
    volumeSemula: 1,
    satuanSemula: 'Unit',
    hargaSatuanSemula: 5000000,
    jumlahSemula: 5000000,
    volumeMenjadi: 1,
    satuanMenjadi: 'Unit',
    hargaSatuanMenjadi: 5000000,
    jumlahMenjadi: 5000000,
    selisih: 0,
    status: 'unchanged',
    isApproved: true,
    komponenOutput: 'Perangkat Keras',
    subKomponen: 'Peralatan Elektronik',
    akun: '532111',
    programPembebanan: 'Program Statistik',
    kegiatan: 'Pengadaan',
    rincianOutput: 'Peralatan Kantor'
  },
  {
    id: uuidv4(),
    uraian: 'ATK Kantor',
    volumeSemula: 0,
    satuanSemula: 'Paket',
    hargaSatuanSemula: 0,
    jumlahSemula: 0,
    volumeMenjadi: 1,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 3000000,
    jumlahMenjadi: 3000000,
    selisih: 3000000,
    status: 'new',
    isApproved: false,
    komponenOutput: 'Perangkat Keras',
    subKomponen: 'ATK',
    akun: '521111',
    programPembebanan: 'Program Statistik',
    kegiatan: 'Pengadaan',
    rincianOutput: 'Peralatan Kantor'
  }
];

const useBudgetData = (filters: FilterSelection) => {
  // We store all budget items, unfiltered
  const [allItems, setAllItems] = useState<BudgetItem[]>(initialBudgetItems);
  // We also keep a filtered view of the items
  const [filteredItems, setFilteredItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter items based on the filter selection
  useEffect(() => {
    setLoading(true);
    
    let filtered = [...allItems];
    
    if (filters.programPembebanan !== 'all') {
      filtered = filtered.filter(item => item.programPembebanan === filters.programPembebanan);
    }
    
    if (filters.kegiatan !== 'all') {
      filtered = filtered.filter(item => item.kegiatan === filters.kegiatan);
    }
    
    if (filters.rincianOutput !== 'all') {
      filtered = filtered.filter(item => item.rincianOutput === filters.rincianOutput);
    }
    
    if (filters.komponenOutput !== 'all') {
      filtered = filtered.filter(item => item.komponenOutput === filters.komponenOutput);
    }
    
    if (filters.subKomponen !== 'all') {
      filtered = filtered.filter(item => item.subKomponen === filters.subKomponen);
    }
    
    if (filters.akun !== 'all') {
      filtered = filtered.filter(item => item.akun === filters.akun);
    }
    
    setFilteredItems(filtered);
    setLoading(false);
  }, [filters, allItems]);
  
  // Add a new budget item
  const addBudgetItem = (newItem: Partial<BudgetItem>): BudgetItem => {
    // Calculate jumlahSemula and jumlahMenjadi
    const volumeSemula = newItem.volumeSemula || 0;
    const hargaSatuanSemula = newItem.hargaSatuanSemula || 0;
    
    const volumeMenjadi = newItem.volumeMenjadi || 0;
    const hargaSatuanMenjadi = newItem.hargaSatuanMenjadi || 0;
    
    const jumlahSemula = calculateAmount(volumeSemula, hargaSatuanSemula);
    const jumlahMenjadi = calculateAmount(volumeMenjadi, hargaSatuanMenjadi);
    
    // Calculate selisih (Jumlah Menjadi - Jumlah Semula)
    const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
    
    // Create a complete budget item
    const budgetItem: BudgetItem = {
      id: uuidv4(),
      uraian: newItem.uraian || '',
      volumeSemula,
      satuanSemula: newItem.satuanSemula || '',
      hargaSatuanSemula,
      jumlahSemula,
      volumeMenjadi,
      satuanMenjadi: newItem.satuanMenjadi || '',
      hargaSatuanMenjadi,
      jumlahMenjadi,
      selisih,
      status: 'unchanged',
      isApproved: false,
      komponenOutput: newItem.komponenOutput || '',
      subKomponen: newItem.subKomponen || '',
      akun: newItem.akun || '',
      programPembebanan: newItem.programPembebanan || '',
      kegiatan: newItem.kegiatan || '',
      rincianOutput: newItem.rincianOutput || ''
    };
    
    // Update status based on values
    const updatedBudgetItem = updateItemStatus(budgetItem);
    
    // Add the new item to the list of items
    setAllItems(prev => [...prev, updatedBudgetItem]);
    
    return updatedBudgetItem;
  };
  
  // Update an existing budget item
  const updateBudgetItem = (id: string, itemUpdates: Partial<BudgetItem>): BudgetItem | null => {
    const updatedItems = allItems.map(item => {
      if (item.id === id) {
        // Calculate new values
        const volumeSemula = itemUpdates.volumeSemula !== undefined ? itemUpdates.volumeSemula : item.volumeSemula;
        const hargaSatuanSemula = itemUpdates.hargaSatuanSemula !== undefined ? itemUpdates.hargaSatuanSemula : item.hargaSatuanSemula;
        
        const volumeMenjadi = itemUpdates.volumeMenjadi !== undefined ? itemUpdates.volumeMenjadi : item.volumeMenjadi;
        const hargaSatuanMenjadi = itemUpdates.hargaSatuanMenjadi !== undefined ? itemUpdates.hargaSatuanMenjadi : item.hargaSatuanMenjadi;
        
        const jumlahSemula = calculateAmount(volumeSemula, hargaSatuanSemula);
        const jumlahMenjadi = calculateAmount(volumeMenjadi, hargaSatuanMenjadi);
        
        // Calculate selisih (Jumlah Menjadi - Jumlah Semula)
        const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
        
        // Update the item
        const updatedBudgetItem: BudgetItem = {
          ...item,
          ...itemUpdates,
          volumeSemula,
          hargaSatuanSemula,
          jumlahSemula,
          volumeMenjadi,
          hargaSatuanMenjadi,
          jumlahMenjadi,
          selisih
        };
        
        // Update status based on values
        return updateItemStatus(updatedBudgetItem);
      }
      
      return item;
    });
    
    setAllItems(updatedItems);
    
    return updatedItems.find(item => item.id === id) || null;
  };
  
  // Delete a budget item
  const deleteBudgetItem = (id: string): void => {
    setAllItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Approve a budget item
  const approveBudgetItem = (id: string): BudgetItem | null => {
    // Find the item
    const item = allItems.find(item => item.id === id);
    
    if (!item) {
      return null;
    }
    
    // Move "menjadi" values to "semula"
    const updatedItem: BudgetItem = {
      ...item,
      volumeSemula: item.volumeMenjadi,
      satuanSemula: item.satuanMenjadi,
      hargaSatuanSemula: item.hargaSatuanMenjadi,
      jumlahSemula: item.jumlahMenjadi,
      selisih: 0,
      status: 'unchanged',
      isApproved: true
    };
    
    // Update the list of items
    const updatedItems = allItems.map(i => i.id === id ? updatedItem : i);
    setAllItems(updatedItems);
    
    return updatedItem;
  };
  
  // Reject a budget item
  const rejectBudgetItem = (id: string): BudgetItem | null => {
    // Find the item
    const item = allItems.find(item => item.id === id);
    
    if (!item) {
      return null;
    }
    
    // Reset "menjadi" values to "semula"
    const updatedItem: BudgetItem = {
      ...item,
      volumeMenjadi: item.volumeSemula,
      satuanMenjadi: item.satuanSemula,
      hargaSatuanMenjadi: item.hargaSatuanSemula,
      jumlahMenjadi: item.jumlahSemula,
      selisih: 0,
      status: 'unchanged',
      isApproved: false
    };
    
    // Update the list of items
    const updatedItems = allItems.map(i => i.id === id ? updatedItem : i);
    setAllItems(updatedItems);
    
    return updatedItem;
  };
  
  // Import budget items from Excel
  const importBudgetItems = (items: Partial<BudgetItem>[]): void => {
    const newItems = items.map(item => {
      // Calculate jumlahSemula and jumlahMenjadi
      const volumeSemula = item.volumeSemula || 0;
      const hargaSatuanSemula = item.hargaSatuanSemula || 0;
      
      const volumeMenjadi = item.volumeMenjadi || 0;
      const hargaSatuanMenjadi = item.hargaSatuanMenjadi || 0;
      
      const jumlahSemula = calculateAmount(volumeSemula, hargaSatuanSemula);
      const jumlahMenjadi = calculateAmount(volumeMenjadi, hargaSatuanMenjadi);
      
      // Calculate selisih (Jumlah Menjadi - Jumlah Semula)
      const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
      
      // Create a complete budget item
      const budgetItem: BudgetItem = {
        id: uuidv4(),
        uraian: item.uraian || '',
        volumeSemula,
        satuanSemula: item.satuanSemula || '',
        hargaSatuanSemula,
        jumlahSemula,
        volumeMenjadi,
        satuanMenjadi: item.satuanMenjadi || '',
        hargaSatuanMenjadi,
        jumlahMenjadi,
        selisih,
        status: 'unchanged',
        isApproved: false,
        komponenOutput: item.komponenOutput || filters.komponenOutput !== 'all' ? filters.komponenOutput : '',
        subKomponen: item.subKomponen || filters.subKomponen !== 'all' ? filters.subKomponen : '',
        akun: item.akun || filters.akun !== 'all' ? filters.akun : '',
        programPembebanan: item.programPembebanan || filters.programPembebanan !== 'all' ? filters.programPembebanan : '',
        kegiatan: item.kegiatan || filters.kegiatan !== 'all' ? filters.kegiatan : '',
        rincianOutput: item.rincianOutput || filters.rincianOutput !== 'all' ? filters.rincianOutput : ''
      };
      
      // Update status based on values
      return updateItemStatus(budgetItem);
    });
    
    setAllItems(prev => [...prev, ...newItems]);
  };
  
  return {
    budgetItems: filteredItems,
    allBudgetItems: allItems,
    loading,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem,
    rejectBudgetItem,
    importBudgetItems
  };
};

export default useBudgetData;
