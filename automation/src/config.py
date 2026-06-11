"""Carregamento e validação centralizada das variáveis de ambiente.

Este módulo é a ÚNICA fonte de verdade para credenciais e configurações.
Nenhum outro arquivo deve ler ``os.getenv`` diretamente para credenciais.
Assim garantimos que nada fique hardcoded e que falte de configuração
seja detectada cedo (fail-fast).
"""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

# Carrega o arquivo .env (se existir) para dentro de os.environ.
load_dotenv()


class ConfigError(Exception):
    """Erro levantado quando uma variável obrigatória não está definida."""


def _get_required(key: str) -> str:
    """Lê uma variável obrigatória; falha se estiver ausente/vazia."""
    value = os.getenv(key)
    if not value:
        raise ConfigError(
            f"Variável de ambiente obrigatória ausente: '{key}'. "
            f"Verifique seu arquivo .env (use .env.example como base)."
        )
    return value


def _get_int(key: str, default: int) -> int:
    """Lê uma variável numérica opcional, com valor padrão."""
    raw = os.getenv(key)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise ConfigError(f"A variável '{key}' deve ser um número inteiro.") from exc


@dataclass(frozen=True)
class DatabaseConfig:
    """Configurações de conexão com o PostgreSQL."""

    host: str
    port: int
    name: str
    user: str
    password: str
    inactive_days: int


@dataclass(frozen=True)
class EmailConfig:
    """Configurações do serviço de e-mail (SendGrid)."""

    api_key: str
    from_email: str
    from_name: str


@dataclass(frozen=True)
class TwitterConfig:
    """Configurações da API do Twitter / X."""

    bearer_token: str
    search_query: str
    max_results: int


@dataclass(frozen=True)
class SlackConfig:
    """Configurações da integração com o Slack."""

    bot_token: str
    channel: str


@dataclass(frozen=True)
class ScheduleConfig:
    """Horários de execução das automações."""

    email_time: str
    twitter_time: str


def load_database_config() -> DatabaseConfig:
    """Monta as configurações do banco a partir do ambiente."""
    return DatabaseConfig(
        host=_get_required("DB_HOST"),
        port=_get_int("DB_PORT", 5432),
        name=_get_required("DB_NAME"),
        user=_get_required("DB_USER"),
        password=_get_required("DB_PASSWORD"),
        inactive_days=_get_int("INACTIVE_DAYS", 30),
    )


def load_email_config() -> EmailConfig:
    """Monta as configurações de e-mail a partir do ambiente."""
    return EmailConfig(
        api_key=_get_required("SENDGRID_API_KEY"),
        from_email=_get_required("EMAIL_FROM"),
        from_name=os.getenv("EMAIL_FROM_NAME", "Trackion Crypto"),
    )


def load_twitter_config() -> TwitterConfig:
    """Monta as configurações do Twitter a partir do ambiente."""
    return TwitterConfig(
        bearer_token=_get_required("TWITTER_BEARER_TOKEN"),
        search_query=os.getenv("TWITTER_SEARCH_QUERY", "@TrackionCrypto"),
        max_results=_get_int("TWITTER_MAX_RESULTS", 50),
    )


def load_slack_config() -> SlackConfig:
    """Monta as configurações do Slack a partir do ambiente."""
    return SlackConfig(
        bot_token=_get_required("SLACK_BOT_TOKEN"),
        channel=_get_required("SLACK_CHANNEL"),
    )


def load_schedule_config() -> ScheduleConfig:
    """Monta as configurações de agendamento a partir do ambiente."""
    return ScheduleConfig(
        email_time=os.getenv("SCHEDULE_EMAIL_TIME", "08:00"),
        twitter_time=os.getenv("SCHEDULE_TWITTER_TIME", "20:00"),
    )
