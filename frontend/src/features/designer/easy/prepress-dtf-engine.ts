// @ts-nocheck
/* ==========================================================================
   PrintShop Preprensa DTF — Motor del Diseñador Modo Fácil Integrado
   Fuente de verdad: frontend/public/Preprensa_DTF.html
   ========================================================================== */

export interface PrepressDtfEngineOptions {
  onNavigateAdvanced: () => void;
}

export function initPrepressDtfEngine(root: HTMLElement, options: PrepressDtfEngineOptions): () => void {
  let isMounted = true;
  const cleanups: Array<() => void> = [];

  // Scoped DOM selector utilities
  const $ = (s: string, r: Element | Document = root) => (r === document || !r ? root : r).querySelector(s);
  const $$ = (s: string, r: Element | Document = root) => Array.from((r === document || !r ? root : r).querySelectorAll(s));

/* ============ Utilidades ============ */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sleep = () => new Promise(r => setTimeout(r, 0));
const nextFrame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
const UF = { cm: 2.54, mm: 25.4, in: 1 };
const pxFrom = (v, u, dpi) => u === 'px' ? v : v / UF[u] * dpi;
const toUnit = (px, u, dpi) => u === 'px' ? px : px / dpi * UF[u];
const fmt = (n, d = 2) => (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toString();
const hex2 = n => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
const toHex = (r, g, b) => '#' + hex2(r) + hex2(g) + hex2(b);
const hexToRgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h); const n = parseInt(m ? m[1] : '000000', 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function cloneCanvas(c) { const n = mk(c.width, c.height); n.getContext('2d').drawImage(c, 0, 0); return n; }
const ctx2 = c => c.getContext('2d', { willReadFrequently: false });
function imgData(c) { return c.getContext('2d').getImageData(0, 0, c.width, c.height); }
function canvasFromData(d, w, h) { const c = mk(w, h); c.getContext('2d').putImageData(new ImageData(d, w, h), 0, 0); return c; }

let toastT = 0;
function toast(msg, ms = 3200) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms); }
function setBusy(txt, pct) { $('#busy').hidden = false; $('#busyTxt').textContent = txt || 'Procesando…'; $('#busyBar').style.width = (pct == null ? 0 : clamp(pct, 0, 1) * 100) + '%'; }
function endBusy() { $('#busy').hidden = true; }
async function runOp(label, fn) {
  setBusy(label, 0); await nextFrame();
  try { return await fn((p, t) => { setBusy(t || label, p); }); }
  catch (e) { console.error(e); toast('No se pudo completar: ' + (e && e.message ? e.message : e), 5000); }
  finally { endBusy(); }
}

/* ============ Estado ============ */
let uid = 1;
const S = {
  doc: { w: 3543, h: 4724, dpi: 300, unit: 'cm', preview: 'checker', grid: false, gridStep: 5, marginOn: false, margin: 5 },
  layers: [], sel: null, tool: 'move',
  view: { z: 0.1, x: 0, y: 0 },
  hist: [], redo: [],
  rb: { mode: 'auto' }, er: { mode: 'wand' }, vk: { mode: 'color' }, ml: { mode: 'color' }, ht: { mode: 'ink' }, en: { f: 2 },
  vec: null, space: false,
};
let DL = null; // capacidad de descargas
(async () => { try { DL = (await (window.claude && window.claude.use && window.claude.use('downloads'))) || null; } catch (e) { DL = null; } if (!DL) DL = { save: async ({ filename, data }) => { const b = data instanceof Blob ? data : new Blob([data], { type: 'image/svg+xml' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); } }; })();

const cur = () => S.layers.find(l => l.id === S.sel) || null;
const effDpi = L => S.doc.dpi / Math.abs(L.sx);
const layerPxW = L => L.canvas.width * Math.abs(L.sx);
const layerPxH = L => L.canvas.height * Math.abs(L.sy);

/* ============ Historial ============ */
function snap() { return { doc: { ...S.doc }, layers: S.layers.map(l => ({ ...l })), sel: S.sel }; }
function restore(s) { S.doc = { ...s.doc }; S.layers = s.layers.map(l => ({ ...l })); S.sel = S.layers.some(l => l.id === s.sel) ? s.sel : (S.layers.length ? S.layers[S.layers.length - 1].id : null); }
function pushHist() { S.hist.push(snap()); if (S.hist.length > 40) S.hist.shift(); const px = () => { const u = new Set(); for (const h of S.hist) for (const l of h.layers) u.add(l.canvas); let t = 0; u.forEach(c => { t += c.width * c.height; }); return t; }; while (S.hist.length > 3 && px() > 3e8) S.hist.shift(); S.redo = []; syncUndo(); }
function undo() { if (!S.hist.length) return; S.redo.push(snap()); restore(S.hist.pop()); afterStructure(); syncUndo(); }
function redo() { if (!S.redo.length) return; S.hist.push(snap()); restore(S.redo.pop()); afterStructure(); syncUndo(); }
function syncUndo() { $('#btnUndo').disabled = !S.hist.length; $('#btnRedo').disabled = !S.redo.length; }

/* ============ Tema ============ */
const theme = {};
function refreshTheme() {
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['accent', 'chk-a', 'chk-b', 'fg', 'panel', 'muted', 'stage', 'shadow']) theme[k] = cs.getPropertyValue('--' + k).trim();
  patCache = null; redraw();
}
let patCache = null;
function checkerPattern(g, dpr) {
  if (patCache && patCache.dpr === dpr) return patCache.p;
  const s = Math.round(8 * dpr), c = mk(s * 2, s * 2), x = c.getContext('2d');
  x.fillStyle = theme['chk-a']; x.fillRect(0, 0, s * 2, s * 2);
  x.fillStyle = theme['chk-b']; x.fillRect(0, 0, s, s); x.fillRect(s, s, s, s);
  patCache = { dpr, p: g.createPattern(c, 'repeat') }; return patCache.p;
}

/* ============ Dibujo ============ */
const view = $('#view'), vctx = view.getContext('2d');
let raf = 0, hud = null, handles = null;
function redraw() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; draw(); }); }
function drawLayer(g, L, scrZ) {
  g.save();
  g.globalAlpha = L.opacity;
  g.translate(L.x, L.y); g.rotate(L.rot * Math.PI / 180); g.scale(L.sx, L.sy);
  g.imageSmoothingEnabled = !(scrZ && Math.abs(L.sx) * scrZ >= 3);
  g.imageSmoothingQuality = 'high';
  const P = scrZ && HT.prev && HT.prev.id === L.id ? HT.prev : null;
  if (P) g.drawImage(P.canvas, -L.canvas.width / 2, -L.canvas.height / 2, L.canvas.width, L.canvas.height); else g.drawImage(L.canvas, -L.canvas.width / 2, -L.canvas.height / 2);
  g.restore();
}
function layerCorners(L) {
  const hw = L.canvas.width * L.sx / 2, hh = L.canvas.height * L.sy / 2, a = L.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => [L.x + u * c - v * s, L.y + u * s + v * c]);
}
const d2s = (x, y) => [S.view.x + x * S.view.z, S.view.y + y * S.view.z];
const s2d = (x, y) => [(x - S.view.x) / S.view.z, (y - S.view.y) / S.view.z];

function draw() {
  const dpr = window.devicePixelRatio || 1, D = S.doc, { z, x, y } = S.view;
  const g = vctx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, view.width, view.height);
  const rx = x * dpr, ry = y * dpr, rw = D.w * z * dpr, rh = D.h * z * dpr;
  g.save(); g.shadowColor = theme.shadow || 'rgba(0,0,0,.3)'; g.shadowBlur = 18 * dpr; g.shadowOffsetY = 4 * dpr; g.fillStyle = theme['chk-a'] || '#fff'; g.fillRect(rx, ry, rw, rh); g.restore();
  g.save(); g.beginPath(); g.rect(rx, ry, rw, rh); g.clip();
  const pv = (S.tool === 'halftone' || S.tool === 'alpha') ? HT.gar : D.preview;
  if (pv === 'checker') { g.save(); g.translate(rx, ry); g.fillStyle = checkerPattern(g, dpr); g.fillRect(0, 0, rw, rh); g.restore(); }
  else { g.fillStyle = pv; g.fillRect(rx, ry, rw, rh); }
  if (D.bg && S.tool !== 'halftone' && S.tool !== 'alpha') { g.fillStyle = D.bg; g.fillRect(rx, ry, rw, rh); }
  g.setTransform(z * dpr, 0, 0, z * dpr, x * dpr, y * dpr);
  for (const L of S.layers) if (L.visible) drawLayer(g, L, z * dpr);
  g.restore();
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // cuadrícula y margen
  if (D.grid) {
    const st = pxFrom(D.gridStep, D.unit, D.dpi) * z;
    if (st > 6) {
      g.strokeStyle = 'rgba(120,120,140,.35)'; g.lineWidth = 1; g.beginPath();
      for (let i = 1; i * st < D.w * z; i++) { const sx = Math.round(x + i * st) + .5; g.moveTo(sx, y); g.lineTo(sx, y + D.h * z); }
      for (let i = 1; i * st < D.h * z; i++) { const sy = Math.round(y + i * st) + .5; g.moveTo(x, sy); g.lineTo(x + D.w * z, sy); }
      g.stroke();
    }
  }
  if (D.marginOn) {
    const m = pxFrom(D.margin, 'mm', D.dpi) * z;
    g.setLineDash([5, 4]); g.strokeStyle = theme.accent; g.lineWidth = 1;
    g.strokeRect(x + m + .5, y + m + .5, D.w * z - 2 * m, D.h * z - 2 * m); g.setLineDash([]);
  }
  // selección
  handles = null;
  const L = cur();
  if (L && L.visible && !(S.tool === 'hand')) {
    const pts = layerCorners(L).map(([a, b]) => d2s(a, b));
    g.strokeStyle = theme.accent; g.lineWidth = 1.5;
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
    const top = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
    const cx = (pts[0][0] + pts[2][0]) / 2, cy = (pts[0][1] + pts[2][1]) / 2;
    let vx = top[0] - cx, vy = top[1] - cy; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
    const rot = [top[0] + vx * 26, top[1] + vy * 26];
    g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(rot[0], rot[1]); g.stroke();
    g.fillStyle = theme.panel; g.strokeStyle = theme.accent;
    pts.forEach(p => { g.beginPath(); g.rect(p[0] - 5, p[1] - 5, 10, 10); g.fill(); g.stroke(); });
    g.beginPath(); g.arc(rot[0], rot[1], 6, 0, Math.PI * 2); g.fill(); g.stroke();
    handles = { corners: pts, rot, center: [cx, cy] };
  }
  if (hud && ((S.tool === 'erase' && (S.er.mode === 'brush' || S.er.mode === 'restore')) || S.tool === 'clean')) {
    const r = (+(S.tool === 'clean' ? $('#clSize').value : $('#erSize').value) / 2) * z; g.strokeStyle = theme.fg; g.lineWidth = 1; g.beginPath(); g.arc(hud[0], hud[1], Math.max(2, r), 0, Math.PI * 2); g.stroke();
  }
  $('#zVal').textContent = Math.round(z * 100) + '%'; palSync(false);
}

function resizeView() {
  const st = $('#stage'), dpr = window.devicePixelRatio || 1;
  const w = Math.max(10, st.clientWidth), h = Math.max(10, st.clientHeight);
  if (view.width !== Math.round(w * dpr) || view.height !== Math.round(h * dpr)) { view.width = Math.round(w * dpr); view.height = Math.round(h * dpr); }
  redraw();
}
function fitView() {
  const st = $('#stage'), w = st.clientWidth, h = st.clientHeight, D = S.doc, pad = 36;
  const z = Math.max(0.005, Math.min((w - pad * 2) / D.w, (h - pad * 2) / D.h));
  S.view.z = z; S.view.x = (w - D.w * z) / 2; S.view.y = (h - D.h * z) / 2; redraw();
}
function zoomAt(f, cx, cy) {
  const st = $('#stage'); if (cx == null) { cx = st.clientWidth / 2; cy = st.clientHeight / 2; }
  const nz = clamp(S.view.z * f, 0.005, 40), k = nz / S.view.z;
  S.view.x = cx - (cx - S.view.x) * k; S.view.y = cy - (cy - S.view.y) * k; S.view.z = nz; redraw();
}

/* ============ Capas ============ */
function addLayer(canvas, name, o = {}) {
  const D = S.doc;
  let sc = o.scale != null ? o.scale : 1;
  if (o.scale == null && (canvas.width > D.w * 0.95 || canvas.height > D.h * 0.95)) sc = Math.min(D.w * 0.9 / canvas.width, D.h * 0.9 / canvas.height);
  const L = { id: uid++, name: name || ('Capa ' + uid), canvas, orig: o.orig || canvas, x: o.x != null ? o.x : D.w / 2, y: o.y != null ? o.y : D.h / 2, sx: sc, sy: sc, rot: 0, opacity: 1, visible: true };
  if (o.index != null) S.layers.splice(o.index, 0, L); else S.layers.push(L);
  S.sel = L.id; return L;
}
function replaceCanvas(L, nc, dimsChanged) {
  if (dimsChanged) { L.sx *= L.canvas.width / nc.width; L.sy *= L.canvas.height / nc.height; L.orig = nc; }
  L.canvas = nc;
}
/* aplica resultado de un proceso: sobre la capa o en una capa nueva */
function commitResult(L, nc, label, dimsChanged = false) {
  pushHist();
  if ($('#optNew').checked) {
    const N = { ...L, id: uid++, name: label || (L.name + ' copia'), canvas: nc, orig: nc };
    if (dimsChanged) { N.sx = L.sx * L.canvas.width / nc.width; N.sy = L.sy * L.canvas.height / nc.height; }
    L.visible = false; S.layers.splice(S.layers.indexOf(L) + 1, 0, N); S.sel = N.id;
  } else replaceCanvas(L, nc, dimsChanged);
  afterStructure();
}
function needLayer() { const L = cur(); if (!L) { toast('Selecciona o importa una capa primero.'); return null; } return L; }

const thumbCache = new WeakMap();
function renderLayers() {
  palSync(true);
  const list = $('#layerList'); list.textContent = '';
  const n = S.layers.length; $('#layerCount').textContent = n + (n === 1 ? ' capa' : ' capas');
  for (let i = n - 1; i >= 0; i--) {
    const L = S.layers[i];
    const row = document.createElement('div'); row.className = 'layer' + (L.visible ? '' : ' off'); row.setAttribute('role', 'option'); row.setAttribute('aria-selected', L.id === S.sel ? 'true' : 'false'); row.dataset.id = L.id;
    const eye = document.createElement('button'); eye.className = 'eye'; eye.title = L.visible ? 'Ocultar' : 'Mostrar'; eye.setAttribute('aria-label', eye.title);
    eye.innerHTML = '<svg><use href="#i-' + (L.visible ? 'eye' : 'eyeoff') + '"/></svg>';
    eye.onclick = e => { e.stopPropagation(); pushHist(); L.visible = !L.visible; renderLayers(); redraw(); };
    const th = mk(76, 76); { const t = th.getContext('2d'), s = Math.min(76 / L.canvas.width, 76 / L.canvas.height); t.imageSmoothingQuality = 'high'; t.drawImage(L.canvas, (76 - L.canvas.width * s) / 2, (76 - L.canvas.height * s) / 2, L.canvas.width * s, L.canvas.height * s); }
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = L.name;
    const sm = document.createElement('small'); sm.textContent = L.canvas.width + '×' + L.canvas.height + ' px · ' + Math.round(effDpi(L)) + ' dpi'; nm.appendChild(sm);
    const acts = document.createElement('div'); acts.className = 'acts';
    const mkb = (ic, t, fn, cls = '') => { const b = document.createElement('button'); b.className = 'btn ' + cls; b.title = t; b.setAttribute('aria-label', t); b.innerHTML = '<svg><use href="#i-' + ic + '"/></svg>'; b.onclick = e => { e.stopPropagation(); fn(); }; return b; };
    acts.append(
      mkb('up', 'Subir', () => moveLayer(L, 1)), mkb('down', 'Bajar', () => moveLayer(L, -1)),
      mkb('copy', 'Duplicar', () => { pushHist(); const N = { ...L, id: uid++, name: L.name + ' copia', canvas: cloneCanvas(L.canvas) }; N.orig = N.canvas; S.layers.splice(S.layers.indexOf(L) + 1, 0, N); S.sel = N.id; afterStructure(); }),
      mkb('trash', 'Eliminar', () => delLayer(L), 'danger'));
    row.append(eye, th, nm, acts);
    row.onclick = () => { S.sel = L.id; renderLayers(); syncProps(); redraw(); };
    list.appendChild(row);
  }
}
function moveLayer(L, dir) { const i = S.layers.indexOf(L), j = i + dir; if (j < 0 || j >= S.layers.length) return; pushHist(); S.layers.splice(i, 1); S.layers.splice(j, 0, L); afterStructure(); }
function delLayer(L) { pushHist(); const i = S.layers.indexOf(L); S.layers.splice(i, 1); if (S.sel === L.id) S.sel = S.layers.length ? S.layers[Math.min(i, S.layers.length - 1)].id : null; afterStructure(); }
function afterStructure() { renderLayers(); syncProps(); syncCanvasPanel(); syncStatus(); updateEmpty(); redraw(); }
function updateEmpty() { $('#empty').hidden = S.layers.length > 0; }

