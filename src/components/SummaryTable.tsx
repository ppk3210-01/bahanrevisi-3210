
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency } from '@/utils/budgetCalculations';

interface SummaryTableProps {
  summaryData: BudgetSummaryRecord[];
  view: 'account_group' | 'komponen_output' | 'akun';
}

const SummaryTable: React.FC<SummaryTableProps> = ({ summaryData, view }) => {
  // Get the appropriate column name based on the view type
  const getColumnName = (): string => {
    switch (view) {
      case 'account_group': return 'Kelompok Akun';
      case 'komponen_output': return 'Komponen Output';
      case 'akun': return 'Akun';
      default: return 'Kategori';
    }
  };

  // Get the appropriate value from the record based on view type
  const getValueFromRecord = (record: BudgetSummaryRecord): string | null => {
    if ('account_group' in record && view === 'account_group') {
      return record.account_group || '-';
    } else if ('komponen_output' in record && view === 'komponen_output') {
      return record.komponen_output || '-';
    } else if ('akun' in record && view === 'akun') {
      return record.akun || '-';
    }
    return '-';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{getColumnName()}</TableHead>
            <TableHead className="text-right">Total Semula</TableHead>
            <TableHead className="text-right">Total Menjadi</TableHead>
            <TableHead className="text-right">Selisih</TableHead>
            <TableHead className="text-center">Items Baru</TableHead>
            <TableHead className="text-center">Items Berubah</TableHead>
            <TableHead className="text-center">Total Items</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaryData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Tidak ada data</TableCell>
            </TableRow>
          ) : (
            summaryData.map((record, index) => {
              const categoryValue = getValueFromRecord(record);
              const totalSemula = record.total_semula || 0;
              const totalMenjadi = record.total_menjadi || 0;
              const totalSelisih = record.total_selisih || 0;
              const newItems = record.new_items || 0;
              const changedItems = record.changed_items || 0;
              const totalItems = record.total_items || 0;
              
              return (
                <TableRow key={`${categoryValue}-${index}`}>
                  <TableCell className="font-medium">{categoryValue}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalSemula)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalMenjadi)}</TableCell>
                  <TableCell className={`text-right ${totalSelisih > 0 ? 'text-green-600' : totalSelisih < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(totalSelisih)}
                  </TableCell>
                  <TableCell className="text-center">{newItems}</TableCell>
                  <TableCell className="text-center">{changedItems}</TableCell>
                  <TableCell className="text-center">{totalItems}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SummaryTable;
