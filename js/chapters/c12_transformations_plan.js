// =====================================================================
//  c12_transformations_plan.js — Translations, symétries, rotations
//  Réponses par coordonnée (un nombre), pour rester sans ambiguïté.
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';

const SVGNS = 'http://www.w3.org/2000/svg';
// Mini-repère SVG montrant M et son image M'
function reperePoints(host, pts) {
  const W = 280, H = 280, c = W / 2, u = 22; // origine au centre, 22px/unité
  const X = (x) => c + x * u, Y = (y) => c - y * u;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'svg-plot');
  const el = (tag, a) => { const e = document.createElementNS(SVGNS, tag); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
  for (let i = -6; i <= 6; i++) { el('line', { x1: X(i), y1: 0, x2: X(i), y2: H, stroke: '#eee' }); el('line', { x1: 0, y1: Y(i), x2: W, y2: Y(i), stroke: '#eee' }); }
  el('line', { x1: 0, y1: c, x2: W, y2: c, stroke: '#888', 'stroke-width': 1.5 });
  el('line', { x1: c, y1: 0, x2: c, y2: H, stroke: '#888', 'stroke-width': 1.5 });
  for (const p of pts) {
    el('circle', { cx: X(p.x), cy: Y(p.y), r: 5, fill: p.color || '#8a6fb0' });
    const t = el('text', { x: X(p.x) + 7, y: Y(p.y) - 7, fill: '#412f5b', 'font-size': 13, 'font-weight': 700 }); t.textContent = p.name;
  }
  host.appendChild(svg);
}

