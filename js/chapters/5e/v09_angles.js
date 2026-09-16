// =====================================================================
//  v09_angles.js — 5ᵉ : vocabulaire des angles, angles complémentaires,
//  supplémentaires, opposés par le sommet ; angles alternes-internes et
//  correspondants, lien avec le parallélisme (propriété et réciproque).
//  Figure interactive : deux droites coupées par une sécante.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { svg, seg, txt, point, arcAngle } from '../commun.js';

const rad = (d) => (d * Math.PI) / 180;

/** Intersection de la droite (P, angle a°) avec la droite (Q, angle b°) — angles « maths » (écran : y vers le bas). */
function inter(P, a, Q, b) {
  const [ux, uy] = [Math.cos(rad(a)), -Math.sin(rad(a))], [vx, vy] = [Math.cos(rad(b)), -Math.sin(rad(b))];
  const den = ux * vy - uy * vx, t = ((Q[0] - P[0]) * vy - (Q[1] - P[1]) * vx) / den;
  return [P[0] + t * ux, P[1] + t * uy];
}

/**
 * Deux droites (d1) en haut, (d2) en bas (inclinée de t° si non parallèle) et une sécante d'angle alpha.
 * Secteurs nommés : E1 (droite-haut), E2 (haut-gauche), E3 (gauche-bas), E4 (bas-droite) au point E sur (d1) ;
 * F1…F4 de même au point F sur (d2). marques = { E1: { texte, c } … }.
 */
function figSecante({ alpha = 60, t = 0, marques = {}, noms = true } = {}) {
  const C = [160, 122], H1 = [160, 72], H2 = [160, 172];
  const E = inter(C, alpha, H1, 0), F = inter(C, alpha, H2, t);
  const loin = (P, a, L) => [P[0] + L * Math.cos(rad(a)), P[1] - L * Math.sin(rad(a))];
  let s = seg(loin(H1, 180, 160), loin(H1, 0, 160), { w: 2.2 }) + seg(loin(H2, 180 + t, 160), loin(H2, t, 160), { w: 2.2 });
  s += seg(loin(C, alpha + 180, 135), loin(C, alpha, 135), { c: 'var(--t-geometrie)', w: 2.2 });
  s += txt(300, 64, '(d₁)', { size: 12, c: 'var(--muted)' }) + txt(300, 166 - Math.tan(rad(t)) * 140, '(d₂)', { size: 12, c: 'var(--muted)' });
  const secteurs = {
    E: [[0, alpha], [alpha, 180], [180, alpha + 180], [alpha + 180, 360]],
    F: [[t, alpha], [alpha, 180 + t], [180 + t, 180 + alpha], [180 + alpha, 360 + t]],
  };
  for (const [nom, V] of [['E', E], ['F', F]]) {
    secteurs[nom].forEach(([d1, d2], i) => {
      const m = marques[`${nom}${i + 1}`];
      if (m) s += arcAngle(V, d1, d2, 17, m.texte, { c: m.c || 'var(--accent)', decal: 14, size: 12, w: 2.4 });
    });
  }
  if (noms) s += point(E, 'E', -2, -12, 'var(--text)') + point(F, 'F', 6, 22, 'var(--text)');
  return svg(320, 240, s, 'deux droites coupées par une sécante', 'fig-large');
}

