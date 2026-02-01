-- Add check-in functionality to shift_applications
ALTER TABLE shift_applications
ADD COLUMN checked_in_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN shift_applications.checked_in_at IS 'Timestamp when worker checked in at shift location';

-- Create index for faster queries
CREATE INDEX idx_shift_applications_checked_in ON shift_applications(checked_in_at) WHERE checked_in_at IS NOT NULL;
