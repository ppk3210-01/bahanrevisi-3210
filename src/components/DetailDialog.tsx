
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BudgetItem | null;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ open, onOpenChange, item }) => {
  // If item is null, render a simplified dialog
  if (!item) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Detail Item Anggaran</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-500">
            Tidak ada data item yang dipilih.
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Calculate % change
  const percentChange = item.jumlahSemula > 0 
    ? ((item.jumlahMenjadi - item.jumlahSemula) / item.jumlahSemula * 100).toFixed(2) 
    : '0';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Detail Item Anggaran</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold border-b pb-2">{item.uraian}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Data Semula</h4>
                <div className="grid grid-cols-[120px_1fr] gap-y-2">
                  <span className="text-sm text-gray-600">Volume:</span>
                  <span className="text-sm font-medium">{item.volumeSemula} {item.satuanSemula}</span>
                  
                  <span className="text-sm text-gray-600">Harga Satuan:</span>
                  <span className="text-sm font-medium">{formatCurrency(item.hargaSatuanSemula)}</span>
                  
                  <span className="text-sm text-gray-600">Jumlah:</span>
                  <span className="text-sm font-medium">{formatCurrency(item.jumlahSemula)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-semibold text-blue-700 mb-1">Data Menjadi</h4>
                <div className="grid grid-cols-[120px_1fr] gap-y-2">
                  <span className="text-sm text-gray-600">Volume:</span>
                  <span className="text-sm font-medium">{item.volumeMenjadi} {item.satuanMenjadi}</span>
                  
                  <span className="text-sm text-gray-600">Harga Satuan:</span>
                  <span className="text-sm font-medium">{formatCurrency(item.hargaSatuanMenjadi)}</span>
                  
                  <span className="text-sm text-gray-600">Jumlah:</span>
                  <span className="text-sm font-medium">{formatCurrency(item.jumlahMenjadi)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`border rounded-md p-4 ${item.selisih !== 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
            <h4 className="font-semibold mb-2">Perubahan</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Selisih:</span>
                <span className={`ml-2 font-medium ${item.selisih > 0 ? 'text-green-600' : item.selisih < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(item.selisih)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Persentase:</span>
                <span className={`ml-2 font-medium ${Number(percentChange) > 0 ? 'text-green-600' : Number(percentChange) < 0 ? 'text-red-600' : ''}`}>
                  {percentChange}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Komponen Output</h4>
              <p className="text-sm font-medium">{item.komponenOutput}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Sub Komponen</h4>
              <p className="text-sm font-medium">{item.subKomponen || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Akun</h4>
              <p className="text-sm font-medium">{item.akun || '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Program Pembebanan</h4>
              <p className="text-sm font-medium">{item.programPembebanan || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Kegiatan</h4>
              <p className="text-sm font-medium">{item.kegiatan || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Rincian Output</h4>
              <p className="text-sm font-medium">{item.rincianOutput || '-'}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              item.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {item.isApproved ? 'Disetujui' : 'Belum Disetujui'}
            </div>
            
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 ${
              item.status === 'new' ? 'bg-blue-100 text-blue-800' : 
              item.status === 'changed' ? 'bg-yellow-100 text-yellow-800' : ''
            }`}>
              {item.status === 'new' ? 'Baru' :
              item.status === 'changed' ? 'Diubah' : ''}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;
