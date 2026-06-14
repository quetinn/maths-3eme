// =====================================================================
//  r04_proportionnalite.js — Rappel de 4ᵉ : proportionnalité, coefficient,
//  produit en croix (4ᵉ proportionnelle), pourcentages.
//  Figure interactive : droite y = a·x (slider du coefficient).
// =====================================================================

import { randInt, pick } from '../engine.js';
import { plotFunction } from '../render.js';

const dec = (x) => String(x).replace('.', ',');

// Droite de proportionnalité interactive : on règle le coefficient a.
function proportionPlot(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>coefficient a <input type="range" min="0.5" max="3" step="0.5" value="1.5" data-a> <span class="fig-val" data-av></span></label></div>
    <div data-plot></div>
    <div class="fig-readout" data-readout></div>`;
  const plotHost = wrap.querySelector('[data-plot]');
  function draw() {
    const a = +wrap.querySelector('[data-a]').value;
    wrap.querySelector('[data-av]').textContent = dec(a);
    plotFunction(plotHost, (x) => a * x, { xmin: -4, xmax: 4, interactive: true });
    wrap.querySelector('[data-readout]').innerHTML = `Droite <strong>y = ${dec(a)} × x</strong> : elle passe par l'origine → c'est une situation de proportionnalité.`;
  }
  wrap.querySelector('[data-a]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r04',
  titre: 'Proportionnalité',
  theme: 'rappels',
  priorite: false,
  icone: '⚖️',

  intro:
    "La proportionnalité, vue dès le primaire et travaillée en 4ᵉ, est partout : recettes, vitesses, échelles, " +
    "pourcentages, conversions. En 3ᵉ, c'est la clé de Thalès et des fonctions linéaires (qui sont exactement " +
    "les situations de proportionnalité). On révise le coefficient, le produit en croix et les pourcentages.",

  cours: [
    { type: 'definition', titre: 'Coefficient de proportionnalité', contenu: "Deux grandeurs sont proportionnelles si on passe de l'une à l'autre en multipliant toujours par le même nombre $a$ (le coefficient).", formule: 'y = a \\times x, \\qquad a = \\dfrac{y}{x}' },
    { type: 'propriete', titre: 'Produit en croix (4ᵉ proportionnelle)', contenu: "Dans un tableau de proportionnalité, les produits « en croix » sont égaux. On en déduit une valeur manquante.", formule: '\\dfrac{a}{b} = \\dfrac{c}{x} \\iff x = \\dfrac{b \\times c}{a}' },
    { type: 'propriete', titre: 'Pourcentage', contenu: "Prendre $t\\%$ d'une quantité, c'est la multiplier par $\\dfrac{t}{100}$.", formule: 't\\% \\text{ de } N = \\dfrac{t}{100} \\times N' },
    { type: 'figure', titre: 'Proportionnalité = droite par l\'origine', contenu: "Règle le coefficient $a$ : la représentation de $y = a\\,x$ est toujours une droite passant par l'origine. Touche la droite pour lire un point.", render: (host) => proportionPlot(host) },
    { type: 'exemple', enonce: 'Pour 3 stylos identiques, on paie 6 €. Combien coûtent 5 stylos ?', solution_etapes: ["Prix d'un stylo : $6 \\div 3 = 2$ € (le coefficient).", "Pour 5 stylos : $5 \\times 2 = 10$ €."] },
  ],

  methode: [
    { etape: 1, titre: 'Reconnaître la proportionnalité', explication: "Passe-t-on d'une ligne à l'autre en multipliant par un même nombre ? Si oui, c'est proportionnel." },
    { etape: 2, titre: 'Trouver le coefficient', explication: "$a = \\dfrac{y}{x}$ (une valeur connue divisée par l'autre)." },
    { etape: 3, titre: 'Valeur manquante (produit en croix)', explication: "$x = \\dfrac{b \\times c}{a}$ à partir de l'égalité des deux fractions." },
    { etape: 4, titre: 'Pourcentage', explication: "Multiplie par $\\dfrac{t}{100}$. Une augmentation de $t\\%$ : multiplie par $\\left(1 + \\dfrac{t}{100}\\right)$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Trouve le coefficient de proportionnalité :',
      generer() { const a = randInt(2, 6), x = randInt(2, 8); return { enonce: `Une grandeur est proportionnelle : pour $x = ${x}$, on a $y = ${a * x}$. Quel est le coefficient $a$ ?`, reponse: a, validation: 'nombre' }; },
      indices: ['$a = \\dfrac{y}{x}$.', 'Divise la valeur de $y$ par celle de $x$.', 'Vérifie : $a \\times x$ doit redonner $y$.'],
      correction_detaillee: () => `<p>$a = \\dfrac{y}{x}$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la valeur manquante (proportionnalité) :',
      generer() { const a = randInt(2, 6), x1 = randInt(2, 5), x2 = randInt(6, 10); return { enonce: `Tableau de proportionnalité : $${x1} \\rightarrow ${a * x1}$ et $${x2} \\rightarrow \\ ?$. Calcule la valeur manquante.`, reponse: a * x2, validation: 'nombre' }; },
      indices: ['Cherche le coefficient avec la 1ʳᵉ colonne.', 'Multiplie la 2ᵉ entrée par ce coefficient.', 'Valeur $= a \\times x_2$.'],
      correction_detaillee: () => `<p>On trouve le coefficient, puis on multiplie la nouvelle valeur par ce coefficient.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule le pourcentage :',
      generer() { const t = pick([5, 10, 20, 25, 50]), N = pick([20, 40, 60, 80, 120, 200]); return { enonce: `Calcule $${t}\\%$ de $${N}$.`, reponse: (t / 100) * N, validation: 'nombre' }; },
      indices: ['$t\\%$ de $N = \\dfrac{t}{100} \\times N$.', 'Ex. $10\\%$ = diviser par 10.', 'Multiplie par la fraction $\\dfrac{t}{100}$.'],
      correction_detaillee: () => `<p>$t\\% \\text{ de } N = \\dfrac{t}{100} \\times N$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'vrai_faux', consigne: 'Ce tableau est-il proportionnel ?',
      generer() {
        const a = randInt(2, 5), x1 = randInt(2, 4), x2 = randInt(5, 8);
        const propor = Math.random() < 0.5;
        const y2 = propor ? a * x2 : a * x2 + pick([1, 2, -1, -2]);
        return { enonce: `Tableau : $${x1} \\rightarrow ${a * x1}$ et $${x2} \\rightarrow ${y2}$. Est-ce proportionnel ?`, reponse: (a * x1) / x1 === y2 / x2 };
      },
      indices: ['Calcule le coefficient de chaque colonne ($y \\div x$).', 'Proportionnel si les deux coefficients sont égaux.', 'Sinon, ce n\'est pas proportionnel.'],
      correction_detaillee: () => `<p>On compare les rapports $\\dfrac{y}{x}$ des deux colonnes.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Produit en croix — calcule x :',
      generer() { const a = randInt(2, 6), b = randInt(2, 6), c = a * randInt(2, 5); const x = (b * c) / a; return { enonce: `$\\dfrac{${a}}{${b}} = \\dfrac{${c}}{x}$. Calcule $x$.`, reponse: x, validation: 'nombre', _v: { a, b, c, x } }; },
      indices: ['Produit en croix : $a \\times x = b \\times c$.', '$x = \\dfrac{b \\times c}{a}$.', 'Vérifie que la division tombe juste.'],
      correction_etapes(st) {
        const { a, b, c, x } = st._v;
        return [
          `Produit en croix : $${a} \\times x = ${b} \\times ${c}$.`,
          `$${a} \\times x = ${b * c}$, donc $x = \\dfrac{${b * c}}{${a}} = ${x}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Augmentation en pourcentage — nouveau montant :',
      generer() { const N = pick([40, 50, 80, 120, 200]), t = pick([10, 20, 25, 50]); return { enonce: `Un article coûte $${N}$ €. Son prix augmente de $${t}\\%$. Quel est le nouveau prix ?`, reponse: N * (1 + t / 100), validation: 'nombre' }; },
      indices: ['Calcule d\'abord l\'augmentation : $\\dfrac{t}{100} \\times N$.', 'Ajoute-la au prix de départ.', 'Ou multiplie directement par $1 + \\dfrac{t}{100}$.'],
      correction_detaillee: () => `<p>Nouveau prix $= N \\times \\left(1 + \\dfrac{t}{100}\\right)$.</p>`,
    },
    {
      id: 'e07', niveau: 1, type: 'complete', consigne: 'Complète le tableau de proportionnalité :',
      generer() { const a = randInt(2, 6), x1 = randInt(2, 4), x2 = randInt(5, 9); return { enonce_complete: `Coefficient $a = ${a}$. Pour $x = ${x1}$ : $y = $ {0}$.\\;$ Pour $x = ${x2}$ : $y = $ {1}`, champs: [{ reponse: a * x1, validation: 'nombre' }, { reponse: a * x2, validation: 'nombre' }], _v: { a, x1, x2 } }; },
      indices: ['$y = a \\times x$.', 'Multiplie chaque $x$ par le coefficient.', 'Le coefficient est le même partout.'],
      correction_etapes(st) { const { a, x1, x2 } = st._v; return [`$y = ${a} \\times ${x1} = ${a * x1}$.`, `$y = ${a} \\times ${x2} = ${a * x2}$.`]; },
    },
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul d\'une 4ᵉ proportionnelle :',
      generer() { const a = randInt(2, 5), b = randInt(2, 5), c = a * randInt(2, 4); return { etapes: [`Écrire l'égalité des fractions : $\\dfrac{${a}}{${b}} = \\dfrac{${c}}{x}$`, `Appliquer le produit en croix : $${a} \\times x = ${b} \\times ${c}$`, `Isoler $x$ : $x = \\dfrac{${b * c}}{${a}}$`, `Calculer : $x = ${(b * c) / a}$`] }; },
      indices: ['On écrit d\'abord l\'égalité des deux rapports.', 'On applique le produit en croix.', 'On isole puis on calcule.'],
      correction_detaillee: () => `<p>Ordre : égalité des fractions → produit en croix → isoler $x$ → calculer.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Trouve un coefficient.', generer() { const a = randInt(2, 6), x = randInt(2, 8); return { question: `Proportionnel : $x = ${x} \\rightarrow y = ${a * x}$. Coefficient ?`, reponse: a, validation: 'nombre', explication: `$a = ${a * x} \\div ${x} = ${a}$.` }; } },
    { type: 'qcm', question: 'La représentation d\'une proportionnalité est :', choix: ['une droite passant par l\'origine', 'une parabole', 'une droite quelconque', 'une courbe'], correct: 0, explication: '$y = ax$ : droite qui passe par l\'origine.' },
    { type: 'saisie', question: 'Calcule un pourcentage.', generer() { const t = pick([10, 20, 25, 50]), N = pick([20, 40, 80, 120]); return { question: `Calcule $${t}\\%$ de $${N}$.`, reponse: (t / 100) * N, validation: 'nombre', explication: `$\\dfrac{${t}}{100} \\times ${N} = ${(t / 100) * N}$.` }; } },
    { type: 'vrai_faux', question: 'Dans une proportionnalité, on passe d\'une grandeur à l\'autre en ajoutant un même nombre.', reponse: false, explication: 'Non : on MULTIPLIE par un même nombre (le coefficient), on n\'ajoute pas.' },
    { type: 'saisie', question: 'Produit en croix.', generer() { const a = randInt(2, 5), b = randInt(2, 5), c = a * randInt(2, 4); return { question: `$\\dfrac{${a}}{${b}} = \\dfrac{${c}}{x}$. Calcule $x$.`, reponse: (b * c) / a, validation: 'nombre', explication: `$x = \\dfrac{${b} \\times ${c}}{${a}} = ${(b * c) / a}$.` }; } },
  ],
};
