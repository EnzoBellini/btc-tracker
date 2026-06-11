"""Ponto de entrada e orquestração das automações.

Usa a biblioteca ``schedule`` para agendar as duas tarefas em horários
distintos do dia:
    - Recuperação de Vendas (e-mail) -> toda manhã.
    - Monitoramento de Marca (Twitter -> Slack) -> fim do dia.

Como os horários são diferentes, as tarefas nunca competem entre si.
O loop principal verifica a cada 30 segundos se há algo para executar.

Uso:
    python -m src.main              # roda o agendador (fica em execução)
    python -m src.main --sales      # executa SÓ a recuperação de vendas, 1x
    python -m src.main --brand      # executa SÓ o monitoramento, 1x
    python -m src.main --init-db    # cria a tabela no banco e sai
"""

import argparse
import time

import schedule

from . import config
from .db import create_schema
from .logger import setup_logger
from .tasks import run_brand_monitoring, run_sales_recovery

logger = setup_logger(__name__)


def _start_scheduler() -> None:
    """Configura os agendamentos e inicia o loop infinito."""
    schedule_config = config.load_schedule_config()

    schedule.every().day.at(schedule_config.email_time).do(run_sales_recovery)
    schedule.every().day.at(schedule_config.twitter_time).do(run_brand_monitoring)

    logger.info(
        "Agendador iniciado. Vendas: %s | Marca: %s. (Ctrl+C para sair)",
        schedule_config.email_time,
        schedule_config.twitter_time,
    )

    while True:
        try:
            schedule.run_pending()
            time.sleep(30)
        except KeyboardInterrupt:
            logger.info("Encerrando o agendador a pedido do usuário.")
            break
        except Exception as exc:  # noqa: BLE001 - mantém o loop vivo a despeito de falhas
            logger.error("Erro inesperado no loop do agendador: %s", exc)
            time.sleep(30)


def main() -> None:
    """Lê os argumentos da linha de comando e decide o que executar."""
    parser = argparse.ArgumentParser(description="Automações Trackion Crypto.")
    parser.add_argument("--init-db", action="store_true", help="Cria a tabela de clientes e sai.")
    parser.add_argument("--sales", action="store_true", help="Roda a recuperação de vendas uma vez.")
    parser.add_argument("--brand", action="store_true", help="Roda o monitoramento de marca uma vez.")
    args = parser.parse_args()

    if args.init_db:
        create_schema(config.load_database_config())
        return

    if args.sales:
        run_sales_recovery()
        return

    if args.brand:
        run_brand_monitoring()
        return

    # Sem argumentos: inicia o agendador contínuo.
    _start_scheduler()


if __name__ == "__main__":
    main()
