
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency } from '@/utils/budgetCalculations';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group' | 'akun_group';

interface SummaryTableProps {
  summaryData: BudgetSummaryRecord[];
  view: SummaryViewType;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ summaryData, view }) => {
  const getCategoryName = (): string => {
    switch (view) {
      case 'komponen_output': return 'Komponen Output';
      case 'akun': return 'Akun';
      case 'program_pembebanan': return 'Program Pembebanan';
      case 'kegiatan': return 'Kegiatan';
      case 'rincian_output': return 'Rincian Output';
      case 'sub_komponen': return 'Sub Komponen';
      case 'account_group': return 'Kelompok Belanja';
      case 'akun_group': return 'Kelompok Akun';
      default: return 'Kategori';
    }
  };

  const getItemCategoryValue = (item: BudgetSummaryRecord): string => {
    if ('komponen_output' in item && view === 'komponen_output') {
      return item.komponen_output || '';
    } else if ('akun' in item && view === 'akun') {
      return item.akun || '';
    } else if ('program_pembebanan' in item && view === 'program_pembebanan') {
      return item.program_pembebanan || '';
    } else if ('kegiatan' in item && view === 'kegiatan') {
      return item.kegiatan || '';
    } else if ('rincian_output' in item && view === 'rincian_output') {
      return item.rincian_output || '';
    } else if ('sub_komponen' in item && view === 'sub_komponen') {
      return item.sub_komponen || '';
    } else if ('account_group' in item && view === 'account_group' && 'account_group_name' in item) {
      return item.account_group_name || item.account_group || '';
    } else if ('akun_group' in item && view === 'akun_group' && 'akun_group_name' in item) {
      return item.akun_group_name || item.akun_group || '';
    }
    return '';
  };

  const sortedData = [...summaryData].sort((a, b) => {
    const aValue = getItemCategoryValue(a);
    const bValue = getItemCategoryValue(b);
    return aValue.localeCompare(bValue);
  });

  const totalRow = {
    total_semula: summaryData.reduce((sum, item) => sum + (item.total_semula || 0), 0),
    total_menjadi: summaryData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0),
    total_selisih: summaryData.reduce((sum, item) => sum + (item.total_selisih || 0), 0),
    new_items: summaryData.reduce((sum, item) => sum + (item.new_items || 0), 0),
    changed_items: summaryData.reduce((sum, item) => sum + (item.changed_items || 0), 0),
    total_items: summaryData.reduce((sum, item) => sum + (item.total_items || 0), 0),
  };

  if (summaryData.length === 0) {
    return <p className="text-center py-4">Tidak ada data untuk ditampilkan.</p>;
  }

  return (
    <div>
      <Table className="border">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="min-w-[200px] text-slate-700 font-semibold">{getCategoryName()}</TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">Total Semula</TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">Total Menjadi</TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">Selisih</TableHead>
            <TableHead className="text-center text-slate-700 font-semibold">Item Baru</TableHead>
            <TableHead className="text-center text-slate-700 font-semibold">Item Berubah</TableHead>
            <TableHead className="text-center text-slate-700 font-semibold">Total Item</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell className="font-medium">{getItemCategoryValue(item)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.total_semula || 0)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.total_menjadi || 0)}</TableCell>
              <TableCell className={`text-right ${(item.total_selisih || 0) > 0 ? 'text-green-600' : (item.total_selisih || 0) < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(item.total_selisih || 0)}
              </TableCell>
              <TableCell className="text-center">{item.new_items || 0}</TableCell>
              <TableCell className="text-center">{item.changed_items || 0}</TableCell>
              <TableCell className="text-center">{item.total_items || 0}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-100 font-medium">
            <TableCell className="font-semibold">TOTAL</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(totalRow.total_semula)}</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(totalRow.total_menjadi)}</TableCell>
            <TableCell className={`text-right font-semibold ${totalRow.total_selisih > 0 ? 'text-green-600' : totalRow.total_selisih < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(totalRow.total_selisih)}
            </TableCell>
            <TableCell className="text-center font-semibold">{totalRow.new_items}</TableCell>
            <TableCell className="text-center font-semibold">{totalRow.changed_items}</TableCell>
            <TableCell className="text-center font-semibold">{totalRow.total_items}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SummaryTable;
