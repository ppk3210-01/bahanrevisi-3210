
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency } from '@/utils/budgetCalculations';

interface SummaryChartProps {
  summaryData: BudgetSummaryRecord[];
  chartType: 'bar' | 'pie';
  view: 'account_group' | 'komponen_output' | 'akun';
}

const SummaryChart: React.FC<SummaryChartProps> = ({ summaryData, chartType, view }) => {
  // Get the appropriate value from the record based on view type
  const getValueFromRecord = (record: BudgetSummaryRecord): string | null => {
    if ('account_group' in record && view === 'account_group') {
      return record.account_group || 'Tidak ada data';
    } else if ('komponen_output' in record && view === 'komponen_output') {
      return record.komponen_output || 'Tidak ada data';
    } else if ('akun' in record && view === 'akun') {
      return record.akun || 'Tidak ada data';
    }
    return 'Tidak ada data';
  };

  // Transform data for charts
  const transformChartData = () => {
    return summaryData.map(record => {
      const name = getValueFromRecord(record);
      const totalSemula = record.total_semula || 0;
      const totalMenjadi = record.total_menjadi || 0;
      const selisih = record.total_selisih || 0;
      
      return {
        name: name && name.length > 20 ? `${name.substring(0, 18)}...` : name,
        fullName: name, // Keep the full name for tooltips
        totalSemula,
        totalMenjadi,
        selisih
      };
    });
  };

  const chartData = transformChartData();
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#83a6ed', '#8dd1e1', '#a4de6c'];

  // Custom tooltip formatter for better display
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

  if (chartType === 'bar') {
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
  }

  // Pie chart visualization
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="totalMenjadi"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;
