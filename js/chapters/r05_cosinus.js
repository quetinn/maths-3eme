// =====================================================================
//  r05_cosinus.js — Rappel de 4ᵉ : cosinus dans le triangle rectangle.
//  Prérequis direct de la trigonométrie (chap. 11).
//  Figure interactive : triangle rectangle, slider de l'angle → cos en direct.
// =====================================================================

import { randInt, pick } from '../engine.js';

const deg2rad = (d) => (d * Math.PI) / 180;
const round1 = (x) => Math.round(x * 10) / 10;

// Triangle rectangle interactif : on règle l'angle, on lit le cosinus.
function cosinusInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>angle&nbsp;<input type="range" min="15" max="75" value="35" data-ang> <span class="fig-val" data-angv></span>°</label></div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const ang = +wrap.querySelector('[data-ang]').value; wrap.querySelector('[data-angv]').textContent = ang;
    const rad = deg2rad(ang), L = 168;
    const adj = L * Math.cos(rad), opp = L * Math.sin(rad);
    const W = 320, H = 215, bx = 28, by = 184;
    const cx = bx + adj, ax = cx, ay = by - opp;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="triangle rectangle">`;
    g += `<line x1="${bx}" y1="${by}" x2="${cx.toFixed(1)}" y2="${by}" stroke="var(--accent)" stroke-width="2.5"/>`;
    g += `<line x1="${cx.toFixed(1)}" y1="${by}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="var(--muted)" stroke-width="2.5"/>`;
    g += `<line x1="${bx}" y1="${by}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="var(--t-geometrie)" stroke-width="2.5"/>`;
    g += `<path d="M ${(cx - 13).toFixed(1)} ${by} L ${(cx - 13).toFixed(1)} ${by - 13} L ${cx.toFixed(1)} ${by - 13}" fill="none" stroke="var(--muted)"/>`;
    g += `<text x="${bx - 9}" y="${by + 5}" font-size="13" font-weight="600" fill="var(--text)">B</text>`;
    g += `<text x="${(cx + 5).toFixed(1)}" y="${by + 15}" font-size="13" font-weight="600" fill="var(--text)">C</text>`;
    g += `<text x="${(ax + 5).toFixed(1)}" y="${ay.toFixed(1)}" font-size="13" font-weight="600" fill="var(--text)">A</text>`;
    g += `<text x="${bx + 20}" y="${by - 5}" font-size="12" font-weight="600" fill="var(--accent-ink)">${ang}°</text>`;
    g += `<text x="${(bx + cx) / 2}" y="${by + 16}" text-anchor="middle" font-size="11" fill="var(--accent-ink)">adjacent</text>`;
    g += `</svg>`; svgHost.innerHTML = g;
    const c = Math.cos(rad).toFixed(2).replace('.', ',');
    readout.innerHTML = `cos ${ang}° = <strong>adjacent ÷ hypoténuse</strong> ≈ <strong>${c}</strong>`;
  }
  wrap.querySelector('[data-ang]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r05',
  titre: 'Cosinus (triangle rectangle)',
  theme: 'rappels',
  priorite: false,
  icone: '📐',

  intro:
    "Le cosinus, introduit en 4ᵉ, relie un angle aigu et deux côtés d'un triangle rectangle. C'est le point " +
    "de départ de toute la trigonométrie de 3ᵉ (où s'ajoutent le sinus et la tangente). On révise ici la " +
    "définition du cosinus et son utilisation pour calculer une longueur ou un angle. Calculatrice en degrés !",

  cours: [
    { type: 'definition', titre: 'Définition du cosinus', contenu: "Dans un triangle rectangle, pour un angle aigu, le cosinus est le rapport du côté <strong>adjacent</strong> (qui touche l'angle) sur l'<strong>hypoténuse</strong> (face à l'angle droit).", formule: '\\cos(\\widehat{B}) = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}' },
    { type: 'propriete', titre: 'Calculer une longueur', contenu: "On isole l'inconnue à partir de la définition.", formule: '\\text{adjacent} = \\text{hyp} \\times \\cos(\\widehat{B}), \\qquad \\text{hyp} = \\dfrac{\\text{adjacent}}{\\cos(\\widehat{B})}' },
    { type: 'propriete', titre: 'Calculer un angle', contenu: "Connaissant l'adjacent et l'hypoténuse, on retrouve l'angle avec la touche $\\cos^{-1}$ (ou $\\arccos$) de la calculatrice.", formule: '\\widehat{B} = \\cos^{-1}\\!\\left(\\dfrac{\\text{adjacent}}{\\text{hypoténuse}}\\right)' },
    { type: 'figure', titre: 'Le cosinus en direct', contenu: "Règle l'angle : le côté adjacent change, et $\\cos$ = adjacent ÷ hypoténuse aussi. Plus l'angle est grand, plus le cosinus est petit.", render: (host) => cosinusInteractif(host) },
    { type: 'exemple', enonce: 'Triangle rectangle en $C$. $\\widehat{B}=60°$, hypoténuse $AB=10$. Calculer le côté adjacent $BC$.', solution_etapes: ["$\\cos(\\widehat B) = \\dfrac{BC}{AB}$, donc $BC = AB \\times \\cos(60°)$.", "$BC = 10 \\times 0{,}5 = 5$."] },
  ],

  methode: [
    { etape: 1, titre: 'Repérer les côtés', explication: "Adjacent = le côté qui touche l'angle (hors hypoténuse). Hypoténuse = face à l'angle droit." },
    { etape: 2, titre: 'Écrire la relation', explication: "$\\cos(\\widehat B) = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$." },
    { etape: 3, titre: 'Isoler l\'inconnue', explication: "Longueur cherchée au numérateur → on multiplie. Au dénominateur → on divise." },
    { etape: 4, titre: 'Pour un angle', explication: "Utilise $\\cos^{-1}$ à la calculatrice (en degrés)." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule le côté adjacent (arrondi au dixième) :',
      generer() { const ang = pick([20, 30, 40, 50, 60, 70]), hyp = randInt(6, 14); return { enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, hypoténuse $= ${hyp}$. Calcule le côté adjacent.`, reponse: round1(hyp * Math.cos(deg2rad(ang))), validation: 'nombre', tolerance: 0.03 }; },
      indices: ['$\\cos(\\widehat B) = \\dfrac{\\text{adjacent}}{\\text{hyp}}$.', 'Adjacent $= \\text{hyp} \\times \\cos(\\widehat B)$.', 'Calculatrice en degrés.'],
      correction_detaillee: () => `<p>adjacent $= \\text{hypoténuse} \\times \\cos(\\widehat B)$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule l\'hypoténuse (arrondi au dixième) :',
      generer() { const ang = pick([20, 30, 40, 50, 60]), adj = randInt(4, 11); return { enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, côté adjacent $= ${adj}$. Calcule l'hypoténuse.`, reponse: round1(adj / Math.cos(deg2rad(ang))), validation: 'nombre', tolerance: 0.03 }; },
      indices: ['$\\cos(\\widehat B) = \\dfrac{\\text{adjacent}}{\\text{hyp}}$.', 'Ici l\'inconnue est au dénominateur.', 'hyp $= \\dfrac{\\text{adjacent}}{\\cos(\\widehat B)}$.'],
      correction_detaillee: () => `<p>$\\text{hyp} = \\dfrac{\\text{adjacent}}{\\cos(\\widehat B)}$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule l\'angle (en degrés, arrondi au degré) :',
      generer() { const hyp = randInt(8, 14), adj = randInt(3, hyp - 1); return { enonce: `Triangle rectangle. Côté adjacent à $\\widehat B = ${adj}$, hypoténuse $= ${hyp}$. Calcule $\\widehat B$.`, reponse: Math.round(Math.acos(adj / hyp) * 180 / Math.PI), validation: 'nombre', tolerance: 0.06 }; },
      indices: ['$\\cos(\\widehat B) = \\dfrac{\\text{adjacent}}{\\text{hyp}}$.', 'Calcule d\'abord ce rapport.', '$\\widehat B = \\cos^{-1}(\\text{rapport})$, calculatrice en degrés.'],
      correction_detaillee: () => `<p>$\\widehat B = \\cos^{-1}\\!\\left(\\dfrac{\\text{adjacent}}{\\text{hyp}}\\right)$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Quelle est la définition du cosinus ?',
      generer() { const choix = ['\\dfrac{adjacent}{hypoténuse}', '\\dfrac{opposé}{hypoténuse}', '\\dfrac{opposé}{adjacent}', '\\dfrac{hypoténuse}{adjacent}']; return { enonce: `Dans un triangle rectangle, $\\cos(\\widehat B)$ est égal à :`, choix, correct: 0 }; },
      indices: ['CAH : Cosinus = Adjacent / Hypoténuse.', 'L\'adjacent touche l\'angle.', 'L\'hypoténuse est face à l\'angle droit.'],
      correction_detaillee: () => `<p>$\\cos = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$ (moyen mnémotechnique : CAH).</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule le côté adjacent (arrondi au dixième) :',
      generer() { const ang = pick([25, 35, 40, 55, 65]), hyp = randInt(7, 15); return { enonce: `Triangle rectangle. $\\widehat{B}=${ang}°$, hypoténuse $= ${hyp}$. Calcule le côté adjacent.`, reponse: round1(hyp * Math.cos(deg2rad(ang))), validation: 'nombre', tolerance: 0.03, _v: { ang, hyp } }; },
      indices: ['$\\cos(\\widehat B) = \\dfrac{\\text{adjacent}}{\\text{hyp}}$.', 'Isole : adjacent $= \\text{hyp} \\times \\cos(\\widehat B)$.', 'Calculatrice en degrés, arrondis.'],
      correction_etapes(st) {
        const { ang, hyp } = st._v; const adj = round1(hyp * Math.cos(deg2rad(ang)));
        return [
          `On écrit : $\\cos(${ang}°) = \\dfrac{\\text{adjacent}}{${hyp}}$.`,
          `On isole : adjacent $= ${hyp} \\times \\cos(${ang}°)$.`,
          `À la calculatrice (degrés) : adjacent $\\approx ${String(adj).replace('.', '{,}')}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux :',
      generer() {
        const props = [
          { e: 'Le cosinus d\'un angle aigu est toujours compris entre 0 et 1.', r: true },
          { e: 'Plus l\'angle augmente, plus son cosinus augmente.', r: false },
          { e: 'Le cosinus est le rapport de l\'opposé sur l\'hypoténuse.', r: false },
          { e: 'On calcule un angle à partir de son cosinus avec la touche cos⁻¹.', r: true },
        ];
        const p = pick(props); return { enonce: p.e, reponse: p.r };
      },
      indices: ['Le cosinus est un rapport adjacent/hypoténuse, toujours < 1.', 'Quand l\'angle grandit, l\'adjacent rétrécit : le cosinus diminue.', 'cos⁻¹ retrouve l\'angle.'],
      correction_detaillee: () => `<p>$0 < \\cos < 1$ pour un angle aigu ; il diminue quand l'angle augmente.</p>`,
    },
    {
      id: 'e07', niveau: 1, type: 'complete', consigne: 'Complète le calcul (angle de 60°) :',
      generer() { const hyp = 2 * randInt(3, 8), adj = hyp * 0.5; return { enonce_complete: `$\\widehat{B}=60°$, hypoténuse $= ${hyp}$. $\\cos(60°) = $ {0} $\\;$ donc adjacent $= ${hyp} \\times \\cos(60°) = $ {1}`, champs: [{ reponse: 0.5, validation: 'nombre', tolerance: 0.001 }, { reponse: adj, validation: 'nombre' }], _v: { hyp, adj } }; },
      indices: ['$\\cos(60°)$ est une valeur à connaître : $0{,}5$.', 'adjacent $= \\text{hyp} \\times \\cos$.', 'On multiplie l\'hypoténuse par $0{,}5$.'],
      correction_etapes(st) { const { hyp, adj } = st._v; return [`$\\cos(60°) = 0{,}5$.`, `adjacent $= ${hyp} \\times 0{,}5 = ${adj}$.`]; },
    },
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul du côté adjacent :',
      generer() { const ang = pick([25, 30, 40, 50, 60]), hyp = randInt(6, 14); const adj = round1(hyp * Math.cos(deg2rad(ang))); return { etapes: [`Repérer les côtés : on cherche l'adjacent, on connaît l'hypoténuse`, `Écrire la relation : $\\cos(${ang}°) = \\dfrac{\\text{adjacent}}{${hyp}}$`, `Isoler : adjacent $= ${hyp} \\times \\cos(${ang}°)$`, `Calculer (calculatrice en degrés) : $\\approx ${String(adj).replace('.', '{,}')}$`] }; },
      indices: ['On repère d\'abord les côtés en jeu.', 'On écrit la relation du cosinus.', 'On isole puis on calcule.'],
      correction_detaillee: () => `<p>Ordre : repérer les côtés → écrire la relation → isoler → calculer.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Le cosinus d\'un angle aigu vaut :', choix: ['\\dfrac{adjacent}{hypoténuse}', '\\dfrac{opposé}{hypoténuse}', '\\dfrac{opposé}{adjacent}', '\\dfrac{adjacent}{opposé}'], correct: 0, explication: 'CAH : Cosinus = Adjacent / Hypoténuse.' },
    { type: 'saisie', question: 'Calcule un côté adjacent.', generer() { const ang = pick([20, 30, 40, 50, 60]), hyp = randInt(6, 14); return { question: `$\\widehat{B}=${ang}°$, hypoténuse $= ${hyp}$. Calcule l'adjacent (au dixième).`, reponse: round1(hyp * Math.cos(deg2rad(ang))), validation: 'nombre', tolerance: 0.04, explication: `adjacent $= ${hyp} \\times \\cos(${ang}°)$.` }; } },
    { type: 'saisie', question: 'Combien vaut $\\cos(60°)$ ? (décimal)', reponse: 0.5, validation: 'nombre', tolerance: 0.02, explication: '$\\cos(60°) = 0{,}5$.' },
    { type: 'vrai_faux', question: 'Le cosinus d\'un angle aigu peut être supérieur à 1.', reponse: false, explication: 'Non : l\'adjacent est plus court que l\'hypoténuse, donc $\\cos < 1$.' },
    { type: 'qcm', question: 'Pour trouver un angle connaissant adjacent et hypoténuse, on utilise :', choix: ['cos⁻¹ (arccos)', 'le carré', 'Pythagore', 'la racine carrée'], correct: 0, explication: '$\\widehat B = \\cos^{-1}(\\text{adjacent}/\\text{hypoténuse})$.' },
  ],
};
