// =====================================================================
//  c06_puissances_racines.js — Puissances, racines carrées, notation sci.
// =====================================================================

import { randInt, pick } from '../engine.js';

function sciTeX(value) {
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mant = value / Math.pow(10, exp);
  const mantStr = String(Math.round(mant * 1000) / 1000);
  return `${mantStr} \\times 10^{${exp}}`;
}

export default {
  id: 'c06',
  titre: 'Puissances et racines',
  theme: 'nombres_calculs',
  priorite: false,
  icone: '√',

  intro:
    "Les puissances permettent d'écrire des nombres immenses (distance des étoiles) ou minuscules (taille " +
    "d'un atome) sans aligner des dizaines de zéros : c'est la notation scientifique. Les racines carrées, " +
    "elles, sont l'opération inverse du carré, omniprésentes en géométrie (Pythagore).",

  cours: [
    { type: 'definition', titre: 'Puissance', contenu: "$a^n$ est le produit de $n$ facteurs égaux à $a$.", formule: 'a^n = \\underbrace{a \\times a \\times \\dots \\times a}_{n \\text{ facteurs}}' },
    { type: 'propriete', titre: 'Règles de calcul', contenu: "Pour une même base :", formule: 'a^m \\times a^n = a^{m+n}, \\qquad \\dfrac{a^m}{a^n} = a^{m-n}, \\qquad (a^m)^n = a^{m\\times n}' },
    { type: 'definition', titre: 'Racine carrée', contenu: "$\\sqrt{a}$ est le nombre positif dont le carré vaut $a$.", formule: '(\\sqrt{a})^2 = a \\quad\\text{et}\\quad \\sqrt{a^2} = a \\;(a\\geq 0)' },
    { type: 'definition', titre: 'Notation scientifique', contenu: "Tout nombre s'écrit $a \\times 10^n$ avec $1 \\leq a < 10$ et $n$ entier relatif.", formule: '32\\,000 = 3{,}2 \\times 10^4 \\qquad 0{,}0042 = 4{,}2 \\times 10^{-3}' },
    {
      type: 'exemple', enonce: 'Écrire $45\\,000$ en notation scientifique.',
      solution_etapes: [
        "On place la virgule après le premier chiffre : $4{,}5$.",
        "On compte les rangs : la virgule a bougé de $4$ positions vers la gauche.",
        "Résultat : $4{,}5 \\times 10^4$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Puissances : compter les facteurs', explication: "$a^n$ = on multiplie $a$ par lui-même $n$ fois. $a^1 = a$ et $a^0 = 1$." },
    { etape: 2, titre: 'Règles d\'exposants', explication: "Même base : on additionne les exposants pour un produit, on les soustrait pour un quotient." },
    { etape: 3, titre: 'Notation scientifique', explication: "Place la virgule après le 1er chiffre non nul, puis compte de combien de rangs elle s'est déplacée : c'est l'exposant (positif si le nombre est grand, négatif s'il est petit)." },
    { etape: 4, titre: 'Racine carrée', explication: "Cherche le nombre positif dont le carré donne le radicande. $\\sqrt{49} = 7$ car $7^2 = 49$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la puissance :',
      generer() {
        const a = randInt(2, 5), n = randInt(2, 4);
        return { enonce: `Calcule $${a}^{${n}}$.`, reponse: Math.pow(a, n), validation: 'nombre' };
      },
      indices: ['$a^n$ : multiplie $a$ par lui-même $n$ fois.', 'Procède étape par étape.', 'Ex. $3^3 = 3\\times3\\times3 = 27$.'],
      correction_detaillee: () => `<p>On effectue le produit de $n$ facteurs égaux à la base.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la racine carrée :',
      generer() {
        const k = randInt(2, 15);
        return { enonce: `Calcule $\\sqrt{${k * k}}$.`, reponse: k, validation: 'nombre' };
      },
      indices: ['Cherche le nombre dont le carré donne le radicande.', 'Quel nombre, multiplié par lui-même, donne ce résultat ?', 'C\'est un carré parfait.'],
      correction_detaillee: (s) => `<p>$\\sqrt{${s.reponse * s.reponse}} = ${s.reponse}$ car $${s.reponse}^2 = ${s.reponse * s.reponse}$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Écris en notation scientifique (ex. 3.2*10^4) :',
      generer() {
        const mant = randInt(11, 99) / 10, exp = randInt(2, 5);
        const value = Math.round(mant * Math.pow(10, exp));
        return { enonce: `Écris $${value}$ en notation scientifique.`, reponse: value, validation: 'notation_scientifique', reponseTex: sciTeX(value) };
      },
      indices: ['La forme est $a \\times 10^n$ avec $1 \\leq a < 10$.', 'Place la virgule après le premier chiffre.', 'Compte de combien de rangs la virgule s\'est déplacée.'],
      correction_detaillee: (s) => `<p>On obtient $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule et donne en notation scientifique :',
      generer() {
        const m = randInt(2, 4), n = randInt(2, 4), p = randInt(1, 3), q = randInt(1, 3);
        const value = m * n * Math.pow(10, p + q);
        return { enonce: `$(${m}\\times10^{${p}}) \\times (${n}\\times10^{${q}})$`, reponse: value, validation: 'notation_scientifique', reponseTex: sciTeX(value) };
      },
      indices: ['Multiplie les nombres entre eux, et les puissances de 10 entre elles.', '$10^p \\times 10^q = 10^{p+q}$.', 'Si le nombre obtenu dépasse 10, ajuste pour avoir $1 \\leq a < 10$.'],
      correction_detaillee: (s) => `<p>On multiplie les mantisses et on additionne les exposants : $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule (même base, additionne les exposants) :',
      generer() {
        const a = pick([2, 3]), m = randInt(2, 3), n = randInt(2, 3);
        return { enonce: `Calcule $${a}^{${m}} \\times ${a}^{${n}}$.`, reponse: Math.pow(a, m + n), validation: 'nombre', reponseTex: `${a}^{${m + n}} = ${Math.pow(a, m + n)}` };
      },
      indices: ['$a^m \\times a^n = a^{m+n}$.', 'Additionne les exposants.', 'Puis calcule la puissance obtenue.'],
      correction_detaillee: (s) => `<p>$a^m \\times a^n = a^{m+n}$, puis on calcule : $${s.reponseTex}$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Écris ce petit nombre en notation scientifique (ex. 4.2*10^-3) :',
      generer() {
        const mant = randInt(11, 99) / 10, exp = -randInt(2, 4);
        const value = Math.round(mant * Math.pow(10, exp) * 1e8) / 1e8;
        return { enonce: `Écris $${value}$ en notation scientifique.`, reponse: value, validation: 'notation_scientifique', reponseTex: sciTeX(value) };
      },
      indices: ['Pour un petit nombre, l\'exposant est négatif.', 'Place la virgule après le premier chiffre non nul.', 'Compte les rangs vers la droite : exposant négatif.'],
      correction_detaillee: (s) => `<p>On obtient $${s.reponseTex}$ (exposant négatif car le nombre est petit).</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Combien vaut $2^5$ ?', reponse: 32, validation: 'nombre', explication: '$2\\times2\\times2\\times2\\times2 = 32$.' },
    { type: 'saisie', question: 'Combien vaut $\\sqrt{81}$ ?', reponse: 9, validation: 'nombre', explication: '$9^2 = 81$.' },
    { type: 'qcm', question: '$10^3 \\times 10^4$ est égal à :', choix: ['10^7', '10^{12}', '10^1', '100^7'], correct: 0, explication: 'Même base : on additionne les exposants, $10^{3+4} = 10^7$.' },
    { type: 'saisie', question: 'Écris $52\\,000$ en notation scientifique (ex. 5.2*10^4).', reponse: 52000, validation: 'notation_scientifique', explication: '$52\\,000 = 5{,}2 \\times 10^4$.' },
    { type: 'vrai_faux', question: 'Le nombre $0{,}0007$ s\'écrit $7 \\times 10^{-4}$ en notation scientifique.', reponse: true, explication: 'La virgule se déplace de 4 rangs vers la droite : exposant $-4$.' },
  ],
};
