
import { useState, useEffect } from 'react';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus, roundToThousands } from '@/utils/budgetCalculations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BudgetItemRecord } from '@/types/supabase';

const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use the supabase client with our temporary type definitions
        let query = supabase
          .from('budget_items')
          .select('*');
        
        // Apply filtering logic based on selected filters at any level
        // Including support for "all" (which means don't filter by that level)
        if (filters.komponenOutput && filters.komponenOutput !== 'all') {
          query = query.eq('komponen_output', filters.komponenOutput);
        } else if (filters.rincianOutput && filters.rincianOutput !== 'all') {
          // Filter by rincian_output
          query = query.eq('rincian_output', filters.rincianOutput);
        } else if (filters.kegiatan && filters.kegiatan !== 'all') {
          // Filter by kegiatan
          query = query.eq('kegiatan', filters.kegiatan);
        } else if (filters.programPembebanan && filters.programPembebanan !== 'all') {
          // Filter by program_pembebanan
          query = query.eq('program_pembebanan', filters.programPembebanan);
        }

        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          // Transform data from Supabase format to our BudgetItem format
          const transformedData: BudgetItem[] = data.map((item: any) => ({
            id: item.id,
            uraian: item.uraian,
            volumeSemula: Number(item.volume_semula),
            satuanSemula: item.satuan_semula,
            hargaSatuanSemula: Number(item.harga_satuan_semula),
            jumlahSemula: roundToThousands(Number(item.jumlah_semula || 0)),
            volumeMenjadi: Number(item.volume_menjadi),
            satuanMenjadi: item.satuan_menjadi,
            hargaSatuanMenjadi: Number(item.harga_satuan_menjadi),
            jumlahMenjadi: roundToThousands(Number(item.jumlah_menjadi || 0)),
            selisih: roundToThousands(Number(item.selisih || 0)),
            status: item.status as "unchanged" | "changed" | "new" | "deleted",
            isApproved: item.is_approved,
            komponenOutput: item.komponen_output,
            // Add these fields if they exist in your database, otherwise set defaults
            programPembebanan: item.program_pembebanan || '',
            kegiatan: item.kegiatan || '',
            rincianOutput: item.rincian_output || ''
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
      const jumlahSemula = roundToThousands(calculateAmount(item.volumeSemula, item.hargaSatuanSemula));
      const jumlahMenjadi = roundToThousands(calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi));
      const selisih = roundToThousands(calculateDifference(jumlahSemula, jumlahMenjadi));
      
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
        status: 'new',
        is_approved: false,
        // Include filter values if they exist
        program_pembebanan: filters.programPembebanan || null,
        kegiatan: filters.kegiatan || null,
        rincian_output: filters.rincianOutput || null
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
          jumlahSemula: roundToThousands(Number(data.jumlah_semula || 0)),
          volumeMenjadi: Number(data.volume_menjadi),
          satuanMenjadi: data.satuan_menjadi,
          hargaSatuanMenjadi: Number(data.harga_satuan_menjadi),
          jumlahMenjadi: roundToThousands(Number(data.jumlah_menjadi || 0)),
          selisih: roundToThousands(Number(data.selisih || 0)),
          status: data.status as "unchanged" | "changed" | "new" | "deleted",
          isApproved: data.is_approved,
          komponenOutput: data.komponen_output,
          programPembebanan: data.program_pembebanan || '',
          kegiatan: data.kegiatan || '',
          rincianOutput: data.rincian_output || ''
        };

        // Add to state
        setBudgetItems(prev => [...prev, savedItem]);
        return savedItem;
      }
    } catch (err) {
      console.error('Error adding budget item:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menambahkan item. Silakan coba lagi.'
      });
      throw err;
    }
  };

  // Update an existing budget item
  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      // Find the current item to use for calculations
      const currentItem = budgetItems.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }
      
      // Transform BudgetItem updates to Supabase format
      const supabaseUpdates: Record<string, any> = {};
      
      // Handle direct field mappings
      if ('uraian' in updates) supabaseUpdates.uraian = updates.uraian;
      if ('volumeSemula' in updates) supabaseUpdates.volume_semula = updates.volumeSemula;
      if ('satuanSemula' in updates) supabaseUpdates.satuan_semula = updates.satuanSemula;
      if ('hargaSatuanSemula' in updates) supabaseUpdates.harga_satuan_semula = updates.hargaSatuanSemula;
      if ('volumeMenjadi' in updates) supabaseUpdates.volume_menjadi = updates.volumeMenjadi;
      if ('satuanMenjadi' in updates) supabaseUpdates.satuan_menjadi = updates.satuanMenjadi;
      if ('hargaSatuanMenjadi' in updates) supabaseUpdates.harga_satuan_menjadi = updates.hargaSatuanMenjadi;
      
      // Calculate derived values if relevant fields have been updated
      let updatedItem = { ...currentItem, ...updates };
      
      // Calculate jumlah_menjadi if any of its components have changed
      if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates) {
        const jumlahMenjadi = calculateAmount(
          updatedItem.volumeMenjadi, 
          updatedItem.hargaSatuanMenjadi
        );
        supabaseUpdates.jumlah_menjadi = jumlahMenjadi;
        updatedItem.jumlahMenjadi = jumlahMenjadi;
        
        // Calculate selisih based on the new jumlah_menjadi
        const selisih = calculateDifference(updatedItem.jumlahSemula, jumlahMenjadi);
        supabaseUpdates.selisih = selisih;
        updatedItem.selisih = selisih;
      }
      
      // Calculate jumlah_semula if any of its components have changed
      if ('volumeSemula' in updates || 'hargaSatuanSemula' in updates) {
        const jumlahSemula = calculateAmount(
          updatedItem.volumeSemula, 
          updatedItem.hargaSatuanSemula
        );
        supabaseUpdates.jumlah_semula = jumlahSemula;
        updatedItem.jumlahSemula = jumlahSemula;
        
        // Recalculate selisih since jumlah_semula changed
        const selisih = calculateDifference(jumlahSemula, updatedItem.jumlahMenjadi);
        supabaseUpdates.selisih = selisih;
        updatedItem.selisih = selisih;
      }
      
      // Update status based on changes - item is not approved anymore if it was changed
      if (Object.keys(updates).length > 0 && currentItem.isApproved) {
        supabaseUpdates.is_approved = false;
        supabaseUpdates.status = 'changed';
        updatedItem.isApproved = false;
        updatedItem.status = 'changed';
      } else if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates || 'satuanMenjadi' in updates) {
        // If value is edited, update the status
        updatedItem = updateItemStatus(updatedItem);
        supabaseUpdates.status = updatedItem.status;
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
            return updatedItem;
          }
          return item;
        })
      );
      
      return updatedItem;
    } catch (err) {
      console.error('Error updating budget item:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal mengupdate item. Silakan coba lagi.'
      });
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
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menghapus item. Silakan coba lagi.'
      });
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
          volume_semula: item.volumeMenjadi,
          satuan_semula: item.satuanMenjadi,
          harga_satuan_semula: item.hargaSatuanMenjadi,
          jumlah_semula: item.jumlahMenjadi,
          selisih: 0,
          status: 'unchanged',
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
    } catch (err) {
      console.error('Error approving budget item:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menyetujui item. Silakan coba lagi.'
      });
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
