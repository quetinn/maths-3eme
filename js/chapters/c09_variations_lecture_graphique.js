// =====================================================================
//  c09_variations_lecture_graphique.js — Sens de variation, min/max
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';
import { plotFunction } from '../render.js';

export default {
  id: 'c09',
  titre: 'Sens de variation',
  theme: 'fonctions',
  priorite: false,
  icone: '〽️',

  intro:
    "Lire un graphique, c'est raconter une histoire : la température qui monte puis redescend, un stock qui " +
    "diminue… On apprend à dire si une fonction <strong>croît</strong> ou <strong>décroît</strong>, et à " +
    "repérer ses valeurs extrêmes (minimum, maximum).",

  cours: [
    { type: 'definition', titre: 'Croissante / décroissante', contenu: "Une fonction est <strong>croissante</strong> si sa courbe monte (de gauche à droite), <strong>décroissante</strong> si elle descend." },
    { type: 'definition', titre: 'Minimum et maximum', contenu: "Le <strong>minimum</strong> est la plus petite valeur atteinte par $f(x)$ ; le <strong>maximum</strong>, la plus grande. On précise toujours en quelle valeur de $x$ il est atteint." },
    {
      type: 'figure', titre: 'Une parabole et son minimum',
      contenu: "Cette courbe descend puis remonte : elle atteint un minimum, puis devient croissante.",
      render: (host) => plotFunction(host, (x) => (x - 1) * (x - 1) - 2, { xmin: -4, xmax: 5 }),
    },
  ],

  methode: [
    { etape: 1, titre: 'Suivre la courbe', explication: "Parcours la courbe de gauche à droite. Quand elle monte : croissante. Quand elle descend : décroissante." },
    { etape: 2, titre: 'Repérer un extremum', explication: "Le point le plus bas donne le minimum, le plus haut le maximum. Lis l'ordonnée (la valeur) et l'abscisse (où il a lieu)." },
    { etape: 3, titre: 'Comparer deux images', explication: "Sur un intervalle où $f$ est croissante : si $x_1 < x_2$ alors $f(x_1) < f(x_2)$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Complète le tableau de valeurs :',
      generer() {
        const a = randIntNonZero(-3, 3), b = randInt(-4, 4), x0 = randInt(-4, 4);
        return { enonce: `Pour $f(x) = ${a === 1 ? 'x' : a === -1 ? '-x' : a + 'x'}${b > 0 ? ' + ' + b : b < 0 ? ' - ' + -b : ''}$, quelle est la valeur de $f(${x0})$ ?`, reponse: a * x0 + b, validation: 'nombre' };
      },
      indices: ['Remplace $x$ par la valeur de la colonne.', 'Calcule soigneusement.', 'Attention aux signes.'],
      correction_detaillee: () => `<p>On remplace $x$ par la valeur demandée dans l'expression de $f$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Lis le sens de variation :',
      generer() {
        const a = pick([-2, -1, 1, 2]), b = randInt(-2, 2);
        return {
          enonce: `La fonction représentée est :`,
          choix: ['croissante', 'décroissante'],
          correct: a > 0 ? 0 : 1,
          visuel: (c) => plotFunction(c, (x) => a * x + b, { xmin: -5, xmax: 5 }),
        };
      },
      indices: ['Suis la courbe de gauche à droite.', 'Si elle monte : croissante.', 'Si elle descend : décroissante.'],
      correction_detaillee: () => `<p>Une droite qui monte (pente positive) est croissante ; qui descend (pente négative) est décroissante.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Lis la valeur du minimum :',
      generer() {
        const h = randInt(-2, 2), k = randInt(-3, 3);
        return {
          enonce: `Quelle est la valeur minimale atteinte par cette fonction ?`,
          reponse: k, validation: 'nombre',
          visuel: (c) => plotFunction(c, (x) => (x - h) * (x - h) + k, { xmin: h - 4, xmax: h + 4 }),
        };
      },
      indices: ['Cherche le point le plus bas de la courbe.', 'La valeur du minimum est son ordonnée.', 'Lis sur l\'axe vertical.'],
      correction_detaillee: () => `<p>Le minimum est l'ordonnée du point le plus bas de la courbe.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Lis l\'abscisse du minimum :',
      generer() {
        const h = randInt(-2, 3), k = randInt(-3, 3);
        return {
          enonce: `En quelle valeur de $x$ cette fonction atteint-elle son minimum ?`,
          reponse: h, validation: 'nombre',
          visuel: (c) => plotFunction(c, (x) => (x - h) * (x - h) + k, { xmin: h - 4, xmax: h + 4 }),
        };
      },
      indices: ['Le minimum est le point le plus bas.', 'Lis son abscisse (axe horizontal).', 'Descends du sommet jusqu\'à l\'axe des $x$.'],
      correction_detaillee: () => `<p>On lit l'abscisse du point le plus bas.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'qcm', consigne: 'Compare sans calculer :',
      generer() {
        const x1 = randInt(-3, 1), x2 = x1 + randInt(1, 4), croissante = Math.random() < 0.5;
        const good = croissante ? 'f(x_1) < f(x_2)' : 'f(x_1) > f(x_2)';
        const choix = ['f(x_1) < f(x_2)', 'f(x_1) > f(x_2)', 'f(x_1) = f(x_2)'];
        return {
          enonce: `$f$ est ${croissante ? 'croissante' : 'décroissante'} et $x_1 = ${x1} < x_2 = ${x2}$. Que peut-on dire ?`,
          choix, correct: choix.indexOf(good),
        };
      },
      indices: ['Croissante : l\'ordre est conservé.', 'Décroissante : l\'ordre est inversé.', 'Compare les images selon le sens de variation.'],
      correction_detaillee: () => `<p>Croissante conserve l'ordre ($x_1<x_2 \\Rightarrow f(x_1)<f(x_2)$) ; décroissante l'inverse.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Lis l\'image sur la courbe :',
      generer() {
        const h = randInt(-1, 2), k = randInt(-2, 2), x0 = h + pick([-2, -1, 1, 2]);
        return {
          enonce: `Lis $f(${x0})$ sur le graphique.`,
          reponse: (x0 - h) * (x0 - h) + k, validation: 'nombre',
          visuel: (c) => plotFunction(c, (x) => (x - h) * (x - h) + k, { xmin: h - 4, xmax: h + 4 }),
        };
      },
      indices: ['Place-toi sur l\'abscisse donnée.', 'Monte jusqu\'à la courbe.', 'Lis l\'ordonnée. Tu peux toucher la courbe.'],
      correction_detaillee: () => `<p>On lit l'ordonnée du point de la courbe situé au-dessus de $x$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Une fonction dont la courbe descend de gauche à droite est :', choix: ['croissante', 'décroissante', 'constante', 'positive'], correct: 1, explication: 'Une courbe qui descend correspond à une fonction décroissante.' },
    { type: 'qcm', question: 'Le minimum d\'une fonction est :', choix: ['la plus petite valeur atteinte', 'la plus grande valeur', 'la valeur en x=0', 'toujours 0'], correct: 0, explication: 'Le minimum est la plus petite valeur prise par $f(x)$.' },
    { type: 'saisie', question: 'Pour $f(x) = 2x - 1$, combien vaut $f(3)$ ?', reponse: 5, validation: 'nombre', explication: '$2\\times3 - 1 = 5$.' },
    { type: 'vrai_faux', question: 'Si $f$ est croissante et $1 < 4$, alors $f(1) < f(4)$.', reponse: true, explication: 'Une fonction croissante conserve l\'ordre.' },
    { type: 'saisie', question: 'L\'étendue d\'une fonction qui varie entre $-2$ et $7$ est… (max − min)', reponse: 9, validation: 'nombre', explication: '$7 - (-2) = 9$.' },
  ],
};
