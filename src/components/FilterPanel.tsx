
import React from 'react';
import BudgetFilter from '@/components/BudgetFilter';
import { FilterSelection } from '@/types/budget';

interface FilterPanelProps {
  onFilterChange: (filterType: string, value: string) => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, isLoading }) => {
  const handleFilterChange = (filters: Partial<FilterSelection>) => {
    Object.entries(filters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
  };

  // Current filters state for the BudgetFilter component
  const filterState: FilterSelection = {
    programPembebanan: 'all',
    kegiatan: 'all',
    rincianOutput: 'all',
    komponenOutput: 'all',
    subKomponen: 'all',
    akun: 'all'
  };

  return (
    <div className="space-y-4">
      <BudgetFilter 
        onFilterChange={handleFilterChange} 
        filters={filterState}
      />
    </div>
  );
};

export default FilterPanel;
