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
import { formatCurrency } from '@/utils/budgetCalculations';
import { PlusCircle, Trash2, FileEdit, Check, ArrowUpDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FilterSelection } from '@/types/budget';
import { useRPDData } from '@/hooks/useRPDData';

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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof RPDItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const pagu = rpdItems.reduce((sum, item) => sum + item.jumlah_menjadi, 0);

  const handleEditChange = (id: string, field: string, value: string | number) => {
    if (field !== 'uraian') {
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
    
    const updates = { [apiField]: value };
    
    updateRPDItem(id, updates);
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
  };

  const saveEditing = (id: string) => {
    setEditingId(null);
    toast({
      title: "Berhasil",
      description: 'Perubahan berhasil disimpan'
    });
  };

  const handleSort = (field: keyof RPDItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...rpdItems].sort((a, b) => {
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

  const renderItemField = (item: any, field: string) => {
    const isEditing = editingId === item.id;
    
    if (field === 'uraian') {
      return isEditing ? (
        <Input 
          value={item.uraian} 
          onChange={(e) => handleEditChange(item.id, 'uraian', e.target.value)}
          className="w-full"
        />
      ) : (
        <span>{item.uraian}</span>
      );
    }
    
    if (field === 'total') {
      return <span>{formatCurrency(item.jumlah_rpd || 0)}</span>;
    }
    
    let value = 0;
    if (field === 'jan') value = item.januari || 0;
    else if (field === 'feb') value = item.februari || 0;
    else if (field === 'mar') value = item.maret || 0;
    else if (field === 'apr') value = item.april || 0;
    else if (field === 'mei') value = item.mei || 0;
    else if (field === 'jun') value = item.juni || 0;
    else if (field === 'jul') value = item.juli || 0;
    else if (field === 'aug') value = item.agustus || 0;
    else if (field === 'sep') value = item.september || 0;
    else if (field === 'oct') value = item.oktober || 0;
    else if (field === 'nov') value = item.november || 0;
    else if (field === 'dec') value = item.desember || 0;
    
    return isEditing ? (
      <Input 
        type="number"
        value={value} 
        onChange={(e) => handleEditChange(item.id, field, e.target.value)}
        className="w-full text-right"
        min="0"
      />
    ) : (
      <span>{formatCurrency(value, false)}</span>
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
          min-width: 80px;
        }
        
        .rpd-table th {
          background-color: #f1f5f9;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .rpd-table .month-cell {
          min-width: 80px;
          width: 80px;
          max-width: 80px;
        }
        
        .rpd-table .description-cell {
          text-align: left;
          min-width: 200px;
        }
        
        .rpd-table .total-cell {
          font-weight: 600;
        }
        
        .rpd-table .action-cell {
          width: 60px;
        }
        
        .rpd-table .input-cell input {
          width: 80px;
          text-align: right;
        }
        
        .rpd-table .header-row th {
          border-bottom: 2px solid #cbd5e1;
        }
        
        .rpd-table .footer-row td {
          font-weight: 600;
          border-top: 2px solid #cbd5e1;
          background-color: #f8fafc;
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
      
      <div className="rounded-md border border-gray-200 w-full overflow-x-auto">
        <table className="w-full min-w-full rpd-table">
          <thead>
            <tr className="header-row">
              <th className="py-2 px-1 w-8">#</th>
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
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('jan')}
                >
                  Jan
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('feb')}
                >
                  Feb
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('mar')}
                >
                  Mar
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('apr')}
                >
                  Apr
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('mei')}
                >
                  Mei
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('jun')}
                >
                  Jun
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('jul')}
                >
                  Jul
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('aug')}
                >
                  Agu
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('sep')}
                >
                  Sep
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('oct')}
                >
                  Okt
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('nov')}
                >
                  Nov
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="month-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('dec')}
                >
                  Des
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="total-cell py-2 px-1">
                <button 
                  className="flex items-center justify-center w-full" 
                  onClick={() => handleSort('total')}
                >
                  Total
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </th>
              <th className="action-cell py-2 px-1">Aksi</th>
            </tr>
          </thead>
          
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-4 text-center text-slate-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              sortedItems.map((item, index) => (
                <tr key={item.id} className={`${index % 2 === 0 ? 'bg-slate-50' : ''} h-9`}>
                  <td className="text-center">{index + 1}</td>
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
                  <td className="action-cell">
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
                  </td>
                </tr>
              ))
            )}
            
            <tr className="footer-row">
              <td colSpan={2} className="text-right">Total per Bulan</td>
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
              <td></td>
            </tr>
            
            <tr className="footer-row">
              <td colSpan={2} className="text-right">Pagu Anggaran</td>
              <td colSpan={12}></td>
              <td className="total-cell">{formatCurrency(pagu)}</td>
              <td></td>
            </tr>
            
            <tr className="footer-row">
              <td colSpan={2} className="text-right">Sisa Pagu</td>
              <td colSpan={12}></td>
              <td className={`total-cell sisa ${sisaPagu < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(sisaPagu)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RPDTable;
