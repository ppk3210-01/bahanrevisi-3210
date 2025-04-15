
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency } from '@/utils/budgetCalculations';
import { ACCOUNT_GROUP_MAP } from '@/lib/constants';

interface SummaryTableProps {
  data: BudgetSummaryRecord[];
  loading: boolean;
  view: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, loading, view }) => {
  if (loading) {
    return <div className="text-center p-4">Loading summary data...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center p-4">No summary data available</div>;
  }

  const getAccountGroupName = (code: string) => {
    if (view === 'account_group' && code && ACCOUNT_GROUP_MAP[code]) {
      return `${code} - ${ACCOUNT_GROUP_MAP[code]}`;
    }
    return code;
  };

  const getNameField = () => {
    if (view === 'komponen_output') return 'Komponen Output';
    if (view === 'akun') return 'Akun';
    if (view === 'program_pembebanan') return 'Program Pembebanan';
    if (view === 'kegiatan') return 'Kegiatan';
    if (view === 'rincian_output') return 'Rincian Output';
    if (view === 'sub_komponen') return 'Sub Komponen';
    if (view === 'account_group') return 'Kelompok Belanja';
    if (view === 'akun_group') return 'Kelompok Akun';
    return 'Name';
  };
  
  const getItemField = () => {
    if (view === 'komponen_output') return 'komponen_output';
    if (view === 'akun') return 'akun';
    if (view === 'program_pembebanan') return 'program_pembebanan';
    if (view === 'kegiatan') return 'kegiatan';
    if (view === 'rincian_output') return 'rincian_output';
    if (view === 'sub_komponen') return 'sub_komponen';
    if (view === 'account_group') return 'account_group';
    if (view === 'akun_group') return 'akun_group';
    return '';
  };

  const getIdValueForRow = (row: BudgetSummaryRecord) => {
    const field = getItemField();
    
    // Handle different record types
    if (view === 'account_group' && 'account_group' in row) {
      return getAccountGroupName(row.account_group);
    } else if (view === 'akun_group' && 'akun_group' in row) {
      return row.akun_group_name || row.akun_group;
    } else if (view === 'komponen_output' && 'komponen_output' in row) {
      return row.komponen_output;
    } else if (view === 'akun' && 'akun' in row) {
      return row.akun;
    } else if (view === 'program_pembebanan' && 'program_pembebanan' in row) {
      return row.program_pembebanan;
    } else if (view === 'kegiatan' && 'kegiatan' in row) {
      return row.kegiatan;
    } else if (view === 'rincian_output' && 'rincian_output' in row) {
      return row.rincian_output;
    } else if (view === 'sub_komponen' && 'sub_komponen' in row) {
      return row.sub_komponen;
    }
    
    return '';
  };

  const getGroupClassName = (code: string) => {
    if (view !== 'account_group') return '';
    return `group-${code}`;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table className={view === 'account_group' ? 'account-group-table' : ''}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-[30%]">{getNameField()}</TableHead>
            <TableHead className="text-right">Semula</TableHead>
            <TableHead className="text-right">Menjadi</TableHead>
            <TableHead className="text-right">Selisih</TableHead>
            <TableHead className="text-right">Persentase</TableHead>
            <TableHead className="text-center">Item Baru</TableHead>
            <TableHead className="text-center">Item Berubah</TableHead>
            <TableHead className="text-center">Total Item</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const percentChange = item.total_semula > 0 
              ? (item.total_selisih / item.total_semula * 100).toFixed(2) 
              : '0';
            
            const idValue = getIdValueForRow(item);
            
            // Get the group class conditionally based on view and record type
            let groupClass = '';
            if (view === 'account_group' && 'account_group' in item) {
              groupClass = getGroupClassName(item.account_group);
            }
            
            return (
              <TableRow key={index} className={groupClass}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className={`${view === 'account_group' ? 'group-name-cell' : ''}`}>
                  {idValue}
                </TableCell>
                <TableCell className={`text-right ${view === 'account_group' ? 'number-cell' : ''}`}>
                  {formatCurrency(item.total_semula)}
                </TableCell>
                <TableCell className={`text-right ${view === 'account_group' ? 'number-cell' : ''}`}>
                  {formatCurrency(item.total_menjadi)}
                </TableCell>
                <TableCell className={`text-right ${view === 'account_group' ? 'number-cell' : ''} ${
                  item.total_selisih > 0 ? 'text-green-600' : 
                  item.total_selisih < 0 ? 'text-red-600' : ''
                }`}>
                  {formatCurrency(item.total_selisih)}
                </TableCell>
                <TableCell className={`text-right ${
                  parseFloat(percentChange) > 0 ? 'text-green-600' : 
                  parseFloat(percentChange) < 0 ? 'text-red-600' : ''
                }`}>
                  {percentChange}%
                </TableCell>
                <TableCell className="text-center">{item.new_items || 0}</TableCell>
                <TableCell className="text-center">{item.changed_items || 0}</TableCell>
                <TableCell className="text-center">{item.total_items || 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SummaryTable;
