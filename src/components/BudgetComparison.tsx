import React, { useState, useEffect, useRef } from 'react';
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
import { FileBarChart2, Download } from 'lucide-react';
import SummaryDialog from './SummaryDialog';
import BudgetChangesSummary from './BudgetChangesSummary';
import RPDTable from './RPDTable';
import { toast } from '@/hooks/use-toast';
import { exportToJpeg } from '@/utils/exportUtils';

// Define the type for summary section view
type SummarySectionView = 
  'changes' |
  'komponen_output' | 
  'akun' | 
  'program_pembebanan' | 
  'kegiatan' | 
  'rincian_output' | 
  'sub_komponen' |
  'account_group' |
  'akun_group';

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
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const changesContentRef = useRef<HTMLDivElement>(null);
  const budgetChangeSummaryRef = useRef<HTMLDivElement>(null);
  
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
    } else if (summarySectionView === 'akun_group') {
      return summaryData.filter(item => item.type === 'akun_group');
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
      case 'account_group': return 'Kelompok Belanja';
      case 'akun_group': return 'Kelompok Akun';
      default: return 'Ringkasan';
    }
  };

  const handleExportToJpeg = async () => {
    try {
      if (summarySectionView === 'changes') {
        if (!budgetChangeSummaryRef.current) {
          throw new Error('Summary content not found');
        }
        await exportToJpeg('changes-content', `ringkasan-perubahan`);
      } else {
        if (!summaryContentRef.current) {
          throw new Error('Summary content not found');
        }
        await exportToJpeg('summary-content', `ringkasan-${summarySectionView}`);
      }
      
      toast({
        title: 'Berhasil',
        description: 'Ringkasan berhasil diekspor ke JPEG.'
      });
    } catch (error) {
      console.error('Error exporting to JPEG:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengekspor ringkasan. Silakan coba lagi.'
      });
    }
  };

  const changedItems = budgetItems.filter(item => item.status === 'changed');
  const newItems = budgetItems.filter(item => item.status === 'new');
  const deletedItems = budgetItems.filter(item => item.status === 'deleted');
  
  const totalChangedSemula = changedItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalChangedMenjadi = changedItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalNewMenjadi = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);

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
      
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Tabs 
            defaultValue="table" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList className="bg-slate-50">
                <TabsTrigger value="table" className="text-slate-700">Tabel Anggaran</TabsTrigger>
                <TabsTrigger value="rpd" className="text-slate-700">Rencana Penarikan Dana</TabsTrigger>
                <TabsTrigger value="summary" className="text-slate-700">Ringkasan</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                {activeTab === "summary" && (
                  <>
                    <Button variant="outline" onClick={() => setShowSummaryDialog(true)} className="border-slate-200 text-slate-700 hover:text-slate-900">
                      <FileBarChart2 className="h-4 w-4 mr-2" /> 
                      Ekspor Semua Ringkasan
                    </Button>
                    <Button variant="outline" onClick={handleExportToJpeg} className="border-slate-200 text-slate-700 hover:text-slate-900">
                      <Download className="h-4 w-4 mr-2" /> 
                      Ekspor ke JPEG
                    </Button>
                  </>
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
            
            <TabsContent value="rpd" className="pt-4">
              <RPDTable filters={filters} />
            </TabsContent>
            
            <TabsContent value="summary" className="pt-4">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-1">
                  <Button 
                    variant={summarySectionView === 'changes' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('changes')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Ringkasan Perubahan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'program_pembebanan' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('program_pembebanan')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Program Pembebanan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'kegiatan' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('kegiatan')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Kegiatan
                  </Button>
                  <Button 
                    variant={summarySectionView === 'rincian_output' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('rincian_output')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Rincian Output
                  </Button>
                  <Button 
                    variant={summarySectionView === 'komponen_output' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('komponen_output')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Komponen Output
                  </Button>
                  <Button 
                    variant={summarySectionView === 'sub_komponen' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('sub_komponen')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Sub Komponen
                  </Button>
                  <Button 
                    variant={summarySectionView === 'akun' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('akun')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Akun
                  </Button>
                  <Button 
                    variant={summarySectionView === 'akun_group' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('akun_group')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Kelompok Akun
                  </Button>
                  <Button 
                    variant={summarySectionView === 'account_group' ? 'default' : 'outline'} 
                    onClick={() => setSummarySectionView('account_group')}
                    size="xs"
                    className="text-xs border-slate-200 hover:bg-slate-50"
                  >
                    Kelompok Belanja
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">{getSummarySectionName()}</h3>
                  
                  {summarySectionView === 'changes' ? (
                    <div id="changes-content" ref={budgetChangeSummaryRef}>
                      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-md" ref={changesContentRef}>
                        <h4 className="text-lg font-medium mb-2 text-blue-600 text-left">Kesimpulan</h4>
                        <p className="text-slate-700 mb-2 text-left">
                          Berdasarkan hasil analisis usulan revisi anggaran, total pagu anggaran semula sebesar Rp {totalSemula.toLocaleString('id-ID')} menjadi Rp {totalMenjadi.toLocaleString('id-ID')}, dengan selisih Rp {totalSelisih.toLocaleString('id-ID')} atau {totalSelisih === 0 ? 'pagu tetap' : totalSelisih > 0 ? 'pagu bertambah' : 'pagu berkurang'}.
                        </p>
                        <p className="text-slate-700 mb-2 text-left">
                          Perubahan ini terdiri dari:
                        </p>
                        <p className="text-slate-700 mb-2 text-left">
                          - {changedItems.length} komponen anggaran yang mengalami penyesuaian nilai
                        </p>  
                        <p className="text-slate-700 mb-2 text-left">
                          - {newItems.length} komponen anggaran baru yang ditambahkan
                        </p>
                        <p className="text-slate-700 mb-2 text-left">
                          - {deletedItems.length} komponen anggaran yang dihapus.
                        </p>
                        <p className="text-slate-700 mb-2 text-left">
                          Penyesuaian anggaran ini dilakukan untuk mengoptimalkan penggunaan sumber daya keuangan sesuai dengan prioritas program dan kegiatan yang telah ditetapkan. Dengan adanya {changedItems.length + newItems.length + deletedItems.length} perubahan ini, diharapkan pelaksanaan program dapat berjalan dengan lebih efektif dan efisien.
                        </p>
                        <p className="text-slate-700 text-left">
                          Perubahan anggaran ini perlu disetujui oleh pejabat yang berwenang sesuai dengan ketentuan yang berlaku.
                        </p>
                      </div>
                      <BudgetChangesSummary items={budgetItems} />
                    </div>
                  ) : (
                    <div id="summary-content" ref={summaryContentRef}>
                      <DetailedSummaryView 
                        summaryData={getFilteredSummaryData()}
                        loading={loading}
                        view={summarySectionView}
                        setView={setSummarySectionView}
                        defaultView="table"
                      />
                    </div>
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
