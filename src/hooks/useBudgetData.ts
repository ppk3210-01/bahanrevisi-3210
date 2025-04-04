
import { useState, useEffect } from 'react';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus } from '@/utils/budgetCalculations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Define a type for budget item records from Supabase
type BudgetItemRecord = Database['public']['Tables']['budget_items']['Row'];

const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('budget_items')
          .select('*');
        
        // Updated filtering logic to support all levels
        if (filters.programPembebanan) {
          query = query.eq('program_pembebanan', filters.programPembebanan);
          
          if (filters.kegiatan) {
            query = query.eq('kegiatan', filters.kegiatan);
            
            if (filters.rincianOutput) {
              query = query.eq('rincian_output', filters.rincianOutput);
              
              if (filters.komponenOutput) {
                query = query.eq('komponen_output', filters.komponenOutput);
              }
            }
          }
        }

        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          // Transform data from Supabase format to our BudgetItem format
          const transformedData: BudgetItem[] = data.map((item: BudgetItemRecord) => ({
            id: item.id,
            uraian: item.uraian,
            volumeSemula: Number(item.volume_semula),
            satuanSemula: item.satuan_semula,
            hargaSatuanSemula: Number(item.harga_satuan_semula),
            jumlahSemula: Number(item.jumlah_semula || 0),
            volumeMenjadi: Number(item.volume_menjadi),
            satuanMenjadi: item.satuan_menjadi,
            hargaSatuanMenjadi: Number(item.harga_satuan_menjadi),
            jumlahMenjadi: Number(item.jumlah_menjadi || 0),
            selisih: Number(item.selisih || 0),
            status: item.status as "unchanged" | "changed" | "new" | "deleted",
            isApproved: item.is_approved,
            komponenOutput: item.komponen_output,
            programPembebanan: item.program_pembebanan,
            kegiatan: item.kegiatan,
            rincianOutput: item.rincian_output
          }));

          setBudgetItems(transformedData);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Add a new budget item
  const addBudgetItem = async (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => {
    try {
      // Calculate derived values
      const jumlahSemula = calculateAmount(item.volumeSemula, item.hargaSatuanSemula);
      const jumlahMenjadi = calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi);
      const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
      
      // Create new item data for Supabase
      const newItemData = {
        uraian: item.uraian,
        volume_semula: item.volumeSemula,
        satuan_semula: item.satuanSemula,
        harga_satuan_semula: item.hargaSatuanSemula,
        jumlah_semula: jumlahSemula,
        volume_menjadi: item.volumeMenjadi,
        satuan_menjadi: item.satuanMenjadi,
        harga_satuan_menjadi: item.hargaSatuanMenjadi,
        jumlah_menjadi: jumlahMenjadi,
        selisih: selisih,
        komponen_output: item.komponenOutput,
        program_pembebanan: filters.programPembebanan || '',
        kegiatan: filters.kegiatan || '',
        rincian_output: filters.rincianOutput || '',
        status: 'new',
        is_approved: false
      };
      
      // Save to Supabase
      const { data, error: supabaseError } = await supabase
        .from('budget_items')
        .insert(newItemData)
        .select()
        .single();
      
      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // Transform data from Supabase format to our BudgetItem format
        const savedItem: BudgetItem = {
          id: data.id,
          uraian: data.uraian,
          volumeSemula: Number(data.volume_semula),
          satuanSemula: data.satuan_semula,
          hargaSatuanSemula: Number(data.harga_satuan_semula),
          jumlahSemula: Number(data.jumlah_semula || 0),
          volumeMenjadi: Number(data.volume_menjadi),
          satuanMenjadi: data.satuan_menjadi,
          hargaSatuanMenjadi: Number(data.harga_satuan_menjadi),
          jumlahMenjadi: Number(data.jumlah_menjadi || 0),
          selisih: Number(data.selisih || 0),
          status: data.status as "unchanged" | "changed" | "new" | "deleted",
          isApproved: data.is_approved,
          komponenOutput: data.komponen_output,
          programPembebanan: data.program_pembebanan,
          kegiatan: data.kegiatan,
          rincianOutput: data.rincian_output
        };

        // Add to state
        setBudgetItems(prev => [...prev, savedItem]);
        return savedItem;
      }
    } catch (err) {
      console.error('Error adding budget item:', err);
      toast.error('Gagal menambahkan item. Silakan coba lagi.');
      throw err;
    }
  };

  // Update an existing budget item
  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      // Transform BudgetItem updates to Supabase format
      const supabaseUpdates: Record<string, any> = {};
      
      if ('uraian' in updates) supabaseUpdates.uraian = updates.uraian;
      if ('volumeSemula' in updates) supabaseUpdates.volume_semula = updates.volumeSemula;
      if ('satuanSemula' in updates) supabaseUpdates.satuan_semula = updates.satuanSemula;
      if ('hargaSatuanSemula' in updates) supabaseUpdates.harga_satuan_semula = updates.hargaSatuanSemula;
      if ('volumeMenjadi' in updates) supabaseUpdates.volume_menjadi = updates.volumeMenjadi;
      if ('satuanMenjadi' in updates) supabaseUpdates.satuan_menjadi = updates.satuanMenjadi;
      if ('hargaSatuanMenjadi' in updates) supabaseUpdates.harga_satuan_menjadi = updates.hargaSatuanMenjadi;
      if ('status' in updates) supabaseUpdates.status = updates.status;
      if ('isApproved' in updates) supabaseUpdates.is_approved = updates.isApproved;
      
      // When updating any values, the approval status should be reset
      if ('volumeMenjadi' in updates || 'satuanMenjadi' in updates || 'hargaSatuanMenjadi' in updates) {
        supabaseUpdates.is_approved = false;
      }
      
      // Update status based on changes
      if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates || 'satuanMenjadi' in updates) {
        // Find current item to calculate new status
        const currentItem = budgetItems.find(item => item.id === id);
        if (currentItem) {
          const updatedItem = { ...currentItem, ...updates };
          const statusUpdatedItem = updateItemStatus(updatedItem);
          supabaseUpdates.status = statusUpdatedItem.status;
        }
      }
      
      // Update in Supabase
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Update in local state
      setBudgetItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            const updatedItem = { ...item, ...updates };
            if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates || 'satuanMenjadi' in updates) {
              // Also reset approval status when any value changes
              updatedItem.isApproved = false;
              return updateItemStatus(updatedItem);
            }
            return updatedItem;
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Error updating budget item:', err);
      toast.error('Gagal mengupdate item. Silakan coba lagi.');
      throw err;
    }
  };

  // Delete a budget item
  const deleteBudgetItem = async (id: string) => {
    try {
      // Delete from Supabase
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Update local state
      setBudgetItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting budget item:', err);
      toast.error('Gagal menghapus item. Silakan coba lagi.');
      throw err;
    }
  };

  // Approve a budget item
  const approveBudgetItem = async (id: string) => {
    try {
      // Find the item
      const item = budgetItems.find(item => item.id === id);
      if (!item) {
        throw new Error('Item not found');
      }
      
      // Update in Supabase
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .update({
          is_approved: true
        })
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Update in local state
      setBudgetItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              isApproved: true
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Error approving budget item:', err);
      toast.error('Gagal menyetujui item. Silakan coba lagi.');
      throw err;
    }
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
