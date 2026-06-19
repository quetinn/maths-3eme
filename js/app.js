// =====================================================================
//  app.js — Cœur de l'application
//  - Registre des thèmes et des chapitres
//  - Store localStorage v2 : XP, badges, suivi par exercice, maîtrise,
//    streak, "à revoir", réglages (thème/police), historique XP
//  - Routeur SPA par hash (#/, #/chapitre/cXX, #/tableau)
//  - Accueil, page de chapitre, tableau de bord, réglages, PWA
// =====================================================================

import { renderMath } from './render.js';
import { mountExercise, mountQuiz, checkAnswer } from './engine.js';

// ---------------------------------------------------------------------
//  Registre des thèmes
// ---------------------------------------------------------------------

export const THEMES = [
  { id: 'nombres_calculs', label: 'Nombres et calculs', icone: '🔢' },
  { id: 'fonctions',       label: 'Fonctions',           icone: '📈' },
  { id: 'geometrie',       label: 'Géométrie',           icone: '📐' },
  { id: 'donnees',         label: 'Données et probabilités', icone: '📊' },
  { id: 'algo',            label: 'Algorithmique', icone: '💻', bonus: true },
  { id: 'rappels',         label: 'Rappels de 4ᵉ', icone: '🧰', rappel: true },
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
  // Rappels de 4ᵉ — programme complet à réviser avant la 3ᵉ (ordonné par domaine).
  { id: 'r02', num: 18, titre: 'Nombres relatifs',             theme: 'rappels',       priorite: false, icone: '➕', module: './chapters/r02_nombres_relatifs.js' },
  { id: 'r03', num: 19, titre: 'Opérations sur les fractions', theme: 'rappels',       priorite: false, icone: '🍰', module: './chapters/r03_fractions.js' },
  { id: 'r06', num: 20, titre: 'Calcul littéral (4ᵉ)',         theme: 'rappels',       priorite: false, icone: '✖️', module: './chapters/r06_calcul_litteral.js' },
  { id: 'r07', num: 21, titre: 'Équations (4ᵉ)',               theme: 'rappels',       priorite: false, icone: '⚖️', module: './chapters/r07_equations.js' },
  { id: 'r08', num: 22, titre: 'Puissances (4ᵉ)',              theme: 'rappels',       priorite: false, icone: '²',  module: './chapters/r08_puissances.js' },
  { id: 'r04', num: 23, titre: 'Proportionnalité',             theme: 'rappels',       priorite: false, icone: '⚖️', module: './chapters/r04_proportionnalite.js' },
  { id: 'r09', num: 24, titre: 'Statistiques (4ᵉ)',            theme: 'rappels',       priorite: false, icone: '📊', module: './chapters/r09_statistiques.js' },
  { id: 'r10', num: 25, titre: 'Probabilités (4ᵉ)',            theme: 'rappels',       priorite: false, icone: '🎲', module: './chapters/r10_probabilites.js' },
  { id: 'r01', num: 26, titre: 'Théorème de Pythagore',        theme: 'rappels',       priorite: false, icone: '📐', module: './chapters/r01_pythagore.js' },
  { id: 'r05', num: 27, titre: 'Cosinus (triangle rectangle)', theme: 'rappels',       priorite: false, icone: '📐', module: './chapters/r05_cosinus.js' },
  { id: 'r11', num: 28, titre: 'Translation et symétries (4ᵉ)', theme: 'rappels',      priorite: false, icone: '🔄', module: './chapters/r11_transformations.js' },
  { id: 'r12', num: 29, titre: 'Aires, périmètres et volumes (4ᵉ)', theme: 'rappels',  priorite: false, icone: '📦', module: './chapters/r12_aires_volumes.js' },
];

const chapterById = (id) => CHAPTERS.find((c) => c.id === id);
const themeById = (id) => THEMES.find((t) => t.id === id);
const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Cache des modules de chapitre importés (évite de ré-importer les 17 modules
// à chaque lancement d'examen / fiche / page chapitre).
const _moduleCache = new Map();
async function loadChapter(meta) {
  if (!meta || !meta.module) return null;
  if (_moduleCache.has(meta.id)) return _moduleCache.get(meta.id);
  const mod = (await import(meta.module)).default;
  _moduleCache.set(meta.id, mod);
  return mod;
}

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
    this.data.achievements = this.data.achievements || {};
    this.data.daily = this.data.daily || { d: null, count: 0 };
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

  // — Compteur d'exercices réussis dans la journée (objectif quotidien + succès) —
  bumpDaily() {
    const today = ymd();
    if (!this.data.daily || this.data.daily.d !== today) this.data.daily = { d: today, count: 0 };
    this.data.daily.count++;
    this.save();
  },
  exercisesToday() {
    const today = ymd();
    return (this.data.daily && this.data.daily.d === today) ? this.data.daily.count : 0;
  },
  markExamPassed() { if (!this.data.examPassed) { this.data.examPassed = true; this.save(); } },

  addXP(n, chId) {
    this.data.xp += n;
    if (chId) this.chapter(chId).xp += n;
    this.touchActivity();
    this.save();
    refreshTopbar();
    checkAchievements();
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
    checkAchievements();
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
  // Bilan d'erreurs agrégé par domaine (thème) — pour le tableau de bord.
  errorsByTheme() {
    return THEMES.map((t) => {
      let ok = 0, ko = 0;
      CHAPTERS.filter((c) => c.theme === t.id).forEach((c) => { const e = this.chapterErrors(c.id); ok += e.ok; ko += e.ko; });
      return { t, ok, ko, total: ok + ko, rate: ok + ko ? ko / (ok + ko) : 0 };
    }).filter((x) => x.total > 0).sort((a, b) => b.rate - a.rate);
  },

  weeklyXP() {
    const cutoff = ymd(new Date(Date.now() - 6 * 86400000));
    const before = [...this.data.history].reverse().find((h) => h.d < cutoff);
    const base = before ? before.xp : 0;
    return Math.max(0, this.data.xp - base);
  },

  // Export horodaté et étiqueté (les métas _app/_savedAt aident à reconnaître
  // une sauvegarde valide ; elles sont inoffensives à la relecture).
  exportJSON() { return JSON.stringify(Object.assign({ _app: 'maths3eme', _savedAt: new Date().toISOString() }, this.data)); },
  // Variante compacte pour le QR (progression essentielle, sans l'historique).
  exportCompact() {
    const chapters = {};
    for (const id in this.data.chapters) {
      const c = this.data.chapters[id];
      chapters[id] = { xp: c.xp || 0, quizPassed: !!c.quizPassed, quizScore: c.quizScore || null, review: !!c.review };
    }
    return JSON.stringify({ _app: 'maths3eme', xp: this.data.xp, chapters, badges: this.data.badges,
      streak: this.data.streak, achievements: this.data.achievements, settings: this.data.settings, examPassed: this.data.examPassed });
  },
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !('xp' in obj)) throw new Error('Sauvegarde invalide');
    delete obj._app; delete obj._savedAt; // métadonnées d'export, pas des données de jeu
    this.data = Object.assign(this.data, obj);
    this.save(); // persiste D'ABORD la sauvegarde importée dans localStorage…
    this.load(); // …puis re-applique les défauts en relisant ce qu'on vient d'écrire
    // (l'inverse écrasait l'import par l'ancienne sauvegarde locale : restauration cassée).
    refreshTopbar();
    return { xp: this.data.xp, chapters: Object.keys(this.data.chapters).length, badges: Object.keys(this.data.badges).length };
  },
  reset() {
    this.data = { version: 2, xp: 0, badges: {}, chapters: {}, last: null,
      streak: { count: 0, lastDay: null }, settings: this.data.settings, history: [], achievements: {},
      daily: { d: null, count: 0 }, examPassed: false };
    this.save();
  },
};

