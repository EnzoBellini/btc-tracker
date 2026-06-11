---
name: marketing-system
description: >
  Use quando o objetivo for transformar briefing de negócio em lote semanal de conteúdo
  com estratégia, pesquisa, ideias, textos e calendário. Ative com "lote semanal",
  "pacote de conteúdo", "posts da semana", "marketing Trackion" ou ao colar um briefing
  de campanha. Coordena orquestrador + subagentes definidos em `.codex/agents/`.
---

# Sistema de Marketing — Orquestrador + Subagentes

Transforme um briefing em pacote semanal pronto para publicação.

## Antes de começar

Leia os arquivos em `references/`:

- `voz-da-marca.md` — tom, proibições, exemplos
- `publico.md` — ICP, dores, objeções
- `ofertas.md` — produto, promessas, pilares
- `briefing-template.md` — formato de entrada
- `criativo-visual.md` — layout, paleta e prompts de imagem (gpt-image-2)

Brand spec completa: `docs/brand/trackion-brand.md`

## Fluxo obrigatório

Execute **todas** as etapas na ordem. Não pule. Não escreva posts antes da estratégia.

| Etapa | Agente | Saída |
| --- | --- | --- |
| 1 | Estratégia | JSON com ICP, dores, pilares, CTAs |
| 2 | Pesquisa | JSON com FAQs, erros do nicho, termos do público |
| 3 | Ideias | Array JSON com ≥12 ideias |
| 4 | Orquestrador | Seleciona 7 ideias com variedade de ângulos |
| 5 | Copywriter | JSON com posts completos por canal |
| 6 | Brand Review | Textos revisados + observações |
| 7 | Criativo | **Imagem final** de cada post via `image_gen` (gpt-image-2) |
| 8 | Publisher | JSON + Markdown operacional com caminhos das imagens |

Modelo padrão de todos os agentes: **gpt-5.5**

Agentes Codex: `.codex/agents/*.toml`

## Entradas esperadas

- produto
- ICP
- objetivo da semana
- canais
- frequência (padrão: 7)
- oferta principal
- tom de voz
- restrições
- contexto adicional (opcional)

Se faltar contexto, declare hipóteses explícitas antes de continuar.

## Regras de qualidade

- Rejeite ideias genéricas; exija especificidade, opinião e contraste
- Brand Review deve cortar clichês e violações de voz (ver `voz-da-marca.md`)
- Orquestrador pontua ideias por originalidade, clareza e potencial comercial
- Separe "ideia boa" de "texto bom" — são etapas diferentes
- **Nunca entregue só "sugestão de criativo"** — o agente-criativo gera o PNG pronto

## Saída obrigatória

Entregue **dois formatos**:

### 1. Resumo estratégico

- resumo da campanha
- pilares editoriais
- 12 ideias iniciais (lista)
- 7 ideias selecionadas (com justificativa breve)

### 2. Pacote operacional

JSON estruturado:

```json
{
  "campanha": "...",
  "pilares_editoriais": ["..."],
  "posts": [
    {
      "dia": "segunda",
      "canal": "LinkedIn",
      "formato": "post textual",
      "tema": "...",
      "gancho": "...",
      "texto": "...",
      "cta": "...",
      "imagem_arquivo": "docs/marketing/semana-2026-06-09/post-01-instagram.png",
      "headline_imagem": "...",
      "status": "DRAFT"
    }
  ]
}
```

Markdown amigável para aprovação (um bloco por dia):

```md
## Segunda — LinkedIn
**Tema:** ...
**Gancho:** ...
**Post:** ...
**CTA:** ...
**Imagem:** docs/marketing/semana-YYYY-MM-DD/post-01-instagram.png
**Status:** DRAFT
```

Salve o pacote final em `docs/marketing/semana-YYYY-MM-DD.md` quando o usuário pedir persistência.

## Prompt mestre (atalho)

```
Ative o sistema de marketing com orquestrador e subagentes.

Objetivo: gerar um pacote semanal de conteúdo pronto para publicar.

Siga obrigatoriamente: Estratégia → Pesquisa → Ideias → Priorização → Redação → Revisão → **Imagens (image_gen)** → Calendário.

Quero como saída:
- resumo estratégico
- 12 ideias iniciais
- seleção das 7 melhores
- 7 posts completos
- CTA de cada post
- **7 imagens prontas** (arquivo PNG de cada post)
- calendário semanal em formato operacional

Briefing:
[cole aqui]
```
