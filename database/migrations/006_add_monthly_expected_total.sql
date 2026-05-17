-- Add monthly_expected_total setting for admin to configure expected dues per month

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('monthly_expected_total', '0', 'Expected total dues amount for the current month')
ON CONFLICT (setting_key) DO NOTHING;
