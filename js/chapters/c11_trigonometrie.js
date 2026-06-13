// =====================================================================
//  c11_trigonometrie.js — cos, sin, tan dans le triangle rectangle
//  Figure SVG d'un triangle rectangle annoté.
// =====================================================================

import { randInt, pick } from '../engine.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const deg2rad = (d) => (d * Math.PI) / 180;
const round1 = (x) => Math.round(x * 10) / 10;

// Petit triangle rectangle annoté (angle en B, angle droit en C).
function triangleSVG(host, { angle = 35, hyp = 'AB', opp = 'AC', adj = 'BC', labels = {} } = {}) {
  const W = 300, H = 200, ax = 40, ay = 170; // B en bas à gauche
  const cx = 250, cy = 170;                   // C en bas à droite (angle droit)
  const topx = 250, topy = 40;               // A en haut
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'svg-plot');
  const line = (x1, y1, x2, y2, c = '#8a6fb0') => {
    const l = document.createElementNS(SVGNS, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', c); l.setAttribute('stroke-width', '2.5'); svg.appendChild(l);
  };
  const txt = (x, y, s, c = 'var(--text)') => {
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('fill', c);
    t.setAttribute('font-size', '14'); t.setAttribute('font-weight', '600'); t.textContent = s; svg.appendChild(t);
  };
  line(ax, ay, cx, cy);          // BC (adjacent)
  line(cx, cy, topx, topy);      // CA (opposé)
  line(ax, ay, topx, topy);      // BA (hypoténuse)
  // marque de l'angle droit en C
  const sq = document.createElementNS(SVGNS, 'path');
  sq.setAttribute('d', `M ${cx - 14} ${cy} L ${cx - 14} ${cy - 14} L ${cx} ${cy - 14}`);
  sq.setAttribute('fill', 'none'); sq.setAttribute('stroke', '#888'); svg.appendChild(sq);
  // sommets
  txt(ax - 14, ay + 4, 'B'); txt(cx + 6, cy + 4, 'C'); txt(topx + 6, topy, 'A');
  // angle en B
  txt(ax + 18, ay - 6, '?°' in labels ? labels['?°'] : `${angle}°`, '#c0894a');
  // étiquettes des côtés
  txt((ax + cx) / 2 - 6, cy + 18, labels.adj || adj);
  txt((cx + topx) / 2 + 8, (cy + topy) / 2, labels.opp || opp);
  txt((ax + topx) / 2 - 28, (ay + topy) / 2 - 4, labels.hyp || hyp);
  host.appendChild(svg);
}

