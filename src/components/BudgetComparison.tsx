
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
import DetailedSummaryView from './DetailedSummaryView';
import AdvancedBudgetAnalysis from './AdvancedBudgetAnalysis';
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
    return (
      filters.komponenOutput !== 'all' &&
      filters.subKomponen !== 'all' &&
      filters.akun !== 'all'
    );
  };

  const handleFilterChange = (filter: Partial<FilterSelection>) => {
    setFilters(prev => ({
      ...prev,
      ...filter
    }));
  };

  const showSummary = () => {
    setSummaryVisible(true);
  };

  return (
    <div className="space-y-2">
      {budgetSummary && (
        <BudgetSummaryBox 
          totalSemula={budgetSummary.totalSemula}
          totalMenjadi={budgetSummary.totalMenjadi}
          totalSelisih={budgetSummary.totalSelisih}
        />
      )}

      <Card className="shadow-sm border border-blue-100">
        <CardContent className="pt-3 pb-3">
          <BudgetFilter 
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-blue-100">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <div className="flex justify-between items-center px-4 pt-2 bg-gradient-to-r from-blue-50 to-sky-50">
            <TabsList className="h-8 bg-white/50 border border-blue-100">
              <TabsTrigger value="data" className="text-xs px-2 py-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">Data Anggaran</TabsTrigger>
              <TabsTrigger value="import" className="text-xs px-2 py-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">Import/Export</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs px-2 py-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">Ringkasan</TabsTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-blue-700">Import Data</h3>
                    <div className="border rounded-md p-3 text-xs border-blue-100 bg-blue-50/30">
                      <h4 className="font-medium mb-2">Format Excel Import:</h4>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-blue-100/50">
                            <th className="border border-blue-200 px-1 py-1">uraian</th>
                            <th className="border border-blue-200 px-1 py-1">volumeSemula</th>
                            <th className="border border-blue-200 px-1 py-1">satuanSemula</th>
                            <th className="border border-blue-200 px-1 py-1">hargaSatuanSemula</th>
                            <th className="border border-blue-200 px-1 py-1">volumeMenjadi</th>
                            <th className="border border-blue-200 px-1 py-1">satuanMenjadi</th>
                            <th className="border border-blue-200 px-1 py-1">hargaSatuanMenjadi</th>
                            <th className="border border-blue-200 px-1 py-1">subKomponen</th>
                            <th className="border border-blue-200 px-1 py-1">akun</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-blue-200 px-1 py-1">Belanja ATK</td>
                            <td className="border border-blue-200 px-1 py-1">1</td>
                            <td className="border border-blue-200 px-1 py-1">Paket</td>
                            <td className="border border-blue-200 px-1 py-1">5000000</td>
                            <td className="border border-blue-200 px-1 py-1">1</td>
                            <td className="border border-blue-200 px-1 py-1">Paket</td>
                            <td className="border border-blue-200 px-1 py-1">4500000</td>
                            <td className="border border-blue-200 px-1 py-1">Layanan Perkantoran</td>
                            <td className="border border-blue-200 px-1 py-1">521111</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
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
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2 text-blue-700">Export Tools</h3>
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
                  <h3 className="text-sm font-medium text-blue-700">Ringkasan Perubahan Pagu Anggaran</h3>
                </div>
                
                {budgetSummary && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Card className="border border-changed-row shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-orange-700">Detil Diubah</h3>
                          <p className="text-lg font-bold text-orange-800">{budgetSummary.changedItems.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-new-row shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-green-700">Detil Baru</h3>
                          <p className="text-lg font-bold text-green-800">{budgetSummary.newItems.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-deleted-row shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-red-700">Detil Dihapus</h3>
                          <p className="text-lg font-bold text-red-800">{budgetSummary.deletedItems.length}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={showSummary}
                      className="w-full md:w-auto h-8 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                    >
                      <Info className="mr-1 h-3 w-3" /> 
                      Lihat Detail Ringkasan
                    </Button>
                    
                    <div className="mt-4">
                      <DetailedSummaryView />
                    </div>
                    
                    <AdvancedBudgetAnalysis />
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
          open={summaryVisible}
          onOpenChange={setSummaryVisible}
        />
      )}
    </div>
  );
};

export default BudgetComparison;
