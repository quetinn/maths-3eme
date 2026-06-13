// =====================================================================
//  app.js — Cœur de l'application
//  - Registre des chapitres (5 thèmes) et des thèmes
//  - Store localStorage : progression, XP, niveau, badges, dernier chapitre
//  - Routeur SPA par hash (#/  et  #/chapitre/cXX)
//  - Rendu de la page d'accueil (carte + section prioritaire + progression)
//  - Rendu d'une page de chapitre (gabarit en 5 étapes)
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
//  Registre des chapitres (métadonnées pour la carte d'accueil).
//  `module` = chemin d'import dynamique (null = contenu à venir).
//  Les chapitres prioritaires ⭐ portent `priorite: true`.
// ---------------------------------------------------------------------

export const CHAPTERS = [
  // — Thème 1 : Nombres et calculs —
  { id: 'c01', num: 1,  titre: 'Calcul littéral',            theme: 'nombres_calculs', priorite: true,  icone: '🔢', module: './chapters/c01_calcul_litteral.js' },
  { id: 'c02', num: 2,  titre: 'Identités remarquables',     theme: 'nombres_calculs', priorite: true,  icone: '🟰', module: './chapters/c02_identites_remarquables.js' },
  { id: 'c03', num: 3,  titre: 'Équations du 1er degré',     theme: 'nombres_calculs', priorite: false, icone: '⚖️', module: './chapters/c03_equations_1er_degre.js' },
  { id: 'c04', num: 4,  titre: 'Équations-produit',          theme: 'nombres_calculs', priorite: false, icone: '✖️', module: './chapters/c04_equations_produit.js' },
  { id: 'c05', num: 5,  titre: 'Arithmétique',               theme: 'nombres_calculs', priorite: false, icone: '🧮', module: './chapters/c05_arithmetique.js' },
  { id: 'c06', num: 6,  titre: 'Puissances et racines',      theme: 'nombres_calculs', priorite: false, icone: '√',  module: './chapters/c06_puissances_racines.js' },
  // — Thème 2 : Fonctions —
  { id: 'c07', num: 7,  titre: 'Notion de fonction',         theme: 'fonctions',       priorite: true,  icone: '📈', module: './chapters/c07_notion_de_fonction.js' },
  { id: 'c08', num: 8,  titre: 'Fonctions linéaires & affines', theme: 'fonctions',    priorite: true,  icone: '📉', module: './chapters/c08_fonctions_lineaires_affines.js' },
  { id: 'c09', num: 9,  titre: 'Sens de variation',          theme: 'fonctions',       priorite: false, icone: '〽️', module: './chapters/c09_variations_lecture_graphique.js' },
  // — Thème 3 : Géométrie —
  { id: 'c10', num: 10, titre: 'Théorème de Thalès',         theme: 'geometrie',       priorite: true,  icone: '📐', module: './chapters/c10_thales.js' },
  { id: 'c11', num: 11, titre: 'Trigonométrie',              theme: 'geometrie',       priorite: true,  icone: '🔺', module: './chapters/c11_trigonometrie.js' },
  { id: 'c12', num: 12, titre: 'Transformations du plan',    theme: 'geometrie',       priorite: false, icone: '🔄', module: './chapters/c12_transformations_plan.js' },
  { id: 'c13', num: 13, titre: 'Homothétie',                 theme: 'geometrie',       priorite: false, icone: '🔎', module: './chapters/c13_homothetie.js' },
  { id: 'c14', num: 14, titre: 'Géométrie dans l\'espace',   theme: 'geometrie',       priorite: false, icone: '🧊', module: './chapters/c14_geometrie_espace.js' },
  // — Thème 4 : Données et probabilités —
  { id: 'c15', num: 15, titre: 'Statistiques',               theme: 'donnees',         priorite: false, icone: '📊', module: './chapters/c15_statistiques.js' },
  { id: 'c16', num: 16, titre: 'Probabilités',               theme: 'donnees',         priorite: false, icone: '🎲', module: './chapters/c16_probabilites.js' },
  // — Thème 5 : Algorithmique (bonus) —
  { id: 'c17', num: 17, titre: 'Algorithmique',              theme: 'algo',            priorite: false, icone: '💻', module: './chapters/c17_algorithmique.js' },
];

const chapterById = (id) => CHAPTERS.find((c) => c.id === id);

