// =====================================================================
//  app.js — Cœur de l'application
//  - Store localStorage : XP, badges, suivi par exercice, maîtrise,
//    streak, "à revoir", réglages (thème/police/niveau/affichage), historique XP
//  - Routeur SPA par hash (#/, #/chapitre/cXX, #/tableau…)
//  - Accueil par niveau (5ᵉ/4ᵉ/3ᵉ), page de chapitre (express/complète),
//    tableau de bord, compte élève (#/compte), espace tuteur (#/prof), réglages, PWA
//  Registre des chapitres : programme.js · statistiques : stats.js ·
//  comptes et synchro Google Sheets : cloud.js (+ fusion.js).
// =====================================================================

import { renderMath } from './render.js';
import { mountExercise, mountQuiz, checkAnswer } from './engine.js';
import { NIVEAUX, THEMES, CHAPTERS, chapterById, themeById, niveauById, chaptersOf } from './programme.js';
import { ymd, maitrise, libelleMaitrise, erreursChapitre, chapitresFragiles, erreursParTheme, progressionNiveau, progressionTheme, resumePourTuteur, exosReussis, serieActuelle, aCommence } from './stats.js';
import { creerSynchro, appeler, enLigneDisponible, Tuteur } from './cloud.js';
import { fusionner } from './fusion.js';

export { NIVEAUX, THEMES, CHAPTERS }; // ré-export (outils de diagnostic)

let Sync = null; // gestionnaire de synchronisation en ligne (créé au démarrage)

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
//  Store localStorage (progression de l'appareil)
//  Chaque enregistrement déclenche l'envoi en ligne si l'élève est connecté.
// ---------------------------------------------------------------------

const STORE_KEY = 'maths3eme_v1'; // on garde la clé : migration en place

const donneesVides = (settings) => ({
  version: 3, xp: 0, badges: {}, chapters: {}, last: null,
  streak: { count: 0, lastDay: null },
  settings: settings || {},
  history: [],      // [{ d:'YYYY-MM-DD', xp: <total cumulé ce jour> }]
  activite: {},     // { 'YYYY-MM-DD': exercices réussis ce jour }
  achievements: {}, daily: { d: null, count: 0 }, examPassed: false,
  updatedAt: 0, proprietaire: null,
});

const Store = {
  data: donneesVides(),

  load() {
    let lu = {};
    try { lu = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; }
    catch (e) { console.warn('[store] lecture impossible', e); }
    this.data = this.normaliser(lu);
    return this;
  },
  /** Complète une progression (ancienne version, import, fusion) avec les champs par défaut. */
  normaliser(d) {
    const out = Object.assign(donneesVides(), d || {});
    out.streak = out.streak || { count: 0, lastDay: null };
    // niveau : classe de l'élève (null tant qu'elle n'est pas choisie) ; niveauAt : date du choix ;
    // affichage : 'complet' (cours + méthode + tous les exercices) ou 'express'.
    out.settings = Object.assign({ theme: 'auto', font: 'normal', niveau: null, niveauAt: 0, affichage: 'complet' }, out.settings || {});
    delete out.settings.cloudCode; delete out.settings.cloudAuto; // ancienne sauvegarde kvdb
    out.history = out.history || [];
    out.activite = out.activite || {};
    out.achievements = out.achievements || {};
    out.daily = out.daily || { d: null, count: 0 };
    out.chapters = out.chapters || {};
    for (const id in out.chapters) { // entrées vides (créées par d'anciennes versions) : inutiles à synchroniser
      const c = out.chapters[id];
      if (!c || (!c.xp && !Object.keys(c.exercices || {}).length && !c.quizPassed && !c.quizScore && !c.review)) delete out.chapters[id];
    }
    out.badges = out.badges || {};
    return out;
  },
  /** Enregistre sur l'appareil SANS déclencher d'envoi en ligne. */
  saveLocal() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); }
    catch (e) { console.warn('[store] sauvegarde impossible', e); }
  },
  save() {
    this.data.updatedAt = Date.now();
    this.saveLocal();
    if (Sync) Sync.planifier(); // envoi en ligne (anti-rebond) si l'élève est connecté
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

  // — Exercices réussis : objectif du jour + journal d'activité (60 jours, pour le tuteur) —
  bumpDaily() {
    const today = ymd();
    if (!this.data.daily || this.data.daily.d !== today) this.data.daily = { d: today, count: 0 };
    this.data.daily.count++;
    const act = this.data.activite;
    act[today] = (act[today] || 0) + 1;
    const limite = ymd(new Date(Date.now() - 60 * 86400000));
    Object.keys(act).forEach((d) => { if (d < limite) delete act[d]; });
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
  setQuizScore(chId, score, total) { // garde le meilleur score
    const c = this.chapter(chId);
    if (!c.quizScore || score >= parseInt(c.quizScore, 10)) { c.quizScore = `${score}/${total}`; this.save(); }
  },
  setLast(chId) { this.data.last = chId; this.save(); },
  hasBadge(chId) { return !!this.data.badges[chId]; },

  toggleReview(chId) { const c = this.chapter(chId); c.review = !c.review; this.save(); return c.review; },
  isReview(chId) { return !!(this.data.chapters[chId] && this.data.chapters[chId].review); },

  /** Change la classe de l'élève (datée : la plus récente l'emporte entre appareils et tuteur). */
  setNiveau(niveau) { this.data.settings.niveau = niveau; this.data.settings.niveauAt = Date.now(); this.save(); },

  level() { return Math.floor(this.data.xp / 100) + 1; },
  levelProgress() { return this.data.xp % 100; },

  // Statistiques : calculées par stats.js sur la progression de l'appareil.
  niveau() { return this.data.settings.niveau || '3e'; },
  niveauProgress(niveau = this.niveau()) { return progressionNiveau(this.data, niveau); },
  themeProgress(themeId, niveau = this.niveau()) { return progressionTheme(this.data, themeId, niveau); },
  mastery(chId) { return maitrise(this.data, chId); },
  masteryLabel(pct) { return libelleMaitrise(pct); },
  chapterErrors(chId) { return erreursChapitre(this.data, chId); },
  weakChapters() { return chapitresFragiles(this.data); },
  errorsByTheme() { return erreursParTheme(this.data); },

  weeklyXP() {
    const cutoff = ymd(new Date(Date.now() - 6 * 86400000));
    const before = [...this.data.history].reverse().find((h) => h.d < cutoff);
    const base = before ? before.xp : 0;
    return Math.max(0, this.data.xp - base);
  },

  // Export horodaté et étiqueté (les métas _app/_savedAt aident à reconnaître
  // une sauvegarde valide ; elles sont inoffensives à la relecture).
  exportJSON() { return JSON.stringify(Object.assign({ _app: 'maths-college', _savedAt: new Date().toISOString() }, this.data)); },
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !('xp' in obj)) throw new Error('Sauvegarde invalide');
    delete obj._app; delete obj._savedAt; // métadonnées d'export, pas des données de jeu
    const compte = Sync && Sync.compte();
    // Connecté : on fusionne avec la progression actuelle (rien n'est perdu) ; sinon on remplace.
    const nouveau = compte ? fusionner(this.data, this.normaliser(obj)) : this.normaliser(obj);
    if (compte) nouveau.proprietaire = compte.pseudo;
    this.data = this.normaliser(nouveau);
    this.save();
    refreshTopbar();
    return { xp: this.data.xp, chapters: Object.keys(this.data.chapters).length, badges: Object.keys(this.data.badges).length };
  },
  /** Efface la progression de l'appareil (garde thème/police sauf `tout`). */
  reset({ tout = false } = {}) {
    const s = this.data.settings;
    this.data = this.normaliser(donneesVides(tout ? { theme: s.theme, font: s.font } : s));
    this.saveLocal();
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
  { id: 'theme',   icone: '📗', label: 'Un thème complété',  cond: () => NIVEAUX.some((n) => THEMES.some((t) => { const p = Store.themeProgress(t.id, n.id); return p.total > 0 && p.done === p.total; })) },
  { id: 'half',    icone: '🏆', label: 'Mi-chemin dans ton niveau', cond: () => { const p = Store.niveauProgress(); return p.total > 0 && p.done * 2 >= p.total; } },
  { id: 'all',     icone: '👑', label: 'Niveau terminé !',   cond: () => { const p = Store.niveauProgress(); return p.total > 0 && p.done === p.total; } },
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
        <fieldset class="setting-group setting-inline">
          <legend>Ma classe</legend>
          ${NIVEAUX.map((n) => `<label><input type="radio" name="niveau" value="${n.id}"> ${n.label}</label>`).join('')}
        </fieldset>
        <fieldset class="setting-group">
          <legend>Chapitres</legend>
          <label><input type="radio" name="affichage" value="complet"> 📚 Version complète</label>
          <label><input type="radio" name="affichage" value="express"> ⚡ Version express (l'essentiel)</label>
        </fieldset>
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
        <div class="modal-links">
          <a class="btn btn-ghost" href="#/compte" data-close>👤 Mon compte</a>
          <a class="btn btn-ghost" href="#/tableau" data-close>📊 Tableau de bord</a>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', closeSettings);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings(); });
    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeSettings));
    // Toujours relire Store.data.settings : la progression peut être remplacée (connexion, fusion).
    const regler = (cle, val) => { Store.data.settings[cle] = val; Store.save(); };
    modal.querySelectorAll('input[name="theme"]').forEach((r) => r.addEventListener('change', () => { regler('theme', r.value); applySettings(); }));
    modal.querySelectorAll('input[name="font"]').forEach((r) => r.addEventListener('change', () => { regler('font', r.value); applySettings(); }));
    // Niveau / affichage : on redessine la page courante (accueil ou chapitre).
    modal.querySelectorAll('input[name="niveau"]').forEach((r) => r.addEventListener('change', () => { Store.setNiveau(r.value); router(); }));
    modal.querySelectorAll('input[name="affichage"]').forEach((r) => r.addEventListener('change', () => { regler('affichage', r.value); router(); }));
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
  modal.querySelectorAll('input[name="niveau"]').forEach((r) => { r.checked = r.value === s.niveau; });
  modal.querySelector(`input[name="affichage"][value="${s.affichage}"]`).checked = true;
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
  refreshCompteBtn();
}

