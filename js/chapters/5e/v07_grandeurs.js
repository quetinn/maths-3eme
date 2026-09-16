// =====================================================================
//  v07_grandeurs.js — 5ᵉ : une grandeur qui dépend d'une autre —
//  tableau de valeurs, formule, représentation graphique, lecture
//  graphique, proportionnel ou non, comparer deux tarifs.
//  Figure : deux tarifs tracés dans le même repère.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { plotFunction } from '../../render.js';
import { tex, dec, tableau, arrondi } from '../commun.js';

function deuxTarifs(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>tarif A (€/entrée) <input type="range" min="4" max="9" value="7" data-a> <span class="fig-val" data-av></span></label>
      <label>abonnement B (€) <input type="range" min="10" max="40" step="5" value="20" data-b> <span class="fig-val" data-bv></span></label>
    </div>
    <div data-plot></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, b = +wrap.querySelector('[data-b]').value, pb = 3;
    wrap.querySelector('[data-av]').textContent = a; wrap.querySelector('[data-bv]').textContent = b;
    plotFunction(wrap.querySelector('[data-plot]'), [
      { fn: (n) => (a * n) / 10, color: 'var(--t-fonctions)', label: 'A' },
      { fn: (n) => (b + pb * n) / 10, color: 'var(--t-donnees)', label: 'B' },
    ], { xmin: 0, xmax: 12, ymin: 0, ymax: 9, interactive: false });
    const egal = b / Math.max(1, a - pb);
    wrap.querySelector('[data-out]').innerHTML = `<span style="color:var(--t-fonctions)">■</span> A : ${a} € par entrée (proportionnel, la droite passe par l'origine) &nbsp; <span style="color:var(--t-donnees)">■</span> B : ${b} € + 3 € par entrée<br>` +
      `Les deux tarifs coûtent pareil pour <strong>${dec(arrondi(egal, 2))}</strong> entrées ; au-delà, B est moins cher. <small>(axe vertical en dizaines d'euros)</small>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

/**
 * Graphique d'une fonction affine y = a·x + b pour un exercice de lecture.
 * Pas de lecture au clic (elle donnerait la réponse) ; `point` = x à marquer.
 */
function graphe(host, a, b, xmax, point = null) {
  const markers = point === null ? [] : [{ x: point, y: a * point + b }];
  plotFunction(host, (x) => a * x + b, { xmin: 0, xmax, ymin: 0, ymax: a * xmax + b + 2, interactive: false, markers });
}

export default {
  id: 'v07',
  titre: 'Dépendance entre deux grandeurs',
  theme: 'fonctions', niveau: '5e',
  icone: '📈',

  intro:
    "Le prix à payer dépend du nombre de places achetées, la température dépend de l'heure, la distance parcourue " +
    "dépend du temps… Quand une grandeur <strong>dépend</strong> d'une autre, on peut décrire le lien par un " +
    "<strong>tableau</strong>, une <strong>formule</strong> ou un <strong>graphique</strong>. Savoir passer de l'un à l'autre " +
    "prépare directement la notion de fonction de 3ᵉ.",

  cours: [
    {
      type: 'definition', titre: 'Grandeur qui dépend d\'une autre',
      contenu: "On dit qu'une grandeur $y$ dépend d'une grandeur $x$ si, à chaque valeur de $x$, correspond <strong>une seule</strong> valeur de $y$. Exemple : le prix $P$ payé dépend du nombre $n$ de cahiers achetés.",
    },
    {
      type: 'definition', titre: 'Trois façons de décrire la dépendance',
      contenu: "Un <strong>tableau de valeurs</strong> (quelques valeurs de $x$ et les valeurs de $y$ correspondantes) ; une <strong>formule</strong> ($P = 2{,}5 \\times n + 4$) qui permet de calculer $y$ pour n'importe quel $x$ ; un <strong>graphique</strong> : chaque couple $(x\\,;\\,y)$ est un point, $x$ en abscisse et $y$ en ordonnée.",
    },
    {
      type: 'propriete', titre: 'Lire un graphique',
      contenu: "Pour lire la valeur de $y$ associée à une valeur de $x$ : on part de $x$ sur l'axe horizontal, on monte jusqu'à la courbe, puis on lit sur l'axe vertical. Pour trouver $x$ connaissant $y$, on fait le chemin inverse.",
    },
    {
      type: 'propriete', titre: 'Proportionnel ou non ?',
      contenu: "Une situation est proportionnelle si sa formule est du type $y = k \\times x$. Son graphique est alors une <strong>droite qui passe par l'origine</strong>. Une formule du type $y = 3x + 20$ (avec un abonnement fixe) donne une droite qui ne passe pas par l'origine : ce n'est pas proportionnel.",
    },
    { type: 'figure', titre: 'Comparer deux tarifs', contenu: "Tarif A : on paie chaque entrée. Tarif B : un abonnement puis 3 € par entrée. Modifie les tarifs et observe où les droites se croisent.", render: (host) => deuxTarifs(host) },
    {
      type: 'exemple', enonce: 'Une salle de sport propose : $P = 15 + 4 \\times n$ (en €), où $n$ est le nombre de séances. Combien paie-t-on pour $8$ séances ? Pour combien de séances paie-t-on $55$ € ?',
      solution_etapes: ["Pour $n = 8$ : $P = 15 + 4 \\times 8 = 15 + 32 = 47$ €.", "Pour $P = 55$ : $4 \\times n = 55 - 15 = 40$, donc $n = 40 \\div 4 = 10$ séances.", "Ce n'est pas proportionnel : pour $0$ séance, on paie déjà $15$ €."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Identifier les deux grandeurs', explication: "Qui dépend de qui ? La grandeur qu'on choisit ($x$) va sur l'axe horizontal." },
    { etape: 2, titre: 'Utiliser la formule', explication: "Remplace $x$ par sa valeur et calcule avec les priorités." },
    { etape: 3, titre: 'Lire le graphique', explication: "Trace des pointillés : verticalement depuis $x$ jusqu'à la courbe, puis horizontalement jusqu'à l'axe des $y$." },
    { etape: 4, titre: 'Tester la proportionnalité', explication: "Droite passant par l'origine ⇔ proportionnel ; sinon, ce n'est pas proportionnel." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Lis le tableau :',
      generer() {
        const h = [0, 1, 2, 3, 4, 5], base = randInt(8, 14), T = h.map(() => base + randInt(-3, 6));
        const i = randInt(1, 5);
        return { enonce: `Température relevée à différentes heures :${tableau([['heure', ...h.map((x) => `${x + 8} h`)], ['température (°C)', ...T]])}Quelle température faisait-il à $${h[i] + 8}$ h ?`, reponse: T[i], validation: 'nombre', _v: { heure: h[i] + 8, t: T[i] } };
      },
      indices: ['Repère la colonne de l\'heure demandée.', 'Descends jusqu\'à la ligne des températures.', 'Lis la valeur dans cette case.'],
      correction_etapes: (st) => [`Dans la colonne « ${st._v.heure} h », la ligne des températures indique $${st._v.t}$.`, `Il faisait $${st._v.t}$ °C.`],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Utilise la formule :',
      generer() {
        const [ctx, a, b, u] = pick([
          ['Le prix $P$ (en €) d\'une location de vélo pour $n$ heures est $P = 3 \\times n + 5$.', 3, 5, '€'],
          ['Le prix $P$ (en €) pour $n$ entrées à la piscine avec la carte est $P = 2{,}5 \\times n + 10$.', 2.5, 10, '€'],
          ['La hauteur $h$ (en cm) d\'une plante après $n$ semaines est $h = 4 \\times n + 12$.', 4, 12, 'cm'],
          ['La masse $m$ (en g) d\'un bocal contenant $n$ billes est $m = 6 \\times n + 250$.', 6, 250, 'g'],
        ]);
        const n = randInt(2, 15);
        return { enonce: `${ctx} Calcule la valeur pour $n = ${n}$.`, reponse: arrondi(a * n + b, 2), validation: 'nombre', _v: { a, b, n, u } };
      },
      indices: ['Remplace $n$ par sa valeur.', 'La multiplication est prioritaire.', 'Ajoute ensuite le nombre fixe.'],
      correction_etapes: (st) => [`$${tex(st._v.a)} \\times ${st._v.n} + ${st._v.b} = ${tex(st._v.a * st._v.n)} + ${st._v.b}$.`, `$= ${tex(st._v.a * st._v.n + st._v.b)}$ ${st._v.u}.`],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Lis le graphique :',
      generer() {
        const a = randInt(1, 3), b = randInt(0, 4), x = randInt(1, 6);
        return {
          enonce: `Le graphique représente une grandeur $y$ en fonction de $x$. Quelle est la valeur de $y$ pour $x = ${x}$ ?`,
          reponse: a * x + b, validation: 'nombre', _v: { a, b, x },
          visuel: (h) => graphe(h, a, b, 7, x),
        };
      },
      indices: [`Pars de $x$ sur l'axe horizontal.`, 'Monte verticalement jusqu\'à la droite.', 'Lis la valeur sur l\'axe vertical (tu peux toucher le graphique).'],
      correction_etapes: (st) => [`On part de $x = ${st._v.x}$, on monte jusqu'à la droite, puis on lit sur l'axe vertical.`, `On lit $y = ${st._v.a * st._v.x + st._v.b}$ (le point $(${st._v.x}\\,;\\,${st._v.a * st._v.x + st._v.b})$ est sur la droite).`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Lecture inverse — trouve $x$ :',
      generer() {
        const a = randInt(1, 3), b = randInt(0, 4), x = randInt(1, 6);
        return {
          enonce: `Pour quelle valeur de $x$ la grandeur $y$ vaut-elle $${a * x + b}$ ?`,
          reponse: x, validation: 'nombre', _v: { a, b, x },
          visuel: (h) => graphe(h, a, b, 7),
        };
      },
      indices: [`Pars cette fois de la valeur de $y$ sur l'axe vertical.`, 'Va horizontalement jusqu\'à la droite.', 'Descends jusqu\'à l\'axe horizontal et lis $x$.'],
      correction_etapes: (st) => [`On part de $y = ${st._v.a * st._v.x + st._v.b}$ sur l'axe vertical, on va jusqu'à la droite, puis on descend.`, `On lit $x = ${st._v.x}$.`],
    },
    {
      id: 'e05', niveau: 2, type: 'vrai_faux', consigne: 'La situation est-elle proportionnelle ?',
      generer() {
        const [enonce, rep, why] = pick([
          [`Le prix $P$ de $n$ baguettes à $1{,}20$ € : $P = 1{,}2 \\times n$.`, true, 'La formule est du type $P = k \\times n$ : c\'est proportionnel.'],
          [`Un taxi : $P = 4 + 1{,}5 \\times d$ ($d$ en km).`, false, 'Il y a une prise en charge fixe de $4$ € : pour $0$ km on paie déjà $4$ €.'],
          [`Le périmètre $P$ d'un carré de côté $c$ : $P = 4 \\times c$.`, true, '$P = 4 \\times c$ : c\'est proportionnel (coefficient $4$).'],
          [`L'aire $\\mathcal{A}$ d'un carré de côté $c$ : $\\mathcal{A} = c \\times c$.`, false, 'Si $c$ double, l\'aire est multipliée par $4$ : ce n\'est pas proportionnel.'],
          [`Un abonnement de $20$ € plus $3$ € par place : $P = 20 + 3n$.`, false, 'L\'abonnement fixe empêche la proportionnalité (droite qui ne passe pas par l\'origine).'],
          [`La distance $d$ parcourue en $t$ heures à $50$ km/h : $d = 50 \\times t$.`, true, '$d = 50 \\times t$ : c\'est proportionnel.'],
        ]);
        return { enonce, reponse: rep, _v: { why } };
      },
      indices: ['Une situation proportionnelle a une formule $y = k \\times x$.', 'Y a-t-il un nombre fixe ajouté ?', 'Pour $x = 0$, a-t-on $y = 0$ ?'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e06', niveau: 2, type: 'complete', consigne: 'Complète le tableau avec la formule :',
      generer() {
        const a = randInt(2, 6), b = randInt(1, 12), x1 = randInt(1, 4), x2 = randInt(5, 10);
        return {
          enonce_complete: `Formule : $y = ${a}x + ${b}$. $\\quad$ Pour $x = ${x1}$ : $y =$ {0} $\\quad$ Pour $x = ${x2}$ : $y =$ {1}`,
          champs: [{ reponse: a * x1 + b, validation: 'nombre' }, { reponse: a * x2 + b, validation: 'nombre' }], _v: { a, b, x1, x2 },
        };
      },
      indices: ['$ax$ signifie $a \\times x$.', 'Remplace $x$ par chaque valeur.', 'Multiplication d\'abord, puis addition.'],
      correction_etapes: (st) => [`$${st._v.a} \\times ${st._v.x1} + ${st._v.b} = ${st._v.a * st._v.x1 + st._v.b}$.`, `$${st._v.a} \\times ${st._v.x2} + ${st._v.b} = ${st._v.a * st._v.x2 + st._v.b}$.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Problème — pour combien d\'entrées les deux tarifs sont-ils égaux ?',
      generer() {
        let pa, pb, ab, n;
        do { pa = randInt(5, 10); pb = randInt(2, pa - 1); n = randInt(4, 15); ab = (pa - pb) * n; } while (ab > 80);
        return { enonce: `Tarif A : $${pa}$ € par entrée. Tarif B : abonnement de $${ab}$ € puis $${pb}$ € par entrée. Pour combien d'entrées les deux tarifs coûtent-ils la même somme ?`, reponse: n, validation: 'nombre', _v: { pa, pb, ab, n } };
      },
      indices: ['Écris le prix de chaque tarif pour $n$ entrées.', `À chaque entrée, le tarif B « rattrape » la différence de prix par entrée.`, `Divise l'abonnement par cette différence.`],
      correction_etapes(st) {
        const { pa, pb, ab, n } = st._v;
        return [`Tarif A : $${pa} \\times n$ ; tarif B : $${ab} + ${pb} \\times n$.`, `À chaque entrée, B coûte $${pa} - ${pb} = ${pa - pb}$ € de moins que A : il faut rattraper les $${ab}$ € d'abonnement.`, `$${ab} \\div ${pa - pb} = ${n}$ entrées. Vérification : $${pa} \\times ${n} = ${pa * n}$ et $${ab} + ${pb} \\times ${n} = ${ab + pb * n}$.`];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'qcm', consigne: 'Quelle formule correspond au tableau ?',
      generer() {
        let a, b; do { a = randInt(2, 6); b = randInt(1, 9); } while (a === b);
        const xs = [0, 1, 2, 3], ys = xs.map((x) => a * x + b);
        return {
          enonce: tableau([['x', ...xs], ['y', ...ys]]),
          choix: [`y = ${a}x + ${b}`, `y = ${b}x + ${a}`, `y = ${a + b}x`, `y = ${a}x`], correct: 0, _v: { a, b },
        };
      },
      indices: ['Regarde la valeur de $y$ pour $x = 0$ : c\'est le nombre ajouté.', 'De combien augmente $y$ quand $x$ augmente de 1 ?', 'Vérifie ta formule sur toutes les colonnes.'],
      correction_etapes: (st) => [`Pour $x = 0$, $y = ${st._v.b}$ : le nombre ajouté est $${st._v.b}$.`, `Quand $x$ augmente de $1$, $y$ augmente de $${st._v.a}$.`, `Formule : $y = ${st._v.a}x + ${st._v.b}$ (vérification : pour $x = 3$, $${st._v.a} \\times 3 + ${st._v.b} = ${3 * st._v.a + st._v.b}$).`],
    },
    {
      id: 'e09', niveau: 1, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre la construction du graphique :',
      generer() {
        const a = randInt(2, 5), b = randInt(1, 9);
        return { etapes: [`Calculer un tableau de valeurs avec $y = ${a}x + ${b}$`, 'Tracer deux axes gradués : $x$ horizontal, $y$ vertical', `Placer les points, par exemple $(0\\,;\\,${b})$ et $(2\\,;\\,${2 * a + b})$`, 'Relier les points'] };
      },
      indices: ['On a besoin de valeurs avant de placer des points.', 'Il faut un repère pour placer les points.', 'On relie en dernier.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Le graphique d\'une situation de proportionnalité est :', choix: ['une droite passant par l\'origine', 'une droite qui ne passe pas par l\'origine', 'une courbe', 'un point'], correct: 0, explication: 'Proportionnalité ⇔ droite passant par l\'origine.' },
    {
      type: 'saisie', question: 'Formule.',
      generer() { const n = randInt(2, 12); return { question: `$P = 5 \\times n + 8$. Calcule $P$ pour $n = ${n}$.`, reponse: 5 * n + 8, validation: 'nombre', explication: `$5 \\times ${n} + 8 = ${5 * n + 8}$.` }; },
    },
    { type: 'vrai_faux', question: 'Avec un abonnement de 10 € puis 2 € par séance, le prix est proportionnel au nombre de séances.', reponse: false, explication: 'Pour 0 séance on paie déjà 10 € : ce n\'est pas proportionnel.' },
    {
      type: 'saisie', question: 'Lecture graphique.',
      generer() { const a = randInt(1, 3), b = randInt(1, 5), x = randInt(1, 5); return { question: `Sur le graphique, quelle est la valeur de $y$ pour $x = ${x}$ ?`, reponse: a * x + b, validation: 'nombre', explication: `On lit $y = ${a * x + b}$.`, visuel: (h) => graphe(h, a, b, 6, x) }; },
    },
    { type: 'qcm', question: 'Sur un graphique, la grandeur $x$ dont dépend l\'autre se lit :', choix: ['sur l\'axe horizontal', 'sur l\'axe vertical', 'sur la courbe', 'à l\'origine'], correct: 0, explication: '$x$ en abscisse (horizontal), $y$ en ordonnée (vertical).' },
  ],
};
