-- ============================================================
-- Atomic Order Creation Function
-- ============================================================
-- Creates an invoice, validates & deducts inventory, records
-- the financial transaction, and updates customer balance/LTV
-- all within a single atomic database transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION create_order(
  p_customer_id    UUID,
  p_payment_method TEXT DEFAULT 'cash',
  p_tax_rate       NUMERIC DEFAULT 0.18,
  p_notes          TEXT DEFAULT '',
  p_items          JSONB DEFAULT '[]'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_invoice_id    UUID;
  v_invoice_num   TEXT;
  v_subtotal      NUMERIC := 0;
  v_tax           NUMERIC;
  v_total         NUMERIC;
  v_item          JSONB;
  v_product       RECORD;
  v_line_subtotal NUMERIC;
  v_daily_seq     INT;
BEGIN
  -- -------------------------------------------------------
  -- 1. Generate invoice number: INV-YYYYMMDD-XXX
  -- -------------------------------------------------------
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(invoice_number, '-', 3) AS INT)), 0) + 1
    INTO v_daily_seq
    FROM invoices
    WHERE invoice_date::date = CURRENT_DATE;

  v_invoice_num := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD')
                   || '-' || LPAD(v_daily_seq::TEXT, 3, '0');

  -- -------------------------------------------------------
  -- 2. Validate stock for ALL items (with row-lock)
  -- -------------------------------------------------------
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM products
      WHERE id = (v_item->>'product_id')::UUID
      FOR UPDATE;  -- row-level lock prevents concurrent overselling

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
    END IF;

    IF v_product.status = 'discontinued' THEN
      RAISE EXCEPTION 'Producto descontinuado: "%"', v_product.name;
    END IF;

    IF v_product.stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, Solicitado: %',
        v_product.name, v_product.stock, (v_item->>'quantity')::INT;
    END IF;

    v_line_subtotal := v_product.unit_price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_line_subtotal;
  END LOOP;

  -- -------------------------------------------------------
  -- 3. Calculate tax & total
  -- -------------------------------------------------------
  v_tax   := ROUND(v_subtotal * p_tax_rate, 2);
  v_total := v_subtotal + v_tax;

  -- -------------------------------------------------------
  -- 4. Create the invoice header
  -- -------------------------------------------------------
  INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date,
    subtotal, tax_rate, tax_amount, total,
    payment_method, status, notes
  ) VALUES (
    gen_random_uuid(), v_invoice_num, p_customer_id, NOW(),
    v_subtotal, p_tax_rate, v_tax, v_total,
    p_payment_method,
    CASE WHEN p_payment_method = 'credit' THEN 'pending' ELSE 'paid' END,
    p_notes
  ) RETURNING id INTO v_invoice_id;

  -- -------------------------------------------------------
  -- 5. Create line items & deduct inventory
  -- -------------------------------------------------------
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM products
      WHERE id = (v_item->>'product_id')::UUID;

    -- Insert line item (captures price at time of sale)
    INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price, subtotal)
    VALUES (
      gen_random_uuid(), v_invoice_id, v_product.id,
      (v_item->>'quantity')::INT,
      v_product.unit_price,
      v_product.unit_price * (v_item->>'quantity')::INT
    );

    -- Deduct stock
    UPDATE products
      SET stock = stock - (v_item->>'quantity')::INT,
          updated_at = NOW()
      WHERE id = v_product.id;
  END LOOP;

  -- -------------------------------------------------------
  -- 6. Record financial transaction
  -- -------------------------------------------------------
  INSERT INTO transactions (id, invoice_id, customer_id, amount, type, payment_method)
  VALUES (
    gen_random_uuid(), v_invoice_id, p_customer_id, v_total,
    CASE WHEN p_payment_method = 'credit' THEN 'credit_sale' ELSE 'payment' END,
    p_payment_method
  );

  -- -------------------------------------------------------
  -- 7. Update customer balance (credit sales only)
  -- -------------------------------------------------------
  IF p_payment_method = 'credit' THEN
    UPDATE customers
      SET balance = balance + v_total,
          updated_at = NOW()
      WHERE id = p_customer_id;
  END IF;

  -- -------------------------------------------------------
  -- 8. Recalculate customer LTV
  -- -------------------------------------------------------
  UPDATE customers
    SET ltv = (
      SELECT COALESCE(SUM(total), 0) FROM invoices
        WHERE customer_id = p_customer_id AND status != 'cancelled'
    ), updated_at = NOW()
    WHERE id = p_customer_id;

  RETURN v_invoice_id;
END;
$$;
