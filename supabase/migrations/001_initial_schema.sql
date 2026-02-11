-- ============================================================
-- Mini ERP - Initial Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT,
  address       TEXT,
  tax_id        TEXT,
  customer_type TEXT NOT NULL DEFAULT 'retail'
                CHECK (customer_type IN ('retail', 'wholesale')),
  credit_limit  NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance       NUMERIC(12,2) NOT NULL DEFAULT 0,
  ltv           NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_name  ON customers (name);
CREATE INDEX idx_customers_email ON customers (email);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  unit_cost     NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock         INT NOT NULL DEFAULT 0,
  reorder_point INT NOT NULL DEFAULT 10,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'discontinued')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku      ON products (sku);
CREATE INDEX idx_products_name     ON products (name);
CREATE INDEX idx_products_category ON products (category);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT UNIQUE NOT NULL,
  customer_id     UUID NOT NULL REFERENCES customers(id),
  invoice_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,4) NOT NULL DEFAULT 0.18,
  tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method  TEXT NOT NULL DEFAULT 'cash'
                  CHECK (payment_method IN ('cash', 'credit', 'transfer')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_customer ON invoices (customer_id);
CREATE INDEX idx_invoices_date     ON invoices (invoice_date);
CREATE INDEX idx_invoices_status   ON invoices (status);

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
CREATE TABLE invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL,
  subtotal    NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items (product_id);

-- ============================================================
-- TRANSACTIONS (financial movements)
-- ============================================================
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID REFERENCES invoices(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  amount          NUMERIC(12,2) NOT NULL,
  type            TEXT NOT NULL
                  CHECK (type IN ('payment', 'credit_sale', 'refund')),
  payment_method  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_invoice  ON transactions (invoice_id);
CREATE INDEX idx_transactions_customer ON transactions (customer_id);
CREATE INDEX idx_transactions_type     ON transactions (type);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