// ---------------------------------------------------------------------
//  Succès / badges de progression
// ---------------------------------------------------------------------

const WEEKLY_GOAL = 100; // XP visés par semaine
const DAILY_GOAL = 5;    // exercices réussis visés par jour

const ACHIEVEMENTS = [
  { id: 'first',   icone: '🎯', label: 'Premier pas',       cond: () => Store.data.xp > 0 },
  { id: 'xp100',   icone: '⭐', label: '100 XP',            cond: () => Store.data.xp >= 100 },
  { id: 'xp500',   icone: '🌟', label: '500 XP',            cond: () => Store.data.xp >= 500 },
  { id: 'xp1000',  icone: '💎', label: '1000 XP',           cond: () => Store.data.xp >= 1000 },
  { id: 'streak3', icone: '🔥', label: '3 jours d\'affilée', cond: () => Store.data.streak.count >= 3 },
  { id: 'streak7', icone: '🔥', label: 'Une semaine !',     cond: () => Store.data.streak.count >= 7 },
  { id: 'daily10', icone: '⚡', label: '10 exercices en un jour', cond: () => Store.exercisesToday() >= 10 },
  { id: 'chap1',   icone: '🏅', label: '1er chapitre validé', cond: () => Object.keys(Store.data.badges).length >= 1 },
  { id: 'exam',    icone: '🎓', label: 'Examen blanc réussi', cond: () => !!Store.data.examPassed },
  { id: 'theme',   icone: '📗', label: 'Un thème complété',  cond: () => THEMES.some((t) => Store.themeProgress(t.id).pct === 100) },
  { id: 'half',    icone: '🏆', label: 'À mi-chemin (9 ch.)', cond: () => Store.globalProgress().done >= 9 },
  { id: 'all',     icone: '👑', label: 'Brevet en poche !',  cond: () => Store.globalProgress().done >= CHAPTERS.length },
];

function checkAchievements() {
  const a = Store.data.achievements;
  const fresh = [];
  for (const def of ACHIEVEMENTS) {
    if (!a[def.id] && def.cond()) { a[def.id] = { date: Date.now() }; fresh.push(def); }
  }
  if (fresh.length) { Store.save(); fresh.forEach((def, i) => setTimeout(() => toast(`${def.icone} Succès débloqué : ${def.label}`), i * 600)); }
  return fresh;
}

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

let _settingsReturnFocus = null;

function closeSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.classList.remove('open');
  if (_settingsReturnFocus && typeof _settingsReturnFocus.focus === 'function') _settingsReturnFocus.focus();
  _settingsReturnFocus = null;
}

function openSettings() {
  let modal = document.getElementById('settings-modal');
  const s = Store.data.settings;
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="modal-head"><h2 id="settings-title">⚙️ Réglages</h2><button class="modal-close" aria-label="Fermer les réglages">✕</button></div>
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
    modal.querySelector('.modal-close').addEventListener('click', closeSettings);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings(); });
    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeSettings));
    modal.querySelectorAll('input[name="theme"]').forEach((r) => r.addEventListener('change', () => { s.theme = r.value; Store.save(); applySettings(); }));
    modal.querySelectorAll('input[name="font"]').forEach((r) => r.addEventListener('change', () => { s.font = r.value; Store.save(); applySettings(); }));
    // Accessibilité : Échap pour fermer + piège de focus (Tab boucle dans la modale).
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeSettings(); return; }
      if (e.key !== 'Tab') return;
      const focusables = [...modal.querySelectorAll('button, [href], input')].filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  // (Ré)synchronise l'état des champs, mémorise le focus de départ, puis ouvre.
  modal.querySelector(`input[name="theme"][value="${s.theme}"]`).checked = true;
  modal.querySelector(`input[name="font"][value="${s.font}"]`).checked = true;
  _settingsReturnFocus = document.activeElement;
  modal.classList.add('open');
  modal.querySelector('.modal-close').focus();
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
//  Toast (notification éphémère)
// ---------------------------------------------------------------------

function toast(html) {
  const t = document.createElement('div');
  t.className = 'toast-badge';
  t.innerHTML = html;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
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
//  Génération de QR (chargement paresseux de la bibliothèque par CDN)
// ---------------------------------------------------------------------

let _qrLoading = null;
function loadQRLib() {
  if (window.qrcode) return Promise.resolve();
  if (_qrLoading) return _qrLoading;
  _qrLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('QR lib non chargée'));
    document.head.appendChild(s);
  });
  return _qrLoading;
}

/** Renvoie un <svg> QR (chaîne HTML) encodant `text`. */
async function makeQR(text) {
  await loadQRLib();
  // typeNumber 0 = ajustement automatique ; niveau 'L' = capacité maximale.
  const qr = window.qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}

// ---------------------------------------------------------------------
//  Routeur SPA (hash)
// ---------------------------------------------------------------------

const app = () => document.getElementById('app');

