-- Migração: mexc_credentials → exchange_credentials (multi-exchange)
-- Execute no Neon ANTES de `npm run db:push` se já existe mexc_credentials com dados.

CREATE TABLE IF NOT EXISTS exchange_credentials (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange text NOT NULL,
  api_key text NOT NULL DEFAULT '',
  secret_key text NOT NULL DEFAULT '',
  passphrase text NOT NULL DEFAULT '',
  is_connected boolean NOT NULL DEFAULT false,
  last_sync_at text,
  last_sync_status text,
  last_sync_message text
);

-- Copiar dados MEXC existentes
INSERT INTO exchange_credentials (
  user_id, exchange, api_key, secret_key, passphrase,
  is_connected, last_sync_at, last_sync_status, last_sync_message
)
SELECT
  user_id, 'mexc', api_key, secret_key, '',
  is_connected, last_sync_at, last_sync_status, last_sync_message
FROM mexc_credentials
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mexc_credentials');

-- Índice único por usuário + exchange
CREATE UNIQUE INDEX IF NOT EXISTS exchange_credentials_user_exchange_unique
  ON exchange_credentials (user_id, exchange);

DROP TABLE IF EXISTS mexc_credentials CASCADE;
