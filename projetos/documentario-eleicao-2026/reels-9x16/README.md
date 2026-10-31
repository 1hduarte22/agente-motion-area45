# Guia de adaptação 16:9 → 9:16 · Reels e Shorts

Como transformar o documentário "A eleição terminou. A conta, não." (16:9, 7:08) num corte vertical de ~55 s com gancho nos 3 primeiros segundos, legenda animada e CTA no fim.

| Arquivo | O que é |
|---|---|
| [`ROTEIRO.md`](ROTEIRO.md) | Roteiro cena a cena: narração, tela, movimento, som e tempos |
| [`cenas_reels.json`](cenas_reels.json) | O mesmo roteiro no formato do `roteiro/cenas.json` do documentário, pronto para entrar no pipeline |
| `README.md` | Este guia: regras do formato, como produzir e checklist de entrega |

O projeto do documentário (Remotion, Piper, scripts de trilha e finalização) não está neste repositório. Ele ficou na pasta `projeto-documentario/` gerada na sessão de 27/10. Os caminhos citados abaixo, como `animacoes/src/...` e `scripts/...`, são dessa pasta.

---

## 1. O que muda do 16:9 para o 9:16

| | Documentário 16:9 | Corte 9:16 |
|---|---|---|
| Duração | 7:08, 18 cenas, 72 falas | ~55 s, 10 cenas, 16 falas |
| Primeiro quadro | Fade de 6 quadros sobre o mapa | Fatura já montada no quadro 0, sem fade |
| Ritmo | Uma ideia por cena, com respiro | Troca visual a cada 1,5–3 s; só R06 e R08 respiram |
| Elementos por vez | Até 4 (lado a lado) | No máximo 2 (um em cima, outro embaixo), ou 4 pequenos em grade 2×2 |
| Legenda | Bloco de até 2 linhas, ~34 caracteres | Uma linha de até 18 caracteres, palavra a palavra |
| Fechamento | Assinatura com "siga o perfil" | Fatura espelhada + CTA com botões SEGUIR e SALVAR |
| Voz | Piper "cadu", velocidade natural | A mesma voz com `length_scale` 0,9 (cerca de 10% mais rápida) |

Os 3 Reels de ~2 min 20 s que já existem (`Reel1`, `Reel2`, `Reel3`) continuam valendo como episódios. Este corte é a porta de entrada para eles.

## 2. Regras do formato

### Gancho nos 3 primeiros segundos

- **Quadro 0 com informação.** Nada de fade, logo ou título genérico. A fatura com "Pagador: ?" já está na tela.
- **Tese falada em até 2,5 s:** "A eleição terminou. A conta, não."
- **Um evento visual antes de 1,5 s:** o carimbo EM ABERTO, com impacto sonoro.
- **Som no quadro 0.** A trilha começa no pulso, sem introdução.
- Teste: pause em 0:01 e em 0:03. Sem som, cada um desses quadros precisa fazer sentido sozinho.

### Zonas seguras (1080×1920)

```
y = 0     ┌──────────────────────────┐
          │  interface do app        │  0–250 px: nada importante
y = 250   ├──────────────────────────┤
          │                          │
          │  área útil dos elementos │  250–1340 px
          │                          │
y = 1340  ├──────────────────────────┤
          │  legenda (1 linha)       │  1380–1470 px
y = 1560  ├──────────────────────────┤
          │  descrição + botões do   │  últimos 360 px: só fundo
          │  app                     │  (padrão Area45, ver README da raiz)
y = 1920  └──────────────────────────┘
          e 140 px livres na direita, por causa dos ícones de curtir/comentar
```

No `animacoes/src/layout.ts`, os slots verticais que este corte usa (`C`, `L`, `R`, `TL`, `TR`, `BL`, `BR`, `CANTO`) já ficam dentro da área útil. O corte **não usa** `BAIXO` (y 1260) nem `R3` (y 1180), porque eles encostam na legenda.

### Legendas animadas

A legenda atual (`Legenda.tsx`) mostra blocos de até 34 caracteres em duas linhas a partir de y 1430. No 9:16 a segunda linha invade os 360 px de baixo. Para o corte, use uma legenda palavra a palavra:

| Item | Valor |
|---|---|
| Posição | `top: 1380`, centralizada, largura 920 px |
| Tamanho | Inter 900, 76 px, entrelinha 1,15 |
| Bloco | Até 18 caracteres (uma linha). Quebra também em pontuação |
| Animação do bloco | Spring de escala 0,85 → 1 e opacidade (damping 14, stiffness 220), cerca de 6 quadros |
| Palavra | Ainda não falada a 35% de opacidade; a palavra sendo falada com escala 1,08; as já faladas a 100% |
| Destaque | Palavras do `destaque` em amarelo `#f2c230`. No fundo amarelo do CTA, em vermelho `#d3161b` |
| Contorno | O mesmo do documentário: `text-shadow` preto + `-webkit-text-stroke` 1,5 px. Nada de contorno no fundo amarelo |
| Tempo de cada palavra | Proporcional ao número de caracteres dentro da fala. Para sincronia exata, use o Whisper (já instalado) com carimbo de tempo por palavra |

