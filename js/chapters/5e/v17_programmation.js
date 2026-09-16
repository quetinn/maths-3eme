// =====================================================================
//  v17_programmation.js — 5ᵉ : programmation par blocs (Scratch) —
//  séquence d'instructions, déplacements et coordonnées, boucle
//  « répéter », variables, première condition « si … alors … sinon ».
//  Figure interactive : un script qui dessine, et son tracé.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { scratch, traceLutin, repere, point, svg, seg } from '../commun.js';

const DRAPEAU = 'evt:quand ⚑ est cliqué';

/** Repère montrant la position d'un lutin. */
function figPosition(x, y) {
  const R = repere({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, W: 270 });
  const s = R.fond + seg([R.X(0), R.Y(0)], [R.X(x), R.Y(y)], { c: 'var(--accent)', w: 1.4, dash: true })
    + point([R.X(x), R.Y(y)], '🐱', 0, -12, 'var(--accent-ink)') + point([R.X(0), R.Y(0)], '', 0, 0, 'var(--muted)');
  return svg(R.W, R.H, s, 'position du lutin dans le repère');
}

function scriptInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>répéter <input type="range" min="3" max="8" value="4" data-n> <span class="fig-val" data-nv></span></label>
      <label>avancer de <input type="range" min="30" max="90" step="10" value="60" data-d> <span class="fig-val" data-dv></span></label>
    </div>
    <div class="fig-rangee"><div data-script></div><div data-trace style="flex:1 1 170px;max-width:200px"></div></div>
    <div class="fig-readout" data-out></div>`;
  function draw() {
    const n = +wrap.querySelector('[data-n]').value, d = +wrap.querySelector('[data-d]').value;
    const a = Math.round((360 / n) * 10) / 10;
    wrap.querySelector('[data-nv]').textContent = n; wrap.querySelector('[data-dv]').textContent = d;
    wrap.querySelector('[data-script]').innerHTML = scratch([
      DRAPEAU, "sty:stylo en position d'écriture",
      [`ctl:répéter [${n}] fois`, [`mvt:avancer de [${d}] pas`, `mvt:tourner ↻ de [${String(a).replace('.', ',')}] degrés`]],
    ]);
    wrap.querySelector('[data-trace]').innerHTML = traceLutin(Array.from({ length: n }, () => [['avancer', d], ['tourner', 360 / n]]).flat(), { W: 190, H: 190 });
    wrap.querySelector('[data-out]').innerHTML = `Le lutin trace <strong>${n}</strong> traits de <strong>${d}</strong> pas : il parcourt en tout ${n} × ${d} = <strong>${n * d}</strong> pas.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

const FIGURES = [[3, 'un triangle équilatéral'], [4, 'un carré'], [5, 'un pentagone régulier'], [6, 'un hexagone régulier']];

