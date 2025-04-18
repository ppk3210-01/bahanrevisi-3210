import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FilterSelection } from '@/types/budget';
import { roundToThousands } from '@/utils/budgetCalculations';

export type RPDItem = {
  id: string;
  uraian: string;
  volume_menjadi: number;
  satuan_menjadi: string;
  harga_satuan_menjadi: number;
  jumlah_menjadi: number;
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;
  jumlah_rpd: number;
  selisih: number;
  status: 'ok' | 'belum_isi' | 'belum_lengkap' | 'sisa' | string;
  // Adding the missing fields that are used in DetailDialog
  program_pembebanan?: string;
  kegiatan?: string;
  rincian_output?: string;
  komponen_output?: string;
  sub_komponen?: string;
  akun?: string;
};

type RPDMonthValues = {
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;
};

export const useRPDData = (filters?: FilterSelection) => {
  const [rpdItems, setRpdItems] = useState<RPDItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef<boolean>(false);
  const isUpdatingRef = useRef<boolean>(false);

  const fetchRPDData = useCallback(async () => {
    try {
      if (isUpdatingRef.current) {
        return;
      }

      if (!dataFetchedRef.current) {
        setLoading(true);
      }
      
      console.log('Fetching RPD data...');
      
      const { data, error } = await supabase.rpc('get_rpd_data');
      
      if (error) {
        console.error('Error from get_rpd_data RPC:', error);
        throw error;
      }
      
      console.log('RPD data received:', data?.length || 0, 'items');
      
      let filteredData = data || [];
      
      if (filters && (
        (filters.programPembebanan && filters.programPembebanan !== 'all') ||
        (filters.kegiatan && filters.kegiatan !== 'all') ||
        (filters.rincianOutput && filters.rincianOutput !== 'all') ||
        (filters.komponenOutput && filters.komponenOutput !== 'all') ||
        (filters.subKomponen && filters.subKomponen !== 'all') ||
        (filters.akun && filters.akun !== 'all')
      )) {
        const { data: budgetData, error: budgetError } = await supabase
          .from('budget_items')
          .select('id, program_pembebanan, kegiatan, rincian_output, komponen_output, sub_komponen, akun')
          .neq('status', 'deleted');
        
        if (budgetError) {
          throw budgetError;
        }
        
        const budgetMap = new Map();
        if (budgetData) {
          budgetData.forEach(item => {
            budgetMap.set(item.id, item);
          });
        }
        
        filteredData = filteredData.filter(item => {
          const budgetItem = budgetMap.get(item.id);
          if (!budgetItem) return false;
          
          if (filters.programPembebanan && filters.programPembebanan !== 'all' && 
              budgetItem.program_pembebanan !== filters.programPembebanan) {
            return false;
          }
          
          if (filters.kegiatan && filters.kegiatan !== 'all' && 
              budgetItem.kegiatan !== filters.kegiatan) {
            return false;
          }
          
          if (filters.rincianOutput && filters.rincianOutput !== 'all' && 
              budgetItem.rincian_output !== filters.rincianOutput) {
            return false;
          }
          
          if (filters.komponenOutput && filters.komponenOutput !== 'all' && 
              budgetItem.komponen_output !== filters.komponenOutput) {
            return false;
          }
          
          if (filters.subKomponen && filters.subKomponen !== 'all' && 
              budgetItem.sub_komponen !== filters.subKomponen) {
            return false;
          }
          
          if (filters.akun && filters.akun !== 'all' && 
              budgetItem.akun !== filters.akun) {
            return false;
          }
          
          return true;
        });
      }
      
      console.log('Filtered RPD data:', filteredData.length, 'items');
      
      const { data: budgetDetails, error: budgetError } = await supabase
        .from('budget_items')
        .select('id, program_pembebanan, kegiatan, rincian_output, komponen_output, sub_komponen, akun')
        .in('id', filteredData.map(item => item.id));
      
      if (budgetError) {
        console.error('Error fetching budget details:', budgetError);
      }
      
      const budgetDetailsMap = new Map();
      if (budgetDetails) {
        budgetDetails.forEach(item => {
          budgetDetailsMap.set(item.id, item);
        });
      }
      
      const roundedData = filteredData.map(item => {
        const budgetItem = budgetDetailsMap.get(item.id) || {};
        
        const jumlahRpd = roundToThousands(
          (item.januari || 0) +
          (item.februari || 0) +
          (item.maret || 0) +
          (item.april || 0) +
          (item.mei || 0) +
          (item.juni || 0) +
          (item.juli || 0) +
          (item.agustus || 0) +
          (item.september || 0) +
          (item.oktober || 0) +
          (item.november || 0) +
          (item.desember || 0)
        );
        
        const selisihValue = roundToThousands(item.jumlah_menjadi - jumlahRpd);
        
        return {
          ...item,
          jumlah_menjadi: roundToThousands(item.jumlah_menjadi),
          // Do not round harga_satuan_menjadi
          januari: roundToThousands(item.januari || 0),
          februari: roundToThousands(item.februari || 0),
          maret: roundToThousands(item.maret || 0),
          april: roundToThousands(item.april || 0),
          mei: roundToThousands(item.mei || 0),
          juni: roundToThousands(item.juni || 0),
          juli: roundToThousands(item.juli || 0),
          agustus: roundToThousands(item.agustus || 0),
          september: roundToThousands(item.september || 0),
          oktober: roundToThousands(item.oktober || 0),
          november: roundToThousands(item.november || 0),
          desember: roundToThousands(item.desember || 0),
          jumlah_rpd: jumlahRpd,
          selisih: selisihValue,
          // Add budget item details
          program_pembebanan: budgetItem.program_pembebanan || null,
          kegiatan: budgetItem.kegiatan || null,
          rincian_output: budgetItem.rincian_output || null,
          komponen_output: budgetItem.komponen_output || null,
          sub_komponen: budgetItem.sub_komponen || null,
          akun: budgetItem.akun || null
        };
      });
      
      setRpdItems(roundedData);
      dataFetchedRef.current = true;
    } catch (err) {
      console.error('Error fetching RPD data:', err);
      setError('Gagal memuat data RPD. Silakan coba lagi.');
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal memuat data. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRPDData();
    
    const channel = supabase
      .channel('rpd-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rencana_penarikan_dana',
        },
        (payload) => {
          if (!isUpdatingRef.current) {
            console.log('RPD data changed, refreshing...');
            fetchRPDData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRPDData]);

  const updateRPDItem = async (itemId: string, monthValues: Partial<RPDMonthValues>) => {
    try {
      isUpdatingRef.current = true;
      console.log('Updating RPD item in database:', itemId, monthValues);
      
      // Ensure we're working with numbers and rounding to thousands
      const updates: Partial<RPDMonthValues> = {};
      
      Object.entries(monthValues).forEach(([key, value]) => {
        if (typeof value === 'string') {
          updates[key as keyof RPDMonthValues] = roundToThousands(parseFloat(value) || 0);
        } else {
          updates[key as keyof RPDMonthValues] = roundToThousands(value || 0);
        }
      });
      
      // Fix: Correct the column name to match the database schema - budget_item_id
      const { error } = await supabase
        .from('rencana_penarikan_dana')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('budget_item_id', itemId);
      
      if (error) {
        console.error('Error updating RPD data in Supabase:', error);
        throw error;
      }
      
      // Update local state
      setRpdItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            const updatedItem = {
              ...item,
              ...updates
            };
            
            const jumlah_rpd = roundToThousands(
              (updatedItem.januari || 0) +
              (updatedItem.februari || 0) +
              (updatedItem.maret || 0) +
              (updatedItem.april || 0) +
              (updatedItem.mei || 0) +
              (updatedItem.juni || 0) +
              (updatedItem.juli || 0) +
              (updatedItem.agustus || 0) +
              (updatedItem.september || 0) +
              (updatedItem.oktober || 0) +
              (updatedItem.november || 0) +
              (updatedItem.desember || 0)
            );
            
            updatedItem.jumlah_rpd = jumlah_rpd;
            updatedItem.selisih = roundToThousands(updatedItem.jumlah_menjadi - jumlah_rpd);
            
            if (jumlah_rpd === updatedItem.jumlah_menjadi) {
              updatedItem.status = 'ok';
            } else if (
              updatedItem.jumlah_menjadi === 0 || 
              (updatedItem.januari === 0 && 
               updatedItem.februari === 0 && 
               updatedItem.maret === 0 && 
               updatedItem.april === 0 && 
               updatedItem.mei === 0 && 
               updatedItem.juni === 0 && 
               updatedItem.juli === 0 && 
               updatedItem.agustus === 0 && 
               updatedItem.september === 0 && 
               updatedItem.oktober === 0 && 
               updatedItem.november === 0 && 
               updatedItem.desember === 0)
            ) {
              updatedItem.status = 'belum_isi';
            } else if (
              updatedItem.januari > 0 && 
              updatedItem.februari > 0 && 
              updatedItem.maret > 0 && 
              updatedItem.april > 0 && 
              updatedItem.mei > 0 && 
              updatedItem.juni > 0 && 
              updatedItem.juli > 0 && 
              updatedItem.agustus > 0 && 
              updatedItem.september > 0 && 
              updatedItem.oktober > 0 && 
              updatedItem.november > 0 && 
              updatedItem.desember > 0 && 
              jumlah_rpd !== updatedItem.jumlah_menjadi
            ) {
              updatedItem.status = 'sisa';
            } else {
              updatedItem.status = 'belum_lengkap';
            }
            
            return updatedItem;
          }
          return item;
        })
      );
      
      toast({
        title: "Berhasil",
        description: 'Data RPD berhasil disimpan.'
      });
      
      return true;
    } catch (err) {
      console.error('Error updating RPD data:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menyimpan data. Silakan coba lagi.'
      });
      return false;
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const refreshData = () => {
    fetchRPDData();
  };

  return {
    rpdItems,
    loading,
    error,
    updateRPDItem,
    refreshData
  };
};
