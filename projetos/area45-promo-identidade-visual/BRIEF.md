# Area45 · Promoção de identidade visual (nov/2026)

Roteiro completo (Reels, carrossel e estático): https://claude.ai/artifact/VagRDVhmANqXCU87qaCBoD

Campanha: Meta Ads, objetivo Mensagens → WhatsApp, R$300 em 10 dias. Ideia central: "Seu negócio é bom, mas a marca não mostra isso", provado com antes e depois.

## Reels (`reels-antes-depois.json`)

```bash
node engine/render.mjs projetos/area45-promo-identidade-visual/reels-antes-depois.json --format 9x16
node engine/render.mjs projetos/area45-promo-identidade-visual/reels-antes-depois.json --format 4x5
```

Saída: `area45-promo-id_reels-antes-depois_9x16.mp4` e `_4x5.mp4`.

Antes de renderizar:
- Trocar `[PRECO]` (campo `value`, hoje 0), `[ITEM n]`, `[N] vagas`, ramos dos clientes.
- Se o preço não for em "mil", manter `unit` com texto curto (ex.: "à vista" ou "em 3x").
- Colocar em `palette` as cores da Area45 (verde do logo usado na proposta) no lugar do dourado padrão.

## Fotos em `assets/` (fora do git)

| arquivo | conteúdo |
|---|---|
| antes-01.jpg, antes-02.jpg | marca antiga de 2 clientes aplicada (fachada, post ou cartão) |
| depois-01.jpg, depois-02.jpg | mesma aplicação com a marca nova feita pela Area45 |
| mockup-cartao.jpg | cartão de visita com marca aplicada |
| mockup-instagram.jpg | perfil de Instagram padronizado |
| mockup-fachada.jpg | fachada ou placa com marca aplicada |

Sem antes e depois reais: trocar as cenas 2 a 5 por 4 mockups com legenda "Feito pela Area45" e o título do gancho por "Sua marca pode ficar <em>assim</em>".

## Carrossel (5 cards 4:5) e estático (4:5 e 9:16)

Peças de design estático; textos e layout de cada card estão no roteiro (link acima).
