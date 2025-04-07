
import { useState, useEffect } from 'react';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus, roundToThousands } from '@/utils/budgetCalculations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Custom hook to fetch and manage budget data
const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSemula, setTotalSemula] = useState<number>(0);
  const [totalMenjadi, setTotalMenjadi] = useState<number>(0);
  const [totalSelisih, setTotalSelisih] = useState<number>(0);

  // Function to recalculate totals across ALL items regardless of filters
  const recalculateTotals = async () => {
    try {
      // Get summary data from the database using Supabase functions
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_budget_summary_by_account_group');
      
      if (summaryError) {
        console.error('Error fetching budget summary:', summaryError);
        return;
      }
      
      // Calculate total across all items
      let totalSemulaSum = 0;
      let totalMenjadiSum = 0;
      
      for (const summary of summaryData) {
        totalSemulaSum += Number(summary.total_semula || 0);
        totalMenjadiSum += Number(summary.total_menjadi || 0);
      }
      
      const totalSelisihCalc = totalMenjadiSum - totalSemulaSum;
      
      setTotalSemula(totalSemulaSum);
      setTotalMenjadi(totalMenjadiSum);
      setTotalSelisih(totalSelisihCalc);
    } catch (err) {
      console.error('Error calculating totals:', err);
    }
  };

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
        if (filters.akun && filters.akun !== 'all') {
          query = query.eq('akun', filters.akun);
        }
        
        if (filters.subKomponen && filters.subKomponen !== 'all') {
          query = query.eq('sub_komponen', filters.subKomponen);
        } 

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
          const transformedData: BudgetItem[] = data.map((item: any) => {
            const jumlahSemula = Number(item.jumlah_semula || 0);
            const jumlahMenjadi = Number(item.jumlah_menjadi || 0);
            // Calculate selisih as Jumlah Menjadi - Jumlah Semula (CORRECTED)
            const calculatedSelisih = jumlahMenjadi - jumlahSemula;
            
            return {
              id: item.id,
              uraian: item.uraian,
              volumeSemula: Number(item.volume_semula),
              satuanSemula: item.satuan_semula,
              hargaSatuanSemula: Number(item.harga_satuan_semula),
              jumlahSemula: roundToThousands(jumlahSemula),
              volumeMenjadi: Number(item.volume_menjadi),
              satuanMenjadi: item.satuan_menjadi,
              hargaSatuanMenjadi: Number(item.harga_satuan_menjadi),
              jumlahMenjadi: roundToThousands(jumlahMenjadi),
              selisih: roundToThousands(calculatedSelisih), // Use the corrected selisih calculation
              status: item.status as "unchanged" | "changed" | "new" | "deleted",
              isApproved: item.is_approved,
              komponenOutput: item.komponen_output,
              programPembebanan: item.program_pembebanan || '',
              kegiatan: item.kegiatan || '',
              rincianOutput: item.rincian_output || '',
              subKomponen: item.sub_komponen || '',
              akun: item.akun || ''
            };
          });

          setBudgetItems(transformedData);
          
          // Calculate totals for all items regardless of filters
          await recalculateTotals();
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
      const selisih = roundToThousands(jumlahMenjadi - jumlahSemula); // CORRECTED: Jumlah Menjadi - Jumlah Semula
      
      // Create new item data for Supabase
      const newItemData = {
        uraian: item.uraian,
        volume_semula: item.volumeSemula,
        satuan_semula: item.satuanSemula,
        harga_satuan_semula: item.hargaSatuanSemula,
        volume_menjadi: item.volumeMenjadi,
        satuan_menjadi: item.satuanMenjadi,
        harga_satuan_menjadi: item.hargaSatuanMenjadi,
        status: 'new',
        is_approved: false,
        komponen_output: item.komponenOutput,
        // Include filter values if they exist
        program_pembebanan: filters.programPembebanan !== 'all' ? filters.programPembebanan : null,
        kegiatan: filters.kegiatan !== 'all' ? filters.kegiatan : null,
        rincian_output: filters.rincianOutput !== 'all' ? filters.rincianOutput : null,
        sub_komponen: item.subKomponen || null,
        akun: item.akun || null
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
          rincianOutput: data.rincian_output || '',
          subKomponen: data.sub_komponen || '',
          akun: data.akun || ''
        };

        // Add to state
        setBudgetItems(prev => [...prev, savedItem]);
        
        // Recalculate totals
        await recalculateTotals();
        
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

  // Import multiple budget items
  const importBudgetItems = async (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => {
    try {
      setLoading(true);
      
      // Prepare items for batch insert
      const itemsToInsert = items.map(item => {
        return {
          uraian: item.uraian,
          volume_semula: item.volumeSemula,
          satuan_semula: item.satuanSemula,
          harga_satuan_semula: item.hargaSatuanSemula,
          volume_menjadi: item.volumeMenjadi,
          satuan_menjadi: item.satuanMenjadi,
          harga_satuan_menjadi: item.hargaSatuanMenjadi,
          status: 'new',
          is_approved: false,
          komponen_output: item.komponenOutput,
          program_pembebanan: item.programPembebanan || filters.programPembebanan,
          kegiatan: item.kegiatan || filters.kegiatan,
          rincian_output: item.rincianOutput || filters.rincianOutput,
          sub_komponen: item.subKomponen || filters.subKomponen,
          akun: item.akun || filters.akun
        };
      });
      
      // Insert all items in one batch
      const { data, error: supabaseError } = await supabase
        .from('budget_items')
        .insert(itemsToInsert)
        .select();
      
      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // Transform the returned data
        const savedItems: BudgetItem[] = data.map((item: any) => ({
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
          programPembebanan: item.program_pembebanan || '',
          kegiatan: item.kegiatan || '',
          rincianOutput: item.rincian_output || '',
          subKomponen: item.sub_komponen || '',
          akun: item.akun || ''
        }));

        // Add to state
        setBudgetItems(prev => [...prev, ...savedItems]);
        
        // Recalculate totals
        await recalculateTotals();
        
        setLoading(false);
        return savedItems;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error importing budget items:', err);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal mengimpor item. Silakan coba lagi.'
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
      if ('subKomponen' in updates) supabaseUpdates.sub_komponen = updates.subKomponen;
      if ('akun' in updates) supabaseUpdates.akun = updates.akun;
      
      // Update status based on changes - item is not approved anymore if it was changed
      if (Object.keys(updates).length > 0 && currentItem.isApproved) {
        supabaseUpdates.is_approved = false;
        supabaseUpdates.status = 'changed';
      } else if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates || 'satuanMenjadi' in updates) {
        // If value is edited, update the status
        const updatedItem = updateItemStatus({...currentItem, ...updates});
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
      
      // Fetch the updated item to get calculated fields
      const { data: updatedData, error: fetchError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (updatedData) {
        const updatedItem: BudgetItem = {
          id: updatedData.id,
          uraian: updatedData.uraian,
          volumeSemula: Number(updatedData.volume_semula),
          satuanSemula: updatedData.satuan_semula,
          hargaSatuanSemula: Number(updatedData.harga_satuan_semula),
          jumlahSemula: roundToThousands(Number(updatedData.jumlah_semula || 0)),
          volumeMenjadi: Number(updatedData.volume_menjadi),
          satuanMenjadi: updatedData.satuan_menjadi,
          hargaSatuanMenjadi: Number(updatedData.harga_satuan_menjadi),
          jumlahMenjadi: roundToThousands(Number(updatedData.jumlah_menjadi || 0)),
          selisih: roundToThousands(Number(updatedData.selisih || 0)),
          status: updatedData.status as "unchanged" | "changed" | "new" | "deleted",
          isApproved: updatedData.is_approved,
          komponenOutput: updatedData.komponen_output,
          programPembebanan: updatedData.program_pembebanan || '',
          kegiatan: updatedData.kegiatan || '',
          rincianOutput: updatedData.rincian_output || '',
          subKomponen: updatedData.sub_komponen || '',
          akun: updatedData.akun || ''
        };
        
        // Update in local state
        setBudgetItems(prev => 
          prev.map(item => {
            if (item.id === id) {
              return updatedItem;
            }
            return item;
          })
        );
        
        // Recalculate totals
        await recalculateTotals();
        
        return updatedItem;
      }
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
      
      // Recalculate totals
      await recalculateTotals();
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
          status: 'unchanged',
          is_approved: true
        })
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Fetch the updated item to get calculated fields
      const { data: updatedData, error: fetchError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (updatedData) {
        const updatedItem: BudgetItem = {
          id: updatedData.id,
          uraian: updatedData.uraian,
          volumeSemula: Number(updatedData.volume_semula),
          satuanSemula: updatedData.satuan_semula,
          hargaSatuanSemula: Number(updatedData.harga_satuan_semula),
          jumlahSemula: roundToThousands(Number(updatedData.jumlah_semula || 0)),
          volumeMenjadi: Number(updatedData.volume_menjadi),
          satuanMenjadi: updatedData.satuan_menjadi,
          hargaSatuanMenjadi: Number(updatedData.harga_satuan_menjadi),
          jumlahMenjadi: roundToThousands(Number(updatedData.jumlah_menjadi || 0)),
          selisih: roundToThousands(Number(updatedData.selisih || 0)),
          status: updatedData.status as "unchanged" | "changed" | "new" | "deleted",
          isApproved: updatedData.is_approved,
          komponenOutput: updatedData.komponen_output,
          programPembebanan: updatedData.program_pembebanan || '',
          kegiatan: updatedData.kegiatan || '',
          rincianOutput: updatedData.rincian_output || '',
          subKomponen: updatedData.sub_komponen || '',
          akun: updatedData.akun || ''
        };
        
        // Update in local state
        setBudgetItems(prev => 
          prev.map(item => {
            if (item.id === id) {
              return updatedItem;
            }
            return item;
          })
        );
        
        // Recalculate totals
        await recalculateTotals();
      }
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

  // Reject a budget item - reset "menjadi" values to match "semula" values
  const rejectBudgetItem = async (id: string) => {
    try {
      // Find the item
      const item = budgetItems.find(item => item.id === id);
      if (!item) {
        throw new Error('Item not found');
      }
      
      // Update in Supabase - reset "menjadi" values to match "semula" values
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .update({
          volume_menjadi: item.volumeSemula,
          satuan_menjadi: item.satuanSemula,
          harga_satuan_menjadi: item.hargaSatuanSemula,
          status: 'unchanged',
          is_approved: false
        })
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Fetch the updated item to get calculated fields
      const { data: updatedData, error: fetchError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (updatedData) {
        const updatedItem: BudgetItem = {
          id: updatedData.id,
          uraian: updatedData.uraian,
          volumeSemula: Number(updatedData.volume_semula),
          satuanSemula: updatedData.satuan_semula,
          hargaSatuanSemula: Number(updatedData.harga_satuan_semula),
          jumlahSemula: roundToThousands(Number(updatedData.jumlah_semula || 0)),
          volumeMenjadi: Number(updatedData.volume_menjadi),
          satuanMenjadi: updatedData.satuan_menjadi,
          hargaSatuanMenjadi: Number(updatedData.harga_satuan_menjadi),
          jumlahMenjadi: roundToThousands(Number(updatedData.jumlah_menjadi || 0)),
          selisih: roundToThousands(Number(updatedData.selisih || 0)),
          status: updatedData.status as "unchanged" | "changed" | "new" | "deleted",
          isApproved: updatedData.is_approved,
          komponenOutput: updatedData.komponen_output,
          programPembebanan: updatedData.program_pembebanan || '',
          kegiatan: updatedData.kegiatan || '',
          rincianOutput: updatedData.rincian_output || '',
          subKomponen: updatedData.sub_komponen || '',
          akun: updatedData.akun || ''
        };
        
        // Update in local state
        setBudgetItems(prev => 
          prev.map(item => {
            if (item.id === id) {
              return updatedItem;
            }
            return item;
          })
        );
        
        // Recalculate totals
        await recalculateTotals();
      }
    } catch (err) {
      console.error('Error rejecting budget item:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menolak item. Silakan coba lagi.'
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
    approveBudgetItem,
    rejectBudgetItem,
    importBudgetItems,
    totalSemula,
    totalMenjadi,
    totalSelisih
  };
};

export default useBudgetData;
