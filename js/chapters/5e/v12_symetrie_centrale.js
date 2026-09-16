// =====================================================================
//  v12_symetrie_centrale.js — 5ᵉ : symétrie centrale (demi-tour) —
//  image d'un point, propriétés de conservation, centre de symétrie
//  d'une figure, symétrique dans un repère.
//  Figure interactive : un point et son symétrique par rapport à O.
// =====================================================================

import { randInt, randIntNonZero, pick } from '../../engine.js';
import { svg, seg, point, repere, poly, txt } from '../commun.js';

/** Repère avec des points [{x, y, nom, c}] et, en option, des traits pointillés. */
function figRepere(points, { traits = [], lim = 5, W = 280 } = {}) {
  const R = repere({ xmin: -lim, xmax: lim, ymin: -lim, ymax: lim, W });
  const P = (p) => [R.X(p.x), R.Y(p.y)];
  let s = R.fond;
  traits.forEach(([a, b]) => { s += seg(P(a), P(b), { c: 'var(--muted)', w: 1.4, dash: true }); });
  points.forEach((p) => { s += point(P(p), p.nom, 12, -6, p.c || 'var(--accent-ink)'); });
  return svg(R.W, R.H, s, 'points dans un repère');
}

function symetrieInteractive(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>x de M <input type="range" min="-5" max="5" value="3" data-x> <span class="fig-val" data-xv></span></label>
      <label>y de M <input type="range" min="-5" max="5" value="2" data-y> <span class="fig-val" data-yv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const x = +wrap.querySelector('[data-x]').value, y = +wrap.querySelector('[data-y]').value;
    wrap.querySelector('[data-xv]').textContent = x; wrap.querySelector('[data-yv]').textContent = y;
    wrap.querySelector('[data-svg]').innerHTML = figRepere(
      [{ x, y, nom: 'M' }, { x: -x, y: -y, nom: "M'", c: 'var(--t-geometrie)' }, { x: 0, y: 0, nom: 'O', c: 'var(--muted)' }],
      { traits: [[{ x, y }, { x: -x, y: -y }]] },
    );
    wrap.querySelector('[data-out]').innerHTML = `M(${x} ; ${y}) &nbsp;→&nbsp; M'(<strong>${-x}</strong> ; <strong>${-y}</strong>) : O est le milieu de [MM'].`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

/** Une figure et son image par la symétrie de centre O (illustration du cours). */
function figDemiTour(host) {
  const R = repere({ xmin: -5, xmax: 5, ymin: -4, ymax: 4, W: 300 });
  const P = ([x, y]) => [R.X(x), R.Y(y)];
  const F = [[1, 1], [4, 1], [4, 3], [1, 3]];
  let s = R.fond + poly(F.map(P), { c: 'var(--accent)', fill: 'var(--accent-soft)' });
  s += poly(F.map(([x, y]) => P([-x, -y])), { c: 'var(--t-geometrie)', fill: 'color-mix(in srgb, var(--t-geometrie) 18%, var(--surface))' });
  s += seg(P(F[0]), P([-F[0][0], -F[0][1]]), { c: 'var(--muted)', w: 1.2, dash: true });
  s += point(P([0, 0]), 'O', -10, 14, 'var(--muted)');
  s += txt(R.X(2.5), R.Y(2) + 4, 'F', { c: 'var(--accent-ink)' }) + txt(R.X(-2.5), R.Y(-2) + 4, "F'", { c: 'var(--t-geometrie)' });
  host.innerHTML = svg(R.W, R.H, s, 'figure et son image par la symétrie de centre O');
}

const coord = (x, y) => `(${x}\\,;\\,${y})`;

export default {
  id: 'v12',
  titre: 'Symétrie centrale',
  theme: 'geometrie', niveau: '5e',
  icone: '🔄',

  intro:
    "La symétrie centrale, c'est un <strong>demi-tour</strong> autour d'un point : la figure obtenue est « à l'envers », " +
    "comme une carte à jouer ou le motif d'un papier peint. On la retrouve dans les pavages, les frises et les " +
    "rosaces. Ses propriétés (conservation des longueurs, des angles, des aires) servent à justifier des calculs " +
    "en géométrie, et on la revoit en 4ᵉ comme rotation d'angle 180°.",

  cours: [
    {
      type: 'definition', titre: "Symétrique d'un point",
      contenu: "Le symétrique du point $M$ par rapport au point $O$ est le point $M'$ tel que $O$ soit le <strong>milieu</strong> du segment $[MM']$. On dit aussi que $M'$ est l'image de $M$ par la symétrie de centre $O$. Le symétrique de $O$ est $O$ lui-même.",
    },
    {
      type: 'propriete', titre: 'Ce que la symétrie centrale conserve',
      contenu: "La symétrie centrale conserve les <strong>longueurs</strong>, les <strong>angles</strong>, les <strong>aires</strong>, l'alignement et les milieux. L'image d'une droite est une droite qui lui est <strong>parallèle</strong> ; l'image d'un segment est un segment de même longueur ; l'image d'un cercle est un cercle de même rayon.",
    },
    {
      type: 'definition', titre: "Centre de symétrie d'une figure",
      contenu: "Une figure a un <strong>centre de symétrie</strong> $O$ si son image par la symétrie de centre $O$ est la figure elle-même. Exemples : le parallélogramme (centre = intersection des diagonales), le cercle, le rectangle, le losange, le carré. Le triangle équilatéral, lui, n'a <strong>pas</strong> de centre de symétrie.",
    },
    {
      type: 'propriete', titre: 'Dans un repère',
      contenu: "Le symétrique de $M(x\\,;\\,y)$ par rapport à l'<strong>origine</strong> $O$ est $M'(-x\\,;\\,-y)$. Par rapport à un point $A(a\\,;\\,b)$, comme $A$ est le milieu de $[MM']$, on obtient $M'(2a - x\\,;\\,2b - y)$.",
      formule: "M(x\\,;\\,y) \\;\\longrightarrow\\; M'(-x\\,;\\,-y)",
    },
    { type: 'figure', titre: 'Un point et son symétrique', contenu: "Déplace $M$ : le point $M'$ est toujours « de l'autre côté » de $O$, à la même distance.", render: (host) => symetrieInteractive(host) },
    { type: 'figure', titre: 'Une figure et son image', contenu: "La figure $F'$ est l'image de $F$ par la symétrie de centre $O$ : elle est identique, mais retournée d'un demi-tour.", render: (host) => figDemiTour(host) },
    {
      type: 'exemple', enonce: 'Construire le symétrique du point $M$ par rapport au point $O$.',
      solution_etapes: [
        "On trace la demi-droite $[MO)$ et on la prolonge au-delà de $O$.",
        "On prend au compas la longueur $OM$ et on la reporte à partir de $O$, de l'autre côté.",
        "Le point obtenu est $M'$ : $O$ est bien le milieu de $[MM']$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Tracer la demi-droite', explication: "Le point, le centre et l'image sont toujours <strong>alignés</strong> : trace $[MO)$ et prolonge." },
    { etape: 2, titre: 'Reporter la longueur', explication: "$OM' = OM$ : on reporte la même longueur de l'autre côté de $O$." },
    { etape: 3, titre: 'Utiliser les conservations', explication: "Une longueur, un angle ou une aire de l'image est égal à celui de la figure de départ." },
    { etape: 4, titre: 'Dans un repère', explication: "Par rapport à l'origine : on change le signe des deux coordonnées." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'qcm', consigne: 'Choisis la bonne définition :',
      generer() {
        return {
          enonce: "$M'$ est le symétrique de $M$ par rapport au point $O$. Cela signifie que :",
          choix: ["$O$ est le milieu de $[MM']$", "$M$ est le milieu de $[OM']$", "$(MM')$ est perpendiculaire à $(OM)$", "$OM' = 2 \\times OM$"],
          correct: 0,
        };
      },
      indices: ['La symétrie centrale est un demi-tour autour de $O$.', "$M$, $O$ et $M'$ sont alignés.", "$O$ est à égale distance de $M$ et de $M'$."],
      correction_etapes: () => [
        "Par définition, $M'$ est le symétrique de $M$ par rapport à $O$ lorsque $O$ est le <strong>milieu</strong> de $[MM']$.",
        "Autrement dit : $M$, $O$ et $M'$ sont alignés et $OM = OM'$.",
      ],
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: "Donne les coordonnées du symétrique par rapport à l'origine :",
      generer() {
        const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5);
        return {
          enonce_complete: `$M${coord(x, y)}$ a pour symétrique par rapport à l'origine $O$ le point $M'($ {0} $;$ {1} $)$`,
          champs: [{ reponse: -x, validation: 'nombre' }, { reponse: -y, validation: 'nombre' }],
          visuel: (h) => { h.innerHTML = figRepere([{ x, y, nom: 'M' }, { x: 0, y: 0, nom: 'O', c: 'var(--muted)' }]); },
          _v: { x, y },
        };
      },
      indices: ["$O$ doit être le milieu de $[MM']$.", 'On change le signe des deux coordonnées.', "$M(x\\,;\\,y) \\rightarrow M'(-x\\,;\\,-y)$."],
      correction_etapes: (st) => [
        "$O$ est le milieu de $[MM']$ : on change les signes des deux coordonnées.",
        `$M${coord(st._v.x, st._v.y)} \\rightarrow M'${coord(-st._v.x, -st._v.y)}$.`,
      ],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Utilise la conservation des longueurs (en cm) :',
      generer() {
        const L = randInt(2, 15) + pick([0, 0.5]), tex = String(L).replace('.', '{,}');
        const q = pick([
          `Le segment $[A'B']$ est l'image du segment $[AB]$ par une symétrie centrale. On sait que $AB = ${tex}$ cm. Combien mesure $A'B'$ ?`,
          `Le triangle $R'S'T'$ est l'image du triangle $RST$ par la symétrie de centre $O$. On sait que $RS = ${tex}$ cm. Combien mesure $R'S'$ ?`,
        ]);
        return { enonce: q, reponse: L, validation: 'nombre', _v: { L, tex } };
      },
      indices: ['Une symétrie centrale ne déforme pas la figure.', 'Elle conserve les longueurs.', "L'image mesure exactement la même chose."],
      correction_etapes: (st) => [
        'La symétrie centrale conserve les longueurs : la figure image est superposable à la figure de départ.',
        `La longueur cherchée est donc $${st._v.tex}$ cm.`,
      ],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: "Sur une droite graduée — calcule l'abscisse du symétrique :",
      generer() {
        let o, a; do { o = randInt(-6, 6); a = randInt(-9, 9); } while (a === o);
        return { enonce: `Sur une droite graduée, $A$ a pour abscisse $${a}$ et le point $C$ a pour abscisse $${o}$. Quelle est l'abscisse du symétrique $A'$ de $A$ par rapport à $C$ ?`, reponse: 2 * o - a, validation: 'nombre', _v: { o, a } };
      },
      indices: ["Le centre est le milieu de $[AA']$.", "Calcule d'abord le déplacement de $A$ jusqu'au centre.", "Reporte le même déplacement de l'autre côté du centre."],
      correction_etapes: (st) => {
        const { o, a } = st._v, d = o - a, p = (n) => (n < 0 ? `(${n})` : n);
        return [
          `Pour aller de $A$ au centre, on se déplace de $${o} - ${p(a)} = ${d}$.`,
          `On repart d'autant depuis le centre : $${o} + ${p(d)} = ${2 * o - a}$.`,
          `L'abscisse de $A'$ est $${2 * o - a}$.`,
        ];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'qcm', consigne: 'Cette figure a-t-elle un centre de symétrie ?',
      generer() {
        const [figure, oui, why] = pick([
          ['un parallélogramme', true, "Son centre de symétrie est le point d'intersection de ses diagonales."],
          ['un cercle', true, 'Son centre de symétrie est son centre.'],
          ['un rectangle', true, 'Ses diagonales se coupent en son centre de symétrie.'],
          ['un losange', true, 'Comme tout parallélogramme, il a un centre de symétrie.'],
          ['un triangle équilatéral', false, 'Il a trois axes de symétrie, mais aucun centre de symétrie.'],
          ['un triangle isocèle', false, "Il a un axe de symétrie, mais pas de centre de symétrie."],
          ['la lettre majuscule S', true, 'Un demi-tour la ramène sur elle-même.'],
          ['la lettre majuscule A', false, 'Un demi-tour la retourne : elle ne se superpose pas à elle-même.'],
        ]);
        return { enonce: `Est-ce que ${figure} possède un centre de symétrie ?`, choix: ['oui', 'non'], correct: oui ? 0 : 1, ordre_fixe: true, _v: { why } };
      },
      indices: ["Imagine la figure tournée d'un demi-tour.", 'Se superpose-t-elle exactement à elle-même ?', "Attention : un axe de symétrie n'est pas un centre de symétrie."],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e06', niveau: 2, type: 'complete', consigne: 'Symétrique par rapport à un point du repère :',
      generer() {
        const x = randInt(-4, 4), y = randInt(-4, 4), a = randInt(-2, 2), b = randInt(-2, 2);
        return {
          enonce_complete: `$A${coord(a, b)}$ est le milieu de $[MM']$ avec $M${coord(x, y)}$. Alors $M'($ {0} $;$ {1} $)$`,
          champs: [{ reponse: 2 * a - x, validation: 'nombre' }, { reponse: 2 * b - y, validation: 'nombre' }],
          visuel: (h) => { h.innerHTML = figRepere([{ x, y, nom: 'M' }, { x: a, y: b, nom: 'A', c: 'var(--t-geometrie)' }], { lim: 6 }); },
          _v: { x, y, a, b },
        };
      },
      indices: ["$A$ est le milieu de $[MM']$ : de $M$ à $A$, puis autant de $A$ à $M'$.", 'Regarde le déplacement horizontal, puis le déplacement vertical.', "Formule : $M'(2a - x\\,;\\,2b - y)$."],
      correction_etapes: (st) => {
        const { x, y, a, b } = st._v, p = (n) => (n < 0 ? `(${n})` : n);
        return [
          `De $M$ à $A$ : $${a} - ${p(x)} = ${a - x}$ horizontalement et $${b} - ${p(y)} = ${b - y}$ verticalement.`,
          `On repart d'autant depuis $A$ : $${a} + ${p(a - x)} = ${2 * a - x}$ et $${b} + ${p(b - y)} = ${2 * b - y}$.`,
          `$M'${coord(2 * a - x, 2 * b - y)}$.`,
        ];
      },
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Utilise les conservations :',
      generer() {
        const cas = pick(['angle', 'aire', 'perimetre']);
        if (cas === 'angle') { const m = randInt(20, 140); return { enonce: `Le triangle $A'B'C'$ est l'image du triangle $ABC$ par une symétrie centrale et $\\widehat{ABC} = ${m}°$. Combien mesure $\\widehat{A'B'C'}$ (en degrés) ?`, reponse: m, validation: 'nombre', _v: { cas, m } }; }
        if (cas === 'aire') { const A = randInt(5, 60); return { enonce: `Une figure a une aire de $${A}$ cm². Quelle est l'aire de son image par une symétrie de centre $O$ (en cm²) ?`, reponse: A, validation: 'nombre', _v: { cas, m: A } }; }
        const p = randInt(8, 40); return { enonce: `Un polygone a un périmètre de $${p}$ cm. Quel est le périmètre de son image par une symétrie centrale (en cm) ?`, reponse: p, validation: 'nombre', _v: { cas, m: p } };
      },
      indices: ['La symétrie centrale ne change ni la forme ni la taille.', 'Elle conserve les longueurs, les angles et les aires.', "La réponse est la même valeur que dans l'énoncé."],
      correction_etapes: (st) => [
        `La symétrie centrale conserve ${st._v.cas === 'angle' ? 'les angles' : st._v.cas === 'aire' ? 'les aires' : 'les longueurs, donc les périmètres'}.`,
        `La valeur ne change pas : $${st._v.m}$${st._v.cas === 'angle' ? '°' : ''}.`,
      ],
    },
    {
      id: 'e08', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const [e, r, why] = pick([
          ["L'image d'une droite par une symétrie centrale est une droite parallèle à la droite de départ.", true, "C'est une propriété : l'image d'une droite est une droite qui lui est parallèle."],
          ['Dans une symétrie de centre $O$, le point $O$ est son propre symétrique.', true, '$O$ ne bouge pas : il est le centre du demi-tour.'],
          ['Une symétrie centrale transforme un cercle en un cercle de même rayon.', true, 'Les longueurs sont conservées, donc le rayon aussi.'],
          ['Une symétrie centrale peut agrandir une figure.', false, 'Elle conserve les longueurs : la figure garde exactement la même taille.'],
          ["Le symétrique d'un point $M$ par rapport à $O$ est toujours du même côté de $O$ que $M$.", false, "$O$ est le milieu de $[MM']$ : les deux points sont de part et d'autre de $O$."],
          ['Un triangle équilatéral possède un centre de symétrie.', false, 'Il possède trois axes de symétrie mais aucun centre de symétrie.'],
        ]);
        return { enonce: e, reponse: r, _v: { why } };
      },
      indices: ['Repense au demi-tour autour du centre.', 'Fais un dessin rapide pour tester.', 'Distingue axe de symétrie et centre de symétrie.'],
      correction_etapes: (st) => [st._v.why, `L'affirmation est ${st.reponse ? 'vraie' : 'fausse'}.`],
    },
    {
      id: 'e09', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre la construction du symétrique :',
      generer() {
        return {
          etapes: [
            'Tracer la demi-droite $[MO)$ et la prolonger au-delà de $O$',
            'Prendre au compas la longueur $OM$',
            "Reporter cette longueur à partir de $O$, de l'autre côté",
            "Marquer le point obtenu : c'est $M'$, le symétrique de $M$ par rapport à $O$",
          ],
        };
      },
      indices: ["$M$, $O$ et $M'$ sont alignés : on trace d'abord la droite.", 'On reporte ensuite la distance $OM$.', 'On nomme le point à la fin.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: "Le symétrique de $M(3\\,;\\,-2)$ par rapport à l'origine est :", choix: ['(-3\\,;\\,2)', '(3\\,;\\,2)', '(-3\\,;\\,-2)', '(2\\,;\\,-3)'], correct: 0, explication: 'On change le signe des deux coordonnées.' },
    { type: 'vrai_faux', question: 'Une symétrie centrale conserve les aires.', reponse: true, explication: 'La figure image est superposable : même aire.' },
    {
      type: 'saisie', question: 'Symétrique sur une droite graduée.',
      generer() { const a = randInt(-8, 8), o = randInt(-4, 4); return { question: `$A$ a pour abscisse $${a}$, le centre $C$ a pour abscisse $${o}$. Quelle est l'abscisse de $A'$ ?`, reponse: 2 * o - a, validation: 'nombre', explication: `$2 \\times ${o < 0 ? `(${o})` : o} - ${a < 0 ? `(${a})` : a} = ${2 * o - a}$.` }; },
    },
    { type: 'qcm', question: "Quelle figure n'a PAS de centre de symétrie ?", choix: ['le triangle équilatéral', 'le carré', 'le parallélogramme', 'le cercle'], correct: 0, explication: 'Le triangle équilatéral a des axes de symétrie, mais pas de centre.' },
    { type: 'vrai_faux', question: "L'image d'une droite par une symétrie centrale est une droite parallèle.", reponse: true, explication: 'C\'est une propriété de la symétrie centrale.' },
  ],
};
