
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage } from 'lucide-react';
import { formatCurrency } from '@/utils/budgetCalculations';
import { exportToJpeg } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
export const NewBudgetTable: React.FC<NewBudgetTableProps> = ({
  items
}) => {
  const {
    isAdmin
  } = useAuth();
  const handleExportJPEG = async () => {
    try {
      const element = document.getElementById('new-budget-table');
      if (element) {
        await exportToJpeg(element, 'pagu-anggaran-baru');
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

  // Calculate total for the footer
  const totalJumlah = items.reduce((sum, item) => sum + item.jumlah, 0);
  return <Card className="bg-green-50/50 border-green-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg text-green-700 font-bold">Pagu Anggaran Baru</CardTitle>
        {isAdmin && <Button variant="outline" size="sm" onClick={handleExportJPEG} className="text-xs">
            <FileImage className="h-4 w-4 mr-2" />
            Export JPEG
          </Button>}
      </CardHeader>
      <CardContent>
        <div id="new-budget-table" className="budget-changes-summary">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-100/50">
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead className="pembebanan-column text-center">Pembebanan</TableHead>
                <TableHead className="uraian-column text-center">Uraian</TableHead>
                <TableHead className="w-[100px] text-center">Volume</TableHead>
                <TableHead className="w-[100px] text-center">Satuan</TableHead>
                <TableHead className="w-[180px] text-center">Harga Satuan</TableHead>
                <TableHead className="w-[180px] text-center">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => <TableRow key={item.id} className="h-12"> {/* Added fixed height for rows */}
                  <TableCell className="text-center py-3">{index + 1}</TableCell> {/* Increased vertical padding */}
                  <TableCell className="pembebanan-column whitespace-normal py-3">{item.pembebanan}</TableCell> {/* Increased vertical padding */}
                  <TableCell className="uraian-column py-3">{item.uraian}</TableCell> {/* Increased vertical padding */}
                  <TableCell className="text-center py-3">{item.volume}</TableCell> {/* Increased vertical padding */}
                  <TableCell className="text-center py-3">{item.satuan}</TableCell> {/* Increased vertical padding */}
                  <TableCell className="text-right py-3">{formatCurrency(item.hargaSatuan)}</TableCell> {/* Increased vertical padding */}
                  <TableCell className="text-right py-3">{formatCurrency(item.jumlah)}</TableCell> {/* Increased vertical padding */}
                </TableRow>)}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="font-bold text-center">Total Pagu Anggaran Baru</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalJumlah)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>;
};
