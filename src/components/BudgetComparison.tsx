
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
import { 
  BudgetSummaryRecord as DBBudgetSummaryRecord,
  BudgetSummaryByAccountGroup,
  BudgetSummaryByKomponen,
  BudgetSummaryByAkun
} from '@/types/database';
import { Button } from '@/components/ui/button';
import { FileBarChart2 } from 'lucide-react';
import SummaryDialog from './SummaryDialog';

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
  const [summaryView, setSummaryView] = useState<'account_group' | 'komponen_output' | 'akun'>('account_group');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
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
    importBudgetItems,
    summaryData
  } = useBudgetData(filters);
  
  // Transform the summary data to match the expected type
  const transformedSummaryData: DBBudgetSummaryRecord[] = summaryData.map(item => {
    if (item.account_group) {
      // Create a properly typed account group summary
      const result: BudgetSummaryByAccountGroup = {
        account_group: item.account_group || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'account_group'
      };
      return result;
    } else if (item.komponen_output) {
      // Create a properly typed komponen summary
      const result: BudgetSummaryByKomponen = {
        komponen_output: item.komponen_output || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'komponen_output'
      };
      return result;
    } else {
      // Create a properly typed akun summary
      const result: BudgetSummaryByAkun = {
        akun: item.akun || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'akun'
      };
      return result;
    }
  });
  
  // Calculate budget summary totals for the BudgetSummaryBox
  const totalSemula = budgetItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = budgetItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  // Calculate metrics for BudgetSummaryBox
  const newItems = budgetItems.filter(item => item.status === 'new').length;
  const changedItems = budgetItems.filter(item => item.status === 'changed').length;
  const totalItems = budgetItems.length;
  
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
            newItems={newItems}
            changedItems={changedItems}
            totalItems={totalItems}
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
              
              <div className="flex gap-2">
                {activeTab === "summary" && (
                  <Button variant="outline" onClick={() => setShowSummaryDialog(true)}>
                    <FileBarChart2 className="h-4 w-4 mr-2" /> 
                    Ekspor Semua Ringkasan
                  </Button>
                )}
                
                {isAdmin && activeTab === "table" && (
                  <ExcelImportExport 
                    items={budgetItems}
                    onImport={(items) => {
                      importBudgetItems(items);
                      return Promise.resolve();
                    }}
                    komponenOutput={filters.komponenOutput !== 'all' ? filters.komponenOutput : undefined}
                    subKomponen={filters.subKomponen !== 'all' ? filters.subKomponen : undefined}
                    akun={filters.akun !== 'all' ? filters.akun : undefined}
                    smallText={true}
                  />
                )}
              </div>
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
              <DetailedSummaryView 
                summaryData={transformedSummaryData}
                loading={loading}
                view={summaryView}
                setView={setSummaryView}
                defaultView="table"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <SummaryDialog
        items={budgetItems}
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summaryData={transformedSummaryData} 
      />
    </div>
  );
};

export default BudgetComparison;
