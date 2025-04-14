import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FilterSelection } from '@/types/budget';

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
  status: 'ok' | 'belum_isi' | 'belum_lengkap' | 'sisa' | string;
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

  const fetchRPDData = async () => {
    try {
      setLoading(true);
      
      let { data, error } = { data: null, error: null };

      // Use unfiltered query for all cases to avoid flickering
      const result = await supabase.rpc('get_rpd_data');
      data = result.data;
      error = result.error;
      
      if (error) {
        throw error;
      }
      
      // Apply filters on the client side if needed
      if (data && filters && (
        (filters.programPembebanan && filters.programPembebanan !== 'all') ||
        (filters.kegiatan && filters.kegiatan !== 'all') ||
        (filters.rincianOutput && filters.rincianOutput !== 'all') ||
        (filters.komponenOutput && filters.komponenOutput !== 'all') ||
        (filters.subKomponen && filters.subKomponen !== 'all') ||
        (filters.akun && filters.akun !== 'all')
      )) {
        // For now, we'll skip client-side filtering as the data structure
        // doesn't include the filter fields yet
      }
      
      setRpdItems(data || []);
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
  };

  useEffect(() => {
    fetchRPDData();
  }, [filters]);

  const updateRPDItem = async (itemId: string, monthValues: Partial<RPDMonthValues>) => {
    try {
      const { error } = await supabase
        .from('rencana_penarikan_dana')
        .update({
          ...monthValues,
          updated_at: new Date().toISOString()
        })
        .eq('budget_item_id', itemId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setRpdItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            const updatedItem = {
              ...item,
              ...monthValues
            };
            
            // Calculate jumlah_rpd
            const jumlah_rpd = 
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
              (updatedItem.desember || 0);
            
            updatedItem.jumlah_rpd = jumlah_rpd;
            
            // Determine status - improved logic
            if (jumlah_rpd === item.jumlah_menjadi) {
              updatedItem.status = 'ok';
            } else if (
              item.jumlah_menjadi === 0 || 
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
              jumlah_rpd !== item.jumlah_menjadi
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