/* ============ Propiedades ============ */
function unitLabel() { return S.doc.unit; }
function syncProps() {
  const L = cur(), D = S.doc, u = D.unit;
  $$('.un').forEach(e => { e.textContent = u; });
  const ids = ['pName', 'pX', 'pY', 'pRot', 'pOp', 'pFlipH', 'pFlipV', 'pCenter', 'pRot0', 'scW', 'scH'];
  ids.forEach(i => { $('#' + i).disabled = !L; });
  const dpiTxt = $('#propDpi'), scDpi = $('#scDpi');
  if (!L) { dpiTxt.textContent = ''; scDpi.textContent = ''; $('#pName').value = ''; return; }
  const dec = u === 'px' ? 0 : 2;
  if (document.activeElement.id !== 'pName') $('#pName').value = L.name;
  setNum('pX', toUnit(L.x, u, D.dpi), dec); setNum('pY', toUnit(L.y, u, D.dpi), dec); setNum('pRot', L.rot, 1);
  $('#pOp').value = Math.round(L.opacity * 100); $('#pOpV').textContent = Math.round(L.opacity * 100);
  setNum('scW', toUnit(layerPxW(L), u, D.dpi), dec); setNum('scH', toUnit(layerPxH(L), u, D.dpi), dec);
  const e = effDpi(L), cls = e >= 250 ? 'ok' : e >= 150 ? 'warn' : 'bad';
  const html = '<span class="badge ' + cls + '"><i></i>' + Math.round(e) + ' dpi</span>';
  dpiTxt.innerHTML = html; scDpi.innerHTML = html;
  syncEnhanceEstimate();
}
function setNum(id, v, d) { const el = $('#' + id); if (document.activeElement === el) return; el.value = fmt(v, d); }
function bindProps() {
  const D = () => S.doc;
  $('#pName').oninput = e => { const L = cur(); if (L) { L.name = e.target.value; renderLayersLazy(); } };
  $('#pName').onchange = () => { pushHistMeta(); };
  const num = (id, fn) => { const el = $('#' + id); el.onchange = () => { const L = cur(); if (!L) return; const v = parseFloat(el.value); if (!isFinite(v)) { syncProps(); return; } pushHist(); fn(L, v); syncProps(); redraw(); }; };
  num('pX', (L, v) => { L.x = pxFrom(v, D().unit, D().dpi); });
  num('pY', (L, v) => { L.y = pxFrom(v, D().unit, D().dpi); });
  num('pRot', (L, v) => { L.rot = v; });
  $('#pOp').oninput = e => { const L = cur(); if (!L) return; L.opacity = e.target.value / 100; $('#pOpV').textContent = e.target.value; redraw(); };
  $('#pOp').onchange = () => { };
  $('#pOp').onpointerdown = () => { if (cur()) pushHist(); };
  $('#pFlipH').onclick = () => { const L = cur(); if (!L) return; pushHist(); L.sx *= -1; redraw(); };
  $('#pFlipV').onclick = () => { const L = cur(); if (!L) return; pushHist(); L.sy *= -1; redraw(); };
  $('#pCenter').onclick = () => { const L = cur(); if (!L) return; pushHist(); L.x = D().w / 2; L.y = D().h / 2; syncProps(); redraw(); };
  $('#pRot0').onclick = () => { const L = cur(); if (!L) return; pushHist(); L.rot = 0; syncProps(); redraw(); };
}
let rlT = 0; function renderLayersLazy() { clearTimeout(rlT); rlT = setTimeout(renderLayers, 250); }
function pushHistMeta() { /* el nombre se guarda sin historial propio */ }

/* ============ Hit test ============ */
function toLayerPx(L, dx, dy) {
  const a = L.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), px = dx - L.x, py = dy - L.y;
  const u = (px * c + py * s) / L.sx, v = (-px * s + py * c) / L.sy;
  return [u + L.canvas.width / 2, v + L.canvas.height / 2];
}
function pixelAt(L, dx, dy) {
  const [u, v] = toLayerPx(L, dx, dy), x = Math.floor(u), y = Math.floor(v);
  if (x < 0 || y < 0 || x >= L.canvas.width || y >= L.canvas.height) return null;
  const d = L.canvas.getContext('2d').getImageData(x, y, 1, 1).data; return { x, y, r: d[0], g: d[1], b: d[2], a: d[3] };
}
function hitLayer(dx, dy) {
  for (let i = S.layers.length - 1; i >= 0; i--) { const L = S.layers[i]; if (!L.visible) continue; const p = pixelAt(L, dx, dy); if (p && p.a > 10) return L; }
  return null;
}

/* ============ Cuadros delimitadores (recorte al diseño) ============ */
const tightCache = new WeakMap();
function tightBounds(c) {
  if (tightCache.has(c)) return tightCache.get(c);
  const w = c.width, h = c.height, d = imgData(c).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) { const row = y * w * 4; for (let x = 0; x < w; x++) { if (d[row + x * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } }
  const r = x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 }; tightCache.set(c, r); return r;
}
function contentBounds() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const L of S.layers) {
    if (!L.visible) continue; const t = tightBounds(L.canvas); if (!t) continue;
    const a = L.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    for (const [px, py] of [[t.x0, t.y0], [t.x1, t.y0], [t.x1, t.y1], [t.x0, t.y1]]) {
      const u = (px - L.canvas.width / 2) * L.sx, v = (py - L.canvas.height / 2) * L.sy;
      const X = L.x + u * c - v * s, Y = L.y + u * s + v * c;
      x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
    }
  }
  if (!isFinite(x0)) return null; return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/* ============ Algoritmos de imagen ============ */
function cdist(r1, g1, b1, r2, g2, b2) {
  const rm = (r1 + r2) / 2, dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db) / 3;
}
function dilate4(m, w, h) {
  const o = new Uint8Array(m);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (m[i]) continue;
    if ((x > 0 && m[i - 1]) || (x < w - 1 && m[i + 1]) || (y > 0 && m[i - w]) || (y < h - 1 && m[i + w])) o[i] = 1;
  }
  return o;
}
function detectBorderColor(img) {
  const { data, width: w, height: h } = img, hist = new Map();
  const add = (x, y) => {
    const i = (y * w + x) * 4; if (data[i + 3] < 200) return;
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    let e = hist.get(key); if (!e) { e = { n: 0, r: 0, g: 0, b: 0 }; hist.set(key, e); }
    e.n++; e.r += data[i]; e.g += data[i + 1]; e.b += data[i + 2];
  };
  const t = Math.max(1, Math.min(3, w >> 6, h >> 6));
  for (let k = 0; k < t; k++) { for (let y = 0; y < h; y++) { add(k, y); add(w - 1 - k, y); } for (let x = 0; x < w; x++) { add(x, k); add(x, h - 1 - k); } }
  let best = null; hist.forEach(e => { if (!best || e.n > best.n) best = e; });
  return best ? [best.r / best.n, best.g / best.n, best.b / best.n] : null;
}
function floodMask(img, key, T, contiguous, seed) {
  const { data, width: w, height: h } = img, n = w * h, mask = new Uint8Array(n);
  const match = i => { const k = i * 4; if (data[k + 3] < 8) return true; return cdist(data[k], data[k + 1], data[k + 2], key[0], key[1], key[2]) <= T; };
  if (!contiguous) { for (let i = 0; i < n; i++) if (match(i)) mask[i] = 1; return mask; }
  const stack = new Int32Array(n); let sp = 0;
  const push = i => { if (!mask[i] && match(i)) { mask[i] = 1; stack[sp++] = i; } };
  if (seed === 'border') { for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); } for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); } }
  else push(seed);
  while (sp) { const i = stack[--sp], x = i % w; if (x > 0) push(i - 1); if (x < w - 1) push(i + 1); if (i >= w) push(i - w); if (i < n - w) push(i + w); }
  return mask;
}
function removeByMask(img, mask, key, T, soft, decon, choke) {
  const { data, width: w, height: h } = img, n = w * h, out = new Uint8ClampedArray(data);
  const band = dilate4(dilate4(mask, w, h), w, h), span = Math.max(1, T * soft * 1.4);
  for (let i = 0; i < n; i++) {
    const k = i * 4;
    if (mask[i]) { out[k + 3] = 0; continue; }
    if (!band[i] || soft <= 0) continue;
    const d = cdist(data[k], data[k + 1], data[k + 2], key[0], key[1], key[2]);
    const a = clamp((d - T) / span, 0, 1);
    if (a < 1) {
      if (decon && a > 0.02) for (let c = 0; c < 3; c++) out[k + c] = clamp((data[k + c] - key[c] * (1 - a)) / a, 0, 255);
      out[k + 3] = Math.round(data[k + 3] * a);
    }
  }
  for (let it = 0; it < choke; it++) {
    const al = new Uint8Array(n); for (let i = 0; i < n; i++) al[i] = out[i * 4 + 3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; let m = al[i];
      if (x > 0 && al[i - 1] < m) m = al[i - 1]; if (x < w - 1 && al[i + 1] < m) m = al[i + 1];
      if (y > 0 && al[i - w] < m) m = al[i - w]; if (y < h - 1 && al[i + w] < m) m = al[i + w];
      out[i * 4 + 3] = m;
    }
  }
  return out;
}

/* K-means y etiquetas */
function kmeans(img, k, maxSamples = 40000) {
  const { data, width: w, height: h } = img, n = w * h, step = Math.max(1, Math.floor(n / maxSamples)), pts = [];
  for (let i = 0; i < n; i += step) { const j = i * 4; if (data[j + 3] >= 128) pts.push(data[j], data[j + 1], data[j + 2]); }
  const m = pts.length / 3; if (!m) return [];
  k = Math.min(k, m);
  let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const first = Math.floor(rnd() * m), cent = [[pts[first * 3], pts[first * 3 + 1], pts[first * 3 + 2]]], dist = new Float64Array(m).fill(Infinity);
  while (cent.length < k) {
    let total = 0; const c = cent[cent.length - 1];
    for (let i = 0; i < m; i++) { const dr = pts[i * 3] - c[0], dg = pts[i * 3 + 1] - c[1], db = pts[i * 3 + 2] - c[2], d = dr * dr + dg * dg + db * db; if (d < dist[i]) dist[i] = d; total += dist[i]; }
    if (total === 0) break;
    let r = rnd() * total, idx = 0; for (; idx < m - 1; idx++) { r -= dist[idx]; if (r <= 0) break; }
    cent.push([pts[idx * 3], pts[idx * 3 + 1], pts[idx * 3 + 2]]);
  }
  const kc = cent.length;
  for (let it = 0; it < 12; it++) {
    const sum = new Float64Array(kc * 3), cnt = new Float64Array(kc); let moved = 0;
    for (let i = 0; i < m; i++) {
      let best = 0, bd = Infinity; const r = pts[i * 3], g = pts[i * 3 + 1], b = pts[i * 3 + 2];
      for (let c = 0; c < kc; c++) { const dr = r - cent[c][0], dg = g - cent[c][1], db = b - cent[c][2], d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = c; } }
      sum[best * 3] += r; sum[best * 3 + 1] += g; sum[best * 3 + 2] += b; cnt[best]++;
    }
    for (let c = 0; c < kc; c++) if (cnt[c]) { const nc = [sum[c * 3] / cnt[c], sum[c * 3 + 1] / cnt[c], sum[c * 3 + 2] / cnt[c]]; moved += Math.abs(nc[0] - cent[c][0]) + Math.abs(nc[1] - cent[c][1]) + Math.abs(nc[2] - cent[c][2]); cent[c] = nc; }
    if (moved < 1) break;
  }
  return cent.map(c => c.map(Math.round));
}
async function assignLabels(img, cent, prog) {
  const { data, width: w, height: h } = img, n = w * h, labels = new Int16Array(n).fill(-1), kc = cent.length;
  const cr = Int32Array.from(cent, c => c[0]), cg = Int32Array.from(cent, c => c[1]), cb = Int32Array.from(cent, c => c[2]);
  for (let i = 0; i < n; i++) {
    const j = i * 4; if (data[j + 3] < 128) continue;
    const r = data[j], g = data[j + 1], b = data[j + 2]; let best = 0, bd = 1e9;
    for (let c = 0; c < kc; c++) { const dr = r - cr[c], dg = g - cg[c], db = b - cb[c], d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = c; } }
    labels[i] = best;
    if ((i & 0x3FFFFF) === 0x3FFFFF) { if (prog) prog(i / n); await sleep(); }
  }
  return labels;
}
function majority(labels, w, h, k) {
  const out = new Int16Array(labels), cnt = new Int32Array(k);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; if (labels[i] < 0) continue; cnt.fill(0); let best = labels[i], bc = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const l = labels[i + dy * w + dx]; if (l >= 0) { const c = ++cnt[l]; if (c > bc) { bc = c; best = l; } } }
    if (bc >= 5) out[i] = best;
  }
  return out;
}
function dilateSquare(mask, w, h, r) {
  if (r <= 0) return mask;
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h), pre = new Int32Array(Math.max(w, h) + 1);
  for (let y = 0; y < h; y++) {
    pre[0] = 0; for (let x = 0; x < w; x++) pre[x + 1] = pre[x] + mask[y * w + x];
    for (let x = 0; x < w; x++) tmp[y * w + x] = pre[Math.min(x + r + 1, w)] - pre[Math.max(x - r, 0)] > 0 ? 1 : 0;
  }
  for (let x = 0; x < w; x++) {
    pre[0] = 0; for (let y = 0; y < h; y++) pre[y + 1] = pre[y] + tmp[y * w + x];
    for (let y = 0; y < h; y++) out[y * w + x] = pre[Math.min(y + r + 1, h)] - pre[Math.max(y - r, 0)] > 0 ? 1 : 0;
  }
  return out;
}
function ccl(mask, w, h) {
  const n = w * h, lab = new Int32Array(n), parent = new Int32Array((n >> 1) + 2); let next = 1;
  const find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const uni = (a, b) => { a = find(a); b = find(b); if (a !== b) { if (a < b) parent[b] = a; else parent[a] = b; } };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!mask[i]) continue;
    const a = x > 0 ? lab[i - 1] : 0, b = y > 0 && x > 0 ? lab[i - w - 1] : 0, c = y > 0 ? lab[i - w] : 0, d = y > 0 && x < w - 1 ? lab[i - w + 1] : 0;
    let m = 0; for (const v of [a, b, c, d]) if (v && (!m || v < m)) m = v;
    if (!m) { m = next; parent[next] = next; next++; lab[i] = m; }
    else { lab[i] = m; for (const v of [a, b, c, d]) if (v && v !== m) uni(m, v); }
  }
  const remap = new Int32Array(next); let count = 0;
  for (let i = 1; i < next; i++) if (find(i) === i) remap[i] = ++count;
  const areas = new Int32Array(count + 1);
  for (let i = 0; i < n; i++) if (lab[i]) { const r = remap[find(lab[i])]; lab[i] = r; areas[r]++; }
  return { lab, count, areas };
}
function extractRegion(img, w, h, box, test, flatColor) {
  const d = img.data, x0 = box.x0, y0 = box.y0, cw = box.x1 - box.x0 + 1, ch = box.y1 - box.y0 + 1;
  if (cw < 1 || ch < 1) return null;
  const out = new Uint8ClampedArray(cw * ch * 4); let any = false;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const i = (y + y0) * w + x + x0; if (!test(i)) continue; any = true; const o = (y * cw + x) * 4, k = i * 4;
    if (flatColor) { out[o] = flatColor[0]; out[o + 1] = flatColor[1]; out[o + 2] = flatColor[2]; out[o + 3] = 255; }
    else { out[o] = d[k]; out[o + 1] = d[k + 1]; out[o + 2] = d[k + 2]; out[o + 3] = d[k + 3]; }
  }
  if (!any) return null;
  return { canvas: canvasFromData(out, cw, ch), x0, y0, cw, ch };
}

