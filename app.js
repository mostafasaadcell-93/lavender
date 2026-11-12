/* Lavender Lounge — menu, 3D collection ring, options, order ticket, search, $/LL.
   Data: menu-data.js (window.LL_MENU, window.LL_INFO). No libraries (the 3D hero is scene.js). */
'use strict';

/* Leave empty for demo mode. With the lounge's permission, set to their WhatsApp number
   in international format (e.g. '96181097858') and "Send order" opens WhatsApp with the order. */
const ORDER_WHATSAPP = '';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const INFO = window.LL_INFO, MENU = window.LL_MENU;
const WA = '961' + INFO.phone.replace(/\D/g, '');

const ICON = {
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 2.5v11M2.5 8h11"/></svg>',
  minus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 8h11"/></svg>',
  star: '<svg viewBox="0 0 24 24" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>',
};
/* line-art glyphs (drawn to match the logo's thin cream lines) */
const GLYPH = {
  glass: '<svg viewBox="0 0 64 64"><path d="M18 14h28l-3 38a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3z"/><path d="M19.5 30h25"/><path d="M27 22l4 4m6-6l-3 3"/></svg>',
  wine: '<svg viewBox="0 0 64 64"><path d="M22 8h20c1 12-2 22-10 24-8-2-11-12-10-24z"/><path d="M23 18h18"/><path d="M32 32v20M24 56h16"/></svg>',
  shot: '<svg viewBox="0 0 64 64"><path d="M20 16h24l-4 36H24z"/><path d="M21.4 28h21.2"/><path d="M26 10l2 3m8-3l-2 3"/></svg>',
  shisha: '<svg viewBox="0 0 64 64"><path d="M26 8h12l-2 6h-8z"/><path d="M32 14v14"/><path d="M28 28h8l2 8c4 2 6 6 6 10a12 12 0 0 1-24 0c0-4 2-8 6-10z"/><path d="M38 36c8 0 14 2 18 8"/><path d="M30 4c-2-2 0-3 2-4m2 4c2-2 0-3-2-4"/></svg>',
  cigar: '<svg viewBox="0 0 64 64"><rect x="8" y="27" width="40" height="10" rx="5"/><path d="M40 27v10M48 32h6"/><path d="M54 24c2-3 0-5 2-8m-6 8c2-3 0-5 2-8"/></svg>',
  cake: '<svg viewBox="0 0 64 64"><path d="M10 50h44V34H10z"/><path d="M10 42c4 3 8 3 11 0s7-3 11 0 7 3 11 0 7-3 11 0"/><path d="M14 34c0-8 8-14 18-14s18 6 18 14"/><path d="M32 20v-6m-2-4a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>',
  sun: '<svg viewBox="0 0 64 64"><circle cx="32" cy="36" r="11"/><path d="M8 50h48M32 14v6M14 22l4 4M50 22l-4 4M8 36h6M50 36h6"/></svg>',
  moon: '<svg viewBox="0 0 64 64"><path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10z"/><path d="M14 14l1 3m-3-1l3-1M50 52l1 3m-3-1l3-1"/></svg>',
  smoke: '<svg viewBox="0 0 64 64"><path d="M24 56c-6-6 6-10 0-18s6-12 0-20"/><path d="M36 56c-6-6 6-10 0-18s6-12 0-20"/><path d="M48 52c-4-4 4-8 0-14"/></svg>',
  bag: '<svg viewBox="0 0 64 64"><path d="M14 22h36l-3 32H17z"/><path d="M24 22v-4a8 8 0 0 1 16 0v4"/></svg>',
};
const CHAPTERS = {
  day: { id: 'daylight', title: 'Daylight', text: 'Coffee, shakes, smoothies and fresh juices. The lounge at its brightest.', glyph: 'sun' },
  night: { id: 'after-dark', title: 'After Dark', text: 'When the lights go low: cocktails, whisky, wine and a shot for the table.', glyph: 'moon' },
  smoke: { id: 'smoke', title: 'Smoke', text: 'Shisha packed the Lebanese way, and a cigar for the slow ones.', glyph: 'smoke' },
  sweet: { id: 'sweet', title: 'Sweet endings', text: 'Fondant, brownies, cheesecake. Save a little room.', glyph: 'cake' },
};

/* ================= DATA INDEX ================= */
const ITEMS = {};
MENU.forEach(sec => sec.groups.forEach(g => g.items.forEach(it => { it.sec = sec; it.grp = g; ITEMS[it.id] = it; })));
const hasOpts = it => !!(it.v || it.pick || it.a);
const photoOf = sec => sec.photo ? `assets/photos/${sec.photo}` : null;
const artHTML = (sec, small) => sec.photo
  ? `<img src="${photoOf(sec)}${small ? '-sm' : ''}.webp" alt="${esc(sec.title)} at Lavender Lounge" loading="lazy" width="800" height="1203">`
  : GLYPH[sec.glyph || 'glass'];

