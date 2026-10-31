# Roteiro 9:16 · "A eleição terminou. A conta, não."

Corte único para Reels e Shorts, feito a partir do documentário 16:9 de 7:08 (sessão de 27/10/2026). O documentário já tem três "Reels" de cerca de 2 min 20 s cada, que funcionam como episódios. Este corte é outra peça: um resumo de **~55 s** pensado para descoberta, que leva quem assiste até o perfil e o documentário completo.

| | |
|---|---|
| **Objetivo** | Fazer quem rola o feed parar, entender a tese em menos de 1 minuto e seguir o perfil |
| **Público** | Adultos que acompanham política e economia no Instagram, TikTok e YouTube Shorts, a maioria assistindo sem som |
| **Mensagem** | O resultado da eleição saiu, mas o custo do ano eleitoral ainda vai ser pago, e quem paga primeiro é quem tem menos |
| **Formato** | 1080×1920, 30 fps, H.264 + AAC, áudio a −14 LUFS, legenda queimada |
| **Duração** | ~55 s (estimativa: 149 palavras faladas com a voz a 0,9 de `length_scale`, mais 1,5 s de CTA parado). O tempo real sai da `timeline.json` depois de narrar |
| **Estrutura** | Gancho (0–3 s) → fato → reação → causa → virada → consequências → fechamento espelhado → CTA |
| **Fonte de verdade** | [`cenas_reels.json`](cenas_reels.json), no mesmo formato do `roteiro/cenas.json` do documentário |

Todos os números vêm do roteiro do documentário, que conferiu cada dado em fonte pública em 27/10/2026. Nenhum dado novo foi acrescentado. As fontes continuam visíveis na tela.

---

## Linha do tempo

Os tempos são estimados. Cada fala é narrada separadamente, então os elementos ficam presos à fala e se reposicionam sozinhos quando a narração real ficar pronta.

### R01 · Gancho · 0:00–0:02

| | |
|---|---|
| **Narração** | "A eleição terminou. **A conta, não.**" |
| **Na tela** | A **fatura** já está montada no quadro 0, sem fade. Campo "Pagador: ?" e total "R$ ???". O carimbo vermelho **EM ABERTO** bate em ~1,2 s. Tag **ELEIÇÃO 2026** no canto de cima |
| **Movimento** | Push-in lento na fatura (escala 1,00 → 1,06 em 3 s). O carimbo entra com overshoot (escala 1,6 → 0,95 → 1,0 em 8 quadros) e um tremor de 2 px na fatura |
| **Som** | Impacto grave no quadro 0, sem silêncio inicial. Carimbo com o SFX `carimbo` + sub-grave. A trilha começa já no pulso, sem introdução |
| **Por quê** | O primeiro quadro precisa ser legível como miniatura e já dizer a tese. A fatura sem pagador gera a pergunta que o resto do vídeo responde |

### R02 · O resultado · 0:02–0:06

| | |
|---|---|
| **Narração** | "Lula foi reeleito por **4,4 milhões** de votos." |
| **Na tela** | **Placar** do 2º turno em cima (51,79% × 48,21%, fonte TSE), carimbo **REELEITO**, e embaixo o **número 4,4 mi** contando de 0 |
| **Movimento** | As barras do placar crescem com easing `out-cubic` (12 quadros). O número usa contagem animada com o último dígito travando no tempo da palavra "milhões" |
| **Transição de entrada** | Corte seco no fim da fala do gancho, com flash branco de 2 quadros a 30% |

### R03 · O veredito do mercado · 0:06–0:16

| | |
|---|---|
| **Narração** | "Horas depois, as ações brasileiras em Nova York chegaram a cair **26,7%**." / "A pior reação a uma eleição **desde 2002**." |
| **Na tela** | Ilustração **NOVA YORK** em cima, número **−26,7%** em vermelho embaixo (legenda "EWZ · pré-abertura de segunda, 26/10"). Na segunda fala, o **recorte** "Pior reação do mercado… desde 2002" ocupa o centro, com "desde 2002" grifado |
| **Movimento** | O número cai: entra de cima com motion blur vertical e assenta com bounce curto. O grifo amarelo no recorte se desenha da esquerda para a direita durante a palavra "2002" |
| **Som** | Whoosh descendente na entrada do número. Papel no recorte |

### R04 · A planilha de 2027 · 0:16–0:27

| | |
|---|---|
| **Narração** | "Por quê? **91,7%** das despesas primárias de 2027 já são obrigatórias." / "Sobram **8,3%** para escolher." |
| **Na tela** | **Planilha** "CONTAS PÚBLICAS · 2027" por menos de 1 s e depois a **grade de pontos** com 91,7% em vermelho (fonte PLOA 2027). Na segunda fala, os pontos livres (8,3%) acendem em amarelo e o carimbo **TRAVADO** bate |
| **Movimento** | A grade preenche em onda diagonal (stagger de 1 quadro por linha). Os 8,3% piscam uma vez antes do carimbo |
| **Por quê** | É o centro do argumento. A grade mostra a proporção sem precisar ler número |