function secanteInteractive(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>sécante <input type="range" min="30" max="150" step="5" value="55" data-a> <span class="fig-val" data-av></span></label>
      <label style="flex:0 1 auto"><input type="checkbox" data-p checked> (d₁) ∥ (d₂)</label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, par = wrap.querySelector('[data-p]').checked, t = par ? 0 : 9;
    wrap.querySelector('[data-av]').textContent = `${a}°`;
    const E3 = a, F1 = a - t;
    wrap.querySelector('[data-svg]').innerHTML = figSecante({ alpha: a, t, marques: { E3: { texte: `${E3}°`, c: 'var(--accent)' }, F1: { texte: `${F1}°`, c: 'var(--accent)' }, E1: { texte: `${a}°`, c: 'var(--t-donnees)' } } });
    wrap.querySelector('[data-out]').innerHTML = par
      ? `Droites parallèles : les angles <strong>alternes-internes</strong> (verts) sont égaux, et les angles <strong>correspondants</strong> (orange en E, vert en F) aussi.`
      : `Droites non parallèles : les angles alternes-internes mesurent ${E3}° et ${F1}° — ils ne sont <strong>pas égaux</strong>.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

const tirerAlpha = () => pick([randInt(35, 80), randInt(100, 145)]);

// Relations entre secteurs quand (d1) // (d2) : valeur de chaque secteur en fonction de alpha.
const VALEUR = { E1: (a) => a, E2: (a) => 180 - a, E3: (a) => a, E4: (a) => 180 - a, F1: (a) => a, F2: (a) => 180 - a, F3: (a) => a, F4: (a) => 180 - a };
const PAIRES = [
  ['E3', 'F1', 'alternes-internes'], ['E4', 'F2', 'alternes-internes'],
  ['E1', 'F1', 'correspondants'], ['E2', 'F2', 'correspondants'], ['E3', 'F3', 'correspondants'], ['E4', 'F4', 'correspondants'],
  ['E1', 'E3', 'opposés par le sommet'], ['F2', 'F4', 'opposés par le sommet'],
];

export default {
  id: 'v09',
  titre: 'Angles et parallélisme',
  theme: 'geometrie', niveau: '5e',
  icone: '📏',

  intro:
    "Les angles permettent de décrire une direction, une pente, une ouverture. En 5ᵉ, on découvre des couples d'angles " +
    "remarquables et surtout un outil très puissant : des angles égaux permettent de <strong>prouver que deux droites " +
    "sont parallèles</strong>, et des droites parallèles permettent de <strong>calculer des angles</strong> sans rapporteur.",

  cours: [
    {
      type: 'definition', titre: 'Vocabulaire',
      contenu: "Un angle <strong>aigu</strong> mesure moins de $90°$, un angle <strong>droit</strong> $90°$, un angle <strong>obtus</strong> entre $90°$ et $180°$, un angle <strong>plat</strong> $180°$. Deux angles sont <strong>adjacents</strong> s'ils ont le même sommet, un côté commun, et sont situés de part et d'autre de ce côté.",
    },
    {
      type: 'definition', titre: 'Complémentaires, supplémentaires, opposés par le sommet',
      contenu: "Deux angles sont <strong>complémentaires</strong> si la somme de leurs mesures vaut $90°$, <strong>supplémentaires</strong> si elle vaut $180°$. Deux angles <strong>opposés par le sommet</strong> (formés par deux droites sécantes, « face à face ») ont la même mesure.",
    },
    {
      type: 'definition', titre: 'Angles alternes-internes et correspondants',
      contenu: "Deux droites $(d_1)$ et $(d_2)$ sont coupées par une sécante. Deux angles <strong>alternes-internes</strong> sont situés entre les deux droites, de part et d'autre de la sécante. Deux angles <strong>correspondants</strong> sont situés du même côté de la sécante, l'un au-dessus de $(d_1)$ et l'autre au-dessus de $(d_2)$ (même position).",
    },
    {
      type: 'propriete', titre: 'Parallélisme et angles',
      contenu: "<strong>Propriété</strong> : si deux droites parallèles sont coupées par une sécante, alors les angles alternes-internes sont égaux et les angles correspondants sont égaux. <strong>Réciproque</strong> : si deux droites coupées par une sécante forment deux angles alternes-internes (ou correspondants) égaux, alors ces droites sont parallèles.",
    },
    { type: 'figure', titre: 'Une sécante et deux droites', contenu: "Fais tourner la sécante, puis décoche « parallèles » : l'égalité des angles disparaît.", render: (host) => secanteInteractive(host) },
    {
      type: 'exemple', enonce: '$(d_1) \\parallel (d_2)$. La sécante forme en $E$ un angle de $65°$ (entre les droites). Quelle est la mesure de l\'angle alterne-interne en $F$, et de l\'angle qui lui est adjacent sur $(d_2)$ ?',
      solution_etapes: ["Les droites sont parallèles, donc les angles alternes-internes sont égaux : l'angle en $F$ mesure $65°$.", "L'angle adjacent sur la droite $(d_2)$ forme avec lui un angle plat : il mesure $180° - 65° = 115°$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer la sécante', explication: "Identifie les deux droites et la droite qui les coupe." },
    { etape: 2, titre: 'Nommer la position des angles', explication: "Entre les droites et de part et d'autre de la sécante : alternes-internes. Même position aux deux intersections : correspondants." },
    { etape: 3, titre: 'Citer la propriété', explication: "« Les droites sont parallèles, donc les angles alternes-internes sont égaux. » Ou la réciproque pour prouver un parallélisme." },
    { etape: 4, titre: 'Compléter avec l\'angle plat', explication: "Deux angles adjacents qui forment une droite sont supplémentaires : $180° - x$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'qcm', consigne: 'Nature de l\'angle :',
      generer() {
        const m = pick([randInt(5, 85), 90, randInt(95, 175), 180]);
        const choix = ['aigu', 'droit', 'obtus', 'plat'], correct = m < 90 ? 0 : m === 90 ? 1 : m < 180 ? 2 : 3;
        return { enonce: `Un angle mesure $${m}°$. Il est :`, choix, correct, ordre_fixe: true, _v: { m } };
      },
      indices: ['Compare la mesure à $90°$.', 'Aigu : moins de $90°$ ; obtus : entre $90°$ et $180°$.', 'Droit : exactement $90°$ ; plat : $180°$.'],
      correction_etapes: (st) => [`$${st._v.m}°$ ${st._v.m < 90 ? 'est inférieur à $90°$ : angle aigu' : st._v.m === 90 ? 'vaut $90°$ : angle droit' : st._v.m < 180 ? 'est compris entre $90°$ et $180°$ : angle obtus' : 'vaut $180°$ : angle plat'}.`],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la mesure (en degrés) :',
      generer() {
        const comp = Math.random() < 0.5, m = comp ? randInt(8, 82) : randInt(15, 165);
        return { enonce: `Deux angles sont ${comp ? 'complémentaires' : 'supplémentaires'}. L'un mesure $${m}°$. Combien mesure l'autre ?`, reponse: (comp ? 90 : 180) - m, validation: 'nombre', _v: { comp, m } };
      },
      indices: ['Complémentaires : somme $= 90°$.', 'Supplémentaires : somme $= 180°$.', 'Soustrais la mesure connue.'],
      correction_etapes: (st) => [`${st._v.comp ? 'Complémentaires' : 'Supplémentaires'} : la somme vaut $${st._v.comp ? 90 : 180}°$.`, `$${st._v.comp ? 90 : 180} - ${st._v.m} = ${(st._v.comp ? 90 : 180) - st._v.m}°$.`],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Angles opposés par le sommet ou adjacents (en degrés) :',
      generer() {
        const a = tirerAlpha(), [cible, why] = pick([['E3', 'opposé par le sommet'], ['E2', 'adjacent et supplémentaire'], ['E4', 'adjacent et supplémentaire']]);
        return {
          enonce: `Au point $E$, l'angle vert mesure $${a}°$. Combien mesure l'angle marqué « ? » ?`,
          reponse: VALEUR[cible](a), validation: 'nombre', _v: { a, cible, why },
          visuel: (h) => { h.innerHTML = figSecante({ alpha: a, marques: { E1: { texte: `${a}°` }, [cible]: { texte: '?', c: 'var(--t-donnees)' } } }); },
        };
      },
      indices: ['Deux angles face à face (opposés par le sommet) ont la même mesure.', 'Deux angles côte à côte sur une droite forment un angle plat ($180°$).', 'Regarde la position de « ? » par rapport à l\'angle connu.'],
      correction_etapes: (st) => (st._v.cible === 'E3' ? [`L'angle « ? » est opposé par le sommet à l'angle de $${st._v.a}°$.`, `Deux angles opposés par le sommet ont la même mesure : $${st._v.a}°$.`] : [`L'angle « ? » et l'angle de $${st._v.a}°$ sont adjacents et forment un angle plat.`, `$180 - ${st._v.a} = ${180 - st._v.a}°$.`]),
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Les droites sont parallèles — calcule l\'angle (en degrés) :',
      generer() {
        const a = tirerAlpha(), [src, cible, nom] = pick(PAIRES.filter((p) => p[2] !== 'opposés par le sommet'));
        const connu = VALEUR[src](a);
        return {
          enonce: `$(d_1) \\parallel (d_2)$. L'angle vert mesure $${connu}°$. Combien mesure l'angle marqué « ? » ?`,
          reponse: VALEUR[cible](a), validation: 'nombre', _v: { connu, nom },
          visuel: (h) => { h.innerHTML = figSecante({ alpha: a, marques: { [src]: { texte: `${connu}°` }, [cible]: { texte: '?', c: 'var(--t-donnees)' } } }); },
        };
      },
      indices: ['Repère la position des deux angles : entre les droites ? du même côté de la sécante ?', 'Alternes-internes ou correspondants.', 'Les droites sont parallèles : ces angles sont égaux.'],
      correction_etapes: (st) => [`Les deux angles sont ${st._v.nom}.`, `Comme $(d_1) \\parallel (d_2)$, ils sont égaux : l'angle mesure $${st._v.connu}°$.`],
    },
    {
      id: 'e05', niveau: 2, type: 'qcm', consigne: 'Comment s\'appellent les deux angles marqués ?',
      generer() {
        const a = tirerAlpha(), [x, y, nom] = pick(PAIRES);
        return {
          enonce: 'Les deux angles colorés sont :',
          choix: ['alternes-internes', 'correspondants', 'opposés par le sommet', 'complémentaires'], correct: ['alternes-internes', 'correspondants', 'opposés par le sommet'].indexOf(nom), ordre_fixe: true, _v: { nom },
          visuel: (h) => { h.innerHTML = figSecante({ alpha: a, marques: { [x]: { texte: '' }, [y]: { texte: '', c: 'var(--t-donnees)' } } }); },
        };
      },
      indices: ['Même sommet et face à face : opposés par le sommet.', 'Entre les deux droites, de part et d\'autre de la sécante : alternes-internes.', 'Même position aux deux intersections : correspondants.'],
      correction_etapes: (st) => [`Ces deux angles sont ${st._v.nom}${st._v.nom === 'alternes-internes' ? ' : ils sont entre les deux droites et de part et d\'autre de la sécante' : st._v.nom === 'correspondants' ? ' : ils occupent la même position en E et en F' : ' : ils ont le même sommet et sont face à face'}.`],
    },
    {
      id: 'e06', niveau: 3, type: 'vrai_faux', consigne: 'Les droites (d₁) et (d₂) sont-elles parallèles ?',
      generer() {
        const a = tirerAlpha(), par = Math.random() < 0.5, ecart = par ? 0 : pick([-3, -2, 2, 3]);
        const [src, cible, nom] = pick(PAIRES.filter((p) => p[2] !== 'opposés par le sommet'));
        const m1 = VALEUR[src](a), m2 = VALEUR[cible](a) + ecart;
        return {
          enonce: `Sur la figure (qui n'est pas en vraie grandeur), les deux angles ${nom} mesurent $${m1}°$ et $${m2}°$. Les droites $(d_1)$ et $(d_2)$ sont-elles parallèles ?`,
          reponse: par, _v: { m1, m2, nom },
          visuel: (h) => { h.innerHTML = figSecante({ alpha: a, marques: { [src]: { texte: `${m1}°` }, [cible]: { texte: `${m2}°`, c: 'var(--t-donnees)' } } }); },
        };
      },
      indices: ['On utilise la réciproque de la propriété.', 'Angles alternes-internes (ou correspondants) égaux ⇒ droites parallèles.', 'S\'ils ne sont pas égaux, les droites ne sont pas parallèles (même si ça en a l\'air).'],
      correction_etapes: (st) => (st.reponse ? [`Les angles ${st._v.nom} sont égaux ($${st._v.m1}°$).`, `D'après la réciproque, $(d_1) \\parallel (d_2)$ : vrai.`] : [`Les angles ${st._v.nom} mesurent $${st._v.m1}°$ et $${st._v.m2}°$ : ils ne sont pas égaux.`, `Si les droites étaient parallèles, ces angles seraient égaux : les droites ne sont pas parallèles.`]),
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Les droites sont parallèles — calcule l\'angle en deux étapes (en degrés) :',
      generer() {
        const a = tirerAlpha(), [src, cible] = pick([['E1', 'F4'], ['E3', 'F2'], ['E2', 'F3'], ['E4', 'F1'], ['E1', 'F2']]);
        const connu = VALEUR[src](a);
        return {
          enonce: `$(d_1) \\parallel (d_2)$. L'angle vert mesure $${connu}°$. Combien mesure l'angle marqué « ? » ?`,
          reponse: VALEUR[cible](a), validation: 'nombre', _v: { connu, rep: VALEUR[cible](a) },
          visuel: (h) => { h.innerHTML = figSecante({ alpha: a, marques: { [src]: { texte: `${connu}°` }, [cible]: { texte: '?', c: 'var(--t-donnees)' } } }); },
        };
      },
      indices: ['Utilise un angle intermédiaire en $F$ (ou en $E$).', 'Angles correspondants ou alternes-internes égaux (droites parallèles).', 'Puis angles adjacents sur une droite : supplémentaires.'],
      correction_etapes: (st) => [`Les droites sont parallèles : l'angle correspondant (en $F$) à l'angle vert mesure aussi $${st._v.connu}°$.`, `L'angle « ? » lui est adjacent sur une droite : il mesure $180 - ${st._v.connu} = ${180 - st._v.connu}°$.`],
    },
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets la démonstration dans l\'ordre :',
      generer() {
        const m = tirerAlpha();
        return { etapes: [`Les droites $(d_1)$ et $(d_2)$ sont coupées par la sécante $(EF)$.`, `Les angles en $E$ et en $F$ sont alternes-internes.`, `Ils ont la même mesure : $${m}°$.`, `Or, si deux angles alternes-internes sont égaux, alors les droites sont parallèles.`, `Donc $(d_1) \\parallel (d_2)$.`] };
      },
      indices: ['On décrit d\'abord la configuration.', 'On donne les informations sur les angles.', 'On cite la propriété avant de conclure.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Quel est le supplémentaire d\'un angle de $72°$ ?', reponse: 108, validation: 'nombre', explication: '$180 - 72 = 108°$.' },
    { type: 'vrai_faux', question: 'Deux angles opposés par le sommet ont toujours la même mesure.', reponse: true, explication: 'Oui, c\'est une propriété.' },
    {
      type: 'saisie', question: 'Droites parallèles.',
      generer() { const a = tirerAlpha(); return { question: `$(d_1) \\parallel (d_2)$ : un angle alterne-interne mesure $${a}°$. Combien mesure l'autre ?`, reponse: a, validation: 'nombre', explication: `Droites parallèles ⇒ angles alternes-internes égaux : $${a}°$.` }; },
    },
    { type: 'qcm', question: 'Pour prouver que deux droites sont parallèles, on peut montrer que :', choix: ['deux angles correspondants sont égaux', 'deux angles opposés par le sommet sont égaux', 'deux angles sont aigus', 'la sécante est perpendiculaire à l\'une des droites'], correct: 0, explication: 'Réciproque : angles correspondants (ou alternes-internes) égaux ⇒ droites parallèles.' },
    { type: 'saisie', question: 'Quel est le complémentaire d\'un angle de $35°$ ?', reponse: 55, validation: 'nombre', explication: '$90 - 35 = 55°$.' },
  ],
};
