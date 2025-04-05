
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';

interface DetailDialogProps {
  item: BudgetItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ item, open, onOpenChange }) => {
  if (!item) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Anggaran</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Uraian</h3>
              <p className="text-base">{item.uraian}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Status</h3>
              <p className="text-base capitalize">{item.status}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Program Pembebanan</h3>
              <p className="text-base">{item.programPembebanan || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Kegiatan</h3>
              <p className="text-base">{item.kegiatan || '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Rincian Output</h3>
              <p className="text-base">{item.rincianOutput || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Komponen Output</h3>
              <p className="text-base">{item.komponenOutput || '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Sub Komponen</h3>
              <p className="text-base">{item.subKomponen || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Akun</h3>
              <p className="text-base">{item.akun || '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Volume Semula</h3>
              <p className="text-base">{item.volumeSemula} {item.satuanSemula}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Harga Satuan Semula</h3>
              <p className="text-base">{formatCurrency(item.hargaSatuanSemula)}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Jumlah Semula</h3>
              <p className="text-base font-semibold">{formatCurrency(item.jumlahSemula)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Volume Menjadi</h3>
              <p className="text-base">{item.volumeMenjadi} {item.satuanMenjadi}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Harga Satuan Menjadi</h3>
              <p className="text-base">{formatCurrency(item.hargaSatuanMenjadi)}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Jumlah Menjadi</h3>
              <p className="text-base font-semibold">{formatCurrency(item.jumlahMenjadi)}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className={`p-3 rounded-lg ${item.selisih !== 0 ? 'bg-red-50' : 'bg-green-50'} w-1/3`}>
              <h3 className="text-sm font-semibold text-gray-500">Selisih</h3>
              <p className={`text-base font-semibold ${item.selisih !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(item.selisih)}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Status Persetujuan</h3>
            <p className="text-base">{item.isApproved ? 'Disetujui' : 'Belum Disetujui'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;
