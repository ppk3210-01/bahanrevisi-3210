
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const trendData = [
  { name: 'Jan', semula: 4000, menjadi: 4200 },
  { name: 'Feb', semula: 3800, menjadi: 3600 },
  { name: 'Mar', semula: 4200, menjadi: 4500 },
  { name: 'Apr', semula: 4100, menjadi: 3900 },
  { name: 'May', semula: 3900, menjadi: 4100 },
  { name: 'Jun', semula: 4000, menjadi: 4300 },
];

const impactData = [
  { name: 'Perjalanan Dinas', value: 30 },
  { name: 'ATK', value: 15 },
  { name: 'Honor', value: 25 },
  { name: 'Belanja Modal', value: 20 },
  { name: 'Pelatihan', value: 10 },
];

const statusData = [
  { name: 'Disetujui', value: 65 },
  { name: 'Proses', value: 25 },
  { name: 'Ditolak', value: 10 },
];

const analysisData = [
  { name: 'Pos Naik', value: 45 },
  { name: 'Pos Tetap', value: 15 },
  { name: 'Pos Turun', value: 40 },
];

const BoxTrendChart = () => {
  return (
    <Card className="shadow-sm border-orange-100">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-sm text-orange-700">Tren Perubahan Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={trendData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip labelStyle={{ fontSize: 12 }} itemStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="semula" name="Pagu Semula" fill="#8884d8" />
            <Bar dataKey="menjadi" name="Pagu Menjadi" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const BoxAnalysisTrend = () => {
  return (
    <Card className="shadow-sm border-green-100">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-sm text-green-700">Analisis Tren</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-xs space-y-2">
          <p className="font-medium">Tren Anggaran:</p>
          <div className="grid grid-cols-3 gap-1">
            <div className="p-2 bg-green-50 rounded text-center">
              <p className="text-lg font-bold text-green-700">+5.2%</p>
              <p className="text-xs">Kenaikan Rata-rata</p>
            </div>
            <div className="p-2 bg-blue-50 rounded text-center">
              <p className="text-lg font-bold text-blue-700">7.9M</p>
              <p className="text-xs">Total Perubahan</p>
            </div>
            <div className="p-2 bg-orange-50 rounded text-center">
              <p className="text-lg font-bold text-orange-700">12</p>
              <p className="text-xs">Komponen Berubah</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            <div className="text-center text-xs">
              <div className="flex items-center justify-center mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Naik (45%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="text-center text-xs">
              <div className="flex items-center justify-center mb-1">
                <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
                <span>Tetap (15%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div className="text-center text-xs">
              <div className="flex items-center justify-center mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Turun (40%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BoxBudgetStatus = () => {
  return (
    <Card className="shadow-sm border-purple-100">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-sm text-purple-700">Status Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="p-1 text-xs">
            <div className="font-medium mb-1">Status Pengajuan:</div>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span>Disetujui: 65%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
                <span>Proses: 25%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Ditolak: 10%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BoxChangeAnalysis = () => {
  return (
    <Card className="shadow-sm border-red-100">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-sm text-red-700">Analisis Perubahan</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-xs">
          <div className="font-medium mb-2">Rekapitulasi Perubahan Anggaran:</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span>Pengurangan pada honor output kegiatan</span>
              <span className="text-red-600">-15.2M</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Penambahan pada belanja modal</span>
              <span className="text-green-600">+12.7M</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pengurangan pada perjalanan dinas</span>
              <span className="text-red-600">-5.9M</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Penambahan pada belanja barang</span>
              <span className="text-green-600">+8.4M</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>Selisih Akhir</span>
              <span className="text-blue-600">0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BoxImpactAnalysis = () => {
  return (
    <Card className="shadow-sm border-blue-100">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-sm text-blue-700">Dampak Perubahan Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={impactData}
                  cx="50%"
                  cy="50%"
                  outerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {impactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="p-1 text-xs max-w-[200px]">
            <div className="font-medium mb-1">Implikasi:</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Berkurangnya frekuensi perjalanan dinas</li>
              <li>Peningkatan belanja modal untuk perbaikan infrastruktur</li>
              <li>Penyesuaian honor kegiatan</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdvancedBudgetAnalysis = () => {
  const [currentTab, setCurrentTab] = useState("tren");
  
  return (
    <div className="space-y-3 mt-4">
      <h2 className="text-sm font-bold text-blue-800 mb-2">Analisis Lanjutan</h2>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-3 h-8 bg-blue-50">
          <TabsTrigger value="tren" className="text-xs">Tren & Status</TabsTrigger>
          <TabsTrigger value="analisis" className="text-xs">Analisis</TabsTrigger>
          <TabsTrigger value="dampak" className="text-xs">Dampak</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tren" className="mt-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BoxTrendChart />
            <BoxBudgetStatus />
          </div>
        </TabsContent>
        
        <TabsContent value="analisis" className="mt-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BoxAnalysisTrend />
            <BoxChangeAnalysis />
          </div>
        </TabsContent>
        
        <TabsContent value="dampak" className="mt-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BoxImpactAnalysis />
            <Card className="shadow-sm border-pink-100">
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="text-sm text-pink-700">Rekomendasi Tindak Lanjut</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-xs space-y-2">
                  <p className="font-medium">Saran Optimasi Anggaran:</p>
                  <div className="space-y-1 pl-4">
                    <div className="flex items-start">
                      <div className="min-w-3 h-3 rounded-full bg-blue-500 mr-1 mt-1"></div>
                      <p>Lakukan evaluasi efektivitas perjalanan dinas untuk mengoptimalkan penggunaan anggaran</p>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-3 h-3 rounded-full bg-green-500 mr-1 mt-1"></div>
                      <p>Prioritaskan belanja modal yang memberikan manfaat jangka panjang</p>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-3 h-3 rounded-full bg-orange-500 mr-1 mt-1"></div>
                      <p>Lakukan perencanaan ATK yang lebih terukur untuk menghindari pemborosan</p>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-3 h-3 rounded-full bg-purple-500 mr-1 mt-1"></div>
                      <p>Sesuaikan honor kegiatan berdasarkan kinerja dan beban kerja yang ada</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedBudgetAnalysis;
