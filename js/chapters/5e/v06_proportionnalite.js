// =====================================================================
//  v06_proportionnalite.js — 5ᵉ : reconnaître la proportionnalité,
//  coefficient, passage à l'unité, linéarité, échelles, appliquer et
//  calculer un pourcentage. Figure : tableau de proportionnalité.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, dec, tableau, arrondi } from '../commun.js';

function tableauInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>prix d'un cahier (€) <input type="range" min="0.5" max="4" step="0.5" value="1.5" data-p> <span class="fig-val" data-pv></span></label></div>
    <div data-tab></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const p = +wrap.querySelector('[data-p]').value;
    wrap.querySelector('[data-pv]').textContent = dec(p);
    const n = [1, 2, 3, 5, 10];
    wrap.querySelector('[data-tab]').innerHTML = tableau([['cahiers', ...n], ['prix (€)', ...n.map((k) => dec(k * p))]]);
    wrap.querySelector('[data-out]').innerHTML = `On passe de la 1ʳᵉ ligne à la 2ᵉ en multipliant toujours par <strong>${dec(p)}</strong> : c'est le coefficient de proportionnalité.<br>Linéarité : prix de 5 = prix de 2 + prix de 3 = ${dec(2 * p)} + ${dec(3 * p)} = ${dec(5 * p)}.`;
  }
  wrap.querySelector('[data-p]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v06',
  titre: 'Proportionnalité et pourcentages',
  theme: 'fonctions', niveau: '5e',
  icone: '⚖️',

  intro:
    "Si 3 croissants coûtent 3,60 €, combien en coûtent 5 ? Quelle distance réelle représente 4 cm sur une carte ? " +
    "Combien paie-t-on après une remise de 20 % ? Toutes ces questions relèvent de la <strong>proportionnalité</strong>. " +
    "On apprend à la reconnaître et à utiliser plusieurs méthodes pour calculer une valeur manquante.",

  cours: [
    {
      type: 'definition', titre: 'Situation de proportionnalité',
      contenu: "Deux grandeurs sont <strong>proportionnelles</strong> si on obtient les valeurs de l'une en multipliant celles de l'autre par un même nombre, appelé <strong>coefficient de proportionnalité</strong>. Dans un tableau, tous les quotients « ligne du bas ÷ ligne du haut » sont égaux.",
    },
    {
      type: 'propriete', titre: 'Calculer une valeur manquante',
      contenu: "<strong>Passage à l'unité</strong> : on calcule la valeur pour 1, puis on multiplie. <strong>Linéarité</strong> : si on multiplie (ou additionne) les quantités, on multiplie (ou additionne) les prix. <strong>Coefficient</strong> : on multiplie par le coefficient.",
      formule: '3 \\text{ croissants} \\to 3{,}60 € \\;\\Rightarrow\\; 1 \\to 1{,}20 € \\;\\Rightarrow\\; 5 \\to 6 €',
    },
    {
      type: 'propriete', titre: 'Appliquer un pourcentage',
      contenu: "Prendre $t\\,\\%$ d'une quantité, c'est la multiplier par $\\dfrac{t}{100}$. Une remise de $20\\,\\%$ sur $45$ € : $45 \\times \\dfrac{20}{100} = 9$ €, donc on paie $45 - 9 = 36$ €.",
      formule: 't\\,\\% \\text{ de } N = \\dfrac{t}{100} \\times N',
    },
    {
      type: 'propriete', titre: 'Calculer un pourcentage, échelle',
      contenu: "Pour exprimer une part en pourcentage : $\\dfrac{\\text{part}}{\\text{total}} \\times 100$ ($12$ élèves sur $30$ : $\\dfrac{12}{30} \\times 100 = 40\\,\\%$). Sur une carte à l'<strong>échelle</strong> $\\dfrac{1}{25\\,000}$, les distances réelles sont $25\\,000$ fois plus grandes que sur la carte : $1$ cm représente $25\\,000$ cm $= 250$ m.",
    },
    { type: 'figure', titre: 'Un tableau de proportionnalité', contenu: "Change le prix d'un cahier : toute la ligne des prix est multipliée par le même coefficient.", render: (host) => tableauInteractif(host) },
    {
      type: 'exemple', enonce: '4 kg de pommes coûtent 10 €. Combien coûtent 6 kg ?',
      solution_etapes: ["Passage à l'unité : $1$ kg coûte $10 \\div 4 = 2{,}50$ €.", "$6$ kg coûtent $6 \\times 2{,}50 = 15$ €.", "(Autre méthode, linéarité : $6$ kg $= 4$ kg $+$ $2$ kg, soit $10 + 5 = 15$ €.)"],
    },
  ],

  methode: [
    { etape: 1, titre: 'Vérifier que c\'est proportionnel', explication: "Les quotients sont-ils tous égaux ? (Attention : un abonnement fixe ou un âge ne sont pas proportionnels.)" },
    { etape: 2, titre: 'Choisir une méthode', explication: "Coefficient, passage à l'unité ou linéarité : prends la plus simple avec les nombres donnés." },
    { etape: 3, titre: 'Pour un pourcentage', explication: "Multiplie par $\\dfrac{t}{100}$ ; pour une remise, soustrais ; pour une hausse, ajoute." },
    { etape: 4, titre: 'Vérifier l\'ordre de grandeur', explication: "Plus de quantité ⇒ prix plus grand ; $50\\,\\%$ = la moitié ; $10\\,\\%$ = diviser par 10." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'vrai_faux', consigne: 'Ce tableau est-il un tableau de proportionnalité ?',
      generer() {
        const k = randInt(2, 7), x = [randInt(1, 3), randInt(4, 6), randInt(7, 10)];
        const prop = Math.random() < 0.5, y = x.map((v) => k * v);
        if (!prop) y[2] += pick([1, 2, -1]);
        return { enonce: tableau([['x', ...x], ['y', ...y]]), reponse: prop, _v: { x, y } };
      },
      indices: ['Calcule $y \\div x$ pour chaque colonne.', 'Si tous les quotients sont égaux, c\'est proportionnel.', 'Un seul quotient différent suffit pour dire non.'],
      correction_etapes(st) {
        const { x, y } = st._v, q = x.map((v, i) => `$${y[i]} \\div ${v} = ${tex(arrondi(y[i] / v, 3))}$`);
        return [`Quotients : ${q.join(' ; ')}.`, st.reponse ? 'Ils sont tous égaux : c\'est un tableau de proportionnalité.' : 'Ils ne sont pas tous égaux : ce n\'est pas un tableau de proportionnalité.'];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Passage à l\'unité — calcule le prix (en €) :',
      generer() {
        const [objet, pu] = pick([['croissants', pick([0.9, 1.1, 1.2, 1.3])], ['cahiers', pick([1.5, 2.5, 3.5])], ['places de cinéma', pick([6.5, 7.5, 8, 9])], ['stylos', pick([0.8, 1.2, 1.5])]]);
        const n1 = randInt(2, 5); let n2; do { n2 = randInt(2, 12); } while (n2 === n1);
        return { enonce: `$${n1}$ ${objet} coûtent $${tex(n1 * pu)}$ €. Combien coûtent $${n2}$ ${objet} ?`, reponse: arrondi(n2 * pu, 2), validation: 'nombre', _v: { n1, n2, pu } };
      },
      indices: ['Calcule d\'abord le prix d\'un seul objet.', 'Divise le prix par le nombre d\'objets.', 'Multiplie ensuite par le nouveau nombre.'],
      correction_etapes: (st) => [`Prix d'un objet : $${tex(st._v.n1 * st._v.pu)} \\div ${st._v.n1} = ${tex(st._v.pu)}$ €.`, `Prix de $${st._v.n2}$ objets : $${st._v.n2} \\times ${tex(st._v.pu)} = ${tex(st._v.n2 * st._v.pu)}$ €.`],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Calcule le pourcentage :',
      generer() { const t = pick([10, 20, 25, 50, 75, 5, 30]), N = pick([20, 40, 60, 80, 120, 200, 360]); return { enonce: `Calcule $${t}\\,\\%$ de $${N}$.`, reponse: arrondi((t * N) / 100, 2), validation: 'nombre', _v: { t, N } }; },
      indices: ['$t\\,\\%$ de $N = \\dfrac{t}{100} \\times N$.', '$10\\,\\%$ : on divise par 10 ; $50\\,\\%$ : la moitié ; $25\\,\\%$ : le quart.', 'Calcule $N \\div 100 \\times t$.'],
      correction_etapes: (st) => [`$${st._v.t}\\,\\%$ de $${st._v.N} = \\dfrac{${st._v.t}}{100} \\times ${st._v.N}$.`, `$= ${st._v.N} \\div 100 \\times ${st._v.t} = ${tex((st._v.t * st._v.N) / 100)}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'complete', consigne: 'Complète le tableau de proportionnalité (utilise la linéarité) :',
      generer() {
        const k = pick([1.5, 2, 2.5, 3, 4, 6]), a = randInt(2, 5), b = randInt(2, 6);
        return {
          enonce_complete: `Prix pour $${a + b}$ kg : {0} € $\\qquad$ Prix pour $${10 * a}$ kg : {1} €`,
          visuel: (h) => { h.innerHTML = tableau([['masse (kg)', a, b, a + b, 10 * a], ['prix (€)', dec(k * a), dec(k * b), '?', '?']]); },
          champs: [{ reponse: arrondi(k * (a + b), 2), validation: 'nombre' }, { reponse: arrondi(10 * k * a, 2), validation: 'nombre' }],
          _v: { k, a, b },
        };
      },
      indices: [`$a + b$ kg : on additionne les prix de $a$ kg et de $b$ kg.`, '$10$ fois plus de kg : prix $10$ fois plus grand.', 'Tu peux aussi calculer le prix d\'un kilo.'],
      correction_etapes: (st) => { const { k, a, b } = st._v; return [`$${a + b} = ${a} + ${b}$ donc prix $= ${tex(k * a)} + ${tex(k * b)} = ${tex(k * (a + b))}$ €.`, `$${10 * a} = 10 \\times ${a}$ donc prix $= 10 \\times ${tex(k * a)} = ${tex(10 * k * a)}$ €.`]; },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Échelle — calcule la distance réelle :',
      generer() {
        const [ech, echTex] = pick([[25000, '25\\,000'], [50000, '50\\,000'], [100000, '100\\,000'], [200000, '200\\,000']]);
        const cm = randInt(2, 12) + pick([0, 0.5]), km = (cm * ech) / 100000;
        return { enonce: `Sur une carte à l'échelle $\\dfrac{1}{${echTex}}$, deux villages sont à $${tex(cm)}$ cm l'un de l'autre. Quelle est la distance réelle en km ?`, reponse: arrondi(km, 3), validation: 'nombre', _v: { ech, echTex, cm, km } };
      },
      indices: [`$1$ cm sur la carte représente « échelle » cm en réalité.`, 'Multiplie la distance sur la carte par ce nombre.', '$1$ km $= 100\\,000$ cm.'],
      correction_etapes: (st) => [`Distance réelle : $${tex(st._v.cm)} \\times ${st._v.echTex} = ${tex(st._v.cm * st._v.ech)}$ cm.`, `$${tex(st._v.cm * st._v.ech)}$ cm $= ${tex(st._v.km)}$ km (on divise par $100\\,000$).`],
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Calcule le coefficient de proportionnalité :',
      generer() { const k = pick([2, 3, 4, 5, 1.5, 2.5, 0.5]), x = randInt(2, 12) * 2; return { enonce: `Les grandeurs $x$ et $y$ sont proportionnelles. Pour $x = ${x}$, on a $y = ${tex(k * x)}$. Par quel nombre multiplie-t-on $x$ pour obtenir $y$ ?`, reponse: k, validation: 'nombre', _v: { k, x } }; },
      indices: ['Le coefficient $k$ vérifie $y = k \\times x$.', 'Donc $k = y \\div x$.', 'Vérifie : $k \\times x$ doit redonner $y$.'],
      correction_etapes: (st) => [`$k = y \\div x = ${tex(st._v.k * st._v.x)} \\div ${st._v.x}$.`, `$k = ${tex(st._v.k)}$ (vérification : $${tex(st._v.k)} \\times ${st._v.x} = ${tex(st._v.k * st._v.x)}$).`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Exprime en pourcentage :',
      generer() {
        const total = pick([20, 25, 40, 50, 200, 30, 60]); let part; do { part = randInt(1, total - 1); } while (!Number.isInteger((part * 100 * 10) / total));
        const [debut, unite, fin] = pick([['Dans une classe de', 'élèves', 'font du sport'], ['Sur un sondage de', 'personnes', 'ont répondu oui']]);
        return { enonce: `${debut} $${total}$ ${unite}, $${part}$ ${fin}. Quel pourcentage cela représente-t-il ?`, reponse: arrondi((part * 100) / total, 1), validation: 'nombre', _v: { part, total } };
      },
      indices: ['Pourcentage $= \\dfrac{\\text{part}}{\\text{total}} \\times 100$.', 'Tu peux aussi chercher combien représente $1\\,\\%$ du total.', 'Le résultat s\'exprime en %.'],
      correction_etapes: (st) => [`$\\dfrac{${st._v.part}}{${st._v.total}} \\times 100 = ${tex((st._v.part * 100) / st._v.total)}$.`, `Cela représente $${tex((st._v.part * 100) / st._v.total)}\\,\\%$.`],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Problème — prix après remise ou augmentation (en €) :',
      generer() {
        const P = pick([20, 30, 40, 45, 60, 80, 120, 150, 250]), t = pick([10, 15, 20, 25, 30, 40, 50]), hausse = Math.random() < 0.35;
        const var_ = (P * t) / 100;
        return { enonce: `Un article coûte $${P}$ €. Son prix ${hausse ? 'augmente' : 'baisse'} de $${t}\\,\\%$. Quel est son nouveau prix ?`, reponse: arrondi(hausse ? P + var_ : P - var_, 2), validation: 'nombre', _v: { P, t, hausse, var_ } };
      },
      indices: [`Calcule d'abord le montant de la variation : $\\dfrac{t}{100} \\times \\text{prix}$.`, 'Remise : on soustrait ; augmentation : on ajoute.', 'Vérifie que le résultat est cohérent.'],
      correction_etapes: (st) => [`Variation : $\\dfrac{${st._v.t}}{100} \\times ${st._v.P} = ${tex(st._v.var_)}$ €.`, `Nouveau prix : $${st._v.P} ${st._v.hausse ? '+' : '-'} ${tex(st._v.var_)} = ${tex(st._v.hausse ? st._v.P + st._v.var_ : st._v.P - st._v.var_)}$ €.`],
    },
    {
      id: 'e09', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le passage à l\'unité :',
      generer() {
        const n1 = randInt(3, 6), pu = pick([2, 3, 4, 1.5, 2.5]), n2 = randInt(7, 12);
        return { etapes: [`Lire l'énoncé : $${n1}$ objets coûtent $${tex(n1 * pu)}$ €`, `Calculer le prix d'un objet : $${tex(n1 * pu)} \\div ${n1} = ${tex(pu)}$ €`, `Multiplier par le nombre voulu : $${n2} \\times ${tex(pu)} = ${tex(n2 * pu)}$ €`, `Conclure : $${n2}$ objets coûtent $${tex(n2 * pu)}$ €`] };
      },
      indices: ['On part des données.', 'On calcule la valeur pour 1.', 'On multiplie, puis on conclut.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Calcule $10\\,\\%$ de $250$.', reponse: 25, validation: 'nombre', explication: '$250 \\div 10 = 25$.' },
    { type: 'vrai_faux', question: 'L\'âge d\'un enfant est proportionnel à sa taille.', reponse: false, explication: 'Non : la taille ne double pas quand l\'âge double (et la croissance s\'arrête).' },
    {
      type: 'saisie', question: 'Passage à l\'unité.',
      generer() { const n = randInt(2, 5), pu = pick([2, 3, 4, 5]), m = randInt(6, 10); return { question: `$${n}$ tickets coûtent $${n * pu}$ €. Combien coûtent $${m}$ tickets ?`, reponse: m * pu, validation: 'nombre', explication: `$1$ ticket : $${pu}$ € ; $${m}$ tickets : $${m * pu}$ €.` }; },
    },
    { type: 'qcm', question: 'Un pull à $40$ € est soldé à $-25\\,\\%$. Son nouveau prix est :', choix: ['30 €', '15 €', '10 €', '35 €'], correct: 0, explication: '$25\\,\\%$ de $40$ = $10$ € ; $40 - 10 = 30$ €.' },
    { type: 'qcm', question: 'À l\'échelle $\\dfrac{1}{100\\,000}$, $1$ cm sur la carte représente :', choix: ['1 km', '100 m', '10 km', '100 km'], correct: 0, explication: '$100\\,000$ cm $= 1\\,000$ m $= 1$ km.' },
  ],
};
