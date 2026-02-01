-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Payment amounts
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 1200.00,
  worker_payout DECIMAL(10, 2) GENERATED ALWAYS AS (amount - platform_fee) STORED,

  -- YooKassa integration
  yukassa_payment_id VARCHAR(255) UNIQUE,
  yukassa_refund_id VARCHAR(255),

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending, processing, succeeded, canceled, refunded

  -- Metadata
  payment_method VARCHAR(100),
  description TEXT,
  metadata JSONB,

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_shift ON payments(shift_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_worker ON payments(worker_id);
CREATE INDEX idx_payments_yukassa ON payments(yukassa_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = worker_id
  );

CREATE POLICY "Clients can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = worker_id
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Function to get payment statistics for user
CREATE OR REPLACE FUNCTION get_payment_stats(user_uuid UUID)
RETURNS TABLE (
  total_paid DECIMAL,
  total_earned DECIMAL,
  total_fees DECIMAL,
  payment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN client_id = user_uuid THEN amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN worker_id = user_uuid THEN worker_payout ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN client_id = user_uuid THEN platform_fee ELSE 0 END), 0) as total_fees,
    COUNT(*) as payment_count
  FROM payments
  WHERE (client_id = user_uuid OR worker_id = user_uuid)
    AND status = 'succeeded';
END;
$$ LANGUAGE plpgsql;