/* Remuestreo Lanczos / bilineal */
const lanczosK = (x, a) => { if (x === 0) return 1; if (Math.abs(x) >= a) return 0; const p = Math.PI * x; return a * Math.sin(p) * Math.sin(p / a) / (p * p); };
const triK = (x) => { x = Math.abs(x); return x < 1 ? 1 - x : 0; };
function axisWeights(inN, outN, method) {
  const a = method === 'bilinear' ? 1 : 3, kern = method === 'bilinear' ? triK : lanczosK;
  const scale = outN / inN, fs = Math.min(1, scale), sup = a / fs, maxT = Math.ceil(sup * 2) + 2;
  const starts = new Int32Array(outN), counts = new Int32Array(outN), wts = new Float32Array(outN * maxT);
  for (let o = 0; o < outN; o++) {
    const c = (o + 0.5) / scale - 0.5; let s = Math.max(Math.ceil(c - sup), 0), e = Math.min(Math.floor(c + sup), inN - 1);
    if (e < s) { s = e = clamp(Math.round(c), 0, inN - 1); }
    const cnt = Math.min(e - s + 1, maxT); let sum = 0;
    for (let i = 0; i < cnt; i++) { const v = kern((s + i - c) * fs, a); wts[o * maxT + i] = v; sum += v; }
    if (sum === 0) { wts[o * maxT] = 1; sum = 1; }
    for (let i = 0; i < cnt; i++) wts[o * maxT + i] /= sum;
    starts[o] = s; counts[o] = cnt;
  }
  return { starts, counts, wts, maxT };
}
function toPremult(d) {
  const o = new Uint8ClampedArray(d.length);
  for (let i = 0; i < d.length; i += 4) { const a = d[i + 3]; if (a === 255) { o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = 255; } else if (a) { o[i] = (d[i] * a + 127) / 255; o[i + 1] = (d[i + 1] * a + 127) / 255; o[i + 2] = (d[i + 2] * a + 127) / 255; o[i + 3] = a; } }
  return o;
}
async function resizePremult(srcData, sw, sh, nw, nh, method, prog) {
  if (nw * nh > 130e6) throw new Error('el resultado sería demasiado grande (' + nw + '×' + nh + ' px)');
  const pm = toPremult(srcData);
  if (method === 'nearest') {
    const out = new Uint8ClampedArray(nw * nh * 4);
    for (let y = 0; y < nh; y++) { const sy = Math.min(sh - 1, Math.floor((y + .5) * sh / nh)); for (let x = 0; x < nw; x++) { const sx = Math.min(sw - 1, Math.floor((x + .5) * sw / nw)), s = (sy * sw + sx) * 4, o = (y * nw + x) * 4; out[o] = pm[s]; out[o + 1] = pm[s + 1]; out[o + 2] = pm[s + 2]; out[o + 3] = pm[s + 3]; } if ((y & 255) === 255) await sleep(); }
    return out;
  }
  const wx = axisWeights(sw, nw, method), wy = axisWeights(sh, nh, method);
  const tmp = new Uint8ClampedArray(nw * sh * 4);
  for (let y = 0; y < sh; y++) {
    const row = y * sw * 4, orow = y * nw * 4;
    for (let x = 0; x < nw; x++) {
      const s = wx.starts[x], c = wx.counts[x], wb = x * wx.maxT; let r = 0, g = 0, b = 0, a = 0;
      for (let i = 0; i < c; i++) { const wgt = wx.wts[wb + i], p = row + (s + i) * 4; r += pm[p] * wgt; g += pm[p + 1] * wgt; b += pm[p + 2] * wgt; a += pm[p + 3] * wgt; }
      const o = orow + x * 4; tmp[o] = r; tmp[o + 1] = g; tmp[o + 2] = b; tmp[o + 3] = a;
    }
    if ((y & 63) === 63) { if (prog) prog(0.5 * y / sh); await sleep(); }
  }
  const out = new Uint8ClampedArray(nw * nh * 4), acc = new Float32Array(nw * 4);
  for (let y = 0; y < nh; y++) {
    acc.fill(0); const s = wy.starts[y], c = wy.counts[y], wb = y * wy.maxT;
    for (let i = 0; i < c; i++) { const wgt = wy.wts[wb + i], base = (s + i) * nw * 4; for (let k = 0; k < nw * 4; k++) acc[k] += tmp[base + k] * wgt; }
    const o = y * nw * 4; for (let k = 0; k < nw * 4; k++) out[o + k] = acc[k];
    if ((y & 63) === 63) { if (prog) prog(0.5 + 0.5 * y / nh); await sleep(); }
  }
  // con núcleos con lóbulos negativos, el color premultiplicado no puede superar al alfa
  for (let i = 0; i < out.length; i += 4) { const a = out[i + 3]; if (out[i] > a) out[i] = a; if (out[i + 1] > a) out[i + 1] = a; if (out[i + 2] > a) out[i + 2] = a; }
  return out;
}
function unPremultToCanvas(pm, w, h) {
  const out = new Uint8ClampedArray(pm.length);
  for (let i = 0; i < pm.length; i += 4) { const a = pm[i + 3]; if (a === 255) { out[i] = pm[i]; out[i + 1] = pm[i + 1]; out[i + 2] = pm[i + 2]; out[i + 3] = 255; } else if (a) { const k = 255 / a; out[i] = pm[i] * k; out[i + 1] = pm[i + 1] * k; out[i + 2] = pm[i + 2] * k; out[i + 3] = a; } }
  return canvasFromData(out, w, h);
}
function blurAxis(src, dst, w, h, r, horiz, nc) {
  const len = horiz ? w : h, lines = horiz ? h : w, stride = horiz ? nc : w * nc, lstride = horiz ? w * nc : nc, win = 2 * r + 1;
  for (let l = 0; l < lines; l++) {
    const base = l * lstride;
    for (let c = 0; c < nc; c++) {
      let sum = 0; for (let i = -r; i <= r; i++) sum += src[base + clamp(i, 0, len - 1) * stride + c];
      for (let p = 0; p < len; p++) {
        dst[base + p * stride + c] = sum / win;
        sum += src[base + Math.min(p + r + 1, len - 1) * stride + c] - src[base + Math.max(p - r, 0) * stride + c];
      }
    }
  }
}
async function blur3(src, w, h, r, nc) {
  let cur = src;
  for (let i = 0; i < 3; i++) {
    const t = new Uint8ClampedArray(src.length), o = new Uint8ClampedArray(src.length);
    blurAxis(cur, t, w, h, r, true, nc); blurAxis(t, o, w, h, r, false, nc); cur = o; await sleep();
  }
  return cur;
}
async function bilateral(img, strength) {
  const { data, width: w, height: h } = img, out = new Uint8ClampedArray(data), R = 2, sg = 1.6;
  const sw = [], lut = new Float32Array(766), sr = Math.max(4, strength * 1.8);
  for (let i = 0; i < 766; i++) lut[i] = Math.exp(-(i * i) / (2 * sr * sr * 9));
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) sw.push([dx, dy, Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg))]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, a0 = data[i + 3]; if (a0 < 8) continue;
      const r0 = data[i], g0 = data[i + 1], b0 = data[i + 2]; let sr_ = 0, sg_ = 0, sb_ = 0, ws = 0;
      for (const [dx, dy, wsp] of sw) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = (yy * w + xx) * 4, aj = data[j + 3]; if (aj < 8) continue;
        const diff = Math.abs(data[j] - r0) + Math.abs(data[j + 1] - g0) + Math.abs(data[j + 2] - b0), wt = wsp * lut[diff] * (aj / 255);
        sr_ += data[j] * wt; sg_ += data[j + 1] * wt; sb_ += data[j + 2] * wt; ws += wt;
      }
      if (ws > 0) { out[i] = sr_ / ws; out[i + 1] = sg_ / ws; out[i + 2] = sb_ / ws; }
    }
    if ((y & 31) === 31) await sleep();
  }
  return out;
}
async function finishEnhance(pm, w, h, o) {
  const n = w * h; let B = null, Ab = null;
  if (o.sharp > 0 || o.clean) B = await blur3(pm, w, h, o.sigma, 4);
  if (o.clean) { const a1 = new Uint8ClampedArray(n); for (let i = 0; i < n; i++) a1[i] = pm[i * 4 + 3]; Ab = await blur3(a1, w, h, o.cleanR, 1); }
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const k = i * 4, a = pm[k + 3]; let r = 0, g = 0, b = 0;
    if (a > 0) { const f = 255 / a; r = pm[k] * f; g = pm[k + 1] * f; b = pm[k + 2] * f; }
    if (B) {
      const ba = B[k + 3]; let br = r, bg = g, bb = b;
      if (ba > 0) { const f = 255 / ba; br = B[k] * f; bg = B[k + 1] * f; bb = B[k + 2] * f; }
      if (a === 0 || (o.clean && a < 24)) { r = br; g = bg; b = bb; }
      else if (o.sharp > 0) { r += o.sharp * (r - br); g += o.sharp * (g - bg); b += o.sharp * (b - bb); }
    }
    let al = a; if (Ab) al = clamp(((Ab[i] / 255) - 0.5) * o.gain + 0.5, 0, 1) * 255;
    out[k] = r; out[k + 1] = g; out[k + 2] = b; out[k + 3] = al;
  }
  return canvasFromData(out, w, h);
}

/* Semitonos */
async function halftone(src, o, prog) {
  const w = src.width, h = src.height, d = imgData(src).data, out = mk(w, h), g = out.getContext('2d');
  const cell = o.cell, ang = o.angle * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
  const cx0 = w / 2, cy0 = h / 2, D = Math.hypot(w, h) / 2, N = Math.ceil(D / cell) + 1;
  const sample = (x, y) => { const xi = clamp(Math.round(x), 0, w - 1), yi = clamp(Math.round(y), 0, h - 1), k = (yi * w + xi) * 4; return k; };
  const offs = [[0, 0], [0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25]];
  const ink = o.ink, shape = o.shape; let batch = 0;
  g.fillStyle = 'rgb(' + ink[0] + ',' + ink[1] + ',' + ink[2] + ')';
  if (o.mode === 'ink') g.beginPath();
  for (let j = -N; j <= N; j++) {
    for (let i = -N; i <= N; i++) {
      const u = i * cell, v = j * cell, px = cx0 + u * ca - v * sa, py = cy0 + u * sa + v * ca;
      if (px < -cell || py < -cell || px > w + cell || py > h + cell) continue;
      let ta = 0, tl = 0, sr = 0, sg = 0, sb = 0, sa_ = 0;
      for (const [ox, oy] of offs) {
        const qx = px + (ox * ca - oy * sa) * cell, qy = py + (ox * sa + oy * ca) * cell, k = sample(qx, qy), a = d[k + 3] / 255;
        const lum = (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255;
        ta += a; tl += lum * a; sr += d[k] * a; sg += d[k + 1] * a; sb += d[k + 2] * a; sa_ += a;
      }
      const aAvg = ta / offs.length; if (aAvg < 0.02) continue;
      let t;
      if (o.src === 'alpha') t = aAvg;
      else { const lum = tl / Math.max(ta, 1e-6); t = (o.invert ? lum : 1 - lum) * aAvg; }
      t = clamp((t - 0.5) * o.contrast + 0.5, 0, 1); t = Math.pow(t, o.gamma);
      let r;
      if (shape === 'circle') r = t <= 0.785 ? cell * Math.sqrt(t / Math.PI) : cell * (0.5 + (t - 0.785) / 0.215 * 0.2071);
      else r = Math.SQRT1_2 * cell * Math.sqrt(t);
      if ((shape === 'line' ? cell * t / 2 : r) < o.minR) continue;
      if (o.mode === 'color' && sa_ > 0) { g.fillStyle = 'rgb(' + Math.round(sr / sa_) + ',' + Math.round(sg / sa_) + ',' + Math.round(sb / sa_) + ')'; g.beginPath(); }
      if (shape === 'circle') { g.moveTo(px + r, py); g.arc(px, py, r, 0, Math.PI * 2); }
      else if (shape === 'line') { const hl = cell * 0.5 + 0.6, hw = Math.max(0.3, cell * t * 0.5); poly(g, px, py, [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]], ca, sa); }
      else if (shape === 'diamond') { const s = r * Math.SQRT1_2, c2 = (ca - sa) * Math.SQRT1_2, s2 = (sa + ca) * Math.SQRT1_2; poly(g, px, py, [[-s, -s], [s, -s], [s, s], [-s, s]], c2, s2); }
      else { const s = r * Math.SQRT1_2; poly(g, px, py, [[-s, -s], [s, -s], [s, s], [-s, s]], ca, sa); }
      if (o.mode === 'color') g.fill();
      else if (++batch >= 30000) { g.fill(); g.beginPath(); batch = 0; }
    }
    if ((j & 15) === 0) { if (prog) prog((j + N) / (2 * N + 1)); await sleep(); }
  }
  if (o.mode === 'ink') g.fill();
  return out;
}
function poly(g, px, py, pts, c, s) {
  pts.forEach(([u, v], i) => { const x = px + u * c - v * s, y = py + u * s + v * c; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
}

/* Vectorización: trazado de contornos de máscaras */
function traceMask(mask, w, h, eps, minArea, smooth) {
  const W1 = w + 1, out = new Uint8Array(W1 * (h + 1));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!mask[y * w + x]) continue;
    if (y === 0 || !mask[(y - 1) * w + x]) out[y * W1 + x] |= 1;
    if (x === w - 1 || !mask[y * w + x + 1]) out[y * W1 + x + 1] |= 2;
    if (y === h - 1 || !mask[(y + 1) * w + x]) out[(y + 1) * W1 + x + 1] |= 4;
    if (x === 0 || !mask[y * w + x - 1]) out[(y + 1) * W1 + x] |= 8;
  }
  const parts = []; let rings = 0;
  for (let v = 0; v < out.length; v++) {
    while (out[v]) {
      let b = out[v] & -out[v]; const startV = v; let cv = v, last = -1, guard = 0; const pts = [];
      for (;;) {
        out[cv] &= ~b;
        if (b !== last) { pts.push(cv % W1, (cv / W1) | 0); last = b; }
        cv += (b === 1 ? 1 : b === 4 ? -1 : 0) + (b === 2 ? W1 : b === 8 ? -W1 : 0);
        if (cv === startV || ++guard > 4000000) break;
        const av = out[cv]; if (!av) break;
        const right = (b << 1) > 8 ? 1 : (b << 1), left = b >> 1 || 8;
        b = (av & right) ? right : (av & b) ? b : (av & left) ? left : (av & -av);
      }
      const m = pts.length / 2; if (m < 3) continue;
      let area = 0; for (let i = 0; i < m; i++) { const j = (i + 1) % m; area += pts[i * 2] * pts[j * 2 + 1] - pts[j * 2] * pts[i * 2 + 1]; }
      if (Math.abs(area) / 2 < minArea) continue;
      const q = simplifyRing(pts, eps); if (q.length < 6) continue;
      parts.push(ringPath(q, smooth)); rings++;
    }
  }
  return { d: parts.join(''), rings };
}
function simplifyRing(P, eps) {
  const n = P.length / 2; if (n < 4 || eps <= 0) return P;
  let f = 0, fd = -1; for (let i = 1; i < n; i++) { const d = (P[i * 2] - P[0]) ** 2 + (P[i * 2 + 1] - P[1]) ** 2; if (d > fd) { fd = d; f = i; } }
  const ext = new Float64Array(P.length + 2); ext.set(P); ext[P.length] = P[0]; ext[P.length + 1] = P[1];
  const keep = new Uint8Array(n + 1); keep[0] = keep[f] = keep[n] = 1; const e2 = eps * eps;
  const run = (a0, b0) => {
    const st = [[a0, b0]];
    while (st.length) {
      const [a, b] = st.pop(); if (b - a < 2) continue;
      const ax = ext[a * 2], ay = ext[a * 2 + 1], dx = ext[b * 2] - ax, dy = ext[b * 2 + 1] - ay, L2 = dx * dx + dy * dy; let md = 0, mi = -1;
      for (let i = a + 1; i < b; i++) { const px = ext[i * 2] - ax, py = ext[i * 2 + 1] - ay; const d2 = L2 === 0 ? px * px + py * py : (px * dy - py * dx) ** 2 / L2; if (d2 > md) { md = d2; mi = i; } }
      if (md > e2 && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
    }
  };
  run(0, f); run(f, n);
  const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(P[i * 2], P[i * 2 + 1]); return out;
}
function ringPath(Q, smooth) {
  const m = Q.length / 2, f = v => (Math.round(v * 10) / 10), cosT = Math.cos(75 * Math.PI / 180), EXT = 6;
  const X = i => Q[((i + m) % m) * 2], Y = i => Q[((i + m) % m) * 2 + 1];
  if (!smooth) { let s = 'M' + f(X(0)) + ' ' + f(Y(0)); for (let i = 1; i < m; i++) s += 'L' + f(X(i)) + ' ' + f(Y(i)); return s + 'Z'; }
  const C = [], U = [];
  for (let i = 0; i < m; i++) {
    const v1x = X(i) - X(i - 1), v1y = Y(i) - Y(i - 1), v2x = X(i + 1) - X(i), v2y = Y(i + 1) - Y(i);
    const l1 = Math.hypot(v1x, v1y) || 1, l2 = Math.hypot(v2x, v2y) || 1, cs = (v1x * v2x + v1y * v2y) / (l1 * l2);
    C.push(cs < cosT && Math.min(l1, l2) >= 3);
    const tx = X(i + 1) - X(i - 1), ty = Y(i + 1) - Y(i - 1), tl = Math.hypot(tx, ty) || 1; U.push([tx / tl, ty / tl]);
  }
  let s = 'M' + f(X(0)) + ' ' + f(Y(0));
  for (let i = 0; i < m; i++) {
    const j = (i + 1) % m, len = Math.hypot(X(j) - X(i), Y(j) - Y(i)) / 3;
    if (C[i] && C[j]) { s += 'L' + f(X(j)) + ' ' + f(Y(j)); continue; }
    const c1 = C[i] ? [X(i), Y(i)] : [X(i) + U[i][0] * len, Y(i) + U[i][1] * len], c2 = C[j] ? [X(j), Y(j)] : [X(j) - U[j][0] * len, Y(j) - U[j][1] * len];
    s += 'C' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(c2[0]) + ' ' + f(c2[1]) + ' ' + f(X(j)) + ' ' + f(Y(j));
  }
  return s + 'Z';
}

/* ============ Herramientas: acciones ============ */
const sgn = v => v < 0 ? -1 : 1;
function seg(id, cb) {
  const root = $('#' + id);
  root.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !root.contains(b)) return; $$('button', root).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); cb(b.dataset.v); });
}
function rng(id, f) { const el = $('#' + id), out = $('#' + id + 'V'); const u = () => { out.textContent = f ? f(+el.value) : el.value; }; el.addEventListener('input', u); u(); return el; }

