
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BudgetItem } from '@/types/budget';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface BudgetItemRowProps {
  item: BudgetItem;
  showKomponen: boolean;
  showSubKomponen: boolean;
  showAkun: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isAdmin: boolean;
}

const BudgetItemRow: React.FC<BudgetItemRowProps> = ({
  item,
  showKomponen,
  showSubKomponen,
  showAkun,
  onDelete,
  onEdit,
  onApprove,
  onReject,
  isAdmin
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusClassName = () => {
    switch (item.status) {
      case 'new':
        return 'bg-green-50';
      case 'deleted':
        return 'bg-red-50';
      case 'changed':
        return 'bg-yellow-50';
      default:
        return '';
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
  };

  return (
    <>
      <TableRow className={`text-sm border-b ${getStatusClassName()}`}>
        <TableCell className="p-2">
          {item.uraian}
        </TableCell>
        
        {showKomponen && (
          <TableCell className="p-2 whitespace-nowrap">{item.komponenOutput}</TableCell>
        )}
        
        {showSubKomponen && (
          <TableCell className="p-2 whitespace-nowrap">{item.subKomponen}</TableCell>
        )}
        
        {showAkun && (
          <TableCell className="p-2 whitespace-nowrap">{item.akun}</TableCell>
        )}
        
        <TableCell className="p-2 text-right">{formatCurrency(item.volumeSemula)}</TableCell>
        <TableCell className="p-2">{item.satuanSemula}</TableCell>
        <TableCell className="p-2 text-right">{formatCurrency(item.hargaSatuanSemula)}</TableCell>
        <TableCell className="p-2 text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
        
        <TableCell className="p-2 text-right">{formatCurrency(item.volumeMenjadi)}</TableCell>
        <TableCell className="p-2">{item.satuanMenjadi}</TableCell>
        <TableCell className="p-2 text-right">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
        <TableCell className="p-2 text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
        
        <TableCell className={`p-2 text-right ${item.selisih > 0 ? 'text-green-600' : item.selisih < 0 ? 'text-red-600' : ''}`}>
          {formatCurrency(item.selisih)}
        </TableCell>
        
        <TableCell className="p-2 flex space-x-1 justify-center">
          {(item.status === 'new' || item.status === 'changed') && isAdmin && (
            <>
              <Button
                size="xs" 
                variant="ghost"
                onClick={() => onApprove(item.id)}
                className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              
              <Button
                size="xs" 
                variant="ghost"
                onClick={() => onReject(item.id)}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button
            size="xs" 
            variant="ghost"
            onClick={() => onEdit(item.id)}
            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            size="xs" 
            variant="ghost"
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
      
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        description={`Apakah Anda yakin ingin menghapus item "${item.uraian}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </>
  );
};

export default BudgetItemRow;
