#!/usr/bin/env node
// Area45 · montador de documentário 16:9.
// Lê script/roteiro.json de um projeto documental e gera final/<nome>_16x9.mp4 (H.264 + AAC) e final/<nome>.srt via ffmpeg.
// Uso: node engine/documentario.mjs <projeto>/script/roteiro.json [--rascunho] [--legendas] [--out arquivo.mp4] [--manter-temp]
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname, join, basename, isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
if (!args[0] || args[0].startsWith('--')) {
  console.error('Uso: node engine/documentario.mjs <projeto>/script/roteiro.json [--rascunho] [--legendas] [--out arquivo.mp4] [--manter-temp]');
  process.exit(1);
}
const flag = k => args.includes('--' + k);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

const roteiroPath = resolve(args[0]);
const R = JSON.parse(readFileSync(roteiroPath, 'utf8'));
// Caminhos do roteiro são relativos à raiz do projeto (a pasta que contém script/).
const raiz = basename(dirname(roteiroPath)) === 'script' ? dirname(dirname(roteiroPath)) : dirname(roteiroPath);
const caminho = p => (isAbsolute(p) ? p : join(raiz, p));
const existe = p => p && existsSync(caminho(p));

const E = { fps: 30, fonte: 'Inter', fonte_titulo: null, cor: null, vinheta: false, fade_inicial: 1, fade_final: 1.5, legenda_max_chars: 42, ...R.estilo };
const rascunho = flag('rascunho');
const W = rascunho ? 960 : 1920, H = rascunho ? 540 : 1080, S = W / 1920; // S escala tamanhos de texto e margens
const FPS = E.fps;
const nome = R.nome || basename(raiz);
const out = resolve(opt('out', join(raiz, 'final', `${nome}_16x9${rascunho ? '_rascunho' : ''}.mp4`)));
const tmp = join(dirname(out), '.tmp');
mkdirSync(tmp, { recursive: true });

const avisos = [];
const run = (a, desc) => {
  try { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] }); }
  catch { console.error(`\nFalhou: ${desc}\nffmpeg ${a.join(' ')}`); process.exit(1); }
};
const duracao = p => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).toString().trim());
const ehVideo = p => /\.(mp4|mov|m4v|webm|mkv)$/i.test(p);

// Fonte: caminho de arquivo (.ttf/.otf) ou nome de família instalada.
const fontes = {};
const fonteOpt = f => {
  f = f || 'Inter';
  if (fontes[f]) return fontes[f];
  const p = isAbsolute(f) ? f : join(raiz, f);
  if (/\.(ttf|otf|ttc)$/i.test(f)) {
    if (existsSync(p)) return (fontes[f] = `fontfile='${p}'`);
    avisos.push(`fonte "${f}" não encontrada`);
  }
  // Nome de família ("Inter", "Inter:style=Bold"): resolve o arquivo pelo fontconfig para respeitar o peso.
  try { const arq = execFileSync('fc-match', ['-f', '%{file}', f]).toString().trim(); if (arq && existsSync(arq)) return (fontes[f] = `fontfile='${arq}'`); } catch {}
  return (fontes[f] = `font='${f.replace(/:/g, '\\:')}'`);
};

// Transições (português → xfade do ffmpeg). Qualquer nome nativo do xfade também é aceito.
const TRANS = { corte: 'fade', fusao: 'fade', preto: 'fadeblack', branco: 'fadewhite', dissolver: 'dissolve', 'deslizar-esq': 'slideleft', 'deslizar-dir': 'slideright', 'cortina-esq': 'wipeleft', 'cortina-dir': 'wiperight', circulo: 'circleopen', desfoque: 'hblur', zoom: 'zoomin', 'suave-esq': 'smoothleft', 'suave-dir': 'smoothright' };
const transicao = t => {
  if (!t || t === 'corte' || t.tipo === 'corte') return { tipo: 'fade', d: 1 / FPS };
  const tipo = typeof t === 'string' ? t : t.tipo;
  return { tipo: TRANS[tipo] || tipo, d: Math.max(1 / FPS, (typeof t === 'object' && t.duracao) || 0.8) };
};

