import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FileImage, FileText, FileSpreadsheet } from 'lucide-react';
import SummaryTable from './SummaryTable';
import { formatCurrency } from '@/utils/budgetCalculations';
import { exportToJpeg, exportToPdf, exportToExcel } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
interface SummaryRow {
  id: string;
  name: string;
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  newItems: number;
  changedItems: number;
  totalItems: number;
}
interface DetailedSummaryViewProps {
  title: string;
  data: SummaryRow[];
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  showSummaryBoxes?: boolean;
}
const DetailedSummaryView: React.FC<DetailedSummaryViewProps> = ({
  title,
  data,
  totalSemula,
  totalMenjadi,
  totalSelisih,
  showSummaryBoxes = true
}) => {
  const chartAndTableRef = useRef<HTMLDivElement>(null);
  const {
    isAdmin
  } = useAuth();
  const chartData = data.filter(item => item.totalMenjadi !== 0 || item.totalSemula !== 0).map(item => ({
    name: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
    semula: item.totalSemula,
    menjadi: item.totalMenjadi,
    selisih: item.totalSelisih
  }));
  const handleExportJPEG = async () => {
    if (!chartAndTableRef.current) return;
    try {
      await exportToJpeg(chartAndTableRef.current, `ringkasan-${title.toLowerCase().replace(/\s+/g, '-')}`);
      toast({
        title: "Berhasil",
        description: 'Berhasil mengekspor sebagai JPEG'
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: 'Gagal mengekspor sebagai JPEG'
      });
    }
  };
  const handleExportPDF = async () => {
    if (!chartAndTableRef.current) return;
    try {
      await exportToPdf(chartAndTableRef.current, `ringkasan-${title.toLowerCase().replace(/\s+/g, '-')}`);
      toast({
        title: "Berhasil",
        description: 'Berhasil mengekspor sebagai PDF'
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: 'Gagal mengekspor sebagai PDF'
      });
    }
  };
  const handleExportExcel = async () => {
    try {
      await exportToExcel(data, `ringkasan-${title.toLowerCase().replace(/\s+/g, '-')}`);
      toast({
        title: "Berhasil",
        description: 'Berhasil mengekspor sebagai Excel'
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: 'Gagal mengekspor sebagai Excel'
      });
    }
  };
  return <div className="space-y-4">
      {isAdmin && <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportJPEG}>
            <FileImage className="h-4 w-4 mr-2" />
            Export JPEG
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>}
      
      <div ref={chartAndTableRef} className="space-y-6 bg-white p-4 rounded-lg">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Grafik Perbandingan {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{
                fontSize: 10
              }} />
                <YAxis tickFormatter={value => formatCurrency(value, false)} width={80} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={label => `${label}`} />
                <Legend />
                <Bar dataKey="semula" name="Total Semula" fill="#8884d8" />
                <Bar dataKey="menjadi" name="Total Menjadi" fill="#82ca9d" />
                <Bar dataKey="selisih" name="Selisih" fill="#ffc658">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.selisih === 0 ? '#4ade80' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {showSummaryBoxes && <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                
                
                
              </div>}
          </CardContent>
        </Card>
        
        <SummaryTable title={`Tabel Perbandingan ${title}`} data={data} initialPageSize={-1} />
      </div>
    </div>;
};
export default DetailedSummaryView;