// =====================================================================
//  r01_pythagore.js — Rappel de 4ᵉ : théorème de Pythagore et réciproque
//  Figure SVG d'un triangle rectangle (angle droit en A), thémée par
//  variables CSS (contraste correct en clair comme en sombre).
// =====================================================================

import { randInt, pick } from '../engine.js';

const round1 = (x) => Math.round(x * 10) / 10;
// Triplets pythagoriciens (a < b < c) → réponses entières.
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29], [12, 16, 20]];

const SVGNS = 'http://www.w3.org/2000/svg';
// Triangle rectangle en A (bas-gauche). AB = côté bas, AC = côté gauche, BC = hypoténuse.
function pythagoreFig(host, { ab = '', ac = '', bc = '' } = {}) {
  const W = 240, H = 200;
  const A = [44, 158], B = [206, 158], C = [44, 40];
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'svg-plot'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Triangle rectangle en A');
  const line = (p, q, c, w = 2.5) => { const l = document.createElementNS(SVGNS, 'line'); l.setAttribute('x1', p[0]); l.setAttribute('y1', p[1]); l.setAttribute('x2', q[0]); l.setAttribute('y2', q[1]); l.setAttribute('stroke', c); l.setAttribute('stroke-width', w); svg.appendChild(l); };
  const txt = (x, y, s, fill = 'var(--text)') => { const t = document.createElementNS(SVGNS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('fill', fill); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 13); t.setAttribute('font-weight', '600'); t.textContent = s; svg.appendChild(t); };
  line(A, B, 'var(--accent)'); line(A, C, 'var(--accent)'); line(B, C, 'var(--t-geometrie)');
  // Marque de l'angle droit en A.
  const sq = document.createElementNS(SVGNS, 'path'); sq.setAttribute('d', `M ${A[0] + 14} ${A[1]} L ${A[0] + 14} ${A[1] - 14} L ${A[0]} ${A[1] - 14}`); sq.setAttribute('fill', 'none'); sq.setAttribute('stroke', 'var(--muted)'); svg.appendChild(sq);
  // Sommets.
  txt(A[0] - 10, A[1] + 6, 'A'); txt(B[0] + 10, B[1] + 6, 'B'); txt(C[0] - 10, C[1] - 2, 'C');
  // Longueurs des côtés.
  if (ab !== '') txt((A[0] + B[0]) / 2, A[1] + 20, ab, 'var(--accent-ink)');
  if (ac !== '') txt(A[0] - 18, (A[1] + C[1]) / 2 + 4, ac, 'var(--accent-ink)');
  if (bc !== '') txt((B[0] + C[0]) / 2 + 12, (B[1] + C[1]) / 2 - 2, bc, 'var(--accent-ink)');
  host.appendChild(svg);
}

