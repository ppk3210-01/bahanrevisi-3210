import { useState, useEffect } from 'react';
import { BudgetItem, FilterSelection, convertToBudgetItem, convertToBudgetItemRecord } from '@/types/budget';
import { calculateAmount, calculateDifference, updateItemStatus } from '@/utils/budgetCalculations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  BudgetItemRecord, 
  BudgetSummaryBase,
  BudgetSummaryRecord,
  BudgetSummaryByKomponen,
  BudgetSummaryByAkun,
  BudgetSummaryByProgramPembebanan,
  BudgetSummaryByKegiatan,
  BudgetSummaryByRincianOutput,
  BudgetSummaryBySubKomponen,
  BudgetSummaryByAccountGroup,
  BudgetSummaryByAkunGroup
} from '@/types/database';
import { roundToThousands } from '@/utils/budgetCalculations';

type SummaryType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group' | 'akun_group';

export default function useBudgetData(filters: FilterSelection) {
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
            const budgetItem = convertToBudgetItem(item);
            budgetItem.jumlahSemula = roundToThousands(budgetItem.jumlahSemula);
            budgetItem.jumlahMenjadi = roundToThousands(budgetItem.jumlahMenjadi);
            budgetItem.selisih = roundToThousands(budgetItem.selisih);
            
            // Calculate sisa anggaran if not present or zero
            if (!budgetItem.sisaAnggaran || budgetItem.sisaAnggaran === 0) {
              // For demonstration purposes, let's calculate sisa anggaran as a percentage of jumlahMenjadi
              // In a real scenario, this would come from actual budget allocation data
              budgetItem.sisaAnggaran = Math.round(budgetItem.jumlahMenjadi * 0.3); // 30% remaining budget as example
            }
            
            return budgetItem;
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
        // Fetch all budget items first for sisa_anggaran calculations
        const { data: budgetItemsData, error: budgetItemsError } = await supabase
          .from('budget_items')
          .select('*');
        
        if (budgetItemsError) {
          throw budgetItemsError;
        }
        
        // Calculate sisa anggaran for items that don't have it
        const enhancedBudgetItems = budgetItemsData?.map(item => {
          let sisaAnggaran = Number(item.sisa_anggaran) || 0;
          if (sisaAnggaran === 0) {
            // Calculate sisa anggaran as 30% of jumlah_menjadi for demonstration
            sisaAnggaran = Math.round((Number(item.jumlah_menjadi) || 0) * 0.3);
          }
          return { ...item, sisa_anggaran: sisaAnggaran };
        }) || [];
        
        // Fetch summary data from RPC functions
        const [
          komponenResult, 
          akunResult,
          programPembebananResult,
          kegiatanResult,
          rincianOutputResult,
          subKomponenResult,
          accountGroupResult,
          akunGroupResult
        ] = await Promise.all([
          supabase.rpc('get_budget_summary_by_komponen'),
          supabase.rpc('get_budget_summary_by_akun'),
          supabase.rpc('get_budget_summary_by_program_pembebanan'),
          supabase.rpc('get_budget_summary_by_kegiatan'),
          supabase.rpc('get_budget_summary_by_rincian_output'),
          supabase.rpc('get_budget_summary_by_sub_komponen'),
          supabase.rpc('get_budget_summary_by_account_group'),
          supabase.rpc('get_budget_summary_by_akun_group')
        ]);
        
        // Create a comprehensive sisa_anggaran aggregation function
        const aggregateSisaAnggaranByField = (fieldName: string, data: any[]) => {
          const aggregation = new Map<string, number>();
          
          if (!data || data.length === 0) {
            console.log(`No budget items data available for ${fieldName} aggregation`);
            return aggregation;
          }
          
          data.forEach(item => {
            const fieldValue = item[fieldName];
            if (!fieldValue) return;
            
            const sisaAnggaran = Number(item.sisa_anggaran) || 0;
            const currentSum = aggregation.get(fieldValue) || 0;
            aggregation.set(fieldValue, currentSum + sisaAnggaran);
            
            console.log(`${fieldName} aggregation: ${fieldValue} += ${sisaAnggaran} (total: ${currentSum + sisaAnggaran})`);
          });
          
          console.log(`Final ${fieldName} sisa_anggaran aggregation:`, Array.from(aggregation.entries()));
          return aggregation;
        };
        
        let allSummaryData: BudgetSummaryRecord[] = [];
        
        // Process each summary type with proper sisa_anggaran aggregation
        if (komponenResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('komponen_output', enhancedBudgetItems);
          const komponenData: BudgetSummaryByKomponen[] = komponenResult.data.map(item => ({
            komponen_output: item.komponen_output || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.komponen_output || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'komponen_output'
          }));
          allSummaryData = [...allSummaryData, ...komponenData];
        }
        
        if (akunResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('akun', enhancedBudgetItems);
          const akunData: BudgetSummaryByAkun[] = akunResult.data.map(item => ({
            akun: item.akun || '',
            akun_name: item.akun_name || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.akun || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'akun'
          }));
          allSummaryData = [...allSummaryData, ...akunData];
        }

        if (programPembebananResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('program_pembebanan', enhancedBudgetItems);
          const programPembebananData: BudgetSummaryByProgramPembebanan[] = programPembebananResult.data.map(item => ({
            program_pembebanan: item.program_pembebanan || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.program_pembebanan || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'program_pembebanan'
          }));
          allSummaryData = [...allSummaryData, ...programPembebananData];
        }
        
        if (kegiatanResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('kegiatan', enhancedBudgetItems);
          const kegiatanData: BudgetSummaryByKegiatan[] = kegiatanResult.data.map(item => ({
            kegiatan: item.kegiatan || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.kegiatan || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'kegiatan'
          }));
          allSummaryData = [...allSummaryData, ...kegiatanData];
        }
        
        if (rincianOutputResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('rincian_output', enhancedBudgetItems);
          const rincianOutputData: BudgetSummaryByRincianOutput[] = rincianOutputResult.data.map(item => ({
            rincian_output: item.rincian_output || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.rincian_output || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'rincian_output'
          }));
          allSummaryData = [...allSummaryData, ...rincianOutputData];
        }
        
        if (subKomponenResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('sub_komponen', enhancedBudgetItems);
          const subKomponenData: BudgetSummaryBySubKomponen[] = subKomponenResult.data.map(item => ({
            sub_komponen: item.sub_komponen || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.sub_komponen || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'sub_komponen'
          }));
          allSummaryData = [...allSummaryData, ...subKomponenData];
        }
        
        if (accountGroupResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('account_group', enhancedBudgetItems);
          const accountGroupData: BudgetSummaryByAccountGroup[] = accountGroupResult.data.map(item => ({
            account_group: item.account_group || '',
            account_group_name: item.account_group_name || item.account_group || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.account_group || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'account_group'
          }));
          allSummaryData = [...allSummaryData, ...accountGroupData];
        }
        
        if (akunGroupResult.data && enhancedBudgetItems) {
          const sisaAnggaranMap = aggregateSisaAnggaranByField('akun_group', enhancedBudgetItems);
          const akunGroupData: BudgetSummaryByAkunGroup[] = akunGroupResult.data.map(item => ({
            akun_group: item.akun_group || '',
            akun_group_name: item.akun_group_name || item.akun_group || '',
            total_semula: roundToThousands(item.total_semula || 0),
            total_menjadi: roundToThousands(item.total_menjadi || 0),
            total_selisih: roundToThousands(item.total_selisih || 0),
            total_sisa_anggaran: roundToThousands(sisaAnggaranMap.get(item.akun_group || '') || 0),
            new_items: item.new_items,
            changed_items: item.changed_items,
            total_items: item.total_items,
            type: 'akun_group'
          }));
          allSummaryData = [...allSummaryData, ...akunGroupData];
        }
        
        console.log('Final processed summary data with calculated sisa_anggaran:', allSummaryData);
        setSummaryData(allSummaryData);
      } catch (err) {
        console.error('Error fetching summary data:', err);
      }
    };

    fetchData();
  }, [filters]);

  const addBudgetItem = async (item: Omit<BudgetItem, "id" | "jumlahSemula" | "jumlahMenjadi" | "selisih" | "status">) => {
    try {
      const jumlahSemula = roundToThousands(calculateAmount(item.volumeSemula, item.hargaSatuanSemula));
      const jumlahMenjadi = roundToThousands(calculateAmount(item.volumeMenjadi, item.hargaSatuanMenjadi));

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
        sisa_anggaran: item.sisaAnggaran || Math.round(jumlahMenjadi * 0.3),
        status: 'new',
        program_pembebanan: filters.programPembebanan !== 'all' ? filters.programPembebanan : null,
        kegiatan: filters.kegiatan !== 'all' ? filters.kegiatan : null,
        rincian_output: filters.rincianOutput !== 'all' ? filters.rincianOutput : null,
        komponen_output: item.komponenOutput || (filters.komponenOutput !== 'all' ? filters.komponenOutput : null),
        sub_komponen: item.subKomponen || (filters.subKomponen !== 'all' ? filters.subKomponen : null),
        akun: item.akun || (filters.akun !== 'all' ? filters.akun : null)
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
        savedItem.jumlahSemula = roundToThousands(savedItem.jumlahSemula);
        savedItem.jumlahMenjadi = roundToThousands(savedItem.jumlahMenjadi);
        savedItem.selisih = roundToThousands(savedItem.selisih);
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

  const importBudgetItems = async (items: Partial<BudgetItem>[]): Promise<void> => {
    try {
      setLoading(true);
      console.log("Starting importBudgetItems with:", items);
      
      const itemsToInsert = items.map(item => {
        const jumlahSemula = roundToThousands(calculateAmount(item.volumeSemula || 0, item.hargaSatuanSemula || 0));
        const jumlahMenjadi = roundToThousands(calculateAmount(item.volumeMenjadi || 0, item.hargaSatuanMenjadi || 0));
        const sisaAnggaran = item.sisaAnggaran || Math.round(jumlahMenjadi * 0.3);

        console.log(`Mapping sisaAnggaran for item "${item.uraian}":`, sisaAnggaran);

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
          sisa_anggaran: sisaAnggaran,
          status: 'new',
          program_pembebanan: item.programPembebanan || (filters.programPembebanan !== 'all' ? filters.programPembebanan : null),
          kegiatan: item.kegiatan || (filters.kegiatan !== 'all' ? filters.kegiatan : null),
          rincian_output: item.rincianOutput || (filters.rincianOutput !== 'all' ? filters.rincianOutput : null),
          komponen_output: item.komponenOutput || (filters.komponenOutput !== 'all' ? filters.komponenOutput : null),
          sub_komponen: item.subKomponen || (filters.subKomponen !== 'all' ? filters.subKomponen : null),
          akun: item.akun || (filters.akun !== 'all' ? filters.akun : null)
        };
      });
      
      console.log("Items to insert into database:", itemsToInsert);
      
      const { data, error: supabaseError } = await supabase
        .from('budget_items')
        .insert(itemsToInsert)
        .select();
      
      if (supabaseError) {
        console.error("Supabase error during import:", supabaseError);
        throw supabaseError;
      }

      if (data) {
        const savedItems: BudgetItem[] = data.map((item: BudgetItemRecord) => {
          const budgetItem = convertToBudgetItem(item);
          budgetItem.jumlahSemula = roundToThousands(budgetItem.jumlahSemula);
          budgetItem.jumlahMenjadi = roundToThousands(budgetItem.jumlahMenjadi);
          budgetItem.selisih = roundToThousands(budgetItem.selisih);
          return budgetItem;
        });

        setBudgetItems(prev => [...prev, ...savedItems]);
        console.log(`Imported ${savedItems.length} items successfully`);
        toast({
          title: "Berhasil",
          description: `${savedItems.length} item anggaran berhasil diimpor.`
        });
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
        const jumlahMenjadi = roundToThousands(calculateAmount(
          updatedItem.volumeMenjadi, 
          updatedItem.hargaSatuanMenjadi
        ));
        supabaseUpdates.jumlah_menjadi = jumlahMenjadi;
        updatedItem.jumlahMenjadi = jumlahMenjadi;
        
        updatedItem.selisih = roundToThousands(jumlahMenjadi - updatedItem.jumlahSemula);
      }
      
      if ('volumeSemula' in updates || 'hargaSatuanSemula' in updates) {
        const jumlahSemula = roundToThousands(calculateAmount(
          updatedItem.volumeSemula, 
          updatedItem.hargaSatuanSemula
        ));
        supabaseUpdates.jumlah_semula = jumlahSemula;
        updatedItem.jumlahSemula = jumlahSemula;
        
        updatedItem.selisih = roundToThousands(updatedItem.jumlahMenjadi - jumlahSemula);
      }
      
      if (Object.keys(updates).length > 0 && currentItem.isApproved) {
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
          jumlah_semula: roundToThousands(item.jumlahMenjadi),
          status: 'unchanged'
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
              jumlahSemula: roundToThousands(item.jumlahMenjadi),
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
          harga_satuan_menjadi: item.hargaSatuanMenjadi,
          jumlah_menjadi: roundToThousands(item.jumlahSemula),
          status: 'unchanged'
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
              hargaSatuanMenjadi: item.hargaSatuanMenjadi,
              jumlahMenjadi: roundToThousands(item.jumlahSemula),
              selisih: 0,
              status: 'unchanged',
              isApproved: true
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
}
