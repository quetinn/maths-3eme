// =====================================================================
//  r15_nombres_premiers.js — 4ᵉ : multiples et diviseurs, critères de
//  divisibilité, nombres premiers, décomposition en facteurs premiers.
//  Figure interactive : crible d'Ératosthène (2 à 100).
// =====================================================================

import { randInt, pick, gcd, isPrime } from '../../engine.js';

function decompose(n) {
  const f = {}; let d = 2;
  while (d * d <= n) { while (n % d === 0) { f[d] = (f[d] || 0) + 1; n /= d; } d++; }
  if (n > 1) f[n] = (f[n] || 0) + 1;
  return f;
}
const decompTeX = (f) => Object.entries(f).map(([p, e]) => (e > 1 ? `${p}^{${e}}` : `${p}`)).join(' \\times ');
const sommeChiffres = (n) => String(n).split('').reduce((s, c) => s + +c, 0);
const diviseurs = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };

/** Justification d'un critère de divisibilité (texte). */
function critere(n, d) {
  const u = n % 10, s = sommeChiffres(n);
  if (d === 2) return `Son chiffre des unités est $${u}$ : ${u % 2 === 0 ? 'il est pair, donc' : 'il est impair, donc'} $${n}$ ${n % 2 === 0 ? 'est' : 'n\'est pas'} divisible par $2$.`;
  if (d === 5) return `Son chiffre des unités est $${u}$ : ${n % 5 === 0 ? 'c\'est 0 ou 5, donc' : 'ce n\'est ni 0 ni 5, donc'} $${n}$ ${n % 5 === 0 ? 'est' : 'n\'est pas'} divisible par $5$.`;
  if (d === 10) return `Son chiffre des unités est $${u}$ : ${u === 0 ? 'c\'est 0, donc' : 'ce n\'est pas 0, donc'} $${n}$ ${u === 0 ? 'est' : 'n\'est pas'} divisible par $10$.`;
  return `Somme des chiffres : $${String(n).split('').join(' + ')} = ${s}$. ${s % d === 0 ? `$${s}$ est divisible par $${d}$, donc` : `$${s}$ n'est pas divisible par $${d}$, donc`} $${n}$ ${n % d === 0 ? 'est' : 'n\'est pas'} divisible par $${d}$.`;
}

function crible(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  const cases = Array.from({ length: 99 }, (_, i) => i + 2);
  wrap.innerHTML = `
    <div class="fig-controls" style="gap:.4rem">${[2, 3, 5, 7].map((p) => `<button class="btn btn-ghost" data-p="${p}">Barrer les multiples de ${p}</button>`).join('')}
      <button class="btn btn-ghost" data-reset>↺</button></div>
    <div data-grille style="display:grid;grid-template-columns:repeat(10,1fr);gap:3px;font-variant-numeric:tabular-nums"></div>
    <div class="fig-readout" data-out></div>`;
  const barres = new Set();
  const grille = wrap.querySelector('[data-grille]');
  function draw() {
    grille.innerHTML = '<span></span>' + cases.map((n) => {
      const b = barres.has(n);
      return `<span style="text-align:center;padding:.2rem 0;border-radius:6px;font-size:.8rem;${b ? 'color:var(--muted);text-decoration:line-through;opacity:.55' : 'background:var(--accent-soft);color:var(--accent-ink);font-weight:700'}">${n}</span>`;
    }).join('');
    const restent = cases.filter((n) => !barres.has(n)).length;
    wrap.querySelector('[data-out]').innerHTML = barres.size
      ? `Il reste <strong>${restent}</strong> nombres non barrés.${restent === 25 ? ' Ce sont exactement les <strong>25 nombres premiers</strong> inférieurs à 100 !' : ''}`
      : 'Barre les multiples de 2, 3, 5 et 7 (sauf ces nombres eux-mêmes).';
  }
  wrap.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
    const p = +b.dataset.p; cases.forEach((n) => { if (n !== p && n % p === 0) barres.add(n); }); draw();
  }));
  wrap.querySelector('[data-reset]').addEventListener('click', () => { barres.clear(); draw(); });
  draw();
  host.appendChild(wrap);
}

const COMPOSES = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99];
const PREMIERS = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

export default {
  id: 'r15',
  titre: 'Divisibilité et nombres premiers',
  theme: 'nombres_calculs', niveau: '4e',
  icone: '🧮',

  intro:
    "Savoir si un nombre se divise par un autre permet de calculer vite de tête, de simplifier des fractions et de " +
    "répartir équitablement (paquets, rangées…). Les <strong>nombres premiers</strong> sont les « briques » avec " +
    "lesquelles on fabrique tous les entiers : ils servent aujourd'hui à sécuriser les paiements sur Internet. " +
    "En 3ᵉ, on s'en sert pour rendre une fraction irréductible et résoudre des problèmes de partage.",

  cours: [
    {
      type: 'definition', titre: 'Multiples et diviseurs',
      contenu: "Si $a = b \\times k$ avec $k$ entier, on dit que $a$ est un <strong>multiple</strong> de $b$, et que $b$ est un <strong>diviseur</strong> de $a$ ($a$ est divisible par $b$). Exemple : $42 = 6 \\times 7$, donc $42$ est un multiple de $6$ et $6$ divise $42$.",
    },
    {
      type: 'propriete', titre: 'Critères de divisibilité',
      contenu: "Un entier est divisible par <strong>2</strong> si son chiffre des unités est pair ; par <strong>5</strong> s'il se termine par 0 ou 5 ; par <strong>10</strong> s'il se termine par 0 ; par <strong>3</strong> si la somme de ses chiffres est divisible par 3 ; par <strong>9</strong> si la somme de ses chiffres est divisible par 9.",
    },
    {
      type: 'definition', titre: 'Nombre premier',
      contenu: "Un nombre premier est un entier qui a <strong>exactement deux diviseurs</strong> : $1$ et lui-même. Les premiers : $2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47\\dots$ Le nombre $1$ n'est pas premier (il n'a qu'un diviseur) ; $2$ est le seul premier pair.",
    },
    {
      type: 'propriete', titre: 'Décomposition en produit de facteurs premiers',
      contenu: "Tout entier supérieur ou égal à $2$ s'écrit comme un produit de nombres premiers, et cette écriture est unique (à l'ordre près). On l'obtient en divisant successivement par $2$, puis $3$, puis $5$, $7$…",
      formule: '84 = 2 \\times 42 = 2 \\times 2 \\times 21 = 2^2 \\times 3 \\times 7',
    },
    { type: 'figure', titre: 'Le crible d\'Ératosthène', contenu: "Barre les multiples de 2, 3, 5 et 7 : les nombres qui restent sont les nombres premiers inférieurs à 100.", render: (host) => crible(host) },
    {
      type: 'exemple', enonce: 'Décomposer $180$ en produit de facteurs premiers.',
      solution_etapes: ["$180 \\div 2 = 90$, $90 \\div 2 = 45$.", "$45 \\div 3 = 15$, $15 \\div 3 = 5$, et $5$ est premier.", "Donc $180 = 2 \\times 2 \\times 3 \\times 3 \\times 5 = 2^2 \\times 3^2 \\times 5$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Tester les petits diviseurs', explication: "Utilise les critères (2, 3, 5, 9, 10) avant de poser une division." },
    { etape: 2, titre: 'Montrer qu\'un nombre n\'est pas premier', explication: "Il suffit de trouver <strong>un</strong> diviseur autre que 1 et lui-même : $91 = 7 \\times 13$." },
    { etape: 3, titre: 'Décomposer', explication: "Divise par le plus petit nombre premier possible, recommence avec le quotient, jusqu'à obtenir un nombre premier." },
    { etape: 4, titre: 'Écrire avec des puissances', explication: "Regroupe les facteurs égaux : $2 \\times 2 \\times 2 = 2^3$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'vrai_faux', consigne: 'Utilise un critère de divisibilité :',
      generer() {
        const d = pick([2, 3, 5, 9, 10]);
        let n = randInt(100, 9999);
        if (Math.random() < 0.5) n = Math.ceil(n / d) * d; // une fois sur deux, divisible
        return { enonce: `Le nombre $${n}$ est-il divisible par $${d}$ ?`, reponse: n % d === 0, _v: { n, d } };
      },
      indices: ['Par 2, 5 ou 10 : regarde le chiffre des unités.', 'Par 3 ou 9 : calcule la somme des chiffres.', 'Si la somme est divisible par 3 (ou 9), le nombre aussi.'],
      correction_etapes: (st) => [critere(st._v.n, st._v.d), `Réponse : ${st.reponse ? 'vrai' : 'faux'}.`],
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Un seul de ces nombres est premier. Lequel ?',
      generer() {
        const p = pick(PREMIERS), autres = [];
        while (autres.length < 3) { const c = pick(COMPOSES); if (!autres.includes(c)) autres.push(c); }
        return { enonce: 'Lequel de ces nombres est premier ?', choix: [String(p), ...autres.map(String)], correct: 0, _v: { p, autres } };
      },
      indices: ['Un nombre premier n\'a que deux diviseurs : 1 et lui-même.', 'Teste la divisibilité par 3 (somme des chiffres) et par 7.', 'Attention : $49 = 7 \\times 7$, $91 = 7 \\times 13$.'],
      correction_etapes(st) {
        const { p, autres } = st._v;
        const decomp = (c) => { const f = decompose(c), p1 = +Object.keys(f)[0]; return `$${c} = ${p1} \\times ${c / p1}$`; };
        return [`${autres.map(decomp).join(' ; ')} : ces nombres ne sont pas premiers.`, `$${p}$ n'est divisible ni par $2$, ni par $3$, ni par $5$, ni par $7$ : il est premier.`];
      },
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Complète pour montrer que ce sont des diviseurs :',
      generer() {
        const a = pick([2, 3, 4, 5, 6]), b = pick([7, 8, 9, 11, 12]), k = randInt(3, 12), n = a * b * k;
        return {
          enonce_complete: `$${n} = ${a} \\times $ {0} $\\;$ et $\\;${n} = ${b} \\times $ {1}`,
          champs: [{ reponse: n / a, validation: 'nombre' }, { reponse: n / b, validation: 'nombre' }], _v: { n, a, b },
        };
      },
      indices: ['Divise le nombre par le facteur donné.', `Si la division tombe juste, c'est un diviseur.`, 'Vérifie en multipliant.'],
      correction_etapes: (st) => [`$${st._v.n} \\div ${st._v.a} = ${st._v.n / st._v.a}$ donc $${st._v.n} = ${st._v.a} \\times ${st._v.n / st._v.a}$.`, `$${st._v.n} \\div ${st._v.b} = ${st._v.n / st._v.b}$ donc $${st._v.n} = ${st._v.b} \\times ${st._v.n / st._v.b}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Compte les diviseurs :',
      generer() {
        const n = pick([12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 60]);
        return { enonce: `Combien le nombre $${n}$ a-t-il de diviseurs (en comptant $1$ et $${n}$) ?`, reponse: diviseurs(n).length, validation: 'nombre', _v: { n } };
      },
      indices: ['Cherche les diviseurs par paires : $1 \\times n$, $2 \\times \\dots$', 'Arrête-toi quand les paires se répètent.', 'Compte tous les nombres trouvés.'],
      correction_etapes(st) {
        const n = st._v.n, d = diviseurs(n), paires = d.filter((x) => x * x <= n).map((x) => `${x} \\times ${n / x}`);
        return [`Paires de diviseurs : $${paires.join(' \\;;\\; ')}$.`, `Diviseurs de $${n}$ : $${d.join(', ')}$.`, `Il y en a $${d.length}$.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Décompose en produit de facteurs premiers (ex. 2^3*3) :',
      generer() {
        let n;
        do { n = 2 ** randInt(0, 3) * 3 ** randInt(0, 2) * pick([1, 5, 7]) * pick([1, 1, 5]); } while (n < 20 || n > 600 || isPrime(n));
        return { enonce: `Décompose $${n}$ en produit de facteurs premiers.`, reponse: n, validation: 'facteurs_premiers', reponseTex: decompTeX(decompose(n)), _v: { n } };
      },
      indices: ['Divise par 2 tant que c\'est possible.', 'Puis par 3, par 5, par 7…', 'Tu peux écrire $2^3$ pour $2 \\times 2 \\times 2$ (clavier : 2^3*5).'],
      correction_etapes(st) {
        let n = st._v.n; const et = [];
        for (const p of [2, 3, 5, 7]) while (n % p === 0) { et.push(`$${n} \\div ${p} = ${n / p}$`); n /= p; }
        return [`Divisions successives : ${et.join(', ')}.`, `Donc $${st._v.n} = ${st.reponseTex}$.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets les divisions successives dans l\'ordre :',
      generer() {
        const n = pick([60, 84, 90, 120, 126, 150, 168, 180, 198, 210]);
        let m = n; const et = [];
        for (const p of [2, 3, 5, 7, 11]) while (m % p === 0) { et.push(`$${m} \\div ${p} = ${m / p}$`); m /= p; }
        et.push(`Conclusion : $${n} = ${decompTeX(decompose(n))}$`);
        return { etapes: et, _v: { n } };
      },
      indices: ['On part du nombre de départ.', 'Chaque quotient devient le nombre suivant à diviser.', 'On termine par la conclusion.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Rends la fraction irréductible (forme a/b) :',
      generer() {
        let p, q; do { p = randInt(2, 11); q = randInt(2, 13); } while (p === q || gcd(p, q) !== 1);
        const g = pick([6, 10, 12, 14, 15, 18, 21]);
        return { enonce: `Simplifie $\\dfrac{${g * p}}{${g * q}}$ en utilisant la décomposition en facteurs premiers.`, reponse: p / q, validation: 'fraction_irreductible', reponseTex: `\\dfrac{${p}}{${q}}`, _v: { a: g * p, b: g * q, p, q, g } };
      },
      indices: ['Décompose le numérateur et le dénominateur.', 'Barre les facteurs premiers communs.', 'Il ne doit plus rester de facteur commun.'],
      correction_etapes(st) {
        const { a, b, p, q, g } = st._v;
        return [`$${a} = ${decompTeX(decompose(a))}$ et $${b} = ${decompTeX(decompose(b))}$.`, `Facteurs communs : $${decompTeX(decompose(g))} = ${g}$.`, `$\\dfrac{${a}}{${b}} = \\dfrac{${g} \\times ${p}}{${g} \\times ${q}} = \\dfrac{${p}}{${q}}$.`];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Problème — trouve le nombre :',
      generer() {
        const [ds, L] = pick([[[2, 3, 5], 30], [[3, 4], 12], [[4, 5], 20], [[2, 9], 18], [[3, 5], 15], [[2, 3, 7], 42]]);
        const k = randInt(3, 9), N = k * L, avant = randInt(1, L - 3), apres = randInt(1, L - 2 - avant);
        return {
          enonce: `Le nombre d'élèves d'un collège qui participent à une course est compris entre $${N - avant}$ et $${N + apres}$. On peut les répartir en équipes de ${ds.slice(0, -1).join(', ')} ou ${ds[ds.length - 1]} sans qu'il reste personne. Combien sont-ils ?`,
          reponse: N, validation: 'nombre', _v: { ds, L, N, avant, apres },
        };
      },
      indices: ['Le nombre cherché est un multiple de chacun des nombres cités.', `Cherche le plus petit nombre divisible par tous : c'est un multiple commun.`, 'Liste ses multiples et garde celui qui est dans l\'intervalle.'],
      correction_etapes(st) {
        const { ds, L, N, avant, apres } = st._v, k = N / L;
        return [`Le nombre est divisible par $${ds.join('$, $')}$ : c'est un multiple de $${L}$ (le plus petit nombre divisible par chacun).`, `Multiples de $${L}$ : $${[k - 1, k, k + 1].map((i) => i * L).join(', ')}\\dots$`, `Seul $${N}$ est entre $${N - avant}$ et $${N + apres}$ : ils sont $${N}$.`];
      },
    },
    {
      id: 'e09', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux :',
      generer() {
        const n = Math.random() < 0.5 ? pick([53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113]) : pick([7 * 13, 7 * 17, 11 * 13, 7 * 19, 13 * 13, 11 * 17, 7 * 11, 3 * 37, 13 * 17]);
        return { enonce: `Le nombre $${n}$ est premier.`, reponse: isPrime(n), _v: { n } };
      },
      indices: ['Il n\'est divisible ni par 2, ni par 3, ni par 5 : ne conclus pas trop vite.', 'Teste 7, 11, 13…', 'On peut s\'arrêter quand le diviseur testé dépasse la racine carrée du nombre.'],
      correction_etapes(st) {
        const n = st._v.n;
        if (isPrime(n)) { const lim = Math.floor(Math.sqrt(n)); return [`On teste les nombres premiers jusqu'à $${lim}$ (car $${lim + 1}^2 > ${n}$) : aucun ne divise $${n}$.`, `$${n}$ est premier : <strong>vrai</strong>.`]; }
        const p = +Object.keys(decompose(n))[0];
        return [`$${n} = ${p} \\times ${n / p}$.`, `$${n}$ a d'autres diviseurs que 1 et lui-même : il n'est pas premier, <strong>faux</strong>.`];
      },
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Le nombre $1$ est-il premier ?', choix: ['non, il n\'a qu\'un seul diviseur', 'oui, il se divise par 1 et lui-même', 'oui, comme tous les nombres impairs', 'on ne sait pas'], correct: 0, explication: 'Un nombre premier a exactement deux diviseurs ; $1$ n\'en a qu\'un.' },
    {
      type: 'vrai_faux', question: 'Critère de divisibilité par 3.',
      generer() { let n = randInt(100, 999); if (Math.random() < 0.5) n = Math.ceil(n / 3) * 3; return { question: `$${n}$ est divisible par $3$.`, reponse: n % 3 === 0, explication: `Somme des chiffres : $${sommeChiffres(n)}$, ${sommeChiffres(n) % 3 === 0 ? 'divisible' : 'non divisible'} par 3.` }; },
    },
    {
      type: 'saisie', question: 'Plus petit facteur premier.',
      generer() { const n = pick([91, 119, 143, 161, 187, 203, 221, 133, 77, 49]); const p = +Object.keys(decompose(n))[0]; return { question: `Quel est le plus petit nombre premier qui divise $${n}$ ?`, reponse: p, validation: 'nombre', explication: `$${n} = ${p} \\times ${n / p}$.` }; },
    },
    { type: 'qcm', question: 'La décomposition de $72$ en facteurs premiers est :', choix: ['2^3 \\times 3^2', '8 \\times 9', '2 \\times 36', '2^2 \\times 3^3'], correct: 0, explication: '$72 = 2 \\times 2 \\times 2 \\times 3 \\times 3 = 2^3 \\times 3^2$ ($8$ et $9$ ne sont pas premiers).' },
    { type: 'saisie', question: 'Combien y a-t-il de nombres premiers inférieurs à $20$ ?', reponse: 8, validation: 'nombre', explication: '$2, 3, 5, 7, 11, 13, 17, 19$ : il y en a $8$.' },
  ],
};
