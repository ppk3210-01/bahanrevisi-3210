
import React from 'react';
import { BudgetItem } from '@/types/budget';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/budgetCalculations';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { 
  FileImage, 
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface BudgetChangesSummaryProps {
  items: BudgetItem[];
}

const BudgetChangesSummary: React.FC<BudgetChangesSummaryProps> = ({ items }) => {
  // Calculate summary data
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  // Group by status
  const unchangedItems = items.filter(item => item.status === 'unchanged');
  const changedItems = items.filter(item => item.status === 'changed');
  const newItems = items.filter(item => item.status === 'new');
  const deletedItems = items.filter(item => item.status === 'deleted');
  
  const totalUnchangedSemula = unchangedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalUnchangedMenjadi = unchangedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  
  const totalChangedSemula = changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalChangedMenjadi = changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalChangedSelisih = totalChangedMenjadi - totalChangedSemula;
  
  const totalNewSemula = newItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalNewMenjadi = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalNewSelisih = totalNewMenjadi - totalNewSemula;
  
  const totalDeletedSemula = deletedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalDeletedMenjadi = deletedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalDeletedSelisih = totalDeletedMenjadi - totalDeletedSemula;

  // Create conclusion text
  const getConclusionText = () => {
    const totalItemsChanged = changedItems.length + newItems.length + deletedItems.length;
    const changeDirection = totalSelisih > 0 ? "bertambah" : totalSelisih < 0 ? "berkurang" : "tetap";
    
    return (
      <div className="space-y-2 text-sm">
        <p>
          Berdasarkan hasil analisis terhadap alokasi anggaran, total pagu anggaran semula sebesar {formatCurrency(totalSemula)} 
          mengalami perubahan menjadi {formatCurrency(totalMenjadi)}, dengan selisih {formatCurrency(Math.abs(totalSelisih))} 
          atau {changeDirection}.
        </p>
        <p>
          Perubahan ini terdiri dari {changedItems.length} komponen anggaran yang mengalami penyesuaian nilai, 
          {newItems.length} komponen anggaran baru yang ditambahkan, dan {deletedItems.length} komponen anggaran yang dihapus.
        </p>
        <p>
          Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan 
          prioritas program dan kegiatan yang telah ditetapkan. Dengan adanya {totalItemsChanged} perubahan ini, 
          diharapkan pelaksanaan program dapat berjalan dengan lebih efektif dan efisien.
        </p>
        <p>
          Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
        </p>
      </div>
    );
  };

  // Function to get combined pembebanan code
  const getCombinedPembebananCode = (item: BudgetItem): string => {
    // Create combined code format: ProgramPembebanan.KomponenOutput.SubKomponen.A.Akun
    const program = item.programPembebanan || '';
    const komponen = item.komponenOutput || '';
    const subKomponen = item.subKomponen || '';
    const akun = item.akun || '';
    
    if (program && komponen && subKomponen && akun) {
      return `${program}.${komponen}.${subKomponen}.A.${akun}`;
    }
    
    return program || '-';
  };

  // Export to JPEG functionality
  const exportToJPEG = async () => {
    const summaryDiv = document.getElementById('budget-changes-summary');
    if (!summaryDiv) return;

    try {
      // Use html2canvas to convert the summary to an image
      const canvas = await html2canvas(summaryDiv, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Convert to data URL and trigger download
      const image = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Ringkasan_Perubahan_Anggaran_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error exporting to JPEG:', error);
    }
  };

  // Export to PDF functionality
  const exportToPDF = () => {
    const summaryDiv = document.getElementById('budget-changes-summary');
    if (!summaryDiv) return;

    try {
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Ringkasan Perubahan Pagu Anggaran', 14, 20);
      
      // Tables for changed items
      if (changedItems.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Pagu Anggaran Berubah', 14, 30);
        
        // Changed items table data
        const changedHeaders = [['No', 'Pembebanan', 'Uraian', 'Detail Perubahan', 'Jumlah Semula', 'Jumlah Menjadi', 'Selisih']];
        const changedData = changedItems.map((item, index) => {
          const volumeChanged = item.volumeSemula !== item.volumeMenjadi;
          const satuanChanged = item.satuanSemula !== item.satuanMenjadi;
          const hargaChanged = item.hargaSatuanSemula !== item.hargaSatuanMenjadi;
          
          let detailPerubahan = "";
          if (volumeChanged) detailPerubahan += `Volume: ${item.volumeSemula} → ${item.volumeMenjadi}\n`;
          if (satuanChanged) detailPerubahan += `Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}\n`;
          if (hargaChanged) detailPerubahan += `Harga: ${formatCurrency(item.hargaSatuanSemula)} → ${formatCurrency(item.hargaSatuanMenjadi)}`;
          
          return [
            index + 1,
            getCombinedPembebananCode(item),
            item.uraian,
            detailPerubahan,
            formatCurrency(item.jumlahSemula),
            formatCurrency(item.jumlahMenjadi),
            formatCurrency(item.jumlahMenjadi - item.jumlahSemula)
          ];
        });
        
        // Generate table
        pdf.autoTable({
          head: changedHeaders,
          body: changedData,
          startY: 35,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 30 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
            6: { cellWidth: 20 },
          },
        });
      }
      
      // New items table
      if (newItems.length > 0) {
        // Fix: Don't use pdf.autoTable.previous which doesn't exist
        // Instead, track the Y position manually or use a constant offset
        let startY = 35; // Default starting position
        
        // If we already added the changed items table, add some spacing
        if (changedItems.length > 0) {
          startY = 180; // Estimate a reasonable position after the previous table
        }
        
        pdf.setFontSize(12);
        pdf.text('Pagu Anggaran Baru', 14, startY);
        
        // New items table data
        const newHeaders = [['No', 'Pembebanan', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']];
        const newData = newItems.map((item, index) => [
          index + 1,
          getCombinedPembebananCode(item),
          item.uraian,
          item.volumeMenjadi,
          item.satuanMenjadi,
          formatCurrency(item.hargaSatuanMenjadi),
          formatCurrency(item.jumlahMenjadi)
        ]);
        
        // Add total row
        const totalAmount = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
        newData.push(['Total', '', '', '', '', '', formatCurrency(totalAmount)]);
        
        // Generate table
        pdf.autoTable({
          head: newHeaders,
          body: newData,
          startY: startY + 5,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 25 },
            6: { cellWidth: 25 },
          },
        });
      }
      
      // Save PDF
      pdf.save(`Ringkasan_Perubahan_Anggaran_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return (
    <div id="budget-changes-summary" className="space-y-6">
      {/* Conclusion Card - Kept as requested */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardDescription className="text-blue-800 font-medium text-base">Kesimpulan</CardDescription>
        </CardHeader>
        <CardContent>
          {getConclusionText()}
        </CardContent>
      </Card>

      {/* Export buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={exportToJPEG} className="flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          Export JPEG
        </Button>
        <Button variant="outline" onClick={exportToPDF} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Changed Items Table */}
      {changedItems.length > 0 && (
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold text-orange-700 mb-3">Pagu Anggaran Berubah</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead className="w-36">Pembebanan</TableHead>
                  <TableHead className="w-64">Uraian</TableHead>
                  <TableHead className="w-48">Detail Perubahan</TableHead>
                  <TableHead className="text-right">Jumlah Semula</TableHead>
                  <TableHead className="text-right">Jumlah Menjadi</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changedItems.map((item, index) => {
                  const volumeChanged = item.volumeSemula !== item.volumeMenjadi;
                  const satuanChanged = item.satuanSemula !== item.satuanMenjadi;
                  const hargaChanged = item.hargaSatuanSemula !== item.hargaSatuanMenjadi;
                  
                  let detailPerubahan = "";
                  if (volumeChanged) detailPerubahan += `Volume: ${item.volumeSemula} → ${item.volumeMenjadi}\n`;
                  if (satuanChanged) detailPerubahan += `Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}\n`;
                  if (hargaChanged) detailPerubahan += `Harga: ${formatCurrency(item.hargaSatuanSemula)} → ${formatCurrency(item.hargaSatuanMenjadi)}`;
                  
                  const selisih = item.jumlahMenjadi - item.jumlahSemula;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{getCombinedPembebananCode(item)}</TableCell>
                      <TableCell>{item.uraian}</TableCell>
                      <TableCell className="whitespace-pre-line">{detailPerubahan}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.jumlahSemula)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                      <TableCell className={`text-right ${selisih < 0 ? 'text-red-600' : selisih > 0 ? 'text-green-600' : ''}`}>
                        {selisih < 0 ? `-${formatCurrency(Math.abs(selisih))}` : formatCurrency(selisih)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* New Items Table */}
      {newItems.length > 0 && (
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold text-green-700 mb-3">Pagu Anggaran Baru</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead className="w-36">Pembebanan</TableHead>
                  <TableHead className="w-64">Uraian</TableHead>
                  <TableHead className="text-center">Volume</TableHead>
                  <TableHead className="text-center">Satuan</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{getCombinedPembebananCode(item)}</TableCell>
                    <TableCell>{item.uraian}</TableCell>
                    <TableCell className="text-center">{item.volumeMenjadi}</TableCell>
                    <TableCell className="text-center">{item.satuanMenjadi}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.hargaSatuanMenjadi)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0))}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Anggaran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Semula:</span>
                <span className="font-medium">{formatCurrency(totalSemula)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Menjadi:</span>
                <span className="font-medium">{formatCurrency(totalMenjadi)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selisih:</span>
                <span className={`font-medium ${totalSelisih !== 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(totalSelisih)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jumlah Item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Item:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Tidak Berubah:</span>
                <span className="font-medium">{unchangedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Berubah:</span>
                <span className="font-medium">{changedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Baru:</span>
                <span className="font-medium">{newItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Dihapus:</span>
                <span className="font-medium">{deletedItems.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetChangesSummary;
