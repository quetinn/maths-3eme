// =====================================================================
//  c17_algorithmique.js — Variables, boucles, conditions (section bonus)
//  Les programmes sont affichés en pseudo-code (<pre class="pseudocode">).
// =====================================================================

import { randInt, pick } from '../engine.js';

const code = (lines) => `<pre class="pseudocode">${lines.join('\n')}</pre>`;

export default {
  id: 'c17',
  titre: 'Algorithmique',
  theme: 'algo',
  priorite: false,
  icone: '💻',

  intro:
    "Un algorithme est une suite d'instructions précises, comme une recette. C'est la base de la " +
    "programmation (Scratch, Python…). On apprend à lire un programme, à suivre son exécution pas à pas et à " +
    "prévoir ce qu'il affiche.",

  cours: [
    { type: 'definition', titre: 'Variable et affectation', contenu: "Une variable est une « boîte » qui stocke une valeur. La flèche $\\leftarrow$ signifie « reçoit ». <code>x ← 5</code> met $5$ dans $x$." },
    { type: 'definition', titre: 'Condition (si … sinon)', contenu: "Exécute des instructions différentes selon qu'un test est vrai ou faux." },
    { type: 'definition', titre: 'Boucle (pour / tant que)', contenu: "Répète des instructions. <code>pour i de 1 à n</code> répète $n$ fois." },
    {
      type: 'figure', titre: 'Lire un programme',
      contenu: "Ce programme calcule la somme $1+2+3$.",
      render: (host) => { host.innerHTML = code(['s ← 0', 'pour i de 1 à 3', '    s ← s + i', 'afficher s']); },
    },
    {
      type: 'exemple', enonce: 'Que vaut $x$ à la fin ?',
      solution_etapes: [
        "Départ : $x ← 4$.",
        "Puis $x ← x \\times 2$ donne $x = 8$.",
        "Puis $x ← x + 1$ donne $x = 9$. On affiche $9$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer les variables', explication: "Note la valeur de chaque variable au départ." },
    { etape: 2, titre: 'Exécuter ligne par ligne', explication: "Mets à jour les variables à chaque instruction, dans l'ordre." },
    { etape: 3, titre: 'Gérer les boucles', explication: "Refais le corps de la boucle pour chaque valeur de l'indice." },
    { etape: 4, titre: 'Lire la sortie', explication: "La valeur affichée est celle de la variable au moment du « afficher »." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Que va afficher ce programme ?',
      generer() {
        const a = randInt(1, 9), b = randInt(1, 9);
        return { enonce: code([`x ← ${a}`, `x ← x + ${b}`, 'afficher x']), reponse: a + b, validation: 'nombre' };
      },
      indices: ['Suis les instructions dans l\'ordre.', `Au départ $x = $ la première valeur.`, 'Puis on ajoute le second nombre.'],
      correction_detaillee: () => `<p>On exécute chaque ligne : la dernière valeur de $x$ est affichée.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Que va afficher ce programme ?',
      generer() {
        const k = randInt(3, 8), x = randInt(1, 10);
        return {
          enonce: code([`x ← ${x}`, `si x > ${k}`, '    afficher "Grand"', 'sinon', '    afficher "Petit"']),
          choix: ['Grand', 'Petit'],
          correct: x > k ? 0 : 1,
        };
      },
      indices: ['Compare la valeur de $x$ au seuil.', 'Si le test est vrai → première branche.', 'Sinon → branche « sinon ».'],
      correction_detaillee: () => `<p>On évalue le test : s'il est vrai, on exécute le bloc « si », sinon le bloc « sinon ».</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Que va afficher ce programme ?',
      generer() {
        const n = randInt(3, 8);
        return { enonce: code(['s ← 0', `pour i de 1 à ${n}`, '    s ← s + i', 'afficher s']), reponse: (n * (n + 1)) / 2, validation: 'nombre' };
      },
      indices: ['La boucle ajoute $1$, puis $2$, … jusqu\'à $n$.', 'C\'est la somme $1 + 2 + \\dots + n$.', `Astuce : $\\dfrac{n(n+1)}{2}$.`],
      correction_detaillee: (s) => `<p>On additionne tous les entiers de 1 à $n$ : la somme vaut $\\dfrac{n(n+1)}{2}$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Que va afficher ce programme ?',
      generer() {
        const n = randInt(2, 6);
        return { enonce: code(['p ← 1', `pour i de 1 à ${n}`, '    p ← p × 2', 'afficher p']), reponse: Math.pow(2, n), validation: 'nombre' };
      },
      indices: ['À chaque tour, $p$ est multiplié par 2.', `On double $n$ fois en partant de 1.`, `Résultat : $2^n$.`],
      correction_detaillee: (s) => `<p>$p$ est doublé $n$ fois : $p = 2^n$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Que va afficher ce programme ?',
      generer() {
        const x = randInt(2, 6), c = randInt(2, 5), n = randInt(2, 5);
        return { enonce: code([`a ← ${x}`, `pour i de 1 à ${n}`, `    a ← a + ${c}`, 'afficher a']), reponse: x + n * c, validation: 'nombre' };
      },
      indices: ['Note la valeur de départ de $a$.', 'On ajoute le même nombre à chaque tour de boucle.', 'Résultat : valeur de départ + (nombre de tours × pas).'],
      correction_detaillee: () => `<p>La boucle ajoute le même nombre $n$ fois : $a = \\text{départ} + n \\times \\text{pas}$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Que va afficher ce programme ?',
      generer() {
        const n = randInt(4, 8);
        let s = 0; for (let i = 1; i <= n; i++) if (i % 2 === 0) s += i;
        return { enonce: code(['s ← 0', `pour i de 1 à ${n}`, '    si i est pair', '        s ← s + i', 'afficher s']), reponse: s, validation: 'nombre' };
      },
      indices: ['On n\'ajoute que les $i$ pairs.', 'Ignore les valeurs impaires.', 'Additionne 2, 4, 6, … jusqu\'à $n$.'],
      correction_detaillee: () => `<p>Seuls les nombres pairs sont ajoutés à $s$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Après « x ← 7 ; x ← x − 3 », que vaut x ?', reponse: 4, validation: 'nombre', explication: '$7 - 3 = 4$.' },
    { type: 'qcm', question: 'Le symbole « ← » dans un algorithme signifie :', choix: ['affecter une valeur à une variable', 'comparer', 'afficher', 'multiplier'], correct: 0, explication: '« ← » est l\'affectation : la variable reçoit la valeur.' },
    { type: 'saisie', question: 'Combien de fois s\'exécute le corps de « pour i de 1 à 5 » ?', reponse: 5, validation: 'nombre', explication: 'La boucle tourne pour i = 1, 2, 3, 4, 5 : 5 fois.' },
    { type: 'saisie', question: '« s ← 0 ; pour i de 1 à 4 : s ← s + i ; afficher s ». Résultat ?', reponse: 10, validation: 'nombre', explication: '$1+2+3+4 = 10$.' },
    { type: 'vrai_faux', question: 'Dans une condition « si … sinon », les deux branches s\'exécutent toujours.', reponse: false, explication: 'Non : seule la branche correspondant au test s\'exécute.' },
  ],
};