/* --- Quitar fondo --- */
async function doRemove(L, key, seed) {
  await runOp('Quitando fondo…', async prog => {
    const img = imgData(L.canvas), w = img.width, h = img.height;
    const T = +$('#rbTol').value * 2.55, soft = +$('#rbSoft').value / 100, contig = $('#rbContig').checked;
    if (!key) { key = detectBorderColor(img); if (!key) { toast('Los bordes ya son transparentes: no hay fondo que quitar.'); return; } }
    prog(0.2);
    const mask = floodMask(img, key, T, contig, contig ? (seed != null ? seed : 'border') : 0);
    let cnt = 0; for (let i = 0; i < mask.length; i++) cnt += mask[i];
    if (!cnt) { toast('No se encontró fondo con esa tolerancia. Prueba subirla.'); return; }
    prog(0.5);
    const out = removeByMask(img, mask, key, T, soft, $('#rbDecon').checked, +$('#rbChoke').value);
    commitResult(L, canvasFromData(out, w, h), L.name + ' (sin fondo)', false);
    toast('Fondo quitado (' + Math.round(cnt / mask.length * 100) + '% de la imagen).');
  });
}
function pickRemove(dx, dy) {
  const L = cur(); if (!L || !L.visible) { toast('Selecciona una capa visible.'); return; }
  const p = pixelAt(L, dx, dy); if (!p) { toast('Haz clic sobre la imagen.'); return; }
  if (p.a < 8) { toast('Esa zona ya es transparente.'); return; }
  $('#rbKey').value = toHex(p.r, p.g, p.b);
  doRemove(L, [p.r, p.g, p.b], p.y * L.canvas.width + p.x);
}

/* --- Borrador mágico --- */
function wandErase(L, dx, dy, global) {
  const p = pixelAt(L, dx, dy); if (!p) return;
  if (p.a < 8) { toast('Esa zona ya es transparente.'); return; }
  const img = imgData(L.canvas), w = img.width, h = img.height, key = [p.r, p.g, p.b], T = +$('#erTol').value * 2.55, soft = +$('#erSoft').value / 100;
  const mask = floodMask(img, key, T, !global, p.y * w + p.x);
  const out = removeByMask(img, mask, key, T, soft, true, 0);
  pushHist(); L.canvas = canvasFromData(out, w, h); tightCache.delete(L.canvas); afterStructure();
}
function eraserDown(dx, dy) {
  const L = cur(); if (!L || !L.visible) { toast('Selecciona una capa visible.'); return false; }
  const m = S.er.mode;
  if (m === 'wand' || m === 'global') { wandErase(L, dx, dy, m === 'global'); return false; }
  if (m === 'restore' && (L.orig.width !== L.canvas.width || L.orig.height !== L.canvas.height)) { toast('No hay original para restaurar: la capa fue remuestreada.'); return false; }
  pushHist(); L.canvas = cloneCanvas(L.canvas);
  drag = { type: 'brush', L, mode: m, last: null }; brushTo(dx, dy); return true;
}
function inpaint(d, w, h, m) {
  const known = new Uint8Array(w * h), q = new Uint8Array(w * h), N8 = [[-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1], [-1, -1, 0.7], [1, -1, 0.7], [-1, 1, 0.7], [1, 1, 0.7]];
  for (let i = 0; i < w * h; i++) known[i] = m[i] ? 0 : 1;
  let front = [];
  const addNb = (x, y) => { for (const [ox, oy] of N8) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!known[j] && !q[j]) { q[j] = 1; front.push(j); } } };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (known[y * w + x]) { let edge = false; for (const [ox, oy] of N8) { const nx = x + ox, ny = y + oy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && !known[ny * w + nx]) { edge = true; break; } } if (edge) addNb(x, y); }
  while (front.length) {
    const cur = front, vals = new Float32Array(cur.length * 4); front = [];
    cur.forEach((p, n) => { const x = p % w, y = (p / w) | 0; let sc = [0, 0, 0], sa = 0, sw = 0; for (const [ox, oy, wt] of N8) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!known[j]) continue; const a = d[j * 4 + 3] / 255; sc[0] += d[j * 4] * a * wt; sc[1] += d[j * 4 + 1] * a * wt; sc[2] += d[j * 4 + 2] * a * wt; sa += a * wt; sw += wt; } if (sw) { vals[n * 4] = sa ? sc[0] / sa : 0; vals[n * 4 + 1] = sa ? sc[1] / sa : 0; vals[n * 4 + 2] = sa ? sc[2] / sa : 0; vals[n * 4 + 3] = 255 * sa / sw; } });
    cur.forEach((p, n) => { d[p * 4] = vals[n * 4]; d[p * 4 + 1] = vals[n * 4 + 1]; d[p * 4 + 2] = vals[n * 4 + 2]; d[p * 4 + 3] = vals[n * 4 + 3]; known[p] = 1; });
    cur.forEach(p => addNb(p % w, (p / w) | 0));
  }
  for (let pass = 0; pass < 2; pass++) { const src = new Uint8ClampedArray(d); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const p = y * w + x; if (!m[p]) continue; for (let c = 0; c < 4; c++) { let t = 0; for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) t += src[((y + oy) * w + x + ox) * 4 + c]; d[p * 4 + c] = t / 9; } } }
}
function cleanDown(dx, dy) {
  const L = cur(); if (!L || !L.visible) { toast('Selecciona una capa visible.'); return; }
  pushHist(); L.canvas = cloneCanvas(L.canvas);
  drag = { type: 'heal', L, last: null, mc: mk(L.canvas.width, L.canvas.height), bk: cloneCanvas(L.canvas) }; healTo(dx, dy);
}
function healTo(dx, dy) {
  const d = drag, L = d.L, [u, v] = toLayerPx(L, dx, dy), r = Math.max(1, (+$('#clSize').value / 2) / Math.abs(L.sx)), g = L.canvas.getContext('2d'), mg = d.mc.getContext('2d');
  const stamp = (x, y) => { mg.fillStyle = '#fff'; mg.beginPath(); mg.arc(x, y, r, 0, Math.PI * 2); mg.fill(); g.fillStyle = 'rgba(255,0,200,0.6)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  if (!d.last) stamp(u, v); else { const dist = Math.hypot(u - d.last[0], v - d.last[1]), step = Math.max(1, r * 0.3), n = Math.ceil(dist / step); for (let i = 1; i <= n; i++) stamp(d.last[0] + (u - d.last[0]) * i / n, d.last[1] + (v - d.last[1]) * i / n); }
  d.last = [u, v]; redraw();
}
function finishHeal(d) {
  const L = d.L, w = L.canvas.width, h = L.canvas.height, g = L.canvas.getContext('2d'), md = d.mc.getContext('2d').getImageData(0, 0, w, h).data, m0 = new Uint8Array(w * h), m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (md[i * 4 + 3] > 127) m0[i] = 1;
  let n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let on = 0; for (let oy = -1; oy <= 1 && !on; oy++) for (let ox = -1; ox <= 1; ox++) { const nx = x + ox, ny = y + oy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && m0[ny * w + nx]) { on = 1; break; } } if (on) { m[y * w + x] = 1; n++; } }
  g.clearRect(0, 0, w, h); g.drawImage(d.bk, 0, 0);
  if (n && n < w * h) { const img = g.getImageData(0, 0, w, h); inpaint(img.data, w, h, m); g.putImageData(img, 0, 0); toast('Zona limpiada. Si quedan restos, pinta de nuevo encima.'); }
  tightCache.delete(L.canvas); renderLayers(); syncStatus(); redraw();
}
function brushTo(dx, dy) {
  const d = drag, L = d.L, [u, v] = toLayerPx(L, dx, dy), r = Math.max(0.5, (+$('#erSize').value / 2) / Math.abs(L.sx)), hard = +$('#erHard').value / 100, g = L.canvas.getContext('2d');
  const stamp = (x, y) => {
    if (d.mode === 'brush') {
      g.globalCompositeOperation = 'destination-out'; const gr = g.createRadialGradient(x, y, r * hard, x, y, r);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
    } else { g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip(); g.clearRect(x - r, y - r, 2 * r, 2 * r); g.drawImage(L.orig, 0, 0); g.restore(); }
  };
  if (!d.last) stamp(u, v);
  else { const dist = Math.hypot(u - d.last[0], v - d.last[1]), step = Math.max(1, r * 0.25), n = Math.ceil(dist / step); for (let i = 1; i <= n; i++) stamp(d.last[0] + (u - d.last[0]) * i / n, d.last[1] + (v - d.last[1]) * i / n); }
  d.last = [u, v]; redraw();
}

/* --- Vectorizar --- */
function vecSvgString(v, withMm) {
  const dims = withMm ? ' width="' + fmt(v.mmW, 2) + 'mm" height="' + fmt(v.mmH, 2) + 'mm"' : '';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + v.w + ' ' + v.h + '"' + dims + '>' + v.paths.map(p => '<path fill="' + p.fill + '" fill-rule="evenodd" d="' + p.d + '"/>').join('') + '</svg>';
}
async function vkRun() {
  const L = needLayer(); if (!L) return;
  await runOp('Vectorizando…', async prog => {
    const maxDim = +$('#vkDet').value, sc = Math.min(1, maxDim / Math.max(L.canvas.width, L.canvas.height));
    const ww = Math.max(1, Math.round(L.canvas.width * sc)), wh = Math.max(1, Math.round(L.canvas.height * sc));
    const wc = mk(ww, wh), g = wc.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(L.canvas, 0, 0, ww, wh);
    const img = g.getImageData(0, 0, ww, wh), d = img.data, n = ww * wh;
    const eps = 0.45 + (+$('#vkSmooth').value / 100) * 1.7, minArea = +$('#vkSpeck').value, smooth = +$('#vkSmooth').value > 0;
    const paths = []; let rings = 0;
    if (S.vk.mode === 'mono') {
      const mask = new Uint8Array(n), thr = +$('#vkThr').value, src = $('#vkSrc').value;
      for (let i = 0; i < n; i++) { const k = i * 4, a = d[k + 3]; if (src === 'alpha') mask[i] = a >= thr ? 1 : 0; else if (a >= 128 && (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) < thr) mask[i] = 1; }
      prog(0.3); await sleep();
      const r = traceMask(mask, ww, wh, eps, minArea, smooth); rings = r.rings; if (r.d) paths.push({ fill: $('#vkInk').value, d: r.d });
    } else {
      const cent = kmeans(img, +$('#vkK').value); if (!cent.length) throw new Error('la capa está vacía');
      let labels = await assignLabels(img, cent, p => prog(p * 0.25)); labels = majority(labels, ww, wh, cent.length);
      if ($('#vkBg').checked) {
        const bc = new Int32Array(cent.length); let tot = 0;
        for (let x = 0; x < ww; x++) for (const y of [0, wh - 1]) { const l = labels[y * ww + x]; if (l >= 0) { bc[l]++; tot++; } }
        for (let y = 0; y < wh; y++) for (const x of [0, ww - 1]) { const l = labels[y * ww + x]; if (l >= 0) { bc[l]++; tot++; } }
        let bl = -1, bm = 0; for (let c = 0; c < bc.length; c++) if (bc[c] > bm) { bm = bc[c]; bl = c; }
        if (bl >= 0 && tot && bm / tot > 0.4) for (let i = 0; i < n; i++) if (labels[i] === bl) labels[i] = -1;
      }
      const cnt = new Int32Array(cent.length); for (let i = 0; i < n; i++) if (labels[i] >= 0) cnt[labels[i]]++;
      const order = cent.map((_, i) => i).filter(i => cnt[i] > 0).sort((a, b) => cnt[b] - cnt[a]);
      const mask = new Uint8Array(n); for (let i = 0; i < n; i++) mask[i] = labels[i] >= 0 ? 1 : 0;
      let step = 0;
      for (const l of order) {
        const r = traceMask(mask, ww, wh, eps, minArea, smooth); rings += r.rings;
        if (r.d) paths.push({ fill: toHex(cent[l][0], cent[l][1], cent[l][2]), d: r.d });
        for (let i = 0; i < n; i++) if (labels[i] === l) mask[i] = 0;
        prog(0.25 + 0.7 * (++step / order.length)); await sleep();
      }
    }
    if (!paths.length) throw new Error('no se encontró nada que vectorizar (revisa el umbral o el color de fondo)');
    S.vec = { w: ww, h: wh, paths, layerId: L.id, srcW: L.canvas.width, srcH: L.canvas.height, mmW: layerPxW(L) / S.doc.dpi * 25.4, mmH: layerPxH(L) / S.doc.dpi * 25.4, rings };
    $('#vkPrev').innerHTML = vecSvgString(S.vec, false); $('#vkResult').hidden = false;
    $('#vkStats').textContent = paths.length + ' colores · ' + rings + ' contornos · ' + fmt(S.vec.mmW / 10, 1) + ' × ' + fmt(S.vec.mmH / 10, 1) + ' cm';
  });
}
function vkInsert() {
  const v = S.vec; if (!v) return; const L = S.layers.find(l => l.id === v.layerId); if (!L) { toast('La capa original ya no existe.'); return; }
  const k = +$('#vkOut').value, cw = v.srcW * k, ch = v.srcH * k;
  if (cw * ch > 80e6) { toast('Demasiado grande: elige una salida menor.'); return; }
  const nc = mk(cw, ch), g = nc.getContext('2d'); g.scale(cw / v.w, ch / v.h);
  for (const p of v.paths) { g.fillStyle = p.fill; g.fill(new Path2D(p.d), 'evenodd'); }
  pushHist(); const N = { ...L, id: uid++, name: 'Vector · ' + L.name, canvas: nc, orig: nc, sx: L.sx / k, sy: L.sy / k };
  L.visible = false; S.layers.splice(S.layers.indexOf(L) + 1, 0, N); S.sel = N.id; afterStructure(); toast('Vector insertado. La capa original quedó oculta.');
}
async function vkSave() {
  const v = S.vec; if (!v) return; const svg = vecSvgString(v, true);
  if (!DL) { toast('La descarga no está disponible en esta vista. Abre el artefacto en claude.ai.', 5000); return; }
  try { await DL.save({ filename: 'vector-dtf.svg', data: svg }); toast('SVG guardado.'); } catch (e) { saveError(e); }
}
function saveError(e) { if (e && e.code === 'declined') toast('Descarga cancelada.'); else toast('No se pudo guardar: ' + (e && e.message ? e.message : 'error desconocido'), 5000); }

