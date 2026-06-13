// =====================================================================
//  c10_thales.js — Théorème de Thalès et sa réciproque
//  Figure JSXGraph dynamique (point M déplaçable, MN reste // à AB).
// =====================================================================

import { randInt } from '../engine.js';
import { mountJSXGraph } from '../render.js';

const round2 = (x) => Math.round(x * 100) / 100;

export default {
  id: 'c10',
  titre: 'Théorème de Thalès',
  theme: 'geometrie',
  priorite: true,
  icone: '📐',

  intro:
    "Le théorème de Thalès permet de calculer des longueurs <em>inaccessibles</em> (hauteur d'un arbre, " +
    "largeur d'une rivière) à partir de mesures simples et de droites parallèles. C'est aussi la base " +
    "des agrandissements et réductions à l'échelle.",

  cours: [
    {
      type: 'propriete', titre: 'Théorème de Thalès',
      contenu: "Si $M \\in (OA)$, $N \\in (OB)$ et $(MN)\\parallel(AB)$, alors les rapports des longueurs sont égaux :",
      formule: '\\dfrac{OM}{OA} = \\dfrac{ON}{OB} = \\dfrac{MN}{AB}',
    },
    {
      type: 'propriete', titre: 'Réciproque',
      contenu: "Si $M,N$ sont placés tels que $\\dfrac{OM}{OA} = \\dfrac{ON}{OB}$ <em>et</em> que $O,M,A$ et $O,N,B$ sont alignés dans le même ordre, alors $(MN)\\parallel(AB)$.",
    },
    {
      type: 'figure', titre: 'Configuration dynamique',
      contenu: "Déplace le point $M$ : la droite $(MN)$ reste parallèle à $(AB)$ et les rapports restent égaux.",
      render: (host) => mountJSXGraph(host, (board, JXG) => {
        const O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 2, color: '#333' });
        const A = board.create('point', [6, 1], { name: 'A', fixed: true });
        const B = board.create('point', [4, 5], { name: 'B', fixed: true });
        const lOA = board.create('line', [O, A], { straightFirst: false, straightLast: true, strokeColor: '#999' });
        const lOB = board.create('line', [O, B], { straightFirst: false, straightLast: true, strokeColor: '#999' });
        board.create('segment', [A, B], { strokeColor: '#8a6fb0', strokeWidth: 2 });
        const M = board.create('glider', [3, 0.5, lOA], { name: 'M', color: '#8a6fb0' });
        const par = board.create('parallel', [board.create('line', [A, B], { visible: false }), M], { visible: false });
        const N = board.create('intersection', [par, lOB, 0], { name: 'N', color: '#8a6fb0' });
        board.create('segment', [M, N], { strokeColor: '#c0894a', strokeWidth: 2, dash: 2 });
      }, { boundingbox: [-1, 6, 7, -1.5] }),
    },
    {
      type: 'exemple', enonce: '$(MN)\\parallel(AB)$, $OM=3$, $OA=9$, $AB=12$. Calculer $MN$.',
      solution_etapes: [
        "D'après Thalès : $\\dfrac{OM}{OA} = \\dfrac{MN}{AB}$.",
        "$\\dfrac{3}{9} = \\dfrac{MN}{12}$, soit $\\dfrac{1}{3} = \\dfrac{MN}{12}$.",
        "$MN = \\dfrac{12}{3} = 4$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Vérifier la configuration', explication: "Repère les points alignés et les droites parallèles : on doit être dans une configuration de Thalès." },
    { etape: 2, titre: 'Écrire les rapports égaux', explication: "Écris la triple égalité $\\dfrac{OM}{OA} = \\dfrac{ON}{OB} = \\dfrac{MN}{AB}$." },
    { etape: 3, titre: 'Choisir le bon rapport', explication: "Garde les deux fractions où il y a trois longueurs connues et l'inconnue." },
    { etape: 4, titre: 'Résoudre (produit en croix)', explication: "Avec $\\dfrac{a}{b}=\\dfrac{x}{d}$, on a $x = \\dfrac{a\\times d}{b}$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la longueur demandée :',
      generer() {
        const om = randInt(2, 4), k = randInt(2, 3), oa = om * k, mn = randInt(2, 6), ab = mn * k;
        return { enonce: `$(MN)\\parallel(AB)$, $OM=${om}$, $OA=${oa}$, $MN=${mn}$. Calcule $AB$.`, reponse: ab, validation: 'nombre' };
      },
      indices: ['$\\dfrac{OM}{OA} = \\dfrac{MN}{AB}$.', 'Le rapport $\\dfrac{OA}{OM}$ est un nombre entier ici.', '$AB = MN \\times \\dfrac{OA}{OM}$.'],
      correction_detaillee: () => `<p>On utilise $\\dfrac{OM}{OA} = \\dfrac{MN}{AB}$, puis le produit en croix.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la longueur demandée :',
      generer() {
        const k = randInt(2, 3), mn = randInt(2, 5), ab = mn * k, om = randInt(2, 4), oa = om * k;
        return { enonce: `$(MN)\\parallel(AB)$, $OA=${oa}$, $OM=${om}$, $AB=${ab}$. Calcule $MN$.`, reponse: mn, validation: 'nombre' };
      },
      indices: ['$\\dfrac{OM}{OA} = \\dfrac{MN}{AB}$.', '$MN = AB \\times \\dfrac{OM}{OA}$.', 'Simplifie d\'abord la fraction $\\dfrac{OM}{OA}$.'],
      correction_detaillee: () => `<p>$MN = AB \\times \\dfrac{OM}{OA}$.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule (arrondis au centième si besoin) :',
      generer() {
        const om = randInt(3, 6), oa = om + randInt(2, 5), mn = randInt(4, 9), ab = round2(mn * oa / om);
        return { enonce: `$(MN)\\parallel(AB)$, $OM=${om}$, $OA=${oa}$, $MN=${mn}$. Calcule $AB$.`, reponse: ab, validation: 'nombre', tolerance: 0.02 };
      },
      indices: ['$\\dfrac{OM}{OA} = \\dfrac{MN}{AB}$.', '$AB = \\dfrac{MN \\times OA}{OM}$.', 'Le résultat n\'est pas forcément entier : arrondis.'],
      correction_detaillee: () => `<p>$AB = \\dfrac{MN \\times OA}{OM}$ ; on arrondit le quotient.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Quelle égalité de Thalès est correcte ?',
      generer() {
        return {
          enonce: `$M\\in(OA)$, $N\\in(OB)$, $(MN)\\parallel(AB)$.`,
          choix: ['\\dfrac{OM}{OA} = \\dfrac{ON}{OB} = \\dfrac{MN}{AB}', '\\dfrac{OM}{MA} = \\dfrac{MN}{OB}', '\\dfrac{OA}{ON} = \\dfrac{OB}{OM}', '\\dfrac{OM}{AB} = \\dfrac{OA}{MN}'],
          correct: 0,
        };
      },
      indices: ['Les rapports comparent des longueurs « qui se correspondent ».', 'On part toujours du sommet commun $O$.', 'Numérateurs côté petit triangle, dénominateurs côté grand triangle.'],
      correction_detaillee: () => `<p>La triple égalité est $\\dfrac{OM}{OA} = \\dfrac{ON}{OB} = \\dfrac{MN}{AB}$.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'vrai_faux', consigne: 'Réciproque : les droites sont-elles parallèles ?',
      generer() {
        const om = randInt(2, 4), oa = randInt(6, 10), on = randInt(2, 4), ob = randInt(6, 10);
        const parallele = Math.abs(om / oa - on / ob) < 1e-9;
        return {
          enonce: `Points alignés dans le même ordre : $OM=${om}$, $OA=${oa}$, $ON=${on}$, $OB=${ob}$. Les droites $(MN)$ et $(AB)$ sont-elles parallèles ?`,
          reponse: parallele,
        };
      },
      indices: ['Compare $\\dfrac{OM}{OA}$ et $\\dfrac{ON}{OB}$.', 'Si les deux rapports sont égaux, les droites sont parallèles.', 'Utilise le produit en croix : $OM\\times OB$ vs $OA\\times ON$.'],
      correction_detaillee: (s) => `<p>D'après la réciproque : les droites sont parallèles si et seulement si $\\dfrac{OM}{OA} = \\dfrac{ON}{OB}$.</p>`,
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule la longueur (configuration « papillon ») :',
      generer() {
        const k = randInt(2, 3), am = randInt(2, 4), ab = am * k, cd = randInt(3, 6), an = cd * k;
        // (BC) // (DE) avec A sommet : AM/AB = AN/AC = MN/BC ... on garde un rapport entier
        return { enonce: `Deux droites se croisent en $A$. $(MN)\\parallel(BC)$, $AM=${am}$, $AB=${ab}$, $BC=${cd}$. Calcule $MN$.`, reponse: round2(cd * am / ab), validation: 'nombre', tolerance: 0.02 };
      },
      indices: ['$\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$.', '$MN = BC \\times \\dfrac{AM}{AB}$.', 'Simplifie le rapport avant de multiplier.'],
      correction_detaillee: () => `<p>$MN = BC \\times \\dfrac{AM}{AB}$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Pour appliquer Thalès, il faut absolument :', choix: ['des droites parallèles et des points alignés', 'un triangle rectangle', 'des angles égaux', 'un cercle'], correct: 0, explication: 'Thalès nécessite deux droites parallèles coupées par deux sécantes (points alignés).' },
    { type: 'saisie', question: '$(MN)\\parallel(AB)$, $OM=2$, $OA=6$, $AB=15$. Calcule $MN$.', reponse: 5, validation: 'nombre', explication: '$MN = AB\\times\\dfrac{OM}{OA} = 15\\times\\dfrac{2}{6} = 5$.' },
    { type: 'vrai_faux', question: 'La réciproque de Thalès sert à prouver que deux droites sont parallèles.', reponse: true, explication: 'Oui : si les rapports sont égaux (et l\'ordre respecté), les droites sont parallèles.' },
    { type: 'qcm', question: 'Dans $\\dfrac{OM}{OA} = \\dfrac{MN}{AB}$, pour trouver $AB$ on calcule :', choix: ['AB = \\dfrac{MN \\times OA}{OM}', 'AB = \\dfrac{MN \\times OM}{OA}', 'AB = MN + OA - OM', 'AB = \\dfrac{OM}{MN}'], correct: 0, explication: 'Produit en croix : $AB = \\dfrac{MN\\times OA}{OM}$.' },
    { type: 'saisie', question: '$OM=3$, $OA=12$. Combien vaut le rapport $\\dfrac{OM}{OA}$ (en décimal) ?', reponse: 0.25, validation: 'nombre', explication: '$\\dfrac{3}{12} = \\dfrac14 = 0{,}25$.' },
  ],
};
