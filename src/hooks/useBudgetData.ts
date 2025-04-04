
import { useState, useEffect, useCallback } from 'react';
import { supabase, uuidv4 } from '@/integrations/supabase/client';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus, formatCurrency } from '@/utils/budgetCalculations';
import { toast } from './use-toast';

// Define the expected database schema
interface BudgetItemDB {
  id: string;
  uraian: string;
  volume_semula: number;
  satuan_semula: string;
  harga_satuan_semula: number;
  jumlah_semula: number;
  volume_menjadi: number;
  satuan_menjadi: string;
  harga_satuan_menjadi: number;
  jumlah_menjadi: number;
  selisih: number;
  status: string;
  is_approved: boolean;
  komponen_output: string;
  program_pembebanan?: string;
  kegiatan?: string;
  rincian_output?: string;
  created_at?: string;
}

const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to convert DB item to frontend item
  const convertToFrontendItem = (item: BudgetItemDB): BudgetItem => {
    return {
      id: item.id,
      uraian: item.uraian,
      volumeSemula: item.volume_semula,
      satuanSemula: item.satuan_semula,
      hargaSatuanSemula: item.harga_satuan_semula,
      jumlahSemula: item.jumlah_semula,
      volumeMenjadi: item.volume_menjadi,
      satuanMenjadi: item.satuan_menjadi,
      hargaSatuanMenjadi: item.harga_satuan_menjadi,
      jumlahMenjadi: item.jumlah_menjadi,
      selisih: item.selisih,
      status: item.status as 'unchanged' | 'changed' | 'new' | 'deleted',
      isApproved: item.is_approved,
      komponenOutput: item.komponen_output,
      programPembebanan: item.program_pembebanan || undefined,
      kegiatan: item.kegiatan || undefined,
      rincianOutput: item.rincian_output || undefined
    };
  };

  // Function to convert frontend item to DB item
  const convertToDbItem = (item: Partial<BudgetItem>): Partial<BudgetItemDB> => {
    const result: Partial<BudgetItemDB> = {};
    
    if ('uraian' in item) result.uraian = item.uraian!;
    if ('volumeSemula' in item) result.volume_semula = item.volumeSemula!;
    if ('satuanSemula' in item) result.satuan_semula = item.satuanSemula!;
    if ('hargaSatuanSemula' in item) result.harga_satuan_semula = item.hargaSatuanSemula!;
    if ('jumlahSemula' in item) result.jumlah_semula = item.jumlahSemula!;
    if ('volumeMenjadi' in item) result.volume_menjadi = item.volumeMenjadi!;
    if ('satuanMenjadi' in item) result.satuan_menjadi = item.satuanMenjadi!;
    if ('hargaSatuanMenjadi' in item) result.harga_satuan_menjadi = item.hargaSatuanMenjadi!;
    if ('jumlahMenjadi' in item) result.jumlah_menjadi = item.jumlahMenjadi!;
    if ('selisih' in item) result.selisih = item.selisih!;
    if ('status' in item) result.status = item.status!;
    if ('isApproved' in item) result.is_approved = item.isApproved!;
    if ('komponenOutput' in item) result.komponen_output = item.komponenOutput!;
    if ('programPembebanan' in item) result.program_pembebanan = item.programPembebanan;
    if ('kegiatan' in item) result.kegiatan = item.kegiatan;
    if ('rincianOutput' in item) result.rincian_output = item.rincianOutput;
    
    return result;
  };

  // Fetch budget items based on filters
  const fetchBudgetItems = useCallback(async () => {
    setLoading(true);
    try {
      // Create a base query to avoid TypeScript deep recursion errors
      const query = supabase.from('budget_items').select('*');
      
      // Build filter conditions as an array
      const conditions = [];
      if (filters.programPembebanan) conditions.push(['program_pembebanan', 'eq', filters.programPembebanan]);
      if (filters.kegiatan) conditions.push(['kegiatan', 'eq', filters.kegiatan]);
      if (filters.rincianOutput) conditions.push(['rincian_output', 'eq', filters.rincianOutput]);
      if (filters.komponenOutput) conditions.push(['komponen_output', 'eq', filters.komponenOutput]);
      
      // Apply filters
      let filteredQuery = query;
      for (const [column, operator, value] of conditions) {
        filteredQuery = filteredQuery.filter(column as string, operator as string, value);
      }
      
      // Execute the query
      const { data, error: fetchError } = await filteredQuery.order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching budget items:', fetchError);
        setError('Failed to load budget data. Please try again later.');
        return;
      }

      const items = data ? data.map(item => convertToFrontendItem(item as BudgetItemDB)) : [];
      setBudgetItems(items);
      setError(null);
    } catch (err) {
      console.error('Unexpected error fetching budget items:', err);
      setError('An unexpected error occurred while loading budget data.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBudgetItems();
  }, [fetchBudgetItems]);

  // Add a new budget item
  const addBudgetItem = async (newItem: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => {
    try {
      // Calculate missing values
      const jumlahSemula = calculateAmount(newItem.volumeSemula, newItem.hargaSatuanSemula);
      const jumlahMenjadi = calculateAmount(newItem.volumeMenjadi, newItem.hargaSatuanMenjadi);
      const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);
      
      // Determine status based on values
      let status: 'unchanged' | 'changed' | 'new' | 'deleted' = 'unchanged';
      if (newItem.volumeSemula === 0 && newItem.hargaSatuanSemula === 0 && (newItem.volumeMenjadi > 0 || newItem.hargaSatuanMenjadi > 0)) {
        status = 'new';
      } else if (
        newItem.volumeSemula !== newItem.volumeMenjadi ||
        newItem.satuanSemula !== newItem.satuanMenjadi ||
        newItem.hargaSatuanSemula !== newItem.hargaSatuanMenjadi
      ) {
        status = 'changed';
      }

      // Prepare item for DB
      const itemForDb = {
        id: uuidv4(),
        uraian: newItem.uraian,
        volume_semula: newItem.volumeSemula,
        satuan_semula: newItem.satuanSemula,
        harga_satuan_semula: newItem.hargaSatuanSemula,
        jumlah_semula: jumlahSemula,
        volume_menjadi: newItem.volumeMenjadi,
        satuan_menjadi: newItem.satuanMenjadi,
        harga_satuan_menjadi: newItem.hargaSatuanMenjadi,
        jumlah_menjadi: jumlahMenjadi,
        selisih: selisih,
        status: status,
        is_approved: newItem.isApproved,
        komponen_output: newItem.komponenOutput,
        program_pembebanan: filters.programPembebanan || null,
        kegiatan: filters.kegiatan || null,
        rincian_output: filters.rincianOutput || null
      };

      // Insert into DB
      const { error: insertError } = await supabase
        .from('budget_items')
        .insert(itemForDb);

      if (insertError) {
        console.error('Error adding budget item:', insertError);
        toast({
          title: 'Gagal menambahkan data',
          description: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      const frontendItem = convertToFrontendItem(itemForDb as BudgetItemDB);
      setBudgetItems(prev => [...prev, frontendItem]);

    } catch (error) {
      console.error('Unexpected error adding budget item:', error);
      toast({
        title: 'Gagal menambahkan data',
        description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  // Update an existing budget item
  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      // Get the current item
      const currentItem = budgetItems.find(item => item.id === id);
      if (!currentItem) {
        console.error('Item not found:', id);
        return;
      }

      // Prepare updated values
      const updatedItem = { ...currentItem, ...updates };
      
      // Recalculate values if volume or unit price has changed
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
      
      // Update status if values have changed
      if (
        updatedItem.volumeSemula !== updatedItem.volumeMenjadi ||
        updatedItem.satuanSemula !== updatedItem.satuanMenjadi ||
        updatedItem.hargaSatuanSemula !== updatedItem.hargaSatuanMenjadi
      ) {
        updatedItem.status = 'changed';
        updatedItem.isApproved = false; // Reset approval status when changes are made
      } else {
        updatedItem.status = 'unchanged';
      }
      
      // Convert to DB format
      const dbUpdates = convertToDbItem(updatedItem);
      
      // Update in database
      const { error: updateError } = await supabase
        .from('budget_items')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) {
        console.error('Error updating budget item:', updateError);
        toast({
          title: 'Gagal memperbarui data',
          description: 'Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setBudgetItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      
    } catch (error) {
      console.error('Unexpected error updating budget item:', error);
      toast({
        title: 'Gagal memperbarui data',
        description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  // Delete a budget item
  const deleteBudgetItem = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting budget item:', deleteError);
        toast({
          title: 'Gagal menghapus data',
          description: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setBudgetItems(prev => prev.filter(item => item.id !== id));
      
    } catch (error) {
      console.error('Unexpected error deleting budget item:', error);
      toast({
        title: 'Gagal menghapus data',
        description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  // Approve a budget item - moves "menjadi" values to "semula"
  const approveBudgetItem = async (id: string) => {
    try {
      const item = budgetItems.find(item => item.id === id);
      if (!item) return;

      // Create approved item (move "menjadi" values to "semula")
      const approvedItem = {
        volume_semula: item.volumeMenjadi,
        satuan_semula: item.satuanMenjadi,
        harga_satuan_semula: item.hargaSatuanMenjadi,
        jumlah_semula: item.jumlahMenjadi,
        selisih: 0,
        status: 'unchanged',
        is_approved: true
      };

      // Update in database
      const { error: updateError } = await supabase
        .from('budget_items')
        .update(approvedItem)
        .eq('id', id);

      if (updateError) {
        console.error('Error approving budget item:', updateError);
        toast({
          title: 'Gagal menyetujui data',
          description: 'Terjadi kesalahan saat menyetujui perubahan. Silakan coba lagi.',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setBudgetItems(prev => prev.map(item => {
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
      }));
      
    } catch (error) {
      console.error('Unexpected error approving budget item:', error);
      toast({
        title: 'Gagal menyetujui data',
        description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        variant: 'destructive'
      });
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
