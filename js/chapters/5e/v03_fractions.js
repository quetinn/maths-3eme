// =====================================================================
//  v03_fractions.js — 5ᵉ : quotient, fractions égales, comparaison,
//  addition et soustraction (dénominateurs égaux ou multiples),
//  fraction d'une quantité. Figure : barres de fractions à comparer.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { frac, fracSimple, pgcd, svg } from '../commun.js';

function barres(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>a <input type="range" min="1" max="12" value="3" data-a> <span class="fig-val" data-av></span></label>
      <label>b <input type="range" min="2" max="12" value="4" data-b> <span class="fig-val" data-bv></span></label>
      <label>c <input type="range" min="1" max="12" value="5" data-c> <span class="fig-val" data-cv></span></label>
      <label>d <input type="range" min="2" max="12" value="8" data-d> <span class="fig-val" data-dv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  const v = (k) => +wrap.querySelector(`[data-${k}]`).value;
  function barre(y, n, d, coul) {
    const W = 300, x0 = 10, h = 28;
    let s = '';
    const parts = Math.max(d, 1), w = W / parts, pleins = Math.min(n, parts);
    for (let i = 0; i < parts; i++) s += `<rect x="${x0 + i * w}" y="${y}" width="${w}" height="${h}" fill="${i < pleins ? coul : 'var(--surface)'}" stroke="var(--text)" stroke-width="1"/>`;
    if (n > d) s += `<text x="${x0 + W / 2}" y="${y + 19}" text-anchor="middle" font-size="12" fill="var(--text)">(plus d'une unité)</text>`;
    return s;
  }
  function draw() {
    const a = v('a'), b = v('b'), c = v('c'), d = v('d');
    ['a', 'b', 'c', 'd'].forEach((k) => { wrap.querySelector(`[data-${k}v]`).textContent = v(k); });
    wrap.querySelector('[data-svg]').innerHTML = svg(320, 90, barre(8, a, b, 'var(--accent-soft)') + barre(52, c, d, 'color-mix(in srgb, var(--t-fonctions) 30%, var(--surface))'), 'barres de fractions', 'fig-large');
    const cmp = a * d === c * b ? '=' : a * d < c * b ? '<' : '>';
    wrap.querySelector('[data-out]').innerHTML = `${a}/${b} <strong>${cmp}</strong> ${c}/${d} — en effet ${a}/${b} = ${a * d}/${b * d} et ${c}/${d} = ${c * b}/${b * d}.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

/** Tire deux numérateurs sur le même dénominateur dont la somme n'est pas un multiple du dénominateur. */
function memeDen() {
  let d, a, c; do { d = randInt(3, 12); a = randInt(1, d - 1); c = randInt(1, d - 1); } while ((a + c) % d === 0);
  return { d, a, c };
}

export default {
  id: 'v03',
  titre: 'Fractions : comparer, additionner, soustraire',
  theme: 'nombres_calculs', niveau: '5e',
  icone: '🍰',

  intro:
    "Partager une pizza, lire une recette, calculer une part de budget… Les fractions sont partout. En 5ᵉ, on apprend " +
    "à reconnaître des fractions égales, à les <strong>comparer</strong> et à les <strong>additionner ou soustraire</strong> " +
    "quand les dénominateurs sont égaux ou multiples l'un de l'autre. C'est indispensable pour la suite : " +
    "en 4ᵉ on multipliera et divisera des fractions.",

  cours: [
    {
      type: 'definition', titre: 'Une fraction est un quotient',
      contenu: "$\\dfrac{a}{b}$ (avec $b \\neq 0$) est le nombre qui, multiplié par $b$, donne $a$. C'est aussi le résultat de la division $a \\div b$. Exemple : $\\dfrac{3}{4} = 3 \\div 4 = 0{,}75$ et $4 \\times \\dfrac{3}{4} = 3$.",
    },
    {
      type: 'propriete', titre: 'Fractions égales',
      contenu: "On ne change pas une fraction en multipliant (ou en divisant) son numérateur <strong>et</strong> son dénominateur par un même nombre non nul. Cela permet de simplifier ou de mettre au même dénominateur.",
      formule: '\\dfrac{a}{b} = \\dfrac{a \\times k}{b \\times k} \\qquad \\dfrac{2}{3} = \\dfrac{8}{12} \\qquad \\dfrac{15}{20} = \\dfrac{3}{4}',
    },
    {
      type: 'propriete', titre: 'Comparer des fractions',
      contenu: "Si les dénominateurs sont égaux, la plus grande fraction est celle qui a le plus grand numérateur. Sinon, on met d'abord les fractions au même dénominateur. On peut aussi comparer à $1$ : $\\dfrac{7}{5} > 1$ et $\\dfrac{4}{9} < 1$.",
      formule: '\\dfrac{3}{4} = \\dfrac{6}{8} \\text{ et } \\dfrac{6}{8} < \\dfrac{7}{8}, \\text{ donc } \\dfrac{3}{4} < \\dfrac{7}{8}',
    },
    {
      type: 'propriete', titre: 'Additionner et soustraire',
      contenu: "Pour additionner (ou soustraire) deux fractions, il faut le <strong>même dénominateur</strong> : on additionne (ou soustrait) les numérateurs et on garde le dénominateur. On n'additionne <strong>jamais</strong> les dénominateurs.",
      formule: '\\dfrac{a}{d} + \\dfrac{c}{d} = \\dfrac{a + c}{d} \\qquad \\dfrac{1}{3} + \\dfrac{5}{6} = \\dfrac{2}{6} + \\dfrac{5}{6} = \\dfrac{7}{6}',
    },
    {
      type: 'propriete', titre: 'Fraction d\'une quantité',
      contenu: "Prendre $\\dfrac{a}{b}$ d'une quantité, c'est la multiplier par $\\dfrac{a}{b}$ : on divise par $b$ puis on multiplie par $a$.",
      formule: '\\dfrac{3}{4} \\text{ de } 28 = 28 \\div 4 \\times 3 = 21',
    },
    { type: 'figure', titre: 'Comparer avec des barres', contenu: "Règle $\\dfrac{a}{b}$ (barre du haut) et $\\dfrac{c}{d}$ (barre du bas) pour comparer les deux parts.", render: (host) => barres(host) },
    {
      type: 'exemple', enonce: 'Calculer $\\dfrac{5}{6} - \\dfrac{1}{3}$.',
      solution_etapes: ["$6$ est un multiple de $3$ : $\\dfrac{1}{3} = \\dfrac{1 \\times 2}{3 \\times 2} = \\dfrac{2}{6}$.", "$\\dfrac{5}{6} - \\dfrac{2}{6} = \\dfrac{5 - 2}{6} = \\dfrac{3}{6}$.", "On peut simplifier : $\\dfrac{3}{6} = \\dfrac{1}{2}$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Comparer les dénominateurs', explication: "Égaux ? On calcule directement. L'un est multiple de l'autre ? On transforme la fraction qui a le plus petit dénominateur." },
    { etape: 2, titre: 'Mettre au même dénominateur', explication: "Multiplie numérateur et dénominateur par le même nombre : $\\dfrac{2}{5} = \\dfrac{4}{10}$." },
    { etape: 3, titre: 'Calculer les numérateurs', explication: "Additionne ou soustrais les numérateurs, garde le dénominateur commun." },
    { etape: 4, titre: 'Simplifier si possible', explication: "Divise numérateur et dénominateur par un diviseur commun." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Trouve le numérateur manquant :',
      generer() {
        const b = randInt(2, 9); let a; do { a = randInt(1, 2 * b); } while (pgcd(a, b) !== 1 || a === b);
        const k = randInt(2, 6);
        return { enonce: `$\\dfrac{${a}}{${b}} = \\dfrac{?}{${b * k}}$`, reponse: a * k, validation: 'nombre', _v: { a, b, k } };
      },
      indices: ['Par combien a-t-on multiplié le dénominateur ?', 'On doit multiplier le numérateur par le même nombre.', `Numérateur cherché $= a \\times k$.`],
      correction_etapes: (st) => [`$${st._v.b} \\times ${st._v.k} = ${st._v.b * st._v.k}$ : le dénominateur a été multiplié par $${st._v.k}$.`, `On multiplie aussi le numérateur : $${st._v.a} \\times ${st._v.k} = ${st._v.a * st._v.k}$, donc $\\dfrac{${st._v.a}}{${st._v.b}} = \\dfrac{${st._v.a * st._v.k}}{${st._v.b * st._v.k}}$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Compare les fractions :',
      generer() {
        let d, a, c; do { d = randInt(3, 15); a = randInt(1, 2 * d); c = randInt(1, 2 * d); } while (a === c);
        return { enonce: `$${frac(a, d)}$ ☐ $${frac(c, d)}$`, choix: ['<', '>'], correct: a < c ? 0 : 1, ordre_fixe: true, _v: { a, c, d } };
      },
      indices: ['Les dénominateurs sont égaux.', 'On compare alors les numérateurs.', 'Plus le numérateur est grand, plus la fraction est grande.'],
      correction_etapes: (st) => [`Même dénominateur $${st._v.d}$ : on compare les numérateurs $${st._v.a}$ et $${st._v.c}$.`, `$${st._v.a} ${st._v.a < st._v.c ? '<' : '>'} ${st._v.c}$ donc $${frac(st._v.a, st._v.d)} ${st._v.a < st._v.c ? '<' : '>'} ${frac(st._v.c, st._v.d)}$.`],
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Calcule (réponses sous forme de fraction, par exemple 5/7) :',
      generer() {
        const { d, a, c } = memeDen();
        let e, f; do { e = randInt(2, 2 * d); f = randInt(1, e - 1); } while ((e - f) % d === 0);
        return {
          enonce_complete: `$${frac(a, d)} + ${frac(c, d)} = $ {0} $\\qquad ${frac(e, d)} - ${frac(f, d)} = $ {1}`,
          champs: [{ reponse: (a + c) / d, validation: 'nombre', reponseTex: frac(a + c, d) }, { reponse: (e - f) / d, validation: 'nombre', reponseTex: frac(e - f, d) }],
          _v: { a, c, d, e, f },
        };
      },
      indices: ['Même dénominateur : on garde le dénominateur.', 'On additionne (ou soustrait) seulement les numérateurs.', 'Tape la fraction avec « / » : 5/7.'],
      correction_etapes: (st) => { const { a, c, d, e, f } = st._v; return [`$${frac(a, d)} + ${frac(c, d)} = \\dfrac{${a} + ${c}}{${d}} = ${frac(a + c, d)}$.`, `$${frac(e, d)} - ${frac(f, d)} = \\dfrac{${e} - ${f}}{${d}} = ${frac(e - f, d)}$.`]; },
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la somme (dénominateurs multiples) :',
      generer() {
        let b, k, a, c; do { b = randInt(2, 6); k = randInt(2, 4); a = randInt(1, 2 * b); c = randInt(1, b * k); } while ((a * k + c) % (b * k) === 0);
        return { enonce: `$${frac(a, b)} + ${frac(c, b * k)}$`, reponse: (a * k + c) / (b * k), validation: 'nombre', reponseTex: frac(a * k + c, b * k), _v: { a, b, c, k } };
      },
      indices: ['Un dénominateur est un multiple de l\'autre.', `Transforme la première fraction pour avoir le grand dénominateur.`, 'Additionne ensuite les numérateurs.'],
      correction_etapes(st) {
        const { a, b, c, k } = st._v, D = b * k;
        return [`$${D} = ${b} \\times ${k}$ : $${frac(a, b)} = \\dfrac{${a} \\times ${k}}{${b} \\times ${k}} = ${frac(a * k, D)}$.`, `$${frac(a * k, D)} + ${frac(c, D)} = ${frac(a * k + c, D)}$${pgcd(a * k + c, D) > 1 ? ` $= ${fracSimple(a * k + c, D)}$` : ''}.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Calcule la différence (dénominateurs multiples) :',
      generer() {
        let b, k, a, c; do { b = randInt(2, 6); k = randInt(2, 4); c = randInt(1, b); a = randInt(c * k + 1, c * k + 3 * b); } while ((a - c * k) % (b * k) === 0);
        return { enonce: `$${frac(a, b * k)} - ${frac(c, b)}$`, reponse: (a - c * k) / (b * k), validation: 'nombre', reponseTex: frac(a - c * k, b * k), _v: { a, b, c, k } };
      },
      indices: ['Mets les deux fractions sur le plus grand dénominateur.', `Multiplie le numérateur et le dénominateur de la 2ᵉ fraction par le même nombre.`, 'Soustrais les numérateurs.'],
      correction_etapes(st) {
        const { a, b, c, k } = st._v, D = b * k;
        return [`$${frac(c, b)} = \\dfrac{${c} \\times ${k}}{${b} \\times ${k}} = ${frac(c * k, D)}$.`, `$${frac(a, D)} - ${frac(c * k, D)} = ${frac(a - c * k, D)}$${pgcd(a - c * k, D) > 1 ? ` $= ${fracSimple(a - c * k, D)}$` : ''}.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Compare les fractions :',
      generer() {
        const b = randInt(2, 6), k = randInt(2, 4), a = randInt(1, 2 * b);
        const c = Math.random() < 0.2 ? a * k : pick([a * k - randInt(1, 2), a * k + randInt(1, 3)].filter((x) => x > 0));
        return { enonce: `$${frac(a, b)}$ ☐ $${frac(c, b * k)}$`, choix: ['<', '>', '='], correct: a * k < c ? 0 : a * k > c ? 1 : 2, ordre_fixe: true, _v: { a, b, c, k } };
      },
      indices: ['Mets les deux fractions au même dénominateur.', `Multiplie la première par $\\dfrac{k}{k}$.`, 'Compare ensuite les numérateurs.'],
      correction_etapes(st) {
        const { a, b, c, k } = st._v, s = a * k < c ? '<' : a * k > c ? '>' : '=';
        return [`$${frac(a, b)} = ${frac(a * k, b * k)}$.`, `$${a * k} ${s} ${c}$ donc $${frac(a, b)} ${s} ${frac(c, b * k)}$.`];
      },
    },
    {
      id: 'e07', niveau: 2, type: 'saisie', consigne: 'Calcule la fraction de la quantité :',
      generer() {
        const q = pick([3, 4, 5, 6, 8, 10]); let p; do { p = randInt(1, q - 1); } while (pgcd(p, q) !== 1);
        const N = q * randInt(2, 12), [objet, unite] = pick([['d\'une classe de', 'élèves'], ['d\'un sac de', 'billes'], ['d\'une somme de', '€'], ['d\'un trajet de', 'km']]);
        return { enonce: `Calcule $${frac(p, q)}$ ${objet} $${N}$ ${unite}.`, reponse: (p * N) / q, validation: 'nombre', _v: { p, q, N, unite } };
      },
      indices: ['Prendre $\\dfrac{a}{b}$ d\'une quantité, c\'est la multiplier par $\\dfrac{a}{b}$.', 'Divise d\'abord par le dénominateur.', 'Puis multiplie par le numérateur.'],
      correction_etapes: (st) => [`$${st._v.N} \\div ${st._v.q} = ${st._v.N / st._v.q}$ (une part).`, `$${st._v.N / st._v.q} \\times ${st._v.p} = ${(st._v.p * st._v.N) / st._v.q}$ ${st._v.unite}.`],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Problème — quelle fraction du gâteau reste-t-il ?',
      generer() {
        let b, k, a, c, D, reste;
        do { b = pick([2, 3, 4, 5]); k = pick([2, 3]); D = b * k; a = randInt(1, b - 1); c = randInt(1, D - 1); reste = D - a * k - c; } while (reste <= 0 || reste % D === 0);
        return { enonce: `Léa mange $${frac(a, b)}$ d'un gâteau et Tom en mange $${frac(c, D)}$. Quelle fraction du gâteau reste-t-il ?`, reponse: reste / D, validation: 'nombre', reponseTex: fracSimple(reste, D), _v: { a, b, c, k, D, reste } };
      },
      indices: ['Le gâteau entier correspond à $1$.', 'Écris $1$ et la part de Léa avec le même dénominateur que la part de Tom.', 'Reste $= 1 - \\text{part de Léa} - \\text{part de Tom}$.'],
      correction_etapes(st) {
        const { a, b, c, k, D, reste } = st._v;
        return [`Le gâteau entier : $1 = ${frac(D, D)}$ ; part de Léa : $${frac(a, b)} = ${frac(a * k, D)}$.`, `Reste : $${frac(D, D)} - ${frac(a * k, D)} - ${frac(c, D)} = ${frac(reste, D)}$${pgcd(reste, D) > 1 ? ` $= ${fracSimple(reste, D)}$` : ''}.`];
      },
    },
    {
      id: 'e09', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const { d, a, c } = memeDen(), b2 = d * 2;
        const [enonce, rep, why] = pick([
          [`$${frac(a, d)} + ${frac(c, d)} = \\dfrac{${a + c}}{${2 * d}}$`, false, `On garde le dénominateur : $${frac(a, d)} + ${frac(c, d)} = ${frac(a + c, d)}$ (on n'additionne jamais les dénominateurs).`],
          [`$${frac(a, d)} = ${frac(a * 3, d * 3)}$`, true, `On a multiplié numérateur et dénominateur par $3$.`],
          [`$${frac(a, d)} = ${frac(a + 3, d + 3)}$`, false, `Ajouter $3$ en haut et en bas change la fraction : il faut multiplier, pas ajouter.`],
          [`$${frac(a, d)} + ${frac(c, b2)} = ${frac(2 * a + c, b2)}$`, true, `$${frac(a, d)} = ${frac(2 * a, b2)}$, puis on additionne les numérateurs.`],
          [`$${frac(d + 1, d)} > 1$`, true, `Le numérateur est plus grand que le dénominateur, donc la fraction est plus grande que $1$.`],
        ]);
        return { enonce, reponse: rep, _v: { why } };
      },
      indices: ['Refais le calcul en appliquant les règles du cours.', 'Pour additionner : même dénominateur, on garde le dénominateur.', 'Deux fractions sont égales si on passe de l\'une à l\'autre en multipliant en haut ET en bas par le même nombre.'],
      correction_etapes: (st) => [st._v.why, `L'affirmation est ${st.reponse ? 'vraie' : 'fausse'}.`],
    },
    {
      id: 'e10', niveau: 1, type: 'ordonner_etapes', consigne: 'Remets les étapes de l\'addition dans l\'ordre :',
      generer() {
        let b, k, a, c; do { b = randInt(2, 5); k = randInt(2, 3); a = randInt(1, b); c = randInt(1, b * k); } while ((a * k + c) % (b * k) === 0);
        const D = b * k;
        return {
          etapes: [
            `Remarquer que $${D}$ est un multiple de $${b}$ : $${D} = ${b} \\times ${k}$`,
            `Transformer : $${frac(a, b)} = ${frac(a * k, D)}$`,
            `Écrire la somme avec le même dénominateur : $${frac(a * k, D)} + ${frac(c, D)}$`,
            `Additionner les numérateurs : $${frac(a * k + c, D)}$`,
          ],
        };
      },
      indices: ['On cherche d\'abord le dénominateur commun.', 'On transforme une fraction.', 'On additionne en dernier.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
    {
      id: 'e11', niveau: 2, type: 'saisie', consigne: 'Écris le nombre cherché sous forme de fraction :',
      generer() {
        let a, b; do { a = randInt(1, 12); b = randInt(2, 11); } while (pgcd(a, b) !== 1 || a % b === 0);
        return { enonce: `Quel nombre, multiplié par $${b}$, donne $${a}$ ?`, reponse: a / b, validation: 'nombre', reponseTex: frac(a, b), _v: { a, b } };
      },
      indices: ['C\'est la définition d\'une fraction.', `$\\dfrac{a}{b}$ est le nombre qui multiplié par $b$ donne $a$.`, 'Tape la fraction avec « / ».'],
      correction_etapes: (st) => [`Par définition, $${st._v.b} \\times ${frac(st._v.a, st._v.b)} = ${st._v.a}$.`, `Le nombre cherché est $${frac(st._v.a, st._v.b)}$.`],
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: '$\\dfrac{2}{5} + \\dfrac{1}{5} = $', choix: ['\\dfrac{3}{5}', '\\dfrac{3}{10}', '\\dfrac{2}{25}', '\\dfrac{3}{25}'], correct: 0, explication: 'Même dénominateur : $\\dfrac{2 + 1}{5} = \\dfrac{3}{5}$.' },
    {
      type: 'saisie', question: 'Fraction égale.',
      generer() { const a = randInt(1, 4), b = a + randInt(1, 5), k = randInt(2, 5); return { question: `Complète : $\\dfrac{${a}}{${b}} = \\dfrac{?}{${b * k}}$.`, reponse: a * k, validation: 'nombre', explication: `On multiplie par $${k}$ : $${a * k}$.` }; },
    },
    { type: 'vrai_faux', question: '$\\dfrac{3}{4} < \\dfrac{5}{8}$.', reponse: false, explication: '$\\dfrac{3}{4} = \\dfrac{6}{8}$ et $6 > 5$, donc $\\dfrac{3}{4} > \\dfrac{5}{8}$.' },
    {
      type: 'saisie', question: 'Fraction d\'une quantité.',
      generer() { const q = pick([3, 4, 5]), N = q * randInt(3, 10); return { question: `Calcule $\\dfrac{2}{${q}}$ de $${N}$.`, reponse: (2 * N) / q, validation: 'nombre', explication: `$${N} \\div ${q} \\times 2 = ${(2 * N) / q}$.` }; },
    },
    { type: 'qcm', question: '$\\dfrac{1}{2} + \\dfrac{1}{4} = $', choix: ['\\dfrac{3}{4}', '\\dfrac{2}{6}', '\\dfrac{1}{6}', '\\dfrac{2}{4}'], correct: 0, explication: '$\\dfrac{1}{2} = \\dfrac{2}{4}$, donc $\\dfrac{2}{4} + \\dfrac{1}{4} = \\dfrac{3}{4}$.' },
  ],
};
