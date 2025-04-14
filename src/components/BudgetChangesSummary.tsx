
import React from 'react';
import { BudgetItem } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetChangesSummaryProps {
  items: BudgetItem[];
}

type GroupedItems = {
  changed: BudgetItem[];
  new: BudgetItem[];
};

const BudgetChangesSummary: React.FC<BudgetChangesSummaryProps> = ({ items }) => {
  const groupedItems: GroupedItems = items.reduce((acc, item) => {
    if (item.status === 'changed') {
      acc.changed.push(item);
    } else if (item.status === 'new') {
      acc.new.push(item);
    }
    return acc;
  }, { changed: [], new: [] } as GroupedItems);

  const getPembebananText = (item: BudgetItem): string => {
    const parts = [];
    if (item.programPembebanan) parts.push(item.programPembebanan);
    if (item.komponenOutput) parts.push(item.komponenOutput);
    if (item.subKomponen) parts.push(item.subKomponen);
    if (item.akun) parts.push(item.akun);
    return parts.join(' - ');
  };

  const getDetailPerubahan = (item: BudgetItem): string => {
    const changes = [];
    
    if (item.volumeSemula !== item.volumeMenjadi) {
      changes.push(`Volume: ${item.volumeSemula} → ${item.volumeMenjadi}`);
    }
    
    if (item.satuanSemula !== item.satuanMenjadi) {
      changes.push(`Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}`);
    }
    
    if (item.hargaSatuanSemula !== item.hargaSatuanMenjadi) {
      changes.push(`Harga: ${formatCurrency(item.hargaSatuanSemula, false)} → ${formatCurrency(item.hargaSatuanMenjadi, false)}`);
    }
    
    return changes.join(', ');
  };

  const totalChangedSemula = groupedItems.changed.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalChangedMenjadi = groupedItems.changed.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalChangedSelisih = totalChangedMenjadi - totalChangedSemula;
  
  const totalNewMenjadi = groupedItems.new.reduce((sum, item) => sum + item.jumlahMenjadi, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3 text-slate-800">Pagu Anggaran Berubah</h3>
        {groupedItems.changed.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 text-base h-7">
                  <TableHead className="w-12 text-center text-slate-700">No</TableHead>
                  <TableHead className="w-[15%] text-center text-slate-700">Pembebanan</TableHead>
                  <TableHead className="w-[30%] text-center text-slate-700">Uraian</TableHead>
                  <TableHead className="w-[20%] text-center text-slate-700">Detail Perubahan</TableHead>
                  <TableHead className="text-right text-center text-slate-700">Semula</TableHead>
                  <TableHead className="text-right text-center text-slate-700">Menjadi</TableHead>
                  <TableHead className="text-right text-center text-slate-700">Selisih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-base">
                {groupedItems.changed.map((item, index) => (
                  <TableRow key={item.id} className="h-6">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-left whitespace-normal break-words max-w-[120px]">{getPembebananText(item)}</TableCell>
                    <TableCell className="text-left whitespace-normal break-words">{item.uraian}</TableCell>
                    <TableCell className="whitespace-normal break-words">{getDetailPerubahan(item)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                    <TableCell className={`text-right ${item.selisih > 0 ? 'text-green-600' : item.selisih < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(item.selisih)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="text-base font-semibold">
                  <TableCell colSpan={4} className="text-right">TOTAL</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalChangedSemula)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalChangedMenjadi)}</TableCell>
                  <TableCell className={`text-right ${totalChangedSelisih > 0 ? 'text-green-600' : totalChangedSelisih < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(totalChangedSelisih)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <div className="border rounded-md p-4 text-center text-base text-gray-500">
            Tidak ada anggaran yang berubah
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 text-slate-800">Pagu Anggaran Baru</h3>
        {groupedItems.new.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 text-base h-7">
                  <TableHead className="w-12 text-center text-slate-700">No</TableHead>
                  <TableHead className="w-[15%] text-center text-slate-700">Pembebanan</TableHead>
                  <TableHead className="w-[30%] text-center text-slate-700">Uraian</TableHead>
                  <TableHead className="w-[15%] text-center text-slate-700">Volume</TableHead>
                  <TableHead className="w-[15%] text-center text-slate-700">Harga Satuan</TableHead>
                  <TableHead className="text-center text-slate-700">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-base">
                {groupedItems.new.map((item, index) => (
                  <TableRow key={item.id} className="h-6">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-left whitespace-normal break-words max-w-[120px]">{getPembebananText(item)}</TableCell>
                    <TableCell className="text-left whitespace-normal break-words">{item.uraian}</TableCell>
                    <TableCell>{item.volumeMenjadi} {item.satuanMenjadi}</TableCell>
                    <TableCell>{formatCurrency(item.hargaSatuanMenjadi, false)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="text-base font-semibold">
                  <TableCell colSpan={5} className="text-right">TOTAL</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalNewMenjadi)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <div className="border rounded-md p-4 text-center text-base text-gray-500">
            Tidak ada anggaran baru
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetChangesSummary;
