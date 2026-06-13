// =====================================================================
//  app.js — Cœur de l'application
//  - Registre des thèmes et des chapitres
//  - Store localStorage v2 : XP, badges, suivi par exercice, maîtrise,
//    streak, "à revoir", réglages (thème/police), historique XP
//  - Routeur SPA par hash (#/, #/chapitre/cXX, #/tableau)
//  - Accueil, page de chapitre, tableau de bord, réglages, PWA
// =====================================================================

import { renderMath } from './render.js';
import { mountExercise, mountQuiz } from './engine.js';

// ---------------------------------------------------------------------
//  Registre des thèmes
// ---------------------------------------------------------------------

export const THEMES = [
  { id: 'nombres_calculs', label: 'Nombres et calculs', icone: '🔢' },
  { id: 'fonctions',       label: 'Fonctions',           icone: '📈' },
  { id: 'geometrie',       label: 'Géométrie',           icone: '📐' },
  { id: 'donnees',         label: 'Données et probabilités', icone: '📊' },
  { id: 'algo',            label: 'Algorithmique', icone: '💻', bonus: true },
];

// ---------------------------------------------------------------------
//  Registre des chapitres
// ---------------------------------------------------------------------

export const CHAPTERS = [
  { id: 'c01', num: 1,  titre: 'Calcul littéral',            theme: 'nombres_calculs', priorite: true,  icone: '🔢', module: './chapters/c01_calcul_litteral.js' },
  { id: 'c02', num: 2,  titre: 'Identités remarquables',     theme: 'nombres_calculs', priorite: true,  icone: '🟰', module: './chapters/c02_identites_remarquables.js' },
  { id: 'c03', num: 3,  titre: 'Équations du 1er degré',     theme: 'nombres_calculs', priorite: false, icone: '⚖️', module: './chapters/c03_equations_1er_degre.js' },
  { id: 'c04', num: 4,  titre: 'Équations-produit',          theme: 'nombres_calculs', priorite: false, icone: '✖️', module: './chapters/c04_equations_produit.js' },
  { id: 'c05', num: 5,  titre: 'Arithmétique',               theme: 'nombres_calculs', priorite: false, icone: '🧮', module: './chapters/c05_arithmetique.js' },
  { id: 'c06', num: 6,  titre: 'Puissances et racines',      theme: 'nombres_calculs', priorite: false, icone: '√',  module: './chapters/c06_puissances_racines.js' },
  { id: 'c07', num: 7,  titre: 'Notion de fonction',         theme: 'fonctions',       priorite: true,  icone: '📈', module: './chapters/c07_notion_de_fonction.js' },
  { id: 'c08', num: 8,  titre: 'Fonctions linéaires & affines', theme: 'fonctions',    priorite: true,  icone: '📉', module: './chapters/c08_fonctions_lineaires_affines.js' },
  { id: 'c09', num: 9,  titre: 'Sens de variation',          theme: 'fonctions',       priorite: false, icone: '〽️', module: './chapters/c09_variations_lecture_graphique.js' },
  { id: 'c10', num: 10, titre: 'Théorème de Thalès',         theme: 'geometrie',       priorite: true,  icone: '📐', module: './chapters/c10_thales.js' },
  { id: 'c11', num: 11, titre: 'Trigonométrie',              theme: 'geometrie',       priorite: true,  icone: '🔺', module: './chapters/c11_trigonometrie.js' },
  { id: 'c12', num: 12, titre: 'Transformations du plan',    theme: 'geometrie',       priorite: false, icone: '🔄', module: './chapters/c12_transformations_plan.js' },
  { id: 'c13', num: 13, titre: 'Homothétie',                 theme: 'geometrie',       priorite: false, icone: '🔎', module: './chapters/c13_homothetie.js' },
  { id: 'c14', num: 14, titre: 'Géométrie dans l\'espace',   theme: 'geometrie',       priorite: false, icone: '🧊', module: './chapters/c14_geometrie_espace.js' },
  { id: 'c15', num: 15, titre: 'Statistiques',               theme: 'donnees',         priorite: false, icone: '📊', module: './chapters/c15_statistiques.js' },
  { id: 'c16', num: 16, titre: 'Probabilités',               theme: 'donnees',         priorite: false, icone: '🎲', module: './chapters/c16_probabilites.js' },
  { id: 'c17', num: 17, titre: 'Algorithmique',              theme: 'algo',            priorite: false, icone: '💻', module: './chapters/c17_algorithmique.js' },
];

const chapterById = (id) => CHAPTERS.find((c) => c.id === id);
const themeById = (id) => THEMES.find((t) => t.id === id);
const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ---------------------------------------------------------------------
//  Store localStorage (v2, migration douce depuis v1)
// ---------------------------------------------------------------------

