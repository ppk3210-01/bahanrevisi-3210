
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { BudgetItem } from '@/types/budget';
import { FileSpreadsheet, Upload } from 'lucide-react';
import ExportOptions from './ExportOptions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTemplateWorkbook } from '@/utils/excelUtils';
import { useImportHandler } from './ImportHandler';
import { BudgetSummaryRecord } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface ExcelImportExportProps {
  items: BudgetItem[];
  onImport: (items: Partial<BudgetItem>[]) => Promise<void>;
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
  smallText?: boolean;
  summaryData?: BudgetSummaryRecord[];
}

const ExcelImportExport: React.FC<ExcelImportExportProps> = ({
  items,
  onImport,
  komponenOutput,
  subKomponen,
  akun,
  smallText = false,
  summaryData = []
}) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();

  const buttonClass = smallText ? "text-xs px-2 py-1 h-8" : "";
  
  const { handleImportFile } = useImportHandler({
    onImport,
    komponenOutput,
    subKomponen,
    akun,
    onComplete: () => {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  const downloadTemplate = () => {
    const wb = createTemplateWorkbook(komponenOutput, subKomponen, akun);
    XLSX.writeFile(wb, "Budget_Import_Template.xlsx");
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    handleImportFile(file);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className={`flex items-center ${buttonClass}`}
          size={smallText ? "sm" : undefined}
        >
          <FileSpreadsheet className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span>Download Template</span>
        </Button>
        
        {isAdmin && (
          <>
            <Button 
              variant="outline" 
              className={`flex items-center cursor-pointer ${buttonClass}`}
              size={smallText ? "sm" : undefined}
              onClick={triggerFileInput}
              disabled={isImporting}
            >
              <Upload className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              <span>Import Excel</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </>
        )}

        <Button
          variant="outline"
          className={`flex items-center ${buttonClass}`}
          size={smallText ? "sm" : undefined}
          onClick={() => setIsExportDialogOpen(true)}
        >
          <FileSpreadsheet className={`${smallText ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span>Export</span>
        </Button>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ekspor Data ke Excel</DialogTitle>
            <DialogDescription>
              Pilih opsi ekspor untuk data anggaran.
            </DialogDescription>
          </DialogHeader>
          <ExportOptions 
            items={items} 
            komponenOutput={komponenOutput || 'Default'}
            summaryData={summaryData}
            onClose={() => setIsExportDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExcelImportExport;