/* ================= CURRENCY ================= */
let CUR = 'usd';
try { CUR = localStorage.getItem('ll-cur') || 'usd'; } catch (e) {}
const cents = n => Math.round(n * 100);
function fmt(c, cur = CUR) {
  if (cur === 'lbp') return Math.round(c / 100 * INFO.rate).toLocaleString('en-US') + ' LL';
  return '$' + (c % 100 === 0 ? c / 100 : (c / 100).toFixed(2).replace(/0$/, ''));
}
function setCur(c) {
  CUR = c; try { localStorage.setItem('ll-cur', c); } catch (e) {}
  $$('[data-cur]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cur === c));
  $('#dockCurLbl').textContent = c === 'usd' ? '$' : 'LL';
  $$('[data-price]').forEach(el => { el.innerHTML = priceHTML(ITEMS[el.dataset.price]); });
  refreshChips(); updateDock(); if ($('#ticket').classList.contains('on')) renderTicket();
  if (S) updSheet();
}
const priceHTML = it => (it.v && new Set(it.v.map(v => v[1])).size > 1 ? '<small>from</small>' : '') + fmt(cents(it.p));

/* ================= CART ================= */
const KEY = 'll-order-v1';
let lines = [];
try { lines = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => ITEMS[l.id]); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {} };
const defMods = it => ({ v: it.v ? 0 : null, pick: it.pick && !it.pick[2] ? 0 : null, a: (it.a || []).map(() => 0) });
const keyOf = (id, m) => id + '|' + JSON.stringify([m.v, m.pick, m.a]);
function unit(it, m) {
  let c = cents(it.v && m.v != null ? it.v[m.v][1] : it.p);
  (it.a || []).forEach((a, i) => c += cents(a[1]) * (m.a[i] || 0));
  return c;
}
function desc(it, m) {
  const o = [];
  if (it.v && m.v != null) o.push(it.v[m.v][0]);
  if (it.pick && m.pick != null) o.push(it.pick[1][m.pick]);
  (it.a || []).forEach((a, i) => { if (m.a[i]) o.push(`+${m.a[i]} ${a[0].toLowerCase()}${m.a[i] > 1 ? 's' : ''}`); });
  return o.join(' · ');
}
const qtyOf = id => lines.filter(l => l.id === id).reduce((s, l) => s + l.qty, 0);
const total = () => lines.reduce((s, l) => s + unit(ITEMS[l.id], l.m) * l.qty, 0);
const count = () => lines.reduce((s, l) => s + l.qty, 0);
function add(id, m, qty = 1, from = null) {
  const it = ITEMS[id], k = keyOf(id, m), l = lines.find(x => x.key === k);
  if (l) l.qty += qty; else lines.push({ key: k, id, m: JSON.parse(JSON.stringify(m)), qty });
  save(); renderCtl(id); updateDock(true); fly(from);
  toast(`${qty > 1 ? qty + ' × ' : ''}${it.n} added`);
}
function setQty(k, q) {
  const l = lines.find(x => x.key === k); if (!l) return;
  l.qty = Math.max(0, q); if (!l.qty) lines = lines.filter(x => x !== l);
  save(); renderCtl(l.id); updateDock(); renderTicket();
}