const STORE_KEY = 'maths3eme_v1'; // on garde la clé : migration en place

const Store = {
  data: {
    version: 2, xp: 0, badges: {}, chapters: {}, last: null,
    streak: { count: 0, lastDay: null },
    settings: { theme: 'auto', font: 'normal' },
    history: [], // [{ d:'YYYY-MM-DD', xp: <total cumulé ce jour> }]
  },

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) this.data = Object.assign(this.data, JSON.parse(raw));
    } catch (e) { console.warn('[store] lecture impossible', e); }
    // défauts pour les champs ajoutés en v2
    this.data.streak = this.data.streak || { count: 0, lastDay: null };
    this.data.settings = Object.assign({ theme: 'auto', font: 'normal' }, this.data.settings || {});
    this.data.history = this.data.history || [];
    return this;
  },
  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); }
    catch (e) { console.warn('[store] sauvegarde impossible', e); }
  },

  chapter(id) {
    if (!this.data.chapters[id]) {
      this.data.chapters[id] = { xp: 0, exercices: {}, quizPassed: false, quizScore: null, review: false };
    }
    return this.data.chapters[id];
  },

  // — Activité quotidienne : streak + instantané d'XP pour le graphique —
  touchActivity() {
    const today = ymd();
    const s = this.data.streak;
    if (s.lastDay !== today) {
      const yest = ymd(new Date(Date.now() - 86400000));
      s.count = s.lastDay === yest ? s.count + 1 : 1;
      s.lastDay = today;
    }
    const h = this.data.history;
    const last = h[h.length - 1];
    if (last && last.d === today) last.xp = this.data.xp;
    else h.push({ d: today, xp: this.data.xp });
    if (h.length > 90) h.splice(0, h.length - 90);
  },

  addXP(n, chId) {
    this.data.xp += n;
    if (chId) this.chapter(chId).xp += n;
    this.touchActivity();
    this.save();
    refreshTopbar();
  },

  // — Suivi fin par exercice (tentatives, réussites, échecs) —
  recordAttempt(chId, exId, ok) {
    const c = this.chapter(chId);
    let e = c.exercices[exId];
    if (typeof e !== 'object' || e === null) e = { seen: e === true ? 1 : 0, ok: e === true ? 1 : 0, ko: 0 };
    e.seen = (e.seen || 0) + 1;
    if (ok) e.ok = (e.ok || 0) + 1; else e.ko = (e.ko || 0) + 1;
    e.last = Date.now();
    c.exercices[exId] = e;
    this.touchActivity();
    this.save();
  },

  passQuiz(chId, score, total) {
    const c = this.chapter(chId);
    c.quizPassed = true;
    c.quizScore = `${score}/${total}`;
    this.data.badges[chId] = { date: Date.now() };
    this.save();
    refreshTopbar();
  },
  setQuizScore(chId, score, total) { this.chapter(chId).quizScore = `${score}/${total}`; this.save(); },
  setLast(chId) { this.data.last = chId; this.save(); },
  hasBadge(chId) { return !!this.data.badges[chId]; },

  toggleReview(chId) { const c = this.chapter(chId); c.review = !c.review; this.save(); return c.review; },
  isReview(chId) { return !!this.chapter(chId).review; },

  level() { return Math.floor(this.data.xp / 100) + 1; },
  levelProgress() { return this.data.xp % 100; },

  globalProgress() {
    const done = CHAPTERS.filter((c) => this.chapter(c.id).quizPassed).length;
    return { done, total: CHAPTERS.length, pct: Math.round((done / CHAPTERS.length) * 100) };
  },
  themeProgress(themeId) {
    const list = CHAPTERS.filter((c) => c.theme === themeId);
    const done = list.filter((c) => this.chapter(c.id).quizPassed).length;
    return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
  },

  // — Maîtrise (0–100) : exercices réussis + quiz validé —
  mastery(chId) {
    const c = this.chapter(chId);
    let attempted = 0, mastered = 0;
    for (const id in c.exercices) {
      const e = c.exercices[id];
      if (typeof e === 'object' && e) { attempted++; if ((e.ok || 0) > 0) mastered++; }
      else if (e === true) { attempted++; mastered++; }
    }
    const exoScore = attempted ? mastered / attempted : 0;
    const quizScore = c.quizPassed ? 1 : 0;
    if (!attempted && !quizScore) return 0;
    return Math.round((exoScore * 0.6 + quizScore * 0.4) * 100);
  },
  masteryLabel(pct) {
    if (pct >= 85) return '🏆 Maîtrisé';
    if (pct >= 60) return '🌳 Solide';
    if (pct >= 30) return '🌿 En progrès';
    if (pct > 0) return '🌱 Débuté';
    return 'À commencer';
  },

  // — Statistiques d'erreurs (« ce qui coince ») —
  chapterErrors(chId) {
    const c = this.chapter(chId);
    let ok = 0, ko = 0;
    for (const id in c.exercices) { const e = c.exercices[id]; if (typeof e === 'object' && e) { ok += e.ok || 0; ko += e.ko || 0; } }
    return { ok, ko, total: ok + ko, rate: ok + ko ? ko / (ok + ko) : 0 };
  },
  weakChapters() {
    return CHAPTERS
      .map((c) => ({ c, ...this.chapterErrors(c.id), review: this.isReview(c.id) }))
      .filter((x) => x.review || (x.ko >= 2 && x.rate >= 0.4))
      .sort((a, b) => (b.review - a.review) || (b.rate - a.rate));
  },

  weeklyXP() {
    const cutoff = ymd(new Date(Date.now() - 6 * 86400000));
    const before = [...this.data.history].reverse().find((h) => h.d < cutoff);
    const base = before ? before.xp : 0;
    return Math.max(0, this.data.xp - base);
  },

  exportJSON() { return JSON.stringify(this.data); },
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !('xp' in obj)) throw new Error('Sauvegarde invalide');
    this.data = Object.assign(this.data, obj);
    this.load(); // re-applique les défauts
    this.save();
  },
  reset() {
    this.data = { version: 2, xp: 0, badges: {}, chapters: {}, last: null,
      streak: { count: 0, lastDay: null }, settings: this.data.settings, history: [] };
    this.save();
  },
};