// Bouton 👤 : pastille de couleur selon l'état de la sauvegarde en ligne.
const STATUTS_SYNCHRO = {
  deconnecte: { txt: 'Pas connecté : progression sur cet appareil seulement', cls: '' },
  synchro: { txt: 'Synchronisation…', cls: 'is-sync' },
  ok: { txt: 'Progression sauvegardée en ligne', cls: 'is-ok' },
  'en-attente': { txt: 'Envoi en ligne dans quelques secondes', cls: 'is-sync' },
  'hors-ligne': { txt: 'Hors ligne : envoi dès le retour d\'Internet', cls: 'is-warn' },
  erreur: { txt: 'Sauvegarde en ligne impossible pour l\'instant', cls: 'is-err' },
  reconnexion: { txt: 'Reconnecte-toi (ton code a changé ?)', cls: 'is-err' },
};
function refreshCompteBtn() {
  const btn = document.getElementById('btnCompte');
  if (!btn) return;
  // Avec la sauvegarde en ligne : 👤 remplace 📊 (le tableau de bord reste sur l'accueil).
  btn.hidden = !enLigneDisponible();
  const tab = document.getElementById('btnTableau');
  if (tab) tab.hidden = enLigneDisponible();
  const st = STATUTS_SYNCHRO[Sync ? Sync.statut : 'deconnecte'] || STATUTS_SYNCHRO.deconnecte;
  const compte = Sync && Sync.compte();
  btn.className = `top-btn compte-btn ${st.cls}`;
  btn.title = compte ? `${compte.pseudo} — ${st.txt}` : 'Se connecter';
  btn.setAttribute('aria-label', btn.title);
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
//  Routeur SPA (hash)
// ---------------------------------------------------------------------

const app = () => document.getElementById('app');

/** Échappe le texte venant de l'extérieur (pseudos, résumés du tableur…). */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function router() {
  const hash = location.hash || '#/';
  window.scrollTo(0, 0);
  if (examTimer) { clearInterval(examTimer); examTimer = null; } // stop chrono si on quitte l'examen
  const m = hash.match(/^#\/chapitre\/([a-z]+\d+)/);
  const rev = hash.match(/^#\/revision\/([a-z]+\d+)/);
  const eleve = hash.match(/^#\/prof\/eleve\/([^/?#]+)/);
  if (m) renderChapter(m[1]);
  else if (rev) renderRevision(rev[1]);
  else if (eleve) renderProfEleve(decodeURIComponent(eleve[1]));
  else if (hash.startsWith('#/prof')) renderProf();
  else if (hash.startsWith('#/compte')) renderCompte();
  else if (hash.startsWith('#/tableau')) renderDashboard();
  else if (hash.startsWith('#/formulaire')) renderFormulaire();
  else if (hash.startsWith('#/examen')) renderExamen();
  else if (hash.startsWith('#/brevet')) renderBrevet();
  else if (hash.startsWith('#/revise')) renderRevise();
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
  const s = Store.data.settings;
  const m = (location.hash || '').match(/^#\/niveau\/(5e|4e|3e)/);
  if (!s.niveau && !m) { renderChoixNiveau(root); return; }

  const niv = m ? m[1] : s.niveau;
  const nivInfo = niveauById(niv);
  const g = Store.niveauProgress(niv);
  const all = chaptersOf(niv);
  const enPrepa = all.filter((c) => !c.module).length;
  const last = Store.data.last ? chapterById(Store.data.last) : null;
  const streak = Store.data.streak.count;
  const review = CHAPTERS.filter((c) => Store.isReview(c.id));
  const idx = NIVEAUX.findIndex((n) => n.id === niv);
  const prev = idx > 0 ? NIVEAUX[idx - 1] : null;

  const tabs = NIVEAUX.map((n) => `
    <a class="niv-tab ${n.id === niv ? 'active' : ''}" href="#/niveau/${n.id}" ${n.id === niv ? 'aria-current="page"' : ''}>
      ${n.label}${n.id === s.niveau ? '<span class="niv-moi" title="Ma classe">ma classe</span>' : ''}
    </a>`).join('');

  const themesHtml = THEMES.map((t) => {
    const list = chaptersOf(niv, t.id);
    if (!list.length) return '';
    const tp = Store.themeProgress(t.id, niv);
    return `
      <section class="theme-block" data-theme="${t.id}">
        <div class="theme-head">
          <h2><span class="theme-ico">${t.icone}</span> ${t.label}</h2>
          ${tp.total ? `<div class="theme-prog">
            <span class="mini-bar"><span style="width:${tp.pct}%"></span></span>
            <span class="mini-prog-txt">${tp.done}/${tp.total}</span>
          </div>` : ''}
        </div>
        <div class="chapter-grid">${list.map((c) => chapterCard(c, niv)).join('')}</div>
      </section>`;
  }).join('');

  root.innerHTML = `
    <nav class="niv-tabs" aria-label="Choisir le niveau">${tabs}</nav>

    <section class="hero">
      <h1>Maths ${nivInfo.label}${niv === s.niveau ? ' 🚀' : ''}</h1>
      <p class="hero-sub">${g.total} chapitre${g.total > 1 ? 's' : ''} disponible${g.total > 1 ? 's' : ''}${enPrepa ? ` · ${enPrepa} en préparation` : ''}.
        Tout est accessible : avance à ton rythme.</p>
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
      ${enLigneDisponible() && !Sync.compte() ? `<p class="login-nudge">☁️ <a href="#/compte">Connecte-toi avec ton pseudo</a> pour sauvegarder ta progression en ligne.</p>` : ''}
      ${last ? `<button class="btn btn-primary btn-resume" data-resume="${last.id}">▶️ Reprendre : ${last.icone} ${last.titre}${last.niveau !== niv ? ` (${niveauById(last.niveau).label})` : ''}</button>` : ''}
      <div class="tool-grid">
        <a class="tool" href="#/revise"><span class="tool-ico">🔁</span>Révision du jour</a>
        <a class="tool" href="#/examen"><span class="tool-ico">📝</span>Examen blanc</a>
        <a class="tool" href="#/brevet"><span class="tool-ico">📄</span>Brevet blanc</a>
        <a class="tool" href="#/formulaire"><span class="tool-ico">📖</span>Aide-mémoire</a>
        <a class="tool" href="#/tableau"><span class="tool-ico">📊</span>Tableau de bord</a>
        <a class="tool" href="#/fiche"><span class="tool-ico">🖨️</span>Fiches (tuteur)</a>
      </div>
    </section>

    ${review.length ? `
    <section class="review-section">
      <h2>🔖 À revoir</h2>
      <div class="chapter-grid">${review.map((c) => chapterCard(c, niv)).join('')}</div>
    </section>` : ''}

    <div class="all-chapters">
      <h2 class="section-title">Le programme de ${nivInfo.label}, par thème</h2>
      ${prev ? `<p class="muted niv-hint">Des bases à revoir ? Tout le programme de ${prev.label} est dans l'onglet <a href="#/niveau/${prev.id}">${prev.label}</a>.</p>` : ''}
      ${themesHtml}
    </div>
  `;

  root.querySelectorAll('[data-goto]').forEach((el) =>
    el.addEventListener('click', () => navigate(`#/chapitre/${el.dataset.goto}`)));
  const resume = root.querySelector('[data-resume]');
  if (resume) resume.addEventListener('click', () => navigate(`#/chapitre/${resume.dataset.resume}`));
  refreshTopbar();
}

/** Premier lancement : l'élève indique sa classe (modifiable dans ⚙️ Réglages). */
function renderChoixNiveau(root) {
  const enLigne = enLigneDisponible();
  root.innerHTML = `
    <section class="hero welcome">
      <h1>Bienvenue sur Maths Collège 👋</h1>
      <p class="hero-sub">Cours, méthodes et exercices corrigés de la 5ᵉ à la 3ᵉ.</p>
      ${enLigne ? `
      <div class="welcome-login">
        <h2>🔑 J'ai un pseudo et un code</h2>
        <p class="muted">Ta progression sera sauvegardée automatiquement et tu la retrouveras sur tous tes appareils.</p>
        <div data-login></div>
      </div>
      <h2 class="welcome-sep">…ou continuer sans compte</h2>` : ''}
      <p class="muted">Indique ta classe : ton programme s'affichera en premier. Tu pourras consulter
        les autres niveaux, et changer dans ⚙️ Réglages.${enLigne ? ' Sans compte, la progression reste sur cet appareil.' : ''}</p>
      <div class="niv-choice">
        ${NIVEAUX.map((n) => `<button class="btn ${enLigne ? 'btn-ghost' : 'btn-primary'}" data-niveau="${n.id}">Je suis en ${n.label}</button>`).join('')}
      </div>
    </section>`;
  if (enLigne) formulaireConnexion(root.querySelector('[data-login]'), { apres: () => router() });
  root.querySelectorAll('[data-niveau]').forEach((b) => b.addEventListener('click', () => {
    Store.setNiveau(b.dataset.niveau);
    if (location.hash === '' || location.hash === '#/') renderHome(); else navigate('#/');
  }));
  refreshTopbar();
}

/** Formulaire pseudo + code à 4 chiffres (accueil et page « Mon compte »). */
function formulaireConnexion(host, { apres } = {}) {
  host.innerHTML = `
    <form class="login-form" novalidate>
      <label>Pseudo <input type="text" name="pseudo" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="20" required></label>
      <label>Code (4 chiffres) <input type="password" name="code" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" maxlength="4" required></label>
      <button class="btn btn-primary" type="submit">Se connecter</button>
      <p class="save-msg" data-msg aria-live="polite"></p>
    </form>`;
  const form = host.querySelector('form');
  const msg = host.querySelector('[data-msg]');
  const dire = (t, ok) => { msg.textContent = t; msg.className = 'save-msg ' + (ok ? 'is-ok' : 'is-err'); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pseudo = form.pseudo.value.trim(), code = form.code.value.trim();
    if (!pseudo || !/^\d{4}$/.test(code)) { dire('Entre ton pseudo et ton code à 4 chiffres.', false); return; }
    const btn = form.querySelector('button');
    btn.disabled = true; dire('Connexion…', true);
    try {
      const eleve = await Sync.connecter(pseudo, code);
      dire(`Bienvenue ${eleve.pseudo} ! Progression récupérée ✓`, true);
      refreshTopbar();
      setTimeout(() => apres && apres(), 500);
    } catch (err) {
      dire(err.message || 'Connexion impossible.', false);
      btn.disabled = false;
    }
  });
}

function chapterCard(c, vueNiveau) {
  const badge = Store.hasBadge(c.id);
  const started = aCommence(Store.data, c.id); // lecture seule : ne crée pas d'entrée vide
  const available = !!c.module;
  const m = Store.mastery(c.id);
  const niv = niveauById(c.niveau);
  return `
    <button class="chapter-card ${available ? '' : 'is-soon'}"
            data-theme="${c.theme}" data-goto="${c.id}"
            aria-label="${niv.label}, chapitre ${c.num} : ${c.titre}">
      <div class="cc-top">
        <span class="cc-ico">${c.icone}</span>
        <span class="cc-tags">
          ${c.niveau !== vueNiveau ? `<span class="cc-niv" title="${niv.long}">${niv.label}</span>` : ''}
          ${Store.isReview(c.id) ? '<span class="cc-review" title="À revoir">🔖</span>' : ''}
          ${badge ? '<span class="cc-medal" title="Chapitre validé">🏅</span>' : ''}
        </span>
      </div>
      <div class="cc-num">Chapitre ${c.num}</div>
      <div class="cc-title">${c.titre}</div>
      ${started && available ? `<div class="cc-mastery"><span style="width:${m}%"></span></div>` : ''}
      <div class="cc-status">
        ${available ? (badge ? 'Validé ✓' : (started ? Store.masteryLabel(m) : 'Commencer')) : 'En préparation'}
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
  const niv = niveauById(meta.niveau);

  if (!meta.module) {
    root.innerHTML = `
      <button class="btn btn-ghost btn-back" data-back>← Programme de ${niv.label}</button>
      <div class="chapter-soon"><span class="soon-ico">${meta.icone}</span>
        <div class="ch-eyebrow">${niv.label} · Chapitre ${meta.num} · ${themeById(meta.theme).label}</div>
        <h1>${meta.titre}</h1>
        <p>Ce chapitre est en préparation : il arrive bientôt, en version express et en version complète.</p>
        <a class="btn btn-primary" href="#/niveau/${meta.niveau}">Voir les chapitres disponibles →</a></div>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate(`#/niveau/${meta.niveau}`));
    return;
  }

  let chap;
  try { chap = await loadChapter(meta); }
  catch (e) { console.error(e); root.innerHTML = `<p class="notice">Erreur de chargement. <a href="#/">Retour</a></p>`; return; }

  Store.setLast(id);
  buildChapterPage(root, meta, chap);
}

/**
 * Contenu de la version « express » d'un chapitre (l'essentiel, pour réviser vite).
 * Un chapitre peut la définir : `express: { cours: [index des blocs], exercices: ['e01', …] }`.
 * Sinon, par défaut : définitions et propriétés du cours (sans exemples ni figures)
 * et un exercice par niveau de difficulté.
 */
function expressContent(chap) {
  const def = chap.express || {};
  const allCours = chap.cours || [], allEx = chap.exercices || [];
  const cours = Array.isArray(def.cours)
    ? def.cours.map((i) => allCours[i]).filter(Boolean)
    : allCours.filter((b) => !b.type || b.type === 'definition' || b.type === 'propriete');
  const exercices = Array.isArray(def.exercices)
    ? allEx.filter((e) => def.exercices.includes(e.id))
    : [1, 2, 3].map((n) => allEx.find((e) => e.niveau === n && e.type !== 'ordonner_etapes') || allEx.find((e) => e.niveau === n)).filter(Boolean);
  return { cours, exercices };
}

function buildChapterPage(root, meta, chap) {
  const express = Store.data.settings.affichage === 'express';
  const niv = niveauById(meta.niveau);
  const theme = themeById(meta.theme);
  const exp = express ? expressContent(chap) : null;

  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Programme de ${niv.label}</button>

    <header class="chapter-hero">
      <span class="ch-ico">${chap.icone || meta.icone}</span>
      <div>
        <div class="ch-eyebrow">${niv.label} · Chapitre ${meta.num} · ${theme.label}</div>
        <h1>${meta.titre}</h1>
      </div>
      <div class="ch-actions">
        <a class="btn btn-ghost" href="#/revision/${meta.id}">🖨️ Fiche de révision</a>
        <button class="btn btn-ghost ch-review" data-review aria-pressed="${Store.isReview(meta.id)}">${Store.isReview(meta.id) ? '🔖 À revoir' : '🔖 Marquer à revoir'}</button>
        ${Store.hasBadge(meta.id) ? '<span class="ch-badge">🏅 Validé</span>' : ''}
      </div>
    </header>

    <div class="mode-switch" role="group" aria-label="Version du chapitre">
      <button class="mode-btn ${express ? 'active' : ''}" data-mode="express" aria-pressed="${express}">⚡ Express <small>l'essentiel</small></button>
      <button class="mode-btn ${express ? '' : 'active'}" data-mode="complet" aria-pressed="${!express}">📚 Complète <small>tout le chapitre</small></button>
    </div>

    <nav class="chapter-toc">
      ${express ? '' : '<a href="#sec-intro">À quoi ça sert</a>'}
      <a href="#sec-cours">Cours</a>
      <a href="#sec-methode">Méthode</a>
      <a href="#sec-exos">Exercices</a>
      <a href="#sec-quiz">Quiz bilan</a>
    </nav>

    ${express ? '' : `<section id="sec-intro" class="chapter-section intro-card"><h2>💡 À quoi ça sert ?</h2><p>${chap.intro || ''}</p></section>`}
    <section id="sec-cours" class="chapter-section"><h2>📚 ${express ? "L'essentiel du cours" : 'Cours essentiel'}</h2><div class="cours-list"></div></section>
    <section id="sec-methode" class="chapter-section">
      <h2>🧭 ${express ? 'La méthode en bref' : 'Méthode pas-à-pas'}</h2>
      ${express ? '<ol class="methode-bref"></ol>' : '<p class="muted">Clique pour révéler les étapes une à une.</p><ol class="methode-list"></ol>'}
    </section>
    <section id="sec-exos" class="chapter-section">
      <h2>✏️ ${express ? 'Exercices clés' : 'Exercices interactifs'}</h2>
      ${express ? '<p class="muted">Un exercice par niveau de difficulté. Pour t\'entraîner davantage, passe en version complète.</p>' : '<div class="level-tabs"></div>'}
      <div class="exos-host"></div>
    </section>
    <section id="sec-quiz" class="chapter-section quiz-section"><h2>🏁 Quiz bilan</h2><p class="muted">5 questions pour valider le chapitre et décrocher ton badge (80 % requis).</p><div class="quiz-host"></div></section>
  `;
  root.querySelector('[data-back]').addEventListener('click', () => navigate(`#/niveau/${meta.niveau}`));
  const reviewBtn = root.querySelector('[data-review]');
  reviewBtn.addEventListener('click', () => {
    const on = Store.toggleReview(meta.id);
    reviewBtn.textContent = on ? '🔖 À revoir' : '🔖 Marquer à revoir';
    reviewBtn.setAttribute('aria-pressed', on);
  });
  root.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    if (Store.data.settings.affichage === b.dataset.mode) return;
    Store.data.settings.affichage = b.dataset.mode; Store.save();
    buildChapterPage(root, meta, chap);
  }));

  const coursHost = root.querySelector('.cours-list');
  (express ? exp.cours : (chap.cours || [])).forEach((bloc) => coursHost.appendChild(renderCoursBloc(bloc)));

  if (express) {
    const bref = root.querySelector('.methode-bref');
    bref.innerHTML = (chap.methode || []).map((e) => `<li><strong>${e.titre}</strong></li>`).join('');
  } else {
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
  }

  const exoHost = root.querySelector('.exos-host');
  let curLevel = 1;
  let sessionStreak = 0;   // bonnes réponses d'affilée au niveau courant
  const nudged = {};       // évite de re-proposer le même palier
  let showLevel = null;    // défini en version complète (onglets de niveaux)

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
  const hooks = (adaptive) => ({
    onCorrect: (xp) => { Store.bumpDaily(); Store.addXP(xp, meta.id); if (adaptive) onLevelCorrect(); },
    onAttempt: (exId, ok) => { Store.recordAttempt(meta.id, exId, ok); if (!ok) sessionStreak = 0; },
  });

  if (express) {
    exp.exercices.forEach((ex) => mountExercise(exoHost, ex, hooks(false)));
  } else {
    const tabs = root.querySelector('.level-tabs');
    const niveaux = [{ n: 1, label: 'Découverte' }, { n: 2, label: 'Application' }, { n: 3, label: 'Défi' }];
    showLevel = (n) => {
      curLevel = n; sessionStreak = 0;
      exoHost.innerHTML = '';
      tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', parseInt(b.dataset.lvl, 10) === n));
      const exos = (chap.exercices || []).filter((e) => e.niveau === n);
      if (!exos.length) { exoHost.innerHTML = '<p class="muted">Aucun exercice à ce niveau.</p>'; return; }
      exos.forEach((ex) => mountExercise(exoHost, ex, hooks(true)));
    };
    niveaux.forEach((lv) => {
      const count = (chap.exercices || []).filter((e) => e.niveau === lv.n).length;
      const b = document.createElement('button');
      b.className = 'level-tab lvl-' + lv.n; b.dataset.lvl = lv.n;
      b.innerHTML = `<strong>Niveau ${lv.n}</strong><span>${lv.label} · ${count}</span>`;
      b.addEventListener('click', () => showLevel(lv.n));
      tabs.appendChild(b);
    });
    showLevel(1);
  }

  const quizHost = root.querySelector('.quiz-host');
  if (chap.quiz_bilan && chap.quiz_bilan.length) {
    let lastScore = [0, chap.quiz_bilan.length];
    mountQuiz(quizHost, chap.quiz_bilan, {
      onComplete: (s, t) => { lastScore = [s, t]; Store.setQuizScore(meta.id, s, t); },
      onPass: (xp, info) => {
        if (!info.premiere) return; // déjà validé : score mis à jour par onComplete, pas d'XP
        Store.addXP(xp, meta.id); Store.passQuiz(meta.id, lastScore[0], lastScore[1]); celebrate(meta);
      },
    }, { dejaValide: Store.hasBadge(meta.id) });
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
  const g = Store.niveauProgress();
  const weak = Store.weakChapters();
  const errBy = Store.errorsByTheme();

  // Maîtrise : niveau de l'élève + tout autre niveau déjà travaillé.
  const started = (c) => { const cp = Store.data.chapters[c.id]; return cp && (cp.xp > 0 || Object.keys(cp.exercices || {}).length > 0); };
  const niveauxVus = NIVEAUX.filter((n) => n.id === Store.niveau() || chaptersOf(n.id).some(started));
  const themeBars = niveauxVus.map((n) => `<h3 class="dash-niveau">${n.label}</h3>` + THEMES.map((t) => {
    const list = chaptersOf(n.id, t.id).filter((c) => c.module);
    if (!list.length) return '';
    const tp = Store.themeProgress(t.id, n.id);
    const chaps = list.map((c) => {
      const m = Store.mastery(c.id);
      return `<div class="dash-chap" data-goto="${c.id}">
        <span class="dash-chap-name">${c.icone} ${c.titre}</span>
        <span class="dash-chap-bar" data-theme="${c.theme}"><span style="width:${m}%"></span></span>
        <span class="dash-chap-pct">${m}%</span></div>`;
    }).join('');
    return `<div class="dash-theme" data-theme="${t.id}">
      <h3>${t.icone} ${t.label} <span class="muted">(${tp.done}/${tp.total})</span></h3>${chaps}</div>`;
  }).join('')).join('');

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
      ${enLigneDisponible() ? (Sync.compte()
        ? `<p>☁️ Connecté·e en tant que <strong>${esc(Sync.compte().pseudo)}</strong> : ta progression est sauvegardée automatiquement en ligne.
            <a href="#/compte">Mon compte →</a></p>`
        : `<p class="muted">Ta progression est enregistrée sur cet appareil seulement. <a href="#/compte">Connecte-toi avec ton pseudo et ton code</a>
            pour la sauvegarder en ligne et la retrouver partout.</p>`)
        : '<p class="muted">Ta progression est enregistrée sur cet appareil.</p>'}
      <details class="save-advanced">
        <summary>Sauvegarde de secours (fichier)</summary>
        <div class="save-actions">
          <button class="btn btn-ghost" data-act="download">⬇️ Télécharger ma progression</button>
          <label class="btn btn-ghost">⬆️ Importer un fichier<input type="file" accept="application/json" hidden data-act="file"></label>
        </div>
        ${Sync && Sync.compte() ? '' : '<div class="save-actions"><button class="btn btn-danger" data-act="reset">🗑️ Réinitialiser ma progression</button></div>'}
      </details>
      <p class="save-msg" data-msg aria-live="polite"></p>
    </section>

    <p class="dash-footlink">${enLigneDisponible() ? '<a href="#/prof">👩‍🏫 Espace tuteur</a> · ' : ''}<a href="#/diagnostic">🩺 Diagnostic de l'application</a></p>
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

  // Sauvegarde de secours (fichier)
  const msg = root.querySelector('[data-msg]');
  const say = (t, ok = true) => { msg.textContent = t; msg.className = 'save-msg ' + (ok ? 'is-ok' : 'is-err'); };
  root.querySelector('[data-act="download"]').addEventListener('click', () => {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `maths-college-sauvegarde-${ymd()}.json`; a.click(); URL.revokeObjectURL(a.href);
    say('Fichier téléchargé. ✓');
  });
  root.querySelector('[data-act="file"]').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { const s = Store.importJSON(r.result); say(`Sauvegarde importée ! ${s.xp} XP · ${s.chapters} chapitre(s) · ${s.badges} badge(s). ✓`); setTimeout(() => renderDashboard(), 600); }
      catch (err) { say('Fichier invalide.', false); }
    };
    r.readAsText(f);
  });
  const resetBtn = root.querySelector('[data-act="reset"]');
  if (resetBtn) resetBtn.addEventListener('click', () => {
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
      <h1>${chap.icone || meta.icone} ${meta.titre} — Fiche de révision</h1>
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
  const opts = NIVEAUX.map((n) => {
    const list = chaptersOf(n.id).filter((c) => c.module);
    return list.length ? `<optgroup label="${n.long}">${list.map((c) => `<option value="${c.id}">${n.label} · ${c.num}. ${c.titre}</option>`).join('')}</optgroup>` : '';
  }).join('');
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
      <h1>${meta.titre} (${niveauById(meta.niveau).label}) — Niveau ${lvl}</h1>
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
  const niv = niveauById(params.get('niveau')) ? params.get('niveau') : Store.niveau();
  const dispo = (c) => c.module && c.niveau === niv;

  if (!scope) {
    const themes = THEMES.filter((t) => chaptersOf(niv, t.id).some((c) => c.module));
    root.innerHTML = `
      <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
      <header class="dash-hero"><h1>📝 Examen blanc</h1>
        <p class="muted">Une série de questions tirées au hasard pour t'entraîner comme le jour J. Choisis un thème ou tout le programme.</p></header>
      <nav class="niv-tabs" aria-label="Niveau">${NIVEAUX.map((n) => `<a class="niv-tab ${n.id === niv ? 'active' : ''}" href="#/examen?niveau=${n.id}">${n.label}</a>`).join('')}</nav>
      <section class="chapter-section">
        ${themes.length ? `<div class="exam-choices">
          <button class="btn btn-primary" data-scope="all">🎓 Tout le programme de ${niveauById(niv).label}</button>
          ${Store.weakChapters().length ? '<button class="btn btn-primary btn-review" data-scope="review">🎯 Réviser mes erreurs</button>' : ''}
          ${themes.map((t) => `<button class="btn btn-ghost" data-scope="${t.id}">${t.icone} ${t.label}</button>`).join('')}
        </div>` : `<p class="muted">Les chapitres de ${niveauById(niv).label} sont en préparation : l'examen blanc arrivera avec eux.</p>`}
      </section>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    root.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => navigate(`#/examen?niveau=${niv}&scope=${b.dataset.scope}`)));
    return;
  }

  root.innerHTML = `<p class="loading">Préparation de l'examen…</p>`;

  // Sélection des chapitres : par thème, tout le programme, ou « réviser mes erreurs ».
  let list, reviewNote = '';
  if (scope === 'review') {
    const weak = Store.weakChapters().map((w) => w.c).filter((c) => c.module);
    list = weak.length ? weak : CHAPTERS.filter(dispo);
    reviewNote = weak.length ? '🎯 Révision ciblée sur tes chapitres à retravailler.' : '';
  } else {
    list = CHAPTERS.filter((c) => dispo(c) && (scope === 'all' || c.theme === scope));
  }
  const questions = [];
  for (const c of list) {
    try { const mod = await loadChapter(c); (mod.quiz_bilan || []).forEach((q) => questions.push(q)); } catch (e) { /* ignore */ }
  }
  // En mode révision, complète avec d'autres chapitres si le vivier est trop maigre.
  if (scope === 'review' && questions.length < 8) {
    for (const c of CHAPTERS.filter((c) => dispo(c) && !list.includes(c))) {
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
    const started = CHAPTERS.filter((c) => c.module && Store.mastery(c.id) < 100 && aCommence(Store.data, c.id));
    sources = [...new Set([...sources, ...started])];
  }
  if (!sources.length) sources = chaptersOf(Store.niveau()).filter((c) => c.module);
  if (!sources.length) sources = CHAPTERS.filter((c) => c.module); // niveau encore en préparation
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
//  Mon compte (élève) : connexion, état de la sauvegarde, déconnexion
// ---------------------------------------------------------------------

/** « il y a 5 min », « il y a 3 j »… */
function ilYa(ms) {
  if (!ms) return 'jamais';
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'à l\'instant';
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  return `il y a ${Math.round(s / 86400)} j`;
}

function renderCompte() {
  const root = app();
  root.removeAttribute('data-theme');
  const back = '<button class="btn btn-ghost btn-back" data-back>← Accueil</button>';
  if (!enLigneDisponible()) {
    root.innerHTML = `${back}<header class="dash-hero"><h1>👤 Mon compte</h1></header>
      <section class="chapter-section"><p class="muted">La sauvegarde en ligne n'est pas encore activée sur ce site :
      ta progression reste sur cet appareil.</p></section>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    return;
  }
  const compte = Sync.compte();
  const st = STATUTS_SYNCHRO[Sync.statut] || STATUTS_SYNCHRO.deconnecte;
  const niv = niveauById(Store.data.settings.niveau);

  root.innerHTML = `${back}
    <header class="dash-hero"><h1>👤 Mon compte</h1></header>
    ${compte ? `
    <section class="chapter-section">
      <div class="compte-card">
        <span class="compte-avatar">🧑‍🎓</span>
        <div>
          <h2 style="margin:0">${esc(compte.pseudo)}</h2>
          <p class="muted" style="margin:0">${niv ? `Classe : ${niv.label} · ` : ''}${Store.data.xp} XP</p>
        </div>
      </div>
      <p class="compte-statut"><span class="statut-point ${st.cls}"></span> ${st.txt}</p>
      <p class="muted">Dernière synchronisation : ${ilYa(compte.derniereSynchro)}. Sur un autre appareil, connecte-toi
        avec le même pseudo et le même code : tu retrouveras tout.</p>
      ${Sync.statut === 'reconnexion' ? '<div class="welcome-login"><h2>🔑 Reconnecte-toi</h2><div data-login></div></div>' : ''}
      <div class="save-actions">
        <button class="btn btn-primary" data-act="sync">🔄 Synchroniser maintenant</button>
        <button class="btn btn-ghost" data-act="logout">🚪 Se déconnecter</button>
      </div>
      <p class="save-msg" data-msg aria-live="polite"></p>
    </section>` : `
    <section class="chapter-section">
      <h2>🔑 Se connecter</h2>
      <p class="muted">Avec le pseudo et le code à 4 chiffres donnés par ton professeur, ta progression est
        sauvegardée automatiquement et tu la retrouves sur tous tes appareils. Ce que tu as déjà fait sur cet
        appareil est conservé.</p>
      <div data-login></div>
    </section>`}`;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));

  const login = root.querySelector('[data-login]');
  if (login) {
    formulaireConnexion(login, { apres: () => navigate('#/') });
    if (compte) login.querySelector('[name="pseudo"]').value = compte.pseudo;
  }
  if (!compte) return;

  const msg = root.querySelector('[data-msg]');
  const dire = (t, ok = true) => { msg.textContent = t; msg.className = 'save-msg ' + (ok ? 'is-ok' : 'is-err'); };
  root.querySelector('[data-act="sync"]').addEventListener('click', async (e) => {
    e.target.disabled = true; dire('Synchronisation…');
    await Sync.tirer();
    renderCompte();
  });
  root.querySelector('[data-act="logout"]').addEventListener('click', async (e) => {
    e.target.disabled = true; dire('Envoi des derniers progrès…');
    let ok = await Sync.deconnecter();
    if (!ok) {
      if (!confirm('Tes derniers progrès n\'ont pas pu être envoyés (pas d\'Internet ?).\nTe déconnecter quand même ? Ces progrès seront perdus.')) { renderCompte(); return; }
      ok = await Sync.deconnecter({ forcer: true });
    }
    // Appareil éventuellement partagé : on efface la progression locale.
    Store.reset({ tout: true });
    applySettings(); refreshTopbar();
    navigate('#/');
  });
}

// ---------------------------------------------------------------------
//  Espace tuteur : élèves, codes, classes, progression détaillée
// ---------------------------------------------------------------------

const codeAuHasard = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, '0');

/** Appel tuteur : si la session a expiré, on revient au formulaire de mot de passe. */
async function appelTuteur(action, params = {}) {
  const t = Tuteur.lire();
  try { return await appeler(action, { jeton: t && t.jeton, ...params }); }
  catch (e) {
    if (e.code === 'JETON_TUTEUR' || e.code === 'CONFIG') { Tuteur.effacer(); }
    throw e;
  }
}

async function renderProf() {
  const root = app();
  root.removeAttribute('data-theme');
  const entete = (actions = '') => `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>
    <header class="dash-hero"><h1>👩‍🏫 Espace tuteur</h1>${actions}</header>`;
  const lierRetour = () => root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));

  if (!enLigneDisponible()) {
    root.innerHTML = `${entete()}<section class="chapter-section"><p class="muted">Renseigne d'abord l'adresse du
      script Google dans <code>js/config.js</code> (voir <code>backend/INSTALLATION.md</code>).</p></section>`;
    lierRetour();
    return;
  }

  // — Connexion tuteur —
  if (!Tuteur.lire()) {
    root.innerHTML = `${entete()}
      <section class="chapter-section">
        <p class="muted">Mot de passe choisi dans l'onglet « Config » de ton Google Sheet.</p>
        <form class="login-form" data-form>
          <label>Mot de passe <input type="password" name="mdp" autocomplete="current-password" required></label>
          <button class="btn btn-primary" type="submit">Entrer</button>
          <p class="save-msg" data-msg aria-live="polite"></p>
        </form>
      </section>`;
    lierRetour();
    const form = root.querySelector('[data-form]'), msg = root.querySelector('[data-msg]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.className = 'save-msg is-ok'; msg.textContent = 'Connexion…';
      try {
        const r = await appeler('tuteur_connexion', { motDePasse: form.mdp.value });
        Tuteur.ecrire({ jeton: r.jeton });
        renderProf();
      } catch (err) { msg.className = 'save-msg is-err'; msg.textContent = err.message; }
    });
    return;
  }

  root.innerHTML = `${entete()}<p class="loading">Chargement des élèves…</p>`;
  lierRetour();
  let liste;
  try { liste = await appelTuteur('tuteur_liste'); }
  catch (e) {
    if (!Tuteur.lire()) { renderProf(); return; }
    root.innerHTML = `${entete()}<p class="notice">${esc(e.message)} <button class="btn btn-ghost" data-retry>Réessayer</button></p>`;
    lierRetour();
    root.querySelector('[data-retry]').addEventListener('click', renderProf);
    return;
  }

  const optionsClasse = (sel) => NIVEAUX.map((n) => `<option value="${n.id}" ${n.id === sel ? 'selected' : ''}>${n.label}</option>`).join('');
  const eleves = [...liste.eleves].sort((a, b) => (b.synchro || 0) - (a.synchro || 0));
  const carte = (el) => {
    const vieux = !el.synchro || Date.now() - el.synchro > 7 * 86400000;
    return `
    <article class="eleve-card" data-pseudo="${esc(el.pseudo)}">
      <div class="eleve-head">
        <h3>🧑‍🎓 ${esc(el.pseudo)}</h3>
        <span class="muted">Dernière activité : <span class="${vieux ? 'age-ancien' : ''}">${ilYa(el.synchro)}</span></span>
      </div>
      <div class="eleve-stats">
        <span>Classe <select class="prof-select" data-classe aria-label="Classe de ${esc(el.pseudo)}"><option value="">—</option>${optionsClasse(el.niveau)}</select></span>
        <span><strong>${el.xp}</strong> XP</span>
        <span>Chapitres validés : <strong>${esc(el.valides || '—')}</strong></span>
        <span>Exos réussis (7 j) : <strong>${el.exos7j}</strong></span>
        <span>Série : <strong>${el.serie}</strong> j</span>
      </div>
      ${el.coince ? `<p style="margin:0.2rem 0">🎯 À retravailler : <strong>${esc(el.coince)}</strong></p>` : ''}
      ${el.dernier ? `<p class="muted" style="margin:0.2rem 0">Dernier chapitre ouvert : ${esc(el.dernier)}</p>` : ''}
      <div class="eleve-actions">
        <a class="btn btn-primary" href="#/prof/eleve/${encodeURIComponent(el.pseudo)}">📈 Détails</a>
        <button class="btn btn-ghost" data-voir-code>🔑 Voir le code</button>
        <button class="btn btn-ghost" data-nouveau-code>🎲 Nouveau code</button>
      </div>
      <p class="save-msg" data-msg aria-live="polite"></p>
    </article>`;
  };

  root.innerHTML = `${entete(`<p class="muted">${eleves.length} élève${eleves.length > 1 ? 's' : ''} ·
      <a href="${esc(liste.urlFeuille)}" target="_blank" rel="noopener">Ouvrir le Google Sheet ↗</a> ·
      <a href="#/prof" data-deco>Se déconnecter</a></p>`)}
    <section class="chapter-section">
      <h2>➕ Ajouter un élève</h2>
      <form class="prof-form" data-creer>
        <label>Pseudo <input name="pseudo" maxlength="20" autocapitalize="off" spellcheck="false" placeholder="ex. lea" required></label>
        <label>Code (4 chiffres)
          <span class="code-row"><input name="code" inputmode="numeric" maxlength="4" value="${codeAuHasard()}" required>
          <button class="btn btn-ghost" type="button" data-hasard title="Autre code au hasard">🎲</button></span></label>
        <label>Classe <select name="niveau">${optionsClasse('3e')}</select></label>
        <button class="btn btn-primary" type="submit">Créer le compte</button>
      </form>
      <p class="save-msg" data-msg-creer aria-live="polite"></p>
    </section>
    <section class="chapter-section">
      <h2>🧑‍🎓 Mes élèves</h2>
      ${eleves.length ? `<div class="eleve-list">${eleves.map(carte).join('')}</div>` : '<p class="muted">Aucun élève pour l\'instant : crée un premier compte ci-dessus.</p>'}
    </section>`;
  lierRetour();
  root.querySelector('[data-deco]').addEventListener('click', (e) => { e.preventDefault(); Tuteur.effacer(); renderProf(); });

  // — Création d'un compte —
  const form = root.querySelector('[data-creer]');
  const msgCreer = root.querySelector('[data-msg-creer]');
  root.querySelector('[data-hasard]').addEventListener('click', () => { form.code.value = codeAuHasard(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pseudo = form.pseudo.value.trim(), code = form.code.value.trim(), niveau = form.niveau.value;
    msgCreer.className = 'save-msg is-ok'; msgCreer.textContent = 'Création…';
    try {
      await appelTuteur('tuteur_creer', { pseudo, code, niveau });
      await renderProf();
      const m = app().querySelector('[data-msg-creer]');
      if (m) { m.className = 'save-msg is-ok'; m.innerHTML = `✓ Compte créé. Donne à ton élève : pseudo <strong>${esc(pseudo)}</strong>, code <span class="code-affiche">${esc(code)}</span>`; }
    } catch (err) {
      if (!Tuteur.lire()) { renderProf(); return; }
      msgCreer.className = 'save-msg is-err'; msgCreer.textContent = err.message;
    }
  });

  // — Actions par élève —
  root.querySelectorAll('.eleve-card').forEach((card) => {
    const pseudo = card.dataset.pseudo;
    const el = eleves.find((x) => x.pseudo === pseudo);
    const msg = card.querySelector('[data-msg]');
    const dire = (html, ok = true) => { msg.className = 'save-msg ' + (ok ? 'is-ok' : 'is-err'); msg.innerHTML = html; };
    card.querySelector('[data-voir-code]').addEventListener('click', () => dire(`Code actuel : <span class="code-affiche">${esc(el.code)}</span>`));
    card.querySelector('[data-nouveau-code]').addEventListener('click', async () => {
      if (!confirm(`Donner un nouveau code à ${pseudo} ? Ses appareils devront se reconnecter.`)) return;
      const code = codeAuHasard();
      try {
        await appelTuteur('tuteur_modifier', { pseudo, code });
        el.code = code;
        dire(`Nouveau code : <span class="code-affiche">${code}</span> — donne-le à ${esc(pseudo)}.`);
      } catch (err) { if (!Tuteur.lire()) renderProf(); else dire(esc(err.message), false); }
    });
    card.querySelector('[data-classe]').addEventListener('change', async (e) => {
      if (!e.target.value) return;
      try { await appelTuteur('tuteur_modifier', { pseudo, niveau: e.target.value }); dire('Classe mise à jour ✓'); }
      catch (err) { if (!Tuteur.lire()) renderProf(); else dire(esc(err.message), false); }
    });
  });
}

async function renderProfEleve(pseudo) {
  const root = app();
  root.removeAttribute('data-theme');
  if (!enLigneDisponible() || !Tuteur.lire()) { navigate('#/prof'); return; }
  root.innerHTML = '<p class="loading">Chargement de la progression…</p>';
  let rep;
  try { rep = await appelTuteur('tuteur_eleve', { pseudo }); }
  catch (e) {
    if (!Tuteur.lire()) { navigate('#/prof'); return; }
    root.innerHTML = `<button class="btn btn-ghost btn-back" data-back>← Élèves</button><p class="notice">${esc(e.message)}</p>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/prof'));
    return;
  }
  const data = Store.normaliser(rep.donnees || {});
  const niveau = rep.eleve.niveau || data.settings.niveau || '3e';
  const niv = niveauById(niveau);
  const p = progressionNiveau(data, niveau);
  const fragiles = chapitresFragiles(data);

  // Activité des 14 derniers jours
  const jours = Array.from({ length: 14 }, (_, i) => ymd(new Date(Date.now() - (13 - i) * 86400000)));
  const valeurs = jours.map((d) => data.activite[d] || 0);
  const max = Math.max(1, ...valeurs);

  // Maîtrise : classe de l'élève + autres niveaux travaillés
  const niveauxVus = NIVEAUX.filter((n) => n.id === niveau || chaptersOf(n.id).some((c) => aCommence(data, c.id)));
  const maitriseHtml = niveauxVus.map((n) => `<h3 class="dash-niveau">${n.label}</h3>` + THEMES.map((t) => {
    const list = chaptersOf(n.id, t.id).filter((c) => c.module);
    if (!list.length) return '';
    return `<div class="dash-theme" data-theme="${t.id}"><h3>${t.icone} ${t.label}</h3>${list.map((c) => {
      const m = maitrise(data, c.id), ch = data.chapters[c.id] || {}, err = erreursChapitre(data, c.id);
      return `<div class="dash-chap">
        <span class="dash-chap-name">${c.icone} ${c.titre}${ch.quizPassed ? ' 🏅' : ''}${ch.quizScore ? ` <span class="muted">(quiz ${esc(ch.quizScore)})</span>` : ''}</span>
        <span class="dash-chap-bar" data-theme="${c.theme}"><span style="width:${m}%"></span></span>
        <span class="dash-chap-pct" title="${err.total ? `${err.ok} réussite(s), ${err.ko} erreur(s)` : 'pas encore travaillé'}">${m}%</span></div>`;
    }).join('')}</div>`;
  }).join('')).join('');

  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Élèves</button>
    <header class="dash-hero">
      <h1>📈 ${esc(rep.eleve.pseudo)} <span class="muted">${niv ? niv.label : ''}</span></h1>
      <p class="muted">Dernière sauvegarde : ${ilYa(rep.maj)} · code <span class="code-affiche">${esc(rep.eleve.code)}</span></p>
      <div class="dash-stats">
        <div class="dash-stat"><span class="ds-val">${data.xp}</span><span class="ds-lab">XP</span></div>
        <div class="dash-stat"><span class="ds-val">${p.done}/${p.total}</span><span class="ds-lab">validés (${niv ? niv.label : ''})</span></div>
        <div class="dash-stat"><span class="ds-val">${exosReussis(data, 7)}</span><span class="ds-lab">exos 7 j</span></div>
        <div class="dash-stat"><span class="ds-val">${exosReussis(data, 30)}</span><span class="ds-lab">exos 30 j</span></div>
        <div class="dash-stat"><span class="ds-val">🔥 ${serieActuelle(data)}</span><span class="ds-lab">jours</span></div>
      </div>
    </header>
    ${rep.donnees ? `
    <section class="chapter-section">
      <h2>📅 Exercices réussis (14 derniers jours)</h2>
      <div class="activite-bars">${valeurs.map((v, i) => `<span style="height:${Math.round(v / max * 100)}%" title="${jours[i]} : ${v} exercice(s)"></span>`).join('')}</div>
      <div class="activite-legende"><span>${jours[0].slice(5)}</span><span>aujourd'hui</span></div>
    </section>
    <section class="chapter-section">
      <h2>🎯 Ce qui coince</h2>
      ${fragiles.length ? `<div class="weak-list">${fragiles.map((w) => `
        <div class="weak-item" data-theme="${w.c.theme}">
          <span>${w.c.icone} ${w.c.titre} <span class="muted">(${niveauById(w.c.niveau).label})</span></span>
          <span class="weak-meta">${w.review ? '🔖 ' : ''}${w.total ? `${Math.round(w.rate * 100)} % d'erreurs (${w.ko}/${w.total})` : 'marqué à revoir'}</span>
        </div>`).join('')}</div>` : '<p class="muted">Rien à signaler.</p>'}
    </section>
    <section class="chapter-section">
      <h2>🧭 Maîtrise par chapitre</h2>
      <div class="dash-themes">${maitriseHtml}</div>
    </section>` : '<section class="chapter-section"><p class="muted">Pas encore de progression enregistrée : l\'élève ne s\'est pas encore connecté.</p></section>'}`;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/prof'));
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
        const keys = st.choix.map((c) => String(c).replace(/\s+/g, ''));
        if (new Set(keys).size !== keys.length) problems.push(`${where} : choix en double (${st.choix.join(' | ')})`);
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
  Sync.demarrer(); // récupère la version en ligne si l'élève est connecté
}

/** Après une fusion avec la version en ligne : redessine sans casser un exercice en cours. */
function apresFusion() {
  applySettings();
  refreshTopbar();
  const h = location.hash || '#/';
  const pagePassive = h === '#/' || /^#\/(niveau|tableau|compte)/.test(h);
  if (pagePassive) router();
}

Store.load();
Sync = creerSynchro({
  lireDonnees: () => Store.data,
  ecrireDonnees: (d) => { Store.data = Store.normaliser(d); Store.saveLocal(); },
  resume: (d) => resumePourTuteur(d),
  // Classe venant du serveur (fixée par le tuteur) : appliquée si plus récente que le choix local.
  appliquerEleve: (e) => {
    const s = Store.data.settings;
    if (e && e.niveau && (!s.niveau || (e.niveauAt || 0) > (s.niveauAt || 0))) {
      const change = s.niveau !== e.niveau;
      s.niveau = e.niveau; s.niveauAt = e.niveauAt || Date.now();
      Store.saveLocal();
      if (change) apresFusion();
    }
  },
  onChange: apresFusion,
  onStatut: () => refreshCompteBtn(),
});
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
