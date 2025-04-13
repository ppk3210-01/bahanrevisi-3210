
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SummaryViewType = 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen' | 'account_group';

interface SummaryTableProps {
  summaryData: BudgetSummaryRecord[];
  view: SummaryViewType;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ summaryData, view }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const getColumnName = (): string => {
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

  const getValueFromRecord = (record: BudgetSummaryRecord): string | null => {
    switch (record.type) {
      case 'komponen_output': 
        if (view === 'komponen_output' && 'komponen_output' in record) {
          return record.komponen_output || '-';
        }
        break;
      case 'akun': 
        if (view === 'akun' && 'akun' in record) {
          return record.akun || '-';
        }
        break;
      case 'program_pembebanan': 
        if (view === 'program_pembebanan' && 'program_pembebanan' in record) {
          return record.program_pembebanan || '-';
        }
        break;
      case 'kegiatan': 
        if (view === 'kegiatan' && 'kegiatan' in record) {
          return record.kegiatan || '-';
        }
        break;
      case 'rincian_output': 
        if (view === 'rincian_output' && 'rincian_output' in record) {
          return record.rincian_output || '-';
        }
        break;
      case 'sub_komponen': 
        if (view === 'sub_komponen' && 'sub_komponen' in record) {
          return record.sub_komponen || '-';
        }
        break;
      case 'account_group': 
        if (view === 'account_group' && 'account_group' in record) {
          return record.account_group || '-';
        }
        break;
    }
    return '-';
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getGroupedData = () => {
    let data = [...summaryData];
    
    if (sortField) {
      data.sort((a, b) => {
        let valA: any;
        let valB: any;
        
        switch (sortField) {
          case 'category':
            valA = getValueFromRecord(a) || '';
            valB = getValueFromRecord(b) || '';
            break;
          case 'totalSemula':
            valA = a.total_semula || 0;
            valB = b.total_semula || 0;
            break;
          case 'totalMenjadi':
            valA = a.total_menjadi || 0;
            valB = b.total_menjadi || 0;
            break;
          case 'totalSelisih':
            valA = a.total_selisih || 0;
            valB = b.total_selisih || 0;
            break;
          case 'newItems':
            valA = a.new_items || 0;
            valB = b.new_items || 0;
            break;
          case 'changedItems':
            valA = a.changed_items || 0;
            valB = b.changed_items || 0;
            break;
          case 'totalItems':
            valA = a.total_items || 0;
            valB = b.total_items || 0;
            break;
          default:
            return 0;
        }
        
        if (valA === valB) return 0;
        
        const result = valA > valB ? 1 : -1;
        return sortDirection === 'asc' ? result : -result;
      });
    }
    
    return data;
  };
  
  const displayData = getGroupedData();

  const totalSemula = displayData.reduce((sum, record) => sum + (record.total_semula || 0), 0);
  const totalMenjadi = displayData.reduce((sum, record) => sum + (record.total_menjadi || 0), 0);
  const totalSelisih = totalMenjadi - totalSemula;
  const totalNewItems = displayData.reduce((sum, record) => sum + (record.new_items || 0), 0);
  const totalChangedItems = displayData.reduce((sum, record) => sum + (record.changed_items || 0), 0);
  const totalItems = displayData.reduce((sum, record) => sum + (record.total_items || 0), 0);

  const getCategoryColumnClass = () => {
    switch (view) {
      case 'program_pembebanan':
        return 'w-[220px] whitespace-normal';
      case 'account_group':
        return 'w-[200px]';
      default:
        return 'w-[250px]';
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className={getCategoryColumnClass()}>
              <Button variant="ghost" onClick={() => handleSort('category')} className="flex items-center p-0 text-slate-700">
                {getColumnName()} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('totalSemula')} className="flex items-center justify-end p-0 w-full text-slate-700">
                Total Semula <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('totalMenjadi')} className="flex items-center justify-end p-0 w-full text-slate-700">
                Total Menjadi <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('totalSelisih')} className="flex items-center justify-end p-0 w-full text-slate-700">
                Selisih <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('newItems')} className="flex items-center justify-center p-0 w-full text-slate-700">
                Items Baru <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('changedItems')} className="flex items-center justify-center p-0 w-full text-slate-700">
                Items Berubah <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('totalItems')} className="flex items-center justify-center p-0 w-full text-slate-700">
                Total Items <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-600">Tidak ada data</TableCell>
            </TableRow>
          ) : (
            displayData.map((record, index) => {
              const categoryValue = getValueFromRecord(record);
              const totalSemula = roundToThousands(record.total_semula || 0);
              const totalMenjadi = roundToThousands(record.total_menjadi || 0);
              const totalSelisih = roundToThousands(record.total_selisih || 0);
              const newItems = record.new_items || 0;
              const changedItems = record.changed_items || 0;
              const totalItems = record.total_items || 0;
              
              return (
                <TableRow key={`${categoryValue}-${index}`} className="py-1">
                  <TableCell className="font-medium whitespace-normal text-left text-slate-700">{categoryValue}</TableCell>
                  <TableCell className="text-right text-slate-700">{formatCurrency(totalSemula)}</TableCell>
                  <TableCell className="text-right text-slate-700">{formatCurrency(totalMenjadi)}</TableCell>
                  <TableCell className={`text-right ${totalSelisih !== 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {formatCurrency(totalSelisih)}
                  </TableCell>
                  <TableCell className="text-center text-slate-700">{newItems}</TableCell>
                  <TableCell className="text-center text-slate-700">{changedItems}</TableCell>
                  <TableCell className="text-center text-slate-700">{totalItems}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold text-left text-slate-800">TOTAL</TableCell>
            <TableCell className="text-right font-bold text-slate-800">{formatCurrency(roundToThousands(totalSemula))}</TableCell>
            <TableCell className="text-right font-bold text-slate-800">{formatCurrency(roundToThousands(totalMenjadi))}</TableCell>
            <TableCell className={`text-right font-bold ${totalSelisih !== 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {formatCurrency(roundToThousands(totalSelisih))}
            </TableCell>
            <TableCell className="text-center font-bold text-slate-800">{totalNewItems}</TableCell>
            <TableCell className="text-center font-bold text-slate-800">{totalChangedItems}</TableCell>
            <TableCell className="text-center font-bold text-slate-800">{totalItems}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default SummaryTable;