// ---------------------------------------------------------------------
//  Réglages (thème clair/sombre, taille de police)
// ---------------------------------------------------------------------

function applySettings() {
  const { theme, font } = Store.data.settings;
  const root = document.documentElement;
  let mode = theme;
  if (theme === 'auto') {
    mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-font', font);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#1c2520' : '#5b8a72');
}

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (Store.data.settings.theme === 'auto') applySettings();
  });
}

function openSettings() {
  let modal = document.getElementById('settings-modal');
  if (modal) { modal.classList.add('open'); return; }
  modal = document.createElement('div');
  modal.id = 'settings-modal';
  modal.className = 'modal open';
  const s = Store.data.settings;
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-label="Réglages">
      <div class="modal-head"><h2>⚙️ Réglages</h2><button class="modal-close" aria-label="Fermer">✕</button></div>
      <fieldset class="setting-group">
        <legend>Thème</legend>
        <label><input type="radio" name="theme" value="auto"> Automatique</label>
        <label><input type="radio" name="theme" value="light"> Clair ☀️</label>
        <label><input type="radio" name="theme" value="dark"> Sombre 🌙</label>
      </fieldset>
      <fieldset class="setting-group">
        <legend>Lecture</legend>
        <label><input type="radio" name="font" value="normal"> Police normale</label>
        <label><input type="radio" name="font" value="large"> Grande police 🔍</label>
        <label><input type="radio" name="font" value="dys"> Lecture facilitée</label>
      </fieldset>
      <a class="btn btn-ghost" href="#/tableau" data-close>📊 Tableau de bord & sauvegarde</a>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector(`input[name="theme"][value="${s.theme}"]`).checked = true;
  modal.querySelector(`input[name="font"][value="${s.font}"]`).checked = true;
  const close = () => modal.classList.remove('open');
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  modal.querySelectorAll('input[name="theme"]').forEach((r) => r.addEventListener('change', () => { s.theme = r.value; Store.save(); applySettings(); }));
  modal.querySelectorAll('input[name="font"]').forEach((r) => r.addEventListener('change', () => { s.font = r.value; Store.save(); applySettings(); }));
}

// ---------------------------------------------------------------------
//  Barre supérieure (niveau + XP + streak)
// ---------------------------------------------------------------------

function refreshTopbar() {
  const el = document.getElementById('xpMini');
  if (!el) return;
  const lvl = Store.level();
  const prog = Store.levelProgress();
  const streak = Store.data.streak.count;
  el.innerHTML = `
    ${streak > 1 ? `<span class="streak-mini" title="${streak} jours d'affilée">🔥${streak}</span>` : ''}
    <span class="lvl-badge">Niv. ${lvl}</span>
    <span class="xp-bar"><span style="width:${prog}%"></span></span>
    <span class="xp-val">${Store.data.xp} XP</span>`;
}

// ---------------------------------------------------------------------
//  Confettis (animation de réussite, sans bibliothèque)
// ---------------------------------------------------------------------

function confetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.className = 'confetti-canvas';
  cv.width = innerWidth; cv.height = innerHeight;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const colors = ['#5b8a72', '#4f7bb0', '#8a6fb0', '#c0894a', '#b06f8a', '#2f9e6b'];
  const N = 120;
  const parts = Array.from({ length: N }, () => ({
    x: innerWidth / 2, y: innerHeight / 3,
    vx: (Math.random() - 0.5) * 12, vy: Math.random() * -10 - 4,
    s: Math.random() * 7 + 4, c: colors[Math.floor(Math.random() * colors.length)],
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
  }));
  let t = 0;
  (function frame() {
    t++;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore();
    });
    if (t < 130) requestAnimationFrame(frame); else cv.remove();
  })();
}

// ---------------------------------------------------------------------
//  Routeur SPA (hash)
// ---------------------------------------------------------------------

const app = () => document.getElementById('app');

function router() {
  const hash = location.hash || '#/';
  window.scrollTo(0, 0);
  const m = hash.match(/^#\/chapitre\/(c\d+)/);
  if (m) renderChapter(m[1]);
  else if (hash.startsWith('#/tableau')) renderDashboard();
  else if (hash.startsWith('#/formulaire')) renderFormulaire();
  else renderHome();
}
function navigate(hash) { location.hash = hash; }

// ---------------------------------------------------------------------
//  Page d'accueil
// ---------------------------------------------------------------------

function renderHome() {
  const root = app();
  root.removeAttribute('data-theme');
  const g = Store.globalProgress();
  const last = Store.data.last ? chapterById(Store.data.last) : null;
  const streak = Store.data.streak.count;
  const review = CHAPTERS.filter((c) => Store.isReview(c.id));

  const priorityCards = CHAPTERS.filter((c) => c.priorite).map(chapterCard).join('');
  const themesHtml = THEMES.map((t) => {
    const list = CHAPTERS.filter((c) => c.theme === t.id);
    const tp = Store.themeProgress(t.id);
    return `
      <section class="theme-block" data-theme="${t.id}">
        <div class="theme-head">
          <h2><span class="theme-ico">${t.icone}</span> ${t.label}
            ${t.bonus ? '<span class="bonus-tag">bonus</span>' : ''}</h2>
          <div class="theme-prog">
            <span class="mini-bar"><span style="width:${tp.pct}%"></span></span>
            <span class="mini-prog-txt">${tp.done}/${tp.total}</span>
          </div>
        </div>
        <div class="chapter-grid">${list.map(chapterCard).join('')}</div>
      </section>`;
  }).join('');

  root.innerHTML = `
    <section class="hero">
      <h1>Maths 3ᵉ — Prêt·e pour le brevet 🚀</h1>
      <p class="hero-sub">16 chapitres + 1 bonus, du cours aux exercices interactifs. Avance à ton rythme, aucun chapitre n'est verrouillé.</p>
      <div class="global-progress">
        <div class="gp-bar"><span style="width:${g.pct}%"></span></div>
        <div class="gp-stats">
          <span><strong>${g.done}</strong>/${g.total} chapitres validés</span>
          <span><strong>${Store.data.xp}</strong> XP · Niveau ${Store.level()}</span>
          <span><strong>${Object.keys(Store.data.badges).length}</strong> 🏅 badges</span>
          ${streak > 1 ? `<span>🔥 <strong>${streak}</strong> jours d'affilée</span>` : ''}
        </div>
      </div>
      <div class="hero-actions">
        ${last ? `<button class="btn btn-primary btn-resume" data-resume="${last.id}">▶️ Reprendre : ${last.icone} ${last.titre}</button>` : ''}
        <a class="btn btn-ghost" href="#/tableau">📊 Mon tableau de bord</a>
        <a class="btn btn-ghost" href="#/formulaire">📖 Aide-mémoire</a>
      </div>
    </section>

    ${review.length ? `
    <section class="review-section">
      <h2>🔖 À revoir</h2>
      <div class="chapter-grid">${review.map(chapterCard).join('')}</div>
    </section>` : ''}

    <section class="priority-section">
      <div class="priority-head">
        <h2>⭐ Par où commencer — Chapitres prioritaires</h2>
        <p>Les chapitres travaillés en cours particulier cet été. Commence par là si tu hésites.</p>
      </div>
      <div class="chapter-grid priority-grid">${priorityCards}</div>
    </section>

    <div class="all-chapters">
      <h2 class="section-title">Tous les chapitres par thème</h2>
      ${themesHtml}
    </div>
  `;

  root.querySelectorAll('[data-goto]').forEach((el) =>
    el.addEventListener('click', () => navigate(`#/chapitre/${el.dataset.goto}`)));
  const resume = root.querySelector('[data-resume]');
  if (resume) resume.addEventListener('click', () => navigate(`#/chapitre/${resume.dataset.resume}`));
  refreshTopbar();
}

function chapterCard(c) {
  const cp = Store.chapter(c.id);
  const badge = Store.hasBadge(c.id);
  const started = cp.xp > 0 || Object.keys(cp.exercices).length > 0;
  const available = !!c.module;
  const m = Store.mastery(c.id);
  return `
    <button class="chapter-card ${c.priorite ? 'is-priority' : ''} ${available ? '' : 'is-soon'}"
            data-theme="${c.theme}" data-goto="${c.id}"
            aria-label="Chapitre ${c.num} : ${c.titre}">
      <div class="cc-top">
        <span class="cc-ico">${c.icone}</span>
        <span class="cc-tags">
          ${Store.isReview(c.id) ? '<span class="cc-review" title="À revoir">🔖</span>' : ''}
          ${c.priorite ? '<span class="cc-star" title="Prioritaire">⭐</span>' : ''}
          ${badge ? '<span class="cc-medal" title="Chapitre validé">🏅</span>' : ''}
        </span>
      </div>
      <div class="cc-num">Chapitre ${c.num}</div>
      <div class="cc-title">${c.titre}</div>
      ${started && available ? `<div class="cc-mastery"><span style="width:${m}%"></span></div>` : ''}
      <div class="cc-status">
        ${available ? (badge ? 'Validé ✓' : (started ? Store.masteryLabel(m) : 'Commencer')) : 'Bientôt disponible'}
      </div>
    </button>`;
}

// ---------------------------------------------------------------------
//  Page de chapitre
// ---------------------------------------------------------------------

async function renderChapter(id) {
  const meta = chapterById(id);
  const root = app();
  if (!meta) { root.innerHTML = `<p class="notice">Chapitre introuvable. <a href="#/">Retour à l'accueil</a></p>`; return; }
  root.setAttribute('data-theme', meta.theme);
  root.innerHTML = `<p class="loading">Chargement du chapitre…</p>`;

  if (!meta.module) {
    root.innerHTML = `
      <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
      <div class="chapter-soon"><span class="soon-ico">${meta.icone}</span><h1>${meta.titre}</h1>
        <p>Ce chapitre arrive prochainement.</p>
        <a class="btn btn-primary" href="#/chapitre/c01">Découvrir un chapitre complet →</a></div>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    return;
  }

  let chap;
  try { chap = (await import(meta.module)).default; }
  catch (e) { console.error(e); root.innerHTML = `<p class="notice">Erreur de chargement. <a href="#/">Retour</a></p>`; return; }

  Store.setLast(id);
  buildChapterPage(root, meta, chap);
}

function buildChapterPage(root, meta, chap) {
  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>

    <header class="chapter-hero">
      <span class="ch-ico">${chap.icone || meta.icone}</span>
      <div>
        <div class="ch-eyebrow">Chapitre ${meta.num}${chap.priorite ? ' · ⭐ Prioritaire' : ''}</div>
        <h1>${chap.titre}</h1>
      </div>
      <div class="ch-actions">
        <button class="btn btn-ghost ch-review" data-review aria-pressed="${Store.isReview(meta.id)}">${Store.isReview(meta.id) ? '🔖 À revoir' : '🔖 Marquer à revoir'}</button>
        ${Store.hasBadge(meta.id) ? '<span class="ch-badge">🏅 Validé</span>' : ''}
      </div>
    </header>

    <nav class="chapter-toc">
      <a href="#sec-intro">À quoi ça sert</a>
      <a href="#sec-cours">Cours</a>
      <a href="#sec-methode">Méthode</a>
      <a href="#sec-exos">Exercices</a>
      <a href="#sec-quiz">Quiz bilan</a>
    </nav>

    <section id="sec-intro" class="chapter-section intro-card"><h2>💡 À quoi ça sert ?</h2><p>${chap.intro || ''}</p></section>
    <section id="sec-cours" class="chapter-section"><h2>📚 Cours essentiel</h2><div class="cours-list"></div></section>
    <section id="sec-methode" class="chapter-section"><h2>🧭 Méthode pas-à-pas</h2><p class="muted">Clique pour révéler les étapes une à une.</p><ol class="methode-list"></ol></section>
    <section id="sec-exos" class="chapter-section"><h2>✏️ Exercices interactifs</h2><div class="level-tabs"></div><div class="exos-host"></div></section>
    <section id="sec-quiz" class="chapter-section quiz-section"><h2>🏁 Quiz bilan</h2><p class="muted">5 questions pour valider le chapitre et décrocher ton badge (80 % requis).</p><div class="quiz-host"></div></section>
  `;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
  const reviewBtn = root.querySelector('[data-review]');
  reviewBtn.addEventListener('click', () => {
    const on = Store.toggleReview(meta.id);
    reviewBtn.textContent = on ? '🔖 À revoir' : '🔖 Marquer à revoir';
    reviewBtn.setAttribute('aria-pressed', on);
  });

  const coursHost = root.querySelector('.cours-list');
  (chap.cours || []).forEach((bloc) => coursHost.appendChild(renderCoursBloc(bloc)));

  const methodeHost = root.querySelector('.methode-list');
  (chap.methode || []).forEach((etape, i) => {
    const li = document.createElement('li');
    li.className = 'methode-step';
    li.innerHTML = `
      <button class="step-toggle"><span class="step-num">${etape.etape ?? i + 1}</span><span class="step-titre">${etape.titre}</span><span class="step-chevron">▸</span></button>
      <div class="step-body" hidden>${etape.explication || ''}</div>`;
    const body = li.querySelector('.step-body');
    li.querySelector('.step-toggle').addEventListener('click', () => {
      const open = !body.hidden; body.hidden = open; li.classList.toggle('open', !open); if (!open) renderMath(body);
    });
    methodeHost.appendChild(li);
  });

  const tabs = root.querySelector('.level-tabs');
  const exoHost = root.querySelector('.exos-host');
  const niveaux = [{ n: 1, label: 'Découverte' }, { n: 2, label: 'Application' }, { n: 3, label: 'Défi' }];
  function showLevel(n) {
    exoHost.innerHTML = '';
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', parseInt(b.dataset.lvl, 10) === n));
    const exos = (chap.exercices || []).filter((e) => e.niveau === n);
    if (!exos.length) { exoHost.innerHTML = '<p class="muted">Aucun exercice à ce niveau.</p>'; return; }
    exos.forEach((ex) => mountExercise(exoHost, ex, {
      onCorrect: (xp) => Store.addXP(xp, meta.id),
      onAttempt: (exId, ok) => Store.recordAttempt(meta.id, exId, ok),
    }));
  }
  niveaux.forEach((lv) => {
    const count = (chap.exercices || []).filter((e) => e.niveau === lv.n).length;
    const b = document.createElement('button');
    b.className = 'level-tab lvl-' + lv.n; b.dataset.lvl = lv.n;
    b.innerHTML = `<strong>Niveau ${lv.n}</strong><span>${lv.label} · ${count}</span>`;
    b.addEventListener('click', () => showLevel(lv.n));
    tabs.appendChild(b);
  });
  showLevel(1);

  const quizHost = root.querySelector('.quiz-host');
  if (chap.quiz_bilan && chap.quiz_bilan.length) {
    let lastScore = [0, chap.quiz_bilan.length];
    mountQuiz(quizHost, chap.quiz_bilan, {
      onComplete: (s, t) => { lastScore = [s, t]; Store.setQuizScore(meta.id, s, t); },
      onPass: (xp) => { Store.addXP(xp, meta.id); Store.passQuiz(meta.id, lastScore[0], lastScore[1]); celebrate(meta); },
    });
  } else { quizHost.innerHTML = '<p class="muted">Quiz à venir.</p>'; }

  renderMath(root);
}

function renderCoursBloc(bloc) {
  const div = document.createElement('div');
  div.className = `cours-bloc bloc-${bloc.type || 'definition'}`;
  if (bloc.type === 'figure') {
    div.innerHTML = `<div class="bloc-tag">Figure</div>${bloc.titre ? `<h3>${bloc.titre}</h3>` : ''}`;
    const host = document.createElement('div');
    div.appendChild(host);
    if (typeof bloc.render === 'function') {
      requestAnimationFrame(() => { try { bloc.render(host); } catch (e) { console.error('[app] figure cours :', e); } });
    }
    if (bloc.contenu) { const p = document.createElement('p'); p.innerHTML = bloc.contenu; div.appendChild(p); }
  } else if (bloc.type === 'exemple') {
    div.innerHTML = `<div class="bloc-tag">Exemple</div><p class="bloc-enonce">${bloc.enonce || ''}</p><ol class="bloc-etapes">${(bloc.solution_etapes || []).map((s) => `<li>${s}</li>`).join('')}</ol>`;
  } else {
    const tag = bloc.type === 'propriete' ? 'Propriété' : 'Définition';
    div.innerHTML = `<div class="bloc-tag">${tag}</div>${bloc.titre ? `<h3>${bloc.titre}</h3>` : ''}${bloc.contenu ? `<p>${bloc.contenu}</p>` : ''}${bloc.formule ? `<div class="bloc-formule">$$${bloc.formule}$$</div>` : ''}`;
  }
  return div;
}

// ---------------------------------------------------------------------
//  Tableau de bord (progression, maîtrise, "ce qui coince", sauvegarde)
// ---------------------------------------------------------------------

function renderDashboard() {
  const root = app();
  root.removeAttribute('data-theme');
  const g = Store.globalProgress();
  const weak = Store.weakChapters();

  const themeBars = THEMES.map((t) => {
    const tp = Store.themeProgress(t.id);
    const chaps = CHAPTERS.filter((c) => c.theme === t.id).map((c) => {
      const m = Store.mastery(c.id);
      return `<div class="dash-chap" data-goto="${c.id}">
        <span class="dash-chap-name">${c.icone} ${c.titre}</span>
        <span class="dash-chap-bar" data-theme="${c.theme}"><span style="width:${m}%"></span></span>
        <span class="dash-chap-pct">${m}%</span></div>`;
    }).join('');
    return `<div class="dash-theme" data-theme="${t.id}">
      <h3>${t.icone} ${t.label} <span class="muted">(${tp.done}/${tp.total})</span></h3>${chaps}</div>`;
  }).join('');

  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero">
      <h1>📊 Mon tableau de bord</h1>
      <div class="dash-stats">
        <div class="dash-stat"><span class="ds-val">${Store.data.xp}</span><span class="ds-lab">XP</span></div>
        <div class="dash-stat"><span class="ds-val">Niv. ${Store.level()}</span><span class="ds-lab">niveau</span></div>
        <div class="dash-stat"><span class="ds-val">${g.done}/${g.total}</span><span class="ds-lab">validés</span></div>
        <div class="dash-stat"><span class="ds-val">🔥 ${Store.data.streak.count}</span><span class="ds-lab">jours</span></div>
        <div class="dash-stat"><span class="ds-val">${Store.weeklyXP()}</span><span class="ds-lab">XP/7j</span></div>
      </div>
    </header>

    <section class="chapter-section">
      <h2>📈 Évolution de l'XP</h2>
      <div class="dash-chart-host"></div>
    </section>

    ${weak.length ? `
    <section class="chapter-section">
      <h2>🎯 Ce qui coince (à retravailler)</h2>
      <div class="weak-list">${weak.map((w) => `
        <button class="weak-item" data-goto="${w.c.id}" data-theme="${w.c.theme}">
          <span>${w.c.icone} ${w.c.titre}</span>
          <span class="weak-meta">${w.review ? '🔖 ' : ''}${w.total ? Math.round(w.rate * 100) + "% d'erreurs" : 'à revoir'}</span>
        </button>`).join('')}</div>
    </section>` : '<section class="chapter-section"><h2>🎯 Ce qui coince</h2><p class="muted">Rien à signaler pour l\'instant — continue comme ça ! 💪</p></section>'}

    <section class="chapter-section">
      <h2>🧭 Maîtrise par chapitre</h2>
      <div class="dash-themes">${themeBars}</div>
    </section>

    <section class="chapter-section">
      <h2>💾 Sauvegarde</h2>
      <p class="muted">Ta progression est stockée sur cet appareil. Pour la transférer sur un autre téléphone/ordi, copie ta sauvegarde ici puis colle-la sur l'autre appareil.</p>
      <div class="save-actions">
        <button class="btn btn-primary" data-act="copy">📋 Copier ma sauvegarde</button>
        <button class="btn btn-ghost" data-act="download">⬇️ Télécharger (fichier)</button>
        <label class="btn btn-ghost">⬆️ Importer un fichier<input type="file" accept="application/json" hidden data-act="file"></label>
      </div>
      <textarea class="save-box" data-box placeholder="Colle ici une sauvegarde puis clique « Restaurer »…"></textarea>
      <div class="save-actions">
        <button class="btn btn-primary" data-act="restore">♻️ Restaurer</button>
        <button class="btn btn-danger" data-act="reset">🗑️ Réinitialiser ma progression</button>
      </div>
      <p class="save-msg" data-msg aria-live="polite"></p>
    </section>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
  root.querySelectorAll('[data-goto]').forEach((el) => el.addEventListener('click', () => navigate(`#/chapitre/${el.dataset.goto}`)));

  // Graphique d'évolution (Chart.js)
  const chartHost = root.querySelector('.dash-chart-host');
  const hist = Store.data.history;
  if (window.Chart && hist.length >= 2) {
    import('./render.js').then(({ mountChart }) => {
      mountChart(chartHost, {
        type: 'line',
        data: { labels: hist.map((h) => h.d.slice(5)), datasets: [{ data: hist.map((h) => h.xp), borderColor: '#5b8a72', backgroundColor: 'rgba(91,138,114,0.15)', fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
      });
    });
  } else {
    chartHost.innerHTML = '<p class="muted">Fais quelques exercices : ta courbe de progression apparaîtra ici. 📈</p>';
  }

  // Sauvegarde
  const box = root.querySelector('[data-box]');
  const msg = root.querySelector('[data-msg]');
  const say = (t, ok = true) => { msg.textContent = t; msg.className = 'save-msg ' + (ok ? 'is-ok' : 'is-err'); };
  root.querySelector('[data-act="copy"]').addEventListener('click', async () => {
    const data = Store.exportJSON(); box.value = data;
    try { await navigator.clipboard.writeText(data); say('Sauvegarde copiée ! Colle-la sur l\'autre appareil. ✓'); }
    catch (e) { box.select(); say('Sélectionne le texte ci-dessous et copie-le manuellement.'); }
  });
  root.querySelector('[data-act="download"]').addEventListener('click', () => {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `maths3eme-sauvegarde-${ymd()}.json`; a.click(); URL.revokeObjectURL(a.href);
    say('Fichier téléchargé. ✓');
  });
  root.querySelector('[data-act="file"]').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { Store.importJSON(r.result); say('Sauvegarde restaurée ! ✓'); refreshTopbar(); setTimeout(() => renderDashboard(), 400); } catch (err) { say('Fichier invalide.', false); } };
    r.readAsText(f);
  });
  root.querySelector('[data-act="restore"]').addEventListener('click', () => {
    if (!box.value.trim()) { say('Colle d\'abord une sauvegarde dans le cadre.', false); return; }
    try { Store.importJSON(box.value.trim()); say('Sauvegarde restaurée ! ✓'); refreshTopbar(); setTimeout(() => renderDashboard(), 400); }
    catch (e) { say('Sauvegarde invalide.', false); }
  });
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    if (confirm('Effacer toute la progression sur cet appareil ? Cette action est irréversible.')) {
      Store.reset(); say('Progression réinitialisée.'); refreshTopbar(); setTimeout(() => renderDashboard(), 400);
    }
  });

  refreshTopbar();
}

