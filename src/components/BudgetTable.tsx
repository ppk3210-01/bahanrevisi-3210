
import React, { useState } from 'react';
import { PlusCircle, Trash2, FileEdit, Check } from 'lucide-react';
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
import { getRowStyle, formatCurrency } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';

interface BudgetTableProps {
  items: BudgetItem[];
  komponenOutput: string;
  onAdd: (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => void;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  isLoading: boolean;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  komponenOutput,
  onAdd,
  onUpdate,
  onDelete,
  onApprove,
  isLoading
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
    komponenOutput: komponenOutput
  });

  const validateItem = (item: Partial<BudgetItem>): boolean => {
    // Check if all required fields are filled
    if (!item.uraian || item.uraian.trim() === '') {
      toast.error('Uraian harus diisi');
      return false;
    }
    
    // Check for negative values
    if ((item.volumeSemula && item.volumeSemula < 0) || 
        (item.hargaSatuanSemula && item.hargaSatuanSemula < 0) ||
        (item.volumeMenjadi && item.volumeMenjadi < 0) ||
        (item.hargaSatuanMenjadi && item.hargaSatuanMenjadi < 0)) {
      toast.error('Nilai volume dan harga satuan tidak boleh negatif');
      return false;
    }
    
    // Check if all numeric fields are filled
    if (item.volumeSemula === undefined || item.volumeSemula === null || 
        item.hargaSatuanSemula === undefined || item.hargaSatuanSemula === null ||
        item.volumeMenjadi === undefined || item.volumeMenjadi === null ||
        item.hargaSatuanMenjadi === undefined || item.hargaSatuanMenjadi === null) {
      toast.error('Semua kolom harus diisi');
      return false;
    }
    
    // Check if satuan is selected
    if (!item.satuanSemula || !item.satuanMenjadi) {
      toast.error('Satuan harus dipilih');
      return false;
    }
    
    return true;
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
        komponenOutput
      });

      toast.success('Item berhasil ditambahkan');
    } catch (error) {
      console.error('Failed to add item:', error);
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
    // For numeric fields, ensure value is non-negative
    if (field === 'volumeSemula' || field === 'hargaSatuanSemula' || 
        field === 'volumeMenjadi' || field === 'hargaSatuanMenjadi') {
      if (typeof value === 'string') {
        const numValue = Number(value.replace(/,/g, ''));
        if (isNaN(numValue)) return;
        value = numValue;
      }
      
      // Prevent negative values
      if (value < 0) {
        toast.error('Nilai tidak boleh negatif');
        return;
      }
    }
    
    onUpdate(id, { [field]: value });
  };

  const renderItemField = (item: BudgetItem, field: keyof BudgetItem) => {
    const isEditing = editingId === item.id;
    
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
          />
        ) : (
          <span>{item.volumeMenjadi}</span>
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
          <span>{item.satuanMenjadi}</span>
        );
      
      case 'hargaSatuanMenjadi':
        return isEditing ? (
          <Input 
            type="number"
            value={item.hargaSatuanMenjadi} 
            onChange={(e) => handleEditChange(item.id, 'hargaSatuanMenjadi', e.target.value)}
            className="w-full"
          />
        ) : (
          <span>{formatCurrency(item.hargaSatuanMenjadi)}</span>
        );
      
      case 'jumlahMenjadi':
        return <span>{formatCurrency(item.jumlahMenjadi)}</span>;
      
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading budget data...</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      {komponenOutput && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-medium">Komponen Output: {komponenOutput}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>No</th>
              <th className="uraian-cell">Uraian</th>
              <th className="number-cell">Volume Semula</th>
              <th className="unit-cell">Satuan Semula</th>
              <th className="number-cell">Harga Satuan Semula</th>
              <th className="number-cell">Jumlah Semula</th>
              <th className="number-cell">Volume Menjadi</th>
              <th className="unit-cell">Satuan Menjadi</th>
              <th className="number-cell">Harga Satuan Menjadi</th>
              <th className="number-cell">Jumlah Menjadi</th>
              <th className="number-cell">Selisih</th>
              <th>Aksi</th>
            </tr>
          </thead>
          
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={getRowStyle(item.status)}>
                <td>{index + 1}</td>
                <td className="uraian-cell">{renderItemField(item, 'uraian')}</td>
                <td className="number-cell">{renderItemField(item, 'volumeSemula')}</td>
                <td className="unit-cell">{renderItemField(item, 'satuanSemula')}</td>
                <td className="number-cell">{renderItemField(item, 'hargaSatuanSemula')}</td>
                <td className="number-cell">{renderItemField(item, 'jumlahSemula')}</td>
                <td className="number-cell">{renderItemField(item, 'volumeMenjadi')}</td>
                <td className="unit-cell">{renderItemField(item, 'satuanMenjadi')}</td>
                <td className="number-cell">{renderItemField(item, 'hargaSatuanMenjadi')}</td>
                <td className="number-cell">{renderItemField(item, 'jumlahMenjadi')}</td>
                <td className="number-cell">{renderItemField(item, 'selisih')}</td>
                <td>
                  <div className="flex space-x-1">
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
                        toast.success('Item berhasil dihapus');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-green-600" 
                      onClick={() => {
                        onApprove(item.id);
                        toast.success('Item disetujui oleh PPK');
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            <tr className="bg-gray-50">
              <td>{items.length + 1}</td>
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
                {formatCurrency((newItem.volumeSemula || 0) * (newItem.hargaSatuanSemula || 0))}
              </td>
              <td className="number-cell">
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
                {formatCurrency((newItem.volumeMenjadi || 0) * (newItem.hargaSatuanMenjadi || 0))}
              </td>
              <td className="number-cell">
                {formatCurrency(
                  ((newItem.volumeMenjadi || 0) * (newItem.hargaSatuanMenjadi || 0)) - 
                  ((newItem.volumeSemula || 0) * (newItem.hargaSatuanSemula || 0))
                )}
              </td>
              <td>
                <Button variant="outline" onClick={handleAddItem}>
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
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {totalSelisih !== 0 && (
        <div className="warning-box m-4">
          ⚠ PERINGATAN:
          Terjadi perbedaan total anggaran sebesar {formatCurrency(totalSelisih)}
        </div>
      )}
    </div>
  );
};

export default BudgetTable;
