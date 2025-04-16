import React, { useState, useEffect, useRef } from 'react';
import BudgetFilter from './BudgetFilter';
import BudgetTable from './BudgetTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import SummaryTable from './SummaryTable';
import BudgetSummaryBox from './BudgetSummaryBox';
import BudgetChangesSummary from './BudgetChangesSummary';
import { Download, FileDown, Printer } from 'lucide-react';
import SummaryDialog from './SummaryDialog';
import ExportOptions from './ExportOptions';
import SummaryChart from './SummaryChart';
import DetailedSummaryView from './DetailedSummaryView';
import { useBudgetData } from '@/hooks/useBudgetData'; 
import RPDTable from './RPDTable';
import { toast } from '@/hooks/use-toast';
import { exportToJpeg } from '@/utils/exportUtils';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

type SummarySectionView = 
  'changes' |
  'komponen_output' | 
  'program_pembebanan' |
  'kegiatan' |
  'rincian_output' |
  'sub_komponen' |
  'akun' |
  'akun_group' |
  'account_group';

const BudgetComparison: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('anggaran');
  const [openExport, setOpenExport] = useState<boolean>(false);
  const [openSummary, setOpenSummary] = useState<boolean>(false);
  const [summaryView, setSummaryView] = useState<SummarySectionView>('changes');
  const [filters, setFilters] = useState({
    programPembebanan: 'all',
    kegiatan: 'all',
    rincianOutput: 'all',
    komponenOutput: 'all',
    subKomponen: 'all',
    akun: 'all'
  });

  const changesContentRef = useRef<HTMLDivElement>(null);
  const tableContentRef = useRef<HTMLDivElement>(null);
  const chartContentRef = useRef<HTMLDivElement>(null);
  
  const { 
    budgetItems,
    loadingItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    approveBudgetItem,
    rejectBudgetItem,
    loadingOptions,
    programPembebananOptions,
    kegiatanOptions,
    rincianOutputOptions,
    komponenOutputOptions,
    subKomponenOptions,
    akunOptions,
    summaryByProgramPembebanan,
    summaryByKegiatan,
    summaryByRincianOutput,
    summaryByKomponenOutput,
    summaryBySubKomponen,
    summaryByAkun,
    summaryByAkunGroup,
    summaryByAccountGroup
  } = useBudgetData(filters);

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
  
  const totalDeletedItems = 0;
  const totalDeletedValue = 0;

  const handleExportChanges = () => {
    if (changesContentRef.current) {
      exportToJpeg(changesContentRef.current, 'changes_summary');
      setOpenExport(false);
    }
  };

  const handleExportTable = () => {
    if (tableContentRef.current) {
      exportToJpeg(tableContentRef.current, 'budget_table');
      setOpenExport(false);
    }
  };

  const handleExportChart = () => {
    if (chartContentRef.current) {
      exportToJpeg(chartContentRef.current, 'budget_chart');
      setOpenExport(false);
    }
  };

  const renderSummarySectionContent = () => {
    switch (summaryView) {
      case 'changes':
        return (
          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <BudgetSummaryBox 
                  title="Kesimpulan Perubahan" 
                  totalItems={filteredItems.length}
                  totalValue={roundToThousands(totalSelisih)}
                  details={`${totalNewItems} item baru, ${totalChangedItems} item berubah`}
                  valueType={totalSelisih > 0 ? 'positive' : totalSelisih < 0 ? 'negative' : 'neutral'}
                />
                
                <BudgetSummaryBox 
                  title="Pagu Anggaran Semula" 
                  totalItems={filteredItems.length - totalNewItems}
                  totalValue={roundToThousands(totalSemula)}
                  details="Anggaran sebelum perubahan"
                  valueType="neutral"
                />
                
                <BudgetSummaryBox 
                  title="Pagu Anggaran Menjadi" 
                  totalItems={filteredItems.length}
                  totalValue={roundToThousands(totalMenjadi)}
                  details={`${roundToThousands(totalSelisih) > 0 ? '+' : ''}${formatCurrency(roundToThousands(totalSelisih))}`}
                  valueType={totalSelisih > 0 ? 'positive' : totalSelisih < 0 ? 'negative' : 'neutral'}
                />
              </div>
              
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-md" ref={changesContentRef}>
                <h4 className="text-lg font-medium mb-2 text-blue-600 text-left">Kesimpulan</h4>
                <p className="text-slate-700 mb-2 text-left">
                  Berdasarkan hasil analisis usulan revisi anggaran, total pagu anggaran semula sebesar {formatCurrency(roundToThousands(totalSemula))} menjadi {formatCurrency(roundToThousands(totalMenjadi))}, dengan selisih {formatCurrency(roundToThousands(totalSelisih))} atau {totalSelisih === 0 ? 'pagu tetap' : totalSelisih > 0 ? 'pagu bertambah' : 'pagu berkurang'}.
                </p>
                <p className="text-slate-700 mb-2 text-left">
                  Perubahan ini terdiri dari:
                </p>
                <ul className="list-disc pl-6 text-slate-700 mb-4 text-left">
                  <li>{totalNewItems} item anggaran baru dengan total nilai {formatCurrency(roundToThousands(totalNewValue))}</li>
                  <li>{totalChangedItems} item anggaran berubah dengan total perubahan {formatCurrency(roundToThousands(totalChangedValue))}</li>
                  <li>{totalDeletedItems} item anggaran dihapus dengan total nilai {formatCurrency(roundToThousands(totalDeletedValue))}</li>
                </ul>
              </div>
              
              <div ref={chartContentRef}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <Card className="p-4">
                    <h4 className="text-lg font-medium mb-2 text-blue-600">Diagram Perubahan</h4>
                    <SummaryChart 
                      type="changes" 
                      data={{
                        semula: roundToThousands(totalSemula),
                        menjadi: roundToThousands(totalMenjadi),
                        selisih: roundToThousands(totalSelisih)
                      }} 
                    />
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="text-lg font-medium mb-2 text-blue-600">Diagram Komposisi</h4>
                    <SummaryChart 
                      type="composition" 
                      data={{
                        new: roundToThousands(totalNewValue),
                        changed: roundToThousands(totalChangedValue),
                        unchanged: roundToThousands(totalMenjadi - totalNewValue - totalChangedValue)
                      }} 
                    />
                  </Card>
                </div>
              </div>
              
              <div className="space-y-4" ref={tableContentRef}>
                <Card className="p-4">
                  <h4 className="text-lg font-medium mb-4 text-blue-600">Detail Perubahan Per Item</h4>
                  <BudgetChangesSummary
                    newItems={newItems}
                    changedItems={changedItems}
                  />
                </Card>
              </div>
            </div>
          </div>
        );

      case 'program_pembebanan':
        return <SummaryTable data={summaryByProgramPembebanan} title="Ringkasan Anggaran per Program Pembebanan" />;
      
      case 'kegiatan':
        return <SummaryTable data={summaryByKegiatan} title="Ringkasan Anggaran per Kegiatan" />;
      
      case 'rincian_output':
        return <SummaryTable data={summaryByRincianOutput} title="Ringkasan Anggaran per Rincian Output" />;
      
      case 'komponen_output':
        return <SummaryTable data={summaryByKomponenOutput} title="Ringkasan Anggaran per Komponen Output" />;

      case 'sub_komponen':
        return <SummaryTable data={summaryBySubKomponen} title="Ringkasan Anggaran per Sub Komponen" />;

      case 'akun':
        return <SummaryTable data={summaryByAkun} title="Ringkasan Anggaran per Akun" />;

      case 'akun_group':
        return <SummaryTable data={summaryByAkunGroup} title="Ringkasan Anggaran per Kelompok Akun" />;

      case 'account_group':
        return <SummaryTable data={summaryByAccountGroup} title="Ringkasan Anggaran per Kelompok Belanja" />;

      default:
        return <div>Pilih view ringkasan</div>;
    }
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
          <Badge variant={totalSelisih > 0 ? "success" : totalSelisih < 0 ? "destructive" : "outline"} className="text-xs font-normal">
            Selisih: {formatCurrency(roundToThousands(totalSelisih))}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={openExport} onOpenChange={setOpenExport}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>
                  Pilih format export yang diinginkan
                </DialogDescription>
              </DialogHeader>
              
              <ExportOptions 
                onExportChanges={handleExportChanges}
                onExportTable={handleExportTable}
                onExportChart={handleExportChart}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenExport(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={openSummary} onOpenChange={setOpenSummary}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="text-xs">
                Lihat Ringkasan
              </Button>
            </DialogTrigger>
            <SummaryDialog
              onClose={() => setOpenSummary(false)}
              totalSemula={totalSemula}
              totalMenjadi={totalMenjadi}
              totalSelisih={totalSelisih}
              newItems={newItems}
              changedItems={changedItems}
              totalNewItems={totalNewItems}
              totalChangedItems={totalChangedItems}
              totalNewValue={totalNewValue}
              totalChangedValue={totalChangedValue}
            />
          </Dialog>
        </div>
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
                {renderSummarySectionContent()}
              </div>
            </Card>
            
            <DetailedSummaryView 
              totalSemula={roundToThousands(totalSemula)}
              totalMenjadi={roundToThousands(totalMenjadi)} 
              totalSelisih={roundToThousands(totalSelisih)}
              totalNewValue={roundToThousands(totalNewValue)}
              totalChangedValue={roundToThousands(totalChangedValue)}
              totalNewItems={totalNewItems}
              totalChangedItems={totalChangedItems}
              summaryByProgramPembebanan={summaryByProgramPembebanan}
              summaryByKegiatan={summaryByKegiatan}
              summaryByRincianOutput={summaryByRincianOutput}
              summaryByKomponenOutput={summaryByKomponenOutput}
              summaryBySubKomponen={summaryBySubKomponen}
              summaryByAkun={summaryByAkun}
              summaryByAkunGroup={summaryByAkunGroup}
              summaryByAccountGroup={summaryByAccountGroup}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetComparison;
