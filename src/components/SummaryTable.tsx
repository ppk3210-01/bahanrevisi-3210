
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { formatCurrency, roundToThousands } from '@/utils/budgetCalculations';

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

interface SummaryTableProps {
  data: SummaryRow[];
  title: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, title }) => {
  const [sortField, setSortField] = useState<keyof SummaryRow>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof SummaryRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
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
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="w-8">No</TableHead>
              <TableHead className="w-[30%]">
                <button 
                  className="flex items-center font-semibold"
                  onClick={() => handleSort('name')}
                >
                  Nama
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end font-semibold w-full"
                  onClick={() => handleSort('totalSemula')}
                >
                  Total Semula
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end font-semibold w-full"
                  onClick={() => handleSort('totalMenjadi')}
                >
                  Total Menjadi
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end font-semibold w-full"
                  onClick={() => handleSort('totalSelisih')}
                >
                  Selisih
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end font-semibold w-full"
                  onClick={() => handleSort('newItems')}
                >
                  Items Baru
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end font-semibold w-full"
                  onClick={() => handleSort('changedItems')}
                >
                  Items Berubah
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end font-semibold w-full"
                  onClick={() => handleSort('totalItems')}
                >
                  Total Items
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row, index) => (
                <TableRow key={row.id} className={index % 2 === 0 ? "bg-slate-50" : ""}>
                  <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>{row.name || '-'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(roundToThousands(row.totalSemula))}</TableCell>
                  <TableCell className="text-right text-black">{formatCurrency(roundToThousands(row.totalMenjadi))}</TableCell>
                  <TableCell className={`text-right ${row.totalSelisih > 0 ? 'text-green-600' : row.totalSelisih < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(roundToThousands(row.totalSelisih))}
                  </TableCell>
                  <TableCell className="text-right">{row.newItems}</TableCell>
                  <TableCell className="text-right">{row.changedItems}</TableCell>
                  <TableCell className="text-right">{row.totalItems}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
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
