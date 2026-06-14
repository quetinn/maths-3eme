// =====================================================================
//  r03_fractions.js — Rappel de 4ᵉ : additionner, soustraire, multiplier
//  et diviser des fractions, et simplifier.
//  Figure interactive : barre de fraction (sliders numérateur / dénominateur).
// =====================================================================

import { randInt, pick, gcd } from '../engine.js';

const reduce = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
const fracTeX = (n, d) => { const [a, b] = reduce(n, d); return b === 1 ? `${a}` : `\\dfrac{${a}}{${b}}`; };

// Barre de fraction interactive : on règle numérateur et dénominateur.
function fractionBar(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>numérateur <input type="range" min="0" max="4" value="3" data-n> <span class="fig-val" data-nv></span></label>
      <label>dénominateur <input type="range" min="2" max="10" value="4" data-d> <span class="fig-val" data-dv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  const nIn = wrap.querySelector('[data-n]'), dIn = wrap.querySelector('[data-d]');
  function draw() {
    let d = +dIn.value; nIn.max = d; let n = Math.min(+nIn.value, d); nIn.value = n;
    wrap.querySelector('[data-nv]').textContent = n; wrap.querySelector('[data-dv]').textContent = d;
    const W = 320, H = 58, M = 12, bw = (W - 2 * M) / d;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="barre de fraction">`;
    for (let i = 0; i < d; i++) { const x = M + i * bw; g += `<rect x="${x.toFixed(1)}" y="13" width="${bw.toFixed(1)}" height="32" fill="${i < n ? 'var(--accent)' : 'var(--surface-2)'}" stroke="var(--border)" stroke-width="1.5"/>`; }
    g += `</svg>`; svgHost.innerHTML = g;
    const [ra, rb] = reduce(n, d);
    let txt = `<strong>${n}/${d}</strong>`;
    if (n === d && n > 0) txt += ' = 1 (un entier)'; else if (n > 0 && (ra !== n || rb !== d)) txt += ` se simplifie en <strong>${ra}/${rb}</strong>`;
    readout.innerHTML = txt;
  }
  nIn.addEventListener('input', draw); dIn.addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r03',
  titre: 'Opérations sur les fractions',
  theme: 'rappels',
  priorite: false,
  icone: '🍰',

  intro:
    "Manipuler les fractions, c'est la base de l'arithmétique de 3ᵉ, des équations et des probabilités. " +
    "On révise ici les quatre opérations : additionner (même dénominateur, ou ramener au même), multiplier, " +
    "diviser (multiplier par l'inverse) et simplifier. Réponses acceptées en fraction (a/b) ou en décimal.",

  cours: [
    { type: 'propriete', titre: 'Additionner / soustraire (même dénominateur)', contenu: "On garde le dénominateur, on additionne (ou soustrait) les numérateurs.", formule: '\\dfrac{a}{d} + \\dfrac{c}{d} = \\dfrac{a+c}{d}' },
    { type: 'propriete', titre: 'Dénominateurs différents', contenu: "On ramène d'abord les fractions au même dénominateur (un dénominateur commun), puis on additionne.", formule: '\\dfrac{1}{2} + \\dfrac{1}{4} = \\dfrac{2}{4} + \\dfrac{1}{4} = \\dfrac{3}{4}' },
    { type: 'propriete', titre: 'Multiplier', contenu: "On multiplie les numérateurs entre eux et les dénominateurs entre eux.", formule: '\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{a \\times c}{b \\times d}' },
    { type: 'propriete', titre: 'Diviser', contenu: "Diviser par une fraction, c'est multiplier par son inverse.", formule: '\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}' },
    { type: 'figure', titre: 'Visualiser une fraction', contenu: "Règle le numérateur et le dénominateur : la barre se remplit, et la fraction se simplifie si possible.", render: (host) => fractionBar(host) },
    { type: 'exemple', enonce: 'Calculer $\\dfrac{2}{3} \\times \\dfrac{3}{4}$.', solution_etapes: ["On multiplie : $\\dfrac{2 \\times 3}{3 \\times 4} = \\dfrac{6}{12}$.", "On simplifie par $6$ : $\\dfrac{1}{2}$."] },
  ],

  methode: [
    { etape: 1, titre: 'Addition / soustraction', explication: "Même dénominateur ? On additionne les numérateurs. Sinon, on met au même dénominateur d'abord." },
    { etape: 2, titre: 'Multiplication', explication: "Numérateurs entre eux, dénominateurs entre eux (pas besoin du même dénominateur)." },
    { etape: 3, titre: 'Division', explication: "On remplace $\\div \\dfrac{c}{d}$ par $\\times \\dfrac{d}{c}$, puis on multiplie." },
    { etape: 4, titre: 'Simplifier', explication: "On divise numérateur et dénominateur par leur PGCD." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Additionne (même dénominateur) — fraction ou décimal :',
      generer() { const d = randInt(3, 9), a = randInt(1, d - 1), c = randInt(1, d - 1); return { enonce: `$\\dfrac{${a}}{${d}} + \\dfrac{${c}}{${d}}$`, reponse: (a + c) / d, validation: 'nombre', tolerance: 0.01, reponseTex: fracTeX(a + c, d) }; },
      indices: ['Même dénominateur : on garde le dénominateur.', 'On additionne seulement les numérateurs.', 'On simplifie si possible.'],
      correction_detaillee: (s) => `<p>$\\dfrac{a}{d} + \\dfrac{c}{d} = \\dfrac{a+c}{d}$, soit $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Soustrais (même dénominateur) — fraction ou décimal :',
      generer() { const d = randInt(3, 9), a = randInt(2, d - 1), c = randInt(1, a); return { enonce: `$\\dfrac{${a}}{${d}} - \\dfrac{${c}}{${d}}$`, reponse: (a - c) / d, validation: 'nombre', tolerance: 0.01, reponseTex: fracTeX(a - c, d) }; },
      indices: ['On garde le dénominateur commun.', 'On soustrait les numérateurs.', 'On simplifie si possible.'],
      correction_detaillee: (s) => `<p>$\\dfrac{a}{d} - \\dfrac{c}{d} = \\dfrac{a-c}{d}$, soit $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Multiplie — fraction ou décimal :',
      generer() { const a = randInt(1, 5), b = randInt(2, 6), c = randInt(1, 5), d = randInt(2, 6); return { enonce: `$\\dfrac{${a}}{${b}} \\times \\dfrac{${c}}{${d}}$`, reponse: (a * c) / (b * d), validation: 'nombre', tolerance: 0.01, reponseTex: fracTeX(a * c, b * d) }; },
      indices: ['On multiplie les numérateurs entre eux.', 'On multiplie les dénominateurs entre eux.', 'On simplifie le résultat.'],
      correction_detaillee: (s) => `<p>$\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$, soit $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Comment calcule-t-on une division de fractions ?',
      generer() {
        const choix = ['on multiplie par l\'inverse de la 2ᵉ', 'on additionne les numérateurs', 'on divise les numérateurs entre eux', 'on garde le plus grand dénominateur'];
        return { enonce: `$\\dfrac{a}{b} \\div \\dfrac{c}{d}$ est égal à :`, choix, correct: 0 };
      },
      indices: ['Diviser par une fraction = multiplier par son inverse.', 'L\'inverse de $\\dfrac{c}{d}$ est $\\dfrac{d}{c}$.', '$\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$.'],
      correction_detaillee: () => `<p>On multiplie par l'inverse de la seconde fraction.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Additionne (dénominateurs différents) — fraction ou décimal :',
      generer() { const b = pick([2, 3, 4, 5]), k = pick([2, 3]); const d = b * k; const a = randInt(1, b - 1), c = randInt(1, d - 1); return { enonce: `$\\dfrac{${a}}{${b}} + \\dfrac{${c}}{${d}}$`, reponse: a / b + c / d, validation: 'nombre', tolerance: 0.01, reponseTex: fracTeX(a * k + c, d), _v: { a, b, c, d, k } }; },
      indices: ['Cherche un dénominateur commun (ici un multiple).', `Multiplie la 1ʳᵉ fraction pour avoir le bon dénominateur.`, 'Additionne ensuite les numérateurs.'],
      correction_etapes(st) {
        const { a, b, c, d, k } = st._v;
        return [
          `Dénominateur commun : $${d}$. On transforme $\\dfrac{${a}}{${b}} = \\dfrac{${a * k}}{${d}}$.`,
          `On additionne : $\\dfrac{${a * k}}{${d}} + \\dfrac{${c}}{${d}} = \\dfrac{${a * k + c}}{${d}}$.`,
          `On simplifie si possible : $${fracTeX(a * k + c, d)}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Divise (multiplie par l\'inverse) — fraction ou décimal :',
      generer() { const a = randInt(1, 5), b = randInt(2, 6), c = randInt(1, 5), d = randInt(2, 6); return { enonce: `$\\dfrac{${a}}{${b}} \\div \\dfrac{${c}}{${d}}$`, reponse: (a * d) / (b * c), validation: 'nombre', tolerance: 0.01, reponseTex: fracTeX(a * d, b * c) }; },
      indices: ['Remplace la division par une multiplication par l\'inverse.', '$\\div \\dfrac{c}{d}$ devient $\\times \\dfrac{d}{c}$.', 'Puis multiplie comme d\'habitude.'],
      correction_detaillee: (s) => `<p>$\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c} = ${s.reponseTex}$.</p>`,
    },
    {
      id: 'e07', niveau: 1, type: 'complete', consigne: 'Complète l\'addition (même dénominateur) :',
      generer() { const d = randInt(3, 9), a = randInt(1, d - 1), c = randInt(1, d - 1); return { enonce_complete: `$\\dfrac{${a}}{${d}} + \\dfrac{${c}}{${d}} = \\dfrac{?}{?}$ : numérateur {0} $,$ dénominateur {1}`, champs: [{ reponse: a + c, validation: 'nombre' }, { reponse: d, validation: 'nombre' }], _v: { a, c, d } }; },
      indices: ['On additionne les numérateurs.', 'On garde le dénominateur commun.', 'Numérateur = somme, dénominateur = $d$.'],
      correction_etapes(st) { const { a, c, d } = st._v; return [`Numérateur : $${a} + ${c} = ${a + c}$.`, `Dénominateur (inchangé) : $${d}$.`]; },
    },
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre l\'addition de fractions de dénominateurs différents :',
      generer() { return { etapes: [`Trouver un dénominateur commun (ex. $\\dfrac{1}{2} + \\dfrac{1}{4}$ → 4)`, `Mettre les fractions au même dénominateur : $\\dfrac{2}{4} + \\dfrac{1}{4}$`, `Additionner les numérateurs : $\\dfrac{3}{4}$`, `Simplifier la fraction si possible`] }; },
      indices: ['On cherche d\'abord le dénominateur commun.', 'On transforme les fractions avant d\'additionner.', 'On simplifie en dernier.'],
      correction_detaillee: () => `<p>Ordre : dénominateur commun → mettre au même dénominateur → additionner → simplifier.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Additionne (même dénominateur).', generer() { const d = randInt(3, 9), a = randInt(1, d - 1), c = randInt(1, d - 1); return { question: `Calcule $\\dfrac{${a}}{${d}} + \\dfrac{${c}}{${d}}$ (fraction ou décimal).`, reponse: (a + c) / d, validation: 'nombre', tolerance: 0.01, explication: `$\\dfrac{${a + c}}{${d}} = ${fracTeX(a + c, d)}$.` }; } },
    { type: 'qcm', question: 'Pour multiplier deux fractions, on :', choix: ['multiplie numérateurs et dénominateurs', 'met au même dénominateur', 'additionne les numérateurs', 'inverse la première'], correct: 0, explication: '$\\dfrac{a}{b}\\times\\dfrac{c}{d}=\\dfrac{ac}{bd}$.' },
    { type: 'saisie', question: 'Multiplie deux fractions.', generer() { const a = randInt(1, 5), b = randInt(2, 6), c = randInt(1, 5), d = randInt(2, 6); return { question: `Calcule $\\dfrac{${a}}{${b}} \\times \\dfrac{${c}}{${d}}$ (fraction ou décimal).`, reponse: (a * c) / (b * d), validation: 'nombre', tolerance: 0.01, explication: `$\\dfrac{${a * c}}{${b * d}} = ${fracTeX(a * c, b * d)}$.` }; } },
    { type: 'vrai_faux', question: 'Diviser par $\\dfrac{2}{3}$, c\'est multiplier par $\\dfrac{3}{2}$.', reponse: true, explication: 'Diviser par une fraction = multiplier par son inverse.' },
    { type: 'saisie', question: 'Combien vaut $\\dfrac{3}{4}$ en décimal ?', reponse: 0.75, validation: 'nombre', tolerance: 0.005, explication: '$3 \\div 4 = 0{,}75$.' },
  ],
};
