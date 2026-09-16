// =====================================================================
//  v10_triangles.js — 5ᵉ : somme des angles d'un triangle, triangles
//  particuliers (isocèle, équilatéral, rectangle), inégalité triangulaire,
//  construction, hauteurs. Figure interactive : triangle déformable.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { svg, poly, point, arcAngle, direction, codage, angleDroit } from '../commun.js';

/** Triangle ABC dessiné à partir de ses angles en A et B (base AB horizontale). */
function figTriangle({ A: a, B: b, labels = {}, codes = [] } = {}) {
  // C à l'intersection des côtés issus de A (angle a) et de B (angle b), base [AB] de longueur 1
  // (loi des sinus : AC = sin b / sin(a + b)).
  const r = (d) => (d * Math.PI) / 180, AC = Math.sin(r(b)) / Math.sin(r(a + b));
  const xc = AC * Math.cos(r(a)), yc = AC * Math.sin(r(a));
  const W = 320, H = 210, x0 = Math.min(0, xc), x1 = Math.max(1, xc);
  const k = Math.min((W - 70) / (x1 - x0), (H - 55) / Math.max(yc, 0.05));
  const ox = (W - (x1 - x0) * k) / 2 - x0 * k, oy = H - 25;
  const P = ([x, y]) => [ox + x * k, oy - y * k];
  const A = P([0, 0]), B = P([1, 0]), C = P([xc, yc]);
  let s = poly([A, B, C], { fill: 'var(--accent-soft)', c: 'var(--accent)' });
  const mk = (S, U, V, key) => { const l = labels[key]; if (l === undefined) return ''; if (l === 'droit') return angleDroit(S, U, V, 12); return arcAngle(S, direction(S, U), direction(S, V), 20, l, { decal: 16, size: 12 }); };
  s += mk(A, B, C, 'A') + mk(B, C, A, 'B') + mk(C, A, B, 'C');
  codes.forEach(([U, V, n]) => { s += codage({ A, B, C }[U], { A, B, C }[V], n); });
  s += point(A, 'A', -10, 14, 'var(--text)') + point(B, 'B', 10, 14, 'var(--text)') + point(C, 'C', 0, -8, 'var(--text)');
  return svg(W, H, s, 'triangle ABC', 'fig-chap');
}

function triangleInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>angle A <input type="range" min="15" max="120" step="5" value="60" data-a> <span class="fig-val" data-av></span></label>
      <label>angle B <input type="range" min="15" max="120" step="5" value="45" data-b> <span class="fig-val" data-bv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    let a = +wrap.querySelector('[data-a]').value, b = +wrap.querySelector('[data-b]').value;
    if (a + b > 165) { b = 165 - a; wrap.querySelector('[data-b]').value = b; }
    const c = 180 - a - b;
    wrap.querySelector('[data-av]').textContent = `${a}°`; wrap.querySelector('[data-bv]').textContent = `${b}°`;
    wrap.querySelector('[data-svg]').innerHTML = figTriangle({ A: a, B: b, labels: { A: `${a}°`, B: `${b}°`, C: `${c}°` } });
    const nature = a === b && b === c ? 'équilatéral' : c === 90 || a === 90 || b === 90 ? 'rectangle' : a === b || b === c || a === c ? 'isocèle' : 'quelconque';
    wrap.querySelector('[data-out]').innerHTML = `${a}° + ${b}° + ${c}° = <strong>180°</strong> — triangle ${nature}.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v10',
  titre: 'Triangles',
  theme: 'geometrie', niveau: '5e',
  icone: '🔺',

  intro:
    "Le triangle est la figure la plus solide : on le retrouve dans les charpentes, les ponts, les pylônes. " +
    "Deux propriétés fondamentales permettent de raisonner sans mesurer : la <strong>somme des angles</strong> vaut toujours " +
    "180°, et un côté est toujours plus court que la somme des deux autres (<strong>inégalité triangulaire</strong>).",

  cours: [
    {
      type: 'propriete', titre: 'Somme des angles d\'un triangle',
      contenu: "Dans un triangle, la somme des mesures des trois angles est égale à $180°$.",
      formule: '\\widehat{A} + \\widehat{B} + \\widehat{C} = 180°',
    },
    {
      type: 'propriete', titre: 'Triangles particuliers',
      contenu: "Un triangle <strong>isocèle</strong> a deux côtés égaux et ses deux angles à la base sont égaux. Un triangle <strong>équilatéral</strong> a trois côtés égaux et trois angles de $60°$. Dans un triangle <strong>rectangle</strong>, les deux angles aigus sont complémentaires (leur somme vaut $90°$).",
    },
    {
      type: 'propriete', titre: 'Inégalité triangulaire',
      contenu: "Dans un triangle, la longueur de chaque côté est inférieure à la somme des longueurs des deux autres. Pour savoir si un triangle est constructible, il suffit de vérifier que le <strong>plus grand côté</strong> est plus petit que la somme des deux autres. S'il y a égalité, les trois points sont alignés (triangle « aplati »).",
      formule: 'AB < AC + CB',
    },
    {
      type: 'definition', titre: 'Hauteur d\'un triangle',
      contenu: "Une <strong>hauteur</strong> est la droite qui passe par un sommet et qui est perpendiculaire au côté opposé. Elle sert notamment à calculer l'aire : $\\mathcal{A} = \\dfrac{\\text{base} \\times \\text{hauteur}}{2}$.",
    },
    { type: 'figure', titre: 'La somme ne change pas', contenu: "Modifie les angles $A$ et $B$ : l'angle $C$ s'adapte pour que la somme reste $180°$.", render: (host) => triangleInteractif(host) },
    {
      type: 'exemple', enonce: 'Le triangle $RST$ est isocèle en $R$ et $\\widehat{R} = 40°$. Calculer $\\widehat{S}$.',
      solution_etapes: ["La somme des angles vaut $180°$ : $\\widehat{S} + \\widehat{T} = 180° - 40° = 140°$.", "Le triangle est isocèle en $R$ : les angles à la base $\\widehat{S}$ et $\\widehat{T}$ sont égaux.", "$\\widehat{S} = 140° \\div 2 = 70°$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Lister ce qu\'on sait', explication: "Angles connus, triangle isocèle (en quel sommet ?), équilatéral, rectangle." },
    { etape: 2, titre: 'Utiliser 180°', explication: "Angle manquant $= 180° - (\\text{somme des deux autres})$." },
    { etape: 3, titre: 'Utiliser la nature du triangle', explication: "Isocèle : les deux angles à la base sont égaux ; rectangle : les deux angles aigus font $90°$ à eux deux." },
    { etape: 4, titre: 'Constructible ?', explication: "Compare le plus grand côté à la somme des deux autres." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule le troisième angle (en degrés) :',
      generer() {
        const a = randInt(20, 100), b = randInt(20, 150 - a);
        return { enonce: `Dans le triangle $ABC$, $\\widehat{A} = ${a}°$ et $\\widehat{B} = ${b}°$. Calcule $\\widehat{C}$.`, reponse: 180 - a - b, validation: 'nombre', _v: { a, b }, visuel: (h) => { h.innerHTML = figTriangle({ A: a, B: b, labels: { A: `${a}°`, B: `${b}°`, C: '?' } }); } };
      },
      indices: ['La somme des angles d\'un triangle vaut $180°$.', 'Additionne les deux angles connus.', 'Soustrais cette somme à $180°$.'],
      correction_etapes: (st) => [`$\\widehat{A} + \\widehat{B} = ${st._v.a} + ${st._v.b} = ${st._v.a + st._v.b}°$.`, `$\\widehat{C} = 180 - ${st._v.a + st._v.b} = ${180 - st._v.a - st._v.b}°$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'vrai_faux', consigne: 'Ce triangle est-il constructible ?',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), mode = pick(['ok', 'trop', 'egal']);
        const c = mode === 'ok' ? randInt(Math.abs(a - b) + 1, a + b - 1) : mode === 'egal' ? a + b : a + b + randInt(1, 4);
        const cotes = [a, b, c].sort(() => Math.random() - 0.5);
        return { enonce: `Peut-on construire un triangle dont les côtés mesurent $${cotes[0]}$ cm, $${cotes[1]}$ cm et $${cotes[2]}$ cm ?`, reponse: mode === 'ok', _v: { cotes } };
      },
      indices: ['Repère le plus grand côté.', 'Additionne les deux autres.', 'Constructible si le plus grand est strictement plus petit que cette somme.'],
      correction_etapes(st) {
        const s = [...st._v.cotes].sort((x, y) => x - y), g = s[2], somme = s[0] + s[1];
        return [`Plus grand côté : $${g}$ cm ; somme des deux autres : $${s[0]} + ${s[1]} = ${somme}$ cm.`, g < somme ? `$${g} < ${somme}$ : le triangle est constructible.` : g === somme ? `$${g} = ${somme}$ : les points sont alignés, pas de vrai triangle.` : `$${g} > ${somme}$ : le triangle n'est pas constructible.`];
      },
    },
    {
      id: 'e03', niveau: 1, type: 'qcm', consigne: 'Choisis la bonne réponse :',
      generer() {
        const [q, bon, faux, why] = pick([
          ['Les angles d\'un triangle équilatéral mesurent :', '60°', ['90°', '45°', '180°'], 'Trois angles égaux dont la somme vaut $180°$ : $180 \\div 3 = 60°$.'],
          ['Dans un triangle rectangle, la somme des deux angles aigus vaut :', '90°', ['180°', '60°', '45°'], '$180° - 90° = 90°$.'],
          ['Un triangle isocèle a :', 'deux angles égaux', ['trois angles égaux', 'un angle droit', 'aucun angle égal'], 'Ses deux angles à la base sont égaux.'],
          ['Un triangle peut-il avoir deux angles droits ?', 'non, jamais', ['oui, toujours', 'oui, s\'il est isocèle', 'oui, s\'il est équilatéral'], '$90° + 90° = 180°$ : il ne resterait rien pour le 3ᵉ angle.'],
        ]);
        return { enonce: q, choix: [bon, ...faux], correct: 0, _v: { why } };
      },
      indices: ['Utilise la somme des angles : $180°$.', 'Pense aux propriétés des triangles particuliers.', 'Fais un petit croquis.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Triangle isocèle — calcule l\'angle (en degrés) :',
      generer() {
        if (Math.random() < 0.5) {
          const s = 2 * randInt(10, 70);
          return { enonce: `$ABC$ est isocèle en $C$ et $\\widehat{C} = ${s}°$. Calcule $\\widehat{A}$.`, reponse: (180 - s) / 2, validation: 'nombre', _v: { s, cas: 'sommet' }, visuel: (h) => { h.innerHTML = figTriangle({ A: (180 - s) / 2, B: (180 - s) / 2, labels: { C: `${s}°`, A: '?' }, codes: [['A', 'C', 1], ['B', 'C', 1]] }); } };
        }
        const base = randInt(25, 80);
        return { enonce: `$ABC$ est isocèle en $C$ et $\\widehat{A} = ${base}°$. Calcule $\\widehat{C}$.`, reponse: 180 - 2 * base, validation: 'nombre', _v: { base, cas: 'base' }, visuel: (h) => { h.innerHTML = figTriangle({ A: base, B: base, labels: { A: `${base}°`, C: '?' }, codes: [['A', 'C', 1], ['B', 'C', 1]] }); } };
      },
      indices: ['Isocèle en $C$ : les angles à la base $\\widehat{A}$ et $\\widehat{B}$ sont égaux.', 'La somme des trois angles vaut $180°$.', 'Pour un angle à la base : $(180 - \\widehat{C}) \\div 2$.'],
      correction_etapes(st) {
        const { s, base, cas } = st._v;
        return cas === 'sommet'
          ? [`Isocèle en $C$ : $\\widehat{A} = \\widehat{B}$.`, `$\\widehat{A} + \\widehat{B} = 180 - ${s} = ${180 - s}°$.`, `$\\widehat{A} = ${180 - s} \\div 2 = ${(180 - s) / 2}°$.`]
          : [`Isocèle en $C$ : $\\widehat{B} = \\widehat{A} = ${base}°$.`, `$\\widehat{C} = 180 - ${base} - ${base} = ${180 - 2 * base}°$.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Triangle rectangle — calcule l\'angle (en degrés) :',
      generer() { const a = randInt(12, 78); return { enonce: `$ABC$ est rectangle en $B$ et $\\widehat{A} = ${a}°$. Calcule $\\widehat{C}$.`, reponse: 90 - a, validation: 'nombre', _v: { a }, visuel: (h) => { h.innerHTML = figTriangle({ A: a, B: 90, labels: { A: `${a}°`, B: 'droit', C: '?' } }); } }; },
      indices: ['L\'angle droit mesure $90°$.', 'Les deux angles aigus sont complémentaires.', '$\\widehat{C} = 90° - \\widehat{A}$.'],
      correction_etapes: (st) => [`$\\widehat{B} = 90°$, donc $\\widehat{A} + \\widehat{C} = 180 - 90 = 90°$.`, `$\\widehat{C} = 90 - ${st._v.a} = ${90 - st._v.a}°$.`],
    },
    {
      id: 'e06', niveau: 2, type: 'complete', consigne: 'Complète le calcul :',
      generer() {
        const a = randInt(25, 90), b = randInt(20, 150 - a);
        return { enonce_complete: `$\\widehat{A} = ${a}°$ et $\\widehat{B} = ${b}°$. $\\widehat{A} + \\widehat{B} = $ {0} $°$, donc $\\widehat{C} = 180° - (\\widehat{A} + \\widehat{B}) = $ {1} $°$`, champs: [{ reponse: a + b, validation: 'nombre' }, { reponse: 180 - a - b, validation: 'nombre' }], _v: { a, b } };
      },
      indices: ['Additionne les deux angles connus.', 'Soustrais de $180°$.', 'Vérifie : la somme des trois doit faire $180°$.'],
      correction_etapes: (st) => [`$${st._v.a} + ${st._v.b} = ${st._v.a + st._v.b}$.`, `$180 - ${st._v.a + st._v.b} = ${180 - st._v.a - st._v.b}$.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Problème — calcule le plus grand angle (en degrés) :',
      generer() {
        const [k, texte] = pick([[[1, 2, 3], 'le deuxième est le double du premier et le troisième le triple du premier'], [[1, 1, 2], 'deux angles sont égaux et le troisième est leur double'], [[2, 3, 4], 'ils sont proportionnels à $2$, $3$ et $4$'], [[1, 2, 6], 'le deuxième est le double du premier et le troisième vaut $6$ fois le premier'], [[3, 4, 5], 'ils sont proportionnels à $3$, $4$ et $5$'], [[1, 4, 4], 'deux angles sont égaux et chacun vaut $4$ fois le troisième']]);
        const somme = k[0] + k[1] + k[2], x = 180 / somme;
        return { enonce: `Dans un triangle, ${texte}. Quelle est la mesure du plus grand angle ?`, reponse: Math.max(...k) * x, validation: 'nombre', _v: { k, somme, x } };
      },
      indices: ['Appelle $x$ la mesure du plus petit angle (ou d\'une « part »).', 'Écris la somme des trois angles en fonction de $x$ : elle vaut $180°$.', 'Trouve $x$, puis le plus grand angle.'],
      correction_etapes: (st) => { const { k, somme, x } = st._v; return [`Les angles valent $${k.map((n) => (n === 1 ? 'x' : `${n}x`)).join('$, $')}$.`, `Somme : $${somme}x = 180°$, donc $x = 180 \\div ${somme} = ${x}°$.`, `Plus grand angle : $${Math.max(...k)} \\times ${x} = ${Math.max(...k) * x}°$.`]; },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Inégalité triangulaire — longueur entière maximale (en cm) :',
      generer() { const a = randInt(3, 12), b = randInt(3, 12); return { enonce: `Un triangle a deux côtés de $${a}$ cm et $${b}$ cm. Quelle est la plus grande longueur entière (en cm) possible pour le troisième côté ?`, reponse: a + b - 1, validation: 'nombre', _v: { a, b } }; },
      indices: ['Le troisième côté doit être strictement plus petit que la somme des deux autres.', `Somme : $a + b$.`, 'Le plus grand entier strictement inférieur à cette somme.'],
      correction_etapes: (st) => [`Le troisième côté doit être strictement inférieur à $${st._v.a} + ${st._v.b} = ${st._v.a + st._v.b}$ cm.`, `Le plus grand entier possible est $${st._v.a + st._v.b - 1}$ cm (avec $${st._v.a + st._v.b}$ cm, les points seraient alignés).`],
    },
    {
      id: 'e09', niveau: 1, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre la construction du triangle (3 longueurs) :',
      generer() {
        const [a, b, c] = pick([[5, 4, 3], [6, 5, 4], [7, 5, 4], [8, 6, 5]]);
        return { etapes: [`Tracer le segment $[AB]$ de $${a}$ cm`, `Tracer un arc de cercle de centre $A$ et de rayon $${b}$ cm`, `Tracer un arc de cercle de centre $B$ et de rayon $${c}$ cm`, `Placer $C$ à l'intersection des deux arcs`, `Tracer $[AC]$ et $[BC]$`] };
      },
      indices: ['On commence par un côté entier.', 'Le compas sert à reporter les deux autres longueurs.', 'Le 3ᵉ sommet est à l\'intersection des arcs.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    {
      type: 'saisie', question: 'Troisième angle.',
      generer() { const a = randInt(30, 80), b = randInt(30, 70); return { question: `Un triangle a deux angles de $${a}°$ et $${b}°$. Combien mesure le troisième ?`, reponse: 180 - a - b, validation: 'nombre', explication: `$180 - ${a} - ${b} = ${180 - a - b}°$.` }; },
    },
    { type: 'vrai_faux', question: 'On peut construire un triangle de côtés $3$ cm, $4$ cm et $8$ cm.', reponse: false, explication: '$8 > 3 + 4 = 7$ : impossible.' },
    { type: 'qcm', question: 'Un triangle isocèle a un angle au sommet de $100°$. Ses angles à la base mesurent :', choix: ['40°', '80°', '50°', '100°'], correct: 0, explication: '$(180 - 100) \\div 2 = 40°$.' },
    { type: 'saisie', question: 'Triangle rectangle : un angle aigu mesure $35°$. Combien mesure l\'autre ?', reponse: 55, validation: 'nombre', explication: '$90 - 35 = 55°$.' },
    { type: 'qcm', question: 'Une hauteur d\'un triangle est :', choix: ['perpendiculaire à un côté et passe par le sommet opposé', 'parallèle à un côté', 'la droite qui coupe un angle en deux', 'le côté le plus long'], correct: 0, explication: 'Hauteur : passe par un sommet, perpendiculaire au côté opposé.' },
  ],
};
