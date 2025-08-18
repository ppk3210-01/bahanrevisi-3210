-- Insert or update account group names
INSERT INTO account_group_lookup (code, name) VALUES 
  ('51', 'Belanja Pegawai'),
  ('52', 'Belanja Barang'),
  ('53', 'Belanja Modal')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name;