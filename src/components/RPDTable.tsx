
import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRPDData, RPDItem } from '@/hooks/useRPDData';
import { Select } from '@/components/ui/select';

const RPDTable: React.FC = () => {
  const { rpdItems, loading, updateRPDItem } = useRPDData();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, Record<string, number>>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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
        return <Check className="h-5 w-5 text-green-500" />;
      case 'belum_isi':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'belum_lengkap':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'sisa':
        return <Info className="h-5 w-5 text-blue-500" />;
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
      case 'belum_lengkap':
        return 'bg-orange-100 text-orange-800';
      case 'sisa':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID');
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(rpdItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, rpdItems.length);
  const paginatedItems = rpdItems.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-full border rounded-md">
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="w-20 text-center">Status</TableHead>
              <TableHead className="w-1/4 text-left">Uraian</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-center">Satuan</TableHead>
              <TableHead className="text-right">Harga Satuan</TableHead>
              <TableHead className="text-right">Jumlah Pagu</TableHead>
              <TableHead className="text-right bg-blue-50">Jumlah RPD</TableHead>
              <TableHead className="text-right">Januari</TableHead>
              <TableHead className="text-right">Februari</TableHead>
              <TableHead className="text-right">Maret</TableHead>
              <TableHead className="text-right">April</TableHead>
              <TableHead className="text-right">Mei</TableHead>
              <TableHead className="text-right">Juni</TableHead>
              <TableHead className="text-right">Juli</TableHead>
              <TableHead className="text-right">Agustus</TableHead>
              <TableHead className="text-right">September</TableHead>
              <TableHead className="text-right">Oktober</TableHead>
              <TableHead className="text-right">November</TableHead>
              <TableHead className="text-right">Desember</TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 20 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={20} className="text-center py-4 text-slate-600">
                  Tidak ada data Rencana Penarikan Dana
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map(item => (
                <TableRow key={item.id} className={item.jumlah_rpd === 0 ? 'bg-green-50' : ''}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <div className={`px-2 py-1 rounded-full flex items-center ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 text-xs font-medium">{getStatusText(item.status)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-left">{item.uraian}</TableCell>
                  <TableCell className="text-right">{item.volume_menjadi}</TableCell>
                  <TableCell className="text-center">{item.satuan_menjadi}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.harga_satuan_menjadi)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.jumlah_menjadi)}</TableCell>
                  <TableCell className={`text-right font-medium ${item.jumlah_rpd === item.jumlah_menjadi ? 'bg-green-100' : 'bg-blue-50'}`}>
                    {formatCurrency(item.jumlah_rpd)}
                  </TableCell>
                  
                  {editingItem === item.id ? (
                    <>
                      {['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'].map(month => (
                        <TableCell key={`${item.id}-${month}`} className="p-1">
                          <Input 
                            type="number"
                            min="0"
                            value={editValues[item.id]?.[month] || 0}
                            onChange={(e) => handleInputChange(item.id, month, e.target.value)}
                            className="h-8 text-right text-slate-800"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="default" onClick={() => saveChanges(item.id)}>
                            Simpan
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Batal
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-right">{formatCurrency(item.januari)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.februari)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.maret)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.april)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.mei)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.juni)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.juli)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.agustus)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.september)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.oktober)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.november)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.desember)}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          onClick={() => startEditing(item.id)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {!loading && rpdItems.length > 0 && (
        <div className="pagination-controls">
          <div className="page-size-selector">
            <span className="text-sm text-slate-600">Tampilkan</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="ml-2 border border-slate-300 rounded text-slate-700 px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 text-sm text-slate-600">entri</span>
          </div>
          
          <div className="current-page-info">
            Menampilkan {startIndex + 1} - {endIndex} dari {rpdItems.length} item
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
