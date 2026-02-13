-- ============================================================
-- Migration 004: Update payment methods & credit defaults
-- ============================================================

-- 1. Update invoices payment_method constraint to include new methods
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_method_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_payment_method_check
  CHECK (payment_method IN ('cash', 'credit', 'transfer', 'yape', 'plin', 'card'));

-- 2. Set a default credit limit for existing customers that have 0
UPDATE customers SET credit_limit = 500 WHERE credit_limit = 0;

-- 3. Ensure balance column is being used correctly (already exists as debt tracker)
-- No changes needed — `balance` serves as `current_debt` in the original schema.
-- The `create_order` function already increments balance on credit sales.