function router() {
  const hash = location.hash || '#/';
  window.scrollTo(0, 0);
  if (examTimer) { clearInterval(examTimer); examTimer = null; } // stop chrono si on quitte l'examen
  const m = hash.match(/^#\/chapitre\/([a-z]+\d+)/);
  const rev = hash.match(/^#\/revision\/([a-z]+\d+)/);
  if (m) renderChapter(m[1]);
  else if (rev) renderRevision(rev[1]);
  else if (hash.startsWith('#/tableau')) renderDashboard();
  else if (hash.startsWith('#/formulaire')) renderFormulaire();
  else if (hash.startsWith('#/examen')) renderExamen();
  else if (hash.startsWith('#/brevet')) renderBrevet();
  else if (hash.startsWith('#/revise')) renderRevise();
  else if (hash.startsWith('#/restore')) renderRestore();
  else if (hash.startsWith('#/diagnostic')) renderDiagnostic();
  else if (hash.startsWith('#/fiche')) renderFiche();
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
  const rappelsChaps = CHAPTERS.filter((c) => c.theme === 'rappels');
  const themesHtml = THEMES.filter((t) => t.id !== 'rappels').map((t) => {
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
      <p class="hero-sub">16 chapitres, 1 bonus et des rappels de 4ᵉ, du cours aux exercices interactifs. Avance à ton rythme, aucun chapitre n'est verrouillé.</p>
      <div class="global-progress">
        <div class="gp-bar"><span style="width:${g.pct}%"></span></div>
        <div class="gp-stats">
          <span><strong>${g.done}</strong>/${g.total} chapitres validés</span>
          <span><strong>${Store.data.xp}</strong> XP · Niveau ${Store.level()}</span>
          <span><strong>${Object.keys(Store.data.badges).length}</strong> 🏅 badges</span>
          ${streak > 1 ? `<span>🔥 <strong>${streak}</strong> jours d'affilée</span>` : ''}
        </div>
      </div>
      <div class="weekly-goal" title="Objectif du jour">
        <span>📅 Objectif du jour</span>
        <span class="mini-bar"><span style="width:${Math.min(100, Math.round(Store.exercisesToday() / DAILY_GOAL * 100))}%"></span></span>
        <span class="mini-prog-txt">${Store.exercisesToday()}/${DAILY_GOAL} exos</span>
      </div>
      <div class="weekly-goal" title="Objectif de la semaine">
        <span>🎯 Objectif de la semaine</span>
        <span class="mini-bar"><span style="width:${Math.min(100, Math.round(Store.weeklyXP() / WEEKLY_GOAL * 100))}%"></span></span>
        <span class="mini-prog-txt">${Store.weeklyXP()}/${WEEKLY_GOAL} XP</span>
      </div>
      <div class="hero-actions">
        ${last ? `<button class="btn btn-primary btn-resume" data-resume="${last.id}">▶️ Reprendre : ${last.icone} ${last.titre}</button>` : ''}
        <a class="btn btn-primary" href="#/brevet">📄 Brevet blanc</a>
        <a class="btn btn-ghost" href="#/revise">🔁 Révision du jour</a>
        <a class="btn btn-ghost" href="#/tableau">📊 Tableau de bord</a>
        <a class="btn btn-ghost" href="#/formulaire">📖 Aide-mémoire</a>
        <a class="btn btn-ghost" href="#/examen">📝 Examen blanc</a>
        <a class="btn btn-ghost" href="#/fiche">🖨️ Fiches (tuteur)</a>
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

    ${rappelsChaps.length ? `
    <section class="rappels-section" data-theme="rappels">
      <div class="priority-head">
        <h2>🧰 Rappels de 4ᵉ</h2>
        <p>Les bases de l'an dernier à réviser avant d'attaquer le programme de 3ᵉ.</p>
      </div>
      <div class="chapter-grid">${rappelsChaps.map(chapterCard).join('')}</div>
    </section>` : ''}

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
          ${c.theme === 'rappels' ? '<span class="cc-4eme" title="Rappel de 4ᵉ">4ᵉ</span>' : ''}
          ${Store.isReview(c.id) ? '<span class="cc-review" title="À revoir">🔖</span>' : ''}
          ${c.priorite ? '<span class="cc-star" title="Prioritaire">⭐</span>' : ''}
          ${badge ? '<span class="cc-medal" title="Chapitre validé">🏅</span>' : ''}
        </span>
      </div>
      <div class="cc-num">${c.theme === 'rappels' ? 'Rappel · 4ᵉ' : 'Chapitre ' + c.num}</div>
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
  try { chap = await loadChapter(meta); }
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
        <div class="ch-eyebrow">${meta.theme === 'rappels' ? 'Rappel de 4ᵉ' : 'Chapitre ' + meta.num}${chap.priorite ? ' · ⭐ Prioritaire' : ''}</div>
        <h1>${chap.titre}</h1>
      </div>
      <div class="ch-actions">
        <a class="btn btn-ghost" href="#/revision/${meta.id}">🖨️ Fiche de révision</a>
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
  let curLevel = 1;
  let sessionStreak = 0;   // bonnes réponses d'affilée au niveau courant
  let nudged = {};         // évite de re-proposer le même palier

  function showLevel(n) {
    curLevel = n; sessionStreak = 0;
    exoHost.innerHTML = '';
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', parseInt(b.dataset.lvl, 10) === n));
    const exos = (chap.exercices || []).filter((e) => e.niveau === n);
    if (!exos.length) { exoHost.innerHTML = '<p class="muted">Aucun exercice à ce niveau.</p>'; return; }
    exos.forEach((ex) => mountExercise(exoHost, ex, {
      onCorrect: (xp) => { Store.bumpDaily(); Store.addXP(xp, meta.id); onLevelCorrect(); },
      onAttempt: (exId, ok) => { Store.recordAttempt(meta.id, exId, ok); if (!ok) sessionStreak = 0; },
    }));
  }

  // Difficulté adaptative : après 3 bonnes réponses d'affilée, proposer le niveau supérieur.
  function onLevelCorrect() {
    sessionStreak++;
    if (sessionStreak >= 3 && curLevel < 3 && !nudged[curLevel]) {
      nudged[curLevel] = true;
      const next = curLevel + 1;
      const banner = document.createElement('div');
      banner.className = 'adaptive-nudge';
      banner.innerHTML = `🚀 Tu enchaînes les bonnes réponses ! Prêt·e pour le <strong>niveau ${next}</strong> ?
        <button class="btn btn-primary" data-next>Niveau ${next} →</button>`;
      exoHost.prepend(banner);
      banner.querySelector('[data-next]').addEventListener('click', () => { showLevel(next); window.scrollTo({ top: document.querySelector('#sec-exos').offsetTop - 80, behavior: 'smooth' }); });
    }
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
  const errBy = Store.errorsByTheme();

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
      <div class="save-actions"><a class="btn btn-primary" href="#/revise">🔁 Lancer une révision ciblée</a></div>
    </section>` : '<section class="chapter-section"><h2>🎯 Ce qui coince</h2><p class="muted">Rien à signaler pour l\'instant — continue comme ça ! 💪</p></section>'}

    ${errBy.length ? `
    <section class="chapter-section">
      <h2>📋 Bilan d'erreurs par domaine</h2>
      <div class="errbar-list">${errBy.map((e) => `
        <div class="errbar-row">
          <span class="errbar-name">${e.t.icone} ${e.t.label}</span>
          <span class="errbar-track"><span class="errbar-fill" style="width:${Math.round(e.rate * 100)}%"></span></span>
          <span class="errbar-pct">${Math.round(e.rate * 100)}% · ${e.ko}/${e.total}</span>
        </div>`).join('')}</div>
      <p class="muted">Pourcentage d'erreurs (réponses fausses) par domaine — vise à le faire baisser. 📉</p>
    </section>` : ''}

    <section class="chapter-section">
      <h2>🧭 Maîtrise par chapitre</h2>
      <div class="dash-themes">${themeBars}</div>
    </section>

    <section class="chapter-section">
      <h2>🏆 Succès (${Object.keys(Store.data.achievements).length}/${ACHIEVEMENTS.length})</h2>
      <div class="badge-grid">${ACHIEVEMENTS.map((a) => {
        const got = !!Store.data.achievements[a.id];
        return `<div class="badge-item ${got ? 'got' : 'locked'}"><span class="badge-ico">${got ? a.icone : '🔒'}</span><span class="badge-lab">${a.label}</span></div>`;
      }).join('')}</div>
    </section>

    <section class="chapter-section">
      <h2>💾 Sauvegarde</h2>
      <p class="muted">Ta progression est stockée sur cet appareil. Pour la transférer sur un autre téléphone/ordi, le plus simple est le <strong>QR</strong> : affiche-le ici, scanne-le avec l'autre appareil.</p>
      <div class="save-actions">
        <button class="btn btn-primary" data-act="qr">📱 Transférer par QR</button>
        <button class="btn btn-ghost" data-act="copy">📋 Copier le texte</button>
        <button class="btn btn-ghost" data-act="download">⬇️ Télécharger (fichier)</button>
        <label class="btn btn-ghost">⬆️ Importer un fichier<input type="file" accept="application/json" hidden data-act="file"></label>
      </div>
      <div class="save-qr" data-qr hidden></div>
      <details class="save-advanced">
        <summary>Transfert par texte (avancé)</summary>
        <textarea class="save-box" data-box placeholder="Colle ici une sauvegarde puis clique « Restaurer »…"></textarea>
        <div class="save-actions">
          <button class="btn btn-primary" data-act="restore">♻️ Restaurer</button>
        </div>
      </details>
      <div class="save-actions">
        <button class="btn btn-danger" data-act="reset">🗑️ Réinitialiser ma progression</button>
      </div>
      <p class="save-msg" data-msg aria-live="polite"></p>
    </section>

    <p class="dash-footlink"><a href="#/diagnostic">🩺 Diagnostic de l'application</a></p>
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
  const summarize = (s) => `Sauvegarde restaurée ! ${s.xp} XP · ${s.chapters} chapitre(s) · ${s.badges} badge(s). ✓`;
  root.querySelector('[data-act="file"]').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const s = Store.importJSON(r.result); say(summarize(s)); refreshTopbar(); setTimeout(() => renderDashboard(), 600); } catch (err) { say('Fichier invalide.', false); } };
    r.readAsText(f);
  });
  root.querySelector('[data-act="restore"]').addEventListener('click', () => {
    if (!box.value.trim()) { say('Colle d\'abord une sauvegarde dans le cadre.', false); return; }
    try { const s = Store.importJSON(box.value.trim()); say(summarize(s)); refreshTopbar(); setTimeout(() => renderDashboard(), 600); }
    catch (e) { say('Sauvegarde invalide.', false); }
  });
  // Transfert par QR : encode un lien profond #/restore?d=… que l'autre
  // appareil ouvre via son appareil photo natif (iOS + Android), sans scanner.
  const qrBox = root.querySelector('[data-qr]');
  root.querySelector('[data-act="qr"]').addEventListener('click', async () => {
    if (!qrBox.hidden) { qrBox.hidden = true; qrBox.innerHTML = ''; return; }
    qrBox.hidden = false;
    qrBox.innerHTML = '<p class="loading">Génération du QR…</p>';
    try {
      const payload = btoa(unescape(encodeURIComponent(Store.exportCompact()))).replace(/\+/g, '-').replace(/\//g, '_');
      const base = location.href.split('#')[0];
      const url = `${base}#/restore?d=${payload}`;
      const qr = await makeQR(url);
      qrBox.innerHTML = `
        <div class="qr-card">
          ${qr}
          <p class="muted">📷 Scanne ce code avec l'appareil photo de l'autre téléphone/ordi : il ouvrira l'appli avec ta progression.</p>
        </div>`;
    } catch (e) {
      console.warn('[qr]', e);
      qrBox.innerHTML = `<p class="notice">Impossible de générer le QR (hors-ligne ?). Utilise « Copier le texte » ou « Télécharger ».</p>`;
    }
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
//  Fiche de révision imprimable (cours + méthode condensés)
// ---------------------------------------------------------------------

async function renderRevision(id) {
  const meta = chapterById(id);
  const root = app();
  if (!meta || !meta.module) { navigate('#/'); return; }
  root.setAttribute('data-theme', meta.theme);
  root.innerHTML = `<p class="loading">Préparation de la fiche…</p>`;
  let chap;
  try { chap = await loadChapter(meta); } catch (e) { root.innerHTML = `<p class="notice">Erreur. <a href="#/">Retour</a></p>`; return; }

  const cours = (chap.cours || []).filter((b) => b.type !== 'figure').map(renderCoursBloc);
  const methode = (chap.methode || []).map((e, i) => `<li><strong>${e.titre}</strong> — ${e.explication}</li>`).join('');

  root.innerHTML = `
    <div class="no-print">
      <button class="btn btn-ghost btn-back" data-back>← Chapitre</button>
      <button class="btn btn-primary" data-print>🖨️ Imprimer / PDF</button>
    </div>
    <article class="print-sheet">
      <h1>${chap.icone || meta.icone} ${chap.titre} — Fiche de révision</h1>
      <p class="muted">${chap.intro || ''}</p>
      <h2>Cours essentiel</h2>
      <div class="cours-list"></div>
      <h2>Méthode</h2>
      <ol class="revision-methode">${methode}</ol>
    </article>`;
  const cl = root.querySelector('.cours-list');
  cours.forEach((el) => cl.appendChild(el));
  root.querySelector('[data-back]').addEventListener('click', () => navigate(`#/chapitre/${id}`));
  root.querySelector('[data-print]').addEventListener('click', () => window.print());
  renderMath(root);
}

// ---------------------------------------------------------------------
//  Réponse / énoncé "papier" d'un exercice généré
// ---------------------------------------------------------------------

function answerOf(exo, s) {
  if (exo.type === 'qcm' || s.choix) return s.choix[s.correct];
  if (exo.type === 'vrai_faux') return s.reponse ? 'Vrai' : 'Faux';
  if (exo.type === 'ordonner_etapes') return s.etapes.join(' → ');
  if (exo.type === 'complete') return s.champs.map((c) => c.reponseTex || c.reponse).join(' ; ');
  return s.reponseTex || s.reponse;
}
function enonceForPrint(exo, s) {
  if (exo.type === 'complete') return (s.enonce_complete || s.enonce).replace(/\{\d+\}/g, '\\,\\underline{\\quad}\\,');
  if (exo.type === 'ordonner_etapes') return '<ul>' + s.etapes.map((e) => `<li>${e}</li>`).join('') + '</ul>';
  return s.enonce || '';
}

// ---------------------------------------------------------------------
//  Générateur de fiche d'exercices imprimable (mode tuteur)
// ---------------------------------------------------------------------

function renderFiche() {
  const root = app();
  root.removeAttribute('data-theme');
  const opts = CHAPTERS.filter((c) => c.module).map((c) => `<option value="${c.id}">${c.num}. ${c.titre}</option>`).join('');
  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero"><h1>🖨️ Générateur de fiches</h1>
      <p class="muted">Pour le tuteur : génère une feuille d'exercices (avec corrigé) à imprimer pour une séance.</p></header>
    <section class="chapter-section no-print">
      <div class="fiche-form">
        <label>Chapitre <select data-chap>${opts}</select></label>
        <label>Niveau
          <select data-lvl><option value="1">1 — Découverte</option><option value="2">2 — Application</option><option value="3">3 — Défi</option></select></label>
        <label>Nombre d'exercices <input type="number" data-count value="6" min="1" max="15"></label>
        <button class="btn btn-primary" data-gen>Générer la fiche</button>
        <button class="btn btn-ghost" data-print disabled>🖨️ Imprimer / PDF</button>
      </div>
    </section>
    <article class="print-sheet" data-sheet></article>`;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));

  const sheet = root.querySelector('[data-sheet]');
  const printBtn = root.querySelector('[data-print]');

  root.querySelector('[data-gen]').addEventListener('click', async () => {
    const id = root.querySelector('[data-chap]').value;
    const lvl = parseInt(root.querySelector('[data-lvl]').value, 10);
    const count = Math.max(1, Math.min(15, parseInt(root.querySelector('[data-count]').value, 10) || 6));
    const meta = chapterById(id);
    sheet.innerHTML = '<p class="loading">Génération…</p>';
    let chap;
    try { chap = await loadChapter(meta); } catch (e) { sheet.innerHTML = '<p class="notice">Erreur.</p>'; return; }
    const pool = (chap.exercices || []).filter((e) => e.niveau === lvl);
    if (!pool.length) { sheet.innerHTML = '<p class="muted">Aucun exercice à ce niveau.</p>'; return; }
    const items = [];
    for (let i = 0; i < count; i++) {
      const exo = pool[i % pool.length];
      const s = exo.generer();
      items.push({ consigne: s.consigne || exo.consigne || '', enonce: enonceForPrint(exo, s), rep: answerOf(exo, s) });
    }
    sheet.innerHTML = `
      <h1>${chap.titre} — Niveau ${lvl}</h1>
      <p class="fiche-meta">Nom : ……………………………………  Date : ……………</p>
      <ol class="fiche-exos">${items.map((it) => `<li>${it.consigne ? `<em>${it.consigne}</em><br>` : ''}${it.enonce}</li>`).join('')}</ol>
      <div class="fiche-corrige"><h2>Corrigé</h2><ol>${items.map((it) => `<li>${typeof it.rep === 'string' ? `$${it.rep}$` : it.rep}</li>`).join('')}</ol></div>`;
    renderMath(sheet);
    printBtn.disabled = false;
  });
  printBtn.addEventListener('click', () => window.print());
}

// ---------------------------------------------------------------------
//  Examen blanc (questions mélangées de plusieurs chapitres + chrono)
// ---------------------------------------------------------------------

let examTimer = null;

async function renderExamen() {
  const root = app();
  root.removeAttribute('data-theme');
  if (examTimer) { clearInterval(examTimer); examTimer = null; }

  const params = new URLSearchParams((location.hash.split('?')[1]) || '');
  const scope = params.get('scope');

  if (!scope) {
    root.innerHTML = `
      <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
      <header class="dash-hero"><h1>📝 Examen blanc</h1>
        <p class="muted">Une série de questions tirées au hasard pour t'entraîner comme le jour J. Choisis un thème ou tout le programme.</p></header>
      <section class="chapter-section">
        <div class="exam-choices">
          <button class="btn btn-primary" data-scope="all">🎓 Tout le programme</button>
          ${Store.weakChapters().length ? '<button class="btn btn-primary btn-review" data-scope="review">🎯 Réviser mes erreurs</button>' : ''}
          ${THEMES.map((t) => `<button class="btn btn-ghost" data-scope="${t.id}">${t.icone} ${t.label}</button>`).join('')}
        </div>
      </section>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    root.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => navigate(`#/examen?scope=${b.dataset.scope}`)));
    return;
  }

  root.innerHTML = `<p class="loading">Préparation de l'examen…</p>`;

  // Sélection des chapitres : par thème, tout le programme, ou « réviser mes erreurs ».
  let list, reviewNote = '';
  if (scope === 'review') {
    const weak = Store.weakChapters().map((w) => w.c).filter((c) => c.module);
    list = weak.length ? weak : CHAPTERS.filter((c) => c.module);
    reviewNote = weak.length ? '🎯 Révision ciblée sur tes chapitres à retravailler.' : '';
  } else {
    list = CHAPTERS.filter((c) => c.module && (scope === 'all' || c.theme === scope));
  }
  const questions = [];
  for (const c of list) {
    try { const mod = await loadChapter(c); (mod.quiz_bilan || []).forEach((q) => questions.push(q)); } catch (e) { /* ignore */ }
  }
  // En mode révision, complète avec d'autres chapitres si le vivier est trop maigre.
  if (scope === 'review' && questions.length < 8) {
    for (const c of CHAPTERS.filter((c) => c.module && !list.includes(c))) {
      try { const mod = await loadChapter(c); (mod.quiz_bilan || []).forEach((q) => questions.push(q)); } catch (e) { /* ignore */ }
      if (questions.length >= 12) break;
    }
  }
  for (let i = questions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [questions[i], questions[j]] = [questions[j], questions[i]]; }
  const N = Math.min(10, questions.length);
  const set = questions.slice(0, N);

  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Quitter</button>
    <header class="exam-hero"><h1>📝 Examen blanc</h1><span class="exam-timer" data-timer>00:00</span></header>
    ${reviewNote ? `<p class="muted">${reviewNote}</p>` : ''}
    <div class="quiz-host"></div>`;
  root.querySelector('[data-back]').addEventListener('click', () => { if (examTimer) clearInterval(examTimer); navigate('#/'); });

  let sec = 0;
  const tEl = root.querySelector('[data-timer]');
  examTimer = setInterval(() => { sec++; tEl.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }, 1000);

  mountQuiz(root.querySelector('.quiz-host'), set, {
    onComplete: (s, t) => {
      if (examTimer) { clearInterval(examTimer); examTimer = null; }
      const passed = t > 0 && s / t >= 0.8;
      if (passed) Store.markExamPassed();      // débloque le succès « Examen blanc réussi »
      Store.addXP(s * 10 + (passed ? 50 : 0)); // identique à l'XP affichée par le quiz
      const note = root.querySelector('.quiz-result');
      if (note) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = `Temps : ${tEl.textContent}`; note.appendChild(p); }
    },
  }, { mode: 'examen' });
}

// ---------------------------------------------------------------------
//  Brevet blanc — vrais problèmes (situation + sous-questions enchaînées)
// ---------------------------------------------------------------------

/**
 * Monte un problème (situation + sous-questions) dans un conteneur.
 * @returns {Object} API { grade() → {score,total,ok}, element }
 *   grade() lit les réponses, marque chaque question ✓/✗, révèle le corrigé
 *   et renvoie le score. Idempotent (re-corrige si rappelé).
 */
function mountProbleme(host, inst, opts = {}) {
  const wrap = document.createElement('article');
  wrap.className = 'brevet-pb';
  wrap.innerHTML = `
    <header class="brevet-pb-head">
      <h3>${opts.index ? opts.index + '. ' : ''}${inst.titre}</h3>
      <span class="brevet-pb-meta">${inst.domaine} · ${inst.baremeTotal} pts</span>
    </header>
    <div class="brevet-contexte">${inst.contexte}</div>
    <div class="brevet-figure" data-figure hidden></div>
    <ol class="brevet-questions">
      ${inst.questions.map((q, i) => `
        <li class="brevet-q" data-q="${i}">
          <div class="brevet-q-enonce">${q.enonce}</div>
          <div class="brevet-answer">
            <input type="text" class="answer-input" data-input="${i}" inputmode="text"
                   autocomplete="off" autocapitalize="off" spellcheck="false"
                   placeholder="${q.placeholder || 'Ta réponse…'}" aria-label="Réponse question ${i + 1}">
            ${q.unite ? `<span class="brevet-unite">${q.unite}</span>` : ''}
            <span class="brevet-pts">${q.points} pt${q.points > 1 ? 's' : ''}</span>
          </div>
          ${q.indice ? `<details class="brevet-indice"><summary>💡 Indice</summary><div>${q.indice}</div></details>` : ''}
          <div class="brevet-q-result" data-result="${i}" hidden></div>
        </li>`).join('')}
    </ol>`;
  host.appendChild(wrap);

  // Figure éventuelle (rendu différé : l'élément doit être attaché au DOM).
  if (typeof inst.figure === 'function') {
    const figHost = wrap.querySelector('[data-figure]');
    figHost.hidden = false;
    requestAnimationFrame(() => { try { inst.figure(figHost); } catch (e) { console.error('[brevet] figure :', e); } });
  }
  renderMath(wrap);

  let graded = false;
  function grade() {
    let score = 0;
    inst.questions.forEach((q, i) => {
      const inp = wrap.querySelector(`[data-input="${i}"]`);
      const res = wrap.querySelector(`[data-result="${i}"]`);
      const ok = checkAnswer(inp.value, { reponse: q.reponse, validation: q.validation, accepte: q.accepte, tolerance: q.tolerance });
      if (ok) score += (q.points || 1);
      inp.disabled = true;
      inp.classList.toggle('is-correct', ok);
      inp.classList.toggle('is-wrong', !ok);
      res.hidden = false;
      res.innerHTML = `<p class="${ok ? 'brevet-ok' : 'brevet-ko'}">${ok ? '✅ Correct' : '❌ À revoir'} (${ok ? q.points : 0}/${q.points})</p>
        <div class="brevet-corrige">${q.corrige || ''}</div>`;
      renderMath(res);
    });
    graded = true;
    // Suivi : enregistre la réussite du problème dans les chapitres liés.
    const fullyOk = score === inst.baremeTotal;
    (inst.chapitres || []).forEach((chId) => { try { Store.recordAttempt(chId, 'brevet:' + inst.id, fullyOk); } catch (e) {} });
    return { score, total: inst.baremeTotal, ok: fullyOk };
  }
  return { grade, isGraded: () => graded, element: wrap };
}

async function renderBrevet() {
  const root = app();
  root.removeAttribute('data-theme');
  if (examTimer) { clearInterval(examTimer); examTimer = null; }
  const params = new URLSearchParams((location.hash.split('?')[1]) || '');
  const sujet = params.get('sujet');
  const pbId = params.get('pb');

  let mod;
  root.innerHTML = `<p class="loading">Préparation du brevet…</p>`;
  try { mod = await import('./brevet.js'); }
  catch (e) { console.error(e); root.innerHTML = `<p class="notice">Erreur de chargement du brevet. <a href="#/">Retour</a></p>`; return; }
  const { PROBLEMES, genererProbleme } = mod;

  // — Accueil du brevet : choisir un sujet complet ou un problème ciblé —
  if (!sujet && !pbId) {
    const cards = PROBLEMES.map((p) => `
      <button class="chapter-card" data-pb="${p.id}">
        <div class="cc-num">${p.domaine}</div>
        <div class="cc-title">${p.titre}</div>
        <div class="cc-status">~${p.dureeMin} min · s'entraîner →</div>
      </button>`).join('');
    root.innerHTML = `
      <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
      <header class="dash-hero">
        <h1>📄 Brevet blanc</h1>
        <p class="muted">De vrais problèmes comme au Diplôme National du Brevet : une situation concrète,
          plusieurs questions qui s'enchaînent, un barème et un corrigé détaillé. Tu rédiges, puis tu corriges.</p>
      </header>
      <section class="chapter-section">
        <h2>📝 Sujet complet</h2>
        <p class="muted">5 problèmes tirés au hasard sur tout le programme, avec chrono et note sur 20.</p>
        <button class="btn btn-primary" data-sujet>🎓 Commencer un sujet complet</button>
      </section>
      <section class="chapter-section">
        <h2>🎯 S'entraîner problème par problème</h2>
        <div class="chapter-grid">${cards}</div>
      </section>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    root.querySelector('[data-sujet]').addEventListener('click', () => navigate('#/brevet?sujet=complet'));
    root.querySelectorAll('[data-pb]').forEach((b) => b.addEventListener('click', () => navigate(`#/brevet?pb=${b.dataset.pb}`)));
    return;
  }

  // — Sélection des problèmes —
  let chosen;
  if (pbId) {
    const p = PROBLEMES.find((x) => x.id === pbId);
    chosen = p ? [p] : [];
  } else {
    const shuffled = [...PROBLEMES];
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    chosen = shuffled.slice(0, Math.min(5, shuffled.length));
  }
  if (!chosen.length) { root.innerHTML = `<p class="notice">Problème introuvable. <a href="#/brevet">Retour</a></p>`; return; }

  const instances = chosen.map(genererProbleme);
  const baremeGlobal = instances.reduce((s, p) => s + p.baremeTotal, 0);
  const isSujet = !pbId;

  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Quitter</button>
    <header class="brevet-hero">
      <h1>📄 ${isSujet ? 'Sujet de brevet blanc' : instances[0].titre}</h1>
      <div class="brevet-hero-meta">
        <span class="brevet-bareme">Barème : ${baremeGlobal} points</span>
        ${isSujet ? '<span class="exam-timer" data-timer>00:00</span>' : ''}
      </div>
    </header>
    <p class="muted no-print">Rédige tes réponses sur une feuille, saisis tes résultats, puis clique sur « Corriger ».
      Une calculatrice est autorisée.</p>
    <div class="brevet-host"></div>
    <div class="brevet-foot no-print">
      <button class="btn btn-primary" data-correct>✅ Corriger ${isSujet ? 'le sujet' : 'le problème'}</button>
    </div>
    <div class="brevet-result" data-bilan hidden></div>`;
  root.querySelector('[data-back]').addEventListener('click', () => { if (examTimer) { clearInterval(examTimer); examTimer = null; } navigate('#/brevet'); });

  const host = root.querySelector('.brevet-host');
  const controllers = instances.map((inst, i) => mountProbleme(host, inst, { index: isSujet ? i + 1 : 0 }));

  // Chrono (sujet complet uniquement)
  let sec = 0;
  if (isSujet) {
    const tEl = root.querySelector('[data-timer]');
    examTimer = setInterval(() => { sec++; tEl.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }, 1000);
  }

  const correctBtn = root.querySelector('[data-correct]');
  correctBtn.addEventListener('click', () => {
    if (examTimer) { clearInterval(examTimer); examTimer = null; }
    let score = 0;
    controllers.forEach((c) => { score += c.grade().score; });
    const note20 = baremeGlobal ? Math.round((score / baremeGlobal) * 20 * 10) / 10 : 0;
    const xpGain = score * 5 + (note20 >= 10 ? 40 : 0);
    Store.addXP(xpGain);
    if (isSujet && note20 >= 10) Store.markExamPassed();

    const bilan = root.querySelector('[data-bilan]');
    bilan.hidden = false;
    const appreciation = note20 >= 16 ? 'Excellent, niveau brevet assuré ! 🌟'
      : note20 >= 12 ? 'Très bien — continue comme ça ! 💪'
      : note20 >= 10 ? 'C\'est acquis, peaufine les derniers points. 👍'
      : 'Reprends les corrigés ci-dessus, puis retente. Tu vas y arriver ! 🌱';
    bilan.innerHTML = `
      <div class="brevet-bilan-card">
        <h2>Bilan ${isSujet ? 'du sujet' : ''}</h2>
        <p class="brevet-note"><strong>${score} / ${baremeGlobal}</strong> points — soit <strong>${note20} / 20</strong></p>
        ${isSujet ? `<p class="muted">Temps : ${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')} · +${xpGain} XP</p>` : `<p class="muted">+${xpGain} XP</p>`}
        <p>${appreciation}</p>
        <div class="brevet-bilan-actions no-print">
          <button class="btn btn-primary" data-retry>🔄 ${isSujet ? 'Nouveau sujet' : 'Rejouer'}</button>
          <button class="btn btn-ghost" data-print>🖨️ Imprimer / PDF</button>
          <a class="btn btn-ghost" href="#/brevet">📄 Autres problèmes</a>
        </div>
      </div>`;
    renderMath(bilan);
    correctBtn.disabled = true;
    if (note20 >= 10) confetti();
    bilan.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bilan.querySelector('[data-retry]').addEventListener('click', () => { renderBrevet(); });
    bilan.querySelector('[data-print]').addEventListener('click', () => window.print());
  });
}

// ---------------------------------------------------------------------
//  Révision espacée — re-travaille en priorité ce qui coince
// ---------------------------------------------------------------------

async function renderRevise() {
  const root = app();
  root.removeAttribute('data-theme');

  // Sélection des chapitres : d'abord ceux qui coincent, sinon ceux commencés
  // mais pas maîtrisés, sinon les chapitres prioritaires.
  let sources = Store.weakChapters().map((w) => w.c).filter((c) => c && c.module);
  if (sources.length < 2) {
    const started = CHAPTERS.filter((c) => c.module && Store.mastery(c.id) < 100 && (Store.chapter(c.id).xp > 0 || Object.keys(Store.chapter(c.id).exercices).length > 0));
    sources = [...new Set([...sources, ...started])];
  }
  if (!sources.length) sources = CHAPTERS.filter((c) => c.module && c.priorite);
  sources = sources.slice(0, 4);

  root.innerHTML = `<p class="loading">Préparation de ta révision…</p>`;
  const pool = [];
  for (const c of sources) {
    try {
      const chap = await loadChapter(c);
      (chap.exercices || []).forEach((ex) => pool.push({ ex, meta: c }));
    } catch (e) { /* ignore */ }
  }
  // Priorise les chapitres à fort taux d'erreur, puis mélange l'ordre des exos.
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const session = pool.slice(0, Math.min(8, pool.length));

  if (!session.length) {
    root.innerHTML = `<button class="btn btn-ghost btn-back" data-back>← Accueil</button>
      <header class="dash-hero"><h1>🔁 Révision</h1><p class="muted">Commence quelques chapitres : ta révision personnalisée apparaîtra ici.</p></header>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    return;
  }

  const noms = [...new Set(session.map((s) => s.meta.titre))];
  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero">
      <h1>🔁 Révision du jour</h1>
      <p class="muted">${session.length} exercices ciblés sur ce qui coince : <strong>${noms.join('</strong>, <strong>')}</strong>.
        Chaque bonne réponse rapproche ces chapitres de la maîtrise.</p>
    </header>
    <section class="chapter-section"><div class="exos-host revise-host"></div></section>`;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));

  const host = root.querySelector('.revise-host');
  session.forEach(({ ex, meta }) => {
    const tag = document.createElement('div');
    tag.className = 'revise-tag';
    tag.innerHTML = `<span>${meta.icone} ${meta.titre}</span>`;
    host.appendChild(tag);
    mountExercise(host, ex, {
      onCorrect: (xp) => { Store.bumpDaily(); Store.addXP(xp, meta.id); },
      onAttempt: (exId, ok) => Store.recordAttempt(meta.id, exId, ok),
    });
  });
  renderMath(root);
}

// ---------------------------------------------------------------------
//  Restauration par lien profond (#/restore?d=…) — utilisé par le QR
// ---------------------------------------------------------------------

function renderRestore() {
  const root = app();
  root.removeAttribute('data-theme');
  const params = new URLSearchParams((location.hash.split('?')[1]) || '');
  const d = params.get('d');
  let summary = null, error = null;
  if (d) {
    try {
      const json = decodeURIComponent(escape(atob(d.replace(/-/g, '+').replace(/_/g, '/'))));
      summary = Store.importJSON(json);
    } catch (e) { error = e; }
  }
  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero"><h1>📥 Restauration de sauvegarde</h1></header>
    <section class="chapter-section">
      ${!d ? `<p class="notice">Aucune donnée à restaurer dans ce lien.</p>`
        : error ? `<p class="notice">❌ Ce lien de sauvegarde est invalide ou incomplet.</p>`
        : `<p class="save-msg is-ok">✅ Sauvegarde restaurée sur cet appareil !</p>
           <p>Tu repars avec <strong>${summary.xp} XP</strong> (niveau ${Store.level()}),
              <strong>${summary.chapters}</strong> chapitre(s) suivi(s)
              et <strong>${summary.badges}</strong> badge(s).</p>`}
      <div class="save-actions">
        <a class="btn btn-primary" href="#/">▶️ Continuer</a>
        <a class="btn btn-ghost" href="#/tableau">📊 Voir mon tableau de bord</a>
      </div>
    </section>`;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
  if (summary) { refreshTopbar(); }
}

