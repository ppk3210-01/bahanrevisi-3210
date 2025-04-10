
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { BudgetSummaryRecord } from '@/types/database';
import { formatCurrency } from '@/utils/budgetCalculations';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SummaryViewType = 'account_group' | 'komponen_output' | 'akun' | 'program_pembebanan' | 'kegiatan' | 'rincian_output' | 'sub_komponen';

interface SummaryTableProps {
  summaryData: BudgetSummaryRecord[];
  view: SummaryViewType;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ summaryData, view }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const getColumnName = (): string => {
    switch (view) {
      case 'account_group': return 'Kelompok Akun';
      case 'komponen_output': return 'Komponen Output';
      case 'akun': return 'Akun';
      case 'program_pembebanan': return 'Program Pembebanan';
      case 'kegiatan': return 'Kegiatan';
      case 'rincian_output': return 'Rincian Output';
      case 'sub_komponen': return 'Sub Komponen';
      default: return 'Kategori';
    }
  };

  const getValueFromRecord = (record: BudgetSummaryRecord): string | null => {
    switch (record.type) {
      case 'account_group': 
        if (view === 'account_group' && 'account_group' in record) {
          return record.account_group || '-';
        }
        break;
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
    
    if (view === 'account_group') {
      // Group by first two digits for account_group
      const groupedData: Map<string, BudgetSummaryRecord> = new Map();
      
      data.forEach(item => {
        if (item.type === 'account_group' && 'account_group' in item && item.account_group) {
          // Extract the first two digits for grouping
          let accountGroupStr = item.account_group.toString().trim();
          
          // Skip empty entries
          if (!accountGroupStr || accountGroupStr === '-') return;
          
          // Extract first two digits
          const firstTwoDigits = accountGroupStr.substring(0, 2);
          const groupKey = `${firstTwoDigits}xxxx`;
            
          if (groupedData.has(groupKey)) {
            // Add to existing group
            const existingItem = groupedData.get(groupKey)!;
            existingItem.total_semula = (existingItem.total_semula || 0) + (item.total_semula || 0);
            existingItem.total_menjadi = (existingItem.total_menjadi || 0) + (item.total_menjadi || 0);
            existingItem.total_selisih = (existingItem.total_selisih || 0) + (item.total_selisih || 0);
            existingItem.new_items = (existingItem.new_items || 0) + (item.new_items || 0);
            existingItem.changed_items = (existingItem.changed_items || 0) + (item.changed_items || 0);
            existingItem.total_items = (existingItem.total_items || 0) + (item.total_items || 0);
          } else {
            // Create new group
            groupedData.set(groupKey, {
              ...item,
              account_group: groupKey,
              type: 'account_group'
            });
          }
        }
      });
      
      data = Array.from(groupedData.values());
    }
    
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

  // Calculate totals for footer row
  const totalSemula = displayData.reduce((sum, record) => sum + (record.total_semula || 0), 0);
  const totalMenjadi = displayData.reduce((sum, record) => sum + (record.total_menjadi || 0), 0);
  const totalSelisih = totalMenjadi - totalSemula;
  const totalNewItems = displayData.reduce((sum, record) => sum + (record.new_items || 0), 0);
  const totalChangedItems = displayData.reduce((sum, record) => sum + (record.changed_items || 0), 0);
  const totalItems = displayData.reduce((sum, record) => sum + (record.total_items || 0), 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button variant="ghost" onClick={() => handleSort('category')} className="flex items-center p-0">
                {getColumnName()} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => handleSort('totalSemula')} className="flex items-center justify-end p-0 w-full">
                Total Semula <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => handleSort('totalMenjadi')} className="flex items-center justify-end p-0 w-full">
                Total Menjadi <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => handleSort('totalSelisih')} className="flex items-center justify-end p-0 w-full">
                Selisih <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('newItems')} className="flex items-center justify-center p-0 w-full">
                Items Baru <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('changedItems')} className="flex items-center justify-center p-0 w-full">
                Items Berubah <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('totalItems')} className="flex items-center justify-center p-0 w-full">
                Total Items <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Tidak ada data</TableCell>
            </TableRow>
          ) : (
            displayData.map((record, index) => {
              const categoryValue = getValueFromRecord(record);
              const totalSemula = record.total_semula || 0;
              const totalMenjadi = record.total_menjadi || 0;
              const totalSelisih = record.total_selisih || 0;
              const newItems = record.new_items || 0;
              const changedItems = record.changed_items || 0;
              const totalItems = record.total_items || 0;
              
              return (
                <TableRow key={`${categoryValue}-${index}`}>
                  <TableCell className="font-medium">{categoryValue}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalSemula)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalMenjadi)}</TableCell>
                  <TableCell className={`text-right ${totalSelisih !== 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(totalSelisih)}
                  </TableCell>
                  <TableCell className="text-center">{newItems}</TableCell>
                  <TableCell className="text-center">{changedItems}</TableCell>
                  <TableCell className="text-center">{totalItems}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">TOTAL</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(totalSemula)}</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(totalMenjadi)}</TableCell>
            <TableCell className={`text-right font-bold ${totalSelisih !== 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(totalSelisih)}
            </TableCell>
            <TableCell className="text-center font-bold">{totalNewItems}</TableCell>
            <TableCell className="text-center font-bold">{totalChangedItems}</TableCell>
            <TableCell className="text-center font-bold">{totalItems}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default SummaryTable;
