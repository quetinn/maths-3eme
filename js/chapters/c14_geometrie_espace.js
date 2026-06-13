// =====================================================================
//  c14_geometrie_espace.js — Pyramide, cône, sphère : volumes et sections
// =====================================================================

import { randInt, pick } from '../engine.js';

const r1 = (x) => Math.round(x * 10) / 10;

export default {
  id: 'c14',
  titre: "Géométrie dans l'espace",
  theme: 'geometrie',
  priorite: false,
  icone: '🧊',

  intro:
    "Calculer le volume d'une pyramide, d'un cône ou d'une boule sert dans la vie réelle : contenance d'un " +
    "réservoir, quantité de matière, emballages. On apprend aussi à reconnaître les sections planes des solides.",

  cours: [
    { type: 'propriete', titre: 'Volume du pavé / cube', contenu: "Pavé droit de dimensions $L,\\ell,h$ ; cube d'arête $a$.", formule: 'V_{pavé} = L \\times \\ell \\times h, \\qquad V_{cube} = a^3' },
    { type: 'propriete', titre: 'Volume de la pyramide et du cône', contenu: "$B$ est l'aire de la base, $h$ la hauteur.", formule: 'V = \\dfrac{1}{3} \\times B \\times h' },
    { type: 'propriete', titre: 'Volume du cône de révolution', contenu: "Base disque de rayon $r$.", formule: 'V = \\dfrac{1}{3} \\times \\pi r^2 \\times h' },
    { type: 'propriete', titre: 'Volume de la boule', contenu: "Boule de rayon $r$.", formule: 'V = \\dfrac{4}{3} \\times \\pi r^3' },
    {
      type: 'exemple', enonce: "Volume d'un cône de rayon $r=3$ cm et de hauteur $h=10$ cm (arrondi au dixième).",
      solution_etapes: [
        "$V = \\dfrac13 \\pi r^2 h = \\dfrac13 \\times \\pi \\times 3^2 \\times 10$.",
        "$V = \\dfrac13 \\times \\pi \\times 90 = 30\\pi$.",
        "$V \\approx 94{,}2$ cm³.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Reconnaître le solide', explication: "Pavé, cube, pyramide, cône, boule ? Chacun a sa formule." },
    { etape: 2, titre: 'Repérer les données', explication: "Identifie la base, la hauteur, le rayon selon le cas." },
    { etape: 3, titre: 'Appliquer la formule', explication: "N'oublie pas le facteur $\\tfrac13$ pour pyramide/cône, et $\\tfrac43\\pi$ pour la boule." },
    { etape: 4, titre: 'Arrondir', explication: "Si $\\pi$ intervient, donne une valeur approchée (souvent au dixième)." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule le volume du cube :',
      generer() {
        const a = randInt(2, 9);
        return { enonce: `Volume d'un cube d'arête $${a}$ cm ?`, reponse: a * a * a, validation: 'nombre' };
      },
      indices: ["$V_{cube} = a^3$.", 'Multiplie l\'arête trois fois par elle-même.', `$a^3 = a\\times a\\times a$.`],
      correction_detaillee: () => `<p>$V = a^3$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule le volume de la pyramide :',
      generer() {
        const B = 3 * randInt(2, 8), h = randInt(2, 9);
        return { enonce: `Pyramide de base d'aire $B = ${B}$ cm² et de hauteur $h = ${h}$ cm. Volume ?`, reponse: (B * h) / 3, validation: 'nombre' };
      },
      indices: ["$V = \\dfrac13 \\times B \\times h$.", "Multiplie l'aire de base par la hauteur.", 'Divise le résultat par 3.'],
      correction_detaillee: () => `<p>$V = \\dfrac13 B h$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Volume du cône (arrondi au dixième, π ≈ 3,14) :',
      generer() {
        const r = randInt(2, 6), h = randInt(4, 12);
        return { enonce: `Cône de rayon $r = ${r}$ cm et hauteur $h = ${h}$ cm. Volume ?`, reponse: r1((1 / 3) * Math.PI * r * r * h), validation: 'nombre', tolerance: 0.02 };
      },
      indices: ["$V = \\dfrac13 \\pi r^2 h$.", "Calcule $r^2$, multiplie par $h$ puis par $\\pi$.", 'Divise par 3 et arrondis.'],
      correction_detaillee: () => `<p>$V = \\dfrac13 \\pi r^2 h$, puis on arrondit.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Volume de la boule (arrondi au dixième, π ≈ 3,14) :',
      generer() {
        const r = randInt(2, 6);
        return { enonce: `Boule de rayon $r = ${r}$ cm. Volume ?`, reponse: r1((4 / 3) * Math.PI * r * r * r), validation: 'nombre', tolerance: 0.02 };
      },
      indices: ["$V = \\dfrac43 \\pi r^3$.", 'Calcule $r^3$.', "Multiplie par $\\pi$ et par $\\dfrac43$, puis arrondis."],
      correction_detaillee: () => `<p>$V = \\dfrac43 \\pi r^3$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'qcm', consigne: 'Identifie la section :',
      generer() {
        const cas = [
          { e: "La section d'une sphère par un plan est :", good: 'un cercle', ch: ['un cercle', 'un carré', 'un triangle', 'une ellipse allongée'] },
          { e: "La section d'un pavé droit par un plan parallèle à une face est :", good: 'un rectangle', ch: ['un rectangle', 'un cercle', 'un triangle', 'un losange'] },
          { e: "La section d'un cylindre par un plan parallèle à sa base est :", good: 'un disque', ch: ['un disque', 'un rectangle', 'un triangle', 'un carré'] },
        ];
        const c = pick(cas);
        return { enonce: c.e, choix: c.ch, correct: c.ch.indexOf(c.good) };
      },
      indices: ['Imagine le plan qui « coupe » le solide.', 'La forme dépend du solide et de l\'orientation du plan.', 'Une sphère donne toujours un cercle.'],
      correction_detaillee: () => `<p>La forme de la section dépend du solide et de la position du plan de coupe.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Volume du pavé droit :',
      generer() {
        const L = randInt(3, 9), l = randInt(2, 7), h = randInt(2, 8);
        return { enonce: `Pavé droit de dimensions $${L} \\times ${l} \\times ${h}$ cm. Volume ?`, reponse: L * l * h, validation: 'nombre' };
      },
      indices: ['$V = L \\times \\ell \\times h$.', 'Multiplie les trois dimensions.', 'Le résultat est en cm³.'],
      correction_detaillee: () => `<p>$V = L \\times \\ell \\times h$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Le volume d\'une pyramide est :', choix: ['B \\times h', '\\dfrac13 B \\times h', '\\dfrac12 B \\times h', '\\pi B h'], correct: 1, explication: '$V = \\dfrac13 \\times B \\times h$.' },
    { type: 'saisie', question: 'Volume d\'un cube d\'arête 4 cm ?', reponse: 64, validation: 'nombre', explication: '$4^3 = 64$ cm³.' },
    { type: 'saisie', question: 'Volume d\'une pyramide, base 12 cm², hauteur 5 cm ?', reponse: 20, validation: 'nombre', explication: '$\\dfrac13 \\times 12 \\times 5 = 20$ cm³.' },
    { type: 'qcm', question: 'La section d\'une sphère par un plan est toujours :', choix: ['un cercle', 'un carré', 'une ellipse', 'un point'], correct: 0, explication: 'Toute section plane d\'une sphère est un cercle.' },
    { type: 'saisie', question: 'Volume de la boule de rayon 3 cm (arrondi au dixième) ?', reponse: 113.1, validation: 'nombre', tolerance: 0.02, explication: '$\\dfrac43 \\pi \\times 27 = 36\\pi \\approx 113{,}1$ cm³.' },
  ],
};
