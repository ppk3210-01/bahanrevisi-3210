
-- Tambahkan kolom sisa_anggaran ke tabel budget_items
ALTER TABLE public.budget_items 
ADD COLUMN sisa_anggaran numeric DEFAULT NULL;

-- Update existing data untuk konsistensi (opsional, bisa diisi manual/import)
COMMENT ON COLUMN public.budget_items.sisa_anggaran IS 'Sisa anggaran yang bisa digunakan untuk setiap item/detail kegiatan';
