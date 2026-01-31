-- Migration: Add check_in_address column to shift_workers table
-- Date: 2026-01-31
-- Purpose: Store the address where worker checked in (GPS or manual)

-- Add check_in_address column
ALTER TABLE shift_workers
ADD COLUMN IF NOT EXISTS check_in_address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN shift_workers.check_in_address IS
'The address where the worker checked in. Can be from GPS reverse geocoding or manually entered.';

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shift_workers'
    AND column_name = 'check_in_address'
  ) THEN
    RAISE NOTICE 'Column check_in_address added successfully';
  ELSE
    RAISE EXCEPTION 'Failed to add column check_in_address';
  END IF;
END $$;

-- ROLLBACK (если нужно откатить миграцию):
-- ALTER TABLE shift_workers DROP COLUMN IF EXISTS check_in_address;
