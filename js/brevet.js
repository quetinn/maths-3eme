// =====================================================================
//  brevet.js — Banque de PROBLÈMES type Brevet
//  Contrairement au quiz_bilan (questions courtes isolées), un problème
//  pose une SITUATION concrète puis enchaîne plusieurs sous-questions qui
//  se construisent les unes sur les autres — comme un vrai sujet de DNB.
//
//  Chaque problème est GÉNÉRATIF : `generer()` renvoie une instance fraîche
//  (valeurs tirées au hasard mais cohérentes) → rejouable à l'infini.
//
//  Schéma d'une instance :
//    {
//      titre, domaine, chapitres:[ids], dureeMin,
//      contexte: '<p>…$math$…</p>',         // mise en situation (HTML)
//      figure(host) | null,                  // figure SVG facultative
//      questions: [
//        { enonce:'<p>…</p>', points, validation, reponse, accepte?,
//          unite?, placeholder?, indice?, corrige:'<p>…</p>' }, …
//      ]
//    }
//
//  La validation des réponses réutilise `checkAnswer` du moteur, donc tous
//  les modes existants ('nombre', 'expression', 'solutions', 'texte'…) sont
//  disponibles. Le rendu/correction est assuré par app.js (renderBrevet).
// =====================================================================

import { randInt, randIntNonZero, pick, gcd } from './engine.js';

