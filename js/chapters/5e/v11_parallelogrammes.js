// =====================================================================
//  v11_parallelogrammes.js — 5ᵉ : parallélogramme (définition,
//  propriétés des côtés, des diagonales, des angles), reconnaître un
//  parallélogramme, parallélogrammes particuliers (rectangle, losange,
//  carré). Figure interactive : parallélogramme déformable.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, svg, poly, seg, point, codage, arcAngle, milieu } from '../commun.js';

/** Parallélogramme ABCD : AB horizontal de longueur L, AD de longueur l et d'angle a (en px/°). */
function figPara({ L = 170, l = 95, a = 65, diag = false, labels = {}, codes = false } = {}) {
  const r = (a * Math.PI) / 180, dx = l * Math.cos(r), dy = l * Math.sin(r);
  const W = 320, H = 200, x0 = Math.min(0, dx), x1 = Math.max(L, L + dx);
  const ox = (W - (x1 - x0)) / 2 - x0, oy = (H + dy) / 2 + 6;
  const A = [ox, oy], B = [ox + L, oy], C = [ox + L + dx, oy - dy], D = [ox + dx, oy - dy];
  let s = poly([A, B, C, D], { fill: 'var(--accent-soft)', c: 'var(--accent)' });
  if (diag) { s += seg(A, C, { c: 'var(--t-geometrie)', w: 1.6, dash: true }) + seg(B, D, { c: 'var(--t-geometrie)', w: 1.6, dash: true }); s += point(milieu(A, C), 'O', 0, 20, 'var(--t-geometrie)'); }
  if (codes) s += codage(A, B, 1) + codage(D, C, 1) + codage(A, D, 2) + codage(B, C, 2);
  const lab = (P, Q, t, dxl = 0, dyl = 0) => (t === undefined ? '' : `<text x="${(P[0] + Q[0]) / 2 + dxl}" y="${(P[1] + Q[1]) / 2 + dyl}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent-ink)">${t}</text>`);
  s += lab(A, B, labels.AB, 0, 18) + lab(D, C, labels.DC, 0, -8) + lab(A, D, labels.AD, -16, 0) + lab(B, C, labels.BC, 18, 0);
  if (labels.A) s += arcAngle(A, 0, a, 20, labels.A, { decal: 14, size: 12 });
  if (labels.B) s += arcAngle(B, a, 180, 20, labels.B, { decal: 14, size: 12 });
  if (labels.C) s += arcAngle(C, 180, 180 + a, 20, labels.C, { decal: 14, size: 12 });
  if (labels.D) s += arcAngle(D, 180 + a, 360, 20, labels.D, { decal: 14, size: 12 });
  s += point(A, 'A', -10, 14, 'var(--text)') + point(B, 'B', 8, 14, 'var(--text)') + point(C, 'C', 10, -4, 'var(--text)') + point(D, 'D', -10, -4, 'var(--text)');
  return svg(W, H, s, 'parallélogramme ABCD', 'fig-chap');
}

function paraInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>angle Â <input type="range" min="40" max="140" step="5" value="65" data-a> <span class="fig-val" data-av></span></label>
      <label>côté AD <input type="range" min="50" max="170" step="10" value="100" data-l> <span class="fig-val" data-lv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, l = +wrap.querySelector('[data-l]').value;
    wrap.querySelector('[data-av]').textContent = `${a}°`; wrap.querySelector('[data-lv]').textContent = l / 10;
    wrap.querySelector('[data-svg]').innerHTML = figPara({ L: 170, l, a, diag: true, labels: { A: `${a}°`, C: `${a}°`, B: `${180 - a}°`, D: `${180 - a}°` } });
    const nom = a === 90 && l === 170 ? 'un carré' : a === 90 ? 'un rectangle' : l === 170 ? 'un losange' : 'un parallélogramme quelconque';
    wrap.querySelector('[data-out]').innerHTML = `Angles opposés égaux (${a}°), angles consécutifs supplémentaires (${a}° + ${180 - a}° = 180°), diagonales de même milieu O. Ici : <strong>${nom}</strong>.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v11',
  titre: 'Parallélogrammes',
  theme: 'geometrie', niveau: '5e',
  icone: '▱',

  intro:
    "Le parallélogramme est partout : carreaux, pantographes, bras articulés des lampes de bureau… Ses propriétés " +
    "(côtés opposés égaux, diagonales qui se coupent en leur milieu) permettent de <strong>calculer</strong> des longueurs " +
    "et des angles, et de <strong>démontrer</strong> la nature d'un quadrilatère. Rectangle, losange et carré sont des parallélogrammes particuliers.",

  cours: [
    {
      type: 'definition', titre: 'Parallélogramme',
      contenu: "Un parallélogramme est un quadrilatère dont les côtés opposés sont <strong>parallèles deux à deux</strong> : dans $ABCD$, $(AB) \\parallel (DC)$ et $(AD) \\parallel (BC)$.",
    },
    {
      type: 'propriete', titre: 'Propriétés du parallélogramme',
      contenu: "Si $ABCD$ est un parallélogramme, alors : ses <strong>côtés opposés ont la même longueur</strong> ($AB = DC$, $AD = BC$) ; ses <strong>diagonales se coupent en leur milieu</strong> ; ses <strong>angles opposés sont égaux</strong> ; deux angles consécutifs sont supplémentaires. Le point d'intersection des diagonales est son centre de symétrie.",
    },
    {
      type: 'propriete', titre: 'Reconnaître un parallélogramme',
      contenu: "Un quadrilatère (non croisé) est un parallélogramme si l'une de ces conditions est vraie : ses côtés opposés sont parallèles deux à deux ; ses diagonales ont le même milieu ; ses côtés opposés ont la même longueur deux à deux ; deux côtés opposés sont parallèles et de même longueur.",
    },
    {
      type: 'propriete', titre: 'Parallélogrammes particuliers',
      contenu: "Un <strong>rectangle</strong> est un parallélogramme qui a un angle droit ; ses diagonales ont la même longueur. Un <strong>losange</strong> est un parallélogramme qui a deux côtés consécutifs égaux ; ses diagonales sont perpendiculaires. Un <strong>carré</strong> est à la fois un rectangle et un losange.",
    },
    { type: 'figure', titre: 'Un parallélogramme déformable', contenu: "Modifie l'angle et la longueur $AD$ ($AB$ mesure $17$) : observe ce qui ne change jamais.", render: (host) => paraInteractif(host) },
    {
      type: 'exemple', enonce: '$ABCD$ est un parallélogramme de centre $O$ avec $AB = 7$ cm, $AC = 10$ cm et $\\widehat{DAB} = 70°$. Calculer $CD$, $OA$ et $\\widehat{ABC}$.',
      solution_etapes: ["Côtés opposés de même longueur : $CD = AB = 7$ cm.", "Les diagonales se coupent en leur milieu $O$ : $OA = AC \\div 2 = 5$ cm.", "Deux angles consécutifs sont supplémentaires : $\\widehat{ABC} = 180° - 70° = 110°$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Coder la figure', explication: "Reporte sur un croquis les longueurs égales, les milieux, les angles connus." },
    { etape: 2, titre: 'Choisir la propriété', explication: "Longueur d'un côté → côtés opposés ; longueur sur une diagonale → milieu ; angle → opposés égaux ou consécutifs supplémentaires." },
    { etape: 3, titre: 'Rédiger', explication: "« $ABCD$ est un parallélogramme, donc ses côtés opposés ont la même longueur : $CD = AB$. »" },
    { etape: 4, titre: 'Pour la nature', explication: "Parallélogramme + angle droit ⇒ rectangle ; + côtés consécutifs égaux ⇒ losange ; les deux ⇒ carré." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Utilise les propriétés du parallélogramme (en cm) :',
      generer() {
        const L = randInt(4, 15), l = randInt(3, 10), q = pick(['DC', 'BC']);
        return { enonce: `$ABCD$ est un parallélogramme avec $AB = ${L}$ cm et $AD = ${l}$ cm. Quelle est la longueur $${q}$ ?`, reponse: q === 'DC' ? L : l, validation: 'nombre', _v: { L, l, q }, visuel: (h) => { h.innerHTML = figPara({ labels: { AB: `${L} cm`, AD: `${l} cm`, [q]: '?' } }); } };
      },
      indices: ['Repère le côté opposé à celui qu\'on cherche.', 'Dans un parallélogramme, les côtés opposés ont la même longueur.', `$[DC]$ est opposé à $[AB]$ ; $[BC]$ est opposé à $[AD]$.`],
      correction_etapes: (st) => [`$[${st._v.q}]$ est opposé à $[${st._v.q === 'DC' ? 'AB' : 'AD'}]$.`, `Les côtés opposés d'un parallélogramme ont la même longueur : $${st._v.q} = ${st._v.q === 'DC' ? st._v.L : st._v.l}$ cm.`],
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète avec les diagonales (en cm) :',
      generer() {
        const d1 = 2 * randInt(3, 9) + pick([0, 1]), d2 = 2 * randInt(2, 8);
        return {
          enonce_complete: `$ABCD$ est un parallélogramme de centre $O$, $AC = ${d1}$ cm et $BD = ${d2}$ cm. Alors $OA = $ {0} cm et $OD = $ {1} cm.`,
          champs: [{ reponse: d1 / 2, validation: 'nombre' }, { reponse: d2 / 2, validation: 'nombre' }], _v: { d1, d2 },
          visuel: (h) => { h.innerHTML = figPara({ diag: true }); },
        };
      },
      indices: ['Les diagonales d\'un parallélogramme se coupent en leur milieu.', '$O$ est le milieu de $[AC]$ et de $[BD]$.', 'Divise chaque diagonale par 2.'],
      correction_etapes: (st) => [`$O$ est le milieu de $[AC]$ : $OA = ${st._v.d1} \\div 2 = ${tex(st._v.d1 / 2)}$ cm.`, `$O$ est le milieu de $[BD]$ : $OD = ${st._v.d2} \\div 2 = ${st._v.d2 / 2}$ cm.`],
    },
    {
      id: 'e03', niveau: 1, type: 'qcm', consigne: 'Choisis la propriété vraie pour TOUT parallélogramme :',
      generer() {
        const bon = pick(['ses diagonales se coupent en leur milieu', 'ses côtés opposés ont la même longueur', 'ses angles opposés sont égaux']);
        return { enonce: 'Dans tout parallélogramme :', choix: [bon, 'ses diagonales sont perpendiculaires', 'ses diagonales ont la même longueur', 'ses quatre côtés sont égaux'], correct: 0, _v: { bon } };
      },
      indices: ['Pense à un parallélogramme « penché » (ni rectangle, ni losange).', 'Diagonales perpendiculaires : seulement le losange (et le carré).', 'Diagonales de même longueur : seulement le rectangle (et le carré).'],
      correction_etapes: (st) => [`Dans tout parallélogramme, ${st._v.bon}.`, 'Les autres propriétés ne sont vraies que pour des parallélogrammes particuliers (losange, rectangle, carré).'],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule l\'angle (en degrés) :',
      generer() {
        const a = randInt(40, 140), q = pick(['C', 'B', 'D']), rep = q === 'C' ? a : 180 - a;
        return { enonce: `$ABCD$ est un parallélogramme et $\\widehat{DAB} = ${a}°$. Calcule $\\widehat{${q === 'C' ? 'BCD' : q === 'B' ? 'ABC' : 'CDA'}}$.`, reponse: rep, validation: 'nombre', _v: { a, q, rep }, visuel: (h) => { h.innerHTML = figPara({ a, labels: { A: `${a}°`, [q]: '?' } }); } };
      },
      indices: ['Angles opposés ($A$ et $C$, $B$ et $D$) : égaux.', 'Angles consécutifs ($A$ et $B$ par exemple) : supplémentaires.', 'Supplémentaires : leur somme vaut $180°$.'],
      correction_etapes: (st) => (st._v.q === 'C' ? [`$\\widehat{BCD}$ est opposé à $\\widehat{DAB}$.`, `Dans un parallélogramme, les angles opposés sont égaux : $${st._v.a}°$.`] : [`L'angle cherché est consécutif à $\\widehat{DAB}$ : ils sont supplémentaires.`, `$180 - ${st._v.a} = ${180 - st._v.a}°$.`]),
    },
    {
      id: 'e05', niveau: 2, type: 'qcm', consigne: 'Quelle est la nature du quadrilatère ?',
      generer() {
        const [desc, bon, why] = pick([
          ['un parallélogramme qui a un angle droit', 'un rectangle', 'Un parallélogramme avec un angle droit est un rectangle.'],
          ['un parallélogramme dont deux côtés consécutifs ont la même longueur', 'un losange', 'Un parallélogramme avec deux côtés consécutifs égaux est un losange.'],
          ['un parallélogramme dont les diagonales sont perpendiculaires', 'un losange', 'Diagonales perpendiculaires : c\'est un losange.'],
          ['un parallélogramme dont les diagonales ont la même longueur', 'un rectangle', 'Diagonales de même longueur : c\'est un rectangle.'],
          ['un parallélogramme dont les diagonales sont perpendiculaires et de même longueur', 'un carré', 'Rectangle et losange à la fois : c\'est un carré.'],
          ['un quadrilatère dont les diagonales ont le même milieu', 'un parallélogramme', 'Diagonales de même milieu : c\'est un parallélogramme (on ne peut rien dire de plus).'],
        ]);
        return { enonce: `$EFGH$ est ${desc}. C'est :`, choix: ['un parallélogramme', 'un rectangle', 'un losange', 'un carré'], correct: ['un parallélogramme', 'un rectangle', 'un losange', 'un carré'].indexOf(bon), ordre_fixe: true, _v: { why } };
      },
      indices: ['Rectangle : angle droit ou diagonales de même longueur.', 'Losange : côtés consécutifs égaux ou diagonales perpendiculaires.', 'Carré : rectangle ET losange.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Calcule le périmètre (en cm) :',
      generer() { const L = randInt(4, 15), l = randInt(2, 12); return { enonce: `$ABCD$ est un parallélogramme avec $AB = ${L}$ cm et $BC = ${l}$ cm. Calcule son périmètre.`, reponse: 2 * (L + l), validation: 'nombre', _v: { L, l } }; },
      indices: ['Les côtés opposés ont la même longueur.', 'Il y a deux côtés de chaque longueur.', 'Périmètre $= 2 \\times (AB + BC)$.'],
      correction_etapes: (st) => [`$CD = AB = ${st._v.L}$ cm et $DA = BC = ${st._v.l}$ cm.`, `$P = ${st._v.L} + ${st._v.l} + ${st._v.L} + ${st._v.l} = ${2 * (st._v.L + st._v.l)}$ cm.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Problème — retrouve la longueur (en cm) :',
      generer() {
        if (Math.random() < 0.5) { const L = randInt(4, 14), l = randInt(2, 10); return { enonce: `Un parallélogramme a un périmètre de $${2 * (L + l)}$ cm et un côté de $${L}$ cm. Quelle est la longueur de l'autre côté ?`, reponse: l, validation: 'nombre', _v: { L, l, cas: 'P' } }; }
        const c = randInt(3, 12); return { enonce: `Un losange a un périmètre de $${4 * c}$ cm. Quelle est la longueur de son côté ?`, reponse: c, validation: 'nombre', _v: { c, cas: 'L' } };
      },
      indices: ['Écris le périmètre avec les longueurs des côtés.', 'Parallélogramme : $P = 2 \\times (a + b)$ ; losange : 4 côtés égaux.', 'Divise, puis soustrais si besoin.'],
      correction_etapes: (st) => (st._v.cas === 'P' ? [`$P = 2 \\times (a + b)$ donc $a + b = ${2 * (st._v.L + st._v.l)} \\div 2 = ${st._v.L + st._v.l}$ cm.`, `L'autre côté mesure $${st._v.L + st._v.l} - ${st._v.L} = ${st._v.l}$ cm.`] : [`Un losange a 4 côtés de même longueur.`, `Côté $= ${4 * st._v.c} \\div 4 = ${st._v.c}$ cm.`]),
    },
    {
      id: 'e08', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const [e, r, why] = pick([
          ['Un carré est un losange.', true, 'Un carré a ses 4 côtés égaux : c\'est un losange (particulier).'],
          ['Un losange est toujours un carré.', false, 'Un losange n\'a pas forcément d\'angle droit.'],
          ['Un rectangle est un parallélogramme.', true, 'Ses côtés opposés sont parallèles.'],
          ['Si les diagonales d\'un quadrilatère ont la même longueur, c\'est un rectangle.', false, 'Il faut aussi qu\'elles aient le même milieu (un trapèze isocèle a des diagonales égales).'],
          ['Si un quadrilatère a ses diagonales qui se coupent en leur milieu, c\'est un parallélogramme.', true, 'C\'est une propriété caractéristique du parallélogramme.'],
          ['Dans un parallélogramme, deux angles consécutifs sont égaux.', false, 'Ils sont supplémentaires (somme $180°$), pas égaux en général.'],
        ]);
        return { enonce: e, reponse: r, _v: { why } };
      },
      indices: ['Pense à un contre-exemple dessiné.', 'Carré ⊂ rectangle ⊂ parallélogramme et carré ⊂ losange ⊂ parallélogramme.', 'Relis précisément les propriétés du cours.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e09', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets la démonstration dans l\'ordre :',
      generer() {
        return { etapes: ['$O$ est le milieu de $[AC]$ et le milieu de $[BD]$.', 'Les diagonales $[AC]$ et $[BD]$ du quadrilatère $ABCD$ ont donc le même milieu.', 'Or, un quadrilatère dont les diagonales ont le même milieu est un parallélogramme.', 'Donc $ABCD$ est un parallélogramme.'] };
      },
      indices: ['On commence par les informations de l\'énoncé.', 'On cite ensuite la propriété.', 'On conclut par « donc ».'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Les diagonales d\'un parallélogramme :', choix: ['se coupent en leur milieu', 'sont toujours perpendiculaires', 'ont toujours la même longueur', 'sont parallèles'], correct: 0, explication: 'Elles se coupent en leur milieu (le centre de symétrie).' },
    {
      type: 'saisie', question: 'Angle.',
      generer() { const a = randInt(50, 130); return { question: `$ABCD$ parallélogramme, $\\widehat{A} = ${a}°$. Combien mesure $\\widehat{B}$ ?`, reponse: 180 - a, validation: 'nombre', explication: `Angles consécutifs supplémentaires : $180 - ${a} = ${180 - a}°$.` }; },
    },
    { type: 'vrai_faux', question: 'Un parallélogramme qui a un angle droit est un rectangle.', reponse: true, explication: 'C\'est la définition « parallélogramme + angle droit ».' },
    {
      type: 'saisie', question: 'Diagonale.',
      generer() { const d = 2 * randInt(3, 10); return { question: `$ABCD$ parallélogramme de centre $O$, $BD = ${d}$ cm. Combien mesure $OB$ ?`, reponse: d / 2, validation: 'nombre', explication: `$O$ milieu de $[BD]$ : $${d / 2}$ cm.` }; },
    },
    { type: 'qcm', question: 'Un losange a toujours :', choix: ['des diagonales perpendiculaires', 'un angle droit', 'des diagonales de même longueur', 'des côtés de longueurs différentes'], correct: 0, explication: 'Les diagonales d\'un losange sont perpendiculaires.' },
  ],
};