/* ================= MENU RENDER ================= */
function itemHTML(it, i) {
  const meta = [];
  if (it.sig) meta.push('<span class="sig">Signature</span>');
  if (it.note) meta.push(`<em>${esc(it.note)}</em>`);
  if (it.v) meta.push(`<span class="vchips">${it.v.map(v => `<span>${esc(v[0])}</span>`).join('')}</span>`);
  if (it.pick && !it.v) meta.push(`<span>${esc(it.pick[1].length)} choices</span>`);
  if (it.a) meta.push(`<span>${esc(it.a[0][0])} +${fmt(cents(it.a[0][1]))}</span>`);
  return `<li class="it" id="it-${it.id}" style="--d:${i}">
    <div class="row"><span class="nm">${hasOpts(it) ? `<button type="button" data-opt="${it.id}">${esc(it.n)}</button>` : esc(it.n)}</span><span class="dots" aria-hidden="true"></span><span class="pr" data-price="${it.id}">${priceHTML(it)}</span></div>
    ${meta.length ? `<div class="meta">${meta.join('')}</div>` : ''}
    <div class="ctl" data-ctl="${it.id}"></div></li>`;
}
(function renderMenu() {
  let html = '', mood = null, flip = false, n = 0;
  MENU.forEach(sec => {
    if (sec.mood !== mood) {
      mood = sec.mood; const ch = CHAPTERS[mood];
      html += `<section class="chapter" id="${ch.id}" data-mood="${mood}" aria-label="${esc(ch.title)}">
        ${mood === 'night' ? '<div class="stars" aria-hidden="true">' + Array.from({ length: 46 }, () => `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(Math.random() * 3).toFixed(2)}s;opacity:${(0.3 + Math.random() * 0.7).toFixed(2)}"></i>`).join('') + '</div>' : ''}
        ${mood === 'smoke' ? '<div class="smoke" aria-hidden="true">' + Array.from({ length: 7 }, (_, i) => `<i style="left:${8 + i * 13}%;animation-delay:${(i * 2).toFixed(1)}s"></i>`).join('') + '</div>' : ''}
        <div class="reveal">${GLYPH[ch.glyph].replace('<svg', '<svg class="glyph"')}<h2>${esc(ch.title)}</h2><p>${esc(ch.text)}</p></div></section>`;
    }
    const cnt = sec.groups.reduce((s, g) => s + g.items.length, 0); n += cnt;
    html += `<section class="msec${flip ? ' flip' : ''}" id="${sec.id}" data-mood="${sec.mood}" aria-labelledby="h-${sec.id}">
      <div class="wrap mgrid">
        <div class="art"><div class="arch${sec.photo ? '' : ' glyph'}">${artHTML(sec)}<div class="shine"></div>${sec.photo ? '' : `<span class="badge">${esc(sec.title)}</span>`}</div></div>
        <div class="mlist"><div class="mhead"><span class="kick">${esc(sec.kicker)}</span><h3 id="h-${sec.id}">${esc(sec.title)}</h3><span class="count">${cnt} ${cnt === 1 ? 'choice' : 'choices'}</span></div>
          ${sec.groups.map(g => `<div class="grp">${g.title ? `<h4>${esc(g.title)}</h4>` : ''}<ul class="items">${g.items.map(itemHTML).join('')}</ul></div>`).join('')}
        </div></div></section>`;
    flip = !flip;
  });
  $('#menu').innerHTML = html;
  Object.keys(ITEMS).forEach(renderCtl);
  // index overlay
  const groups = {};
  MENU.forEach(s => (groups[s.mood] = groups[s.mood] || []).push(s));
  $('#idxGrid').innerHTML = Object.entries(groups).map(([m, secs]) => `<div><h3>${esc(CHAPTERS[m].title)}</h3>${secs.map(s => `<a href="#${s.id}" data-jump>${esc(s.title)}<small>${s.groups.reduce((t, g) => t + g.items.length, 0)}</small></a>`).join('')}</div>`).join('');
})();

function renderCtl(id) {
  const el = document.querySelector(`[data-ctl="${id}"]`); if (!el) return;
  const it = ITEMS[id], q = qtyOf(id);
  if (hasOpts(it) || !q) el.innerHTML = `<button class="add" type="button" data-add="${id}" aria-label="Add ${esc(it.n)}">${ICON.plus}${q ? `<span class="n">${q}</span>` : ''}</button>`;
  else el.innerHTML = `<div class="step" role="group" aria-label="${esc(it.n)} quantity"><button type="button" data-dec="${esc(keyOf(id, defMods(it)))}" aria-label="One less">${ICON.minus}</button><output>${q}</output><button type="button" data-add="${id}" aria-label="One more">${ICON.plus}</button></div>`;
}

/* ================= MOOD (day → after dark → smoke → sweet) ================= */
const moodIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) document.body.dataset.mood = e.target.dataset.mood; }), { rootMargin: '-48% 0px -48% 0px' });
$$('[data-mood]').forEach(el => el !== document.body && moodIO.observe(el));
['.hero', '#collections', '#visit'].forEach(s => { const el = $(s); el.dataset.mood = 'day'; moodIO.observe(el); });

/* reveal */
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
$$('.reveal, .msec').forEach(el => rio.observe(el));

/* header + dock visibility */
function onScroll() {
  $('#hd').classList.toggle('solid', scrollY > 40);
  parallax();
}
addEventListener('scroll', onScroll, { passive: true });

/* arch photos: 3D tilt + shine + scroll parallax */
const arts = $$('.msec .art');
function parallax() {
  if (reduce) return;
  const vh = innerHeight;
  arts.forEach(a => {
    const r = a.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
    const p = (r.top + r.height / 2 - vh / 2) / vh;
    const img = a.querySelector('img'); if (img) img.style.setProperty('--py', (p * -7).toFixed(2) + '%');
  });
}
arts.forEach(a => {
  const arch = a.querySelector('.arch');
  a.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || reduce) return;
    const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    arch.style.transform = `rotateY(${((x - .5) * 14).toFixed(2)}deg) rotateX(${((.5 - y) * 10).toFixed(2)}deg) scale(1.02)`;
    arch.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); arch.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  });
  a.addEventListener('pointerleave', () => { arch.style.transform = ''; });
});

/* ================= 3D COLLECTION RING ================= */
(function ring() {
  const stage = $('#ringStage'), ring = $('#ring');
  const secs = MENU.filter(s => s.photo || ['wine', 'shisha', 'dessert', 'vodka'].includes(s.id));
  ring.innerHTML = secs.map(s => `<a class="rcard${s.photo ? '' : ' glyph'}" href="#${s.id}" data-jump draggable="false">${artHTML(s, true)}<span class="t"><b>${esc(s.title)}</b><small>${s.groups.reduce((t, g) => t + g.items.length, 0)} choices</small></span></a>`).join('');
  const cards = $$('.rcard', ring), N = cards.length, step = 360 / N;
  let W, H, R, rot = 0, vel = 0, target = null, dragging = false, moved = 0, lastX = 0, idle = 0;
  function size() {
    W = Math.max(150, Math.min(250, innerWidth * 0.38)); H = W * 1.5;
    R = (W / 2) / Math.tan(Math.PI / N) * 1.18;
    stage.style.setProperty('--w', W + 'px'); stage.style.setProperty('--h', H + 'px');
    cards.forEach(c => { c.style.setProperty('--w', W + 'px'); c.style.setProperty('--h', H + 'px'); });
  }
  size(); addEventListener('resize', size);
  function draw() {
    ring.style.transform = `translateZ(${-R}px) rotateY(${rot}deg)`;
    cards.forEach((c, i) => {
      const a = i * step;
      c.style.transform = `rotateY(${a}deg) translateZ(${R}px)`;
      let d = ((a + rot) % 360 + 540) % 360 - 180; d = Math.abs(d);
      const k = Math.max(0, 1 - d / 120);
      c.style.opacity = (0.15 + 0.85 * k).toFixed(3);
      c.style.filter = `brightness(${(0.55 + 0.45 * k).toFixed(3)}) saturate(${(0.6 + 0.4 * k).toFixed(2)})`;
      c.style.zIndex = Math.round(k * 100);
      c.tabIndex = d < step / 2 ? 0 : -1;
    });
  }
  function loop() {
    if (!dragging) {
      if (target != null) { const diff = target - rot; rot += diff * 0.12; if (Math.abs(diff) < 0.05) { rot = target; target = null; } }
      else { rot += vel; vel *= 0.94; if (Math.abs(vel) < 0.01) { vel = 0; if (!reduce && ++idle > 120) rot -= 0.06; } }
    }
    draw(); requestAnimationFrame(loop);
  }
  draw(); if (!reduce) requestAnimationFrame(loop);
  const snap = dir => { idle = 0; vel = 0; const cur = Math.round(-rot / step); target = -(cur + dir) * step; if (reduce) { rot = target; target = null; draw(); } };
  $('#ringNext').onclick = () => snap(1); $('#ringPrev').onclick = () => snap(-1);
  stage.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; idle = 0; target = null; stage.classList.add('drag'); stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); vel = dx * 0.18; rot += vel; if (reduce) draw(); });
  const end = () => { if (!dragging) return; dragging = false; stage.classList.remove('drag'); if (Math.abs(vel) < 0.3) snap(0); };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('click', e => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);
  stage.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); vel = -e.deltaX * 0.03; target = null; idle = 0; } }, { passive: false });
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') snap(1); if (e.key === 'ArrowLeft') snap(-1); });
})();

/* ================= POUR CHIPS (hero) ================= */
const POURS = [['91', '#8A63CF'], ['90', '#3D3592'], ['89', '#F0A238'], ['87', '#A9CF78']];
let poured = '91';
function refreshChips() {
  $('#pourChips').innerHTML = POURS.map(([id, c]) => `<button type="button" class="pchip" data-pour="${id}" style="--c:${c}" aria-pressed="${id === poured}"><i></i>${esc(ITEMS[id].n)} <small>${fmt(cents(ITEMS[id].p))}</small></button>`).join('')
    + `<button type="button" class="pchip" data-add="${poured}" aria-label="Add ${esc(ITEMS[poured].n)} to order" style="--c:#fff"><b>+ Add</b></button>`;
}
refreshChips();

/* ================= CLICK DELEGATION ================= */
document.addEventListener('click', e => {
  const t = e.target;
  const pour = t.closest('[data-pour]');
  if (pour) { poured = pour.dataset.pour; const c = POURS.find(p => p[0] === poured)[1]; if (window.LLScene) window.LLScene.pour(c); refreshChips(); return; }
  const a = t.closest('[data-add]');
  if (a) { const it = ITEMS[a.dataset.add]; if (hasOpts(it)) openSheet(it.id); else add(it.id, defMods(it), 1, a.getBoundingClientRect()); return; }
  const d = t.closest('[data-dec]');
  if (d) { const l = lines.find(x => x.key === d.dataset.dec); if (l) setQty(l.key, l.qty - 1); return; }
  const o = t.closest('[data-opt]');
  if (o) { openSheet(o.dataset.opt); return; }
  const cur = t.closest('[data-cur]');
  if (cur) { setCur(cur.dataset.cur); return; }
  if (t.closest('#dockCur')) { setCur(CUR === 'usd' ? 'lbp' : 'usd'); toast(CUR === 'usd' ? 'Prices in US dollars' : `Prices in Lebanese pounds · 1$ = ${INFO.rate.toLocaleString('en-US')} LL`); return; }
  if (t.closest('[data-search]')) { openSearch(); return; }
  if (t.closest('[data-open-ticket]')) { openPanel('ticket'); return; }
  if (t.closest('#openIdx')) { openPanel('idx'); return; }
  const j = t.closest('[data-jump]');
  if (j) { e.preventDefault(); closeAll(); jump(j.getAttribute('href').slice(1)); return; }
  if (t.closest('[data-close]') || t === $('#ov')) { closeAll(); }
});
function jump(id, flashId) {
  const el = document.getElementById(id); if (!el) return;
  el.classList.add('in');
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: flashId ? 'center' : 'start' });
  if (flashId) { const f = document.getElementById(flashId); if (f) { f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); } }
}

/* ================= PANELS ================= */
let openId = null, returnFocus = null;
function openPanel(id) {
  if (openId) $('#' + openId).classList.remove('on');
  returnFocus = returnFocus || document.activeElement;
  openId = id; $('#' + id).classList.add('on'); $('#ov').classList.add('on'); document.body.classList.add('locked');
  $('#dock').classList.add('away');
  if (id === 'ticket') renderTicket();
  setTimeout(() => { const f = id === 'srch' ? $('#sq') : $('#' + id + ' [data-close]'); if (f) f.focus(); }, 60);
}
function closeAll() {
  if (!openId) return;
  $('#' + openId).classList.remove('on'); $('#ov').classList.remove('on'); document.body.classList.remove('locked');
  $('#dock').classList.remove('away'); openId = null; S = null;
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus(); returnFocus = null;
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && openId) { closeAll(); return; }
  if (e.key === '/' && !openId && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  if (e.key === 'Tab' && openId) {
    const f = $$('#' + openId + ' button, #' + openId + ' input, #' + openId + ' textarea, #' + openId + ' a[href]').filter(x => !x.disabled && x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});

/* ================= OPTIONS SHEET ================= */
let S = null;
function openSheet(id) {
  const it = ITEMS[id];
  S = { it, m: defMods(it), qty: 1 };
  $('#shArt').innerHTML = `<div class="arch${it.sec.photo ? '' : ' glyph'}" style="clip-path:none">${artHTML(it.sec)}</div>`;
  renderSheet(); openPanel('sheet');
}
function renderSheet() {
  const { it, m } = S; let h = `<span class="kick">${esc(it.sec.title)}</span><h2 id="shTitle">${esc(it.n)}</h2>${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}`;
  if (it.v) h += `<div class="opt"><h5>Choose</h5><div class="choices" role="radiogroup">${it.v.map((v, i) => `<button type="button" class="choice" role="radio" aria-checked="${m.v === i}" data-v="${i}"><b>${esc(v[0])}</b><span>${fmt(cents(v[1]))}</span></button>`).join('')}</div></div>`;
  if (it.pick) h += `<div class="opt"><h5>${esc(it.pick[0])}</h5><div class="choices" role="radiogroup">${it.pick[1].map((p, i) => `<button type="button" class="choice" role="radio" aria-checked="${m.pick === i}" data-pick="${i}"><b>${esc(p)}</b></button>`).join('')}</div></div>`;
  (it.a || []).forEach((a, i) => { h += `<div class="opt"><h5>Extras</h5><div class="counter"><div><b>${esc(a[0])}</b><br><span>+${fmt(cents(a[1]))} each</span></div><div class="step" role="group" aria-label="${esc(a[0])}"><button type="button" data-ad="${i}" data-d="-1" aria-label="One less">${ICON.minus}</button><output>${m.a[i]}</output><button type="button" data-ad="${i}" data-d="1" aria-label="One more">${ICON.plus}</button></div></div></div>`; });
  $('#shScroll').innerHTML = h; updSheet();
}
function updSheet() {
  if (!S) return; const { it, m, qty } = S, need = it.pick && it.pick[2] && m.pick == null;
  $('#shQty').textContent = qty; $('#shAdd').disabled = !!need;
  $('#shAddLbl').textContent = need ? 'Choose a flavor' : 'Add to order';
  $('#shTot').textContent = fmt(unit(it, m) * qty);
}
$('#shScroll').addEventListener('click', e => {
  if (!S) return; const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v != null) S.m.v = +b.dataset.v;
  else if (b.dataset.pick != null) S.m.pick = +b.dataset.pick;
  else if (b.dataset.ad != null) { const i = +b.dataset.ad, max = S.it.a[i][2]; S.m.a[i] = Math.max(0, Math.min(max, S.m.a[i] + (+b.dataset.d))); }
  const y = $('#shScroll').scrollTop; renderSheet(); $('#shScroll').scrollTop = y;
});
$('#shMinus').onclick = () => { if (S && S.qty > 1) { S.qty--; updSheet(); } };
$('#shPlus').onclick = () => { if (S && S.qty < 30) { S.qty++; updSheet(); } };
$('#shAdd').onclick = () => { const r = $('#shAdd').getBoundingClientRect(), { it, m, qty } = S; closeAll(); add(it.id, m, qty, r); };
$('#shArt').addEventListener('pointermove', e => { const a = $('#shArt .arch'); if (!a || reduce) return; const r = e.currentTarget.getBoundingClientRect(); a.style.transform = `rotateY(${((e.clientX - r.left) / r.width - .5) * 16}deg) rotateX(${(.5 - (e.clientY - r.top) / r.height) * 12}deg)`; });
$('#shArt').addEventListener('pointerleave', () => { const a = $('#shArt .arch'); if (a) a.style.transform = ''; });

/* ================= DOCK + FLY ================= */
let lastN = null;
function updateDock(bump) {
  const n = count(); $('#cnt').textContent = n; $('#dockTot').textContent = fmt(total());
  const o = $('.dock .ord'); if (bump && n !== lastN && !reduce) { o.classList.remove('bump'); void o.offsetWidth; o.classList.add('bump'); }
  lastN = n;
}
function fly(r) {
  if (!r || reduce) return;
  const d = document.createElement('div'); d.className = 'fly'; document.body.appendChild(d);
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, t = $('.dock .ord').getBoundingClientRect(), x1 = t.left + 24, y1 = t.top + t.height / 2;
  d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
  d.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${(x1 - x0) / 2}px,${Math.min(y0, y1) - y0 - 120}px) scale(1.4)`, offset: .45 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(.5)`, opacity: .4 }], { duration: 800, easing: 'cubic-bezier(.45,0,.55,1)' }).onfinish = () => d.remove();
}
let tt; function toast(s) { const el = $('#toast'); el.textContent = s; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 1900); $('#live').textContent = s; }

/* ================= ORDER TICKET ================= */
let view = 'list', form = { name: '', where: 'table', table: '', notes: '' };
try { Object.assign(form, JSON.parse(localStorage.getItem('ll-details') || '{}')); } catch (e) {}
const shop = `<div class="shop"><b>LAVENDER LOUNGE</b><small>Ain El Delb · Saida · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small></div>`;
function renderTicket() {
  const paper = $('#paper'), foot = $('#tkFoot');
  if (view === 'done') return;
  if (!lines.length) { view = 'list'; paper.innerHTML = shop + `<div class="empty">${GLYPH.bag}<b>Nothing poured yet</b><p>Tap + on anything you like and it lands here.</p></div>`; foot.innerHTML = `<button class="go ghost" type="button" data-close>Browse the menu</button>`; return; }
  const tot = total(), alt = fmt(tot, CUR === 'usd' ? 'lbp' : 'usd');
  if (view === 'list') {
    paper.innerHTML = shop + lines.map(l => { const it = ITEMS[l.id], ds = desc(it, l.m); return `<div class="tl"><span class="q">${l.qty}×</span><span class="n">${esc(it.n)}</span><span class="v">${fmt(unit(it, l.m) * l.qty)}</span>${ds ? `<span class="o">${esc(ds)}</span>` : ''}<div class="a"><div class="step" role="group" aria-label="${esc(it.n)} quantity"><button type="button" data-lq="${esc(l.key)}" data-d="-1" aria-label="One less">${ICON.minus}</button><output>${l.qty}</output><button type="button" data-lq="${esc(l.key)}" data-d="1" aria-label="One more">${ICON.plus}</button></div><button class="lnk" type="button" data-lq="${esc(l.key)}" data-d="-999">Remove</button></div></div>`; }).join('')
      + `<div class="tot"><span>Total</span><span>${fmt(tot)}<small>${alt}</small></span></div>`;
    foot.innerHTML = `<button class="go" type="button" id="tkNext"><span>Continue</span><span>${fmt(tot)}</span></button>`;
    $('#tkNext').onclick = () => { view = 'details'; renderTicket(); };
  } else if (view === 'details') {
    paper.innerHTML = shop + `<form id="tkForm" novalidate>
      <div class="field"><label for="fName">Your name</label><input id="fName" name="name" autocomplete="given-name" value="${esc(form.name)}"><span class="err" id="eName"></span></div>
      <fieldset class="field seg"><legend>Where are you?</legend><input type="radio" name="where" id="wT" value="table" ${form.where === 'table' ? 'checked' : ''}><label class="o" for="wT">At a table</label><input type="radio" name="where" id="wA" value="takeaway" ${form.where === 'takeaway' ? 'checked' : ''}><label class="o" for="wA">Takeaway</label></fieldset>
      <div class="field ${form.where === 'table' ? '' : 'hide'}" id="tblF"><label for="fTable">Table number</label><input id="fTable" name="table" inputmode="numeric" value="${esc(form.table)}" placeholder="e.g. 7"><span class="err" id="eTable"></span></div>
      <div class="field"><label for="fNotes">Notes (optional)</label><textarea id="fNotes" name="notes" rows="3" placeholder="Less ice, extra lemon…">${esc(form.notes)}</textarea></div></form>`;
    foot.innerHTML = `<button class="go" type="submit" form="tkForm"><span>Send order</span><span>${fmt(tot)}</span></button><button class="go ghost" type="button" id="tkBack" style="margin-top:8px">Back</button>`;
    const f = $('#tkForm');
    f.addEventListener('input', () => { form = Object.fromEntries(new FormData(f)); $('#tblF').classList.toggle('hide', form.where !== 'table'); try { localStorage.setItem('ll-details', JSON.stringify(form)); } catch (e) {} });
    f.addEventListener('submit', send);
    $('#tkBack').onclick = () => { view = 'list'; renderTicket(); };
  }
}
$('#paper').addEventListener('click', e => { const b = e.target.closest('[data-lq]'); if (!b) return; const l = lines.find(x => x.key === b.dataset.lq); if (l) setQty(l.key, +b.dataset.d === -999 ? 0 : l.qty + (+b.dataset.d)); });
function send(e) {
  e.preventDefault();
  const errN = !form.name.trim(), errT = form.where === 'table' && !/^\d{1,3}$/.test(String(form.table).trim());
  $('#eName').textContent = errN ? 'Tell us your name.' : ''; $('#eTable').textContent = errT ? 'Which table are you at?' : '';
  if (errN || errT) { (errN ? $('#fName') : $('#fTable')).focus(); return; }
  const no = 'L-' + Math.floor(100 + Math.random() * 900), tot = total();
  const txt = `Order ${no} · ${form.name.trim()} · ${form.where === 'table' ? 'Table ' + form.table : 'Takeaway'}\n` + lines.map(l => { const it = ITEMS[l.id], ds = desc(it, l.m); return `${l.qty} × ${it.n}${ds ? ' (' + ds + ')' : ''} — ${fmt(unit(it, l.m) * l.qty, 'usd')}`; }).join('\n') + `\nTotal: ${fmt(tot, 'usd')} (${fmt(tot, 'lbp')})${form.notes ? '\nNotes: ' + form.notes : ''}`;
  if (ORDER_WHATSAPP) window.open(`https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
  view = 'done';
  $('#paper').innerHTML = shop + `<div class="done"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46"/><path pathLength="1" d="M30 52l13 13 27-29"/></svg><h3>On its way</h3><p>Order <b>${no}</b> for ${esc(form.name.trim())}${form.where === 'table' ? `, table ${esc(form.table)}` : ', takeaway'}. Total ${fmt(tot)}.</p>${ORDER_WHATSAPP ? '' : '<div class="demo">Demo mode: this order was not sent to Lavender Lounge.</div>'}</div>`;
  $('#tkFoot').innerHTML = `<button class="go" type="button" id="tkNew"><span>Start a new order</span><span>+</span></button>`;
  lines = []; save(); Object.keys(ITEMS).forEach(renderCtl); updateDock();
  $('#tkNew').onclick = () => { view = 'list'; closeAll(); };
}

/* ================= SEARCH ================= */
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '');
const SYN = { coffee: ['coffee', 'latte', 'espresso', 'cappuccino', 'americano', 'rakwa', 'nescafe', 'mocha', 'doppio', 'frappe'], cocktail: ['cocktail', 'martini', 'margarita', 'gin', 'jager'], cocktails: ['cocktail', 'martini', 'margarita', 'gin', 'jager'],
  shisha: ['shisha'], hookah: ['shisha'], argileh: ['shisha'], arguile: ['shisha'], nargileh: ['shisha'], argile: ['shisha'], whiskey: ['whisky', 'walker', 'jameson', 'chivas', 'glenfiddich'], whisky: ['whisky', 'walker', 'jameson', 'chivas', 'glenfiddich'],
  sweet: ['dessert', 'cake', 'brownie', 'fondant', 'cheesecake', 'ice cream', 'milkshake'], dessert: ['dessert', 'cake', 'brownie', 'fondant', 'cheesecake', 'ice cream'], alcohol: ['cocktail', 'whisky', 'vodka', 'gin', 'wine', 'shot', 'beer', 'almaza'],
  beer: ['beer', 'almaza', 'mexican'], juice: ['juice', 'lemonade', 'smoothie'], tea: ['tea'], shake: ['milkshake'], shakes: ['milkshake'] };
const IDX = Object.values(ITEMS).map(it => ({ it, n: norm(it.n), x: norm([it.note, it.sec.title, it.sec.kicker, it.grp.title || '', it.v ? it.v.map(v => v[0]).join(' ') : '', it.pick ? it.pick[1].join(' ') : ''].join(' ')) }));
const QUICK = [['Coffee', 'coffee'], ['Lavender', 'lavender'], ['Cocktails', 'cocktail'], ['Shisha', 'shisha'], ['Whisky', 'whisky'], ['Sweet', 'sweet'], ['Under $5', '$u5']];
$('#qchips').innerHTML = QUICK.map(([l, q]) => `<button type="button" data-q="${q}">${l}</button>`).join('');
let res = [], act = -1;
function runSearch() {
  const raw = $('#sq').value.trim(), q = norm(raw); let terms = [];
  if (!q) res = ['91', '80', '165', 'redlabel', '176', '166'].map(id => ({ it: ITEMS[id] }));
  else if (q === '$u5' || q === 'under $5' || q === 'under 5') res = IDX.filter(e => e.it.p <= 5).map(e => ({ it: e.it }));
  else {
    terms = q.split(/\s+/);
    res = IDX.map(e => { let s = 0; for (const t of terms) { const alts = SYN[t] || [t]; let b = 0; for (const a of alts) { if (e.n.startsWith(a)) b = Math.max(b, 6); else if (e.n.includes(a)) b = Math.max(b, 4); else if (e.x.includes(a)) b = Math.max(b, 2); } if (!b) return null; s += b; } return { it: e.it, s }; }).filter(Boolean).sort((a, b) => b.s - a.s);
  }
  act = res.length ? 0 : -1;
  $('#smeta').textContent = !q ? 'House favourites' : res.length ? `${res.length} result${res.length > 1 ? 's' : ''}` : '';
  const words = terms.flatMap(t => SYN[t] || [t]).filter(w => w.length > 1).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const hl = s => { if (!words.length) return esc(s); const f = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); const re = new RegExp(words.join('|'), 'g'); let o = '', last = 0, m; while ((m = re.exec(f))) { o += esc(s.slice(last, m.index)) + '<mark>' + esc(s.slice(m.index, m.index + m[0].length)) + '</mark>'; last = m.index + m[0].length; if (!m[0].length) re.lastIndex++; } return o + esc(s.slice(last)); };
  $('#sres').innerHTML = res.length ? res.map((r, i) => `<li role="option" id="sr${i}" data-sr="${r.it.id}" class="${i === act ? 'act' : ''}" aria-selected="${i === act}"><span class="th">${r.it.sec.photo ? `<img src="${photoOf(r.it.sec)}-sm.webp" alt="">` : GLYPH[r.it.sec.glyph || 'glass']}</span><span><div class="t">${hl(r.it.n)}</div><div class="s">${esc(r.it.sec.title)}${r.it.note ? ' · ' + hl(r.it.note) : ''}</div></span><span class="p">${priceHTML(r.it)}</span></li>`).join('')
    : `<li class="snone" style="display:block;cursor:default"><b>Not on the menu… yet</b>Try “latte”, “mojito” or “shisha”.</li>`;
  $$('#qchips button').forEach(b => b.setAttribute('aria-pressed', b.dataset.q === q));
}
function openSearch() { openPanel('srch'); runSearch(); }
function pickRes(id) { const it = ITEMS[id]; closeAll(); setTimeout(() => { jump(it.sec.id, 'it-' + id); if (hasOpts(it)) setTimeout(() => openSheet(id), reduce ? 0 : 650); }, 50); }
$('#sq').addEventListener('input', runSearch);
$('#sq').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!res.length) return; act = (act + (e.key === 'ArrowDown' ? 1 : -1) + res.length) % res.length; $$('#sres li').forEach((li, i) => { li.classList.toggle('act', i === act); li.setAttribute('aria-selected', i === act); }); $$('#sres li')[act].scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter' && act >= 0) { e.preventDefault(); pickRes(res[act].it.id); }
});
$('#qchips').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) return; $('#sq').value = b.dataset.q === '$u5' ? 'under $5' : b.dataset.q; runSearch(); $('#sq').focus(); });
$('#sres').addEventListener('click', e => { const li = e.target.closest('[data-sr]'); if (li) pickRes(li.dataset.sr); });