// Estilos de texto na tela (drawtext). Quebre linhas com \n no roteiro: o drawtext não quebra sozinho.
const ESTILOS = {
  titulo:  { size: 96, x: '(w-text_w)/2', y: '(h-text_h)/2', titulo: true, sombra: true },
  capitulo:{ size: 30, x: '(w-text_w)/2', y: '(h-text_h)/2-90*S', espaco: 6, sombra: true },
  terco:   { size: 46, x: '120*S', y: 'h-340*S', box: true, titulo: true },
  'terco-sub': { size: 32, x: '120*S', y: 'h-270*S', box: true, cor: '0xDDDDDD' },
  citacao: { size: 58, x: '(w-text_w)/2', y: '(h-text_h)/2', sombra: true, espaco: 14 },
  data:    { size: 34, x: '120*S', y: '100*S', sombra: true, cor: '0xF2C14E' },
  dado:    { size: 140, x: '(w-text_w)/2', y: '(h-text_h)/2-40*S', titulo: true, sombra: true, cor: '0xF2C14E' },
  apoio:   { size: 40, x: '(w-text_w)/2', y: 'h/2+90*S', box: true },
  creditos:{ size: 40, x: '(w-text_w)/2', y: '(h-text_h)/2', espaco: 18 }
};
const drawtext = (t, i, j, dur) => {
  const st = { ...ESTILOS[t.estilo || 'apoio'], ...(t.cor ? { cor: t.cor } : {}) };
  if (!ESTILOS[t.estilo || 'apoio']) avisos.push(`cena ${i + 1}: estilo de texto "${t.estilo}" não existe, usando "apoio"`);
  const arq = join(tmp, `texto_${i}_${j}.txt`);
  writeFileSync(arq, t.texto);
  const a = t.de ?? 0.3, b = t.ate ?? dur - 0.2, f = Math.min(0.5, (b - a) / 3);
  const alpha = `if(lt(t,${a}),0,if(lt(t,${a + f}),(t-${a})/${f},if(lt(t,${b - f}),1,if(lt(t,${b}),(${b}-t)/${f},0))))`;
  const exprS = e => e.replace(/\bS\b/g, String(S));
  return [
    'drawtext=' + fonteOpt(st.titulo ? E.fonte_titulo || `${E.fonte}:style=Bold` : E.fonte),
    `textfile='${arq}'`, `fontsize=${Math.round((t.tamanho || st.size) * S)}`, `fontcolor=${st.cor || '0xFFFFFF'}`,
    `x='${exprS(t.x ?? st.x)}'`, `y='${exprS(t.y ?? st.y)}'`, `line_spacing=${Math.round((st.espaco || 8) * S)}`,
    st.box ? `box=1:boxcolor=black@0.55:boxborderw=${Math.round(18 * S)}` : '',
    st.sombra ? `shadowcolor=black@0.6:shadowx=${Math.round(3 * S)}:shadowy=${Math.round(3 * S)}` : '',
    `alpha='${alpha}'`
  ].filter(Boolean).join(':');
};

// Movimento de câmera em imagens (Ken Burns). intensidade padrão 0.08 = 8% de zoom ao longo da cena.
const movimento = (m, n) => {
  const tipo = typeof m === 'string' ? m : m?.tipo || 'zoom-in';
  const k = (typeof m === 'object' && m.intensidade) || 0.08;
  const z = { 'zoom-in': `1+${k}*on/${n}`, 'zoom-out': `${1 + k}-${k}*on/${n}`, estatico: '1' }[tipo] || `${1 + k}`;
  const cx = 'iw/2-(iw/zoom/2)', cy = 'ih/2-(ih/zoom/2)';
  const x = { 'pan-esq': `(iw-iw/zoom)*(1-on/${n})`, 'pan-dir': `(iw-iw/zoom)*on/${n}` }[tipo] || cx;
  const y = { 'pan-cima': `(ih-ih/zoom)*(1-on/${n})`, 'pan-baixo': `(ih-ih/zoom)*on/${n}` }[tipo] || cy;
  return `zoompan=z='${z}':x='${x}':y='${y}':d=${n}:s=${W}x${H}:fps=${FPS}`;
};

