import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Upload, 
  ListFilter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FilterSelection, 
  BudgetItem, 
  BudgetSummary 
} from '@/types/budget';
import { 
  generateBudgetSummary, 
  formatCurrency,
  roundToThousands
} from '@/utils/budgetCalculations';
import BudgetTable from '@/components/BudgetTable';
import BudgetSummaryBox from '@/components/BudgetSummaryBox';
import FilterPanel from '@/components/FilterPanel';
import SummaryDialog from '@/components/SummaryDialog';
import { useBudgetData } from '@/hooks/useBudgetData';
import { usePermissions } from '@/hooks/usePermissions';

const BudgetComparison = () => {
  const [selectedProgramPembebanan, setSelectedProgramPembebanan] = useState<string>('all');
  const [selectedKegiatan, setSelectedKegiatan] = useState<string>('all');
  const [selectedRincianOutput, setSelectedRincianOutput] = useState<string>('all');
  const [selectedKomponenOutput, setSelectedKomponenOutput] = useState<string>('all');
  const [selectedSubKomponen, setSelectedSubKomponen] = useState<string>('all');
  const [selectedAkun, setSelectedAkun] = useState<string>('all');
  const [importData, setImportData] = useState<Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]>([]);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState<boolean>(false);
  
  const formatFilterSelection = () => {
    return `Program: ${selectedProgramPembebanan}, Kegiatan: ${selectedKegiatan}, Rincian: ${selectedRincianOutput}, Komponen: ${selectedKomponenOutput}, SubKomponen: ${selectedSubKomponen}, Akun: ${selectedAkun}`;
  };

  const handleFilter = (filterType: string, value: string) => {
    switch (filterType) {
      case 'programPembebanan':
        setSelectedProgramPembebanan(value);
        break;
      case 'kegiatan':
        setSelectedKegiatan(value);
        break;
      case 'rincianOutput':
        setSelectedRincianOutput(value);
        break;
      case 'komponenOutput':
        setSelectedKomponenOutput(value);
        break;
      case 'subKomponen':
        setSelectedSubKomponen(value);
        break;
      case 'akun':
        setSelectedAkun(value);
        break;
      default:
        break;
    }
  };
  
  const areFiltersComplete = 
    selectedProgramPembebanan !== 'all' &&
    selectedKegiatan !== 'all' &&
    selectedRincianOutput !== 'all' &&
    selectedKomponenOutput !== 'all' &&
    selectedSubKomponen !== 'all' &&
    selectedAkun !== 'all';

  const filters: FilterSelection = {
    programPembebanan: selectedProgramPembebanan,
    kegiatan: selectedKegiatan,
    rincianOutput: selectedRincianOutput,
    komponenOutput: selectedKomponenOutput,
    subKomponen: selectedSubKomponen,
    akun: selectedAkun
  };

  const { 
    budgetItems, 
    loading: isLoading, 
    addBudgetItem: handleAddBudgetItem,
    updateBudgetItem: handleUpdateBudgetItem,
    deleteBudgetItem: handleDeleteBudgetItem,
    approveBudgetItem: handleApproveBudgetItem,
    rejectBudgetItem: handleRejectBudgetItem,
    importBudgetItems,
    getAllBudgetItems
  } = useBudgetData(filters);
  
  const [summary, setSummary] = useState<BudgetSummary>({
    totalSemula: 0,
    totalMenjadi: 0,
    totalSelisih: 0,
    changedItems: [],
    newItems: [],
    deletedItems: []
  });
  
  const [globalSummary, setGlobalSummary] = useState<BudgetSummary>({
    totalSemula: 0,
    totalMenjadi: 0,
    totalSelisih: 0,
    changedItems: [],
    newItems: [],
    deletedItems: []
  });
  
  const { canAccessImportExport } = usePermissions();
  
  useEffect(() => {
    const newSummary = generateBudgetSummary(budgetItems);
    setSummary(newSummary);
  }, [budgetItems]);
  
  useEffect(() => {
    const fetchAllData = async () => {
      const allItems = await getAllBudgetItems();
      const newGlobalSummary = generateBudgetSummary(allItems);
      setGlobalSummary(newGlobalSummary);
    };
    
    fetchAllData();
  }, [getAllBudgetItems]);

  const handleShowImportDialog = () => {
    setShowImportDialog(true);
  };

  const handleShowSummaryDialog = () => {
    setShowSummaryDialog(true);
  };

  const handleImportData = async () => {
    try {
      await importBudgetItems(importData);
      setShowImportDialog(false);
      setImportData([]);
    } catch (error) {
      console.error("Failed to import data:", error);
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(budgetItems, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "budget_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          if (Array.isArray(jsonData)) {
            // Validate each item in jsonData
            const validatedData = jsonData.map(item => ({
              uraian: item.uraian || '',
              volumeSemula: item.volumeSemula || 0,
              satuanSemula: item.satuanSemula || 'Paket',
              hargaSatuanSemula: item.hargaSatuanSemula || 0,
              volumeMenjadi: item.volumeMenjadi || 0,
              satuanMenjadi: item.satuanMenjadi || 'Paket',
              hargaSatuanMenjadi: item.hargaSatuanMenjadi || 0,
              komponenOutput: item.komponenOutput || selectedKomponenOutput,
              programPembebanan: item.programPembebanan || selectedProgramPembebanan,
              kegiatan: item.kegiatan || selectedKegiatan,
              rincianOutput: item.rincianOutput || selectedRincianOutput,
              subKomponen: item.subKomponen || selectedSubKomponen,
              akun: item.akun || selectedAkun
            }));
            setImportData(validatedData);
          } else {
            console.error("File format is invalid. Harus berupa array JSON.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  const findMostSignificantChange = (): string => {
    if (summary.changedItems.length === 0) {
      return 'Tidak ada perubahan signifikan.';
    }
    
    // Find the item with the largest absolute difference
    const mostChangedItem = summary.changedItems.reduce((prev, current) => {
      const prevChange = Math.abs(prev.selisih);
      const currentChange = Math.abs(current.selisih);
      return (prevChange > currentChange) ? prev : current;
    });
    
    return mostChangedItem.uraian;
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FilterPanel 
          onFilterChange={handleFilter} 
          isLoading={isLoading} 
        />
        
        <div className="rounded-lg bg-white shadow p-3">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-gray-700">Ringkasan Perubahan</h3>
            
            {canAccessImportExport() && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 text-xs h-7" 
                  onClick={handleShowImportDialog}
                >
                  <Upload className="h-3 w-3 mr-1" /> Import
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600 text-xs h-7" 
                  onClick={handleExportData}
                >
                  <Download className="h-3 w-3 mr-1" /> Export
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-xs space-y-1">
            {isLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <p>
                  {summary.totalSelisih > 0 
                    ? `Perubahan anggaran meningkatkan total anggaran sebesar ${formatCurrency(summary.totalSelisih)} (${((summary.totalSelisih / summary.totalSemula) * 100).toFixed(2)}%).`
                    : summary.totalSelisih < 0
                      ? `Perubahan anggaran menurunkan total anggaran sebesar ${formatCurrency(Math.abs(summary.totalSelisih))} (${((summary.totalSelisih / summary.totalSemula) * 100).toFixed(2)}%).`
                      : 'Perubahan anggaran tidak mengubah total anggaran (0%).'}
                </p>
                
                <p>
                  Terdapat {summary.changedItems.length} item yang dimodifikasi, 
                  {summary.newItems.length} item baru, dan {summary.deletedItems.length} item yang dihapus.
                </p>
                
                {summary.changedItems.length > 0 && (
                  <p>
                    Item yang paling signifikan berubah: {findMostSignificantChange()}
                  </p>
                )}
                
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShowSummaryDialog} 
                    className="text-xs h-7"
                  >
                    <ListFilter className="h-3 w-3 mr-1" /> Detail Perubahan
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <BudgetSummaryBox 
        totalSemula={globalSummary.totalSemula}
        totalMenjadi={globalSummary.totalMenjadi}
        totalSelisih={globalSummary.totalSelisih}
      />
      
      <div className="bg-white rounded-lg shadow">
        <BudgetTable 
          items={budgetItems}
          komponenOutput={selectedKomponenOutput}
          subKomponen={selectedSubKomponen}
          akun={selectedAkun}
          onAdd={handleAddBudgetItem}
          onUpdate={handleUpdateBudgetItem}
          onDelete={handleDeleteBudgetItem}
          onApprove={handleApproveBudgetItem}
          onReject={handleRejectBudgetItem}
          isLoading={isLoading}
          areFiltersComplete={areFiltersComplete}
        />
      </div>
      
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Data Anggaran</DialogTitle>
            <DialogDescription>
              Upload file untuk mengimpor data anggaran baru.
            </DialogDescription>
          </DialogHeader>
          
          <Input
            type="file"
            accept=".json"
            onChange={handleImportFileChange}
            className="mb-4"
          />
          
          {importData.length > 0 && (
            <div className="max-h-48 overflow-y-auto">
              <Label>Preview Data:</Label>
              <ul className="list-disc pl-5">
                {importData.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item.uraian} (Vol: {item.volumeMenjadi}, Harga: {item.hargaSatuanMenjadi})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
            >
              Batal
            </Button>
            <Button 
              type="button" 
              onClick={handleImportData} 
              disabled={!importData.length}
            >
              <Upload className="h-4 w-4 mr-2" /> Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Summary Dialog */}
      <SummaryDialog 
        open={showSummaryDialog} 
        onOpenChange={setShowSummaryDialog}
        summary={summary}
      />
    </div>
  );
};

export default BudgetComparison;
