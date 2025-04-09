

-- Run this SQL script in the Supabase SQL Editor to create the necessary functions

-- Function to get budget summary by account group
CREATE OR REPLACE FUNCTION get_budget_summary_by_account_group()
RETURNS SETOF budget_summary_by_account_group AS $$
  SELECT * FROM budget_summary_by_account_group;
$$ LANGUAGE SQL;

-- Function to get budget summary by komponen
CREATE OR REPLACE FUNCTION get_budget_summary_by_komponen()
RETURNS SETOF budget_summary_by_komponen AS $$
  SELECT * FROM budget_summary_by_komponen;
$$ LANGUAGE SQL;

-- Function to get budget summary by akun
CREATE OR REPLACE FUNCTION get_budget_summary_by_akun()
RETURNS SETOF budget_summary_by_akun AS $$
  SELECT * FROM budget_summary_by_akun;
$$ LANGUAGE SQL;

-- Function to get budget summary by program pembebanan
CREATE OR REPLACE FUNCTION get_budget_summary_by_program_pembebanan()
RETURNS SETOF budget_summary_by_program_pembebanan AS $$
  SELECT * FROM budget_summary_by_program_pembebanan;
$$ LANGUAGE SQL;

-- Function to get budget summary by kegiatan
CREATE OR REPLACE FUNCTION get_budget_summary_by_kegiatan()
RETURNS SETOF budget_summary_by_kegiatan AS $$
  SELECT * FROM budget_summary_by_kegiatan;
$$ LANGUAGE SQL;

-- Function to get budget summary by rincian output
CREATE OR REPLACE FUNCTION get_budget_summary_by_rincian_output()
RETURNS SETOF budget_summary_by_rincian_output AS $$
  SELECT * FROM budget_summary_by_rincian_output;
$$ LANGUAGE SQL;

-- Function to get budget summary by sub komponen
CREATE OR REPLACE FUNCTION get_budget_summary_by_sub_komponen()
RETURNS SETOF budget_summary_by_sub_komponen AS $$
  SELECT * FROM budget_summary_by_sub_komponen;
$$ LANGUAGE SQL;

