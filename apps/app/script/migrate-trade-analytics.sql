-- Analytics fields on trades (setup, hour bucket, multi-account source)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS closed_at text;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS setup text;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS source_exchange text;

-- Backfill source_exchange from sync notes prefixes
UPDATE trades SET source_exchange = 'mexc' WHERE source_exchange IS NULL AND notes LIKE 'mexc_%';
UPDATE trades SET source_exchange = 'binance' WHERE source_exchange IS NULL AND notes LIKE 'binance_%';
UPDATE trades SET source_exchange = 'bitget' WHERE source_exchange IS NULL AND notes LIKE 'bitget_%';
