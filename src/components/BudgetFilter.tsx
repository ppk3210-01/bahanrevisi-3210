import React from 'react';
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
  onFilterChange?: (filters: Partial<FilterSelection>) => void;
  filters: FilterSelection;
  setFilters?: React.Dispatch<React.SetStateAction<FilterSelection>>;
  programPembebananOptions?: any[];
  kegiatanOptions?: any[];
  rincianOutputOptions?: any[];
  komponenOutputOptions?: any[];
  subKomponenOptions?: any[];
  akunOptions?: any[];
  loading?: boolean;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({ 
  onFilterChange, 
  filters, 
  setFilters,
  programPembebananOptions,
  kegiatanOptions,
  rincianOutputOptions,
  komponenOutputOptions,
  subKomponenOptions,
  akunOptions,
  loading
}) => {
  const handleProgramChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange({
        programPembebanan: value,
        kegiatan: 'all',
        rincianOutput: 'all',
        komponenOutput: 'all',
        subKomponen: 'all'
      });
    } else if (setFilters) {
      setFilters(prev => ({
        ...prev,
        programPembebanan: value,
        kegiatan: 'all',
        rincianOutput: 'all',
        komponenOutput: 'all',
        subKomponen: 'all'
      }));
    }
  };

  const handleKegiatanChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange({
        kegiatan: value,
        rincianOutput: 'all',
        komponenOutput: 'all',
        subKomponen: 'all'
      });
    } else if (setFilters) {
      setFilters(prev => ({
        ...prev,
        kegiatan: value,
        rincianOutput: 'all',
        komponenOutput: 'all',
        subKomponen: 'all'
      }));
    }
  };

  const handleRincianOutputChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange({
        rincianOutput: value,
        komponenOutput: 'all',
        subKomponen: 'all'
      });
    } else if (setFilters) {
      setFilters(prev => ({
        ...prev,
        rincianOutput: value,
        komponenOutput: 'all',
        subKomponen: 'all'
      }));
    }
  };

  const handleKomponenOutputChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange({
        komponenOutput: value,
        subKomponen: 'all'
      });
    } else if (setFilters) {
      setFilters(prev => ({
        ...prev,
        komponenOutput: value,
        subKomponen: 'all'
      }));
    }
  };

  const handleSubKomponenChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange({
        subKomponen: value
      });
    } else if (setFilters) {
      setFilters(prev => ({
        ...prev,
        subKomponen: value
      }));
    }
  };

  const handleAkunChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange({
        akun: value
      });
    } else if (setFilters) {
      setFilters(prev => ({
        ...prev,
        akun: value
      }));
    }
  };

  return (
    <Card className="mb-3">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-base">Pilih Program dan Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Program Pembebanan</label>
          <Select
            value={filters.programPembebanan}
            onValueChange={handleProgramChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Pilih Program Pembebanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {HIERARCHY_DATA.programPembebanan.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Kegiatan</label>
          <Select
            value={filters.kegiatan}
            onValueChange={handleKegiatanChange}
            disabled={!filters.programPembebanan || filters.programPembebanan === 'all'}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Pilih Kegiatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {filters.programPembebanan && filters.programPembebanan !== 'all' && 
                HIERARCHY_DATA.kegiatan[filters.programPembebanan]?.map((kegiatan) => (
                  <SelectItem key={kegiatan.id} value={kegiatan.id}>
                    {kegiatan.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Rincian Output</label>
          <Select
            value={filters.rincianOutput}
            onValueChange={handleRincianOutputChange}
            disabled={!filters.kegiatan || filters.kegiatan === 'all'}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Pilih Rincian Output" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {filters.kegiatan && filters.kegiatan !== 'all' && 
                HIERARCHY_DATA.rincianOutput[filters.kegiatan]?.map((rincian) => (
                  <SelectItem key={rincian.id} value={rincian.id}>
                    {rincian.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Komponen Output</label>
          <Select
            value={filters.komponenOutput}
            onValueChange={handleKomponenOutputChange}
            disabled={!filters.rincianOutput || filters.rincianOutput === 'all'}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Pilih Komponen Output" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {filters.rincianOutput && filters.rincianOutput !== 'all' && 
                HIERARCHY_DATA.komponenOutput[filters.rincianOutput]?.map((komponen) => (
                  <SelectItem key={komponen.id} value={komponen.id}>
                    {komponen.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Sub Komponen</label>
          <Select
            value={filters.subKomponen}
            onValueChange={handleSubKomponenChange}
            disabled={!filters.programPembebanan || filters.programPembebanan === 'all'}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Pilih Sub Komponen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {filters.programPembebanan && filters.programPembebanan !== 'all' && 
                HIERARCHY_DATA.subKomponen[filters.programPembebanan]?.map((subKomponen) => (
                  <SelectItem key={subKomponen.id} value={subKomponen.id}>
                    {subKomponen.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Akun</label>
          <Select
            value={filters.akun}
            onValueChange={handleAkunChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Pilih Akun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {HIERARCHY_DATA.akun.map((akun) => (
                <SelectItem key={akun.id} value={akun.id}>
                  {akun.name}
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
