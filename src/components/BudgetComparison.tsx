
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
  BudgetSummaryRecord,
  BudgetSummaryBase
} from '@/types/database';
import { Button } from '@/components/ui/button';
import { FileBarChart2 } from 'lucide-react';
import SummaryDialog from './SummaryDialog';
import BudgetChangesSummary from './BudgetChangesSummary';

// Define the type for summary section view
type SummarySectionView = 
  'changes' |
  'komponen_output' | 
  'akun' | 
  'program_pembebanan' | 
  'kegiatan' | 
  'rincian_output' | 
  'sub_komponen' |
  'account_group';

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
  const [summarySectionView, setSummarySectionView] = useState<SummarySectionView>('changes');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
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
  
  const totalSemula = budgetItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = budgetItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;
  
  const handleFilterChange = (newFilters: Partial<FilterSelection>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };
  
  const getFilteredSummaryData = (): BudgetSummaryRecord[] => {
    if (summarySectionView === 'komponen_output') {
      return summaryData.filter(item => item.type === 'komponen_output');
    } else if (summarySectionView === 'akun') {
      return summaryData.filter(item => item.type === 'akun');
    } else if (summarySectionView === 'program_pembebanan') {
      return summaryData.filter(item => item.type === 'program_pembebanan');
    } else if (summarySectionView === 'kegiatan') {
      return summaryData.filter(item => item.type === 'kegiatan');
    } else if (summarySectionView === 'rincian_output') {
      return summaryData.filter(item => item.type === 'rincian_output');
    } else if (summarySectionView === 'sub_komponen') {
      return summaryData.filter(item => item.type === 'sub_komponen');
    } else if (summarySectionView === 'account_group') {
      return summaryData.filter(item => item.type === 'account_group');
    }
    return [];
  };

  const getSummarySectionName = (): string => {
    switch (summarySectionView) {
      case 'changes': return 'Perubahan Pagu Anggaran';
      case 'komponen_output': return 'Komponen Output';
      case 'akun': return 'Akun';
      case 'program_pembebanan': return 'Program Pembebanan';
      case 'kegiatan': return 'Kegiatan';
      case 'rincian_output': return 'Rincian Output';
      case 'sub_komponen': return 'Sub Komponen';
      case 'account_group': return 'Kelompok Akun';
      default: return 'Ringkasan';
    }
  };

  return (
    <div className="space-y-4">
      <div className="filter-and-summary-container">
        <div className="budget-filter-container">
          <BudgetFilter 
            onFilterChange={handleFilterChange} 
            filters={filters}
          />
        </div>
        <div>
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
                      importBudgetItems(items as Omit<import('@/types/budget').BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]);
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
              <div className="space-y-6">
                <div className="flex flex-wrap gap-1">
                  <Button 
                    variant={summarySectionView === 'changes' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('changes')}
                    size="xs"
                    className="text-xs"
                  >
                    Ringkasan Perubahan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'program_pembebanan' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('program_pembebanan')}
                    size="xs"
                    className="text-xs"
                  >
                    Program Pembebanan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'kegiatan' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('kegiatan')}
                    size="xs"
                    className="text-xs"
                  >
                    Kegiatan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'rincian_output' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('rincian_output')}
                    size="xs"
                    className="text-xs"
                  >
                    Rincian Output
                  </Button>
                  <Button 
                    variant={summarySectionView === 'komponen_output' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('komponen_output')}
                    size="xs"
                    className="text-xs"
                  >
                    Komponen Output
                  </Button>
                  <Button 
                    variant={summarySectionView === 'sub_komponen' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('sub_komponen')}
                    size="xs"
                    className="text-xs"
                  >
                    Sub Komponen
                  </Button>
                  <Button 
                    variant={summarySectionView === 'akun' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('akun')}
                    size="xs"
                    className="text-xs"
                  >
                    Akun
                  </Button>
                  <Button 
                    variant={summarySectionView === 'account_group' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('account_group')}
                    size="xs"
                    className="text-xs"
                  >
                    Kelompok Akun
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-4">{getSummarySectionName()}</h3>
                  
                  {summarySectionView === 'changes' ? (
                    <BudgetChangesSummary items={budgetItems} />
                  ) : (
                    <DetailedSummaryView 
                      summaryData={getFilteredSummaryData()}
                      loading={loading}
                      view={summarySectionView}
                      setView={setSummarySectionView}
                      defaultView="table"
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <SummaryDialog
        items={budgetItems}
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summaryData={summaryData} 
      />
    </div>
  );
};

export default BudgetComparison;
