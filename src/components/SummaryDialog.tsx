
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileBarChart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';

interface SummaryDialogProps {
  items: BudgetItem[];
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <Button variant="outline" disabled>
        <FileBarChart className="mr-2 h-4 w-4" />
        Ringkasan
      </Button>
    );
  }

  // Calculate totals
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalSemula - totalMenjadi;

  // Prepare summary data
  const summaryData = items.map(item => {
    // Format: KomponenOutput.SubKomponen.A.Akun
    const pembebanan = `${item.komponenOutput || '-'}.${item.subKomponen || '-'}.A.${item.akun || '-'}`;
    
    return {
      uraian: item.uraian,
      pembebanan,
      volumeSemula: item.volumeSemula,
      satuanSemula: item.satuanSemula,
      hargaSatuanSemula: item.hargaSatuanSemula,
      jumlahSemula: item.jumlahSemula,
      volumeMenjadi: item.volumeMenjadi,
      satuanMenjadi: item.satuanMenjadi,
      hargaSatuanMenjadi: item.hargaSatuanMenjadi,
      jumlahMenjadi: item.jumlahMenjadi,
      selisih: item.jumlahSemula - item.jumlahMenjadi,
      status: item.status
    };
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileBarChart className="mr-2 h-4 w-4" />
          Ringkasan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ringkasan Perubahan Anggaran</DialogTitle>
          <DialogDescription>
            Menampilkan ringkasan dari seluruh perubahan anggaran yang sudah dibuat.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead>Pembebanan</TableHead>
                <TableHead>Jumlah Semula</TableHead>
                <TableHead>Jumlah Menjadi</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.uraian}</TableCell>
                  <TableCell>{item.pembebanan}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  <TableCell className={`text-right ${item.selisih > 0 ? 'text-green-600' : item.selisih < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(item.selisih)}
                  </TableCell>
                  <TableCell className="capitalize">{item.status}</TableCell>
                </TableRow>
              ))}
              
              <TableRow className="font-semibold bg-gray-50">
                <TableCell colSpan={3} className="text-right">Total:</TableCell>
                <TableCell className="text-right">{formatCurrency(totalSemula)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalMenjadi)}</TableCell>
                <TableCell className={`text-right ${totalSelisih > 0 ? 'text-green-600' : totalSelisih < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(totalSelisih)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
