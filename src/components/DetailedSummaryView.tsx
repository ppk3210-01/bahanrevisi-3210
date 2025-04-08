
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/budgetCalculations';
import { ChartContainer } from './ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BudgetSummaryRecord, BudgetSummaryByAccountGroup, BudgetSummaryByKomponen, BudgetSummaryByAkun } from '@/types/database';
import { Button } from './ui/button';
import { FileBarChart2, FilePieChart, FileText } from 'lucide-react';

interface DetailedSummaryViewProps {
  summaryData: BudgetSummaryRecord[];
  loading: boolean;
  view: 'account_group' | 'komponen_output' | 'akun';
  setView: (view: 'account_group' | 'komponen_output' | 'akun') => void;
}

// Type guard functions for each budget summary type
const isAccountGroupSummary = (record: BudgetSummaryRecord): record is BudgetSummaryByAccountGroup => {
  return (record as BudgetSummaryByAccountGroup).account_group !== undefined;
};

const isKomponenSummary = (record: BudgetSummaryRecord): record is BudgetSummaryByKomponen => {
  return (record as BudgetSummaryByKomponen).komponen_output !== undefined;
};

const isAkunSummary = (record: BudgetSummaryRecord): record is BudgetSummaryByAkun => {
  return (record as BudgetSummaryByAkun).akun !== undefined;
};

// Safe accessor function for getting group field
const getGroupField = (record: BudgetSummaryRecord): string => {
  if (isAccountGroupSummary(record)) return record.account_group || '';
  if (isKomponenSummary(record)) return record.komponen_output || '';
  if (isAkunSummary(record)) return record.akun || '';
  return '';
};

// COLORS
const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
  '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090', 
  '#58508d', '#003f5c', '#7a5195', '#ef5675', '#ffa600'
];

// Chart configuration
const chartConfig = {
  semula: { color: '#8884d8', label: 'Semula' },
  menjadi: { color: '#82ca9d', label: 'Menjadi' },
  selisih: { color: '#ff8042', label: 'Selisih' },
};

