
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { FileEdit, Check, ArrowUpDown, Search, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FilterSelection } from '@/types/budget';
import { useRPDData } from '@/hooks/useRPDData';
import { useAuth } from '@/contexts/AuthContext';

interface RPDTableProps {
  filters: FilterSelection;
}

const RPDTable: React.FC<RPDTableProps> = ({ filters }) => {
  const { rpdItems, loading, updateRPDItem } = useRPDData(filters);
  const { isAdmin, user } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: {[key: string]: number}}>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hideZeroBudget, setHideZeroBudget] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const pagu = rpdItems.reduce((sum, item) => sum + item.jumlah_menjadi, 0);

  // Initialize or update edit values when editing an item
  useEffect(() => {
    if (editingId) {
      const item = rpdItems.find(item => item.id === editingId);
      if (item) {
        setEditValues(prev => ({
          ...prev,
          [editingId]: {
            januari: item.januari || 0,
            februari: item.februari || 0,
            maret: item.maret || 0,
            april: item.april || 0,
            mei: item.mei || 0,
            juni: item.juni || 0,
            juli: item.juli || 0,
            agustus: item.agustus || 0,
            september: item.september || 0,
            oktober: item.oktober || 0,
            november: item.november || 0,
            desember: item.desember || 0
          }
        }));
      }
    }
  }, [editingId, rpdItems]);

  const handleEditChange = (id: string, field: string, value: string | number) => {
    if (field !== 'uraian') {
      let numValue: number;
      
      if (typeof value === 'string') {
        // Remove any non-numeric characters except decimal point
        const cleanValue = value.replace(/[^0-9.]/g, '');
        numValue = parseFloat(cleanValue) || 0;
      } else {
        numValue = value as number;
      }
      
      if (numValue < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: 'Nilai tidak boleh negatif'
        });
        return;
      }
      
      // Update local edit state
      setEditValues(prev => {
        const itemValues = prev[id] || {};
        let apiField = field;
        
        if (field === 'jan') apiField = 'januari';
        if (field === 'feb') apiField = 'februari';
        if (field === 'mar') apiField = 'maret';
        if (field === 'apr') apiField = 'april';
        if (field === 'mei') apiField = 'mei';
        if (field === 'jun') apiField = 'juni';
        if (field === 'jul') apiField = 'juli';
        if (field === 'aug') apiField = 'agustus';
        if (field === 'sep') apiField = 'september';
        if (field === 'oct') apiField = 'oktober';
        if (field === 'nov') apiField = 'november';
        if (field === 'dec') apiField = 'desember';
        
        return {
          ...prev,
          [id]: {
            ...itemValues,
            [apiField]: numValue
          }
        };
      });
    }
  };

  const startEditing = (item: any) => {
    // Only allow editing for admin or regular users
    if (isAdmin || (user && user.role === 'user')) {
      setEditingId(item.id);
    } else {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: 'Anda tidak memiliki izin untuk mengedit data ini.'
      });
    }
  };

  const saveEditing = async (id: string) => {
    if (editingId && editValues[editingId]) {
      const updates = editValues[editingId];
      const success = await updateRPDItem(id, updates);
      
      if (success) {
        setEditingId(null);
        toast({
          title: "Berhasil",
          description: 'Perubahan berhasil disimpan'
        });
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredItems = [...rpdItems].filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      item.uraian.toLowerCase().includes(searchLower);
    
    if (hideZeroBudget) {
      return matchesSearch && item.jumlah_menjadi !== 0;
    }
    
    return matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;
    
    let fieldA: any, fieldB: any;
    
    if (sortField === 'jan') {
      fieldA = a.januari;
      fieldB = b.januari;
    } else if (sortField === 'feb') {
      fieldA = a.februari;
      fieldB = b.februari;
    } else if (sortField === 'mar') {
      fieldA = a.maret;
      fieldB = b.maret;
    } else if (sortField === 'apr') {
      fieldA = a.april;
      fieldB = b.april;
    } else if (sortField === 'mei') {
      fieldA = a.mei;
      fieldB = b.mei;
    } else if (sortField === 'jun') {
      fieldA = a.juni;
      fieldB = b.juni;
    } else if (sortField === 'jul') {
      fieldA = a.juli;
      fieldB = b.juli;
    } else if (sortField === 'aug') {
      fieldA = a.agustus;
      fieldB = b.agustus;
    } else if (sortField === 'sep') {
      fieldA = a.september;
      fieldB = b.september;
    } else if (sortField === 'oct') {
      fieldA = a.oktober;
      fieldB = b.oktober;
    } else if (sortField === 'nov') {
      fieldA = a.november;
      fieldB = b.november;
    } else if (sortField === 'dec') {
      fieldA = a.desember;
      fieldB = b.desember;
    } else if (sortField === 'total_rpd') {
      fieldA = a.jumlah_rpd;
      fieldB = b.jumlah_rpd;
    } else if (sortField === 'total_pagu') {
      fieldA = a.jumlah_menjadi;
      fieldB = b.jumlah_menjadi;
    } else if (sortField === 'selisih') {
      fieldA = a.selisih;
      fieldB = b.selisih;
    } else if (sortField === 'uraian') {
      fieldA = a.uraian;
      fieldB = b.uraian;
    } else {
      fieldA = (a as any)[sortField];
      fieldB = (b as any)[sortField];
    }
    
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
    
    return 0;
  });

  const totalByMonth = {
    jan: rpdItems.reduce((sum, item) => sum + (item.januari || 0), 0),
    feb: rpdItems.reduce((sum, item) => sum + (item.februari || 0), 0),
    mar: rpdItems.reduce((sum, item) => sum + (item.maret || 0), 0),
    apr: rpdItems.reduce((sum, item) => sum + (item.april || 0), 0),
    mei: rpdItems.reduce((sum, item) => sum + (item.mei || 0), 0),
    jun: rpdItems.reduce((sum, item) => sum + (item.juni || 0), 0),
    jul: rpdItems.reduce((sum, item) => sum + (item.juli || 0), 0),
    aug: rpdItems.reduce((sum, item) => sum + (item.agustus || 0), 0),
    sep: rpdItems.reduce((sum, item) => sum + (item.september || 0), 0),
    oct: rpdItems.reduce((sum, item) => sum + (item.oktober || 0), 0),
    nov: rpdItems.reduce((sum, item) => sum + (item.november || 0), 0),
    dec: rpdItems.reduce((sum, item) => sum + (item.desember || 0), 0)
  };

  const grandTotal = rpdItems.reduce((sum, item) => sum + (item.jumlah_rpd || 0), 0);
  const sisaPagu = pagu - grandTotal;

  const getMonthClass = (month: keyof typeof totalByMonth): string => {
    const total = totalByMonth[month];
    if (total === 0) return 'belum-isi';
    return '';
  };
  
  // Pagination
  const paginatedItems = pageSize === -1 
    ? sortedItems 
    : sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedItems.length / pageSize);

  const getStatusClass = (item: any): string => {
    if (item.jumlah_rpd === item.jumlah_menjadi) {
      return 'status-ok';
    } else {
      return 'status-sisa';
    }
  };

  const getStatusText = (item: any): string => {
    if (item.jumlah_rpd === item.jumlah_menjadi) {
      return 'OK';
    } else {
      return 'Sisa';
    }
  };

  const renderItemField = (item: any, field: string) => {
    const isEditing = editingId === item.id;
    
    if (field === 'uraian') {
      // Uraian is never editable
      return <span className="line-clamp-3 text-left">{item.uraian}</span>;
    }
    
    if (field === 'total_rpd') {
      return <span className="text-right block w-full">{formatCurrency(item.jumlah_rpd || 0)}</span>;
    }

    if (field === 'total_pagu') {
      return <span className="text-right block w-full">{formatCurrency(item.jumlah_menjadi || 0)}</span>;
    }
    
    if (field === 'selisih') {
      return <span className={`text-right block w-full ${item.selisih !== 0 ? 'text-red-500' : 'text-green-500'}`}>
        {formatCurrency(item.selisih || 0)}
      </span>;
    }
    
    let value = 0;
    let fieldKey = '';
    
    if (field === 'jan') { value = item.januari || 0; fieldKey = 'januari'; }
    else if (field === 'feb') { value = item.februari || 0; fieldKey = 'februari'; }
    else if (field === 'mar') { value = item.maret || 0; fieldKey = 'maret'; }
    else if (field === 'apr') { value = item.april || 0; fieldKey = 'april'; }
    else if (field === 'mei') { value = item.mei || 0; fieldKey = 'mei'; }
    else if (field === 'jun') { value = item.juni || 0; fieldKey = 'juni'; }
    else if (field === 'jul') { value = item.juli || 0; fieldKey = 'juli'; }
    else if (field === 'aug') { value = item.agustus || 0; fieldKey = 'agustus'; }
    else if (field === 'sep') { value = item.september || 0; fieldKey = 'september'; }
    else if (field === 'oct') { value = item.oktober || 0; fieldKey = 'oktober'; }
    else if (field === 'nov') { value = item.november || 0; fieldKey = 'november'; }
    else if (field === 'dec') { value = item.desember || 0; fieldKey = 'desember'; }
    
    // If editing, use the value from editValues if available
    const editValue = isEditing && editValues[item.id] ? editValues[item.id][fieldKey] : value;
    
    return isEditing ? (
      <Input 
        type="text"
        value={editValue} 
        onChange={(e) => handleEditChange(item.id, field, e.target.value)}
        className="w-full text-right px-2 py-1 h-7"
        min="0"
      />
    ) : (
      <span className="text-right block w-full">{formatCurrency(value, false)}</span>
    );
  };

  const handleShowDetail = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowDetailDialog(true);
  };

  const getSelectedItem = () => {
    return rpdItems.find(item => item.id === selectedItemId);
  };

  const renderDetailDialog = () => {
    const item = getSelectedItem();
    
    if (!item) return null;
    
    return (
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Anggaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm">
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <div className="font-semibold">Uraian</div>
                <div className="col-span-2">{item.uraian}</div>
                
                <div className="font-semibold">Program Pembebanan</div>
                <div className="col-span-2">{item.program_pembebanan || '-'}</div>
                
                <div className="font-semibold">Kegiatan</div>
                <div className="col-span-2">{item.kegiatan || '-'}</div>
                
                <div className="font-semibold">Rincian Output</div>
                <div className="col-span-2">{item.rincian_output || '-'}</div>
                
                <div className="font-semibold">Komponen Output</div>
                <div className="col-span-2">{item.komponen_output || '-'}</div>
                
                <div className="font-semibold">Sub Komponen</div>
                <div className="col-span-2">{item.sub_komponen || '-'}</div>
                
                <div className="font-semibold">Akun</div>
                <div className="col-span-2">{item.akun || '-'}</div>
                
                <div className="font-semibold">Volume</div>
                <div className="col-span-2">
                  {item.volume_menjadi} {item.satuan_menjadi}
                </div>
                
                <div className="font-semibold">Harga Satuan</div>
                <div className="col-span-2">{formatCurrency(item.harga_satuan_menjadi)}</div>
                
                <div className="font-semibold">Total</div>
                <div className="col-span-2 font-medium">{formatCurrency(item.jumlah_menjadi)}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading RPD data...</div>;
  }

  return (
    <div className="space-y-2">
      <style>
        {`
        .rpd-table-container {
          position: relative;
          overflow-x: auto;
          max-width: 100%;
        }
        
        .rpd-table th, .rpd-table td {
          padding: 4px 6px;
          font-size: 0.75rem;
          white-space: nowrap;
        }
        
        .rpd-table th {
          background-color: #f1f5f9;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .rpd-table .fixed-column {
          position: sticky;
          left: 0;
          background-color: #fff;
          z-index: 5;
          border-right: 1px solid #e2e8f0;
        }
        
        .rpd-table tr:nth-child(even) .fixed-column {
          background-color: #f8fafc;
        }
        
        .rpd-table .fixed-column:last-of-type {
          border-right: 2px solid #e2e8f0;
        }
        
        .rpd-table th.fixed-column {
          z-index: 15;
          background-color: #f1f5f9;
        }
        
        .rpd-table .month-cell {
          min-width: 80px;
          width: 80px;
          max-width: 80px;
          text-align: right;
        }
        
        .rpd-table .description-cell {
          text-align: left;
          min-width: 300px;
          max-width: 300px;
          white-space: normal;
          overflow-wrap: break-word;
        }
        
        .rpd-table .number-cell {
          min-width: 30px;
          text-align: center;
        }
        
        .rpd-table .total-cell {
          font-weight: 600;
          text-align: right;
          min-width: 100px;
          width: 100px;
          max-width: 100px;
        }

        .rpd-table .pagu-cell {
          font-weight: 600;
          text-align: right;
          min-width: 100px;
          width: 100px;
          max-width: 100px;
        }

        .rpd-table .selisih-cell {
          font-weight: 600;
          text-align: right;
          min-width: 100px;
          width: 100px;
          max-width: 100px;
        }
        
        .rpd-table .action-cell {
          width: 70px;
          max-width: 70px;
        }

        .rpd-table .status-cell {
          width: 50px;
          max-width: 50px;
          text-align: center;
        }

        .status-ok {
          color: green;
          font-weight: 600;
        }

        .status-sisa {
          color: red;
          font-weight: 600;
        }
        
        .rpd-table .input-cell input {
          width: 75px;
          text-align: right;
        }
        
        .rpd-table .header-row th {
          border-bottom: 2px solid #cbd5e1;
        }
        
        .rpd-table .footer-row td {
          font-weight: 600;
          border-top: 2px solid #cbd5e1;
          background-color: #f8fafc;
          text-align: right;
          position: sticky;
          bottom: 0;
          z-index: 5;
        }
        
        .rpd-table .footer-row td.fixed-column {
          z-index: 8;
        }
        
        .rpd-table .belum-isi {
          background-color: #fee2e2;
        }
        
        .rpd-table .belum-lengkap {
          background-color: #fef9c3;
        }
        
        .rpd-table .sisa {
          background-color: #e0f2fe;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1rem;
          gap: 0.5rem;
        }
        
        .pagination-info {
          margin: 0 1rem;
          font-size: 0.875rem;
          color: #64748b;
        }
      `}
      </style>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari rencana penarikan dana..."
              className="pl-8 w-full h-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          
          <div className="filter-checkbox-container flex items-center gap-2">
            <Checkbox 
              id="hideZeroBudget"
              checked={hideZeroBudget}
              onCheckedChange={(checked) => {
                setHideZeroBudget(checked === true);
              }}
              className="filter-checkbox"
            />
            <label htmlFor="hideZeroBudget" className="filter-checkbox-label text-sm">
              Sembunyikan jumlah pagu 0
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Tampilkan:</span>
          <Select 
            value={String(pageSize)} 
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
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
      
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <div className="rpd-table-container">
          <table className="w-full min-w-full rpd-table">
            <thead>
              <tr className="header-row">
                <th className="number-cell fixed-column" style={{left: '0px'}}>#</th>
                <th className="status-cell fixed-column" style={{left: '30px'}}>Status</th>
                <th className="description-cell fixed-column" style={{left: '80px'}}>
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('uraian')}
                  >
                    Uraian
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="pagu-cell fixed-column" style={{left: '380px'}}>
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('total_pagu')}
                  >
                    Total Pagu
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="total-cell fixed-column" style={{left: '480px'}}>
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('total_rpd')}
                  >
                    Total RPD
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="selisih-cell fixed-column" style={{left: '580px'}}>
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('selisih')}
                  >
                    Selisih
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('jan')}
                  >
                    Jan
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('feb')}
                  >
                    Feb
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('mar')}
                  >
                    Mar
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('apr')}
                  >
                    Apr
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('mei')}
                  >
                    Mei
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('jun')}
                  >
                    Jun
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('jul')}
                  >
                    Jul
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('aug')}
                  >
                    Agu
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('sep')}
                  >
                    Sep
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('oct')}
                  >
                    Okt
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('nov')}
                  >
                    Nov
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="month-cell">
                  <button 
                    className="flex items-center justify-end w-full" 
                    onClick={() => handleSort('dec')}
                  >
                    Des
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </button>
                </th>
                <th className="action-cell"></th>
              </tr>
            </thead>
            
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-4 text-center text-slate-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr key={item.id} className={`${index % 2 === 0 ? 'bg-slate-50' : ''} h-9`}>
                    <td className="number-cell fixed-column" style={{left: '0px'}}>
                      {(currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + index + 1}
                    </td>
                    <td className="status-cell fixed-column" style={{left: '30px'}}>
                      <span className={getStatusClass(item)}>{getStatusText(item)}</span>
                    </td>
                    <td className="description-cell fixed-column" style={{left: '80px'}}>
                      {renderItemField(item, 'uraian')}
                    </td>
                    <td className="pagu-cell fixed-column" style={{left: '380px'}}>
                      {renderItemField(item, 'total_pagu')}
                    </td>
                    <td className="total-cell fixed-column" style={{left: '480px'}}>
                      {renderItemField(item, 'total_rpd')}
                    </td>
                    <td className="selisih-cell fixed-column" style={{left: '580px'}}>
                      {renderItemField(item, 'selisih')}
                    </td>
                    <td className={`month-cell ${getMonthClass('jan')}`}>{renderItemField(item, 'jan')}</td>
                    <td className={`month-cell ${getMonthClass('feb')}`}>{renderItemField(item, 'feb')}</td>
                    <td className={`month-cell ${getMonthClass('mar')}`}>{renderItemField(item, 'mar')}</td>
                    <td className={`month-cell ${getMonthClass('apr')}`}>{renderItemField(item, 'apr')}</td>
                    <td className={`month-cell ${getMonthClass('mei')}`}>{renderItemField(item, 'mei')}</td>
                    <td className={`month-cell ${getMonthClass('jun')}`}>{renderItemField(item, 'jun')}</td>
                    <td className={`month-cell ${getMonthClass('jul')}`}>{renderItemField(item, 'jul')}</td>
                    <td className={`month-cell ${getMonthClass('aug')}`}>{renderItemField(item, 'aug')}</td>
                    <td className={`month-cell ${getMonthClass('sep')}`}>{renderItemField(item, 'sep')}</td>
                    <td className={`month-cell ${getMonthClass('oct')}`}>{renderItemField(item, 'oct')}</td>
                    <td className={`month-cell ${getMonthClass('nov')}`}>{renderItemField(item, 'nov')}</td>
                    <td className={`month-cell ${getMonthClass('dec')}`}>{renderItemField(item, 'dec')}</td>
                    <td className="action-cell">
                      <div className="flex space-x-1 justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleShowDetail(item.id)} 
                          className="h-6 w-6"
                          title="Lihat Detail"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {(isAdmin || (user && user.role === 'user')) && (
                          editingId === item.id ? (
                            <Button variant="ghost" size="icon" onClick={() => saveEditing(item.id)} className="h-6 w-6">
                              <Check className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEditing(item)} 
                              className="h-6 w-6"
                              title="Edit"
                            >
                              <FileEdit className="h-3 w-3" />
                            </Button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="footer-row">
                <td className="fixed-column" style={{left: '0px'}}></td>
                <td className="fixed-column" style={{left: '30px'}}></td>
                <td className="fixed-column text-right" style={{left: '80px'}}>Total per Bulan</td>
                <td className="pagu-cell fixed-column" style={{left: '380px'}}>{formatCurrency(pagu)}</td>
                <td className="total-cell fixed-column" style={{left: '480px'}}>{formatCurrency(grandTotal)}</td>
                <td className={`selisih-cell fixed-column ${sisaPagu !== 0 ? 'text-red-600' : 'text-green-600'}`} style={{left: '580px'}}>{formatCurrency(sisaPagu)}</td>
                <td className={`month-cell ${getMonthClass('jan')}`}>{formatCurrency(totalByMonth.jan, false)}</td>
                <td className={`month-cell ${getMonthClass('feb')}`}>{formatCurrency(totalByMonth.feb, false)}</td>
                <td className={`month-cell ${getMonthClass('mar')}`}>{formatCurrency(totalByMonth.mar, false)}</td>
                <td className={`month-cell ${getMonthClass('apr')}`}>{formatCurrency(totalByMonth.apr, false)}</td>
                <td className={`month-cell ${getMonthClass('mei')}`}>{formatCurrency(totalByMonth.mei, false)}</td>
                <td className={`month-cell ${getMonthClass('jun')}`}>{formatCurrency(totalByMonth.jun, false)}</td>
                <td className={`month-cell ${getMonthClass('jul')}`}>{formatCurrency(totalByMonth.jul, false)}</td>
                <td className={`month-cell ${getMonthClass('aug')}`}>{formatCurrency(totalByMonth.aug, false)}</td>
                <td className={`month-cell ${getMonthClass('sep')}`}>{formatCurrency(totalByMonth.sep, false)}</td>
                <td className={`month-cell ${getMonthClass('oct')}`}>{formatCurrency(totalByMonth.oct, false)}</td>
                <td className={`month-cell ${getMonthClass('nov')}`}>{formatCurrency(totalByMonth.nov, false)}</td>
                <td className={`month-cell ${getMonthClass('dec')}`}>{formatCurrency(totalByMonth.dec, false)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Pagination controls */}
      {pageSize !== -1 && (
        <div className="pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            &lt;&lt;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </Button>
          <span className="pagination-info">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            &gt;&gt;
          </Button>
        </div>
      )}
      
      {/* Detail Dialog */}
      {renderDetailDialog()}
    </div>
  );
};

export default RPDTable;
