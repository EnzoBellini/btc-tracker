-- Migração: isolar dados por usuário (user_id)
-- Execute no Neon / PostgreSQL ANTES de `npm run db:push` se já existem dados sem user_id.
-- Ordem: criar colunas nullable → backfill → NOT NULL → índices únicos (o Drizzle push pode criar FKs).

-- 1) Adicionar colunas (ignore erros se já existirem)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE btc_holdings ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exchange_credentials ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE mexc_credentials ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE;

-- 2) Atribuir todos os registros órfãos ao primeiro usuário (ajuste se necessário)
DO $$
DECLARE u integer;
BEGIN
  SELECT id INTO u FROM users ORDER BY id LIMIT 1;
  IF u IS NULL THEN
    RAISE NOTICE 'Nenhum usuário: crie um usuário antes ou apague dados antigos.';
  ELSE
    UPDATE trades SET user_id = u WHERE user_id IS NULL;
    UPDATE transfers SET user_id = u WHERE user_id IS NULL;
    UPDATE btc_holdings SET user_id = u WHERE user_id IS NULL;
    UPDATE settings SET user_id = u WHERE user_id IS NULL;
    UPDATE exchange_credentials SET user_id = u WHERE user_id IS NULL;
    UPDATE mexc_credentials SET user_id = u WHERE user_id IS NULL;
    UPDATE goals SET user_id = u WHERE user_id IS NULL;
  END IF;
END $$;

-- 3) Tornar obrigatório (falha se ainda houver NULL)
ALTER TABLE trades ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transfers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE btc_holdings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE settings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE exchange_credentials ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE mexc_credentials ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;

-- 4) Um registro de settings / mexc por usuário
CREATE UNIQUE INDEX IF NOT EXISTS settings_user_id_unique ON settings (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS exchange_credentials_user_exchange_unique ON exchange_credentials (user_id, exchange);
CREATE UNIQUE INDEX IF NOT EXISTS mexc_credentials_user_id_unique ON mexc_credentials (user_id);
