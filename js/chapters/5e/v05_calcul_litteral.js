// =====================================================================
//  v05_calcul_litteral.js — 5ᵉ : expressions littérales, conventions
//  d'écriture, substitution (formules), tester une égalité, équations
//  simples (« nombre caché »), programme de calcul.
//  Figure : une formule dont on fait varier la valeur de x.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, tableau, sgn } from '../commun.js';

function substitution(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>x <input type="range" min="0" max="10" value="3" data-x> <span class="fig-val" data-xv></span></label></div>
    <div data-tab></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const x = +wrap.querySelector('[data-x]').value;
    wrap.querySelector('[data-xv]').textContent = x;
    wrap.querySelector('[data-tab]').innerHTML = tableau([
      ['expression', '3x + 5', '2x²', '4(x − 1)'],
      ['calcul', `3 × ${x} + 5`, `2 × ${x} × ${x}`, `4 × (${x} − 1)`],
      ['valeur', 3 * x + 5, 2 * x * x, 4 * (x - 1)],
    ]);
    wrap.querySelector('[data-out]').innerHTML = `On remplace <strong>x</strong> par <strong>${x}</strong> et on remet les signes × sous-entendus.`;
  }
  wrap.querySelector('[data-x]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v05',
  titre: 'Calcul littéral : formules, substitution, équations simples',
  theme: 'nombres_calculs', niveau: '5e',
  icone: '✏️',

  intro:
    "Une <strong>lettre</strong> peut représenter un nombre qu'on ne connaît pas encore ou qui peut changer : le côté " +
    "d'un carré, le nombre de places achetées, la température… On écrit alors des <strong>formules</strong> " +
    "($P = 4 \\times c$) qu'on utilise en remplaçant la lettre par une valeur. On apprend aussi à trouver un " +
    "nombre caché dans une égalité : ce sont les premières équations.",

  cours: [
    {
      type: 'definition', titre: 'Expression littérale',
      contenu: "Une expression littérale est une expression dans laquelle une ou plusieurs lettres désignent des nombres. Exemple : le périmètre d'un rectangle de longueur $L$ et de largeur $\\ell$ est $P = 2 \\times (L + \\ell)$.",
    },
    {
      type: 'propriete', titre: 'Conventions d\'écriture',
      contenu: "On peut supprimer le signe $\\times$ devant une lettre ou une parenthèse : $3 \\times x = 3x$, $a \\times b = ab$, $5 \\times (x + 2) = 5(x + 2)$. On écrit le nombre en premier : $x \\times 4 = 4x$. Enfin $x \\times x = x^2$, $x \\times x \\times x = x^3$ et $1x = x$.",
    },
    {
      type: 'propriete', titre: 'Substituer (remplacer une lettre)',
      contenu: "Pour calculer une expression pour une valeur de la lettre, on remplace la lettre par cette valeur <strong>en remettant les signes ×</strong>, puis on calcule en respectant les priorités.",
      formule: '\\text{Pour } x = 4 : \\quad 3x^2 - 5 = 3 \\times 4^2 - 5 = 3 \\times 16 - 5 = 43',
    },
    {
      type: 'definition', titre: 'Tester une égalité, résoudre une équation simple',
      contenu: "Une égalité avec une lettre est vraie pour certaines valeurs seulement. Pour la <strong>tester</strong>, on calcule séparément chaque membre. <strong>Résoudre</strong> l'équation, c'est trouver la valeur qui la rend vraie : si $x + 7 = 12$ alors $x = 12 - 7 = 5$ ; si $4x = 28$ alors $x = 28 \\div 4 = 7$.",
    },
    { type: 'figure', titre: 'Une lettre, plusieurs valeurs', contenu: "Change la valeur de $x$ : les trois expressions sont recalculées.", render: (host) => substitution(host) },
    {
      type: 'exemple', enonce: 'L\'égalité $4x - 3 = 2x + 5$ est-elle vraie pour $x = 4$ ?',
      solution_etapes: ["Membre de gauche : $4 \\times 4 - 3 = 16 - 3 = 13$.", "Membre de droite : $2 \\times 4 + 5 = 8 + 5 = 13$.", "Les deux membres sont égaux : l'égalité est vraie pour $x = 4$ (donc $4$ est solution)."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Remettre les signes ×', explication: "$5x$ devient $5 \\times x$, $3(x + 1)$ devient $3 \\times (x + 1)$." },
    { etape: 2, titre: 'Remplacer la lettre', explication: "Écris la valeur à la place de chaque lettre (entre parenthèses si elle est négative)." },
    { etape: 3, titre: 'Calculer avec les priorités', explication: "Parenthèses, puissances, × et ÷, puis + et −." },
    { etape: 4, titre: 'Pour trouver un nombre caché', explication: "Fais l'opération « inverse » : $x + a = b$ donne $x = b - a$ ; $a \\times x = b$ donne $x = b \\div a$. Vérifie en remplaçant." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la valeur de l\'expression :',
      generer() { const a = randInt(2, 9), b = randInt(1, 15), x = randInt(1, 10); return { enonce: `Calcule $${a}x + ${b}$ pour $x = ${x}$.`, reponse: a * x + b, validation: 'nombre', _v: { a, b, x } }; },
      indices: ['$ax$ signifie $a \\times x$.', 'Remplace $x$ par sa valeur.', 'La multiplication est prioritaire.'],
      correction_etapes: (st) => [`$${st._v.a}x + ${st._v.b} = ${st._v.a} \\times ${st._v.x} + ${st._v.b}$.`, `$= ${st._v.a * st._v.x} + ${st._v.b} = ${st._v.a * st._v.x + st._v.b}$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Choisis l\'écriture simplifiée :',
      generer() {
        const n = randInt(2, 9);
        const [depart, bon, faux, why] = pick([
          [`${n} \\times a \\times b`, `${n}ab`, [`${n} + ab`, `${n}a + b`, `ab^{${n}}`], 'on supprime les signes × devant les lettres'],
          ['x \\times x', 'x^2', ['2x', 'x + x', 'xx^2'], '$x \\times x$ se note $x^2$'],
          [`x \\times ${n}`, `${n}x`, [`x^{${n}}`, `x + ${n}`, `x${n}`], 'on écrit le nombre devant la lettre'],
          [`${n} \\times (x + 1)`, `${n}(x + 1)`, [`${n}x + 1`, `${n} + x + 1`, `(x + 1)^{${n}}`], 'on peut supprimer le × devant une parenthèse'],
          ['a \\times a \\times a', 'a^3', ['3a', 'a + a + a', '3a^3'], '$a \\times a \\times a$ se note $a^3$'],
        ]);
        return { enonce: `$${depart}$ s'écrit plus simplement :`, choix: [bon, ...faux], correct: 0, _v: { depart, bon, why } };
      },
      indices: ['Le signe × peut disparaître devant une lettre ou une parenthèse.', 'Le nombre s\'écrit devant la lettre.', '$x \\times x = x^2$ (ce n\'est pas $2x$).'],
      correction_etapes: (st) => [`Ici, ${st._v.why}.`, `$${st._v.depart} = ${st._v.bon}$.`],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Utilise la formule :',
      generer() {
        const L = randInt(4, 20), l = randInt(2, L - 1);
        return pick([
          { enonce: `Le périmètre d'un rectangle est $P = 2 \\times (L + \\ell)$. Calcule $P$ (en cm) pour $L = ${L}$ cm et $\\ell = ${l}$ cm.`, reponse: 2 * (L + l), validation: 'nombre', _v: { f: 'P', L, l } },
          { enonce: `L'aire d'un rectangle est $\\mathcal{A} = L \\times \\ell$. Calcule $\\mathcal{A}$ (en cm²) pour $L = ${L}$ cm et $\\ell = ${l}$ cm.`, reponse: L * l, validation: 'nombre', _v: { f: 'A', L, l } },
        ]);
      },
      indices: ['Remplace chaque lettre par sa valeur.', 'Respecte les parenthèses.', 'N\'oublie pas l\'unité.'],
      correction_etapes: (st) => (st._v.f === 'P' ? [`$P = 2 \\times (${st._v.L} + ${st._v.l}) = 2 \\times ${st._v.L + st._v.l}$.`, `$P = ${2 * (st._v.L + st._v.l)}$ cm.`] : [`$\\mathcal{A} = ${st._v.L} \\times ${st._v.l}$.`, `$\\mathcal{A} = ${st._v.L * st._v.l}$ cm².`]),
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la valeur de l\'expression :',
      generer() { const a = randInt(2, 5), b = randInt(1, 9), c = randInt(1, 20), x = randInt(2, 6); return { enonce: `Calcule $${a}x^2 - ${b}x + ${c}$ pour $x = ${x}$.`, reponse: a * x * x - b * x + c, validation: 'nombre', _v: { a, b, c, x } }; },
      indices: ['$ax^2 = a \\times x \\times x$.', 'Calcule d\'abord le carré.', 'Puis les produits, puis de gauche à droite.'],
      correction_etapes(st) {
        const { a, b, c, x } = st._v;
        return [`$${a} \\times ${x}^2 - ${b} \\times ${x} + ${c}$.`, `$= ${a} \\times ${x * x} - ${b * x} + ${c}$.`, `$= ${a * x * x} - ${b * x} + ${c} = ${a * x * x - b * x + c}$.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'vrai_faux', consigne: 'Teste l\'égalité :',
      generer() {
        let a, c; do { a = randInt(3, 7); c = randInt(1, 4); } while (a === c);
        const sol = randInt(1, 6), b = randInt(1, 9), d = (a - c) * sol + b;
        const t = Math.random() < 0.5 ? sol : sol + pick([-1, 1, 2]);
        return { enonce: `L'égalité $${a}x + ${b} = ${c === 1 ? '' : c}x + ${d}$ est-elle vraie pour $x = ${t}$ ?`, reponse: t === sol, _v: { a, b, c, d, t } };
      },
      indices: ['Calcule le membre de gauche en remplaçant $x$.', 'Calcule le membre de droite.', 'L\'égalité est vraie si les deux résultats sont égaux.'],
      correction_etapes(st) {
        const { a, b, c, d, t } = st._v, g = a * t + b, dr = c * t + d;
        return [`À gauche : $${a} \\times ${t} + ${b} = ${g}$.`, `À droite : $${c} \\times ${t} + ${d} = ${dr}$.`, g === dr ? `$${g} = ${dr}$ : l'égalité est vraie.` : `$${g} \\neq ${dr}$ : l'égalité est fausse.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Trouve le nombre caché $x$ :',
      generer() {
        const a = randInt(2, 12), k = pick(['plus', 'moins', 'fois']), x = k === 'moins' ? randInt(a + 1, a + 15) : randInt(2, 15);
        if (k === 'plus') return { enonce: `$x + ${a} = ${x + a}$`, reponse: x, validation: 'nombre', _v: { x, a, k } };
        if (k === 'moins') return { enonce: `$x - ${a} = ${x - a}$`, reponse: x, validation: 'nombre', _v: { x, a, k } };
        return { enonce: `$${a}x = ${a * x}$`, reponse: x, validation: 'nombre', _v: { x, a, k } };
      },
      indices: ['Quel nombre faut-il mettre à la place de $x$ ?', 'Utilise l\'opération inverse.', 'Vérifie en remplaçant $x$ par ta réponse.'],
      correction_etapes(st) {
        const { x, a, k } = st._v;
        if (k === 'plus') return [`$x + ${a} = ${x + a}$ donc $x = ${x + a} - ${a}$.`, `$x = ${x}$. Vérification : $${x} + ${a} = ${x + a}$.`];
        if (k === 'moins') return [`$x - ${a} = ${x - a}$ donc $x = ${x - a} + ${a}$.`, `$x = ${x}$. Vérification : $${x} - ${a} = ${x - a}$.`];
        return [`$${a} \\times x = ${a * x}$ donc $x = ${a * x} \\div ${a}$.`, `$x = ${x}$. Vérification : $${a} \\times ${x} = ${a * x}$.`];
      },
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Trouve le nombre caché $x$ :',
      generer() { const x = randInt(1, 12), a = randInt(2, 9), b = randInt(1, 20); return { enonce: `$${a}x + ${b} = ${a * x + b}$`, reponse: x, validation: 'nombre', _v: { x, a, b } }; },
      indices: ['Commence par enlever ce qui est ajouté.', `Tu obtiens alors $ax = \\dots$`, 'Divise ensuite.'],
      correction_etapes: (st) => [`$${st._v.a}x + ${st._v.b} = ${st._v.a * st._v.x + st._v.b}$ donc $${st._v.a}x = ${st._v.a * st._v.x + st._v.b} - ${st._v.b} = ${st._v.a * st._v.x}$.`, `$x = ${st._v.a * st._v.x} \\div ${st._v.a} = ${st._v.x}$.`, `Vérification : $${st._v.a} \\times ${st._v.x} + ${st._v.b} = ${st._v.a * st._v.x + st._v.b}$.`],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Programme de calcul — écris le résultat en fonction de $x$ :',
      generer() {
        const a = randInt(2, 9), b = randInt(1, 9), ordre = Math.random() < 0.5;
        return ordre
          ? { enonce: `On choisit un nombre $x$. On le multiplie par $${a}$, puis on ajoute $${b}$ au résultat. Quelle expression obtient-on ?`, reponse: `${a}x+${b}`, validation: 'expression', reponseTex: `${a}x + ${b}`, _v: { a, b, ordre } }
          : { enonce: `On choisit un nombre $x$. On lui ajoute $${b}$, puis on multiplie le résultat par $${a}$. Quelle expression obtient-on ?`, reponse: `${a}(x+${b})`, validation: 'expression', reponseTex: `${a}(x + ${b})`, _v: { a, b, ordre } };
      },
      indices: ['Écris chaque étape avec la lettre $x$.', 'Si on multiplie « le résultat » d\'une addition, il faut des parenthèses.', 'Supprime les signes × devant $x$ ou devant une parenthèse.'],
      correction_etapes(st) {
        const { a, b, ordre } = st._v;
        return ordre ? [`On multiplie $x$ par $${a}$ : $${a}x$.`, `On ajoute $${b}$ : $${a}x + ${b}$.`] : [`On ajoute $${b}$ à $x$ : $x + ${b}$.`, `On multiplie tout ce résultat par $${a}$ : $${a}(x + ${b})$ (les parenthèses sont indispensables).`];
      },
    },
    {
      id: 'e09', niveau: 1, type: 'complete', consigne: 'Complète la substitution :',
      generer() { const a = randInt(2, 9), b = randInt(1, 9), x = randInt(2, 9); return { enonce_complete: `Pour $x = ${x}$ : $${a}x - ${b} = ${a} \\times $ {0} $- ${b} = $ {1}`, champs: [{ reponse: x, validation: 'nombre' }, { reponse: a * x - b, validation: 'nombre' }], _v: { a, b, x } }; },
      indices: ['On remplace $x$ par sa valeur.', 'Puis on multiplie.', 'Enfin on soustrait.'],
      correction_etapes: (st) => [`$${st._v.a}x$ devient $${st._v.a} \\times ${st._v.x} = ${st._v.a * st._v.x}$.`, `$${st._v.a * st._v.x} - ${st._v.b} = ${st._v.a * st._v.x - st._v.b}$.`],
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le test de l\'égalité :',
      generer() {
        const a = randInt(3, 6), c = randInt(1, a - 1), sol = randInt(1, 5), b = randInt(1, 9), d = (a - c) * sol + b;
        return {
          etapes: [
            `On remplace $x$ par $${sol}$ dans $${a}x + ${b} = ${c === 1 ? '' : c}x + ${d}$`,
            `Membre de gauche : $${a} \\times ${sol} + ${b} = ${a * sol + b}$`,
            `Membre de droite : $${c} \\times ${sol} + ${d} = ${c * sol + d}$`,
            `Les deux membres sont égaux : $${sol}$ est une solution`,
          ],
        };
      },
      indices: ['On remplace d\'abord la lettre.', 'On calcule chaque membre séparément.', 'On conclut en dernier.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
    {
      id: 'e11', niveau: 3, type: 'saisie', consigne: 'Utilise la formule (avec des décimaux) :',
      generer() {
        return pick([
          (() => { const C = 5 * randInt(-4, 8); return { enonce: `La formule $F = 1{,}8 \\times C + 32$ donne la température en degrés Fahrenheit à partir de la température $C$ en degrés Celsius. Calcule $F$ pour $C = ${C}$.`, reponse: Math.round((1.8 * C + 32) * 100) / 100, validation: 'nombre', _v: { k: 'F', C } }; })(),
          (() => { const n = randInt(3, 25); return { enonce: `Un taxi facture selon la formule $P = 4{,}5 + 1{,}2 \\times n$, où $n$ est le nombre de kilomètres. Quel est le prix $P$ (en €) pour $n = ${n}$ ?`, reponse: Math.round((4.5 + 1.2 * n) * 100) / 100, validation: 'nombre', _v: { k: 'T', n } }; })(),
        ]);
      },
      indices: ['Remplace la lettre par la valeur.', 'La multiplication est prioritaire.', 'Attention aux virgules (et au signe si la valeur est négative).'],
      correction_etapes(st) {
        const { k, C, n } = st._v;
        if (k === 'F') return [`$F = 1{,}8 \\times ${C < 0 ? `(${C})` : C} + 32$.`, `$F = ${tex(1.8 * C)} ${sgn(32)} = ${tex(1.8 * C + 32)}$ °F.`];
        return [`$P = 4{,}5 + 1{,}2 \\times ${n}$.`, `$P = 4{,}5 + ${tex(1.2 * n)} = ${tex(4.5 + 1.2 * n)}$ €.`];
      },
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: '$5 \\times x \\times x$ s\'écrit :', choix: ['5x^2', '10x', '5x', '25x'], correct: 0, explication: '$x \\times x = x^2$, donc $5x^2$.' },
    {
      type: 'saisie', question: 'Substitution.',
      generer() { const a = randInt(2, 6), b = randInt(1, 9), x = randInt(2, 8); return { question: `Calcule $${a}x + ${b}$ pour $x = ${x}$.`, reponse: a * x + b, validation: 'nombre', explication: `$${a} \\times ${x} + ${b} = ${a * x + b}$.` }; },
    },
    { type: 'vrai_faux', question: 'Pour $x = 3$, on a $2x = 23$.', reponse: false, explication: '$2x = 2 \\times 3 = 6$ : on remet le signe ×.' },
    {
      type: 'saisie', question: 'Nombre caché.',
      generer() { const x = randInt(2, 12), a = randInt(2, 9); return { question: `Trouve $x$ : $${a}x = ${a * x}$.`, reponse: x, validation: 'nombre', explication: `$x = ${a * x} \\div ${a} = ${x}$.` }; },
    },
    { type: 'qcm', question: 'Quelle valeur de $x$ rend vraie l\'égalité $x + 9 = 15$ ?', choix: ['6', '24', '9', '15'], correct: 0, explication: '$15 - 9 = 6$.' },
  ],
};
