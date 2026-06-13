// =====================================================================
//  c01_calcul_litteral.js — Chapitre exemple complet
//  Calcul littéral : développer, réduire, factoriser
//  Suit le gabarit en 5 étapes : intro → cours → méthode → exercices → quiz
//  Les énoncés utilisent LaTeX entre $...$ (rendu KaTeX auto).
//  Les `reponse` sont des expressions évaluables (validation par
//  échantillonnage), `reponseTex` sert à l'affichage de la correction.
// =====================================================================

import { randInt, randIntNonZero, signed, coef, gcd, pick } from '../engine.js';

export default {
  id: 'c01',
  titre: 'Calcul littéral',
  theme: 'nombres_calculs',
  priorite: true,
  icone: '🔢',

  intro:
    "Le calcul littéral, c'est calculer avec des lettres pour exprimer une règle " +
    "qui marche pour <em>tous</em> les nombres : le périmètre d'un terrain, le prix de " +
    "<em>n</em> places de cinéma, une formule de physique… Savoir développer et factoriser " +
    "est la clé pour résoudre des équations et préparer les identités remarquables.",

  // -------------------------------------------------------------------
  //  2. Cours essentiel
  // -------------------------------------------------------------------
  cours: [
    {
      type: 'definition',
      titre: 'Développer',
      contenu:
        "Développer une expression, c'est transformer un produit en une somme " +
        "(supprimer les parenthèses) grâce à la distributivité.",
      formule: 'k(a+b) = ka + kb',
    },
    {
      type: 'propriete',
      titre: 'Double distributivité',
      contenu:
        "Pour multiplier deux sommes, on multiplie chaque terme de la première " +
        "par chaque terme de la seconde.",
      formule: '(a+b)(c+d) = ac + ad + bc + bd',
    },
    {
      type: 'definition',
      titre: 'Factoriser',
      contenu:
        "Factoriser, c'est l'opération inverse de développer : transformer une somme " +
        "en un produit en mettant en évidence un <strong>facteur commun</strong>.",
      formule: 'ka + kb = k(a+b)',
    },
    {
      type: 'propriete',
      titre: 'Réduire',
      contenu:
        "Réduire, c'est regrouper les termes de même nature : les termes en " +
        "$x$ ensemble, les nombres ensemble.",
      formule: 'ax + bx = (a+b)x',
    },
    {
      type: 'exemple',
      enonce: 'Développer et réduire $(2x+3)(x-1)$.',
      solution_etapes: [
        "Double distributivité : $2x \\times x + 2x \\times (-1) + 3 \\times x + 3 \\times (-1)$.",
        "On calcule chaque produit : $2x^2 - 2x + 3x - 3$.",
        "On réduit les termes en $x$ : $-2x + 3x = x$.",
        "Résultat : $2x^2 + x - 3$.",
      ],
    },
    {
      type: 'exemple',
      enonce: 'Factoriser $6x + 9$.',
      solution_etapes: [
        "On cherche le facteur commun à $6x$ et $9$ : c'est $3$ (car $6 = 3\\times2$ et $9 = 3\\times3$).",
        "On met $3$ en facteur : $6x + 9 = 3 \\times 2x + 3 \\times 3$.",
        "Résultat : $3(2x + 3)$.",
      ],
    },
  ],

  // -------------------------------------------------------------------
  //  3. Méthode pas-à-pas (développer un produit de deux sommes)
  // -------------------------------------------------------------------
  methode: [
    {
      etape: 1,
      titre: 'Repérer la structure',
      explication:
        "Identifie s'il faut <strong>développer</strong> (il y a des parenthèses à supprimer) " +
        "ou <strong>factoriser</strong> (il y a une somme avec un facteur commun).",
    },
    {
      etape: 2,
      titre: 'Appliquer la distributivité',
      explication:
        "Pour $(a+b)(c+d)$ : multiplie chaque terme du premier facteur par chaque terme du second. " +
        "$\\;a\\times c,\\; a\\times d,\\; b\\times c,\\; b\\times d$.",
    },
    {
      etape: 3,
      titre: 'Gérer les signes',
      explication:
        "Attention aux signes : $(+)\\times(-) = (-)$ et $(-)\\times(-) = (+)$. " +
        "C'est l'erreur la plus fréquente !",
    },
    {
      etape: 4,
      titre: 'Réduire',
      explication:
        "Regroupe les termes semblables : les $x^2$ entre eux, les $x$ entre eux, les nombres entre eux. " +
        "Range le résultat par degré décroissant : $ax^2 + bx + c$.",
    },
    {
      etape: 5,
      titre: 'Vérifier',
      explication:
        "Remplace $x$ par une valeur simple (ex. $x=1$) dans l'expression de départ et dans ta réponse : " +
        "tu dois trouver le même nombre.",
    },
  ],

  // -------------------------------------------------------------------
  //  4. Exercices — 6 exercices sur 3 niveaux, générés aléatoirement
  // -------------------------------------------------------------------
  exercices: [
    // ----- Niveau 1 : Découverte -----
    {
      id: 'e01',
      niveau: 1,
      type: 'saisie',
      consigne: 'Développe cette expression :',
      generer() {
        const k = randInt(2, 6);
        const a = randInt(2, 9);
        const b = randInt(1, 9);
        return {
          enonce: `$${k}(${coef(a)} + ${b})$`,
          reponse: `${k * a}*x + ${k * b}`,
          reponseTex: `${k * a}x + ${k * b}`,
          validation: 'expression',
          _v: { k, a, b },
        };
      },
      indices: [
        'Distributivité simple : $k(a+b) = k\\times a + k\\times b$.',
        'Multiplie le nombre devant la parenthèse par chacun des deux termes.',
        "Le terme en $x$ et le nombre s'écrivent l'un après l'autre, sans parenthèses.",
      ],
      correction_detaillee(s) {
        const { k, a, b } = s._v;
        return `<p>On distribue $${k}$ sur chaque terme :</p>
          <p>$${k}\\times ${a}x + ${k}\\times ${b} = ${k * a}x + ${k * b}$.</p>`;
      },
    },
    {
      id: 'e02',
      niveau: 1,
      type: 'saisie',
      consigne: 'Réduis cette expression (regroupe les termes semblables) :',
      generer() {
        const a = randInt(1, 6), c = randInt(1, 6);
        const b = randInt(1, 9), d = randInt(1, 9);
        return {
          enonce: `$${coef(a)} + ${b} + ${coef(c)} + ${d}$`,
          reponse: `${a + c}*x + ${b + d}`,
          reponseTex: `${a + c}x + ${b + d}`,
          validation: 'expression',
          _v: { a, b, c, d },
        };
      },
      indices: [
        'Sépare les termes en $x$ et les nombres.',
        'Additionne les coefficients des $x$ ensemble, puis les nombres ensemble.',
        '$ax + cx = (a+c)x$.',
      ],
      correction_detaillee(s) {
        const { a, b, c, d } = s._v;
        return `<p>Termes en $x$ : $${a}x + ${c}x = ${a + c}x$.</p>
          <p>Nombres : $${b} + ${d} = ${b + d}$.</p>`;
      },
    },

    // ----- Niveau 2 : Application -----
    {
      id: 'e03',
      niveau: 2,
      type: 'saisie',
      consigne: 'Développe et réduis (double distributivité) :',
      generer() {
        const a = randIntNonZero(-6, 6);
        const b = randIntNonZero(-6, 6);
        return {
          enonce: `$(x ${signed(a)})(x ${signed(b)})$`,
          reponse: `x^2 + ${a + b}*x + ${a * b}`,
          reponseTex: `x^2 ${signed(a + b)}x ${signed(a * b)}`,
          validation: 'expression',
          _v: { a, b },
        };
      },
      indices: [
        '$(x+a)(x+b) = x\\times x + x\\times b + a\\times x + a\\times b$.',
        'Surveille les signes : un produit de deux nombres négatifs est positif.',
        'Le résultat a la forme $x^2 + (a+b)x + ab$.',
      ],
      correction_detaillee(s) {
        const { a, b } = s._v;
        return `<p>Double distributivité :</p>
          <p>$x\\times x + x\\times(${b}) + (${a})\\times x + (${a})\\times(${b})$</p>
          <p>$= x^2 ${signed(b)}x ${signed(a)}x ${signed(a * b)}$</p>
          <p>On réduit les termes en $x$ : $${a} + ${b} = ${a + b}$, d'où $x^2 ${signed(a + b)}x ${signed(a * b)}$.</p>`;
      },
    },
    {
      id: 'e04',
      niveau: 2,
      type: 'saisie',
      consigne: 'Factorise (mets le facteur commun en évidence) :',
      generer() {
        const k = randInt(2, 7);
        const a = randInt(2, 6);
        const b = randInt(2, 9);
        return {
          enonce: `$${k * a}x + ${k * b}$`,
          reponse: `${k}*(${a}*x + ${b})`,
          reponseTex: `${k}(${a}x + ${b})`,
          validation: 'factorisation',
          _v: { k, a, b },
        };
      },
      indices: [
        'Cherche un nombre qui divise les deux coefficients.',
        "Le plus grand diviseur commun te donne le facteur à sortir.",
        'Écris ta réponse sous forme de produit, avec des parenthèses : $k(\\dots)$.',
      ],
      correction_detaillee(s) {
        const { k, a, b } = s._v;
        return `<p>Le facteur commun de $${k * a}$ et $${k * b}$ est $${k}$.</p>
          <p>$${k * a}x + ${k * b} = ${k}\\times ${a}x + ${k}\\times ${b} = ${k}(${a}x + ${b})$.</p>`;
      },
    },

    // ----- Niveau 3 : Défi -----
    {
      id: 'e05',
      niveau: 3,
      type: 'saisie',
      consigne: 'Développe et réduis :',
      generer() {
        const a = randInt(2, 4);
        const c = randInt(2, 4);
        const b = randIntNonZero(-6, 6);
        const d = randIntNonZero(-6, 6);
        const x2 = a * c, x1 = a * d + b * c, x0 = b * d;
        return {
          enonce: `$(${coef(a)} ${signed(b)})(${coef(c)} ${signed(d)})$`,
          reponse: `${x2}*x^2 + ${x1}*x + ${x0}`,
          reponseTex: `${x2}x^2 ${signed(x1)}x ${signed(x0)}`,
          validation: 'expression',
          _v: { a, b, c, d, x2, x1, x0 },
        };
      },
      indices: [
        'Quatre produits à calculer : premier×premier, premier×second, etc.',
        'Le terme en $x^2$ vient du produit des deux termes en $x$.',
        'Additionne les deux termes en $x$ pour réduire.',
      ],
      correction_detaillee(s) {
        const { a, b, c, d, x2, x1, x0 } = s._v;
        return `<p>$${a}x\\times ${c}x = ${a * c}x^2$</p>
          <p>$${a}x\\times(${d}) = ${a * d}x$ &nbsp;et&nbsp; $(${b})\\times ${c}x = ${b * c}x$</p>
          <p>$(${b})\\times(${d}) = ${b * d}$</p>
          <p>On réduit les $x$ : $${a * d} ${signed(b * c)} = ${x1}$, d'où $${x2}x^2 ${signed(x1)}x ${signed(x0)}$.</p>`;
      },
    },
    {
      id: 'e06',
      niveau: 3,
      type: 'saisie',
      consigne: 'Factorise en repérant le facteur commun (forme produit attendue) :',
      generer() {
        // a x² + b x  avec facteur commun d·x
        const d = randInt(2, 5);
        const a = d * randInt(2, 4);
        const b = d * randInt(2, 6);
        const g = gcd(a, b); // = d (au moins)
        return {
          enonce: `$${a}x^2 + ${b}x$`,
          reponse: `${g}*x*(${a / g}*x + ${b / g})`,
          reponseTex: `${g}x(${a / g}x + ${b / g})`,
          validation: 'factorisation',
          _v: { a, b, g },
        };
      },
      indices: [
        'Les deux termes contiennent $x$ : $x$ est un facteur commun.',
        'Cherche aussi le plus grand nombre qui divise les deux coefficients.',
        'Sors $\\;(\\text{nombre})\\times x\\;$ en facteur, puis écris la parenthèse.',
      ],
      correction_detaillee(s) {
        const { a, b, g } = s._v;
        return `<p>Facteur commun : $${g}x$ (le nombre $${g}$ et la lettre $x$).</p>
          <p>$${a}x^2 + ${b}x = ${g}x\\times ${a / g}x + ${g}x\\times ${b / g} = ${g}x(${a / g}x + ${b / g})$.</p>`;
      },
    },
  ],

  // -------------------------------------------------------------------
  //  5. Quiz bilan — 5 questions (valide le chapitre, débloque le badge)
  // -------------------------------------------------------------------
  quiz_bilan: [
    {
      type: 'qcm',
      question: 'Développer $5(x+2)$ donne :',
      choix: ['5x + 2', '5x + 10', 'x + 10', '5x + 7'],
      correct: 1,
      explication: '$5\\times x + 5\\times 2 = 5x + 10$.',
    },
    {
      type: 'saisie',
      question: 'Développe et réduis $(x+3)(x+4)$.',
      reponse: 'x^2 + 7*x + 12',
      validation: 'expression',
      explication: '$(x+3)(x+4) = x^2 + 4x + 3x + 12 = x^2 + 7x + 12$.',
    },
    {
      type: 'vrai_faux',
      question: 'L\'égalité $3(2x+4) = 6x + 12$ est-elle vraie ?',
      reponse: true,
      explication: '$3\\times 2x + 3\\times 4 = 6x + 12$. C\'est correct.',
    },
    {
      type: 'qcm',
      question: 'Factoriser $4x + 8$ donne :',
      choix: ['4(x+2)', '4(x+8)', '2(2x+8)', '4x(1+2)'],
      correct: 0,
      explication: 'Facteur commun $4$ : $4x + 8 = 4(x+2)$.',
    },
    {
      type: 'saisie',
      question: 'Développe et réduis $2(x+1) + 3(x-2)$.',
      reponse: '5*x - 4',
      validation: 'expression',
      explication: '$2x + 2 + 3x - 6 = 5x - 4$.',
    },
  ],
};
