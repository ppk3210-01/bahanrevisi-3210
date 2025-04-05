
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Trash2, FileEdit, Check, ChevronUp, ChevronDown } from 'lucide-react';
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
import TablePagination from './TablePagination';
import BudgetItemDetails from './BudgetItemDetails';

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

interface SortConfig {
  key: keyof BudgetItem | null;
  direction: 'asc' | 'desc';
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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Sort items based on sort config
  const sortedItems = useMemo(() => {
    let itemsToSort = [...items];
    if (sortConfig.key) {
      itemsToSort.sort((a, b) => {
        if (a[sortConfig.key!] === null) return 1;
        if (b[sortConfig.key!] === null) return -1;
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return itemsToSort;
  }, [items, sortConfig]);

  // Get paginated items
  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return sortedItems;
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  // Handle sorting
  const requestSort = (key: keyof BudgetItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof BudgetItem) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

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
    toast.success('Perubahan berhasil disimpan');
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
        toast.error('Nilai tidak boleh negatif');
        return;
      }
    }
    
    onUpdate(id, { [field]: value });
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
        const selisihValue = item.jumlahSemula - item.jumlahMenjadi;
        return <span className={selisihValue > 0 ? 'text-green-600' : selisihValue < 0 ? 'text-red-600' : ''}>
          {formatCurrency(selisihValue)}
        </span>;
      
      default:
        return <span>{String(item[field])}</span>;
    }
  };

  const totalSemula = paginatedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = paginatedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalSemula - totalMenjadi;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading budget data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-gray-200">
        {komponenOutput && (
          <div className="bg-purple-500 p-4 border-b border-gray-200 text-white">
            <h3 className="font-medium">Komponen Output: {komponenOutput}</h3>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>No</th>
                <th className="uraian-cell">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort('uraian')}>
                    Uraian {getSortIcon('uraian')}
                  </div>
                </th>
                <th className="number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('volumeSemula')}>
                    Volume Semula {getSortIcon('volumeSemula')}
                  </div>
                </th>
                <th className="unit-cell">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort('satuanSemula')}>
                    Satuan Semula {getSortIcon('satuanSemula')}
                  </div>
                </th>
                <th className="number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('hargaSatuanSemula')}>
                    Harga Satuan Semula {getSortIcon('hargaSatuanSemula')}
                  </div>
                </th>
                <th className="number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('jumlahSemula')}>
                    Jumlah Semula {getSortIcon('jumlahSemula')}
                  </div>
                </th>
                <th className="border-l-2 number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('volumeMenjadi')}>
                    Volume Menjadi {getSortIcon('volumeMenjadi')}
                  </div>
                </th>
                <th className="unit-cell">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort('satuanMenjadi')}>
                    Satuan Menjadi {getSortIcon('satuanMenjadi')}
                  </div>
                </th>
                <th className="number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('hargaSatuanMenjadi')}>
                    Harga Satuan Menjadi {getSortIcon('hargaSatuanMenjadi')}
                  </div>
                </th>
                <th className="number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('jumlahMenjadi')}>
                    Jumlah Menjadi {getSortIcon('jumlahMenjadi')}
                  </div>
                </th>
                <th className="number-cell">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort('selisih')}>
                    Selisih {getSortIcon('selisih')}
                  </div>
                </th>
                <th>PPK</th>
                <th>Aksi</th>
              </tr>
            </thead>
            
            <tbody>
              {paginatedItems.map((item, index) => (
                <tr key={item.id} className={getRowStyle(item.status)}>
                  <td>{((currentPage - 1) * (pageSize === -1 ? 0 : pageSize)) + index + 1}</td>
                  <td className="uraian-cell">{renderItemField(item, 'uraian')}</td>
                  <td className="number-cell">{renderItemField(item, 'volumeSemula')}</td>
                  <td className="unit-cell">{renderItemField(item, 'satuanSemula')}</td>
                  <td className="number-cell">{renderItemField(item, 'hargaSatuanSemula')}</td>
                  <td className="number-cell">{renderItemField(item, 'jumlahSemula')}</td>
                  <td className="border-l-2 number-cell">{renderItemField(item, 'volumeMenjadi')}</td>
                  <td className="unit-cell">{renderItemField(item, 'satuanMenjadi')}</td>
                  <td className="number-cell">{renderItemField(item, 'hargaSatuanMenjadi')}</td>
                  <td className="number-cell">{renderItemField(item, 'jumlahMenjadi')}</td>
                  <td className="number-cell">{renderItemField(item, 'selisih')}</td>
                  <td className="text-center">
                    {item.isApproved && (
                      <span className="text-green-600">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex space-x-1">
                      <BudgetItemDetails item={item} />
                      
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
                    </div>
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-50">
                <td>{paginatedItems.length + 1}</td>
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
                <td className="border-l-2 number-cell">
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
                <td></td>
                <td>
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
                <td colSpan={5} className="text-right">Total:</td>
                <td className="number-cell">{formatCurrency(totalSemula)}</td>
                <td colSpan={3}></td>
                <td className="number-cell">{formatCurrency(totalMenjadi)}</td>
                <td className="number-cell">{formatCurrency(totalSelisih)}</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {items.length > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default BudgetTable;
