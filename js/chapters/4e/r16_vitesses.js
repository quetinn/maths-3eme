// =====================================================================
//  r16_vitesses.js — 4ᵉ : vitesse moyenne, durées en heures décimales,
//  conversions km/h ↔ m/s, autre grandeur composée (débit).
//  Figure interactive : distance parcourue en fonction du temps.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { plotFunction } from '../../render.js';
import { tex, arrondi } from '../commun.js';

/** 150 → « 2 h 30 min ». */
const duree = (min) => { const h = Math.floor(min / 60), m = min % 60; return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')} min` : ''}` : `${m} min`; };

function graphiqueVitesse(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>vitesse <input type="range" min="10" max="130" step="10" value="60" data-v> <span class="fig-val" data-vv></span></label></div>
    <div data-plot></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const v = +wrap.querySelector('[data-v]').value;
    wrap.querySelector('[data-vv]').textContent = `${v} km/h`;
    // Axe horizontal en heures, vertical en centaines de km (lisible sur mobile).
    plotFunction(wrap.querySelector('[data-plot]'), (t) => (v * t) / 100, { xmin: 0, xmax: 4, ymin: 0, ymax: 5.5, interactive: true });
    wrap.querySelector('[data-out]').innerHTML = `En 1 h : <strong>${v} km</strong> · en 2 h : <strong>${2 * v} km</strong> · en 30 min : <strong>${v / 2} km</strong><br><small>(axe vertical en centaines de km)</small> — la distance est proportionnelle à la durée.`;
  }
  wrap.querySelector('[data-v]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r16',
  titre: 'Vitesses et grandeurs composées',
  theme: 'fonctions', niveau: '4e',
  icone: '🚲',

  intro:
    "Combien de temps pour aller au collège à vélo ? À quelle heure arrivera le train ? Quel est le débit d'un robinet ? " +
    "Une vitesse est une <strong>grandeur composée</strong> : elle combine une distance et une durée. On apprend à " +
    "calculer une vitesse, une distance ou une durée, à convertir les durées (1 h 15 min = 1,25 h) et à passer des km/h aux m/s. " +
    "C'est un classique des problèmes du brevet.",

  cours: [
    {
      type: 'definition', titre: 'Vitesse moyenne',
      contenu: "Si un mobile parcourt une distance $d$ pendant une durée $t$, sa vitesse moyenne est le quotient de la distance par la durée. Unités courantes : km/h (kilomètres par heure), m/s (mètres par seconde).",
      formule: 'v = \\dfrac{d}{t}',
    },
    {
      type: 'propriete', titre: 'Distance et durée',
      contenu: "À vitesse constante, la distance est proportionnelle à la durée (le coefficient est la vitesse). On en déduit :",
      formule: 'd = v \\times t \\qquad t = \\dfrac{d}{v}',
    },
    {
      type: 'propriete', titre: 'Durées en heures décimales',
      contenu: "$1$ h $= 60$ min. Pour convertir des minutes en heures, on divise par $60$ : $15$ min $= 0{,}25$ h, $30$ min $= 0{,}5$ h, $45$ min $= 0{,}75$ h. Attention : $1{,}5$ h $= 1$ h $30$ min (et non $1$ h $50$ min).",
    },
    {
      type: 'propriete', titre: 'Convertir des km/h en m/s',
      contenu: "$1$ h $= 3\\,600$ s et $1$ km $= 1\\,000$ m, donc $1$ m/s $= 3{,}6$ km/h. Pour passer des m/s aux km/h, on multiplie par $3{,}6$ ; des km/h aux m/s, on divise par $3{,}6$.",
      formule: '36 \\text{ km/h} = \\dfrac{36\\,000 \\text{ m}}{3\\,600 \\text{ s}} = 10 \\text{ m/s}',
    },
    {
      type: 'definition', titre: 'Autres grandeurs composées',
      contenu: "Un <strong>débit</strong> est un volume par unité de temps (L/min, m³/h) : $\\text{débit} = \\dfrac{\\text{volume}}{\\text{durée}}$. Un prix au kilo (€/kg) ou une consommation (L/100 km) sont aussi des grandeurs quotients.",
    },
    { type: 'figure', titre: 'Distance en fonction du temps', contenu: "Choisis une vitesse : la représentation est une droite qui passe par l'origine (proportionnalité). Plus la vitesse est grande, plus la droite est pentue.", render: (host) => graphiqueVitesse(host) },
    {
      type: 'exemple', enonce: 'Un cycliste parcourt $45$ km en $2$ h $15$ min. Quelle est sa vitesse moyenne ?',
      solution_etapes: ["On convertit la durée : $15$ min $= 15 \\div 60 = 0{,}25$ h, donc $t = 2{,}25$ h.", "$v = \\dfrac{d}{t} = \\dfrac{45}{2{,}25} = 20$.", "Sa vitesse moyenne est $20$ km/h."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Repérer la grandeur cherchée', explication: "Vitesse : $v = \\dfrac{d}{t}$. Distance : $d = v \\times t$. Durée : $t = \\dfrac{d}{v}$." },
    { etape: 2, titre: 'Accorder les unités', explication: "Vitesse en km/h ⇒ distance en km et durée en <strong>heures décimales</strong> (minutes ÷ 60)." },
    { etape: 3, titre: 'Calculer', explication: "Remplace dans la formule et effectue le calcul." },
    { etape: 4, titre: 'Conclure avec l\'unité', explication: "Si besoin, reconvertis une durée décimale en h et min : $0{,}75$ h $= 0{,}75 \\times 60 = 45$ min." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la vitesse moyenne (en km/h) :',
      generer() {
        const [nom, v] = pick([['Un cycliste', pick([15, 18, 20, 24])], ['Une voiture', pick([50, 60, 70, 80, 90])], ['Un train', pick([120, 150, 180, 200])], ['Un coureur', pick([10, 12, 14])]]);
        const t = randInt(2, 5);
        return { enonce: `${nom} parcourt $${v * t}$ km en $${t}$ heures. Quelle est sa vitesse moyenne ?`, reponse: v, validation: 'nombre', _v: { v, t, d: v * t } };
      },
      indices: ['$v = \\dfrac{d}{t}$.', 'La distance est en km et la durée en heures : la vitesse sera en km/h.', 'Divise la distance par la durée.'],
      correction_etapes: (st) => [`$v = \\dfrac{d}{t} = \\dfrac{${st._v.d}}{${st._v.t}}$.`, `$v = ${st._v.v}$ km/h.`],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la distance parcourue (en km) :',
      generer() {
        const v = 2 * randInt(5, 45), t = pick([0.5, 1.5, 2, 2.5, 3, 4]);
        return { enonce: `Un véhicule roule à la vitesse moyenne de $${v}$ km/h pendant $${tex(t)}$ h. Quelle distance parcourt-il ?`, reponse: v * t, validation: 'nombre', _v: { v, t } };
      },
      indices: ['$d = v \\times t$.', 'La durée est déjà en heures.', `Multiplie la vitesse par la durée.`],
      correction_etapes: (st) => [`$d = v \\times t = ${st._v.v} \\times ${tex(st._v.t)}$.`, `$d = ${tex(st._v.v * st._v.t)}$ km.`],
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Convertis les durées :',
      generer() {
        const h = randInt(1, 3), m = pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]);
        const d2 = pick([0.25, 0.5, 0.75, 0.1, 0.2, 0.4]), h2 = randInt(1, 4);
        return {
          enonce_complete: `$${h}$ h $${m}$ min $=$ {0} h $\\qquad$ $${tex(h2 + d2)}$ h $= ${h2}$ h {1} min`,
          champs: [{ reponse: arrondi(h + m / 60, 4), validation: 'nombre' }, { reponse: arrondi(d2 * 60, 2), validation: 'nombre' }],
          _v: { h, m, h2, d2 },
        };
      },
      indices: ['$1$ h $= 60$ min.', 'Minutes → heures : on divise par $60$.', 'Heures décimales → minutes : on multiplie la partie décimale par $60$.'],
      correction_etapes(st) {
        const { h, m, h2, d2 } = st._v;
        return [`$${m}$ min $= ${m} \\div 60 = ${tex(m / 60)}$ h, donc $${h}$ h $${m}$ min $= ${tex(h + m / 60)}$ h.`, `$${tex(d2)}$ h $= ${tex(d2)} \\times 60 = ${tex(d2 * 60)}$ min, donc $${tex(h2 + d2)}$ h $= ${h2}$ h $${tex(d2 * 60)}$ min.`];
      },
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la durée du trajet (en minutes) :',
      generer() {
        let v, m, d;
        do { v = pick([30, 40, 45, 60, 80, 90, 120]); m = pick([10, 15, 20, 30, 40, 45, 50, 75, 90]); d = (v * m) / 60; } while (!Number.isInteger(d));
        return { enonce: `Combien de minutes faut-il pour parcourir $${d}$ km à la vitesse moyenne de $${v}$ km/h ?`, reponse: m, validation: 'nombre', _v: { v, m, d } };
      },
      indices: ['$t = \\dfrac{d}{v}$ donne une durée en heures.', 'Convertis ensuite en minutes : multiplie par 60.', `Ou : en 1 minute, on parcourt $v \\div 60$ km.`],
      correction_etapes(st) {
        const { v, m, d } = st._v;
        return [`$t = \\dfrac{d}{v} = \\dfrac{${d}}{${v}}$ h.`, `En minutes : $\\dfrac{${d}}{${v}} \\times 60 = \\dfrac{${d * 60}}{${v}} = ${m}$ min.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: 'Convertis la vitesse :',
      generer() {
        const k = randInt(2, 30);
        if (Math.random() < 0.5) return { enonce: `Convertis $${tex(k * 3.6)}$ km/h en m/s.`, reponse: k, validation: 'nombre', _v: { k, sens: 'kmh' } };
        return { enonce: `Convertis $${k}$ m/s en km/h.`, reponse: arrondi(k * 3.6, 2), validation: 'nombre', _v: { k, sens: 'ms' } };
      },
      indices: ['$1$ m/s $= 3{,}6$ km/h.', 'm/s → km/h : on multiplie par $3{,}6$.', 'km/h → m/s : on divise par $3{,}6$.'],
      correction_etapes(st) {
        const { k, sens } = st._v;
        return sens === 'kmh'
          ? [`De km/h en m/s, on divise par $3{,}6$ (car $1$ h $= 3\\,600$ s et $1$ km $= 1\\,000$ m).`, `$${tex(k * 3.6)} \\div 3{,}6 = ${k}$ m/s.`]
          : [`De m/s en km/h, on multiplie par $3{,}6$.`, `$${k} \\times 3{,}6 = ${tex(k * 3.6)}$ km/h.`];
      },
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Compare les vitesses :',
      generer() {
        const a = randInt(5, 25); let b;
        do { b = 5 * randInt(3, 20); } while (Math.abs(a * 3.6 - b) < 3);
        return {
          enonce: `Le guépard A court à $${a}$ m/s. L'animal B court à $${b}$ km/h. Lequel est le plus rapide ?`,
          choix: ['A', 'B', 'ils vont à la même vitesse'], correct: a * 3.6 > b ? 0 : 1, ordre_fixe: true, _v: { a, b },
        };
      },
      indices: ['On ne peut comparer que dans la même unité.', 'Convertis les m/s en km/h (× 3,6).', 'Puis compare les deux nombres.'],
      correction_etapes: (st) => [`$${st._v.a}$ m/s $= ${st._v.a} \\times 3{,}6 = ${tex(st._v.a * 3.6)}$ km/h.`, `On compare $${tex(st._v.a * 3.6)}$ km/h et $${st._v.b}$ km/h : ${st._v.a * 3.6 > st._v.b ? 'A' : 'B'} est le plus rapide.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Calcule la vitesse moyenne (en km/h) :',
      generer() {
        let v, T, d;
        do { v = 6 * randInt(3, 20); T = pick([40, 45, 75, 80, 90, 100, 105, 135, 150, 160]); d = (v * T) / 60; } while (!Number.isInteger(d));
        return { enonce: `Un automobiliste parcourt $${d}$ km en $${duree(T)}$. Quelle est sa vitesse moyenne ?`, reponse: v, validation: 'nombre', _v: { v, T, d } };
      },
      indices: ['Convertis d\'abord la durée en heures décimales.', 'Minutes ÷ 60 : $15$ min $= 0{,}25$ h, $20$ min $\\approx 0{,}33$ h…', `Tu peux aussi passer par la vitesse en km/min, puis multiplier par 60.`],
      correction_etapes(st) {
        const { v, T, d } = st._v;
        return [`Durée : $${duree(T)} = ${T}$ min.`, `Distance en 1 minute : $${d} \\div ${T} = ${tex(arrondi(d / T, 4))}$ km.`, `En 60 minutes : $${tex(arrondi(d / T, 4))} \\times 60 = ${v}$ km/h.`];
      },
    },
    {
      id: 'e08', niveau: 3, type: 'saisie', consigne: 'Débit — calcule la durée de remplissage (en minutes) :',
      generer() {
        const q = pick([8, 10, 12, 15, 20, 25]), t = pick([12, 15, 20, 24, 30, 40, 45, 60]);
        return { enonce: `Un robinet a un débit de $${q}$ L/min. Combien de minutes faut-il pour remplir une cuve de $${q * t}$ L ?`, reponse: t, validation: 'nombre', _v: { q, t } };
      },
      indices: ['Débit $= \\dfrac{\\text{volume}}{\\text{durée}}$.', 'Donc durée $= \\dfrac{\\text{volume}}{\\text{débit}}$.', 'Divise le volume par le débit.'],
      correction_etapes: (st) => [`Durée $= \\dfrac{\\text{volume}}{\\text{débit}} = \\dfrac{${st._v.q * st._v.t}}{${st._v.q}}$.`, `Durée $= ${st._v.t}$ min${st._v.t >= 60 ? ` (soit ${duree(st._v.t)})` : ''}.`],
    },
    {
      id: 'e09', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul de l\'heure d\'arrivée :',
      generer() {
        const v = pick([60, 80, 90, 120]), T = pick([45, 90, 105, 135, 150]), d = (v * T) / 60, h0 = randInt(7, 15);
        const arr = h0 * 60 + 15 + T;
        return {
          etapes: [
            `Écrire la formule : $t = \\dfrac{d}{v} = \\dfrac{${tex(d)}}{${v}}$`,
            `Calculer la durée en heures : $t = ${tex(T / 60)}$ h`,
            `Convertir en heures et minutes : $t = ${duree(T)}$`,
            `Ajouter la durée à l'heure de départ ($${h0}$ h $15$) : arrivée à $${Math.floor(arr / 60)}$ h $${String(arr % 60).padStart(2, '0')}$`,
          ],
        };
      },
      indices: ['On calcule d\'abord la durée du trajet.', 'On convertit la durée avant de l\'ajouter à une heure.', 'L\'heure d\'arrivée vient en dernier.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
    {
      id: 'e10', niveau: 3, type: 'complete', consigne: 'Calcule l\'heure d\'arrivée :',
      generer() {
        const v = pick([60, 80, 90, 100, 120]), T = pick([30, 45, 75, 90, 105, 120, 135, 150]), d = (v * T) / 60;
        const h0 = randInt(6, 16), m0 = pick([0, 10, 15, 20, 30, 40, 45, 50]), arr = h0 * 60 + m0 + T;
        return {
          enonce_complete: `Un car part à $${h0}$ h $${String(m0).padStart(2, '0')}$ et roule à $${v}$ km/h de moyenne pour un trajet de $${tex(d)}$ km. Il arrive à {0} h {1} min.`,
          champs: [{ reponse: Math.floor(arr / 60), validation: 'nombre' }, { reponse: arr % 60, validation: 'nombre' }],
          _v: { v, T, d, h0, m0, arr },
        };
      },
      indices: ['Durée du trajet : $t = \\dfrac{d}{v}$ (en heures).', 'Convertis cette durée en heures et minutes.', 'Ajoute-la à l\'heure de départ (60 min = 1 h).'],
      correction_etapes(st) {
        const { v, T, d, h0, m0, arr } = st._v;
        return [`$t = \\dfrac{${tex(d)}}{${v}} = ${tex(T / 60)}$ h, soit $${duree(T)}$.`, `$${h0}$ h $${String(m0).padStart(2, '0')}$ + $${duree(T)}$ = $${Math.floor(arr / 60)}$ h $${String(arr % 60).padStart(2, '0')}$.`];
      },
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'La formule de la vitesse moyenne est :', choix: ['v = \\dfrac{d}{t}', 'v = d \\times t', 'v = \\dfrac{t}{d}', 'v = d + t'], correct: 0, explication: 'Vitesse = distance ÷ durée.' },
    { type: 'saisie', question: 'Combien d\'heures décimales font $1$ h $45$ min ?', reponse: 1.75, validation: 'nombre', explication: '$45 \\div 60 = 0{,}75$, donc $1{,}75$ h.' },
    {
      type: 'saisie', question: 'Distance parcourue.',
      generer() { const v = pick([40, 60, 80, 90]), t = pick([2, 3, 1.5, 2.5]); return { question: `Quelle distance (en km) parcourt-on en $${tex(t)}$ h à $${v}$ km/h ?`, reponse: v * t, validation: 'nombre', explication: `$d = ${v} \\times ${tex(t)} = ${tex(v * t)}$ km.` }; },
    },
    { type: 'vrai_faux', question: '$1{,}5$ h correspond à $1$ h $50$ min.', reponse: false, explication: 'Non : $0{,}5$ h $= 30$ min, donc $1{,}5$ h $= 1$ h $30$ min.' },
    {
      type: 'saisie', question: 'Conversion en km/h.',
      generer() { const k = pick([5, 10, 15, 20, 25]); return { question: `Convertis $${k}$ m/s en km/h.`, reponse: arrondi(k * 3.6, 2), validation: 'nombre', explication: `$${k} \\times 3{,}6 = ${tex(k * 3.6)}$ km/h.` }; },
    },
  ],
};
