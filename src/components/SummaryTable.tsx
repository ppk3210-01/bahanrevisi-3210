
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency } from '@/utils/budgetCalculations';
import { ArrowUpDown } from 'lucide-react';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group' | 'akun_group';

interface SummaryTableProps {
  summaryData: BudgetSummaryRecord[];
  view: SummaryViewType;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ summaryData, view }) => {
  const [sortField, setSortField] = useState<string>('category');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const getItemCategoryValue = (item: BudgetSummaryRecord): string => {
    if ('komponen_output' in item && view === 'komponen_output') {
      return item.komponen_output || '';
    } else if ('akun' in item && view === 'akun') {
      return item.akun || '';
    } else if ('program_pembebanan' in item && view === 'program_pembebanan') {
      return item.program_pembebanan || '';
    } else if ('kegiatan' in item && view === 'kegiatan') {
      return item.kegiatan || '';
    } else if ('rincian_output' in item && view === 'rincian_output') {
      return item.rincian_output || '';
    } else if ('sub_komponen' in item && view === 'sub_komponen') {
      return item.sub_komponen || '';
    } else if ('account_group' in item && view === 'account_group' && 'account_group_name' in item) {
      return item.account_group_name || item.account_group || '';
    } else if ('akun_group' in item && view === 'akun_group' && 'akun_group_name' in item) {
      return item.akun_group_name || item.akun_group || '';
    }
    return '';
  };

  // Add a mapping for akun codes to names
  const getAkunName = (code: string): string => {
    const akunMap: { [key: string]: string } = {
      "511111": "Belanja Gaji Pokok PNS",
      "511119": "Belanja Pembulatan Gaji PNS",
      "511121": "Belanja Tunj. Suami/Istri PNS",
      "511122": "Belanja Tunj. Anak PNS",
      "511123": "Belanja Tunj. Struktural PNS",
      "511124": "Belanja Tunj. Fungsional PNS",
      "511125": "Belanja Tunj. PPh PNS",
      "511126": "Belanja Tunj. Beras PNS",
      "511129": "Belanja Uang Makan PNS",
      "511135": "Belanja Tunj. Daerah Terpencil/Sangat Terpencil PNS",
      "511138": "Belanja Tunjangan Khusus Papua PNS",
      "511151": "Belanja Tunjangan Umum PNS",
      "511153": "Belanja Tunjangan Profesi Dosen",
      "511169": "Belanja Pembulatan Gaji PNS TNI/Polri",
      "511512": "Belanja Tunjangan Pegawai Non PNS",
      "511611": "Belanja Gaji Pokok PPPK",
      "511619": "Belanja Pembulatan Gaji PPPK",
      "511621": "Belanja Tunjangan Suami/Istri PPPK",
      "511622": "Belanja Tunjangan Anak PPPK",
      "511624": "Belanja Tunjangan Fungsional PPPK",
      "511625": "Belanja Tunjangan Beras PPPK",
      "511628": "Belanja Uang Makan PPPK",
      "511629": "Belanja Tunjangan Kompensasi Kerja PPPK",
      "512211": "Belanja Uang Lembur",
      "512212": "Belanja Uang Lembur PPPK",
      "512411": "Belanja Pegawai (Tunjangan Khusus/Kegiatan/Kinerja)",
      "512414": "Belanja Pegawai Tunjangan Khusus/Kegiatan/Kinerja PPPK",
      "521111": "Belanja Keperluan Perkantoran",
      "521113": "Belanja Penambah Daya Tahan Tubuh",
      "521114": "Belanja Pengiriman Surat Dinas Pos Pusat",
      "521115": "Belanja Honor Operasional Satuan Kerja",
      "521119": "Belanja Barang Operasional Lainnya",
      "521121": "Belanja Barang Operasional kepada BLU dalam Satu Kementerian Negara/Lembaga",
      "521211": "Belanja Bahan",
      "521213": "Belanja Honor Output Kegiatan",
      "521219": "Belanja Barang Non Operasional Lainnya",
      "521252": "Belanja Peralatan dan Mesin - Ekstrakomptabel",
      "521253": "Belanja Gedung dan Bangunan - Ekstrakomptabel",
      "521811": "Belanja Barang Persediaan Barang Konsumsi",
      "522111": "Belanja Langganan Listrik",
      "522112": "Belanja Langganan Telepon",
      "522113": "Belanja Langganan Air",
      "522119": "Belanja Langganan Daya dan Jasa Lainnya",
      "522131": "Belanja Jasa Konsultan",
      "522141": "Belanja Sewa",
      "522151": "Belanja Jasa Profesi",
      "522191": "Belanja Jasa Lainnya",
      "523111": "Belanja Pemeliharaan Gedung dan Bangunan",
      "523112": "Belanja Barang Persediaan Pemeliharaan Gedung dan Bangunan",
      "523113": "Belanja Asuransi Gedung dan Bangunan",
      "523119": "Belanja Pemeliharaan Gedung dan Bangunan Lainnya",
      "523121": "Belanja Pemeliharaan Peralatan dan Mesin",
      "523123": "Belanja Barang Persediaan Pemeliharaan Peralatan dan Mesin",
      "523129": "Belanja Pemeliharaan Peralatan dan Mesin Lainnya",
      "524111": "Belanja Perjalanan Dinas Biasa",
      "524112": "Belanja Perjalanan Dinas Tetap",
      "524113": "Belanja Perjalanan Dinas Dalam Kota",
      "524114": "Belanja Perjalanan Dinas Paket Meeting Dalam Kota",
      "524119": "Belanja Perjalanan Dinas Paket Meeting Luar Kota",
      "524219": "Belanja Perjalanan Dinas Lainnya - Luar Negeri",
      "531111": "Belanja Modal Tanah",
      "532111": "Belanja Modal Peralatan dan Mesin",
      "533111": "Belanja Modal Gedung dan Bangunan",
      "533113": "Belanja Modal Upah Tenaga Kerja dan Honor Pengelola Teknis Gedung dan Bangunan",
      "533115": "Belanja Modal Perencanaan dan Pengawasan Gedung dan Bangunan",
      "533118": "Belanja Modal Perjalanan Gedung dan Bangunan",
      "533121": "Belanja Penambahan Nilai Gedung dan Bangunan",
      "536111": "Belanja Modal Lainnya"
    };
    
    return akunMap[code] || code;
  };

  const formatCategoryDisplay = (item: BudgetSummaryRecord): string => {
    if (view === 'akun' && 'akun' in item) {
      const akunCode = item.akun || '';
      const akunName = getAkunName(akunCode);
      return `${akunCode} ${akunName}`;
    }
    return getItemCategoryValue(item);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...summaryData].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'category':
        const aValue = getItemCategoryValue(a);
        const bValue = getItemCategoryValue(b);
        comparison = aValue.localeCompare(bValue);
        break;
      case 'total_semula':
        comparison = (a.total_semula || 0) - (b.total_semula || 0);
        break;
      case 'total_menjadi':
        comparison = (a.total_menjadi || 0) - (b.total_menjadi || 0);
        break;
      case 'total_selisih':
        comparison = (a.total_selisih || 0) - (b.total_selisih || 0);
        break;
      case 'new_items':
        comparison = (a.new_items || 0) - (b.new_items || 0);
        break;
      case 'changed_items':
        comparison = (a.changed_items || 0) - (b.changed_items || 0);
        break;
      case 'total_items':
        comparison = (a.total_items || 0) - (b.total_items || 0);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalRow = {
    total_semula: summaryData.reduce((sum, item) => sum + (item.total_semula || 0), 0),
    total_menjadi: summaryData.reduce((sum, item) => sum + (item.total_menjadi || 0), 0),
    total_selisih: summaryData.reduce((sum, item) => sum + (item.total_selisih || 0), 0),
    new_items: summaryData.reduce((sum, item) => sum + (item.new_items || 0), 0),
    changed_items: summaryData.reduce((sum, item) => sum + (item.changed_items || 0), 0),
    total_items: summaryData.reduce((sum, item) => sum + (item.total_items || 0), 0),
  };

  if (summaryData.length === 0) {
    return <p className="text-center py-4">Tidak ada data untuk ditampilkan.</p>;
  }

  return (
    <div>
      <Table className="border">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead 
              className="min-w-[200px] text-slate-700 font-semibold"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center cursor-pointer">
                {getCategoryName()}
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-slate-700 font-semibold"
              onClick={() => handleSort('total_semula')}
            >
              <div className="flex items-center justify-center cursor-pointer">
                Total Semula
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-slate-700 font-semibold"
              onClick={() => handleSort('total_menjadi')}
            >
              <div className="flex items-center justify-center cursor-pointer">
                Total Menjadi
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-slate-700 font-semibold"
              onClick={() => handleSort('total_selisih')}
            >
              <div className="flex items-center justify-center cursor-pointer">
                Selisih
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-slate-700 font-semibold"
              onClick={() => handleSort('new_items')}
            >
              <div className="flex items-center justify-center cursor-pointer">
                Item Baru
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-slate-700 font-semibold"
              onClick={() => handleSort('changed_items')}
            >
              <div className="flex items-center justify-center cursor-pointer">
                Item Berubah
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-slate-700 font-semibold"
              onClick={() => handleSort('total_items')}
            >
              <div className="flex items-center justify-center cursor-pointer">
                Total Item
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell className="text-left font-medium">{formatCategoryDisplay(item)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.total_semula || 0)}</TableCell>
              <TableCell className="text-right font-bold text-blue-600">{formatCurrency(item.total_menjadi || 0)}</TableCell>
              <TableCell className={`text-right ${(item.total_selisih || 0) > 0 ? 'text-red-600' : (item.total_selisih || 0) < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(item.total_selisih || 0)}
              </TableCell>
              <TableCell className="text-center">{item.new_items || 0}</TableCell>
              <TableCell className="text-center">{item.changed_items || 0}</TableCell>
              <TableCell className="text-center">{item.total_items || 0}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-100 font-medium">
            <TableCell className="font-semibold">TOTAL</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(totalRow.total_semula)}</TableCell>
            <TableCell className="text-right font-bold text-blue-600">{formatCurrency(totalRow.total_menjadi)}</TableCell>
            <TableCell className={`text-right font-semibold ${totalRow.total_selisih > 0 ? 'text-red-600' : totalRow.total_selisih < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(totalRow.total_selisih)}
            </TableCell>
            <TableCell className="text-center font-semibold">{totalRow.new_items}</TableCell>
            <TableCell className="text-center font-semibold">{totalRow.changed_items}</TableCell>
            <TableCell className="text-center font-semibold">{totalRow.total_items}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SummaryTable;