export default {
  id: 'v17',
  titre: 'Programmation par blocs',
  theme: 'algo', niveau: '5e',
  icone: '💻',

  intro:
    "Avec Scratch, on donne des instructions à un lutin en assemblant des blocs colorés : se déplacer, dessiner, " +
    "répéter, mémoriser un score, réagir à une condition. Lire un programme et prévoir ce qu'il fait, c'est " +
    "s'entraîner à raisonner pas à pas — et c'est très proche des mathématiques : coordonnées, angles, calculs.",

  cours: [
    {
      type: 'definition', titre: 'Un programme est une séquence',
      contenu: "Les blocs s'exécutent <strong>de haut en bas</strong>, un par un, à partir d'un bloc d'événement (« quand le drapeau vert est cliqué »). Changer l'ordre des blocs change le résultat.",
    },
    {
      type: 'definition', titre: 'Se déplacer : coordonnées et angles',
      contenu: "Le lutin est repéré par ses coordonnées $x$ (horizontal) et $y$ (vertical). « ajouter 10 à x » le déplace de $10$ vers la droite ; « ajouter $-20$ à y » le descend de $20$. « avancer de 50 pas » le fait avancer dans la direction où il regarde ; « tourner de $90$ degrés » change cette direction.",
    },
    {
      type: 'definition', titre: 'La boucle « répéter »',
      contenu: "Le bloc « répéter $n$ fois » exécute $n$ fois les blocs qu'il contient. Il évite de recopier les mêmes instructions et rend le programme plus court et plus lisible.",
    },
    {
      type: 'propriete', titre: 'Dessiner un polygone régulier',
      contenu: "Pour tracer un polygone régulier à $n$ côtés, on répète $n$ fois « avancer » puis « tourner ». Comme le lutin fait un tour complet, il tourne à chaque fois de $360° \\div n$ : $120°$ pour un triangle équilatéral, $90°$ pour un carré, $60°$ pour un hexagone.",
      formule: '\\text{angle} = \\dfrac{360°}{n}',
    },
    {
      type: 'definition', titre: 'Variables et conditions',
      contenu: "Une <strong>variable</strong> (score, compteur…) mémorise un nombre : « mettre score à 0 » fixe sa valeur, « ajouter 5 à score » l'augmente de $5$. Le bloc « si … alors … sinon … » exécute <strong>une seule</strong> des deux parties, selon que le test est vrai ou faux.",
    },
    { type: 'figure', titre: 'Un script et son dessin', contenu: "Change le nombre de répétitions et la longueur : le tracé et l'angle s'adaptent.", render: (host) => scriptInteractif(host) },
    {
      type: 'exemple', enonce: 'Que fait ce programme : « mettre score à 5 », « ajouter 3 à score », « ajouter 3 à score », « dire score » ?',
      solution_etapes: [
        'Au départ, score vaut $5$.',
        'Après le premier « ajouter 3 » : $5 + 3 = 8$.',
        'Après le second : $8 + 3 = 11$. Le lutin dit $11$.',
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Lire de haut en bas', explication: "Exécute les blocs dans l'ordre, sans en sauter." },
    { etape: 2, titre: 'Suivre les variables', explication: "Note la valeur de chaque variable après chaque bloc (comme un petit tableau)." },
    { etape: 3, titre: 'Dérouler les boucles', explication: "Une boucle « répéter $n$ fois » : refais le contenu $n$ fois, en gardant les valeurs obtenues." },
    { etape: 4, titre: 'Tester les conditions', explication: "Remplace la variable par sa valeur, regarde si le test est vrai, puis choisis la bonne branche." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'complete', consigne: 'Où se trouve le lutin à la fin ?',
      generer() {
        const x0 = randInt(-3, 3), y0 = randInt(-3, 3), dx = randInt(-4, 4), dy = randInt(-4, 4);
        return {
          enonce_complete: `Après ce programme, le lutin est en $x = $ {0} et $y = $ {1}.`,
          champs: [{ reponse: x0 + dx, validation: 'nombre' }, { reponse: y0 + dy, validation: 'nombre' }],
          visuel: (h) => { h.innerHTML = scratch([DRAPEAU, `mvt:aller à x: [${x0}] y: [${y0}]`, `var:ajouter [${dx}] à [x]`, `var:ajouter [${dy}] à [y]`]) + figPosition(x0, y0); },
          _v: { x0, y0, dx, dy },
        };
      },
      indices: ['Le lutin part de la position donnée par « aller à ».', '« ajouter » modifie une seule coordonnée.', 'Additionne (attention aux nombres négatifs).'],
      correction_etapes: (st) => {
        const { x0, y0, dx, dy } = st._v, p = (n) => (n < 0 ? `(${n})` : n);
        return [
          `Position de départ : $x = ${x0}$ et $y = ${y0}$.`,
          `$x = ${x0} + ${p(dx)} = ${x0 + dx}$.`,
          `$y = ${y0} + ${p(dy)} = ${y0 + dy}$.`,
        ];
      },
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Quelle figure le lutin dessine-t-il ?',
      generer() {
        const [n, nom] = pick(FIGURES), d = pick([50, 60, 80, 100]);
        return {
          enonce: scratch([DRAPEAU, "sty:stylo en position d'écriture", [`ctl:répéter [${n}] fois`, [`mvt:avancer de [${d}] pas`, `mvt:tourner ↻ de [${360 / n}] degrés`]]]),
          choix: FIGURES.map((f) => f[1]), correct: FIGURES.findIndex((f) => f[0] === n), _v: { n, nom, d },
        };
      },
      indices: ['Le nombre de répétitions donne le nombre de côtés.', 'Tous les côtés ont la même longueur.', "L'angle vaut $360°$ divisé par le nombre de côtés."],
      correction_etapes: (st) => [
        `La boucle se répète $${st._v.n}$ fois : le lutin trace $${st._v.n}$ côtés de $${st._v.d}$ pas.`,
        `Il tourne à chaque fois de $${360 / st._v.n}°$, soit $360 \\div ${st._v.n}$ : il revient à son point de départ.`,
        `C'est donc ${st._v.nom}.`,
      ],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Que dit le lutin à la fin ?',
      generer() {
        const a = randInt(0, 15), b = randInt(1, 9), c = randInt(1, 9);
        return {
          enonce: scratch([DRAPEAU, `var:mettre [score] à [${a}]`, `var:ajouter [${b}] à [score]`, `var:ajouter [${c}] à [score]`, 'app:dire [score]']),
          reponse: a + b + c, validation: 'nombre', _v: { a, b, c },
        };
      },
      indices: ['« mettre score à » fixe la valeur de départ.', '« ajouter » augmente la valeur actuelle.', 'Fais les additions dans l\'ordre.'],
      correction_etapes: (st) => [
        `score $= ${st._v.a}$ au départ.`,
        `score $= ${st._v.a} + ${st._v.b} = ${st._v.a + st._v.b}$.`,
        `score $= ${st._v.a + st._v.b} + ${st._v.c} = ${st._v.a + st._v.b + st._v.c}$. Le lutin dit $${st._v.a + st._v.b + st._v.c}$.`,
      ],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Que vaut la variable à la fin ?',
      generer() {
        const depart = randInt(0, 10), n = randInt(3, 8), k = randInt(2, 9);
        return {
          enonce: scratch([DRAPEAU, `var:mettre [compteur] à [${depart}]`, [`ctl:répéter [${n}] fois`, [`var:ajouter [${k}] à [compteur]`]], 'app:dire [compteur]']),
          reponse: depart + n * k, validation: 'nombre', _v: { depart, n, k },
        };
      },
      indices: ['La boucle répète la même addition.', 'On ajoute le même nombre à chaque tour.', 'Valeur finale $=$ départ $+$ (nombre de tours $\\times$ pas).'],
      correction_etapes: (st) => [
        `La boucle ajoute $${st._v.k}$, et cela $${st._v.n}$ fois : $${st._v.n} \\times ${st._v.k} = ${st._v.n * st._v.k}$.`,
        `compteur $= ${st._v.depart} + ${st._v.n * st._v.k} = ${st._v.depart + st._v.n * st._v.k}$.`,
      ],
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Longueur totale tracée (en pas) :',
      generer() {
        const [n] = pick(FIGURES), d = pick([40, 50, 60, 75, 90]);
        return {
          enonce: `Combien de pas le lutin parcourt-il en tout ?${scratch([DRAPEAU, "sty:stylo en position d'écriture", [`ctl:répéter [${n}] fois`, [`mvt:avancer de [${d}] pas`, `mvt:tourner ↻ de [${360 / n}] degrés`]]])}`,
          reponse: n * d, validation: 'nombre', _v: { n, d },
        };
      },
      indices: ['Compte le nombre de fois où le bloc « avancer » est exécuté.', 'Chaque trait a la même longueur.', 'Multiplie le nombre de traits par la longueur.'],
      correction_etapes: (st) => [
        `Le bloc « avancer » est exécuté $${st._v.n}$ fois (une fois par tour de boucle).`,
        `Longueur totale : $${st._v.n} \\times ${st._v.d} = ${st._v.n * st._v.d}$ pas.`,
      ],
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Que dit le lutin ?',
      generer() {
        const seuil = randInt(5, 15), score = randInt(1, 25);
        return {
          enonce: scratch([DRAPEAU, `var:mettre [score] à [${score}]`, [`ctl:si <[score] > [${seuil}]> alors`, ['app:dire [Bravo !]'], 'sinon', ['app:dire [Essaie encore]']]]),
          choix: ['Bravo !', 'Essaie encore', 'les deux'], correct: score > seuil ? 0 : 1, ordre_fixe: true, _v: { seuil, score },
        };
      },
      indices: ['Remplace la variable par sa valeur dans le test.', 'Le test est-il vrai ou faux ?', "Une seule branche s'exécute."],
      correction_etapes: (st) => [
        `Le test est : $${st._v.score} > ${st._v.seuil}$ ?`,
        `${st._v.score > st._v.seuil ? `$${st._v.score} > ${st._v.seuil}$ : le test est vrai` : `$${st._v.score} \\le ${st._v.seuil}$ : le test est faux`}.`,
        `Le lutin dit « ${st._v.score > st._v.seuil ? 'Bravo !' : 'Essaie encore'} ».`,
      ],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: "Complète le script — angle de rotation (en degrés) :",
      generer() {
        const [n, nom] = pick(FIGURES.concat([[8, 'un octogone régulier'], [10, 'un décagone régulier'], [12, 'un dodécagone régulier']]));
        return {
          enonce: `Pour que le lutin dessine ${nom}, de combien de degrés doit-il tourner à chaque fois ?${scratch([DRAPEAU, "sty:stylo en position d'écriture", [`ctl:répéter [${n}] fois`, ['mvt:avancer de [60] pas', 'mvt:tourner ↻ de [ ? ] degrés']]])}`,
          reponse: 360 / n, validation: 'nombre', _v: { n, nom },
        };
      },
      indices: ['À la fin, le lutin a fait un tour complet.', 'Un tour complet mesure $360°$.', 'Divise $360$ par le nombre de côtés.'],
      correction_etapes: (st) => [
        `${st._v.nom.charAt(0).toUpperCase()}${st._v.nom.slice(1)} a $${st._v.n}$ côtés : le lutin tourne $${st._v.n}$ fois.`,
        `$360 \\div ${st._v.n} = ${360 / st._v.n}$ : il tourne de $${360 / st._v.n}°$ à chaque sommet.`,
      ],
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Que dit le lutin à la fin ?',
      generer() {
        const depart = randInt(1, 5), n = randInt(2, 5), k = pick([2, 3]);
        return {
          enonce: scratch([DRAPEAU, `var:mettre [n] à [${depart}]`, [`ctl:répéter [${n}] fois`, [`var:mettre [n] à [n × ${k}]`]], 'app:dire [n]']),
          reponse: depart * k ** n, validation: 'nombre', _v: { depart, n, k },
        };
      },
      indices: ['Ici on multiplie à chaque tour (et non on ajoute).', 'Écris les valeurs successives.', `Après $n$ tours : départ $\\times k \\times k \\dots$`],
      correction_etapes: (st) => {
        const { depart, n, k } = st._v; const vals = [depart];
        for (let i = 0; i < n; i++) vals.push(vals[vals.length - 1] * k);
        return [
          `Valeurs successives : $${vals.join(' \\to ')}$.`,
          `Le lutin dit $${vals[vals.length - 1]}$ (c'est $${depart} \\times ${k}^{${n}}$).`,
        ];
      },
    },
    {
      id: 'e09', niveau: 1, type: 'ordonner_etapes', consigne: "Remets les blocs dans l'ordre pour dessiner un carré :",
      generer() {
        const d = pick([50, 60, 80, 100]);
        return {
          etapes: [
            '« quand le drapeau vert est cliqué »',
            '« effacer tout »',
            "« stylo en position d'écriture »",
            '« répéter 4 fois »',
            `« avancer de ${d} pas » (dans la boucle)`,
            '« tourner ↻ de 90 degrés » (dans la boucle)',
          ],
        };
      },
      indices: ['Un script commence par un bloc d\'événement.', 'On prépare le stylo avant de dessiner.', 'Dans la boucle : avancer puis tourner.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol><p>Le lutin tourne de $90°$ car $360 \\div 4 = 90$.</p>`,
    },
    {
      id: 'e10', niveau: 2, type: 'complete', consigne: 'Complète le suivi de la variable :',
      generer() {
        const a = randInt(2, 12), b = randInt(1, 9), c = randInt(2, 4);
        return {
          enonce_complete: `« mettre x à ${a} », puis « ajouter ${b} à x » : $x = $ {0}. Puis « mettre x à x × ${c} » : $x = $ {1}.`,
          champs: [{ reponse: a + b, validation: 'nombre' }, { reponse: (a + b) * c, validation: 'nombre' }], _v: { a, b, c },
        };
      },
      indices: ['On suit la variable ligne par ligne.', '« ajouter » puis « mettre à … × … ».', 'Utilise le résultat de la ligne précédente.'],
      correction_etapes: (st) => [`$${st._v.a} + ${st._v.b} = ${st._v.a + st._v.b}$.`, `$${st._v.a + st._v.b} \\times ${st._v.c} = ${(st._v.a + st._v.b) * st._v.c}$.`],
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Pour dessiner un carré, le lutin tourne à chaque sommet de :', choix: ['90°', '45°', '60°', '360°'], correct: 0, explication: '$360 \\div 4 = 90°$.' },
    {
      type: 'saisie', question: 'Variable.',
      generer() { const a = randInt(1, 10), b = randInt(1, 9), n = randInt(2, 5); return { question: `« mettre score à ${a} » puis « répéter ${n} fois : ajouter ${b} à score ». Que vaut score ?`, reponse: a + n * b, validation: 'nombre', explication: `$${a} + ${n} \\times ${b} = ${a + n * b}$.` }; },
    },
    { type: 'vrai_faux', question: 'Dans un bloc « si … alors … sinon … », les deux branches sont exécutées.', reponse: false, explication: "Une seule branche s'exécute, selon le test." },
    { type: 'saisie', question: 'Pour dessiner un hexagone régulier, de combien de degrés le lutin tourne-t-il à chaque sommet ?', reponse: 60, validation: 'nombre', explication: '$360 \\div 6 = 60°$.' },
    { type: 'qcm', question: '« ajouter -5 à x » :', choix: ['diminue x de 5', 'augmente x de 5', 'met x à -5', 'ne change rien'], correct: 0, explication: 'Ajouter un nombre négatif revient à soustraire.' },
  ],
};
