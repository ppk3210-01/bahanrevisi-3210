
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
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <BudgetFilter 
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {budgetSummary && (
          <div className={`${isMobile ? 'w-full' : 'w-1/3'} space-y-4`}>
            <BudgetSummaryBox 
              totalSemula={budgetSummary.totalSemula}
              totalMenjadi={budgetSummary.totalMenjadi}
              totalSelisih={budgetSummary.totalSelisih}
            />
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Export & Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={showSummary}
                      className="w-full"
                    >
                      <Info className="mr-2 h-4 w-4" /> 
                      Lihat Ringkasan
                    </Button>
                    <ExportOptions 
                      items={budgetItems} 
                      komponenOutput={filters.komponenOutput} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className={`${isMobile || !budgetSummary ? 'w-full' : 'w-2/3'}`}>
          <Card>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <div className="flex justify-between items-center px-6 pt-6">
                <TabsList>
                  <TabsTrigger value="data">Data Anggaran</TabsTrigger>
                  <TabsTrigger value="import">Import/Export</TabsTrigger>
                </TabsList>
              </div>
              
              <CardContent className="pt-4">
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Import dan Export Data</h3>
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
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {budgetSummary && (
        <SummaryDialog 
          items={budgetSummary.changedItems.concat(budgetSummary.newItems).concat(budgetSummary.deletedItems)}
        />
      )}
    </div>
  );
};

export default BudgetComparison;