Componente pronto para colar em `animacoes/src/LegendaKaraoke.tsx`. Ele usa os mesmos `TL`, `FPS`, `COR` e `FONTE` do projeto:

```tsx
import React from 'react';
import {spring, useCurrentFrame} from 'remotion';
import {FPS, TL} from './tempo';
import {COR, FONTE} from './tema';

type Palavra = {txt: string; ini: number; fim: number; dest: boolean};
type Bloco = {ini: number; fim: number; palavras: Palavra[]; claro: boolean};

const MAX = 18; // caracteres por bloco: uma linha de 76 px em 920 px

const montar = (): Bloco[] => {
	const out: Bloco[] = [];
	for (const c of TL.cenas) {
		const claro = c.fundo === 'amarelo';
		for (const f of c.falas) {
			const faixas = f.destaque
				.map((d) => {
					const i = f.txt.indexOf(d);
					return [i, i + d.length] as const;
				})
				.filter(([i]) => i >= 0);
			const ps = [...f.txt.matchAll(/\S+/g)].map((m) => ({txt: m[0], a: m.index!, b: m.index! + m[0].length}));
			const peso = ps.reduce((s, p) => s + p.txt.length + 1, 0);
			let t = f.inicio;
			const palavras: Palavra[] = ps.map((p) => {
				const d = ((f.fim - f.inicio) * (p.txt.length + 1)) / peso;
				const w = {txt: p.txt, ini: t, fim: t + d, dest: faixas.some(([x, y]) => p.a < y && p.b > x)};
				t += d;
				return w;
			});
			let atual: Palavra[] = [];
			let len = 0;
			palavras.forEach((p, k) => {
				atual.push(p);
				len += p.txt.length + 1;
				const prox = palavras[k + 1];
				if (!prox || len + prox.txt.length > MAX || /[.,:;?!]$/.test(p.txt)) {
					out.push({ini: atual[0].ini, fim: p.fim, palavras: atual, claro});
					atual = [];
					len = 0;
				}
			});
		}
	}
	return out;
};

let cache: Bloco[] | null = null;

export const LegendaKaraoke: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const blocos = (cache ??= montar());
	const b = blocos.find((x) => t >= x.ini && t < x.fim + 0.08);
	if (!b) return null;
	const entra = spring({frame: frame - Math.round(b.ini * FPS), fps: FPS, config: {damping: 14, stiffness: 220}});
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: 1380,
				width: 920,
				transform: `translateX(-50%) scale(${0.85 + 0.15 * entra})`,
				opacity: Math.min(1, entra * 1.5),
				textAlign: 'center',
				fontFamily: FONTE.sans,
				fontWeight: 900,
				fontSize: 76,
				lineHeight: 1.15,
				textShadow: b.claro ? 'none' : '0 0 2px #000, 0 2px 4px #000, 0 0 18px rgba(0,0,0,.85)',
				WebkitTextStroke: b.claro ? undefined : '1.5px rgba(0,0,0,.6)',
				zIndex: 100,
			}}
		>
			{b.palavras.map((p, i) => {
				const falando = t >= p.ini && t < p.fim;
				const cor = p.dest ? (b.claro ? COR.vermelho : COR.amarelo) : b.claro ? COR.tinta : '#fff';
				return (
					<span key={i} style={{display: 'inline-block', margin: '0 0.14em', color: cor, opacity: t >= p.ini ? 1 : 0.35, transform: `scale(${falando ? 1.08 : 1})`}}>
						{p.txt}
					</span>
				);
			})}
		</div>
	);
};
```

Em `Documentario.tsx`, troque `<Legenda o={o} />` por `{o === 'v' ? <LegendaKaraoke /> : <Legenda o={o} />}`. Assim o 16:9 continua igual.

### CTA

- Entra no fim, depois do fechamento, e fica **pelo menos 3 s** na tela, com 1,5 s parado depois da narração.
- Uma ação falada ("Siga") e duas na tela (SEGUIR e SALVAR). Salvar pesa no alcance do Reels, e o pedido na tela não alonga a narração.
- Os botões ficam na área útil, nunca nos 360 px de baixo, onde o app põe os próprios botões.
- Troque `@seuperfil` pelo perfil real antes de renderizar. Ele está no campo `assinatura` do JSON.

### Som

