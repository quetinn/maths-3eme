// =====================================================================
//  r14_rotation.js — 4ᵉ : rotation (centre, angle, sens), propriétés de
//  conservation, quarts de tour et demi-tour dans un repère.
//  Figure interactive : un triangle tourne autour de O (curseur d'angle).
// =====================================================================

import { randInt, randIntNonZero, pick } from '../../engine.js';
import { svg, poly, point, repere, arcAngle, seg } from '../commun.js';

const SENS_DIRECT = 'sens inverse des aiguilles d\'une montre';
const SENS_HORAIRE = 'sens des aiguilles d\'une montre';

// Images par les rotations de centre O usuelles.
const ROT = {
  q_direct: { nom: `rotation de centre $O$ d'angle $90°$ (${SENS_DIRECT})`, f: (x, y) => [-y, x], regle: "(x\\,;\\,y) \\mapsto (-y\\,;\\,x)" },
  q_horaire: { nom: `rotation de centre $O$ d'angle $90°$ (${SENS_HORAIRE})`, f: (x, y) => [y, -x], regle: "(x\\,;\\,y) \\mapsto (y\\,;\\,-x)" },
  demi: { nom: "rotation de centre $O$ d'angle $180°$ (demi-tour)", f: (x, y) => [-x, -y], regle: "(x\\,;\\,y) \\mapsto (-x\\,;\\,-y)" },
};

/** Repère avec un point M et (option) son image M'. */
function figRepere(M, Mp = null, lim = 5) {
  const R = repere({ xmin: -lim, xmax: lim, ymin: -lim, ymax: lim, W: 280 });
  let s = R.fond + point([R.X(0), R.Y(0)], 'O', -9, 14, 'var(--muted)');
  s += point([R.X(M[0]), R.Y(M[1])], 'M', 10, -4);
  if (Mp) s += point([R.X(Mp[0]), R.Y(Mp[1])], "M'", 12, -4, 'var(--t-geometrie)');
  return svg(R.W, R.H, s, 'point dans un repère');
}

