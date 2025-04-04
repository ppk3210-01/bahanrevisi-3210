
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
import { FileText, FileSpreadsheet } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface SummaryDialogProps {
  items: BudgetItem[];
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ items }) => {
  // Extract changed, new, and deleted items
  const changedItems = items.filter(item => item.status === 'changed');
  const newItems = items.filter(item => item.status === 'new');
  const deletedItems = items.filter(item => item.status === 'deleted');
  
  // Calculate totals
  const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const totalSelisih = roundToThousands(totalMenjadi - totalSemula);

  // Determine color class for the summary section
  const getSummaryColorClass = () => {
    if (totalSelisih === 0) return "bg-green-50 text-green-800";
    return "bg-red-100 text-red-800"; // For both positive and negative selisih
  };

  // Function to export summary to Excel
  const exportSummaryToExcel = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Peringatan",
        description: "Tidak ada data untuk diekspor"
      });
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      
      // Sheet 1: Changed Items
      if (changedItems.length > 0) {
        const changedData = changedItems.map((item, index) => ({
          'No': index + 1,
          'Uraian': item.uraian,
          'Pembebanan': item.komponenOutput,
          'Sub Komponen': item.subKomponen || '-',
          'Akun': item.akun || '-',
          'Volume Semula': item.volumeSemula,
          'Satuan Semula': item.satuanSemula,
          'Harga Satuan Semula': item.hargaSatuanSemula,
          'Jumlah Semula': roundToThousands(item.jumlahSemula),
          'Volume Menjadi': item.volumeMenjadi,
          'Satuan Menjadi': item.satuanMenjadi,
          'Harga Satuan Menjadi': item.hargaSatuanMenjadi,
          'Jumlah Menjadi': roundToThousands(item.jumlahMenjadi),
          'Selisih': roundToThousands(item.selisih)
        }));
        
        const changedWs = XLSX.utils.json_to_sheet(changedData);
        XLSX.utils.book_append_sheet(workbook, changedWs, "Item Diubah");
      }
      
      // Sheet 2: New Items
      if (newItems.length > 0) {
        const newData = newItems.map((item, index) => ({
          'No': index + 1,
          'Uraian': item.uraian,
          'Pembebanan': item.komponenOutput,
          'Sub Komponen': item.subKomponen || '-',
          'Akun': item.akun || '-',
          'Volume': item.volumeMenjadi,
          'Satuan': item.satuanMenjadi,
          'Harga Satuan': item.hargaSatuanMenjadi,
          'Jumlah': roundToThousands(item.jumlahMenjadi)
        }));
        
        const newWs = XLSX.utils.json_to_sheet(newData);
        XLSX.utils.book_append_sheet(workbook, newWs, "Item Baru");
      }
      
      // Sheet 3: Deleted Items
      if (deletedItems.length > 0) {
        const deletedData = deletedItems.map((item, index) => ({
          'No': index + 1,
          'Uraian': item.uraian,
          'Pembebanan': item.komponenOutput,
          'Sub Komponen': item.subKomponen || '-',
          'Akun': item.akun || '-',
          'Volume': item.volumeSemula,
          'Satuan': item.satuanSemula,
          'Harga Satuan': item.hargaSatuanSemula,
          'Jumlah': roundToThousands(item.jumlahSemula)
        }));
        
        const deletedWs = XLSX.utils.json_to_sheet(deletedData);
        XLSX.utils.book_append_sheet(workbook, deletedWs, "Item Dihapus");
      }
      
      // Sheet 4: Summary
      const summaryData = [
        { 'Keterangan': 'Total Semula', 'Nilai': totalSemula },
        { 'Keterangan': 'Total Menjadi', 'Nilai': totalMenjadi },
        { 'Keterangan': 'Selisih', 'Nilai': totalSelisih }
      ];
      
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWs, "Ringkasan");
      
      // Generate file name and save
      const fileName = `Ringkasan_Perubahan_Anggaran_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Berhasil!",
        description: "Berhasil mengunduh ringkasan perubahan anggaran"
      });
    } catch (error) {
      console.error('Error exporting summary to Excel:', error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal mengunduh file. Silakan coba lagi."
      });
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Lihat Ringkasan Perubahan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ringkasan Perubahan Anggaran</DialogTitle>
          <DialogDescription className="flex justify-between items-center">
            <span>Berikut adalah daftar perubahan anggaran yang telah dilakukan</span>
            <Button variant="outline" size="sm" onClick={exportSummaryToExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Changed items section */}
          {changedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Rincian Yang Diubah</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Uraian</th>
                      <th className="border p-2 text-left">Pembebanan</th>
                      <th className="border p-2 text-left">Sub Komponen</th>
                      <th className="border p-2 text-left">Akun</th>
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
                        <td className="border p-2 text-left">{item.komponenOutput}</td>
                        <td className="border p-2 text-left">{item.subKomponen || '-'}</td>
                        <td className="border p-2 text-left">{item.akun || '-'}</td>
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
                        <td className="border p-2 text-right">{formatCurrency(roundToThousands(item.jumlahSemula))}</td>
                        <td className="border p-2 text-right">{formatCurrency(roundToThousands(item.jumlahMenjadi))}</td>
                        <td className="border p-2 text-right">{formatCurrency(roundToThousands(item.selisih))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* New items section */}
          {newItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-600">Rincian Baru</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Uraian</th>
                      <th className="border p-2 text-left">Pembebanan</th>
                      <th className="border p-2 text-left">Sub Komponen</th>
                      <th className="border p-2 text-left">Akun</th>
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
                        <td className="border p-2 text-left">{item.komponenOutput}</td>
                        <td className="border p-2 text-left">{item.subKomponen || '-'}</td>
                        <td className="border p-2 text-left">{item.akun || '-'}</td>
                        <td className="border p-2 text-left">{item.volumeMenjadi}</td>
                        <td className="border p-2 text-left">{item.satuanMenjadi}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.hargaSatuanMenjadi)}</td>
                        <td className="border p-2 text-right">{formatCurrency(roundToThousands(item.jumlahMenjadi))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Deleted items section */}
          {deletedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Rincian Yang Dihapus</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Uraian</th>
                      <th className="border p-2 text-left">Pembebanan</th>
                      <th className="border p-2 text-left">Sub Komponen</th>
                      <th className="border p-2 text-left">Akun</th>
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
                        <td className="border p-2 text-left">{item.komponenOutput}</td>
                        <td className="border p-2 text-left">{item.subKomponen || '-'}</td>
                        <td className="border p-2 text-left">{item.akun || '-'}</td>
                        <td className="border p-2 text-left">{item.volumeSemula}</td>
                        <td className="border p-2 text-left">{item.satuanSemula}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.hargaSatuanSemula)}</td>
                        <td className="border p-2 text-right">{formatCurrency(roundToThousands(item.jumlahSemula))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Summary section */}
          <div className={`p-4 rounded-md ${getSummaryColorClass()}`}>
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
                <span className="font-semibold">
                  {formatCurrency(totalSelisih)}
                </span>
              </div>
            </div>
            
            {/* Warning message */}
            {totalSelisih !== 0 && (
              <div className="p-3 mt-4 rounded-md font-semibold">
                {totalSelisih > 0 
                  ? `Terdapat penambahan anggaran sebesar ${formatCurrency(totalSelisih)}`
                  : `Terdapat pengurangan anggaran sebesar ${formatCurrency(Math.abs(totalSelisih))}`
                }
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
