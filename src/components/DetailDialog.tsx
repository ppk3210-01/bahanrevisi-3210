
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/budgetCalculations';
import { BudgetItem } from '@/types/budget';

export interface DetailDialogProps {
  open: boolean;
  onOpenChange: () => void;
  item: BudgetItem | null;
  onUpdate: (id: string, changes: Partial<BudgetItem>) => Promise<void>;
  canEditUraian: boolean;
  canEditItems: boolean;
}

const DetailDialog: React.FC<DetailDialogProps> = ({
  open,
  onOpenChange,
  item,
  onUpdate,
  canEditUraian,
  canEditItems
}) => {
  // Initialize local state for the item being edited
  const [editedItem, setEditedItem] = useState<Partial<BudgetItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset the edited item when the dialog opens or the item changes
  React.useEffect(() => {
    if (item) {
      setEditedItem({});
    }
  }, [item, open]);
  
  if (!item) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    // Parse numeric values
    if (name === 'volumeSemula' || name === 'volumeMenjadi' || name === 'hargaSatuanSemula' || name === 'hargaSatuanMenjadi') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setEditedItem(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item?.id || Object.keys(editedItem).length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate(item.id, editedItem);
      onOpenChange();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculateJumlah = (volume: number, hargaSatuan: number) => {
    return volume * hargaSatuan;
  };
  
  // Calculate displayed values
  const displayVolumeSemula = editedItem.volumeSemula !== undefined ? editedItem.volumeSemula : item.volumeSemula;
  const displayHargaSatuanSemula = editedItem.hargaSatuanSemula !== undefined ? editedItem.hargaSatuanSemula : item.hargaSatuanSemula;
  const displayJumlahSemula = calculateJumlah(displayVolumeSemula, displayHargaSatuanSemula);
  
  const displayVolumeMenjadi = editedItem.volumeMenjadi !== undefined ? editedItem.volumeMenjadi : item.volumeMenjadi;
  const displayHargaSatuanMenjadi = editedItem.hargaSatuanMenjadi !== undefined ? editedItem.hargaSatuanMenjadi : item.hargaSatuanMenjadi;
  const displayJumlahMenjadi = calculateJumlah(displayVolumeMenjadi, displayHargaSatuanMenjadi);
  
  const displaySelisih = displayJumlahMenjadi - displayJumlahSemula;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Anggaran</DialogTitle>
          <DialogDescription>
            Lihat dan ubah detail item anggaran.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="uraian" className="text-right">
                Uraian
              </Label>
              <Input
                id="uraian"
                name="uraian"
                defaultValue={item.uraian}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={!canEditUraian}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 pt-3">
              <h3 className="text-sm font-medium">Anggaran Semula</h3>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="volumeSemula" className="text-right">
                  Volume
                </Label>
                <Input
                  id="volumeSemula"
                  name="volumeSemula"
                  type="number"
                  defaultValue={item.volumeSemula}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!canEditItems}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="satuanSemula" className="text-right">
                  Satuan
                </Label>
                <Input
                  id="satuanSemula"
                  name="satuanSemula"
                  defaultValue={item.satuanSemula}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!canEditItems}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hargaSatuanSemula" className="text-right">
                  Harga Satuan
                </Label>
                <Input
                  id="hargaSatuanSemula"
                  name="hargaSatuanSemula"
                  type="number"
                  defaultValue={item.hargaSatuanSemula}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!canEditItems}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jumlahSemula" className="text-right">
                  Jumlah
                </Label>
                <div className="col-span-3 p-2 bg-gray-100 rounded">
                  {formatCurrency(displayJumlahSemula)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pt-3">
              <h3 className="text-sm font-medium">Anggaran Menjadi</h3>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="volumeMenjadi" className="text-right">
                  Volume
                </Label>
                <Input
                  id="volumeMenjadi"
                  name="volumeMenjadi"
                  type="number"
                  defaultValue={item.volumeMenjadi}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!canEditItems}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="satuanMenjadi" className="text-right">
                  Satuan
                </Label>
                <Input
                  id="satuanMenjadi"
                  name="satuanMenjadi"
                  defaultValue={item.satuanMenjadi}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!canEditItems}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hargaSatuanMenjadi" className="text-right">
                  Harga Satuan
                </Label>
                <Input
                  id="hargaSatuanMenjadi"
                  name="hargaSatuanMenjadi"
                  type="number"
                  defaultValue={item.hargaSatuanMenjadi}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!canEditItems}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jumlahMenjadi" className="text-right">
                  Jumlah
                </Label>
                <div className="col-span-3 p-2 bg-gray-100 rounded">
                  {formatCurrency(displayJumlahMenjadi)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4 pt-3">
              <Label htmlFor="selisih" className="text-right">
                Selisih
              </Label>
              <div className={`col-span-3 p-2 rounded ${displaySelisih > 0 ? 'bg-green-100' : displaySelisih < 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                {formatCurrency(displaySelisih)}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3 p-2 bg-gray-100 rounded">
                {item.status}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onOpenChange}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || Object.keys(editedItem).length === 0 || !canEditItems}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;