export default {
  id: 'c12',
  titre: 'Transformations du plan',
  theme: 'geometrie',
  priorite: false,
  icone: '🔄',

  intro:
    "Translations, symétries et rotations transforment une figure sans la déformer : elles conservent les " +
    "longueurs et les angles. On les retrouve dans les pavages, les frises, les logos et les jeux vidéo.",

  cours: [
    { type: 'definition', titre: 'Translation', contenu: "Glisser une figure selon un vecteur. Le point $M(x;y)$ translaté du vecteur $(a;b)$ devient $M'(x+a\\,;y+b)$." },
    { type: 'definition', titre: 'Symétrie centrale', contenu: "Demi-tour autour d'un centre. Par rapport à l'origine $O$, $M(x;y)$ a pour image $M'(-x\\,;-y)$." },
    { type: 'definition', titre: 'Symétrie axiale', contenu: "Pliage le long d'un axe. Par rapport à l'axe des abscisses : $M(x;y) \\mapsto M'(x\\,;-y)$. Par rapport à l'axe des ordonnées : $M(x;y)\\mapsto M'(-x\\,;y)$." },
    { type: 'propriete', titre: 'Rotation (quart de tour)', contenu: "Rotation de centre $O$ et d'angle $+90°$ : $M(x;y) \\mapsto M'(-y\\,;x)$." },
    {
      type: 'figure', titre: 'Symétrie centrale',
      contenu: "$M'$ est le symétrique de $M$ par rapport à l'origine : mêmes distances, sens opposé.",
      render: (host) => reperePoints(host, [{ x: 3, y: 2, name: 'M' }, { x: -3, y: -2, name: "M'", color: '#c0894a' }]),
    },
  ],

  methode: [
    { etape: 1, titre: 'Identifier la transformation', explication: "Translation (vecteur), symétrie (axe ou centre) ou rotation (centre + angle) ?" },
    { etape: 2, titre: 'Appliquer la règle sur les coordonnées', explication: "Utilise la formule correspondante pour transformer $(x;y)$." },
    { etape: 3, titre: 'Vérifier', explication: "Les longueurs et les angles sont conservés : la figure image est superposable à la figure de départ." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Translation — donne l\'ABSCISSE de l\'image :',
      generer() {
        const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5), a = randIntNonZero(-4, 4), b = randIntNonZero(-4, 4);
        return { enonce: `$M(${x}\\,;${y})$ est translaté du vecteur $\\vec u(${a}\\,;${b})$. Quelle est l'abscisse de $M'$ ?`, reponse: x + a, validation: 'nombre' };
      },
      indices: ['On ajoute le vecteur aux coordonnées.', "L'abscisse de $M'$ est $x + a$.", 'Attention aux signes.'],
      correction_detaillee: () => `<p>$M'(x+a\\,;y+b)$ : l'abscisse est $x+a$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Symétrie centrale (origine) — donne l\'ORDONNÉE de l\'image :',
      generer() {
        const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5);
        return { enonce: `$M(${x}\\,;${y})$. Quelle est l'ordonnée de son symétrique par rapport à $O$ ?`, reponse: -y, validation: 'nombre' };
      },
      indices: ['La symétrie centrale change les deux signes.', "$M'(-x\\,;-y)$.", "L'ordonnée devient $-y$."],
      correction_detaillee: () => `<p>Par symétrie de centre $O$ : $M'(-x\\,;-y)$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Symétrie axiale (axe des abscisses) — donne l\'ORDONNÉE :',
      generer() {
        const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5);
        return { enonce: `$M(${x}\\,;${y})$. Symétrique par rapport à l'axe des abscisses : quelle est son ordonnée ?`, reponse: -y, validation: 'nombre' };
      },
      indices: ['La symétrie par rapport à l\'axe des $x$ garde l\'abscisse.', 'Elle change le signe de l\'ordonnée.', "$M'(x\\,;-y)$."],
      correction_detaillee: () => `<p>Par rapport à l'axe des abscisses : $M'(x\\,;-y)$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Quelle transformation ?',
      generer() {
        const cases = [
          { e: 'qui conserve les longueurs et fait glisser la figure sans la tourner', good: 'translation' },
          { e: "qui fait faire un demi-tour à la figure autour d'un point", good: 'symétrie centrale' },
          { e: 'qui agit comme un pliage le long d\'une droite', good: 'symétrie axiale' },
        ];
        const ch = pick(cases);
        const choix = ['translation', 'symétrie centrale', 'symétrie axiale'];
        return { enonce: `Quelle est la transformation ${ch.e} ?`, choix, correct: choix.indexOf(ch.good) };
      },
      indices: ['Translation = glissement.', 'Symétrie centrale = demi-tour.', 'Symétrie axiale = pliage.'],
      correction_detaillee: () => `<p>Chaque transformation a sa « signature » : glissement, demi-tour ou pliage.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Rotation +90° (centre O) — donne l\'ABSCISSE de l\'image :',
      generer() {
        const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5);
        return { enonce: `$M(${x}\\,;${y})$. Image par la rotation de centre $O$, d'angle $+90°$ : quelle est son abscisse ?`, reponse: -y, validation: 'nombre' };
      },
      indices: ["Quart de tour direct : $M(x;y) \\mapsto M'(-y;x)$.", "L'abscisse de l'image vaut $-y$.", 'Pense au sens trigonométrique (anti-horaire).'],
      correction_detaillee: () => `<p>Rotation de $+90°$ autour de $O$ : $M'(-y\\,;x)$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux :',
      generer() {
        const props = [
          { e: 'Une translation conserve les longueurs.', r: true },
          { e: 'Une symétrie axiale agrandit la figure.', r: false },
          { e: 'Une rotation conserve les angles.', r: true },
          { e: 'Une symétrie centrale change la taille de la figure.', r: false },
        ];
        const p = pick(props);
        return { enonce: p.e, reponse: p.r };
      },
      indices: ['Ces transformations sont des « isométries ».', 'Isométrie = conserve les distances.', 'La figure image est superposable à l\'originale.'],
      correction_detaillee: () => `<p>Translations, symétries et rotations conservent longueurs et angles : ce sont des isométries.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: "$M(2;5)$ translaté du vecteur $(3;-1)$ : abscisse de $M'$ ?", reponse: 5, validation: 'nombre', explication: '$2 + 3 = 5$.' },
    { type: 'saisie', question: 'Symétrique de $M(4;-3)$ par rapport à $O$ : son ordonnée ?', reponse: 3, validation: 'nombre', explication: "$M'(-x;-y) \\Rightarrow$ ordonnée $= -(-3) = 3$." },
    { type: 'qcm', question: "Une transformation qui conserve les longueurs s'appelle :", choix: ['une isométrie', 'une homothétie', 'une projection', 'une dilatation'], correct: 0, explication: 'Translation, symétrie et rotation sont des isométries.' },
    { type: 'vrai_faux', question: "La symétrie par rapport à l'axe des ordonnées change le signe de l'abscisse.", reponse: true, explication: "$M(x;y)\\mapsto M'(-x;y)$." },
    { type: 'saisie', question: "Symétrique de $M(-2;6)$ par rapport à l'axe des abscisses : son ordonnée ?", reponse: -6, validation: 'nombre', explication: "$M'(x;-y) \\Rightarrow$ ordonnée $= -6$." },
  ],
};
