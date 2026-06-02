-- ============================================================
-- 0006_coordinates.sql
-- Add latitude / longitude columns to the apartments table.
-- Safe to run even if the columns already exist on a fresh DB
-- (the original migration already includes them - this handles
--  existing deployments that pre-date those columns).
-- ============================================================

ALTER TABLE apartments
  ADD COLUMN IF NOT EXISTS latitude  double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;
