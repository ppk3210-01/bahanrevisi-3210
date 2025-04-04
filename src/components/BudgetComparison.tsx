
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetFilter from './BudgetFilter';
import BudgetTable from './BudgetTable';
import SummaryDialog from './SummaryDialog';
import ExportOptions from './ExportOptions';
import BudgetSummaryBox from './BudgetSummaryBox';
import { FilterSelection } from '@/types/budget';
import useBudgetData from '@/hooks/useBudgetData';
import { formatCurrency } from '@/utils/budgetCalculations';

const BudgetComparison: React.FC = () => {
  const [filters, setFilters] = useState<FilterSelection>({
    programPembebanan: '',
    kegiatan: '',
    rincianOutput: '',
    komponenOutput: ''
  });

  // Get budget data based on filters
  const {
    budgetItems,
    loading,
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem
  } = useBudgetData(filters);

  // Calculate totals for summary box
  const totalSemula = budgetItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = budgetItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);

  // Function to handle filter changes
  const handleFilterChange = (newFilters: FilterSelection) => {
    setFilters(newFilters);
  };

  // Get selected komponen output name for display
  let selectedKomponenOutput = filters.komponenOutput;

  return (
    <div className="space-y-6">
      {/* Summary Box - Moved above filters */}
      {!loading && (
        <BudgetSummaryBox 
          totalSemula={totalSemula}
          totalMenjadi={totalMenjadi}
        />
      )}
      
      {/* Filters section */}
      <BudgetFilter onFilterChange={handleFilterChange} />
      
      {/* Budget table section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perbandingan Anggaran Semula vs Menjadi</CardTitle>
          <div className="flex space-x-2">
            <SummaryDialog items={budgetItems} />
            <ExportOptions items={budgetItems} komponenOutput={filters.komponenOutput} />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <BudgetTable
              items={budgetItems}
              komponenOutput={selectedKomponenOutput}
              onAdd={addBudgetItem}
              onUpdate={updateBudgetItem}
              onDelete={deleteBudgetItem}
              onApprove={approveBudgetItem}
              isLoading={loading}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Warning message when there's a difference */}
      {totalSemula !== totalMenjadi && (
        <div className="warning-box p-4 bg-amber-100 border border-amber-300 rounded-md text-amber-800">
          ⚠ PERINGATAN: Terjadi perbedaan total anggaran sebesar {formatCurrency(totalMenjadi - totalSemula)}
        </div>
      )}
    </div>
  );
};

export default BudgetComparison;
