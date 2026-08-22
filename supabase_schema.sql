-- ==============================================================================
-- NEON NIGHT RUN PARAÍSO - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- Carrera nocturna 6K en Paraíso, Tabasco, México
-- ==============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: CONFIGURACIÓN GENERAL DEL EVENTO
CREATE TABLE IF NOT EXISTS event_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'nnr-paraiso-2026',
  name VARCHAR(255) NOT NULL DEFAULT 'Neon Night Run Paraíso',
  slogan VARCHAR(255) NOT NULL DEFAULT '¡Ilumina tu camino!',
  description TEXT NOT NULL,
  date_text VARCHAR(100) NOT NULL DEFAULT 'Sábado 7 de noviembre de 2026',
  iso_date TIMESTAMPTZ NOT NULL DEFAULT '2026-11-07 19:30:00-06',
  distance VARCHAR(50) NOT NULL DEFAULT '6 kilómetros',
  location VARCHAR(255) NOT NULL DEFAULT 'Paraíso, Tabasco, México',
  venue_name VARCHAR(255) NOT NULL DEFAULT 'Malecón Turístico y Puerto de Paraíso',
  registration_open BOOLEAN NOT NULL DEFAULT true,
  max_total_quota INT NOT NULL DEFAULT 1500,
  current_total_registered INT NOT NULL DEFAULT 0,
  schedule_time VARCHAR(100) NOT NULL DEFAULT '19:30 hrs',
  kit_pickup_dates TEXT NOT NULL,
  kit_pickup_location TEXT NOT NULL,
  bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  kit_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  prizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  route_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: ETAPAS DE PRECIO
CREATE TABLE IF NOT EXISTS pricing_stages (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  quota INT NOT NULL,
  sold_count INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  badge_text VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CÓDIGOS DE EMBAJADORES Y CONVENIOS
CREATE TABLE IF NOT EXISTS ambassador_codes (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  ambassador_name VARCHAR(255) NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: ÓRDENES DE COMPRA
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  participants_count INT NOT NULL DEFAULT 1,
  stage_id VARCHAR(50) REFERENCES pricing_stages(id),
  stage_name VARCHAR(150) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL,
  ambassador_code_used VARCHAR(50),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('mercadopago', 'transfer', 'courtesy', 'demo')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  payment_reference VARCHAR(255) NOT NULL,
  transfer_receipt_url TEXT,
  transfer_receipt_uploaded_at TIMESTAMPTZ,
  transfer_notes TEXT,
  mercadopago_payment_id VARCHAR(100),
  mercadopago_preference_id VARCHAR(150),
  mercadopago_init_point TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by VARCHAR(255)
);

-- 5. TABLA: PARTICIPANTES / CORREDORES
CREATE TABLE IF NOT EXISTS participants (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  folio VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  category VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  emergency_contact VARCHAR(255) NOT NULL,
  emergency_phone VARCHAR(50) NOT NULL,
  shirt_size VARCHAR(10) NOT NULL CHECK (shirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  club_or_team VARCHAR(255),
  ambassador_code VARCHAR(50),
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  qr_code_data_url TEXT,
  kit_delivered BOOLEAN NOT NULL DEFAULT false,
  kit_delivered_at TIMESTAMPTZ,
  kit_delivered_by VARCHAR(255),
  kit_delivery_notes TEXT,
  waiver_accepted BOOLEAN NOT NULL DEFAULT true,
  privacy_accepted BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  unit_price NUMERIC(10,2) NOT NULL,
  discount_applied NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: REGISTRO DE ENTREGA DE KITS (AUDITORÍA FÍSICA)
CREATE TABLE IF NOT EXISTS kit_delivery_logs (
  id VARCHAR(100) PRIMARY KEY,
  participant_id VARCHAR(100) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  folio VARCHAR(50) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  shirt_size VARCHAR(10) NOT NULL,
  staff_email VARCHAR(255) NOT NULL,
  staff_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('delivered', 'reverted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: BITÁCORA DE AUDITORÍA ADMINISTRATIVA
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  performed_by_role VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: REGISTROS DE WEBHOOKS DE MERCADO PAGO
CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id VARCHAR(100) PRIMARY KEY,
  provider VARCHAR(50) NOT NULL DEFAULT 'mercadopago',
  event_type VARCHAR(100) NOT NULL,
  external_id VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT false,
  status_message TEXT
);

-- ÍNDICES PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_participants_folio ON participants(folio);
CREATE INDEX IF NOT EXISTS idx_participants_qr_token ON participants(qr_token);
CREATE INDEX IF NOT EXISTS idx_participants_order_id ON participants(order_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para datos del evento y etapas vigentes
CREATE POLICY "Lectura publica de configuracion y precios" ON event_config FOR SELECT USING (true);
CREATE POLICY "Lectura publica de etapas" ON pricing_stages FOR SELECT USING (true);

-- ==============================================================================
-- FIN DEL ESQUEMA
-- ==============================================================================
