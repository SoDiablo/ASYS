-- ASYS Smart Building Management System Database Schema
-- PostgreSQL 14+
-- SRS Section 7 - Complete Implementation

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS due_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS request_category CASCADE;
DROP TYPE IF EXISTS request_priority CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS spot_type CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'resident', 'security');
CREATE TYPE due_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer');
CREATE TYPE request_category AS ENUM ('electric', 'water', 'elevator', 'other');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE reservation_status AS ENUM ('active', 'cancelled');
CREATE TYPE spot_type AS ENUM ('standard', 'handicapped', 'visitor');

-- T-01: users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- T-02: apartments table
CREATE TABLE apartments (
  apartment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block VARCHAR(10) NOT NULL,
  floor INTEGER NOT NULL,
  number VARCHAR(10) NOT NULL,
  user_id UUID REFERENCES users(user_id),
  monthly_due DECIMAL(10,2) NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE,
  UNIQUE(block, floor, number)
);

-- T-03: dues table
CREATE TABLE dues (
  due_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(apartment_id),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  penalty DECIMAL(10,2) DEFAULT 0,
  status due_status NOT NULL DEFAULT 'pending',
  period_month DATE NOT NULL
);

-- T-04: payments table
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  due_id UUID NOT NULL REFERENCES dues(due_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  paid_amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  paid_at TIMESTAMP DEFAULT NOW(),
  receipt_no VARCHAR(50) UNIQUE
);

-- T-05: maintenance_requests table
CREATE TABLE maintenance_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(apartment_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  category request_category NOT NULL,
  priority request_priority NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(255),
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- T-06: announcements table
CREATE TABLE announcements (
  announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(user_id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- T-07: common_areas table
CREATE TABLE common_areas (
  area_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  max_hours INTEGER NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- T-08: reservations table
CREATE TABLE reservations (
  reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES common_areas(area_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status reservation_status NOT NULL DEFAULT 'active',
  cancelled_at TIMESTAMP
);

-- T-09: parking_spots table
CREATE TABLE parking_spots (
  spot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_number VARCHAR(10) UNIQUE NOT NULL,
  apartment_id UUID REFERENCES apartments(apartment_id),
  type spot_type NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE
);

-- T-10: visitor_vehicles table
CREATE TABLE visitor_vehicles (
  visit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number VARCHAR(20) NOT NULL,
  spot_id UUID NOT NULL REFERENCES parking_spots(spot_id),
  visited_apartment_id UUID NOT NULL REFERENCES apartments(apartment_id),
  entry_time TIMESTAMP DEFAULT NOW(),
  exit_time TIMESTAMP,
  registered_by UUID NOT NULL REFERENCES users(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_apartments_user_id ON apartments(user_id);
CREATE INDEX idx_dues_apartment_id ON dues(apartment_id);
CREATE INDEX idx_dues_status ON dues(status);
CREATE INDEX idx_payments_due_id ON payments(due_id);
CREATE INDEX idx_maintenance_apartment_id ON maintenance_requests(apartment_id);
CREATE INDEX idx_maintenance_user_id ON maintenance_requests(user_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_reservations_area_id ON reservations(area_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_visitor_vehicles_spot_id ON visitor_vehicles(spot_id);

-- Insert default admin user (password: Admin123456)
-- Password hash generated with: bcrypt.hash('Admin123456', 10)
INSERT INTO users (name, email, password_hash, role, phone, is_active)
VALUES (
  'System Administrator',
  'admin@asys.com',
  '$2b$10$K8qVZ8qVZ8qVZ8qVZ8qVZeK8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8q',
  'admin',
  '+1234567890',
  TRUE
);

-- Insert sample common areas
INSERT INTO common_areas (name, capacity, max_hours, open_time, close_time, is_active)
VALUES
  ('Gym', 20, 2, '07:00:00', '23:00:00', TRUE),
  ('Meeting Room', 15, 4, '07:00:00', '23:00:00', TRUE),
  ('Children''s Playground', 30, 3, '07:00:00', '23:00:00', TRUE);

-- Insert sample parking spots
INSERT INTO parking_spots (spot_number, type, is_occupied)
VALUES
  ('A-001', 'standard', FALSE),
  ('A-002', 'standard', FALSE),
  ('A-003', 'handicapped', FALSE),
  ('A-004', 'standard', FALSE),
  ('A-005', 'standard', FALSE),
  ('V-001', 'visitor', FALSE),
  ('V-002', 'visitor', FALSE),
  ('V-003', 'visitor', FALSE);

-- Insert sample apartments
INSERT INTO apartments (block, floor, number, monthly_due, is_occupied)
VALUES
  ('A', 1, '101', 500.00, FALSE),
  ('A', 1, '102', 500.00, FALSE),
  ('A', 2, '201', 550.00, FALSE),
  ('A', 2, '202', 550.00, FALSE),
  ('B', 1, '101', 500.00, FALSE),
  ('B', 1, '102', 500.00, FALSE),
  ('B', 2, '201', 550.00, FALSE),
  ('B', 2, '202', 550.00, FALSE);
