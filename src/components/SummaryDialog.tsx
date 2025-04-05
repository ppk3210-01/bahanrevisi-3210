
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileBarChart2 } from "lucide-react";
import { formatCurrency } from '@/utils/budgetCalculations';
import { BudgetItem } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileBarChart2 className="h-4 w-4 mr-2" />
          Ringkasan Perubahan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ringkasan Perubahan Anggaran</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Summary Boxes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold">Total Semula</h3>
              <p className="text-xl font-bold">{formatCurrency(totalSemula)}</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold">Total Menjadi</h3>
              <p className="text-xl font-bold">{formatCurrency(totalMenjadi)}</p>
            </div>
            <div className={`border rounded p-4 ${totalSelisih !== 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className="text-lg font-semibold">Selisih</h3>
              <p className={`text-xl font-bold ${totalSelisih !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalSelisih)}
              </p>
            </div>
          </div>
          
          {/* New Items */}
          {newItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Anggaran Baru</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Pembebanan</TableHead>
                    <TableHead>Uraian</TableHead>
                    <TableHead className="text-right">Jumlah Menjadi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatPembebananCode(item)}</TableCell>
                      <TableCell>{item.uraian}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Changed Items */}
          {changedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Anggaran Berubah</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Pembebanan</TableHead>
                    <TableHead>Uraian</TableHead>
                    <TableHead className="text-right">Semula</TableHead>
                    <TableHead className="text-right">Menjadi</TableHead>
                    <TableHead className="text-right">Selisih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatPembebananCode(item)}</TableCell>
                      <TableCell>{item.uraian}</TableCell>
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
          )}
          
          {/* Deleted Items */}
          {deletedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Anggaran Dihapus</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Pembebanan</TableHead>
                    <TableHead>Uraian</TableHead>
                    <TableHead className="text-right">Jumlah Semula</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatPembebananCode(item)}</TableCell>
                      <TableCell>{item.uraian}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
