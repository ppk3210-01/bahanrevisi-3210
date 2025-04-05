
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import BudgetFilter from './BudgetFilter';
import BudgetTable from './BudgetTable';
import BudgetSummaryBox from './BudgetSummaryBox';
import ExcelImportExport from './ExcelImportExport';
import ExportOptions from './ExportOptions';
import SummaryDialog from './SummaryDialog';
import { Button } from '@/components/ui/button';
import { FilterSelection, BudgetSummary } from '@/types/budget';
import { generateBudgetSummary } from '@/utils/budgetCalculations';
import useBudgetData from '@/hooks/useBudgetData';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';

const DEFAULT_FILTER: FilterSelection = {
  programPembebanan: 'all',
  kegiatan: 'all',
  rincianOutput: 'all',
  komponenOutput: 'all',
  subKomponen: 'all',
  akun: 'all'
};

const BudgetComparison: React.FC = () => {
  const [filters, setFilters] = useState<FilterSelection>(DEFAULT_FILTER);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('data');
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const isMobile = useIsMobile();
  
  const { 
    budgetItems, 
    loading, 
    addBudgetItem, 
    updateBudgetItem, 
    deleteBudgetItem, 
    approveBudgetItem,
    rejectBudgetItem,
    importBudgetItems
  } = useBudgetData(filters);

  useEffect(() => {
    if (budgetItems) {
      setBudgetSummary(generateBudgetSummary(budgetItems));
    }
  }, [budgetItems]);

  const areFiltersComplete = () => {
    // Check if at least the minimum required filters are selected
    return (
      filters.komponenOutput !== 'all' &&
      filters.subKomponen !== 'all' &&
      filters.akun !== 'all'
    );
  };

  // Functions to handle filter changes
  const handleFilterChange = (filter: Partial<FilterSelection>) => {
    setFilters(prev => ({
      ...prev,
      ...filter
    }));
  };

  // Show the summary dialog
  const showSummary = () => {
    setSummaryVisible(true);
  };

  return (
    <div className="space-y-2">
      <Card className="shadow-sm">
        <CardContent className="pt-3 pb-3">
          <BudgetFilter 
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </CardContent>
      </Card>

      {budgetSummary && (
        <BudgetSummaryBox 
          totalSemula={budgetSummary.totalSemula}
          totalMenjadi={budgetSummary.totalMenjadi}
          totalSelisih={budgetSummary.totalSelisih}
        />
      )}

      <Card className="shadow-sm">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <div className="flex justify-between items-center px-4 pt-2">
            <TabsList className="h-8">
              <TabsTrigger value="data" className="text-xs px-2 py-1">Data Anggaran</TabsTrigger>
              <TabsTrigger value="import" className="text-xs px-2 py-1">Import/Export</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs px-2 py-1">Ringkasan</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-2 px-2">
            <TabsContent value="data" className="mt-0">
              <BudgetTable 
                items={budgetItems}
                komponenOutput={filters.komponenOutput}
                onAdd={addBudgetItem}
                onUpdate={updateBudgetItem}
                onDelete={deleteBudgetItem}
                onApprove={approveBudgetItem}
                onReject={rejectBudgetItem}
                isLoading={loading}
                subKomponen={filters.subKomponen !== 'all' ? filters.subKomponen : undefined}
                akun={filters.akun !== 'all' ? filters.akun : undefined}
                areFiltersComplete={areFiltersComplete()}
              />
            </TabsContent>
            
            <TabsContent value="import" className="mt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Import Data</h3>
                    <ExcelImportExport 
                      onImport={(items) => {
                        importBudgetItems(items);
                        return Promise.resolve();
                      }}
                      komponenOutput={filters.komponenOutput !== 'all' ? filters.komponenOutput : undefined}
                      subKomponen={filters.subKomponen !== 'all' ? filters.subKomponen : undefined}
                      akun={filters.akun !== 'all' ? filters.akun : undefined}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Export Tools</h3>
                    <ExportOptions 
                      items={budgetItems} 
                      komponenOutput={filters.komponenOutput} 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-1 mb-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium">Ringkasan Perubahan Pagu Anggaran</h3>
                </div>
                
                {budgetSummary && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Card className="border border-changed-row shadow-sm">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-gray-700">Item Diubah</h3>
                          <p className="text-lg font-bold">{budgetSummary.changedItems.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-new-row shadow-sm">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-gray-700">Item Baru</h3>
                          <p className="text-lg font-bold">{budgetSummary.newItems.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-deleted-row shadow-sm">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-gray-700">Item Dihapus</h3>
                          <p className="text-lg font-bold">{budgetSummary.deletedItems.length}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={showSummary}
                      className="w-full md:w-auto h-8 text-xs"
                    >
                      <Info className="mr-1 h-3 w-3" /> 
                      Lihat Detail Ringkasan
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {budgetSummary && (
        <SummaryDialog 
          items={budgetSummary.changedItems.concat(budgetSummary.newItems).concat(budgetSummary.deletedItems)}
        />
      )}
    </div>
  );
};

export default BudgetComparison;
