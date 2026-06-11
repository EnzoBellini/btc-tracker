"""Serviço de leitura de menções no Twitter / X (API v2).

Usa o Tweepy com autenticação App-only (Bearer Token), suficiente para
buscas de tweets recentes. Isola a complexidade da API do X.
"""

from dataclasses import dataclass
from typing import List

import tweepy

from .config import TwitterConfig
from .logger import setup_logger

logger = setup_logger(__name__)


@dataclass(frozen=True)
class Mention:
    """Representa uma menção encontrada no Twitter."""

    tweet_id: str
    text: str
    author_id: str


class TwitterService:
    """Encapsula o cliente do Tweepy para buscar menções."""

    def __init__(self, config: TwitterConfig) -> None:
        self._config = config
        # wait_on_rate_limit faz o Tweepy aguardar caso atinja o limite de uso.
        self._client = tweepy.Client(
            bearer_token=config.bearer_token,
            wait_on_rate_limit=True,
        )

    def fetch_recent_mentions(self) -> List[Mention]:
        """Busca menções recentes ao termo monitorado (últimos 7 dias).

        Returns:
            Lista de objetos ``Mention``. Lista vazia se não houver resultados
            ou em caso de falha (o erro é registrado em log).
        """
        # O parâmetro -is:retweet evita contar retweets como menções novas.
        query = f"{self._config.search_query} -is:retweet"

        try:
            response = self._client.search_recent_tweets(
                query=query,
                max_results=self._clamp_max_results(self._config.max_results),
                tweet_fields=["author_id", "created_at"],
            )
        except Exception as exc:  # noqa: BLE001 - capturamos qualquer erro da API
            logger.error("Falha ao buscar menções no Twitter: %s", exc)
            return []

        if not response.data:
            logger.info("Nenhuma menção encontrada para '%s'.", self._config.search_query)
            return []

        mentions = [
            Mention(
                tweet_id=str(tweet.id),
                text=tweet.text,
                author_id=str(tweet.author_id),
            )
            for tweet in response.data
        ]
        logger.info("Encontradas %d menção(ões) no Twitter.", len(mentions))
        return mentions

    @staticmethod
    def _clamp_max_results(value: int) -> int:
        """A API v2 aceita entre 10 e 100 resultados por requisição."""
        return max(10, min(value, 100))
