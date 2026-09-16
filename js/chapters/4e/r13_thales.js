// =====================================================================
//  r13_thales.js — 4ᵉ : théorème de Thalès dans les triangles emboîtés
//  (la configuration « papillon » et la réciproque sont vues en 3ᵉ).
//  Figure interactive : on déplace M sur [AB], les rapports restent égaux.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, dec, arrondi, svg, seg, poly, txt, point, surSegment, milieu } from '../commun.js';

// Rapports « jolis » p/q (petit triangle / grand triangle).
const RAPPORTS = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5]];
// Noms des points : [sommet commun, B, C, M, N].
const NOMS = [['A', 'B', 'C', 'M', 'N'], ['R', 'S', 'T', 'E', 'F'], ['O', 'K', 'L', 'I', 'J'], ['D', 'E', 'F', 'G', 'H']];

/** Triangle ABC avec M sur [AB], N sur [AC] et (MN) // (BC). l = étiquettes de longueurs. */
function figThales(n = NOMS[0], l = {}, t = 0.55) {
  const [a, b, c, m, nn] = n;
  const A = [160, 26], B = [34, 196], C = [290, 196];
  const M = surSegment(A, B, t), N = surSegment(A, C, t);
  let s = poly([A, B, C]) + seg(M, N, { c: 'var(--t-geometrie)', w: 2.6 });
  s += point(A, a, 0, -8) + point(B, b, -12, 6) + point(C, c, 12, 6) + point(M, m, -14, 2) + point(N, nn, 14, 2);
  const lab = (P, Q, v, dx, dy) => { if (v === undefined || v === '') return ''; const [x, y] = milieu(P, Q); return txt(x + dx, y + dy, v, { c: 'var(--accent-ink)', size: 12 }); };
  s += lab(A, M, l.am, -16, 0) + lab(A, N, l.an, 16, 0) + lab(M, N, l.mn, 0, -7) + lab(B, C, l.bc, 0, 18);
  if (l.mb !== undefined) s += lab(M, B, l.mb, -16, 4);
  if (l.nc !== undefined) s += lab(N, C, l.nc, 16, 4);
  return svg(324, 220, s, `triangle ${a}${b}${c} et droite (${m}${nn}) parallèle à (${b}${c})`);
}

function thalesInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>position de M <input type="range" min="0.2" max="0.9" step="0.05" value="0.5" data-t> <span class="fig-val" data-tv></span></label></div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  const AB = 8, AC = 10, BC = 12;
  function draw() {
    const t = +wrap.querySelector('[data-t]').value;
    wrap.querySelector('[data-tv]').textContent = dec(t);
    wrap.querySelector('[data-svg]').innerHTML = figThales(NOMS[0], { am: dec(AB * t), an: dec(AC * t), mn: dec(BC * t), bc: BC }, t);
    wrap.querySelector('[data-out]').innerHTML = `AB = ${AB}, AC = ${AC}, BC = ${BC}<br>` +
      `AM/AB = ${dec(AB * t)}/${AB} = <strong>${dec(t)}</strong> · AN/AC = ${dec(AC * t)}/${AC} = <strong>${dec(t)}</strong> · MN/BC = ${dec(BC * t)}/${BC} = <strong>${dec(t)}</strong>`;
  }
  wrap.querySelector('[data-t]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

/** Tire une configuration à longueurs entières : petit triangle = p/q du grand. */
function tirage() {
  const [p, q] = pick(RAPPORTS), u = randInt(2, 5), v = randInt(2, 5), w = randInt(2, 5);
  return { p, q, AM: p * u, AB: q * u, MN: p * v, BC: q * v, AN: p * w, AC: q * w, n: pick(NOMS) };
}

const rapports = (n) => { const [a, b, c, m, nn] = n; return `\\dfrac{${a}${m}}{${a}${b}} = \\dfrac{${a}${nn}}{${a}${c}} = \\dfrac{${m}${nn}}{${b}${c}}`; };

export default {
  id: 'r13',
  titre: 'Théorème de Thalès (triangles emboîtés)',
  theme: 'geometrie', niveau: '4e',
  icone: '📐',

  intro:
    "Quand on coupe un triangle par une droite <strong>parallèle</strong> à un côté, on obtient un petit triangle " +
    "qui est une réduction du grand : ses longueurs sont proportionnelles. Le théorème de Thalès permet ainsi de " +
    "calculer des longueurs inaccessibles (hauteur d'un arbre grâce à son ombre, largeur d'une rivière…). " +
    "En 3ᵉ, on l'étend à la configuration « papillon » et on apprend sa réciproque.",

  cours: [
    {
      type: 'definition', titre: 'La configuration des triangles emboîtés',
      contenu: "Dans un triangle $ABC$, $M$ est un point du segment $[AB]$ et $N$ un point du segment $[AC]$, et les droites $(MN)$ et $(BC)$ sont <strong>parallèles</strong>. Le triangle $AMN$ est alors « emboîté » dans le triangle $ABC$ : ils ont le sommet $A$ en commun.",
    },
    {
      type: 'propriete', titre: 'Théorème de Thalès',
      contenu: "Si $M \\in [AB]$, $N \\in [AC]$ et $(MN) \\parallel (BC)$, alors les longueurs des côtés du triangle $AMN$ sont <strong>proportionnelles</strong> à celles du triangle $ABC$ :",
      formule: '\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}',
    },
    {
      type: 'propriete', titre: 'Le tableau de proportionnalité',
      contenu: "Chaque rapport compare un côté du <strong>petit</strong> triangle au côté qui lui correspond dans le <strong>grand</strong> triangle. On peut ranger les longueurs dans un tableau de proportionnalité puis utiliser le produit en croix. Attention : on compare $AM$ à $AB$ (et non à $MB$).",
    },
    {
      type: 'figure', titre: 'Les rapports restent égaux',
      contenu: "Déplace $M$ : tant que $(MN)$ reste parallèle à $(BC)$, les trois rapports sont égaux.",
      render: (host) => thalesInteractif(host),
    },
    {
      type: 'exemple', enonce: "$M \\in [AB]$, $N \\in [AC]$, $(MN) \\parallel (BC)$, $AM = 4$ cm, $AB = 10$ cm et $BC = 15$ cm. Calculer $MN$.",
      solution_etapes: [
        "Les points $A, M, B$ et $A, N, C$ sont alignés et $(MN) \\parallel (BC)$ : on peut utiliser le théorème de Thalès.",
        "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$, donc $\\dfrac{4}{10} = \\dfrac{MN}{15}$.",
        "Produit en croix : $MN = \\dfrac{4 \\times 15}{10} = \\dfrac{60}{10} = 6$ cm.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Vérifier la configuration', explication: "Repère le sommet commun, les deux côtés sur lesquels sont $M$ et $N$, et <strong>la phrase qui dit que les droites sont parallèles</strong>." },
    { etape: 2, titre: 'Écrire les trois rapports', explication: "Petit triangle en haut, grand triangle en bas, dans le même ordre : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$." },
    { etape: 3, titre: 'Remplacer par les longueurs connues', explication: "Garde les deux rapports utiles : celui qui est complet et celui qui contient l'inconnue." },
    { etape: 4, titre: 'Produit en croix', explication: "Si $\\dfrac{a}{b} = \\dfrac{x}{c}$ alors $x = \\dfrac{a \\times c}{b}$. Conclus avec l'unité." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'qcm', consigne: 'Choisis l\'égalité donnée par le théorème de Thalès :',
      generer() {
        const n = pick(NOMS), [a, b, c, m, nn] = n;
        return {
          enonce: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$ et $(${m}${nn}) \\parallel (${b}${c})$.`,
          choix: [
            rapports(n),
            `\\dfrac{${a}${m}}{${m}${b}} = \\dfrac{${a}${nn}}{${nn}${c}} = \\dfrac{${m}${nn}}{${b}${c}}`,
            `\\dfrac{${a}${m}}{${a}${b}} = \\dfrac{${a}${c}}{${a}${nn}} = \\dfrac{${m}${nn}}{${b}${c}}`,
            `\\dfrac{${a}${m}}{${a}${nn}} = \\dfrac{${a}${b}}{${a}${c}} = \\dfrac{${b}${c}}{${m}${nn}}`,
          ],
          correct: 0, _v: { n },
          visuel: (h) => { h.innerHTML = figThales(n); },
        };
      },
      indices: ['Chaque rapport compare le petit triangle au grand triangle.', 'Les côtés du petit triangle vont en haut, ceux du grand en bas.', `On compare $AM$ à $AB$ (le côté entier), pas à $MB$.`],
      correction_etapes(st) {
        const [a, b, c, m, nn] = st._v.n;
        return [
          `Le petit triangle est $${a}${m}${nn}$, le grand est $${a}${b}${c}$.`,
          `Côtés correspondants : $${a}${m}$ ↔ $${a}${b}$, $${a}${nn}$ ↔ $${a}${c}$, $${m}${nn}$ ↔ $${b}${c}$.`,
          `D'où $${rapports(st._v.n)}$.`,
        ];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la longueur demandée (en cm) :',
      generer() {
        const T = tirage(), [a, b, c, m, nn] = T.n;
        return {
          enonce: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$, $(${m}${nn}) \\parallel (${b}${c})$. $${a}${m} = ${T.AM}$ cm, $${a}${b} = ${T.AB}$ cm et $${b}${c} = ${T.BC}$ cm. Calcule $${m}${nn}$.`,
          reponse: T.MN, validation: 'nombre', _v: T,
          visuel: (h) => { h.innerHTML = figThales(T.n, { am: T.AM, mn: '?', bc: T.BC }, T.p / T.q); },
        };
      },
      indices: ['Écris les trois rapports égaux du théorème de Thalès.', 'Utilise $\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$.', 'Produit en croix : $MN = \\dfrac{AM \\times BC}{AB}$.'],
      correction_etapes(st) {
        const { AM, AB, BC, MN, n } = st._v, [a, b, c, m, nn] = n;
        return [
          `Configuration de Thalès : $${rapports(n)}$.`,
          `On remplace : $\\dfrac{${AM}}{${AB}} = \\dfrac{${m}${nn}}{${BC}}$.`,
          `Produit en croix : $${m}${nn} = \\dfrac{${AM} \\times ${BC}}{${AB}} = \\dfrac{${AM * BC}}{${AB}} = ${MN}$ cm.`,
        ];
      },
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Complète le calcul :',
      generer() {
        const T = tirage(), [a, b, c, m, nn] = T.n;
        return {
          enonce_complete: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$, $(${m}${nn}) \\parallel (${b}${c})$, $${a}${m} = ${T.AM}$, $${a}${b} = ${T.AB}$, $${a}${c} = ${T.AC}$. Donc $\\dfrac{${T.AM}}{${T.AB}} = \\dfrac{${a}${nn}}{${T.AC}}$ et $${a}${nn} = $ {0} $\\div ${T.AB} = $ {1}`,
          champs: [{ reponse: T.AM * T.AC, validation: 'nombre', calcul: true }, { reponse: T.AN, validation: 'nombre' }],
          _v: T,
        };
      },
      indices: ['Produit en croix : on multiplie les deux nombres « en diagonale ».', `$${'AN'} = \\dfrac{AM \\times AC}{AB}$.`, 'Calcule le produit, puis divise.'],
      correction_etapes(st) {
        const { AM, AB, AC, AN, n } = st._v, [a, , , , nn] = n;
        return [
          `Produit en croix : $${a}${nn} = \\dfrac{${AM} \\times ${AC}}{${AB}}$.`,
          `$${AM} \\times ${AC} = ${AM * AC}$, puis $${AM * AC} \\div ${AB} = ${AN}$.`,
        ];
      },
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la longueur du grand triangle (en cm) :',
      generer() {
        const T = tirage(), [a, b, c, m, nn] = T.n;
        return {
          enonce: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$, $(${m}${nn}) \\parallel (${b}${c})$. $${a}${m} = ${T.AM}$ cm, $${m}${nn} = ${T.MN}$ cm et $${b}${c} = ${T.BC}$ cm. Calcule $${a}${b}$.`,
          reponse: T.AB, validation: 'nombre', _v: T,
          visuel: (h) => { h.innerHTML = figThales(T.n, { am: T.AM, mn: T.MN, bc: T.BC }, T.p / T.q); },
        };
      },
      indices: ['Utilise le rapport qui contient $AB$ et le rapport complet.', '$\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$.', 'Produit en croix : $AB = \\dfrac{AM \\times BC}{MN}$.'],
      correction_etapes(st) {
        const { AM, AB, BC, MN, n } = st._v, [a, b, c, m, nn] = n;
        return [
          `D'après le théorème de Thalès : $\\dfrac{${a}${m}}{${a}${b}} = \\dfrac{${m}${nn}}{${b}${c}}$.`,
          `$\\dfrac{${AM}}{${a}${b}} = \\dfrac{${MN}}{${BC}}$.`,
          `$${a}${b} = \\dfrac{${AM} \\times ${BC}}{${MN}} = \\dfrac{${AM * BC}}{${MN}} = ${AB}$ cm.`,
        ];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Calcule la longueur arrondie au dixième (en cm) :',
      generer() {
        let AB, AM, BC, MN;
        do { AB = randInt(6, 12); AM = randInt(2, AB - 2); BC = randInt(4, 15); MN = (AM * BC) / AB; } while (Number.isInteger(MN * 10));
        const n = pick(NOMS), [a, b, c, m, nn] = n;
        return {
          enonce: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$, $(${m}${nn}) \\parallel (${b}${c})$. $${a}${m} = ${AM}$ cm, $${a}${b} = ${AB}$ cm, $${b}${c} = ${BC}$ cm. Calcule $${m}${nn}$ arrondi au dixième.`,
          reponse: arrondi(MN, 1), validation: 'nombre', tolerance: 0.05, _v: { AB, AM, BC, MN, n },
          visuel: (h) => { h.innerHTML = figThales(n, { am: AM, mn: '?', bc: BC }, AM / AB); },
        };
      },
      indices: ['Même méthode : $\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$.', 'La division ne tombe pas juste : utilise la calculatrice.', 'Arrondis au dixième : un seul chiffre après la virgule.'],
      correction_etapes(st) {
        const { AB, AM, BC, MN, n } = st._v, [, , , m, nn] = n;
        return [
          `Thalès : $\\dfrac{${AM}}{${AB}} = \\dfrac{${m}${nn}}{${BC}}$.`,
          `$${m}${nn} = \\dfrac{${AM} \\times ${BC}}{${AB}} = \\dfrac{${AM * BC}}{${AB}} \\approx ${tex(arrondi(MN, 3))}$.`,
          `Arrondi au dixième : $${m}${nn} \\approx ${tex(arrondi(MN, 1))}$ cm.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets la rédaction dans l\'ordre :',
      generer() {
        const T = tirage(), [a, b, c, m, nn] = T.n;
        return {
          etapes: [
            `Les points $${a}, ${m}, ${b}$ sont alignés, ainsi que $${a}, ${nn}, ${c}$.`,
            `Les droites $(${m}${nn})$ et $(${b}${c})$ sont parallèles.`,
            `D'après le théorème de Thalès : $${rapports(T.n)}$.`,
            `On remplace : $\\dfrac{${T.AM}}{${T.AB}} = \\dfrac{${m}${nn}}{${T.BC}}$.`,
            `Donc $${m}${nn} = \\dfrac{${T.AM} \\times ${T.BC}}{${T.AB}} = ${T.MN}$.`,
          ],
        };
      },
      indices: ['On justifie d\'abord la configuration (alignements, parallèles).', 'Puis on cite le théorème et on écrit les rapports.', 'On termine par le calcul.'],
      correction_detaillee: (st) => `<p>Ordre : alignements → parallèles → théorème de Thalès → remplacement → calcul :</p><ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Calcule la longueur demandée (en cm) :',
      generer() {
        const T = tirage(), [a, b, c, m, nn] = T.n;
        return {
          enonce: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$, $(${m}${nn}) \\parallel (${b}${c})$. $${a}${m} = ${T.AM}$ cm, $${a}${nn} = ${T.AN}$ cm et $${a}${c} = ${T.AC}$ cm. Calcule $${m}${b}$.`,
          reponse: T.AB - T.AM, validation: 'nombre', _v: T,
          visuel: (h) => { h.innerHTML = figThales(T.n, { am: T.AM, an: T.AN, mb: '?' }, T.p / T.q); },
        };
      },
      indices: ['On ne peut pas calculer $MB$ directement : calcule d\'abord $AB$.', '$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.', '$MB = AB - AM$.'],
      correction_etapes(st) {
        const { AM, AB, AN, AC, n } = st._v, [a, b, , m] = n;
        return [
          `Thalès : $\\dfrac{${a}${m}}{${a}${b}} = \\dfrac{${n[0]}${n[4]}}{${n[0]}${n[2]}}$, donc $\\dfrac{${AM}}{${a}${b}} = \\dfrac{${AN}}{${AC}}$.`,
          `$${a}${b} = \\dfrac{${AM} \\times ${AC}}{${AN}} = \\dfrac{${AM * AC}}{${AN}} = ${AB}$ cm.`,
          `$${m}${b} = ${a}${b} - ${a}${m} = ${AB} - ${AM} = ${AB - AM}$ cm.`,
        ];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Problème — calcule la hauteur de l\'arbre (en m) :',
      generer() {
        const h = pick([1, 1.5, 2]), s1 = pick([2, 3, 4]), k = randInt(3, 8), s2 = s1 * k, H = h * k;
        return {
          enonce: `Au même moment, un bâton vertical de $${tex(h)}$ m projette une ombre de $${s1}$ m, et un arbre projette une ombre de $${s2}$ m. Les ombres se terminent au même point et les rayons du soleil sont parallèles. Quelle est la hauteur de l'arbre ?`,
          reponse: H, validation: 'nombre', _v: { h, s1, s2, H },
        };
      },
      indices: ['Le bâton et l\'arbre sont verticaux donc parallèles : on a deux triangles emboîtés.', '$\\dfrac{\\text{ombre du bâton}}{\\text{ombre de l\'arbre}} = \\dfrac{\\text{bâton}}{\\text{arbre}}$.', 'Produit en croix : arbre $= \\dfrac{\\text{bâton} \\times \\text{ombre de l\'arbre}}{\\text{ombre du bâton}}$.'],
      correction_etapes(st) {
        const { h, s1, s2, H } = st._v;
        return [
          `Le bâton et l'arbre sont parallèles (tous deux verticaux) : le petit triangle (bâton, ombre) est emboîté dans le grand (arbre, ombre).`,
          `Thalès : $\\dfrac{${s1}}{${s2}} = \\dfrac{${tex(h)}}{H}$.`,
          `$H = \\dfrac{${tex(h)} \\times ${s2}}{${s1}} = \\dfrac{${tex(h * s2)}}{${s1}} = ${tex(H)}$ m.`,
        ];
      },
    },
    {
      id: 'e09', niveau: 3, type: 'vrai_faux', consigne: 'Ce calcul est-il juste ?',
      generer() {
        const T = tirage(), [a, b, c, m, nn] = T.n;
        const piege = Math.random() < 0.5 && T.q - T.p !== T.p; // erreur classique : AM/MB au lieu de AM/AB
        const MB = T.AB - T.AM;
        const propose = piege ? arrondi((T.AM * T.BC) / MB, 2) : T.MN;
        return {
          enonce: `$${m} \\in [${a}${b}]$, $${nn} \\in [${a}${c}]$, $(${m}${nn}) \\parallel (${b}${c})$, $${a}${m} = ${T.AM}$, $${m}${b} = ${MB}$ et $${b}${c} = ${T.BC}$. Un élève affirme : « $${m}${nn} = ${tex(propose)}$ ».`,
          reponse: !piege, _v: { ...T, MB, propose, piege },
        };
      },
      indices: ['Attention : l\'énoncé donne $MB$, pas $AB$.', 'Calcule d\'abord $AB = AM + MB$.', 'Puis $MN = \\dfrac{AM \\times BC}{AB}$.'],
      correction_etapes(st) {
        const { AM, MB, AB, BC, MN, n, piege } = st._v, [a, b, , m, nn] = n;
        return [
          `$${a}${b} = ${a}${m} + ${m}${b} = ${AM} + ${MB} = ${AB}$.`,
          `Thalès : $${m}${nn} = \\dfrac{${AM} \\times ${BC}}{${AB}} = ${MN}$.`,
          piege ? `L'élève a divisé par $${m}${b}$ au lieu de $${a}${b}$ : c'est <strong>faux</strong>.` : `L'affirmation est <strong>vraie</strong>.`,
        ];
      },
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Pour utiliser le théorème de Thalès dans les triangles emboîtés $AMN$ et $ABC$, il faut que :', choix: ['$(MN)$ et $(BC)$ soient parallèles', '$(MN)$ et $(BC)$ soient perpendiculaires', 'le triangle $ABC$ soit rectangle', '$AM = MB$'], correct: 0, explication: 'La condition indispensable : les droites $(MN)$ et $(BC)$ sont parallèles.' },
    {
      type: 'saisie', question: 'Calcule MN.',
      generer() { const T = tirage(); return { question: `$M \\in [AB]$, $N \\in [AC]$, $(MN) \\parallel (BC)$, $AM = ${T.AM}$, $AB = ${T.AB}$, $BC = ${T.BC}$. Calcule $MN$.`, reponse: T.MN, validation: 'nombre', explication: `$MN = \\dfrac{${T.AM} \\times ${T.BC}}{${T.AB}} = ${T.MN}$.` }; },
    },
    { type: 'vrai_faux', question: 'Dans la configuration de Thalès, on a $\\dfrac{AM}{MB} = \\dfrac{MN}{BC}$.', reponse: false, explication: 'Non : on compare $AM$ au côté entier $AB$ : $\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$.' },
    {
      type: 'saisie', question: 'Calcule AC.',
      generer() { const T = tirage(); return { question: `$M \\in [AB]$, $N \\in [AC]$, $(MN) \\parallel (BC)$, $AM = ${T.AM}$, $AB = ${T.AB}$, $AN = ${T.AN}$. Calcule $AC$.`, reponse: T.AC, validation: 'nombre', explication: `$AC = \\dfrac{${T.AB} \\times ${T.AN}}{${T.AM}} = ${T.AC}$.` }; },
    },
    { type: 'qcm', question: 'Si $\\dfrac{AM}{AB} = \\dfrac{1}{3}$, alors le triangle $AMN$ est :', choix: ['une réduction de $ABC$ (longueurs divisées par 3)', 'un agrandissement de $ABC$', 'égal au triangle $ABC$', 'un triangle rectangle'], correct: 0, explication: 'Toutes les longueurs de $AMN$ sont le tiers de celles de $ABC$ : c\'est une réduction.' },
  ],
};
