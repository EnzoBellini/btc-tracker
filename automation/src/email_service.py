"""Serviço de envio de e-mails via API da SendGrid.

Isola toda a comunicação com a SendGrid. Se um dia trocarmos de provedor
(ex.: Amazon SES), apenas este arquivo precisa mudar.
"""

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Content, Email, Mail, To

from .config import EmailConfig
from .logger import setup_logger

logger = setup_logger(__name__)


class EmailService:
    """Encapsula o cliente da SendGrid e o envio de e-mails."""

    def __init__(self, config: EmailConfig) -> None:
        self._config = config
        self._client = SendGridAPIClient(config.api_key)

    def send_reengagement_email(self, to_email: str, customer_name: str) -> bool:
        """Envia um e-mail de reengajamento personalizado.

        Args:
            to_email: E-mail do destinatário.
            customer_name: Nome do cliente, usado para personalizar a mensagem.

        Returns:
            ``True`` se o e-mail foi aceito pela SendGrid; ``False`` caso falhe.
        """
        subject = "Sentimos sua falta na Trackion Crypto! 👋"
        html_content = self._build_html(customer_name)

        message = Mail(
            from_email=Email(self._config.from_email, self._config.from_name),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content),
        )

        try:
            response = self._client.send(message)
            # A SendGrid retorna 2xx em caso de sucesso.
            if 200 <= response.status_code < 300:
                logger.info("E-mail enviado para %s (status %s).", to_email, response.status_code)
                return True
            logger.warning(
                "SendGrid retornou status inesperado %s para %s.",
                response.status_code,
                to_email,
            )
            return False
        except Exception as exc:  # noqa: BLE001 - queremos capturar qualquer falha da API
            logger.error("Falha ao enviar e-mail para %s: %s", to_email, exc)
            return False

    @staticmethod
    def _build_html(customer_name: str) -> str:
        """Monta o corpo HTML personalizado do e-mail."""
        return f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2>Olá, {customer_name}!</h2>
            <p>Notamos que faz um tempinho desde a sua última movimentação por aqui.</p>
            <p>
                O mercado cripto não para — e preparamos novidades para ajudar você a
                acompanhar seus investimentos com ainda mais facilidade.
            </p>
            <p>
                <a href="https://trackioncrypto.com"
                   style="background:#f7931a;color:#fff;padding:12px 20px;
                          border-radius:8px;text-decoration:none;display:inline-block;">
                    Voltar para a Trackion
                </a>
            </p>
            <p style="color:#888;font-size:12px;">
                Você recebeu este e-mail porque é cliente da Trackion Crypto.
            </p>
        </div>
        """
