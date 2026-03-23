# MEXC Proxy (Fly.io)

Proxy HTTP para encaminhar chamadas da API MEXC. Usa IP de saída fixo do Fly.io, permitindo whitelist na MEXC.

## Deploy no Fly.io

```bash
cd mexc-proxy
fly launch   # primeira vez: cria o app
fly deploy    # deploy
```

## Alocar IP de egress (obrigatório)

Os IPs de saída do Fly são dinâmicos por padrão. Para whitelist na MEXC:

```bash
fly ips allocate-egress --region gru
fly ips list   # anote os IPv4 e adicione na MEXC > API Management > Vincular IP
```

## Configurar no Railway (Trackion)

Adicione a variável de ambiente:

```
MEXC_PROXY_URL=https://trackion-mexc-proxy.fly.dev
```

(Substitua pelo nome real do seu app no Fly se for diferente.)

## Rotas

- `GET/POST /mexc/spot/*` → `https://api.mexc.com/*`
- `GET/POST /mexc/contract/*` → `https://contract.mexc.com/*`
- `GET /health` → health check

## Segurança (opcional)

Para evitar uso público, configure no Fly:

1. `fly secrets set MEXC_PROXY_SECRET=sua-chave-secreta`
2. No Railway, adicione `MEXC_PROXY_SECRET=sua-chave-secreta`
3. O backend enviará `X-Proxy-Auth: sua-chave-secreta` e o proxy rejeitará requests sem ela

Por enquanto o proxy é aberto; proteja com firewall ou secret se necessário.
