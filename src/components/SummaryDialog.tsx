
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileBarChart2, FileSpreadsheet } from "lucide-react";
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { BudgetItem } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

interface SummaryDialogProps {
  items: BudgetItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ items, open, onOpenChange }) => {
  // Calculate totals - not filtered by any conditions
  const totalSemula = roundToThousands(items.reduce((sum, item) => sum + item.jumlahSemula, 0));
  const totalMenjadi = roundToThousands(items.reduce((sum, item) => sum + item.jumlahMenjadi, 0));
  const totalSelisih = totalMenjadi - totalSemula; // Changed: Jumlah Menjadi - Jumlah Semula
  
  const changedItems = items.filter(item => item.status === 'changed');
  const newItems = items.filter(item => item.status === 'new');
  const deletedItems = items.filter(item => item.status === 'deleted');
  
  const formatPembebananCode = (item: BudgetItem) => {
    if (!item.komponenOutput || !item.subKomponen || !item.akun) return '-';
    return `${item.komponenOutput}.${item.subKomponen}.A.${item.akun}`;
  };

  const renderDetailPerubahan = (item: BudgetItem) => {
    if (item.volumeSemula !== item.volumeMenjadi) {
      return `Volume: ${item.volumeSemula} → ${item.volumeMenjadi}`;
    }
    if (item.satuanSemula !== item.satuanMenjadi) {
      return `Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}`;
    }
    if (item.hargaSatuanSemula !== item.hargaSatuanMenjadi) {
      return `Harga Satuan: ${formatCurrency(item.hargaSatuanSemula)} → ${formatCurrency(item.hargaSatuanMenjadi)}`;
    }
    return '-';
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      const summaryData = [
        ['Ringkasan Perubahan Pagu Anggaran'],
        [''],
        ['Total Pagu Semula', formatCurrency(totalSemula)],
        ['Total Pagu Menjadi', formatCurrency(totalMenjadi)],
        ['Selisih', formatCurrency(totalSelisih)],
        ['']
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");
      
      if (changedItems.length > 0) {
        const changedData = [
          ['No', 'Pembebanan', 'Uraian', 'Detail Perubahan', 'Jumlah Semula', 'Jumlah Menjadi', 'Selisih']
        ];
        
        changedItems.forEach((item, index) => {
          changedData.push([
            (index + 1).toString(),
            formatPembebananCode(item),
            item.uraian,
            renderDetailPerubahan(item),
            item.jumlahSemula.toString(),
            item.jumlahMenjadi.toString(),
            item.selisih.toString()
          ]);
        });
        
        const changedWs = XLSX.utils.aoa_to_sheet(changedData);
        XLSX.utils.book_append_sheet(wb, changedWs, "Pagu Anggaran Berubah");
      }
      
      if (newItems.length > 0) {
        const newData = [
          ['No', 'Pembebanan', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']
        ];
        
        newItems.forEach((item, index) => {
          newData.push([
            (index + 1).toString(),
            formatPembebananCode(item),
            item.uraian,
            item.volumeMenjadi.toString(),
            item.satuanMenjadi,
            item.hargaSatuanMenjadi.toString(),
            item.jumlahMenjadi.toString()
          ]);
        });
        
        const newWs = XLSX.utils.aoa_to_sheet(newData);
        XLSX.utils.book_append_sheet(wb, newWs, "Pagu Anggaran Baru");
      }
      
      if (deletedItems.length > 0) {
        const deletedData = [
          ['No', 'Pembebanan', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']
        ];
        
        deletedItems.forEach((item, index) => {
          deletedData.push([
            (index + 1).toString(),
            formatPembebananCode(item),
            item.uraian,
            item.volumeSemula.toString(),
            item.satuanSemula,
            item.hargaSatuanSemula.toString(),
            item.jumlahSemula.toString()
          ]);
        });
        
        const deletedWs = XLSX.utils.aoa_to_sheet(deletedData);
        XLSX.utils.book_append_sheet(wb, deletedWs, "Pagu Anggaran Dihapus");
      }
      
      const narrativeData = [
        ['Kesimpulan Perubahan Anggaran'],
        [''],
        [`Total Pagu anggaran semula sebesar ${formatCurrency(totalSemula)} berubah menjadi ${formatCurrency(totalMenjadi)}, dengan selisih sebesar ${formatCurrency(totalSelisih)}.`],
        [`Terdapat ${changedItems.length} detil anggaran yang diubah, ${newItems.length} detil anggaran baru, dan ${deletedItems.length} detil anggaran yang dihapus.`],
        [`Perubahan ini ${totalSelisih !== 0 ? 'menyebabkan' : 'tidak menyebabkan'} perubahan pada total Pagu anggaran.`],
        ['']
      ];
      
      const narrativeWs = XLSX.utils.aoa_to_sheet(narrativeData);
      XLSX.utils.book_append_sheet(wb, narrativeWs, "Kesimpulan");
      
      XLSX.writeFile(wb, "Ringkasan_Perubahan_Anggaran.xlsx");
      
      toast({
        title: "Berhasil",
        description: "Ringkasan perubahan Pagu anggaran berhasil diekspor ke Excel"
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal mengekspor data. Silakan coba lagi."
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-blue-900 font-bold">Ringkasan Perubahan Pagu Anggaran</DialogTitle>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded p-3">
              <h3 className="text-sm font-semibold">Total Pagu Semula</h3>
              <p className="text-base font-bold">{formatCurrency(totalSemula)}</p>
            </div>
            <div className="border rounded p-3">
              <h3 className="text-sm font-semibold">Total Pagu Menjadi</h3>
              <p className="text-base font-bold">{formatCurrency(totalMenjadi)}</p>
            </div>
            <div className={`border rounded p-3 ${totalSelisih === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="text-sm font-semibold">Selisih</h3>
              <p className={`text-base font-bold ${totalSelisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalSelisih)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded border text-sm">
            <h3 className="text-red-600 font-semibold mb-1">Kesimpulan</h3>
            <p>Total Pagu anggaran semula sebesar <strong>{formatCurrency(totalSemula)}</strong> berubah menjadi <strong>{formatCurrency(totalMenjadi)}</strong>, dengan selisih sebesar <strong className={totalSelisih === 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(totalSelisih)}</strong>.</p>
            <p className="mt-1">Terdapat {changedItems.length} detil anggaran yang diubah, {newItems.length} detil anggaran baru, dan {deletedItems.length} detil anggaran yang dihapus.</p>
            <p className="mt-1">Perubahan ini {totalSelisih !== 0 ? 'menyebabkan' : 'tidak menyebabkan'} perubahan pada total Pagu anggaran.</p>
          </div>
          
          {changedItems.length > 0 && (
            <div>
              <h3 className="text-orange-600 font-bold mb-1 text-sm">Pagu Anggaran Berubah</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">No</TableHead>
                      <TableHead className="whitespace-normal text-xs">Pembebanan</TableHead>
                      <TableHead className="whitespace-normal text-xs">Uraian</TableHead>
                      <TableHead className="text-xs">Detail Perubahan</TableHead>
                      <TableHead className="text-right text-xs">Jumlah Semula</TableHead>
                      <TableHead className="text-right text-xs">Jumlah Menjadi</TableHead>
                      <TableHead className="text-right text-xs">Selisih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changedItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">{index + 1}</TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[150px] text-xs">
                          {formatPembebananCode(item)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[200px] text-xs">
                          {item.uraian}
                        </TableCell>
                        <TableCell className="text-xs">{renderDetailPerubahan(item)}</TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.jumlahSemula)}</TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                        <TableCell className="text-right text-xs">
                          <span className={item.selisih !== 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(item.selisih)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell colSpan={4} className="text-xs">Total</TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0))}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0))}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(changedItems.reduce((sum, item) => sum + item.selisih, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {newItems.length > 0 && (
            <div>
              <h3 className="text-green-600 font-bold mb-1 text-sm">Pagu Anggaran Baru</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">No</TableHead>
                      <TableHead className="whitespace-normal text-xs">Pembebanan</TableHead>
                      <TableHead className="whitespace-normal text-xs">Uraian</TableHead>
                      <TableHead className="text-xs">Volume</TableHead>
                      <TableHead className="text-xs">Satuan</TableHead>
                      <TableHead className="text-right text-xs">Harga Satuan</TableHead>
                      <TableHead className="text-right text-xs">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">{index + 1}</TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[150px] text-xs">
                          {formatPembebananCode(item)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[200px] text-xs">
                          {item.uraian}
                        </TableCell>
                        <TableCell className="text-xs">{item.volumeMenjadi}</TableCell>
                        <TableCell className="text-xs">{item.satuanMenjadi}</TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell colSpan={6} className="text-xs">Total</TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {deletedItems.length > 0 && (
            <div>
              <h3 className="text-gray-600 font-bold mb-1 text-sm">Pagu Anggaran Dihapus</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">No</TableHead>
                      <TableHead className="whitespace-normal text-xs">Pembebanan</TableHead>
                      <TableHead className="whitespace-normal text-xs">Uraian</TableHead>
                      <TableHead className="text-xs">Volume</TableHead>
                      <TableHead className="text-xs">Satuan</TableHead>
                      <TableHead className="text-right text-xs">Harga Satuan</TableHead>
                      <TableHead className="text-right text-xs">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">{index + 1}</TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[150px] text-xs">
                          {formatPembebananCode(item)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[200px] text-xs">
                          {item.uraian}
                        </TableCell>
                        <TableCell className="text-xs">{item.volumeSemula}</TableCell>
                        <TableCell className="text-xs">{item.satuanSemula}</TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.hargaSatuanSemula)}</TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.jumlahSemula)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell colSpan={6} className="text-xs">Total</TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(deletedItems.reduce((sum, item) => sum + item.jumlahSemula, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
