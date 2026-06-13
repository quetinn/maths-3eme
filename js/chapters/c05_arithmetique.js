// =====================================================================
//  c05_arithmetique.js — Nombres premiers, PGCD, fractions irréductibles
// =====================================================================

import { randInt, pick, gcd, isPrime } from '../engine.js';

function decompose(n) {
  const f = {}; let d = 2;
  while (d * d <= n) { while (n % d === 0) { f[d] = (f[d] || 0) + 1; n /= d; } d++; }
  if (n > 1) f[n] = (f[n] || 0) + 1;
  return f;
}
const decompTeX = (f) => Object.entries(f).map(([p, e]) => (e > 1 ? `${p}^${e}` : `${p}`)).join(' \\times ');
function coprime(min, max) {
  let p, q;
  do { p = randInt(min, max); q = randInt(min, max); } while (p === q || gcd(p, q) !== 1);
  return [p, q];
}

export default {
  id: 'c05',
  titre: 'Arithmétique',
  theme: 'nombres_calculs',
  priorite: false,
  icone: '🧮',

  intro:
    "L'arithmétique étudie les nombres entiers : leurs « briques » (les nombres premiers), leurs diviseurs " +
    "communs, et comment simplifier les fractions. C'est la base du chiffrement informatique et un grand " +
    "classique du brevet.",

  cours: [
    { type: 'definition', titre: 'Nombre premier', contenu: "Un nombre premier a exactement <strong>deux</strong> diviseurs : $1$ et lui-même. Exemples : $2, 3, 5, 7, 11, 13\\dots$ (Attention : $1$ n'est pas premier.)" },
    { type: 'propriete', titre: 'Décomposition en facteurs premiers', contenu: "Tout entier $\\geq 2$ s'écrit de façon unique comme produit de nombres premiers.", formule: '360 = 2^3 \\times 3^2 \\times 5' },
    { type: 'definition', titre: 'PGCD', contenu: "Le PGCD de deux entiers est leur <strong>plus grand diviseur commun</strong>. On l'obtient en multipliant les facteurs premiers communs." },
    { type: 'propriete', titre: 'Fraction irréductible', contenu: "Une fraction est irréductible quand le PGCD du numérateur et du dénominateur vaut $1$. On simplifie en divisant les deux par leur PGCD.", formule: '\\dfrac{a}{b} = \\dfrac{a \\div d}{b \\div d}\\quad (d = \\text{PGCD})' },
    {
      type: 'exemple', enonce: 'Rendre $\\dfrac{24}{36}$ irréductible.',
      solution_etapes: [
        "PGCD de $24$ et $36$ : $24 = 2^3\\times3$, $36 = 2^2\\times3^2$, communs $= 2^2\\times3 = 12$.",
        "On divise haut et bas par $12$ : $\\dfrac{24}{36} = \\dfrac{2}{3}$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Tester la primalité', explication: "Essaie de diviser par $2, 3, 5, 7\\dots$ jusqu'à la racine carrée du nombre. Aucun diviseur ⇒ premier." },
    { etape: 2, titre: 'Décomposer', explication: "Divise successivement par le plus petit premier possible, jusqu'à obtenir $1$." },
    { etape: 3, titre: 'Calculer le PGCD', explication: "Multiplie les facteurs premiers communs (avec le plus petit exposant)." },
    { etape: 4, titre: 'Simplifier une fraction', explication: "Divise numérateur et dénominateur par leur PGCD." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'vrai_faux', consigne: 'Vrai ou faux :',
      generer() {
        const n = randInt(11, 59);
        return { enonce: `Le nombre $${n}$ est-il premier ?`, reponse: isPrime(n) };
      },
      indices: ['Cherche un diviseur autre que 1 et lui-même.', 'Teste 2, 3, 5, 7…', "S'il est pair (sauf 2), il n'est pas premier."],
      correction_detaillee: () => `<p>On teste les diviseurs jusqu'à la racine carrée du nombre.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule le PGCD :',
      generer() {
        const g = randInt(2, 9), [p, q] = coprime(2, 7);
        return { enonce: `Quel est le PGCD de $${g * p}$ et $${g * q}$ ?`, reponse: g, validation: 'nombre' };
      },
      indices: ['Cherche le plus grand nombre qui divise les deux.', 'Tu peux décomposer chacun en facteurs premiers.', 'Multiplie les facteurs communs.'],
      correction_detaillee: () => `<p>Le PGCD est le produit des facteurs premiers communs aux deux nombres.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Décompose en produit de facteurs premiers (ex. 2^3*3) :',
      generer() {
        const n = Math.pow(2, randInt(1, 3)) * Math.pow(3, randInt(1, 2)) * (Math.random() < 0.5 ? 5 : 1);
        return { enonce: `Décompose $${n}$ en produit de facteurs premiers.`, reponse: n, validation: 'facteurs_premiers', reponseTex: decompTeX(decompose(n)) };
      },
      indices: ['Commence par diviser par 2 tant que c\'est possible.', 'Continue avec 3, puis 5…', 'Écris le résultat avec des puissances : $2^3$ signifie $2\\times2\\times2$.'],
      correction_detaillee: (s) => `<p>On divise successivement par les nombres premiers croissants : $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Rends la fraction irréductible (forme a/b) :',
      generer() {
        const g = randInt(2, 6), [p, q] = coprime(2, 9);
        return { enonce: `Simplifie $\\dfrac{${g * p}}{${g * q}}$.`, reponse: p / q, validation: 'fraction_irreductible', reponseTex: `\\dfrac{${p}}{${q}}` };
      },
      indices: ['Calcule le PGCD du numérateur et du dénominateur.', 'Divise haut et bas par ce PGCD.', 'Vérifie qu\'on ne peut plus simplifier.'],
      correction_detaillee: (s) => `<p>On divise numérateur et dénominateur par leur PGCD jusqu'à obtenir $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule le PGCD (nombres plus grands) :',
      generer() {
        const g = randInt(6, 15), [p, q] = coprime(3, 9);
        return { enonce: `Quel est le PGCD de $${g * p}$ et $${g * q}$ ?`, reponse: g, validation: 'nombre' };
      },
      indices: ['Décompose les deux nombres en facteurs premiers.', 'Repère les facteurs communs.', 'Le PGCD est le produit de ces facteurs communs.'],
      correction_detaillee: () => `<p>On décompose puis on multiplie les facteurs premiers communs.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux :',
      generer() {
        let a, b;
        if (Math.random() < 0.5) { const [p, q] = coprime(2, 12); a = p; b = q; }
        else { const g = randInt(2, 5), [p, q] = coprime(2, 9); a = g * p; b = g * q; }
        return { enonce: `La fraction $\\dfrac{${a}}{${b}}$ est-elle irréductible ?`, reponse: gcd(a, b) === 1 };
      },
      indices: ['Une fraction est irréductible si PGCD = 1.', 'Cherche un diviseur commun > 1.', 'Si tu en trouves un, elle est réductible.'],
      correction_detaillee: () => `<p>On vérifie si le PGCD du numérateur et du dénominateur vaut 1.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'vrai_faux', question: 'Le nombre $17$ est premier.', reponse: true, explication: '$17$ n\'a que $1$ et $17$ comme diviseurs.' },
    { type: 'qcm', question: 'La décomposition de $36$ en facteurs premiers est :', choix: ['2^2 \\times 3^2', '4 \\times 9', '6^2', '2 \\times 18'], correct: 0, explication: '$36 = 2\\times2\\times3\\times3 = 2^2\\times3^2$ (que des nombres premiers).' },
    { type: 'saisie', question: 'Quel est le PGCD de $12$ et $18$ ?', reponse: 6, validation: 'nombre', explication: '$12 = 2^2\\times3$, $18 = 2\\times3^2$, communs $= 2\\times3 = 6$.' },
    { type: 'saisie', question: 'Rends irréductible $\\dfrac{15}{20}$ (forme a/b).', reponse: 0.75, validation: 'fraction_irreductible', explication: 'PGCD $=5$ : $\\dfrac{15}{20} = \\dfrac{3}{4}$.' },
    { type: 'vrai_faux', question: 'Le nombre $1$ est un nombre premier.', reponse: false, explication: 'Non : un premier a exactement deux diviseurs, or $1$ n\'en a qu\'un.' },
  ],
};
