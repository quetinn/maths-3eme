// =====================================================================
//  c15_statistiques.js — Moyenne, médiane, étendue, diagrammes (Chart.js)
// =====================================================================

import { randInt, pick } from '../engine.js';
import { mountChart } from '../render.js';

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const median = (arr) => { const s = [...arr].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

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
        return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la médiane.`, reponse: median(data), validation: 'nombre', tolerance: 0.02 };
      },
      indices: ['Ordonne les 6 valeurs.', 'La médiane est la moyenne des 3ᵉ et 4ᵉ valeurs.', 'Additionne-les et divise par 2.'],
      correction_detaillee: () => `<p>Avec un nombre pair de valeurs, la médiane est la moyenne des deux valeurs centrales.</p>`,
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
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Moyenne de $4 ; 6 ; 8 ; 10 ; 12$ ?', reponse: 8, validation: 'nombre', explication: '$(4+6+8+10+12)\\div5 = 40\\div5 = 8$.' },
    { type: 'saisie', question: 'Étendue de $3 ; 9 ; 5 ; 14 ; 7$ ?', reponse: 11, validation: 'nombre', explication: '$14 - 3 = 11$.' },
    { type: 'saisie', question: 'Médiane de $2 ; 5 ; 9 ; 11 ; 20$ ?', reponse: 9, validation: 'nombre', explication: 'La valeur centrale (3ᵉ sur 5) est $9$.' },
    { type: 'qcm', question: 'La médiane partage la série ordonnée :', choix: ['en deux moitiés', 'en trois tiers', 'au milieu des extrêmes', 'à la moyenne'], correct: 0, explication: 'La médiane sépare la série en deux groupes de même effectif.' },
    { type: 'vrai_faux', question: 'La moyenne et la médiane d\'une série sont toujours égales.', reponse: false, explication: 'Non, elles diffèrent souvent (sauf séries symétriques).' },
  ],
};