// 1) Duração de cada cena: "dur" explícita, ou narração + respiro, ou 5 s.
const cenas = R.cenas.map((c, i) => {
  const narr = c.narracao || {};
  const audio = existe(narr.audio) ? caminho(narr.audio) : null;
  if (narr.audio && !audio) avisos.push(`cena ${i + 1}: narração "${narr.audio}" não encontrada (cena fica sem voz)`);
  const dAudio = audio ? duracao(audio) : 0;
  const dur = c.dur ?? (audio ? (narr.inicio ?? 0.4) + dAudio + (c.respiro ?? 0.8) : 5);
  if (audio && c.dur && (narr.inicio ?? 0.4) + dAudio > c.dur) avisos.push(`cena ${i + 1}: narração (${dAudio.toFixed(1)} s) passa da duração da cena (${c.dur} s)`);
  return { ...c, i, dur, audio, dAudio, trans: i ? transicao(c.transicao) : null };
});
// Início de cada cena na linha do tempo final (o xfade sobrepõe a transição).
let t0 = 0;
cenas.forEach((c, i) => { if (i) t0 += cenas[i - 1].dur - c.trans.d; c.inicio = t0; });
const total = cenas.at(-1).inicio + cenas.at(-1).dur;
cenas.forEach((c, i) => { if (i && c.trans.d >= Math.min(c.dur, cenas[i - 1].dur)) { console.error(`cena ${i + 1}: transição maior que a cena`); process.exit(1); } });

// 2) Renderiza cada cena como um segmento independente (mesmo formato, para o xfade).
const grade = [E.cor, E.vinheta ? 'vignette=PI/5' : ''].filter(Boolean);
cenas.forEach((c, i) => {
  const seg = join(tmp, `cena_${String(i + 1).padStart(2, '0')}.mp4`);
  const n = Math.round(c.dur * FPS);
  const vis = c.visual || {};
  const textos = (c.textos || []).map((t, j) => drawtext(t, i, j, c.dur));
  const cover = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
  const fim = [...grade, ...(c.cor ? [c.cor] : []), ...textos, `fps=${FPS}`, 'format=yuv420p', 'setsar=1'];
  let input, vf;
  if (!existe(vis.arquivo)) {
    avisos.push(`cena ${i + 1}: visual ${vis.arquivo ? `"${vis.arquivo}" não encontrado` : 'não definido'} (usando cartela provisória)`);
    writeFileSync(join(tmp, `prov_${i}.txt`), `CENA ${i + 1}${c.titulo ? ' · ' + c.titulo : ''}\n${vis.descricao || vis.arquivo || 'sem visual'}`.slice(0, 160));
    input = ['-f', 'lavfi', '-i', `color=c=0x1b1d22:s=${W}x${H}:r=${FPS}:d=${c.dur}`];
    vf = [`drawtext=${fonteOpt(E.fonte)}:textfile='${join(tmp, `prov_${i}.txt`)}':fontsize=${Math.round(34 * S)}:fontcolor=0x777777:x=(w-text_w)/2:y=h*0.18:line_spacing=${Math.round(12 * S)}`, ...fim];
  } else if (ehVideo(vis.arquivo)) {
    const p = caminho(vis.arquivo);
    const dClip = duracao(p) - (vis.inicio || 0);
    if (dClip < c.dur) avisos.push(`cena ${i + 1}: clipe tem ${dClip.toFixed(1)} s, menor que a cena (${c.dur.toFixed(1)} s); último quadro congelado`);
    input = ['-ss', String(vis.inicio || 0), '-i', p];
    vf = [cover, ...(vis.velocidade ? [`setpts=PTS/${vis.velocidade}`] : []), `tpad=stop_mode=clone:stop_duration=${c.dur}`, ...fim];
  } else {
    input = ['-loop', '1', '-framerate', String(FPS), '-i', caminho(vis.arquivo)];
    vf = [cover, `scale=${W * 2}:${H * 2}`, movimento(vis.movimento, n), ...fim];
  }
  run([...input, '-t', c.dur.toFixed(3), '-vf', vf.join(','), '-an', '-c:v', 'libx264', '-preset', rascunho ? 'ultrafast' : 'medium', '-crf', rascunho ? '28' : '16', '-r', String(FPS), seg], `cena ${i + 1}`);
  c.seg = seg;
  process.stdout.write(`cena ${i + 1}/${cenas.length} ok (${c.dur.toFixed(1)} s)\n`);
});

