import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, FileEdit, Check, Search, Eye, ArrowUpDown, X, ChevronsRight, ChevronLeft, ChevronRight, ChevronsLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BudgetItem } from '@/types/budget';
import { UNIT_OPTIONS } from '@/lib/constants';
import { getRowStyle, formatCurrency, calculateAmount, calculateDifference, roundToThousands } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import DetailDialog from './DetailDialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { useAuth } from '@/contexts/AuthContext';

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
  const {
    isAdmin,
    user,
    profile
  } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    uraian: '',
    volumeSemula: 0,
    satuanSemula: 'Paket',
    hargaSatuanSemula: 0,
    volumeMenjadi: 0,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 0,
    sisaAnggaran: 0,
    komponenOutput,
    subKomponen,
    akun,
    programPembebanan: '',
    kegiatan: '',
    rincianOutput: ''
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<keyof BudgetItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hideZeroBudget, setHideZeroBudget] = useState<boolean>(true);
  const [detailItem, setDetailItem] = useState<BudgetItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const isViewer = !user;
  useEffect(() => {
    setNewItem(prev => ({
      ...prev,
      komponenOutput,
      subKomponen,
      akun
    }));
  }, [komponenOutput, subKomponen, akun]);
  const newItemJumlahSemula = roundToThousands(calculateAmount(newItem.volumeSemula || 0, newItem.hargaSatuanSemula || 0));
  const newItemJumlahMenjadi = roundToThousands(calculateAmount(newItem.volumeMenjadi || 0, newItem.hargaSatuanMenjadi || 0));
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
    if (item.volumeSemula && item.volumeSemula < 0 || item.hargaSatuanSemula && item.hargaSatuanSemula < 0 || item.volumeMenjadi && item.volumeMenjadi < 0 || item.hargaSatuanMenjadi && item.hargaSatuanMenjadi < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Nilai volume dan harga satuan tidak boleh negatif'
      });
      return false;
    }
    if (item.volumeSemula === undefined || item.volumeSemula === null || item.hargaSatuanSemula === undefined || item.hargaSatuanSemula === null || item.volumeMenjadi === undefined || item.volumeMenjadi === null || item.hargaSatuanMenjadi === undefined || item.hargaSatuanMenjadi === null) {
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
  const handleAddItem = async () => {
    if (!validateItem(newItem)) {
      return;
    }
    try {
      const itemToAdd = {
        uraian: newItem.uraian || '',
        volumeSemula: isAdmin ? newItem.volumeSemula || 0 : 0,
        satuanSemula: isAdmin ? newItem.satuanSemula || 'Paket' : 'Paket',
        hargaSatuanSemula: isAdmin ? newItem.hargaSatuanSemula || 0 : 0,
        volumeMenjadi: newItem.volumeMenjadi || 0,
        satuanMenjadi: newItem.satuanMenjadi || 'Paket',
        hargaSatuanMenjadi: newItem.hargaSatuanMenjadi || 0,
        sisaAnggaran: newItem.sisaAnggaran || 0,
        blokir: 0,
        komponenOutput,
        subKomponen: subKomponen || '',
        akun: akun || '',
        programPembebanan: '',
        kegiatan: '',
        rincianOutput: '',
        isApproved: false
      };
      await onAdd(itemToAdd);
      setNewItem({
        uraian: '',
        volumeSemula: 0,
        satuanSemula: 'Paket',
        hargaSatuanSemula: 0,
        volumeMenjadi: 0,
        satuanMenjadi: 'Paket',
        hargaSatuanMenjadi: 0,
        sisaAnggaran: 0,
        komponenOutput,
        subKomponen,
        akun,
        programPembebanan: '',
        kegiatan: '',
        rincianOutput: ''
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
    if (isViewer) return;
    if (!isAdmin) {
      if (!areFiltersComplete) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: 'Anda harus memilih semua filter untuk mengedit item.'
        });
        return;
      }
    }
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
    if (!isAdmin) {
      const allowedFields = ['volumeMenjadi', 'satuanMenjadi', 'hargaSatuanMenjadi', 'sisaAnggaran'];
      if (!allowedFields.includes(field)) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: 'Anda tidak memiliki izin untuk mengedit kolom ini.'
        });
        return;
      }
    }
    if (field === 'volumeSemula' || field === 'hargaSatuanSemula' || field === 'volumeMenjadi' || field === 'sisaAnggaran') {
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

      // Don't round harga_satuan_menjadi
      if (field === 'hargaSatuanSemula') {
        value = roundToThousands(value as number);
      }
    }

    // For hargaSatuanMenjadi specifically, don't round
    if (field === 'hargaSatuanMenjadi') {
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

      // Don't round this value
    }
    onUpdate(id, {
      [field]: value
    });
  };
  const showDetailDialog = (item: BudgetItem) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };
  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  const handleDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Berhasil",
        description: 'Item berhasil dihapus'
      });
    }
  };
  const canDeleteItem = (item: BudgetItem): boolean => {
    if (isAdmin) return true;
    if (isViewer) return false;
    return item.status === 'new' && !item.isApproved;
  };
  const renderItemField = (item: BudgetItem, field: keyof BudgetItem) => {
    const isEditing = editingId === item.id;
    const isMenjadiField = ['volumeMenjadi', 'satuanMenjadi', 'hargaSatuanMenjadi', 'jumlahMenjadi'].includes(field);
    const isDifferentValue = field === 'volumeMenjadi' && item.volumeMenjadi !== item.volumeSemula || field === 'satuanMenjadi' && item.satuanMenjadi !== item.satuanSemula || field === 'hargaSatuanMenjadi' && item.hargaSatuanMenjadi !== item.hargaSatuanSemula || field === 'jumlahMenjadi' && item.jumlahMenjadi !== item.jumlahSemula;
    const menjadiClassName = isMenjadiField && isDifferentValue ? 'text-blue-600 font-bold' : '';
    if (isViewer && isEditing) {
      return;
    }
    if (isEditing && !isAdmin && !areFiltersComplete && ['volumeMenjadi', 'satuanMenjadi', 'hargaSatuanMenjadi', 'sisaAnggaran'].includes(field as string)) {
      return;
    }
    switch (field) {
      case 'uraian':
        return isEditing ? <Input value={item.uraian} onChange={e => handleEditChange(item.id, 'uraian', e.target.value)} className="w-full" disabled={!isAdmin} /> : <span>{item.uraian}</span>;
      case 'volumeMenjadi':
        return isEditing ? <Input type="number" value={item.volumeMenjadi} onChange={e => handleEditChange(item.id, 'volumeMenjadi', e.target.value)} className="w-full" min="0" disabled={!isAdmin && !areFiltersComplete} /> : <span className={menjadiClassName}>{item.volumeMenjadi}</span>;
      case 'satuanMenjadi':
        return isEditing ? <Select value={item.satuanMenjadi} onValueChange={value => handleEditChange(item.id, 'satuanMenjadi', value)} disabled={!isAdmin && !areFiltersComplete}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Satuan" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map(unit => <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>)}
            </SelectContent>
          </Select> : <span className={menjadiClassName}>{item.satuanMenjadi}</span>;
      case 'hargaSatuanMenjadi':
        return isEditing ? <Input type="number" value={item.hargaSatuanMenjadi} onChange={e => handleEditChange(item.id, 'hargaSatuanMenjadi', e.target.value)} className="w-full" min="0" disabled={!isAdmin && !areFiltersComplete} /> : <span className={menjadiClassName}>{formatCurrency(item.hargaSatuanMenjadi, false)}</span>;
      case 'jumlahMenjadi':
        return <span className={menjadiClassName}>{formatCurrency(item.jumlahMenjadi)}</span>;
      case 'sisaAnggaran':
        return isEditing ? <Input type="number" value={item.sisaAnggaran} onChange={e => handleEditChange(item.id, 'sisaAnggaran', e.target.value)} className="w-full" min="0" disabled={!isAdmin && !areFiltersComplete} /> : <span>{formatCurrency(item.sisaAnggaran)}</span>;
      case 'jumlahSemula':
        return <span>{formatCurrency(item.jumlahSemula)}</span>;
      case 'hargaSatuanSemula':
        return <span>{formatCurrency(item.hargaSatuanSemula, false)}</span>;
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
    const matchesSearch = item.uraian?.toLowerCase().includes(searchLower) || item.satuanSemula?.toLowerCase().includes(searchLower) || item.satuanMenjadi?.toLowerCase().includes(searchLower) || item.subKomponen?.toLowerCase().includes(searchLower) || item.akun?.toLowerCase().includes(searchLower) || item.jumlahSemula.toString().includes(searchTerm) || item.jumlahMenjadi.toString().includes(searchTerm) || item.volumeSemula.toString().includes(searchTerm) || item.volumeMenjadi.toString().includes(searchTerm) || item.hargaSatuanSemula.toString().includes(searchTerm) || item.hargaSatuanMenjadi.toString().includes(searchTerm);
    if (hideZeroBudget) {
      return matchesSearch && !(item.jumlahSemula === 0 && item.jumlahMenjadi === 0);
    }
    return matchesSearch;
  });
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    if (fieldA === undefined || fieldB === undefined) return 0;
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    }
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }
    if (typeof fieldA === 'boolean' && typeof fieldB === 'boolean') {
      return sortDirection === 'asc' ? (fieldA ? 1 : 0) - (fieldB ? 1 : 0) : (fieldB ? 1 : 0) - (fieldA ? 1 : 0);
    }
    return 0;
  });
  const paginatedItems = pageSize === -1 ? sortedItems : sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
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
    const showMaxPages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(showMaxPages / 2));
    let endPage = Math.min(totalPages, startPage + showMaxPages - 1);
    if (endPage - startPage + 1 < showMaxPages) {
      startPage = Math.max(1, endPage - showMaxPages + 1);
    }
    const pages = [];
    if (startPage > 1) {
      pages.push(<PaginationItem key="first">
          <PaginationLink href="#" onClick={e => {
          e.preventDefault();
          handlePageChange(1);
        }} className="flex items-center">
            <ChevronsLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">First</span>
          </PaginationLink>
        </PaginationItem>);
    }
    pages.push(<PaginationItem key="prev">
        <PaginationPrevious href="#" onClick={e => {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
      </PaginationItem>);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(<PaginationItem key={i}>
          <PaginationLink isActive={currentPage === i} href="#" onClick={e => {
          e.preventDefault();
          handlePageChange(i);
        }}>
            {i}
          </PaginationLink>
        </PaginationItem>);
    }
    pages.push(<PaginationItem key="next">
        <PaginationNext href="#" onClick={e => {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
      </PaginationItem>);
    if (endPage < totalPages) {
      pages.push(<PaginationItem key="last">
          <PaginationLink href="#" onClick={e => {
          e.preventDefault();
          handlePageChange(totalPages);
        }} className="flex items-center">
            <span className="hidden sm:inline">Last</span>
            <ChevronsRight className="h-4 w-4 ml-1" />
          </PaginationLink>
        </PaginationItem>);
    }
    return <Pagination>
        <PaginationContent>
          {pages}
        </PaginationContent>
      </Pagination>;
  };
  if (isLoading) {
    return <div className="flex justify-center p-4">Loading budget data...</div>;
  }
  return <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
            <Input placeholder="Cari anggaran..." className="pl-8 w-full sm:w-[300px] h-8 text-sm" value={searchTerm} onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }} />
          </div>
          
          <div className="filter-checkbox-container flex items-center gap-2">
            <Checkbox id="hideZeroBudget" checked={hideZeroBudget} onCheckedChange={checked => {
            setHideZeroBudget(checked === true);
            setCurrentPage(1);
          }} className="filter-checkbox" />
            <label htmlFor="hideZeroBudget" className="filter-checkbox-label text-xs text-gray-400">
              Sembunyikan jumlah pagu 0
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Tampilkan:</span>
          <Select value={pageSize.toString()} onValueChange={value => {
          setPageSize(parseInt(value));
          setCurrentPage(1);
        }}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
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
        {hideZeroBudget && ` (menyembunyikan jumlah pagu 0)`}
      </div>
      
      <div className="rounded-md border border-gray-200 w-full">
        {komponenOutput && <div className="bg-gradient-to-r from-blue-50 to-slate-100 p-2 border-b border-gray-200">
          <h3 className="font-medium text-sm text-slate-700">Komponen Output: {komponenOutput}</h3>
        </div>}
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-full data-table text-xs">
            <thead className="bg-slate-200 z-10 shadow-sm">
              <tr className="text-xs">
                <th className="py-2 px-1 w-8 text-center">#</th>
                <th className="uraian-cell py-2 px-1 w-[250px] text-center">
                  <button className="flex items-center" onClick={() => handleSort('uraian')}>
                    Uraian
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[50px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('volumeSemula')}>
                    Volume Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="unit-cell py-2 px-1 w-[80px] text-center">
                  <button className="flex items-center justify-center w-full" onClick={() => handleSort('satuanSemula')}>
                    Satuan Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[110px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('hargaSatuanSemula')}>
                    Harga Satuan Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[110px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('jumlahSemula')}>
                    Jumlah Semula
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[50px] text-center border-l-2">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('volumeMenjadi')}>
                    Volume Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="unit-cell py-2 px-1 w-[80px] text-center">
                  <button className="flex items-center justify-center w-full" onClick={() => handleSort('satuanMenjadi')}>
                    Satuan Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[110px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('hargaSatuanMenjadi')}>
                    Harga Satuan Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[110px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('jumlahMenjadi')}>
                    Jumlah Menjadi
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[110px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('sisaAnggaran')}>
                    Sisa Anggaran
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="number-cell py-2 px-1 w-[110px] text-center">
                  <button className="flex items-center justify-end w-full" onClick={() => handleSort('selisih')}>
                    Selisih
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                
                {!isViewer && <th className="py-2 px-1 w-[80px] text-center">Aksi SM/PJK</th>}
                {!isViewer && <th className="py-2 px-1 w-[80px] text-center">PPK</th>}
              </tr>
            </thead>
            
            <tbody className="text-xs">
              {paginatedItems.length === 0 ? <tr>
                <td colSpan={!isViewer ? 14 : 12} className="py-4 text-center text-slate-500">
                  {hideZeroBudget ? 'Tidak ada data dengan jumlah pagu > 0' : 'Tidak ada data'}
                </td>
              </tr> : paginatedItems.map((item, index) => <tr key={item.id} className={`${getRowStyle(item.status)} ${index % 2 === 0 ? 'bg-slate-50' : ''} h-12`}>
                <td className="text-center py-4">{(currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + index + 1}</td>
                <td className="uraian-cell my-0 mx-0 px-[6px] py-4">{renderItemField(item, 'uraian')}</td>
                <td className="number-cell">{renderItemField(item, 'volumeSemula')}</td>
                <td className="unit-cell">{renderItemField(item, 'satuanSemula')}</td>
                <td className="number-cell">{renderItemField(item, 'hargaSatuanSemula')}</td>
                <td className="number-cell">{renderItemField(item, 'jumlahSemula')}</td>
                <td className="number-cell border-l-2">{renderItemField(item, 'volumeMenjadi')}</td>
                <td className="unit-cell">{renderItemField(item, 'satuanMenjadi')}</td>
                <td className="number-cell">{renderItemField(item, 'hargaSatuanMenjadi')}</td>
                <td className="number-cell">{renderItemField(item, 'jumlahMenjadi')}</td>
                <td className="number-cell">{renderItemField(item, 'sisaAnggaran')}</td>
                <td className="number-cell">{renderItemField(item, 'selisih')}</td>
                
                {!isViewer && <td>
                  <div className="flex space-x-1 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => showDetailDialog(item)} title="Lihat Detail" className="h-6 w-6">
                      <Eye className="h-3 w-3" />
                    </Button>

                    {editingId === item.id ? <Button variant="ghost" size="icon" onClick={() => saveEditing(item.id)} className="h-6 w-6">
                      <Check className="h-3 w-3" />
                    </Button> : <Button variant="ghost" size="icon" onClick={() => startEditing(item)} className="h-6 w-6" disabled={!isAdmin && !areFiltersComplete}>
                      <FileEdit className="h-3 w-3" />
                    </Button>}
                    
                    {canDeleteItem(item) && <Button variant="ghost" size="icon" onClick={() => confirmDelete(item.id)} className="h-6 w-6">
                      <Trash2 className="h-3 w-3" />
                    </Button>}
                  </div>
                </td>}
                
                {!isViewer && <td className="text-center">
                  {needsApproval(item) && <div className="flex space-x-1 justify-center">
                    <Button variant="ghost" size="icon" className="text-green-600 h-6 w-6" onClick={() => {
                    if (isAdmin) {
                      onApprove(item.id);
                      toast({
                        title: "Berhasil",
                        description: 'Item disetujui oleh PPK'
                      });
                    }
                  }} title="Setujui" disabled={!isAdmin}>
                      <Check className="h-3 w-3 font-bold" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 h-6 w-6" onClick={() => {
                    if (isAdmin) {
                      onReject(item.id);
                      toast({
                        title: "Ditolak",
                        description: 'Item ditolak oleh PPK',
                        variant: "destructive"
                      });
                    }
                  }} title="Tolak" disabled={!isAdmin}>
                      <X className="h-3 w-3 font-bold" />
                    </Button>
                  </div>}
                </td>}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      
      {renderPagination()}
      
      <div className="rounded-md border border-gray-200 w-full p-2">
        <h4 className="text-xs mb-1 text-red-600 font-semibold">Ringkasan Halaman</h4>
        <div className="grid grid-cols-3 text-xs gap-2">
          <div>
            <span className="font-medium">Total Pagu Semula (Halaman): </span>
            <span>{formatCurrency(pageTotalSemula)}</span>
          </div>
          <div>
            <span className="font-medium">Total Pagu Menjadi (Halaman): </span>
            <span>{formatCurrency(pageTotalMenjadi)}</span>
          </div>
          <div>
            <span className="font-medium">Total Selisih Pagu (Halaman): </span>
            <span className={pageTotalSelisih > 0 ? 'text-green-600' : pageTotalSelisih < 0 ? 'text-red-600' : ''}>
              {formatCurrency(pageTotalSelisih)}
            </span>
          </div>
        </div>
        
        <h4 className="text-xs mt-2 mb-1 text-green-600 font-semibold">Ringkasan Keseluruhan</h4>
        <div className="grid grid-cols-3 text-xs gap-2">
          <div>
            <span className="font-medium">Total Pagu Semula (Keseluruhan): </span>
            <span>{formatCurrency(grandTotalSemula)}</span>
          </div>
          <div>
            <span className="font-medium">Total Pagu Menjadi (Keseluruhan): </span>
            <span>{formatCurrency(grandTotalMenjadi)}</span>
          </div>
          <div>
            <span className="font-medium">Total Selisih Pagu (Keseluruhan): </span>
            <span className={grandTotalSelisih > 0 ? 'text-green-600' : grandTotalSelisih < 0 ? 'text-red-600' : ''}>
              {formatCurrency(grandTotalSelisih)}
            </span>
          </div>
        </div>
      </div>
      
      {!isViewer && areFiltersComplete && <div className="rounded-md border border-gray-200 p-2 w-full">
          <h4 className="text-xs font-semibold mb-2">Tambah Item Baru</h4>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            {/* Form inputs for adding new item */}
            <div className="lg:col-span-6">
              <label className="block text-xs mb-1">Uraian</label>
              <Input value={newItem.uraian} onChange={e => setNewItem({
            ...newItem,
            uraian: e.target.value
          })} className="h-8 text-xs" placeholder="Masukkan uraian" />
            </div>

            {/* Volume dan Satuan Semula */}
            {isAdmin && <>
                <div className="lg:col-span-2">
                  <label className="block text-xs mb-1">Volume Semula</label>
                  <Input type="number" value={newItem.volumeSemula} onChange={e => setNewItem({
              ...newItem,
              volumeSemula: Number(e.target.value)
            })} className="h-8 text-xs" min="0" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs mb-1">Satuan Semula</label>
                  <Select value={newItem.satuanSemula} onValueChange={value => setNewItem({
              ...newItem,
              satuanSemula: value
            })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map(unit => <SelectItem key={`semula-${unit}`} value={unit}>{unit}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs mb-1">Harga Satuan Semula</label>
                  <Input type="number" value={newItem.hargaSatuanSemula} onChange={e => setNewItem({
              ...newItem,
              hargaSatuanSemula: Number(e.target.value)
            })} className="h-8 text-xs" min="0" />
                </div>
              </>}

            {/* Volume dan Satuan Menjadi */}
            <div className="lg:col-span-2">
              <label className="block text-xs mb-1">Volume Menjadi</label>
              <Input type="number" value={newItem.volumeMenjadi} onChange={e => setNewItem({
            ...newItem,
            volumeMenjadi: Number(e.target.value)
          })} className="h-8 text-xs" min="0" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs mb-1">Satuan Menjadi</label>
              <Select value={newItem.satuanMenjadi} onValueChange={value => setNewItem({
            ...newItem,
            satuanMenjadi: value
          })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map(unit => <SelectItem key={`menjadi-${unit}`} value={unit}>{unit}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs mb-1">Harga Satuan Menjadi</label>
              <Input type="number" value={newItem.hargaSatuanMenjadi} onChange={e => setNewItem({
            ...newItem,
            hargaSatuanMenjadi: Number(e.target.value)
          })} className="h-8 text-xs" min="0" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs mb-1">Sisa Anggaran</label>
              <Input type="number" value={newItem.sisaAnggaran} onChange={e => setNewItem({
            ...newItem,
            sisaAnggaran: Number(e.target.value)
          })} className="h-8 text-xs" min="0" />
            </div>

            {/* Jumlah dan Tombol */}
            <div className="flex items-end lg:col-span-12 justify-between mt-2">
              <div className="text-xs">
                <span>Jumlah Semula: <strong>{formatCurrency(newItemJumlahSemula)}</strong></span>
                <span className="mx-4">Jumlah Menjadi: <strong>{formatCurrency(newItemJumlahMenjadi)}</strong></span>
                <span>Selisih: <strong className={newItemSelisih > 0 ? 'text-green-600' : newItemSelisih < 0 ? 'text-red-600' : ''}>{formatCurrency(newItemSelisih)}</strong></span>
              </div>
              <Button size="sm" onClick={handleAddItem} className="h-8 text-xs">
                <PlusCircle className="h-3 w-3 mr-1" />
                Tambah Item
              </Button>
            </div>
          </div>
        </div>}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DetailDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} item={detailItem} />
    </div>;
};
export default BudgetTable;
