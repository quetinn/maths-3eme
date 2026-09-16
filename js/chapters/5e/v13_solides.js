// =====================================================================
//  v13_solides.js — 5ᵉ : prismes droits et cylindres de révolution —
//  vocabulaire (faces, arêtes, sommets), perspective cavalière, patrons.
//  Figures : prisme et cylindre en perspective, patrons de cube.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, arrondi, svg, seg, poly, txt, cercle } from '../commun.js';

/** Prisme droit à base triangulaire en perspective cavalière (arêtes cachées en pointillés). */
function figPrisme({ h = '', cote = '' } = {}) {
  const A = [40, 175], B = [160, 175], C = [88, 130];   // base du bas (triangle ABC)
  const d = [0, -80];                                    // translation verticale
  const p = (P) => [P[0] + d[0], P[1] + d[1]];
  let s = seg(A, B) + seg(B, C) + seg(A, C, { dash: true, c: 'var(--muted)' });
  s += seg(p(A), p(B)) + seg(p(B), p(C)) + seg(p(A), p(C));
  s += seg(A, p(A)) + seg(B, p(B)) + seg(C, p(C), { dash: true, c: 'var(--muted)' });
  s += txt(A[0] - 10, A[1] + 6, 'A') + txt(B[0] + 10, B[1] + 6, 'B') + txt(C[0] + 12, C[1] + 2, 'C');
  s += txt(p(A)[0] - 12, p(A)[1], "A'") + txt(p(B)[0] + 12, p(B)[1], "B'") + txt(p(C)[0] + 12, p(C)[1], "C'");
  if (h) s += txt(A[0] - 14, (A[1] + p(A)[1]) / 2, h, { c: 'var(--accent-ink)', size: 12 });
  if (cote) s += txt((A[0] + B[0]) / 2, A[1] + 18, cote, { c: 'var(--accent-ink)', size: 12 });
  return svg(220, 200, s, 'prisme droit à base triangulaire', 'fig-chap');
}

