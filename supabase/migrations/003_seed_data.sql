-- ============================================================
-- Seed Data — Sample customers, products, invoices
-- Populates the system with realistic demo data.
-- ============================================================

-- -------------------------------------------------------
-- CUSTOMERS
-- -------------------------------------------------------
INSERT INTO customers (id, name, email, phone, address, tax_id, customer_type, credit_limit) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Distribuidora López S.A.', 'contacto@lopez-dist.com', '+52 55 1234 5678', 'Av. Insurgentes Sur 1234, CDMX', 'DLO920415ABC', 'wholesale', 50000.00),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'María García Hernández', 'maria.garcia@email.com', '+52 33 9876 5432', 'Calle Reforma 567, Guadalajara', 'GAHM850612XYZ', 'retail', 5000.00),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Tech Solutions MX', 'ventas@techsolutions.mx', '+52 81 5555 1234', 'Blvd. Constitución 890, Monterrey', 'TSM100305DEF', 'wholesale', 100000.00),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Roberto Martínez', 'roberto.mtz@gmail.com', '+52 55 4444 3333', 'Col. Roma Norte 123, CDMX', NULL, 'retail', 0),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Papelería El Estudiante', 'papeleria@estudiante.com', '+52 222 777 8888', 'Av. Juárez 456, Puebla', 'PEE150820GHI', 'wholesale', 25000.00);

-- -------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------
INSERT INTO products (id, sku, name, description, category, unit_cost, unit_price, stock, reorder_point) VALUES
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'LAP-001', 'Laptop ProBook 450', 'Laptop empresarial 15.6" i7 16GB RAM 512GB SSD', 'Electrónica', 12000.00, 18500.00, 25, 5),
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'MON-001', 'Monitor UltraWide 34"', 'Monitor curvo 34" WQHD 144Hz', 'Electrónica', 6500.00, 9800.00, 15, 3),
  ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'TEC-001', 'Teclado Mecánico RGB', 'Teclado mecánico switches Cherry MX Blue', 'Periféricos', 800.00, 1450.00, 50, 10),
  ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'MOU-001', 'Mouse Ergonómico Pro', 'Mouse inalámbrico ergonómico 4000 DPI', 'Periféricos', 350.00, 650.00, 80, 15),
  ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'CAB-HDMI', 'Cable HDMI 2.1 3m', 'Cable HDMI 2.1 Ultra High Speed 3 metros', 'Accesorios', 120.00, 250.00, 200, 30),
  ('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'SSD-001', 'SSD NVMe 1TB', 'Disco sólido NVMe M.2 1TB lectura 7000MB/s', 'Almacenamiento', 1200.00, 1950.00, 35, 8),
  ('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'AUR-001', 'Auriculares Bluetooth NC', 'Auriculares over-ear con cancelación de ruido', 'Audio', 900.00, 1650.00, 40, 8),
  ('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'WEB-001', 'Webcam 4K AutoFocus', 'Cámara web 4K con enfoque automático y micrófono', 'Periféricos', 450.00, 850.00, 30, 5),
  ('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'HUB-001', 'Hub USB-C 7 en 1', 'Hub multipuerto USB-C con HDMI, USB 3.0, SD', 'Accesorios', 280.00, 520.00, 60, 10),
  ('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 'PAD-001', 'Mouse Pad XL Gaming', 'Alfombrilla de ratón 900x400mm base antideslizante', 'Accesorios', 150.00, 320.00, 100, 20);

-- -------------------------------------------------------
-- SAMPLE INVOICES (with items and transactions)
-- -------------------------------------------------------

-- Invoice 1: Cash sale to María García
INSERT INTO invoices (id, invoice_number, customer_id, invoice_date, subtotal, tax_rate, tax_amount, total, payment_method, status) VALUES
  ('11111111-1111-4111-8111-111111111111', 'INV-20260210-001', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '2026-02-10 10:30:00-05', 19950.00, 0.18, 3591.00, 23541.00, 'cash', 'paid');

INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal) VALUES
  ('11111111-1111-4111-8111-111111111111', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 1, 18500.00, 18500.00),
  ('11111111-1111-4111-8111-111111111111', 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 1, 1450.00, 1450.00);

INSERT INTO transactions (invoice_id, customer_id, amount, type, payment_method) VALUES
  ('11111111-1111-4111-8111-111111111111', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 23541.00, 'payment', 'cash');

-- Invoice 2: Credit sale to Distribuidora López
INSERT INTO invoices (id, invoice_number, customer_id, invoice_date, subtotal, tax_rate, tax_amount, total, payment_method, status) VALUES
  ('22222222-2222-4222-8222-222222222222', 'INV-20260210-002', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '2026-02-10 14:00:00-05', 51750.00, 0.18, 9315.00, 61065.00, 'credit', 'pending');

INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal) VALUES
  ('22222222-2222-4222-8222-222222222222', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 2, 18500.00, 37000.00),
  ('22222222-2222-4222-8222-222222222222', 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 1, 9800.00, 9800.00),
  ('22222222-2222-4222-8222-222222222222', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 2, 1950.00, 3900.00),
  ('22222222-2222-4222-8222-222222222222', 'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 4, 250.00, 1000.00),
  ('22222222-2222-4222-8222-222222222222', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 1, 50.00, 50.00);

INSERT INTO transactions (invoice_id, customer_id, amount, type, payment_method) VALUES
  ('22222222-2222-4222-8222-222222222222', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 61065.00, 'credit_sale', 'credit');

-- Update customer balances and LTV based on seed data
UPDATE customers SET ltv = 23541.00 WHERE id = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
UPDATE customers SET ltv = 61065.00, balance = 61065.00 WHERE id = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