// 3) Encadeia as cenas com as transições.
const vIn = cenas.flatMap(c => ['-i', c.seg]);
const vf = cenas.map((c, i) => `[${i}:v]settb=AVTB,fps=${FPS}[s${i}]`);
let prev = 's0';
cenas.slice(1).forEach((c, k) => {
  const i = k + 1, lab = i === cenas.length - 1 ? 'vx' : `x${i}`;
  vf.push(`[${prev}][s${i}]xfade=transition=${c.trans.tipo}:duration=${c.trans.d.toFixed(3)}:offset=${c.inicio.toFixed(3)}[${lab}]`);
  prev = lab;
});
if (cenas.length === 1) vf.push('[s0]null[vx]');
const fadeFim = Math.max(0, total - E.fade_final);
const legendas = flag('legendas');
const srt = join(dirname(out), `${basename(out, '.mp4')}.srt`);
vf.push(`[vx]fade=t=in:d=${E.fade_inicial},fade=t=out:st=${fadeFim.toFixed(3)}:d=${E.fade_final}${legendas ? `,subtitles='${srt}':force_style='FontName=${E.fonte},FontSize=16,Outline=1,Shadow=0,MarginV=22'` : ''}[v]`);

// 4) Legendas (SRT) a partir do texto da narração, distribuídas pelo tempo da fala.
const ts = s => { const ms = Math.round(s * 1000); const p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
// Agrupa a fala em blocos de até 2 linhas, quebrando cada bloco em duas linhas equilibradas.
const blocos = texto => {
  const max = E.legenda_max_chars, out = [];
  let atual = [];
  for (const w of texto.replace(/\s+/g, ' ').trim().split(' ')) {
    const cand = [...atual, w].join(' ');
    const fimFrase = /[.!?]$/.test(atual.at(-1) || '');
    if (atual.length && (cand.length > max * 2 || (fimFrase && atual.join(' ').length > max * 0.6))) { out.push(atual); atual = []; }
    atual.push(w);
  }
  if (atual.length) out.push(atual);
  return out.map(ws => {
    const txt = ws.join(' ');
    if (txt.length <= max) return txt;
    let melhor = 1, dif = Infinity;
    for (let k = 1; k < ws.length; k++) { const d = Math.abs(ws.slice(0, k).join(' ').length - ws.slice(k).join(' ').length); if (d < dif) { dif = d; melhor = k; } }
    return ws.slice(0, melhor).join(' ') + '\n' + ws.slice(melhor).join(' ');
  });
};
let nSrt = 0, srtTxt = '';
for (const c of cenas) {
  const texto = c.narracao?.texto; if (!texto) continue;
  const ini = c.inicio + (c.narracao.inicio ?? 0.4);
  const dur = c.dAudio || Math.max(1, c.dur - (c.narracao.inicio ?? 0.4) - 0.5);
  const bs = blocos(texto), chars = bs.reduce((s, b) => s + b.length, 0);
  let t = ini;
  for (const b of bs) { const d = dur * b.length / chars; srtTxt += `${++nSrt}\n${ts(t)} --> ${ts(t + d)}\n${b}\n\n`; t += d; }
}
writeFileSync(srt, srtTxt);

// 5) Áudio: narração por cena + trilha com ducking + efeitos sonoros, normalizado em -14 LUFS (YouTube).
const aIn = [], aF = [], vozes = [], extras = [];
let idx = cenas.length;
for (const c of cenas) {
  if (c.audio) {
    aIn.push('-i', c.audio);
    const ms = Math.round((c.inicio + (c.narracao.inicio ?? 0.4)) * 1000);
    aF.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${c.narracao.volume ?? 1},adelay=${ms}|${ms}[n${idx}]`);
    vozes.push(`[n${idx}]`); idx++;
  }
  for (const s of c.sfx || []) {
    if (!existe(s.arquivo)) { avisos.push(`cena ${c.i + 1}: efeito "${s.arquivo}" não encontrado`); continue; }
    aIn.push('-i', caminho(s.arquivo));
    const ms = Math.round((c.inicio + (s.em || 0)) * 1000);
    aF.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${s.volume ?? 0.8},adelay=${ms}|${ms}[e${idx}]`);
    extras.push(`[e${idx}]`); idx++;
  }
}
const tr = R.trilha || {};
const temTrilha = existe(tr.arquivo);
if (tr.arquivo && !temTrilha) avisos.push(`trilha "${tr.arquivo}" não encontrada (vídeo sem música)`);
aF.push(`anullsrc=r=48000:cl=stereo,atrim=0:${total.toFixed(3)}[base]`);
if (vozes.length) aF.push(`${vozes.join('')}amix=inputs=${vozes.length}:normalize=0,apad,atrim=0:${total.toFixed(3)},asplit=2[voz][voz_sc]`);
const mix = ['[base]'];
if (vozes.length) mix.push('[voz]');
if (temTrilha) {
  aIn.push('-stream_loop', '-1', '-i', caminho(tr.arquivo));
  const ini = tr.inicio_no_arquivo || 0, fadeOut = tr.fade_final ?? 3;
  aF.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=${ini}:${(ini + total).toFixed(3)},asetpts=PTS-STARTPTS,volume=${tr.volume ?? 0.35},afade=t=in:d=${tr.fade_inicial ?? 2},afade=t=out:st=${Math.max(0, total - fadeOut).toFixed(3)}:d=${fadeOut}[mus]`);
  if (vozes.length && tr.ducking !== false) {
    // Abaixa a trilha enquanto há narração. "ducking" de 0 a 1 = quanto abaixar (padrão 0.6).
    const ratio = Math.round(2 + (tr.ducking ?? 0.6) * 18);
    aF.push(`[mus][voz_sc]sidechaincompress=threshold=0.02:ratio=${ratio}:attack=80:release=600[musd]`);
    mix.push('[musd]');
  } else mix.push('[mus]');
  idx++;
} else if (vozes.length) aF.push('[voz_sc]anullsink');
mix.push(...extras);
aF.push(`${mix.join('')}amix=inputs=${mix.length}:normalize=0,atrim=0:${total.toFixed(3)},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`);

run([...vIn, ...aIn, '-filter_complex', [...vf, ...aF].join(';'), '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', rascunho ? 'ultrafast' : 'slow', '-crf', rascunho ? '26' : '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', total.toFixed(3), out], 'montagem final');

if (!flag('manter-temp')) rmSync(tmp, { recursive: true, force: true });
const mm = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
console.log(`\n✔ ${out}\n  ${W}x${H} · ${FPS} fps · ${mm(total)} · ${cenas.length} cenas\n✔ ${srt}`);
if (avisos.length) console.log('\nAvisos:\n- ' + avisos.join('\n- '));
