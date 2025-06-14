
import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
import { Button } from "@/components/ui/button";
import { Edit, Check, Trash2, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import useBudgetData from '@/hooks/useBudgetData';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface BudgetTableProps {
  items: BudgetItem[];
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
  onAdd?: (item: Omit<BudgetItem, "id" | "jumlahSemula" | "jumlahMenjadi" | "selisih" | "status">) => Promise<BudgetItem>;
  onUpdate?: (id: string, updates: Partial<BudgetItem>) => Promise<BudgetItem>;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
  areFiltersComplete?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  onDeleteItem?: (id: string) => void;
  onApproveItem?: (id: string) => void;
  onRejectItem?: (id: string) => void;
}

interface EditValues {
  uraian?: string;
  volumeSemula?: number;
  satuanSemula?: string;
  hargaSatuanSemula?: number;
  volumeMenjadi?: number;
  satuanMenjadi?: string;
  hargaSatuanMenjadi?: number;
  sisaAnggaran?: number;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'new':
      return 'secondary';
    case 'changed':
      return 'destructive';
    case 'unchanged':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'new':
      return 'Baru';
    case 'changed':
      return 'Diubah';
    case 'unchanged':
      return 'Sesuai';
    default:
      return 'Default';
  }
};

export const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  currentPage = 1,
  itemsPerPage = 10,
  onDeleteItem,
  onApproveItem,
  onRejectItem
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({});
  const { updateBudgetItem } = useBudgetData({
    programPembebanan: 'all',
    kegiatan: 'all',
    rincianOutput: 'all',
    komponenOutput: 'all',
    subKomponen: 'all',
    akun: 'all'
  });
  const { isAdmin } = useAuth();

  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (item: BudgetItem) => {
    setIsEditing(item.id);
    setEditValues({
      uraian: item.uraian,
      volumeSemula: item.volumeSemula,
      satuanSemula: item.satuanSemula,
      hargaSatuanSemula: item.hargaSatuanSemula,
      volumeMenjadi: item.volumeMenjadi,
      satuanMenjadi: item.satuanMenjadi,
      hargaSatuanMenjadi: item.hargaSatuanMenjadi,
      sisaAnggaran: item.sisaAnggaran
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditValues({});
  };

  const handleSave = async (id: string) => {
    try {
      if (!editValues.volumeSemula || !editValues.hargaSatuanSemula || !editValues.volumeMenjadi || !editValues.hargaSatuanMenjadi) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Volume dan Harga Satuan harus diisi."
        });
        return;
      }
      
      await updateBudgetItem(id, editValues);
      setIsEditing(null);
      setEditValues({});
      toast({
        title: "Berhasil",
        description: "Item anggaran berhasil diperbarui."
      });
    } catch (error) {
      console.error("Error updating budget item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui item anggaran."
      });
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[50px] text-center">No</TableHead>
            <TableHead className="w-[300px]">Uraian</TableHead>
            <TableHead className="w-[80px] text-center">Vol Semula</TableHead>
            <TableHead className="w-[80px] text-center">Satuan Semula</TableHead>
            <TableHead className="w-[120px] text-center">Harga Satuan Semula</TableHead>
            <TableHead className="w-[120px] text-center">Jumlah Semula</TableHead>
            <TableHead className="w-[80px] text-center">Vol Menjadi</TableHead>
            <TableHead className="w-[80px] text-center">Satuan Menjadi</TableHead>
            <TableHead className="w-[120px] text-center">Harga Satuan Menjadi</TableHead>
            <TableHead className="w-[120px] text-center">Jumlah Menjadi</TableHead>
            <TableHead className="w-[120px] text-center">Sisa Anggaran</TableHead>
            <TableHead className="w-[120px] text-center">Selisih</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            {isAdmin && <TableHead className="w-[120px] text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((item, index) => (
            <TableRow key={item.id} className="h-12">
              <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
              <TableCell className="max-w-[300px]">
                <div className="truncate" title={item.uraian}>
                  {isEditing === item.id ? (
                    <Input
                      value={editValues.uraian || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, uraian: e.target.value }))}
                      className="w-full"
                    />
                  ) : (
                    item.uraian
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {isEditing === item.id ? (
                  <Input
                    type="number"
                    value={editValues.volumeSemula?.toString() || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, volumeSemula: parseFloat(e.target.value) || 0 }))}
                    className="w-full"
                  />
                ) : (
                  item.volumeSemula
                )}
              </TableCell>
              <TableCell className="text-center">
                {isEditing === item.id ? (
                  <Input
                    value={editValues.satuanSemula || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, satuanSemula: e.target.value }))}
                    className="w-full"
                  />
                ) : (
                  item.satuanSemula
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing === item.id ? (
                  <Input
                    type="number"
                    value={editValues.hargaSatuanSemula?.toString() || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, hargaSatuanSemula: parseFloat(e.target.value) || 0 }))}
                    className="w-full"
                  />
                ) : (
                  formatCurrency(item.hargaSatuanSemula)
                )}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
              <TableCell className="text-center">
                {isEditing === item.id ? (
                  <Input
                    type="number"
                    value={editValues.volumeMenjadi?.toString() || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, volumeMenjadi: parseFloat(e.target.value) || 0 }))}
                    className="w-full"
                  />
                ) : (
                  item.volumeMenjadi
                )}
              </TableCell>
              <TableCell className="text-center">
                {isEditing === item.id ? (
                  <Input
                    value={editValues.satuanMenjadi || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, satuanMenjadi: e.target.value }))}
                    className="w-full"
                  />
                ) : (
                  item.satuanMenjadi
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing === item.id ? (
                  <Input
                    type="number"
                    value={editValues.hargaSatuanMenjadi?.toString() || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, hargaSatuanMenjadi: parseFloat(e.target.value) || 0 }))}
                    className="w-full"
                  />
                ) : (
                  formatCurrency(item.hargaSatuanMenjadi)
                )}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
              <TableCell className="text-right">
                {isEditing === item.id ? (
                  <Input
                    type="number"
                    value={editValues.sisaAnggaran?.toString() || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, sisaAnggaran: parseFloat(e.target.value) || 0 }))}
                    className="w-full"
                  />
                ) : (
                  formatCurrency(item.sisaAnggaran || 0)
                )}
              </TableCell>
              <TableCell className={`text-right ${item.selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(item.selisih)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(item.status)} className="text-xs">
                  {getStatusText(item.status)}
                </Badge>
              </TableCell>
              {isAdmin && (
                <TableCell className="text-center">
                  {isEditing === item.id ? (
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleSave(item.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteItem?.(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {!item.isApproved && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => onApproveItem?.(item.id)}>
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onRejectItem?.(item.id)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Also export as default to fix the import in BudgetComparison.tsx
export default BudgetTable;
