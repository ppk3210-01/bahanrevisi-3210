import React, { useState } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
import DetailDialog from '@/components/DetailDialog';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface BudgetTableProps {
  items: BudgetItem[];
  komponenOutput: string;
  subKomponen: string;
  akun: string;
  onAdd: (item: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>) => Promise<void>;
  onUpdate: (id: string, changes: Partial<BudgetItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  isLoading: boolean;
  areFiltersComplete: boolean;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ 
  items, 
  komponenOutput,
  subKomponen,
  akun,
  onAdd,
  onUpdate,
  onDelete,
  onApprove,
  onReject,
  isLoading,
  areFiltersComplete
}) => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const { user, profile } = useAuth();
  const { canEditItems, canApproveBudgetItems, canDeleteItems, canEditUraian } = usePermissions();
  
  const handleOpenDetailDialog = (item: BudgetItem) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedItem(null);
  };
  
  const handleAddItem = async () => {
    if (!areFiltersComplete) {
      alert("Please select all filter options before adding an item.");
      return;
    }
    
    const newItem: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'> = {
      uraian: 'Uraian Baru',
      volumeSemula: 0,
      satuanSemula: 'Paket',
      hargaSatuanSemula: 0,
      volumeMenjadi: 0,
      satuanMenjadi: 'Paket',
      hargaSatuanMenjadi: 0,
      komponenOutput: komponenOutput,
      programPembebanan: '',
      kegiatan: '',
      rincianOutput: '',
      subKomponen: subKomponen,
      akun: akun,
      isApproved: false
    };
    
    await onAdd(newItem);
  };
  
  const handleUpdateItem = async (id: string, changes: Partial<BudgetItem>) => {
    await onUpdate(id, changes);
  };
  
  const handleDeleteItem = async (id: string) => {
    await onDelete(id);
  };
  
  const handleApproveItem = async (id: string) => {
    await onApprove(id);
  };
  
  const handleRejectItem = async (id: string) => {
    await onReject(id);
  };
  
  const formatPembebananCode = (item: BudgetItem) => {
    if (!item.komponenOutput || !item.subKomponen || !item.akun) return '-';
    return `${item.komponenOutput}.${item.subKomponen}.A.${item.akun}`;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pembebanan</TableHead>
            <TableHead className="w-[400px]">Uraian</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead className="text-right">Harga Satuan</TableHead>
            <TableHead className="text-right">Jumlah Semula</TableHead>
            <TableHead className="text-right">Jumlah Menjadi</TableHead>
            <TableHead className="text-right">Selisih</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Memuat data...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Tidak ada data.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{formatPembebananCode(item)}</TableCell>
                <TableCell className="break-words">{item.uraian}</TableCell>
                <TableCell>{item.volumeMenjadi}</TableCell>
                <TableCell>{item.satuanMenjadi}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.selisih)}</TableCell>
                <TableCell className="text-center">{item.status}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenDetailDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {canApproveBudgetItems() && !item.isApproved && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleApproveItem(item.id)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    
                    {canApproveBudgetItems() && item.isApproved && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRejectItem(item.id)}
                      >
                        <XCircle className="h-4 w-4 text-orange-500" />
                      </Button>
                    )}
                    
                    {canDeleteItems(item.createdBy === user?.id, item.isApproved) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Button 
        onClick={handleAddItem} 
        disabled={isLoading || !areFiltersComplete}
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Tambah Item
      </Button>
      
      <DetailDialog 
        open={detailDialogOpen}
        onOpenChange={handleCloseDetailDialog}
        item={selectedItem}
        onUpdate={handleUpdateItem}
        canEditUraian={canEditUraian(selectedItem?.createdBy === user?.id)}
        canEditItems={canEditItems({
          programPembebanan: selectedItem?.programPembebanan || 'all',
          kegiatan: selectedItem?.kegiatan || 'all',
          rincianOutput: selectedItem?.rincianOutput || 'all',
          komponenOutput: selectedItem?.komponenOutput || 'all',
          subKomponen: selectedItem?.subKomponen || 'all',
          akun: selectedItem?.akun || 'all'
        })}
      />
    </div>
  );
};

export default BudgetTable;
