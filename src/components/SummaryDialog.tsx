
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
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
  const handleExportAll = () => {
    const workbook = XLSX.utils.book_new();
    
    // Create summary sheet
    const summarySheet = createSummarySheet(items);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan Total");
    
    // Create detailed items sheet
    const itemsSheet = createItemsSheet(items);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Detail Anggaran");
    
    // Create account group summary sheet if available
    const accountGroupItems = summaryData.filter(item => 'account_group' in item);
    if (accountGroupItems.length > 0) {
      const accountGroupSheet = createGroupSummarySheet(accountGroupItems, 'Kelompok Akun');
      XLSX.utils.book_append_sheet(workbook, accountGroupSheet, "Ringkasan Kelompok Akun");
    }
    
    // Create komponen summary sheet if available
    const komponentItems = summaryData.filter(item => 'komponen_output' in item);
    if (komponentItems.length > 0) {
      const komponenSheet = createGroupSummarySheet(komponentItems, 'Komponen Output');
      XLSX.utils.book_append_sheet(workbook, komponenSheet, "Ringkasan Komponen Output");
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
    
    const data = [
      ["Ringkasan Total Anggaran", "", ""],
      ["", "", ""],
      ["Total Pagu Semula", totalSemula, ""],
      ["Total Pagu Menjadi", totalMenjadi, ""],
      ["Total Selisih", totalSelisih, totalSelisih > 0 ? "Bertambah" : totalSelisih < 0 ? "Berkurang" : "Tetap"],
      ["", "", ""],
      ["Jumlah Item Baru", newItems, ""],
      ["Jumlah Item Berubah", changedItems, ""],
      ["Total Item", items.length, ""]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Column A width
      { wch: 20 }, // Column B width
      { wch: 15 }, // Column C width
    ];
    
    // Apply currency formatting
    ["C3", "C4", "C5"].forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].z = '#,##0.00';
      }
    });
    
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
      item.selisih,
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
      }
      
      if (rowData.length > 0) {
        dataRows.push(rowData);
      }
    });
    
    // Add total row
    const totalSemula = dataRows.reduce((sum, row) => sum + (row[1] || 0), 0);
    const totalMenjadi = dataRows.reduce((sum, row) => sum + (row[2] || 0), 0);
    const totalSelisih = totalMenjadi - totalSemula;
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
      { wch: 30 }, // Group name (account_group, komponen_output, or akun)
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
          <DialogTitle className="text-xl">Ekspor Ringkasan Anggaran</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          <p className="text-sm text-gray-600">
            Pilih opsi ekspor ringkasan anggaran ke Excel:
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="default"
              onClick={handleExportAll}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              <span>Ekspor Semua Data</span>
              <span className="ml-2 text-xs text-white opacity-75">
                (Termasuk Ringkasan Kelompok, Komponen & Akun)
              </span>
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Keterangan:</h3>
            <p className="text-sm text-gray-600">
              File Excel yang dihasilkan akan berisi beberapa sheet:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 pl-4">
              <li>Ringkasan Total - Rangkuman total anggaran</li>
              <li>Detail Anggaran - Semua item anggaran</li>
              <li>Ringkasan Kelompok Akun - Rangkuman per kelompok akun</li>
              <li>Ringkasan Komponen Output - Rangkuman per komponen output</li>
              <li>Ringkasan Akun - Rangkuman per akun</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