// ---------------------------------------------------------------------
//  Store localStorage
// ---------------------------------------------------------------------

const STORE_KEY = 'maths3eme_v1';

const Store = {
  data: { xp: 0, badges: {}, chapters: {}, last: null },

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) this.data = Object.assign(this.data, JSON.parse(raw));
    } catch (e) { console.warn('[store] lecture impossible', e); }
    return this;
  },
  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); }
    catch (e) { console.warn('[store] sauvegarde impossible', e); }
  },

  chapter(id) {
    if (!this.data.chapters[id]) {
      this.data.chapters[id] = { xp: 0, exercices: {}, quizPassed: false, quizScore: null };
    }
    return this.data.chapters[id];
  },

  addXP(n, chId) {
    this.data.xp += n;
    if (chId) this.chapter(chId).xp += n;
    this.save();
    refreshTopbar();
  },

  markExercise(chId, exId) {
    this.chapter(chId).exercices[exId] = true;
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

  setQuizScore(chId, score, total) {
    this.chapter(chId).quizScore = `${score}/${total}`;
    this.save();
  },

  setLast(chId) { this.data.last = chId; this.save(); },

  hasBadge(chId) { return !!this.data.badges[chId]; },

  // Niveau : 100 XP par niveau (progression linéaire, pas d'ordre imposé).
  level() { return Math.floor(this.data.xp / 100) + 1; },
  levelProgress() { return this.data.xp % 100; },

  /** Progression globale = chapitres validés (quiz réussi) / total. */
  globalProgress() {
    const done = CHAPTERS.filter((c) => this.chapter(c.id).quizPassed).length;
    return { done, total: CHAPTERS.length, pct: Math.round((done / CHAPTERS.length) * 100) };
  },

  themeProgress(themeId) {
    const list = CHAPTERS.filter((c) => c.theme === themeId);
    const done = list.filter((c) => this.chapter(c.id).quizPassed).length;
    return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
  },
};

// ---------------------------------------------------------------------
//  Barre supérieure (XP / niveau)
// ---------------------------------------------------------------------

function refreshTopbar() {
  const el = document.getElementById('xpMini');
  if (!el) return;
  const lvl = Store.level();
  const prog = Store.levelProgress();
  el.innerHTML = `
    <span class="lvl-badge">Niv. ${lvl}</span>
    <span class="xp-bar"><span style="width:${prog}%"></span></span>
    <span class="xp-val">${Store.data.xp} XP</span>`;
}

// ---------------------------------------------------------------------
//  Routeur SPA (hash)
// ---------------------------------------------------------------------

const app = () => document.getElementById('app');

function router() {
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/chapitre\/(c\d+)/);
  window.scrollTo(0, 0);
  if (m) renderChapter(m[1]);
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
        </div>
      </div>
      ${last ? `<button class="btn btn-primary btn-resume" data-resume="${last.id}">
          ▶️ Reprendre : ${last.icone} ${last.titre}</button>` : ''}
    </section>

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

  // Liens des cartes + bouton reprendre
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
  return `
    <button class="chapter-card ${c.priorite ? 'is-priority' : ''} ${available ? '' : 'is-soon'}"
            data-theme="${c.theme}" data-goto="${c.id}"
            aria-label="Chapitre ${c.num} : ${c.titre}">
      <div class="cc-top">
        <span class="cc-ico">${c.icone}</span>
        ${c.priorite ? '<span class="cc-star" title="Prioritaire">⭐</span>' : ''}
        ${badge ? '<span class="cc-medal" title="Chapitre validé">🏅</span>' : ''}
      </div>
      <div class="cc-num">Chapitre ${c.num}</div>
      <div class="cc-title">${c.titre}</div>
      <div class="cc-status">
        ${available
          ? (badge ? 'Validé ✓' : (started ? 'En cours…' : 'Commencer'))
          : 'Bientôt disponible'}
      </div>
    </button>`;
}

