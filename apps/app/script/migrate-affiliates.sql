-- Affiliates + user attribution
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_ref TEXT;

CREATE TABLE IF NOT EXISTS affiliates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  coupon_code TEXT NOT NULL UNIQUE,
  discount_pct INTEGER NOT NULL DEFAULT 20,
  stripe_coupon_id TEXT,
  stripe_promo_id TEXT,
  fp_promoter_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliates_slug_idx ON affiliates (slug);
CREATE INDEX IF NOT EXISTS users_affiliate_ref_idx ON users (affiliate_ref);
