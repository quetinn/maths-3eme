// =====================================================================
//  v08_reperage.js — 5ᵉ : abscisse sur une droite graduée (relatifs,
//  décimaux), distance entre deux points, milieu ; repère du plan,
//  coordonnées, signes des coordonnées.
//  Figure interactive : un point M déplacé dans un repère.
// =====================================================================

import { randInt, randIntNonZero, pick } from '../../engine.js';
import { tex, dec, arrondi, svg, point, repere, droiteGraduee, seg } from '../commun.js';

function repereInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>abscisse <input type="range" min="-5" max="5" value="3" data-x> <span class="fig-val" data-xv></span></label>
      <label>ordonnée <input type="range" min="-5" max="5" value="-2" data-y> <span class="fig-val" data-yv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const x = +wrap.querySelector('[data-x]').value, y = +wrap.querySelector('[data-y]').value;
    wrap.querySelector('[data-xv]').textContent = x; wrap.querySelector('[data-yv]').textContent = y;
    const R = repere({ W: 290 });
    let s = R.fond + seg([R.X(x), R.Y(0)], [R.X(x), R.Y(y)], { c: 'var(--accent)', w: 1.5, dash: true }) + seg([R.X(0), R.Y(y)], [R.X(x), R.Y(y)], { c: 'var(--accent)', w: 1.5, dash: true });
    s += point([R.X(x), R.Y(y)], 'M', 12, -6);
    wrap.querySelector('[data-svg]').innerHTML = svg(R.W, R.H, s, 'point M dans un repère');
    wrap.querySelector('[data-out]').innerHTML = `M(<strong>${x}</strong> ; <strong>${y}</strong>) — on lit d'abord l'abscisse (horizontal), puis l'ordonnée (vertical).`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

/** Repère avec des points nommés [{x, y, nom}]. */
function figPoints(points, lim = 5) {
  const R = repere({ xmin: -lim, xmax: lim, ymin: -lim, ymax: lim, W: 280 });
  return svg(R.W, R.H, R.fond + points.map((p) => point([R.X(p.x), R.Y(p.y)], p.nom, 10, -6)).join(''), 'points dans un repère');
}

const coord = (x, y) => `(${x}\\,;\\,${y})`;

