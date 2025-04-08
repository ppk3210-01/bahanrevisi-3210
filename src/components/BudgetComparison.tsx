
import React, { useState, useEffect } from 'react';
import BudgetFilter from './BudgetFilter';
import BudgetTable from './BudgetTable';
import useBudgetData from '@/hooks/useBudgetData';
import BudgetSummaryBox from './BudgetSummaryBox';
import { FilterSelection } from '@/types/budget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetailedSummaryView from './DetailedSummaryView';
import ExcelImportExport from './ExcelImportExport';
import { useAuth } from '@/contexts/AuthContext'; 

const BudgetComparison: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [filters, setFilters] = useState<FilterSelection>({
    programPembebanan: 'all',
    kegiatan: 'all',
    rincianOutput: 'all',
    komponenOutput: 'all',
    subKomponen: 'all',
    akun: 'all'
  });
  
  const [activeTab, setActiveTab] = useState<string>("table");
  
  // Check if all filter values are selected (not 'all')
  const areFiltersComplete = Object.values(filters).every(filter => filter !== 'all');
  
  const { 
    budgetItems, 
    loading, 
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem,
    rejectBudgetItem,
    importBudgetItems
  } = useBudgetData(filters);
  
  // Calculate budget summary totals for the BudgetSummaryBox
  const totalSemula = budgetItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = budgetItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterSelection>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
        {/* Budget Summary Box */}
        <div className="w-full md:w-3/4">
          <BudgetFilter 
            onFilterChange={handleFilterChange} 
            filters={filters}
          />
        </div>
        <div className="w-full md:w-1/4 flex flex-col gap-2">
          <BudgetSummaryBox 
            totalSemula={totalSemula}
            totalMenjadi={totalMenjadi}
            totalSelisih={totalSelisih}
            isLoading={loading}
          />
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <Tabs 
            defaultValue="table" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="table">Tabel Anggaran</TabsTrigger>
                <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              </TabsList>
              
              {isAdmin && (
                <ExcelImportExport 
                  items={budgetItems}
                  onImport={(items) => {
                    // Wrap the importBudgetItems call in a function that returns void
                    importBudgetItems(items);
                    return Promise.resolve();
                  }}
                  isActive={activeTab === "table"}
                />
              )}
            </div>
            
            <TabsContent value="table" className="pt-4">
              <BudgetTable
                items={budgetItems}
                komponenOutput={filters.komponenOutput}
                subKomponen={filters.subKomponen}
                akun={filters.akun}
                onAdd={addBudgetItem}
                onUpdate={updateBudgetItem}
                onDelete={deleteBudgetItem}
                onApprove={approveBudgetItem}
                onReject={rejectBudgetItem}
                isLoading={loading}
                areFiltersComplete={areFiltersComplete}
              />
            </TabsContent>
            
            <TabsContent value="summary" className="pt-4">
              <DetailedSummaryView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BudgetComparison;