const SVGNS = 'http://www.w3.org/2000/svg';
function el(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function fig(host, vb, build) {
  host.innerHTML = '';
  const s = el('svg', { viewBox: vb, class: 'svg-plot fig-brevet', role: 'img' });
  build(s);
  host.appendChild(s);
}
const round2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------------
//  1. Deux abonnements — fonctions affines (comparer, résoudre)
// ---------------------------------------------------------------------
const P_ABONNEMENT = {
  id: 'br_abonnement', titre: 'Quel abonnement choisir ?', domaine: 'Fonctions',
  chapitres: ['c08', 'c07'], dureeMin: 12,
  generer() {
    const fixe = pick([10, 12, 15, 18, 20]);       // forfait mensuel offre B
    const pa = pick([3, 4, 5]);                     // prix séance offre A (sans abo)
    const pb = pick([1, 1.5, 2]);                   // prix séance offre B (avec abo)
    // point d'égalité : pa*x = fixe + pb*x  → x = fixe/(pa-pb)
    const xEq = fixe / (pa - pb);
    const n = pick([6, 8, 10, 12]);                 // nb de séances pour la Q1
    return {
      contexte: `<p>Un club d'escalade propose deux formules pour l'année :</p>
        <ul>
          <li><strong>Formule A</strong> — sans abonnement : <strong>${pa} €</strong> la séance.</li>
          <li><strong>Formule B</strong> — abonnement de <strong>${fixe} €</strong>, puis <strong>${pb} €</strong> la séance.</li>
        </ul>
        <p>On note $x$ le nombre de séances dans l'année.</p>`,
      questions: [
        {
          enonce: `<p><strong>1.</strong> Quel est le prix payé avec la <strong>formule A</strong> pour $${n}$ séances ? (en €)</p>`,
          points: 1, validation: 'nombre', reponse: pa * n, unite: '€',
          indice: `Avec la formule A, on paie ${pa} € à chaque séance.`,
          corrige: `<p>Formule A : $${pa} \\times ${n} = ${pa * n}$ €.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> Exprime en fonction de $x$ le prix $P_B(x)$ payé avec la <strong>formule B</strong>.</p>`,
          points: 2, validation: 'expression', reponse: `${fixe} + ${pb}*x`, accepte: [`${pb}*x + ${fixe}`],
          placeholder: 'ex : 20 + 1.5x',
          indice: `On paie une fois l'abonnement, puis ${pb} € par séance.`,
          corrige: `<p>$P_B(x) = ${fixe} + ${pb}\\,x$ : l'abonnement fixe plus ${pb} € par séance.</p>`,
        },
        {
          enonce: `<p><strong>3.</strong> À partir de combien de séances la formule B devient-elle plus avantageuse ? (donne le nombre entier de séances)</p>`,
          points: 2, validation: 'nombre', reponse: Math.ceil(xEq + 1e-9),
          accepte: Number.isInteger(xEq) ? [xEq + 1, xEq] : [],
          indice: `Cherche $x$ tel que $${pa}x = ${fixe} + ${pb}x$, puis arrondis au bon nombre entier de séances.`,
          corrige: `<p>On résout $${pa}x = ${fixe} + ${pb}x$ : $${pa - pb}x = ${fixe}$, donc $x = \\dfrac{${fixe}}{${pa - pb}} = ${round2(xEq)}$.</p>
            <p>Comme le nombre de séances est entier, la formule B devient plus avantageuse à partir de <strong>${Math.ceil(xEq + 1e-9)} séances</strong>.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  2. La hauteur d'un arbre — théorème de Thalès
// ---------------------------------------------------------------------
const P_THALES = {
  id: 'br_thales', titre: "La hauteur de l'arbre", domaine: 'Géométrie',
  chapitres: ['c10'], dureeMin: 12,
  generer() {
    const baton = pick([1, 1.2, 1.5, 2]);          // hauteur du piquet (m)
    const ombreBaton = pick([0.8, 1, 1.5, 2]);     // ombre du piquet (m)
    const k = pick([4, 5, 6, 8]);                  // facteur
    const ombreArbre = round2(ombreBaton * k);     // ombre de l'arbre (m)
    const hArbre = round2(baton * k);              // hauteur cherchée (m)
    return {
      contexte: `<p>Pour mesurer la hauteur d'un arbre, Marion plante verticalement un piquet
        de <strong>${baton} m</strong>. Au même moment, le piquet projette une ombre de
        <strong>${ombreBaton} m</strong> et l'arbre une ombre de <strong>${ombreArbre} m</strong>.</p>
        <p>Les rayons du soleil sont parallèles : les deux triangles (piquet + ombre) et
        (arbre + ombre) sont en situation de Thalès.</p>`,
      figure(host) {
        fig(host, '0 0 320 180', (s) => {
          const gy = 150;
          el('line', { x1: 10, y1: gy, x2: 310, y2: gy, class: 'plot-axes' }, s);
          // piquet
          el('line', { x1: 60, y1: gy, x2: 60, y2: gy - 35, class: 'bp-median' }, s);
          el('line', { x1: 60, y1: gy, x2: 95, y2: gy, class: 'plot-curve' }, s);
          const tp = el('text', { x: 40, y: gy - 18, class: 'plot-tick' }, s); tp.textContent = `${baton}m`;
          // arbre
          el('line', { x1: 180, y1: gy, x2: 180, y2: gy - 95, class: 'bp-median' }, s);
          el('line', { x1: 180, y1: gy, x2: 290, y2: gy, class: 'plot-curve' }, s);
          const ta = el('text', { x: 150, y: gy - 50, class: 'plot-tick' }, s); ta.textContent = '?';
          el('line', { x1: 60, y1: gy - 35, x2: 95, y2: gy, class: 'plot-help' }, s);
          el('line', { x1: 180, y1: gy - 95, x2: 290, y2: gy, class: 'plot-help' }, s);
        });
      },
      questions: [
        {
          enonce: `<p><strong>1.</strong> Quel est le coefficient d'agrandissement entre l'ombre du piquet et celle de l'arbre ?</p>`,
          points: 1, validation: 'nombre', reponse: k,
          indice: `Divise l'ombre de l'arbre par l'ombre du piquet.`,
          corrige: `<p>$\\dfrac{${ombreArbre}}{${ombreBaton}} = ${k}$ : l'ombre de l'arbre est ${k} fois plus longue.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> En déduire la hauteur de l'arbre, en mètres.</p>`,
          points: 2, validation: 'nombre', reponse: hArbre, unite: 'm',
          indice: `La hauteur suit le même coefficient que les ombres (Thalès).`,
          corrige: `<p>Par proportionnalité (Thalès) : $\\dfrac{h}{${baton}} = \\dfrac{${ombreArbre}}{${ombreBaton}}$,
            donc $h = ${baton} \\times ${k} = ${hArbre}$ m.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  3. L'échelle contre le mur — Pythagore (+ réciproque)
// ---------------------------------------------------------------------
const P_PYTHAGORE = {
  id: 'br_pythagore', titre: "L'échelle contre le mur", domaine: 'Géométrie',
  chapitres: ['r01', 'c11'], dureeMin: 10,
  generer() {
    // triplet pythagoricien mis à l'échelle
    const base = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
    const f = pick([0.5, 1]);
    const pied = round2(base[0] * f);     // distance au mur
    const haut = round2(base[1] * f);     // hauteur atteinte
    const ech = round2(base[2] * f);      // longueur échelle (hypoténuse)
    return {
      contexte: `<p>Une échelle de <strong>${ech} m</strong> est appuyée contre un mur vertical.
        Le pied de l'échelle est posé à <strong>${pied} m</strong> du mur.</p>
        <p>Le sol et le mur forment un angle droit.</p>`,
      figure(host) {
        fig(host, '0 0 220 180', (s) => {
          const ox = 40, oy = 150;
          el('line', { x1: ox, y1: oy, x2: 200, y2: oy, class: 'plot-axes' }, s);      // sol
          el('line', { x1: ox, y1: oy, x2: ox, y2: 20, class: 'plot-axes' }, s);        // mur
          el('rect', { x: ox, y: oy - 14, width: 14, height: 14, class: 'bp-box' }, s); // angle droit
          el('line', { x1: ox + 110, y1: oy, x2: ox, y2: 45, class: 'plot-curve' }, s); // échelle
          const t1 = el('text', { x: ox + 60, y: oy - 50, class: 'plot-tick' }, s); t1.textContent = `${ech} m`;
          const t2 = el('text', { x: ox + 45, y: oy + 16, class: 'plot-tick' }, s); t2.textContent = `${pied} m`;
        });
      },
      questions: [
        {
          enonce: `<p><strong>1.</strong> À quelle hauteur, en mètres, l'échelle touche-t-elle le mur ?</p>`,
          points: 3, validation: 'nombre', reponse: haut, unite: 'm', tolerance: 0.05,
          indice: `Le triangle est rectangle : $\\text{hauteur}^2 = \\text{échelle}^2 - \\text{pied}^2$.`,
          corrige: `<p>Le triangle est rectangle. D'après Pythagore :
            $h^2 = ${ech}^2 - ${pied}^2 = ${round2(ech * ech)} - ${round2(pied * pied)} = ${round2(ech * ech - pied * pied)}$.</p>
            <p>Donc $h = \\sqrt{${round2(ech * ech - pied * pied)}} = ${haut}$ m.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> Pour être stable, le pied doit être à au moins le quart de la longueur de l'échelle.
            Ici, $${pied} \\geq \\dfrac{${ech}}{4}$ ? Réponds par <em>oui</em> ou <em>non</em>.</p>`,
          points: 1, validation: 'texte', reponse: pied >= ech / 4 ? 'oui' : 'non', accepte: pied >= ech / 4 ? ['Oui'] : ['Non'],
          indice: `Calcule $\\dfrac{${ech}}{4}$ et compare à ${pied}.`,
          corrige: `<p>$\\dfrac{${ech}}{4} = ${round2(ech / 4)}$. Comme $${pied} ${pied >= ech / 4 ? '\\geq' : '<'} ${round2(ech / 4)}$,
            l'échelle est <strong>${pied >= ech / 4 ? 'bien' : 'mal'} placée</strong> : réponse <strong>${pied >= ech / 4 ? 'oui' : 'non'}</strong>.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  4. La rampe d'accès — trigonométrie
// ---------------------------------------------------------------------
const P_RAMPE = {
  id: 'br_rampe', titre: "La rampe d'accès", domaine: 'Géométrie',
  chapitres: ['c11'], dureeMin: 12,
  generer() {
    const longueur = pick([3, 4, 5, 6]);           // longueur de la rampe (m)
    const hauteur = pick([0.3, 0.4, 0.5, 0.6]);    // hauteur à franchir (m)
    const sinA = hauteur / longueur;
    const angle = round2(Math.asin(sinA) * 180 / Math.PI);
    return {
      contexte: `<p>Pour rendre un magasin accessible, on installe une rampe.
        La rampe mesure <strong>${longueur} m</strong> de long et permet de franchir une marche
        de <strong>${hauteur} m</strong> de haut.</p>
        <p>On appelle $\\alpha$ l'angle que fait la rampe avec le sol horizontal.</p>`,
      figure(host) {
        fig(host, '0 0 260 150', (s) => {
          const ox = 30, oy = 120;
          el('line', { x1: ox, y1: oy, x2: 240, y2: oy, class: 'plot-axes' }, s);
          el('line', { x1: 230, y1: oy, x2: 230, y2: oy - 60, class: 'bp-median' }, s);
          el('line', { x1: ox, y1: oy, x2: 230, y2: oy - 60, class: 'plot-curve' }, s);
          const t1 = el('text', { x: 110, y: oy - 20, class: 'plot-tick' }, s); t1.textContent = `${longueur} m`;
          const t2 = el('text', { x: 235, y: oy - 30, class: 'plot-tick' }, s); t2.textContent = `${hauteur} m`;
          const ta = el('text', { x: ox + 18, y: oy - 6, class: 'bp-role' }, s); ta.textContent = 'α';
        });
      },
      questions: [
        {
          enonce: `<p><strong>1.</strong> Quel rapport trigonométrique relie $\\alpha$, la hauteur et la longueur de la rampe :
            le sinus, le cosinus ou la tangente de $\\alpha$ ?</p>`,
          points: 1, validation: 'texte', reponse: 'sinus', accepte: ['sin', 'le sinus'],
          indice: `La hauteur est le côté opposé à $\\alpha$, la rampe est l'hypoténuse.`,
          corrige: `<p>La hauteur est le côté <em>opposé</em> à $\\alpha$ et la rampe l'<em>hypoténuse</em> :
            c'est donc le <strong>sinus</strong>. $\\sin(\\alpha) = \\dfrac{${hauteur}}{${longueur}}$.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> Calcule la mesure de l'angle $\\alpha$, arrondie au degré.</p>`,
          points: 2, validation: 'nombre', reponse: Math.round(angle), unite: '°', tolerance: 1.2,
          indice: `Utilise $\\alpha = \\sin^{-1}\\!\\left(\\dfrac{${hauteur}}{${longueur}}\\right)$ (touche $\\sin^{-1}$ de la calculatrice).`,
          corrige: `<p>$\\sin(\\alpha) = \\dfrac{${hauteur}}{${longueur}} = ${round2(sinA)}$, donc
            $\\alpha = \\sin^{-1}(${round2(sinA)}) \\approx ${Math.round(angle)}°$.</p>`,
        },
        {
          enonce: `<p><strong>3.</strong> La norme impose un angle d'au plus $5°$. La rampe est-elle conforme ? (oui / non)</p>`,
          points: 1, validation: 'texte', reponse: angle <= 5 ? 'oui' : 'non', accepte: angle <= 5 ? ['Oui'] : ['Non'],
          indice: `Compare l'angle trouvé à $5°$.`,
          corrige: `<p>L'angle vaut environ $${Math.round(angle)}°$, ${angle <= 5 ? 'inférieur ou égal' : 'supérieur'} à $5°$ :
            la rampe <strong>${angle <= 5 ? 'est conforme' : "n'est pas conforme"}</strong>.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  5. Les notes de la classe — statistiques
// ---------------------------------------------------------------------
const P_STATS = {
  id: 'br_stats', titre: 'Les notes du contrôle', domaine: 'Données',
  chapitres: ['c15'], dureeMin: 12,
  generer() {
    // 9 notes (effectif impair → médiane = valeur centrale)
    const notes = Array.from({ length: 9 }, () => randInt(6, 18)).sort((a, b) => a - b);
    const somme = notes.reduce((a, b) => a + b, 0);
    const moyenne = round2(somme / notes.length);
    const mediane = notes[4];
    const etendue = notes[8] - notes[0];
    return {
      contexte: `<p>Voici les notes (sur 20) obtenues par les ${notes.length} élèves d'un groupe au dernier contrôle :</p>
        <p class="brevet-data">${notes.join(' ; ')}</p>`,
      questions: [
        {
          enonce: `<p><strong>1.</strong> Calcule la note moyenne de ce groupe (arrondie au dixième).</p>`,
          points: 2, validation: 'nombre', reponse: moyenne, tolerance: 0.06,
          indice: `Additionne les ${notes.length} notes puis divise par ${notes.length}.`,
          corrige: `<p>Moyenne $= \\dfrac{${notes.join(' + ')}}{${notes.length}} = \\dfrac{${somme}}{${notes.length}} \\approx ${moyenne}$.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> Donne la médiane de cette série.</p>`,
          points: 2, validation: 'nombre', reponse: mediane,
          indice: `Les notes sont déjà rangées : la médiane est la valeur du milieu (la ${(notes.length + 1) / 2}ᵉ).`,
          corrige: `<p>Il y a ${notes.length} notes rangées : la médiane est la ${(notes.length + 1) / 2}ᵉ valeur, soit <strong>${mediane}</strong>.
            La moitié de la classe a une note $\\leq ${mediane}$.</p>`,
        },
        {
          enonce: `<p><strong>3.</strong> Calcule l'étendue de la série.</p>`,
          points: 1, validation: 'nombre', reponse: etendue,
          indice: `Étendue = note la plus haute − note la plus basse.`,
          corrige: `<p>Étendue $= ${notes[8]} - ${notes[0]} = ${etendue}$.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  6. Le sac de billes — probabilités (+ fractions)
// ---------------------------------------------------------------------
const P_PROBA = {
  id: 'br_proba', titre: 'Le sac de billes', domaine: 'Données',
  chapitres: ['c16', 'r03'], dureeMin: 10,
  generer() {
    const rouges = randInt(2, 6), vertes = randInt(2, 6), bleues = randInt(2, 6);
    const total = rouges + vertes + bleues;
    const g = gcd(rouges, total);
    return {
      contexte: `<p>Un sac opaque contient <strong>${rouges} billes rouges</strong>,
        <strong>${vertes} billes vertes</strong> et <strong>${bleues} billes bleues</strong>,
        indiscernables au toucher. On tire une bille au hasard.</p>`,
      questions: [
        {
          enonce: `<p><strong>1.</strong> Combien y a-t-il de billes en tout ?</p>`,
          points: 1, validation: 'nombre', reponse: total,
          indice: `Additionne les billes des trois couleurs.`,
          corrige: `<p>$${rouges} + ${vertes} + ${bleues} = ${total}$ billes.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> Quelle est la probabilité de tirer une bille rouge ? (réponds sous forme de fraction)</p>`,
          points: 2, validation: 'expression', reponse: `${rouges}/${total}`, accepte: [`${rouges / g}/${total / g}`, String(round2(rouges / total))],
          placeholder: `ex : ${rouges}/${total}`,
          indice: `Probabilité $= \\dfrac{\\text{cas favorables}}{\\text{cas possibles}}$.`,
          corrige: `<p>$P(\\text{rouge}) = \\dfrac{${rouges}}{${total}}${g > 1 ? ` = \\dfrac{${rouges / g}}{${total / g}}` : ''}$.</p>`,
        },
        {
          enonce: `<p><strong>3.</strong> Quelle est la probabilité de <em>ne pas</em> tirer une bille bleue ? (forme décimale, arrondie au centième)</p>`,
          points: 2, validation: 'nombre', reponse: round2((rouges + vertes) / total), tolerance: 0.02,
          indice: `« Pas bleue » = rouge ou verte. Ou bien $1 - P(\\text{bleue})$.`,
          corrige: `<p>$P(\\text{pas bleue}) = \\dfrac{${rouges + vertes}}{${total}} \\approx ${round2((rouges + vertes) / total)}$
            (on peut aussi faire $1 - \\dfrac{${bleues}}{${total}}$).</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  7. Les soldes — pourcentages & proportionnalité
// ---------------------------------------------------------------------
const P_SOLDES = {
  id: 'br_soldes', titre: 'Les soldes', domaine: 'Nombres et calculs',
  chapitres: ['r04', 'c08'], dureeMin: 10,
  generer() {
    const prix = pick([40, 50, 60, 80, 120]);
    const remise = pick([10, 20, 25, 30, 40]);
    const montantRemise = round2(prix * remise / 100);
    const prixSolde = round2(prix - montantRemise);
    const coef = round2(1 - remise / 100);
    return {
      contexte: `<p>Un article coûte <strong>${prix} €</strong>. Pendant les soldes, il bénéficie
        d'une remise de <strong>${remise} %</strong>.</p>`,
      questions: [
        {
          enonce: `<p><strong>1.</strong> Quel est le montant de la remise, en euros ?</p>`,
          points: 1, validation: 'nombre', reponse: montantRemise, unite: '€',
          indice: `Prendre ${remise} % de ${prix}, c'est multiplier par $\\dfrac{${remise}}{100}$.`,
          corrige: `<p>$${prix} \\times \\dfrac{${remise}}{100} = ${montantRemise}$ €.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> Quel est le prix soldé de l'article ?</p>`,
          points: 1, validation: 'nombre', reponse: prixSolde, unite: '€',
          indice: `Prix de départ moins la remise.`,
          corrige: `<p>$${prix} - ${montantRemise} = ${prixSolde}$ €.</p>`,
        },
        {
          enonce: `<p><strong>3.</strong> Par quel nombre (coefficient multiplicateur) peut-on multiplier directement
            ${prix} pour obtenir le prix soldé ?</p>`,
          points: 2, validation: 'nombre', reponse: coef, tolerance: 0.001,
          indice: `Baisser de ${remise} %, c'est multiplier par $1 - \\dfrac{${remise}}{100}$.`,
          corrige: `<p>Coefficient $= 1 - \\dfrac{${remise}}{100} = ${coef}$.
            Vérification : $${prix} \\times ${coef} = ${prixSolde}$ €.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  8. Le programme de calcul — calcul littéral & équations
// ---------------------------------------------------------------------
const P_PROGRAMME = {
  id: 'br_programme', titre: 'Le programme de calcul', domaine: 'Nombres et calculs',
  chapitres: ['c01', 'c03'], dureeMin: 12,
  generer() {
    const a = randInt(2, 5);         // multiplier par a
    const b = randInt(2, 9);         // ajouter b
    const start = randInt(2, 8);     // nombre choisi pour la Q1
    const result1 = a * (start + b); // si programme = (+b puis ×a)… on fige un ordre
    const cible = a * (randInt(3, 9) + b); // une cible atteignable
    const x = cible / a - b;
    return {
      contexte: `<p>Voici un programme de calcul :</p>
        <ol class="brevet-prog">
          <li>Choisir un nombre.</li>
          <li>Lui ajouter $${b}$.</li>
          <li>Multiplier le résultat par $${a}$.</li>
        </ol>`,
      questions: [
        {
          enonce: `<p><strong>1.</strong> Quel résultat obtient-on en partant du nombre $${start}$ ?</p>`,
          points: 2, validation: 'nombre', reponse: result1,
          indice: `Suis les étapes dans l'ordre : d'abord $+${b}$, ensuite $\\times ${a}$.`,
          corrige: `<p>$${start} + ${b} = ${start + b}$, puis $${start + b} \\times ${a} = ${result1}$.</p>`,
        },
        {
          enonce: `<p><strong>2.</strong> On note $x$ le nombre choisi. Exprime le résultat du programme en fonction de $x$ (forme développée).</p>`,
          points: 2, validation: 'expression', reponse: `${a}*x + ${a * b}`, accepte: [`${a}*(x+${b})`],
          placeholder: `ex : ${a}x + ${a * b}`,
          indice: `On calcule $${a}(x + ${b})$, puis on développe.`,
          corrige: `<p>$${a}\\,(x + ${b}) = ${a}x + ${a * b}$.</p>`,
        },
        {
          enonce: `<p><strong>3.</strong> Quel nombre faut-il choisir au départ pour obtenir $${cible}$ ?</p>`,
          points: 2, validation: 'nombre', reponse: x,
          indice: `Résous l'équation $${a}x + ${a * b} = ${cible}$.`,
          corrige: `<p>On résout $${a}x + ${a * b} = ${cible}$ : $${a}x = ${cible - a * b}$, donc
            $x = \\dfrac{${cible - a * b}}{${a}} = ${x}$.</p>`,
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------
//  Registre
// ---------------------------------------------------------------------
export const PROBLEMES = [
  P_PROGRAMME, P_SOLDES, P_ABONNEMENT, P_STATS, P_PROBA, P_THALES, P_PYTHAGORE, P_RAMPE,
];

/** Construit une instance d'un problème (ajoute le barème total). */
export function genererProbleme(pb) {
  const inst = pb.generer();
  inst.id = pb.id; inst.titre = pb.titre; inst.domaine = pb.domaine;
  inst.chapitres = pb.chapitres; inst.dureeMin = pb.dureeMin;
  inst.baremeTotal = inst.questions.reduce((s, q) => s + (q.points || 1), 0);
  return inst;
}
