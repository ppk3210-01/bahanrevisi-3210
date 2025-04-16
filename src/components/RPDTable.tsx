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
  items: RPDItem[];
  onAdd: (item: Omit<RPDItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<RPDItem>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  pagu: number;
}

const RPDTable: React.FC<RPDTableProps> = ({
  items,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
  pagu
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<RPDItem, 'id'>>({
    uraian: '',
    total: 0,
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    mei: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0
  });
  const [sortField, setSortField] = useState<keyof RPDItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const calculateTotal = (item: Partial<RPDItem>): number => {
    return (
      (item.jan || 0) +
      (item.feb || 0) +
      (item.mar || 0) +
      (item.apr || 0) +
      (item.mei || 0) +
      (item.jun || 0) +
      (item.jul || 0) +
      (item.aug || 0) +
      (item.sep || 0) +
      (item.oct || 0) +
      (item.nov || 0) +
      (item.dec || 0)
    );
  };

  const validateItem = (item: Partial<RPDItem>): boolean => {
    if (!item.uraian || item.uraian.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Uraian harus diisi'
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
      const total = calculateTotal(newItem);
      const itemToAdd = {
        ...newItem,
        total
      };

      await onAdd(itemToAdd);

      setNewItem({
        uraian: '',
        total: 0,
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        mei: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        oct: 0,
        nov: 0,
        dec: 0
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

  const startEditing = (item: RPDItem) => {
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
    
    const item = items.find(item => item.id === id);
    if (!item) return;
    
    const updates: Partial<RPDItem> = { [field]: value };
    
    if (field !== 'uraian' && field !== 'total') {
      const updatedItem = { ...item, ...updates };
      updates.total = calculateTotal(updatedItem);
    }
    
    onUpdate(id, updates);
  };

  const handleSort = (field: keyof RPDItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
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
    
    return 0;
  });

  const totalByMonth = {
    jan: items.reduce((sum, item) => sum + item.jan, 0),
    feb: items.reduce((sum, item) => sum + item.feb, 0),
    mar: items.reduce((sum, item) => sum + item.mar, 0),
    apr: items.reduce((sum, item) => sum + item.apr, 0),
    mei: items.reduce((sum, item) => sum + item.mei, 0),
    jun: items.reduce((sum, item) => sum + item.jun, 0),
    jul: items.reduce((sum, item) => sum + item.jul, 0),
    aug: items.reduce((sum, item) => sum + item.aug, 0),
    sep: items.reduce((sum, item) => sum + item.sep, 0),
    oct: items.reduce((sum, item) => sum + item.oct, 0),
    nov: items.reduce((sum, item) => sum + item.nov, 0),
    dec: items.reduce((sum, item) => sum + item.dec, 0)
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
  const sisaPagu = pagu - grandTotal;

  const getMonthClass = (month: keyof typeof totalByMonth): string => {
    const total = totalByMonth[month];
    if (total === 0) return 'belum-isi';
    return '';
  };

  const renderItemField = (item: RPDItem, field: keyof RPDItem) => {
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
      return <span>{formatCurrency(item.total)}</span>;
    }
    
    // For month fields
    return isEditing ? (
      <Input 
        type="number"
        value={item[field] as number} 
        onChange={(e) => handleEditChange(item.id, field, e.target.value)}
        className="w-full text-right"
        min="0"
      />
    ) : (
      <span>{formatCurrency(item[field] as number, false)}</span>
    );
  };

  if (isLoading) {
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
                </tr>
              ))
            )}

            <tr className="bg-gray-50 h-9">
              <td className="py-1 px-1 text-center">{items.length + 1}</td>
              <td className="description-cell py-1 px-1">
                <Input 
                  placeholder="Tambah Uraian Baru" 
                  value={newItem.uraian} 
                  onChange={(e) => setNewItem({...newItem, uraian: e.target.value})}
                  required
                  className="h-7 text-xs"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.jan || ''} 
                  onChange={(e) => setNewItem({...newItem, jan: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.feb || ''} 
                  onChange={(e) => setNewItem({...newItem, feb: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.mar || ''} 
                  onChange={(e) => setNewItem({...newItem, mar: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.apr || ''} 
                  onChange={(e) => setNewItem({...newItem, apr: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.mei || ''} 
                  onChange={(e) => setNewItem({...newItem, mei: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.jun || ''} 
                  onChange={(e) => setNewItem({...newItem, jun: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.jul || ''} 
                  onChange={(e) => setNewItem({...newItem, jul: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.aug || ''} 
                  onChange={(e) => setNewItem({...newItem, aug: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.sep || ''} 
                  onChange={(e) => setNewItem({...newItem, sep: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.oct || ''} 
                  onChange={(e) => setNewItem({...newItem, oct: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.nov || ''} 
                  onChange={(e) => setNewItem({...newItem, nov: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="month-cell py-1 px-1">
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.dec || ''} 
                  onChange={(e) => setNewItem({...newItem, dec: Number(e.target.value)})}
                  min="0"
                  required
                  className="h-7 text-xs text-right"
                />
              </td>
              <td className="total-cell py-1 px-1">
                {formatCurrency(calculateTotal(newItem))}
              </td>
              <td className="action-cell py-1 px-1">
                <Button 
                  onClick={handleAddItem} 
                  size="sm" 
                  className="w-full h-7 text-xs"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Tambah
                </Button>
              </td>
            </tr>
            
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
