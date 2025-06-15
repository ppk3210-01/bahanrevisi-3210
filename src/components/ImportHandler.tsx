
import React from 'react';
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import {
  findHeaderRow,
  mapColumnIndices,
  processDataRows,
  getFriendlyColumnNames
} from '@/utils/excelUtils';

interface ImportHandlerProps {
  onImport: (items: Partial<BudgetItem>[]) => Promise<void>;
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
  onComplete: () => void;
}

// Hook function for handling import
export const useImportHandler = ({
  onImport,
  komponenOutput,
  subKomponen,
  akun,
  onComplete
}: ImportHandlerProps) => {
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Convert to array of objects and validate
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        console.log("Excel rows:", rows);
        
        if (rows.length <= 1) {
          toast({
            title: "Data tidak lengkap",
            description: "File Excel tidak berisi data yang cukup.",
            variant: "destructive",
          });
          onComplete();
          return;
        }
        
        // Find the header row
        const { headerRowIndex, headerRowMatches } = findHeaderRow(rows);
        
        if (headerRowIndex === -1 || headerRowMatches < 3) {
          toast({
            title: "Format tidak valid",
            description: "File Excel tidak berisi header kolom yang diharapkan. Gunakan template yang disediakan.",
            variant: "destructive",
          });
          onComplete();
          return;
        }
        
        // Map column indices to column types
        const { columnIndices, missingRequiredColumns } = mapColumnIndices(rows[headerRowIndex]);
        
        if (missingRequiredColumns.length > 0) {
          const missingColumnsDisplay = getFriendlyColumnNames(missingRequiredColumns);
          
          toast({
            title: "Kolom tidak lengkap",
            description: `Kolom berikut tidak ditemukan: ${missingColumnsDisplay}`,
            variant: "destructive",
          });
          onComplete();
          return;
        }
        
        // Process data rows
        const dataRows = processDataRows(rows, headerRowIndex, columnIndices, komponenOutput, subKomponen, akun);
        
        console.log("Processed data rows with sisa anggaran:", dataRows);
        
        if (dataRows.length === 0) {
          toast({
            title: "Tidak ada data",
            description: "File Excel tidak berisi data item anggaran yang valid.",
            variant: "destructive",
          });
          onComplete();
          return;
        }
        
        // Log each item to verify sisaAnggaran is included
        dataRows.forEach((item, index) => {
          console.log(`Item ${index + 1} sisaAnggaran:`, item.sisaAnggaran);
        });
        
        // Ensure we're passing an array of items to onImport
        onImport(dataRows)
          .then(() => {
            toast({
              title: "Import berhasil",
              description: `Berhasil mengimport ${dataRows.length} item anggaran.`,
            });
            onComplete();
          })
          .catch((error) => {
            console.error("Import error:", error);
            toast({
              title: "Import gagal",
              description: "Terjadi kesalahan saat mengimport data.",
              variant: "destructive",
            });
            onComplete();
          });
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast({
          title: "Format tidak valid",
          description: "Terjadi kesalahan saat membaca file Excel.",
          variant: "destructive",
        });
        onComplete();
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast({
        title: "Error",
        description: "Gagal membaca file.",
        variant: "destructive",
      });
      onComplete();
    };
    
    reader.readAsArrayBuffer(file);
  };

  return { handleImportFile };
};
