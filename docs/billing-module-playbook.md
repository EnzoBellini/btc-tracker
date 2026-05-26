# Playbook: novos módulos e planos Trackion

## Adicionar um módulo (feature)

1. Defina a chave em `packages/billing/src/features.ts` (tipo + labels).
2. Adicione o valor por plano em `packages/billing/src/plans.ts` → `entitlements`.
3. Enforce no **servidor** (`apps/app/server/billing/entitlements.ts` ou rota específica).
4. Opcional: esconda no menu via `GET /api/me/subscription` → `entitlements`.
5. Atualize landing (`apps/landing`) e admin (`apps/admin`).

## Adicionar um plano pago

1. Crie `PlanId` em `features.ts` e entrada em `PLAN_CATALOG`.
2. Migre `plans` no PostgreSQL (`script/seed-plans.ts`).
3. Crie Price no Stripe e env `STRIPE_PRICE_*`.
4. Atualize `SubscriptionWall` e seção `#precos` da landing.

**Não renomeie** `id` de planos existentes sem migração de `subscriptions.plan_id`.

## Trial Elite (14 dias)

- Fonte: `POST /api/trial-signup` → `status=trialing`, `plan_id=elite`, `trial_ends_at=+14d`.
- Um trial por e-mail: `users.trial_used_at` preenchido na criação.
- Após expiração: `expired` + paywall até assinatura paga.
