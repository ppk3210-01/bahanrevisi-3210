import React, { useState } from 'react';
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

const BudgetComparison: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('anggaran');
  const [summaryView, setSummaryView] = useState<SummaryViewType>('changes');
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
    if (items && items.length > 0) {
      await importBudgetItems(items);
    }
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

  const getChangedBudgetItems = () => {
    return filteredItems
      .filter(item => item.status === 'changed')
      .map(item => ({
        id: item.id,
        pembebanan: getCombinedPembebananCode(item),
        uraian: item.uraian,
        detailPerubahan: getDetailPerubahan(item),
        jumlahSemula: item.jumlahSemula,
        jumlahMenjadi: item.jumlahMenjadi,
        selisih: item.selisih
      }));
  };

  const getNewBudgetItems = () => {
    return filteredItems
      .filter(item => item.status === 'new')
      .map(item => ({
        id: item.id,
        pembebanan: getCombinedPembebananCode(item),
        uraian: item.uraian,
        volume: item.volumeMenjadi,
        satuan: item.satuanMenjadi,
        hargaSatuan: item.hargaSatuanMenjadi,
        jumlah: item.jumlahMenjadi
      }));
  };

  const getDetailPerubahan = (item: BudgetItem) => {
    const changes: string[] = [];
    
    if (item.volumeSemula !== item.volumeMenjadi) {
      changes.push(`Volume: ${item.volumeSemula} → ${item.volumeMenjadi}`);
    }
    
    if (item.satuanSemula !== item.satuanMenjadi) {
      changes.push(`Satuan: ${item.satuanSemula} → ${item.satuanMenjadi}`);
    }
    
    if (item.hargaSatuanSemula !== item.hargaSatuanMenjadi) {
      changes.push(`Harga: ${formatCurrency(item.hargaSatuanSemula)} → ${formatCurrency(item.hargaSatuanMenjadi)}`);
    }
    
    return changes.join('\n');
  };

  const getCombinedPembebananCode = (item: BudgetItem): string => {
    const codes = [
      item.programPembebanan,
      item.komponenOutput,
      item.subKomponen,
      'A',
      item.akun
    ].filter(Boolean);
    
    return codes.join('.');
  };

  const renderSummarySection = () => {
    if (summaryView === 'changes') {
      return (
        <div className="space-y-4">
          <BudgetChangesConclusion
            totalSemula={totalSemula}
            totalMenjadi={totalMenjadi}
            totalSelisih={totalSelisih}
            changedItems={totalChangedItems}
            newItems={totalNewItems}
            deletedItems={deletedItems}
          />
          <BudgetChangesTable
            title="Pagu Anggaran Berubah"
            items={getChangedBudgetItems()}
          />
          <NewBudgetTable
            items={getNewBudgetItems()}
          />
        </div>
      );
    }

    return (
      <DetailedSummaryView 
        title={getSummaryTitle()}
        data={getFilteredSummaryData()}
        totalSemula={getTotalSummaryValues().semula}
        totalMenjadi={getTotalSummaryValues().menjadi}
        totalSelisih={getTotalSummaryValues().selisih}
        showSummaryBoxes={false}
      />
    );
  };

  const getFilteredSummaryData = () => {
    if (!summaryData || summaryData.length === 0) return [];
    
    return summaryData
      .filter(item => item.type === summaryView)
      .map(item => {
        let name = '';
        switch(item.type) {
          case 'program_pembebanan':
            name = item.program_pembebanan || '';
            break;
          case 'kegiatan':
            name = item.kegiatan || '';
            break;
          case 'rincian_output':
            name = item.rincian_output || '';
            break;
          case 'komponen_output':
            name = item.komponen_output || '';
            break;
          case 'sub_komponen':
            name = item.sub_komponen || '';
            break;
          case 'akun':
            name = item.akun_name ? `${item.akun} - ${item.akun_name}` : item.akun || '';
            break;
          case 'account_group':
            name = item.account_group_name ? `${item.account_group} – ${item.account_group_name}` : item.account_group || '';
            break;
          case 'akun_group':
            name = item.akun_group_name ? `${item.akun_group} - ${item.akun_group_name}` : item.akun_group || '';
            break;
          default:
            name = '';
        }

        return {
          id: item.type === 'akun' ? item.akun || name : 
              item.type === 'account_group' ? item.account_group || name : 
              item.type === 'akun_group' ? item.akun_group || name : name,
          name,
          totalSemula: item.total_semula || 0,
          totalMenjadi: item.total_menjadi || 0,
          totalSelisih: item.total_selisih || 0,
          newItems: item.new_items || 0,
          changedItems: item.changed_items || 0,
          totalItems: item.total_items || 0
        };
      });
  };

  const getSummaryTitle = () => {
    switch(summaryView) {
      case 'program_pembebanan': return 'Program Pembebanan';
      case 'kegiatan': return 'Kegiatan';
      case 'rincian_output': return 'Rincian Output';
      case 'komponen_output': return 'Komponen Output';
      case 'sub_komponen': return 'Sub Komponen';
      case 'akun': return 'Akun';
      case 'akun_group': return 'Kelompok Akun';
      case 'account_group': return 'Kelompok Belanja';
      default: return '';
    }
  };

  const getTotalSummaryValues = () => {
    if (!summaryData || summaryData.length === 0) return { semula: 0, menjadi: 0, selisih: 0 };
    
    const filteredSummary = summaryData.filter(item => item.type === summaryView);
    
    if (filteredSummary.length === 0) return { semula: 0, menjadi: 0, selisih: 0 };
    
    const totalSemula = filteredSummary.reduce((sum, item) => sum + (item.total_semula || 0), 0);
    const totalMenjadi = filteredSummary.reduce((sum, item) => sum + (item.total_menjadi || 0), 0);
    const totalSelisih = filteredSummary.reduce((sum, item) => sum + (item.total_selisih || 0), 0);
    
    return { semula: totalSemula, menjadi: totalMenjadi, selisih: totalSelisih };
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
                title={getSummaryTitle()}
                data={getFilteredSummaryData()}
                totalSemula={getTotalSummaryValues().semula}
                totalMenjadi={getTotalSummaryValues().menjadi}
                totalSelisih={getTotalSummaryValues().selisih}
                showSummaryBoxes={false}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetComparison;
