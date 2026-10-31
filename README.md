# Agente Motion · Area45

Motor de motion para anúncios (Meta Ads): um arquivo JSON descreve as cenas e o renderizador gera MP4 H.264 30 fps em 9:16 (Reels/Stories), 4:5 (feed) ou 1:1.

## Como usar

```bash
node engine/render.mjs projetos/<cliente>/<peca>.json --format 9x16   # ou 4x5, 1x1
node engine/render.mjs projetos/<cliente>/<peca>.json --preview --times 1.5,8,20   # quadros de conferência
```

Requer Node 18+, Playwright com Chromium e ffmpeg. As fotos ficam em `projetos/<cliente>/assets/` (fora do git; vêm da pasta do cliente) e os vídeos saem em `projetos/<cliente>/out/`.

## Tipos de cena

| tipo | uso | campos |
|---|---|---|
| `hook` | 0 a 3 s, gancho com foto + headline | `img`, `kicker`, `title` (aceita `<em>` em dourado), `sub`, `note` |
| `photo` | um ponto forte por foto | `img`, `label`, `caption` |
| `price` | preço com contagem animada + chips | `img`, `pre`, `value`, `unit`, `chips[]` |
| `cta` | fechamento com botão de WhatsApp e seta para o botão do anúncio | `img` (fundo desfocado), `title`, `sub`, `button`, `who` |

Campos comuns: `dur` (s), `fit` (`cover`/`card`), `zoom` (Ken Burns), `grade` (filtro CSS de cor), `pos`. No topo do JSON: `brand`, `grade`, `palette` (`accent`, `bg`, `cta`...), `transition`.

Fotos retrato ocupam a tela inteira; fotos paisagem entram num card sobre a própria foto desfocada. Renders e imagens de projeto devem levar `"note": "Imagem ilustrativa"`.

## Padrão de roteiro (alinhado ao gestor de tráfego)

Gancho com preço/benefício nos 3 primeiros segundos → 5 a 7 cenas de prova (um benefício por cena, texto grande) → preço → CTA para WhatsApp. 20 a 30 s, texto 100% queimado (o vídeo funciona sem som), texto principal fora dos 360 px de baixo no 9:16 para não ficar atrás da interface do Instagram.

## Outros projetos

- [`projetos/documentario-eleicao-2026/reels-9x16/`](projetos/documentario-eleicao-2026/reels-9x16/): roteiro e guia para adaptar o documentário "A eleição terminou. A conta, não." (16:9, feito em Remotion) para um corte vertical de ~55 s para Reels e Shorts.
