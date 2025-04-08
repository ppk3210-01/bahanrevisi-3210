import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetCalculations';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Download, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DetailedSummaryViewProps {
  items?: BudgetItem[];
  type?: string;
}

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

const formatToThousands = (value: number): string => {
  const roundedValue = Math.round(value / 1000) * 1000;
  return formatCurrency(roundedValue);
};

const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({ items, type }) => {
  const [accountGroupData, setAccountGroupData] = useState<SummaryItem[]>([]);
  const [komponenData, setKomponenData] = useState<SummaryItem[]>([]);
  const [akunData, setAkunData] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  if (items && type) {
    return (
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Tidak ada data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pembebanan</TableHead>
                <TableHead className="w-[400px]">Uraian</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Jumlah Semula</TableHead>
                <TableHead className="text-right">Jumlah Menjadi</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.komponenOutput && item.subKomponen && item.akun ? 
                      `${item.komponenOutput}.${item.subKomponen}.A.${item.akun}` : '-'}
                  </TableCell>
                  <TableCell className="break-words">{item.uraian}</TableCell>
                  <TableCell>{type === 'deleted' ? item.volumeSemula : item.volumeMenjadi}</TableCell>
                  <TableCell>{type === 'deleted' ? item.satuanSemula : item.satuanMenjadi}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(type === 'deleted' ? item.hargaSatuanSemula : item.hargaSatuanMenjadi)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  <TableCell className={`text-right ${item.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(item.selisih))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: accountGroupResult, error: accountGroupError } = await supabase
          .rpc('get_budget_summary_by_account_group');
        
        if (accountGroupError) throw accountGroupError;
        
        const { data: komponenResult, error: komponenError } = await supabase
          .rpc('get_budget_summary_by_komponen');
        
        if (komponenError) throw komponenError;
        
        const { data: akunResult, error: akunError } = await supabase
          .rpc('get_budget_summary_by_akun');
        
        if (akunError) throw akunError;
        
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
      const wb = XLSX.utils.book_new();
      
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
      <ChevronsUpDown className={`inline h-4 w-4 ml-1 ${currentSort.field === field ? 'opacity-100' : 'opacity-50'}`} />
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
    let bgColor = "from-blue-50 to-indigo-50";
    let borderColor = "border-t-blue-400";
    
    if (title.includes("Komponen")) {
      bgColor = "from-purple-50 to-pink-50";
      borderColor = "border-t-purple-400";
    } else if (title.includes("Akun")) {
      bgColor = "from-green-50 to-teal-50";
      borderColor = "border-t-green-400";
    }
    
    return (
      <Card className={`shadow-sm mb-3 border-t-4 ${borderColor}`}>
        <CardHeader className="pb-1 pt-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className={`bg-gradient-to-r ${bgColor} sticky top-0`}>
                <TableRow className="text-xs h-7">
                  <TableHead className="w-[25%] cursor-pointer py-1 px-2" onClick={() => handleSort('group', currentSort, setSort)}>
                    {groupField === 'account_group' ? 'Kelompok Akun' : groupField === 'komponen_output' ? 'Komponen Output' : 'Akun'}
                    {renderSortIcon('group', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1 px-2" onClick={() => handleSort('total_semula', currentSort, setSort)}>
                    Pagu Semula {renderSortIcon('total_semula', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1 px-2" onClick={() => handleSort('total_menjadi', currentSort, setSort)}>
                    Pagu Menjadi {renderSortIcon('total_menjadi', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1 px-2" onClick={() => handleSort('total_selisih', currentSort, setSort)}>
                    Selisih {renderSortIcon('total_selisih', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1 px-2" onClick={() => handleSort('new_items', currentSort, setSort)}>
                    Item Bertambah {renderSortIcon('new_items', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1 px-2" onClick={() => handleSort('changed_items', currentSort, setSort)}>
                    Item Berubah {renderSortIcon('changed_items', currentSort)}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer py-1 px-2" onClick={() => handleSort('total_items', currentSort, setSort)}>
                    Jumlah Item {renderSortIcon('total_items', currentSort)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index} className={`text-xs h-6 ${index % 2 === 0 ? `bg-gradient-to-r ${bgColor} bg-opacity-30` : ''}`}>
                    <TableCell className="font-medium py-1 px-2">
                      {item[groupField] || 'Tidak Terdefinisi'}
                    </TableCell>
                    <TableCell className="text-right py-1 px-2">
                      {formatToThousands(item.total_semula || 0)}
                    </TableCell>
                    <TableCell className="text-right py-1 px-2">
                      {formatToThousands(item.total_menjadi || 0)}
                    </TableCell>
                    <TableCell className={`text-right py-1 px-2 ${item.total_selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatToThousands(item.total_selisih || 0)}
                    </TableCell>
                    <TableCell className="text-right py-1 px-2">
                      {item.new_items || 0}
                    </TableCell>
                    <TableCell className="text-right py-1 px-2">
                      {item.changed_items || 0}
                    </TableCell>
                    <TableCell className="text-right py-1 px-2">
                      {item.total_items || 0}
                    </TableCell>
                  </TableRow>
                ))}
                
                <TableRow className={`bg-gradient-to-r from-${bgColor.split('-')[1]}-100 to-${bgColor.split('-')[3]}-100 font-bold text-xs h-7`}>
                  <TableCell className="py-1 px-2">TOTAL</TableCell>
                  <TableCell className="text-right py-1 px-2">{formatToThousands(totals.total_semula)}</TableCell>
                  <TableCell className="text-right py-1 px-2">{formatToThousands(totals.total_menjadi)}</TableCell>
                  <TableCell className={`text-right py-1 px-2 ${totals.total_selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatToThousands(totals.total_selisih)}
                  </TableCell>
                  <TableCell className="text-right py-1 px-2">{totals.new_items}</TableCell>
                  <TableCell className="text-right py-1 px-2">{totals.changed_items}</TableCell>
                  <TableCell className="text-right py-1 px-2">{totals.total_items}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAdditionalBoxes = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <Card className="shadow-sm card-gradient-blue">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Tren Perubahan Anggaran</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Kenaikan Anggaran:</span>
                <span className="font-semibold text-green-600">{
                  formatToThousands(accountGroupData.reduce((sum, item) => 
                    item.total_selisih > 0 ? sum + item.total_selisih : sum, 0)
                  )
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Penurunan Anggaran:</span>
                <span className="font-semibold text-red-600">{
                  formatToThousands(accountGroupData.reduce((sum, item) => 
                    item.total_selisih < 0 ? sum + Math.abs(item.total_selisih) : sum, 0)
                  )
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Perubahan Signifikan:</span>
                <span className="font-semibold text-blue-600">{
                  accountGroupData.filter(item => Math.abs(item.total_selisih) > 1000000).length
                }</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm card-gradient-purple">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Status Anggaran</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Total Akun yang Berubah:</span>
                <span className="font-semibold text-purple-600">{
                  akunData.filter(item => item.total_selisih !== 0).length
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Persentase Perubahan:</span>
                <span className="font-semibold text-blue-600">{
                  accountGroupTotals.total_semula === 0 ? "0%" : 
                  ((Math.abs(accountGroupTotals.total_selisih) / accountGroupTotals.total_semula) * 100).toFixed(2) + "%"
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Item yang Disetujui:</span>
                <span className="font-semibold text-green-600">{
                  akunData.reduce((sum, item) => sum + item.total_items, 0)
                }</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm card-gradient-green">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Analisis Perubahan</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Komponen dengan Perubahan Terbesar:</span>
                <span className="font-semibold text-teal-600">{
                  komponenData.length > 0 ? 
                  (komponenData.sort((a, b) => Math.abs(b.total_selisih) - Math.abs(a.total_selisih))[0].komponen_output || '-').substring(0, 20) + '...' : 
                  '-'
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Akun dengan Penambahan Terbanyak:</span>
                <span className="font-semibold text-green-600">{
                  akunData.length > 0 ?
                  (akunData.sort((a, b) => b.new_items - a.new_items)[0].akun || '-') :
                  '-'
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Akun dengan Perubahan Terbanyak:</span>
                <span className="font-semibold text-blue-600">{
                  akunData.length > 0 ?
                  (akunData.sort((a, b) => b.changed_items - a.changed_items)[0].akun || '-') :
                  '-'
                }</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm card-gradient-orange">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Dampak Perubahan Anggaran</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Efisiensi Anggaran:</span>
                <span className={`font-semibold ${accountGroupTotals.total_selisih < 0 ? 'text-green-600' : 'text-orange-600'}`}>{
                  accountGroupTotals.total_selisih < 0 ? 
                  formatToThousands(Math.abs(accountGroupTotals.total_selisih)) : 
                  formatToThousands(0)
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Penambahan Anggaran:</span>
                <span className={`font-semibold ${accountGroupTotals.total_selisih > 0 ? 'text-green-600' : 'text-orange-600'}`}>{
                  accountGroupTotals.total_selisih > 0 ? 
                  formatToThousands(accountGroupTotals.total_selisih) : 
                  formatToThousands(0)
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status Keseimbangan:</span>
                <span className={`font-semibold ${accountGroupTotals.total_selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>{
                  accountGroupTotals.total_selisih === 0 ? 'Seimbang' : 'Tidak Seimbang'
                }</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold text-gradient-blue">Ringkasan Detail Anggaran</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToExcel}
          className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
        >
          <Download className="h-4 w-4" />
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
      
      {renderAdditionalBoxes()}
    </div>
  );
};

export default DetailedSummaryView;
