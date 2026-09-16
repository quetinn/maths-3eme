// =====================================================================
//  v16_probabilites.js — 5ᵉ : expérience aléatoire, issues, événements,
//  probabilité en situation d'équiprobabilité, échelle des probabilités,
//  événement contraire, fréquence observée et probabilité.
//  Figure interactive : simulateur de lancers (loi des grands nombres).
// =====================================================================

import { randInt, pick, gcd } from '../../engine.js';
import { tex, arrondi, fracSimple, svg, txt } from '../commun.js';

/** Roue de loterie partagée en secteurs égaux, certains colorés. */
function figRoue(n, favorables) {
  const C = [95, 95], R = 74;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a1 = (i * 360) / n - 90, a2 = ((i + 1) * 360) / n - 90;
    const P = (d) => [C[0] + R * Math.cos((d * Math.PI) / 180), C[1] + R * Math.sin((d * Math.PI) / 180)];
    const [x1, y1] = P(a1), [x2, y2] = P(a2), [lx, ly] = P((a1 + a2) / 2);
    s += `<path d="M ${C[0]} ${C[1]} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${i < favorables ? 'var(--accent-soft)' : 'var(--surface)'}" stroke="var(--accent)" stroke-width="1.5"/>`;
    s += txt(C[0] + (lx - C[0]) * 0.65, C[1] + (ly - C[1]) * 0.65 + 4, String(i + 1), { size: 11, c: 'var(--accent-ink)' });
  }
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="4" fill="var(--text)"/>`;
  return svg(190, 190, s, 'roue partagée en secteurs égaux', 'fig-chap');
}

/** Urne : boules colorées (HTML). */
function urne(rouges, vertes, bleues = 0) {
  const boule = (c) => `<span class="urn-ball" style="background:${c}"></span>`;
  return `<div class="sim-urn">${boule('#d06a6a').repeat(rouges)}${boule('#2f9e6b').repeat(vertes)}${bleues ? boule('#4f7bb0').repeat(bleues) : ''}</div>`;
}

/** Simulateur de lancers de dé : la fréquence se rapproche de la probabilité. */
function simulateurDe(host) {
  const wrap = document.createElement('div'); wrap.className = 'simulateur';
  wrap.innerHTML = `
    <div class="sim-face" data-face>🎲</div>
    <button class="btn btn-primary" data-un>Lancer une fois</button>
    <button class="btn btn-ghost" data-cent>Lancer 100 fois</button>
    <button class="btn btn-ghost" data-reset>↺</button>
    <div class="sim-bars" data-bars></div>
    <div class="sim-stats" data-stats></div>`;
  const compte = [0, 0, 0, 0, 0, 0];
  const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  function maj(dernier) {
    const total = compte.reduce((a, b) => a + b, 0);
    if (dernier) wrap.querySelector('[data-face]').textContent = FACES[dernier - 1];
    wrap.querySelector('[data-bars]').innerHTML = compte.map((c, i) => {
      const f = total ? (c / total) * 100 : 0;
      return `<div class="sim-bar"><span class="bar-lab">${FACES[i]}</span><span class="bar-track"><span class="bar-fill" style="width:${f.toFixed(1)}%"></span></span><span class="bar-pct">${f.toFixed(0)}%</span></div>`;
    }).join('');
    wrap.querySelector('[data-stats]').textContent = total
      ? `${total} lancer(s) — chaque face a une probabilité de 1/6 ≈ 16,7 % : plus on lance, plus les fréquences s'en rapprochent.`
      : 'Lance le dé : les six faces ont la même probabilité.';
  }
  const lancer = (n) => { let d = 0; for (let i = 0; i < n; i++) { d = randInt(1, 6); compte[d - 1]++; } maj(d); };
  wrap.querySelector('[data-un]').addEventListener('click', () => lancer(1));
  wrap.querySelector('[data-cent]').addEventListener('click', () => lancer(100));
  wrap.querySelector('[data-reset]').addEventListener('click', () => { compte.fill(0); wrap.querySelector('[data-face]').textContent = '🎲'; maj(0); });
  maj(0);
  host.appendChild(wrap);
}

/** Probabilité sous forme de fraction simplifiée + valeur décimale. */
const proba = (a, b) => `${fracSimple(a, b)}`;

