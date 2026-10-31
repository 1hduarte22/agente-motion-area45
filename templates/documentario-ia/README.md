# Template · Documentário com IA (16:9)

Modelo reutilizável para produções documentais da Area45 feitas com imagens, vídeos e narração gerados por IA. O roteiro vive num único arquivo (`script/roteiro.json`) e o montador `engine/documentario.mjs` transforma esse roteiro no vídeo final 1920×1080, 30 fps, com transições, textos na tela, narração, trilha e legendas.

## Estrutura

```
<projeto>/
├── pre-producao/
│   ├── briefing.md        objetivo, público, mensagem, referências
│   ├── prompts-ia.md      bíblia visual + prompts de imagem, vídeo e voz por cena
│   ├── imagens/           fotos e imagens geradas (jpg/png)
│   ├── videos/            clipes gerados ou filmados (mp4/mov)
│   ├── narracao/          um áudio por cena: c01.mp3, c02.mp3...
│   ├── trilha/            música de fundo
│   └── sfx/               efeitos sonoros (whoosh, impactos, ambiente)
├── script/
│   ├── ROTEIRO-MODELO.md  roteiro para leitura e aprovação do cliente
│   └── roteiro.json       roteiro que o montador lê
└── final/                 documentario_16x9.mp4 + documentario_16x9.srt
```

Imagens, vídeos, áudios e o MP4 final ficam fora do git (ver `.gitignore` na raiz). Versione só os textos: briefing, prompts e roteiros.

## Passo a passo

**1. Criar o projeto a partir do template**

```bash
cp -r templates/documentario-ia projetos/<cliente>/<documentario>
```

**2. Pré-produção.** Preencha `pre-producao/briefing.md` e escreva o roteiro em `script/ROTEIRO-MODELO.md` (é o documento que vai para aprovação). Depois de aprovado, passe cada cena para `script/roteiro.json`.

**3. Gerar os materiais com IA.** Use `pre-producao/prompts-ia.md` para manter o mesmo estilo em todas as cenas. Salve cada arquivo com o número da cena no nome (`c03_personagem.mp4`, `narracao/c03.mp3`) e aponte o caminho no `roteiro.json`. Gere imagens e vídeos já em 16:9; o montador recorta para preencher a tela, então o assunto principal deve estar no centro.

**4. Conferir a montagem em rascunho (rápido, 960×540)**

```bash
node engine/documentario.mjs projetos/<cliente>/<documentario>/script/roteiro.json --rascunho
```

O rascunho funciona mesmo sem todos os arquivos: cada visual que falta vira uma cartela cinza com o número e a descrição da cena, e as narrações que faltam ficam em silêncio. Assim dá para validar ritmo e textos como um animatic antes de gerar tudo. Ao final, o script lista os avisos (arquivo faltando, narração maior que a cena, clipe curto demais).

**5. Gerar o vídeo final 16:9**

```bash
node engine/documentario.mjs projetos/<cliente>/<documentario>/script/roteiro.json
node engine/documentario.mjs projetos/<cliente>/<documentario>/script/roteiro.json --legendas   # com legendas gravadas na imagem
```

Sai em `final/documentario_16x9.mp4` (H.264 + AAC 192 kbps, áudio normalizado perto de −14 LUFS, pronto para YouTube) e `final/documentario_16x9.srt` (legendas geradas a partir do texto da narração, para subir separado no YouTube ou no Instagram). Opções: `--out arquivo.mp4` muda o destino e `--manter-temp` guarda os segmentos de cada cena em `final/.tmp/` para conferência.

Requisitos: Node 18+ e ffmpeg com libass e freetype (o `brew install ffmpeg` do Mac já vem com os dois). Um minuto de vídeo leva alguns minutos para renderizar em qualidade final; o rascunho é cerca de seis vezes mais rápido.

## O roteiro (`script/roteiro.json`)

**Topo do arquivo**

