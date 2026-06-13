// =====================================================================
//  c15_statistiques.js — Moyenne, médiane, étendue, diagrammes (Chart.js)
// =====================================================================

import { randInt, pick } from '../engine.js';
import { mountChart, mountBoxPlot } from '../render.js';

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const median = (arr) => { const s = [...arr].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

// Quartiles (convention par position : Q1 au rang ⌈n/4⌉, Q3 au rang ⌈3n/4⌉).
// Sur une série ordonnée, Q1 et Q3 tombent sur des valeurs de la série.
function quartiles(sortedArr) {
  const s = sortedArr, n = s.length;
  return {
    min: s[0], max: s[n - 1], med: median(s),
    q1: s[Math.ceil(n / 4) - 1], q3: s[Math.ceil((3 * n) / 4) - 1],
  };
}
// Série ordonnée de 11 valeurs (quartiles = 3ᵉ, médiane = 6ᵉ, Q3 = 9ᵉ).
function serie11() {
  return Array.from({ length: 11 }, () => randInt(2, 20)).sort((a, b) => a - b);
}

export default {
  id: 'c15',
  titre: 'Statistiques',
  theme: 'donnees',
  priorite: false,
  icone: '📊',

  intro:
    "Les statistiques résument une masse de données par quelques nombres parlants : la moyenne, la médiane, " +
    "l'étendue. Indispensable pour lire un sondage, comparer des résultats ou analyser une enquête.",

  cours: [
    { type: 'definition', titre: 'Moyenne', contenu: "On additionne toutes les valeurs et on divise par leur nombre.", formule: '\\bar{x} = \\dfrac{\\text{somme des valeurs}}{\\text{nombre de valeurs}}' },
    { type: 'definition', titre: 'Médiane', contenu: "La valeur qui partage la série <strong>ordonnée</strong> en deux moitiés. Pour un nombre pair de valeurs, c'est la moyenne des deux valeurs centrales." },
    { type: 'definition', titre: 'Étendue', contenu: "La différence entre la plus grande et la plus petite valeur.", formule: '\\text{étendue} = \\max - \\min' },
    {
      type: 'definition', titre: 'Quartiles',
      contenu: "Le <strong>premier quartile</strong> $Q_1$ est une valeur telle qu'au moins un quart (25 %) des données lui sont inférieures ou égales ; le <strong>troisième quartile</strong> $Q_3$, au moins les trois quarts (75 %). La médiane est le deuxième quartile. L'<strong>écart interquartile</strong> $Q_3 - Q_1$ mesure la dispersion du « cœur » de la série.",
    },
    {
      type: 'figure', titre: 'Diagramme en boîte (box-plot)',
      contenu: "Il résume cinq nombres : minimum, $Q_1$, médiane, $Q_3$, maximum. La boîte contient la moitié centrale des données ; les « moustaches » vont jusqu'aux valeurs extrêmes.",
      render: (host) => { const s = [3, 5, 6, 7, 7, 9, 11, 12, 14, 15, 18]; mountBoxPlot(host, quartiles(s)); },
    },
    {
      type: 'figure', titre: 'Diagramme en barres',
      contenu: "Un diagramme en barres montre l'effectif de chaque valeur.",
      render: (host) => mountChart(host, {
        type: 'bar',
        data: { labels: ['7', '8', '9', '10', '11'], datasets: [{ data: [3, 5, 8, 4, 2], backgroundColor: '#c0894a' }] },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.7, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
      }),
    },
  ],

  methode: [
    { etape: 1, titre: 'Pour la moyenne', explication: "Additionne toutes les valeurs, puis divise par leur nombre." },
    { etape: 2, titre: 'Pour la médiane', explication: "Range les valeurs dans l'ordre croissant, puis prends celle du milieu (ou la moyenne des deux du milieu)." },
    { etape: 3, titre: "Pour l'étendue", explication: "Repère le maximum et le minimum, puis soustrais." },
    { etape: 4, titre: 'Pour les quartiles', explication: "Ordonne la série. $Q_1$ est la valeur au rang $\\lceil n/4 \\rceil$, $Q_3$ au rang $\\lceil 3n/4 \\rceil$. Avec 11 valeurs : $Q_1 = $ 3ᵉ, médiane $= $ 6ᵉ, $Q_3 = $ 9ᵉ valeur." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la moyenne :',
      generer() {
        const m = randInt(6, 14), data = shuffle([m - 2, m - 1, m, m + 1, m + 2]);
        return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la moyenne.`, reponse: m, validation: 'nombre' };
      },
      indices: ['Additionne toutes les valeurs.', 'Compte combien il y a de valeurs.', 'Divise la somme par ce nombre.'],
      correction_detaillee: () => `<p>Moyenne $= \\dfrac{\\text{somme}}{\\text{effectif}}$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule l\'étendue :',
      generer() {
        const data = Array.from({ length: 6 }, () => randInt(2, 20));
        return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule l'étendue.`, reponse: Math.max(...data) - Math.min(...data), validation: 'nombre' };
      },
      indices: ['Repère la plus grande valeur.', 'Repère la plus petite valeur.', 'Étendue $= \\max - \\min$.'],
      correction_detaillee: () => `<p>Étendue $= \\max - \\min$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule la médiane :',
      generer() {
        const data = Array.from({ length: 5 }, () => randInt(1, 20));
        return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la médiane.`, reponse: median(data), validation: 'nombre' };
      },
      indices: ['Range les valeurs dans l\'ordre croissant.', 'Il y a 5 valeurs : la médiane est la 3ᵉ.', 'C\'est la valeur du milieu.'],
      correction_detaillee: () => `<p>On ordonne la série, la médiane est la valeur centrale.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Lis le diagramme : quel est l\'effectif le plus élevé ?',
      generer() {
        const eff = shuffle([randInt(2, 4), randInt(5, 7), randInt(8, 11), randInt(3, 5)]);
        return {
          enonce: `Voici les effectifs de quatre notes.`,
          reponse: Math.max(...eff), validation: 'nombre',
          visuel: (host) => mountChart(host, {
            type: 'bar',
            data: { labels: ['Note A', 'Note B', 'Note C', 'Note D'], datasets: [{ data: eff, backgroundColor: '#c0894a' }] },
            options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.7, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
          }),
        };
      },
      indices: ['Cherche la barre la plus haute.', 'Lis sa hauteur sur l\'axe vertical.', 'C\'est le plus grand effectif.'],
      correction_detaillee: () => `<p>L'effectif le plus élevé correspond à la barre la plus haute.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule la médiane (arrondi au dixième si besoin) :',
      generer() {
        const data = Array.from({ length: 6 }, () => randInt(1, 20));
        const sorted = [...data].sort((a, b) => a - b);
        return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la médiane.`, reponse: median(data), validation: 'nombre', tolerance: 0.02, _v: { sorted } };
      },
      indices: ['Ordonne les 6 valeurs.', 'La médiane est la moyenne des 3ᵉ et 4ᵉ valeurs.', 'Additionne-les et divise par 2.'],
      correction_etapes(st) {
        const s = st._v.sorted; const a = s[2], b = s[3], m = (a + b) / 2;
        return [
          `On ordonne la série : $${s.join(' \\;;\\; ')}$.`,
          `6 valeurs (nombre pair) : la médiane est la moyenne des 3ᵉ et 4ᵉ, soit $${a}$ et $${b}$.`,
          `Médiane $= \\dfrac{${a} + ${b}}{2} = ${String(m).replace('.', '{,}')}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule la moyenne (arrondi au dixième) :',
      generer() {
        const data = Array.from({ length: 5 }, () => randInt(2, 18));
        const moy = Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10;
        return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la moyenne.`, reponse: moy, validation: 'nombre', tolerance: 0.02 };
      },
      indices: ['Additionne les 5 valeurs.', 'Divise par 5.', 'Arrondis au dixième.'],
      correction_detaillee: () => `<p>Moyenne $= \\dfrac{\\text{somme}}{5}$, arrondie au dixième.</p>`,
    },

    // ----- Niveau 2 : Lire les quartiles d'une série ordonnée -----
    {
      id: 'e07', niveau: 2, type: 'complete',
      consigne: 'Lis les quartiles de cette série ordonnée (11 valeurs) :',
      generer() {
        const s = serie11(), q = quartiles(s);
        return {
          enonce_complete: `Série ordonnée : $${s.join(' \\;;\\; ')}$. $\\;Q_1 = $ {0} $,\\;$ médiane $= $ {1} $,\\;$ $Q_3 = $ {2}`,
          champs: [
            { reponse: q.q1, validation: 'nombre' },
            { reponse: q.med, validation: 'nombre' },
            { reponse: q.q3, validation: 'nombre' },
          ],
          _v: { s, q },
        };
      },
      indices: ['Avec 11 valeurs : $Q_1$ est la 3ᵉ valeur.', 'La médiane est la 6ᵉ valeur.', '$Q_3$ est la 9ᵉ valeur.'],
      correction_etapes(st) {
        const { q } = st._v;
        return [
          `La série a 11 valeurs : $Q_1$ est la 3ᵉ valeur, soit $${q.q1}$.`,
          `La médiane est la 6ᵉ valeur, soit $${q.med}$.`,
          `$Q_3$ est la 9ᵉ valeur, soit $${q.q3}$.`,
        ];
      },
    },

    // ----- Niveau 1 : Ordonner les étapes de la médiane -----
    {
      id: 'e08', niveau: 1, type: 'ordonner_etapes',
      consigne: 'Remets dans l\'ordre le calcul de la médiane :',
      generer() {
        const data = [randInt(6, 12), randInt(1, 5), randInt(13, 20), randInt(7, 11), randInt(2, 6)];
        const sorted = [...data].sort((a, b) => a - b);
        return {
          etapes: [
            `On part de la série : $${data.join(' \\;;\\; ')}$`,
            `On ordonne les valeurs : $${sorted.join(' \\;;\\; ')}$`,
            `Il y a 5 valeurs : la médiane est la 3ᵉ`,
            `La médiane vaut $${sorted[2]}$`,
          ],
        };
      },
      indices: ['On ordonne toujours la série en premier.', 'On compte le nombre de valeurs.', 'La valeur centrale est la médiane.'],
      correction_detaillee: () => `<p>Ordre : série de départ → ordonner → repérer la position centrale → lire la médiane.</p>`,
    },

    // ----- Niveau 3 : Lire un box-plot (écart interquartile) -----
    {
      id: 'e09', niveau: 3, type: 'saisie',
      consigne: 'Lis le diagramme en boîte et calcule l\'écart interquartile ($Q_3 - Q_1$) :',
      generer() {
        const s = serie11(), q = quartiles(s);
        return {
          enonce: `Voici le diagramme en boîte d'une série. Calcule l'écart interquartile $Q_3 - Q_1$.`,
          reponse: q.q3 - q.q1, validation: 'nombre',
          visuel: (host) => mountBoxPlot(host, q),
          _v: { q },
        };
      },
      indices: ['$Q_1$ est le bord gauche de la boîte, $Q_3$ le bord droit.', 'L\'écart interquartile est $Q_3 - Q_1$.', 'C\'est la largeur de la boîte.'],
      correction_etapes(st) {
        const { q } = st._v;
        return [
          `Sur le diagramme : $Q_1 = ${q.q1}$ (bord gauche) et $Q_3 = ${q.q3}$ (bord droit).`,
          `Écart interquartile $= Q_3 - Q_1 = ${q.q3} - ${q.q1} = ${q.q3 - q.q1}$.`,
        ];
      },
    },
  ],

  quiz_bilan: [
    {
      type: 'saisie', question: 'Calcule une moyenne.',
      generer() { const m = randInt(6, 14), data = shuffle([m - 2, m - 1, m, m + 1, m + 2]); return { question: `Moyenne de $${data.join(' ; ')}$ ?`, reponse: m, validation: 'nombre', explication: `Somme $= ${5 * m}$, donc moyenne $= ${5 * m}\\div 5 = ${m}$.` }; },
    },
    {
      type: 'saisie', question: 'Calcule une étendue.',
      generer() { const data = Array.from({ length: 5 }, () => randInt(2, 20)); const mn = Math.min(...data), mx = Math.max(...data); return { question: `Étendue de $${data.join(' ; ')}$ ?`, reponse: mx - mn, validation: 'nombre', explication: `$${mx} - ${mn} = ${mx - mn}$.` }; },
    },
    { type: 'saisie', question: 'Médiane de $2 ; 5 ; 9 ; 11 ; 20$ ?', reponse: 9, validation: 'nombre', explication: 'La valeur centrale (3ᵉ sur 5) est $9$.' },
    { type: 'qcm', question: 'La médiane partage la série ordonnée :', choix: ['en deux moitiés', 'en trois tiers', 'au milieu des extrêmes', 'à la moyenne'], correct: 0, explication: 'La médiane sépare la série en deux groupes de même effectif.' },
    { type: 'qcm', question: 'L\'écart interquartile est égal à :', choix: ['Q_3 - Q_1', 'max - min', 'Q_1 + Q_3', 'la médiane'], correct: 0, explication: 'L\'écart interquartile est $Q_3 - Q_1$ : la largeur de la boîte.' },
  ],
};