export default {
  id: 'c11',
  titre: 'Trigonométrie',
  theme: 'geometrie',
  priorite: true,
  icone: '🔺',

  intro:
    "La trigonométrie relie les <em>angles</em> et les <em>longueurs</em> dans un triangle rectangle. " +
    "Elle permet de calculer une hauteur à partir d'un angle (toit, pente, rampe d'accès) ou de retrouver " +
    "un angle connaissant deux côtés. Le moyen mnémotechnique : <strong>SOH-CAH-TOA</strong>.",

  cours: [
    { type: 'definition', titre: 'Les trois rapports', contenu: "Dans un triangle rectangle, pour un angle aigu $\\alpha$ :", formule: '\\cos\\alpha = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}},\\quad \\sin\\alpha = \\dfrac{\\text{opposé}}{\\text{hypoténuse}},\\quad \\tan\\alpha = \\dfrac{\\text{opposé}}{\\text{adjacent}}' },
    {
      type: 'figure', titre: 'Repérer les côtés',
      contenu: "L'<strong>hypoténuse</strong> est face à l'angle droit. L'<strong>opposé</strong> est face à l'angle $\\alpha$, l'<strong>adjacent</strong> le touche.",
      render: (host) => triangleSVG(host, { angle: 35 }),
    },
    {
      type: 'exemple', enonce: 'Triangle rectangle en $C$. $\\widehat{B}=30°$, $AB=10$. Calculer $AC$ (opposé à $\\widehat B$).',
      solution_etapes: [
        "$AC$ est opposé, $AB$ est l'hypoténuse → on utilise le sinus.",
        "$\\sin(30°) = \\dfrac{AC}{AB} = \\dfrac{AC}{10}$.",
        "$AC = 10 \\times \\sin(30°) = 10 \\times 0{,}5 = 5$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer l\'angle et les côtés', explication: "Identifie l'hypoténuse, le côté opposé et le côté adjacent à l'angle considéré." },
    { etape: 2, titre: 'Choisir le bon rapport', explication: "Selon les deux côtés (connu + cherché), choisis cos, sin ou tan (SOH-CAH-TOA)." },
    { etape: 3, titre: 'Écrire l\'égalité', explication: "Par exemple $\\cos\\alpha = \\dfrac{\\text{adj}}{\\text{hyp}}$." },
    { etape: 4, titre: 'Calculer', explication: "Pour une longueur : isole l'inconnue. Pour un angle : utilise $\\cos^{-1}, \\sin^{-1}$ ou $\\tan^{-1}$ à la calculatrice (en degrés)." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule le côté opposé (arrondi au dixième) :',
      generer() {
        const ang = pick([20, 25, 30, 35, 40, 45, 50, 55, 60]), hyp = randInt(6, 14);
        return {
          enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, hypoténuse $= ${hyp}$. Calcule le côté opposé à $\\widehat B$.`,
          reponse: round1(hyp * Math.sin(deg2rad(ang))), validation: 'nombre', tolerance: 0.02,
          visuel: (c) => triangleSVG(c, { angle: ang, hyp: String(hyp), opp: '?', adj: '' }),
        };
      },
      indices: ['Opposé et hypoténuse → sinus (SOH).', '$\\sin\\alpha = \\dfrac{\\text{opposé}}{\\text{hyp}}$.', 'Opposé $= \\text{hyp}\\times\\sin\\alpha$. Calculatrice en degrés !'],
      correction_detaillee: () => `<p>opposé $= \\text{hypoténuse}\\times\\sin(\\alpha)$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule le côté adjacent (arrondi au dixième) :',
      generer() {
        const ang = pick([20, 25, 30, 35, 40, 45, 50, 55, 60]), hyp = randInt(6, 14);
        return {
          enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, hypoténuse $= ${hyp}$. Calcule le côté adjacent à $\\widehat B$.`,
          reponse: round1(hyp * Math.cos(deg2rad(ang))), validation: 'nombre', tolerance: 0.02,
          visuel: (c) => triangleSVG(c, { angle: ang, hyp: String(hyp), adj: '?', opp: '' }),
        };
      },
      indices: ['Adjacent et hypoténuse → cosinus (CAH).', '$\\cos\\alpha = \\dfrac{\\text{adjacent}}{\\text{hyp}}$.', 'Adjacent $= \\text{hyp}\\times\\cos\\alpha$.'],
      correction_detaillee: () => `<p>adjacent $= \\text{hypoténuse}\\times\\cos(\\alpha)$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule l\'angle (en degrés, arrondi au degré) :',
      generer() {
        const opp = randInt(3, 8), adj = randInt(3, 8);
        return {
          enonce: `Triangle rectangle. Côté opposé à $\\widehat B = ${opp}$, côté adjacent $= ${adj}$. Calcule $\\widehat B$.`,
          reponse: Math.round(Math.atan(opp / adj) * 180 / Math.PI), validation: 'nombre', tolerance: 0.06,
          visuel: (c) => triangleSVG(c, { angle: 40, opp: String(opp), adj: String(adj), hyp: '', labels: { '?°': '?°' } }),
        };
      },
      indices: ['Opposé et adjacent → tangente (TOA).', '$\\tan\\widehat B = \\dfrac{\\text{opposé}}{\\text{adjacent}}$.', '$\\widehat B = \\tan^{-1}\\!\\left(\\dfrac{\\text{opp}}{\\text{adj}}\\right)$.'],
      correction_detaillee: () => `<p>$\\widehat B = \\tan^{-1}\\!\\left(\\dfrac{\\text{opposé}}{\\text{adjacent}}\\right)$, calculatrice en degrés.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Quel rapport utiliser ?',
      generer() {
        const known = pick(['hypoténuse', 'adjacent', 'opposé']);
        const cherche = pick(['opposé', 'adjacent'].filter((x) => x !== known));
        const map = (a, b) => {
          const set = new Set([a, b]);
          if (set.has('opposé') && set.has('hypoténuse')) return 'sinus';
          if (set.has('adjacent') && set.has('hypoténuse')) return 'cosinus';
          return 'tangente';
        };
        const good = map(known, cherche);
        const choix = ['cosinus', 'sinus', 'tangente'];
        return {
          enonce: `On connaît le côté <strong>${known}</strong> et on cherche le côté <strong>${cherche}</strong>. Quel rapport relie ces deux côtés (avec l'angle) ?`,
          choix, correct: choix.indexOf(good),
        };
      },
      indices: ['SOH : Sinus = Opposé/Hyp.', 'CAH : Cosinus = Adjacent/Hyp.', 'TOA : Tangente = Opposé/Adjacent.'],
      correction_detaillee: () => `<p>On choisit le rapport qui relie exactement les deux côtés en jeu.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule l\'hypoténuse (arrondi au dixième) :',
      generer() {
        const ang = pick([25, 30, 35, 40, 50, 55, 60]), opp = randInt(4, 10);
        return {
          enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, côté opposé à $\\widehat B = ${opp}$. Calcule l'hypoténuse.`,
          reponse: round1(opp / Math.sin(deg2rad(ang))), validation: 'nombre', tolerance: 0.03,
          visuel: (c) => triangleSVG(c, { angle: ang, opp: String(opp), hyp: '?', adj: '' }),
          _v: { ang, opp },
        };
      },
      indices: ['$\\sin\\alpha = \\dfrac{\\text{opposé}}{\\text{hyp}}$.', 'Ici l\'inconnue est au dénominateur.', 'hyp $= \\dfrac{\\text{opposé}}{\\sin\\alpha}$.'],
      correction_etapes(st) {
        const { ang, opp } = st._v; const hyp = round1(opp / Math.sin(deg2rad(ang)));
        return [
          `On connaît l'opposé et on cherche l'hypoténuse → sinus (SOH).`,
          `$\\sin(${ang}°) = \\dfrac{\\text{opposé}}{\\text{hyp}} = \\dfrac{${opp}}{\\text{hyp}}$.`,
          `L'inconnue est au dénominateur : $\\text{hyp} = \\dfrac{${opp}}{\\sin(${ang}°)} \\approx ${hyp}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule le côté opposé via la tangente (arrondi au dixième) :',
      generer() {
        const ang = pick([20, 25, 30, 35, 40, 50, 55]), adj = randInt(4, 12);
        return {
          enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, côté adjacent $= ${adj}$. Calcule le côté opposé.`,
          reponse: round1(adj * Math.tan(deg2rad(ang))), validation: 'nombre', tolerance: 0.03,
          visuel: (c) => triangleSVG(c, { angle: ang, adj: String(adj), opp: '?', hyp: '' }),
        };
      },
      indices: ['Opposé et adjacent → tangente.', '$\\tan\\alpha = \\dfrac{\\text{opposé}}{\\text{adjacent}}$.', 'opposé $= \\text{adjacent}\\times\\tan\\alpha$.'],
      correction_detaillee: () => `<p>opposé $= \\text{adjacent}\\times\\tan(\\alpha)$.</p>`,
    },

    // ----- Niveau 1 : Compléter un calcul de côté (angle remarquable) -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète le calcul (angle de 30°) :',
      generer() {
        const hyp = 2 * randInt(3, 8), opp = hyp * 0.5; // 30° : sin(30°) = 0,5
        return {
          enonce_complete: `$\\widehat{B}=30°$, hypoténuse $= ${hyp}$. $\\sin(30°) = $ {0} $\\;$ donc opposé $= ${hyp} \\times \\sin(30°) = $ {1}`,
          champs: [
            { reponse: 0.5, validation: 'nombre', tolerance: 0.001 },
            { reponse: opp, validation: 'nombre' },
          ],
          visuel: (c) => triangleSVG(c, { angle: 30, hyp: String(hyp), opp: '?', adj: '' }),
          _v: { hyp, opp },
        };
      },
      indices: ['$\\sin(30°)$ est une valeur à connaître : $0{,}5$.', 'opposé $= \\text{hyp}\\times\\sin(\\alpha)$.', 'On multiplie l\'hypoténuse par $0{,}5$.'],
      correction_etapes(st) {
        const { hyp, opp } = st._v;
        return [
          `On utilise le sinus : $\\sin(30°) = 0{,}5$.`,
          `opposé $= \\text{hyp}\\times\\sin(30°) = ${hyp}\\times 0{,}5 = ${opp}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes (SOH-CAH-TOA) -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre la résolution trigonométrique :',
      generer() {
        const ang = pick([25, 30, 35, 40, 50, 55]), hyp = randInt(6, 14); const opp = round1(hyp * Math.sin(deg2rad(ang)));
        return {
          etapes: [
            `Repérer les côtés : on connaît l'hypoténuse, on cherche l'opposé à $\\widehat B$`,
            `Choisir le rapport : opposé et hypoténuse → sinus (SOH)`,
            `Écrire l'égalité : $\\sin(${ang}°) = \\dfrac{\\text{opposé}}{${hyp}}$`,
            `Isoler et calculer : opposé $= ${hyp}\\times\\sin(${ang}°) \\approx ${opp}$`,
          ],
        };
      },
      indices: ['On repère d\'abord quels côtés sont en jeu.', 'On choisit cos, sin ou tan selon ces côtés.', 'Le calcul vient en dernier.'],
      correction_detaillee: () => `<p>Ordre : repérer les côtés → choisir le rapport (SOH-CAH-TOA) → écrire l'égalité → calculer.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'L\'hypoténuse d\'un triangle rectangle est :', choix: ["le côté face à l'angle droit", "le plus petit côté", "n'importe quel côté", "le côté adjacent"], correct: 0, explication: "L'hypoténuse est toujours le côté opposé à l'angle droit (le plus long)." },
    { type: 'qcm', question: '$\\sin\\alpha$ est égal à :', choix: ['\\dfrac{opposé}{hypoténuse}', '\\dfrac{adjacent}{hypoténuse}', '\\dfrac{opposé}{adjacent}', '\\dfrac{hypoténuse}{opposé}'], correct: 0, explication: 'SOH : Sinus = Opposé / Hypoténuse.' },
    {
      type: 'saisie', question: 'Calcule un côté opposé.',
      generer() { const ang = pick([20, 25, 30, 35, 40, 45, 50, 55, 60]), hyp = randInt(6, 14); return { question: `$\\widehat B = ${ang}°$ et hypoténuse $= ${hyp}$. Calcule le côté opposé (arrondi au dixième).`, reponse: round1(hyp * Math.sin(deg2rad(ang))), validation: 'nombre', tolerance: 0.05, explication: `opposé $= ${hyp}\\times\\sin(${ang}°)$.` }; },
    },
    { type: 'vrai_faux', question: 'Pour trouver un angle connaissant opposé et adjacent, on utilise $\\tan^{-1}$.', reponse: true, explication: 'Oui : $\\widehat B = \\tan^{-1}(\\text{opp}/\\text{adj})$.' },
    {
      type: 'saisie', question: 'Valeur trigonométrique remarquable.',
      generer() { const t = pick([['\\cos(60°)', 0.5], ['\\sin(30°)', 0.5], ['\\cos(0°)', 1], ['\\sin(90°)', 1], ['\\sin(0°)', 0], ['\\cos(90°)', 0]]); return { question: `$${t[0]} = ?$ (valeur décimale)`, reponse: t[1], validation: 'nombre', tolerance: 0.02, explication: `$${t[0]} = ${String(t[1]).replace('.', '{,}')}$.` }; },
    },
  ],
};
