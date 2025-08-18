-- Add total_blokir column to all budget summary views

-- Update budget_summary_by_komponen view
CREATE OR REPLACE VIEW budget_summary_by_komponen AS
SELECT 
    komponen_output,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN uraian ILIKE '%efisiensi anggaran%' THEN jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY komponen_output;

-- Update budget_summary_by_akun view
CREATE OR REPLACE VIEW budget_summary_by_akun AS
SELECT 
    akun,
    al.name as akun_name,
    SUM(bi.jumlah_semula) as total_semula,
    SUM(bi.jumlah_menjadi) as total_menjadi,
    SUM(bi.jumlah_menjadi - bi.jumlah_semula) as total_selisih,
    SUM(bi.sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN bi.uraian ILIKE '%efisiensi anggaran%' THEN bi.jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN bi.status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN bi.status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_lookup al ON bi.akun = al.code
WHERE bi.status != 'deleted'
GROUP BY bi.akun, al.name;

-- Update budget_summary_by_program_pembebanan view
CREATE OR REPLACE VIEW budget_summary_by_program_pembebanan AS
SELECT 
    program_pembebanan,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN uraian ILIKE '%efisiensi anggaran%' THEN jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY program_pembebanan;

-- Update budget_summary_by_kegiatan view
CREATE OR REPLACE VIEW budget_summary_by_kegiatan AS
SELECT 
    kegiatan,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN uraian ILIKE '%efisiensi anggaran%' THEN jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY kegiatan;

-- Update budget_summary_by_rincian_output view
CREATE OR REPLACE VIEW budget_summary_by_rincian_output AS
SELECT 
    rincian_output,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN uraian ILIKE '%efisiensi anggaran%' THEN jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY rincian_output;

-- Update budget_summary_by_sub_komponen view
CREATE OR REPLACE VIEW budget_summary_by_sub_komponen AS
SELECT 
    sub_komponen,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN uraian ILIKE '%efisiensi anggaran%' THEN jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items 
WHERE status != 'deleted'
GROUP BY sub_komponen;

-- Update budget_summary_by_account_group view
CREATE OR REPLACE VIEW budget_summary_by_account_group AS
SELECT 
    LEFT(bi.akun, 2) as account_group,
    agl.name as account_group_name,
    SUM(bi.jumlah_semula) as total_semula,
    SUM(bi.jumlah_menjadi) as total_menjadi,
    SUM(bi.jumlah_menjadi - bi.jumlah_semula) as total_selisih,
    SUM(bi.sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN bi.uraian ILIKE '%efisiensi anggaran%' THEN bi.jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN bi.status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN bi.status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_group_lookup agl ON LEFT(bi.akun, 2) = agl.code
WHERE bi.status != 'deleted'
GROUP BY LEFT(bi.akun, 2), agl.name;

-- Update budget_summary_by_akun_group view
CREATE OR REPLACE VIEW budget_summary_by_akun_group AS
SELECT 
    LEFT(bi.akun, 2) as akun_group,
    agl.name as akun_group_name,
    SUM(bi.jumlah_semula) as total_semula,
    SUM(bi.jumlah_menjadi) as total_menjadi,
    SUM(bi.jumlah_menjadi - bi.jumlah_semula) as total_selisih,
    SUM(bi.sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN bi.uraian ILIKE '%efisiensi anggaran%' THEN bi.jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN bi.status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN bi.status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_group_lookup agl ON LEFT(bi.akun, 2) = agl.code
WHERE bi.status != 'deleted'
GROUP BY LEFT(bi.akun, 2), agl.name;