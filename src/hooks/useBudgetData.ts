
import { useState, useEffect } from 'react';
import { FilterSelection, BudgetItem } from '@/types/budget';
import { supabase } from '@/integrations/supabase/client';
import { BudgetItemRecord } from '@/types/supabase';
import { calculateAmount, calculateDifference } from '@/utils/budgetCalculations';

const mapDatabaseToModelItem = (record: BudgetItemRecord): BudgetItem => {
  const jumlahSemula = calculateAmount(record.volume_semula, record.harga_satuan_semula);
  const jumlahMenjadi = calculateAmount(record.volume_menjadi, record.harga_satuan_menjadi);
  const selisih = calculateDifference(jumlahSemula, jumlahMenjadi);

  return {
    id: record.id,
    uraian: record.uraian,
    volumeSemula: record.volume_semula,
    satuanSemula: record.satuan_semula,
    hargaSatuanSemula: record.harga_satuan_semula,
    jumlahSemula,
    volumeMenjadi: record.volume_menjadi,
    satuanMenjadi: record.satuan_menjadi,
    hargaSatuanMenjadi: record.harga_satuan_menjadi,
    jumlahMenjadi,
    selisih,
    status: record.status as 'unchanged' | 'changed' | 'new' | 'deleted',
    isApproved: record.is_approved,
    komponenOutput: record.komponen_output,
    programPembebanan: record.program_pembebanan || undefined,
    kegiatan: record.kegiatan || undefined,
    rincianOutput: record.rincian_output || undefined,
    subKomponen: record.sub_komponen || undefined,
    akun: record.akun || undefined
  };
};

const mapModelToDatabaseItem = (item: Partial<BudgetItem>): Partial<BudgetItemRecord> => {
  const result: Partial<BudgetItemRecord> = {};
  
  if (item.uraian !== undefined) result.uraian = item.uraian;
  if (item.volumeSemula !== undefined) result.volume_semula = item.volumeSemula;
  if (item.satuanSemula !== undefined) result.satuan_semula = item.satuanSemula;
  if (item.hargaSatuanSemula !== undefined) result.harga_satuan_semula = item.hargaSatuanSemula;
  if (item.volumeMenjadi !== undefined) result.volume_menjadi = item.volumeMenjadi;
  if (item.satuanMenjadi !== undefined) result.satuan_menjadi = item.satuanMenjadi;
  if (item.hargaSatuanMenjadi !== undefined) result.harga_satuan_menjadi = item.hargaSatuanMenjadi;
  if (item.status !== undefined) result.status = item.status;
  if (item.isApproved !== undefined) result.is_approved = item.isApproved;
  if (item.komponenOutput !== undefined) result.komponen_output = item.komponenOutput;
  if (item.programPembebanan !== undefined) result.program_pembebanan = item.programPembebanan;
  if (item.kegiatan !== undefined) result.kegiatan = item.kegiatan;
  if (item.rincianOutput !== undefined) result.rincian_output = item.rincianOutput;
  if (item.subKomponen !== undefined) result.sub_komponen = item.subKomponen;
  if (item.akun !== undefined) result.akun = item.akun;

  // Calculate and set the derived values
  if (item.volumeSemula !== undefined && item.hargaSatuanSemula !== undefined) {
    result.jumlah_semula = calculateAmount(item.volumeSemula, item.hargaSatuanSemula);
  }
  
  if (item.volumeMenjadi !== undefined && item.hargaSatuanMenjadi !== undefined) {
    result.jumlah_menjadi = calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi);
  }
  
  if (result.jumlah_semula !== undefined && result.jumlah_menjadi !== undefined) {
    result.selisih = result.jumlah_semula - result.jumlah_menjadi;
  }

  return result;
};