| campo | o que faz |
|---|---|
| `nome` | nome do arquivo final (`<nome>_16x9.mp4`) |
| `estilo.fonte` | família instalada (`"Inter"`, `"Montserrat"`) ou caminho de um `.ttf/.otf` relativo ao projeto |
| `estilo.fonte_titulo` | fonte dos títulos, dados e terço inferior (padrão: a mesma fonte em negrito) |
| `estilo.cor` | correção de cor do ffmpeg aplicada em todas as cenas, ex.: `eq=contrast=1.06:saturation=0.92` |
| `estilo.vinheta` | escurece levemente as bordas (look cinematográfico) |
| `estilo.fade_inicial`, `estilo.fade_final` | entrada do preto e saída para o preto, em segundos |
| `trilha.arquivo`, `trilha.volume` | música de fundo (repete se for mais curta que o vídeo) e volume de 0 a 1 |
| `trilha.ducking` | quanto a trilha abaixa quando há narração, de 0 a 1 (padrão 0.6; `false` desliga) |
| `trilha.inicio_no_arquivo` | pula o começo da música (em segundos) |

**Cada cena**

| campo | o que faz |
|---|---|
| `titulo` | nome interno da cena (aparece na cartela provisória) |
| `visual.arquivo` | imagem ou vídeo da cena |
| `visual.descricao` | o que a cena mostra; serve de guia para o prompt de IA |
| `visual.movimento` | só para imagens: `zoom-in` (padrão), `zoom-out`, `pan-esq`, `pan-dir`, `pan-cima`, `pan-baixo`, `estatico`. Para controlar a força: `{ "tipo": "zoom-in", "intensidade": 0.12 }` |
| `visual.inicio`, `visual.velocidade` | só para vídeos: segundo de onde o clipe começa e velocidade (0.5 = câmera lenta) |
| `narracao.texto` | texto da locução, usado para gravar a voz e gerar as legendas |
| `narracao.audio` | arquivo da locução da cena |
| `narracao.inicio` | quando a voz entra dentro da cena (padrão 0.4 s) |
| `dur` | duração da cena. Sem `dur`, a cena dura o tempo da narração + `respiro` (padrão 0.8 s); sem narração, 5 s |
| `textos[]` | textos na tela: `estilo`, `texto`, `de` e `ate` (segundos dentro da cena). Use `\n` para quebrar linha |
| `transicao` | transição de entrada da cena: `"corte"` ou `{ "tipo": "fusao", "duracao": 1 }` |
| `sfx[]` | efeitos: `arquivo`, `em` (segundo dentro da cena), `volume` |
| `cor` | correção de cor só desta cena |

**Estilos de texto:** `titulo` (centro, grande), `capitulo` (sobretítulo pequeno acima do centro), `terco` + `terco-sub` (nome e função no terço inferior), `citacao` (frase de depoimento no centro), `data` (ano ou local no canto superior), `dado` (número de impacto em destaque), `apoio` (frase curta abaixo do centro, complementa o `dado`), `creditos` (encerramento). Para ajustes finos, `tamanho`, `cor`, `x` e `y` (expressões do ffmpeg, ex.: `"y": "h-300"`) sobrescrevem o estilo.

**Transições:** `corte`, `fusao`, `preto` (passa pelo preto), `branco`, `dissolver`, `deslizar-esq`, `deslizar-dir`, `cortina-esq`, `cortina-dir`, `circulo`, `desfoque`, `zoom`, `suave-esq`, `suave-dir`. Qualquer nome de transição do `xfade` do ffmpeg também funciona. A transição sobrepõe as duas cenas, então o vídeo final é mais curto que a soma das durações.

## Boas práticas de documentário

Abra com imagem forte e pergunta ou tensão nos primeiros 10 segundos, e só depois mostre o título. Use `fusao` para passagem de tempo e `preto` para mudança de capítulo; guarde cortes secos para ritmo e depoimentos. Deixe respiro entre frases de narração (o padrão de 0.8 s ajuda) e uma cena final mais longa para a trilha fechar. Dados e números entram sozinhos na tela, sem disputar com outro texto. Se for gravar legendas na imagem (`--legendas`), evite textos na faixa de baixo da tela para não sobrepor.
