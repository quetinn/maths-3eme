// =====================================================================
//  v14_aires_volumes.js — 5ᵉ : aires (triangle, parallélogramme, disque),
//  périmètre du cercle, volumes (prisme droit, cylindre), conversions
//  et unités. Figure interactive : aire du triangle et du parallélogramme.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, arrondi, svg, seg, poly, txt, cercle, angleDroit } from '../commun.js';

/** Triangle avec sa base et sa hauteur (hauteur en pointillés). */
function figTriangleAire({ b = '', h = '' } = {}) {
  const A = [30, 160], B = [250, 160], C = [150, 45], P = [150, 160];
  let s = poly([A, B, C], { fill: 'var(--accent-soft)', c: 'var(--accent)' });
  s += seg(C, P, { c: 'var(--t-geometrie)', w: 1.8, dash: true }) + angleDroit(P, C, B, 10);
  if (b) s += txt((A[0] + B[0]) / 2, A[1] + 20, b, { c: 'var(--accent-ink)', size: 12 });
  if (h) s += txt(C[0] + 16, (C[1] + P[1]) / 2, h, { c: 'var(--t-geometrie)', size: 12 });
  return svg(280, 190, s, 'triangle, base et hauteur', 'fig-chap');
}

/** Parallélogramme avec sa base et sa hauteur. */
function figParaAire({ b = '', h = '' } = {}) {
  const A = [30, 160], B = [210, 160], C = [260, 60], D = [80, 60], P = [80, 160];
  let s = poly([A, B, C, D], { fill: 'var(--accent-soft)', c: 'var(--accent)' });
  s += seg(D, P, { c: 'var(--t-geometrie)', w: 1.8, dash: true }) + angleDroit(P, D, B, 10);
  if (b) s += txt((A[0] + B[0]) / 2, A[1] + 20, b, { c: 'var(--accent-ink)', size: 12 });
  if (h) s += txt(D[0] + 16, (D[1] + P[1]) / 2, h, { c: 'var(--t-geometrie)', size: 12 });
  return svg(290, 190, s, 'parallélogramme, base et hauteur', 'fig-chap');
}

