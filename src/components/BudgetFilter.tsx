
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterSelection } from '@/types/budget';
import { HIERARCHY_DATA } from '@/lib/constants';

interface BudgetFilterProps {
  onFilterChange: (filters: FilterSelection) => void;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterSelection>({
    programPembebanan: '',
    kegiatan: '',
    rincianOutput: '',
    komponenOutput: ''
  });

  // Handle changes to program pembebanan
  const handleProgramChange = (value: string) => {
    setFilters({
      programPembebanan: value,
      kegiatan: '',
      rincianOutput: '',
      komponenOutput: ''
    });
  };

  // Handle changes to kegiatan
  const handleKegiatanChange = (value: string) => {
    setFilters({
      ...filters,
      kegiatan: value,
      rincianOutput: '',
      komponenOutput: ''
    });
  };

  // Handle changes to rincian output
  const handleRincianOutputChange = (value: string) => {
    setFilters({
      ...filters,
      rincianOutput: value,
      komponenOutput: ''
    });
  };

  // Handle changes to komponen output
  const handleKomponenOutputChange = (value: string) => {
    setFilters({
      ...filters,
      komponenOutput: value
    });
  };

  // Trigger the filter change callback whenever filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pilih Program dan Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Program Pembebanan Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Program Pembebanan</label>
          <Select
            value={filters.programPembebanan}
            onValueChange={handleProgramChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Program Pembebanan" />
            </SelectTrigger>
            <SelectContent>
              {HIERARCHY_DATA.programPembebanan.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kegiatan Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Kegiatan</label>
          <Select
            value={filters.kegiatan}
            onValueChange={handleKegiatanChange}
            disabled={!filters.programPembebanan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kegiatan" />
            </SelectTrigger>
            <SelectContent>
              {filters.programPembebanan && 
                HIERARCHY_DATA.kegiatan[filters.programPembebanan]?.map((kegiatan) => (
                  <SelectItem key={kegiatan.id} value={kegiatan.id}>
                    {kegiatan.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rincian Output Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rincian Output</label>
          <Select
            value={filters.rincianOutput}
            onValueChange={handleRincianOutputChange}
            disabled={!filters.kegiatan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Rincian Output" />
            </SelectTrigger>
            <SelectContent>
              {filters.kegiatan && 
                HIERARCHY_DATA.rincianOutput[filters.kegiatan]?.map((rincian) => (
                  <SelectItem key={rincian.id} value={rincian.id}>
                    {rincian.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Komponen Output Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Komponen Output</label>
          <Select
            value={filters.komponenOutput}
            onValueChange={handleKomponenOutputChange}
            disabled={!filters.rincianOutput}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Komponen Output" />
            </SelectTrigger>
            <SelectContent>
              {filters.rincianOutput && 
                HIERARCHY_DATA.komponenOutput[filters.rincianOutput]?.map((komponen) => (
                  <SelectItem key={komponen.id} value={komponen.id}>
                    {komponen.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetFilter;
