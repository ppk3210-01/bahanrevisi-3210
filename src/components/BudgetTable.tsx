import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, FileEdit, Check, Search, Eye, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { BudgetItem } from '@/types/budget';
import { UNIT_OPTIONS } from '@/lib/constants';
import { getRowStyle, formatCurrency, calculateAmount, calculateDifference } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import DetailDialog from './DetailDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BudgetTableProps {
  items: BudgetItem[];
  komponenOutput: string;
  onAdd: (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => void;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  isLoading: boolean;
  subKomponen?: string;
  akun?: string;
  areFiltersComplete: boolean;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  komponenOutput,
  onAdd,
  onUpdate,
  onDelete,
  onApprove,
  isLoading,
  subKomponen,
  akun,
  areFiltersComplete
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    uraian: '',
    volumeSemula: 0,
    satuanSemula: 'Paket',
    hargaSatuanSemula: 0,
    volumeMenjadi: 0,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 0,
    komponenOutput,
    subKomponen,
    akun
  });

  useEffect(() => {
    setNewItem(prev => ({
      ...prev,
      komponenOutput,
      subKomponen,
      akun
    }));
  }, [komponenOutput, subKomponen, akun]);

  const newItemJumlahSemula = calculateAmount(newItem.volumeSemula || 0, newItem.hargaSatuanSemula || 0);
  const newItemJumlahMenjadi = calculateAmount(newItem.volumeMenjadi || 0, newItem.hargaSatuanMenjadi || 0);
  const newItemSelisih = calculateDifference(newItemJumlahSemula, newItemJumlahMenjadi);

  const validateItem = (item: Partial<BudgetItem>): boolean => {
    if (!item.uraian || item.uraian.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Uraian harus diisi'
      });
      return false;
    }
    
    if ((item.volumeSemula && item.volumeSemula < 0) || 
        (item.hargaSatuanSemula && item.hargaSatuanSemula < 0) ||
        (item.volumeMenjadi && item.volumeMenjadi < 0) ||
        (item.hargaSatuanMenjadi && item.hargaSatuanMenjadi < 0)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Nilai volume dan harga satuan tidak boleh negatif'
      });
      return false;
    }
    
    if (item.volumeSemula === undefined || item.volumeSemula === null || 
        item.hargaSatuanSemula === undefined || item.hargaSatuanSemula === null ||
        item.volumeMenjadi === undefined || item.volumeMenjadi === null ||
        item.hargaSatuanMenjadi === undefined || item.hargaSatuanMenjadi === null) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Semua kolom harus diisi'
      });
      return false;
    }
    
    if (!item.satuanSemula || !item.satuanMenjadi) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Satuan harus dipilih'
      });
      return false;
    }
    
    return true;
  };

  const getCellClass = (item: BudgetItem, isValueChange: boolean): string => {
    if (!item.isApproved && isValueChange && item.status !== 'unchanged') {
      return 'unapproved-change';
    }
    return '';
  };

  const handleAddItem = async () => {
    if (!validateItem(newItem)) {
      return;
    }

    try {
      await onAdd({
        uraian: newItem.uraian || '',
        volumeSemula: newItem.volumeSemula || 0,
        satuanSemula: newItem.satuanSemula || 'Paket',
        hargaSatuanSemula: newItem.hargaSatuanSemula || 0,
        volumeMenjadi: newItem.volumeMenjadi || 0,
        satuanMenjadi: newItem.satuanMenjadi || 'Paket',
        hargaSatuanMenjadi: newItem.hargaSatuanMenjadi || 0,
        komponenOutput,
        subKomponen: subKomponen || '',
        akun: akun || '',
        isApproved: false
      });

      setNewItem({
        uraian: '',
        volumeSemula: 0,
        satuanSemula: 'Paket',
        hargaSatuanSemula: 0,
        volumeMenjadi: 0,
        satuanMenjadi: 'Paket',
        hargaSatuanMenjadi: 0,
        komponenOutput,
        subKomponen,
        akun
      });

      toast({
        title: "Berhasil",
        description: 'Item berhasil ditambahkan'
      });
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menambahkan item. Silakan coba lagi.'
      });
    }
  };

  const startEditing = (item: BudgetItem) => {
    setEditingId(item.id);
  };

  const saveEditing = (id: string) => {
    setEditingId(null);
    toast({
      title: "Berhasil",
      description: 'Perubahan berhasil disimpan'
    });
  };

  const handleEditChange = (id: string, field: string, value: string | number) => {
    if (field === 'volumeSemula' || field === 'hargaSatuanSemula' || 
        field === 'volumeMenjadi' || field === 'hargaSatuanMenjadi') {
      if (typeof value === 'string') {
        const numValue = Number(value.replace(/,/g, ''));
        if (isNaN(numValue)) return;
        value = numValue;
      }
      
      if (value < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: 'Nilai tidak boleh negatif'
        });
        return;
      }
    }
    
    onUpdate(id, { [field]: value });
  };

  const showDetailDialog = (item: BudgetItem) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const renderItemField = (item: BudgetItem, field: keyof BudgetItem) => {
    const isEditing = editingId === item.id;
    
    const isValueChange = ['volumeMenjadi', 'satuanMenjadi', 'hargaSatuanMenjadi', 'jumlahMenjadi'].includes(field as string);
    const cellClass = getCellClass(item, isValueChange);
    
    switch(field) {
      case 'uraian':
        return isEditing ? (
          <Input 
            value={item.uraian} 
            onChange={(e) => handleEditChange(item.id, 'uraian', e.target.value)}
            className="w-full"
          />
        ) : (
          <span>{item.uraian}</span>
        );
      
      case 'volumeMenjadi':
        return isEditing ? (
          <Input 
            type="number"
            value={item.volumeMenjadi} 
            onChange={(e) => handleEditChange(item.id, 'volumeMenjadi', e.target.value)}
            className="w-full"
            min="0"
          />
        ) : (
          <span className={cellClass}>{item.volumeMenjadi}</span>
        );
      
      case 'satuanMenjadi':
        return isEditing ? (
          <Select 
            value={item.satuanMenjadi} 
            onValueChange={(value) => handleEditChange(item.id, 'satuanMenjadi', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Satuan" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className={cellClass}>{item.satuanMenjadi}</span>
        );
      
      case 'hargaSatuanMenjadi':
        return isEditing ? (
          <Input 
            type="number"
            value={item.hargaSatuanMenjadi} 
            onChange={(e) => handleEditChange(item.id, 'hargaSatuanMenjadi', e.target.value)}
            className="w-full"
            min="0"
          />
        ) : (
          <span className={cellClass}>{formatCurrency(item.hargaSatuanMenjadi)}</span>
        );
      
      case 'jumlahMenjadi':
        return <span className={cellClass}>{formatCurrency(item.jumlahMenjadi)}</span>;
      
      case 'jumlahSemula':
        return <span>{formatCurrency(item.jumlahSemula)}</span>;
      
      case 'hargaSatuanSemula':
        return <span>{formatCurrency(item.hargaSatuanSemula)}</span>;
      
      case 'selisih':
        return <span className={item.selisih > 0 ? 'text-green-600' : item.selisih < 0 ? 'text-red-600' : ''}>
          {formatCurrency(item.selisih)}
        </span>;
      
      default:
        return <span>{String(item[field])}</span>;
    }
  };

  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.uraian?.toLowerCase().includes(searchLower) ||
      item.satuanSemula?.toLowerCase().includes(searchLower) ||
      item.satuanMenjadi?.toLowerCase().includes(searchLower) ||
      item.subKomponen?.toLowerCase().includes(searchLower) ||
      item.akun?.toLowerCase().includes(searchLower) ||
      item.jumlahSemula.toString().includes(searchTerm) ||
      item.jumlahMenjadi.toString().includes(searchTerm) ||
      item.volumeSemula.toString().includes(searchTerm) ||
      item.volumeMenjadi.toString().includes(searchTerm) ||
      item.hargaSatuanSemula.toString().includes(searchTerm) ||
      item.hargaSatuanMenjadi.toString().includes(searchTerm)
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;
    
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined || fieldB === undefined) return 0;
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' 
        ? fieldA - fieldB 
        : fieldB - fieldA;
    }
    
    if (typeof fieldA === 'boolean' && typeof fieldB === 'boolean') {
      return sortDirection === 'asc' 
        ? (fieldA ? 1 : 0) - (fieldB ? 1 : 0) 
        : (fieldB ? 1 : 0) - (fieldA ? 1 : 0);
    }
    
    return 0;
  });

  const paginatedItems = pageSize === -1 
    ? sortedItems 
    : sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedItems.length / pageSize);

  const handleSort = (field: keyof BudgetItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const totalSemula = paginatedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = paginatedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;

  const grandTotalSemula = filteredItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const grandTotalMenjadi = filteredItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading budget data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari anggaran..."
            className="pl-8 w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Tampilkan:</span>
          <Select
            value={pageSize.toString()} 
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="-1">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        Menampilkan {paginatedItems.length} dari {filteredItems.length} item
        {searchTerm && ` (filter: "${searchTerm}")`}
      </div>
      
      <div className="overflow-hidden rounded-md border border-gray-200">
        {komponenOutput && (
          <div className="bg-purple-100 p-4 border-b border-gray-200">
            <h3 className="font-medium">Komponen Output: {komponenOutput}</h3>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>No</th>
                <th className="uraian-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('uraian')}
                  >
                    Uraian
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="number-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('volumeSemula')}
                  >
                    Volume Semula
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="unit-cell">Satuan Semula</th>
                <th className="number-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('hargaSatuanSemula')}
                  >
                    Harga Satuan Semula
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="number-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('jumlahSemula')}
                  >
                    Jumlah Semula
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="number-cell border-l-2">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('volumeMenjadi')}
                  >
                    Volume Menjadi
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="unit-cell">Satuan Menjadi</th>
                <th className="number-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('hargaSatuanMenjadi')}
                  >
                    Harga Satuan Menjadi
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="number-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('jumlahMenjadi')}
                  >
                    Jumlah Menjadi
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="number-cell">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('selisih')}
                  >
                    Selisih
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th>Aksi</th>
                <th>PPK</th>
              </tr>
            </thead>
            
            <tbody>
              {paginatedItems.map((item, index) => (
                <tr key={item.id} className={getRowStyle(item.status)}>
                  <td>{(currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + index + 1}</td>
                  <td className="uraian-cell">{renderItemField(item, 'uraian')}</td>
                  <td className="number-cell">{renderItemField(item, 'volumeSemula')}</td>
                  <td className="unit-cell">{renderItemField(item, 'satuanSemula')}</td>
                  <td className="number-cell">{renderItemField(item, 'hargaSatuanSemula')}</td>
                  <td className="number-cell">{renderItemField(item, 'jumlahSemula')}</td>
                  <td className="number-cell border-l-2">{renderItemField(item, 'volumeMenjadi')}</td>
                  <td className="unit-cell">{renderItemField(item, 'satuanMenjadi')}</td>
                  <td className="number-cell">{renderItemField(item, 'hargaSatuanMenjadi')}</td>
                  <td className="number-cell">{renderItemField(item, 'jumlahMenjadi')}</td>
                  <td className="number-cell">{renderItemField(item, 'selisih')}</td>
                  <td>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => showDetailDialog(item)}
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {editingId === item.id ? (
                        <Button variant="outline" size="icon" onClick={() => saveEditing(item.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" onClick={() => startEditing(item)}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          onDelete(item.id);
                          toast({
                            title: "Berhasil",
                            description: 'Item berhasil dihapus'
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="text-center">
                    {!item.isApproved && item.status !== 'unchanged' && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-green-600" 
                        onClick={() => {
                          onApprove(item.id);
                          toast({
                            title: "Berhasil",
                            description: 'Item disetujui oleh PPK'
                          });
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {item.isApproved && <span className="text-green-600 font-bold">✓</span>}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-50">
                <td>{filteredItems.length + 1}</td>
                <td className="uraian-cell">
                  <Input 
                    placeholder="Tambah Uraian Baru" 
                    value={newItem.uraian || ''} 
                    onChange={(e) => setNewItem({...newItem, uraian: e.target.value})}
                    required
                  />
                </td>
                <td className="number-cell">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.volumeSemula || ''} 
                    onChange={(e) => setNewItem({...newItem, volumeSemula: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </td>
                <td className="unit-cell">
                  <Select 
                    value={newItem.satuanSemula} 
                    onValueChange={(value) => setNewItem({...newItem, satuanSemula: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="number-cell">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.hargaSatuanSemula || ''} 
                    onChange={(e) => setNewItem({...newItem, hargaSatuanSemula: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </td>
                <td className="number-cell">
                  {formatCurrency(newItemJumlahSemula)}
                </td>
                <td className="number-cell border-l-2">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.volumeMenjadi || ''} 
                    onChange={(e) => setNewItem({...newItem, volumeMenjadi: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </td>
                <td className="unit-cell">
                  <Select 
                    value={newItem.satuanMenjadi} 
                    onValueChange={(value) => setNewItem({...newItem, satuanMenjadi: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="number-cell">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.hargaSatuanMenjadi || ''} 
                    onChange={(e) => setNewItem({...newItem, hargaSatuanMenjadi: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </td>
                <td className="number-cell">
                  {formatCurrency(newItemJumlahMenjadi)}
                </td>
                <td className="number-cell">
                  {formatCurrency(newItemSelisih)}
                </td>
                <td colSpan={2}>
                  <Button 
                    variant="outline" 
                    onClick={handleAddItem} 
                    disabled={!areFiltersComplete}
                    title={!areFiltersComplete ? "Pilih semua filter terlebih dahulu" : "Tambah item baru"}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Tambah
                  </Button>
                </td>
              </tr>
              
              <tr className="font-semibold bg-gray-100">
                <td colSpan={5} className="text-right">Total Halaman:</td>
                <td className="number-cell">{formatCurrency(totalSemula)}</td>
                <td colSpan={3} className="border-l-2"></td>
                <td className="number-cell">{formatCurrency(totalMenjadi)}</td>
                <td className="number-cell">{formatCurrency(totalSelisih)}</td>
                <td colSpan={2}></td>
              </tr>
              
              {(pageSize !== -1 || searchTerm) && (
                <tr className="font-bold bg-gray-200">
                  <td colSpan={5} className="text-right">Total Keseluruhan:</td>
                  <td className="number-cell">{formatCurrency(grandTotalSemula)}</td>
                  <td colSpan={3} className="border-l-2"></td>
                  <td className="number-cell">{formatCurrency(grandTotalMenjadi)}</td>
                  <td className="number-cell">{formatCurrency(grandTotalSelisih)}</td>
                  <td colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {pageSize !== -1 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <DetailDialog
        item={detailItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
};

export default BudgetTable;
