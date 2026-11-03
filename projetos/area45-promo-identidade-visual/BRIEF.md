# Area45 · Promoção de identidade visual (nov/2026)

Roteiro completo (Reels, carrossel e estático): https://claude.ai/artifact/VagRDVhmANqXCU87qaCBoD

Oferta: identidade visual por **R$499 à vista ou parcelado no cartão**. Inclui logo, manual de identidade visual, paleta de cores, tipografia, destaques para o Instagram e arte do cartão de visitas (sem impressão). Entrega em até 7 dias úteis após o pagamento. Válido só em novembro, poucas vagas.

Campanha: Meta Ads, objetivo Mensagens → WhatsApp, R$300 em 10 dias.

## Reels (`reels-mockups.json`, ~22 s)

Versão só com mockups de uma marca fictícia ("Aurora Café"), uma cena por item entregue.

```bash
# 1. gerar os mockups em assets/ (HTML → JPG 1080x1920)
cd projetos/area45-promo-identidade-visual/mockups && python3 build.py && node render-mockups.mjs && cd -
# 2. renderizar
node engine/render.mjs projetos/area45-promo-identidade-visual/reels-mockups.json --format 9x16
node engine/render.mjs projetos/area45-promo-identidade-visual/reels-mockups.json --format 4x5
```

Para trocar a marca de exemplo, editar `mockups/mockups.html` (cores em `:root`) e `mockups/build.py` (paleta, destaques).

## Carrossel (5 cards 4:5) e estático (4:5 e 9:16)

Peças de design estático; textos e layout no roteiro. Os mockups de `assets/` podem ser reaproveitados nelas.
