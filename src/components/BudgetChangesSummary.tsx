
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage, FilePdf } from 'lucide-react';
import { formatCurrency } from '@/utils/budgetCalculations';
import { exportToJpeg, exportToPdf } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';

interface BudgetChangesSummaryProps {
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  totalNewItems: number;
  totalChangedItems: number;
  totalDeletedItems: number;
  totalUnchangedItems: number;
  totalItems: number;
}

const BudgetChangesSummary: React.FC<BudgetChangesSummaryProps> = ({
  totalSemula,
  totalMenjadi,
  totalSelisih,
  totalNewItems,
  totalChangedItems,
  totalDeletedItems,
  totalUnchangedItems,
  totalItems
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExportJPEG = async () => {
    if (!cardRef.current) return;
    
    try {
      await exportToJpeg(cardRef.current, 'ringkasan-perubahan-anggaran');
      toast({
        title: "Berhasil",
        description: 'Berhasil mengekspor sebagai JPEG'
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: 'Gagal mengekspor sebagai JPEG'
      });
    }
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      await exportToPdf(cardRef.current, 'ringkasan-perubahan-anggaran');
      toast({
        title: "Berhasil",
        description: 'Berhasil mengekspor sebagai PDF'
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: 'Gagal mengekspor sebagai PDF'
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleExportJPEG}>
          <FileImage className="h-4 w-4 mr-2" />
          Export JPEG
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FilePdf className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
      
      <Card ref={cardRef} className="bg-blue-50 border-blue-100">
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-900">Kesimpulan</h2>
          
          <div className="space-y-2 text-sm">
            <p>
              Berdasarkan hasil analisis terhadap alokasi anggaran, total pagu anggaran semula sebesar {formatCurrency(totalSemula)} mengalami perubahan menjadi Rp {formatCurrency(totalMenjadi)}, dengan selisih Rp {formatCurrency(totalSelisih)}.
            </p>
            <p>
              Perubahan ini terdiri dari {totalChangedItems} komponen anggaran yang mengalami penyesuaian nilai, {totalNewItems} komponen anggaran baru yang ditambahkan, dan {totalDeletedItems} komponen anggaran yang dihapus.
            </p>
            <p>
              Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan prioritas program dan kegiatan yang telah ditetapkan. Dengan adanya {totalChangedItems + totalNewItems} perubahan ini, diharapkan pelaksanaan program dapat berjalan dengan lebih efektif dan efisien.
            </p>
            <p>
              Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <h3 className="text-md font-semibold text-green-700">Pagu Anggaran Baru</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-blue-100/60">
                    <th className="px-2 py-2 text-left">No</th>
                    <th className="px-2 py-2 text-left">Pembebanan</th>
                    <th className="px-2 py-2 text-left">Uraian</th>
                    <th className="px-2 py-2 text-center">Volume</th>
                    <th className="px-2 py-2 text-center">Satuan</th>
                    <th className="px-2 py-2 text-right">Harga Satuan</th>
                    <th className="px-2 py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* This is a placeholder. In a real app, you'd map through actual data */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-2 py-2">{i + 1}</td>
                      <td className="px-2 py-2">(04.01) XXXXX</td>
                      <td className="px-2 py-2">Item anggaran {i + 1}</td>
                      <td className="px-2 py-2 text-center">{i + 2}</td>
                      <td className="px-2 py-2 text-center">Paket</td>
                      <td className="px-2 py-2 text-right">{formatCurrency((i + 1) * 1000000)}</td>
                      <td className="px-2 py-2 text-right">{formatCurrency((i + 1) * (i + 2) * 1000000)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Total Anggaran</h4>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm">Semula:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{formatCurrency(totalSemula)}</div>
                  
                  <div className="text-sm">Menjadi:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{formatCurrency(totalMenjadi)}</div>
                  
                  <div className="text-sm">Selisih:</div>
                  <div className={`col-span-2 text-sm font-medium text-right ${totalSelisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalSelisih)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Jumlah Item</h4>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm">Total Item:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{totalItems}</div>
                  
                  <div className="text-sm">Item Tidak Berubah:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{totalUnchangedItems}</div>
                  
                  <div className="text-sm">Item Berubah:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{totalChangedItems}</div>
                  
                  <div className="text-sm">Item Baru:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{totalNewItems}</div>
                  
                  <div className="text-sm">Item Dihapus:</div>
                  <div className="col-span-2 text-sm font-medium text-right">{totalDeletedItems}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetChangesSummary;
