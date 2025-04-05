
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileBarChart2, FileSpreadsheet } from "lucide-react";
import { formatCurrency } from '@/utils/budgetCalculations';
import { BudgetItem } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

interface SummaryDialogProps {
  items: BudgetItem[];
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ items }) => {
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
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
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
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
      
      // Changed items sheet
      if (changedItems.length > 0) {
        const changedData = [
          ['No', 'Pembebanan', 'Uraian', 'Detail Perubahan', 'Jumlah Semula', 'Jumlah Menjadi', 'Selisih']
        ];
        
        changedItems.forEach((item, index) => {
          changedData.push([
            (index + 1).toString(), // Convert number to string
            formatPembebananCode(item),
            item.uraian,
            renderDetailPerubahan(item),
            item.jumlahSemula.toString(), // Convert number to string
            item.jumlahMenjadi.toString(), // Convert number to string
            item.selisih.toString() // Convert number to string
          ]);
        });
        
        const changedWs = XLSX.utils.aoa_to_sheet(changedData);
        XLSX.utils.book_append_sheet(wb, changedWs, "Pagu Anggaran Berubah");
      }
      
      // New items sheet
      if (newItems.length > 0) {
        const newData = [
          ['No', 'Pembebanan', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']
        ];
        
        newItems.forEach((item, index) => {
          newData.push([
            (index + 1).toString(), // Convert number to string
            formatPembebananCode(item),
            item.uraian,
            item.volumeMenjadi.toString(), // Convert number to string
            item.satuanMenjadi,
            item.hargaSatuanMenjadi.toString(), // Convert number to string
            item.jumlahMenjadi.toString() // Convert number to string
          ]);
        });
        
        const newWs = XLSX.utils.aoa_to_sheet(newData);
        XLSX.utils.book_append_sheet(wb, newWs, "Pagu Anggaran Baru");
      }
      
      // Deleted items sheet
      if (deletedItems.length > 0) {
        const deletedData = [
          ['No', 'Pembebanan', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']
        ];
        
        deletedItems.forEach((item, index) => {
          deletedData.push([
            (index + 1).toString(), // Convert number to string
            formatPembebananCode(item),
            item.uraian,
            item.volumeSemula.toString(), // Convert number to string
            item.satuanSemula,
            item.hargaSatuanSemula.toString(), // Convert number to string
            item.jumlahSemula.toString() // Convert number to string
          ]);
        });
        
        const deletedWs = XLSX.utils.aoa_to_sheet(deletedData);
        XLSX.utils.book_append_sheet(wb, deletedWs, "Pagu Anggaran Dihapus");
      }
      
      // Generate narrative summary
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
      
      // Export to file
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileBarChart2 className="h-4 w-4 mr-2" />
          Ringkasan Perubahan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Ringkasan Perubahan Pagu Anggaran</DialogTitle>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Summary Boxes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold">Total Pagu Semula</h3>
              <p className="text-xl font-bold">{formatCurrency(totalSemula)}</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold">Total Pagu Menjadi</h3>
              <p className="text-xl font-bold">{formatCurrency(totalMenjadi)}</p>
            </div>
            <div className={`border rounded p-4 ${totalSelisih !== 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className="text-lg font-semibold">Selisih</h3>
              <p className={`text-xl font-bold ${totalSelisih !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalSelisih)}
              </p>
            </div>
          </div>
          
          {/* Narrative Summary */}
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">Kesimpulan</h3>
            <p>Total Pagu anggaran semula sebesar <strong>{formatCurrency(totalSemula)}</strong> berubah menjadi <strong>{formatCurrency(totalMenjadi)}</strong>, dengan selisih sebesar <strong className={totalSelisih !== 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(totalSelisih)}</strong>.</p>
            <p className="mt-2">Terdapat {changedItems.length} detil anggaran yang diubah, {newItems.length} detil anggaran baru, dan {deletedItems.length} detil anggaran yang dihapus.</p>
            <p className="mt-2">Perubahan ini {totalSelisih !== 0 ? 'menyebabkan' : 'tidak menyebabkan'} perubahan pada total Pagu anggaran.</p>
          </div>
          
          {/* Changed Items */}
          {changedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Pagu Anggaran Berubah</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead className="whitespace-normal">Pembebanan</TableHead>
                      <TableHead className="whitespace-normal">Uraian</TableHead>
                      <TableHead>Detail Perubahan</TableHead>
                      <TableHead className="text-right">Jumlah Semula</TableHead>
                      <TableHead className="text-right">Jumlah Menjadi</TableHead>
                      <TableHead className="text-right">Selisih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changedItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[150px]">
                          {formatPembebananCode(item)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[200px]">
                          {item.uraian}
                        </TableCell>
                        <TableCell>{renderDetailPerubahan(item)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                        <TableCell className="text-right">
                          <span className={item.selisih !== 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(item.selisih)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* New Items */}
          {newItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Pagu Anggaran Baru</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead className="whitespace-normal">Pembebanan</TableHead>
                      <TableHead className="whitespace-normal">Uraian</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead className="text-right">Harga Satuan</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[150px]">
                          {formatPembebananCode(item)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[200px]">
                          {item.uraian}
                        </TableCell>
                        <TableCell>{item.volumeMenjadi}</TableCell>
                        <TableCell>{item.satuanMenjadi}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Deleted Items */}
          {deletedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Pagu Anggaran Dihapus</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead className="whitespace-normal">Pembebanan</TableHead>
                      <TableHead className="whitespace-normal">Uraian</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead className="text-right">Harga Satuan</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[150px]">
                          {formatPembebananCode(item)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words max-w-[200px]">
                          {item.uraian}
                        </TableCell>
                        <TableCell>{item.volumeSemula}</TableCell>
                        <TableCell>{item.satuanSemula}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.hargaSatuanSemula)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                      </TableRow>
                    ))}
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
