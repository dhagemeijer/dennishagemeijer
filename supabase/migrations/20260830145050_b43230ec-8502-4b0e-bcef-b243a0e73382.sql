CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  photo_count integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'nieuw',
  notes text NOT NULL DEFAULT '',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (status IN ('nieuw','betaling_verzocht','betaald'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  storage_path text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);

CREATE TABLE public.download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL,
  storage_path text NOT NULL DEFAULT '',
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.download_tokens TO authenticated;
GRANT ALL ON public.download_tokens TO service_role;
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage download tokens" ON public.download_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX download_tokens_order_id_idx ON public.download_tokens(order_id);

INSERT INTO public.site_content (key, body) VALUES
  ('notify_orders_email', 'on'),
  ('notify_orders_push', 'on')
ON CONFLICT (key) DO NOTHING;