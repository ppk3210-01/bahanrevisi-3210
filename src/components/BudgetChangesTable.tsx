
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/budgetCalculations';
import { cn } from '@/lib/utils';

interface BudgetItem {
  id: string;
  pembebanan: string;
  uraian: string;
  detailPerubahan: string;
  jumlahSemula: number;
  jumlahMenjadi: number;
  selisih: number;
}

interface BudgetChangesTableProps {
  title: string;
  items: BudgetItem[];
  className?: string;
  showTotal?: boolean;
  titleColor?: string;
}

export const BudgetChangesTable: React.FC<BudgetChangesTableProps> = ({
  title,
  items,
  className,
  showTotal = true,
  titleColor = "text-orange-600"
}) => {
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;

  return (
    <Card className={cn("p-6", className)}>
      <h3 className={cn("text-lg font-semibold mb-4", titleColor)}>{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead className="w-64">Pembebanan</TableHead>
            <TableHead className="w-96">Uraian</TableHead>
            <TableHead className="w-64">Detail Perubahan</TableHead>
            <TableHead className="w-36 text-right">Jumlah Semula</TableHead>
            <TableHead className="w-36 text-right">Jumlah Menjadi</TableHead>
            <TableHead className="w-36 text-right">Selisih</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-mono text-sm">{item.pembebanan}</TableCell>
              <TableCell>{item.uraian}</TableCell>
              <TableCell>{item.detailPerubahan}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
              <TableCell className={cn(
                "text-right",
                item.selisih < 0 ? "text-red-600" : item.selisih > 0 ? "text-blue-600" : ""
              )}>
                {item.selisih === 0 ? "-" : formatCurrency(item.selisih)}
              </TableCell>
            </TableRow>
          ))}
          {showTotal && (
            <TableRow>
              <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(totalSemula)}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(totalMenjadi)}</TableCell>
              <TableCell className={cn(
                "text-right font-semibold",
                totalSelisih < 0 ? "text-red-600" : totalSelisih > 0 ? "text-blue-600" : ""
              )}>
                {formatCurrency(totalSelisih)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
