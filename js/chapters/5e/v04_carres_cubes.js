// =====================================================================
//  v04_carres_cubes.js — 5ᵉ : carrés et cubes d'un nombre, carrés
//  parfaits, priorités avec les puissances, aire du carré et volume du
//  cube. Figure : un carré et un cube de côté réglable.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, svg, poly, txt } from '../commun.js';

function carreCube(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>côté <input type="range" min="1" max="6" value="3" data-n> <span class="fig-val" data-nv></span></label></div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const n = +wrap.querySelector('[data-n]').value, u = 22;
    wrap.querySelector('[data-nv]').textContent = n;
    let s = '';
    // Carré n × n (petits carreaux).
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += `<rect x="${12 + i * u}" y="${20 + j * u}" width="${u}" height="${u}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1"/>`;
    s += txt(12 + (n * u) / 2, 16, `${n} × ${n} = ${n * n}`, { size: 12, c: 'var(--accent-ink)' });
    // Cube n × n × n en perspective (faces avant, dessus, côté).
    const x0 = 180, y0 = 50 + (6 - n) * 4, c = 16, k = 0.5;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      s += poly([[x0 + i * c, y0 + c * n - j * c], [x0 + (i + 1) * c, y0 + c * n - j * c], [x0 + (i + 1) * c, y0 + c * n - (j + 1) * c], [x0 + i * c, y0 + c * n - (j + 1) * c]], { c: 'var(--t-geometrie)', w: 1, fill: 'color-mix(in srgb, var(--t-geometrie) 22%, var(--surface))' });
      s += poly([[x0 + i * c + j * c * k, y0 - j * c * k], [x0 + (i + 1) * c + j * c * k, y0 - j * c * k], [x0 + (i + 1) * c + (j + 1) * c * k, y0 - (j + 1) * c * k], [x0 + i * c + (j + 1) * c * k, y0 - (j + 1) * c * k]], { c: 'var(--t-geometrie)', w: 1, fill: 'color-mix(in srgb, var(--t-geometrie) 12%, var(--surface))' });
      s += poly([[x0 + n * c + i * c * k, y0 + c * n - j * c - i * c * k], [x0 + n * c + (i + 1) * c * k, y0 + c * n - j * c - (i + 1) * c * k], [x0 + n * c + (i + 1) * c * k, y0 + c * n - (j + 1) * c - (i + 1) * c * k], [x0 + n * c + i * c * k, y0 + c * n - (j + 1) * c - i * c * k]], { c: 'var(--t-geometrie)', w: 1, fill: 'color-mix(in srgb, var(--t-geometrie) 35%, var(--surface))' });
    }
    s += txt(x0 + (n * c) / 2 + 20, 196, `${n} × ${n} × ${n} = ${n ** 3}`, { size: 12, c: 'var(--t-geometrie)' });
    wrap.querySelector('[data-svg]').innerHTML = svg(320, 206, s, 'carré et cube de petits cubes', 'fig-large');
    wrap.querySelector('[data-out]').innerHTML = `${n}² = <strong>${n * n}</strong> petits carreaux &nbsp;·&nbsp; ${n}³ = <strong>${n ** 3}</strong> petits cubes`;
  }
  wrap.querySelector('[data-n]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'v04',
  titre: 'Carrés et cubes',
  theme: 'nombres_calculs', niveau: '5e',
  icone: '²',

  intro:
    "Pour calculer l'aire d'un carré, on multiplie le côté par lui-même : c'est le <strong>carré</strong> du côté. " +
    "Pour le volume d'un cube, on multiplie trois fois : c'est le <strong>cube</strong>. Ces écritures abrégées " +
    "($5^2$, $2^3$) préparent les puissances de 4ᵉ, le théorème de Pythagore et le calcul littéral.",

  cours: [
    {
      type: 'definition', titre: 'Carré d\'un nombre',
      contenu: "Le carré d'un nombre $a$ est le produit de ce nombre par lui-même. On le note $a^2$ et on lit « $a$ au carré ».",
      formule: 'a^2 = a \\times a \\qquad 7^2 = 7 \\times 7 = 49',
    },
    {
      type: 'definition', titre: 'Cube d\'un nombre',
      contenu: "Le cube d'un nombre $a$ est le produit de trois facteurs égaux à $a$. On le note $a^3$ et on lit « $a$ au cube ».",
      formule: 'a^3 = a \\times a \\times a \\qquad 2^3 = 2 \\times 2 \\times 2 = 8',
    },
    {
      type: 'propriete', titre: 'Attention aux erreurs classiques',
      contenu: "$5^2 = 5 \\times 5 = 25$ et non $5 \\times 2 = 10$. Les carrés sont prioritaires sur les multiplications et les additions : $3 + 2^2 = 3 + 4 = 7$ et $2 \\times 3^2 = 2 \\times 9 = 18$. Les <strong>carrés parfaits</strong> à connaître : $1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144$.",
    },
    {
      type: 'propriete', titre: 'Aire d\'un carré, volume d\'un cube',
      contenu: "Un carré de côté $c$ a une aire de $c^2$ ; un cube d'arête $c$ a un volume de $c^3$. Si $c$ est en cm, l'aire est en cm² et le volume en cm³.",
      formule: '\\mathcal{A} = c^2 \\qquad V = c^3',
    },
    { type: 'figure', titre: 'Carrés et cubes en images', contenu: "Change le côté : on compte les carreaux du carré ($n^2$) et les petits cubes du grand cube ($n^3$).", render: (host) => carreCube(host) },
    {
      type: 'exemple', enonce: 'Calculer $A = 4 + 3 \\times 2^3$.',
      solution_etapes: ["La puissance d'abord : $2^3 = 2 \\times 2 \\times 2 = 8$.", "Puis la multiplication : $3 \\times 8 = 24$.", "Enfin l'addition : $A = 4 + 24 = 28$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Écrire le produit', explication: "Remplace $a^2$ par $a \\times a$ et $a^3$ par $a \\times a \\times a$." },
    { etape: 2, titre: 'Calculer les puissances d\'abord', explication: "Priorités : parenthèses, puis carrés et cubes, puis × et ÷, puis + et −." },
    { etape: 3, titre: 'Utiliser les carrés parfaits', explication: "Pour trouver le nombre dont le carré vaut $49$, pense à la table : $7 \\times 7 = 49$." },
    { etape: 4, titre: 'Soigner les unités', explication: "Aire en unités « carrées » (cm²), volume en unités « cubes » (cm³)." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule le carré :',
      generer() { const n = randInt(2, 15); return { enonce: `$${n}^2$`, reponse: n * n, validation: 'nombre', _v: { n } }; },
      indices: ['$a^2 = a \\times a$.', `Ce n'est pas $a \\times 2$.`, 'Utilise tes tables de multiplication.'],
      correction_etapes: (st) => [`$${st._v.n}^2 = ${st._v.n} \\times ${st._v.n} = ${st._v.n ** 2}$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule le cube :',
      generer() { const n = randInt(1, 6) + (Math.random() < 0.15 ? 4 : 0); return { enonce: `$${n}^3$`, reponse: n ** 3, validation: 'nombre', _v: { n } }; },
      indices: ['$a^3 = a \\times a \\times a$.', 'Calcule d\'abord $a \\times a$.', 'Multiplie encore par $a$.'],
      correction_etapes: (st) => [`$${st._v.n}^3 = ${st._v.n} \\times ${st._v.n} \\times ${st._v.n}$.`, `$= ${st._v.n ** 2} \\times ${st._v.n} = ${st._v.n ** 3}$.`],
    },
    {
      id: 'e03', niveau: 1, type: 'qcm', consigne: 'Choisis la bonne écriture :',
      generer() {
        const a = randInt(4, 9), cube = Math.random() < 0.5, e = cube ? 3 : 2;
        const choix = cube ? [`${a} \\times ${a} \\times ${a}`, `${a} \\times 3`, `${a} + ${a} + ${a}`, `3 \\times 3 \\times 3`] : [`${a} \\times ${a}`, `${a} \\times 2`, `${a} + ${a}`, `2 \\times 2`];
        return { enonce: `$${a}^${e}$ est égal à :`, choix, correct: 0, _v: { a, e } };
      },
      indices: ['L\'exposant indique le nombre de facteurs.', 'Les facteurs sont tous égaux au nombre en bas.', 'On multiplie, on n\'additionne pas.'],
      correction_etapes: (st) => [`$${st._v.a}^${st._v.e}$ est le produit de $${st._v.e}$ facteurs égaux à $${st._v.a}$ : $${Array(st._v.e).fill(st._v.a).join(' \\times ')} = ${st._v.a ** st._v.e}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule en respectant les priorités :',
      generer() {
        const a = randInt(1, 20), b = randInt(2, 5), n = randInt(2, 6), v = pick(['plus', 'fois', 'moins']);
        if (v === 'plus') return { enonce: `$${a} + ${b} \\times ${n}^2$`, reponse: a + b * n * n, validation: 'nombre', _v: { a, b, n, v } };
        if (v === 'fois') return { enonce: `$(${b} + ${n})^2$`, reponse: (b + n) ** 2, validation: 'nombre', _v: { a, b, n, v } };
        return { enonce: `$${n}^3 - ${b}^2$`, reponse: n ** 3 - b * b, validation: 'nombre', _v: { a, b, n, v } };
      },
      indices: ['Les parenthèses d\'abord, puis les carrés et cubes.', 'Ensuite les multiplications.', 'Enfin les additions et soustractions.'],
      correction_etapes(st) {
        const { a, b, n, v } = st._v;
        if (v === 'plus') return [`Le carré d'abord : $${n}^2 = ${n * n}$.`, `Puis $${b} \\times ${n * n} = ${b * n * n}$.`, `Enfin $${a} + ${b * n * n} = ${a + b * n * n}$.`];
        if (v === 'fois') return [`Parenthèses : $${b} + ${n} = ${b + n}$.`, `$${b + n}^2 = ${b + n} \\times ${b + n} = ${(b + n) ** 2}$.`];
        return [`$${n}^3 = ${n ** 3}$ et $${b}^2 = ${b * b}$.`, `$${n ** 3} - ${b * b} = ${n ** 3 - b * b}$.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Problème — aire ou volume :',
      generer() {
        const c = randInt(2, 12), cube = Math.random() < 0.5 && c <= 10;
        return cube
          ? { enonce: `Une boîte a la forme d'un cube d'arête $${c}$ cm. Quel est son volume (en cm³) ?`, reponse: c ** 3, validation: 'nombre', _v: { c, cube } }
          : { enonce: `Un carré a pour côté $${c}$ m. Quelle est son aire (en m²) ?`, reponse: c * c, validation: 'nombre', _v: { c, cube } };
      },
      indices: ['Aire d\'un carré : côté au carré.', 'Volume d\'un cube : arête au cube.', 'Pense aux unités : m², cm³.'],
      correction_etapes: (st) => (st._v.cube ? [`$V = c^3 = ${st._v.c}^3 = ${st._v.c} \\times ${st._v.c} \\times ${st._v.c}$.`, `$V = ${st._v.c ** 3}$ cm³.`] : [`$\\mathcal{A} = c^2 = ${st._v.c}^2 = ${st._v.c} \\times ${st._v.c}$.`, `$\\mathcal{A} = ${st._v.c ** 2}$ m².`]),
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Retrouve le nombre :',
      generer() {
        const n = randInt(2, 12), cube = Math.random() < 0.3 && n <= 6;
        return cube
          ? { enonce: `Quel nombre a pour cube $${n ** 3}$ ?`, reponse: n, validation: 'nombre', _v: { n, cube } }
          : { enonce: `Un carré a une aire de $${n * n}$ cm². Quelle est la longueur de son côté (en cm) ?`, reponse: n, validation: 'nombre', _v: { n, cube } };
      },
      indices: ['Cherche un nombre qui, multiplié par lui-même, donne le résultat.', 'Utilise la liste des carrés parfaits (ou des cubes).', 'Vérifie en recalculant.'],
      correction_etapes: (st) => (st._v.cube ? [`$${st._v.n} \\times ${st._v.n} \\times ${st._v.n} = ${st._v.n ** 3}$.`, `Le nombre cherché est $${st._v.n}$.`] : [`On cherche $c$ tel que $c \\times c = ${st._v.n ** 2}$.`, `$${st._v.n} \\times ${st._v.n} = ${st._v.n ** 2}$ : le côté mesure $${st._v.n}$ cm.`]),
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Calcule (avec des décimaux) :',
      generer() {
        const a = pick([0.1, 0.2, 0.3, 0.5, 1.1, 1.2, 1.5, 2.5, 0.4]), cube = Math.random() < 0.35 && a < 1;
        return cube
          ? { enonce: `$${tex(a)}^3$`, reponse: Math.round(a ** 3 * 1e6) / 1e6, validation: 'nombre', _v: { a, cube } }
          : { enonce: `$${tex(a)}^2$`, reponse: Math.round(a * a * 1e6) / 1e6, validation: 'nombre', _v: { a, cube } };
      },
      indices: ['Même définition : $a^2 = a \\times a$.', 'Calcule sans la virgule, puis place-la.', `Nombre de chiffres après la virgule du résultat = total de ceux des facteurs.`],
      correction_etapes(st) {
        const { a, cube } = st._v;
        if (cube) return [`$${tex(a)}^3 = ${tex(a)} \\times ${tex(a)} \\times ${tex(a)}$.`, `$= ${tex(a * a)} \\times ${tex(a)} = ${tex(a ** 3)}$.`];
        return [`$${tex(a)}^2 = ${tex(a)} \\times ${tex(a)} = ${tex(a * a)}$.`, a < 1 ? 'Remarque : le carré d\'un nombre compris entre 0 et 1 est plus petit que ce nombre.' : `Le résultat a deux fois plus de chiffres après la virgule que $${tex(a)}$.`];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const a = randInt(2, 6), b = randInt(2, 6);
        const [enonce, rep, why] = pick([
          [`$${a}^2 = ${2 * a}$`, false, `$${a}^2 = ${a} \\times ${a} = ${a * a}$ (et non $${a} \\times 2$).`],
          [`$(${a} + ${b})^2 = ${a}^2 + ${b}^2$`, false, `$(${a} + ${b})^2 = ${a + b}^2 = ${(a + b) ** 2}$ alors que $${a}^2 + ${b}^2 = ${a * a + b * b}$.`],
          [`$${a}^3 = ${a} \\times ${a} \\times ${a}$`, true, `C'est la définition du cube.`],
          [`$3^2 + 4^2 = 5^2$`, true, `$9 + 16 = 25$ et $5^2 = 25$.`],
          [`$${a}^2 \\times ${b}^2 = ${a * b}^2$`, true, `$${a * a} \\times ${b * b} = ${a * a * b * b}$ et $${a * b}^2 = ${(a * b) ** 2}$.`],
          [`$10^3 = 30$`, false, `$10^3 = 10 \\times 10 \\times 10 = 1\\,000$.`],
        ]);
        return { enonce, reponse: rep, _v: { why } };
      },
      indices: ['Remplace chaque carré ou cube par un produit.', 'Calcule chaque membre séparément.', 'Compare les deux résultats.'],
      correction_etapes: (st) => [st._v.why, `L'égalité est ${st.reponse ? 'vraie' : 'fausse'}.`],
    },
    {
      id: 'e09', niveau: 1, type: 'complete', consigne: 'Complète le calcul :',
      generer() { const n = randInt(2, 9); return { enonce_complete: `$${n}^3 = ${n} \\times ${n} \\times ${n} = $ {0} $\\times ${n} = $ {1}`, champs: [{ reponse: n * n, validation: 'nombre' }, { reponse: n ** 3, validation: 'nombre' }], _v: { n } }; },
      indices: ['Calcule d\'abord $a \\times a$.', 'Puis multiplie le résultat par $a$.', 'Vérifie avec tes tables.'],
      correction_etapes: (st) => [`$${st._v.n} \\times ${st._v.n} = ${st._v.n ** 2}$.`, `$${st._v.n ** 2} \\times ${st._v.n} = ${st._v.n ** 3}$.`],
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets les étapes du calcul dans l\'ordre :',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 4), n = randInt(2, 5);
        return { etapes: [`$${a} + ${b} \\times ${n}^2$`, `$= ${a} + ${b} \\times ${n * n}$`, `$= ${a} + ${b * n * n}$`, `$= ${a + b * n * n}$`] };
      },
      indices: ['On part de l\'expression.', 'Le carré est calculé en premier.', 'Puis la multiplication, puis l\'addition.'],
      correction_detaillee: (st) => `<p>Carré → multiplication → addition :</p><ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: '$6^2 = $', choix: ['36', '12', '8', '66'], correct: 0, explication: '$6 \\times 6 = 36$.' },
    { type: 'saisie', question: 'Calcule $4^3$.', reponse: 64, validation: 'nombre', explication: '$4 \\times 4 \\times 4 = 64$.' },
    {
      type: 'saisie', question: 'Priorités.',
      generer() { const a = randInt(1, 9), n = randInt(2, 5); return { question: `Calcule $${a} + ${n}^2$.`, reponse: a + n * n, validation: 'nombre', explication: `$${a} + ${n * n} = ${a + n * n}$.` }; },
    },
    { type: 'vrai_faux', question: 'Un carré d\'aire $81$ cm² a un côté de $9$ cm.', reponse: true, explication: '$9 \\times 9 = 81$.' },
    { type: 'qcm', question: 'Le volume d\'un cube d\'arête $5$ cm est :', choix: ['125 cm³', '25 cm³', '15 cm³', '75 cm³'], correct: 0, explication: '$5^3 = 125$ cm³.' },
  ],
};
