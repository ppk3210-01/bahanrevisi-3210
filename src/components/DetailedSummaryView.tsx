
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetCalculations';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableFooter 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

// Type definitions for our summary data
type SummaryItem = {
  account_group?: string;
  akun?: string;
  komponen_output?: string;
  total_semula: number;
  total_menjadi: number;
  total_selisih: number;
  new_items: number;
  changed_items: number;
  total_items: number;
};

type SortField = 'group' | 'total_semula' | 'total_menjadi' | 'total_selisih' | 'new_items' | 'changed_items' | 'total_items';
type SortDirection = 'asc' | 'desc';

// Helper function to format numbers in thousands
const formatInThousands = (value: number): string => {
  return (Math.round(value / 1000)).toLocaleString() + 'K';
};

const DetailedSummaryView: React.FC = () => {
  const [accountGroupData, setAccountGroupData] = useState<SummaryItem[]>([]);
  const [komponenData, setKomponenData] = useState<SummaryItem[]>([]);
  const [akunData, setAkunData] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [accountGroupSort, setAccountGroupSort] = useState<{field: SortField, direction: SortDirection}>({
    field: 'group',
    direction: 'asc'
  });
  
  const [komponenSort, setKomponenSort] = useState<{field: SortField, direction: SortDirection}>({
    field: 'group',
    direction: 'asc'
  });
  
  const [akunSort, setAkunSort] = useState<{field: SortField, direction: SortDirection}>({
    field: 'group',
    direction: 'asc'
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch account group data using rpc
        const { data: accountGroupResult, error: accountGroupError } = await supabase
          .rpc('get_budget_summary_by_account_group');
        
        if (accountGroupError) throw accountGroupError;
        
        // Fetch komponen data using rpc
        const { data: komponenResult, error: komponenError } = await supabase
          .rpc('get_budget_summary_by_komponen');
        
        if (komponenError) throw komponenError;
        
        // Fetch akun data using rpc
        const { data: akunResult, error: akunError } = await supabase
          .rpc('get_budget_summary_by_akun');
        
        if (akunError) throw akunError;
        
        // Transform to our data format
        setAccountGroupData(accountGroupResult || []);
        setKomponenData(komponenResult || []);
        setAkunData(akunResult || []);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: 'Gagal mengambil data ringkasan. Silakan coba lagi.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort functions
  const sortData = <T extends SummaryItem>(
    data: T[], 
    field: SortField, 
    direction: SortDirection
  ): T[] => {
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      if (field === 'group') {
        valueA = a.account_group || a.akun || a.komponen_output || '';
        valueB = b.account_group || b.akun || b.komponen_output || '';
      } else {
        valueA = a[field];
        valueB = b[field];
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
  };

  const handleSort = (
    field: SortField, 
    currentSort: {field: SortField, direction: SortDirection},
    setSort: React.Dispatch<React.SetStateAction<{field: SortField, direction: SortDirection}>>
  ) => {
    if (currentSort.field === field) {
      setSort({
        field,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSort({
        field,
        direction: 'asc'
      });
    }
  };

  const exportToExcel = () => {
    try {
      // Create a workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Add account group data
      const accountGroupSheet = XLSX.utils.json_to_sheet(accountGroupData.map(item => ({
        'Kelompok Akun': item.account_group,
        'Pagu Semula': item.total_semula,
        'Pagu Menjadi': item.total_menjadi,
        'Selisih': item.total_selisih,
        'Item Bertambah': item.new_items,
        'Item Berubah': item.changed_items,
        'Jumlah Item': item.total_items
      })));
      XLSX.utils.book_append_sheet(wb, accountGroupSheet, 'Kelompok Akun');
      
      // Add komponen data
      const komponenSheet = XLSX.utils.json_to_sheet(komponenData.map(item => ({
        'Komponen Output': item.komponen_output,
        'Pagu Semula': item.total_semula,
        'Pagu Menjadi': item.total_menjadi,
        'Selisih': item.total_selisih,
        'Item Bertambah': item.new_items,
        'Item Berubah': item.changed_items,
        'Jumlah Item': item.total_items
      })));
      XLSX.utils.book_append_sheet(wb, komponenSheet, 'Komponen Output');
      
      // Add akun data
      const akunSheet = XLSX.utils.json_to_sheet(akunData.map(item => ({
        'Akun': item.akun,
        'Pagu Semula': item.total_semula,
        'Pagu Menjadi': item.total_menjadi,
        'Selisih': item.total_selisih,
        'Item Bertambah': item.new_items,
        'Item Berubah': item.changed_items,
        'Jumlah Item': item.total_items
      })));
      XLSX.utils.book_append_sheet(wb, akunSheet, 'Per Akun');
      
      // Save the file
      XLSX.writeFile(wb, 'Rekap_Anggaran.xlsx');
      
      toast({
        title: "Berhasil",
        description: 'Rekap anggaran berhasil diunduh'
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal mengunduh rekap anggaran. Silakan coba lagi.'
      });
    }
  };

  const sortedAccountGroupData = sortData(accountGroupData, accountGroupSort.field, accountGroupSort.direction);
  const sortedKomponenData = sortData(komponenData, komponenSort.field, komponenSort.direction);
  const sortedAkunData = sortData(akunData, akunSort.field, akunSort.direction);

  // Calculate totals
  const accountGroupTotals = {
    total_semula: accountGroupData.reduce((sum, item) => sum + (item.total_semula || 0), 0),
    total_menjadi: accountGroupData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0),
    total_selisih: accountGroupData.reduce((sum, item) => sum + (item.total_selisih || 0), 0),
    new_items: accountGroupData.reduce((sum, item) => sum + (item.new_items || 0), 0),
    changed_items: accountGroupData.reduce((sum, item) => sum + (item.changed_items || 0), 0),
    total_items: accountGroupData.reduce((sum, item) => sum + (item.total_items || 0), 0)
  };

  const komponenTotals = {
    total_semula: komponenData.reduce((sum, item) => sum + (item.total_semula || 0), 0),
    total_menjadi: komponenData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0),
    total_selisih: komponenData.reduce((sum, item) => sum + (item.total_selisih || 0), 0),
    new_items: komponenData.reduce((sum, item) => sum + (item.new_items || 0), 0),
    changed_items: komponenData.reduce((sum, item) => sum + (item.changed_items || 0), 0),
    total_items: komponenData.reduce((sum, item) => sum + (item.total_items || 0), 0)
  };

  const akunTotals = {
    total_semula: akunData.reduce((sum, item) => sum + (item.total_semula || 0), 0),
    total_menjadi: akunData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0),
    total_selisih: akunData.reduce((sum, item) => sum + (item.total_selisih || 0), 0),
    new_items: akunData.reduce((sum, item) => sum + (item.new_items || 0), 0),
    changed_items: akunData.reduce((sum, item) => sum + (item.changed_items || 0), 0),
    total_items: akunData.reduce((sum, item) => sum + (item.total_items || 0), 0)
  };

  if (loading) {
    return <div className="text-center py-4">Memuat data rekap anggaran...</div>;
  }

  const renderSortIcon = (field: SortField, currentSort: {field: SortField, direction: SortDirection}) => {
    return (
      <ChevronsUpDown className={`inline h-3 w-3 ml-1 ${currentSort.field === field ? 'opacity-100' : 'opacity-50'}`} />
    );
  };

  const renderTable = (
    title: string,
    data: SummaryItem[],
    groupField: 'account_group' | 'komponen_output' | 'akun',
    currentSort: {field: SortField, direction: SortDirection},
    setSort: React.Dispatch<React.SetStateAction<{field: SortField, direction: SortDirection}>>,
    totals: {
      total_semula: number;
      total_menjadi: number;
      total_selisih: number;
      new_items: number;
      changed_items: number;
      total_items: number;
    }
  ) => {
    return (
      <Card className="shadow-sm mb-3 border-blue-100">
        <CardHeader className="pb-1 pt-2">
          <CardTitle className="text-sm text-blue-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-blue-50 sticky top-0">
                <TableRow className="h-8">
                  <TableHead className="w-[25%] cursor-pointer py-1.5" onClick={() => handleSort('group', currentSort, setSort)}>
                    {groupField === 'account_group' ? 'Kelompok Akun' : groupField === 'komponen_output' ? 'Komponen Output' : 'Akun'}
                    {renderSortIcon('group', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1.5" onClick={() => handleSort('total_semula', currentSort, setSort)}>
                    Pagu Semula {renderSortIcon('total_semula', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1.5" onClick={() => handleSort('total_menjadi', currentSort, setSort)}>
                    Pagu Menjadi {renderSortIcon('total_menjadi', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1.5" onClick={() => handleSort('total_selisih', currentSort, setSort)}>
                    Selisih {renderSortIcon('total_selisih', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1.5" onClick={() => handleSort('new_items', currentSort, setSort)}>
                    Item Baru {renderSortIcon('new_items', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1.5" onClick={() => handleSort('changed_items', currentSort, setSort)}>
                    Item Ubah {renderSortIcon('changed_items', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1.5" onClick={() => handleSort('total_items', currentSort, setSort)}>
                    Total {renderSortIcon('total_items', currentSort)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-blue-50/30' : ''}>
                    <TableCell className="py-1 font-medium text-xs">
                      {item[groupField] || 'Tidak Terdefinisi'}
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs">
                      {formatInThousands(item.total_semula || 0)}
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs">
                      {formatInThousands(item.total_menjadi || 0)}
                    </TableCell>
                    <TableCell className={`py-1 text-right text-xs ${item.total_selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatInThousands(item.total_selisih || 0)}
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs">
                      {item.new_items || 0}
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs">
                      {item.changed_items || 0}
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs">
                      {item.total_items || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-blue-100">
                <TableRow>
                  <TableCell className="font-bold text-xs">TOTAL</TableCell>
                  <TableCell className="text-right font-bold text-xs">{formatInThousands(totals.total_semula)}</TableCell>
                  <TableCell className="text-right font-bold text-xs">{formatInThousands(totals.total_menjadi)}</TableCell>
                  <TableCell className={`text-right font-bold text-xs ${totals.total_selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatInThousands(totals.total_selisih)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs">{totals.new_items}</TableCell>
                  <TableCell className="text-right font-bold text-xs">{totals.changed_items}</TableCell>
                  <TableCell className="text-right font-bold text-xs">{totals.total_items}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold text-blue-800">Ringkasan Detail Anggaran</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToExcel}
          className="flex items-center gap-1 text-xs h-7 bg-blue-50 hover:bg-blue-100 border-blue-200"
        >
          <Download className="h-3 w-3" />
          Lihat Detail Rekap
        </Button>
      </div>
      
      {renderTable(
        'Rekap Per Kelompok Akun', 
        sortedAccountGroupData, 
        'account_group', 
        accountGroupSort, 
        setAccountGroupSort,
        accountGroupTotals
      )}
      
      {renderTable(
        'Rekap Per Komponen Output', 
        sortedKomponenData, 
        'komponen_output', 
        komponenSort, 
        setKomponenSort,
        komponenTotals
      )}
      
      {renderTable(
        'Rekap Per Akun', 
        sortedAkunData, 
        'akun', 
        akunSort, 
        setAkunSort,
        akunTotals
      )}
    </div>
  );
};

export default DetailedSummaryView;
