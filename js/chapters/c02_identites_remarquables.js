// =====================================================================
//  c02_identites_remarquables.js — (a+b)², (a−b)², (a+b)(a−b)
// =====================================================================

import { randInt, randSign } from '../engine.js';

const pm = (s) => (s > 0 ? '+' : '-');

export default {
  id: 'c02',
  titre: 'Identités remarquables',
  theme: 'nombres_calculs',
  priorite: true,
  icone: '🟰',

  intro:
    "Les identités remarquables sont trois « formules express » qui évitent de poser la double " +
    "distributivité à chaque fois. Elles servent à développer plus vite, à factoriser, et plus tard " +
    "à résoudre des équations du second degré au lycée. Les reconnaître fait gagner un temps précieux.",

  cours: [
    { type: 'propriete', titre: 'Carré d\'une somme', contenu: 'Le carré d\'une somme.', formule: '(a+b)^2 = a^2 + 2ab + b^2' },
    { type: 'propriete', titre: 'Carré d\'une différence', contenu: 'Le carré d\'une différence.', formule: '(a-b)^2 = a^2 - 2ab + b^2' },
    { type: 'propriete', titre: 'Produit de la somme par la différence', contenu: 'Donne une différence de deux carrés.', formule: '(a+b)(a-b) = a^2 - b^2' },
    {
      type: 'exemple',
      enonce: 'Développer $(x+5)^2$.',
      solution_etapes: [
        "On reconnaît $(a+b)^2$ avec $a=x$ et $b=5$.",
        "On applique : $a^2 + 2ab + b^2 = x^2 + 2\\times x\\times 5 + 5^2$.",
        "Résultat : $x^2 + 10x + 25$.",
      ],
    },
    {
      type: 'exemple',
      enonce: 'Factoriser $x^2 - 49$.',
      solution_etapes: [
        "C'est une différence de carrés : $x^2 - 49 = x^2 - 7^2$.",
        "On applique $a^2 - b^2 = (a-b)(a+b)$ avec $a=x$, $b=7$.",
        "Résultat : $(x-7)(x+7)$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Reconnaître la forme', explication: "Repère s'il s'agit d'un carré $(\\dots)^2$ ou d'un produit somme×différence, et si on développe ou on factorise." },
    { etape: 2, titre: 'Identifier $a$ et $b$', explication: "Écris clairement qui est $a$ et qui est $b$ (avec leur signe et leur coefficient)." },
    { etape: 3, titre: 'Appliquer la formule', explication: "Remplace $a$ et $b$ dans la bonne identité. Pour factoriser, repère deux carrés parfaits." },
    { etape: 4, titre: 'Soigner le double produit', explication: "Le terme $2ab$ est l'erreur classique : n'oublie ni le $2$, ni le produit complet." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Développe avec l\'identité remarquable :',
      generer() {
        const a = randInt(1, 9);
        return { enonce: `$(x + ${a})^2$`, reponse: `x^2 + ${2 * a}*x + ${a * a}`, reponseTex: `x^2 + ${2 * a}x + ${a * a}`, validation: 'expression' };
      },
      indices: ['$(a+b)^2 = a^2 + 2ab + b^2$.', 'Ici $a=x$ et $b$ est le nombre.', "N'oublie pas le double produit $2ab$."],
      correction_detaillee: (s) => `<p>$(x+b)^2 = x^2 + 2bx + b^2$ en remplaçant $b$ par le nombre de l'énoncé.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Développe avec l\'identité remarquable :',
      generer() {
        const a = randInt(1, 9);
        return { enonce: `$(x - ${a})^2$`, reponse: `x^2 - ${2 * a}*x + ${a * a}`, reponseTex: `x^2 - ${2 * a}x + ${a * a}`, validation: 'expression' };
      },
      indices: ['$(a-b)^2 = a^2 - 2ab + b^2$.', 'Le terme du milieu est négatif, mais le dernier reste positif.', 'Le carré d\'un nombre est toujours positif.'],
      correction_detaillee: () => `<p>$(x-b)^2 = x^2 - 2bx + b^2$. Attention : $+b^2$ est positif.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Développe (somme × différence) :',
      generer() {
        const a = randInt(2, 9);
        return { enonce: `$(x + ${a})(x - ${a})$`, reponse: `x^2 - ${a * a}`, reponseTex: `x^2 - ${a * a}`, validation: 'expression' };
      },
      indices: ['$(a+b)(a-b) = a^2 - b^2$.', 'Il n\'y a pas de terme en $x$ !', 'Le résultat est une différence de deux carrés.'],
      correction_detaillee: (s) => `<p>$(x+b)(x-b) = x^2 - b^2$ : les termes en $x$ se compensent.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Développe :',
      generer() {
        const b = randInt(2, 5), a = randInt(1, 7);
        return { enonce: `$(${b}x + ${a})^2$`, reponse: `${b * b}*x^2 + ${2 * a * b}*x + ${a * a}`, reponseTex: `${b * b}x^2 + ${2 * a * b}x + ${a * a}`, validation: 'expression' };
      },
      indices: ['Ici $a = ' + '?' + 'x$ : pense à élever le coefficient au carré aussi.', '$(\\,?x+?)^2 = (?x)^2 + 2(?x)(?) + (?)^2$.', 'Le premier terme est en $x^2$ avec un coefficient.'],
      correction_detaillee: (s) => `<p>$(cx+b)^2 = c^2x^2 + 2cb\\,x + b^2$. Le coefficient de $x$ est élevé au carré.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Factorise (différence de carrés, forme produit attendue) :',
      generer() {
        const a = randInt(2, 9);
        return { enonce: `$x^2 - ${a * a}$`, reponse: `(x-${a})*(x+${a})`, reponseTex: `(x - ${a})(x + ${a})`, validation: 'factorisation' };
      },
      indices: ['Reconnais $a^2 - b^2$.', 'Le nombre est-il un carré parfait ? Cherche sa racine.', '$a^2 - b^2 = (a-b)(a+b)$.'],
      correction_detaillee: (s) => `<p>Le nombre est un carré parfait. On écrit $x^2 - b^2 = (x-b)(x+b)$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Factorise (carré parfait, forme produit attendue) :',
      generer() {
        const a = randInt(1, 7), s = randSign();
        return {
          enonce: `$x^2 ${pm(s)} ${2 * a}x + ${a * a}$`,
          reponse: `(x ${pm(s)} ${a})^2`,
          reponseTex: `(x ${pm(s)} ${a})^2`,
          validation: 'factorisation',
          _v: { a, s },
        };
      },
      indices: ['Le premier et le dernier terme sont des carrés.', 'Vérifie que le terme du milieu vaut bien $2ab$.', '$a^2 \\pm 2ab + b^2 = (a \\pm b)^2$.'],
      correction_etapes(st) {
        const { a, s } = st._v; const sg = pm(s);
        return [
          `On repère deux carrés : $x^2 = x\\times x$ et $${a * a} = ${a}^2$.`,
          `On vérifie le double produit : $2\\times x\\times ${a} = ${2 * a}x$ (signe $${sg}$).`,
          `C'est donc le carré parfait $(x ${sg} ${a})^2$.`,
        ];
      },
    },

    // ----- Niveau 1 : Compléter le développement -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète le développement du carré :',
      generer() {
        const a = randInt(2, 9);
        return {
          enonce_complete: `$(x + ${a})^2 = x^2 + $ {0} $x + $ {1}`,
          champs: [
            { reponse: 2 * a, validation: 'nombre' },
            { reponse: a * a, validation: 'nombre' },
          ],
          _v: { a },
        };
      },
      indices: ['$(a+b)^2 = a^2 + 2ab + b^2$.', 'Le terme du milieu est le double produit $2\\times x\\times b$.', 'Le dernier terme est $b^2$.'],
      correction_etapes(st) {
        const { a } = st._v;
        return [
          `Double produit : $2\\times x\\times ${a} = ${2 * a}x$ → premier champ $= ${2 * a}$.`,
          `Carré du second terme : $${a}^2 = ${a * a}$ → second champ $= ${a * a}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre les étapes du développement :',
      generer() {
        const a = randInt(2, 9);
        return {
          etapes: [
            `Reconnaître l'identité $(a+b)^2$ avec $a = x$ et $b = ${a}$`,
            `Écrire la formule : $x^2 + 2\\times x\\times ${a} + ${a}^2$`,
            `Calculer chaque terme : $x^2 + ${2 * a}x + ${a * a}$`,
          ],
        };
      },
      indices: ['On identifie toujours $a$ et $b$ en premier.', 'On applique ensuite la formule sans calculer.', 'On termine par les calculs.'],
      correction_detaillee: () => `<p>Ordre : reconnaître l'identité → appliquer la formule → calculer.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Le développement de $(a+b)^2$ est :', choix: ['a^2 + b^2', 'a^2 + 2ab + b^2', 'a^2 - 2ab + b^2', '2a + 2b'], correct: 1, explication: '$(a+b)^2 = a^2 + 2ab + b^2$.' },
    {
      type: 'saisie', question: 'Développe un carré.',
      generer() { const a = randInt(3, 9); return { question: `Développe $(x + ${a})^2$.`, reponse: `x^2 + ${2 * a}*x + ${a * a}`, validation: 'expression', explication: `$(x+${a})^2 = x^2 + ${2 * a}x + ${a * a}$.` }; },
    },
    { type: 'vrai_faux', question: 'A-t-on $(x-3)^2 = x^2 - 9$ ?', reponse: false, explication: 'Non : $(x-3)^2 = x^2 - 6x + 9$.' },
    { type: 'qcm', question: 'La factorisation de $x^2 - 16$ est :', choix: ['(x-4)(x+4)', '(x-4)^2', '(x-8)(x+2)', 'on ne peut pas'], correct: 0, explication: '$x^2 - 4^2 = (x-4)(x+4)$.' },
    {
      type: 'saisie', question: 'Développe une somme par une différence.',
      generer() { const a = randInt(2, 9); return { question: `Développe $(x + ${a})(x - ${a})$.`, reponse: `x^2 - ${a * a}`, validation: 'expression', explication: `$(x+${a})(x-${a}) = x^2 - ${a * a}$.` }; },
    },
  ],
};