/* --- Escalar --- */
function setSizeFromInput(which) {
  const L = cur(); if (!L) return; const D = S.doc, v = parseFloat($('#sc' + which).value); if (!(v > 0)) { syncProps(); return; }
  const px = pxFrom(v, D.unit, D.dpi), lock = $('#scLock').checked; pushHist();
  if (which === 'W') { const f = px / layerPxW(L); L.sx = sgn(L.sx) * px / L.canvas.width; if (lock) L.sy *= f; }
  else { const f = px / layerPxH(L); L.sy = sgn(L.sy) * px / L.canvas.height; if (lock) L.sx *= f; }
  syncProps(); redraw(); renderLayers();
}
function fitLayer(all) {
  const L = needLayer(); if (!L) return; const D = S.doc; pushHist();
  const f = all ? Math.min(D.w / layerPxW(L), D.h / layerPxH(L)) : D.w / layerPxW(L);
  L.sx *= f; L.sy *= f; L.x = D.w / 2; if (all) L.y = D.h / 2; afterStructure();
}
async function resampleTo(L, nw, nh, label) {
  const w = L.canvas.width, h = L.canvas.height;
  if (nw < 1 || nh < 1) { toast('Tamaño no válido.'); return; }
  if (nw === w && nh === h) { toast('La capa ya tiene esa resolución.'); return; }
  await runOp('Remuestreando…', async prog => {
    const img = imgData(L.canvas), pm = await resizePremult(img.data, w, h, nw, nh, $('#scMethod').value, prog);
    commitResult(L, unPremultToCanvas(pm, nw, nh), label, true);
    toast('Listo: ' + nw + ' × ' + nh + ' px.');
  });
}

/* --- Mejorar resolución --- */
function syncEnhanceEstimate() {
  const L = cur(), el = $('#enEst'); if (!L) { el.textContent = 'Selecciona una capa.'; return; }
  const f = S.en.f, nw = Math.round(L.canvas.width * f), nh = Math.round(L.canvas.height * f);
  const big = nw * nh > 50e6;
  el.textContent = L.canvas.width + '×' + L.canvas.height + ' → ' + nw + '×' + nh + ' px · ' + Math.round(effDpi(L)) + ' → ' + Math.round(effDpi(L) * f) + ' dpi' + (big ? ' · demasiado grande' : '');
}
async function enhanceTo(L, f, label) {
  const w = L.canvas.width, h = L.canvas.height, nw = Math.round(w * f), nh = Math.round(h * f);
  if (nw * nh > 50e6) { toast('El resultado (' + nw + '×' + nh + ') es demasiado grande para el navegador. Usa un tamaño menor.', 5000); return; }
  await runOp('Mejorando resolución…', async prog => {
    const img = imgData(L.canvas); let cur = img.data; const den = +$('#enDen').value;
    if (den > 0) { prog(0.02, 'Reduciendo ruido…'); cur = await bilateral(img, den); }
    const steps = Math.max(1, Math.ceil(Math.log2(f) - 1e-9)); let cw = w, ch = h, nc = null;
    for (let st = 1; st <= steps; st++) {
      const tw = st === steps ? nw : Math.round(w * Math.pow(f, st / steps)), th = st === steps ? nh : Math.round(h * Math.pow(f, st / steps)), sf = tw / cw;
      prog((st - 1) / steps + 0.02, 'Ampliando (paso ' + st + ' de ' + steps + ')…');
      const pm = await resizePremult(cur, cw, ch, tw, th, 'lanczos', p => prog((st - 1 + 0.6 * p) / steps, 'Ampliando (paso ' + st + ' de ' + steps + ')…'));
      nc = await finishEnhance(pm, tw, th, { sharp: +$('#enSharp').value / 100 * (st === steps ? 1 : 0.6), sigma: Math.max(1, Math.round(sf * 0.7)), clean: $('#enClean').checked, gain: 3.5, cleanR: Math.max(1, Math.round(sf * 0.8)) });
      cur = imgData(nc).data; cw = tw; ch = th;
    }
    commitResult(L, nc, label, true);
    toast('Resolución mejorada: ' + nw + ' × ' + nh + ' px. Esto no inventa detalle: para logos de pocos colores, vectorizar da mejor resultado.', 6000);
  });
}
async function enRun() { const L = needLayer(); if (L) enhanceTo(L, S.en.f, L.name + ' ×' + S.en.f); }

/* --- Semitonos --- */
function syncHalftone() {
  htSchedule();
  const L = cur(), lpi = +$('#htLpi').value; $('#htInkWrap').hidden = S.ht.mode !== 'ink';
  $('#htCell').textContent = L ? 'celda ≈ ' + fmt(effDpi(L) / lpi, 1) + ' px' : '';
}
async function htRun() {
  const L = needLayer(); if (!L) return; const lpi = +$('#htLpi').value, cell = Math.max(3, effDpi(L) / lpi);
  await runOp('Creando semitonos…', async prog => {
    const o = { cell, angle: +$('#htAng').value, shape: $('#htShape').value, mode: S.ht.mode, ink: hexToRgb($('#htInk').value), src: $('#htSrc').value, invert: $('#htInv').checked, contrast: +$('#htCon').value / 100, gamma: +$('#htGam').value / 100, minR: +$('#htMin').value / 10 };
    const k = cell < 9 ? 3 : 2, W = L.canvas.width * k, H = L.canvas.height * k;
    if (W * H > 90e6) { if (o.mode === 'cmyk') { toast('Imagen demasiado grande para CMYK: reduce su tamaño.'); return; } const nc = await halftone(L.canvas, o, prog); commitResult(L, nc, L.name + ' (semitono)', false); toast('Semitonos creados (imagen grande: sin sobremuestreo).'); return; }
    const up = mk(W, H), ug = up.getContext('2d'); ug.imageSmoothingQuality = 'high'; ug.drawImage(L.canvas, 0, 0, W, H);
    const nc = await htCompose(up, { ...o, cell: cell * k, minR: o.minR * k }, prog); commitResult(L, nc, L.name + (o.mode === 'cmyk' ? ' (semitono CMYK)' : ' (semitono)'), true); HT.prev = null; redraw(); toast('Semitono aplicado a la capa.'); return;
    toast('Semitonos creados (' + fmt(cell, 1) + ' px por celda).');
  });
}

/* --- Capas mágicas --- */
async function mlRun() {
  const L = needLayer(); if (!L) return;
  await runOp('Separando capas…', async prog => {
    const w = L.canvas.width, h = L.canvas.height, img = imgData(L.canvas), n = w * h, items = [];
    const boxes = (lab, count) => { const b = Array.from({ length: count }, () => ({ x0: w, y0: h, x1: -1, y1: -1, a: 0 })); let i = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++, i++) { const l = lab[i]; if (l > 0) { const q = b[l - 1]; q.a++; if (x < q.x0) q.x0 = x; if (x > q.x1) q.x1 = x; if (y < q.y0) q.y0 = y; if (y > q.y1) q.y1 = y; } } return b; };
    if (S.ml.mode === 'color') {
      const cent = kmeans(img, +$('#mlK').value); if (!cent.length) throw new Error('la capa está vacía');
      let labels = await assignLabels(img, cent, p => prog(p * 0.4)); if ($('#mlClean').checked) labels = majority(labels, w, h, cent.length);
      prog(0.5); await sleep();
      const lab1 = new Int16Array(n); for (let i = 0; i < n; i++) lab1[i] = labels[i] + 1;
      const bx = boxes(lab1, cent.length), flat = $('#mlFlat').checked;
      const idx = cent.map((_, i) => i).filter(i => bx[i].a > 0).sort((a, b) => bx[b].a - bx[a].a);
      let s = 0;
      for (const c of idx) {
        const q = bx[c], reg = extractRegion(img, w, h, q, i => labels[i] === c, flat ? cent[c] : null);
        if (reg) items.push({ ...reg, name: 'Color ' + (items.length + 1) + ' ' + toHex(cent[c][0], cent[c][1], cent[c][2]).toUpperCase() });
        prog(0.5 + 0.45 * (++s / idx.length)); await sleep();
      }
    } else {
      const d = img.data, mask = new Uint8Array(n); for (let i = 0; i < n; i++) mask[i] = d[i * 4 + 3] > 8 ? 1 : 0;
      prog(0.15); await sleep();
      const dil = dilateSquare(mask, w, h, +$('#mlGap').value); prog(0.3); await sleep();
      const { lab, count, areas } = ccl(dil, w, h); prog(0.5); await sleep();
      if (!count) throw new Error('no hay píxeles visibles');
      const bx = boxes(lab, count); let total = 0; for (let c = 1; c <= count; c++) total += areas[c];
      const minA = (+$('#mlMinA').value / 100 / 100) * total;
      const ids = []; for (let c = 1; c <= count; c++) ids.push(c); ids.sort((a, b) => areas[b] - areas[a]);
      const keep = new Uint8Array(count + 1); let kept = 0;
      for (const c of ids) { if (kept >= 60 || areas[c] < minA) break; keep[c] = 1; kept++; }
      if (!kept) { keep[ids[0]] = 1; kept = 1; }
      let s = 0;
      for (const c of ids) {
        if (!keep[c]) continue; const reg = extractRegion(img, w, h, bx[c - 1], i => mask[i] === 1 && lab[i] === c, null);
        if (reg) items.push({ ...reg, name: 'Objeto ' + (items.length + 1) });
        prog(0.5 + 0.4 * (++s / kept)); await sleep();
      }
      if (kept < count) {
        let x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (let c = 1; c <= count; c++) if (!keep[c] && bx[c - 1].a > 0) { const q = bx[c - 1]; x0 = Math.min(x0, q.x0); y0 = Math.min(y0, q.y0); x1 = Math.max(x1, q.x1); y1 = Math.max(y1, q.y1); }
        if (x1 >= 0) { const reg = extractRegion(img, w, h, { x0, y0, x1, y1 }, i => mask[i] === 1 && !keep[lab[i]], null); if (reg) items.push({ ...reg, name: 'Restos' }); }
      }
    }
    if (!items.length) throw new Error('no se pudo separar nada');
    pushHist();
    const a = L.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a); let pos = S.layers.indexOf(L) + 1, last = null;
    for (const it of items) {
      const u = (it.x0 + it.cw / 2 - w / 2) * L.sx, v = (it.y0 + it.ch / 2 - h / 2) * L.sy;
      const N = { ...L, id: uid++, name: it.name, canvas: it.canvas, orig: it.canvas, x: L.x + u * ca - v * sa, y: L.y + u * sa + v * ca };
      S.layers.splice(pos++, 0, N); last = N;
    }
    L.visible = false; S.sel = last.id; afterStructure();
    toast(items.length + ' capas creadas. La original quedó oculta.');
  });
}

/* ============ Lienzo (documento) ============ */
function applyDocSize() {
  const D = S.doc, unit = $('#cvUnit').value, ndpi = +$('#cvDpi').value, w = parseFloat($('#cvW').value), h = parseFloat($('#cvH').value);
  if (!(w > 0 && h > 0)) { toast('Escribe un ancho y un alto válidos.'); return; }
  const pw = Math.round(pxFrom(w, unit, ndpi)), ph = Math.round(pxFrom(h, unit, ndpi));
  if (pw < 16 || ph < 16 || pw > 60000 || ph > 60000) { toast('Tamaño fuera de rango (16 a 60 000 px por lado).'); return; }
  pushHist();
  if (ndpi !== D.dpi) { const f = ndpi / D.dpi; for (const L of S.layers) { L.x *= f; L.y *= f; L.sx *= f; L.sy *= f; } }
  D.unit = unit; D.dpi = ndpi; D.w = pw; D.h = ph; afterStructure(); fitView();
}
function syncCanvasPanel() {
  const D = S.doc, dec = D.unit === 'px' ? 0 : 2;
  if (document.activeElement.id !== 'cvW') $('#cvW').value = fmt(toUnit(D.w, D.unit, D.dpi), dec);
  if (document.activeElement.id !== 'cvH') $('#cvH').value = fmt(toUnit(D.h, D.unit, D.dpi), dec);
  $('#cvUnit').value = D.unit; $('#cvDpi').value = String(D.dpi);
  $('#cvInfo').textContent = D.w + ' × ' + D.h + ' px';
  $$('.un').forEach(e => { e.textContent = D.unit; });
}
function syncStatus() {
  const D = S.doc, u = D.unit, dec = u === 'px' ? 0 : 1;
  const txt = fmt(toUnit(D.w, u, D.dpi), dec) + ' × ' + fmt(toUnit(D.h, u, D.dpi), dec) + ' ' + u + ' · ' + D.dpi + ' dpi';
  $('#stDoc').textContent = txt; $('#hudtag').textContent = txt;
  const L = cur(); $('#stSel').innerHTML = L ? 'Capa <b>' + L.name.replace(/[<>&]/g, '') + '</b> · ' + L.canvas.width + '×' + L.canvas.height + ' px · ' + Math.round(effDpi(L)) + ' dpi efectivos' : '';
}
function shiftAll(dx, dy) { for (const L of S.layers) { L.x += dx; L.y += dy; } }
function cvTrim() {
  const b = contentBounds(); if (!b) { toast('No hay contenido visible.'); return; }
  const D = S.doc, m = pxFrom(+$('#cvMargin').value || 0, 'mm', D.dpi); pushHist();
  shiftAll(-b.x + m, -b.y + m); D.w = Math.max(16, Math.round(b.w + 2 * m)); D.h = Math.max(16, Math.round(b.h + 2 * m)); afterStructure(); fitView();
}
function cvCenter() {
  const b = contentBounds(); if (!b) { toast('No hay contenido visible.'); return; }
  pushHist(); shiftAll(S.doc.w / 2 - (b.x + b.w / 2), S.doc.h / 2 - (b.y + b.h / 2)); afterStructure();
}