export default {
  id: 'v16',
  titre: 'Premières probabilités',
  theme: 'donnees', niveau: '5e',
  icone: '🎲',

  intro:
    "Quelle est la chance d'obtenir un 6 au dé ? De tirer une boule rouge ? Une <strong>probabilité</strong> est un " +
    "nombre entre $0$ et $1$ qui mesure les chances qu'un événement se produise. On la calcule ici en comptant les " +
    "cas favorables et les cas possibles, et on la retrouvera en 4ᵉ et en 3ᵉ (expériences à deux épreuves, arbres).",

  cours: [
    {
      type: 'definition', titre: 'Expérience aléatoire, issues, événement',
      contenu: "Une <strong>expérience aléatoire</strong> est une expérience dont on ne peut pas prévoir le résultat (lancer un dé, tirer une carte). Les résultats possibles sont les <strong>issues</strong>. Un <strong>événement</strong> est constitué d'une ou plusieurs issues : par exemple « obtenir un nombre pair » regroupe les issues $2$, $4$ et $6$.",
    },
    {
      type: 'propriete', titre: 'Calculer une probabilité',
      contenu: "Quand toutes les issues ont la <strong>même chance</strong> de se produire (dé équilibré, boules indiscernables au toucher), la probabilité d'un événement est le quotient du nombre de <strong>cas favorables</strong> par le nombre de <strong>cas possibles</strong>.",
      formule: 'P = \\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}',
    },
    {
      type: 'propriete', titre: 'Échelle des probabilités',
      contenu: "Une probabilité est toujours comprise entre $0$ et $1$. Elle vaut $0$ pour un événement <strong>impossible</strong>, $1$ pour un événement <strong>certain</strong>, et $\\dfrac{1}{2}$ pour un événement qui a autant de chances de se produire que de ne pas se produire. On peut l'exprimer en fraction, en décimal ou en pourcentage.",
      formule: '0 \\le P \\le 1',
    },
    {
      type: 'propriete', titre: 'Événement contraire',
      contenu: "L'événement <strong>contraire</strong> de $A$ est celui qui se produit exactement quand $A$ ne se produit pas. Les deux probabilités s'additionnent pour faire $1$.",
      formule: 'P(\\text{contraire de } A) = 1 - P(A)',
    },
    {
      type: 'definition', titre: 'Fréquence et probabilité',
      contenu: "Si on répète l'expérience un grand nombre de fois, la <strong>fréquence</strong> observée d'un événement se rapproche de sa <strong>probabilité</strong>. Sur peu de lancers, l'écart peut être important : c'est normal.",
    },
    { type: 'figure', titre: 'Lancer un dé (simulation)', contenu: "Lance le dé 100 fois plusieurs fois de suite : les six fréquences se rapprochent de $\\dfrac{1}{6} \\approx 16{,}7\\,\\%$.", render: (host) => simulateurDe(host) },
    {
      type: 'exemple', enonce: "Une urne contient $3$ boules rouges et $5$ boules vertes, indiscernables au toucher. On en tire une au hasard. Quelle est la probabilité d'obtenir une boule rouge ? Une boule verte ?",
      solution_etapes: [
        "Il y a $3 + 5 = 8$ boules : $8$ cas possibles, tous équiprobables.",
        "Cas favorables pour « rouge » : $3$. Donc $P(\\text{rouge}) = \\dfrac{3}{8} = 0{,}375$.",
        "« Verte » est l'événement contraire : $P(\\text{verte}) = 1 - \\dfrac{3}{8} = \\dfrac{5}{8} = 0{,}625$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Compter les cas possibles', explication: "Combien d'issues différentes ? (faces du dé, boules de l'urne, secteurs de la roue…)" },
    { etape: 2, titre: 'Compter les cas favorables', explication: "Combien d'issues réalisent l'événement demandé ?" },
    { etape: 3, titre: 'Écrire le quotient', explication: "$P = \\dfrac{\\text{favorables}}{\\text{possibles}}$, puis simplifie la fraction si possible." },
    { etape: 4, titre: 'Vérifier', explication: "Le résultat doit être entre $0$ et $1$. Pour le contraire : $1 - P$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Dé équilibré — donne la probabilité (fraction ou décimal) :',
      generer() {
        const k = randInt(1, 6);
        return { enonce: `On lance un dé équilibré à 6 faces. Quelle est la probabilité d'obtenir le nombre $${k}$ ?`, reponse: 1 / 6, validation: 'nombre', tolerance: 0.005, reponseTex: '\\dfrac{1}{6}', _v: { k } };
      },
      indices: ['Combien de résultats possibles ?', 'Combien de résultats donnent le nombre demandé ?', 'Écris la fraction (tape par exemple 1/6).'],
      correction_etapes: (st) => [
        'Il y a $6$ issues possibles, toutes équiprobables.',
        `Une seule issue donne $${st._v.k}$ : il y a $1$ cas favorable.`,
        '$P = \\dfrac{1}{6} \\approx 0{,}17$.',
      ],
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Cet événement est :',
      generer() {
        const [e, type, why] = pick([
          ['On lance un dé à 6 faces et on obtient $7$.', 'impossible', 'Le dé ne porte pas le nombre $7$ : la probabilité vaut $0$.'],
          ['On lance un dé à 6 faces et on obtient un nombre inférieur à $10$.', 'certain', 'Toutes les faces conviennent : la probabilité vaut $1$.'],
          ['On lance un dé à 6 faces et on obtient un nombre pair.', 'ni impossible ni certain', 'Trois faces sur six conviennent : la probabilité vaut $\\dfrac{1}{2}$.'],
          ['On tire une boule dans une urne qui ne contient que des boules vertes et on obtient une boule rouge.', 'impossible', "Il n'y a aucune boule rouge : probabilité $0$."],
          ['On tire une carte dans un jeu de 32 cartes et on obtient un cœur.', 'ni impossible ni certain', 'Il y a 8 cœurs sur 32 cartes : la probabilité vaut $\\dfrac{1}{4}$.'],
        ]);
        return { enonce: e, choix: ['impossible', 'certain', 'ni impossible ni certain'], correct: ['impossible', 'certain', 'ni impossible ni certain'].indexOf(type), ordre_fixe: true, _v: { why } };
      },
      indices: ['Un événement impossible a une probabilité de $0$.', 'Un événement certain a une probabilité de $1$.', 'Sinon, la probabilité est strictement entre $0$ et $1$.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: "Compte le nombre d'issues possibles :",
      generer() {
        const [e, n] = pick([
          ["On lance une pièce de monnaie. Combien y a-t-il d'issues possibles ?", 2],
          ["On lance un dé équilibré à 6 faces. Combien y a-t-il d'issues possibles ?", 6],
          ["On tire une carte au hasard dans un jeu de 32 cartes. Combien y a-t-il d'issues possibles ?", 32],
          ["Une roue est partagée en 8 secteurs identiques numérotés. Combien y a-t-il d'issues possibles ?", 8],
          ["On tire une boule dans une urne contenant 4 boules rouges et 7 boules vertes. Combien y a-t-il d'issues possibles ?", 11],
        ]);
        return { enonce: e, reponse: n, validation: 'nombre', _v: { n } };
      },
      indices: ["Une issue est un résultat possible de l'expérience.", 'Compte tous les résultats, même ceux qui se ressemblent.', "Pour une urne : le nombre total d'objets."],
      correction_etapes: (st) => [`Il y a $${st._v.n}$ résultats possibles : le nombre d'issues est $${st._v.n}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Urne — donne la probabilité (fraction ou décimal) :',
      generer() {
        const r = randInt(2, 8), v = randInt(2, 8), b = pick([0, 0, randInt(1, 5)]);
        const n = r + v + b, couleur = pick([['rouge', r], ['verte', v]].concat(b ? [['bleue', b]] : []));
        return {
          enonce: `Une urne contient $${r}$ boules rouges, $${v}$ boules vertes${b ? ` et $${b}$ boules bleues` : ''}, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité d'obtenir une boule ${couleur[0]} ?`,
          reponse: couleur[1] / n, validation: 'nombre', tolerance: 0.005, reponseTex: proba(couleur[1], n), _v: { r, v, b, n, couleur },
          visuel: (h) => { h.innerHTML = urne(r, v, b); },
        };
      },
      indices: ['Cas possibles : le nombre total de boules.', 'Cas favorables : le nombre de boules de la couleur demandée.', 'Écris la fraction, puis simplifie-la si possible.'],
      correction_etapes: (st) => {
        const { r, v, b, n, couleur } = st._v;
        return [
          `Nombre total de boules : $${r} + ${v}${b ? ` + ${b}` : ''} = ${n}$ cas possibles.`,
          `Boules ${couleur[0]}s : $${couleur[1]}$ cas favorables.`,
          `$P = \\dfrac{${couleur[1]}}{${n}}${gcd(couleur[1], n) > 1 ? ` = ${fracSimple(couleur[1], n)}` : ''} \\approx ${tex(arrondi(couleur[1] / n, 2))}$.`,
        ];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Dé à 6 faces — probabilité de l\'événement :',
      generer() {
        const [nom, favorables] = pick([
          ['obtenir un nombre pair', [2, 4, 6]],
          ['obtenir un nombre impair', [1, 3, 5]],
          ['obtenir un multiple de $3$', [3, 6]],
          ['obtenir un nombre strictement supérieur à $4$', [5, 6]],
          ['obtenir un nombre inférieur ou égal à $2$', [1, 2]],
          ['obtenir un nombre premier', [2, 3, 5]],
        ]);
        return {
          enonce: `On lance un dé équilibré à 6 faces. Quelle est la probabilité de « ${nom} » ?`,
          reponse: favorables.length / 6, validation: 'nombre', tolerance: 0.005, reponseTex: proba(favorables.length, 6), _v: { nom, favorables },
        };
      },
      indices: ['Liste les faces qui conviennent.', 'Compte-les : ce sont les cas favorables.', 'Divise par $6$ (le nombre de faces).'],
      correction_etapes: (st) => [
        `Les issues favorables sont : $${st._v.favorables.join(' \\;;\\; ')}$, soit $${st._v.favorables.length}$ cas.`,
        `$P = \\dfrac{${st._v.favorables.length}}{6}${gcd(st._v.favorables.length, 6) > 1 ? ` = ${fracSimple(st._v.favorables.length, 6)}` : ''} \\approx ${tex(arrondi(st._v.favorables.length / 6, 2))}$.`,
      ],
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Quel événement a le plus de chances de se produire ?',
      generer() {
        const n = randInt(8, 14), a = randInt(2, n - 3), b = randInt(1, n - 1);
        if (a === b) return this.generer();
        const A = `tirer une boule rouge dans une urne de $${n}$ boules dont $${a}$ rouges`;
        const B = `tirer une boule verte dans une urne de $${n}$ boules dont $${b}$ vertes`;
        return { enonce: 'Deux urnes, deux tirages :', choix: [A, B, 'les deux ont la même probabilité'], correct: a > b ? 0 : 1, ordre_fixe: true, _v: { n, a, b } };
      },
      indices: ['Calcule la probabilité de chaque événement.', 'Les deux urnes ont le même nombre de boules : compare les cas favorables.', 'La plus grande fraction correspond au plus probable.'],
      correction_etapes: (st) => [
        `$P(A) = \\dfrac{${st._v.a}}{${st._v.n}}$ et $P(B) = \\dfrac{${st._v.b}}{${st._v.n}}$.`,
        `Même dénominateur : on compare $${st._v.a}$ et $${st._v.b}$ ; le plus probable est ${st._v.a > st._v.b ? 'le premier' : 'le second'}.`,
      ],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Événement contraire — donne la probabilité :',
      generer() {
        const n = pick([4, 5, 8, 10, 20, 25]), k = randInt(1, n - 1);
        return {
          enonce: `La probabilité qu'il pleuve demain est estimée à $${tex(arrondi(k / n, 4))}$. Quelle est la probabilité qu'il ne pleuve pas ?`,
          reponse: arrondi(1 - k / n, 4), validation: 'nombre', tolerance: 0.005, _v: { n, k },
        };
      },
      indices: ['Les deux événements sont contraires.', 'La somme de leurs probabilités vaut $1$.', 'Calcule $1 - P$.'],
      correction_etapes: (st) => [
        "« Il ne pleut pas » est l'événement contraire de « il pleut ».",
        `$P = 1 - ${tex(arrondi(st._v.k / st._v.n, 4))} = ${tex(arrondi(1 - st._v.k / st._v.n, 4))}$.`,
      ],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Roue de loterie — probabilité (fraction ou décimal) :',
      generer() {
        const n = pick([4, 5, 6, 8, 10, 12]), f = randInt(1, n - 1);
        return {
          enonce: `Une roue est partagée en $${n}$ secteurs identiques. $${f}$ secteurs sont gagnants (colorés). Quelle est la probabilité de gagner ?`,
          reponse: f / n, validation: 'nombre', tolerance: 0.005, reponseTex: proba(f, n), _v: { n, f },
          visuel: (h) => { h.innerHTML = figRoue(n, f); },
        };
      },
      indices: ['Les secteurs sont identiques : toutes les issues ont la même probabilité.', 'Cas favorables : les secteurs gagnants.', 'Cas possibles : le nombre total de secteurs.'],
      correction_etapes: (st) => [
        `Les $${st._v.n}$ secteurs sont identiques : chaque secteur a la même probabilité.`,
        `$P = \\dfrac{${st._v.f}}{${st._v.n}}${gcd(st._v.f, st._v.n) > 1 ? ` = ${fracSimple(st._v.f, st._v.n)}` : ''} \\approx ${tex(arrondi(st._v.f / st._v.n, 2))}$.`,
      ],
    },
    {
      id: 'e09', niveau: 1, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const [e, r, why] = pick([
          ['Une probabilité peut être égale à $1{,}2$.', false, 'Non : une probabilité est toujours comprise entre $0$ et $1$.'],
          ["La probabilité d'un événement impossible est $0$.", true, 'Aucun cas favorable : $P = \\dfrac{0}{n} = 0$.'],
          ["La probabilité d'un événement certain est $1$.", true, 'Tous les cas sont favorables : $P = \\dfrac{n}{n} = 1$.'],
          ['En lançant une pièce équilibrée, la probabilité d\'obtenir « pile » est $\\dfrac{1}{2}$.', true, 'Deux issues équiprobables, une favorable.'],
          ['Si on lance une pièce 10 fois, on obtient forcément 5 fois « pile ».', false, "Non : la fréquence observée se rapproche de $\\dfrac{1}{2}$ seulement sur un grand nombre de lancers."],
          ['Une probabilité peut être négative.', false, 'Non : le nombre de cas favorables ne peut pas être négatif.'],
        ]);
        return { enonce: e, reponse: r, _v: { why } };
      },
      indices: ['Une probabilité est un nombre entre $0$ et $1$.', 'Pense aux cas extrêmes : impossible et certain.', 'Attention à la différence entre fréquence observée et probabilité.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: "Remets dans l'ordre le calcul d'une probabilité :",
      generer() {
        const r = randInt(2, 6), v = randInt(3, 9), n = r + v;
        return {
          etapes: [
            `Compter les cas possibles : $${r} + ${v} = ${n}$ boules`,
            `Compter les cas favorables : $${r}$ boules rouges`,
            `Écrire le quotient : $P = \\dfrac{${r}}{${n}}$`,
            `Simplifier ou donner une valeur approchée : $P \\approx ${tex(arrondi(r / n, 2))}$`,
          ],
        };
      },
      indices: ['On compte d\'abord toutes les issues.', 'Puis celles qui nous intéressent.', 'Le quotient vient ensuite.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Une probabilité est toujours :', choix: ['comprise entre 0 et 1', 'plus grande que 1', 'un nombre entier', 'négative'], correct: 0, explication: '$0 \\le P \\le 1$.' },
    {
      type: 'saisie', question: 'Probabilité avec un dé.',
      generer() { const f = pick([[ 'un nombre pair', 3], ['un multiple de 3', 2], ['le nombre 5', 1]]); return { question: `On lance un dé à 6 faces. Probabilité d'obtenir ${f[0]} (fraction ou décimal) ?`, reponse: f[1] / 6, validation: 'nombre', tolerance: 0.005, explication: `$P = \\dfrac{${f[1]}}{6} \\approx ${tex(arrondi(f[1] / 6, 2))}$.` }; },
    },
    { type: 'vrai_faux', question: "La probabilité d'un événement impossible est $0$.", reponse: true, explication: 'Aucun cas favorable.' },
    {
      type: 'saisie', question: 'Événement contraire.',
      generer() { const p = pick([0.2, 0.25, 0.4, 0.75, 0.9]); return { question: `$P(A) = ${tex(p)}$. Quelle est la probabilité de l'événement contraire ?`, reponse: arrondi(1 - p, 2), validation: 'nombre', tolerance: 0.005, explication: `$1 - ${tex(p)} = ${tex(arrondi(1 - p, 2))}$.` }; },
    },
    { type: 'qcm', question: 'Dans une urne de 10 boules dont 4 rouges, la probabilité de tirer une rouge est :', choix: ['\\dfrac{2}{5}', '\\dfrac{4}{6}', '\\dfrac{1}{4}', '\\dfrac{10}{4}'], correct: 0, explication: '$\\dfrac{4}{10} = \\dfrac{2}{5} = 0{,}4$.' },
  ],
};
