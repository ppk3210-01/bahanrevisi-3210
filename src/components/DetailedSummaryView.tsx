import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Table2 
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BudgetSummaryRecord } from '@/types/database';
import SummaryTable from './SummaryTable';
import SummaryChart from './SummaryChart';

interface DetailedSummaryViewProps {
  summaryData: BudgetSummaryRecord[];
  loading: boolean;
  view: 'account_group' | 'komponen_output' | 'akun';
  setView: (view: 'account_group' | 'komponen_output' | 'akun') => void;
  defaultView?: 'table' | 'bar' | 'pie';
}

const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({ 
  summaryData, 
  loading, 
  view, 
  setView,
  defaultView = 'table' 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'table'>(defaultView);

  const isLoading = loading || !summaryData;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <ToggleGroup 
            type="single" 
            value={view} 
            onValueChange={(value) => {
              if (value) setView(value as 'account_group' | 'komponen_output' | 'akun');
            }}
            size="sm" // Smaller size
            className="border p-0.5 rounded-md"
          >
            <ToggleGroupItem value="account_group" className="text-xs h-7 px-2">Kelompok Akun</ToggleGroupItem>
            <ToggleGroupItem value="komponen_output" className="text-xs h-7 px-2">Kelompok Output</ToggleGroupItem>
            <ToggleGroupItem value="akun" className="text-xs h-7 px-2">Akun</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div>
          <ToggleGroup 
            type="single" 
            value={chartType} 
            onValueChange={(value) => {
              if (value) setChartType(value as 'bar' | 'pie' | 'table');
            }}
            size="sm" // Smaller size
            className="border p-0.5 rounded-md"
          >
            <ToggleGroupItem value="bar" className="text-xs h-7 px-2">
              <BarChart3 className="h-3 w-3" />
              <span className="ml-1">Bar</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="pie" className="text-xs h-7 px-2">
              <PieChart className="h-3 w-3" />
              <span className="ml-1">Pie</span>
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
        <SummaryTable summaryData={summaryData} view={view} />
      ) : (
        <SummaryChart summaryData={summaryData} chartType={chartType} view={view} />
      )}
    </div>
  );
};

export default DetailedSummaryView;
