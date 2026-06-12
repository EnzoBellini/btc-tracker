-- Auth: tokens de verificação de e-mail (idempotente)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx
  ON email_verification_tokens (user_id);

CREATE INDEX IF NOT EXISTS email_verification_tokens_token_hash_idx
  ON email_verification_tokens (token_hash);

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_ref TEXT;
