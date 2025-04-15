
import React from 'react';
import { BudgetItem } from '@/types/budget';
import { BudgetSummaryRecord } from '@/types/database';
import { utils, WorkBook, WorkSheet } from 'xlsx';

interface SummaryExportProps {
  items: BudgetItem[];
  summaryData: BudgetSummaryRecord[];
  onComplete: () => void;
}

export const useSummaryExport = ({ items, summaryData, onComplete }: SummaryExportProps) => {
  const createChangesWorksheet = (): WorkSheet => {
    const changedItems = items.filter(item => item.status === 'changed');
    const newItems = items.filter(item => item.status === 'new');
    const deletedItems = items.filter(item => item.status === 'deleted');
    
    const totalSemula = items.reduce((sum, item) => sum + item.jumlahSemula, 0);
    const totalMenjadi = items.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
    const totalSelisih = totalMenjadi - totalSemula;
    
    const totalChangedSemula = changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
    const totalChangedMenjadi = changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
    const totalNewMenjadi = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
    const totalDeletedSemula = deletedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
    
    // Summary data
    const summaryRows = [
      ["RINGKASAN PERUBAHAN PAGU ANGGARAN", "", "", ""],
      ["", "", "", ""],
      ["Total Pagu Semula", totalSemula, "", ""],
      ["Total Pagu Menjadi", totalMenjadi, "", ""],
      ["Selisih", totalSelisih, "", ""],
      ["", "", "", ""],
      ["Komponen yang diubah", changedItems.length, "", ""],
      ["Komponen yang ditambah", newItems.length, "", ""],
      ["Komponen yang dihapus", deletedItems.length, "", ""],
      ["Total perubahan", changedItems.length + newItems.length + deletedItems.length, "", ""],
      ["", "", "", ""],
      ["Nilai Komponen yang diubah (semula)", totalChangedSemula, "", ""],
      ["Nilai Komponen yang diubah (menjadi)", totalChangedMenjadi, "", ""],
      ["Nilai Komponen yang ditambah", totalNewMenjadi, "", ""],
      ["Nilai Komponen yang dihapus", totalDeletedSemula, "", ""],
      ["", "", "", ""],
      ["DAFTAR KOMPONEN YANG DIUBAH", "", "", ""],
      ["Uraian", "Semula", "Menjadi", "Selisih"],
    ];
    
    // Add changed items
    changedItems.forEach(item => {
      summaryRows.push([
        item.uraian,
        item.jumlahSemula,
        item.jumlahMenjadi,
        item.selisih
      ]);
    });
    
    // Add spacing and new items header
    summaryRows.push(
      ["", "", "", ""],
      ["DAFTAR KOMPONEN YANG DITAMBAH", "", "", ""],
      ["Uraian", "", "Jumlah", ""]
    );
    
    // Add new items
    newItems.forEach(item => {
      summaryRows.push([
        item.uraian,
        "",
        item.jumlahMenjadi,
        ""
      ]);
    });
    
    // Add spacing and deleted items header
    summaryRows.push(
      ["", "", "", ""],
      ["DAFTAR KOMPONEN YANG DIHAPUS", "", "", ""],
      ["Uraian", "Jumlah", "", ""]
    );
    
    // Add deleted items
    deletedItems.forEach(item => {
      summaryRows.push([
        item.uraian,
        item.jumlahSemula,
        "",
        ""
      ]);
    });
    
    const ws = utils.aoa_to_sheet(summaryRows);
    return ws;
  };
  
  const createSummaryWorksheet = (data: BudgetSummaryRecord[], title: string): WorkSheet => {
    const headers = ['Nama', 'Total Semula', 'Total Menjadi', 'Total Selisih', 'Item Baru', 'Item Diubah', 'Total Item'];
    
    // Construct data rows with proper field mapping based on summary type
    const rowsData: any[][] = data.map(item => {
      const name = 
        item.type === 'komponen_output' ? (item.komponen_output || '-') :
        item.type === 'akun' ? (item.akun || '-') :
        item.type === 'program_pembebanan' ? (item.program_pembebanan || '-') :
        item.type === 'kegiatan' ? (item.kegiatan || '-') :
        item.type === 'rincian_output' ? (item.rincian_output || '-') :
        item.type === 'sub_komponen' ? (item.sub_komponen || '-') :
        item.type === 'account_group' ? ((item as any).account_group_name || '-') :
        item.type === 'akun_group' ? ((item as any).akun_group_name || '-') :
        '-';
        
      return [
        name, 
        item.total_semula || 0,
        item.total_menjadi || 0,
        item.total_selisih || 0,
        item.new_items || 0,
        item.changed_items || 0,
        item.total_items || 0
      ];
    });
    
    const rows = [
      [title], 
      [''], 
      headers,
      ...rowsData
    ];
    
    return utils.aoa_to_sheet(rows);
  };
  
  const exportAllSummaries = () => {
    try {
      const wb: WorkBook = utils.book_new();
      
      // Add Changes worksheet
      const changesWs = createChangesWorksheet();
      utils.book_append_sheet(wb, changesWs, 'Ringkasan Perubahan');
      
      // Add Program Pembebanan worksheet
      const programPembebananData = summaryData.filter(item => item.type === 'program_pembebanan');
      const programPembebananWs = createSummaryWorksheet(programPembebananData, 'RINGKASAN BERDASARKAN PROGRAM PEMBEBANAN');
      utils.book_append_sheet(wb, programPembebananWs, 'Program Pembebanan');
      
      // Add Kegiatan worksheet
      const kegiatanData = summaryData.filter(item => item.type === 'kegiatan');
      const kegiatanWs = createSummaryWorksheet(kegiatanData, 'RINGKASAN BERDASARKAN KEGIATAN');
      utils.book_append_sheet(wb, kegiatanWs, 'Kegiatan');
      
      // Add Rincian Output worksheet
      const rincianOutputData = summaryData.filter(item => item.type === 'rincian_output');
      const rincianOutputWs = createSummaryWorksheet(rincianOutputData, 'RINGKASAN BERDASARKAN RINCIAN OUTPUT');
      utils.book_append_sheet(wb, rincianOutputWs, 'Rincian Output');
      
      // Add Komponen Output worksheet
      const komponenOutputData = summaryData.filter(item => item.type === 'komponen_output');
      const komponenOutputWs = createSummaryWorksheet(komponenOutputData, 'RINGKASAN BERDASARKAN KOMPONEN OUTPUT');
      utils.book_append_sheet(wb, komponenOutputWs, 'Komponen Output');
      
      // Add Sub Komponen worksheet
      const subKomponenData = summaryData.filter(item => item.type === 'sub_komponen');
      const subKomponenWs = createSummaryWorksheet(subKomponenData, 'RINGKASAN BERDASARKAN SUB KOMPONEN');
      utils.book_append_sheet(wb, subKomponenWs, 'Sub Komponen');
      
      // Add Akun worksheet
      const akunData = summaryData.filter(item => item.type === 'akun');
      const akunWs = createSummaryWorksheet(akunData, 'RINGKASAN BERDASARKAN AKUN');
      utils.book_append_sheet(wb, akunWs, 'Akun');
      
      // Add Akun Group worksheet
      const akunGroupData = summaryData.filter(item => item.type === 'akun_group');
      const akunGroupWs = createSummaryWorksheet(akunGroupData, 'RINGKASAN BERDASARKAN KELOMPOK AKUN');
      utils.book_append_sheet(wb, akunGroupWs, 'Kelompok Akun');
      
      // Add Account Group worksheet
      const accountGroupData = summaryData.filter(item => item.type === 'account_group');
      const accountGroupWs = createSummaryWorksheet(accountGroupData, 'RINGKASAN BERDASARKAN KELOMPOK BELANJA');
      utils.book_append_sheet(wb, accountGroupWs, 'Kelompok Belanja');
      
      // Create download link
      const date = new Date().toISOString().split('T')[0];
      utils.writeFile(wb, `Ringkasan_Anggaran_${date}.xlsx`);
      
      onComplete();
    } catch (error) {
      console.error('Error exporting summaries:', error);
    }
  };
  
  return { exportAllSummaries };
};
