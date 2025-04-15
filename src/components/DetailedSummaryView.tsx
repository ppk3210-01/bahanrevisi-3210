
import React, { useState } from 'react';
import { 
  BarChart3, 
  Table2 
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BudgetSummaryRecord } from '@/types/database';
import SummaryTable from './SummaryTable';
import SummaryChart from './SummaryChart';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group' | 'akun_group';

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
  
  return (
    <div className="space-y-4">
      {/* Always show chart first */}
      <div className="mb-6">
        <SummaryChart 
          summaryData={summaryData}
          loading={loading}
          view={view}
          chartType="bar"
        />
      </div>
      
      {/* Then show table */}
      <div className="mt-6">
        <SummaryTable
          data={summaryData}
          loading={loading}
          view={view}
        />
      </div>
    </div>
  );
};

export default DetailedSummaryView;
