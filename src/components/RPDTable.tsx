
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Check, Clock, Info, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useRPDData, RPDItem } from '@/hooks/useRPDData';
import { useAuth } from '@/contexts/AuthContext';
import { FilterSelection } from '@/types/budget';

interface RPDTableProps {
  filters?: FilterSelection;
}

const RPDTable: React.FC<RPDTableProps> = ({ filters }) => {
  const { rpdItems, loading, updateRPDItem, refreshData } = useRPDData(filters);
  const { isAdmin, profile } = useAuth();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, Record<string, number>>>({});
  const [hideZeroBudget, setHideZeroBudget] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    if (filters) {
      refreshData();
    }
  }, [filters, refreshData]);

  const startEditing = (itemId: string) => {
    const item = rpdItems.find(item => item.id === itemId);
    if (!item) return;

    setEditingItem(itemId);
    setEditValues({
      [itemId]: {
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
      }
    });
  };

  const handleInputChange = (itemId: string, month: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    setEditValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [month]: numericValue
      }
    }));
  };

  const saveChanges = async (itemId: string) => {
    const values = editValues[itemId];
    const success = await updateRPDItem(itemId, values);
    
    if (success) {
      setEditingItem(null);
    }
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'belum_isi':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'sisa':
        return <Info className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return 'Ok';
      case 'belum_isi':
        return 'Belum Isi';
      case 'belum_lengkap':
        return 'Belum Lengkap';
      case 'sisa':
        return 'Sisa';
      default:
        return 'Lainnya';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'belum_isi':
        return 'bg-red-100 text-red-800';
      case 'sisa':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRowBackground = (item: RPDItem) => {
    if (item.status === 'belum_isi') return 'bg-red-50';
    if (item.status === 'sisa') return 'bg-orange-50';
    return '';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID');
  };
  
  const filteredItems = rpdItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.uraian.toLowerCase().includes(searchLower) ||
      item.satuan_menjadi?.toLowerCase().includes(searchLower) ||
      item.jumlah_menjadi.toString().includes(searchTerm) ||
      item.volume_menjadi.toString().includes(searchTerm) ||
      item.harga_satuan_menjadi.toString().includes(searchTerm) ||
      item.januari.toString().includes(searchTerm) ||
      item.februari.toString().includes(searchTerm) ||
      item.maret.toString().includes(searchTerm) ||
      item.april.toString().includes(searchTerm) ||
      item.mei.toString().includes(searchTerm) ||
      item.juni.toString().includes(searchTerm) ||
      item.juli.toString().includes(searchTerm) ||
      item.agustus.toString().includes(searchTerm) ||
      item.september.toString().includes(searchTerm) ||
      item.oktober.toString().includes(searchTerm) ||
      item.november.toString().includes(searchTerm) ||
      item.desember.toString().includes(searchTerm);
    
    if (hideZeroBudget) {
      return matchesSearch && item.jumlah_menjadi > 0;
    }
    
    return matchesSearch;
  });
  
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  const totals = {
    jumlah_menjadi: filteredItems.reduce((sum, item) => sum + item.jumlah_menjadi, 0),
    jumlah_rpd: filteredItems.reduce((sum, item) => sum + item.jumlah_rpd, 0),
    januari: filteredItems.reduce((sum, item) => sum + item.januari, 0),
    februari: filteredItems.reduce((sum, item) => sum + item.februari, 0),
    maret: filteredItems.reduce((sum, item) => sum + item.maret, 0),
    april: filteredItems.reduce((sum, item) => sum + item.april, 0),
    mei: filteredItems.reduce((sum, item) => sum + item.mei, 0),
    juni: filteredItems.reduce((sum, item) => sum + item.juni, 0),
    juli: filteredItems.reduce((sum, item) => sum + item.juli, 0),
    agustus: filteredItems.reduce((sum, item) => sum + item.agustus, 0),
    september: filteredItems.reduce((sum, item) => sum + item.september, 0),
    oktober: filteredItems.reduce((sum, item) => sum + item.oktober, 0),
    november: filteredItems.reduce((sum, item) => sum + item.november, 0),
    desember: filteredItems.reduce((sum, item) => sum + item.desember, 0)
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };
  
  const canEditMonths = isAdmin || (profile?.role === 'user');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari rencana penarikan dana..."
              className="pl-8 w-full sm:w-80 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="filter-checkbox-container">
            <Checkbox 
              id="hideZeroBudgetRPD"
              checked={hideZeroBudget}
              onCheckedChange={(checked) => {
                setHideZeroBudget(checked === true);
                setCurrentPage(1);
              }}
              className="filter-checkbox"
            />
            <label htmlFor="hideZeroBudgetRPD" className="filter-checkbox-label text-slate-700">
              Sembunyikan jumlah pagu 0
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700">Tampilkan:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border border-slate-300 rounded text-slate-700 px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      
      <div className="text-xs text-slate-700">
        Menampilkan {paginatedItems.length} dari {filteredItems.length} item
        {searchTerm && ` (filter: "${searchTerm}")`}
        {hideZeroBudget && ` (menyembunyikan jumlah pagu 0)`}
      </div>
      
      <div className="overflow-x-auto pb-4 border border-slate-200 rounded-md">
        <div className="min-width-[1400px]">
          <Table className="rpd-table w-full">
            <TableHeader className="bg-white">
              <TableRow className="h-10">
                <TableHead className="sticky-status w-[80px] text-center bg-white text-slate-700 font-medium border-r border-slate-200">Status</TableHead>
                <TableHead className="sticky-uraian w-[350px] text-left bg-white text-slate-700 font-medium border-r border-slate-200">Uraian</TableHead>
                <TableHead className="text-right w-[70px] text-slate-700 font-medium">Volume</TableHead>
                <TableHead className="text-center w-[70px] text-slate-700 font-medium">Satuan</TableHead>
                <TableHead className="text-right w-[100px] text-slate-700 font-medium">Harga Satuan</TableHead>
                <TableHead className="text-right w-[120px] text-slate-700 font-medium">Jumlah Pagu</TableHead>
                <TableHead className="text-right bg-slate-50 w-[120px] text-slate-700 font-medium">Jumlah RPD</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Januari</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Februari</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Maret</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">April</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Mei</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Juni</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Juli</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Agustus</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">September</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Oktober</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">November</TableHead>
                <TableHead className="text-right w-[80px] text-slate-700 font-medium">Desember</TableHead>
                <TableHead className="w-20 text-center text-slate-700 font-medium">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody className="bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="h-8">
                    {Array.from({ length: 20 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex} className="p-1">
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={20} className="text-center py-4 text-slate-600">
                    {hideZeroBudget ? 'Tidak ada data dengan jumlah pagu > 0' : 'Tidak ada data Rencana Penarikan Dana'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {paginatedItems.map(item => (
                    <TableRow key={item.id} className={`h-8 ${getRowBackground(item)}`}>
                      <TableCell className="sticky-status text-center p-1 bg-inherit border-r border-slate-200">
                        <div className="flex items-center justify-center">
                          <div className={`px-1.5 py-0.5 rounded-full flex items-center ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 text-xs font-normal">{getStatusText(item.status)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="sticky-uraian p-1 bg-inherit rpd-uraian-cell text-left border-r border-slate-200">{item.uraian}</TableCell>
                      <TableCell className="text-right p-1 font-normal">{formatCurrency(item.volume_menjadi)}</TableCell>
                      <TableCell className="text-center p-1 font-normal">{item.satuan_menjadi}</TableCell>
                      <TableCell className="text-right p-1 font-normal">{formatCurrency(item.harga_satuan_menjadi)}</TableCell>
                      <TableCell className="text-right p-1 font-normal">{formatCurrency(item.jumlah_menjadi)}</TableCell>
                      <TableCell className="text-right p-1 font-normal bg-slate-50">{formatCurrency(item.jumlah_rpd)}</TableCell>
                      
                      {editingItem === item.id ? (
                        <>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.januari || 0} onChange={(e) => handleInputChange(item.id, 'januari', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.februari || 0} onChange={(e) => handleInputChange(item.id, 'februari', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.maret || 0} onChange={(e) => handleInputChange(item.id, 'maret', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.april || 0} onChange={(e) => handleInputChange(item.id, 'april', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.mei || 0} onChange={(e) => handleInputChange(item.id, 'mei', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.juni || 0} onChange={(e) => handleInputChange(item.id, 'juni', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.juli || 0} onChange={(e) => handleInputChange(item.id, 'juli', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.agustus || 0} onChange={(e) => handleInputChange(item.id, 'agustus', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.september || 0} onChange={(e) => handleInputChange(item.id, 'september', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.oktober || 0} onChange={(e) => handleInputChange(item.id, 'oktober', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.november || 0} onChange={(e) => handleInputChange(item.id, 'november', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1"><Input type="number" min="0" value={editValues[item.id]?.desember || 0} onChange={(e) => handleInputChange(item.id, 'desember', e.target.value)} className="h-7 text-right text-xs" /></TableCell>
                          <TableCell className="p-1">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="default" onClick={() => saveChanges(item.id)} className="text-xs py-0 h-6">
                                Simpan
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEditing} className="text-xs py-0 h-6">
                                Batal
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.januari)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.februari)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.maret)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.april)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.mei)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.juni)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.juli)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.agustus)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.september)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.oktober)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.november)}</TableCell>
                          <TableCell className="text-right p-1 font-normal">{formatCurrency(item.desember)}</TableCell>
                          <TableCell className="p-1 text-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 text-xs h-6"
                              onClick={() => startEditing(item.id)}
                              disabled={!canEditMonths}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  
                  <TableRow className="bg-slate-100 font-medium">
                    <TableCell className="sticky-status bg-slate-100 p-1 border-r border-slate-200" colSpan={1}>
                      <span className="font-medium text-slate-700">TOTAL</span>
                    </TableCell>
                    <TableCell className="sticky-uraian bg-slate-100 p-1 border-r border-slate-200"></TableCell>
                    <TableCell className="p-1" colSpan={3}></TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.jumlah_menjadi)}</TableCell>
                    <TableCell className="text-right p-1 bg-slate-50">{formatCurrency(totals.jumlah_rpd)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.januari)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.februari)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.maret)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.april)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.mei)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.juni)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.juli)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.agustus)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.september)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.oktober)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.november)}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(totals.desember)}</TableCell>
                    <TableCell className="p-1"></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {!loading && filteredItems.length > 0 && (
        <div className="pagination-controls">
          <div className="page-size-selector">
            <span className="text-sm text-slate-700">Menampilkan {startIndex + 1} - {endIndex} dari {filteredItems.length} item</span>
          </div>
          
          <div className="page-navigation">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-3 py-1 text-sm text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPDTable;
