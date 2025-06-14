
import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/utils/budgetCalculations';
import { Trash2, Edit, Check, X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExcelImportExport from './ExcelImportExport';
import { BudgetSummaryRecord } from '@/types/database';

interface BudgetTableProps {
  items: BudgetItem[];
  onAdd: (item: Omit<BudgetItem, "id" | "jumlahSemula" | "jumlahMenjadi" | "selisih" | "status">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onImport: (items: Partial<BudgetItem>[]) => Promise<void>;
  komponenOutput?: string;
  subKomponen?: string;
  akun?: string;
  summaryData?: BudgetSummaryRecord[];
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  onAdd,
  onUpdate,
  onDelete,
  onApprove,
  onReject,
  onImport,
  komponenOutput,
  subKomponen,
  akun,
  summaryData = []
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    uraian: '',
    volumeSemula: 0,
    satuanSemula: 'Paket',
    hargaSatuanSemula: 0,
    volumeMenjadi: 0,
    satuanMenjadi: 'Paket',
    hargaSatuanMenjadi: 0,
    sisaAnggaran: 0,
    komponenOutput: komponenOutput || '',
    subKomponen: subKomponen || '',
    akun: akun || '',
    programPembebanan: '',
    kegiatan: '',
    rincianOutput: '',
    isApproved: false
  });
  const [editValues, setEditValues] = useState<Partial<BudgetItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { isAdmin } = useAuth();

  const handleEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditValues({
      uraian: item.uraian,
      volumeSemula: item.volumeSemula,
      satuanSemula: item.satuanSemula,
      hargaSatuanSemula: item.hargaSatuanSemula,
      volumeMenjadi: item.volumeMenjadi,
      satuanMenjadi: item.satuanMenjadi,
      hargaSatuanMenjadi: item.hargaSatuanMenjadi,
      sisaAnggaran: item.sisaAnggaran || 0
    });
  };

  const handleSave = async (id: string) => {
    try {
      await onUpdate(id, editValues);
      setEditingId(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleAdd = async () => {
    try {
      await onAdd(newItem);
      setNewItem({
        uraian: '',
        volumeSemula: 0,
        satuanSemula: 'Paket',
        hargaSatuanSemula: 0,
        volumeMenjadi: 0,
        satuanMenjadi: 'Paket',
        hargaSatuanMenjadi: 0,
        sisaAnggaran: 0,
        komponenOutput: komponenOutput || '',
        subKomponen: subKomponen || '',
        akun: akun || '',
        programPembebanan: '',
        kegiatan: '',
        rincianOutput: '',
        isApproved: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const canEditItem = (item: BudgetItem) => {
    return isAdmin || !item.isApproved;
  };

  const canEditSisaAnggaran = (item: BudgetItem) => {
    return isAdmin;
  };

  return (
    <Card className="budget-table">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Tabel Anggaran</CardTitle>
        <div className="flex items-center gap-2">
          <ExcelImportExport 
            items={items} 
            onImport={onImport}
            komponenOutput={komponenOutput}
            subKomponen={subKomponen}
            akun={akun}
            smallText={true}
            summaryData={summaryData}
          />
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="sm"
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Tambah Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Uraian</TableHead>
                <TableHead className="text-center w-[100px]">Vol Semula</TableHead>
                <TableHead className="text-center w-[100px]">Satuan Semula</TableHead>
                <TableHead className="text-center w-[120px]">Harga Satuan Semula</TableHead>
                <TableHead className="text-center w-[120px]">Jumlah Semula</TableHead>
                <TableHead className="text-center w-[100px]">Vol Menjadi</TableHead>
                <TableHead className="text-center w-[100px]">Satuan Menjadi</TableHead>
                <TableHead className="text-center w-[120px]">Harga Satuan Menjadi</TableHead>
                <TableHead className="text-center w-[120px]">Jumlah Menjadi</TableHead>
                <TableHead className="text-center w-[120px]">Sisa Anggaran</TableHead>
                <TableHead className="text-center w-[120px]">Selisih</TableHead>
                <TableHead className="text-center w-[100px]">Status</TableHead>
                <TableHead className="text-center w-[150px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showAddForm && (
                <TableRow className="bg-green-50">
                  <TableCell>
                    <Input
                      value={newItem.uraian}
                      onChange={(e) => setNewItem({...newItem, uraian: e.target.value})}
                      placeholder="Uraian item baru"
                      className="text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newItem.volumeSemula}
                      onChange={(e) => setNewItem({...newItem, volumeSemula: parseFloat(e.target.value) || 0})}
                      className="text-xs text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newItem.satuanSemula}
                      onChange={(e) => setNewItem({...newItem, satuanSemula: e.target.value})}
                      className="text-xs text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newItem.hargaSatuanSemula}
                      onChange={(e) => setNewItem({...newItem, hargaSatuanSemula: parseFloat(e.target.value) || 0})}
                      className="text-xs text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {formatCurrency(newItem.volumeSemula * newItem.hargaSatuanSemula)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newItem.volumeMenjadi}
                      onChange={(e) => setNewItem({...newItem, volumeMenjadi: parseFloat(e.target.value) || 0})}
                      className="text-xs text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newItem.satuanMenjadi}
                      onChange={(e) => setNewItem({...newItem, satuanMenjadi: e.target.value})}
                      className="text-xs text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newItem.hargaSatuanMenjadi}
                      onChange={(e) => setNewItem({...newItem, hargaSatuanMenjadi: parseFloat(e.target.value) || 0})}
                      className="text-xs text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {formatCurrency(newItem.volumeMenjadi * newItem.hargaSatuanMenjadi)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newItem.sisaAnggaran}
                      onChange={(e) => setNewItem({...newItem, sisaAnggaran: parseFloat(e.target.value) || 0})}
                      className="text-xs text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {formatCurrency((newItem.volumeMenjadi * newItem.hargaSatuanMenjadi) - (newItem.volumeSemula * newItem.hargaSatuanSemula))}
                  </TableCell>
                  <TableCell className="text-center text-xs">Baru</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" onClick={handleAdd} className="h-6 w-6 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {items.map((item) => (
                <TableRow key={item.id} className={item.status === 'new' ? 'bg-green-50' : item.status === 'changed' ? 'bg-orange-50' : ''}>
                  <TableCell className="font-medium text-xs">{item.uraian}</TableCell>
                  <TableCell className="text-center text-xs">
                    {editingId === item.id && canEditItem(item) ? (
                      <Input
                        type="number"
                        value={editValues.volumeSemula || 0}
                        onChange={(e) => setEditValues({...editValues, volumeSemula: parseFloat(e.target.value) || 0})}
                        className="text-xs text-center h-6"
                      />
                    ) : (
                      item.volumeSemula
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {editingId === item.id && canEditItem(item) ? (
                      <Input
                        value={editValues.satuanSemula || ''}
                        onChange={(e) => setEditValues({...editValues, satuanSemula: e.target.value})}
                        className="text-xs text-center h-6"
                      />
                    ) : (
                      item.satuanSemula
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {editingId === item.id && canEditItem(item) ? (
                      <Input
                        type="number"
                        value={editValues.hargaSatuanSemula || 0}
                        onChange={(e) => setEditValues({...editValues, hargaSatuanSemula: parseFloat(e.target.value) || 0})}
                        className="text-xs text-right h-6"
                      />
                    ) : (
                      formatCurrency(item.hargaSatuanSemula)
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs">{formatCurrency(item.jumlahSemula)}</TableCell>
                  <TableCell className="text-center text-xs">
                    {editingId === item.id && canEditItem(item) ? (
                      <Input
                        type="number"
                        value={editValues.volumeMenjadi || 0}
                        onChange={(e) => setEditValues({...editValues, volumeMenjadi: parseFloat(e.target.value) || 0})}
                        className="text-xs text-center h-6"
                      />
                    ) : (
                      item.volumeMenjadi
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {editingId === item.id && canEditItem(item) ? (
                      <Input
                        value={editValues.satuanMenjadi || ''}
                        onChange={(e) => setEditValues({...editValues, satuanMenjadi: e.target.value})}
                        className="text-xs text-center h-6"
                      />
                    ) : (
                      item.satuanMenjadi
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {editingId === item.id && canEditItem(item) ? (
                      <Input
                        type="number"
                        value={editValues.hargaSatuanMenjadi || 0}
                        onChange={(e) => setEditValues({...editValues, hargaSatuanMenjadi: parseFloat(e.target.value) || 0})}
                        className="text-xs text-right h-6"
                      />
                    ) : (
                      formatCurrency(item.hargaSatuanMenjadi)
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs">{formatCurrency(item.jumlahMenjadi)}</TableCell>
                  <TableCell className="text-right text-xs">
                    {editingId === item.id && canEditSisaAnggaran(item) ? (
                      <Input
                        type="number"
                        value={editValues.sisaAnggaran || 0}
                        onChange={(e) => setEditValues({...editValues, sisaAnggaran: parseFloat(e.target.value) || 0})}
                        className="text-xs text-right h-6"
                      />
                    ) : (
                      item.sisaAnggaran ? formatCurrency(item.sisaAnggaran) : '-'
                    )}
                  </TableCell>
                  <TableCell className={`text-right text-xs ${item.selisih === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.selisih)}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    <span className={`px-1 py-0.5 rounded text-xs ${
                      item.status === 'new' ? 'bg-green-100 text-green-800' :
                      item.status === 'changed' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'new' ? 'Baru' : item.status === 'changed' ? 'Berubah' : 'Tidak Berubah'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {editingId === item.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSave(item.id)} className="h-6 w-6 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {canEditItem(item) && (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="h-6 w-6 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button size="sm" variant="outline" onClick={() => onDelete(item.id)} className="h-6 w-6 p-0 text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