/* ============ Importar ============ */
async function fileToCanvas(f) {
  const isSvg = f.type === 'image/svg+xml' || /\.svg$/i.test(f.name); let src, w, h;
  if (isSvg) {
    const url = URL.createObjectURL(f), im = new Image(); im.src = url; await im.decode().catch(() => { throw new Error('SVG no válido'); });
    w = im.naturalWidth || 1000; h = im.naturalHeight || 1000; const k = w < 1500 ? 2400 / w : 1; w = Math.round(w * k); h = Math.round(h * k); src = im;
    const c = mk(w, h); c.getContext('2d').drawImage(im, 0, 0, w, h); URL.revokeObjectURL(url); return c;
  }
  const bmp = await createImageBitmap(f); w = bmp.width; h = bmp.height;
  const k = Math.min(1, 12000 / Math.max(w, h), Math.sqrt(90e6 / (w * h))); const c = mk(w * k, h * k), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(bmp, 0, 0, c.width, c.height); bmp.close && bmp.close(); return c;
}
async function importFiles(files) {
  const list = Array.from(files).filter(f => /^image\//.test(f.type) || /\.svg$/i.test(f.name)); if (!list.length) { toast('Ese archivo no es una imagen.'); return; }
  for (const f of list) {
    await runOp('Importando ' + f.name + '…', async () => { const c = await fileToCanvas(f); pushHist(); addLayer(c, f.name.replace(/\.[^.]+$/, '') || 'Imagen'); afterStructure(); });
  }
  if (S.layers.length) toast('Imagen importada. Se colocó a su tamaño real según los DPI del lienzo.');
}

function makeSample() {
  const W = 2400, c = mk(W, W), g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, W); g.scale(1.5, 1.5);
  const gr = g.createLinearGradient(0, 100, 0, 1500); gr.addColorStop(0, '#ff8a3d'); gr.addColorStop(0.55, '#d6246e'); gr.addColorStop(1, '#4b1d8f');
  g.fillStyle = gr; g.beginPath(); g.arc(800, 800, 700, 0, 7); g.fill();
  g.lineWidth = 16; g.strokeStyle = '#fff3dc'; g.beginPath(); g.arc(800, 800, 662, 0, 7); g.stroke();
  const sg = g.createRadialGradient(800, 600, 10, 800, 600, 230); sg.addColorStop(0, '#fff6b0'); sg.addColorStop(1, '#ffb01f'); g.fillStyle = sg; g.beginPath(); g.arc(800, 600, 215, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(800, 800, 645, 0, 7); g.clip();
  g.fillStyle = '#1f8a8a'; g.beginPath(); g.moveTo(120, 1060); g.lineTo(560, 560); g.lineTo(860, 980); g.lineTo(1100, 700); g.lineTo(1480, 1060); g.closePath(); g.fill();
  g.fillStyle = '#1b2a6b'; g.beginPath(); g.moveTo(80, 1220); g.lineTo(470, 780); g.lineTo(760, 1130); g.lineTo(1040, 830); g.lineTo(1520, 1220); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(470, 780); g.lineTo(405, 855); g.lineTo(445, 840); g.lineTo(470, 880); g.lineTo(500, 840); g.lineTo(540, 855); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(1040, 830); g.lineTo(975, 905); g.lineTo(1015, 890); g.lineTo(1040, 930); g.lineTo(1070, 890); g.lineTo(1110, 905); g.closePath(); g.fill();
  g.fillStyle = '#2a1260'; g.fillRect(0, 1060, 1600, 600);
  g.restore();
  g.fillStyle = '#fff3dc'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = '900 190px Impact, "Arial Black", sans-serif'; g.fillText('MONTAÑA', 800, 1235);
  g.font = '700 62px "Arial Black", Arial, sans-serif'; try { g.letterSpacing = '16px'; } catch (e) { } g.fillText('CLUB · 2026', 800, 1330);
  return c;
}

/* ============ Exportación ============ */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
async function injectPhys(blob, dpi) {
  const buf = new Uint8Array(await blob.arrayBuffer()), ppm = Math.round(dpi / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1; dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const sr = new Uint8Array(13), sv = new DataView(sr.buffer); sv.setUint32(0, 1); sr.set([0x73, 0x52, 0x47, 0x42], 4); sr[8] = 0; sv.setUint32(9, crc32(sr.subarray(4, 9)));
  return new Blob([buf.subarray(0, 33), sr, chunk, buf.subarray(33)], { type: 'image/png' });
}
async function deflate(u8) {
  if (typeof CompressionStream === 'undefined') throw new Error('tu navegador no puede comprimir PDF; exporta en PNG');
  const stream = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate')); return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function makePDF(canvas, dpi, transparent, prog) {
  const w = canvas.width, h = canvas.height, n = w * h, d = canvas.getContext('2d').getImageData(0, 0, w, h).data;
  const rgb = new Uint8Array(n * 3); let alpha = transparent ? new Uint8Array(n) : null, hasAlpha = false;
  for (let i = 0; i < n; i++) { const k = i * 4; rgb[i * 3] = d[k]; rgb[i * 3 + 1] = d[k + 1]; rgb[i * 3 + 2] = d[k + 2]; if (alpha) { const a = d[k + 3]; alpha[i] = a; if (a !== 255) hasAlpha = true; } }
  prog(0.5, 'Comprimiendo imagen…'); const zrgb = await deflate(rgb); let zal = null;
  if (alpha && hasAlpha) { prog(0.7, 'Comprimiendo transparencia…'); zal = await deflate(alpha); }
  const PW = (w / dpi * 72).toFixed(3), PH = (h / dpi * 72).toFixed(3), enc = new TextEncoder(), parts = [], offs = []; let off = 0;
  const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); off += b.length; };
  const obj = (num, dict, bytes) => { offs[num] = off; if (bytes) { push(num + ' 0 obj\n<< ' + dict + ' /Length ' + bytes.length + ' >>\nstream\n'); push(bytes); push('\nendstream\nendobj\n'); } else push(num + ' 0 obj\n' + dict + '\nendobj\n'); };
  push('%PDF-1.4\n%âãÏÓ\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>');
  const content = enc.encode('q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q'); obj(4, '', content);
  obj(5, '/Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace [/CalRGB << /WhitePoint [0.9505 1 1.089] /Gamma [2.2 2.2 2.2] /Matrix [0.4124 0.2126 0.0193 0.3576 0.7152 0.1192 0.1805 0.0722 0.9505] >>] /BitsPerComponent 8 /Filter /FlateDecode' + (zal ? ' /SMask 6 0 R' : ''), zrgb);
  if (zal) obj(6, '/Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode', zal);
  obj(7, '<< /Title (Diseno DTF) /Producer (Preprensa DTF) >>');
  const count = 8, xr = off; let x = 'xref\n0 ' + count + '\n0000000000 65535 f \n';
  for (let i = 1; i < count; i++) x += (offs[i] != null ? String(offs[i]).padStart(10, '0') : '0000000000') + (offs[i] != null ? ' 00000 n \n' : ' 65535 f \n');
  push(x + 'trailer\n<< /Size ' + count + ' /Root 1 0 R /Info 7 0 R >>\nstartxref\n' + xr + '\n%%EOF\n');
  return new Blob(parts, { type: 'application/pdf' });
}
const EX = { fmt: 'png' };
function exOpts() {
  const bgSel = $('#exBg').value; return {
    dpi: +$('#exDpi').value, trim: $('#exArea').value === 'trim' || ($('#exMode').value === 'sub' && ($('#exMarks').checked || $('#exBleed').checked)), margin: +$('#exMargin').value || 0,
    sub: $('#exMode').value === 'sub', boost: clamp(+$('#exBoost').value || 0, 0, 60), marks: $('#exMode').value === 'sub' && $('#exMarks').checked, bleed: $('#exMode').value === 'sub' && $('#exBleed').checked, hard: $('#exHard').checked, cut: clamp(+$('#exCut').value || 50, 1, 99), bg: bgSel === 'none' ? null : bgSel === 'custom' ? $('#exBgColor').value : bgSel, mirror: $('#exMirror').checked,
  };
}
function exportArea(o) {
  const D = S.doc; if (!o.trim) return { x: 0, y: 0, w: D.w, h: D.h };
  const b = contentBounds(); if (!b) return null; const m = pxFrom((o.marks || o.bleed) ? Math.max(o.margin, 8) : o.margin, 'mm', D.dpi);
  const x0 = Math.max(0, b.x - m), y0 = Math.max(0, b.y - m), x1 = Math.min(D.w, b.x + b.w + m), y1 = Math.min(D.h, b.y + b.h + m);
  if (x1 <= x0 || y1 <= y0) return null; return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function renderExport(o) {
  const D = S.doc, A = exportArea(o); if (!A) throw new Error('no hay contenido visible dentro del lienzo');
  const sc = o.dpi / D.dpi, cw = Math.round(A.w * sc), ch = Math.round(A.h * sc);
  if (cw * ch > 130e6 || cw > 32000 || ch > 32000) throw new Error('el archivo sería demasiado grande (' + cw + '×' + ch + ' px). Baja los DPI o recorta al diseño');
  const c = mk(cw, ch), g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; if (!o.bg && S.doc.bg) o = { ...o, bg: S.doc.bg }; if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, cw, ch); }
  if (o.mirror) { g.translate(cw, 0); g.scale(-1, 1); }
  g.scale(cw / A.w, ch / A.h); g.translate(-A.x, -A.y);
  for (const L of S.layers) if (L.visible) drawLayer(g, L, 0);
  if (o.bleed) {
    const b = contentBounds(), k = cw / A.w;
    if (b) {
      let bx = Math.round((b.x - A.x) * k), by = Math.round((b.y - A.y) * k); const bw = Math.round(b.w * k), bh = Math.round(b.h * k);
      if (o.mirror) bx = cw - bx - bw;
      if (bx >= 0 && by >= 0 && bw > 1 && bh > 1 && bx + bw <= cw && by + bh <= ch) {
        const tmp = mk(cw, ch), tg = tmp.getContext('2d'); tg.drawImage(c, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
        if (bx > 0) g.drawImage(tmp, bx, by, 1, bh, 0, by, bx, bh);
        if (bx + bw < cw) g.drawImage(tmp, bx + bw - 1, by, 1, bh, bx + bw, by, cw - bx - bw, bh);
        if (by > 0) g.drawImage(tmp, bx, by, bw, 1, bx, 0, bw, by);
        if (by + bh < ch) g.drawImage(tmp, bx, by + bh - 1, bw, 1, bx, by + bh, bw, ch - by - bh);
        for (const [sx, sy, dx, dy, dw, dh] of [[bx, by, 0, 0, bx, by], [bx + bw - 1, by, bx + bw, 0, cw - bx - bw, by], [bx, by + bh - 1, 0, by + bh, bx, ch - by - bh], [bx + bw - 1, by + bh - 1, bx + bw, by + bh, cw - bx - bw, ch - by - bh]]) if (dw > 0 && dh > 0) { const px = tg.getImageData(sx, sy, 1, 1).data; g.fillStyle = 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')'; g.fillRect(dx, dy, dw, dh); }
        g.restore();
      }
    }
  }
  if (o.marks) { const b = contentBounds(), mm = v => v / 25.4 * D.dpi; if (b) { g.strokeStyle = '#000'; g.lineWidth = D.dpi / 72 * 0.5; g.beginPath(); for (const [cx, cy, sx, sy] of [[b.x, b.y, -1, -1], [b.x + b.w, b.y, 1, -1], [b.x, b.y + b.h, -1, 1], [b.x + b.w, b.y + b.h, 1, 1]]) { g.moveTo(cx + sx * mm(2), cy); g.lineTo(cx + sx * mm(7), cy); g.moveTo(cx, cy + sy * mm(2)); g.lineTo(cx, cy + sy * mm(7)); } g.stroke(); } }
  if (o.sub && o.boost > 0) { const id = g.getImageData(0, 0, cw, ch), d = id.data, sa = 1 + o.boost / 100, br = 1 + o.boost / 200; for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = (l + (d[i] - l) * sa) * br; d[i + 1] = (l + (d[i + 1] - l) * sa) * br; d[i + 2] = (l + (d[i + 2] - l) * sa) * br; } g.putImageData(id, 0, 0); }
  if (o.hard && !o.bg) { g.setTransform(1, 0, 0, 1, 0, 0); const id = g.getImageData(0, 0, cw, ch), d = id.data, t = o.cut * 2.55; for (let i = 3; i < d.length; i += 4) d[i] = d[i] < t ? 0 : 255; g.putImageData(id, 0, 0); }
  return { canvas: c, A, cw, ch };
}
function syncExport() {
  const o = exOpts(), D = S.doc, A = exportArea(o), est = $('#exEst'), go = $('#exGo');
  $('#exBgColorWrap').hidden = $('#exBg').value !== 'custom'; $('#exMarginWrap').hidden = !o.trim;
  $('#exNote').textContent = EX.fmt === 'pdf' ? 'El PDF tiene el tamaño físico exacto del diseño, la imagen a la resolución elegida y conserva la transparencia.' : 'El PNG incluye los DPI en el archivo para que el RIP lo lea a tamaño real. Con fondo transparente conserva el canal alfa.';
  if (!A) { est.textContent = 'No hay contenido visible para exportar.'; go.disabled = true; return; }
  const sc = o.dpi / D.dpi, cw = Math.round(A.w * sc), ch = Math.round(A.h * sc), mp = cw * ch / 1e6, big = cw * ch > 130e6 || cw > 32000 || ch > 32000;
  const wcm = A.w / D.dpi * 2.54, hcm = A.h / D.dpi * 2.54;
  let low = Infinity; for (const L of S.layers) if (L.visible) low = Math.min(low, effDpi(L));
  est.innerHTML = 'Tamaño: ' + fmt(wcm, 1) + ' × ' + fmt(hcm, 1) + ' cm<br>Píxeles: ' + cw + ' × ' + ch + ' (' + fmt(mp, 1) + ' MP)' + (big ? '<br><span style="color:var(--bad)">Demasiado grande: baja los DPI o recorta al diseño.</span>' : '') + (low < 150 ? '<br><span style="color:var(--warn)">Hay capas con menos de 150 dpi efectivos: se verán pixeladas. Usa Mejorar resolución.</span>' : '');
  if (S.layers.some(l => l.visible && Math.abs(Math.abs(l.sx) - 1) > 0.001)) est.innerHTML += '<br><span style="color:var(--warn)">Hay capas escaladas sin remuestrear: se interpolan al exportar. Usa «Remuestrear» en Escalar para controlar la calidad.</span>';
  go.disabled = big;
}
function openExport() { if (!S.layers.some(l => l.visible)) { toast('No hay capas visibles para exportar.'); return; } $('#exFallback').hidden = true; $('#exModal').hidden = false; syncExport(); }
async function doExport() {
  const o = exOpts(), fmtSel = EX.fmt;
  const res = await runOp('Preparando archivo…', async prog => {
    prog(0.05, 'Componiendo capas…'); await sleep();
    const r = renderExport(o); prog(0.25, 'Codificando…'); await sleep();
    let blob;
    if (fmtSel === 'png') { blob = await new Promise(rs => r.canvas.toBlob(rs, 'image/png')); if (!blob) throw new Error('el navegador no pudo codificar el PNG'); blob = await injectPhys(blob, o.dpi); }
    else blob = await makePDF(r.canvas, o.dpi, !o.bg, prog);
    const wcm = fmt(r.A.w / S.doc.dpi * 2.54, 1), hcm = fmt(r.A.h / S.doc.dpi * 2.54, 1);
    return { blob, name: (o.sub ? 'diseno-sub_' : 'diseno-dtf_') + wcm + 'x' + hcm + 'cm_' + o.dpi + 'dpi.' + fmtSel };
  });
  if (!res) return;
  if (!DL) {
    const box = $('#exFallback'); box.hidden = false; box.textContent = '';
    const p = document.createElement('p'); p.className = 'hint'; box.appendChild(p);
    if (fmtSel === 'png') { p.textContent = 'La descarga directa no está disponible en esta vista. Haz clic derecho (o mantén pulsado) sobre la imagen y elige «Guardar imagen». Para descargar con un clic abre este artefacto en claude.ai.'; const im = new Image(); im.src = URL.createObjectURL(res.blob); im.alt = 'Vista del PNG exportado'; box.appendChild(im); }
    else p.textContent = 'La descarga directa no está disponible en esta vista. Abre este artefacto en claude.ai para exportar el PDF.';
    return;
  }
  try { await DL.save({ filename: res.name, data: res.blob }); toast('Archivo listo: ' + res.name, 4500); $('#exModal').hidden = true; } catch (e) { saveError(e); }
}

/* ============ Interacción ============ */
const pointers = new Map(); let drag = null;
const lp = e => { const r = view.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
function setCursor() { view.style.cursor = (S.tool === 'hand' || S.space) ? 'grab' : (S.tool === 'erase' || S.tool === 'clean' || (S.tool === 'remove' && S.rb.mode === 'color')) ? 'crosshair' : 'default'; }
let propT = 0; function syncPropsSoon() { if (propT) return; propT = requestAnimationFrame(() => { propT = 0; syncProps(); syncStatus(); }); }

view.addEventListener('pointerdown', e => {
  view.setPointerCapture(e.pointerId); const p = lp(e); pointers.set(e.pointerId, p);
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; drag = { type: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, v0: { ...S.view }, c0: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; return; }
  if (pointers.size > 2) return;
  if (e.button === 1 || S.tool === 'hand' || S.space) { drag = { type: 'pan', p0: p, v0: { ...S.view } }; view.style.cursor = 'grabbing'; return; }
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const [dx, dy] = s2d(p[0], p[1]);
  if (S.tool === 'remove' && S.rb.mode === 'color') { pickRemove(dx, dy); return; }
  if (S.tool === 'clean') { cleanDown(dx, dy); return; }
  if (S.tool === 'erase') { eraserDown(dx, dy); return; }
  const L = cur();
  if (L && L.visible && handles) {
    if (Math.hypot(p[0] - handles.rot[0], p[1] - handles.rot[1]) < 13) { const c = handles.center; drag = { type: 'rot', L, a0: Math.atan2(p[1] - c[1], p[0] - c[0]), rot0: L.rot, c, snap: snap(), moved: false }; return; }
    for (const q of handles.corners) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 11) { const c = handles.center; drag = { type: 'scale', L, d0: Math.hypot(p[0] - c[0], p[1] - c[1]) || 1, sx0: L.sx, sy0: L.sy, c, snap: snap(), moved: false }; return; }
  }
  const hit = hitLayer(dx, dy);
  if (hit) { if (S.sel !== hit.id) { S.sel = hit.id; renderLayers(); syncProps(); } drag = { type: 'move', L: hit, s: [dx, dy], x0: hit.x, y0: hit.y, snap: snap(), moved: false, p0: p }; redraw(); }
  else if (S.sel) { S.sel = null; renderLayers(); syncProps(); syncStatus(); redraw(); }
});
view.addEventListener('pointermove', e => {
  const p = lp(e); if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
  hud = p; const [dx, dy] = s2d(p[0], p[1]), D = S.doc;
  $('#stCur').textContent = fmt(toUnit(dx, D.unit, D.dpi), D.unit === 'px' ? 0 : 1) + ', ' + fmt(toUnit(dy, D.unit, D.dpi), D.unit === 'px' ? 0 : 1) + ' ' + D.unit;
  if (!drag) { if ((S.tool === 'erase' && (S.er.mode === 'brush' || S.er.mode === 'restore')) || S.tool === 'clean') redraw(); return; }
  const startMove = () => { if (!drag.moved) { drag.moved = true; S.hist.push(drag.snap); if (S.hist.length > 40) S.hist.shift(); S.redo = []; syncUndo(); } };
  switch (drag.type) {
    case 'pinch': { if (pointers.size < 2) break; const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], z = clamp(drag.v0.z * d / drag.d0, 0.005, 40), k = z / drag.v0.z; S.view.z = z; S.view.x = c[0] - (drag.c0[0] - drag.v0.x) * k; S.view.y = c[1] - (drag.c0[1] - drag.v0.y) * k; redraw(); break; }
    case 'pan': S.view.x = drag.v0.x + p[0] - drag.p0[0]; S.view.y = drag.v0.y + p[1] - drag.p0[1]; redraw(); break;
    case 'move': if (!drag.moved && Math.hypot(p[0] - drag.p0[0], p[1] - drag.p0[1]) < 3) break; startMove(); drag.L.x = drag.x0 + (dx - drag.s[0]); drag.L.y = drag.y0 + (dy - drag.s[1]); redraw(); syncPropsSoon(); break;
    case 'scale': { startMove(); const f = clamp((Math.hypot(p[0] - drag.c[0], p[1] - drag.c[1]) || 1) / drag.d0, 0.02, 60); drag.L.sx = drag.sx0 * f; drag.L.sy = drag.sy0 * f; redraw(); syncPropsSoon(); break; }
    case 'rot': { startMove(); let r = drag.rot0 + (Math.atan2(p[1] - drag.c[1], p[0] - drag.c[0]) - drag.a0) * 180 / Math.PI; if (e.shiftKey) r = Math.round(r / 15) * 15; r = ((r + 180) % 360 + 360) % 360 - 180; drag.L.rot = Math.round(r * 10) / 10; redraw(); syncPropsSoon(); break; }
    case 'brush': brushTo(dx, dy); break;
    case 'heal': healTo(dx, dy); break;
  }
});
function endPointer(e) {
  pointers.delete(e.pointerId);
  if (drag && drag.type === 'pinch') { if (pointers.size < 2) drag = null; return; }
  if (!drag) return;
  if (drag.type === 'heal') { const hd = drag; drag = null; finishHeal(hd); return; }
  if (drag.type === 'brush') { tightCache.delete(drag.L.canvas); drag = null; renderLayers(); syncStatus(); redraw(); return; }
  if (drag.type === 'move' || drag.type === 'scale' || drag.type === 'rot') { if (drag.moved) { renderLayers(); syncStatus(); } }
  drag = null; setCursor();
}
view.addEventListener('pointerup', endPointer); view.addEventListener('pointercancel', endPointer);
view.addEventListener('pointerleave', () => { hud = null; redraw(); });
view.addEventListener('wheel', e => { e.preventDefault(); const p = lp(e); zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p[0], p[1]); }, { passive: false });
view.addEventListener('contextmenu', e => e.preventDefault());

