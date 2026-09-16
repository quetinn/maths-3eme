// =====================================================================
//  r18_scratch.js — 4ᵉ : algorithmique avec Scratch — variables,
//  boucles (répéter, répéter jusqu'à, imbriquées), conditions, stylo et
//  polygones réguliers, programmes de calcul.
//  Figure interactive : un script trace un polygone régulier à n côtés.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { scratch, traceLutin } from '../commun.js';

const DRAPEAU = 'evt:quand ⚑ est cliqué';

function polygoneInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>nombre de côtés <input type="range" min="3" max="10" value="5" data-n> <span class="fig-val" data-nv></span></label></div>
    <div class="fig-rangee"><div data-script></div><div data-trace style="flex:1 1 180px;max-width:220px"></div></div>
    <div class="fig-readout" data-out></div>`;
  function draw() {
    const n = +wrap.querySelector('[data-n]').value, a = Math.round((360 / n) * 100) / 100;
    wrap.querySelector('[data-nv]').textContent = n;
    wrap.querySelector('[data-script]').innerHTML = scratch([DRAPEAU, 'sty:stylo en position d\'écriture', [`ctl:répéter [${n}] fois`, ['mvt:avancer de [60] pas', `mvt:tourner ↻ de [${String(a).replace('.', ',')}] degrés`]]]);
    wrap.querySelector('[data-trace]').innerHTML = traceLutin(Array.from({ length: n }, () => [['avancer', 60], ['tourner', 360 / n]]).flat());
    wrap.querySelector('[data-out]').innerHTML = `Pour revenir au départ, le lutin fait un tour complet en ${n} fois : il tourne de <strong>360 ÷ ${n} = ${String(a).replace('.', ',')}°</strong> à chaque sommet.`;
  }
  wrap.querySelector('[data-n]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

const POLYGONES = [[3, 'triangle équilatéral'], [4, 'carré'], [5, 'pentagone régulier'], [6, 'hexagone régulier'], [8, 'octogone régulier']];

export default {
  id: 'r18',
  titre: 'Algorithmique (Scratch)',
  theme: 'algo', niveau: '4e',
  icone: '💻',

  intro:
    "Programmer, c'est donner à une machine des instructions précises. Avec Scratch, on assemble des blocs : " +
    "des <strong>variables</strong> pour mémoriser, des <strong>boucles</strong> pour répéter, des " +
    "<strong>conditions</strong> pour choisir. On apprend à lire un script, à prévoir ce qu'il affiche ou dessine, " +
    "et à le corriger. Au brevet, un exercice entier porte souvent sur un programme Scratch.",

  cours: [
    {
      type: 'definition', titre: 'Script, événement, séquence',
      contenu: "Un <strong>script</strong> est une suite de blocs exécutés de haut en bas, l'un après l'autre. Il démarre sur un <strong>événement</strong> (par exemple « quand le drapeau vert est cliqué »).",
    },
    {
      type: 'definition', titre: 'Variables',
      contenu: "Une <strong>variable</strong> est une case mémoire qui porte un nom et contient une valeur. « mettre x à 5 » remplace la valeur ; « ajouter 3 à x » augmente la valeur de 3. La variable <em>réponse</em> contient ce que l'utilisateur a tapé après « demander ».",
    },
    {
      type: 'definition', titre: 'Boucles',
      contenu: "« répéter 10 fois » exécute les blocs qu'il contient 10 fois. « répéter jusqu'à &lt;condition&gt; » recommence tant que la condition est fausse (le test est fait avant chaque tour). Une boucle peut en contenir une autre : les blocs intérieurs sont alors exécutés (tours extérieurs) × (tours intérieurs) fois.",
    },
    {
      type: 'definition', titre: 'Conditions',
      contenu: "« si &lt;condition&gt; alors … sinon … » n'exécute qu'<strong>une seule</strong> des deux branches, selon que la condition est vraie ou fausse. On peut combiner des conditions avec « et », « ou », « non ».",
    },
    {
      type: 'propriete', titre: 'Tracer un polygone régulier',
      contenu: "Pour tracer un polygone régulier à $n$ côtés, on répète $n$ fois « avancer » puis « tourner ». Le lutin fait un tour complet au total : à chaque sommet, il tourne de $360° \\div n$ (c'est l'angle extérieur, pas l'angle du polygone).",
      formule: '\\text{angle de rotation} = \\dfrac{360°}{n}',
    },
    { type: 'figure', titre: 'Un script qui trace un polygone', contenu: "Change le nombre de côtés : le script et le dessin se mettent à jour.", render: (host) => polygoneInteractif(host) },
    {
      type: 'exemple', enonce: 'On exécute : « mettre x à 4 », « répéter 3 fois : mettre x à x × 2 », « dire x ». Qu\'affiche le lutin ?',
      solution_etapes: ["Au départ, $x = 4$.", "Tour 1 : $x = 8$ ; tour 2 : $x = 16$ ; tour 3 : $x = 32$.", "Le lutin dit $32$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Faire un tableau de suivi', explication: "Une colonne par variable, une ligne par instruction exécutée (ou par tour de boucle)." },
    { etape: 2, titre: 'Exécuter bloc par bloc', explication: "Dans l'ordre, sans sauter de ligne. Dans une boucle, refais tout le contenu à chaque tour." },
    { etape: 3, titre: 'Évaluer les conditions', explication: "Remplace les variables par leur valeur <strong>au moment du test</strong>, puis choisis la branche." },
    { etape: 4, titre: 'Pour un tracé', explication: "Suis le lutin : longueur de chaque trait et angle de chaque rotation ; angle $= 360° \\div n$ pour un polygone régulier." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Que dit le lutin à la fin ?',
      generer() {
        const a = randInt(2, 9), b = randInt(2, 9), c = pick([2, 3, 4]);
        return {
          enonce: scratch([DRAPEAU, `var:mettre [x] à [${a}]`, `var:ajouter [${b}] à [x]`, `var:mettre [x] à [x × ${c}]`, 'app:dire [x]']),
          reponse: (a + b) * c, validation: 'nombre', _v: { a, b, c },
        };
      },
      indices: ['Suis la valeur de $x$ ligne par ligne.', '« ajouter 3 à x » : $x$ augmente de 3.', '« mettre x à x × 2 » : on remplace $x$ par le double.'],
      correction_etapes: (st) => [`« mettre x à ${st._v.a} » : $x = ${st._v.a}$.`, `« ajouter ${st._v.b} à x » : $x = ${st._v.a} + ${st._v.b} = ${st._v.a + st._v.b}$.`, `« mettre x à x × ${st._v.c} » : $x = ${st._v.a + st._v.b} \\times ${st._v.c} = ${(st._v.a + st._v.b) * st._v.c}$. Le lutin dit $${(st._v.a + st._v.b) * st._v.c}$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Quelle figure ce script dessine-t-il ?',
      generer() {
        const [n, nom] = pick(POLYGONES.slice(0, 4)), d = pick([50, 80, 100]);
        return {
          enonce: scratch([DRAPEAU, 'sty:stylo en position d\'écriture', [`ctl:répéter [${n}] fois`, [`mvt:avancer de [${d}] pas`, `mvt:tourner ↻ de [${360 / n}] degrés`]]]),
          choix: POLYGONES.slice(0, 4).map((p) => p[1]), correct: POLYGONES.findIndex((p) => p[0] === n), _v: { n, nom, d },
        };
      },
      indices: ['Compte le nombre de répétitions : c\'est le nombre de côtés.', 'Tous les côtés ont la même longueur.', 'L\'angle vaut $360° \\div$ nombre de côtés.'],
      correction_etapes: (st) => [`La boucle se répète $${st._v.n}$ fois : le lutin trace $${st._v.n}$ côtés de $${st._v.d}$ pas.`, `Il tourne de $${360 / st._v.n}° = 360° \\div ${st._v.n}$ à chaque fois : il revient à son point de départ.`, `C'est un ${st._v.nom}.`],
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Complète le suivi de la variable :',
      generer() {
        const a = randInt(3, 12), b = randInt(2, 8), c = randInt(2, 5);
        return {
          enonce_complete: `« mettre score à ${a} », puis « ajouter ${-b} à score » : score $=$ {0}. Puis « mettre score à score × ${c} » : score $=$ {1}.`,
          champs: [{ reponse: a - b, validation: 'nombre' }, { reponse: (a - b) * c, validation: 'nombre' }], _v: { a, b, c },
        };
      },
      indices: ['« ajouter −2 à score » enlève 2.', 'Chaque bloc part de la valeur précédente.', 'Fais les calculs dans l\'ordre.'],
      correction_etapes: (st) => [`$${st._v.a} + (${-st._v.b}) = ${st._v.a - st._v.b}$.`, `$${st._v.a - st._v.b} \\times ${st._v.c} = ${(st._v.a - st._v.b) * st._v.c}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Complète le script (angle en degrés) :',
      generer() {
        const [n, nom] = pick(POLYGONES);
        return {
          enonce: `Ce script doit tracer un ${nom}. De combien de degrés le lutin doit-il tourner ?` + scratch([DRAPEAU, 'sty:stylo en position d\'écriture', [`ctl:répéter [${n}] fois`, ['mvt:avancer de [60] pas', 'mvt:tourner ↻ de [ ? ] degrés']]]),
          reponse: 360 / n, validation: 'nombre', _v: { n, nom },
        };
      },
      indices: ['Après tous les côtés, le lutin a fait un tour complet.', 'Un tour complet : $360°$.', `Angle $= 360° \\div$ nombre de côtés.`],
      correction_etapes: (st) => [`Le lutin tourne $${st._v.n}$ fois et doit faire un tour complet ($360°$).`, `$360 \\div ${st._v.n} = ${360 / st._v.n}$ : il tourne de $${360 / st._v.n}°$.`, `Attention : ce n'est pas l'angle intérieur du ${st._v.nom}, c'est l'angle dont le lutin change de direction.`],
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Que dit le lutin à la fin ?',
      generer() {
        const k = randInt(3, 7), pas = pick([1, 2, 3]);
        let s = 0, n = 1; for (let i = 0; i < k; i++) { s += n; n += pas; }
        return {
          enonce: scratch([DRAPEAU, 'var:mettre [somme] à [0]', 'var:mettre [n] à [1]', [`ctl:répéter [${k}] fois`, ['var:ajouter [n] à [somme]', `var:ajouter [${pas}] à [n]`]], 'app:dire [somme]']),
          reponse: s, validation: 'nombre', _v: { k, pas },
        };
      },
      indices: ['Fais un tableau : tour, valeur de $n$, valeur de somme.', 'On ajoute $n$ à somme AVANT d\'augmenter $n$.', `La boucle fait exactement le nombre de tours indiqué.`],
      correction_etapes(st) {
        const { k, pas } = st._v; let s = 0, n = 1; const lignes = [];
        for (let i = 1; i <= k; i++) { s += n; lignes.push(`tour ${i} : somme $= ${s}$`); n += pas; }
        return [`Au départ somme $= 0$ et $n = 1$ ; à chaque tour on ajoute $n$ puis $n$ augmente de $${pas}$.`, lignes.join(' ; ') + '.', `Le lutin dit $${s}$.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Qu\'affiche le lutin ?',
      generer() {
        const seuil = randInt(10, 20), rep = randInt(5, 25), c = pick([2, 3]);
        return {
          enonce: `L'utilisateur répond <strong>${rep}</strong>.` + scratch([DRAPEAU, 'cap:demander [Choisis un nombre] et attendre', `var:mettre [x] à [réponse × ${c}]`, [`ctl:si <[x] > [${seuil * c}]> alors`, ['app:dire [Gagné !]'], 'sinon', ['app:dire [Perdu !]']]]),
          choix: ['Gagné !', 'Perdu !', 'Gagné ! puis Perdu !'], correct: rep * c > seuil * c ? 0 : 1, ordre_fixe: true, _v: { seuil, rep, c },
        };
      },
      indices: ['Calcule d\'abord la valeur de $x$.', 'Compare-la au nombre de la condition (strictement supérieur).', 'Une seule branche est exécutée.'],
      correction_etapes: (st) => [`$x = ${st._v.rep} \\times ${st._v.c} = ${st._v.rep * st._v.c}$.`, `Test : $${st._v.rep * st._v.c} > ${st._v.seuil * st._v.c}$ est ${st._v.rep * st._v.c > st._v.seuil * st._v.c ? 'vrai' : 'faux'}.`, `Le lutin dit « ${st._v.rep * st._v.c > st._v.seuil * st._v.c ? 'Gagné !' : 'Perdu !'} » (une seule branche s'exécute).`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Programme de calcul — que dit le lutin ?',
      generer() {
        const r = randInt(-5, 9), a = randInt(2, 7), b = randInt(2, 5), c = randInt(1, 12);
        return {
          enonce: `L'utilisateur répond <strong>${r}</strong>.` + scratch([DRAPEAU, 'cap:demander [Choisis un nombre] et attendre', `var:mettre [résultat] à [réponse + ${a}]`, `var:mettre [résultat] à [résultat × ${b}]`, `var:ajouter [${-c}] à [résultat]`, 'app:dire [résultat]']),
          reponse: (r + a) * b - c, validation: 'nombre', _v: { r, a, b, c },
        };
      },
      indices: ['réponse vaut le nombre tapé par l\'utilisateur.', 'Exécute les trois calculs dans l\'ordre.', 'Attention aux nombres négatifs.'],
      correction_etapes(st) {
        const { r, a, b, c } = st._v, par = (n) => (n < 0 ? `(${n})` : n);
        return [`résultat $= ${par(r)} + ${a} = ${r + a}$.`, `résultat $= ${par(r + a)} \\times ${b} = ${(r + a) * b}$.`, `résultat $= ${par((r + a) * b)} - ${c} = ${(r + a) * b - c}$. Le lutin dit $${(r + a) * b - c}$.`];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Boucle « répéter jusqu\'à » — que dit le lutin ?',
      generer() {
        const m = pick([2, 3]), L = randInt(20, 200);
        let n = 1, tours = 0; while (!(n > L)) { n *= m; tours++; }
        const quoi = pick(['n', 'tours']);
        return {
          enonce: scratch([DRAPEAU, 'var:mettre [n] à [1]', 'var:mettre [tours] à [0]', [`ctl:répéter jusqu'à <[n] > [${L}]>`, [`var:mettre [n] à [n × ${m}]`, 'var:ajouter [1] à [tours]']], `app:dire [${quoi}]`]),
          reponse: quoi === 'n' ? n : tours, validation: 'nombre', _v: { m, L, quoi },
        };
      },
      indices: ['Le test est fait avant chaque tour : la boucle s\'arrête dès que $n > $ la limite.', `Écris les valeurs successives de $n$.`, 'Compte les tours effectués.'],
      correction_etapes(st) {
        const { m, L, quoi } = st._v; let n = 1, tours = 0; const vals = [1];
        while (!(n > L)) { n *= m; tours++; vals.push(n); }
        return [`Valeurs successives de $n$ : $${vals.join(' \\to ')}$.`, `$${n} > ${L}$ : la boucle s'arrête après $${tours}$ tours.`, `Le lutin dit $${quoi === 'n' ? n : tours}$.`];
      },
    },
    {
      id: 'e09', niveau: 3, type: 'saisie', consigne: 'Boucles imbriquées — longueur totale tracée (en pas) :',
      generer() {
        const ext = randInt(2, 6), n = pick([3, 4, 6]), d = pick([20, 30, 40, 50]);
        return {
          enonce: scratch([DRAPEAU, 'sty:stylo en position d\'écriture', [`ctl:répéter [${ext}] fois`, [[`ctl:répéter [${n}] fois`, [`mvt:avancer de [${d}] pas`, `mvt:tourner ↻ de [${360 / n}] degrés`]], `mvt:tourner ↻ de [${Math.round(360 / ext)}] degrés`]]]),
          reponse: ext * n * d, validation: 'nombre', _v: { ext, n, d },
        };
      },
      indices: ['Le bloc « avancer » est dans deux boucles.', `Il est exécuté (tours extérieurs) × (tours intérieurs) fois.`, 'Multiplie ensuite par la longueur d\'un trait.'],
      correction_etapes: (st) => [`La boucle intérieure trace $${st._v.n}$ traits ; elle est répétée $${st._v.ext}$ fois.`, `Nombre de traits : $${st._v.ext} \\times ${st._v.n} = ${st._v.ext * st._v.n}$.`, `Longueur totale : $${st._v.ext * st._v.n} \\times ${st._v.d} = ${st._v.ext * st._v.n * st._v.d}$ pas.`],
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets les blocs dans l\'ordre pour tracer un triangle équilatéral :',
      generer() {
        const d = pick([50, 80, 100, 120]);
        return { etapes: ['« quand le drapeau vert est cliqué »', '« effacer tout »', '« stylo en position d\'écriture »', '« répéter 3 fois »', `« avancer de ${d} pas » (dans la boucle)`, '« tourner ↻ de 120 degrés » (dans la boucle)'] };
      },
      indices: ['Un script commence toujours par un événement.', 'On prépare le stylo avant de dessiner.', 'Dans la boucle : on avance, puis on tourne de $360 \\div 3 = 120°$.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol><p>Le lutin tourne de $120°$ (et non $60°$) : il fait un tour complet en 3 fois.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Pour tracer un hexagone régulier, le lutin tourne à chaque sommet de :', choix: ['60°', '120°', '90°', '360°'], correct: 0, explication: '$360° \\div 6 = 60°$.' },
    {
      type: 'saisie', question: 'Variable.',
      generer() { const a = randInt(2, 9), b = randInt(2, 9); return { question: `« mettre x à ${a} », « ajouter ${b} à x », « mettre x à x × 2 ». Que vaut x ?`, reponse: (a + b) * 2, validation: 'nombre', explication: `$(${a} + ${b}) \\times 2 = ${(a + b) * 2}$.` }; },
    },
    { type: 'vrai_faux', question: 'Dans « si … alors … sinon … », les deux branches peuvent s\'exécuter.', reponse: false, explication: 'Une seule branche s\'exécute, selon la valeur de la condition.' },
    {
      type: 'saisie', question: 'Boucles imbriquées.',
      generer() { const a = randInt(2, 5), b = randInt(2, 6); return { question: `« répéter ${a} fois » contient « répéter ${b} fois » qui contient « ajouter 1 à compteur ». Compteur part de 0 : que vaut-il à la fin ?`, reponse: a * b, validation: 'nombre', explication: `$${a} \\times ${b} = ${a * b}$ exécutions.` }; },
    },
    { type: 'qcm', question: '« répéter jusqu\'à &lt;n &gt; 10&gt; » s\'arrête :', choix: ['dès que n est strictement supérieur à 10', 'quand n vaut 10', 'après 10 tours', 'jamais'], correct: 0, explication: 'La boucle recommence tant que la condition est fausse, et s\'arrête dès qu\'elle devient vraie.' },
  ],
};
