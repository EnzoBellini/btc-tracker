"""Lógica de negócio das duas automações.

Aqui combinamos os serviços isolados:
    - ``run_sales_recovery``  : Banco de Dados  -> SendGrid
    - ``run_brand_monitoring``: Twitter / X     -> Slack

Cada tarefa é "auto-contida": carrega suas próprias configurações,
instancia os serviços de que precisa e trata erros sem derrubar o
processo principal (importante para o agendador continuar rodando).
"""

from datetime import datetime
from typing import List

from . import config
from .db import get_inactive_customers, mark_reengagement_sent
from .email_service import EmailService
from .logger import setup_logger
from .slack_service import SlackService
from .twitter_service import Mention, TwitterService

logger = setup_logger(__name__)


def run_sales_recovery() -> None:
    """Automação 1 — Recuperação de Vendas.

    Busca clientes inativos no PostgreSQL e dispara o e-mail de
    reengajamento via SendGrid, marcando cada envio no banco.
    """
    logger.info("=== Iniciando automação de Recuperação de Vendas ===")
    try:
        db_config = config.load_database_config()
        email_config = config.load_email_config()
    except config.ConfigError as exc:
        logger.error("Configuração inválida para Recuperação de Vendas: %s", exc)
        return

    email_service = EmailService(email_config)

    try:
        customers = get_inactive_customers(db_config)
    except Exception as exc:  # noqa: BLE001
        logger.error("Não foi possível obter clientes inativos: %s", exc)
        return

    sent_count = 0
    for customer in customers:
        ok = email_service.send_reengagement_email(
            to_email=customer["email"],
            customer_name=customer["name"],
        )
        if ok:
            try:
                mark_reengagement_sent(db_config, customer["id"])
                sent_count += 1
            except Exception as exc:  # noqa: BLE001
                logger.error(
                    "E-mail enviado, mas falhou ao marcar cliente id=%s: %s",
                    customer["id"],
                    exc,
                )

    logger.info(
        "Recuperação de Vendas finalizada: %d de %d e-mail(s) enviado(s).",
        sent_count,
        len(customers),
    )


def run_brand_monitoring() -> None:
    """Automação 2 — Monitoramento de Marca.

    Lê menções recentes à marca no Twitter / X, monta um resumo
    consolidado e envia para o canal configurado no Slack.
    """
    logger.info("=== Iniciando automação de Monitoramento de Marca ===")
    try:
        twitter_config = config.load_twitter_config()
        slack_config = config.load_slack_config()
    except config.ConfigError as exc:
        logger.error("Configuração inválida para Monitoramento de Marca: %s", exc)
        return

    twitter_service = TwitterService(twitter_config)
    slack_service = SlackService(slack_config)

    mentions = twitter_service.fetch_recent_mentions()
    summary = _build_slack_summary(twitter_config.search_query, mentions)
    slack_service.send_message(summary)

    logger.info("Monitoramento de Marca finalizado.")


def _build_slack_summary(search_query: str, mentions: List[Mention]) -> str:
    """Monta o texto do resumo diário para o Slack."""
    today = datetime.now().strftime("%d/%m/%Y")
    header = f"*📊 Resumo diário de menções — {search_query}* ({today})\n"

    if not mentions:
        return header + "\nNenhuma menção encontrada no período. 🔇"

    lines = [header, f"Total de menções recentes: *{len(mentions)}*\n"]
    # Mostra até 10 menções no resumo para não poluir o canal.
    for mention in mentions[:10]:
        url = f"https://twitter.com/i/web/status/{mention.tweet_id}"
        snippet = mention.text.replace("\n", " ").strip()
        if len(snippet) > 180:
            snippet = snippet[:177] + "..."
        lines.append(f"• {snippet}\n  <{url}|ver tweet>")

    if len(mentions) > 10:
        lines.append(f"\n_...e mais {len(mentions) - 10} menção(ões)._")

    return "\n".join(lines)
