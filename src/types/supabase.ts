
// Temporary type definitions that match our database schema
// This will be replaced by the Supabase generated types once they are available

export type BudgetItemRecord = {
  id: string;
  uraian: string;
  volume_semula: number;
  satuan_semula: string;
  harga_satuan_semula: number;
  jumlah_semula: number | null;
  volume_menjadi: number;
  satuan_menjadi: string;
  harga_satuan_menjadi: number;
  jumlah_menjadi: number | null;
  selisih: number | null;
  status: string;
  is_approved: boolean;
  komponen_output: string;
  program_pembebanan: string | null;
  kegiatan: string | null;
  rincian_output: string | null;
  sub_komponen: string | null;
  akun: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type KomponenOutputRecord = {
  id: string;
  nama: string;
  created_at?: string | null;
};

export type SubKomponenRecord = {
  id: string;
  nama: string;
  program_pembebanan: string;
};

export type AkunRecord = {
  id: string;
  nama: string;
  urutan: number;
};

// This is a simplified version of the Database type that includes our tables
export type TemporaryDatabase = {
  public: {
    Tables: {
      budget_items: {
        Row: BudgetItemRecord;
        Insert: Omit<BudgetItemRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Omit<BudgetItemRecord, 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      komponen_output: {
        Row: KomponenOutputRecord;
        Insert: Omit<KomponenOutputRecord, 'created_at'> & {
          created_at?: string | null;
        };
        Update: Partial<Omit<KomponenOutputRecord, 'created_at'>> & {
          created_at?: string | null;
        };
      };
      sub_komponen: {
        Row: SubKomponenRecord;
        Insert: SubKomponenRecord;
        Update: Partial<SubKomponenRecord>;
      };
      akun: {
        Row: AkunRecord;
        Insert: AkunRecord;
        Update: Partial<AkunRecord>;
      };
    };
  };
};
