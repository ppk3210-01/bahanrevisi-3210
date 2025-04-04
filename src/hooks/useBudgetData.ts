
import { useState, useEffect } from 'react';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { SAMPLE_BUDGET_ITEMS } from '@/lib/constants';
import { calculateAmount, calculateDifference, updateItemStatus } from '@/utils/budgetCalculations';

// In a real app, this would interact with Supabase
const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a fetch from Supabase
        // For now, we'll use sample data and filter it based on the selected filters
        let filteredItems: BudgetItem[] = [...SAMPLE_BUDGET_ITEMS];

        // Apply filtering logic
        if (filters.programPembebanan) {
          // In a real app, this would filter by program ID
          // For demo purposes, we're not filtering the sample data
        }

        if (filters.kegiatan) {
          // In a real app, this would filter by kegiatan ID
          // For demo purposes, we're not filtering the sample data  
        }
        
        if (filters.rincianOutput) {
          // In a real app, this would filter by rincian output ID
          // For demo purposes, we're not filtering the sample data
        }
        
        if (filters.komponenOutput) {
          filteredItems = filteredItems.filter(
            item => item.komponenOutput === filters.komponenOutput
          );
        }

        // Simulate a delay to show loading state
        setTimeout(() => {
          setBudgetItems(filteredItems);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Add a new budget item
  const addBudgetItem = (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => {
    // Calculate derived values
    const jumlahSemula = calculateAmount(item.volumeSemula, item.hargaSatuanSemula);
    const jumlahMenjadi = calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi);
    const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
    
    // Create new item with generated ID
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      ...item,
      jumlahSemula,
      jumlahMenjadi,
      selisih,
      status: 'new',
      isApproved: false
    };
    
    // Add to state
    setBudgetItems(prev => [...prev, newItem]);
    
    // In a real app, save to Supabase here
  };

  // Update an existing budget item
  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          // If updating volume or price, recalculate amounts and difference
          const updatedItem = { ...item, ...updates };
          
          if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates) {
            updatedItem.jumlahMenjadi = calculateAmount(
              updatedItem.volumeMenjadi, 
              updatedItem.hargaSatuanMenjadi
            );
            updatedItem.selisih = calculateDifference(
              updatedItem.jumlahSemula, 
              updatedItem.jumlahMenjadi
            );
          }
          
          // Update the status based on changes
          return updateItemStatus(updatedItem);
        }
        return item;
      })
    );
    
    // In a real app, save to Supabase here
  };

  // Delete a budget item
  const deleteBudgetItem = (id: string) => {
    // In a real app with history tracking, you might mark as deleted instead of removing
    setBudgetItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: 'deleted' } 
          : item
      )
    );
    
    // In a real app, update Supabase here
  };

  // Approve a budget item
  const approveBudgetItem = (id: string) => {
    setBudgetItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            volumeSemula: item.volumeMenjadi,
            satuanSemula: item.satuanMenjadi,
            hargaSatuanSemula: item.hargaSatuanMenjadi,
            jumlahSemula: item.jumlahMenjadi,
            selisih: 0,
            status: 'unchanged',
            isApproved: true
          };
        }
        return item;
      })
    );
    
    // In a real app, save to Supabase here
  };

  return {
    budgetItems,
    loading,
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem
  };
};

export default useBudgetData;
