// =====================================================================
//  r17_pyramides_cones.js — 4ᵉ : pyramide et cône de révolution
//  (vocabulaire, perspective, volume V = B × h ÷ 3, conversions).
//  Figures SVG : pyramide à base carrée et cône en perspective.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, arrondi, svg, seg, txt, point, angleDroit } from '../commun.js';

const PI_TEX = '\\pi';

function figPyramide(l = {}) {
  const A = [40, 180], B = [190, 180], C = [240, 138], D = [90, 138], S = [140, 28], O = [140, 159];
  let s = seg(A, B) + seg(B, C) + seg(C, D, { dash: true, c: 'var(--muted)' }) + seg(D, A, { dash: true, c: 'var(--muted)' });
  s += seg(S, A) + seg(S, B) + seg(S, C) + seg(S, D, { dash: true, c: 'var(--muted)' });
  s += seg(S, O, { dash: true, c: 'var(--t-geometrie)', w: 2 }) + angleDroit(O, S, B, 8);
  s += point(S, 'S', 0, -8, 'var(--text)') + point(O, '', 0, 0, 'var(--t-geometrie)');
  s += txt(A[0] - 10, A[1] + 6, 'A') + txt(B[0] + 10, B[1] + 6, 'B') + txt(C[0] + 10, C[1] + 2, 'C') + txt(D[0] - 10, D[1] - 2, 'D');
  if (l.h) s += txt(152, 100, l.h, { c: 'var(--t-geometrie)', anchor: 'start' });
  if (l.c) s += txt(115, 198, l.c, { c: 'var(--accent-ink)' });
  return svg(280, 210, s, 'pyramide à base carrée ABCD de sommet S', 'fig-chap');
}

