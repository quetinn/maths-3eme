// =====================================================================
//  c16_probabilites.js — Expériences aléatoires, calcul de probabilités
//  Simulateur de dé interactif (loi des grands nombres).
// =====================================================================

import { randInt, pick, gcd } from '../engine.js';

function simulateurDe(host) {
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  const wrap = document.createElement('div');
  wrap.className = 'simulateur';
  wrap.innerHTML = `
    <div class="sim-face" aria-live="polite">🎲</div>
    <button class="btn btn-primary sim-roll">🎲 Lancer le dé</button>
    <button class="btn btn-ghost sim-reset">Réinitialiser</button>
    <div class="sim-stats">Clique pour lancer ! Plus tu lances, plus la fréquence se rapproche de 1/6 ≈ 17 %.</div>`;
  let total = 0; const counts = [0, 0, 0, 0, 0, 0];
  const faceEl = wrap.querySelector('.sim-face');
  const stats = wrap.querySelector('.sim-stats');
  const refresh = (r) => {
    faceEl.textContent = r === null ? '🎲' : faces[r];
    if (!total) { stats.textContent = 'Aucun lancer pour l\'instant.'; return; }
    stats.innerHTML = `Lancers : <strong>${total}</strong>` +
      (r !== null ? ` — résultat : <strong>${r + 1}</strong>` : '') +
      `<br>fréquences : ` + counts.map((c, i) => `${i + 1}:${(c / total * 100).toFixed(0)}%`).join(' · ');
  };
  wrap.querySelector('.sim-roll').addEventListener('click', () => { const r = Math.floor(Math.random() * 6); counts[r]++; total++; refresh(r); });
  wrap.querySelector('.sim-reset').addEventListener('click', () => { total = 0; counts.fill(0); refresh(null); });
  host.appendChild(wrap);
}

// Simulateur de pièce (pile/face) — fréquences vers 50 %.
function simulateurPiece(host) {
  const labels = ['Pile', 'Face'], icons = ['⚪', '⚫'];
  const wrap = document.createElement('div');
  wrap.className = 'simulateur';
  wrap.innerHTML = `
    <div class="sim-face" aria-live="polite">🪙</div>
    <button class="btn btn-primary sim-roll">🪙 Lancer la pièce</button>
    <button class="btn btn-ghost sim-reset">Réinitialiser</button>
    <div class="sim-bars" data-bars></div>
    <div class="sim-stats">Pile ou face ? Plus tu lances, plus chaque fréquence se rapproche de 50 %.</div>`;
  let total = 0; const counts = [0, 0];
  const faceEl = wrap.querySelector('.sim-face'), stats = wrap.querySelector('.sim-stats'), bars = wrap.querySelector('[data-bars]');
  const draw = (r) => {
    faceEl.textContent = r === null ? '🪙' : icons[r];
    bars.innerHTML = counts.map((c, i) => {
      const pct = total ? Math.round(c / total * 100) : 0;
      return `<div class="sim-bar"><span class="bar-lab">${labels[i]}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span><span class="bar-pct">${pct}%</span></div>`;
    }).join('');
    stats.textContent = total ? `${total} lancer(s)` + (r !== null ? ` — résultat : ${labels[r]}` : '') : 'Aucun lancer pour l\'instant.';
  };
  wrap.querySelector('.sim-roll').addEventListener('click', () => { const r = Math.random() < 0.5 ? 0 : 1; counts[r]++; total++; draw(r); });
  wrap.querySelector('.sim-reset').addEventListener('click', () => { total = 0; counts[0] = counts[1] = 0; draw(null); });
  draw(null);
  host.appendChild(wrap);
}

