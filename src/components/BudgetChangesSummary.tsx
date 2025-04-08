
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';

interface BudgetChangesSummaryProps {
  items: BudgetItem[];
}

const BudgetChangesSummary: React.FC<BudgetChangesSummaryProps> = ({ items }) => {
  // Get items that have changed (existing items with modifications)
  const changedItems = items.filter(item => item.status === 'changed');
  
  // Get new items (items that didn't exist before)
  const newItems = items.filter(item => item.status === 'new');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pagu Anggaran Berubah</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Pembebanan</TableHead>
                <TableHead className="w-1/3">Uraian</TableHead>
                <TableHead>Detail Perubahan</TableHead>
                <TableHead className="text-right">Jumlah Semula</TableHead>
                <TableHead className="text-right">Jumlah Menjadi</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Tidak ada perubahan anggaran</TableCell>
                </TableRow>
              ) : (
                changedItems.map((item, index) => {
                  const volumeChanged = item.volumeSemula !== item.volumeMenjadi;
                  const satuanChanged = item.satuanSemula !== item.satuanMenjadi;
                  const hargaChanged = item.hargaSatuanSemula !== item.hargaSatuanMenjadi;
                  
                  const changes = [];
                  if (volumeChanged) changes.push(`Volume: ${item.volumeSemula} → ${item.volumeMenjadi}`);
                  if (satuanChanged) changes.push(`Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}`);
                  if (hargaChanged) changes.push(`Harga: ${formatCurrency(item.hargaSatuanSemula)} → ${formatCurrency(item.hargaSatuanMenjadi)}`);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.programPembebanan || '-'}</TableCell>
                      <TableCell>{item.uraian}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {changes.map((change, idx) => (
                            <div key={idx}>{change}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                      <TableCell className={`text-right ${item.selisih > 0 ? 'text-green-600' : item.selisih < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(item.selisih)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Pagu Anggaran Baru</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Pembebanan</TableHead>
                <TableHead className="w-1/3">Uraian</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Tidak ada anggaran baru</TableCell>
                </TableRow>
              ) : (
                newItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.programPembebanan || '-'}</TableCell>
                    <TableCell>{item.uraian}</TableCell>
                    <TableCell className="text-right">{item.volumeMenjadi}</TableCell>
                    <TableCell>{item.satuanMenjadi}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-gray-50 p-4 border rounded-md">
        <h3 className="font-semibold mb-2">Kesimpulan</h3>
        <div className="space-y-2">
          <p className="text-sm">
            {changedItems.length > 0 ? 
              `Terdapat ${changedItems.length} detail anggaran yang mengalami perubahan.` : 
              'Tidak ada detail anggaran yang mengalami perubahan.'}
          </p>
          <p className="text-sm">
            {newItems.length > 0 ? 
              `Terdapat ${newItems.length} detail anggaran baru yang ditambahkan.` : 
              'Tidak ada detail anggaran baru yang ditambahkan.'}
          </p>
          <p className="text-sm">
            Total perubahan ini menyebabkan perubahan pada total Pagu anggaran.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetChangesSummary;