// ---------------------------------------------------------------------
//  Diagnostic — auto-test des générateurs et QCM de tous les chapitres
// ---------------------------------------------------------------------

async function renderDiagnostic() {
  const root = app();
  root.removeAttribute('data-theme');
  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero"><h1>🩺 Diagnostic</h1>
      <p class="muted">Vérifie automatiquement que tous les exercices et quiz se génèrent et se corrigent sans erreur.</p></header>
    <section class="chapter-section">
      <button class="btn btn-primary" data-run>▶️ Lancer le diagnostic</button>
      <div class="diag-report" data-report></div>
    </section>`;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
  const report = root.querySelector('[data-report]');

  root.querySelector('[data-run]').addEventListener('click', async () => {
    report.innerHTML = '<p class="loading">Analyse en cours…</p>';
    const problems = [];
    let exGen = 0, quizGen = 0, qcm = 0, chaptersOk = 0;
    for (const meta of CHAPTERS.filter((c) => c.module)) {
      let chap;
      try { chap = await loadChapter(meta); }
      catch (e) { problems.push(`${meta.id} : import impossible (${e.message})`); continue; }
      chaptersOk++;
      const checkChoix = (st, where) => {
        if (!Array.isArray(st.choix)) return;
        qcm++;
        if (st.choix.length < 2) problems.push(`${where} : moins de 2 choix`);
        if (typeof st.correct !== 'number' || st.correct < 0 || st.correct >= st.choix.length) problems.push(`${where} : index correct hors borne`);
      };
      for (const ex of (chap.exercices || [])) {
        for (let t = 0; t < 25; t++) {
          try { const st = ex.generer ? ex.generer() : ex; if (ex.generer) exGen++; checkChoix(st, `${meta.id}/${ex.id}`); }
          catch (e) { problems.push(`${meta.id}/${ex.id} : générateur en échec (${e.message})`); break; }
        }
      }
      for (const q of (chap.quiz_bilan || [])) {
        for (let t = 0; t < 25; t++) {
          try { const st = q.generer ? q.generer() : q; if (q.generer) quizGen++; checkChoix(st, `${meta.id}/quiz`); }
          catch (e) { problems.push(`${meta.id}/quiz : générateur en échec (${e.message})`); break; }
        }
      }
    }
    const ok = problems.length === 0;
    report.innerHTML = `
      <div class="diag-summary ${ok ? 'diag-ok' : 'diag-ko'}">
        <span class="diag-ico">${ok ? '✅' : '⚠️'}</span>
        <div>
          <strong>${ok ? 'Tout fonctionne !' : problems.length + ' anomalie(s) détectée(s)'}</strong>
          <p class="muted">${chaptersOk} chapitres · ${exGen} tirages d'exercices · ${quizGen} tirages de quiz · ${qcm} QCM vérifiés</p>
        </div>
      </div>
      ${ok ? '' : `<ul class="diag-list">${problems.map((p) => `<li>❌ ${p}</li>`).join('')}</ul>`}`;
  });
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

// Service worker (hors-ligne + installation).
// Désactivé en local (localhost) pour ne pas servir de cache pendant le dev ;
// actif en production (GitHub Pages) pour le hors-ligne.
const _isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !_isLocal) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', location.href)).catch((e) => console.warn('[pwa] SW non enregistré', e));
  });
}
