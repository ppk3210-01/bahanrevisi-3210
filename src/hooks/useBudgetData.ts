
import { useState, useEffect } from 'react';
import { BudgetItem, FilterSelection, convertToBudgetItem, convertToBudgetItemRecord } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus, roundToThousands } from '@/utils/budgetCalculations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  BudgetItemRecord, 
  BudgetSummaryBase,
  BudgetSummaryRecord,
  BudgetSummaryByAccountGroup,
  BudgetSummaryByKomponen,
  BudgetSummaryByAkun,
  BudgetSummaryByProgramPembebanan,
  BudgetSummaryByKegiatan,
  BudgetSummaryByRincianOutput,
  BudgetSummaryBySubKomponen
} from '@/types/database';

type SummaryType = 'account_group' | 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen';

const useBudgetData = (filters: FilterSelection) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [summaryData, setSummaryData] = useState<BudgetSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const transformedData: BudgetItem[] = data.map((item: BudgetItemRecord) => {
            return convertToBudgetItem(item);
          });

          setBudgetItems(transformedData);
        }
        
        await fetchSummaryData();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget data. Please try again.');
        setLoading(false);
      }
    };
    
    const fetchSummaryData = async () => {
      try {
        const [
          accountGroupResult, 
          komponenResult, 
          akunResult,
          programPembebananResult,
          kegiatanResult,
          rincianOutputResult,
          subKomponenResult
        ] = await Promise.all([
          supabase.from('budget_summary_by_account_group').select('*'),
          supabase.from('budget_summary_by_komponen').select('*'),
          supabase.from('budget_summary_by_akun').select('*'),
          supabase.from('budget_summary_by_program_pembebanan').select('*'),
          supabase.from('budget_summary_by_kegiatan').select('*'),
          supabase.from('budget_summary_by_rincian_output').select('*'),
          supabase.from('budget_summary_by_sub_komponen').select('*')
        ]);
        
        let allSummaryData: BudgetSummaryRecord[] = [];
        
        if (accountGroupResult.data) {
          const accountGroupData: BudgetSummaryByAccountGroup[] = accountGroupResult.data.map(item => ({
            account_group: item.account_group || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'account_group'
          }));
          allSummaryData = [...allSummaryData, ...accountGroupData];
        }
        
        if (komponenResult.data) {
          const komponenData: BudgetSummaryByKomponen[] = komponenResult.data.map(item => ({
            komponen_output: item.komponen_output || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'komponen_output'
          }));
          allSummaryData = [...allSummaryData, ...komponenData];
        }
        
        if (akunResult.data) {
          const akunData: BudgetSummaryByAkun[] = akunResult.data.map(item => ({
            akun: item.akun || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'akun'
          }));
          allSummaryData = [...allSummaryData, ...akunData];
        }

        if (programPembebananResult.data) {
          const programPembebananData: BudgetSummaryByProgramPembebanan[] = programPembebananResult.data.map(item => ({
            program_pembebanan: item.program_pembebanan || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'program_pembebanan'
          }));
          allSummaryData = [...allSummaryData, ...programPembebananData];
        }
        
        if (kegiatanResult.data) {
          const kegiatanData: BudgetSummaryByKegiatan[] = kegiatanResult.data.map(item => ({
            kegiatan: item.kegiatan || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'kegiatan'
          }));
          allSummaryData = [...allSummaryData, ...kegiatanData];
        }
        
        if (rincianOutputResult.data) {
          const rincianOutputData: BudgetSummaryByRincianOutput[] = rincianOutputResult.data.map(item => ({
            rincian_output: item.rincian_output || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'rincian_output'
          }));
          allSummaryData = [...allSummaryData, ...rincianOutputData];
        }
        
        if (subKomponenResult.data) {
          const subKomponenData: BudgetSummaryBySubKomponen[] = subKomponenResult.data.map(item => ({
            sub_komponen: item.sub_komponen || '',
            total_semula: item.total_semula,
            total_menjadi: item.total_menjadi,
            total_selisih: item.total_selisih,
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'sub_komponen'
          }));
          allSummaryData = [...allSummaryData, ...subKomponenData];
        }
        
        setSummaryData(allSummaryData);
      } catch (err) {
        console.error('Error fetching summary data:', err);
      }
    };

    fetchData();
  }, [filters]);

  const addBudgetItem = async (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => {
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
        akun: item.akun || null
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
        const savedItem = convertToBudgetItem(data);
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

  const importBudgetItems = async (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => {
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
          program_pembebanan: item.programPembebanan || (filters.programPembebanan !== 'all' ? filters.programPembebanan : null),
          kegiatan: item.kegiatan || (filters.kegiatan !== 'all' ? filters.kegiatan : null),
          rincian_output: item.rincianOutput || (filters.rincianOutput !== 'all' ? filters.rincianOutput : null),
          sub_komponen: item.subKomponen || (filters.subKomponen !== 'all' ? filters.subKomponen : null),
          akun: item.akun || (filters.akun !== 'all' ? filters.akun : null)
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
        const savedItems: BudgetItem[] = data.map((item: BudgetItemRecord) => 
          convertToBudgetItem(item)
        );

        setBudgetItems(prev => [...prev, ...savedItems]);
        toast({
          title: "Berhasil",
          description: `${savedItems.length} item anggaran berhasil diimpor.`
        });
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

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      const currentItem = budgetItems.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }
      
      const supabaseUpdates = convertToBudgetItemRecord(updates);
      
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

  const deleteBudgetItem = async (id: string) => {
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

  const approveBudgetItem = async (id: string) => {
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

  const rejectBudgetItem = async (id: string) => {
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
    summaryData
  };
};

export default useBudgetData;
