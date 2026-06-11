"""Camada de acesso ao banco de dados PostgreSQL.

Responsabilidades:
    - Abrir conexões de forma segura (context manager).
    - Criar a estrutura da tabela de clientes (DDL).
    - Buscar clientes inativos há mais de N dias.
    - Marcar clientes que já receberam o e-mail de reengajamento.

Nenhuma credencial é lida aqui diretamente: tudo vem de ``config.py``.
"""

from contextlib import contextmanager
from typing import Iterator, List

import psycopg2
from psycopg2.extras import RealDictCursor

from .config import DatabaseConfig
from .logger import setup_logger

logger = setup_logger(__name__)


@contextmanager
def get_connection(config: DatabaseConfig) -> Iterator["psycopg2.extensions.connection"]:
    """Context manager que abre e fecha a conexão automaticamente.

    Faz commit no fim caso tudo dê certo e rollback em caso de exceção,
    garantindo que a conexão nunca fique aberta indevidamente.
    """
    conn = None
    try:
        conn = psycopg2.connect(
            host=config.host,
            port=config.port,
            dbname=config.name,
            user=config.user,
            password=config.password,
        )
        yield conn
        conn.commit()
    except psycopg2.Error as exc:
        if conn is not None:
            conn.rollback()
        logger.error("Erro na operação com o banco de dados: %s", exc)
        raise
    finally:
        if conn is not None:
            conn.close()


def create_schema(config: DatabaseConfig) -> None:
    """Cria a tabela de clientes e índices, caso ainda não existam."""
    ddl = """
    CREATE TABLE IF NOT EXISTS customers (
        id                   BIGSERIAL PRIMARY KEY,
        name                 VARCHAR(150) NOT NULL,
        email                VARCHAR(255) NOT NULL UNIQUE,
        last_purchase_at     TIMESTAMPTZ,
        reengagement_sent_at TIMESTAMPTZ,
        is_active            BOOLEAN NOT NULL DEFAULT TRUE,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_customers_last_purchase
        ON customers (last_purchase_at);
    """
    with get_connection(config) as conn:
        with conn.cursor() as cursor:
            cursor.execute(ddl)
    logger.info("Estrutura da tabela 'customers' verificada/criada com sucesso.")


def get_inactive_customers(config: DatabaseConfig) -> List[dict]:
    """Retorna os clientes inativos há mais de ``inactive_days`` dias.

    Critérios:
        - Possuem ``last_purchase_at`` (já compraram alguma vez).
        - A última compra foi há mais dias que o limite configurado.
        - Estão ativos (``is_active = TRUE``).
        - Ainda NÃO receberam e-mail de reengajamento desde a última compra
          (evita reenvios duplicados).

    Returns:
        Lista de dicionários com as chaves: id, name, email, last_purchase_at.
    """
    query = """
        SELECT id, name, email, last_purchase_at
        FROM customers
        WHERE is_active = TRUE
          AND last_purchase_at IS NOT NULL
          AND last_purchase_at < NOW() - (%s || ' days')::INTERVAL
          AND (
                reengagement_sent_at IS NULL
                OR reengagement_sent_at < last_purchase_at
              )
        ORDER BY last_purchase_at ASC;
    """
    with get_connection(config) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (config.inactive_days,))
            rows = cursor.fetchall()

    logger.info("Encontrados %d cliente(s) inativo(s).", len(rows))
    # Converte RealDictRow em dict puro para uso seguro fora deste módulo.
    return [dict(row) for row in rows]


def mark_reengagement_sent(config: DatabaseConfig, customer_id: int) -> None:
    """Marca que o e-mail de reengajamento foi enviado para um cliente."""
    query = """
        UPDATE customers
        SET reengagement_sent_at = NOW(),
            updated_at = NOW()
        WHERE id = %s;
    """
    with get_connection(config) as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, (customer_id,))
    logger.debug("Cliente id=%s marcado como reengajado.", customer_id)