/* ================= VISIT ================= */
$('#dirBtn').href = `https://www.google.com/maps/dir/?api=1&destination=${INFO.lat}%2C${INFO.lng}`;
$('#waBtn').href = `https://wa.me/${WA}?text=${encodeURIComponent('Hi Lavender Lounge! I’d like to book a table.')}`;
$('#igBtn').href = INFO.instagram;
$('#phoneBig').textContent = INFO.phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
$('#rateTxt').textContent = INFO.rate.toLocaleString('en-US');
let stars = 0;
$('#rate').innerHTML = [1, 2, 3, 4, 5].map(i => `<button type="button" role="radio" aria-checked="false" data-star="${i}" aria-label="${i} star${i > 1 ? 's' : ''}">${ICON.star}</button>`).join('');
$('#rate').addEventListener('click', e => { const b = e.target.closest('[data-star]'); if (!b) return; stars = +b.dataset.star; $$('#rate button').forEach(x => { const on = +x.dataset.star <= stars; x.classList.toggle('on', on); x.setAttribute('aria-checked', +x.dataset.star === stars); }); });
$('#fbSend').onclick = () => {
  if (!stars) { toast('Tap the stars first'); return; }
  const msg = `Feedback for Lavender Lounge: ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}${$('#fbText').value.trim() ? '\n' + $('#fbText').value.trim() : ''}`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
};

/* ================= LOADER ================= */
(function loader() {
  const el = $('#loader'); let seen = false;
  try { seen = sessionStorage.getItem('ll-intro') === '1'; sessionStorage.setItem('ll-intro', '1'); } catch (e) {}
  const go = () => { el.classList.add('out'); document.documentElement.classList.add('ready'); setTimeout(() => el.remove(), 800); };
  if (seen || reduce) { el.remove(); document.documentElement.classList.add('ready'); return; }
  setTimeout(go, 1900);
})();

setCur(CUR); updateDock(); onScroll();
