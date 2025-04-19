
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/budgetCalculations';

interface NewBudgetItem {
  id: string;
  pembebanan: string;
  uraian: string;
  volume: number;
  satuan: string;
  hargaSatuan: number;
  jumlah: number;
}

interface NewBudgetTableProps {
  items: NewBudgetItem[];
}

export const NewBudgetTable: React.FC<NewBudgetTableProps> = ({ items }) => {
  const total = items.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <Card className="p-6">
      <h3 className="text-green-600 text-lg font-semibold mb-4">Pagu Anggaran Baru</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead className="w-64">Pembebanan</TableHead>
            <TableHead className="w-96">Uraian</TableHead>
            <TableHead className="w-24 text-center">Volume</TableHead>
            <TableHead className="w-24">Satuan</TableHead>
            <TableHead className="w-36 text-right">Harga Satuan</TableHead>
            <TableHead className="w-36 text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-mono text-sm">{item.pembebanan}</TableCell>
              <TableCell>{item.uraian}</TableCell>
              <TableCell className="text-center">{item.volume}</TableCell>
              <TableCell>{item.satuan}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.hargaSatuan)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.jumlah)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={6} className="text-right font-semibold">Total</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
};
