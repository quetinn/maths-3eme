// =====================================================================
//  c03_equations_1er_degre.js — Résoudre ax + b = c, ax+b = cx+d
// =====================================================================

import { randInt, randIntNonZero } from '../engine.js';

function linTeX(a, b) {
  let s = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (b > 0) s += ` + ${b}`; else if (b < 0) s += ` - ${-b}`;
  return s;
}

export default {
  id: 'c03',
  titre: 'Équations du 1er degré',
  theme: 'nombres_calculs',
  priorite: false,
  icone: '⚖️',

  intro:
    "Une équation, c'est une balance à équilibrer : on cherche la valeur de l'inconnue qui rend l'égalité " +
    "vraie. Indispensable pour résoudre des problèmes concrets (âge, prix, partage) et pour toutes les " +
    "sciences.",

  cours: [
    { type: 'definition', titre: 'Équation et solution', contenu: "Résoudre une équation, c'est trouver la (ou les) valeur(s) de l'inconnue qui rendent l'égalité vraie." },
    { type: 'propriete', titre: 'Règle d\'or', contenu: "On peut ajouter, soustraire un même nombre, ou multiplier/diviser par un même nombre non nul <strong>des deux côtés</strong> de l'égalité.", formule: 'a = b \\iff a + k = b + k \\iff ka = kb \\;(k\\neq0)' },
    {
      type: 'exemple', enonce: 'Résoudre $3x + 5 = 20$.',
      solution_etapes: [
        "On soustrait $5$ des deux côtés : $3x = 15$.",
        "On divise par $3$ : $x = 5$.",
        "Vérification : $3\\times5 + 5 = 20$. ✓",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Développer si besoin', explication: "S'il y a des parenthèses, développe d'abord." },
    { etape: 2, titre: 'Regrouper les $x$', explication: "Mets tous les termes en $x$ d'un côté, les nombres de l'autre (en changeant de signe à la traversée)." },
    { etape: 3, titre: 'Réduire', explication: "Additionne les termes semblables de chaque côté." },
    { etape: 4, titre: 'Isoler $x$', explication: "Divise par le coefficient de $x$." },
    { etape: 5, titre: 'Vérifier', explication: "Remplace $x$ par ta solution dans l'équation de départ." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Résous l\'équation (donne x) :',
      generer() {
        const b = randIntNonZero(-9, 9), sol = randInt(-9, 9);
        return { enonce: `$x + ${b < 0 ? '(' + b + ')' : b} = ${sol + b}$`, reponse: sol, validation: 'nombre' };
      },
      indices: ['Isole $x$ en enlevant le nombre des deux côtés.', 'Ce qui s\'ajoute d\'un côté se soustrait de l\'autre.', '$x = \\text{(membre de droite)} - \\text{(nombre)}$.'],
      correction_detaillee: () => `<p>On soustrait le nombre des deux côtés pour isoler $x$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Résous l\'équation (donne x) :',
      generer() {
        const a = randIntNonZero(2, 6), sol = randInt(-6, 6);
        return { enonce: `$${a}x = ${a * sol}$`, reponse: sol, validation: 'nombre' };
      },
      indices: ['Le coefficient devant $x$ se « défait » par une division.', 'Divise les deux côtés par ce coefficient.', '$x = \\dfrac{\\text{membre de droite}}{\\text{coefficient}}$.'],
      correction_detaillee: () => `<p>On divise les deux membres par le coefficient de $x$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Résous l\'équation (donne x) :',
      generer() {
        const a = randIntNonZero(2, 6), b = randIntNonZero(-9, 9), sol = randInt(-6, 6);
        return { enonce: `$${linTeX(a, b)} = ${a * sol + b}$`, reponse: sol, validation: 'nombre' };
      },
      indices: ['Soustrais d\'abord le nombre des deux côtés.', 'Tu obtiens $ax = $ quelque chose.', 'Divise par $a$.'],
      correction_detaillee: (s) => `<p>On isole $ax$ en retirant $b$, puis on divise par $a$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Résous l\'équation (inconnue des deux côtés) :',
      generer() {
        let a = randIntNonZero(2, 5), c = randIntNonZero(-4, 4);
        while (c === a) c = randIntNonZero(-4, 4);
        const sol = randInt(-5, 5), b = randIntNonZero(-6, 6), d = a * sol + b - c * sol;
        return { enonce: `$${linTeX(a, b)} = ${linTeX(c, d)}$`, reponse: sol, validation: 'nombre' };
      },
      indices: ['Regroupe les $x$ d\'un côté, les nombres de l\'autre.', 'Soustrais le terme en $x$ le plus petit aux deux membres.', 'Termine en divisant par le coefficient restant.'],
      correction_detaillee: () => `<p>On déplace les $x$ d'un côté et les nombres de l'autre, puis on divise.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Résous (développe d\'abord) :',
      generer() {
        const a = randInt(2, 5), p = randIntNonZero(-5, 5), sol = randInt(-5, 5);
        return { enonce: `$${a}(x ${p >= 0 ? '+ ' + p : '- ' + -p}) = ${a * (sol + p)}$`, reponse: sol, validation: 'nombre', _v: { a, p, sol } };
      },
      indices: ['Développe : $a(x+p) = ax + ap$.', 'Puis résous l\'équation du premier degré obtenue.', 'Tu peux aussi diviser directement les deux côtés par $a$.'],
      correction_etapes(st) {
        const { a, p, sol } = st._v; const c = a * (sol + p), ap = a * p;
        const apTex = ap >= 0 ? `+ ${ap}` : `- ${-ap}`;
        return [
          `On développe la parenthèse : $${a}x ${apTex} = ${c}$.`,
          `On isole le terme en $x$ : $${a}x = ${c - ap}$.`,
          `On divise par $${a}$ : $x = ${sol}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Résous (parenthèses + inconnue des deux côtés) :',
      generer() {
        const a = randInt(2, 5), p = randIntNonZero(-4, 4), sol = randInt(-5, 5);
        let c = randIntNonZero(-3, 3); while (c === a) c = randIntNonZero(-3, 3);
        const d = a * sol + a * p - c * sol;
        return { enonce: `$${a}(x ${p >= 0 ? '+ ' + p : '- ' + -p}) = ${linTeX(c, d)}$`, reponse: sol, validation: 'nombre' };
      },
      indices: ['Développe la parenthèse.', 'Regroupe les $x$ d\'un côté.', 'Isole et divise.'],
      correction_detaillee: () => `<p>On développe, on regroupe les $x$, puis on isole $x$.</p>`,
    },

    // ----- Niveau 1 : Compléter la résolution -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète les étapes de résolution :',
      generer() {
        const a = randInt(2, 6), sol = randInt(2, 9), b = randInt(1, 9), c = a * sol + b;
        return {
          enonce_complete: `$${a}x + ${b} = ${c}$ donc $${a}x = $ {0} $,$ donc $x = $ {1}`,
          champs: [
            { reponse: a * sol, validation: 'nombre' },
            { reponse: sol, validation: 'nombre' },
          ],
          _v: { a, b, c, sol },
        };
      },
      indices: ['On retire d\'abord le nombre des deux côtés.', `Premier champ : la valeur de $ax$ après avoir retiré $b$.`, 'Second champ : on divise par le coefficient de $x$.'],
      correction_etapes(st) {
        const { a, b, c, sol } = st._v;
        return [
          `On soustrait $${b}$ des deux côtés : $${a}x = ${c} - ${b} = ${c - b}$.`,
          `On divise par $${a}$ : $x = \\dfrac{${c - b}}{${a}} = ${sol}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre la résolution :',
      generer() {
        const a = randInt(2, 6), sol = randInt(2, 9), b = randInt(2, 9), c = a * sol + b;
        return {
          etapes: [
            `On part de $${a}x + ${b} = ${c}$`,
            `On soustrait $${b}$ des deux côtés : $${a}x = ${c - b}$`,
            `On divise par $${a}$ : $x = ${sol}$`,
            `Vérification : $${a}\\times ${sol} + ${b} = ${c}$ ✓`,
          ],
        };
      },
      indices: ['On isole d\'abord le terme en $x$.', 'On divise seulement à la fin.', 'La vérification se fait en tout dernier.'],
      correction_detaillee: () => `<p>Ordre : équation de départ → retirer le nombre → diviser → vérifier.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Résous $x - 4 = 9$.', reponse: 13, validation: 'nombre', explication: '$x = 9 + 4 = 13$.' },
    { type: 'saisie', question: 'Résous $5x = 35$.', reponse: 7, validation: 'nombre', explication: '$x = 35 \\div 5 = 7$.' },
    {
      type: 'saisie', question: 'Résous l\'équation.',
      generer() { const a = randInt(2, 6), sol = randInt(1, 9), b = randInt(1, 9); return { question: `Résous $${a}x + ${b} = ${a * sol + b}$.`, reponse: sol, validation: 'nombre', explication: `$${a}x = ${a * sol}$ donc $x = ${sol}$.` }; },
    },
    { type: 'vrai_faux', question: 'Pour résoudre $-3x = 12$, on divise par $-3$ et on trouve $x = -4$.', reponse: true, explication: '$x = 12 \\div (-3) = -4$.' },
    {
      type: 'saisie', question: 'Résous (inconnue des deux côtés).',
      generer() { const a = randInt(3, 6), c = randInt(1, a - 1), sol = randInt(1, 7), b = randInt(1, 6); const d = (a - c) * sol + b; return { question: `Résous $${a}x + ${b} = ${c}x + ${d}$.`, reponse: sol, validation: 'nombre', explication: `On regroupe : $${a - c}x = ${d - b}$ donc $x = ${sol}$.` }; },
    },
  ],
};
