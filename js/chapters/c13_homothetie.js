// =====================================================================
//  c13_homothetie.js — Agrandissement/réduction, aires ×k², volumes ×k³
// =====================================================================

import { randInt, pick } from '../engine.js';

export default {
  id: 'c13',
  titre: 'Homothétie',
  theme: 'geometrie',
  priorite: false,
  icone: '🔎',

  intro:
    "Une homothétie agrandit ou réduit une figure d'un facteur $k$ (zoom, maquette, photocopie). " +
    "Point crucial : les longueurs sont multipliées par $k$, mais les aires par $k^2$ et les volumes par $k^3$ ! " +
    "Une erreur classique à éviter au brevet.",

  cours: [
    { type: 'definition', titre: 'Rapport d\'homothétie', contenu: "Dans un agrandissement (ou réduction) de rapport $k$, chaque longueur est multipliée par $k$." , formule: 'L' + "' = k \\times L" },
    { type: 'propriete', titre: 'Effet sur les aires', contenu: "Toutes les aires sont multipliées par $k^2$.", formule: "A' = k^2 \\times A" },
    { type: 'propriete', titre: 'Effet sur les volumes', contenu: "Tous les volumes sont multipliés par $k^3$.", formule: "V' = k^3 \\times V" },
    {
      type: 'exemple', enonce: "On agrandit un cube de rapport $k=2$. Que devient son volume ?",
      solution_etapes: [
        "Les volumes sont multipliés par $k^3$.",
        "$k^3 = 2^3 = 8$.",
        "Le volume est multiplié par $8$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Identifier la grandeur', explication: "Longueur, aire ou volume ? C'est ce qui décide de l'exposant." },
    { etape: 2, titre: 'Choisir le facteur', explication: "Longueur → $k$, aire → $k^2$, volume → $k^3$." },
    { etape: 3, titre: 'Multiplier', explication: "Multiplie la grandeur initiale par le bon facteur." },
    { etape: 4, titre: 'Cas d\'une réduction', explication: "Si $k<1$ (ex. $k=\\tfrac12$), la figure rétrécit : aire $\\times k^2$, volume $\\times k^3$ deviennent plus petits." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la nouvelle longueur :',
      generer() {
        const L = randInt(3, 12), k = randInt(2, 5);
        return { enonce: `Une longueur de $${L}$ cm est agrandie de rapport $k = ${k}$. Nouvelle longueur ?`, reponse: L * k, validation: 'nombre' };
      },
      indices: ['Les longueurs sont multipliées par $k$.', `Multiplie la longueur par le rapport.`, "Nouvelle longueur $= k \\times L$."],
      correction_detaillee: () => `<p>Une longueur est simplement multipliée par $k$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Choisis le bon facteur :',
      generer() {
        const k = randInt(2, 4);
        return { enonce: `Dans un agrandissement de rapport $${k}$, l'aire est multipliée par :`, choix: [`${k}`, `${k * k}`, `${k * k * k}`, `${2 * k}`], correct: 1 };
      },
      indices: ['Les aires ne suivent pas le même facteur que les longueurs.', "L'aire est multipliée par $k^2$.", `Calcule $k^2$.`],
      correction_detaillee: () => `<p>Les aires sont multipliées par $k^2$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule la nouvelle aire :',
      generer() {
        const A = randInt(4, 20), k = randInt(2, 4);
        return { enonce: `Une figure d'aire $${A}$ cm² est agrandie de rapport $k = ${k}$. Nouvelle aire ?`, reponse: A * k * k, validation: 'nombre' };
      },
      indices: ["L'aire est multipliée par $k^2$.", `Calcule d'abord $k^2$.`, "Nouvelle aire $= k^2 \\times A$."],
      correction_detaillee: () => `<p>Nouvelle aire $= k^2 \\times A$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule le nouveau volume :',
      generer() {
        const V = randInt(3, 15), k = randInt(2, 3);
        return { enonce: `Un solide de volume $${V}$ cm³ est agrandi de rapport $k = ${k}$. Nouveau volume ?`, reponse: V * k * k * k, validation: 'nombre' };
      },
      indices: ['Les volumes sont multipliés par $k^3$.', `Calcule $k^3$.`, "Nouveau volume $= k^3 \\times V$."],
      correction_detaillee: () => `<p>Nouveau volume $= k^3 \\times V$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Retrouve le rapport k :',
      generer() {
        const k = randInt(2, 5);
        return { enonce: `Après agrandissement, l'aire a été multipliée par $${k * k}$. Quel est le rapport $k$ ?`, reponse: k, validation: 'nombre' };
      },
      indices: ["L'aire est multipliée par $k^2$.", 'Cherche le nombre dont le carré donne ce facteur.', `$k = \\sqrt{\\text{facteur d'aire}}$.`],
      correction_detaillee: (s) => `<p>$k^2 = ${s.reponse * s.reponse}$ donc $k = ${s.reponse}$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Réduction — calcule le nouveau volume (arrondi au dixième) :',
      generer() {
        const V = randInt(40, 200), k = pick([0.5, 0.2, 0.1]);
        return { enonce: `Un solide de volume $${V}$ cm³ est réduit de rapport $k = ${String(k).replace('.', '{,}')}$. Nouveau volume ?`, reponse: Math.round(V * k * k * k * 10) / 10, validation: 'nombre', tolerance: 0.02 };
      },
      indices: ['Même règle : volume $\\times k^3$.', 'Ici $k < 1$ donc le volume diminue.', `Calcule $k^3$ (ex. $0{,}5^3 = 0{,}125$).`],
      correction_detaillee: () => `<p>Nouveau volume $= k^3 \\times V$ (avec $k<1$, le résultat est plus petit).</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Dans un agrandissement de rapport $k$, les volumes sont multipliés par :', choix: ['k', 'k^2', 'k^3', '3k'], correct: 2, explication: 'Les volumes sont multipliés par $k^3$.' },
    { type: 'saisie', question: 'Une longueur de 5 cm est agrandie de rapport 3. Nouvelle longueur ?', reponse: 15, validation: 'nombre', explication: '$5 \\times 3 = 15$.' },
    { type: 'saisie', question: 'Une aire de 10 cm² est agrandie de rapport 2. Nouvelle aire ?', reponse: 40, validation: 'nombre', explication: '$10 \\times 2^2 = 40$.' },
    { type: 'saisie', question: 'Un volume de 6 cm³ est agrandi de rapport 2. Nouveau volume ?', reponse: 48, validation: 'nombre', explication: '$6 \\times 2^3 = 48$.' },
    { type: 'vrai_faux', question: 'Si on double les dimensions d\'un cube, son volume double aussi.', reponse: false, explication: 'Non : le volume est multiplié par $2^3 = 8$, pas par 2.' },
  ],
};