// Simulateur d'urne (tirage avec remise) — fréquences vers les probabilités.
function simulateurUrne(host) {
  const colors = [
    { name: 'rouge', emoji: '🔴', css: '#d0566a', n: 3 },
    { name: 'verte', emoji: '🟢', css: '#3a9e6b', n: 2 },
    { name: 'bleue', emoji: '🔵', css: '#4f7bb0', n: 1 },
  ];
  const balls = []; colors.forEach((c, i) => { for (let k = 0; k < c.n; k++) balls.push(i); });
  const totalBalls = balls.length;
  const urn = colors.map((c) => Array.from({ length: c.n }, () => `<span class="urn-ball" style="background:${c.css}"></span>`).join('')).join('');
  const wrap = document.createElement('div');
  wrap.className = 'simulateur';
  wrap.innerHTML = `
    <div class="sim-urn" aria-hidden="true">${urn}</div>
    <div class="sim-face" aria-live="polite">🎁</div>
    <button class="btn btn-primary sim-roll">Tirer une boule</button>
    <button class="btn btn-ghost sim-reset">Réinitialiser</button>
    <div class="sim-bars" data-bars></div>
    <div class="sim-stats">Urne : 3 rouges, 2 vertes, 1 bleue. P(rouge) = 3/6 = 1/2.</div>`;
  let total = 0; const counts = colors.map(() => 0);
  const faceEl = wrap.querySelector('.sim-face'), stats = wrap.querySelector('.sim-stats'), bars = wrap.querySelector('[data-bars]');
  const draw = (r) => {
    faceEl.textContent = r === null ? '🎁' : colors[r].emoji;
    bars.innerHTML = colors.map((c, i) => {
      const pct = total ? Math.round(counts[i] / total * 100) : 0;
      return `<div class="sim-bar"><span class="bar-lab">${c.name}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%;background:${c.css}"></span></span><span class="bar-pct">${pct}%</span></div>`;
    }).join('');
    stats.textContent = total ? `${total} tirage(s)` + (r !== null ? ` — ${colors[r].name}` : '') + ' · théorie : 50 % / 33 % / 17 %' : 'Aucun tirage pour l\'instant.';
  };
  wrap.querySelector('.sim-roll').addEventListener('click', () => { const r = balls[Math.floor(Math.random() * totalBalls)]; counts[r]++; total++; draw(r); });
  wrap.querySelector('.sim-reset').addEventListener('click', () => { total = 0; counts.fill(0); draw(null); });
  draw(null);
  host.appendChild(wrap);
}