function rotationInteractive(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>angle <input type="range" min="0" max="360" step="15" value="90" data-a> <span class="fig-val" data-av></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  const T = [[1, 1], [4, 1], [1, 3]];
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, r = a * Math.PI / 180;
    wrap.querySelector('[data-av]').textContent = a + '°';
    const R = repere({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, W: 300 });
    const rot = ([x, y]) => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
    const px = (p) => [R.X(p[0]), R.Y(p[1])];
    const T2 = T.map(rot);
    let s = R.fond + poly(T.map(px), { c: 'var(--accent)', fill: 'var(--accent-soft)', w: 2.2 });
    s += poly(T2.map(px), { c: 'var(--t-geometrie)', w: 2.2, dash: true });
    s += seg(px([0, 0]), px(T[1]), { c: 'var(--muted)', w: 1, dash: true }) + seg(px([0, 0]), px(T2[1]), { c: 'var(--muted)', w: 1, dash: true });
    if (a > 0 && a < 360) s += arcAngle(px([0, 0]), Math.atan2(1, 4) * 180 / Math.PI, Math.atan2(1, 4) * 180 / Math.PI + a, 26, `${a}°`);
    s += point(px(T[1]), 'B', 8, 12) + point(px(T2[1]), "B'", 10, -6, 'var(--t-geometrie)') + point(px([0, 0]), 'O', -9, 14, 'var(--muted)');
    wrap.querySelector('[data-svg]').innerHTML = svg(R.W, R.H, s, 'rotation d\'un triangle autour de O');
    wrap.querySelector('[data-out]').innerHTML = `Rotation de centre O, d'angle <strong>${a}°</strong> (${SENS_DIRECT}) : OB' = OB, et le triangle garde ses longueurs, ses angles et son aire.`;
  }
  wrap.querySelector('[data-a]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r14',
  titre: 'Rotation',
  theme: 'geometrie', niveau: '4e',
  icone: '🔃',

  intro:
    "Une rotation fait <strong>tourner</strong> une figure autour d'un point fixe, comme une grande roue, les " +
    "aiguilles d'une horloge ou une rosace. Elle déplace la figure sans la déformer : longueurs, angles et aires " +
    "sont conservés. On l'utilise pour construire des frises et des pavages, et en 3ᵉ pour étudier les transformations.",

  cours: [
    {
      type: 'definition', titre: 'Image d\'un point par une rotation',
      contenu: "Soit $O$ un point et $\\alpha$ un angle. L'image du point $M$ par la rotation de <strong>centre</strong> $O$, d'<strong>angle</strong> $\\alpha$ dans un <strong>sens</strong> donné est le point $M'$ tel que : $OM' = OM$ et $\\widehat{MOM'} = \\alpha$ (en tournant dans le sens indiqué). Le centre $O$ ne bouge pas.",
    },
    {
      type: 'propriete', titre: 'Ce que la rotation conserve',
      contenu: "Une rotation conserve les <strong>longueurs</strong>, les <strong>angles</strong>, les <strong>aires</strong>, l'alignement et le parallélisme. L'image d'une figure est une figure superposable.",
    },
    {
      type: 'propriete', titre: 'Quart de tour et demi-tour dans un repère (centre O)',
      contenu: "Quart de tour ($90°$) dans le sens inverse des aiguilles d'une montre : $(x\\,;\\,y) \\mapsto (-y\\,;\\,x)$. Dans le sens des aiguilles : $(x\\,;\\,y) \\mapsto (y\\,;\\,-x)$. Demi-tour ($180°$, c'est la symétrie de centre $O$) : $(x\\,;\\,y) \\mapsto (-x\\,;\\,-y)$.",
    },
    { type: 'figure', titre: 'Faire tourner un triangle', contenu: "Règle l'angle : le triangle tourne autour de $O$ sans se déformer.", render: (host) => rotationInteractive(host) },
    {
      type: 'exemple', enonce: "Construire l'image de $A$ par la rotation de centre $O$, d'angle $60°$, dans le sens inverse des aiguilles d'une montre.",
      solution_etapes: [
        "On trace la demi-droite $[OA)$.",
        "Avec le rapporteur centré en $O$, on mesure $60°$ à partir de $[OA)$ dans le sens inverse des aiguilles d'une montre, et on trace la demi-droite obtenue.",
        "Avec le compas, on reporte la longueur $OA$ sur cette demi-droite : on obtient $A'$ avec $OA' = OA$ et $\\widehat{AOA'} = 60°$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer centre, angle et sens', explication: "Les trois informations sont nécessaires : sans le sens, il y a deux images possibles." },
    { etape: 2, titre: 'Construire point par point', explication: "Rapporteur (angle depuis $[OM)$) puis compas (reporter $OM$)." },
    { etape: 3, titre: 'Utiliser les conservations', explication: "Une longueur, un angle ou une aire de l'image est égal à celui de la figure de départ." },
    { etape: 4, titre: 'Dans un repère', explication: "Quart de tour : on échange les coordonnées et on change un signe ; demi-tour : on change les deux signes." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'qcm', consigne: 'Choisis la bonne définition :',
      generer() {
        const a = pick([30, 45, 60, 70, 120, 150]);
        return {
          enonce: `$M'$ est l'image de $M$ par la rotation de centre $O$ d'angle $${a}°$. Alors :`,
          choix: [`$OM' = OM$ et $\\widehat{MOM'} = ${a}°$`, `$O$ est le milieu de $[MM']$`, `$OM' = 2 \\times OM$ et $\\widehat{MOM'} = ${a}°$`, `$MM' = ${a}$ et $(OM) \\perp (OM')$`],
          correct: 0, _v: { a },
        };
      },
      indices: ['Le point tourne autour de $O$ : il reste à la même distance de $O$.', 'L\'angle entre $[OM)$ et $[OM\')$ est l\'angle de la rotation.', '« $O$ milieu de $[MM\']$ » ne correspond qu\'au demi-tour.'],
      correction_etapes: (st) => [
        `En tournant autour de $O$, le point reste sur le cercle de centre $O$ : $OM' = OM$.`,
        `L'angle dont on a tourné est $\\widehat{MOM'} = ${st._v.a}°$.`,
      ],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Utilise la conservation des longueurs (en cm) :',
      generer() {
        const L = randInt(3, 15) + pick([0, 0.5]), a = pick([40, 60, 90, 120]);
        return { enonce: `$[A'B']$ est l'image du segment $[AB]$ par une rotation d'angle $${a}°$. On sait que $AB = ${String(L).replace('.', '{,}')}$ cm. Quelle est la longueur $A'B'$ ?`, reponse: L, validation: 'nombre', _v: { L, a } };
      },
      indices: ['Une rotation ne déforme pas les figures.', 'Elle conserve les longueurs.', 'L\'angle de la rotation ne change rien à la longueur.'],
      correction_etapes: (st) => [`Une rotation conserve les longueurs (l'angle de $${st._v.a}°$ n'y change rien).`, `Donc $A'B' = AB = ${String(st._v.L).replace('.', '{,}')}$ cm.`],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Utilise la conservation des angles (en degrés) :',
      generer() {
        const x = randInt(25, 110);
        return { enonce: `Le triangle $A'B'C'$ est l'image du triangle $ABC$ par une rotation de centre $O$. On sait que $\\widehat{ABC} = ${x}°$. Combien mesure $\\widehat{A'B'C'}$ ?`, reponse: x, validation: 'nombre', _v: { x } };
      },
      indices: ['Une rotation conserve les angles.', '$\\widehat{A\'B\'C\'}$ est l\'image de $\\widehat{ABC}$.', 'Les deux angles ont la même mesure.'],
      correction_etapes: (st) => [`L'angle $\\widehat{A'B'C'}$ est l'image de $\\widehat{ABC}$.`, `Une rotation conserve les angles : $\\widehat{A'B'C'} = ${st._v.x}°$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'complete', consigne: 'Donne les coordonnées de l\'image :',
      generer() {
        const cle = pick(Object.keys(ROT)), x = randIntNonZero(-4, 4), y = randIntNonZero(-4, 4), [xp, yp] = ROT[cle].f(x, y);
        return {
          enonce_complete: `Image de $M(${x}\\,;\\,${y})$ par la ${ROT[cle].nom} : $M'($ {0} $;$ {1} $)$`,
          champs: [{ reponse: xp, validation: 'nombre' }, { reponse: yp, validation: 'nombre' }],
          visuel: (h) => { h.innerHTML = figRepere([x, y]); },
          _v: { cle, x, y, xp, yp },
        };
      },
      indices: ['Place $M$ dans le repère et fais tourner le segment $[OM]$.', 'Quart de tour : les coordonnées s\'échangent et un signe change.', 'Demi-tour : $(x\\,;\\,y) \\mapsto (-x\\,;\\,-y)$.'],
      correction_etapes(st) {
        const { cle, x, y, xp, yp } = st._v;
        return [
          `Règle pour la ${ROT[cle].nom} : $${ROT[cle].regle}$.`,
          `Avec $x = ${x}$ et $y = ${y}$ : $M'(${xp}\\,;\\,${yp})$.`,
        ];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Problème de l\'horloge — calcule l\'angle (en degrés) :',
      generer() {
        if (Math.random() < 0.5) {
          const n = pick([5, 10, 15, 20, 25, 35, 40, 45, 50]);
          return { enonce: `En $${n}$ minutes, de quel angle tourne la grande aiguille d'une horloge ?`, reponse: 6 * n, validation: 'nombre', _v: { n, aiguille: 'grande' } };
        }
        const n = randInt(1, 11);
        return { enonce: `En $${n}$ heure${n > 1 ? 's' : ''}, de quel angle tourne la petite aiguille d'une horloge ?`, reponse: 30 * n, validation: 'nombre', _v: { n, aiguille: 'petite' } };
      },
      indices: ['Un tour complet fait $360°$.', 'La grande aiguille fait un tour en 60 minutes ; la petite en 12 heures.', 'Grande aiguille : $6°$ par minute. Petite aiguille : $30°$ par heure.'],
      correction_etapes(st) {
        const { n, aiguille } = st._v;
        return aiguille === 'grande'
          ? [`La grande aiguille fait un tour ($360°$) en $60$ minutes : $360 \\div 60 = 6°$ par minute.`, `En $${n}$ minutes : $${n} \\times 6 = ${6 * n}°$.`]
          : [`La petite aiguille fait un tour ($360°$) en $12$ heures : $360 \\div 12 = 30°$ par heure.`, `En $${n}$ h : $${n} \\times 30 = ${30 * n}°$.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre la construction de l\'image de A :',
      generer() {
        const a = pick([40, 50, 60, 75, 100, 130]);
        return {
          etapes: [
            'Tracer la demi-droite $[OA)$.',
            `Placer le rapporteur centré en $O$ sur $[OA)$ et marquer $${a}°$ dans le sens demandé.`,
            'Tracer la demi-droite passant par $O$ et cette marque.',
            'Avec le compas, reporter la longueur $OA$ sur cette demi-droite : c\'est le point $A\'$.',
          ],
        };
      },
      indices: ['On part toujours de la demi-droite $[OA)$.', 'L\'angle se mesure avant de reporter la longueur.', 'Le compas sert à garantir $OA\' = OA$.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Polygone régulier — plus petit angle (en degrés) :',
      generer() {
        const [n, nom] = pick([[3, 'triangle équilatéral'], [4, 'carré'], [5, 'pentagone régulier'], [6, 'hexagone régulier'], [8, 'octogone régulier'], [10, 'décagone régulier'], [12, 'dodécagone régulier']]);
        return { enonce: `Quel est le plus petit angle (non nul) d'une rotation de centre le centre d'un ${nom} qui transforme ce polygone en lui-même ?`, reponse: 360 / n, validation: 'nombre', _v: { n, nom } };
      },
      indices: ['Chaque sommet doit venir sur le sommet suivant.', 'Les sommets partagent le tour complet en parts égales.', 'Angle $= 360° \\div$ nombre de sommets.'],
      correction_etapes: (st) => [
        `Le ${st._v.nom} a $${st._v.n}$ sommets régulièrement répartis autour de son centre.`,
        `Pour amener chaque sommet sur le suivant, on tourne de $360° \\div ${st._v.n} = ${360 / st._v.n}°$.`,
      ],
    },
    {
      id: 'e08', niveau: 3, type: 'qcm', consigne: 'Reconnais la transformation :',
      generer() {
        let x, y;
        do { x = randIntNonZero(-4, 4); y = randIntNonZero(-4, 4); } while (Math.abs(x) === Math.abs(y));
        const options = [
          { nom: `rotation de centre $O$, $90°$, ${SENS_DIRECT}`, f: ROT.q_direct.f },
          { nom: `rotation de centre $O$, $90°$, ${SENS_HORAIRE}`, f: ROT.q_horaire.f },
          { nom: 'rotation de centre $O$ d\'angle $180°$', f: ROT.demi.f },
          { nom: 'symétrie d\'axe l\'axe des abscisses', f: (a, b) => [a, -b] },
        ];
        const k = randInt(0, 3), [xp, yp] = options[k].f(x, y);
        return {
          enonce: `Une transformation envoie $A(${x}\\,;\\,${y})$ sur $A'(${xp}\\,;\\,${yp})$. Laquelle ?`,
          choix: options.map((o) => o.nom), correct: k, _v: { x, y, xp, yp, options, k },
        };
      },
      indices: ['Teste chaque transformation sur les coordonnées de $A$.', 'Quart de tour direct : $(x;y) \\mapsto (-y;x)$ ; horaire : $(x;y) \\mapsto (y;-x)$.', 'Symétrie d\'axe des abscisses : $(x;y) \\mapsto (x;-y)$.'],
      correction_etapes(st) {
        const { x, y, options } = st._v;
        return options.map((o) => { const [a, b] = o.f(x, y); return `${o.nom} : $A \\mapsto (${a}\\,;\\,${b})$.`; });
      },
    },
    {
      id: 'e09', niveau: 3, type: 'saisie', consigne: 'Calcule l\'angle (en degrés) :',
      generer() {
        const a = 2 * randInt(10, 70);
        return {
          enonce: `$A'$ est l'image de $A$ par la rotation de centre $O$ d'angle $${a}°$. Combien mesure l'angle $\\widehat{OAA'}$ ?`,
          reponse: (180 - a) / 2, validation: 'nombre', _v: { a },
        };
      },
      indices: ['Par la rotation, $OA\' = OA$ : le triangle $OAA\'$ est isocèle en $O$.', 'Ses deux angles à la base sont égaux.', 'La somme des angles d\'un triangle vaut $180°$.'],
      correction_etapes: (st) => [
        `$OA' = OA$ donc le triangle $OAA'$ est isocèle en $O$, avec $\\widehat{AOA'} = ${st._v.a}°$.`,
        `Les angles à la base sont égaux : $2 \\times \\widehat{OAA'} = 180° - ${st._v.a}° = ${180 - st._v.a}°$.`,
        `$\\widehat{OAA'} = ${180 - st._v.a} \\div 2 = ${(180 - st._v.a) / 2}°$.`,
      ],
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Pour définir une rotation, il faut connaître :', choix: ['un centre, un angle et un sens', 'un axe', 'un vecteur', 'un centre seulement'], correct: 0, explication: 'Centre, angle et sens de rotation.' },
    { type: 'vrai_faux', question: 'Une rotation conserve les aires.', reponse: true, explication: 'Oui : l\'image est superposable à la figure, donc de même aire.' },
    {
      type: 'saisie', question: 'Image par un demi-tour.',
      generer() { const x = randIntNonZero(-6, 6), y = randIntNonZero(-6, 6); return { question: `Abscisse de l'image de $M(${x}\\,;\\,${y})$ par la rotation de centre $O$ d'angle $180°$ ?`, reponse: -x, validation: 'nombre', explication: `Demi-tour : $(x;y) \\mapsto (-x;-y)$, donc abscisse $${-x}$.` }; },
    },
    {
      type: 'saisie', question: 'Horloge.',
      generer() { const n = pick([10, 15, 20, 30, 45]); return { question: `De combien de degrés tourne la grande aiguille en $${n}$ minutes ?`, reponse: 6 * n, validation: 'nombre', explication: `$6°$ par minute : $${n} \\times 6 = ${6 * n}°$.` }; },
    },
    { type: 'qcm', question: 'La rotation de centre $O$ d\'angle $180°$ est aussi :', choix: ['la symétrie de centre $O$', 'une symétrie axiale', 'une translation', 'un agrandissement'], correct: 0, explication: 'Un demi-tour autour de $O$ = symétrie centrale de centre $O$.' },
  ],
};
