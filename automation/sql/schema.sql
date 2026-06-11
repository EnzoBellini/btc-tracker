-- =====================================================================
-- DDL: Tabela de clientes
-- ---------------------------------------------------------------------
-- Cria a estrutura necessária para a automação de Recuperação de Vendas.
-- O script é idempotente (pode ser executado várias vezes sem erro).
-- =====================================================================

CREATE TABLE IF NOT EXISTS customers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150)        NOT NULL,
    email           VARCHAR(255)        NOT NULL UNIQUE,
    -- Data/hora da última compra realizada pelo cliente.
    -- Pode ser NULL para clientes que nunca compraram.
    last_purchase_at TIMESTAMPTZ,
    -- Controla se já enviamos o e-mail de reengajamento, evitando spam.
    reengagement_sent_at TIMESTAMPTZ,
    is_active       BOOLEAN            NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Índice para acelerar a busca por clientes inativos (filtro por data).
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase
    ON customers (last_purchase_at);

-- ---------------------------------------------------------------------
-- (OPCIONAL) Dados de teste para validar a automação rapidamente.
-- Descomente para inserir exemplos. Ajuste o e-mail para um endereço
-- seu, de modo a confirmar o recebimento real do e-mail.
-- ---------------------------------------------------------------------
-- INSERT INTO customers (name, email, last_purchase_at) VALUES
--     ('Cliente Inativo', 'seu-email-de-teste@exemplo.com', NOW() - INTERVAL '45 days'),
--     ('Cliente Ativo',   'ativo@exemplo.com',              NOW() - INTERVAL '3 days')
-- ON CONFLICT (email) DO NOTHING;
