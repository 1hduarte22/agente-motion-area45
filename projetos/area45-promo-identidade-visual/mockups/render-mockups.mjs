import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(pathToFileURL(resolve('mockups.built.html')).href, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
for (const id of ['hero','logo','manual','paleta','tipografia','destaques','cartao']) await (await p.$('#'+id)).screenshot({ path: `../assets/${id}.jpg`, type: 'jpeg', quality: 92 });
await b.close(); console.log('ok');
