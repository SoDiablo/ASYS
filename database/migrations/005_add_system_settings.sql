-- Add system_settings table for configurable system-wide settings

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(user_id)
);

-- Insert default payment transfer information
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('payment_transfer_method', 'IBAN', 'Payment transfer method (IBAN, Bank Transfer, etc.)'),
  ('payment_transfer_details', 'TR00 0000 0000 0000 0000 0000 00', 'Payment transfer account details')
ON CONFLICT (setting_key) DO NOTHING;
