import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, FileEdit, Check, Search, Eye, ArrowUpDown, X, ChevronsRight, ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';
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
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface BudgetTableProps {
  items: BudgetItem[];
  komponenOutput: string;
  onAdd: (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => void;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
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
  onReject,
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
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<keyof BudgetItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [detailItem, setDetailItem] = useState<BudgetItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

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
        description: 'Uraian detil harus diisi'
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

  const getRowColor = (index: number) => {
    const colors = [
      'bg-blue-50', 'bg-purple-50', 'bg-indigo-50', 'bg-teal-50', 'bg-sky-50'
    ];
    return colors[index % colors.length];
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

  const pageTotalSemula = paginatedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const pageTotalMenjadi = paginatedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const pageTotalSelisih = pageTotalMenjadi - pageTotalSemula;

  const grandTotalSemula = filteredItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const grandTotalMenjadi = filteredItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const grandTotalSelisih = grandTotalMenjadi - grandTotalSemula;

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

  const needsApproval = (item: BudgetItem): boolean => {
    return (item.status === 'new' || item.status === 'changed') && !item.isApproved;
  };

  const renderPagination = () => {
    if (pageSize === -1 || totalPages <= 1) return null;
    
    // Calculate which page links to show
    const showMaxPages = 7; // Maximum number of page links to show
    let startPage = Math.max(1, currentPage - Math.floor(showMaxPages / 2));
    let endPage = Math.min(totalPages, startPage + showMaxPages - 1);
    
    // Adjust if we're near the end of the page list
    if (endPage - startPage + 1 < showMaxPages) {
      startPage = Math.max(1, endPage - showMaxPages + 1);
    }
    
    const pages = [];
    
    // Add "First" page if not on page 1
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
            className="flex items-center"
          >
            <ChevronsLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">First</span>
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add "Previous" button
    pages.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(currentPage - 1);
          }} 
          aria-disabled={currentPage === 1}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add "Next" button
    pages.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(currentPage + 1);
          }} 
          aria-disabled={currentPage === totalPages}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // Add "Last" page if not on last page
    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
            className="flex items-center"
          >
            <span className="hidden sm:inline">Last</span>
            <ChevronsRight className="h-4 w-4 ml-1" />
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination>
        <PaginationContent>
          {pages}
        </PaginationContent>
      </Pagination>
    );
  };

  const getRowStyle = (status: string): string => {
    switch (status) {
      case 'changed':
        return 'row-changed';
      case 'new':
        return 'row-new';
      case 'deleted':
        return 'row-deleted';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading budget data...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari anggaran..."
            className="pl-8 w-full sm:w-80 h-8 text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Tampilkan:</span>
          <Select
            value={pageSize.toString()} 
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20 h-8 text-sm">
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
      
      <div className="text-xs text-gray-500">
        Menampilkan {paginatedItems.length} dari {filteredItems.length} item
        {searchTerm && ` (filter: "${searchTerm}")`}
      </div>
      
      <div className="rounded-md border border-gray-200 w-full">
        {komponenOutput && (
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-2 border-b border-gray-200">
            <h3 className="font-medium text-sm">Komponen Output: {komponenOutput}</h3>
          </div>
        )}
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-full data-table text-xs">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-100 to-indigo-100 z-10 shadow-sm">
              <tr className="text-xs">
                <th className="py-2 px-1 w-8">No</th>
                <th className="uraian-cell py-2 px-1 w-[20%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('uraian')}
                  >
                    Uraian
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[5%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('volumeSemula')}
                  >
                    Vol.Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="unit-cell py-2 px-1 w-[7%]">Sat.Semula</th>
                <th className="number-cell py-2 px-1 w-[10%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('hargaSatuanSemula')}
                  >
                    Hrg.Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[10%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('jumlahSemula')}
                  >
                    Jml.Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[5%] border-l-2">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('volumeMenjadi')}
                  >
                    Vol.Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="unit-cell py-2 px-1 w-[7%]">Sat.Menjadi</th>
                <th className="number-cell py-2 px-1 w-[10%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('hargaSatuanMenjadi')}
                  >
                    Hrg.Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[10%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('jumlahMenjadi')}
                  >
                    Jml.Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[10%]">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('selisih')}
                  >
                    Selisih
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="py-2 px-1 w-[7%]">Aksi SM/PJK</th>
                <th className="py-2 px-1 w-[7%]">PPK</th>
              </tr>
            </thead>
            
            <tbody>
              {paginatedItems.map((item, index) => (
                <tr key={item.id} className={`${getRowStyle(item.status)} ${index % 2 === 0 ? getRowColor(index) : ''}`}>
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
                        variant="ghost" 
                        size="icon" 
                        onClick={() => showDetailDialog(item)}
                        title="Lihat Detail"
                        className="h-6 w-6"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>

                      {editingId === item.id ? (
                        <Button variant="ghost" size="icon" onClick={() => saveEditing(item.id)} className="h-6 w-6">
                          <Check className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => startEditing(item)} className="h-6 w-6">
                          <FileEdit className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          onDelete(item.id);
                          toast({
                            title: "Berhasil",
                            description: 'Item berhasil dihapus'
                          });
                        }}
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="text-center">
                    {needsApproval(item) && (
                      <div className="flex space-x-1 justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 h-6 w-6" 
                          onClick={() => {
                            onApprove(item.id);
                            toast({
                              title: "Berhasil",
                              description: 'Item disetujui oleh PPK'
                            });
                          }}
                          title="Setujui"
                        >
                          <Check className="h-3 w-3 font-bold" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 h-6 w-6" 
                          onClick={() => {
                            onReject(item.id);
                            toast({
                              title: "Info",
                              description: 'Item ditolak oleh PPK'
                            });
                          }}
                          title="Tolak"
                        >
                          <X className="h-3 w-3 font-bold" />
                        </Button>
                      </div>
                    )}
                    {item.isApproved && (
                      <span className="text-green-600 font-medium">OK</span>
                    )}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-50">
                <td className="py-1 px-1">{filteredItems.length + 1}</td>
                <td className="uraian-cell py-1 px-1">
                  <Input 
                    placeholder="Tambah Uraian Baru" 
                    value={newItem.uraian || ''} 
                    onChange={(e) => setNewItem({...newItem, uraian: e.target.value})}
                    required
                    className="h-7 text-xs"
                  />
                </td>
                <td className="number-cell py-1 px-1">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.volumeSemula || ''} 
                    onChange={(e) => setNewItem({...newItem, volumeSemula: Number(e.target.value)})}
                    min="0"
                    required
                    className="h-7 text-xs"
                  />
                </td>
                <td className="unit-cell py-1 px-1">
                  <Select 
                    value={newItem.satuanSemula} 
                    onValueChange={(value) => setNewItem({...newItem, satuanSemula: value})}
                    required
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-xs">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="number-cell py-1 px-1">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.hargaSatuanSemula || ''} 
                    onChange={(e) => setNewItem({...newItem, hargaSatuanSemula: Number(e.target.value)})}
                    min="0"
                    required
                    className="h-7 text-xs"
                  />
                </td>
                <td className="number-cell py-1 px-1">
                  {formatCurrency(newItemJumlahSemula)}
                </td>
                <td className="number-cell py-1 px-1 border-l-2">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.volumeMenjadi || ''} 
                    onChange={(e) => setNewItem({...newItem, volumeMenjadi: Number(e.target.value)})}
                    min="0"
                    required
                    className="h-7 text-xs"
                  />
                </td>
                <td className="unit-cell py-1 px-1">
                  <Select 
                    value={newItem.satuanMenjadi} 
                    onValueChange={(value) => setNewItem({...newItem, satuanMenjadi: value})}
                    required
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-xs">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="number-cell py-1 px-1">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newItem.hargaSatuanMenjadi || ''} 
                    onChange={(e) => setNewItem({...newItem, hargaSatuanMenjadi: Number(e.target.value)})}
                    min="0"
                    required
                    className="h-7 text-xs"
                  />
                </td>
                <td className="number-cell py-1 px-1">
                  {formatCurrency(newItemJumlahMenjadi)}
                </td>
                <td className="number-cell py-1 px-1">
                  {formatCurrency(newItemSelisih)}
                </td>
                <td colSpan={2} className="py-1 px-1">
                  <Button 
                    variant="outline" 
                    onClick={handleAddItem} 
                    disabled={!areFiltersComplete}
                    title={!areFiltersComplete ? "Pilih semua filter terlebih dahulu" : "Tambah item baru"}
                    className="h-7 text-xs w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" /> Tambah
                  </Button>
                </td>
              </tr>
              
              <tr className="font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-xs">
                <td colSpan={5} className="text-right py-1 px-1">Total Halaman:</td>
                <td className="number-cell py-1 px-1">{formatCurrency(pageTotalSemula)}</td>
                <td colSpan={3} className="border-l-2"></td>
                <td className="number-cell py-1 px-1">{formatCurrency(pageTotalMenjadi)}</td>
                <td className="number-cell py-1 px-1">{formatCurrency(pageTotalSelisih)}</td>
                <td colSpan={2}></td>
              </tr>
              
              {(pageSize !== -1 || searchTerm) && (
                <tr className="font-bold bg-gradient-to-r from-blue-200 to-indigo-200 text-xs">
                  <td colSpan={5} className="text-right py-1 px-1">Total Keseluruhan:</td>
                  <td className="number-cell py-1 px-1">{formatCurrency(grandTotalSemula)}</td>
                  <td colSpan={3} className="border-l-2"></td>
                  <td className="number-cell py-1 px-1">{formatCurrency(grandTotalMenjadi)}</td>
                  <td className="number-cell py-1 px-1">{formatCurrency(grandTotalSelisih)}</td>
                  <td colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {renderPagination()}
      
      <DetailDialog
        item={detailItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
};

export default BudgetTable;