// ---------------------------------------------------------------------
//  Page de chapitre (chargement dynamique du module de contenu)
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
      <div class="chapter-soon">
        <span class="soon-ico">${meta.icone}</span>
        <h1>${meta.titre}</h1>
        <p>Ce chapitre arrive prochainement. Le moteur et le gabarit sont prêts —
        il ne reste qu'à rédiger son contenu (<code>js/chapters/${id}_*.js</code>).</p>
        <a class="btn btn-primary" href="#/chapitre/c01">Découvrir un chapitre complet →</a>
      </div>`;
    root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));
    return;
  }

  let chap;
  try {
    chap = (await import(meta.module)).default;
  } catch (e) {
    console.error(e);
    root.innerHTML = `<p class="notice">Erreur de chargement du chapitre. <a href="#/">Retour</a></p>`;
    return;
  }

  Store.setLast(id);
  buildChapterPage(root, meta, chap);
}

function buildChapterPage(root, meta, chap) {
  const cp = Store.chapter(meta.id);

  // — Squelette —
  root.innerHTML = `
    <button class="btn btn-ghost btn-back" data-back>← Accueil</button>

    <header class="chapter-hero">
      <span class="ch-ico">${chap.icone || meta.icone}</span>
      <div>
        <div class="ch-eyebrow">Chapitre ${meta.num}${chap.priorite ? ' · ⭐ Prioritaire' : ''}</div>
        <h1>${chap.titre}</h1>
      </div>
      ${Store.hasBadge(meta.id) ? '<span class="ch-badge">🏅 Validé</span>' : ''}
    </header>

    <nav class="chapter-toc">
      <a href="#sec-intro">À quoi ça sert</a>
      <a href="#sec-cours">Cours</a>
      <a href="#sec-methode">Méthode</a>
      <a href="#sec-exos">Exercices</a>
      <a href="#sec-quiz">Quiz bilan</a>
    </nav>

    <section id="sec-intro" class="chapter-section intro-card">
      <h2>💡 À quoi ça sert ?</h2>
      <p>${chap.intro || ''}</p>
    </section>

    <section id="sec-cours" class="chapter-section">
      <h2>📚 Cours essentiel</h2>
      <div class="cours-list"></div>
    </section>

    <section id="sec-methode" class="chapter-section">
      <h2>🧭 Méthode pas-à-pas</h2>
      <p class="muted">Clique pour révéler les étapes une à une.</p>
      <ol class="methode-list"></ol>
    </section>

    <section id="sec-exos" class="chapter-section">
      <h2>✏️ Exercices interactifs</h2>
      <div class="level-tabs"></div>
      <div class="exos-host"></div>
    </section>

    <section id="sec-quiz" class="chapter-section quiz-section">
      <h2>🏁 Quiz bilan</h2>
      <p class="muted">5 questions pour valider le chapitre et décrocher ton badge (80 % requis).</p>
      <div class="quiz-host"></div>
    </section>
  `;
  root.querySelector('[data-back]').addEventListener('click', () => navigate('#/'));

  // — Cours —
  const coursHost = root.querySelector('.cours-list');
  (chap.cours || []).forEach((bloc) => coursHost.appendChild(renderCoursBloc(bloc)));

  // — Méthode (révélation progressive) —
  const methodeHost = root.querySelector('.methode-list');
  (chap.methode || []).forEach((etape, i) => {
    const li = document.createElement('li');
    li.className = 'methode-step';
    li.innerHTML = `
      <button class="step-toggle">
        <span class="step-num">${etape.etape ?? i + 1}</span>
        <span class="step-titre">${etape.titre}</span>
        <span class="step-chevron">▸</span>
      </button>
      <div class="step-body" hidden>${etape.explication || ''}</div>`;
    const body = li.querySelector('.step-body');
    li.querySelector('.step-toggle').addEventListener('click', () => {
      const open = !body.hidden;
      body.hidden = open;
      li.classList.toggle('open', !open);
      if (!open) renderMath(body);
    });
    methodeHost.appendChild(li);
  });

  // — Exercices, regroupés par niveau, avec onglets —
  const tabs = root.querySelector('.level-tabs');
  const exoHost = root.querySelector('.exos-host');
  const niveaux = [
    { n: 1, label: 'Découverte' },
    { n: 2, label: 'Application' },
    { n: 3, label: 'Défi' },
  ];

  function showLevel(n) {
    exoHost.innerHTML = '';
    tabs.querySelectorAll('button').forEach((b) =>
      b.classList.toggle('active', parseInt(b.dataset.lvl, 10) === n));
    const exos = (chap.exercices || []).filter((e) => e.niveau === n);
    if (!exos.length) { exoHost.innerHTML = '<p class="muted">Aucun exercice à ce niveau.</p>'; return; }
    exos.forEach((ex) => mountExercise(exoHost, ex, {
      onCorrect: (xp, exId) => { Store.addXP(xp, meta.id); Store.markExercise(meta.id, exId); },
    }));
  }

  niveaux.forEach((lv) => {
    const count = (chap.exercices || []).filter((e) => e.niveau === lv.n).length;
    const b = document.createElement('button');
    b.className = 'level-tab lvl-' + lv.n;
    b.dataset.lvl = lv.n;
    b.innerHTML = `<strong>Niveau ${lv.n}</strong><span>${lv.label} · ${count}</span>`;
    b.addEventListener('click', () => showLevel(lv.n));
    tabs.appendChild(b);
  });
  showLevel(1);

  // — Quiz bilan — (on mémorise le dernier score pour le passage du quiz)
  const quizHost = root.querySelector('.quiz-host');
  if (chap.quiz_bilan && chap.quiz_bilan.length) {
    let lastScore = [0, chap.quiz_bilan.length];
    mountQuiz(quizHost, chap.quiz_bilan, {
      onComplete: (s, t) => { lastScore = [s, t]; Store.setQuizScore(meta.id, s, t); },
      onPass: (xp) => {
        Store.addXP(xp, meta.id);
        Store.passQuiz(meta.id, lastScore[0], lastScore[1]);
        celebrate(meta);
      },
    });
  } else {
    quizHost.innerHTML = '<p class="muted">Quiz à venir.</p>';
  }

  renderMath(root);
}

function renderCoursBloc(bloc) {
  const div = document.createElement('div');
  div.className = `cours-bloc bloc-${bloc.type || 'definition'}`;
  if (bloc.type === 'figure') {
    div.innerHTML = `<div class="bloc-tag">Figure</div>${bloc.titre ? `<h3>${bloc.titre}</h3>` : ''}`;
    const host = document.createElement('div');
    div.appendChild(host);
    // Rendu différé : certaines libs (JSXGraph) exigent que l'élément soit
    // déjà attaché au DOM et dimensionné avant de dessiner.
    if (typeof bloc.render === 'function') {
      requestAnimationFrame(() => {
        try { bloc.render(host); } catch (e) { console.error('[app] figure cours :', e); }
      });
    }
    if (bloc.contenu) {
      const p = document.createElement('p');
      p.innerHTML = bloc.contenu;
      div.appendChild(p);
    }
  } else if (bloc.type === 'exemple') {
    div.innerHTML = `
      <div class="bloc-tag">Exemple</div>
      <p class="bloc-enonce">${bloc.enonce || ''}</p>
      <ol class="bloc-etapes">${(bloc.solution_etapes || []).map((s) => `<li>${s}</li>`).join('')}</ol>`;
  } else {
    const tag = bloc.type === 'propriete' ? 'Propriété' : 'Définition';
    div.innerHTML = `
      <div class="bloc-tag">${tag}</div>
      ${bloc.titre ? `<h3>${bloc.titre}</h3>` : ''}
      ${bloc.contenu ? `<p>${bloc.contenu}</p>` : ''}
      ${bloc.formule ? `<div class="bloc-formule">$$${bloc.formule}$$</div>` : ''}`;
  }
  return div;
}

// ---------------------------------------------------------------------
//  Petite animation de félicitations (badge débloqué)
// ---------------------------------------------------------------------

function celebrate(meta) {
  const t = document.createElement('div');
  t.className = 'toast-badge';
  t.innerHTML = `🏅 <strong>Badge débloqué !</strong><br>${meta.titre}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
  // rafraîchit le bandeau "validé" si présent
  const hero = document.querySelector('.chapter-hero');
  if (hero && !hero.querySelector('.ch-badge')) {
    const span = document.createElement('span');
    span.className = 'ch-badge';
    span.textContent = '🏅 Validé';
    hero.appendChild(span);
  }
}

// ---------------------------------------------------------------------
//  Démarrage
// ---------------------------------------------------------------------

let _booted = false;
function boot() {
  if (_booted) return;
  _booted = true;
  refreshTopbar();
  router();
}

Store.load();
window.addEventListener('hashchange', router);
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot);
} else {
  boot(); // le module est différé : le DOM est déjà analysé
}