export default {
  id: 'v08',
  titre: 'Repérage sur une droite et dans le plan',
  theme: 'geometrie', niveau: '5e',
  icone: '📍',

  intro:
    "Pour indiquer une position sans ambiguïté, on utilise des nombres : un étage (négatif au sous-sol), une case " +
    "de bataille navale, une position GPS… Sur une <strong>droite graduée</strong>, un nombre suffit (l'abscisse) ; " +
    "dans le <strong>plan</strong>, il en faut deux (les coordonnées). C'est la base des graphiques, des jeux vidéo et de la programmation.",

  cours: [
    {
      type: 'definition', titre: 'Abscisse sur une droite graduée',
      contenu: "Une droite graduée a une origine $O$ (d'abscisse $0$), un sens et une unité. Chaque point est repéré par un nombre relatif, son <strong>abscisse</strong> : positif à droite de $O$, négatif à gauche. On note $A(-3)$ pour « $A$ a pour abscisse $-3$ ».",
    },
    {
      type: 'propriete', titre: 'Distance et milieu sur une droite graduée',
      contenu: "La distance entre deux points est la différence entre la plus grande et la plus petite abscisse. L'abscisse du milieu est la moyenne des deux abscisses.",
      formule: 'A(-3),\\ B(5) : \\quad AB = 5 - (-3) = 8 \\qquad \\text{milieu} : \\dfrac{-3 + 5}{2} = 1',
    },
    {
      type: 'definition', titre: 'Repère du plan et coordonnées',
      contenu: "Un repère est formé de deux droites graduées perpendiculaires qui se coupent à l'origine $O$ : l'axe des <strong>abscisses</strong> (horizontal) et l'axe des <strong>ordonnées</strong> (vertical). Un point $M$ est repéré par ses coordonnées $M(x\\,;\\,y)$ : d'abord l'abscisse $x$, puis l'ordonnée $y$.",
    },
    {
      type: 'propriete', titre: 'Signes des coordonnées',
      contenu: "Abscisse positive : à droite de l'axe vertical ; négative : à gauche. Ordonnée positive : au-dessus de l'axe horizontal ; négative : en dessous. Un point de l'axe des abscisses a une ordonnée nulle, un point de l'axe des ordonnées a une abscisse nulle.",
    },
    { type: 'figure', titre: 'Placer un point', contenu: "Règle l'abscisse et l'ordonnée de $M$ : les pointillés montrent comment lire ses coordonnées.", render: (host) => repereInteractif(host) },
    {
      type: 'exemple', enonce: 'Placer le point $K(-2\\,;\\,3)$ dans un repère.',
      solution_etapes: ["On part de l'origine $O$.", "Abscisse $-2$ : on se déplace de $2$ unités vers la gauche.", "Ordonnée $3$ : on monte de $3$ unités. On place $K$."],
    },
  ],

  methode: [
    { etape: 1, titre: 'Trouver l\'unité', explication: "Sur une droite graduée, compte le nombre de graduations entre deux nombres connus pour savoir ce que vaut une graduation." },
    { etape: 2, titre: 'Lire dans le bon ordre', explication: "Coordonnées : $(\\text{abscisse}\\,;\\,\\text{ordonnée})$ — horizontal d'abord, vertical ensuite." },
    { etape: 3, titre: 'Regarder les signes', explication: "Gauche ou en bas ⇒ négatif ; droite ou en haut ⇒ positif." },
    { etape: 4, titre: 'Distance, milieu', explication: "Distance $=$ grande abscisse $-$ petite abscisse ; milieu $=$ moyenne des abscisses." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Lis l\'abscisse du point A :',
      generer() {
        const pas = pick([1, 1, 0.5, 2]), x = arrondi(randInt(-8, 8) * pas, 2);
        const min = pas === 2 ? -16 : pas === 0.5 ? -4 : -8, max = -min;
        return {
          enonce: 'Quelle est l\'abscisse du point $A$ ?',
          reponse: x, validation: 'nombre', _v: { x, pas },
          visuel: (h) => { h.innerHTML = droiteGraduee({ min, max, pas, etiq: 2, points: [{ x, nom: 'A' }], W: 340 }); },
        };
      },
      indices: ['Repère l\'origine et les nombres écrits.', 'Calcule la valeur d\'une graduation.', 'À gauche de 0, les abscisses sont négatives.'],
      correction_etapes: (st) => [`Une graduation vaut $${tex(st._v.pas)}$.`, `$A$ est ${st._v.x === 0 ? 'à l\'origine' : `à ${dec(Math.abs(st._v.x) / st._v.pas)} graduation(s) à ${st._v.x > 0 ? 'droite' : 'gauche'} de $0$`} : son abscisse est $${tex(st._v.x)}$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'qcm', consigne: 'Lis les coordonnées du point B :',
      generer() {
        let x, y; do { x = randIntNonZero(-4, 4); y = randIntNonZero(-4, 4); } while (Math.abs(x) === Math.abs(y));
        return {
          enonce: 'Quelles sont les coordonnées du point $B$ ?',
          choix: [coord(x, y), coord(y, x), coord(-x, y), coord(x, -y)], correct: 0, _v: { x, y },
          visuel: (h) => { h.innerHTML = figPoints([{ x, y, nom: 'B' }]); },
        };
      },
      indices: ['On lit d\'abord l\'abscisse, sur l\'axe horizontal.', 'Puis l\'ordonnée, sur l\'axe vertical.', 'Attention aux signes : à gauche ou en bas, c\'est négatif.'],
      correction_etapes: (st) => [`Abscisse : on descend (ou monte) de $B$ jusqu'à l'axe horizontal et on lit $${st._v.x}$.`, `Ordonnée : on va horizontalement jusqu'à l'axe vertical et on lit $${st._v.y}$.`, `$B${coord(st._v.x, st._v.y)}$.`],
    },
    {
      id: 'e03', niveau: 1, type: 'complete', consigne: 'Écris les coordonnées du point C :',
      generer() {
        const x = randInt(-4, 4), y = randInt(-4, 4);
        return {
          enonce_complete: 'Le point $C$ a pour coordonnées $C($ {0} $;$ {1} $)$',
          champs: [{ reponse: x, validation: 'nombre' }, { reponse: y, validation: 'nombre' }], _v: { x, y },
          visuel: (h) => { h.innerHTML = figPoints([{ x, y, nom: 'C' }]); },
        };
      },
      indices: ['Abscisse = lecture horizontale.', 'Ordonnée = lecture verticale.', 'Un point sur un axe a une coordonnée nulle.'],
      correction_etapes: (st) => [`Abscisse de $C$ : $${st._v.x}$ ; ordonnée : $${st._v.y}$.`, `$C${coord(st._v.x, st._v.y)}$.`],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la distance AB :',
      generer() {
        let a, b; do { a = randInt(-12, 12) + pick([0, 0, 0.5]); b = randInt(-12, 12); } while (a === b || (a < 0) === (b < 0) && Math.random() < 0.6);
        return { enonce: `Sur une droite graduée, $A(${tex(a)})$ et $B(${b})$. Calcule la distance $AB$.`, reponse: arrondi(Math.abs(a - b), 2), validation: 'nombre', _v: { a, b } };
      },
      indices: ['Distance = plus grande abscisse − plus petite abscisse.', 'Soustraire un négatif revient à ajouter.', 'Une distance est toujours positive.'],
      correction_etapes(st) {
        const { a, b } = st._v, g = Math.max(a, b), p = Math.min(a, b);
        return [`Plus grande abscisse : $${tex(g)}$ ; plus petite : $${tex(p)}$.`, `$AB = ${tex(g)} - ${p < 0 ? `(${tex(p)})` : tex(p)} = ${tex(g - p)}$.`];
      },
    },
    {
      id: 'e05', niveau: 2, type: 'qcm', consigne: 'Où est situé le point ?',
      generer() {
        const x = randIntNonZero(-9, 9), y = randIntNonZero(-9, 9);
        const choix = ['à droite de l\'axe vertical et au-dessus de l\'axe horizontal', 'à gauche de l\'axe vertical et au-dessus de l\'axe horizontal', 'à gauche de l\'axe vertical et en dessous de l\'axe horizontal', 'à droite de l\'axe vertical et en dessous de l\'axe horizontal'];
        const correct = x > 0 ? (y > 0 ? 0 : 3) : (y > 0 ? 1 : 2);
        return { enonce: `Le point $P${coord(x, y)}$ est situé :`, choix, correct, ordre_fixe: true, _v: { x, y } };
      },
      indices: ['Regarde le signe de l\'abscisse : gauche ou droite ?', 'Regarde le signe de l\'ordonnée : haut ou bas ?', 'Combine les deux informations.'],
      correction_etapes: (st) => [`Abscisse $${st._v.x}$ ${st._v.x > 0 ? 'positive : à droite' : 'négative : à gauche'} de l'axe vertical.`, `Ordonnée $${st._v.y}$ ${st._v.y > 0 ? 'positive : au-dessus' : 'négative : en dessous'} de l'axe horizontal.`],
    },
    {
      id: 'e06', niveau: 2, type: 'saisie', consigne: 'Calcule l\'abscisse du milieu :',
      generer() {
        let a, b; do { a = randInt(-12, 10); b = randInt(-10, 12); } while (a === b || (a + b) % 2 !== 0 && Math.random() < 0.5);
        return { enonce: `Sur une droite graduée, $A(${a})$ et $B(${b})$. Quelle est l'abscisse du milieu $I$ de $[AB]$ ?`, reponse: (a + b) / 2, validation: 'nombre', _v: { a, b } };
      },
      indices: ['Le milieu est à égale distance de $A$ et $B$.', 'Son abscisse est la moyenne des deux abscisses.', '$\\dfrac{a + b}{2}$.'],
      correction_etapes: (st) => [`$x_I = \\dfrac{${st._v.a} + ${st._v.b < 0 ? `(${st._v.b})` : st._v.b}}{2} = \\dfrac{${st._v.a + st._v.b}}{2}$.`, `$x_I = ${tex((st._v.a + st._v.b) / 2)}$.`],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Graduation inhabituelle — lis l\'abscisse de A :',
      generer() {
        const pas = pick([0.2, 0.25, 5, 10, 3]), k = randInt(-6, 6) || 3, x = arrondi(k * pas, 2);
        const min = arrondi(-8 * pas, 2), max = arrondi(8 * pas, 2);
        return {
          enonce: `Sur cette droite, seuls $0$ et $${tex(arrondi(4 * pas, 2))}$ sont indiqués. Quelle est l'abscisse de $A$ ?`,
          reponse: x, validation: 'nombre', _v: { pas, k, x },
          visuel: (h) => { h.innerHTML = droiteGraduee({ min, max, pas, seulement: [0, arrondi(4 * pas, 2)], points: [{ x, nom: 'A' }], W: 340 }); },
        };
      },
      indices: ['Compte les graduations entre $0$ et le nombre indiqué.', 'Divise ce nombre par le nombre de graduations : c\'est la valeur d\'une graduation.', 'Compte les graduations jusqu\'à $A$ (attention au côté).'],
      correction_etapes: (st) => [`Entre $0$ et $${tex(4 * st._v.pas)}$, il y a $4$ graduations : une graduation vaut $${tex(4 * st._v.pas)} \\div 4 = ${tex(st._v.pas)}$.`, `$A$ est à $${Math.abs(st._v.k)}$ graduations à ${st._v.k > 0 ? 'droite' : 'gauche'} de $0$ : $${st._v.k > 0 ? '' : '-'}${Math.abs(st._v.k)} \\times ${tex(st._v.pas)} = ${tex(st._v.x)}$.`],
    },
    {
      id: 'e08', niveau: 3, type: 'complete', consigne: 'Trouve les coordonnées du 4ᵉ sommet :',
      generer() {
        const x1 = randInt(-4, 0), x2 = randInt(1, 4), y1 = randInt(-4, 0), y2 = randInt(1, 4);
        return {
          enonce_complete: `$ABCD$ est un rectangle dont les côtés sont parallèles aux axes. $A${coord(x1, y1)}$, $B${coord(x2, y1)}$, $C${coord(x2, y2)}$. Donc $D($ {0} $;$ {1} $)$`,
          champs: [{ reponse: x1, validation: 'nombre' }, { reponse: y2, validation: 'nombre' }], _v: { x1, x2, y1, y2 },
          visuel: (h) => { h.innerHTML = figPoints([{ x: x1, y: y1, nom: 'A' }, { x: x2, y: y1, nom: 'B' }, { x: x2, y: y2, nom: 'C' }]); },
        };
      },
      indices: ['Place les trois points dans le repère.', '$D$ est au-dessus de $A$ : même abscisse que $A$.', '$D$ est à la même hauteur que $C$ : même ordonnée que $C$.'],
      correction_etapes: (st) => [`$D$ est sur la verticale de $A$ : abscisse $${st._v.x1}$.`, `$D$ est sur l'horizontale de $C$ : ordonnée $${st._v.y2}$. Donc $D${coord(st._v.x1, st._v.y2)}$.`],
    },
    {
      id: 'e09', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre les étapes pour placer le point :',
      generer() {
        const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5);
        return { etapes: [`Partir de l'origine $O$ du repère`, `Se déplacer horizontalement de $${Math.abs(x)}$ vers la ${x > 0 ? 'droite' : 'gauche'} (abscisse $${x}$)`, `Se déplacer verticalement de $${Math.abs(y)}$ vers le ${y > 0 ? 'haut' : 'bas'} (ordonnée $${y}$)`, `Marquer le point $M${coord(x, y)}$`] };
      },
      indices: ['On part toujours de l\'origine.', 'L\'abscisse se lit en premier.', 'On marque le point à la fin.'],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: 'Dans $M(4\\,;\\,-1)$, l\'ordonnée est :', choix: ['-1', '4', '3', '5'], correct: 0, explication: 'Le 2ᵉ nombre est l\'ordonnée : $-1$.' },
    { type: 'vrai_faux', question: 'Le point $(0\\,;\\,5)$ est sur l\'axe des ordonnées.', reponse: true, explication: 'Son abscisse est nulle : il est sur l\'axe vertical.' },
    {
      type: 'saisie', question: 'Distance.',
      generer() { const a = -randInt(1, 9), b = randInt(1, 9); return { question: `$A(${a})$ et $B(${b})$ sur une droite graduée. Calcule $AB$.`, reponse: b - a, validation: 'nombre', explication: `$${b} - (${a}) = ${b - a}$.` }; },
    },
    { type: 'qcm', question: 'Le point $(-3\\,;\\,-2)$ est :', choix: ['en bas à gauche', 'en haut à gauche', 'en bas à droite', 'en haut à droite'], correct: 0, ordre_fixe: true, explication: 'Abscisse négative (gauche), ordonnée négative (bas).' },
    {
      type: 'saisie', question: 'Milieu.',
      generer() { const a = -2 * randInt(1, 5), b = 2 * randInt(1, 6); return { question: `$A(${a})$ et $B(${b})$. Abscisse du milieu de $[AB]$ ?`, reponse: (a + b) / 2, validation: 'nombre', explication: `$\\dfrac{${a} + ${b}}{2} = ${(a + b) / 2}$.` }; },
    },
  ],
};
