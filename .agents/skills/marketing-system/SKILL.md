---
name: marketing-system
description: >
  Transforma briefing de negócio em lote semanal de conteúdo pronto para publicar.
  Use quando pedir "lote semanal", "pacote de conteúdo", "posts da semana",
  "marketing Trackion", "gerar conteúdo orgânico" ou colar um briefing de campanha.
  Coordena fluxo completo: estratégia → pesquisa → ideias → copy → brand review → imagens → calendário.
---

# Sistema de Marketing Trackion

Orquestrador + subagentes para produção semanal de conteúdo orgânico.

## Referências obrigatórias

Leia antes de executar:

- `.codex/skills/marketing-system/references/voz-da-marca.md`
- `.codex/skills/marketing-system/references/publico.md`
- `.codex/skills/marketing-system/references/ofertas.md`
- `.codex/skills/marketing-system/references/briefing-template.md`
- `.codex/skills/marketing-system/references/criativo-visual.md`
- `docs/brand/trackion-brand.md`

## Fluxo (não pule etapas)

1. **Briefing** — confirme produto, ICP, objetivo, canais, oferta, tom, restrições
2. **Estratégia** — ICP, dores, objeções, pilares editoriais, tipos de CTA (JSON)
3. **Pesquisa** — FAQs, erros do nicho, termos do público, argumentos fortes (JSON)
4. **Ideias** — mínimo 12 ideias com gancho, ângulo, formato, funil, CTA
5. **Priorização** — selecione 7 com variedade; justifique brevemente
6. **Copywriter** — posts completos por canal, versão curta, brief visual
7. **Brand Review** — corte clichês, hype, promessas financeiras; reescreva se genérico
8. **Criativo** — gera PNG final de cada post via `image_gen` (gpt-image-2)
9. **Publisher** — calendário 7 dias, JSON + Markdown, status DRAFT

Modelo: **gpt-5.5** em todos os agentes.

## Delegação no Cursor

Para tarefas longas, use subagentes (`Task`) com prompts focados por etapa. O agente principal consolida a saída final.

Personas (espelham `.codex/agents/*.toml`):

| Persona | Foco |
| --- | --- |
| Estratégia | Posicionamento editorial, JSON estruturado |
| Pesquisa | Repertório de mercado, dores, termos reais |
| Ideias | ≥12 ganchos fortes, array JSON |
| Copywriter | Texto pronto para colar, adaptado ao canal |
| Brand Review | Editor-chefe; checklist em `voz-da-marca.md` |
| Criativo | Gera imagem final com `image_gen`; salva PNG em `docs/marketing/` |
| Publisher | Calendário operacional JSON + Markdown |

## Regras

- Não escreva posts antes da estratégia existir
- Rejeite ideias genéricas
- Prefira opinião, prova, contraste e CTA natural
- Hipóteses explícitas se faltar contexto
- Trackion: anti-hype, anti-casino, sem promessa financeira

## Saída final

Entregue:

1. Resumo estratégico + pilares
2. 12 ideias + 7 selecionadas (com motivo)
3. 7 posts completos (texto, CTA, brief visual)
4. **7 imagens PNG prontas** (uma por post)
5. Calendário semanal em JSON e Markdown

Se o usuário pedir para salvar: `docs/marketing/semana-YYYY-MM-DD.md`

## Atalho de prompt

```
Ative o sistema de marketing.

Objetivo: pacote semanal pronto para publicar.
Fluxo: Estratégia → Pesquisa → Ideias → Priorização → Redação → Revisão → Imagens → Calendário.

Briefing:
[cole aqui]
```
