
-- Add sisa_anggaran column to budget_items table
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS sisa_anggaran NUMERIC DEFAULT 0;

-- Update existing records to have a default value of 0 for sisa_anggaran
UPDATE budget_items 
SET sisa_anggaran = 0 
WHERE sisa_anggaran IS NULL;
