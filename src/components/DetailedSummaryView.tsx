
import React, { useState } from 'react';
import { 
  BarChart3, 
  Table2 
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BudgetSummaryRecord } from '@/types/database';
import SummaryTable from './SummaryTable';
import SummaryChart from './SummaryChart';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group';

interface DetailedSummaryViewProps {
  summaryData: BudgetSummaryRecord[];
  loading: boolean;
  view: SummaryViewType;
  setView: (view: SummaryViewType) => void;
  defaultView?: 'table' | 'bar';
}

const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({ 
  summaryData, 
  loading, 
  view, 
  setView,
  defaultView = 'table' 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'table'>(defaultView);

  const isLoading = loading || !summaryData;
  
  // Filter data to remove empty entries
  const filteredSummaryData = summaryData.filter(item => {
    if (view === 'komponen_output') {
      return item.type === 'komponen_output' && 'komponen_output' in item && item.komponen_output !== null && item.komponen_output !== '-';
    } else if (view === 'akun') {
      return item.type === 'akun' && 'akun' in item && item.akun !== null && item.akun !== '-';
    } else if (view === 'program_pembebanan') {
      return item.type === 'program_pembebanan' && 'program_pembebanan' in item && item.program_pembebanan !== null && item.program_pembebanan !== '-';
    } else if (view === 'kegiatan') {
      return item.type === 'kegiatan' && 'kegiatan' in item && item.kegiatan !== null && item.kegiatan !== '-';
    } else if (view === 'rincian_output') {
      return item.type === 'rincian_output' && 'rincian_output' in item && item.rincian_output !== null && item.rincian_output !== '-';
    } else if (view === 'sub_komponen') {
      return item.type === 'sub_komponen' && 'sub_komponen' in item && item.sub_komponen !== null && item.sub_komponen !== '-';
    } else if (view === 'account_group') {
      return item.type === 'account_group' && 'account_group' in item && item.account_group !== null && item.account_group !== '-';
    }
    return true;
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
            size="sm" // Smaller size
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
      ) : chartType === 'table' ? (
        <SummaryTable summaryData={filteredSummaryData} view={view} />
      ) : (
        <SummaryChart summaryData={filteredSummaryData} chartType="bar" view={view} />
      )}
    </div>
  );
};

export default DetailedSummaryView;
