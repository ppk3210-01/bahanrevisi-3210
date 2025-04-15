
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/budgetCalculations';
import { FilterSelection } from '@/types/budget';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BudgetItemRPD } from '@/types/budget';
import { HIERARCHY_DATA } from '@/lib/constants';
import { AlertCircle, Check } from 'lucide-react';

interface RPDTableProps {
  filters: FilterSelection;
}

const RPDTable: React.FC<RPDTableProps> = ({ filters }) => {
  const [rpdData, setRpdData] = useState<BudgetItemRPD[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    fetchRPDData();
    
    // Setup real-time subscription for changes
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rencana_penarikan_dana'
        },
        () => {
          fetchRPDData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  useEffect(() => {
    buildFilterQuery();
  }, [filters]);

  const buildFilterQuery = () => {
    const conditions = [];
    
    if (filters.programPembebanan !== 'all') {
      conditions.push(`program_pembebanan.eq.${filters.programPembebanan}`);
    }
    
    if (filters.kegiatan !== 'all') {
      conditions.push(`kegiatan.eq.${filters.kegiatan}`);
    }
    
    if (filters.rincianOutput !== 'all') {
      conditions.push(`rincian_output.eq.${filters.rincianOutput}`);
    }
    
    if (filters.komponenOutput !== 'all') {
      conditions.push(`komponen_output.eq.${filters.komponenOutput}`);
    }
    
    if (filters.subKomponen !== 'all') {
      conditions.push(`sub_komponen.eq.${filters.subKomponen}`);
    }
    
    if (filters.akun !== 'all') {
      conditions.push(`akun.eq.${filters.akun}`);
    }
    
    setFilterQuery(conditions.join(','));
  };

  const fetchRPDData = async () => {
    setLoading(true);
    
    try {
      // Call the get_rpd_data function that includes filters
      let query = supabase.rpc('get_rpd_data');
      
      // Fetch the data
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Filter the data based on our filters
      let filteredData = data;
      
      // Apply client-side filtering
      if (filters.programPembebanan !== 'all') {
        filteredData = filteredData.filter(item => 
          item.uraian.includes(filters.programPembebanan)
        );
      }
      
      if (filters.komponenOutput !== 'all') {
        filteredData = filteredData.filter(item => 
          item.uraian.includes(filters.komponenOutput)
        );
      }
      
      if (filters.subKomponen !== 'all') {
        filteredData = filteredData.filter(item => 
          item.uraian.includes(filters.subKomponen)
        );
      }
      
      if (filters.akun !== 'all') {
        filteredData = filteredData.filter(item => 
          item.uraian.includes(filters.akun)
        );
      }
      
      setRpdData(filteredData);
    } catch (error) {
      console.error('Error fetching RPD data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load RPD data. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRPD = (item: BudgetItemRPD): number => {
    return (
      item.januari +
      item.februari +
      item.maret +
      item.april +
      item.mei +
      item.juni +
      item.juli +
      item.agustus +
      item.september +
      item.oktober +
      item.november +
      item.desember
    );
  };

  const getStatusIndicator = (item: BudgetItemRPD) => {
    const total = calculateTotalRPD(item);
    
    if (item.jumlah_menjadi === 0) {
      return { class: 'status-indicator status-indicator-info', text: 'Belum Ada Anggaran' };
    }
    
    if (total === 0) {
      return { class: 'status-indicator status-indicator-warning', text: 'Belum Diisi' };
    }
    
    if (total === item.jumlah_menjadi) {
      return { class: 'status-indicator status-indicator-ok', text: 'Sesuai' };
    }
    
    if (total < item.jumlah_menjadi) {
      return { class: 'status-indicator status-indicator-warning', text: 'Kurang' };
    }
    
    return { class: 'status-indicator status-indicator-error', text: 'Lebih' };
  };

  const handleEdit = (item: BudgetItemRPD) => {
    setEditingId(item.id);
    setEditValues({
      januari: item.januari,
      februari: item.februari,
      maret: item.maret,
      april: item.april,
      mei: item.mei,
      juni: item.juni,
      juli: item.juli,
      agustus: item.agustus,
      september: item.september,
      oktober: item.oktober,
      november: item.november,
      desember: item.desember
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      const { error } = await supabase
        .from('rencana_penarikan_dana')
        .update({
          januari: editValues.januari || 0,
          februari: editValues.februari || 0,
          maret: editValues.maret || 0,
          april: editValues.april || 0,
          mei: editValues.mei || 0,
          juni: editValues.juni || 0,
          juli: editValues.juli || 0,
          agustus: editValues.agustus || 0,
          september: editValues.september || 0,
          oktober: editValues.oktober || 0,
          november: editValues.november || 0,
          desember: editValues.desember || 0
        })
        .eq('budget_item_id', editingId);
      
      if (error) throw error;
      
      // Update the local state to reflect changes immediately
      setRpdData(prevData => 
        prevData.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              januari: editValues.januari || 0,
              februari: editValues.februari || 0,
              maret: editValues.maret || 0,
              april: editValues.april || 0,
              mei: editValues.mei || 0,
              juni: editValues.juni || 0,
              juli: editValues.juli || 0,
              agustus: editValues.agustus || 0,
              september: editValues.september || 0,
              oktober: editValues.oktober || 0,
              november: editValues.november || 0,
              desember: editValues.desember || 0,
              jumlah_rpd: Object.values(editValues).reduce((sum, val) => sum + (val || 0), 0)
            };
          }
          return item;
        })
      );
      
      toast({
        title: 'Berhasil',
        description: 'Data RPD berhasil disimpan'
      });
    } catch (error) {
      console.error('Error saving RPD data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan data RPD'
      });
    } finally {
      setEditingId(null);
      setEditValues({});
    }
  };

  const handleValueChange = (month: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditValues(prev => ({ ...prev, [month]: numValue }));
  };

  const getTotalByMonth = (month: string): number => {
    return rpdData.reduce((sum, item) => sum + (item[month as keyof BudgetItemRPD] as number), 0);
  };

  const getGrandTotal = (): number => {
    return rpdData.reduce((sum, item) => sum + calculateTotalRPD(item), 0);
  };

  const getTotalBudget = (): number => {
    return rpdData.reduce((sum, item) => sum + item.jumlah_menjadi, 0);
  };

  if (loading) {
    return <div className="text-center p-4">Loading RPD data...</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full min-w-full rpd-table text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 sticky-status">Status</th>
              <th className="p-2 sticky-uraian">Uraian</th>
              <th className="p-2">Volume</th>
              <th className="p-2">Satuan</th>
              <th className="p-2">Harga Satuan</th>
              <th className="p-2">Jumlah</th>
              {HIERARCHY_DATA.monthNames.map((month) => (
                <th key={month} className="p-2" style={{ minWidth: '120px' }}>{month}</th>
              ))}
              <th className="p-2">Total RPD</th>
              <th className="p-2">Selisih</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rpdData.length === 0 ? (
              <tr>
                <td colSpan={18} className="text-center py-4">
                  Tidak ada data RPD
                </td>
              </tr>
            ) : (
              rpdData.map((item, index) => {
                const status = getStatusIndicator(item);
                const totalRPD = calculateTotalRPD(item);
                const selisih = item.jumlah_menjadi - totalRPD;
                
                return (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                    <td className="p-2 sticky-status">
                      <div className={status.class}>{status.text}</div>
                    </td>
                    <td className="p-2 sticky-uraian rpd-uraian-cell">{item.uraian}</td>
                    <td className="p-2 text-right">{item.volume_menjadi}</td>
                    <td className="p-2">{item.satuan_menjadi}</td>
                    <td className="p-2 text-right">{formatCurrency(item.harga_satuan_menjadi)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.jumlah_menjadi)}</td>
                    
                    {HIERARCHY_DATA.monthNames.map((month, monthIndex) => {
                      const monthKey = month.toLowerCase() as keyof BudgetItemRPD;
                      const isEditing = editingId === item.id;
                      
                      return (
                        <td key={`${item.id}-${month}`} className="p-2 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues[monthKey] || 0}
                              onChange={(e) => handleValueChange(monthKey, e.target.value)}
                              className="h-7 text-xs text-right"
                              min="0"
                              style={{ width: '100px' }}
                            />
                          ) : (
                            formatCurrency(item[monthKey] as number)
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(totalRPD)}
                    </td>
                    <td className={`p-2 text-right font-medium ${
                      selisih > 0 ? 'text-red-600' : 
                      selisih < 0 ? 'text-blue-600' : 
                      'text-green-600'
                    }`}>
                      {formatCurrency(selisih)}
                    </td>
                    <td className="p-2">
                      {editingId === item.id ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleSave}
                          className="h-7 w-7 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(item)}
                          className="h-7 w-7 p-0"
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-slate-100 font-medium">
            <tr>
              <td colSpan={6} className="p-2 text-right">Total</td>
              {HIERARCHY_DATA.monthNames.map((month) => {
                const monthKey = month.toLowerCase();
                return (
                  <td key={`total-${month}`} className="p-2 text-right">
                    {formatCurrency(getTotalByMonth(monthKey))}
                  </td>
                );
              })}
              <td className="p-2 text-right">{formatCurrency(getGrandTotal())}</td>
              <td className="p-2 text-right">{formatCurrency(getTotalBudget() - getGrandTotal())}</td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="mt-4 text-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="status-indicator status-indicator-ok">Sesuai</div>
          <span>Total RPD sama dengan jumlah anggaran</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="status-indicator status-indicator-warning">Kurang</div>
          <span>Total RPD kurang dari jumlah anggaran</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="status-indicator status-indicator-error">Lebih</div>
          <span>Total RPD lebih dari jumlah anggaran</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="status-indicator status-indicator-warning">Belum Diisi</div>
          <span>RPD belum diisi</span>
        </div>
      </div>
    </div>
  );
};

export default RPDTable;