const stage = $('#stage');
['dragenter', 'dragover'].forEach(t => stage.addEventListener(t, e => { if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) { e.preventDefault(); $('#dropring').hidden = false; } }));
['dragleave', 'drop'].forEach(t => stage.addEventListener(t, () => { $('#dropring').hidden = true; }));
stage.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) importFiles(e.dataTransfer.files); });
const onPaste = e => { const fs = e.clipboardData && e.clipboardData.files; if (fs && fs.length) { e.preventDefault(); importFiles(fs); } };
  document.addEventListener('paste', onPaste);
  cleanups.push(() => document.removeEventListener('paste', onPaste));

/* ============ Herramientas y paneles ============ */
const NEW_TOOLS = ['remove', 'scale', 'enhance', 'halftone', 'alpha'];
function setTool(t) {
  S.tool = t;
  $$('#rail button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === t ? 'true' : 'false'));
  $$('#panel .card[data-tool]').forEach(c => { c.hidden = c.dataset.tool !== t; });
  $('#newRow').hidden = !NEW_TOOLS.includes(t);
  HT.prev = null; if (t === 'alpha') apSchedule();
  setCursor(); syncHalftone(); syncEnhanceEstimate(); syncCanvasPanel(); redraw();
}
function bindUI() {
  $$('#rail button').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
  $('#btnImport').onclick = () => $('#fileIn').click();
  $('#fileIn').onchange = e => { if (e.target.files.length) importFiles(e.target.files); e.target.value = ''; };
  $('#btnUndo').onclick = undo; $('#btnRedo').onclick = redo; $('#btnExport').onclick = openExport;
  $('#zIn').onclick = () => zoomAt(1.25); $('#zOut').onclick = () => zoomAt(0.8); $('#zFit').onclick = fitView;
  bindProps();
  // Quitar fondo
  rng('rbTol'); rng('rbSoft'); rng('rbChoke');
  seg('rbMode', v => {
    S.rb.mode = v; $('#rbKeyRow').hidden = v !== 'color'; $('#rbRun').hidden = v === 'color';
    $('#rbHint').textContent = v === 'auto' ? 'Detecta el color de los bordes de la imagen y lo elimina. Funciona mejor con fondos lisos.' : 'Haz clic sobre el color que quieres quitar. Se aplica al instante y puedes deshacerlo.';
    $('#rbContigLab').textContent = v === 'auto' ? 'Solo la zona conectada con el borde' : 'Solo la zona conectada al punto';
    setCursor();
  });
  $('#rbRun').onclick = () => { const L = needLayer(); if (L) doRemove(L, null, null); };
  // Borrador
  rng('erTol'); rng('erSoft'); rng('erSize'); rng('erHard');
  seg('erMode', v => {
    S.er.mode = v; $('#erWandOpts').hidden = !(v === 'wand' || v === 'global'); $('#erBrushOpts').hidden = (v === 'wand' || v === 'global');
    $('#erHint').textContent = { wand: 'Haz clic en la imagen: borra la zona contigua de color parecido.', global: 'Haz clic en la imagen: borra ese color en toda la capa, incluso las zonas interiores.', brush: 'Pinta sobre la imagen para borrar a mano.', restore: 'Pinta para recuperar lo que borraste (usa la imagen original de la capa).' }[v];
    setCursor(); redraw();
  });
  // Vectorizar
  rng('vkK'); rng('vkThr'); rng('vkSmooth'); rng('vkSpeck');
  seg('vkMode', v => { S.vk.mode = v; $('#vkColorOpts').hidden = v !== 'color'; $('#vkMonoOpts').hidden = v !== 'mono'; });
  $('#vkRun').onclick = vkRun; $('#vkInsert').onclick = vkInsert; $('#vkSave').onclick = vkSave;
  // Escalar
  $('#scW').onchange = () => setSizeFromInput('W'); $('#scH').onchange = () => setSizeFromInput('H');
  $('#scFitW').onclick = () => fitLayer(false); $('#scFitAll').onclick = () => fitLayer(true);
  $('#scResample').onclick = () => { const L = needLayer(); if (L) resampleTo(L, Math.round(layerPxW(L)), Math.round(layerPxH(L)), L.name + ' (' + S.doc.dpi + ' dpi)'); };
  $('#scFactorRun').onclick = () => { const L = needLayer(); if (!L) return; const f = parseFloat($('#scFactor').value); if (!(f > 0)) { toast('Factor no válido.'); return; } resampleTo(L, Math.round(L.canvas.width * f), Math.round(L.canvas.height * f), L.name + ' ×' + f); };
  $('#scPxRun').onclick = () => { const L = needLayer(); if (!L) return; let nw = parseInt($('#scPxW').value), nh = parseInt($('#scPxH').value); const r = L.canvas.height / L.canvas.width; if (nw > 0 && !(nh > 0)) nh = Math.round(nw * r); else if (nh > 0 && !(nw > 0)) nw = Math.round(nh / r); else if (nw > 0 && nh > 0 && $('#scLock').checked) nh = Math.round(nw * r); if (!(nw > 0 && nh > 0)) { toast('Escribe el ancho o el alto en píxeles.'); return; } resampleTo(L, nw, nh, L.name + ' (' + nw + '×' + nh + ')'); };
  // Mejorar
  rng('enSharp'); rng('enDen'); rng('clSize');
  seg('enF', v => { S.en.f = +v; syncEnhanceEstimate(); });
  $('#enRun').onclick = enRun;
  $('#enTargetRun').onclick = () => { const L = needLayer(); if (!L) return; const t = parseInt($('#enTarget').value), m = Math.max(L.canvas.width, L.canvas.height); if (!(t > m)) { toast('La imagen ya mide ' + m + ' px de lado largo o más.'); return; } enhanceTo(L, t / m, L.name + ' → ' + t + ' px'); };
  // Semitonos
  rng('htLpi').addEventListener('input', syncHalftone); rng('htAng'); rng('htCon'); rng('htGam', v => (v / 100).toFixed(1)); rng('htMin', v => (v / 10).toFixed(1));
  seg('htMode', v => { S.ht.mode = v; syncHalftone(); });
  $('#htRun').onclick = htRun;
  // Capas mágicas
  rng('mlK'); rng('mlGap'); rng('mlMinA', v => (v / 100).toFixed(2));
  seg('mlMode', v => {
    S.ml.mode = v; $('#mlColorOpts').hidden = v !== 'color'; $('#mlObjOpts').hidden = v !== 'obj';
    $('#mlHint').textContent = v === 'color' ? 'Separa la imagen en una capa por cada color dominante. Al apilarlas se obtiene la imagen original.' : 'Separa cada pieza independiente (letras, figuras, stickers) en su propia capa.';
  });
  $('#mlRun').onclick = mlRun;
  // Lienzo
  $('#cvApply').onclick = applyDocSize; $('#cvTrim').onclick = cvTrim; $('#cvCenter').onclick = cvCenter;
  $('#cvPreset').onchange = e => { const v = e.target.value; if (!v) return; const [w, h] = v.split('x'); $('#cvUnit').value = 'cm'; $('#cvW').value = w; $('#cvH').value = h; applyDocSize(); e.target.value = ''; };
  $('#cvUnit').onchange = () => { const D = S.doc, u = $('#cvUnit').value, dec = u === 'px' ? 0 : 2; $('#cvW').value = fmt(toUnit(D.w, u, +$('#cvDpi').value || D.dpi), dec); $('#cvH').value = fmt(toUnit(D.h, u, +$('#cvDpi').value || D.dpi), dec); };
  $('#cvPrev').onchange = e => { const v = e.target.value; $('#cvPrevColor').hidden = v !== 'custom'; S.doc.preview = v === 'custom' ? $('#cvPrevColor').value : v; redraw(); };
  $('#cvPrevColor').oninput = e => { S.doc.preview = e.target.value; redraw(); };
  $('#cvGrid').onchange = e => { S.doc.grid = e.target.checked; redraw(); };
  $('#cvGridStep').oninput = e => { const v = parseFloat(e.target.value); if (v > 0) { S.doc.gridStep = v; redraw(); } };
  $('#cvMarginOn').onchange = e => { S.doc.marginOn = e.target.checked; redraw(); };
  $('#cvMargin').oninput = e => { const v = parseFloat(e.target.value); if (v >= 0) { S.doc.margin = v; redraw(); } };
  // Exportar
  seg('exFmt', v => { EX.fmt = v; syncExport(); });
  ['exDpi', 'exArea', 'exBg', 'exBgColor', 'exMargin', 'exMirror'].forEach(id => $('#' + id).addEventListener('input', syncExport));
  ['exDpi', 'exArea', 'exBg'].forEach(id => $('#' + id).addEventListener('change', syncExport));
  $('#exClose').onclick = $('#exCancel').onclick = () => { $('#exModal').hidden = true; };
  $('#exModal').addEventListener('pointerdown', e => { if (e.target === $('#exModal')) $('#exModal').hidden = true; });
  $('#exGo').onclick = doExport;
}

const onKeyDown = e => {
  if (e.key === ' ' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) { S.space = true; setCursor(); e.preventDefault(); return; }
  const typing = /INPUT|SELECT|TEXTAREA/.test(e.target.tagName); if (e.key === 'Escape') { $('#exModal').hidden = true; }
  if (typing || !$('#exModal').hidden) return;
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && k === 'y') { e.preventDefault(); redo(); return; }
  if (mod) return;
  const map = { v: 'move', h: 'hand', b: 'remove', e: 'erase', t: 'vector', s: 'scale', u: 'enhance', d: 'halftone', m: 'magic', c: 'canvas' };
  if (map[k]) { setTool(map[k]); return; }
  if (k === '0') { fitView(); return; } if (k === '+' || k === '=') { zoomAt(1.25); return; } if (k === '-') { zoomAt(0.8); return; }
  const L = cur(); if (!L) return;
  if (k === 'delete' || k === 'backspace') { e.preventDefault(); delLayer(L); return; }
  const st = e.shiftKey ? 10 : 1, mv = { arrowleft: [-st, 0], arrowright: [st, 0], arrowup: [0, -st], arrowdown: [0, st] }[k];
  if (mv) { e.preventDefault(); pushHist(); L.x += mv[0]; L.y += mv[1]; syncProps(); redraw(); }
};
document.addEventListener('keydown', onKeyDown);
cleanups.push(() => document.removeEventListener('keydown', onKeyDown));
const onKeyUp = e => { if (e.key === ' ') { S.space = false; setCursor(); } };
  document.addEventListener('keyup', onKeyUp);
  cleanups.push(() => document.removeEventListener('keyup', onKeyUp));

