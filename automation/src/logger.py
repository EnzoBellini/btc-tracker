"""Configuração centralizada de logging para todo o projeto.

Mantemos a configuração de logs em um único módulo para garantir um
formato consistente em todas as automações e facilitar o rastreamento
de falhas.
"""

import logging
import os


def setup_logger(name: str) -> logging.Logger:
    """Cria e retorna um logger já configurado.

    Args:
        name: Nome do logger (geralmente ``__name__`` do módulo chamador).

    Returns:
        Uma instância de ``logging.Logger`` pronta para uso.
    """
    # O nível é controlado por variável de ambiente (padrão: INFO).
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Evita adicionar múltiplos handlers caso a função seja chamada
    # mais de uma vez para o mesmo logger.
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