function figCone(l = {}) {
  const O = [140, 172], S = [140, 30], rx = 90, ry = 22;
  let s = `<path d="M ${O[0] - rx} ${O[1]} A ${rx} ${ry} 0 0 0 ${O[0] + rx} ${O[1]}" fill="none" stroke="var(--text)" stroke-width="2"/>`;
  s += `<path d="M ${O[0] - rx} ${O[1]} A ${rx} ${ry} 0 0 1 ${O[0] + rx} ${O[1]}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += seg(S, [O[0] - rx, O[1]]) + seg(S, [O[0] + rx, O[1]]);
  s += seg(S, O, { dash: true, c: 'var(--t-geometrie)' }) + seg(O, [O[0] + rx, O[1]], { c: 'var(--accent)', w: 2.4 }) + angleDroit(O, S, [O[0] + rx, O[1]], 8);
  s += point(S, 'S', 0, -8, 'var(--text)') + point(O, 'O', -12, 12, 'var(--text)');
  if (l.h) s += txt(150, 110, l.h, { c: 'var(--t-geometrie)', anchor: 'start' });
  if (l.r) s += txt(185, 190, l.r, { c: 'var(--accent-ink)' });
  return svg(280, 210, s, 'cône de révolution de sommet S et de base le disque de centre O', 'fig-chap');
}

/** Tire r et h pour que r² × h soit un multiple de 3 (volume exact = k π). */
function tirageCone() {
  let r, h; do { r = randInt(2, 9); h = randInt(3, 15); } while ((r * r * h) % 3 !== 0);
  return { r, h, k: (r * r * h) / 3 };
}

export default {
  id: 'r17',
  titre: 'Pyramides et cônes',
  theme: 'geometrie', niveau: '4e',
  icone: '🔻',

  intro:
    "Les pyramides d'Égypte, les cornets de glace, les entonnoirs, les toits pointus… On apprend à reconnaître et " +
    "représenter une <strong>pyramide</strong> et un <strong>cône de révolution</strong>, et surtout à calculer leur " +
    "volume : c'est le tiers du volume du prisme (ou du cylindre) de même base et de même hauteur. " +
    "Ces volumes reviennent en 3ᵉ avec les sections et les agrandissements.",

  cours: [
    {
      type: 'definition', titre: 'Pyramide',
      contenu: "Une pyramide est un solide dont une face, la <strong>base</strong>, est un polygone, et dont les autres faces (les <strong>faces latérales</strong>) sont des triangles qui ont un sommet commun, le <strong>sommet</strong> de la pyramide. La <strong>hauteur</strong> est la distance entre le sommet et le plan de la base (segment perpendiculaire à la base). Une pyramide dont la base a $n$ côtés a $n + 1$ faces, $n + 1$ sommets et $2n$ arêtes.",
    },
    {
      type: 'definition', titre: 'Cône de révolution',
      contenu: "Un cône de révolution est obtenu en faisant tourner un triangle rectangle autour d'un des côtés de l'angle droit. Sa base est un <strong>disque</strong> de rayon $r$, son sommet $S$ est à la verticale du centre $O$ de la base, et la hauteur est $h = SO$.",
    },
    { type: 'figure', titre: 'En perspective cavalière', contenu: "Les arêtes cachées sont en pointillés. La hauteur (en violet) est perpendiculaire à la base.", render: (host) => { host.innerHTML = `<div class="fig-rangee">${figPyramide()}${figCone()}</div>`; } },
    {
      type: 'propriete', titre: 'Volume d\'une pyramide et d\'un cône',
      contenu: "Le volume d'une pyramide ou d'un cône est le <strong>tiers</strong> du produit de l'aire de la base $\\mathcal{B}$ par la hauteur $h$. Pour un cône, la base est un disque d'aire $\\pi r^2$.",
      formule: 'V = \\dfrac{\\mathcal{B} \\times h}{3} \\qquad V_{\\text{cône}} = \\dfrac{\\pi \\times r^2 \\times h}{3}',
    },
    {
      type: 'propriete', titre: 'Unités de volume',
      contenu: "$1\\text{ dm}^3 = 1\\,000\\text{ cm}^3 = 1$ L et $1\\text{ m}^3 = 1\\,000$ L. Toutes les longueurs doivent être dans la même unité avant de calculer.",
    },
    {
      type: 'exemple', enonce: 'Calculer le volume d\'un cône de rayon $3$ cm et de hauteur $5$ cm, en valeur exacte puis arrondi au cm³.',
      solution_etapes: ["Aire de la base : $\\pi \\times 3^2 = 9\\pi$ cm².", "$V = \\dfrac{9\\pi \\times 5}{3} = \\dfrac{45\\pi}{3} = 15\\pi$ cm³ (valeur exacte).", "$V \\approx 15 \\times 3{,}1416 \\approx 47$ cm³."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Identifier la base et la hauteur', explication: "La hauteur est perpendiculaire à la base (ce n'est pas la longueur d'une arête ou d'une génératrice)." },
    { etape: 2, titre: 'Calculer l\'aire de la base', explication: "Carré $c^2$, rectangle $L \\times \\ell$, triangle $\\dfrac{b \\times h}{2}$, disque $\\pi r^2$." },
    { etape: 3, titre: 'Appliquer la formule', explication: "$V = \\dfrac{\\mathcal{B} \\times h}{3}$ : n'oublie pas de diviser par 3." },
    { etape: 4, titre: 'Arrondir et convertir', explication: "Valeur exacte avec $\\pi$, puis valeur approchée ; conversion en litres si demandé ($1$ L $= 1\\,000$ cm³)." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Compte les éléments de la pyramide :',
      generer() {
        const [n, nom] = pick([[3, 'triangle'], [4, 'quadrilatère'], [5, 'pentagone'], [6, 'hexagone'], [8, 'octogone']]);
        const [quoi, rep] = pick([['faces', n + 1], ['sommets', n + 1], ['arêtes', 2 * n]]);
        return { enonce: `Une pyramide a pour base un ${nom} (${n} côtés). Combien a-t-elle de ${quoi} ?`, reponse: rep, validation: 'nombre', _v: { n, quoi } };
      },
      indices: ['Compte d\'abord ce qui est dans la base, puis ce qui part du sommet.', 'Faces : la base + une face triangulaire par côté de la base.', 'Arêtes : celles de la base + une arête par sommet de la base.'],
      correction_etapes(st) {
        const { n, quoi } = st._v;
        if (quoi === 'faces') return [`La base compte pour $1$ face, et il y a une face latérale par côté de la base : $${n}$.`, `$1 + ${n} = ${n + 1}$ faces.`];
        if (quoi === 'sommets') return [`La base a $${n}$ sommets, et on ajoute le sommet de la pyramide.`, `$${n} + 1 = ${n + 1}$ sommets.`];
        return [`La base a $${n}$ arêtes, et $${n}$ arêtes latérales relient le sommet à chaque sommet de la base.`, `$${n} + ${n} = ${2 * n}$ arêtes.`];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule le volume de la pyramide (en cm³) :',
      generer() {
        let B, h; do { B = randInt(4, 40); h = randInt(3, 15); } while ((B * h) % 3 !== 0);
        return { enonce: `Une pyramide a une base d'aire $${B}$ cm² et une hauteur de $${h}$ cm. Calcule son volume.`, reponse: (B * h) / 3, validation: 'nombre', _v: { B, h } };
      },
      indices: ['$V = \\dfrac{\\mathcal{B} \\times h}{3}$.', 'Multiplie l\'aire de la base par la hauteur.', 'Divise par 3.'],
      correction_etapes: (st) => [`$V = \\dfrac{\\mathcal{B} \\times h}{3} = \\dfrac{${st._v.B} \\times ${st._v.h}}{3}$.`, `$V = \\dfrac{${st._v.B * st._v.h}}{3} = ${(st._v.B * st._v.h) / 3}$ cm³.`],
    },
    {
      id: 'e03', niveau: 1, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const [e, r, why] = pick([
          ['Les faces latérales d\'une pyramide sont des triangles.', true, 'Elles relient chaque côté de la base au sommet : ce sont des triangles.'],
          ['La base d\'un cône de révolution est un disque.', true, 'On fait tourner un triangle rectangle : la base décrite est un disque.'],
          ['Le volume d\'une pyramide est égal à aire de la base × hauteur.', false, 'Il faut diviser par 3 : $V = \\dfrac{\\mathcal{B} \\times h}{3}$.'],
          ['Une pyramide à base carrée a 4 faces.', false, 'Elle a la base carrée + 4 faces triangulaires : 5 faces.'],
          ['La hauteur d\'un cône est la longueur de sa génératrice.', false, 'La hauteur $SO$ est perpendiculaire à la base ; la génératrice est plus longue.'],
          ['Une pyramide de base triangulaire a 4 sommets.', true, 'Les 3 sommets de la base et le sommet de la pyramide.'],
          ['Le volume d\'un cône est le tiers de celui du cylindre de même base et même hauteur.', true, '$V_{\\text{cône}} = \\dfrac{\\pi r^2 h}{3}$ et $V_{\\text{cylindre}} = \\pi r^2 h$.'],
        ]);
        return { enonce: e, reponse: r, _v: { why } };
      },
      indices: ['Pense à une pyramide ou un cône que tu connais.', 'Compte faces, sommets, arêtes sur la figure du cours.', 'Rappel : $V = \\dfrac{\\mathcal{B} \\times h}{3}$.'],
      correction_etapes: (st) => [st._v.why, `Réponse : ${st.reponse ? 'vrai' : 'faux'}.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule le volume (en cm³) :',
      generer() {
        let L, l, h; do { L = randInt(3, 12); l = randInt(2, 10); h = randInt(3, 15); } while ((L * l * h) % 3 !== 0);
        const carre = Math.random() < 0.4; if (carre) l = L;
        if ((L * l * h) % 3 !== 0) h = 3 * randInt(1, 5);
        return {
          enonce: carre ? `Une pyramide a pour base un carré de côté $${L}$ cm et pour hauteur $${h}$ cm. Calcule son volume.` : `Une pyramide a pour base un rectangle de $${L}$ cm sur $${l}$ cm et pour hauteur $${h}$ cm. Calcule son volume.`,
          reponse: (L * l * h) / 3, validation: 'nombre', _v: { L, l, h, carre },
          visuel: carre ? (host) => { host.innerHTML = figPyramide({ h: `${h} cm`, c: `${L} cm` }); } : undefined,
        };
      },
      indices: ['Calcule d\'abord l\'aire de la base.', 'Carré : $c \\times c$ ; rectangle : $L \\times \\ell$.', 'Puis $V = \\dfrac{\\mathcal{B} \\times h}{3}$.'],
      correction_etapes(st) {
        const { L, l, h } = st._v, B = L * l;
        return [`Aire de la base : $\\mathcal{B} = ${L} \\times ${l} = ${B}$ cm².`, `$V = \\dfrac{${B} \\times ${h}}{3} = \\dfrac{${B * h}}{3} = ${(B * h) / 3}$ cm³.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'complete', consigne: 'Volume d\'un cône : valeur exacte puis arrondi :',
      generer() {
        const { r, h, k } = tirageCone();
        return {
          enonce_complete: `Cône de rayon $${r}$ cm et de hauteur $${h}$ cm : $V = \\dfrac{${PI_TEX} \\times ${r}^2 \\times ${h}}{3} = $ {0} $${PI_TEX}$ cm³ $\\approx$ {1} cm³ (arrondi à l'unité)`,
          champs: [{ reponse: k, validation: 'nombre' }, { reponse: Math.round(k * Math.PI), validation: 'nombre', tolerance: 0.5, accepte: [Math.round(k * 3.14)] }],
          visuel: (host) => { host.innerHTML = figCone({ h: `${h} cm`, r: `${r} cm` }); },
          _v: { r, h, k },
        };
      },
      indices: ['$r^2 = r \\times r$.', 'Calcule $r^2 \\times h$, puis divise par 3 : c\'est le nombre devant $\\pi$.', 'Multiplie ensuite par $\\pi \\approx 3{,}1416$ et arrondis.'],
      correction_etapes(st) {
        const { r, h, k } = st._v;
        return [`$${r}^2 \\times ${h} = ${r * r} \\times ${h} = ${r * r * h}$.`, `$V = \\dfrac{${r * r * h}${PI_TEX}}{3} = ${k}${PI_TEX}$ cm³.`, `$${k} \\times ${PI_TEX} \\approx ${tex(arrondi(k * Math.PI, 2))}$, soit $${Math.round(k * Math.PI)}$ cm³ à l'unité près.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Calcule le volume du cône arrondi au dixième (en cm³) :',
      generer() {
        const r = randInt(2, 8), h = randInt(4, 14), V = (Math.PI * r * r * h) / 3;
        return {
          enonce: `Un cône de révolution a un rayon de $${r}$ cm et une hauteur de $${h}$ cm. Calcule son volume arrondi au dixième.`,
          reponse: arrondi(V, 1), validation: 'nombre', tolerance: 0.05, accepte: [arrondi((3.14 * r * r * h) / 3, 1)], _v: { r, h, V },
          visuel: (host) => { host.innerHTML = figCone({ h: `${h} cm`, r: `${r} cm` }); },
        };
      },
      indices: ['$V = \\dfrac{\\pi \\times r^2 \\times h}{3}$.', 'Utilise la touche $\\pi$ de la calculatrice.', 'Arrondis au dixième.'],
      correction_etapes(st) {
        const { r, h, V } = st._v;
        return [`$V = \\dfrac{\\pi \\times ${r}^2 \\times ${h}}{3} = \\dfrac{${r * r * h}\\pi}{3}$ cm³.`, `$V \\approx ${tex(arrondi(V, 3))}$, soit $${tex(arrondi(V, 1))}$ cm³ au dixième.`];
      },
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Retrouve la hauteur de la pyramide (en cm) :',
      generer() {
        let B, h, V;
        do { B = pick([12, 15, 16, 20, 24, 25, 30, 36, 40, 45, 48]); h = randInt(3, 15); V = (B * h) / 3; } while (!Number.isInteger(V));
        return { enonce: `Une pyramide a un volume de $${V}$ cm³ et une base d'aire $${B}$ cm². Quelle est sa hauteur ?`, reponse: h, validation: 'nombre', _v: { B, h, V } };
      },
      indices: ['Pars de $V = \\dfrac{\\mathcal{B} \\times h}{3}$.', 'Donc $\\mathcal{B} \\times h = 3 \\times V$.', '$h = \\dfrac{3 \\times V}{\\mathcal{B}}$.'],
      correction_etapes: (st) => [`$V = \\dfrac{\\mathcal{B} \\times h}{3}$ donc $\\mathcal{B} \\times h = 3 \\times V = 3 \\times ${st._v.V} = ${3 * st._v.V}$.`, `$h = \\dfrac{${3 * st._v.V}}{${st._v.B}} = ${st._v.h}$ cm.`],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Problème — contenance en litres :',
      generer() {
        const c = pick([10, 20, 30, 40, 60]), h = pick([12, 15, 24, 30, 45, 60]), V = (c * c * h) / 3;
        return { enonce: `Un réservoir a la forme d'une pyramide (pointe en bas) à base carrée de $${c}$ cm de côté et de $${h}$ cm de hauteur. Quelle est sa contenance en litres ?`, reponse: V / 1000, validation: 'nombre', _v: { c, h, V } };
      },
      indices: ['Calcule le volume en cm³.', '$1$ L $= 1\\,000$ cm³.', 'Divise le volume en cm³ par $1\\,000$.'],
      correction_etapes: (st) => [`Aire de la base : $${st._v.c}^2 = ${st._v.c * st._v.c}$ cm².`, `$V = \\dfrac{${st._v.c * st._v.c} \\times ${st._v.h}}{3} = ${st._v.V}$ cm³.`, `$${st._v.V}$ cm³ $= ${tex(st._v.V / 1000)}$ L.`],
    },
    {
      id: 'e09', niveau: 3, type: 'qcm', consigne: 'Raisonne sur la formule du volume :',
      generer() {
        const [enonce, correct, why] = pick([
          ['On double la hauteur d\'un cône (sans changer le rayon). Son volume est :', 'multiplié par 2', 'Le volume est proportionnel à la hauteur : $\\dfrac{\\pi r^2 \\times (2h)}{3} = 2 \\times \\dfrac{\\pi r^2 h}{3}$.'],
          ['On double le rayon d\'un cône (sans changer la hauteur). Son volume est :', 'multiplié par 4', '$(2r)^2 = 4r^2$ : le volume est multiplié par $4$.'],
          ['On triple la hauteur d\'une pyramide (même base). Son volume est :', 'multiplié par 3', '$\\dfrac{\\mathcal{B} \\times 3h}{3} = 3 \\times \\dfrac{\\mathcal{B} h}{3}$.'],
          ['On triple le rayon d\'un cône (même hauteur). Son volume est :', 'multiplié par 9', '$(3r)^2 = 9r^2$ : le volume est multiplié par $9$.'],
        ]);
        const choix = [correct, ...['multiplié par 2', 'multiplié par 3', 'multiplié par 4', 'multiplié par 6', 'multiplié par 9'].filter((c) => c !== correct).slice(0, 3)];
        return { enonce, choix, correct: 0, _v: { why } };
      },
      indices: ['Écris la formule du volume.', 'Remplace $h$ par $2h$ (ou $r$ par $2r$).', 'Attention : le rayon est au carré.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e10', niveau: 1, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul du volume du cône :',
      generer() {
        const { r, h, k } = tirageCone();
        return {
          etapes: [
            `Repérer le rayon $r = ${r}$ cm et la hauteur $h = ${h}$ cm`,
            `Calculer l'aire de la base : $\\pi \\times ${r}^2 = ${r * r}\\pi$ cm²`,
            `Appliquer la formule : $V = \\dfrac{${r * r}\\pi \\times ${h}}{3} = ${k}\\pi$ cm³`,
            `Donner une valeur approchée : $V \\approx ${Math.round(k * Math.PI)}$ cm³`,
          ],
        };
      },
      indices: ['On lit d\'abord les données.', 'La base est un disque : on calcule son aire.', 'On arrondit seulement à la fin.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Le volume d\'une pyramide de base $\\mathcal{B}$ et de hauteur $h$ est :', choix: ['\\dfrac{\\mathcal{B} \\times h}{3}', '\\mathcal{B} \\times h', '\\dfrac{\\mathcal{B} \\times h}{2}', '3 \\times \\mathcal{B} \\times h'], correct: 0, explication: '$V = \\dfrac{\\mathcal{B} \\times h}{3}$.' },
    {
      type: 'saisie', question: 'Volume d\'une pyramide.',
      generer() { const c = pick([3, 6, 9]), h = randInt(2, 10); return { question: `Pyramide à base carrée de côté $${c}$ cm, hauteur $${h}$ cm. Volume en cm³ ?`, reponse: (c * c * h) / 3, validation: 'nombre', explication: `$\\dfrac{${c * c} \\times ${h}}{3} = ${(c * c * h) / 3}$ cm³.` }; },
    },
    { type: 'saisie', question: 'Combien d\'arêtes a une pyramide à base hexagonale ?', reponse: 12, validation: 'nombre', explication: '6 arêtes pour la base + 6 arêtes latérales = 12.' },
    {
      type: 'saisie', question: 'Volume exact d\'un cône.',
      generer() { const { r, h, k } = tirageCone(); return { question: `Cône de rayon $${r}$ cm et hauteur $${h}$ cm : $V = k\\pi$ cm³. Que vaut $k$ ?`, reponse: k, validation: 'nombre', explication: `$\\dfrac{${r}^2 \\times ${h}}{3} = \\dfrac{${r * r * h}}{3} = ${k}$.` }; },
    },
    { type: 'vrai_faux', question: '$1$ L $= 1\\,000$ cm³.', reponse: true, explication: '$1$ L $= 1$ dm³ $= 1\\,000$ cm³.' },
  ],
};