/* ============ Arranque ============ */
async function cleanEdges() {
  const L = needLayer(); if (!L) return; const n = +$('#rbGrow').value, hard = $('#rbHard').checked;
  await runOp('Limpiando bordes…', async prog => {
    const img = imgData(L.canvas), w = img.width, h = img.height, d = img.data;
    if (hard) for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 128 ? 255 : 0;
    for (let it = 0; it < Math.abs(n); it++) {
      const src = new Uint8ClampedArray(d);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const k = (y * w + x) * 4, nb = [x > 0 ? k - 4 : -1, x < w - 1 ? k + 4 : -1, y > 0 ? k - w * 4 : -1, y < h - 1 ? k + w * 4 : -1];
        if (n > 0) { if (src[k + 3] === 0) for (const q of nb) if (q >= 0 && src[q + 3] > 0) { d[k] = src[q]; d[k + 1] = src[q + 1]; d[k + 2] = src[q + 2]; d[k + 3] = src[q + 3]; break; } }
        else if (src[k + 3] > 0) for (const q of nb) if (q >= 0 && src[q + 3] === 0) { d[k + 3] = 0; break; }
      }
      prog((it + 1) / Math.abs(n)); await sleep();
    }
    commitResult(L, canvasFromData(d, w, h), L.name + ' (bordes)', false); toast('Bordes limpios.');
  });
}
const palCan = new WeakMap(); let palSig = '', palTimer = 0, palCid = 1;
function palSync(force) {
  const sig = S.layers.filter(l => l.visible).map(l => { if (!palCan.has(l.canvas)) palCan.set(l.canvas, palCid++); return l.id + ':' + palCan.get(l.canvas); }).join('|');
  if (!force && sig === palSig) return; palSig = sig; clearTimeout(palTimer); palTimer = setTimeout(palBuild, 120);
}
function palBuild() {
  const bins = new Map();
  for (const L of S.layers) {
    if (!L.visible) continue; const sc = Math.min(1, 96 / Math.max(L.canvas.width, L.canvas.height)), w = Math.max(1, Math.round(L.canvas.width * sc)), h = Math.max(1, Math.round(L.canvas.height * sc)), c = mk(w, h), g = c.getContext('2d'); g.drawImage(L.canvas, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 250) continue; const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | d[i + 2] >> 4; let b = bins.get(k); if (!b) { b = { n: 0, r: 0, g: 0, b: 0, id: L.id }; bins.set(k, b); } b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; }
  }
  const list = [...bins.values()].sort((a, b) => b.n - a.n), out = [], hx = c => toHex(Math.round(c[0]), Math.round(c[1]), Math.round(c[2]));
  for (const b of list) { const c = [b.r / b.n, b.g / b.n, b.b / b.n]; if (out.every(o => Math.hypot(o.c[0] - c[0], o.c[1] - c[1], o.c[2] - c[2]) > 60)) out.push({ c, id: b.id }); if (out.length >= 24) break; }
  const el = $('#palette'); el.textContent = '';
  out.slice(0, 8).forEach(o => { const i = document.createElement('i'), h = hx(o.c); i.style.background = h; i.title = h.toUpperCase() + ' · clic: seleccionar su capa y usarlo como color inicial'; i.tabIndex = 0; i.onclick = () => { S.sel = o.id; renderLayers(); syncProps(); redraw(); $('#lcColor').value = h; $('#lcHex').value = h; }; el.appendChild(i); });
  if (out.length > 8) { const m = document.createElement('b'); m.textContent = '+' + (out.length - 8); m.title = out.slice(8).map(o => hx(o.c).toUpperCase()).join('  '); el.appendChild(m); }
}
function setBg(v) { S.doc.bg = v; const dot = $('#bgDot'); dot.classList.toggle('tr', !v); dot.style.background = v || ''; if (v) { $('#bgColor').value = v; $('#bgHex').value = v; } else $('#bgHex').value = ''; redraw(); }
function lcApply() {
  const L = needLayer(); if (!L) return; const hx = $('#lcHex').value.trim(); if (!/^#[0-9a-fA-F]{6}$/.test(hx)) { toast('Usa el formato #RRGGBB.'); return; }
  const [nr, ng, nb] = hexToRgb(hx), img = imgData(L.canvas), d = img.data; let mr = 0, mg = 0, mb = 0, cnt = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 200) { mr += d[i]; mg += d[i + 1]; mb += d[i + 2]; cnt++; }
  if (!cnt) { toast('La capa no tiene píxeles opacos que recolorear.'); return; }
  mr /= cnt; mg /= cnt; mb /= cnt; let near = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 200 && Math.hypot(d[i] - mr, d[i + 1] - mg, d[i + 2] - mb) < 60) near++;
  const mono = near / cnt >= 0.85;
  if (!mono && !confirm('Esta capa tiene varios colores. Se teñirá con el color elegido conservando luces y sombras; los colores originales se perderán (puedes deshacer). ¿Continuar?')) return;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; if (mono) { d[i] = nr; d[i + 1] = ng; d[i + 2] = nb; } else { const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, t = l < 0.5 ? l * 2 : 1, u = l < 0.5 ? 0 : (l - 0.5) * 2; d[i] = nr * t + (255 - nr) * u; d[i + 1] = ng * t + (255 - ng) * u; d[i + 2] = nb * t + (255 - nb) * u; } }
  commitResult(L, canvasFromData(d, img.width, img.height), L.name + ' (color)', false); toast(mono ? 'Capa recoloreada.' : 'Capa teñida conservando luces y sombras.');
}
function apStatsText(d, w, h) {
  let t = 0, p = 0, o = 0, pe = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = y * w + x, a = d[q * 4 + 3]; if (a === 0) t++; else if (a === 255) o++; else { p++; if ((x > 0 && !d[(q - 1) * 4 + 3]) || (x < w - 1 && !d[(q + 1) * 4 + 3]) || (y > 0 && !d[(q - w) * 4 + 3]) || (y < h - 1 && !d[(q + w) * 4 + 3])) pe++; } }
  const f = v => (100 * v / (w * h)).toFixed(1) + ' %';
  return 'Transparente ' + f(t) + ' · Parcial ' + f(p) + ' · Opaco ' + f(o) + (p ? '<br>Parcial de borde: ' + f(pe) + ' · parcial interior (degradados, sombras o velos; revisar): ' + f(p - pe) : '');
}
function apProcess(d, w, h, mode, thr, r, bg) {
  const t = thr * 2.55;
  if (mode === 'harden') { for (let i = 3; i < d.length; i += 4) if (d[i] > 0 && d[i] < 255) d[i] = d[i] >= t ? 255 : 0; }
  else if (mode === 'compose') { for (let i = 0; i < d.length; i += 4) { const a = d[i + 3]; if (a > 0 && a < 255) { const k = a / 255; d[i] = d[i] * k + bg[0] * (1 - k); d[i + 1] = d[i + 1] * k + bg[1] * (1 - k); d[i + 2] = d[i + 2] * k + bg[2] * (1 - k); d[i + 3] = 255; } } }
  else if (mode === 'clean') { for (let it = 0; it < r; it++) { const al = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) al[i] = d[i * 4 + 3]; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = y * w + x, a = al[q]; if (a === 0 || a === 255 || a >= t) continue; if ((x > 0 && !al[q - 1]) || (x < w - 1 && !al[q + 1]) || (y > 0 && !al[q - w]) || (y < h - 1 && !al[q + w])) d[q * 4 + 3] = 0; } } }
}
function apSchedule() { if (S.tool !== 'alpha') return; clearTimeout(HT.timer); HT.timer = setTimeout(apPreview, 70); }
function apPreview() {
  const L = cur(), info = $('#apInfo'); if (!L || !L.visible) { HT.prev = null; $('#apStats').textContent = 'Selecciona una capa visible.'; redraw(); return; }
  const w = L.canvas.width, h = L.canvas.height, img = imgData(L.canvas), mode = $('#apMode').value;
  $('#apStats').innerHTML = apStatsText(img.data, w, h);
  if (mode === 'keep' || $('#apCmp').checked) { HT.prev = null; info.textContent = mode === 'keep' ? 'Sin cambios: se conserva la transparencia original.' : 'Mostrando el original.'; redraw(); return; }
  if (w * h > 20e6) { HT.prev = null; info.textContent = 'Imagen grande: sin vista previa; el tratamiento se aplicará igual.'; redraw(); return; }
  apProcess(img.data, w, h, mode, +$('#apThr').value, +$('#apR').value, hexToRgb($('#apCol').value));
  HT.prev = { id: L.id, canvas: canvasFromData(img.data, w, h) }; info.innerHTML = 'Resultado: ' + apStatsText(img.data, w, h); redraw();
}
function apApply() {
  const L = needLayer(); if (!L) return; const mode = $('#apMode').value; if (mode === 'keep') { toast('«Conservar» no cambia nada: elige un tratamiento.'); return; }
  const img = imgData(L.canvas); apProcess(img.data, img.width, img.height, mode, +$('#apThr').value, +$('#apR').value, hexToRgb($('#apCol').value));
  commitResult(L, canvasFromData(img.data, img.width, img.height), L.name + ' (alfa)', false); HT.prev = null; toast('Tratamiento aplicado.'); apSchedule();
}
const HT = { gar: '#ffffff', tok: 0, prev: null, timer: 0, srcCache: null };
const HT_STALE = { stale: true };
function htOpts(L) { const lpi = +$('#htLpi').value; return { cell: Math.max(3, effDpi(L) / lpi), angle: +$('#htAng').value, shape: $('#htShape').value, mode: S.ht.mode, ink: hexToRgb($('#htInk').value), src: $('#htSrc').value, invert: $('#htInv').checked, contrast: +$('#htCon').value / 100, gamma: +$('#htGam').value / 100, minR: +$('#htMin').value / 10 }; }
async function htCompose(up, o, prog) {
  const W = up.width, H = up.height;
  if (o.mode !== 'cmyk') return halftone(up, o, prog);
  const ug = up.getContext('2d'), ud = ug.getImageData(0, 0, W, H).data, base = mk(W, H), bg = base.getContext('2d'); bg.fillStyle = '#fff'; bg.fillRect(0, 0, W, H);
  const inks = [[[0, 174, 239], 15], [[236, 0, 140], 75], [[255, 242, 0], 0], [[0, 0, 0], 45]];
  for (let ch = 0; ch < 4; ch++) {
    const gd = new Uint8ClampedArray(ud.length);
    for (let i = 0; i < W * H; i++) { const q = i * 4, r = ud[q] / 255, g = ud[q + 1] / 255, b = ud[q + 2] / 255, kk = 1 - Math.max(r, g, b), den = 1 - kk || 1; const cov = ch === 3 ? kk : (1 - [r, g, b][ch] - kk) / den, v = Math.round((1 - clamp(cov, 0, 1)) * 255); gd[q] = gd[q + 1] = gd[q + 2] = v; gd[q + 3] = ud[q + 3]; }
    const dc = await halftone(canvasFromData(gd, W, H), { ...o, mode: 'ink', src: 'lum', invert: false, ink: inks[ch][0], angle: inks[ch][1] }, p => prog((ch + p) / 4));
    bg.globalCompositeOperation = 'multiply'; bg.drawImage(dc, 0, 0); bg.globalCompositeOperation = 'source-over';
  }
  bg.globalCompositeOperation = 'destination-in'; bg.drawImage(up, 0, 0); return base;
}
function htSchedule() { if (S.tool !== 'halftone') return; clearTimeout(HT.timer); HT.timer = setTimeout(htPreview, 70); }
async function htPreview() {
  const L = cur(), info = $('#htPrevInfo');
  if (!L || !L.visible) { HT.tok++; HT.prev = null; info.textContent = 'Selecciona una capa visible para ver la vista previa.'; redraw(); return; }
  const tok = ++HT.tok, o = htOpts(L), s = Math.min(1, 1600 / Math.max(L.canvas.width, L.canvas.height)), pw = Math.max(1, Math.round(L.canvas.width * s)), ph = Math.max(1, Math.round(L.canvas.height * s));
  let src = L.canvas;
  if (s < 1) { const c = HT.srcCache; if (c && c.key === L.canvas && c.pw === pw) src = c.c; else { src = mk(pw, ph); const g = src.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(L.canvas, 0, 0, pw, ph); HT.srcCache = { key: L.canvas, pw, c: src }; } }
  const po = { ...o, cell: o.cell * s, minR: o.minR * s }; info.textContent = 'Calculando vista previa…';
  try {
    const res = await htCompose(src, po, () => { if (tok !== HT.tok) throw HT_STALE; });
    if (tok !== HT.tok) return;
    HT.prev = { id: L.id, canvas: res }; redraw();
    info.textContent = 'Vista previa en vivo · ' + pw + '×' + ph + ' px' + (s < 1 ? ' (resolución reducida; el resultado final usa la resolución completa)' : '') + (po.cell < 3 ? ' · trama muy fina: la vista previa es aproximada, acerca el zoom al aplicar' : '');
  } catch (e) { if (e !== HT_STALE) { info.textContent = 'No se pudo generar la vista previa.'; console.error(e); } }
}
function htGarUpdate() {
  const lum = h => { const [r, g, b] = hexToRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const w = $('#htWarn'); w.hidden = true;
  if (S.ht.mode === 'ink') { const a = lum($('#htInk').value), b = lum(HT.gar), cr = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); if (cr < 2.5) { w.hidden = false; w.textContent = 'Contraste bajo entre la tinta y la prenda (' + cr.toFixed(1) + ':1): el diseño se leerá poco. Prueba otra tinta o invierte tonos.'; } }
  redraw();
}
function init() {
  $('#bgSw').onclick = () => { $('#bgPop').hidden = !$('#bgPop').hidden; };
  $('#bgColor').oninput = e => setBg(e.target.value);
  $('#bgHex').onchange = e => { const v = e.target.value.trim(); if (/^#[0-9a-fA-F]{6}$/.test(v)) setBg(v); else toast('Usa el formato #RRGGBB.'); };
  $('#bgClear').onclick = () => setBg(null);
  $('#lcColor').oninput = e => { $('#lcHex').value = e.target.value; };
  $('#lcHex').onchange = e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value.trim())) $('#lcColor').value = e.target.value.trim(); };
  $('#lcApply').onclick = lcApply;
  ['apMode', 'apThr', 'apR', 'apCol', 'apCmp'].forEach(id => ['input', 'change'].forEach(ev => $('#' + id).addEventListener(ev, () => { $('#apThrV').textContent = $('#apThr').value; $('#apRV').textContent = $('#apR').value; const m = $('#apMode').value; $('#apColWrap').hidden = m !== 'compose'; $('#apRWrap').hidden = m !== 'clean'; apSchedule(); })));
  $('#apGar').onchange = e => { HT.gar = e.target.value; redraw(); };
  $('#apApply').onclick = apApply; $('#apCancel').onclick = () => { HT.prev = null; $('#apInfo').textContent = 'Vista previa cancelada. Cambia un control para reanudarla.'; redraw(); };
  ['htInk', 'htSrc', 'htShape', 'htInv', 'htAng', 'htCon', 'htGam', 'htMin'].forEach(id => ['input', 'change'].forEach(ev => $('#' + id).addEventListener(ev, () => { htSchedule(); htGarUpdate(); })));
  $('#htGar').onchange = e => { const c = e.target.value === 'custom'; $('#htGarColor').hidden = !c; $('#htGarHex').hidden = !c; HT.gar = c ? $('#htGarColor').value : e.target.value; htGarUpdate(); };
  $('#htGarColor').oninput = e => { HT.gar = e.target.value; $('#htGarHex').value = e.target.value; htGarUpdate(); };
  $('#htGarHex').onchange = e => { const v = e.target.value.trim(); if (/^#[0-9a-fA-F]{6}$/.test(v)) { HT.gar = v; $('#htGarColor').value = v; htGarUpdate(); } else toast('Usa el formato #RRGGBB.'); };
  $('#htCancel').onclick = () => { HT.tok++; clearTimeout(HT.timer); HT.prev = null; $('#htPrevInfo').textContent = 'Vista previa cancelada. Cambia un control para reanudarla.'; redraw(); };
  $('#htRestore').onclick = () => { const L = needLayer(); if (!L) return; if (!L.orig || L.orig === L.canvas) { toast('La capa ya es la original.'); return; } pushHist(); const rx = L.canvas.width / L.orig.width, ry = L.canvas.height / L.orig.height; L.canvas = L.orig; L.sx *= rx; L.sy *= ry; HT.prev = null; afterStructure(); htSchedule(); toast('Se recuperó la imagen original de la capa.'); };
  $('#exMode').onchange = () => { const sub = $('#exMode').value === 'sub'; $('#exSubOpts').hidden = !sub; $('#exBg').value = sub ? '#ffffff' : 'none'; $('#exMirror').checked = sub; syncExport(); };
  ['exBoost', 'exMarks', 'exBleed'].forEach(id => $('#' + id).addEventListener('change', syncExport));
  $('#rbClean').onclick = cleanEdges; $('#rbGrow').addEventListener('input', e => { $('#rbGrowV').textContent = e.target.value; });
  const onBeforeUnload = e => { if (S.layers.length) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', onBeforeUnload);
  cleanups.push(() => window.removeEventListener('beforeunload', onBeforeUnload));
  refreshTheme();
  const mql = matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', refreshTheme);
  cleanups.push(() => mql.removeEventListener('change', refreshTheme));
  const themeObserver = new MutationObserver(refreshTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  cleanups.push(() => themeObserver.disconnect());
  bindUI(); setTool('move');
  let first = true;
  const stageEl = $('#stage');
  if (stageEl) {
    const stageObserver = new ResizeObserver(() => { resizeView(); if (first && $('#stage').clientWidth > 0) { first = false; fitView(); } });
    stageObserver.observe(stageEl);
    cleanups.push(() => stageObserver.disconnect());
  }
  afterStructure(); syncUndo(); resizeView(); fitView();
  const onWinResize = () => { resizeView(); };
  window.addEventListener('resize', onWinResize);
  cleanups.push(() => window.removeEventListener('resize', onWinResize));
}
  /* ============ Integración Menú de Modo (Fácil / Avanzado) ============ */
  const btnModeMenu = $('#btnModeMenu');
  const modeMenu = $('#modeMenu');
  const modeEasy = $('#modeEasy');
  const modeAdvanced = $('#modeAdvanced');
  if (btnModeMenu && modeMenu) {
    const toggleModeMenu = (e) => {
      e.stopPropagation();
      const isHidden = modeMenu.hasAttribute('hidden');
      if (isHidden) {
        modeMenu.removeAttribute('hidden');
        btnModeMenu.setAttribute('aria-expanded', 'true');
      } else {
        modeMenu.setAttribute('hidden', '');
        btnModeMenu.setAttribute('aria-expanded', 'false');
      }
    };
    btnModeMenu.addEventListener('click', toggleModeMenu);
    cleanups.push(() => btnModeMenu.removeEventListener('click', toggleModeMenu));

    const onDocClick = (e) => {
      const target = e.target;
      if (!modeMenu.contains(target) && !btnModeMenu.contains(target)) {
        modeMenu.setAttribute('hidden', '');
        btnModeMenu.setAttribute('aria-expanded', 'false');
      }
    };
    document.addEventListener('click', onDocClick);
    cleanups.push(() => document.removeEventListener('click', onDocClick));

    if (modeEasy) {
      const onEasyClick = (e) => {
        e.preventDefault();
        modeMenu.setAttribute('hidden', '');
        btnModeMenu.setAttribute('aria-expanded', 'false');
      };
      modeEasy.addEventListener('click', onEasyClick);
      cleanups.push(() => modeEasy.removeEventListener('click', onEasyClick));
    }

    if (modeAdvanced) {
      const onAdvancedClick = (e) => {
        e.preventDefault();
        modeMenu.setAttribute('hidden', '');
        btnModeMenu.setAttribute('aria-expanded', 'false');
        if (options && options.onNavigateAdvanced) {
          options.onNavigateAdvanced();
        }
      };
      modeAdvanced.addEventListener('click', onAdvancedClick);
      cleanups.push(() => modeAdvanced.removeEventListener('click', onAdvancedClick));
    }
  }

init();
  return () => {
    isMounted = false;
    cleanups.forEach(fn => {
      try { fn(); } catch (err) { console.error('Cleanup error:', err); }
    });
    if (raf) cancelAnimationFrame(raf);
    if (toastT) clearTimeout(toastT);
    try { if (typeof HT !== 'undefined' && HT && HT.timer) clearTimeout(HT.timer); } catch (e) {}
    try { if (typeof palTimer !== 'undefined') clearTimeout(palTimer); } catch (e) {}
  };
}
