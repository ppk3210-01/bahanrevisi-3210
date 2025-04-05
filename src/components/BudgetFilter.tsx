
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
  onFilterChange: (filters: Partial<FilterSelection>) => void;
  filters: FilterSelection;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({ onFilterChange, filters }) => {
  // Handle changes to program pembebanan
  const handleProgramChange = (value: string) => {
    onFilterChange({
      programPembebanan: value,
      kegiatan: 'all',
      rincianOutput: 'all',
      komponenOutput: 'all',
      subKomponen: 'all'
      // Keep akun filter as it's independent
    });
  };

  // Handle changes to kegiatan
  const handleKegiatanChange = (value: string) => {
    onFilterChange({
      kegiatan: value,
      rincianOutput: 'all',
      komponenOutput: 'all',
      subKomponen: 'all'
    });
  };

  // Handle changes to rincian output
  const handleRincianOutputChange = (value: string) => {
    onFilterChange({
      rincianOutput: value,
      komponenOutput: 'all',
      subKomponen: 'all'
    });
  };

  // Handle changes to komponen output
  const handleKomponenOutputChange = (value: string) => {
    onFilterChange({
      komponenOutput: value,
      subKomponen: 'all'
    });
  };

  // Handle changes to sub komponen
  const handleSubKomponenChange = (value: string) => {
    onFilterChange({
      subKomponen: value
    });
  };

  // Handle changes to akun
  const handleAkunChange = (value: string) => {
    onFilterChange({
      akun: value
    });
  };

  return (
    <Card className="mb-3">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-base">Pilih Program dan Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Program Pembebanan Dropdown */}
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

        {/* Kegiatan Dropdown */}
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

        {/* Rincian Output Dropdown */}
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

        {/* Komponen Output Dropdown */}
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

        {/* Sub Komponen Dropdown */}
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

        {/* Akun Dropdown */}
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
