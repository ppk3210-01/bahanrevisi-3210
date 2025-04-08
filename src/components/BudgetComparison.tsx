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
  BudgetSummaryBase,
  BudgetSummaryByAccountGroup,
  BudgetSummaryByKomponen,
  BudgetSummaryByAkun,
  BudgetSummaryByProgramPembebanan,
  BudgetSummaryByKegiatan,
  BudgetSummaryByRincianOutput,
  BudgetSummaryBySubKomponen
} from '@/types/database';
import { Button } from '@/components/ui/button';
import { FileBarChart2 } from 'lucide-react';
import SummaryDialog from './SummaryDialog';
import BudgetChangesSummary from './BudgetChangesSummary';

interface EnhancedBudgetSummaryRecord extends BudgetSummaryBase {
  account_group?: string;
  komponen_output?: string;
  akun?: string;
  program_pembebanan?: string;
  kegiatan?: string;
  rincian_output?: string;
  sub_komponen?: string;
  type?: 'account_group' | 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen';
}

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
  const [summarySectionView, setSummarySectionView] = useState<
    'changes' |
    'account_group' | 
    'komponen_output' | 
    'akun' | 
    'program_pembebanan' | 
    'kegiatan' | 
    'rincian_output' | 
    'sub_komponen'
  >('changes');
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
  
  const transformedSummaryData: EnhancedBudgetSummaryRecord[] = summaryData.map(item => {
    if (item.account_group) {
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
    } else if (item.akun) {
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
    } else if (item.program_pembebanan) {
      const result: BudgetSummaryByProgramPembebanan = {
        program_pembebanan: item.program_pembebanan || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'program_pembebanan'
      };
      return result;
    } else if (item.kegiatan) {
      const result: BudgetSummaryByKegiatan = {
        kegiatan: item.kegiatan || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'kegiatan'
      };
      return result;
    } else if (item.rincian_output) {
      const result: BudgetSummaryByRincianOutput = {
        rincian_output: item.rincian_output || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'rincian_output'
      };
      return result;
    } else if (item.sub_komponen) {
      const result: BudgetSummaryBySubKomponen = {
        sub_komponen: item.sub_komponen || '',
        total_semula: item.total_semula || 0,
        total_menjadi: item.total_menjadi || 0,
        total_selisih: item.total_selisih || 0,
        new_items: item.new_items || 0,
        changed_items: item.changed_items || 0,
        total_items: item.total_items || 0,
        type: 'sub_komponen'
      };
      return result;
    }
    
    const fallback: BudgetSummaryByAccountGroup = {
      account_group: 'Unknown',
      total_semula: item.total_semula || 0,
      total_menjadi: item.total_menjadi || 0,
      total_selisih: item.total_selisih || 0,
      new_items: item.new_items || 0,
      changed_items: item.changed_items || 0,
      total_items: item.total_items || 0,
      type: 'account_group'
    };
    return fallback;
  });
  
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
    if (summarySectionView === 'account_group') {
      return transformedSummaryData.filter(item => 'account_group' in item) as BudgetSummaryByAccountGroup[];
    } else if (summarySectionView === 'komponen_output') {
      return transformedSummaryData.filter(item => 'komponen_output' in item) as BudgetSummaryByKomponen[];
    } else if (summarySectionView === 'akun') {
      return transformedSummaryData.filter(item => 'akun' in item) as BudgetSummaryByAkun[];
    } else if (summarySectionView === 'program_pembebanan') {
      return transformedSummaryData.filter(item => 'program_pembebanan' in item) as BudgetSummaryByProgramPembebanan[];
    } else if (summarySectionView === 'kegiatan') {
      return transformedSummaryData.filter(item => 'kegiatan' in item) as BudgetSummaryByKegiatan[];
    } else if (summarySectionView === 'rincian_output') {
      return transformedSummaryData.filter(item => 'rincian_output' in item) as BudgetSummaryByRincianOutput[];
    } else if (summarySectionView === 'sub_komponen') {
      return transformedSummaryData.filter(item => 'sub_komponen' in item) as BudgetSummaryBySubKomponen[];
    }
    return [];
  };

  const getSummarySectionName = (): string => {
    switch (summarySectionView) {
      case 'changes': return 'Ringkasan Perubahan Pagu Anggaran';
      case 'account_group': return 'Kelompok Akun';
      case 'komponen_output': return 'Komponen Output';
      case 'akun': return 'Akun';
      case 'program_pembebanan': return 'Program Pembebanan';
      case 'kegiatan': return 'Kegiatan';
      case 'rincian_output': return 'Rincian Output';
      case 'sub_komponen': return 'Sub Komponen';
      default: return 'Ringkasan';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
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
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={summarySectionView === 'changes' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('changes')}
                    size="sm"
                  >
                    Ringkasan Perubahan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'account_group' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('account_group')}
                    size="sm"
                  >
                    Kelompok Akun
                  </Button>
                  <Button 
                    variant={summarySectionView === 'program_pembebanan' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('program_pembebanan')}
                    size="sm"
                  >
                    Program Pembebanan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'kegiatan' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('kegiatan')}
                    size="sm"
                  >
                    Kegiatan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'rincian_output' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('rincian_output')}
                    size="sm"
                  >
                    Rincian Output
                  </Button>
                  <Button 
                    variant={summarySectionView === 'komponen_output' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('komponen_output')}
                    size="sm"
                  >
                    Komponen Output
                  </Button>
                  <Button 
                    variant={summarySectionView === 'sub_komponen' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('sub_komponen')}
                    size="sm"
                  >
                    Sub Komponen
                  </Button>
                  <Button 
                    variant={summarySectionView === 'akun' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('akun')}
                    size="sm"
                  >
                    Akun
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
        summaryData={transformedSummaryData as BudgetSummaryRecord[]} 
      />
    </div>
  );
};

export default BudgetComparison;
