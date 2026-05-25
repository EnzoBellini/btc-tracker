-- ⚠️  RESET COMPLETO DO BANCO DE DADOS
-- Isso apaga TODOS os dados e recria as tabelas do zero.
-- Rode no Neon SQL Editor: https://console.neon.tech

-- 1) Apagar todas as tabelas (ordem importa por causa das FKs)
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS exchange_credentials CASCADE;
DROP TABLE IF EXISTS mexc_credentials CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS btc_holdings CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2) Depois de rodar este SQL, execute no terminal:
--    npm run db:push
--
-- Isso recria todas as tabelas com o schema atualizado (user_id, etc).
-- Depois é só criar sua conta novamente no app.
