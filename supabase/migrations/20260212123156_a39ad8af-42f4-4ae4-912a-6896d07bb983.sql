
-- Create system_settings table for QR code and other settings
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
ON public.system_settings FOR SELECT
USING (true);

CREATE POLICY "Staff/Admin can manage settings"
ON public.system_settings FOR ALL
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add claim_date and claim_venue to orders
ALTER TABLE public.orders
ADD COLUMN claim_date date,
ADD COLUMN claim_venue text;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Create storage bucket for QR codes  
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true);

-- Create storage bucket for merchandise images
INSERT INTO storage.buckets (id, name, public) VALUES ('merchandise-images', 'merchandise-images', true);

-- Storage policies for payment-proofs
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Storage policies for qr-codes
CREATE POLICY "Staff/Admin can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes' AND (public.has_role(auth.uid(), 'staff'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Staff/Admin can update QR codes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'qr-codes' AND (public.has_role(auth.uid(), 'staff'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Staff/Admin can delete QR codes"
ON storage.objects FOR DELETE
USING (bucket_id = 'qr-codes' AND (public.has_role(auth.uid(), 'staff'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Anyone can view QR codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

-- Storage policies for merchandise-images
CREATE POLICY "Staff/Admin can upload merchandise images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'merchandise-images' AND (public.has_role(auth.uid(), 'staff'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Staff/Admin can update merchandise images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'merchandise-images' AND (public.has_role(auth.uid(), 'staff'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Anyone can view merchandise images"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchandise-images');

-- Insert default QR code setting
INSERT INTO public.system_settings (key, value) VALUES ('payment_qr_code_url', null);
