
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetFilter from './BudgetFilter';
import BudgetTable from './BudgetTable';
import SummaryDialog from './SummaryDialog';
import BudgetSummaryBox from './BudgetSummaryBox';
import { FilterSelection } from '@/types/budget';
import useBudgetData from '@/hooks/useBudgetData';
import { Alert } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import ExportOptions from './ExportOptions';
import ExcelImportExport from './ExcelImportExport';

const BudgetComparison: React.FC = () => {
  const [filters, setFilters] = useState<FilterSelection>({
    programPembebanan: '',
    kegiatan: '',
    rincianOutput: '',
    komponenOutput: '',
    subKomponen: '',
    akun: ''
  });

  // Get budget data based on filters
  const {
    budgetItems,
    loading,
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem,
    importBudgetItems // We'll add this function to the hook
  } = useBudgetData(filters);

  // Calculate totals for summary box
  const totalSemula = budgetItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = budgetItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  const hasSelisih = totalSelisih !== 0;

  // Function to handle filter changes
  const handleFilterChange = (newFilters: FilterSelection) => {
    setFilters(newFilters);
  };

  // Check if all filters are set (not empty and not 'all')
  const areFiltersComplete = 
    filters.programPembebanan && 
    filters.programPembebanan !== 'all' &&
    filters.kegiatan && 
    filters.kegiatan !== 'all' &&
    filters.rincianOutput && 
    filters.rincianOutput !== 'all' &&
    filters.komponenOutput && 
    filters.komponenOutput !== 'all' &&
    filters.subKomponen && 
    filters.subKomponen !== 'all' &&
    filters.akun && 
    filters.akun !== 'all';

  // Handle bulk import
  const handleBulkImport = async (items: any[]) => {
    if (!areFiltersComplete) {
      return Promise.reject(new Error('Pilih semua filter terlebih dahulu'));
    }
    
    // We'll create this function in useBudgetData.ts
    return importBudgetItems(items);
  };

  return (
    <div className="space-y-6">
      {/* Summary Box - always shown at the top */}
      <BudgetSummaryBox 
        totalSemula={totalSemula}
        totalMenjadi={totalMenjadi}
        totalSelisih={totalSelisih}
      />
      
      {/* Filters section */}
      <BudgetFilter onFilterChange={handleFilterChange} />
      
      {/* Budget table section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Perbandingan Anggaran Semula vs Menjadi</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <ExcelImportExport 
              onImport={handleBulkImport}
              komponenOutput={filters.komponenOutput}
              subKomponen={filters.subKomponen}
              akun={filters.akun}
            />
            <div className="flex space-x-2">
              <SummaryDialog items={budgetItems} />
              <ExportOptions items={budgetItems} komponenOutput={filters.komponenOutput} />
            </div>
          </div>
        </CardHeader>
        
        {hasSelisih && (
          <div className="px-6">
            <Alert variant="destructive" className="bg-red-50 border-red-200 mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">PERINGATAN: Terjadi perbedaan total anggaran sebesar {totalSelisih.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </Alert>
          </div>
        )}
        
        <CardContent>
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <BudgetTable
              items={budgetItems}
              komponenOutput={filters.komponenOutput}
              onAdd={addBudgetItem}
              onUpdate={updateBudgetItem}
              onDelete={deleteBudgetItem}
              onApprove={approveBudgetItem}
              isLoading={loading}
              subKomponen={filters.subKomponen}
              akun={filters.akun}
              areFiltersComplete={areFiltersComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetComparison;