/** Cylindre de révolution en perspective. */
function figCylindre({ h = '', r = '' } = {}) {
  const cx = 105, ry = 18, rx = 62, yh = 45, yb = 165;
  let s = `<ellipse cx="${cx}" cy="${yh}" rx="${rx}" ry="${ry}" fill="var(--accent-soft)" stroke="var(--text)" stroke-width="2"/>`;
  s += `<path d="M ${cx - rx} ${yb} A ${rx} ${ry} 0 0 0 ${cx + rx} ${yb}" fill="none" stroke="var(--text)" stroke-width="2"/>`;
  s += `<path d="M ${cx - rx} ${yb} A ${rx} ${ry} 0 0 1 ${cx + rx} ${yb}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += seg([cx - rx, yh], [cx - rx, yb]) + seg([cx + rx, yh], [cx + rx, yb]);
  s += seg([cx, yh], [cx + rx, yh], { c: 'var(--accent)', w: 2 });
  if (r) s += txt(cx + rx / 2, yh - 6, r, { c: 'var(--accent-ink)', size: 12 });
  if (h) s += txt(cx + rx + 16, (yh + yb) / 2, h, { c: 'var(--t-geometrie)', size: 12 });
  return svg(210, 200, s, 'cylindre de révolution', 'fig-chap');
}

// Patrons de 6 carrés : [cases [i, j], est-ce un patron de cube ?]
const PATRONS = [
  [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], true],
  [[[0, 0], [1, 0], [2, 0], [1, 1], [1, 2], [1, 3]], true],
  [[[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], true],
  [[[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]], true],
  [[[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]], true],
  [[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], false],
  [[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]], false],
  [[[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1]], false],
  [[[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 0]], false],
  [[[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]], false],
];

/** Dessine un patron (grille de carrés). */
function figPatron(cases) {
  const c = 34, W = 260, H = 150;
  const maxI = Math.max(...cases.map((k) => k[0])), maxJ = Math.max(...cases.map((k) => k[1]));
  const ox = (W - (maxI + 1) * c) / 2, oy = (H - (maxJ + 1) * c) / 2;
  const s = cases.map(([i, j]) => poly([[ox + i * c, oy + j * c], [ox + (i + 1) * c, oy + j * c], [ox + (i + 1) * c, oy + (j + 1) * c], [ox + i * c, oy + (j + 1) * c]], { fill: 'var(--accent-soft)', c: 'var(--accent)', w: 1.6 })).join('');
  return svg(W, H, s, 'patron formé de six carrés', 'fig-chap');
}

const BASES = [[3, 'triangulaire', 'un triangle'], [4, 'quadrangulaire', 'un quadrilatère'], [5, 'pentagonale', 'un pentagone'], [6, 'hexagonale', 'un hexagone'], [8, 'octogonale', 'un octogone']];

export default {
  id: 'v13',
  titre: 'Solides : patrons et perspective',
  theme: 'geometrie', niveau: '5e',
  icone: '🧊',

  intro:
    "Une boîte de céréales, une canette, une tente… Pour représenter un objet de l'espace sur une feuille, on utilise " +
    "la <strong>perspective cavalière</strong> ; pour le fabriquer, on trace son <strong>patron</strong>. Savoir passer du " +
    "solide au patron (et l'inverse) prépare les calculs d'aires et de volumes, et en 4ᵉ les pyramides et les cônes.",

  cours: [
    {
      type: 'definition', titre: 'Prisme droit',
      contenu: "Un <strong>prisme droit</strong> a deux faces superposables et parallèles (les <strong>bases</strong>, des polygones) reliées par des faces latérales <strong>rectangulaires</strong>. Sa <strong>hauteur</strong> est la distance entre les deux bases. Un pavé droit est un prisme droit à base rectangulaire.",
    },
    {
      type: 'propriete', titre: 'Compter faces, arêtes et sommets',
      contenu: "Si la base d'un prisme droit a $n$ côtés, le prisme a $n + 2$ faces (les 2 bases et $n$ faces latérales), $2n$ sommets et $3n$ arêtes.",
      formule: 'n = 3 : \\quad 5 \\text{ faces}, \\; 6 \\text{ sommets}, \\; 9 \\text{ arêtes}',
    },
    {
      type: 'definition', titre: 'Cylindre de révolution',
      contenu: "Un <strong>cylindre de révolution</strong> est obtenu en faisant tourner un rectangle autour d'un de ses côtés. Ses deux bases sont des <strong>disques</strong> de même rayon $r$, et sa hauteur $h$ est la distance entre les deux bases.",
    },
    {
      type: 'propriete', titre: 'La perspective cavalière',
      contenu: "Les faces vues de face sont dessinées en <strong>vraie grandeur</strong> ; les arêtes parallèles dans la réalité restent <strong>parallèles</strong> sur le dessin ; les arêtes <strong>cachées</strong> sont tracées en pointillés. En revanche, les longueurs « en fuite » et les angles ne sont pas conservés.",
    },
    {
      type: 'propriete', titre: 'Patrons',
      contenu: "Le <strong>patron</strong> d'un solide est une figure plane qui, pliée, donne ce solide. Patron d'un prisme droit : les deux bases et un grand rectangle dont la longueur est le <strong>périmètre de la base</strong> et la largeur la hauteur. Patron d'un cylindre : deux disques et un rectangle de longueur $2\\pi r$ (le périmètre du cercle) et de largeur $h$. Un cube a $11$ patrons différents.",
      formule: '\\text{rectangle du patron : } L = 2\\pi r \\;\\text{ (cylindre)}, \\quad L = \\text{périmètre de la base (prisme)}',
    },
    { type: 'figure', titre: 'Prisme droit et cylindre', contenu: "À gauche un prisme droit à base triangulaire (arêtes cachées en pointillés), à droite un cylindre de révolution.", render: (host) => { host.innerHTML = `<div class="fig-rangee">${figPrisme({ h: 'h' })}${figCylindre({ h: 'h', r: 'r' })}</div>`; } },
    { type: 'figure', titre: 'Un patron de cube', contenu: "Ce patron, plié, donne un cube. Attention : toutes les figures de six carrés ne sont pas des patrons !", render: (host) => { host.innerHTML = figPatron(PATRONS[0][0]); } },
    {
      type: 'exemple', enonce: 'Un prisme droit a pour base un pentagone. Combien a-t-il de faces, de sommets et d\'arêtes ?',
      solution_etapes: [
        "Faces : les 2 bases + 5 faces latérales (une par côté du pentagone), soit $5 + 2 = 7$ faces.",
        "Sommets : 5 sur la base du bas et 5 sur celle du haut, soit $2 \\times 5 = 10$ sommets.",
        "Arêtes : 5 en bas, 5 en haut et 5 verticales, soit $3 \\times 5 = 15$ arêtes.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Identifier la base', explication: "La base est la face qui se répète deux fois (polygone pour un prisme, disque pour un cylindre)." },
    { etape: 2, titre: 'Compter avec n', explication: "$n$ côtés à la base ⇒ $n + 2$ faces, $2n$ sommets, $3n$ arêtes." },
    { etape: 3, titre: 'Dessiner en perspective', explication: "Face avant en vraie grandeur, fuyantes parallèles entre elles, arêtes cachées en pointillés." },
    { etape: 4, titre: 'Construire un patron', explication: "Les deux bases, plus un rectangle : longueur = périmètre de la base, largeur = hauteur." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Compte les éléments du prisme droit :',
      generer() {
        const [n, adj] = pick(BASES);
        const [quoi, rep] = pick([['faces', n + 2], ['sommets', 2 * n], ['arêtes', 3 * n]]);
        return { enonce: `Un prisme droit a une base ${adj} (${n} côtés). Combien a-t-il de ${quoi} ?`, reponse: rep, validation: 'nombre', _v: { n, quoi } };
      },
      indices: ['Un prisme droit a deux bases identiques.', 'Il y a une face latérale par côté de la base.', 'Arêtes : celles des deux bases + les arêtes verticales.'],
      correction_etapes(st) {
        const { n, quoi } = st._v;
        if (quoi === 'faces') return [`Les 2 bases, plus une face latérale par côté de la base : $${n}$.`, `$2 + ${n} = ${n + 2}$ faces.`];
        if (quoi === 'sommets') return [`Chaque base a $${n}$ sommets, et il y a 2 bases.`, `$2 \\times ${n} = ${2 * n}$ sommets.`];
        return [`$${n}$ arêtes sur la base du bas, $${n}$ sur celle du haut, et $${n}$ arêtes verticales.`, `$3 \\times ${n} = ${3 * n}$ arêtes.`];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'De quel solide s\'agit-il ?',
      generer() {
        const [desc, bon, why] = pick([
          ['Ses deux bases sont des disques et sa surface latérale se déroule en un rectangle.', 'un cylindre de révolution', 'Deux disques + un rectangle : c\'est le patron du cylindre.'],
          ['Ses deux bases sont des triangles et ses trois autres faces sont des rectangles.', 'un prisme droit', 'Deux bases polygonales et des faces latérales rectangulaires : un prisme droit.'],
          ['Toutes ses faces sont des carrés identiques.', 'un cube', 'Six carrés identiques : c\'est un cube.'],
          ['Ses six faces sont des rectangles.', 'un pavé droit', 'Le pavé droit (ou parallélépipède rectangle) a six faces rectangulaires.'],
        ]);
        return { enonce: `${desc} Ce solide est :`, choix: [bon, ...['un cylindre de révolution', 'un prisme droit', 'un cube', 'un pavé droit'].filter((c) => c !== bon).slice(0, 3)], correct: 0, _v: { why } };
      },
      indices: ['Regarde la forme des bases.', 'Regarde la forme des faces latérales.', 'Un cube est un pavé droit particulier.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e03', niveau: 1, type: 'vrai_faux', consigne: 'Perspective cavalière — vrai ou faux ?',
      generer() {
        const [e, r, why] = pick([
          ['En perspective cavalière, les arêtes cachées se dessinent en pointillés.', true, "C'est la convention : ce qu'on ne voit pas est en pointillés."],
          ['En perspective cavalière, la face avant est dessinée en vraie grandeur.', true, 'La face vue de face conserve ses longueurs et ses angles.'],
          ['En perspective cavalière, tous les angles droits du solide restent droits sur le dessin.', false, 'Les fuyantes forment un angle choisi (souvent 45°) : les angles ne sont pas conservés.'],
          ['En perspective cavalière, deux arêtes parallèles du solide restent parallèles sur le dessin.', true, 'Le parallélisme est conservé.'],
          ['En perspective cavalière, toutes les longueurs sont conservées.', false, 'Les longueurs des fuyantes sont réduites.'],
        ]);
        return { enonce: e, reponse: r, _v: { why } };
      },
      indices: ['Pense au dessin d\'un cube dans ton cahier.', 'Les fuyantes sont raccourcies et inclinées.', 'Le parallélisme, lui, est toujours respecté.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e04', niveau: 2, type: 'vrai_faux', consigne: 'Ce patron permet-il de construire un cube ?',
      generer() {
        const [cases, ok] = pick(PATRONS);
        return { enonce: 'En pliant cette figure de six carrés, obtient-on un cube ?', reponse: ok, _v: { ok }, visuel: (h) => { h.innerHTML = figPatron(cases); } };
      },
      indices: ['Imagine que tu plies la figure selon les bords communs.', 'Deux carrés ne doivent jamais se superposer.', 'Un carré de 2 × 2 dans le patron est toujours impossible.'],
      correction_etapes: (st) => (st._v.ok
        ? ['En pliant, chaque carré vient former une face différente : les six faces sont bien couvertes.', "C'est l'un des 11 patrons du cube."]
        : ['En pliant, deux carrés viennent se superposer (ou une face reste vide) : ce n\'est pas un patron de cube.', 'Repère un bloc de 2 × 2 carrés ou une bande de plus de 4 carrés : ces figures ne sont jamais des patrons.']),
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Patron du cylindre — longueur du rectangle (au dixième, en cm) :',
      generer() {
        const r = randInt(2, 9);
        return {
          enonce: `Un cylindre de révolution a un rayon de $${r}$ cm. Quelle est la longueur du rectangle de son patron (arrondie au dixième) ?`,
          reponse: arrondi(2 * Math.PI * r, 1), validation: 'nombre', tolerance: 0.05, accepte: [arrondi(2 * 3.14 * r, 1)], _v: { r },
          visuel: (h) => { h.innerHTML = figCylindre({ r: `${r} cm` }); },
        };
      },
      indices: ['Le rectangle s\'enroule autour du disque de base.', 'Sa longueur est le périmètre du cercle de base.', 'Périmètre $= 2 \\times \\pi \\times r$.'],
      correction_etapes: (st) => [
        'La longueur du rectangle est le périmètre du cercle de base.',
        `$P = 2 \\times \\pi \\times ${st._v.r} = ${2 * st._v.r}\\pi \\approx ${tex(arrondi(2 * Math.PI * st._v.r, 3))}$.`,
        `Arrondi au dixième : $${tex(arrondi(2 * Math.PI * st._v.r, 1))}$ cm.`,
      ],
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Aire latérale du prisme droit (en cm²) :',
      generer() {
        const cotes = [randInt(3, 9), randInt(3, 9), randInt(4, 9)], h = randInt(3, 12);
        const P = cotes[0] + cotes[1] + cotes[2];
        return { enonce: `Un prisme droit a pour base un triangle de côtés $${cotes[0]}$ cm, $${cotes[1]}$ cm et $${cotes[2]}$ cm, et une hauteur de $${h}$ cm. Quelle est l'aire de sa surface latérale (le grand rectangle du patron) ?`, reponse: P * h, validation: 'nombre', _v: { cotes, h, P } };
      },
      indices: ['La surface latérale se déroule en un rectangle.', 'Sa longueur est le périmètre de la base.', 'Aire $= $ périmètre de la base $\\times$ hauteur.'],
      correction_etapes: (st) => [
        `Périmètre de la base : $${st._v.cotes.join(' + ')} = ${st._v.P}$ cm.`,
        `Aire latérale $= ${st._v.P} \\times ${st._v.h} = ${st._v.P * st._v.h}$ cm².`,
      ],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Retrouve le nombre de côtés de la base :',
      generer() {
        const [n] = pick(BASES);
        const [quoi, val] = pick([['faces', n + 2], ['sommets', 2 * n], ['arêtes', 3 * n]]);
        return { enonce: `Un prisme droit a $${val}$ ${quoi}. Combien de côtés a sa base ?`, reponse: n, validation: 'nombre', _v: { n, quoi, val } };
      },
      indices: ['Écris la relation entre $n$ et le nombre donné.', 'Faces : $n + 2$ ; sommets : $2n$ ; arêtes : $3n$.', 'Fais le calcul inverse (soustraire 2, diviser par 2 ou par 3).'],
      correction_etapes(st) {
        const { n, quoi, val } = st._v;
        if (quoi === 'faces') return [`Nombre de faces $= n + 2$, donc $n = ${val} - 2$.`, `La base a $${n}$ côtés.`];
        if (quoi === 'sommets') return [`Nombre de sommets $= 2n$, donc $n = ${val} \\div 2$.`, `La base a $${n}$ côtés.`];
        return [`Nombre d'arêtes $= 3n$, donc $n = ${val} \\div 3$.`, `La base a $${n}$ côtés.`];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Aire totale du pavé droit (en cm²) :',
      generer() {
        const L = randInt(3, 12), l = randInt(2, 9), h = randInt(2, 9);
        return { enonce: `Un pavé droit mesure $${L}$ cm de longueur, $${l}$ cm de largeur et $${h}$ cm de hauteur. Quelle est l'aire totale de son patron ?`, reponse: 2 * (L * l + L * h + l * h), validation: 'nombre', _v: { L, l, h } };
      },
      indices: ['Le patron est formé de 6 rectangles.', 'Les faces sont égales deux à deux.', 'Aire $= 2 \\times (L\\ell + Lh + \\ell h)$.'],
      correction_etapes: (st) => {
        const { L, l, h } = st._v;
        return [
          `Les faces vont par paires : $${L} \\times ${l} = ${L * l}$, $${L} \\times ${h} = ${L * h}$ et $${l} \\times ${h} = ${l * h}$ cm².`,
          `Aire totale $= 2 \\times (${L * l} + ${L * h} + ${l * h}) = 2 \\times ${L * l + L * h + l * h} = ${2 * (L * l + L * h + l * h)}$ cm².`,
        ];
      },
    },
    {
      id: 'e09', niveau: 1, type: 'complete', consigne: 'Complète pour ce prisme droit :',
      generer() {
        const [n, adj] = pick(BASES);
        return {
          enonce_complete: `Un prisme droit à base ${adj} (${n} côtés) a {0} faces et {1} arêtes.`,
          champs: [{ reponse: n + 2, validation: 'nombre' }, { reponse: 3 * n, validation: 'nombre' }], _v: { n },
        };
      },
      indices: ['Faces : les 2 bases + les faces latérales.', 'Arêtes : les deux bases + les arêtes verticales.', '$n + 2$ faces et $3n$ arêtes.'],
      correction_etapes: (st) => [`Faces : $${st._v.n} + 2 = ${st._v.n + 2}$.`, `Arêtes : $3 \\times ${st._v.n} = ${3 * st._v.n}$.`],
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le tracé du patron d\'un prisme droit :',
      generer() {
        const c = randInt(3, 8), h = randInt(4, 10), P = 3 * c;
        return {
          etapes: [
            `Repérer la base (un triangle équilatéral de côté $${c}$ cm) et la hauteur ($${h}$ cm)`,
            `Calculer le périmètre de la base : $3 \\times ${c} = ${P}$ cm`,
            `Tracer le rectangle de la surface latérale : $${P}$ cm sur $${h}$ cm`,
            'Tracer les deux bases, une de chaque côté du rectangle',
            'Ajouter les languettes de collage',
          ],
        };
      },
      indices: ['On commence par lire les dimensions.', 'Le grand rectangle a pour longueur le périmètre de la base.', 'Les bases se placent ensuite.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Combien un prisme droit à base hexagonale a-t-il de faces ?', reponse: 8, validation: 'nombre', explication: '$6 + 2 = 8$ faces.' },
    { type: 'qcm', question: 'Dans un patron de cylindre, la longueur du rectangle est égale :', choix: ['au périmètre du disque de base', "au diamètre de la base", 'à la hauteur du cylindre', "à l'aire du disque"], correct: 0, explication: 'Le rectangle s\'enroule autour de la base : sa longueur est $2\\pi r$.' },
    { type: 'vrai_faux', question: 'En perspective cavalière, les arêtes cachées sont dessinées en pointillés.', reponse: true, explication: 'C\'est la convention de représentation.' },
    {
      type: 'saisie', question: 'Arêtes d\'un prisme.',
      generer() { const [n] = pick(BASES); return { question: `Combien d'arêtes a un prisme droit dont la base a $${n}$ côtés ?`, reponse: 3 * n, validation: 'nombre', explication: `$3 \\times ${n} = ${3 * n}$ arêtes.` }; },
    },
    { type: 'qcm', question: 'Combien un cube a-t-il de patrons différents ?', choix: ['11', '6', '8', '1'], correct: 0, explication: 'Il existe exactement 11 patrons du cube.' },
  ],
};