const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({ 
  summaryData, 
  loading, 
  view, 
  setView 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'table'>('table'); // Changed default to table

  // Total calculations
  const totalSemula = summaryData.reduce((sum, item) => sum + (item.total_semula || 0), 0);
  const totalMenjadi = summaryData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0);
  const totalSelisih = summaryData.reduce((sum, item) => sum + (item.total_selisih || 0), 0);
  
  // Prepare data for charts - ensure each record has the appropriate type property
  const chartData = summaryData.map((record) => {
    const groupName = getGroupField(record);
    return {
      name: groupName || 'Unknown',
      semula: record.total_semula || 0,
      menjadi: record.total_menjadi || 0,
      selisih: record.total_selisih || 0,
      newItems: record.new_items || 0,
      changedItems: record.changed_items || 0,
      totalItems: record.total_items || 0
    };
  });

  // Prepare data for pie chart
  const pieChartData = chartData.map(item => ({
    name: item.name,
    value: Math.abs(item.menjadi)
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ringkasan Anggaran</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant={chartType === 'bar' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setChartType('bar')}
          >
            <FileBarChart2 className="h-4 w-4 mr-1" /> Bar Chart
          </Button>
          <Button 
            variant={chartType === 'pie' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setChartType('pie')}
          >
            <FilePieChart className="h-4 w-4 mr-1" /> Pie Chart
          </Button>
          <Button 
            variant={chartType === 'table' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setChartType('table')}
          >
            <FileText className="h-4 w-4 mr-1" /> Table
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={totalSemula === 0 ? "bg-gray-50" : "bg-blue-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Pagu Semula</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalSemula)}</p>
          </CardContent>
        </Card>
        
        <Card className={totalMenjadi === 0 ? "bg-gray-50" : "bg-green-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Pagu Menjadi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-800">{formatCurrency(totalMenjadi)}</p>
          </CardContent>
        </Card>
        
        <Card className={totalSelisih === 0 ? "bg-gray-50" : totalSelisih > 0 ? "bg-green-50" : "bg-red-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Selisih</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalSelisih > 0 ? 'text-green-600' : totalSelisih < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(totalSelisih)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'account_group' | 'komponen_output' | 'akun')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account_group">Kelompok Akun</TabsTrigger>
          <TabsTrigger value="komponen_output">Komponen Output</TabsTrigger>
          <TabsTrigger value="akun">Akun</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account_group" className="border rounded-md p-4 shadow-sm">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div>
              {chartType === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kelompok Akun</TableHead>
                        <TableHead className="text-right">Pagu Semula</TableHead>
                        <TableHead className="text-right">Pagu Menjadi</TableHead>
                        <TableHead className="text-right">Selisih</TableHead>
                        <TableHead className="text-right">Item Bertambah</TableHead>
                        <TableHead className="text-right">Item Berubah</TableHead>
                        <TableHead className="text-right">Jumlah Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData
                        .filter(isAccountGroupSummary)
                        .map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.account_group}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.total_semula || 0)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.total_menjadi || 0)}</TableCell>
                            <TableCell className={`text-right ${(record.total_selisih || 0) > 0 ? 'text-green-600' : (record.total_selisih || 0) < 0 ? 'text-red-600' : ''}`}>
                              {formatCurrency(record.total_selisih || 0)}
                            </TableCell>
                            <TableCell className="text-right">{record.new_items || 0}</TableCell>
                            <TableCell className="text-right">{record.changed_items || 0}</TableCell>
                            <TableCell className="text-right">{record.total_items || 0}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : chartType === 'bar' ? (
                <ChartContainer className="mt-4 h-96" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)} Jt`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Kelompok: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="semula" name="Semula" fill="#8884d8" />
                      <Bar dataKey="menjadi" name="Menjadi" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2">Distribusi Pagu Menjadi</h3>
                  <ChartContainer className="mt-4 h-96" config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="komponen_output" className="border rounded-md p-4 shadow-sm">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div>
              {chartType === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Komponen Output</TableHead>
                        <TableHead className="text-right">Pagu Semula</TableHead>
                        <TableHead className="text-right">Pagu Menjadi</TableHead>
                        <TableHead className="text-right">Selisih</TableHead>
                        <TableHead className="text-right">Item Bertambah</TableHead>
                        <TableHead className="text-right">Item Berubah</TableHead>
                        <TableHead className="text-right">Jumlah Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData
                        .filter(isKomponenSummary)
                        .map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.komponen_output}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.total_semula || 0)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.total_menjadi || 0)}</TableCell>
                            <TableCell className={`text-right ${(record.total_selisih || 0) > 0 ? 'text-green-600' : (record.total_selisih || 0) < 0 ? 'text-red-600' : ''}`}>
                              {formatCurrency(record.total_selisih || 0)}
                            </TableCell>
                            <TableCell className="text-right">{record.new_items || 0}</TableCell>
                            <TableCell className="text-right">{record.changed_items || 0}</TableCell>
                            <TableCell className="text-right">{record.total_items || 0}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : chartType === 'bar' ? (
                <ChartContainer className="mt-4 h-96" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)} Jt`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Komponen: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="semula" name="Semula" fill="#8884d8" />
                      <Bar dataKey="menjadi" name="Menjadi" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2">Distribusi Pagu Menjadi</h3>
                  <ChartContainer className="mt-4 h-96" config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="akun" className="border rounded-md p-4 shadow-sm">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div>
              {chartType === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Akun</TableHead>
                        <TableHead className="text-right">Pagu Semula</TableHead>
                        <TableHead className="text-right">Pagu Menjadi</TableHead>
                        <TableHead className="text-right">Selisih</TableHead>
                        <TableHead className="text-right">Item Bertambah</TableHead>
                        <TableHead className="text-right">Item Berubah</TableHead>
                        <TableHead className="text-right">Jumlah Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData
                        .filter(isAkunSummary)
                        .map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.akun}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.total_semula || 0)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.total_menjadi || 0)}</TableCell>
                            <TableCell className={`text-right ${(record.total_selisih || 0) > 0 ? 'text-green-600' : (record.total_selisih || 0) < 0 ? 'text-red-600' : ''}`}>
                              {formatCurrency(record.total_selisih || 0)}
                            </TableCell>
                            <TableCell className="text-right">{record.new_items || 0}</TableCell>
                            <TableCell className="text-right">{record.changed_items || 0}</TableCell>
                            <TableCell className="text-right">{record.total_items || 0}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : chartType === 'bar' ? (
                <ChartContainer className="mt-4 h-96" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)} Jt`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Akun: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="semula" name="Semula" fill="#8884d8" />
                      <Bar dataKey="menjadi" name="Menjadi" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2">Distribusi Pagu Menjadi</h3>
                  <ChartContainer className="mt-4 h-96" config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="border border-blue-100">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800 text-lg">Kesimpulan Anggaran</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          <p>Total Pagu anggaran <strong>semula</strong> sebesar <strong className="text-blue-600">{formatCurrency(totalSemula)}</strong> berubah menjadi <strong className="text-green-600">{formatCurrency(totalMenjadi)}</strong>, dengan selisih sebesar <strong className={totalSelisih < 0 ? "text-red-600" : "text-green-600"}>{formatCurrency(totalSelisih)}</strong>.</p>
          
          <p>Terdapat <strong>{summaryData.reduce((sum, item) => sum + (item.changed_items || 0), 0)}</strong> detil anggaran yang diubah dan <strong>{summaryData.reduce((sum, item) => sum + (item.new_items || 0), 0)}</strong> detil anggaran baru.</p>
          
          <p>Perubahan ini {totalSelisih !== 0 ? <strong className="text-red-600">menyebabkan</strong> : <strong className="text-green-600">tidak menyebabkan</strong>} perubahan pada total Pagu anggaran.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedSummaryView;
