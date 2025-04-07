
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ExcelImportGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExcelImportGuide: React.FC<ExcelImportGuideProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Panduan Import Excel</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm space-y-4">
          <p className="font-medium">Petunjuk cara mengimpor data menggunakan file Excel</p>
          
          <div>
            <h3 className="font-medium mb-2">Format File</h3>
            <p>File Excel (.xlsx atau .xls) harus memiliki format berikut:</p>
            
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-1 text-left">Kolom</th>
                    <th className="border border-gray-200 px-3 py-1 text-left">Tipe Data</th>
                    <th className="border border-gray-200 px-3 py-1 text-left">Format</th>
                    <th className="border border-gray-200 px-3 py-1 text-left">Contoh</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Program Pembebanan</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">054.01.GG</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Kegiatan</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">2896</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Rincian Output</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">2896.BMA</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Komponen Output</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">2896.BMA.004</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Sub Komponen</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">005</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Akun</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">522151</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Uraian</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">Belanja Jasa Profesi</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Volume Semula</td>
                    <td className="border border-gray-200 px-3 py-1">Number</td>
                    <td className="border border-gray-200 px-3 py-1">General atau Number</td>
                    <td className="border border-gray-200 px-3 py-1">1</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Satuan Semula</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">Paket</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Harga Satuan Semula</td>
                    <td className="border border-gray-200 px-3 py-1">Number</td>
                    <td className="border border-gray-200 px-3 py-1">General, Number atau Currency</td>
                    <td className="border border-gray-200 px-3 py-1">1000000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Volume Menjadi</td>
                    <td className="border border-gray-200 px-3 py-1">Number</td>
                    <td className="border border-gray-200 px-3 py-1">General atau Number</td>
                    <td className="border border-gray-200 px-3 py-1">1</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Satuan Menjadi</td>
                    <td className="border border-gray-200 px-3 py-1">Text</td>
                    <td className="border border-gray-200 px-3 py-1">-</td>
                    <td className="border border-gray-200 px-3 py-1">Paket</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-1">Harga Satuan Menjadi</td>
                    <td className="border border-gray-200 px-3 py-1">Number</td>
                    <td className="border border-gray-200 px-3 py-1">General, Number atau Currency</td>
                    <td className="border border-gray-200 px-3 py-1">1200000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Petunjuk Import</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Unduh template dengan klik tombol Download Template.</li>
              <li>Buka file template dengan Microsoft Excel atau aplikasi spreadsheet lainnya.</li>
              <li>Isikan data sesuai format yang telah ditentukan. Pastikan semua kolom terisi dengan benar.</li>
              <li>Simpan file Excel setelah selesai mengisi data.</li>
              <li>Klik tombol Import Excel dan pilih file yang telah diisi.</li>
              <li>Tunggu hingga proses import selesai.</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Tips Import</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pastikan format kolom numerik sudah benar (Volume dan Harga Satuan).</li>
              <li>Jangan mengubah nama kolom pada baris pertama.</li>
              <li>Pastikan tidak ada sel yang kosong pada baris data.</li>
              <li>Jika menggunakan template dari aplikasi ini, format kolom sudah diatur dengan benar.</li>
              <li>Pastikan nilai numerik tidak menggunakan tanda pemisah ribuan seperti titik atau koma.</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={() => onOpenChange(false)}
          >
            <FileText className="h-4 w-4" />
            Tutup Panduan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportGuide;