- Mesma trilha sintetizada (pad em ré menor + pulso grave), começando no pulso e não no pad.
- Voz cerca de 12 dB acima da trilha, como no documentário. Em R06 a trilha fica só no pulso, e em R08 cai mais 4 dB.
- SFX só onde há evento visual: impacto (quadro 0), carimbo, whoosh nos títulos e papel no recorte.
- Master a −14 LUFS e pico de −1 dBTP com o `scripts/finalizar.sh` que já existe.

## 3. Como produzir

O caminho mais curto reaproveita o projeto inteiro e a composição `Vertical`, que já renderiza a linha do tempo toda em 1080×1920:

1. **Copie o projeto** para uma pasta nova (por exemplo, `projeto-documentario-reels/`), para não mexer nos arquivos do 16:9.
2. **Troque o roteiro:** copie `cenas_reels.json` por cima de `roteiro/cenas.json` na cópia.
3. **Ajustes pequenos no código** (todos usam campos novos e opcionais do JSON):
   - `sem_fade` (R01): em `Documentario.tsx`, renderize `<Cena>` sem o `<FadeIn>` quando `c.sem_fade` for verdadeiro.
   - `cta` (R10): no componente `assinatura` de `elementos/pecas.tsx`, desenhe um botão por item de `e.cta` (fundo `COR.tinta`, texto `COR.amarelo`, Inter 900, 44 px, padding 18×40).
   - `segura_final` (R10): some 1,5 s ao `fim` da última cena quando gerar a `timeline.json`, ou aumente em 45 quadros a duração da composição `Vertical`.
   - Legenda: adicione o `LegendaKaraoke` acima.
   - Opcional: no elemento `pontos` de R04, acenda em amarelo os pontos livres (8,3%) na segunda fala.
4. **Narre:** no `scripts/narrar.py`, use `length_scale` 0,9 na voz "cadu" e rode o script. Ele gera `audio/narracao.wav` e `animacoes/public/timeline.json`. Confira a duração total, e se passar de 60 s siga a ordem de corte do [roteiro](ROTEIRO.md#ordem-de-corte-se-passar-de-60-s).
5. **Trilha:** rode `scripts/trilha.py` para a nova duração.
6. **Legendas fechadas:** em `scripts/legendas.py`, troque `PARTES` por `[("R01", "R10")]` e rode o script. O `.srt` serve para o YouTube Shorts.
7. **Prévia:** `npx remotion studio`, composição `Vertical`.
8. **Render e master:**

   ```bash
   cd animacoes
   npx remotion render Vertical ../renders/reels_corte_bruto.mp4 --codec=h264 --crf=19 --concurrency=2 --timeout=120000 --audio-codec=aac --audio-bitrate=192k
   ../scripts/finalizar.sh ../renders/reels_corte_bruto.mp4 ../final/reels_corte_55s.mp4
   ```

   O `--timeout=120000` evita o erro de timeout que apareceu no render do `Reel1` em 27/10, com 8 GB de RAM.

Todos os tipos de elemento em `cenas_reels.json` (`fatura`, `carimbo`, `placar`, `numero`, `foto`, `recorte`, `planilha`, `pontos`, `pacote`, `icone`, `cartoes`, `titulo`, `seta`, `familia`, `assinatura`, `tag`) já existem no documentário. Nenhuma ilustração nova é necessária.

## 4. Checklist de entrega

- [ ] Duração entre 30 e 60 s (alvo: 50–58 s)
- [ ] Quadro 0 mostra a fatura, e o carimbo EM ABERTO entra antes de 1,5 s
- [ ] Assistido sem som, o vídeo se entende só pela legenda e pelos elementos
- [ ] Nenhum texto importante nos 250 px de cima, nos 360 px de baixo ou nos 140 px da direita
- [ ] Toda fala tem legenda, e cada bloco cabe em uma linha
- [ ] Fontes visíveis na tela: TSE, PLOA 2027 e IFI/Senado
- [ ] `@seuperfil` trocado pelo perfil real
- [ ] `finalizar.sh` aprovou: 1080×1920, 30 fps, −14 LUFS, sem trechos pretos e com decodificação completa
- [ ] Capa exportada: `npx remotion still Vertical capa.jpg --frame=42`, que é o carimbo no gancho (confira o quadro exato depois de narrar)

## 5. Publicação

- **Instagram Reels / TikTok:** suba o MP4 com a legenda queimada. O texto do post está no fim do [roteiro](ROTEIRO.md#texto-para-o-post).
- **YouTube Shorts:** o mesmo MP4 (até 60 s), mais o `.srt` como legenda fechada.
- **Impulsionamento:** o tema é eleição e economia. Na Meta, impulsionar exige a declaração de anúncio sobre temas sociais, eleitorais ou políticos e a verificação do perfil. Sem isso o anúncio é reprovado. A publicação orgânica não precisa disso.
- **Tom:** o corte mantém as escolhas do documentário. Os dados têm fonte, não há acusação sem fonte e nenhum grupo de eleitores é culpado. Ao reeditar, mantenha esse cuidado.
