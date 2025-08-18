-- Fix budget_summary_by_account_group to use first 2 digits instead of 1
DROP VIEW IF EXISTS budget_summary_by_account_group;

CREATE VIEW budget_summary_by_account_group AS
SELECT 
    LEFT(akun, 2) as account_group,
    agl.name as account_group_name,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(jumlah_menjadi - jumlah_semula) as total_selisih,
    SUM(COALESCE(sisa_anggaran, 0)) as total_sisa_anggaran,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items bi
LEFT JOIN account_group_lookup agl ON LEFT(bi.akun, 2) = agl.code
WHERE status != 'deleted' AND akun IS NOT NULL
GROUP BY LEFT(akun, 2), agl.name;

-- Recreate the function
DROP FUNCTION IF EXISTS get_budget_summary_by_account_group();

CREATE OR REPLACE FUNCTION get_budget_summary_by_account_group()
RETURNS SETOF budget_summary_by_account_group AS $$
  SELECT * FROM budget_summary_by_account_group;
$$ LANGUAGE SQL;