const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch budget items when filters change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('budget_items')
          .select('*');

        // Apply filters if they have specific values
        if (filters.programPembebanan && filters.programPembebanan !== 'all') {
          query = query.eq('program_pembebanan', filters.programPembebanan);
        }
        
        if (filters.kegiatan && filters.kegiatan !== 'all') {
          query = query.eq('kegiatan', filters.kegiatan);
        }
        
        if (filters.rincianOutput && filters.rincianOutput !== 'all') {
          query = query.eq('rincian_output', filters.rincianOutput);
        }
        
        if (filters.komponenOutput && filters.komponenOutput !== 'all') {
          query = query.eq('komponen_output', filters.komponenOutput);
        }
        
        if (filters.subKomponen && filters.subKomponen !== 'all') {
          query = query.eq('sub_komponen', filters.subKomponen);
        }
        
        if (filters.akun && filters.akun !== 'all') {
          query = query.eq('akun', filters.akun);
        }
                
        const { data, error } = await query;

        if (error) {
          throw new Error(`Error fetching data: ${error.message}`);
        }

        // Transform database records to our model
        const items: BudgetItem[] = (data || []).map(mapDatabaseToModelItem);
        setBudgetItems(items);
      } catch (err) {
        console.error('Error in useBudgetData:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters]);

  // Add new budget item
  const addBudgetItem = async (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => {
    try {
      const jumlahSemula = calculateAmount(item.volumeSemula, item.hargaSatuanSemula);
      const jumlahMenjadi = calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi);
      const selisih = jumlahSemula - jumlahMenjadi;
      
      // Map model item to database record
      const newRecord: Omit<BudgetItemRecord, 'id' | 'created_at' | 'updated_at'> = {
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
        status: selisih === 0 ? 'unchanged' : 'changed',
        is_approved: item.isApproved,
        komponen_output: item.komponenOutput,
        program_pembebanan: item.programPembebanan || null,
        kegiatan: item.kegiatan || null,
        rincian_output: item.rincianOutput || null,
        sub_komponen: item.subKomponen || null,
        akun: item.akun || null
      };

      const { data, error } = await supabase
        .from('budget_items')
        .insert(newRecord)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Error adding budget item: ${error.message}`);
      }

      const newItem = mapDatabaseToModelItem(data);
      setBudgetItems(prevItems => [...prevItems, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error in addBudgetItem:', err);
      throw err;
    }
  };

  // Add multiple budget items at once (for import)
  const addBulkBudgetItems = async (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => {
    try {
      const newRecords = items.map(item => {
        const jumlahSemula = calculateAmount(item.volumeSemula, item.hargaSatuanSemula);
        const jumlahMenjadi = calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi);
        const selisih = jumlahSemula - jumlahMenjadi;
        
        return {
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
          status: selisih === 0 ? 'unchanged' : 'changed',
          is_approved: item.isApproved,
          komponen_output: item.komponenOutput,
          program_pembebanan: item.programPembebanan || null,
          kegiatan: item.kegiatan || null,
          rincian_output: item.rincianOutput || null,
          sub_komponen: item.subKomponen || null,
          akun: item.akun || null
        };
      });

      const { data, error } = await supabase
        .from('budget_items')
        .insert(newRecords)
        .select('*');

      if (error) {
        throw new Error(`Error adding bulk budget items: ${error.message}`);
      }

      const newItems = (data || []).map(mapDatabaseToModelItem);
      setBudgetItems(prevItems => [...prevItems, ...newItems]);
      return newItems;
    } catch (err) {
      console.error('Error in addBulkBudgetItems:', err);
      throw err;
    }
  };

  // Update existing budget item
  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      const dbUpdates = mapModelToDatabaseItem(updates);
      
      // Check if we need to update the status
      if (updates.volumeMenjadi !== undefined || 
          updates.hargaSatuanMenjadi !== undefined ||
          updates.satuanMenjadi !== undefined) {
        
        // Get the current item
        const currentItem = budgetItems.find(item => item.id === id);
        
        if (currentItem) {
          const volumeMenjadi = updates.volumeMenjadi ?? currentItem.volumeMenjadi;
          const hargaSatuanMenjadi = updates.hargaSatuanMenjadi ?? currentItem.hargaSatuanMenjadi;
          
          const newJumlahMenjadi = calculateAmount(volumeMenjadi, hargaSatuanMenjadi);
          const newSelisih = currentItem.jumlahSemula - newJumlahMenjadi;
          
          // Update status based on selisih
          if (newSelisih === 0) {
            dbUpdates.status = 'unchanged';
          } else {
            dbUpdates.status = 'changed';
          }
        }
      }
      
      const { data, error } = await supabase
        .from('budget_items')
        .update(dbUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Error updating budget item: ${error.message}`);
      }

      const updatedItem = mapDatabaseToModelItem(data);
      setBudgetItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      console.error('Error in updateBudgetItem:', err);
      throw err;
    }
  };

  // Delete budget item
  const deleteBudgetItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting budget item: ${error.message}`);
      }

      setBudgetItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error in deleteBudgetItem:', err);
      throw err;
    }
  };

  // Approve budget item
  const approveBudgetItem = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .update({ is_approved: true })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Error approving budget item: ${error.message}`);
      }

      const updatedItem = mapDatabaseToModelItem(data);
      setBudgetItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      console.error('Error in approveBudgetItem:', err);
      throw err;
    }
  };

  return { 
    budgetItems, 
    loading, 
    error, 
    addBudgetItem, 
    addBulkBudgetItems, 
    updateBudgetItem, 
    deleteBudgetItem, 
    approveBudgetItem 
  };
};

export default useBudgetData;
