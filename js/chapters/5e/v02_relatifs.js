// =====================================================================
//  v02_relatifs.js — 5ᵉ : nombres relatifs — droite graduée, opposé,
//  comparaison, addition, soustraction, enchaînements, problèmes
//  (températures, altitudes). Figure : sauts sur la droite graduée.
// =====================================================================

import { randInt, randIntNonZero, pick } from '../../engine.js';
import { par, droiteGraduee } from '../commun.js';

function sautsInteractifs(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>départ <input type="range" min="-8" max="8" value="-3" data-a> <span class="fig-val" data-av></span></label>
      <label>saut <input type="range" min="-8" max="8" value="5" data-b> <span class="fig-val" data-bv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, b = +wrap.querySelector('[data-b]').value, s = a + b;
    wrap.querySelector('[data-av]').textContent = a; wrap.querySelector('[data-bv]').textContent = b;
    wrap.querySelector('[data-svg]').innerHTML = droiteGraduee({ min: -16, max: 16, pas: 1, etiq: 4, points: [{ x: a, nom: 'départ' }, { x: s, nom: '' }], W: 340 })
      .replace('</svg>', `<text x="${22 + (s + 16) / 32 * 296}" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ok)">${s}</text></svg>`);
    wrap.querySelector('[data-out]').innerHTML = `${a < 0 ? `(${a})` : a} + ${b < 0 ? `(${b})` : b} = <strong>${s}</strong> — un saut de ${Math.abs(b)} vers la ${b >= 0 ? 'droite' : 'gauche'}.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v02',
  titre: 'Nombres relatifs : repérage, addition, soustraction',
  theme: 'nombres_calculs', niveau: '5e',
  icone: '➕',

  intro:
    "Il fait $-5$ °C, un sous-marin est à $-200$ m, un compte est à découvert… Les <strong>nombres relatifs</strong> " +
    "(positifs et négatifs) permettent de décrire ces situations. En 5ᵉ, on apprend à les placer sur une droite " +
    "graduée, à les comparer, à les additionner et à les soustraire. En 4ᵉ, on apprendra à les multiplier et à les diviser.",

  cours: [
    {
      type: 'definition', titre: 'Nombres relatifs et opposés',
      contenu: "Un nombre relatif est formé d'un <strong>signe</strong> ($+$ ou $-$) et d'une <strong>distance à zéro</strong>. $-7$ est négatif, $+7 = 7$ est positif ; $0$ est à la fois positif et négatif. Deux nombres qui ont la même distance à zéro mais des signes contraires sont <strong>opposés</strong> : $-7$ et $7$.",
    },
    {
      type: 'propriete', titre: 'Comparer deux relatifs',
      contenu: "Sur une droite graduée, le plus petit est le plus à gauche. Un négatif est toujours plus petit qu'un positif. Entre deux négatifs, le plus petit est celui qui a la <strong>plus grande</strong> distance à zéro : $-9 < -4$.",
    },
    {
      type: 'propriete', titre: 'Additionner deux relatifs',
      contenu: "<strong>Même signe</strong> : on additionne les distances à zéro et on garde ce signe. <strong>Signes contraires</strong> : on soustrait les distances à zéro et on prend le signe de celui qui a la plus grande distance à zéro. La somme de deux opposés vaut $0$.",
      formule: '(-3) + (-5) = -8 \\qquad (-9) + 4 = -5 \\qquad 7 + (-2) = 5',
    },
    {
      type: 'propriete', titre: 'Soustraire un relatif',
      contenu: "Soustraire un nombre, c'est <strong>ajouter son opposé</strong>.",
      formule: '5 - (-3) = 5 + 3 = 8 \\qquad (-2) - 6 = (-2) + (-6) = -8',
    },
    { type: 'figure', titre: 'Additionner = faire un saut', contenu: "Règle le départ et le saut : un nombre positif fait avancer vers la droite, un négatif vers la gauche.", render: (host) => sautsInteractifs(host) },
    {
      type: 'exemple', enonce: 'Calculer $A = -6 + 10 - (-4) - 9$.',
      solution_etapes: ["On transforme la soustraction de $-4$ : $A = -6 + 10 + 4 - 9$.", "De gauche à droite : $-6 + 10 = 4$ ; $4 + 4 = 8$ ; $8 - 9 = -1$.", "Donc $A = -1$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Regarder les signes', explication: "Même signe → on additionne les distances à zéro ; signes contraires → on les soustrait." },
    { etape: 2, titre: 'Choisir le signe du résultat', explication: "C'est le signe du nombre le plus « loin » de zéro." },
    { etape: 3, titre: 'Transformer les soustractions', explication: "$a - b = a + (\\text{opposé de } b)$ : $4 - (-6) = 4 + 6$." },
    { etape: 4, titre: 'Enchaîner de gauche à droite', explication: "Ou regroupe les positifs d'un côté, les négatifs de l'autre, puis fais la somme des deux." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'qcm', consigne: 'Compare les deux nombres :',
      generer() {
        let a, b; do { a = randInt(-15, 15); b = randInt(-15, 15); } while (a === b || Math.random() < 0.6 && (a > 0 || b > 0));
        return { enonce: `$${a}$ ☐ $${b}$`, choix: ['<', '>'], correct: a < b ? 0 : 1, ordre_fixe: true, _v: { a, b } };
      },
      indices: ['Imagine les deux nombres sur une droite graduée.', 'Le plus petit est le plus à gauche.', 'Entre deux négatifs, le plus petit est le plus loin de zéro.'],
      correction_etapes(st) {
        const { a, b } = st._v, [p, g] = a < b ? [a, b] : [b, a];
        let why = 'il est plus à gauche sur la droite graduée';
        if (p < 0 && g >= 0) why = 'un négatif est plus petit qu\'un positif (ou que zéro)';
        else if (p < 0 && g < 0) why = `les deux sont négatifs et $${p}$ est plus loin de zéro`;
        return [`$${p}$ est le plus petit car ${why}.`, `Donc $${a} ${a < b ? '<' : '>'} ${b}$.`];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la somme :',
      generer() { const a = randIntNonZero(-12, 12), b = randIntNonZero(-12, 12); return { enonce: `$${par(a)} + ${par(b)}$`, reponse: a + b, validation: 'nombre', _v: { a, b } }; },
      indices: ['Même signe ou signes contraires ?', 'Même signe : on ajoute les distances à zéro. Signes contraires : on les soustrait.', 'Le signe du résultat est celui du nombre le plus éloigné de zéro.'],
      correction_etapes(st) {
        const { a, b } = st._v, s = a + b, da = Math.abs(a), db = Math.abs(b);
        if ((a > 0) === (b > 0)) return [`Même signe (${a > 0 ? 'positifs' : 'négatifs'}) : on additionne les distances à zéro, $${da} + ${db} = ${da + db}$.`, `On garde le signe : $${par(a)} + ${par(b)} = ${s}$.`];
        const [grand] = da >= db ? [a] : [b];
        return [`Signes contraires : on soustrait les distances à zéro, $${Math.max(da, db)} - ${Math.min(da, db)} = ${Math.abs(s)}$.`, s === 0 ? `Ce sont deux opposés : la somme vaut $0$.` : `Le signe est celui de $${grand}$ (le plus loin de zéro) : $${par(a)} + ${par(b)} = ${s}$.`];
      },
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Transforme la soustraction, puis calcule :',
      generer() {
        const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9);
        return { enonce_complete: `$${par(a)} - ${par(b)} = ${par(a)} + $ {0} $=$ {1}`, champs: [{ reponse: -b, validation: 'nombre' }, { reponse: a - b, validation: 'nombre' }], _v: { a, b } };
      },
      indices: ['Soustraire un nombre, c\'est ajouter son opposé.', 'L\'opposé de $-4$ est $4$, l\'opposé de $4$ est $-4$.', 'Calcule ensuite la somme.'],
      correction_etapes: (st) => [`L'opposé de $${st._v.b}$ est $${-st._v.b}$ : $${par(st._v.a)} - ${par(st._v.b)} = ${par(st._v.a)} + ${par(-st._v.b)}$.`, `$${par(st._v.a)} + ${par(-st._v.b)} = ${st._v.a - st._v.b}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la différence :',
      generer() { const a = randIntNonZero(-15, 15), b = randIntNonZero(-15, 15); return { enonce: `$${par(a)} - ${par(b)}$`, reponse: a - b, validation: 'nombre', _v: { a, b } }; },
      indices: ['Transforme d\'abord : $a - b = a + (\\text{opposé de } b)$.', 'Puis applique la règle de l\'addition.', 'Vérifie le signe du résultat.'],
      correction_etapes: (st) => [`$${par(st._v.a)} - ${par(st._v.b)} = ${par(st._v.a)} + ${par(-st._v.b)}$ (on ajoute l'opposé).`, `$= ${st._v.a - st._v.b}$.`],
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Calcule (enchaînement) :',
      generer() {
        const n = [randIntNonZero(-9, 9), randIntNonZero(-9, 9), randIntNonZero(-9, 9), randIntNonZero(-9, 9)];
        const ops = [pick(['+', '-']), pick(['+', '-']), pick(['+', '-'])];
        const expr = `${n[0]} ${ops.map((o, i) => `${o} ${par(n[i + 1])}`).join(' ')}`;
        const termes = [n[0], ...n.slice(1).map((v, i) => (ops[i] === '+' ? v : -v))];
        return { enonce: `$${expr}$`, reponse: termes.reduce((s, t) => s + t, 0), validation: 'nombre', _v: { expr, termes } };
      },
      indices: ['Transforme chaque soustraction en addition de l\'opposé.', 'Regroupe les nombres positifs, puis les négatifs.', 'Additionne les deux totaux.'],
      correction_etapes(st) {
        const { expr, termes } = st._v, pos = termes.filter((t) => t > 0), neg = termes.filter((t) => t < 0);
        const sp = pos.reduce((s, t) => s + t, 0), sn = neg.reduce((s, t) => s + t, 0);
        return [`On n'a plus que des additions : $${termes.map(par).join(' + ')}$.`, `Positifs : $${pos.join(' + ') || '0'} = ${sp}$ ; négatifs : $${neg.map(par).join(' + ') || '0'} = ${sn}$.`, `$${sp} + ${par(sn)} = ${sp + sn}$.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Problème — températures (en °C) :',
      generer() {
        const t0 = randInt(-12, 5), d = randIntNonZero(-10, 12);
        return { enonce: `Le matin, il fait $${t0}$ °C. Dans la journée, la température ${d > 0 ? `monte de $${d}$` : `baisse de $${-d}$`} degrés. Quelle est la nouvelle température ?`, reponse: t0 + d, validation: 'nombre', _v: { t0, d } };
      },
      indices: ['Une hausse s\'ajoute, une baisse se retire.', 'Écris le calcul avec des relatifs.', 'Aide-toi d\'un thermomètre (droite graduée verticale).'],
      correction_etapes: (st) => [`Calcul : $${par(st._v.t0)} + ${par(st._v.d)}$.`, `Nouvelle température : $${st._v.t0 + st._v.d}$ °C.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Problème — écart (en mètres) :',
      generer() {
        const [lieu1, lieu2] = pick([['un plongeur', 'un goéland'], ['un sous-marin', 'un avion de tourisme'], ['une épave', 'le sommet d\'un phare']]);
        const bas = -randInt(5, 120), haut = randInt(8, 90);
        return { enonce: `L'altitude de ${lieu1} est $${bas}$ m et celle de ${lieu2} est $${haut}$ m. Quelle distance verticale les sépare ?`, reponse: haut - bas, validation: 'nombre', _v: { bas, haut } };
      },
      indices: ['L\'écart entre deux altitudes = la plus grande − la plus petite.', `Attention : soustraire un négatif revient à ajouter.`, 'Une distance est toujours positive.'],
      correction_etapes: (st) => [`Écart $= ${st._v.haut} - ${par(st._v.bas)} = ${st._v.haut} + ${-st._v.bas}$.`, `Écart $= ${st._v.haut - st._v.bas}$ m.`],
    },
    {
      id: 'e08', niveau: 3, type: 'ordonner_etapes', consigne: 'Range ces nombres dans l\'ordre croissant (du plus petit au plus grand) :',
      generer() {
        const s = new Set(); while (s.size < 5) s.add(randInt(-20, 20) + pick([0, 0, 0.5]));
        const tri = [...s].sort((x, y) => x - y);
        return { etapes: tri.map((v) => `$${String(v).replace('.', '{,}')}$`), _v: { tri } };
      },
      indices: ['Commence par les négatifs.', 'Entre deux négatifs, le plus petit est le plus éloigné de zéro.', 'Puis les positifs, du plus proche au plus éloigné de zéro.'],
      correction_detaillee: (st) => `<p>Ordre croissant : $${st._v.tri.map((v) => String(v).replace('.', '{,}')).join(' < ')}$.</p>`,
    },
    {
      id: 'e09', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9);
        const cas = pick(['somme', 'diff', 'oppose']);
        if (cas === 'somme') { const faux = Math.random() < 0.5; const prop = faux ? pick([-(a + b), Math.abs(a) + Math.abs(b), a - b].filter((x) => x !== a + b)) ?? a + b + 1 : a + b; return { enonce: `$${par(a)} + ${par(b)} = ${prop}$`, reponse: prop === a + b, _v: { cas, a, b, vrai: a + b } }; }
        if (cas === 'diff') { const faux = Math.random() < 0.5; const prop = faux ? pick([a + b, b - a].filter((x) => x !== a - b)) ?? a - b + 2 : a - b; return { enonce: `$${par(a)} - ${par(b)} = ${prop}$`, reponse: prop === a - b, _v: { cas, a, b, vrai: a - b } }; }
        return { enonce: `La somme de $${a}$ et de son opposé est égale à $0$.`, reponse: true, _v: { cas, a } };
      },
      indices: ['Refais le calcul toi-même.', 'Soustraire = ajouter l\'opposé.', 'Un nombre et son opposé se compensent.'],
      correction_etapes(st) {
        const { cas, a, b, vrai } = st._v;
        if (cas === 'oppose') return [`$${par(a)} + ${par(-a)} = 0$ : vrai.`];
        return [cas === 'somme' ? `$${par(a)} + ${par(b)} = ${vrai}$.` : `$${par(a)} - ${par(b)} = ${par(a)} + ${par(-b)} = ${vrai}$.`, `L'égalité proposée est ${st.reponse ? 'vraie' : 'fausse'}.`];
      },
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Quel est le plus petit nombre ?', choix: ['-8', '-3', '0', '2'], correct: 0, explication: '$-8$ est le plus à gauche sur la droite graduée.' },
    {
      type: 'saisie', question: 'Somme.',
      generer() { const a = -randInt(2, 12), b = randInt(2, 12); return { question: `Calcule $${a} + ${b}$.`, reponse: a + b, validation: 'nombre', explication: `Signes contraires : $${a} + ${b} = ${a + b}$.` }; },
    },
    {
      type: 'saisie', question: 'Différence.',
      generer() { const a = randInt(1, 9), b = -randInt(1, 9); return { question: `Calcule $${a} - (${b})$.`, reponse: a - b, validation: 'nombre', explication: `$${a} - (${b}) = ${a} + ${-b} = ${a - b}$.` }; },
    },
    { type: 'vrai_faux', question: '$-5 > -2$.', reponse: false, explication: '$-5$ est plus loin de zéro que $-2$ : $-5 < -2$.' },
    { type: 'qcm', question: 'L\'opposé de $-6$ est :', choix: ['6', '-6', '\\dfrac{1}{6}', '0'], correct: 0, explication: 'Même distance à zéro, signe contraire : $6$.' },
  ],
};
