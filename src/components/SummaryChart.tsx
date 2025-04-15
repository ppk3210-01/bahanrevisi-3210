
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group' | 'akun_group';

interface SummaryChartProps {
  summaryData: BudgetSummaryRecord[];
  loading: boolean;
  chartType: 'bar';
  view: SummaryViewType;
}

const SummaryChart: React.FC<SummaryChartProps> = ({ summaryData, loading, chartType, view }) => {
  if (loading) {
    return <div className="text-center p-4">Loading chart data...</div>;
  }

  if (!summaryData || summaryData.length === 0) {
    return <div className="text-center p-4">No data available for chart</div>;
  }
  
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
      return record.account_group_name || record.account_group || 'Tidak ada data';
    } else if ('akun_group' in record && view === 'akun_group') {
      return record.akun_group_name || record.akun_group || 'Tidak ada data';
    }
    return 'Tidak ada data';
  };

  const transformChartData = () => {
    const sortedData = [...summaryData].sort((a, b) => {
      const aValue = getValueFromRecord(a) || '';
      const bValue = getValueFromRecord(b) || '';
      return aValue.localeCompare(bValue);
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
      case 'account_group': return 'Kelompok Belanja';
      case 'akun_group': return 'Kelompok Akun';
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
