# Guia visual — posts Trackion

Referência aprovada pelo fundador: imagem com T projetado no chão de concreto, ambiente industrial escuro, logo TRACKION top-left, headline branca + linha laranja, tagline "DON'T BET. TRACK."

Brand spec: `docs/brand/trackion-brand.md`

## Template base (social card cinematográfico)

Use como base para prompts do `image_gen`:

```
Square social media graphic, 1080x1080, premium dark brand aesthetic.

Scene: [CONCEITO — ex: empty concrete room with stairs, dramatic single orange light beam projecting a large letter T on the floor, moody cinematic atmosphere, subtle film grain]

Top-left corner: Trackion logo — orange T symbol merged with rising bars plus white uppercase wordmark TRACKION.

Main headline text (large, bold, extended sans-serif, uppercase, white chalk color):
"[HEADLINE LINHA 1]"

Secondary line (same font, Track Orange #FF8C42):
"[HEADLINE LINHA 2 — opcional]"

Footer tagline (small, uppercase): DON'T BET. TRACK. — word TRACK in orange.

Color palette: obsidian black background, Track Orange #FF8C42 accents, chalk white #F5F5F0 text.
No floating crypto coins, no casino neon, no stock photo smiles, no fake trading floor.
Documentary, disciplined, crypto-native terminal aesthetic.
Sharp, readable typography. Professional social media post ready to publish.
```

## Headlines na imagem

Extraia do post — máximo 2 linhas curtas (6–8 palavras total).

Boas linhas (PT):
- CLAREZA TE DÁ VANTAGEM. / DISCIPLINA TE DÁ RESULTADO.
- PARE DE APOSTAR NO FEELING.
- IMPORTE. REVISE. MELHORE.
- PLANILHA NÃO MOSTRA O PADRÃO.
- EVIDÊNCIA > INSTINTO.

Boas linhas (EN):
- STOP TRUSTING THE FEELING.
- TURN TRADES INTO PROOF.
- DON'T BET. TRACK.

Evite na imagem:
- "Lucro garantido", "fique rico", moon, lambo
- Números de performance inventados

## Conceitos visuais (rotacionar)

### 1. T no chão (referência principal)
Feixe de luz laranja projetando T maiúsculo no concreto. Escadas ou corredor ao fundo. Atmosfera industrial.

### 2. Mesa noturna
Desk escuro, laptop/phone com glow laranja na borda. Mãos no teclado. Headline sobreposta.

### 3. Card tipográfico
Fundo preto sólido. Só texto + logo. Máximo contraste. Para posts de opinião forte.

### 4. Review moment
Close documentário de tela com métricas desfocadas + headline. Sem texto ilegível na tela.

### 5. Contraste feeling/evidência
Metade escura caótica / metade limpa com linha laranja dividindo.

### 6. Corredor + luz
Perspectiva de corredor ou escada com luz laranja no fim. Metáfora de clareza.

### 7. Terminal density
UI densa estilizada (não screenshot real) com palette Trackion — só se o post for sobre produto.

## Moodboard (referências do usuário)

Pasta: `docs/marketing/references/moodboard/`

O usuário salva pins e refs visuais ali. Codex analisa estilo e adapta para Trackion.

Assets locais:
- `imagens-do-site/landing/logo-trackion.png` — horizontal lockup
- `imagens-do-site/app/icon.png` — símbolo only

Quando `image_gen` aceitar reference_images, passe o logo horizontal.

## Tipografia na imagem

- Display: extended sans, uppercase, bold — Eurostile / Microgramma / Tektur vibe
- Headline principal: branco (#F5F5F0)
- Destaque: laranja (#FF8C42)
- Tagline rodapé: pequena, DON'T BET. TRACK.

## Checklist antes de entregar

- [ ] Imagem gerada (arquivo existe no disco)
- [ ] Logo Trackion visível
- [ ] Headline legível em mobile
- [ ] Paleta on-brand (preto + laranja + branco)
- [ ] Sem clichês proibidos
- [ ] Aspect ratio correto para o canal
- [ ] Texto do post bate com a headline da imagem