// ---------------------------------------------------------------------
//  Aide-mémoire / formulaire
// ---------------------------------------------------------------------

async function renderFormulaire() {
  const root = app();
  root.removeAttribute('data-theme');
  root.innerHTML = `<p class="loading">Chargement du formulaire…</p>`;
  let data;
  try { data = (await import('./aide_memoire.js')).default; }
  catch (e) { root.innerHTML = `<p class="notice">Erreur. <a href="#/">Retour</a></p>`; return; }

  const blocks = data.map((grp) => `
    <section class="form-theme" data-theme="${grp.theme}">
      <h2>${grp.icone} ${grp.titre}</h2>
      ${grp.fiches.map((f) => `
        <div class="form-fiche">
          <h3>${f.titre}</h3>
          ${f.formules.map((tex) => `<div class="form-formule">$$${tex}$$</div>`).join('')}
        </div>`).join('')}
    </section>`).join('');

  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero"><h1>📖 Aide-mémoire</h1>
      <p class="muted">Toutes les formules clés à connaître pour le brevet, rassemblées par thème.</p></header>
    ${blocks}
  `;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
  renderMath(root);
}

// ---------------------------------------------------------------------
//  Félicitations (badge + confettis)
// ---------------------------------------------------------------------

function celebrate(meta) {
  confetti();
  const t = document.createElement('div');
  t.className = 'toast-badge';
  t.innerHTML = `🏅 <strong>Badge débloqué !</strong><br>${meta.titre}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
  const hero = document.querySelector('.chapter-hero .ch-actions');
  if (hero && !hero.querySelector('.ch-badge')) {
    const span = document.createElement('span'); span.className = 'ch-badge'; span.textContent = '🏅 Validé'; hero.appendChild(span);
  }
}

// ---------------------------------------------------------------------
//  Démarrage + PWA
// ---------------------------------------------------------------------

let _booted = false;
function boot() {
  if (_booted) return;
  _booted = true;
  applySettings();
  const btn = document.getElementById('btnSettings');
  if (btn) btn.addEventListener('click', openSettings);
  refreshTopbar();
  router();
}

Store.load();
window.addEventListener('hashchange', router);
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();

// Service worker (hors-ligne + installation). Sans effet en local file://.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', location.href)).catch((e) => console.warn('[pwa] SW non enregistré', e));
  });
}
