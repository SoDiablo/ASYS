-- Add priority and target_audience fields to announcements table

-- Add priority column (low, medium, high)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Add target_audience column (all, residents, admin, security)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'residents', 'admin', 'security'));
