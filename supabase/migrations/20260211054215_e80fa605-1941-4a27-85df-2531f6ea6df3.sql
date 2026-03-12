-- Fix search_path for generate_receipt_number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'CSC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((COUNT(*) + 1)::TEXT, 6, '0')
  INTO new_number
  FROM public.csc_fee_payments
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN new_number;
END;
$$;

-- Fix search_path for generate_order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO new_number
  FROM public.orders
  WHERE DATE(created_at) = CURRENT_DATE;
  RETURN new_number;
END;
$$;