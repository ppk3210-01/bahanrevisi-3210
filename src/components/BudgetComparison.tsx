
import React, { useState, useEffect } from 'react';
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
import BudgetImportExport from './BudgetImportExport';
import TableSearch from './TableSearch';

const BudgetComparison: React.FC = () => {
  const [filters, setFilters] = useState<FilterSelection>({
    programPembebanan: '',
    kegiatan: '',
    rincianOutput: '',
    komponenOutput: '',
    subKomponen: '',
    akun: ''
  });
  
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Get budget data based on filters
  const {
    budgetItems,
    loading,
    error,
    addBudgetItem,
    addBulkBudgetItems,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem
  } = useBudgetData(filters);

  // Filter items based on search term
  const filteredItems = searchTerm 
    ? budgetItems.filter(item => 
        item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.satuanSemula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.satuanMenjadi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.volumeSemula).includes(searchTerm) ||
        String(item.volumeMenjadi).includes(searchTerm) ||
        String(item.hargaSatuanSemula).includes(searchTerm) ||
        String(item.hargaSatuanMenjadi).includes(searchTerm) ||
        String(item.jumlahSemula).includes(searchTerm) ||
        String(item.jumlahMenjadi).includes(searchTerm) ||
        String(item.selisih).includes(searchTerm)
      )
    : budgetItems;

  // Calculate totals for summary box
  const totalSemula = filteredItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = filteredItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalSemula - totalMenjadi;
  const hasSelisih = totalSelisih !== 0;

  // Function to handle filter changes
  const handleFilterChange = (newFilters: FilterSelection) => {
    setFilters(newFilters);
    setSearchTerm('');
  };

  // Function to handle bulk import
  const handleBulkImport = (items: Omit<any, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[] | null) => {
    if (items && items.length > 0) {
      addBulkBudgetItems(items);
    }
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

  return (
    <div className="space-y-6">
      {/* Summary Box - Show above filters always */}
      <BudgetSummaryBox 
        totalSemula={totalSemula}
        totalMenjadi={totalMenjadi}
        totalSelisih={totalSelisih}
      />
      
      {/* Filters section */}
      <BudgetFilter onFilterChange={handleFilterChange} />
      
      {/* Budget table section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Perbandingan Anggaran Semula vs Menjadi</CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            <TableSearch onSearch={setSearchTerm} />
            <div className="flex space-x-2">
              <SummaryDialog items={filteredItems} />
              <BudgetImportExport 
                filters={filters} 
                onImport={handleBulkImport} 
                areFiltersComplete={areFiltersComplete} 
              />
              <ExportOptions items={filteredItems} komponenOutput={filters.komponenOutput} />
            </div>
          </div>
        </CardHeader>
        
        {hasSelisih && (
          <div className="px-6">
            <Alert variant="destructive" className="bg-red-50 border-red-200 mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">PERINGATAN: Terjadi perbedaan total anggaran sebesar {Math.abs(totalSelisih).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </Alert>
          </div>
        )}
        
        <CardContent>
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <BudgetTable
              items={filteredItems}
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
