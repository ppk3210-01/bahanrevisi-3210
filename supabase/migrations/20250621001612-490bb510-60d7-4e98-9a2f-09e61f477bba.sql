
-- First, drop all existing functions that depend on the views
DROP FUNCTION IF EXISTS get_budget_summary_by_komponen();
DROP FUNCTION IF EXISTS get_budget_summary_by_akun();
DROP FUNCTION IF EXISTS get_budget_summary_by_program_pembebanan();
DROP FUNCTION IF EXISTS get_budget_summary_by_kegiatan();
DROP FUNCTION IF EXISTS get_budget_summary_by_rincian_output();
DROP FUNCTION IF EXISTS get_budget_summary_by_sub_komponen();
DROP FUNCTION IF EXISTS get_budget_summary_by_account_group();
DROP FUNCTION IF EXISTS get_budget_summary_by_akun_group();

-- Drop all existing views
DROP VIEW IF EXISTS budget_summary_by_komponen;
DROP VIEW IF EXISTS budget_summary_by_akun;
DROP VIEW IF EXISTS budget_summary_by_program_pembebanan;
DROP VIEW IF EXISTS budget_summary_by_kegiatan;
DROP VIEW IF EXISTS budget_summary_by_rincian_output;
DROP VIEW IF EXISTS budget_summary_by_sub_komponen;
DROP VIEW IF EXISTS budget_summary_by_account_group;
DROP VIEW IF EXISTS budget_summary_by_akun_group;

-- Recreate all views with total_sisa_anggaran field
CREATE VIEW budget_summary_by_komponen AS
SELECT 
    komponen_output,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY komponen_output;

CREATE VIEW budget_summary_by_akun AS
SELECT 
    akun,
    al.name as akun_name,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_lookup al ON bi.akun = al.code
WHERE status != 'deleted'
GROUP BY akun, al.name;

CREATE VIEW budget_summary_by_program_pembebanan AS
SELECT 
    program_pembebanan,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY program_pembebanan;

CREATE VIEW budget_summary_by_kegiatan AS
SELECT 
    kegiatan,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY kegiatan;

CREATE VIEW budget_summary_by_rincian_output AS
SELECT 
    rincian_output,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY rincian_output;

CREATE VIEW budget_summary_by_sub_komponen AS
SELECT 
    sub_komponen,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY sub_komponen;

CREATE VIEW budget_summary_by_account_group AS
SELECT 
    LEFT(akun, 1) as account_group,
    agl.name as account_group_name,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_group_lookup agl ON LEFT(bi.akun, 1) = agl.code
WHERE status != 'deleted' AND akun IS NOT NULL
GROUP BY LEFT(akun, 1), agl.name;

CREATE VIEW budget_summary_by_akun_group AS
SELECT 
    LEFT(akun, 3) as akun_group,
    agl.name as akun_group_name,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_group_lookup agl ON LEFT(bi.akun, 3) = agl.code
WHERE status != 'deleted' AND akun IS NOT NULL
GROUP BY LEFT(akun, 3), agl.name;

-- Recreate all functions
CREATE OR REPLACE FUNCTION get_budget_summary_by_komponen()
RETURNS SETOF budget_summary_by_komponen AS $$
  SELECT * FROM budget_summary_by_komponen;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_akun()
RETURNS SETOF budget_summary_by_akun AS $$
  SELECT * FROM budget_summary_by_akun;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_program_pembebanan()
RETURNS SETOF budget_summary_by_program_pembebanan AS $$
  SELECT * FROM budget_summary_by_program_pembebanan;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_kegiatan()
RETURNS SETOF budget_summary_by_kegiatan AS $$
  SELECT * FROM budget_summary_by_kegiatan;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_rincian_output()
RETURNS SETOF budget_summary_by_rincian_output AS $$
  SELECT * FROM budget_summary_by_rincian_output;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_sub_komponen()
RETURNS SETOF budget_summary_by_sub_komponen AS $$
  SELECT * FROM budget_summary_by_sub_komponen;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_account_group()
RETURNS SETOF budget_summary_by_account_group AS $$
  SELECT * FROM budget_summary_by_account_group;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_budget_summary_by_akun_group()
RETURNS SETOF budget_summary_by_akun_group AS $$
  SELECT * FROM budget_summary_by_akun_group;
$$ LANGUAGE SQL;
