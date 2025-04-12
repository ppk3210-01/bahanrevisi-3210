
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group';

interface SummaryChartProps {
  summaryData: BudgetSummaryRecord[];
  chartType: 'bar';
  view: SummaryViewType;
}

const SummaryChart: React.FC<SummaryChartProps> = ({ summaryData, chartType, view }) => {
  const getValueFromRecord = (record: BudgetSummaryRecord): string | null => {
    if ('komponen_output' in record && view === 'komponen_output') {
      return record.komponen_output || 'Tidak ada data';
    } else if ('akun' in record && view === 'akun') {
      return record.akun || 'Tidak ada data';
    } else if ('program_pembebanan' in record && view === 'program_pembebanan') {
      return record.program_pembebanan || 'Tidak ada data';
    } else if ('kegiatan' in record && view === 'kegiatan') {
      return record.kegiatan || 'Tidak ada data';
    } else if ('rincian_output' in record && view === 'rincian_output') {
      return record.rincian_output || 'Tidak ada data';
    } else if ('sub_komponen' in record && view === 'sub_komponen') {
      return record.sub_komponen || 'Tidak ada data';
    } else if ('account_group' in record && view === 'account_group') {
      return record.account_group || 'Tidak ada data';
    }
    return 'Tidak ada data';
  };

  const transformChartData = () => {
    const sortedData = [...summaryData].sort((a, b) => {
      if (view === 'komponen_output') {
        const aKomponen = 'komponen_output' in a ? a.komponen_output || '' : '';
        const bKomponen = 'komponen_output' in b ? b.komponen_output || '' : '';
        return aKomponen.localeCompare(bKomponen);
      } else if (view === 'akun') {
        const aAkun = 'akun' in a ? a.akun || '' : '';
        const bAkun = 'akun' in b ? b.akun || '' : '';
        return aAkun.localeCompare(bAkun);
      } else if (view === 'program_pembebanan') {
        const aProgram = 'program_pembebanan' in a ? a.program_pembebanan || '' : '';
        const bProgram = 'program_pembebanan' in b ? b.program_pembebanan || '' : '';
        return aProgram.localeCompare(bProgram);
      } else if (view === 'kegiatan') {
        const aKegiatan = 'kegiatan' in a ? a.kegiatan || '' : '';
        const bKegiatan = 'kegiatan' in b ? b.kegiatan || '' : '';
        return aKegiatan.localeCompare(bKegiatan);
      } else if (view === 'rincian_output') {
        const aRincian = 'rincian_output' in a ? a.rincian_output || '' : '';
        const bRincian = 'rincian_output' in b ? b.rincian_output || '' : '';
        return aRincian.localeCompare(bRincian);
      } else if (view === 'sub_komponen') {
        const aSubKomponen = 'sub_komponen' in a ? a.sub_komponen || '' : '';
        const bSubKomponen = 'sub_komponen' in b ? b.sub_komponen || '' : '';
        return aSubKomponen.localeCompare(bSubKomponen);
      } else if (view === 'account_group') {
        const aAccountGroup = 'account_group' in a ? a.account_group || '' : '';
        const bAccountGroup = 'account_group' in b ? b.account_group || '' : '';
        return aAccountGroup.localeCompare(bAccountGroup);
      }
      return 0;
    });

    return sortedData.map(record => {
      const name = getValueFromRecord(record);
      const totalSemula = roundToThousands(record.total_semula || 0);
      const totalMenjadi = roundToThousands(record.total_menjadi || 0);
      const selisih = roundToThousands(record.total_selisih || 0);
      
      return {
        name: name && name.length > 20 ? `${name.substring(0, 18)}...` : name,
        fullName: name,
        totalSemula,
        totalMenjadi,
        selisih
      };
    });
  };

  const chartData = transformChartData();
  
  const getCategoryName = (): string => {
    switch (view) {
      case 'komponen_output': return 'Komponen Output';
      case 'akun': return 'Akun';
      case 'program_pembebanan': return 'Program Pembebanan';
      case 'kegiatan': return 'Kegiatan';
      case 'rincian_output': return 'Rincian Output';
      case 'sub_komponen': return 'Sub Komponen';
      case 'account_group': return 'Kelompok Akun';
      default: return 'Kategori';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium">{data.fullName || label}</p>
          <p className="text-sm">Total Semula: {formatCurrency(data.totalSemula)}</p>
          <p className="text-sm">Total Menjadi: {formatCurrency(data.totalMenjadi)}</p>
          <p className={`text-sm ${data.selisih > 0 ? 'text-green-600' : data.selisih < 0 ? 'text-red-600' : ''}`}>
            Selisih: {formatCurrency(data.selisih)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return <div className="p-4 text-center">Tidak ada data untuk ditampilkan.</div>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="totalSemula" name="Total Semula" fill="#8884d8" />
          <Bar dataKey="totalMenjadi" name="Total Menjadi" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;
