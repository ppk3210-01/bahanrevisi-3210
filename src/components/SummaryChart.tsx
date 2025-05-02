
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

export type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group' | 'akun_group' | 'changes';

interface SummaryChartProps {
  summaryData: BudgetSummaryRecord[];
  chartType: 'bar';
  view: SummaryViewType;
  customData?: {
    semula?: number;
    menjadi?: number;
    selisih?: number;
  };
}

const SummaryChart: React.FC<SummaryChartProps> = ({ summaryData, view, customData }) => {
  const getValueFromRecord = (record: BudgetSummaryRecord): string | null => {
    switch (record.type) {
      case 'komponen_output':
        return record.komponen_output || 'Tidak ada data';
      case 'akun':
        return record.akun || 'Tidak ada data';
      case 'program_pembebanan':
        return record.program_pembebanan || 'Tidak ada data';
      case 'kegiatan':
        return record.kegiatan || 'Tidak ada data';
      case 'rincian_output':
        return record.rincian_output || 'Tidak ada data';
      case 'sub_komponen':
        return record.sub_komponen || 'Tidak ada data';
      case 'account_group':
        return record.account_group_name || record.account_group || 'Tidak ada data';
      case 'akun_group':
        return record.akun_group_name || record.akun_group || 'Tidak ada data';
      default:
        return 'Tidak ada data';
    }
  };

  const transformChartData = () => {
    if (customData) {
      if (customData.semula !== undefined && customData.menjadi !== undefined && customData.selisih !== undefined) {
        return [
          { name: 'Anggaran', totalSemula: customData.semula, totalMenjadi: customData.menjadi, selisih: customData.selisih }
        ];
      }
      return [];
    }

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
      case 'changes': return 'Perubahan';
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
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 5, bottom: 25 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={50}
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            width={60}
            tick={{ fontSize: 9 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
          <Bar dataKey="totalSemula" name="Total Semula" fill="#8884d8" />
          <Bar dataKey="totalMenjadi" name="Total Menjadi" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;
