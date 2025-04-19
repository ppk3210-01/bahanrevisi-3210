
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage } from 'lucide-react';
import { formatCurrency } from '@/utils/budgetCalculations';
import { exportToJpeg } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface BudgetChangeItem {
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
  items: BudgetChangeItem[];
}

export const BudgetChangesTable: React.FC<BudgetChangesTableProps> = ({ title, items }) => {
  const { isAdmin } = useAuth();

  const handleExportJPEG = async () => {
    try {
      const element = document.getElementById('budget-changes-table');
      if (element) {
        await exportToJpeg(element, 'pagu-anggaran-berubah');
        toast({
          title: "Berhasil",
          description: 'Berhasil mengekspor sebagai JPEG'
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: 'Gagal mengekspor sebagai JPEG'
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={handleExportJPEG}>
            <FileImage className="h-4 w-4 mr-2" />
            Export JPEG
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div id="budget-changes-table" className="budget-changes-summary">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead className="pembebanan-column">Pembebanan</TableHead>
                <TableHead className="uraian-column">Uraian</TableHead>
                <TableHead className="w-[200px]">Detail Perubahan</TableHead>
                <TableHead className="number-column">Jumlah Semula</TableHead>
                <TableHead className="number-column">Jumlah Menjadi</TableHead>
                <TableHead className="number-column">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="pembebanan-column">{item.pembebanan}</TableCell>
                  <TableCell className="uraian-column">{item.uraian}</TableCell>
                  <TableCell style={{ whiteSpace: 'pre-line' }}>{item.detailPerubahan}</TableCell>
                  <TableCell className="number-column">{formatCurrency(item.jumlahSemula)}</TableCell>
                  <TableCell className="number-column">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  <TableCell className="number-column">{formatCurrency(item.selisih)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
