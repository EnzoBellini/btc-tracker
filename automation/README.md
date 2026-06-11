# Automações Trackion Crypto

Sistema unificado de automação em Python com duas rotinas independentes:

1. **Recuperação de Vendas** — busca clientes inativos no PostgreSQL (sem comprar há mais de 30 dias) e dispara um e-mail de reengajamento via **SendGrid**.
2. **Monitoramento de Marca** — lê menções a `@TrackionCrypto` no **Twitter / X** e envia um resumo diário para um canal no **Slack**.

## Estrutura do projeto

```
automation/
├── .env.example          # modelo de variáveis de ambiente
├── requirements.txt      # dependências
├── README.md
├── sql/
│   └── schema.sql        # DDL da tabela de clientes
└── src/
    ├── config.py         # carrega/valida o .env (fonte única de credenciais)
    ├── logger.py         # logging centralizado
    ├── db.py             # PostgreSQL: conexão + queries
    ├── email_service.py  # SendGrid
    ├── twitter_service.py# Tweepy (X API v2)
    ├── slack_service.py  # slack_sdk
    ├── tasks.py          # lógica das 2 automações
    └── main.py           # orquestração (agendador)
```

## 1. Instalação

> Requer **Python 3.10+**. Rode os comandos a partir da pasta `automation/`.

```bash
# Criar e ativar o ambiente virtual
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Linux / macOS
# source .venv/bin/activate

# Instalar as dependências
pip install -r requirements.txt
```

## 2. Configuração das credenciais

```bash
# Copie o modelo e preencha com os valores reais
copy .env.example .env      # Windows
# cp .env.example .env      # Linux / macOS
```

Abra o `.env` e preencha cada variável. O arquivo `.env` **nunca** deve ser versionado (já está no `.gitignore`).

| Variável | De onde obter |
|---|---|
| `DB_*` | Credenciais do seu PostgreSQL |
| `SENDGRID_API_KEY` | SendGrid → Settings → API Keys |
| `EMAIL_FROM` | Remetente verificado na SendGrid (Single Sender) |
| `TWITTER_BEARER_TOKEN` | Twitter Developer Portal → Keys and Tokens |
| `SLACK_BOT_TOKEN` | Slack API → OAuth & Permissions (escopo `chat:write`) |
| `SLACK_CHANNEL` | Nome (`#canal`) ou ID do canal de destino |

## 3. Criar a tabela no banco

Você tem duas opções:

**Opção A — pelo próprio projeto (recomendado):**

```bash
python -m src.main --init-db
```

**Opção B — aplicando o SQL manualmente:**

```bash
psql "host=localhost dbname=trackion user=postgres" -f sql/schema.sql
```

## 4. Executar

```bash
# Inicia o agendador contínuo (e-mail de manhã, resumo no fim do dia)
python -m src.main
```

Argumentos úteis para rodar uma tarefa **uma única vez** (ótimo para testar):

```bash
python -m src.main --sales   # só a recuperação de vendas
python -m src.main --brand   # só o monitoramento de marca
python -m src.main --init-db # só cria a tabela
```

## Como testar cada integração com segurança

A regra de ouro: **teste cada peça isoladamente** antes de ligar o agendador.

### PostgreSQL
1. Rode `python -m src.main --init-db` e confirme o log `Estrutura da tabela 'customers' verificada/criada com sucesso.`
2. Insira um cliente de teste com `last_purchase_at` antiga (veja o bloco comentado em `sql/schema.sql`). **Use um e-mail seu** para validar o recebimento real.

### SendGrid
1. Comece com um único cliente de teste (com o seu e-mail) no banco.
2. Rode `python -m src.main --sales`.
3. Verifique sua caixa de entrada e o log de status `2xx`. Em caso de erro, confira se o `EMAIL_FROM` está **verificado** na SendGrid (causa nº 1 de falha).

### Twitter / X
1. Rode `python -m src.main --brand`.
2. Se não houver menções reais ainda, ajuste temporariamente `TWITTER_SEARCH_QUERY` no `.env` para um termo popular (ex.: `bitcoin`) só para confirmar que a busca funciona — depois volte para `@TrackionCrypto`.
3. Atenção ao plano da API: o tier gratuito tem limites baixos de leitura; o serviço já aguarda automaticamente em caso de rate limit.

### Slack
1. Convide o bot para o canal de destino (`/invite @SeuBot`), senão o envio falha com `not_in_channel`.
2. Rode `python -m src.main --brand` e confirme a mensagem no canal definido em `SLACK_CHANNEL`.

## Tratamento de erros e logs

- Todas as integrações usam `try/except` e registram falhas via `logging`.
- Uma falha em uma tarefa **não derruba** o agendador nem a outra automação.
- Ajuste a verbosidade com `LOG_LEVEL` (`DEBUG`, `INFO`, `WARNING`, `ERROR`).

## Alternativa: APScheduler (concorrência real)

A versão atual usa `schedule` (loop único, ideal para jobs diários em horários distintos). Se você precisar que as tarefas rodem em **threads separadas** (ex.: jobs longos ou no mesmo horário), troque a orquestração por `APScheduler`:

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(run_sales_recovery, "cron", hour=8, minute=0)
scheduler.add_job(run_brand_monitoring, "cron", hour=20, minute=0)
scheduler.start()
```

(Adicione `apscheduler` ao `requirements.txt` nesse caso.)
