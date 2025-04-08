import { useState, useEffect, useCallback } from 'react';
import { BudgetItem, FilterSelection } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus, roundToThousands } from '@/utils/budgetCalculations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('budget_items')
          .select('*');
        
        if (filters.akun && filters.akun !== 'all') {
          query = query.eq('akun', filters.akun);
        }
        
        if (filters.subKomponen && filters.subKomponen !== 'all') {
          query = query.eq('sub_komponen', filters.subKomponen);
        } 

        if (filters.komponenOutput && filters.komponenOutput !== 'all') {
          query = query.eq('komponen_output', filters.komponenOutput);
        } else if (filters.rincianOutput && filters.rincianOutput !== 'all') {
          query = query.eq('rincian_output', filters.rincianOutput);
        } else if (filters.kegiatan && filters.kegiatan !== 'all') {
          query = query.eq('kegiatan', filters.kegiatan);
        } else if (filters.programPembebanan && filters.programPembebanan !== 'all') {
          query = query.eq('program_pembebanan', filters.programPembebanan);
        }

        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          const transformedData: BudgetItem[] = data.map((item: any) => {
            const jumlahSemula = Number(item.jumlah_semula || 0);
            const jumlahMenjadi = Number(item.jumlah_menjadi || 0);
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
              selisih: roundToThousands(calculatedSelisih),
              status: item.status as "unchanged" | "changed" | "new" | "deleted",
              isApproved: item.is_approved,
              komponenOutput: item.komponen_output,
              programPembebanan: item.program_pembebanan || '',
              kegiatan: item.kegiatan || '',
              rincianOutput: item.rincian_output || '',
              subKomponen: item.sub_komponen || '',
              akun: item.akun || '',
              createdBy: item.created_by || '',
              updatedBy: item.updated_by || ''
            };
          });

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

  const getAllBudgetItems = useCallback(async (): Promise<BudgetItem[]> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('budget_items')
        .select('*');
      
      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        const transformedData: BudgetItem[] = data.map((item: any) => {
          const jumlahSemula = Number(item.jumlah_semula || 0);
          const jumlahMenjadi = Number(item.jumlah_menjadi || 0);
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
            selisih: roundToThousands(calculatedSelisih),
            status: item.status as "unchanged" | "changed" | "new" | "deleted",
            isApproved: item.is_approved,
            komponenOutput: item.komponen_output,
            programPembebanan: item.program_pembebanan || '',
            kegiatan: item.kegiatan || '',
            rincianOutput: item.rincian_output || '',
            subKomponen: item.sub_komponen || '',
            akun: item.akun || '',
            createdBy: item.created_by || '',
            updatedBy: item.updated_by || ''
          };
        });

        return transformedData;
      }
      return [];
    } catch (err) {
      console.error('Error fetching all budget data:', err);
      return [];
    }
  }, []);

  const addBudgetItem = async (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>): Promise<void> => {
    try {
      const jumlahSemula = roundToThousands(calculateAmount(item.volumeSemula, item.hargaSatuanSemula));
      const jumlahMenjadi = roundToThousands(calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi));
      const selisih = roundToThousands(jumlahMenjadi - jumlahSemula);

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
        program_pembebanan: filters.programPembebanan !== 'all' ? filters.programPembebanan : null,
        kegiatan: filters.kegiatan !== 'all' ? filters.kegiatan : null,
        rincian_output: filters.rincianOutput !== 'all' ? filters.rincianOutput : null,
        sub_komponen: item.subKomponen || null,
        akun: item.akun || null,
        created_by: user?.id || null,
        updated_by: user?.id || null
      };

      const { data, error: supabaseError } = await supabase
        .from('budget_items')
        .insert(newItemData)
        .select()
        .single();
      
      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
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
          akun: data.akun || '',
          createdBy: data.created_by || '',
          updatedBy: data.updated_by || ''
        };

        setBudgetItems(prev => [...prev, savedItem]);
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

  const importBudgetItems = async (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status' | 'isApproved' | 'createdBy' | 'updatedBy'>[]): Promise<void> => {
    try {
      setLoading(true);
      
      const itemsToInsert = items.map(item => {
        const jumlahSemula = roundToThousands(calculateAmount(item.volumeSemula, item.hargaSatuanSemula));
        const jumlahMenjadi = roundToThousands(calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi));
        const selisih = roundToThousands(jumlahMenjadi - jumlahSemula);
        
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
          komponen_output: item.komponenOutput,
          status: 'new',
          is_approved: false,
          program_pembebanan: item.programPembebanan || filters.programPembebanan,
          kegiatan: item.kegiatan || filters.kegiatan,
          rincian_output: item.rincianOutput || filters.rincianOutput,
          sub_komponen: item.subKomponen || filters.subKomponen,
          akun: item.akun || filters.akun,
          created_by: user?.id || null,
          updated_by: user?.id || null
        };
      });
      
      const { data, error: supabaseError } = await supabase
        .from('budget_items')
        .insert(itemsToInsert)
        .select();
      
      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
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
          akun: item.akun || '',
          createdBy: item.created_by || '',
          updatedBy: item.updated_by || ''
        }));

        setBudgetItems(prev => [...prev, ...savedItems]);
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

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>): Promise<void> => {
    try {
      const currentItem = budgetItems.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }
      
      const supabaseUpdates: Record<string, any> = {};
      
      if ('uraian' in updates) supabaseUpdates.uraian = updates.uraian;
      if ('volumeSemula' in updates) supabaseUpdates.volume_semula = updates.volumeSemula;
      if ('satuanSemula' in updates) supabaseUpdates.satuan_semula = updates.satuanSemula;
      if ('hargaSatuanSemula' in updates) supabaseUpdates.harga_satuan_semula = updates.hargaSatuanSemula;
      if ('volumeMenjadi' in updates) supabaseUpdates.volume_menjadi = updates.volumeMenjadi;
      if ('satuanMenjadi' in updates) supabaseUpdates.satuan_menjadi = updates.satuanMenjadi;
      if ('hargaSatuanMenjadi' in updates) supabaseUpdates.harga_satuan_menjadi = updates.hargaSatuanMenjadi;
      if ('subKomponen' in updates) supabaseUpdates.sub_komponen = updates.subKomponen;
      if ('akun' in updates) supabaseUpdates.akun = updates.akun;
      
      let updatedItem = { ...currentItem, ...updates };
      
      if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates) {
        const jumlahMenjadi = calculateAmount(
          updatedItem.volumeMenjadi, 
          updatedItem.hargaSatuanMenjadi
        );
        supabaseUpdates.jumlah_menjadi = jumlahMenjadi;
        updatedItem.jumlahMenjadi = jumlahMenjadi;
        
        const selisih = jumlahMenjadi - updatedItem.jumlahSemula;
        supabaseUpdates.selisih = selisih;
        updatedItem.selisih = selisih;
      }
      
      if ('volumeSemula' in updates || 'hargaSatuanSemula' in updates) {
        const jumlahSemula = calculateAmount(
          updatedItem.volumeSemula, 
          updatedItem.hargaSatuanSemula
        );
        supabaseUpdates.jumlah_semula = jumlahSemula;
        updatedItem.jumlahSemula = jumlahSemula;
        
        const selisih = updatedItem.jumlahMenjadi - jumlahSemula;
        supabaseUpdates.selisih = selisih;
        updatedItem.selisih = selisih;
      }
      
      if (Object.keys(updates).length > 0 && currentItem.isApproved) {
        supabaseUpdates.is_approved = false;
        supabaseUpdates.status = 'changed';
        updatedItem.isApproved = false;
        updatedItem.status = 'changed';
      } else if ('volumeMenjadi' in updates || 'hargaSatuanMenjadi' in updates || 'satuanMenjadi' in updates) {
        updatedItem = updateItemStatus(updatedItem);
        supabaseUpdates.status = updatedItem.status;
      }
      
      supabaseUpdates.updated_by = user?.id || null;
      
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      setBudgetItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            return updatedItem;
          }
          return item;
        })
      );
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

  const deleteBudgetItem = async (id: string): Promise<void> => {
    try {
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
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

  const approveBudgetItem = async (id: string): Promise<void> => {
    try {
      const item = budgetItems.find(item => item.id === id);
      if (!item) {
        throw new Error('Item not found');
      }
      
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

  const rejectBudgetItem = async (id: string): Promise<void> => {
    try {
      const item = budgetItems.find(item => item.id === id);
      if (!item) {
        throw new Error('Item not found');
      }
      
      const { error: supabaseError } = await supabase
        .from('budget_items')
        .update({
          volume_menjadi: item.volumeSemula,
          satuan_menjadi: item.satuanSemula,
          harga_satuan_menjadi: item.hargaSatuanSemula,
          jumlah_menjadi: item.jumlahSemula,
          selisih: 0,
          status: 'unchanged',
          is_approved: false
        })
        .eq('id', id);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      setBudgetItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              volumeMenjadi: item.volumeSemula,
              satuanMenjadi: item.satuanSemula,
              hargaSatuanMenjadi: item.hargaSatuanSemula,
              jumlahMenjadi: item.jumlahSemula,
              selisih: 0,
              status: 'unchanged',
              isApproved: false
            };
          }
          return item;
        })
      );
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
    getAllBudgetItems
  };
};

export default useBudgetData;
