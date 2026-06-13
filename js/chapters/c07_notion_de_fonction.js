// =====================================================================
//  c07_notion_de_fonction.js — Image, antécédent, tableau, graphe
//  Utilise le traceur de fonctions SVG interactif (render.js).
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';
import { plotFunction } from '../render.js';

// f(x) = a x + b en LaTeX
function affTeX(a, b) {
  let s = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (b > 0) s += ` + ${b}`; else if (b < 0) s += ` - ${-b}`;
  return s;
}

export default {
  id: 'c07',
  titre: 'Notion de fonction',
  theme: 'fonctions',
  priorite: true,
  icone: '📈',

  intro:
    "Une fonction est une « machine à transformer » : à chaque nombre d'entrée, elle associe " +
    "<em>un seul</em> nombre de sortie. On s'en sert partout : convertir des devises, calculer un prix " +
    "en fonction d'une quantité, décrire la trajectoire d'un ballon. Savoir lire image et antécédent " +
    "sur un graphique est une compétence-clé du brevet.",

  cours: [
    { type: 'definition', titre: 'Image', contenu: "Le nombre de sortie associé à $x$ se note $f(x)$ : c'est l'<strong>image</strong> de $x$.", formule: 'x \\;\\longmapsto\\; f(x)' },
    { type: 'definition', titre: 'Antécédent', contenu: "Si $f(x)=y$, alors $x$ est un <strong>antécédent</strong> de $y$. Un nombre peut avoir plusieurs antécédents, mais une seule image." },
    {
      type: 'figure', titre: 'Lecture sur un graphique',
      contenu: "Touche la courbe pour lire un point : l'abscisse donne l'antécédent, l'ordonnée donne l'image.",
      render: (host) => plotFunction(host, (x) => 0.5 * x + 1, { xmin: -5, xmax: 5 }),
    },
    {
      type: 'exemple', enonce: 'Soit $f(x) = 2x - 1$. Calculer $f(3)$.',
      solution_etapes: ["On remplace $x$ par $3$ : $f(3) = 2\\times 3 - 1$.", "$f(3) = 6 - 1 = 5$. L'image de $3$ est $5$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Calculer une image', explication: "Remplace $x$ par la valeur donnée dans l'expression de $f$, puis calcule." },
    { etape: 2, titre: 'Lire une image sur un graphe', explication: "Pars de $x$ sur l'axe horizontal, monte jusqu'à la courbe, puis lis l'ordonnée." },
    { etape: 3, titre: 'Lire un antécédent', explication: "Pars de $y$ sur l'axe vertical, va jusqu'à la courbe, puis lis l'abscisse." },
    { etape: 4, titre: 'Trouver un antécédent par le calcul', explication: "Résous l'équation $f(x) = y$ pour trouver le(s) antécédent(s) de $y$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule l\'image demandée :',
      generer() {
        const a = randIntNonZero(-3, 4), b = randInt(-4, 4), x0 = randInt(-3, 4);
        return { enonce: `$f(x) = ${affTeX(a, b)}$. &nbsp; Calcule $f(${x0})$.`, reponse: a * x0 + b, validation: 'nombre' };
      },
      indices: ['Remplace $x$ par la valeur indiquée.', 'Effectue d\'abord la multiplication, puis l\'addition.', 'Attention aux signes des nombres négatifs.'],
      correction_detaillee: () => `<p>On substitue la valeur de $x$ dans $f(x)$ puis on calcule.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Choisis la bonne interprétation :',
      generer() {
        const x0 = randInt(2, 6), y0 = randInt(2, 9);
        return {
          enonce: `On sait que $f(${x0}) = ${y0}$.`,
          choix: [`L'image de $${x0}$ par $f$ est $${y0}$.`, `L'image de $${y0}$ par $f$ est $${x0}$.`, `$${x0}$ et $${y0}$ sont deux images.`, `$f$ vaut toujours $${y0}$.`],
          correct: 0,
        };
      },
      indices: ['$f(\\text{entrée}) = \\text{sortie}$.', 'La sortie est l\'image de l\'entrée.', 'Le nombre entre parenthèses est l\'antécédent.'],
      correction_detaillee: () => `<p>$f(a)=b$ signifie « l'image de $a$ est $b$ », ou « $a$ est un antécédent de $b$ ».</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Lis l\'image sur le graphique :',
      generer() {
        const a = pick([-2, -1, 1, 2]), b = randInt(-2, 2), x0 = randInt(-3, 3);
        const f = (x) => a * x + b;
        return {
          enonce: `Lis l'image de $${x0}$ par la fonction représentée.`,
          reponse: a * x0 + b, validation: 'nombre',
          visuel: (c) => plotFunction(c, f, { xmin: -5, xmax: 5 }),
        };
      },
      indices: ['Place-toi sur l\'abscisse donnée.', 'Monte (ou descends) jusqu\'à la courbe.', 'Lis l\'ordonnée du point. Tu peux toucher la courbe.'],
      correction_detaillee: () => `<p>L'image se lit sur l'axe vertical, à la hauteur de la courbe au-dessus de $x$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Lis l\'antécédent sur le graphique :',
      generer() {
        const a = pick([-2, -1, 1, 2]), x1 = randInt(-3, 3), b = randInt(-2, 2);
        const y0 = a * x1 + b;
        const f = (x) => a * x + b;
        return {
          enonce: `Lis l'antécédent de $${y0}$ par la fonction représentée.`,
          reponse: x1, validation: 'nombre',
          visuel: (c) => plotFunction(c, f, { xmin: -5, xmax: 5 }),
        };
      },
      indices: ['Place-toi sur l\'ordonnée donnée.', 'Va horizontalement jusqu\'à la courbe.', 'Lis l\'abscisse du point.'],
      correction_detaillee: () => `<p>L'antécédent se lit sur l'axe horizontal, sous le point de la courbe d'ordonnée donnée.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Trouve l\'antécédent par le calcul :',
      generer() {
        const a = randIntNonZero(2, 4), x1 = randInt(-4, 4), b = randInt(-5, 5);
        const k = a * x1 + b;
        return { enonce: `$f(x) = ${affTeX(a, b)}$. &nbsp; Quel est l'antécédent de $${k}$ ? (résous $f(x) = ${k}$)`, reponse: x1, validation: 'nombre', _v: { a, b, x1, k } };
      },
      indices: ['Écris l\'équation $f(x) = $ valeur.', 'Isole le terme en $x$ en passant le nombre de l\'autre côté.', 'Divise par le coefficient de $x$.'],
      correction_etapes(st) {
        const { a, b, x1, k } = st._v; const bTex = b >= 0 ? `+ ${b}` : `- ${-b}`;
        return [
          `On résout l'équation $${a}x ${bTex} = ${k}$.`,
          `On isole le terme en $x$ : $${a}x = ${k - b}$.`,
          `On divise par $${a}$ : $x = ${x1}$. L'antécédent est $${x1}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule l\'image (fonction non affine) :',
      generer() {
        const c0 = randInt(-4, 4), x0 = randInt(-3, 3);
        const f = (x) => x * x + c0;
        return {
          enonce: `$f(x) = x^2 ${c0 >= 0 ? '+ ' + c0 : '- ' + -c0}$. &nbsp; Calcule $f(${x0})$.`,
          reponse: x0 * x0 + c0, validation: 'nombre',
          visuel: (cc) => plotFunction(cc, f, { xmin: -4, xmax: 4 }),
        };
      },
      indices: ['$x^2$ veut dire $x\\times x$.', 'Le carré d\'un nombre négatif est positif.', 'Calcule $x^2$ d\'abord, puis ajoute la constante.'],
      correction_detaillee: () => `<p>On calcule $x^2$ (toujours positif) puis on ajoute la constante.</p>`,
    },

    // ----- Niveau 1 : Compléter le calcul d'une image -----
    {
      id: 'e07', niveau: 1, type: 'complete',
      consigne: 'Complète le calcul de l\'image :',
      generer() {
        const a = randInt(2, 5), b = randInt(1, 9), x0 = randInt(2, 6);
        return {
          enonce_complete: `$f(x) = ${a}x + ${b}$ : $f(${x0}) = ${a}\\times ${x0} + ${b}$. Produit $${a}\\times ${x0} = $ {0} $,$ donc $f(${x0}) = $ {1}`,
          champs: [
            { reponse: a * x0, validation: 'nombre' },
            { reponse: a * x0 + b, validation: 'nombre' },
          ],
          _v: { a, b, x0 },
        };
      },
      indices: ['On remplace $x$ par la valeur donnée.', 'On calcule d\'abord le produit.', 'On ajoute ensuite la constante.'],
      correction_etapes(st) {
        const { a, b, x0 } = st._v;
        return [
          `On remplace $x$ par $${x0}$ : $f(${x0}) = ${a}\\times ${x0} + ${b}$.`,
          `Produit : $${a}\\times ${x0} = ${a * x0}$.`,
          `On ajoute : $${a * x0} + ${b} = ${a * x0 + b}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes (antécédent) -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre la recherche d\'un antécédent :',
      generer() {
        const a = randInt(2, 4), x1 = randInt(1, 6), b = randInt(1, 6); const k = a * x1 + b;
        return {
          etapes: [
            `On cherche l'antécédent de $${k}$ : on résout $${a}x + ${b} = ${k}$`,
            `On retire $${b}$ des deux côtés : $${a}x = ${k - b}$`,
            `On divise par $${a}$ : $x = ${x1}$`,
            `L'antécédent de $${k}$ est $${x1}$`,
          ],
        };
      },
      indices: ['On pose l\'équation $f(x) = $ valeur.', 'On isole le terme en $x$.', 'On divise en dernier.'],
      correction_detaillee: () => `<p>Ordre : poser l'équation → isoler $ax$ → diviser → conclure.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: '$f(3) = 7$ signifie que :', choix: ["l'image de 3 est 7", "l'antécédent de 3 est 7", "3 est l'image de 7", "f vaut 3"], correct: 0, explication: "Le nombre entre parenthèses (3) est l'antécédent ; le résultat (7) est l'image." },
    {
      type: 'saisie', question: 'Calcule une image.',
      generer() { const a = randInt(2, 5), b = randInt(1, 6), x0 = randInt(2, 6); return { question: `Si $f(x) = ${a}x + ${b}$, combien vaut $f(${x0})$ ?`, reponse: a * x0 + b, validation: 'nombre', explication: `$${a}\\times ${x0} + ${b} = ${a * x0 + b}$.` }; },
    },
    { type: 'vrai_faux', question: 'Un nombre peut avoir plusieurs images par une fonction.', reponse: false, explication: 'Non : chaque entrée a une seule image. (Mais un nombre peut avoir plusieurs antécédents.)' },
    { type: 'qcm', question: 'Sur un graphique, l\'image d\'un nombre se lit sur :', choix: ["l'axe vertical (ordonnées)", "l'axe horizontal (abscisses)", "la première bissectrice", "n'importe où"], correct: 0, explication: "L'image est une ordonnée : elle se lit sur l'axe vertical." },
    {
      type: 'saisie', question: 'Trouve un antécédent.',
      generer() { const a = randInt(2, 5), x1 = randInt(2, 6); return { question: `Si $f(x) = ${a}x$, quel est l'antécédent de $${a * x1}$ ?`, reponse: x1, validation: 'nombre', explication: `On résout $${a}x = ${a * x1}$, donc $x = ${x1}$.` }; },
    },
  ],
};