export default {
  id: 'c16',
  titre: 'Probabilités',
  theme: 'donnees',
  priorite: false,
  icone: '🎲',

  intro:
    "Les probabilités mesurent la « chance » qu'un événement se produise, entre $0$ (impossible) et $1$ " +
    "(certain). On en a besoin pour les jeux, la météo, les assurances… et pour comprendre le hasard.",

  cours: [
    { type: 'definition', titre: 'Vocabulaire', contenu: "Une <strong>expérience aléatoire</strong> a plusieurs <strong>issues</strong> possibles. Un <strong>événement</strong> regroupe certaines issues." },
    { type: 'propriete', titre: 'Probabilité (équiprobabilité)', contenu: "Quand toutes les issues ont la même chance, la probabilité d'un événement est :", formule: 'P = \\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}' },
    { type: 'propriete', titre: 'Événement contraire', contenu: "La probabilité que l'événement ne se produise pas :", formule: 'P(\\overline{A}) = 1 - P(A)' },
    {
      type: 'figure', titre: 'Simulateur — dé (loi des grands nombres)',
      contenu: "Lance le dé plusieurs fois : la fréquence de chaque face se rapproche de $\\dfrac16 \\approx 16{,}7\\%$.",
      render: (host) => simulateurDe(host),
    },
    {
      type: 'figure', titre: 'Simulateur — pièce de monnaie',
      contenu: "Une pièce équilibrée : $P(\\text{pile}) = P(\\text{face}) = \\dfrac12$. Lance-la et observe les fréquences se rapprocher de $50\\%$.",
      render: (host) => simulateurPiece(host),
    },
    {
      type: 'figure', titre: 'Simulateur — urne',
      contenu: "Une urne de 6 boules (3 rouges, 2 vertes, 1 bleue). À chaque tirage (avec remise), les fréquences se rapprochent des probabilités : $\\dfrac36, \\dfrac26, \\dfrac16$.",
      render: (host) => simulateurUrne(host),
    },
  ],

  methode: [
    { etape: 1, titre: 'Lister les issues', explication: "Compte le nombre total de résultats possibles (le dénominateur)." },
    { etape: 2, titre: 'Compter les cas favorables', explication: "Combien d'issues réalisent l'événement (le numérateur) ?" },
    { etape: 3, titre: 'Écrire la probabilité', explication: "$P = \\dfrac{\\text{favorables}}{\\text{possibles}}$, puis simplifie la fraction." },
    { etape: 4, titre: 'Événement contraire', explication: "Parfois plus rapide : $P(A) = 1 - P(\\overline{A})$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Probabilité avec un dé (fraction ou décimal) :',
      generer() {
        const n = randInt(1, 6);
        return { enonce: `On lance un dé équilibré à 6 faces. Quelle est la probabilité d'obtenir le $${n}$ ?`, reponse: 1 / 6, validation: 'nombre', tolerance: 0.01, reponseTex: '\\dfrac{1}{6}' };
      },
      indices: ['Il y a 6 issues équiprobables.', 'Une seule réalise l\'événement.', '$P = \\dfrac{1}{6}$.'],
      correction_detaillee: () => `<p>$P = \\dfrac{1}{6} \\approx 0{,}17$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Probabilité avec une urne (fraction ou décimal) :',
      generer() {
        const k = randInt(2, 5), autres = randInt(3, 7), n = k + autres;
        return { enonce: `Une urne contient $${k}$ boules rouges et $${autres}$ boules vertes. Probabilité de tirer une rouge ?`, reponse: k / n, validation: 'nombre', tolerance: 0.01, reponseTex: `\\dfrac{${k}}{${n}}` };
      },
      indices: ['Compte le nombre total de boules.', 'Compte les boules favorables (rouges).', '$P = \\dfrac{\\text{rouges}}{\\text{total}}$.'],
      correction_detaillee: (s) => `<p>$P = \\dfrac{\\text{favorables}}{\\text{total}}$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Probabilité de l\'événement contraire (décimal ou fraction) :',
      generer() {
        const n = pick([4, 5, 8, 10]), k = randInt(1, n - 1);
        return { enonce: `La probabilité de gagner à un jeu est $\\dfrac{${k}}{${n}}$. Quelle est la probabilité de NE PAS gagner ?`, reponse: 1 - k / n, validation: 'nombre', tolerance: 0.01, reponseTex: `\\dfrac{${n - k}}{${n}}` };
      },
      indices: ['$P(\\overline{A}) = 1 - P(A)$.', `Calcule $1 - \\dfrac{k}{n}$.`, 'Mets au même dénominateur.'],
      correction_detaillee: () => `<p>$P(\\overline A) = 1 - P(A)$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Choisis la bonne réponse :',
      generer() {
        const cas = [
          { e: "On lance une pièce équilibrée. Probabilité de « pile » ?", good: '\\dfrac12', ch: ['\\dfrac12', '\\dfrac13', '1', '0'] },
          { e: "Un événement certain a pour probabilité :", good: '1', ch: ['1', '0', '\\dfrac12', '100'] },
          { e: "Un événement impossible a pour probabilité :", good: '0', ch: ['0', '1', '\\dfrac12', '-1'] },
        ];
        const c = pick(cas);
        return { enonce: c.e, choix: c.ch, correct: c.ch.indexOf(c.good) };
      },
      indices: ['Une probabilité est comprise entre 0 et 1.', '0 = impossible, 1 = certain.', 'Une pièce : 2 issues équiprobables.'],
      correction_detaillee: () => `<p>$P=0$ : impossible ; $P=1$ : certain ; pièce équilibrée : $P=\\dfrac12$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Probabilité (pense à simplifier) — décimal ou fraction :',
      generer() {
        const events = [
          { e: 'obtenir un nombre pair', fav: 3 },
          { e: 'obtenir un multiple de 3', fav: 2 },
          { e: 'obtenir un nombre supérieur ou égal à 5', fav: 2 },
          { e: 'obtenir un nombre inférieur à 5', fav: 4 },
        ];
        const ev = pick(events); const g = gcd(ev.fav, 6);
        return { enonce: `On lance un dé à 6 faces. Probabilité d'« ${ev.e} » ?`, reponse: ev.fav / 6, validation: 'nombre', tolerance: 0.01, reponseTex: `\\dfrac{${ev.fav / g}}{${6 / g}}`, _v: { fav: ev.fav, g } };
      },
      indices: ['Liste les faces favorables parmi 1,2,3,4,5,6.', 'Mets le nombre de favorables sur 6.', 'Simplifie la fraction si possible.'],
      correction_etapes(st) {
        const { fav, g } = st._v; const simp = g > 1 ? ` = \\dfrac{${fav / g}}{${6 / g}}` : '';
        return [
          `Il y a 6 issues équiprobables (les faces 1 à 6).`,
          `On compte les cas favorables : $${fav}$.`,
          `$P = \\dfrac{${fav}}{6}${simp}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Combien de cas favorables ?',
      generer() {
        const n = pick([10, 12, 20]), p = pick([0.25, 0.5, 0.2]); const fav = Math.round(p * n);
        return { enonce: `Dans un sac de $${n}$ jetons, la probabilité de tirer un jeton gagnant est $${String(p).replace('.', '{,}')}$. Combien y a-t-il de jetons gagnants ?`, reponse: fav, validation: 'nombre' };
      },
      indices: ['$P = \\dfrac{\\text{favorables}}{\\text{total}}$.', 'Donc favorables $= P \\times \\text{total}$.', 'Multiplie la probabilité par le nombre total.'],
      correction_detaillee: () => `<p>Nombre de favorables $= P \\times \\text{total}$.</p>`,
    },

    // ----- Niveau 1 : Compléter le calcul d'une probabilité (urne) -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète le calcul de la probabilité :',
      generer() {
        const k = randInt(2, 5), v = randInt(3, 7), n = k + v;
        return {
          enonce_complete: `Urne : $${k}$ rouges et $${v}$ vertes. Nombre total de boules : {0} $.\\;$ Probabilité de tirer une rouge : {1}`,
          champs: [
            { reponse: n, validation: 'nombre' },
            { reponse: k / n, validation: 'nombre', tolerance: 0.01 },
          ],
          _v: { k, v, n },
        };
      },
      indices: ['Le total = rouges + vertes.', '$P = \\dfrac{\\text{rouges}}{\\text{total}}$.', 'Tu peux donner une fraction ou un décimal.'],
      correction_etapes(st) {
        const { k, v, n } = st._v;
        return [
          `Nombre total de boules : $${k} + ${v} = ${n}$.`,
          `Cas favorables (rouges) : $${k}$.`,
          `$P(\\text{rouge}) = \\dfrac{${k}}{${n}}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre le calcul d\'une probabilité :',
      generer() {
        const fav = pick([2, 3, 4]); const g = gcd(fav, 6);
        return {
          etapes: [
            `Lister les issues possibles : 6 faces du dé`,
            `Compter les cas favorables : ${fav} faces`,
            `Écrire la probabilité : $P = \\dfrac{${fav}}{6}$`,
            `Simplifier la fraction : $\\dfrac{${fav / g}}{${6 / g}}$`,
          ],
        };
      },
      indices: ['On compte d\'abord toutes les issues possibles.', 'Puis les cas favorables.', 'On simplifie en dernier.'],
      correction_detaillee: () => `<p>Ordre : issues possibles → cas favorables → écrire $P$ → simplifier.</p>`,
    },

    // ----- Niveau 3 : Urne à trois couleurs (comme le simulateur) -----
    {
      id: 'e09', niveau: 3, type: 'saisie', consigne: 'Probabilité avec une urne à trois couleurs (fraction ou décimal) :',
      generer() {
        const r = randInt(2, 5), v = randInt(2, 4), b = randInt(1, 3), n = r + v + b;
        const target = pick([{ name: 'rouge', f: r }, { name: 'verte', f: v }, { name: 'bleue', f: b }]);
        const g = gcd(target.f, n);
        return {
          enonce: `Une urne contient $${r}$ boules rouges, $${v}$ vertes et $${b}$ bleues. Probabilité de tirer une boule ${target.name} ?`,
          reponse: target.f / n, validation: 'nombre', tolerance: 0.01, reponseTex: `\\dfrac{${target.f / g}}{${n / g}}`,
        };
      },
      indices: ['Compte le nombre total de boules.', 'Compte les boules de la couleur demandée.', '$P = \\dfrac{\\text{favorables}}{\\text{total}}$, puis simplifie.'],
      correction_detaillee: (s) => `<p>$P = \\dfrac{\\text{favorables}}{\\text{total}}$, soit $${s.reponseTex}$ après simplification.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Probabilité d\'obtenir « face » avec une pièce équilibrée (décimal ou fraction) ?', reponse: 0.5, validation: 'nombre', tolerance: 0.01, explication: '$P = \\dfrac12 = 0{,}5$.' },
    { type: 'qcm', question: 'Une probabilité est toujours comprise entre :', choix: ['0 et 1', '0 et 100', '-1 et 1', '1 et 6'], correct: 0, explication: 'Une probabilité va de $0$ (impossible) à $1$ (certain).' },
    {
      type: 'saisie', question: 'Probabilité avec un dé.',
      generer() { const ev = pick([{ e: 'un nombre pair', f: 3 }, { e: 'un multiple de 3', f: 2 }, { e: 'un nombre supérieur ou égal à 5', f: 2 }, { e: 'un nombre inférieur à 5', f: 4 }]); return { question: `Dé à 6 faces : probabilité d'obtenir ${ev.e} (fraction ou décimal) ?`, reponse: ev.f / 6, validation: 'nombre', tolerance: 0.01, explication: `$\\dfrac{${ev.f}}{6}$.` }; },
    },
    {
      type: 'saisie', question: 'Événement contraire.',
      generer() { const n = pick([5, 10, 4]), k = randInt(1, n - 1); const p = k / n; return { question: `Si $P(A) = ${String(p).replace('.', '{,}')}$, combien vaut $P(\\overline{A})$ ?`, reponse: 1 - p, validation: 'nombre', tolerance: 0.01, explication: `$1 - ${String(p).replace('.', '{,}')} = ${String(1 - p).replace('.', '{,}')}$.` }; },
    },
    { type: 'vrai_faux', question: 'Plus on répète une expérience, plus la fréquence observée se rapproche de la probabilité.', reponse: true, explication: 'C\'est la loi des grands nombres.' },
  ],
};