/** Disque avec son rayon. */
function figDisque({ r = '', diam = false } = {}) {
  const C = [110, 100], R = 70;
  let s = cercle(C, R, { c: 'var(--accent)', fill: 'var(--accent-soft)' });
  s += seg(C, diam ? [C[0] - R, C[1]] : C, { c: 'var(--t-geometrie)', w: 2 }) + seg(C, [C[0] + R, C[1]], { c: 'var(--t-geometrie)', w: 2 });
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="3" fill="var(--text)"/>` + txt(C[0] - 8, C[1] + 16, 'O', { size: 12 });
  if (r) s += txt(C[0] + R / 2, C[1] - 8, r, { c: 'var(--t-geometrie)', size: 12 });
  return svg(220, 200, s, 'disque et rayon', 'fig-chap');
}

function airesInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>base <input type="range" min="2" max="12" value="8" data-b> <span class="fig-val" data-bv></span></label>
      <label>hauteur <input type="range" min="2" max="10" value="5" data-h> <span class="fig-val" data-hv></span></label>
    </div>
    <div class="fig-rangee" data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const b = +wrap.querySelector('[data-b]').value, h = +wrap.querySelector('[data-h]').value;
    wrap.querySelector('[data-bv]').textContent = b; wrap.querySelector('[data-hv]').textContent = h;
    wrap.querySelector('[data-svg]').innerHTML = figTriangleAire({ b: `b = ${b}`, h: `h = ${h}` }) + figParaAire({ b: `b = ${b}`, h: `h = ${h}` });
    wrap.querySelector('[data-out]').innerHTML = `Triangle : aire = ${b} × ${h} ÷ 2 = <strong>${b * h / 2}</strong> &nbsp;·&nbsp; Parallélogramme : aire = ${b} × ${h} = <strong>${b * h}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v14',
  titre: 'Aires et volumes',
  theme: 'geometrie', niveau: '5e',
  icone: '📦',

  intro:
    "Combien de peinture pour un mur ? Combien de litres dans un aquarium ? Les <strong>aires</strong> mesurent des " +
    "surfaces (en cm², m²…) et les <strong>volumes</strong> des contenances (en cm³, m³, L). En 5ᵉ, on ajoute le " +
    "triangle, le parallélogramme, le disque, le prisme droit et le cylindre aux formules déjà connues.",

  cours: [
    {
      type: 'propriete', titre: 'Aires du triangle et du parallélogramme',
      contenu: "Dans les deux cas, la <strong>hauteur</strong> est perpendiculaire à la base choisie (ce n'est pas un côté oblique).",
      formule: '\\mathcal{A}_{\\text{triangle}} = \\dfrac{b \\times h}{2} \\qquad \\mathcal{A}_{\\text{parallélogramme}} = b \\times h',
    },
    {
      type: 'propriete', titre: 'Périmètre et aire du disque',
      contenu: "Pour un cercle de rayon $r$ (et de diamètre $d = 2r$) : le périmètre est $2\\pi r$ et l'aire du disque est $\\pi r^2$. On donne souvent la valeur exacte (avec $\\pi$) puis une valeur approchée ($\\pi \\approx 3{,}14$).",
      formule: 'P = 2\\pi r = \\pi d \\qquad \\mathcal{A} = \\pi r^2',
    },
    {
      type: 'propriete', titre: 'Volume du prisme droit et du cylindre',
      contenu: "Le volume d'un prisme droit (ou d'un cylindre) est le produit de l'aire de sa base $\\mathcal{B}$ par sa hauteur $h$. Pour un cylindre, la base est un disque : $\\mathcal{B} = \\pi r^2$.",
      formule: 'V = \\mathcal{B} \\times h \\qquad V_{\\text{cylindre}} = \\pi r^2 h',
    },
    {
      type: 'propriete', titre: 'Unités',
      contenu: "Aires : $1$ m² $= 10\\,000$ cm² (on multiplie par $100$ à chaque changement d'unité). Volumes : $1$ m³ $= 1\\,000$ dm³ $= 1\\,000\\,000$ cm³ (facteur $1\\,000$). Contenances : $1$ L $= 1$ dm³ $= 1\\,000$ cm³, et $1$ m³ $= 1\\,000$ L.",
      formule: '1\\ \\text{L} = 1\\ \\text{dm}^3 = 1\\,000\\ \\text{cm}^3',
    },
    { type: 'figure', titre: 'Base et hauteur', contenu: "Le triangle a exactement la <strong>moitié</strong> de l'aire du parallélogramme de même base et de même hauteur.", render: (host) => airesInteractif(host) },
    { type: 'figure', titre: 'Le disque', contenu: "Le rayon $r$ va du centre au bord ; le diamètre vaut $2r$.", render: (host) => { host.innerHTML = figDisque({ r: 'r' }); } },
    {
      type: 'exemple', enonce: "Calculer le volume d'un cylindre de rayon $3$ cm et de hauteur $10$ cm (valeur exacte puis arrondi au cm³).",
      solution_etapes: [
        "Aire de la base : $\\mathcal{B} = \\pi \\times 3^2 = 9\\pi$ cm².",
        "$V = \\mathcal{B} \\times h = 9\\pi \\times 10 = 90\\pi$ cm³ (valeur exacte).",
        "$V \\approx 90 \\times 3{,}14 \\approx 283$ cm³.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer base et hauteur', explication: "La hauteur est perpendiculaire à la base : attention aux figures « penchées »." },
    { etape: 2, titre: 'Choisir la formule', explication: "Triangle $\\dfrac{b \\times h}{2}$, parallélogramme $b \\times h$, disque $\\pi r^2$, prisme/cylindre $\\mathcal{B} \\times h$." },
    { etape: 3, titre: 'Vérifier les unités', explication: "Toutes les longueurs dans la même unité avant de calculer." },
    { etape: 4, titre: 'Conclure', explication: "Aire en unités carrées, volume en unités cubes ; convertir en litres si besoin ($1$ L $= 1\\,000$ cm³)." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: "Calcule l'aire du triangle (en cm²) :",
      generer() {
        let b, h; do { b = randInt(3, 20); h = randInt(2, 15); } while ((b * h) % 2 !== 0);
        return { enonce: `Un triangle a une base de $${b}$ cm et une hauteur de $${h}$ cm. Calcule son aire.`, reponse: (b * h) / 2, validation: 'nombre', _v: { b, h }, visuel: (x) => { x.innerHTML = figTriangleAire({ b: `${b} cm`, h: `${h} cm` }); } };
      },
      indices: ["$\\mathcal{A} = \\dfrac{b \\times h}{2}$.", 'Multiplie la base par la hauteur.', 'Divise le résultat par 2.'],
      correction_etapes: (st) => [`$${st._v.b} \\times ${st._v.h} = ${st._v.b * st._v.h}$.`, `$\\mathcal{A} = ${st._v.b * st._v.h} \\div 2 = ${(st._v.b * st._v.h) / 2}$ cm².`],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: "Calcule l'aire du parallélogramme (en cm²) :",
      generer() {
        const b = randInt(3, 18), h = randInt(2, 12), oblique = h + randInt(1, 4);
        return { enonce: `Un parallélogramme a une base de $${b}$ cm, une hauteur de $${h}$ cm et un côté oblique de $${oblique}$ cm. Calcule son aire.`, reponse: b * h, validation: 'nombre', _v: { b, h, oblique }, visuel: (x) => { x.innerHTML = figParaAire({ b: `${b} cm`, h: `${h} cm` }); } };
      },
      indices: ["$\\mathcal{A} = b \\times h$ (base fois hauteur).", 'La hauteur est perpendiculaire à la base.', "Le côté oblique ne sert pas pour l'aire : c'est un piège."],
      correction_etapes: (st) => [
        `On utilise la base et la <strong>hauteur</strong> ($${st._v.h}$ cm), pas le côté oblique ($${st._v.oblique}$ cm).`,
        `$\\mathcal{A} = ${st._v.b} \\times ${st._v.h} = ${st._v.b * st._v.h}$ cm².`,
      ],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Calcule le périmètre du cercle (au dixième, en cm) :',
      generer() {
        const r = randInt(2, 15), diam = Math.random() < 0.4;
        return {
          enonce: diam ? `Un cercle a un diamètre de $${2 * r}$ cm. Calcule son périmètre (arrondi au dixième).` : `Un cercle a un rayon de $${r}$ cm. Calcule son périmètre (arrondi au dixième).`,
          reponse: arrondi(2 * Math.PI * r, 1), validation: 'nombre', tolerance: 0.05, accepte: [arrondi(2 * 3.14 * r, 1)], _v: { r, diam },
          visuel: (x) => { x.innerHTML = figDisque({ r: diam ? `d = ${2 * r} cm` : `r = ${r} cm`, diam }); },
        };
      },
      indices: ['$P = 2 \\times \\pi \\times r$ (ou $P = \\pi \\times d$).', 'Si on te donne le diamètre, le rayon en est la moitié.', 'Utilise la touche $\\pi$ de la calculatrice, puis arrondis.'],
      correction_etapes: (st) => [
        st._v.diam ? `Le diamètre vaut $${2 * st._v.r}$ cm, donc le rayon vaut $${st._v.r}$ cm.` : `Le rayon vaut $${st._v.r}$ cm.`,
        `$P = 2 \\times \\pi \\times ${st._v.r} = ${2 * st._v.r}\\pi \\approx ${tex(arrondi(2 * Math.PI * st._v.r, 3))}$.`,
        `Arrondi au dixième : $${tex(arrondi(2 * Math.PI * st._v.r, 1))}$ cm.`,
      ],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: "Calcule l'aire du disque (au dixième, en cm²) :",
      generer() {
        const r = randInt(2, 12);
        return { enonce: `Un disque a un rayon de $${r}$ cm. Calcule son aire (arrondie au dixième).`, reponse: arrondi(Math.PI * r * r, 1), validation: 'nombre', tolerance: 0.05, accepte: [arrondi(3.14 * r * r, 1)], _v: { r }, visuel: (x) => { x.innerHTML = figDisque({ r: `${r} cm` }); } };
      },
      indices: ['$\\mathcal{A} = \\pi \\times r^2$.', 'Calcule d\'abord $r^2 = r \\times r$.', 'Multiplie ensuite par $\\pi$ et arrondis.'],
      correction_etapes: (st) => [
        `$r^2 = ${st._v.r} \\times ${st._v.r} = ${st._v.r * st._v.r}$.`,
        `$\\mathcal{A} = ${st._v.r * st._v.r}\\pi \\approx ${tex(arrondi(Math.PI * st._v.r * st._v.r, 3))}$.`,
        `Arrondi au dixième : $${tex(arrondi(Math.PI * st._v.r * st._v.r, 1))}$ cm².`,
      ],
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Calcule le volume du prisme droit (en cm³) :',
      generer() {
        let b, hb; do { b = randInt(3, 12); hb = randInt(2, 10); } while ((b * hb) % 2 !== 0);
        const H = randInt(3, 15);
        return { enonce: `Un prisme droit a pour base un triangle de base $${b}$ cm et de hauteur $${hb}$ cm. La hauteur du prisme est $${H}$ cm. Calcule son volume.`, reponse: ((b * hb) / 2) * H, validation: 'nombre', _v: { b, hb, H } };
      },
      indices: ["$V = \\mathcal{B} \\times h$ où $\\mathcal{B}$ est l'aire de la base.", 'Calcule d\'abord l\'aire du triangle de base.', 'Multiplie ensuite par la hauteur du prisme.'],
      correction_etapes: (st) => [
        `Aire de la base : $\\mathcal{B} = \\dfrac{${st._v.b} \\times ${st._v.hb}}{2} = ${(st._v.b * st._v.hb) / 2}$ cm².`,
        `$V = ${(st._v.b * st._v.hb) / 2} \\times ${st._v.H} = ${((st._v.b * st._v.hb) / 2) * st._v.H}$ cm³.`,
      ],
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Calcule le volume du cylindre (au dixième, en cm³) :',
      generer() {
        const r = randInt(2, 8), h = randInt(3, 15);
        return { enonce: `Un cylindre de révolution a un rayon de $${r}$ cm et une hauteur de $${h}$ cm. Calcule son volume (arrondi au dixième).`, reponse: arrondi(Math.PI * r * r * h, 1), validation: 'nombre', tolerance: 0.05, accepte: [arrondi(3.14 * r * r * h, 1)], _v: { r, h } };
      },
      indices: ['$V = \\pi r^2 h$.', "Calcule d'abord l'aire de la base : $\\pi r^2$.", 'Multiplie par la hauteur, puis arrondis.'],
      correction_etapes: (st) => [
        `Aire de la base : $\\pi \\times ${st._v.r}^2 = ${st._v.r * st._v.r}\\pi$ cm².`,
        `$V = ${st._v.r * st._v.r}\\pi \\times ${st._v.h} = ${st._v.r * st._v.r * st._v.h}\\pi \\approx ${tex(arrondi(Math.PI * st._v.r * st._v.r * st._v.h, 3))}$.`,
        `Arrondi au dixième : $${tex(arrondi(Math.PI * st._v.r * st._v.r * st._v.h, 1))}$ cm³.`,
      ],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Conversion — contenance en litres :',
      generer() {
        const L = pick([10, 20, 25, 30, 40, 50]), l = pick([10, 20, 25, 30]), h = pick([10, 20, 30, 40]);
        return { enonce: `Un aquarium a la forme d'un pavé droit de $${L}$ cm de long, $${l}$ cm de large et $${h}$ cm de haut. Quelle est sa contenance en litres ?`, reponse: (L * l * h) / 1000, validation: 'nombre', _v: { L, l, h } };
      },
      indices: ['Calcule le volume en cm³ : $L \\times \\ell \\times h$.', '$1$ L $= 1\\,000$ cm³.', 'Divise le volume par $1\\,000$.'],
      correction_etapes: (st) => [
        `$V = ${st._v.L} \\times ${st._v.l} \\times ${st._v.h} = ${st._v.L * st._v.l * st._v.h}$ cm³.`,
        `$${st._v.L * st._v.l * st._v.h}$ cm³ $= ${tex((st._v.L * st._v.l * st._v.h) / 1000)}$ L.`,
      ],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: "Aire d'une figure composée (au dixième, en cm²) :",
      generer() {
        const L = randInt(6, 16), l = 2 * randInt(2, 6), r = l / 2;
        return {
          enonce: `Une figure est formée d'un rectangle de $${L}$ cm sur $${l}$ cm, surmonté d'un demi-disque dont le diamètre est le côté de $${l}$ cm. Calcule l'aire totale (arrondie au dixième).`,
          reponse: arrondi(L * l + (Math.PI * r * r) / 2, 1), validation: 'nombre', tolerance: 0.05, accepte: [arrondi(L * l + (3.14 * r * r) / 2, 1)], _v: { L, l, r },
        };
      },
      indices: ['Découpe la figure en deux morceaux connus.', 'Aire du rectangle $+$ aire du demi-disque.', "Demi-disque : $\\dfrac{\\pi r^2}{2}$ avec $r$ la moitié du diamètre."],
      correction_etapes: (st) => [
        `Rectangle : $${st._v.L} \\times ${st._v.l} = ${st._v.L * st._v.l}$ cm².`,
        `Demi-disque de rayon $${st._v.r}$ : $\\dfrac{\\pi \\times ${st._v.r}^2}{2} = \\dfrac{${st._v.r * st._v.r}\\pi}{2} \\approx ${tex(arrondi((Math.PI * st._v.r * st._v.r) / 2, 2))}$ cm².`,
        `Total : $${st._v.L * st._v.l} + ${tex(arrondi((Math.PI * st._v.r * st._v.r) / 2, 2))} \\approx ${tex(arrondi(st._v.L * st._v.l + (Math.PI * st._v.r * st._v.r) / 2, 1))}$ cm².`,
      ],
    },
    {
      id: 'e09', niveau: 1, type: 'complete', consigne: "Complète le calcul de l'aire du triangle :",
      generer() {
        let b, h; do { b = randInt(3, 16); h = randInt(2, 12); } while ((b * h) % 2 !== 0);
        return {
          enonce_complete: `Base $= ${b}$ cm, hauteur $= ${h}$ cm. $b \\times h = $ {0} $\\;$ puis $\\mathcal{A} = $ {1} cm²`,
          champs: [{ reponse: b * h, validation: 'nombre' }, { reponse: (b * h) / 2, validation: 'nombre' }], _v: { b, h },
        };
      },
      indices: ["On multiplie d'abord la base par la hauteur.", 'On divise ensuite par 2.', "L'aire est la moitié du produit $b \\times h$."],
      correction_etapes: (st) => [`$${st._v.b} \\times ${st._v.h} = ${st._v.b * st._v.h}$.`, `$\\mathcal{A} = ${st._v.b * st._v.h} \\div 2 = ${(st._v.b * st._v.h) / 2}$ cm².`],
    },
    {
      id: 'e10', niveau: 2, type: 'qcm', consigne: 'Choisis la bonne conversion :',
      generer() {
        const [q, bon, faux, why] = pick([
          ['$1$ L $=$', '1\\,000 \\text{ cm}^3', ['100 \\text{ cm}^3', '10 \\text{ cm}^3', '1\\,000\\,000 \\text{ cm}^3'], '$1$ L $= 1$ dm³ $= 1\\,000$ cm³.'],
          ['$1$ m³ $=$', '1\\,000 \\text{ L}', ['100 \\text{ L}', '10 \\text{ L}', '1 \\text{ L}'], '$1$ m³ $= 1\\,000$ dm³ $= 1\\,000$ L.'],
          ['$1$ m² $=$', '10\\,000 \\text{ cm}^2', ['100 \\text{ cm}^2', '1\\,000 \\text{ cm}^2', '1\\,000\\,000 \\text{ cm}^2'], '$1$ m $= 100$ cm, donc $1$ m² $= 100 \\times 100 = 10\\,000$ cm².'],
          ['$2\\,500$ cm³ $=$', '2{,}5 \\text{ L}', ['25 \\text{ L}', '0{,}25 \\text{ L}', '250 \\text{ L}'], '$2\\,500 \\div 1\\,000 = 2{,}5$ L.'],
        ]);
        return { enonce: q, choix: [bon, ...faux], correct: 0, _v: { why } };
      },
      indices: ['Aires : facteur $100$ entre deux unités voisines.', 'Volumes : facteur $1\\,000$.', '$1$ L $= 1$ dm³.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e11', niveau: 2, type: 'ordonner_etapes', consigne: "Remets dans l'ordre le calcul du volume du cylindre :",
      generer() {
        const r = randInt(2, 7), h = randInt(3, 12);
        return {
          etapes: [
            `Repérer le rayon $r = ${r}$ cm et la hauteur $h = ${h}$ cm`,
            `Calculer l'aire de la base : $\\pi \\times ${r}^2 = ${r * r}\\pi$ cm²`,
            `Multiplier par la hauteur : $V = ${r * r}\\pi \\times ${h} = ${r * r * h}\\pi$ cm³`,
            `Donner une valeur approchée : $V \\approx ${tex(arrondi(Math.PI * r * r * h, 1))}$ cm³`,
          ],
        };
      },
      indices: ["On lit d'abord les données.", "On calcule l'aire de la base avant le volume.", "On n'arrondit qu'à la fin."],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    {
      type: 'saisie', question: 'Aire du triangle.',
      generer() { const b = 2 * randInt(2, 8), h = randInt(2, 10); return { question: `Aire d'un triangle de base $${b}$ cm et de hauteur $${h}$ cm (en cm²) ?`, reponse: (b * h) / 2, validation: 'nombre', explication: `$\\dfrac{${b} \\times ${h}}{2} = ${(b * h) / 2}$ cm².` }; },
    },
    { type: 'qcm', question: "L'aire d'un disque de rayon $r$ est :", choix: ['\\pi r^2', '2\\pi r', '\\pi d', '2\\pi r^2'], correct: 0, explication: '$2\\pi r$ est le périmètre ; l\'aire est $\\pi r^2$.' },
    { type: 'vrai_faux', question: '$1$ L $= 1\\,000$ cm³.', reponse: true, explication: '$1$ L $= 1$ dm³ $= 1\\,000$ cm³.' },
    {
      type: 'saisie', question: 'Volume du prisme.',
      generer() { const B = randInt(4, 20), h = randInt(2, 12); return { question: `Un prisme droit a une base d'aire $${B}$ cm² et une hauteur de $${h}$ cm. Volume (en cm³) ?`, reponse: B * h, validation: 'nombre', explication: `$V = ${B} \\times ${h} = ${B * h}$ cm³.` }; },
    },
    { type: 'qcm', question: "Pour calculer l'aire d'un parallélogramme, on multiplie la base par :", choix: ['la hauteur', 'le côté oblique', 'la diagonale', 'le périmètre'], correct: 0, explication: 'Aire $= b \\times h$, avec $h$ perpendiculaire à la base.' },
  ],
};
