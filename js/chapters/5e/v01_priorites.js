// =====================================================================
//  v01_priorites.js — 5ᵉ : priorités opératoires, parenthèses, trait de
//  fraction, vocabulaire (somme, différence, produit, quotient),
//  traduire une phrase en calcul.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { renderMath } from '../../render.js';

// Calculateur « pas à pas » : on choisit une expression, chaque clic effectue l'opération prioritaire.
const EXPRESSIONS = [
  ['7 + 3 \\times 4', '7 + 12', '19'],
  ['20 - 12 \\div 4 + 1', '20 - 3 + 1', '17 + 1', '18'],
  ['(7 + 3) \\times 4', '10 \\times 4', '40'],
  ['5 \\times (9 - 2 \\times 3)', '5 \\times (9 - 6)', '5 \\times 3', '15'],
  ['2 \\times [15 - (4 + 6)]', '2 \\times [15 - 10]', '2 \\times 5', '10'],
];

function pasAPas(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls" style="gap:.4rem">${EXPRESSIONS.map((e, i) => `<button class="btn btn-ghost" data-e="${i}">Calcul ${i + 1}</button>`).join('')}</div>
    <div class="fig-readout" data-out style="font-size:1.1rem"></div>
    <div style="text-align:center"><button class="btn btn-primary" data-next>Étape suivante →</button></div>`;
  let e = 0, k = 0;
  const out = wrap.querySelector('[data-out]'), next = wrap.querySelector('[data-next]');
  function draw() {
    const etapes = EXPRESSIONS[e].slice(0, k + 1);
    out.innerHTML = etapes.map((t, i) => `${i ? '$= ' : '$'}${t}$`).join('<br>');
    next.disabled = k >= EXPRESSIONS[e].length - 1;
    renderMath(out);
  }
  wrap.querySelectorAll('[data-e]').forEach((b) => b.addEventListener('click', () => { e = +b.dataset.e; k = 0; draw(); }));
  next.addEventListener('click', () => { k++; draw(); });
  draw();
  host.appendChild(wrap);
}

export default {
  id: 'v01',
  titre: 'Priorités opératoires et enchaînements de calculs',
  theme: 'nombres_calculs', niveau: '5e',
  icone: '🧮',

  intro:
    "Dans $7 + 3 \\times 4$, faut-il commencer par l'addition ou par la multiplication ? Pour que tout le monde " +
    "trouve le même résultat (et la calculatrice aussi !), on suit des <strong>règles de priorité</strong>. " +
    "Ces règles servent partout ensuite : calcul littéral, équations, formules de géométrie, tableur et programmation.",

  cours: [
    {
      type: 'definition', titre: 'Le vocabulaire des opérations',
      contenu: "Le résultat d'une addition est une <strong>somme</strong>, d'une soustraction une <strong>différence</strong>, d'une multiplication un <strong>produit</strong>, d'une division un <strong>quotient</strong>. Une expression est nommée d'après la <strong>dernière</strong> opération effectuée : $(2 + 5) \\times 3$ est un produit, $2 + 5 \\times 3$ est une somme.",
    },
    {
      type: 'propriete', titre: 'Sans parenthèses',
      contenu: "On effectue d'abord les <strong>multiplications et divisions</strong>, puis les <strong>additions et soustractions</strong>. Pour des opérations de même priorité, on calcule <strong>de gauche à droite</strong>.",
      formule: '7 + 3 \\times 4 = 7 + 12 = 19 \\qquad 20 - 8 + 2 = 12 + 2 = 14',
    },
    {
      type: 'propriete', titre: 'Avec des parenthèses',
      contenu: "On commence par les calculs entre parenthèses, en partant des plus <strong>intérieures</strong>. On peut aussi utiliser des crochets $[\\;]$ pour éviter de mélanger les parenthèses.",
      formule: '2 \\times [15 - (4 + 6)] = 2 \\times [15 - 10] = 2 \\times 5 = 10',
    },
    {
      type: 'propriete', titre: 'Le trait de fraction',
      contenu: "Un trait de fraction joue le rôle de parenthèses : on calcule séparément le numérateur et le dénominateur, puis on divise.",
      formule: '\\dfrac{12 + 8}{7 - 2} = \\dfrac{20}{5} = 4',
    },
    { type: 'figure', titre: 'Calcul pas à pas', contenu: "Choisis un calcul puis avance étape par étape : à chaque ligne, une seule opération prioritaire est effectuée.", render: (host) => pasAPas(host) },
    {
      type: 'exemple', enonce: 'Calculer $A = 30 - 4 \\times (2 + 3)$.',
      solution_etapes: ["Parenthèses d'abord : $2 + 3 = 5$, donc $A = 30 - 4 \\times 5$.", "Puis la multiplication : $4 \\times 5 = 20$, donc $A = 30 - 20$.", "Enfin la soustraction : $A = 10$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer les parenthèses', explication: "Souligne les parenthèses (et les crochets, le trait de fraction) : on les calcule en premier." },
    { etape: 2, titre: 'Puis × et ÷', explication: "Effectue les multiplications et divisions, de gauche à droite." },
    { etape: 3, titre: 'Puis + et −', explication: "Termine par les additions et soustractions, de gauche à droite." },
    { etape: 4, titre: 'Une étape par ligne', explication: "Recopie l'expression à chaque étape en ne remplaçant que le calcul effectué : on voit tout de suite les erreurs." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule en respectant les priorités :',
      generer() {
        const a = randInt(2, 20), b = randInt(2, 9), c = randInt(2, 9);
        const v = pick([0, 1]);
        return v ? { enonce: `$${a} + ${b} \\times ${c}$`, reponse: a + b * c, validation: 'nombre', _v: { a, b, c, v } }
          : { enonce: `$${b} \\times ${c} - ${Math.min(a, b * c)}$`, reponse: b * c - Math.min(a, b * c), validation: 'nombre', _v: { a: Math.min(a, b * c), b, c, v } };
      },
      indices: ['La multiplication est prioritaire sur l\'addition et la soustraction.', 'Calcule d\'abord le produit.', 'Termine par l\'addition (ou la soustraction).'],
      correction_etapes(st) {
        const { a, b, c, v } = st._v;
        return v ? [`Priorité à la multiplication : $${b} \\times ${c} = ${b * c}$.`, `$${a} + ${b * c} = ${a + b * c}$.`]
          : [`Priorité à la multiplication : $${b} \\times ${c} = ${b * c}$.`, `$${b * c} - ${a} = ${b * c - a}$.`];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule de gauche à droite :',
      generer() {
        const a = randInt(15, 40), b = randInt(2, 12), c = randInt(2, 12);
        return { enonce: `$${a} - ${b} + ${c}$`, reponse: a - b + c, validation: 'nombre', _v: { a, b, c } };
      },
      indices: ['Additions et soustractions ont la même priorité.', 'On calcule donc de gauche à droite.', `Attention : ce n'est pas $${'a'} - (b + c)$.`],
      correction_etapes: (st) => [`De gauche à droite : $${st._v.a} - ${st._v.b} = ${st._v.a - st._v.b}$.`, `Puis $${st._v.a - st._v.b} + ${st._v.c} = ${st._v.a - st._v.b + st._v.c}$.`],
    },
    {
      id: 'e03', niveau: 1, type: 'qcm', consigne: 'Quelle opération faut-il effectuer en premier ?',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9), d = randInt(2, 9);
        const [enonce, choix, why] = pick([
          [`$${a} + ${b} \\times ${c}$`, [`${b} \\times ${c}`, `${a} + ${b}`], 'la multiplication est prioritaire'],
          [`$(${a} + ${b}) \\times ${c}$`, [`${a} + ${b}`, `${b} \\times ${c}`], 'les parenthèses sont prioritaires'],
          [`$${a * c} \\div ${c} - ${b}$`, [`${a * c} \\div ${c}`, `${c} - ${b}`], 'la division est prioritaire'],
          [`$${a + b + c + d} - ${b} - ${c}$`, [`${a + b + c + d} - ${b}`, `${b} - ${c}`], 'on calcule de gauche à droite'],
          [`$${a} \\times (${b + c} - ${c})$`, [`${b + c} - ${c}`, `${a} \\times ${b + c}`], 'les parenthèses sont prioritaires'],
        ]);
        return { enonce: `Dans ${enonce}, on commence par :`, choix, correct: 0, _v: { why, premier: choix[0] } };
      },
      indices: ['Y a-t-il des parenthèses ?', 'Sinon, y a-t-il une multiplication ou une division ?', 'À priorité égale, on va de gauche à droite.'],
      correction_etapes: (st) => [`Ici, ${st._v.why} : on calcule d'abord $${st._v.premier}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule en respectant les priorités :',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), d = randInt(2, 6), q = randInt(2, 8), c = d * q;
        return { enonce: `$${a} \\times ${b} - ${c} \\div ${d}$`, reponse: a * b - q, validation: 'nombre', _v: { a, b, c, d, q } };
      },
      indices: ['Multiplication et division sont prioritaires.', 'Calcule le produit et le quotient séparément.', 'Termine par la soustraction.'],
      correction_etapes: (st) => { const { a, b, c, d, q } = st._v; return [`$${a} \\times ${b} = ${a * b}$ et $${c} \\div ${d} = ${q}$.`, `$${a * b} - ${q} = ${a * b - q}$.`]; },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Calcule (parenthèses imbriquées) :',
      generer() {
        const c = randInt(2, 6), d = randInt(2, 6), b = c + d + randInt(1, 9), a = randInt(2, 5);
        return { enonce: `$${a} \\times [${b} - (${c} + ${d})]$`, reponse: a * (b - c - d), validation: 'nombre', _v: { a, b, c, d } };
      },
      indices: ['Commence par les parenthèses les plus intérieures.', 'Puis le calcul entre crochets.', 'Termine par la multiplication.'],
      correction_etapes: (st) => { const { a, b, c, d } = st._v; return [`Parenthèses : $${c} + ${d} = ${c + d}$.`, `Crochets : $${b} - ${c + d} = ${b - c - d}$.`, `$${a} \\times ${b - c - d} = ${a * (b - c - d)}$.`]; },
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Choisis le bon mot :',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
        const [e, bon, why] = pick([
          [`(${a} + ${b}) \\times ${c}`, 'un produit', 'la dernière opération effectuée est la multiplication'],
          [`${a} + ${b} \\times ${c}`, 'une somme', 'la dernière opération effectuée est l\'addition'],
          [`${a * c + b} - ${b} \\times ${c}`, 'une différence', 'la dernière opération effectuée est la soustraction'],
          [`(${a * b + c}) \\div ${b}`, 'un quotient', 'la dernière opération effectuée est la division'],
          [`${a} \\times ${b} + ${c}`, 'une somme', 'la dernière opération effectuée est l\'addition'],
        ]);
        return { enonce: `L'expression $${e}$ est :`, choix: ['une somme', 'une différence', 'un produit', 'un quotient'], correct: ['une somme', 'une différence', 'un produit', 'un quotient'].indexOf(bon), ordre_fixe: true, _v: { why, bon } };
      },
      indices: ['Cherche la dernière opération à effectuer.', 'Les priorités décident de l\'ordre des calculs.', 'Le nom de l\'expression est celui de cette dernière opération.'],
      correction_etapes: (st) => [`En suivant les priorités, ${st._v.why}.`, `C'est donc ${st._v.bon}.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Calcule (trait de fraction) :',
      generer() {
        const q = randInt(2, 9), den2 = randInt(1, 6), den1 = den2 + randInt(2, 6), den = den1 - den2;
        const tot = q * den, n2 = randInt(1, tot - 1), n1 = tot - n2;
        return { enonce: `$\\dfrac{${n1} + ${n2}}{${den1} - ${den2}}$`, reponse: q, validation: 'nombre', _v: { n1, n2, den1, den2, q } };
      },
      indices: ['Le trait de fraction agit comme des parenthèses.', 'Calcule le numérateur, puis le dénominateur.', 'Divise ensuite.'],
      correction_etapes: (st) => { const { n1, n2, den1, den2, q } = st._v; return [`Numérateur : $${n1} + ${n2} = ${n1 + n2}$.`, `Dénominateur : $${den1} - ${den2} = ${den1 - den2}$.`, `$\\dfrac{${n1 + n2}}{${den1 - den2}} = ${q}$.`]; },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Traduis la phrase par un calcul, puis calcule :',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
        const [phrase, calc, rep] = pick([
          [`le produit de ${a} par la somme de ${b} et ${c}`, `${a} \\times (${b} + ${c})`, a * (b + c)],
          [`la somme de ${a} et du produit de ${b} par ${c}`, `${a} + ${b} \\times ${c}`, a + b * c],
          [`la différence entre ${b * c + a} et le produit de ${b} par ${c}`, `${b * c + a} - ${b} \\times ${c}`, a],
          [`le quotient de la somme de ${a * c} et ${b * c} par ${c}`, `(${a * c} + ${b * c}) \\div ${c}`, a + b],
          [`le produit de la différence entre ${a + b} et ${b} par ${c}`, `(${a + b} - ${b}) \\times ${c}`, a * c],
        ]);
        return { enonce: `Calcule ${phrase}.`, reponse: rep, validation: 'nombre', _v: { calc, rep } };
      },
      indices: ['Le premier mot (« produit », « somme »…) donne la dernière opération.', 'Mets entre parenthèses ce qui doit être calculé d\'abord.', 'Calcule ensuite en respectant les priorités.'],
      correction_etapes: (st) => [`Traduction : $${st._v.calc}$.`, `En respectant les priorités, on trouve $${st._v.rep}$.`],
    },
    {
      id: 'e09', niveau: 1, type: 'complete', consigne: 'Complète le calcul étape par étape :',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 6), d = randInt(10, 40);
        return {
          enonce_complete: `$${d} + ${a} \\times (${b} + ${c}) = ${d} + ${a} \\times $ {0} $= ${d} + $ {1} $=$ {2}`,
          champs: [{ reponse: b + c, validation: 'nombre' }, { reponse: a * (b + c), validation: 'nombre' }, { reponse: d + a * (b + c), validation: 'nombre' }],
          _v: { a, b, c, d },
        };
      },
      indices: ['Parenthèses d\'abord.', 'Puis la multiplication.', 'Enfin l\'addition.'],
      correction_etapes: (st) => { const { a, b, c, d } = st._v; return [`$${b} + ${c} = ${b + c}$.`, `$${a} \\times ${b + c} = ${a * (b + c)}$.`, `$${d} + ${a * (b + c)} = ${d + a * (b + c)}$.`]; },
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets les étapes du calcul dans l\'ordre :',
      generer() {
        const a = randInt(2, 6), b = randInt(2, 6), c = randInt(2, 5), d = randInt(2, 5), e = randInt(20, 60);
        return {
          etapes: [
            `$${e} - ${a} \\times (${b} + ${c}) + ${d}$`,
            `$= ${e} - ${a} \\times ${b + c} + ${d}$`,
            `$= ${e} - ${a * (b + c)} + ${d}$`,
            `$= ${e - a * (b + c)} + ${d}$`,
            `$= ${e - a * (b + c) + d}$`,
          ],
        };
      },
      indices: ['On part de l\'expression de départ.', 'Chaque ligne effectue une seule opération.', 'Parenthèses → multiplication → de gauche à droite.'],
      correction_detaillee: (st) => `<p>Parenthèses, puis multiplication, puis soustraction et addition de gauche à droite :</p><ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Combien vaut $5 + 2 \\times 3$ ?', choix: ['11', '21', '10', '30'], correct: 0, explication: 'La multiplication d\'abord : $5 + 6 = 11$.' },
    {
      type: 'saisie', question: 'Calcule.',
      generer() { const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9); return { question: `Calcule $(${a} + ${b}) \\times ${c}$.`, reponse: (a + b) * c, validation: 'nombre', explication: `$${a + b} \\times ${c} = ${(a + b) * c}$.` }; },
    },
    { type: 'vrai_faux', question: '$20 - 5 + 3 = 12$.', reponse: false, explication: 'De gauche à droite : $20 - 5 = 15$, puis $15 + 3 = 18$.' },
    {
      type: 'saisie', question: 'Calcule.',
      generer() { const d = randInt(2, 5), q = randInt(2, 9), a = randInt(1, 15); return { question: `Calcule $${a} + ${d * q} \\div ${d}$.`, reponse: a + q, validation: 'nombre', explication: `La division d'abord : $${a} + ${q} = ${a + q}$.` }; },
    },
    { type: 'qcm', question: 'L\'expression $3 \\times (4 + 5)$ est :', choix: ['un produit', 'une somme', 'une différence', 'un quotient'], correct: 0, ordre_fixe: true, explication: 'La dernière opération effectuée est la multiplication.' },
  ],
};
