// =====================================================================
//  c04_equations_produit.js — A × B = 0
// =====================================================================

import { randInt, randIntNonZero } from '../engine.js';

const fac = (r) => (r >= 0 ? `(x - ${r})` : `(x + ${-r})`);

export default {
  id: 'c04',
  titre: 'Équations-produit',
  theme: 'nombres_calculs',
  priorite: false,
  icone: '✖️',

  intro:
    "Quand une équation se présente sous la forme d'un produit égal à zéro, un théorème très simple " +
    "donne directement les solutions. C'est l'outil pour résoudre les équations du second degré au collège " +
    "(après factorisation) et un avant-goût du lycée.",

  cours: [
    { type: 'propriete', titre: 'Propriété du produit nul', contenu: "Un produit de facteurs est nul si et seulement si l'un <strong>au moins</strong> de ses facteurs est nul.", formule: 'A \\times B = 0 \\iff A = 0 \\ \\text{ou}\\ B = 0' },
    { type: 'definition', titre: 'Stratégie', contenu: "Si l'équation n'est pas déjà un produit nul, on commence par <strong>factoriser</strong>, puis on applique la propriété." },
    {
      type: 'exemple', enonce: 'Résoudre $(x-2)(x+5) = 0$.',
      solution_etapes: [
        "Un produit est nul si l'un des facteurs est nul : $x-2 = 0$ ou $x+5 = 0$.",
        "$x = 2$ ou $x = -5$.",
        "Les solutions sont $2$ et $-5$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Obtenir un produit = 0', explication: "Si nécessaire, factorise pour faire apparaître un produit égal à zéro." },
    { etape: 2, titre: 'Séparer en deux équations', explication: "Chaque facteur peut être nul : écris « facteur 1 $= 0$ ou facteur 2 $= 0$ »." },
    { etape: 3, titre: 'Résoudre chaque équation', explication: "Résous séparément chaque équation du premier degré." },
    { etape: 4, titre: 'Conclure', explication: "Rassemble toutes les solutions trouvées. Sépare-les par un point-virgule." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Résous (sépare les solutions par ;) :',
      generer() {
        let a = randInt(1, 8), b = randInt(1, 8); while (b === a) b = randInt(1, 8);
        return { enonce: `$${fac(a)}${fac(b)} = 0$`, reponse: [a, b], validation: 'solutions', reponseTex: `x = ${a} \\text{ ou } x = ${b}` };
      },
      indices: ['Un produit nul : un des facteurs est nul.', 'Résous $x - a = 0$ puis $x - b = 0$.', 'Il y a deux solutions.'],
      correction_detaillee: () => `<p>$x - a = 0$ ou $x - b = 0$ donne directement les deux solutions.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Résous (sépare les solutions par ;) :',
      generer() {
        const a = randIntNonZero(2, 7);
        return { enonce: `$x${fac(a)} = 0$`, reponse: [0, a], validation: 'solutions', reponseTex: `x = 0 \\text{ ou } x = ${a}` };
      },
      indices: ['Les facteurs sont $x$ et $(x-a)$.', '$x = 0$ est une solution évidente.', 'L\'autre vient de $x - a = 0$.'],
      correction_detaillee: () => `<p>$x = 0$ ou $x - a = 0$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Résous (sépare les solutions par ;) :',
      generer() {
        let a = randIntNonZero(-6, 6), b = randIntNonZero(-6, 6); while (b === a) b = randIntNonZero(-6, 6);
        return { enonce: `$${fac(a)}${fac(b)} = 0$`, reponse: [a, b], validation: 'solutions', reponseTex: `x = ${a} \\text{ ou } x = ${b}` };
      },
      indices: ['Attention aux signes des facteurs.', '$(x + 3) = 0$ donne $x = -3$.', 'Résous chaque facteur séparément.'],
      correction_detaillee: () => `<p>Chaque facteur nul donne une solution (penser au signe).</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Résous (un facteur a un coefficient) :',
      generer() {
        const k = randInt(2, 4), r = randInt(1, 5), m = k * r, c = randIntNonZero(-5, 5);
        return { enonce: `$(${k}x - ${m})${fac(c)} = 0$`, reponse: [r, c], validation: 'solutions', reponseTex: `x = ${r} \\text{ ou } x = ${c}` };
      },
      indices: ['$kx - m = 0$ donne $x = \\dfrac{m}{k}$.', 'L\'autre facteur se résout comme d\'habitude.', 'Vérifie que la division tombe juste.'],
      correction_detaillee: (s) => `<p>$kx - m = 0 \\Rightarrow x = \\dfrac{m}{k}$, et l'autre facteur donne la seconde solution.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Factorise puis résous (sépare par ;) :',
      generer() {
        const a = randInt(2, 9);
        return { enonce: `$x^2 - ${a * a} = 0$`, reponse: [a, -a], validation: 'solutions', reponseTex: `x = ${a} \\text{ ou } x = ${-a}`, _v: { a } };
      },
      indices: ['Reconnais une différence de carrés : $x^2 - b^2$.', '$x^2 - b^2 = (x-b)(x+b)$.', 'Puis applique le produit nul.'],
      correction_etapes(st) {
        const { a } = st._v;
        return [
          `On reconnaît une différence de carrés : $x^2 - ${a * a} = x^2 - ${a}^2$.`,
          `On factorise : $(x - ${a})(x + ${a}) = 0$.`,
          `Produit nul : $x = ${a}$ ou $x = ${-a}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Factorise puis résous (sépare par ;) :',
      generer() {
        const a = randInt(2, 8);
        return { enonce: `$x^2 - ${a}x = 0$`, reponse: [0, a], validation: 'solutions', reponseTex: `x = 0 \\text{ ou } x = ${a}` };
      },
      indices: ['$x$ est en facteur commun.', '$x^2 - ax = x(x - a)$.', 'Produit nul : $x = 0$ ou $x - a = 0$.'],
      correction_detaillee: (s) => `<p>$x^2 - ax = x(x-a) = 0$, donc $x = 0$ ou $x = a$.</p>`,
    },

    // ----- Niveau 1 : Compléter les solutions -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète les solutions du produit nul :',
      generer() {
        let a = randInt(1, 8), b = randInt(1, 8); while (b === a) b = randInt(1, 8);
        return {
          enonce_complete: `$(x - ${a})(x - ${b}) = 0$ : $x - ${a} = 0 \\Rightarrow x = $ {0} $\\;$ ou $\\; x - ${b} = 0 \\Rightarrow x = $ {1}`,
          champs: [
            { reponse: a, validation: 'nombre' },
            { reponse: b, validation: 'nombre' },
          ],
          _v: { a, b },
        };
      },
      indices: ['Un produit est nul si un facteur est nul.', 'Le facteur $x - a = 0$ donne $x = a$.', 'Chaque facteur donne une solution.'],
      correction_etapes(st) {
        const { a, b } = st._v;
        return [
          `Premier facteur : $x - ${a} = 0 \\Rightarrow x = ${a}$.`,
          `Second facteur : $x - ${b} = 0 \\Rightarrow x = ${b}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre la résolution :',
      generer() {
        const a = randInt(2, 7), b = randInt(2, 7);
        return {
          etapes: [
            `On a un produit nul : $(x - ${a})(x + ${b}) = 0$`,
            `Au moins un facteur est nul : $x - ${a} = 0$ ou $x + ${b} = 0$`,
            `On résout chaque facteur : $x = ${a}$ ou $x = ${-b}$`,
            `Les solutions sont $${a}$ et $${-b}$`,
          ],
        };
      },
      indices: ['On part de la forme « produit = 0 ».', 'On sépare en deux équations.', 'On conclut avec les deux solutions.'],
      correction_detaillee: () => `<p>Ordre : produit nul → séparer les facteurs → résoudre → conclure.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Un produit de deux facteurs est nul si :', choix: ['les deux facteurs sont nuls', 'au moins un facteur est nul', 'aucun facteur n\'est nul', 'la somme est nulle'], correct: 1, explication: '$AB=0 \\iff A=0$ ou $B=0$.' },
    {
      type: 'saisie', question: 'Résous l\'équation-produit (sépare par ;).',
      generer() { let a = randInt(1, 8), b = randInt(1, 8); while (b === a) b = randInt(1, 8); return { question: `Résous $(x - ${a})(x - ${b}) = 0$ (sépare par ;).`, reponse: [a, b], validation: 'solutions', explication: `$x = ${a}$ ou $x = ${b}$.` }; },
    },
    { type: 'saisie', question: 'Résous $x(x+4) = 0$ (sépare par ;).', reponse: [0, -4], validation: 'solutions', explication: '$x=0$ ou $x=-4$.' },
    { type: 'vrai_faux', question: 'L\'équation $(x+2)(x-9) = 0$ a pour solutions $-2$ et $9$.', reponse: true, explication: '$x+2=0 \\Rightarrow x=-2$ ; $x-9=0 \\Rightarrow x=9$.' },
    {
      type: 'saisie', question: 'Résous (différence de carrés, sépare par ;).',
      generer() { const a = randInt(2, 9); return { question: `Résous $x^2 - ${a * a} = 0$ (sépare par ;).`, reponse: [a, -a], validation: 'solutions', explication: `$(x-${a})(x+${a})=0$ donc $x=${a}$ ou $x=${-a}$.` }; },
    },
  ],
};
