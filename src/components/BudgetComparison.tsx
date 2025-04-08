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
import { Button } from '@/components/ui/button';
import { FilterSelection, BudgetSummary, BudgetItem } from '@/types/budget';
import { generateBudgetSummary } from '@/utils/budgetCalculations';
import useBudgetData from '@/hooks/useBudgetData';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info, HelpCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleImport = async (items: Omit<BudgetItem, 'id' | 'jumlahSemula' | 'jumlahMenjadi' | 'selisih' | 'status'>[]) => {
    await importBudgetItems(items);
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

      <Card className="shadow-sm">
        <CardContent className="pt-3 pb-3">
          <BudgetFilter 
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </CardContent>
      </Card>

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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium">Import Data</h3>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                            <HelpCircle className="h-3 w-3" />
                            Panduan Import
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gradient-blue">Panduan Import Excel</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs">
                              <div className="space-y-2">
                                <p className="font-medium">Petunjuk cara mengimpor data menggunakan file Excel</p>
                                
                                <div>
                                  <h3 className="font-medium">Format File</h3>
                                  <p>File Excel (.xlsx atau .xls) harus memiliki format berikut:</p>
                                  
                                  <div className="overflow-x-auto mt-2">
                                    <table className="w-full border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-blue-50">
                                          <th className="border px-2 py-1 text-left">Kolom</th>
                                          <th className="border px-2 py-1 text-left">Tipe Data</th>
                                          <th className="border px-2 py-1 text-left">Format</th>
                                          <th className="border px-2 py-1 text-left">Contoh</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td className="border px-2 py-1">Program Pembebanan</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">054.01.GG</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Kegiatan</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">2896</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Rincian Output</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">2896.BMA</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Komponen Output</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">2896.BMA.004</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Sub Komponen</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">005</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Akun</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">522151</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Uraian</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">Belanja Jasa Profesi</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Volume Semula</td>
                                          <td className="border px-2 py-1">Number</td>
                                          <td className="border px-2 py-1">General atau Number</td>
                                          <td className="border px-2 py-1">1</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Satuan Semula</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">Paket</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Harga Satuan Semula</td>
                                          <td className="border px-2 py-1">Number</td>
                                          <td className="border px-2 py-1">General, Number atau Currency</td>
                                          <td className="border px-2 py-1">1000000</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Volume Menjadi</td>
                                          <td className="border px-2 py-1">Number</td>
                                          <td className="border px-2 py-1">General atau Number</td>
                                          <td className="border px-2 py-1">1</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Satuan Menjadi</td>
                                          <td className="border px-2 py-1">Text</td>
                                          <td className="border px-2 py-1">-</td>
                                          <td className="border px-2 py-1">Paket</td>
                                        </tr>
                                        <tr>
                                          <td className="border px-2 py-1">Harga Satuan Menjadi</td>
                                          <td className="border px-2 py-1">Number</td>
                                          <td className="border px-2 py-1">General, Number atau Currency</td>
                                          <td className="border px-2 py-1">1200000</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-medium">Petunjuk Import</h3>
                                  <ol className="list-decimal ml-5 space-y-1">
                                    <li>Unduh template dengan klik tombol Download Template.</li>
                                    <li>Buka file template dengan Microsoft Excel atau aplikasi spreadsheet lainnya.</li>
                                    <li>Isikan data sesuai format yang telah ditentukan. Pastikan semua kolom terisi dengan benar.</li>
                                    <li>Simpan file Excel setelah selesai mengisi data.</li>
                                    <li>Klik tombol Import Excel dan pilih file yang telah diisi.</li>
                                    <li>Tunggu hingga proses import selesai.</li>
                                  </ol>
                                </div>
                                
                                <div>
                                  <h3 className="font-medium">Tips Import</h3>
                                  <ul className="list-disc ml-5 space-y-1">
                                    <li>Pastikan format kolom numerik sudah benar (Volume dan Harga Satuan).</li>
                                    <li>Jangan mengubah nama kolom pada baris pertama.</li>
                                    <li>Pastikan tidak ada sel yang kosong pada baris data.</li>
                                    <li>Jika menggunakan template dari aplikasi ini, format kolom sudah diatur dengan benar.</li>
                                    <li>Pastikan nilai numerik tidak menggunakan tanda pemisah ribuan seperti titik atau koma.</li>
                                  </ul>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction>Tutup</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="mt-4">
                      <ExcelImportExport 
                        onImport={handleImport}
                        komponenOutput={filters.komponenOutput !== 'all' ? filters.komponenOutput : undefined}
                        subKomponen={filters.subKomponen !== 'all' ? filters.subKomponen : undefined}
                        akun={filters.akun !== 'all' ? filters.akun : undefined}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
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
                      <Card className="border border-changed-row shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-gray-700">Detil Diubah</h3>
                          <p className="text-lg font-bold">{budgetSummary.changedItems.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-new-row shadow-sm bg-gradient-to-r from-emerald-50 to-green-50">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-gray-700">Detil Baru</h3>
                          <p className="text-lg font-bold">{budgetSummary.newItems.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-deleted-row shadow-sm bg-gradient-to-r from-red-50 to-rose-50">
                        <CardContent className="p-2">
                          <h3 className="text-xs font-semibold text-gray-700">Detil Dihapus</h3>
                          <p className="text-lg font-bold">{budgetSummary.deletedItems.length}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={showSummary}
                      className="w-full md:w-auto h-8 text-xs btn-gradient-blue"
                    >
                      <Info className="mr-1 h-3 w-3" /> 
                      Lihat Detail Ringkasan
                    </Button>
                    
                    <div className="mt-4">
                      <DetailedSummaryView />
                    </div>
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
