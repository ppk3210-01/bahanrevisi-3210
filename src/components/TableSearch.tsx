
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TableSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const TableSearch: React.FC<TableSearchProps> = ({ 
  onSearch, 
  placeholder = "Cari uraian..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        className="pl-9 w-full md:w-[300px]"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
};

export default TableSearch;
