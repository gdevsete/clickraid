-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payment_links (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  token         text        UNIQUE NOT NULL,
  customer_name text        NOT NULL,
  customer_email text,
  customer_phone text,
  items         jsonb       DEFAULT '[]',
  discount_pct  integer     DEFAULT 0,
  status        text        NOT NULL DEFAULT 'pending', -- pending | paid | cancelled | expired
  created_by    uuid        REFERENCES auth.users ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  expires_at    timestamptz,
  transaction_id text,
  paid_at       timestamptz
);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Service role (used by API) bypasses RLS automatically
-- No policies needed for public read — API handles auth logic
