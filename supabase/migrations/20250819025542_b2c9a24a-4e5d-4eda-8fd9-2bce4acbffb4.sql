-- Fix budget_summary_by_akun_group to group by first 3 digits with proper names
DROP VIEW IF EXISTS budget_summary_by_akun_group;

CREATE VIEW budget_summary_by_akun_group AS
SELECT
    LEFT(akun, 3) as akun_group,
    CASE LEFT(akun, 3)
        WHEN '511' THEN 'Belanja Gaji dan Tunjangan PNS'
        WHEN '512' THEN 'Belanja Gaji dan Tunjangan Non-PNS'
        WHEN '521' THEN 'Belanja Barang'
        WHEN '522' THEN 'Belanja Jasa'
        WHEN '523' THEN 'Belanja Pemeliharaan'
        WHEN '524' THEN 'Belanja Perjalanan Dinas'
        WHEN '525' THEN 'Belanja Sewa'
        WHEN '526' THEN 'Belanja Barang Operasional Lainnya'
        WHEN '527' THEN 'Belanja Barang Non Operasional Lainnya'
        WHEN '531' THEN 'Belanja Modal Tanah'
        WHEN '532' THEN 'Belanja Modal Peralatan dan Mesin'
        WHEN '533' THEN 'Belanja Modal Gedung dan Bangunan'
        WHEN '534' THEN 'Belanja Modal Jalan, Irigasi, dan Jaringan'
        WHEN '535' THEN 'Belanja Modal Aset Tetap Lainnya'
        WHEN '536' THEN 'Belanja Modal Aset Lainnya'
        WHEN '541' THEN 'Belanja Hibah'
        WHEN '542' THEN 'Belanja Bantuan Sosial'
        WHEN '551' THEN 'Belanja Subsidi'
        WHEN '552' THEN 'Belanja Bantuan Keuangan'
        WHEN '553' THEN 'Belanja Bagi Hasil'
        WHEN '561' THEN 'Belanja Tidak Terduga'
        WHEN '571' THEN 'Belanja Transfer ke Daerah dan Dana Desa'
        ELSE 'Lainnya'
    END as akun_group_name,
    SUM(jumlah_semula) as total_semula,
    SUM(jumlah_menjadi) as total_menjadi,
    SUM(selisih) as total_selisih,
    SUM(sisa_anggaran) as total_sisa_anggaran,
    SUM(CASE WHEN LOWER(uraian) LIKE '%efisiensi anggaran%' THEN jumlah_menjadi ELSE 0 END) as total_blokir,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_items,
    COUNT(CASE WHEN status = 'changed' THEN 1 END) as changed_items,
    COUNT(*) as total_items
FROM budget_items
WHERE status != 'deleted'
GROUP BY LEFT(akun, 3);