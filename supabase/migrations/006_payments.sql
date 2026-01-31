-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 1200,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  yukassa_payment_id VARCHAR(100),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'overdue'))
);

-- Create indexes for better query performance
CREATE INDEX idx_payments_worker_id ON payments(worker_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_shift_id ON payments(shift_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (
    auth.uid() = worker_id OR
    auth.uid() = client_id
  );

CREATE POLICY "Clients can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "System can update payment status"
  ON payments FOR UPDATE
  USING (true);

-- Add some sample data for testing
-- (Optional - remove in production)
-- INSERT INTO payments (shift_id, client_id, worker_id, amount, status, paid_at)
-- SELECT
--   s.id,
--   s.client_id,
--   sw.worker_id,
--   50000,
--   'paid',
--   NOW() - INTERVAL '5 days'
-- FROM shifts s
-- JOIN shift_workers sw ON sw.shift_id = s.id
-- WHERE sw.status = 'completed'
-- LIMIT 5;
