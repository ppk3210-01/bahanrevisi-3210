import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, roundToThousands, calculateRealisasi, calculatePersentaseRealisasi, formatPercentage } from '@/utils/budgetCalculations';
import { BudgetSummaryRecord } from '@/types/database';

interface SummaryRow {
  id: string;
  name: string;
  totalSemula: number;
  totalMenjadi: number;
  totalSelisih: number;
  newItems: number;
  changedItems: number;
  totalItems: number;
  sisaAnggaran?: number;
  realisasi?: number;
  persentaseRealisasi?: number;
}

interface SummaryTableProps {
  data?: SummaryRow[];
  title?: string;
  summaryData?: BudgetSummaryRecord[];
  view?: string;
  initialPageSize?: number;
}

const SummaryTable: React.FC<SummaryTableProps> = ({
  data = [],
  title = "",
  summaryData,
  view,
  initialPageSize = 10
}) => {
  const [sortField, setSortField] = useState<keyof SummaryRow>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialPageSize);

  const handleSort = (field: keyof SummaryRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Process data to include new calculations with corrected formula
  const processedData = data && data.length > 0 ? data.map(row => {
    const sisaAnggaran = row.sisaAnggaran || 0;
    const realisasi = calculateRealisasi(row.totalMenjadi, sisaAnggaran);
    const persentaseRealisasi = calculatePersentaseRealisasi(realisasi, row.totalMenjadi);
    
    return {
      ...row,
      sisaAnggaran,
      realisasi,
      persentaseRealisasi
    };
  }) : [];

  const sortedData = [...processedData].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    }
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = itemsPerPage === -1 ? sortedData : sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calculate totals for the footer
  const totalSemula = sortedData.reduce((sum, item) => sum + item.totalSemula, 0);
  const totalMenjadi = sortedData.reduce((sum, item) => sum + item.totalMenjadi, 0);
  const totalSelisih = sortedData.reduce((sum, item) => sum + item.totalSelisih, 0);
  const totalNewItems = sortedData.reduce((sum, item) => sum + item.newItems, 0);
  const totalChangedItems = sortedData.reduce((sum, item) => sum + item.changedItems, 0);
  const totalItems = sortedData.reduce((sum, item) => sum + item.totalItems, 0);
  const totalSisaAnggaran = sortedData.reduce((sum, item) => sum + (item.sisaAnggaran || 0), 0);
  const totalRealisasi = calculateRealisasi(totalMenjadi, totalSisaAnggaran);
  const totalPersentaseRealisasi = calculatePersentaseRealisasi(totalRealisasi, totalMenjadi);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold">{title}</h3>
        {initialPageSize !== -1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Tampilkan:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="10 items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="25">25 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="-1">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="w-8">No</TableHead>
              <TableHead className="w-[20%]">
                <button className="flex items-center font-semibold" onClick={() => handleSort('name')}>
                  Nama
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('totalSemula')}>
                  Total Semula
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('totalMenjadi')}>
                  Total Menjadi
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('totalSelisih')}>
                  Selisih
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('sisaAnggaran')}>
                  Sisa Anggaran
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('realisasi')}>
                  Realisasi
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('persentaseRealisasi')}>
                  Persentase Realisasi
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('newItems')}>
                  Items Baru
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('changedItems')}>
                  Items Berubah
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end font-semibold w-full" onClick={() => handleSort('totalItems')}>
                  Total Items
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row, index) => (
                <TableRow key={row.id} className={index % 2 === 0 ? "bg-slate-50" : ""}>
                  <TableCell className="text-center">{(currentPage - 1) * (itemsPerPage === -1 ? 0 : itemsPerPage) + index + 1}</TableCell>
                  <TableCell className="text-left">{row.name || '-'}</TableCell>
                  <TableCell className="text-right px-[4px]">{formatCurrency(roundToThousands(row.totalSemula))}</TableCell>
                  <TableCell className="text-right px-[4px]">{formatCurrency(roundToThousands(row.totalMenjadi))}</TableCell>
                  <TableCell className={`text-right ${row.totalSelisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(roundToThousands(row.totalSelisih))}
                  </TableCell>
                  <TableCell className="text-right px-[4px]">{formatCurrency(roundToThousands(row.sisaAnggaran || 0))}</TableCell>
                  <TableCell className="text-right px-[4px]">{formatCurrency(roundToThousands(row.realisasi || 0))}</TableCell>
                  <TableCell className="text-right px-[4px]">{formatPercentage(row.persentaseRealisasi || 0)}</TableCell>
                  <TableCell className="text-right">{row.newItems}</TableCell>
                  <TableCell className="text-right">{row.changedItems}</TableCell>
                  <TableCell className="text-right">{row.totalItems}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold" colSpan={2}>Total Pagu</TableCell>
              <TableCell className="text-right font-bold px-[4px]">{formatCurrency(roundToThousands(totalSemula))}</TableCell>
              <TableCell className="text-right font-bold px-[4px]">{formatCurrency(roundToThousands(totalMenjadi))}</TableCell>
              <TableCell className={`text-right font-bold ${totalSelisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(roundToThousands(totalSelisih))}
              </TableCell>
              <TableCell className="text-right font-bold px-[4px]">{formatCurrency(roundToThousands(totalSisaAnggaran))}</TableCell>
              <TableCell className="text-right font-bold px-[4px]">{formatCurrency(roundToThousands(totalRealisasi))}</TableCell>
              <TableCell className="text-right font-bold px-[4px]">{formatPercentage(totalPersentaseRealisasi)}</TableCell>
              <TableCell className="text-right font-bold">{totalNewItems}</TableCell>
              <TableCell className="text-right font-bold">{totalChangedItems}</TableCell>
              <TableCell className="text-right font-bold">{totalItems}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {totalPages > 1 && itemsPerPage !== -1 && (
          <div className="p-2 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    href="#" 
                    aria-disabled={currentPage === 1} 
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    href="#" 
                    aria-disabled={currentPage === totalPages} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryTable;