// Figure interactive : on règle AB et AC, les carrés des côtés et l'égalité
// AB² + AC² = BC² se mettent à jour en direct.
function pythagoreInteractif(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>AB <input type="range" min="2" max="8" value="4" data-ab> <span class="fig-val" data-abv></span></label>
      <label>AC <input type="range" min="2" max="8" value="3" data-ac> <span class="fig-val" data-acv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const ab = +wrap.querySelector('[data-ab]').value, ac = +wrap.querySelector('[data-ac]').value;
    wrap.querySelector('[data-abv]').textContent = ab; wrap.querySelector('[data-acv]').textContent = ac;
    const bc2 = ab * ab + ac * ac, bc = Math.round(Math.sqrt(bc2) * 100) / 100;
    const VB = 300, M = 26, s = Math.min(18, (VB - 2 * M) / (ab + ac));
    const Ax = M + ac * s, Ay = M + ac * s, Bx = Ax + ab * s, Cy = Ay - ac * s;
    let g = `<svg viewBox="0 0 ${VB} ${VB}" class="svg-plot" role="img" aria-label="triangle rectangle et carrés des côtés">`;
    g += `<rect x="${Ax.toFixed(1)}" y="${Ay.toFixed(1)}" width="${(ab * s).toFixed(1)}" height="${(ab * s).toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>`;
    g += `<text x="${(Ax + ab * s / 2).toFixed(1)}" y="${(Ay + ab * s / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-ink)">${ab * ab}</text>`;
    g += `<rect x="${(Ax - ac * s).toFixed(1)}" y="${Cy.toFixed(1)}" width="${(ac * s).toFixed(1)}" height="${(ac * s).toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>`;
    g += `<text x="${(Ax - ac * s / 2).toFixed(1)}" y="${(Cy + ac * s / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-ink)">${ac * ac}</text>`;
    g += `<polygon points="${Ax.toFixed(1)},${Ay.toFixed(1)} ${Bx.toFixed(1)},${Ay.toFixed(1)} ${Ax.toFixed(1)},${Cy.toFixed(1)}" fill="none" stroke="var(--t-geometrie)" stroke-width="2.5"/>`;
    g += `<path d="M ${(Ax + 12).toFixed(1)} ${Ay.toFixed(1)} L ${(Ax + 12).toFixed(1)} ${(Ay - 12).toFixed(1)} L ${Ax.toFixed(1)} ${(Ay - 12).toFixed(1)}" fill="none" stroke="var(--muted)"/>`;
    g += `<text x="${(Ax - 7).toFixed(1)}" y="${(Ay + 14).toFixed(1)}" font-size="12" fill="var(--text)">A</text>`;
    g += `<text x="${(Bx + 4).toFixed(1)}" y="${(Ay + 14).toFixed(1)}" font-size="12" fill="var(--text)">B</text>`;
    g += `<text x="${(Ax - 7).toFixed(1)}" y="${(Cy - 4).toFixed(1)}" font-size="12" fill="var(--text)">C</text>`;
    g += `<text x="${((Bx + Ax) / 2 + 6).toFixed(1)}" y="${((Ay + Cy) / 2 - 4).toFixed(1)}" font-size="11" font-weight="700" fill="var(--t-geometrie)">${bc}</text>`;
    g += `</svg>`;
    svgHost.innerHTML = g;
    readout.innerHTML = `AB² + AC² = ${ab * ab} + ${ac * ac} = <strong>${bc2}</strong> = BC² &nbsp;→&nbsp; BC = √${bc2} ≈ <strong>${bc}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r01',
  titre: 'Théorème de Pythagore',
  theme: 'rappels',
  priorite: false,
  icone: '📐',

  intro:
    "Le théorème de Pythagore, vu en 4ᵉ, relie les trois côtés d'un triangle <strong>rectangle</strong>. " +
    "Il permet de calculer une longueur qu'on ne peut pas mesurer (diagonale, hauteur, distance) et de " +
    "vérifier qu'un angle est bien droit. On le réutilise partout en 3ᵉ : trigonométrie, géométrie dans " +
    "l'espace, repérage. Un incontournable du brevet.",

  cours: [
    {
      type: 'propriete', titre: 'Théorème de Pythagore',
      contenu: "Si un triangle $ABC$ est rectangle en $A$, alors le carré de l'hypoténuse (le plus grand côté, opposé à l'angle droit) est égal à la somme des carrés des deux autres côtés.",
      formule: 'BC^2 = AB^2 + AC^2',
    },
    {
      type: 'definition', titre: "Calculer l'hypoténuse",
      contenu: "Quand on connaît les deux côtés de l'angle droit, on additionne leurs carrés puis on prend la racine carrée.",
      formule: 'BC = \\sqrt{AB^2 + AC^2}',
    },
    {
      type: 'definition', titre: "Calculer un côté de l'angle droit",
      contenu: "Quand on connaît l'hypoténuse et un côté, on <strong>soustrait</strong> les carrés (erreur classique : ne pas additionner !).",
      formule: 'AB = \\sqrt{BC^2 - AC^2}',
    },
    {
      type: 'propriete', titre: 'Réciproque (prouver un angle droit)',
      contenu: "Réciproquement, si dans un triangle $BC^2 = AB^2 + AC^2$ (avec $BC$ le plus grand côté), alors le triangle est rectangle en $A$. Si l'égalité est fausse, le triangle n'est pas rectangle.",
    },
    {
      type: 'figure', titre: 'Théorème de Pythagore en images',
      contenu: "Règle $AB$ et $AC$ : l'aire du carré sur l'hypoténuse (BC²) est toujours égale à la somme des aires des carrés sur les deux côtés (AB² + AC²).",
      render: (host) => pythagoreInteractif(host),
    },
    {
      type: 'exemple', enonce: 'Triangle rectangle en $A$, $AB=3$, $AC=4$. Calculer $BC$.',
      solution_etapes: [
        "Pythagore : $BC^2 = AB^2 + AC^2 = 3^2 + 4^2$.",
        "$BC^2 = 9 + 16 = 25$.",
        "$BC = \\sqrt{25} = 5$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: "Repérer l'angle droit", explication: "Identifie le sommet de l'angle droit : l'hypoténuse est le côté opposé (le plus long)." },
    { etape: 2, titre: 'Écrire la relation', explication: "$(\\text{hypoténuse})^2 = (\\text{côté})^2 + (\\text{côté})^2$." },
    { etape: 3, titre: 'Remplacer et calculer les carrés', explication: "Remplace par les valeurs connues, puis calcule chaque carré." },
    { etape: 4, titre: "Isoler l'inconnue", explication: "Pour l'hypoténuse : racine carrée de la somme. Pour un côté de l'angle droit : soustrais les carrés, puis racine carrée." },
  ],

  exercices: [
    // ----- Niveau 1 : Découverte -----
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: "Calcule l'hypoténuse :",
      generer() {
        const [a, b, c] = pick(TRIPLES), k = randInt(1, 3);
        return { enonce: `Triangle rectangle en $A$, $AB=${a * k}$, $AC=${b * k}$. Calcule $BC$.`, reponse: c * k, validation: 'nombre', visuel: (h) => pythagoreFig(h, { ab: String(a * k), ac: String(b * k), bc: '?' }) };
      },
      indices: ['$BC^2 = AB^2 + AC^2$.', 'Additionne les carrés des deux côtés de l\'angle droit.', 'Prends la racine carrée de la somme.'],
      correction_detaillee: () => `<p>$BC = \\sqrt{AB^2 + AC^2}$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule le côté manquant :',
      generer() {
        const [a, b, c] = pick(TRIPLES), k = randInt(1, 3);
        return { enonce: `Triangle rectangle en $A$, hypoténuse $BC=${c * k}$, $AB=${a * k}$. Calcule $AC$.`, reponse: b * k, validation: 'nombre', visuel: (h) => pythagoreFig(h, { ab: String(a * k), ac: '?', bc: String(c * k) }) };
      },
      indices: ["Ici on connaît l'hypoténuse : on soustrait.", '$AC^2 = BC^2 - AB^2$.', 'Prends la racine carrée du résultat.'],
      correction_detaillee: () => `<p>$AC = \\sqrt{BC^2 - AB^2}$.</p>`,
    },

    // ----- Niveau 2 : Application -----
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: "Calcule l'hypoténuse (arrondi au dixième) :",
      generer() {
        const a = randInt(3, 9), b = randInt(3, 9);
        return { enonce: `Triangle rectangle en $A$, $AB=${a}$, $AC=${b}$. Calcule $BC$ (au dixième).`, reponse: round1(Math.sqrt(a * a + b * b)), validation: 'nombre', tolerance: 0.02, visuel: (h) => pythagoreFig(h, { ab: String(a), ac: String(b), bc: '?' }) };
      },
      indices: ['$BC^2 = AB^2 + AC^2$.', 'La racine carrée n\'est pas toujours entière.', 'Arrondis le résultat au dixième.'],
      correction_detaillee: () => `<p>$BC = \\sqrt{AB^2 + AC^2}$, puis on arrondit au dixième.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'vrai_faux', consigne: 'Réciproque — ce triangle est-il rectangle ?',
      generer() {
        const [a, b, c0] = pick(TRIPLES);
        const estRect = Math.random() < 0.5;
        const c = estRect ? c0 : c0 + pick([1, 2, 3]);
        return { enonce: `Un triangle a pour côtés $${a}$, $${b}$ et $${c}$ (le plus grand). Est-il rectangle ?`, reponse: (c * c === a * a + b * b) };
      },
      indices: ['Compare le carré du plus grand côté à la somme des carrés des deux autres.', 'Si $c^2 = a^2 + b^2$ : le triangle est rectangle.', 'Sinon : il ne l\'est pas.'],
      correction_detaillee: () => `<p>On teste l'égalité de Pythagore avec le plus grand côté comme hypoténuse.</p>`,
    },

    // ----- Niveau 3 : Défi -----
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: "Calcule le côté de l'angle droit (arrondi au dixième) :",
      generer() {
        const b = randInt(4, 9), c = b + randInt(2, 6); // BC = c > AC = b  →  AB² = c² - b² > 0
        return { enonce: `Triangle rectangle en $A$, hypoténuse $BC=${c}$, $AC=${b}$. Calcule $AB$ (au dixième).`, reponse: round1(Math.sqrt(c * c - b * b)), validation: 'nombre', tolerance: 0.02, visuel: (h) => pythagoreFig(h, { ab: '?', ac: String(b), bc: String(c) }), _v: { b, c } };
      },
      indices: ["On connaît l'hypoténuse : $AB^2 = BC^2 - AC^2$.", 'Calcule les deux carrés puis soustrais.', 'Prends la racine carrée, puis arrondis.'],
      correction_etapes(st) {
        const { b, c } = st._v; const ab = round1(Math.sqrt(c * c - b * b));
        return [
          `L'inconnue $AB$ est un côté de l'angle droit : on soustrait. $AB^2 = BC^2 - AC^2$.`,
          `$AB^2 = ${c}^2 - ${b}^2 = ${c * c} - ${b * b} = ${c * c - b * b}$.`,
          `$AB = \\sqrt{${c * c - b * b}} \\approx ${String(ab).replace('.', '{,}')}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'qcm', consigne: 'Réciproque — choisis la bonne conclusion :',
      generer() {
        const [a, b, c0] = pick(TRIPLES);
        const estRect = Math.random() < 0.5;
        const c = estRect ? c0 : c0 + pick([1, 2]);
        const choix = ['le triangle est rectangle', 'le triangle n\'est pas rectangle'];
        return { enonce: `Côtés $${a}$, $${b}$, $${c}$. On compare : $${c}^2 = ${c * c}$ et $${a}^2 + ${b}^2 = ${a * a + b * b}$. Conclusion ?`, choix, correct: (c * c === a * a + b * b) ? 0 : 1 };
      },
      indices: ['Si les deux carrés sont égaux : rectangle.', 'Sinon : pas rectangle.', 'C\'est la réciproque de Pythagore.'],
      correction_detaillee: () => `<p>Égalité vérifiée ⇒ rectangle (réciproque) ; sinon ⇒ non rectangle.</p>`,
    },

    // ----- Niveau 1 : Compléter le calcul -----
    {
      id: 'e07', niveau: 1, type: 'complete', consigne: 'Complète le calcul de Pythagore :',
      generer() {
        const [a, b, c] = pick(TRIPLES), k = randInt(1, 2); const A = a * k, B = b * k, C = c * k;
        return {
          enonce_complete: `Rectangle en $A$, $AB=${A}$, $AC=${B}$. $BC^2 = AB^2 + AC^2 = ${A}^2 + ${B}^2 = $ {0} $,$ donc $BC = $ {1}`,
          champs: [
            { reponse: A * A + B * B, validation: 'nombre' },
            { reponse: C, validation: 'nombre' },
          ],
          visuel: (h) => pythagoreFig(h, { ab: String(A), ac: String(B), bc: '?' }),
          _v: { A, B, C },
        };
      },
      indices: ['$BC^2 = AB^2 + AC^2$.', 'Calcule les deux carrés et additionne.', '$BC$ est la racine carrée de cette somme.'],
      correction_etapes(st) {
        const { A, B, C } = st._v;
        return [
          `$AB^2 + AC^2 = ${A * A} + ${B * B} = ${A * A + B * B}$.`,
          `$BC = \\sqrt{${A * A + B * B}} = ${C}$.`,
        ];
      },
    },

    // ----- Niveau 2 : Ordonner les étapes -----
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes', consigne: "Remets dans l'ordre le calcul de l'hypoténuse :",
      generer() {
        const [a, b, c] = pick(TRIPLES);
        return {
          etapes: [
            `Repérer l'angle droit : l'hypoténuse $BC$ est l'inconnue`,
            `Écrire le théorème : $BC^2 = AB^2 + AC^2$`,
            `Remplacer par les valeurs : $BC^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$`,
            `Conclure : $BC = \\sqrt{${a * a + b * b}} = ${c}$`,
          ],
        };
      },
      indices: ['On repère d\'abord l\'hypoténuse.', 'On écrit la relation avant de remplacer.', 'La racine carrée vient en dernier.'],
      correction_detaillee: () => `<p>Ordre : repérer l'hypoténuse → écrire Pythagore → remplacer → racine carrée.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'qcm', question: "Dans un triangle rectangle, l'hypoténuse est :", choix: ["le côté opposé à l'angle droit", "le plus petit côté", "un côté de l'angle droit", "n'importe quel côté"], correct: 0, explication: "L'hypoténuse est le côté opposé à l'angle droit (le plus long)." },
    {
      type: 'saisie', question: 'Calcule une hypoténuse.',
      generer() { const [a, b, c] = pick(TRIPLES); return { question: `Triangle rectangle en $A$, $AB=${a}$, $AC=${b}$. Calcule $BC$.`, reponse: c, validation: 'nombre', explication: `$BC = \\sqrt{${a}^2+${b}^2} = \\sqrt{${a * a + b * b}} = ${c}$.` }; },
    },
    { type: 'vrai_faux', question: "Pour calculer un côté de l'angle droit, on additionne les carrés.", reponse: false, explication: "Non : on SOUSTRAIT ($AB^2 = BC^2 - AC^2$). On additionne seulement pour l'hypoténuse." },
    {
      type: 'saisie', question: "Calcule un côté de l'angle droit.",
      generer() { const [a, b, c] = pick(TRIPLES); return { question: `Triangle rectangle en $A$, $BC=${c}$, $AB=${a}$. Calcule $AC$.`, reponse: b, validation: 'nombre', explication: `$AC = \\sqrt{${c}^2-${a}^2} = \\sqrt{${c * c - a * a}} = ${b}$.` }; },
    },
    { type: 'qcm', question: 'La réciproque de Pythagore sert à :', choix: ["prouver qu'un triangle est rectangle", "calculer une aire", "mesurer un angle", "tracer un cercle"], correct: 0, explication: "Si $c^2 = a^2+b^2$ (avec $c$ le plus grand côté), le triangle est rectangle." },
  ],
};
