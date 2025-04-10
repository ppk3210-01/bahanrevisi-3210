
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { BudgetSummaryRecord } from '@/types/database';

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BudgetItem[];
  summaryData?: BudgetSummaryRecord[];
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({ 
  open, 
  onOpenChange,
  items,
  summaryData = []
}) => {
  // Calculate summary data
  const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  const newItems = items.filter(item => item.status === 'new').length;
  const changedItems = items.filter(item => item.status === 'changed').length;
  const deletedItems = items.filter(item => item.status === 'deleted').length;
  
  const getSelisihDescription = (selisih: number): string => {
    if (selisih > 0) return 'Bertambah';
    if (selisih < 0) return 'Berkurang';
    return 'Tetap';
  };

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

  const handleExportAll = () => {
    const workbook = XLSX.utils.book_new();
    
    // Create summary sheet
    const summarySheet = createSummarySheet(items);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan Total");
    
    // Create changed items sheet
    const changedItemsSheet = createChangedItemsSheet(items);
    XLSX.utils.book_append_sheet(workbook, changedItemsSheet, "Anggaran Berubah");
    
    // Create new items sheet
    const newItemsSheet = createNewItemsSheet(items);
    XLSX.utils.book_append_sheet(workbook, newItemsSheet, "Anggaran Baru");
    
    // Create detailed items sheet
    const itemsSheet = createItemsSheet(items);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Detail Anggaran");
    
    // Create account group summary sheet if available
    const accountGroupItems = summaryData.filter(item => 'account_group' in item);
    if (accountGroupItems.length > 0) {
      const accountGroupSheet = createGroupSummarySheet(accountGroupItems, 'Kelompok Akun');
      XLSX.utils.book_append_sheet(workbook, accountGroupSheet, "Ringkasan Kelompok Akun");
    }
    
    // Create program_pembebanan summary sheet if available
    const programItems = summaryData.filter(item => 'program_pembebanan' in item);
    if (programItems.length > 0) {
      const programSheet = createGroupSummarySheet(programItems, 'Program Pembebanan');
      XLSX.utils.book_append_sheet(workbook, programSheet, "Ringkasan Program");
    }
    
    // Create kegiatan summary sheet if available
    const kegiatanItems = summaryData.filter(item => 'kegiatan' in item);
    if (kegiatanItems.length > 0) {
      const kegiatanSheet = createGroupSummarySheet(kegiatanItems, 'Kegiatan');
      XLSX.utils.book_append_sheet(workbook, kegiatanSheet, "Ringkasan Kegiatan");
    }
    
    // Create rincian_output summary sheet if available
    const rincianItems = summaryData.filter(item => 'rincian_output' in item);
    if (rincianItems.length > 0) {
      const rincianSheet = createGroupSummarySheet(rincianItems, 'Rincian Output');
      XLSX.utils.book_append_sheet(workbook, rincianSheet, "Ringkasan Rincian Output");
    }
    
    // Create komponen summary sheet if available
    const komponentItems = summaryData.filter(item => 'komponen_output' in item);
    if (komponentItems.length > 0) {
      const komponenSheet = createGroupSummarySheet(komponentItems, 'Komponen Output');
      XLSX.utils.book_append_sheet(workbook, komponenSheet, "Ringkasan Komponen Output");
    }
    
    // Create sub_komponen summary sheet if available
    const subKomponenItems = summaryData.filter(item => 'sub_komponen' in item);
    if (subKomponenItems.length > 0) {
      const subKomponenSheet = createGroupSummarySheet(subKomponenItems, 'Sub Komponen');
      XLSX.utils.book_append_sheet(workbook, subKomponenSheet, "Ringkasan Sub Komponen");
    }
    
    // Create akun summary sheet if available
    const akunItems = summaryData.filter(item => 'akun' in item);
    if (akunItems.length > 0) {
      const akunSheet = createGroupSummarySheet(akunItems, 'Akun');
      XLSX.utils.book_append_sheet(workbook, akunSheet, "Ringkasan Akun");
    }
    
    // Write to file and download
    XLSX.writeFile(workbook, "Ringkasan_Anggaran.xlsx");
  };

  // Create a sheet with overall summary
  const createSummarySheet = (items: BudgetItem[]) => {
    const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
    const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
    const totalSelisih = totalMenjadi - totalSemula;
    
    const newItems = items.filter(item => item.status === 'new').length;
    const changedItems = items.filter(item => item.status === 'changed').length;
    const deletedItems = items.filter(item => item.status === 'deleted').length;
    
    const data = [
      ["Ringkasan Perubahan Pagu Anggaran", "", ""],
      ["", "", ""],
      ["Total Pagu Semula", roundToThousands(totalSemula), ""],
      ["Total Pagu Menjadi", roundToThousands(totalMenjadi), ""],
      ["Selisih", roundToThousands(totalSelisih), totalSelisih > 0 ? "Bertambah" : totalSelisih < 0 ? "Berkurang" : "Tetap"],
      ["", "", ""],
      ["Kesimpulan", "", ""],
      [`Total Pagu anggaran semula sebesar ${formatCurrency(roundToThousands(totalSemula))} berubah menjadi ${formatCurrency(roundToThousands(totalMenjadi))}, dengan selisih sebesar ${formatCurrency(roundToThousands(totalSelisih))}.`, "", ""],
      [`Terdapat ${changedItems} detil anggaran yang diubah, ${newItems} detil anggaran baru, dan ${deletedItems} detil anggaran yang dihapus.`, "", ""],
      ["Perubahan ini menyebabkan perubahan pada total Pagu anggaran.", "", ""],
      ["", "", ""],
      ["Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.", "", ""],
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 50 },  // Column A width
      { wch: 20 },  // Column B width
      { wch: 15 },  // Column C width
    ];
    
    // Apply currency formatting
    ["B3", "B4", "B5"].forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].z = '#,##0.00';
      }
    });
    
    return worksheet;
  };

  // Create a sheet with changed items
  const createChangedItemsSheet = (items: BudgetItem[]) => {
    const headers = [
      "No",
      "Pembebanan",
      "Uraian",
      "Detail Perubahan",
      "Jumlah Semula",
      "Jumlah Menjadi",
      "Selisih"
    ];
    
    const changedItems = items.filter(item => item.status === 'changed');
    
    const data = changedItems.map((item, index) => {
      const volumeChanged = item.volumeSemula !== item.volumeMenjadi;
      const satuanChanged = item.satuanSemula !== item.satuanMenjadi;
      const hargaChanged = item.hargaSatuanSemula !== item.hargaSatuanMenjadi;
      
      let detailPerubahan = "";
      if (volumeChanged) detailPerubahan += `Volume: ${item.volumeSemula} → ${item.volumeMenjadi}\n`;
      if (satuanChanged) detailPerubahan += `Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}\n`;
      if (hargaChanged) detailPerubahan += `Harga: ${item.hargaSatuanSemula} → ${item.hargaSatuanMenjadi}`;
      
      return [
        index + 1,
        getCombinedPembebananCode(item), // Use combined format here
        item.uraian,
        detailPerubahan,
        item.jumlahSemula,
        item.jumlahMenjadi,
        item.jumlahMenjadi - item.jumlahSemula
      ];
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 40 },  // Pembebanan (wider for the combined code)
      { wch: 40 },  // Uraian
      { wch: 40 },  // Detail Perubahan
      { wch: 20 },  // Jumlah Semula
      { wch: 20 },  // Jumlah Menjadi
      { wch: 20 },  // Selisih
    ];
    
    return worksheet;
  };

  // Create a sheet with new budget items
  const createNewItemsSheet = (items: BudgetItem[]) => {
    const headers = [
      "No",
      "Pembebanan",
      "Uraian",
      "Volume",
      "Satuan",
      "Harga Satuan",
      "Jumlah"
    ];
    
    const newItems = items.filter(item => item.status === 'new');
    
    const data = newItems.map((item, index) => [
      index + 1,
      getCombinedPembebananCode(item), // Use combined format here
      item.uraian,
      item.volumeMenjadi,
      item.satuanMenjadi,
      item.hargaSatuanMenjadi,
      item.jumlahMenjadi
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 40 },  // Pembebanan (wider for the combined code)
      { wch: 40 },  // Uraian
      { wch: 10 },  // Volume
      { wch: 15 },  // Satuan
      { wch: 20 },  // Harga Satuan
      { wch: 20 },  // Jumlah
    ];
    
    return worksheet;
  };

  // Create a sheet with all budget items
  const createItemsSheet = (items: BudgetItem[]) => {
    const headers = [
      "Komponen Output",
      "Sub Komponen",
      "Akun",
      "Uraian",
      "Volume Semula",
      "Satuan Semula", 
      "Harga Satuan Semula",
      "Jumlah Semula",
      "Volume Menjadi", 
      "Satuan Menjadi",
      "Harga Satuan Menjadi",
      "Jumlah Menjadi",
      "Selisih",
      "Status"
    ];
    
    const data = items.map(item => [
      item.komponenOutput,
      item.subKomponen,
      item.akun,
      item.uraian,
      item.volumeSemula,
      item.satuanSemula,
      item.hargaSatuanSemula,
      item.jumlahSemula,
      item.volumeMenjadi,
      item.satuanMenjadi,
      item.hargaSatuanMenjadi,
      item.jumlahMenjadi,
      item.jumlahMenjadi - item.jumlahSemula, // Calculate selisih correctly
      item.status
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Komponen Output
      { wch: 15 }, // Sub Komponen
      { wch: 15 }, // Akun
      { wch: 40 }, // Uraian
      { wch: 15 }, // Volume Semula
      { wch: 15 }, // Satuan Semula
      { wch: 20 }, // Harga Satuan Semula
      { wch: 20 }, // Jumlah Semula
      { wch: 15 }, // Volume Menjadi
      { wch: 15 }, // Satuan Menjadi
      { wch: 20 }, // Harga Satuan Menjadi
      { wch: 20 }, // Jumlah Menjadi
      { wch: 20 }, // Selisih
      { wch: 15 }, // Status
    ];
    
    // Apply number formatting to numeric columns
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C of [4, 6, 7, 8, 10, 11, 12]) {
        const cell_address = {c: C, r: R};
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (worksheet[cell_ref]) {
          worksheet[cell_ref].z = '#,##0.00';
        }
      }
    }
    
    return worksheet;
  };

  // Create a sheet with group summaries (account groups, komponens, or akuns)
  const createGroupSummarySheet = (groupData: BudgetSummaryRecord[], groupType: string) => {
    let headers: string[];
    let dataRows: any[] = [];

    headers = [
      groupType,
      "Pagu Semula",
      "Pagu Menjadi",
      "Selisih",
      "Item Bertambah",
      "Item Berubah",
      "Jumlah Item"
    ];

    groupData.forEach(record => {
      let rowData: any[] = [];
      
      if ('account_group' in record) {
        rowData = [
          record.account_group,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      } else if ('komponen_output' in record) {
        rowData = [
          record.komponen_output,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      } else if ('akun' in record) {
        rowData = [
          record.akun,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      } else if ('program_pembebanan' in record) {
        rowData = [
          record.program_pembebanan,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      } else if ('kegiatan' in record) {
        rowData = [
          record.kegiatan,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      } else if ('rincian_output' in record) {
        rowData = [
          record.rincian_output,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      } else if ('sub_komponen' in record) {
        rowData = [
          record.sub_komponen,
          record.total_semula,
          record.total_menjadi,
          record.total_selisih,
          record.new_items,
          record.changed_items,
          record.total_items
        ];
      }
      
      if (rowData.length > 0) {
        dataRows.push(rowData);
      }
    });
    
    // Add total row
    const totalSemula = dataRows.reduce((sum, row) => sum + (row[1] || 0), 0);
    const totalMenjadi = dataRows.reduce((sum, row) => sum + (row[2] || 0), 0);
    const totalSelisih = totalMenjadi - totalSemula; // Calculate total selisih correctly
    const totalNewItems = dataRows.reduce((sum, row) => sum + (row[4] || 0), 0);
    const totalChangedItems = dataRows.reduce((sum, row) => sum + (row[5] || 0), 0);
    const totalItems = dataRows.reduce((sum, row) => sum + (row[6] || 0), 0);
    
    dataRows.push([
      "TOTAL",
      totalSemula,
      totalMenjadi,
      totalSelisih,
      totalNewItems,
      totalChangedItems,
      totalItems
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Group name
      { wch: 20 }, // Pagu Semula
      { wch: 20 }, // Pagu Menjadi
      { wch: 20 }, // Selisih
      { wch: 15 }, // Item Bertambah
      { wch: 15 }, // Item Berubah
      { wch: 15 }, // Jumlah Item
    ];
    
    // Apply number formatting to numeric columns
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C of [1, 2, 3]) {
        const cell_address = {c: C, r: R};
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (worksheet[cell_ref]) {
          worksheet[cell_ref].z = '#,##0.00';
        }
      }
    }
    
    return worksheet;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Ringkasan Perubahan Pagu Anggaran</DialogTitle>
        </DialogHeader>
        
        {/* Display summary data according to the image */}
        <div className="space-y-4 p-4">
          {/* Kesimpulan section - moved to the top as requested */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Kesimpulan</h3>
            <p className="text-sm mb-2">
              Total Pagu anggaran semula sebesar {formatCurrency(roundToThousands(totalSemula))} berubah menjadi {formatCurrency(roundToThousands(totalMenjadi))}, dengan selisih sebesar {formatCurrency(roundToThousands(totalSelisih))}.
            </p>
            <p className="text-sm mb-2">
              Terdapat {changedItems} detil anggaran yang diubah, {newItems} detil anggaran baru, dan {deletedItems} detil anggaran yang dihapus.
            </p>
            <p className="text-sm mb-2">
              Perubahan ini diperlukan untuk mengoptimalkan alokasi anggaran sesuai dengan prioritas program dan kegiatan.
            </p>
            <p className="text-sm">
              Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white border rounded-md p-4 w-full md:w-[30%] flex-grow">
              <div className="text-sm font-medium mb-2">Total Pagu Semula</div>
              <div className="text-lg font-bold">{formatCurrency(roundToThousands(totalSemula))}</div>
            </div>
            
            <div className="bg-white border rounded-md p-4 w-full md:w-[30%] flex-grow">
              <div className="text-sm font-medium mb-2">Total Pagu Menjadi</div>
              <div className="text-lg font-bold">{formatCurrency(roundToThousands(totalMenjadi))}</div>
            </div>
            
            <div className={`border rounded-md p-4 w-full md:w-[30%] flex-grow ${totalSelisih > 0 ? 'bg-red-50' : totalSelisih < 0 ? 'bg-blue-50' : 'bg-white'}`}>
              <div className="text-sm font-medium mb-2">Selisih</div>
              <div className={`text-lg font-bold ${totalSelisih > 0 ? 'text-red-600' : totalSelisih < 0 ? 'text-blue-600' : ''}`}>
                {formatCurrency(roundToThousands(totalSelisih))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="default"
              onClick={handleExportAll}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              <span>Export Excel</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
