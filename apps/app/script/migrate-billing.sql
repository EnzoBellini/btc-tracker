-- Billing: plans, subscriptions, trial tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  highlights TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  source TEXT NOT NULL DEFAULT 'trial_signup',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  target_user_id INTEGER,
  payload TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO plans (id, name, price_cents, currency, sort_order, highlights) VALUES
  ('starter', 'Starter Lite', 2000, 'BRL', 1, '["1 conta de exchange","Histórico 30 dias","Dashboard essencial"]'),
  ('pro', 'Pro Trader', 4000, 'BRL', 2, '["Até 3 exchanges","Histórico ilimitado","Sync 2 min"]'),
  ('elite', 'Elite / Fund', 6000, 'BRL', 3, '["Exchanges ilimitadas","Sync webhook","Multi-conta"]')
ON CONFLICT (id) DO NOTHING;
