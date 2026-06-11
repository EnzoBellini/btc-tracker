"""Serviço de envio de mensagens para o Slack.

Usa o slack_sdk (WebClient). O canal de destino é dinâmico e vem das
variáveis de ambiente, conforme solicitado.
"""

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from .config import SlackConfig
from .logger import setup_logger

logger = setup_logger(__name__)


class SlackService:
    """Encapsula o cliente do Slack para o envio de mensagens."""

    def __init__(self, config: SlackConfig) -> None:
        self._config = config
        self._client = WebClient(token=config.bot_token)

    def send_message(self, text: str) -> bool:
        """Envia uma mensagem de texto para o canal configurado.

        Args:
            text: Conteúdo da mensagem (suporta a sintaxe Markdown do Slack).

        Returns:
            ``True`` se a mensagem foi enviada; ``False`` em caso de erro.
        """
        try:
            self._client.chat_postMessage(
                channel=self._config.channel,
                text=text,
            )
            logger.info("Mensagem enviada ao canal '%s' do Slack.", self._config.channel)
            return True
        except SlackApiError as exc:
            logger.error(
                "Falha ao enviar mensagem ao Slack (%s): %s",
                self._config.channel,
                exc.response.get("error", "erro desconhecido"),
            )
            return False
