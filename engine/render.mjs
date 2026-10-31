#!/usr/bin/env node
// Area45 Motion renderer: spec JSON -> MP4 (H.264, 30fps) via headless Chromium + ffmpeg.
// Usage: node engine/render.mjs <spec.json> [--format 9x16|4x5|1x1] [--out file.mp4] [--assets dir] [--preview]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const specPath = resolve(args[0]);
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const FORMATS = { '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080] };
const fmt = opt('format', spec.format || '9x16');
[spec.width, spec.height] = FORMATS[fmt];
const fps = spec.fps || 30;
const assets = resolve(opt('assets', spec.assets ? resolve(dirname(specPath), spec.assets) : dirname(specPath)));
const out = resolve(opt('out', join(dirname(specPath), 'out', `${basename(specPath, '.json')}_${fmt}.mp4`)));
mkdirSync(dirname(out), { recursive: true });

for (const s of spec.scenes) if (s.img) {
  const p = resolve(assets, s.img);
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p]).toString().trim().split(',').map(Number);
  s.aspect = w / h; s.img = pathToFileURL(p).href;
}

const html = readFileSync(join(here, 'template.html'), 'utf8').replace('__SPEC__', () => JSON.stringify(spec));
const tmp = join(dirname(out), `.${basename(out, '.mp4')}.html`);
writeFileSync(tmp, html);

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: spec.width, height: spec.height } });
await page.goto(pathToFileURL(tmp).href);
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll('[style*="url("]')].map(e => new Promise(r => { const u = getComputedStyle(e).backgroundImage.match(/url\("(.*)"\)/); if (!u) return r(); const i = new Image(); i.onload = i.onerror = r; i.src = u[1]; }))); });
const dur = await page.evaluate(() => window.DURATION);

if (args.includes('--preview')) { // contact sheet of key frames for review
  const times = (opt('times', '') || '').split(',').filter(Boolean).map(Number);
  for (const t of times) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: out.replace('.mp4', `_t${t}.jpg`), type: 'jpeg', quality: 80 }); }
  await browser.close(); process.exit(0);
}

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-f', 'lavfi', '-t', String(dur), '-i', 'anullsrc=r=48000:cl=stereo',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round(dur * fps);
for (let f = 0; f < n; f++) {
  await page.evaluate(t => window.seek(t), f / fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log(`ok ${out} (${dur.toFixed(1)}s, ${n} frames)`);
