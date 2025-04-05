
import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";
import { BudgetItem } from '@/types/budget';

interface BudgetItemDetailsProps {
  item: BudgetItem;
}

const BudgetItemDetails: React.FC<BudgetItemDetailsProps> = ({ item }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="hover:text-blue-600">
          <InfoIcon className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Detail Item Anggaran</h4>
          <hr />
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="font-medium">Program Pembebanan:</span>
            <span>{item.programPembebanan || '-'}</span>
            
            <span className="font-medium">Kegiatan:</span>
            <span>{item.kegiatan || '-'}</span>
            
            <span className="font-medium">Rincian Output:</span>
            <span>{item.rincianOutput || '-'}</span>
            
            <span className="font-medium">Komponen Output:</span>
            <span>{item.komponenOutput || '-'}</span>
            
            <span className="font-medium">Sub Komponen:</span>
            <span>{item.subKomponen || '-'}</span>
            
            <span className="font-medium">Akun:</span>
            <span>{item.akun || '-'}</span>
            
            <span className="font-medium">Status:</span>
            <span className="capitalize">{item.status}</span>
            
            <span className="font-medium">Disetujui:</span>
            <span>{item.isApproved ? 'Ya' : 'Belum'}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default BudgetItemDetails;
