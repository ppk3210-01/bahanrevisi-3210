
import React, { useState } from 'react';
import { 
  BarChart3, 
  Table2 
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BudgetSummaryRecord } from '@/types/database';
import SummaryTable from './SummaryTable';
import SummaryChart, { SummaryViewType } from './SummaryChart';

interface DetailedSummaryViewProps {
  summaryData?: BudgetSummaryRecord[];
  loading?: boolean;
  view?: SummaryViewType;
  setView?: (view: SummaryViewType) => void;
  defaultView?: 'table' | 'bar';
}

const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({ 
  summaryData = [], 
  loading = false, 
  view = 'komponen_output', 
  setView,
  defaultView = 'table' 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'table'>(defaultView);

  const isLoading = loading || !summaryData;
  
  // Filter data to remove empty entries
  const filteredSummaryData = summaryData.filter(item => {
    if (item.type === view) {
      switch (item.type) {
        case 'komponen_output':
          return item.komponen_output !== null && item.komponen_output !== '-';
        case 'akun':
          return item.akun !== null && item.akun !== '-';
        case 'program_pembebanan':
          return item.program_pembebanan !== null && item.program_pembebanan !== '-';
        case 'kegiatan':
          return item.kegiatan !== null && item.kegiatan !== '-';
        case 'rincian_output':
          return item.rincian_output !== null && item.rincian_output !== '-';
        case 'sub_komponen':
          return item.sub_komponen !== null && item.sub_komponen !== '-';
        case 'account_group':
          return item.account_group !== null && item.account_group !== '-';
        case 'akun_group':
          return item.akun_group !== null && item.akun_group !== '-';
      }
    }
    return false;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div></div>
        
        <div>
          <ToggleGroup 
            type="single" 
            value={chartType} 
            onValueChange={(value) => {
              if (value) setChartType(value as 'bar' | 'table');
            }}
            size="sm"
            className="border p-0.5 rounded-md"
          >
            <ToggleGroupItem value="bar" className="text-xs h-7 px-2">
              <BarChart3 className="h-3 w-3" />
              <span className="ml-1">Bar</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="table" className="text-xs h-7 px-2">
              <Table2 className="h-3 w-3" />
              <span className="ml-1">Table</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      {isLoading ? (
        <p>Loading summary data...</p>
      ) : (
        <div className="space-y-8">
          {/* Always show chart first, as requested (issue #4) */}
          <div className="chart-container">
            <SummaryChart summaryData={filteredSummaryData} chartType="bar" view={view} />
          </div>
          
          {/* Always show table below the chart */}
          <div className="table-container">
            <SummaryTable data={filteredSummaryData.map(item => ({
              id: item.type === 'komponen_output' ? item.komponen_output || '' :
                  item.type === 'akun' ? item.akun || '' :
                  item.type === 'program_pembebanan' ? item.program_pembebanan || '' :
                  item.type === 'kegiatan' ? item.kegiatan || '' :
                  item.type === 'rincian_output' ? item.rincian_output || '' :
                  item.type === 'sub_komponen' ? item.sub_komponen || '' :
                  item.type === 'account_group' ? item.account_group_name || item.account_group || '' :
                  item.type === 'akun_group' ? item.akun_group_name || item.akun_group || '' : '',
              name: item.type === 'komponen_output' ? item.komponen_output || '' :
                  item.type === 'akun' ? item.akun || '' :
                  item.type === 'program_pembebanan' ? item.program_pembebanan || '' :
                  item.type === 'kegiatan' ? item.kegiatan || '' :
                  item.type === 'rincian_output' ? item.rincian_output || '' :
                  item.type === 'sub_komponen' ? item.sub_komponen || '' :
                  item.type === 'account_group' ? item.account_group_name || item.account_group || '' :
                  item.type === 'akun_group' ? item.akun_group_name || item.akun_group || '' : '',
              totalSemula: item.total_semula || 0,
              totalMenjadi: item.total_menjadi || 0,
              totalSelisih: item.total_selisih || 0,
              newItems: item.new_items || 0,
              changedItems: item.changed_items || 0,
              totalItems: item.total_items || 0
            }))} title={`Ringkasan Anggaran per ${
              view === 'komponen_output' ? 'Komponen Output' :
              view === 'akun' ? 'Akun' :
              view === 'program_pembebanan' ? 'Program Pembebanan' :
              view === 'kegiatan' ? 'Kegiatan' :
              view === 'rincian_output' ? 'Rincian Output' :
              view === 'sub_komponen' ? 'Sub Komponen' :
              view === 'account_group' ? 'Kelompok Belanja' :
              view === 'akun_group' ? 'Kelompok Akun' : 'Kategori'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedSummaryView;