### R05 · O pacote do ano eleitoral · 0:27–0:33

| | |
|---|---|
| **Narração** | "E o ano eleitoral somou **R$ 298 bilhões** em benefícios e crédito subsidiado." |
| **Na tela** | **Pacote** com os itens (Bolsa Família +15%, combustíveis, dívidas de MEI, crédito subsidiado) em cima, número **R$ 298,4 bi** embaixo (fonte IFI/Senado), carimbo **ANO ELEITORAL** |
| **Movimento** | Os itens do pacote entram em cascata (stagger de 4 quadros). O número sobe por contagem |

### R06 · Não existe almoço grátis · 0:33–0:35

| | |
|---|---|
| **Narração** | "Não existe almoço grátis. **Alguém sempre paga.**" |
| **Na tela** | Ícone do **prato** com "GRÁTIS" riscado em vermelho, sozinho no centro |
| **Movimento** | O risco se desenha em 6 quadros no tempo de "grátis". Respiro visual depois de duas cenas cheias de número |
| **Som** | A trilha corta para só o pulso grave durante a frase. Volta inteira na cena seguinte |

### R07 · Três caminhos · 0:35–0:44

| | |
|---|---|
| **Narração** | "A conta chega por **três caminhos**." / "**Mais impostos.**" / "Dólar alto no **pão**, no **diesel**, no **remédio**." / "E **juros altos** por mais tempo." |
| **Na tela** | Três **cartões** 1-2-3 e, a cada caminho, um **título** cheio de tela: **1 · mais impostos**, **2 · o real mais fraco** (com a grade 2×2 de pão, diesel, remédios e seta US$ subindo) e **3 · juros altos por mais tempo** |
| **Movimento** | Os cartões viram um a um (flip em Y, 8 quadros) e cada título entra com whip pan horizontal de 6 quadros. Na grade, cada ilustração entra no tempo da própria palavra |
| **Ritmo** | É o trecho mais rápido do corte: uma troca visual a cada 1,5–2 s |

### R08 · Quem paga primeiro · 0:44–0:48

| | |
|---|---|
| **Narração** | "E quem sente primeiro é quem tem **menos renda** e **nenhuma reserva**." |
| **Na tela** | Ilustração da **família** com holofote, sozinha |
| **Movimento** | O holofote fecha devagar (vinheta de 100% para 60% do quadro). É o único momento lento do vídeo, de propósito |
| **Som** | A trilha cai cerca de 4 dB. Sem SFX |

### R09 · Fechamento · 0:48–0:50

| | |
|---|---|
| **Narração** | "A eleição terminou. **A conta, não.**" |
| **Na tela** | A mesma **fatura** do gancho, agora com "Pagador: o contribuinte" e total "EM ABERTO". O carimbo bate de novo |
| **Por quê** | Fecha o arco com o mesmo quadro da abertura e reforça a frase-título, que é a que fica na memória. Como o último plano narrativo repete o primeiro, o replay automático do Reels emenda bem |

### R10 · CTA · 0:50–0:55

| | |
|---|---|
| **Narração** | "**Siga** para acompanhar para onde vai o dinheiro público." |
| **Na tela** | Fundo amarelo, assinatura **@seuperfil** grande e dois botões: **SEGUIR** e **SALVAR**. Linha de apoio: "Documentário completo no perfil" |
| **Movimento** | Os botões entram com escala 0 → 1,08 → 1 (spring, 10 quadros). O SEGUIR pulsa uma vez no fim da fala. 1,5 s parado depois da narração para dar tempo de agir |
| **Som** | Resolução da trilha no último acorde, fade de 1 s |

---

## Legendas animadas

Legenda queimada, palavra a palavra (estilo karaokê), feita do mesmo texto das falas. O que está em **negrito** acima é o `destaque` de cada fala e aparece em amarelo (ou vermelho sobre o fundo amarelo do CTA). As especificações estão no [guia](README.md#legendas-animadas).

## Ordem de corte se passar de 60 s

Se a narração real passar de 60 s, corte nesta ordem até caber, sem mexer no gancho, no fechamento e no CTA:

1. R03, segunda fala ("A pior reação…"). O recorte continua na tela e passa a mensagem sozinho. Economiza ~3,5 s.
2. R04, segunda fala ("Sobram 8,3%…"). Os pontos amarelos ficam como texto na tela. Economiza ~3 s.
3. R06 inteira. Economiza ~2,5 s.

## Texto para o post

> A eleição terminou. A conta, não. Em 2027, 91,7% das despesas primárias do Orçamento já são obrigatórias. Quem paga essa conta? Documentário completo no perfil.
>
> Fontes: TSE, PLOA 2027, IFI/Senado e imprensa (dados de 27/10/2026).

Capa sugerida: o quadro do carimbo **EM ABERTO** no gancho (~1,4 s), que é legível em miniatura.
