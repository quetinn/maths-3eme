// =====================================================================
//  c08_fonctions_lineaires_affines.js — y = ax + b
//  Traceur interactif, association expression ↔ droite, calculs.
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';
import { plotFunction } from '../render.js';

function affTeX(a, b) {
  let s = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (b > 0) s += ` + ${b}`; else if (b < 0) s += ` - ${-b}`;
  return s;
}

export default {
  id: 'c08',
  titre: 'Fonctions linéaires & affines',
  theme: 'fonctions',
  priorite: true,
  icone: '📉',

  intro:
    "Une fonction <strong>linéaire</strong> ($y = ax$) modélise une situation de proportionnalité : " +
    "double de quantité, double de prix. Une fonction <strong>affine</strong> ($y = ax + b$) ajoute un " +
    "« montant fixe » de départ (abonnement, frais…). Leur graphique est toujours une droite : un outil " +
    "parfait pour comparer deux offres ou prévoir une évolution.",

  cours: [
    { type: 'definition', titre: 'Fonction linéaire', contenu: "Représente une proportionnalité. Sa droite passe par l'origine.", formule: 'f(x) = ax' },
    { type: 'definition', titre: 'Fonction affine', contenu: "$a$ est le <strong>coefficient directeur</strong> (la pente), $b$ l'<strong>ordonnée à l'origine</strong> (où la droite coupe l'axe vertical).", formule: 'f(x) = ax + b' },
    { type: 'propriete', titre: 'Coefficient directeur', contenu: "Entre deux points $A(x_A; y_A)$ et $B(x_B; y_B)$ de la droite :", formule: 'a = \\dfrac{y_B - y_A}{x_B - x_A}' },
    {
      type: 'figure', titre: 'Lecture de a et b',
      contenu: "La droite coupe l'axe vertical en $b$ ; la pente $a$ indique de combien $y$ monte quand $x$ augmente de 1.",
      render: (host) => plotFunction(host, (x) => 2 * x - 1, { xmin: -5, xmax: 5 }),
    },
  ],

  methode: [
    { etape: 1, titre: 'Calculer une image', explication: "Remplace $x$ par sa valeur dans $ax+b$." },
    { etape: 2, titre: 'Tracer la droite', explication: "Place deux points (souvent $x=0$ donne $b$, et un autre $x$ simple), puis relie-les." },
    { etape: 3, titre: 'Lire/calculer le coefficient directeur', explication: "Avec deux points : $a = \\dfrac{\\Delta y}{\\Delta x}$. Graphiquement : « combien on monte pour un pas vers la droite »." },
    { etape: 4, titre: 'Trouver l\'expression', explication: "Connaissant $a$ et un point, calcule $b$ avec $b = y - ax$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule l\'image :',
      generer() {
        const a = randIntNonZero(-4, 4), b = randInt(-5, 5), x0 = randInt(-4, 4);
        return { enonce: `$f(x) = ${affTeX(a, b)}$. &nbsp; Calcule $f(${x0})$.`, reponse: a * x0 + b, validation: 'nombre' };
      },
      indices: ['Remplace $x$ par la valeur donnée.', 'Multiplie d\'abord, additionne ensuite.', 'Surveille les signes.'],
      correction_detaillee: () => `<p>On substitue $x$ puis on calcule $ax+b$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Fonction linéaire — calcule l\'image :',
      generer() {
        const a = randIntNonZero(-5, 5), x0 = randInt(-5, 5);
        return { enonce: `$f(x) = ${affTeX(a, 0)}$. &nbsp; Calcule $f(${x0})$.`, reponse: a * x0, validation: 'nombre' };
      },
      indices: ['Une fonction linéaire, c\'est $f(x)=ax$.', 'Multiplie simplement $a$ par la valeur.', 'Attention au signe.'],
      correction_detaillee: () => `<p>$f(x)=ax$ : on multiplie le coefficient par la valeur de $x$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule le coefficient directeur :',
      generer() {
        const a = randIntNonZero(-3, 3), xA = randInt(-3, 0), xB = randInt(1, 4), b = randInt(-3, 3);
        const yA = a * xA + b, yB = a * xB + b;
        return { enonce: `Une droite passe par $A(${xA}\\,;${yA})$ et $B(${xB}\\,;${yB})$. Quel est son coefficient directeur $a$ ?`, reponse: a, validation: 'nombre' };
      },
      indices: ['$a = \\dfrac{y_B - y_A}{x_B - x_A}$.', 'Calcule la différence des ordonnées, puis des abscisses.', 'Divise enfin l\'une par l\'autre.'],
      correction_detaillee: (s) => `<p>$a = \\dfrac{y_B - y_A}{x_B - x_A}$ : variation verticale divisée par variation horizontale.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Associe la droite à son expression :',
      generer() {
        const a = pick([-2, -1, 1, 2]), b = pick([-2, -1, 0, 1, 2]);
        const f = (x) => a * x + b;
        const good = `f(x) = ${affTeX(a, b)}`;
        const distract = [`f(x) = ${affTeX(-a, b)}`, `f(x) = ${affTeX(a, b + 2)}`, `f(x) = ${affTeX(a + 1, -b)}`];
        const choix = [good, ...distract];
        // mélange en gardant l'index de la bonne réponse
        for (let i = choix.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [choix[i], choix[j]] = [choix[j], choix[i]]; }
        return {
          enonce: `Quelle est l'expression de la droite tracée ?`,
          choix, correct: choix.indexOf(good),
          visuel: (c) => plotFunction(c, f, { xmin: -5, xmax: 5 }),
        };
      },
      indices: ['Regarde où la droite coupe l\'axe vertical : c\'est $b$.', 'Regarde si la droite monte ($a>0$) ou descend ($a<0$).', 'Compte la pente : montée pour un pas vers la droite.'],
      correction_detaillee: () => `<p>On lit $b$ (intersection avec l'axe vertical) puis le signe et la valeur de la pente $a$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Résous $f(x) = k$ (antécédent) :',
      generer() {
        const a = randIntNonZero(2, 4), x1 = randInt(-4, 4), b = randInt(-6, 6);
        const k = a * x1 + b;
        return { enonce: `$f(x) = ${affTeX(a, b)}$. &nbsp; Résous $f(x) = ${k}$.`, reponse: x1, validation: 'nombre' };
      },
      indices: ['Écris $ax + b = k$.', 'Soustrais $b$ des deux côtés.', 'Divise par $a$.'],
      correction_detaillee: (s) => `<p>$ax+b=k \\Rightarrow x = \\dfrac{k-b}{a}$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Détermine l\'expression de la fonction affine (réponds sous la forme ax+b) :',
      generer() {
        const a = randIntNonZero(-3, 3), b = randInt(-4, 4), xA = randInt(-3, 0), xB = randInt(1, 4);
        const yA = a * xA + b, yB = a * xB + b;
        return {
          enonce: `La droite passe par $A(${xA}\\,;${yA})$ et $B(${xB}\\,;${yB})$. Donne $f(x)$.`,
          reponse: `${a}*x + ${b}`, reponseTex: affTeX(a, b), validation: 'expression',
          _v: { a, b, xA, xB, yA, yB },
        };
      },
      indices: ['Calcule d\'abord $a = \\dfrac{y_B-y_A}{x_B-x_A}$.', 'Puis $b = y_A - a\\,x_A$.', 'Écris $f(x) = ax + b$.'],
      correction_etapes(st) {
        const { a, b, xA, xB, yA, yB } = st._v;
        return [
          `Coefficient directeur : $a = \\dfrac{${yB} - (${yA})}{${xB} - (${xA})} = ${a}$.`,
          `Ordonnée à l'origine : $b = ${yA} - ${a}\\times(${xA}) = ${b}$.`,
          `Expression : $f(x) = ${affTeX(a, b)}$.`,
        ];
      },
    },

    // ----- Niveau 1 : Compléter le coefficient directeur -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète le calcul du coefficient directeur :',
      generer() {
        const a = randIntNonZero(-3, 3), xA = randInt(-3, 0), xB = randInt(1, 4), b = randInt(-3, 3);
        const yA = a * xA + b, yB = a * xB + b;
        return {
          enonce_complete: `Droite par $A(${xA};${yA})$ et $B(${xB};${yB})$ : $\\Delta y = $ {0} $, \\;\\Delta x = ${xB - xA}$, donc $a = $ {1}`,
          champs: [
            { reponse: yB - yA, validation: 'nombre' },
            { reponse: a, validation: 'nombre' },
          ],
          _v: { a, xA, xB, yA, yB },
        };
      },
      indices: ['$\\Delta y = y_B - y_A$.', '$\\Delta x = x_B - x_A$.', '$a = \\dfrac{\\Delta y}{\\Delta x}$.'],
      correction_etapes(st) {
        const { a, xA, xB, yA, yB } = st._v;
        return [
          `Variation verticale : $\\Delta y = ${yB} - (${yA}) = ${yB - yA}$.`,
          `Variation horizontale : $\\Delta x = ${xB} - (${xA}) = ${xB - xA}$.`,
          `Coefficient directeur : $a = \\dfrac{${yB - yA}}{${xB - xA}} = ${a}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre la recherche de l\'expression $f(x)=ax+b$ :',
      generer() {
        const a = randIntNonZero(-3, 3), b = randInt(-4, 4);
        return {
          etapes: [
            `Calculer le coefficient directeur : $a = \\dfrac{y_B - y_A}{x_B - x_A}$`,
            `En déduire l'ordonnée à l'origine : $b = y_A - a\\,x_A$`,
            `Écrire l'expression finale : $f(x) = ${affTeX(a, b)}$`,
          ],
        };
      },
      indices: ['On calcule la pente en premier.', 'L\'ordonnée à l\'origine se déduit ensuite.', 'On écrit $f(x)$ en dernier.'],
      correction_detaillee: () => `<p>Ordre : coefficient directeur $a$ → ordonnée à l'origine $b$ → expression $f(x)=ax+b$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'La droite d\'une fonction linéaire passe toujours par :', choix: ["l'origine du repère", "le point (0 ; 1)", "le point (1 ; 0)", "aucun point fixe"], correct: 0, explication: '$f(x)=ax$ donne $f(0)=0$ : la droite passe par l\'origine.' },
    {
      type: 'saisie', question: 'Lis l\'ordonnée à l\'origine.',
      generer() { const a = randIntNonZero(2, 5), b = randIntNonZero(-6, 6); return { question: `Si $f(x) = ${affTeX(a, b)}$, combien vaut $f(0)$ ?`, reponse: b, validation: 'nombre', explication: `$f(0) = ${b}$ : c'est l'ordonnée à l'origine.` }; },
    },
    { type: 'vrai_faux', question: 'Le coefficient directeur de $y = -2x + 1$ est $1$.', reponse: false, explication: 'Non, le coefficient directeur est $-2$ (le nombre devant $x$). $1$ est l\'ordonnée à l\'origine.' },
    { type: 'qcm', question: 'Laquelle de ces fonctions est linéaire ?', choix: ['f(x) = 2x', 'f(x) = 2x + 1', 'f(x) = x - 3', 'f(x) = 5'], correct: 0, explication: 'Une fonction linéaire est de la forme $ax$ (sans terme constant).' },
    {
      type: 'saisie', question: 'Trouve le coefficient.',
      generer() { const a = randInt(2, 6), x0 = randInt(2, 5); return { question: `Pour $f(x) = ax$, on a $f(${x0}) = ${a * x0}$. Combien vaut $a$ ?`, reponse: a, validation: 'nombre', explication: `$a \\times ${x0} = ${a * x0}$, donc $a = ${a}$.` }; },
    },
  ],
};
