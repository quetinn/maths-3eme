// =====================================================================
//  r07_equations.js — Rappel de 4ᵉ : tester une égalité, résoudre
//  ax + b = c, mettre un problème en équation.
//  Figure interactive : balance (slider x → le fléau s'équilibre).
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';

// Balance interactive pour l'équation 2x + 3 = 11 (solution x = 4).
function balanceFig(host) {
  const A = 2, B = 3, C = 11;
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls"><label>x <input type="range" min="0" max="8" value="2" data-x> <span class="fig-val" data-xv></span></label></div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const x = +wrap.querySelector('[data-x]').value; wrap.querySelector('[data-xv]').textContent = x;
    const left = A * x + B, right = C, diff = left - right;
    const ang = Math.max(-15, Math.min(15, diff * 2.3));
    const W = 320, H = 168, cx = 160, py = 56;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="balance">`;
    g += `<polygon points="${cx},${py} ${cx - 15},${py + 80} ${cx + 15},${py + 80}" fill="var(--surface-2)" stroke="var(--border)"/>`;
    g += `<line x1="${cx - 22}" y1="${py + 80}" x2="${cx + 22}" y2="${py + 80}" stroke="var(--muted)" stroke-width="2"/>`;
    g += `<g transform="rotate(${ang.toFixed(1)} ${cx} ${py})">`;
    g += `<line x1="${cx - 118}" y1="${py}" x2="${cx + 118}" y2="${py}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>`;
    g += `<line x1="${cx - 118}" y1="${py}" x2="${cx - 118}" y2="${py + 26}" stroke="var(--muted)"/>`;
    g += `<line x1="${cx + 118}" y1="${py}" x2="${cx + 118}" y2="${py + 26}" stroke="var(--muted)"/>`;
    g += `<rect x="${cx - 148}" y="${py + 26}" width="60" height="22" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="${cx - 118}" y="${py + 41}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent-ink)">${left}</text>`;
    g += `<rect x="${cx + 88}" y="${py + 26}" width="60" height="22" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="${cx + 118}" y="${py + 41}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent-ink)">${right}</text>`;
    g += `</g></svg>`;
    svgHost.innerHTML = g;
    readout.innerHTML = diff === 0
      ? `Équilibre ! <strong>2x + 3 = 11</strong> est vraie pour <strong>x = ${x}</strong> ✓`
      : `2×${x} + 3 = ${left} ${diff > 0 ? '>' : '<'} 11 — le plateau ${diff > 0 ? 'gauche' : 'droit'} penche`;
  }
  wrap.querySelector('[data-x]').addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r07',
  titre: 'Équations (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '⚖️',

  intro:
    "Résoudre une équation, c'est trouver la valeur de l'inconnue qui rend l'égalité vraie — comme équilibrer " +
    "une balance. En 4ᵉ on apprend à tester une valeur et à résoudre $ax + b = c$. C'est le socle des équations " +
    "de 3ᵉ (équations-produit, mise en équation de problèmes).",

  cours: [
    { type: 'definition', titre: 'Équation et solution', contenu: "Une solution est une valeur de l'inconnue qui rend l'égalité vraie. La <strong>tester</strong> : on remplace et on vérifie." },
    { type: 'propriete', titre: 'Règle d\'équilibre', contenu: "On peut ajouter / soustraire un même nombre, ou multiplier / diviser par un même nombre non nul, <strong>des deux côtés</strong> de l'égalité.", formule: 'a = b \\iff a + k = b + k \\iff ka = kb\\ (k \\neq 0)' },
    { type: 'definition', titre: 'Résoudre $ax + b = c$', contenu: "On isole l'inconnue : on enlève d'abord $b$, puis on divise par $a$.", formule: 'ax + b = c \\;\\Rightarrow\\; ax = c - b \\;\\Rightarrow\\; x = \\dfrac{c-b}{a}' },
    { type: 'figure', titre: 'Équilibrer la balance', contenu: "L'équation $2x + 3 = 11$ : règle $x$ pour équilibrer les deux plateaux. L'équilibre est atteint pour la solution.", render: (host) => balanceFig(host) },
    { type: 'exemple', enonce: 'Résoudre $2x + 3 = 11$.', solution_etapes: ["On enlève $3$ des deux côtés : $2x = 8$.", "On divise par $2$ : $x = 4$.", "Vérification : $2 \\times 4 + 3 = 11$. ✓"] },
  ],

  methode: [
    { etape: 1, titre: 'Tester une valeur', explication: "Remplace l'inconnue par le nombre proposé : si les deux membres sont égaux, c'est une solution." },
    { etape: 2, titre: 'Isoler le terme en $x$', explication: "Enlève le nombre ($b$) des deux côtés." },
    { etape: 3, titre: 'Diviser', explication: "Divise les deux côtés par le coefficient de $x$." },
    { etape: 4, titre: 'Vérifier', explication: "Remplace ta solution dans l'équation de départ." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Résous (donne x) :',
      generer() { const b = randInt(1, 9), sol = randInt(-6, 9); return { enonce: `$x + ${b} = ${sol + b}$`, reponse: sol, validation: 'nombre' }; },
      indices: ['Enlève le nombre des deux côtés.', '$x = (\\text{membre de droite}) - (\\text{nombre})$.', 'Attention au signe du résultat.'],
      correction_detaillee: () => `<p>On soustrait le nombre des deux côtés pour isoler $x$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète la résolution :',
      generer() { const a = randInt(2, 6), sol = randInt(2, 8), b = randInt(1, 9), c = a * sol + b; return { enonce_complete: `$${a}x + ${b} = ${c}$ donc $${a}x = $ {0} $,$ donc $x = $ {1}`, champs: [{ reponse: a * sol, validation: 'nombre' }, { reponse: sol, validation: 'nombre' }], _v: { a, b, c, sol } }; },
      indices: ['On enlève d\'abord le nombre.', 'Premier champ : la valeur de $ax$.', 'Second champ : on divise par le coefficient.'],
      correction_etapes(st) { const { a, b, c, sol } = st._v; return [`On enlève $${b}$ : $${a}x = ${c} - ${b} = ${c - b}$.`, `On divise par $${a}$ : $x = ${sol}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Résous (donne x) :',
      generer() { const a = randInt(2, 6), b = randIntNonZero(-9, 9), sol = randInt(-5, 6); return { enonce: `$${a}x + ${b < 0 ? '(' + b + ')' : b} = ${a * sol + b}$`, reponse: sol, validation: 'nombre' }; },
      indices: ['Enlève le nombre des deux côtés.', 'Tu obtiens $ax = $ quelque chose.', 'Divise par $a$.'],
      correction_detaillee: () => `<p>On isole $ax$, puis on divise par $a$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre la résolution :',
      generer() { const a = randInt(2, 6), sol = randInt(2, 8), b = randInt(1, 9), c = a * sol + b; return { etapes: [`On part de $${a}x + ${b} = ${c}$`, `On enlève $${b}$ des deux côtés : $${a}x = ${c - b}$`, `On divise par $${a}$ : $x = ${sol}$`, `Vérification : $${a} \\times ${sol} + ${b} = ${c}$ ✓`] }; },
      indices: ['On isole le terme en $x$ avant de diviser.', 'On divise seulement à la fin.', 'La vérification est la dernière étape.'],
      correction_detaillee: () => `<p>Ordre : équation → enlever le nombre → diviser → vérifier.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Mise en équation — trouve le nombre :',
      generer() { const a = randInt(2, 5), sol = randInt(2, 9), b = randInt(1, 9), c = a * sol + b; return { enonce: `Je pense à un nombre, je le multiplie par $${a}$ et j'ajoute $${b}$ : j'obtiens $${c}$. Quel est ce nombre ?`, reponse: sol, validation: 'nombre', _v: { a, b, c, sol } }; },
      indices: ['Appelle le nombre $x$ et écris l\'équation.', '$ax + b = c$.', 'Résous : enlève $b$, puis divise par $a$.'],
      correction_etapes(st) { const { a, b, c, sol } = st._v; return [`On pose l'équation : $${a}x + ${b} = ${c}$.`, `On enlève $${b}$ : $${a}x = ${c - b}$.`, `On divise par $${a}$ : $x = ${sol}$.`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'vrai_faux', consigne: 'La valeur proposée est-elle solution ?',
      generer() { const a = randInt(2, 5), b = randIntNonZero(-6, 6), sol = randInt(-4, 6), c = a * sol + b; const test = Math.random() < 0.5 ? sol : sol + pick([1, -1, 2]); return { enonce: `$${a}x + ${b < 0 ? '(' + b + ')' : b} = ${c}$. La valeur $x = ${test}$ est-elle solution ?`, reponse: a * test + b === c }; },
      indices: ['Remplace $x$ par la valeur et calcule le membre de gauche.', 'Compare-le au membre de droite.', 'Égaux → solution ; différents → non.'],
      correction_detaillee: () => `<p>On remplace $x$ par la valeur et on vérifie l'égalité.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Résous une équation.', generer() { const a = randInt(2, 6), sol = randInt(2, 8), b = randInt(1, 9); return { question: `Résous $${a}x + ${b} = ${a * sol + b}$.`, reponse: sol, validation: 'nombre', explication: `$${a}x = ${a * sol}$ donc $x = ${sol}$.` }; } },
    { type: 'qcm', question: 'Pour résoudre $3x = 12$, on :', choix: ['divise par 3', 'multiplie par 3', 'ajoute 3', 'enlève 3'], correct: 0, explication: '$x = 12 \\div 3 = 4$.' },
    { type: 'saisie', question: 'Résous $x + 7 = 2$.', reponse: -5, validation: 'nombre', explication: '$x = 2 - 7 = -5$.' },
    { type: 'vrai_faux', question: '$x = 3$ est-il solution de $2x + 1 = 7$ ?', reponse: true, explication: '$2 \\times 3 + 1 = 7$. ✓' },
    { type: 'saisie', question: 'Mise en équation.', generer() { const a = randInt(2, 5), sol = randInt(2, 8), b = randInt(1, 9); return { question: `Un nombre multiplié par $${a}$ puis augmenté de $${b}$ donne $${a * sol + b}$. Quel est ce nombre ?`, reponse: sol, validation: 'nombre', explication: `$${a}x + ${b} = ${a * sol + b}$, donc $x = ${sol}$.` }; } },
  ],
};
