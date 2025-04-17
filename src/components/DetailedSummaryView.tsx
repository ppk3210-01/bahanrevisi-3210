
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency, roundToThousands, getSelisihTextColor } from '@/utils/budgetCalculations';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SummaryChart, { SummaryViewType } from './SummaryChart';
import { Card } from '@/components/ui/card';

interface DetailedSummaryViewProps {
  summaryData: BudgetSummaryRecord[];
  loading: boolean;
  view: SummaryViewType;
  setView: (view: SummaryViewType) => void;
  defaultView?: 'table' | 'chart';
  initialPageSize?: number;
}

const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({
  summaryData,
  loading,
  view,
  setView,
  defaultView = 'table',
  initialPageSize = 10
}) => {
  const [currentView, setCurrentView] = React.useState(defaultView);

  const getSummaryName = (item: BudgetSummaryRecord): string => {
    switch (item.type) {
      case 'komponen_output':
        return item.komponen_output || 'Tidak ada Komponen';
      case 'akun':
        // Include the akun code and name
        return `${item.akun} - ${(item as any).akun_name || 'Tidak ada Akun'}`;
      case 'program_pembebanan':
        return item.program_pembebanan || 'Tidak ada Program';
      case 'kegiatan':
        return item.kegiatan || 'Tidak ada Kegiatan';
      case 'rincian_output':
        return item.rincian_output || 'Tidak ada Rincian Output';
      case 'sub_komponen':
        return item.sub_komponen || 'Tidak ada Sub Komponen';
      case 'account_group':
        // Include the account group code and name
        return `${item.account_group} - ${item.account_group_name || 'Tidak ada Kelompok Belanja'}`;
      case 'akun_group':
        return `${item.akun_group} - ${item.akun_group_name || 'Tidak ada Kelompok Akun'}`;
      default:
        return 'Tidak ada Keterangan';
    }
  };
  
  const getColumnTitle = (): string => {
    switch (view) {
      case 'komponen_output':
        return 'Komponen Output';
      case 'akun':
        return 'Akun';
      case 'program_pembebanan':
        return 'Program Pembebanan';
      case 'kegiatan':
        return 'Kegiatan';
      case 'rincian_output':
        return 'Rincian Output';
      case 'sub_komponen':
        return 'Sub Komponen';
      case 'account_group':
        return 'Kelompok Belanja';
      case 'akun_group':
        return 'Kelompok Akun';
      default:
        return 'Keterangan';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading summary data...</div>;
  }

  // Calculate totals for the footer
  const filteredData = summaryData.filter(item => item.type === view);
  const totalSemula = filteredData.reduce((sum, item) => sum + (item.total_semula || 0), 0);
  const totalMenjadi = filteredData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0);
  const totalSelisih = filteredData.reduce((sum, item) => sum + (item.total_selisih || 0), 0);
  const totalNewItems = filteredData.reduce((sum, item) => sum + (item.new_items || 0), 0);
  const totalChangedItems = filteredData.reduce((sum, item) => sum + (item.changed_items || 0), 0);
  const totalItems = filteredData.reduce((sum, item) => sum + (item.total_items || 0), 0);

  const renderSummaryTable = () => (
    <div className="rounded-md border border-gray-200">
      <Table>
        <TableCaption>Ringkasan Data Berdasarkan {getColumnTitle()}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">{getColumnTitle()}</TableHead>
            <TableHead className="text-right">Total Semula</TableHead>
            <TableHead className="text-right">Total Menjadi</TableHead>
            <TableHead className="text-right">Selisih</TableHead>
            <TableHead className="text-center">Item Baru</TableHead>
            <TableHead className="text-center">Item Berubah</TableHead>
            <TableHead className="text-center">Total Item</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{getSummaryName(item)}</TableCell>
              <TableCell className="text-right">{formatCurrency(roundToThousands(item.total_semula || 0))}</TableCell>
              <TableCell className="text-right">{formatCurrency(roundToThousands(item.total_menjadi || 0))}</TableCell>
              <TableCell className={`text-right ${(item.total_selisih || 0) !== 0 ? 'selisih-non-zero' : 'selisih-zero'}`}>
                {formatCurrency(roundToThousands(item.total_selisih || 0))}
              </TableCell>
              <TableCell className="text-center">{item.new_items || 0}</TableCell>
              <TableCell className="text-center">{item.changed_items || 0}</TableCell>
              <TableCell className="text-center">{item.total_items || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(roundToThousands(totalSemula))}</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(roundToThousands(totalMenjadi))}</TableCell>
            <TableCell className={`text-right font-bold ${totalSelisih !== 0 ? 'selisih-non-zero' : 'selisih-zero'}`}>
              {formatCurrency(roundToThousands(totalSelisih))}
            </TableCell>
            <TableCell className="text-center font-bold">{totalNewItems}</TableCell>
            <TableCell className="text-center font-bold">{totalChangedItems}</TableCell>
            <TableCell className="text-center font-bold">{totalItems}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
  
  const renderSummaryChart = () => (
    <Card className="p-4">
      <h4 className="text-lg font-medium mb-2 text-gray-800">Grafik Ringkasan {getColumnTitle()}</h4>
      <SummaryChart 
        summaryData={summaryData.filter(item => item.type === view)}
        chartType="bar"
        view={view}
      />
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => setView('changes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div>
          <Button 
            variant={currentView === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCurrentView('table')}
          >
            Tabel
          </Button>
          <Button 
            variant={currentView === 'chart' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCurrentView('chart')}
          >
            Grafik
          </Button>
        </div>
      </div>
      
      {currentView === 'table' ? renderSummaryTable() : renderSummaryChart()}
    </div>
  );
};

export default DetailedSummaryView;
