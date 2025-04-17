import React, { useState, useRef } from 'react';
import BudgetFilter from './BudgetFilter';
import BudgetTable from './BudgetTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BudgetSummaryBox from './BudgetSummaryBox';
import SummaryChart, { SummaryViewType } from './SummaryChart';
import DetailedSummaryView from './DetailedSummaryView';
import useBudgetData from '@/hooks/useBudgetData';
import RPDTable from './RPDTable';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import ExcelImportExport from './ExcelImportExport';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetItem } from '@/types/budget';

type SummarySectionView = SummaryViewType;

const BudgetComparison: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('anggaran');
  const [summaryView, setSummaryView] = useState<SummarySectionView>('changes');
  const [filters, setFilters] = useState({
    programPembebanan: 'all',
    kegiatan: 'all',
    rincianOutput: 'all',
    komponenOutput: 'all',
    subKomponen: 'all',
    akun: 'all'
  });

  const { isAdmin } = useAuth();
  
  const { 
    budgetItems,
    loading: loadingItems,
    addBudgetItem,
    importBudgetItems,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem,
    rejectBudgetItem,
    summaryData
  } = useBudgetData(filters);

  const handleImportItems = async (items: Partial<BudgetItem>[]): Promise<void> => {
    await importBudgetItems(items);
  };

  const loadingOptions = false;
  const programPembebananOptions = [];
  const kegiatanOptions = [];
  const rincianOutputOptions = [];
  const komponenOutputOptions = [];
  const subKomponenOptions = [];
  const akunOptions = [];

  const filteredItems = budgetItems;
  const areFiltersComplete = filters.akun !== 'all' && filters.komponenOutput !== 'all';
  
  const totalSemula = filteredItems.reduce((sum, item) => sum + item.jumlahSemula, 0);
  const totalMenjadi = filteredItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);
  const totalSelisih = totalMenjadi - totalSemula;

  const newItems = filteredItems.filter(item => item.status === 'new');
  const totalNewItems = newItems.length;
  const totalNewValue = newItems.reduce((sum, item) => sum + item.jumlahMenjadi, 0);

  const changedItems = filteredItems.filter(item => item.status === 'changed');
  const totalChangedItems = changedItems.length;
  const totalChangedValue = changedItems.reduce((sum, item) => sum + item.selisih, 0);

  const renderSummarySection = () => {
    if (summaryView === 'changes') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <BudgetSummaryBox 
              title="Kesimpulan Perubahan" 
              totalItems={filteredItems.length}
              totalValue={roundToThousands(totalSelisih)}
              details={`${totalNewItems} item baru, ${totalChangedItems} item berubah`}
              valueType={totalSelisih > 0 ? 'text-blue-600' : totalSelisih < 0 ? 'text-red-600' : 'text-gray-600'}
            />
            
            <BudgetSummaryBox 
              title="Pagu Anggaran Semula" 
              totalItems={filteredItems.length - totalNewItems}
              totalValue={roundToThousands(totalSemula)}
              details="Anggaran sebelum perubahan"
              valueType="text-gray-600"
            />
            
            <BudgetSummaryBox 
              title="Pagu Anggaran Menjadi" 
              totalItems={filteredItems.length}
              totalValue={roundToThousands(totalMenjadi)}
              details={`${roundToThousands(totalSelisih) > 0 ? '+' : ''}${formatCurrency(roundToThousands(totalSelisih))}`}
              valueType={totalSelisih > 0 ? 'text-blue-600' : totalSelisih < 0 ? 'text-red-600' : 'text-gray-600'}
            />
          </div>
          
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="text-lg font-medium mb-2 text-gray-800">Ringkasan Perubahan</h4>
              <SummaryChart 
                summaryData={[]}
                chartType="bar"
                view="changes"
                customData={{
                  semula: roundToThousands(totalSemula),
                  menjadi: roundToThousands(totalMenjadi),
                  selisih: roundToThousands(totalSelisih)
                }}
              />
            </Card>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Revisi Anggaran</h1>
      
      <BudgetFilter 
        filters={filters} 
        setFilters={setFilters}
        programPembebananOptions={programPembebananOptions}
        kegiatanOptions={kegiatanOptions}
        rincianOutputOptions={rincianOutputOptions}
        komponenOutputOptions={komponenOutputOptions}
        subKomponenOptions={subKomponenOptions}
        akunOptions={akunOptions}
        loading={loadingOptions}
      />
      
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            Total Semula: {formatCurrency(roundToThousands(totalSemula))}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            Total Menjadi: {formatCurrency(roundToThousands(totalMenjadi))}
          </Badge>
          <Badge variant={totalSelisih > 0 ? "default" : totalSelisih < 0 ? "destructive" : "outline"} className="text-xs font-normal">
            Selisih: {formatCurrency(roundToThousands(totalSelisih))}
          </Badge>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <ExcelImportExport
              items={filteredItems}
              onImport={handleImportItems}
              komponenOutput={filters.komponenOutput !== 'all' ? filters.komponenOutput : undefined}
              subKomponen={filters.subKomponen !== 'all' ? filters.subKomponen : undefined}
              akun={filters.akun !== 'all' ? filters.akun : undefined}
              smallText={true}
            />
          </div>
        )}
      </div>
      
      <Tabs 
        defaultValue={selectedTab} 
        value={selectedTab} 
        onValueChange={setSelectedTab} 
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="anggaran">Anggaran</TabsTrigger>
          <TabsTrigger value="rpd">Rencana Penarikan Dana</TabsTrigger>
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="anggaran" className="space-y-4">
          <BudgetTable 
            items={filteredItems}
            komponenOutput={filters.komponenOutput}
            subKomponen={filters.subKomponen}
            akun={filters.akun}
            onAdd={addBudgetItem}
            onUpdate={updateBudgetItem}
            onDelete={deleteBudgetItem}
            onApprove={approveBudgetItem}
            onReject={rejectBudgetItem}
            isLoading={loadingItems}
            areFiltersComplete={areFiltersComplete}
          />
        </TabsContent>
        
        <TabsContent value="rpd" className="space-y-4">
          <RPDTable filters={filters} />
        </TabsContent>

        <TabsContent value="ringkasan" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant={summaryView === 'changes' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('changes')}
                >
                  Ringkasan Perubahan
                </Button>
                <Button 
                  variant={summaryView === 'program_pembebanan' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('program_pembebanan')}
                >
                  Program Pembebanan
                </Button>
                <Button 
                  variant={summaryView === 'kegiatan' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('kegiatan')}
                >
                  Kegiatan
                </Button>
                <Button 
                  variant={summaryView === 'rincian_output' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('rincian_output')}
                >
                  Rincian Output
                </Button>
                <Button 
                  variant={summaryView === 'komponen_output' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('komponen_output')}
                >
                  Komponen Output
                </Button>
                <Button 
                  variant={summaryView === 'sub_komponen' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('sub_komponen')}
                >
                  Sub Komponen
                </Button>
                <Button 
                  variant={summaryView === 'akun' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('akun')}
                >
                  Akun
                </Button>
                <Button 
                  variant={summaryView === 'akun_group' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('akun_group')}
                >
                  Kelompok Akun
                </Button>
                <Button 
                  variant={summaryView === 'account_group' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSummaryView('account_group')}
                >
                  Kelompok Belanja
                </Button>
              </div>
              
              <div className="mt-4">
                {renderSummarySection()}
              </div>
            </Card>
            
            {summaryView !== 'changes' && (
              <DetailedSummaryView 
                summaryData={summaryData}
                loading={loadingItems}
                view={summaryView}
                setView={setSummaryView as (view: SummaryViewType) => void}
                defaultView="table"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetComparison;
