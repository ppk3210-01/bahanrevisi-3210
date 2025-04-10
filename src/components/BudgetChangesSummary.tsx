
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface BudgetChangesSummaryProps {
  items: BudgetItem[];
}

const BudgetChangesSummary: React.FC<BudgetChangesSummaryProps> = ({ items }) => {
  // Get items that have changed (existing items with modifications)
  const changedItems = items.filter(item => item.status === 'changed');
  
  // Get new items (items that didn't exist before)
  const newItems = items.filter(item => item.status === 'new');
  
  // Get total amounts
  const totalSemulaChanged = changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadiChanged = changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisihChanged = totalMenjadiChanged - totalSemulaChanged;
  
  const totalMenjadiNew = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);

  // Calculate the total values
  const totalPaguSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalPaguMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalPaguSelisih = totalPaguMenjadi - totalPaguSemula;

  // Export to JPG function
  const exportToJPG = async () => {
    const summaryElement = document.getElementById('budget-change-summary');
    
    if (summaryElement) {
      try {
        const canvas = await html2canvas(summaryElement, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher scale for better quality
          logging: false
        });
        
        const image = canvas.toDataURL('image/jpeg', 0.9);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `Ringkasan-Perubahan-Anggaran-${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = image;
        link.click();
      } catch (error) {
        console.error('Error exporting to JPG:', error);
      }
    }
  };

  return (
    <div className="space-y-6" id="budget-change-summary">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Ringkasan Perubahan Anggaran</h3>
        <Button variant="outline" onClick={exportToJPG} className="flex items-center gap-1">
          <Download size={16} />
          <span>Export to JPG</span>
        </Button>
      </div>
      
      {/* Kesimpulan section - moved to the top */}
      <div className="bg-blue-50 p-4 border rounded-md">
        <h3 className="font-semibold mb-2 text-blue-800">Kesimpulan</h3>
        <div className="space-y-2 text-sm">
          <p>
            Nilai Pagu Anggaran Awal keseluruhan adalah sebesar Rp {formatCurrency(totalPaguSemula)}. Nilai Pagu Anggaran Total keseluruhan setelah perubahan menjadi Rp {formatCurrency(totalPaguMenjadi)}.
          </p>
          <p>
            {changedItems.length > 0 ? 
              `Terdapat ${changedItems.length} detail anggaran yang mengalami perubahan dengan total nilai semula Rp ${formatCurrency(totalSemulaChanged)} menjadi Rp ${formatCurrency(totalMenjadiChanged)}.` : 
              'Tidak ada detail anggaran yang mengalami perubahan.'}
          </p>
          <p>
            {newItems.length > 0 ? 
              `Terdapat ${newItems.length} detail anggaran baru yang ditambahkan dengan total nilai Rp ${formatCurrency(totalMenjadiNew)}.` : 
              'Tidak ada detail anggaran baru yang ditambahkan.'}
          </p>
          <p>
            Total perubahan ini menyebabkan {totalPaguSelisih > 0 ? 'kenaikan' : 'penurunan'} pada total Pagu anggaran sebesar Rp {formatCurrency(Math.abs(totalPaguSelisih))}.
          </p>
          <p>
            Dampak dari perubahan anggaran ini adalah penyesuaian alokasi anggaran untuk mendukung pencapaian target dan sasaran yang telah ditetapkan dalam Rencana Kerja.
          </p>
          <p>
            Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-amber-700">Pagu Anggaran Berubah</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-amber-50">
              <TableRow className="hover:bg-amber-50">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Pembebanan</TableHead>
                <TableHead className="w-1/3">Uraian</TableHead>
                <TableHead>Detail Perubahan</TableHead>
                <TableHead className="text-right">Jumlah Semula</TableHead>
                <TableHead className="text-right">Jumlah Menjadi</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
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
                    <TableRow key={item.id} className="py-1 hover:bg-amber-50/50">
                      <TableCell className="py-2">{index + 1}</TableCell>
                      <TableCell className="py-2">{item.programPembebanan || '-'}</TableCell>
                      <TableCell className="py-2">{item.uraian}</TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs space-y-0.5">
                          {changes.map((change, idx) => (
                            <div key={idx}>{change}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-2">{formatCurrency(item.jumlahSemula)}</TableCell>
                      <TableCell className="text-right py-2">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                      <TableCell className={`text-right py-2 ${item.selisih !== 0 ? 'text-red-600 font-semibold' : ''}`}>
                        {formatCurrency(item.selisih)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {changedItems.length > 0 && (
                <TableRow className="font-semibold border-t-2 border-amber-200">
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalSemulaChanged)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalMenjadiChanged)}</TableCell>
                  <TableCell className={`text-right ${totalSelisihChanged !== 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(totalSelisihChanged)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-green-700">Pagu Anggaran Baru</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-green-50">
              <TableRow className="hover:bg-green-50">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Pembebanan</TableHead>
                <TableHead className="w-1/3">Uraian</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {newItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Tidak ada anggaran baru</TableCell>
                </TableRow>
              ) : (
                newItems.map((item, index) => (
                  <TableRow key={item.id} className="py-1 hover:bg-green-50/50">
                    <TableCell className="py-2">{index + 1}</TableCell>
                    <TableCell className="py-2">{item.programPembebanan || '-'}</TableCell>
                    <TableCell className="py-2">{item.uraian}</TableCell>
                    <TableCell className="text-right py-2">{item.volumeMenjadi}</TableCell>
                    <TableCell className="py-2">{item.satuanMenjadi}</TableCell>
                    <TableCell className="text-right py-2">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
                    <TableCell className="text-right py-2">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  </TableRow>
                ))
              )}
              {newItems.length > 0 && (
                <TableRow className="font-semibold border-t-2 border-green-200">
                  <TableCell colSpan={6}>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalMenjadiNew)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BudgetChangesSummary;
