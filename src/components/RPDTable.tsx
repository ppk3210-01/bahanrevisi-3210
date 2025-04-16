
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { PlusCircle, Trash2, FileEdit, Check, ArrowUpDown, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FilterSelection } from '@/types/budget';
import { useRPDData } from '@/hooks/useRPDData';
import { useAuth } from '@/contexts/AuthContext';

interface RPDItem {
  id: string;
  uraian: string;
  total: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

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
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hideZeroBudget, setHideZeroBudget] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    } else if (sortField === 'total') {
      fieldA = a.jumlah_rpd;
      fieldB = b.jumlah_rpd;
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
  
  const paginatedItems = pageSize === -1 
    ? sortedItems 
    : sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedItems.length / pageSize);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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
      return <span>{item.uraian}</span>;
    }
    
    if (field === 'total') {
      return <span className="text-right block w-full">{formatCurrency(item.jumlah_rpd || 0)}</span>;
    }

    if (field === 'pagu') {
      return <span className="text-right block w-full">{formatCurrency(item.jumlah_menjadi || 0)}</span>;
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

  if (loading) {
    return <div className="flex justify-center p-4">Loading RPD data...</div>;
  }

  return (
    <div className="space-y-2">
      <style>
        {`
        .rpd-table th, .rpd-table td {
          padding: 4px 6px;
          font-size: 0.75rem;
          text-align: center;
          white-space: nowrap;
        }
        
        .rpd-table th {
          background-color: #f1f5f9;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .rpd-table .month-cell {
          min-width: 75px;
          width: 75px;
          max-width: 75px;
          text-align: right;
        }
        
        .rpd-table .description-cell {
          text-align: left;
          min-width: 200px;
        }
        
        .rpd-table .total-cell {
          font-weight: 600;
          text-align: right;
          min-width: 75px;
          width: 75px;
          max-width: 75px;
        }

        .rpd-table .pagu-cell {
          font-weight: 600;
          text-align: right;
          min-width: 75px;
          width: 75px;
          max-width: 75px;
        }
        
        .rpd-table .action-cell {
          width: 30px;
          max-width: 30px;
        }

        .rpd-table .status-cell {
          width: 50px;
          max-width: 50px;
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
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="filter-checkbox-container flex items-center gap-2">
            <Checkbox 
              id="hideZeroBudget"
              checked={hideZeroBudget}
              onCheckedChange={(checked) => {
                setHideZeroBudget(checked === true);
                setCurrentPage(1);
              }}
              className="filter-checkbox"
            />
            <label htmlFor="hideZeroBudget" className="filter-checkbox-label text-sm">
              Sembunyikan jumlah pagu 0
            </label>
          </div>
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
            <SelectContent className="bg-white z-50">
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
      
      <div className="rounded-md border border-gray-200 w-full overflow-x-auto">
        <table className="w-full min-w-full rpd-table">
          <thead>
            <tr className="header-row">
              <th className="py-2 px-1 w-8">#</th>
              <th className="status-cell py-2 px-1">Status</th>
              <th className="description-cell py-2 px-1">
                <button 
                  className="flex items-center" 
                  onClick={() => handleSort('uraian')}
                >
                  Uraian
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('jan')}
                >
                  Jan
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('feb')}
                >
                  Feb
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('mar')}
                >
                  Mar
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('apr')}
                >
                  Apr
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('mei')}
                >
                  Mei
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('jun')}
                >
                  Jun
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('jul')}
                >
                  Jul
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('aug')}
                >
                  Agu
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('sep')}
                >
                  Sep
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('oct')}
                >
                  Okt
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('nov')}
                >
                  Nov
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('dec')}
                >
                  Des
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="total-cell py-2 px-1">
                <button 
                  className="flex items-center justify-end w-full" 
                  onClick={() => handleSort('total')}
                >
                  Total
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="pagu-cell py-2 px-1">
                Pagu Anggaran
              </th>
              <th className="action-cell py-2 px-1"></th>
            </tr>
          </thead>
          
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={18} className="py-4 text-center text-slate-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => (
                <tr key={item.id} className={`${index % 2 === 0 ? 'bg-slate-50' : ''} h-9`}>
                  <td className="text-center">{(currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + index + 1}</td>
                  <td className="status-cell">
                    <span className={getStatusClass(item)}>{getStatusText(item)}</span>
                  </td>
                  <td className="description-cell">{renderItemField(item, 'uraian')}</td>
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
                  <td className="total-cell">{renderItemField(item, 'total')}</td>
                  <td className="pagu-cell">{renderItemField(item, 'pagu')}</td>
                  <td className="action-cell">
                    {(isAdmin || (user && user.role === 'user')) && (
                      <div className="flex space-x-1 justify-center">
                        {editingId === item.id ? (
                          <Button variant="ghost" size="icon" onClick={() => saveEditing(item.id)} className="h-6 w-6">
                            <Check className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEditing(item)} 
                            className="h-6 w-6"
                          >
                            <FileEdit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
            
            <tr className="footer-row">
              <td colSpan={3} className="text-right">Total per Bulan</td>
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
              <td className="total-cell">{formatCurrency(grandTotal)}</td>
              <td className="pagu-cell">{formatCurrency(pagu)}</td>
              <td></td>
            </tr>
            
            <tr className="footer-row">
              <td colSpan={15} className="text-right">Sisa Pagu</td>
              <td className={`total-cell sisa ${sisaPagu < 0 ? 'text-red-600' : ''}`} colSpan={2}>
                {formatCurrency(sisaPagu)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {pageSize !== -1 && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <Button 
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPDTable;
