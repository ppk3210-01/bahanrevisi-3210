import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';

interface SummaryDialogProps {
  items: BudgetItem[];
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ items }) => {
  const changedItems = items.filter(item => item.status === 'changed');
  const newItems = items.filter(item => item.status === 'new');
  const deletedItems = items.filter(item => item.status === 'deleted');
  
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Lihat Ringkasan Perubahan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ringkasan Perubahan Anggaran</DialogTitle>
          <DialogDescription>
            Berikut adalah daftar perubahan anggaran yang telah dilakukan
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {changedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Rincian Yang Diubah</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Uraian</th>
                      <th className="border p-2 text-left">Detail Perubahan</th>
                      <th className="border p-2 text-right">Jumlah Semula</th>
                      <th className="border p-2 text-right">Jumlah Menjadi</th>
                      <th className="border p-2 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border p-2 text-left">{item.uraian}</td>
                        <td className="border p-2 text-left">
                          {item.volumeSemula !== item.volumeMenjadi && (
                            <div>
                              Volume: {item.volumeSemula} {item.satuanSemula} → {item.volumeMenjadi} {item.satuanMenjadi}
                            </div>
                          )}
                          {item.hargaSatuanSemula !== item.hargaSatuanMenjadi && (
                            <div>
                              Harga: {formatCurrency(item.hargaSatuanSemula)} → {formatCurrency(item.hargaSatuanMenjadi)}
                            </div>
                          )}
                          {item.satuanSemula !== item.satuanMenjadi && item.volumeSemula === item.volumeMenjadi && (
                            <div>
                              Satuan: {item.satuanSemula} → {item.satuanMenjadi}
                            </div>
                          )}
                        </td>
                        <td className="border p-2 text-right">{formatCurrency(item.jumlahSemula)}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.jumlahMenjadi)}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.selisih)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {newItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-600">Rincian Baru</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Uraian</th>
                      <th className="border p-2 text-left">Volume</th>
                      <th className="border p-2 text-left">Satuan</th>
                      <th className="border p-2 text-right">Harga Satuan</th>
                      <th className="border p-2 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border p-2 text-left">{item.uraian}</td>
                        <td className="border p-2 text-left">{item.volumeMenjadi}</td>
                        <td className="border p-2 text-left">{item.satuanMenjadi}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.hargaSatuanMenjadi)}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.jumlahMenjadi)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {deletedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Rincian Yang Dihapus</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Uraian</th>
                      <th className="border p-2 text-left">Volume</th>
                      <th className="border p-2 text-left">Satuan</th>
                      <th className="border p-2 text-right">Harga Satuan</th>
                      <th className="border p-2 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border p-2 text-left">{item.uraian}</td>
                        <td className="border p-2 text-left">{item.volumeSemula}</td>
                        <td className="border p-2 text-left">{item.satuanSemula}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.hargaSatuanSemula)}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.jumlahSemula)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Kesimpulan</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Semula:</span>
                <span className="font-semibold">{formatCurrency(totalSemula)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Menjadi:</span>
                <span className="font-semibold">{formatCurrency(totalMenjadi)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Selisih:</span>
                <span className={`font-semibold ${totalSelisih > 0 ? 'text-green-600' : totalSelisih < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(totalSelisih)}
                </span>
              </div>
            </div>
            
            {totalSelisih !== 0 && (
              <div className={`p-3 mt-4 rounded-md ${totalSelisih > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-semibold">
                  {totalSelisih > 0 
                    ? `Terdapat penambahan anggaran sebesar ${formatCurrency(totalSelisih)}`
                    : `Terdapat pengurangan anggaran sebesar ${formatCurrency(Math.abs(totalSelisih))}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
