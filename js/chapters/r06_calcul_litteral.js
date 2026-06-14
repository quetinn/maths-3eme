// =====================================================================
//  r06_calcul_litteral.js — Rappel de 4ᵉ : distributivité simple,
//  réduire, et calculer une expression (substitution).
//  Figure interactive : aire d'un rectangle = k(a+b) = ka + kb.
// =====================================================================

import { randInt, randIntNonZero } from '../engine.js';

// Modèle d'aire de la distributivité : on règle k, a, b.
function distributiviteFig(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>k <input type="range" min="1" max="6" value="3" data-k> <span class="fig-val" data-kv></span></label>
      <label>a <input type="range" min="1" max="6" value="2" data-a> <span class="fig-val" data-av></span></label>
      <label>b <input type="range" min="1" max="6" value="4" data-b> <span class="fig-val" data-bv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const k = +wrap.querySelector('[data-k]').value, a = +wrap.querySelector('[data-a]').value, b = +wrap.querySelector('[data-b]').value;
    wrap.querySelector('[data-kv]').textContent = k; wrap.querySelector('[data-av]').textContent = a; wrap.querySelector('[data-bv]').textContent = b;
    const W = 320, H = 150, M = 20, u = Math.min(34, (W - 2 * M) / (a + b), (H - 2 * M) / k);
    const hgt = k * u, wa = a * u, wb = b * u, x0 = M, y0 = M;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="aire de la distributivité">`;
    g += `<rect x="${x0}" y="${y0}" width="${wa.toFixed(1)}" height="${hgt.toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>`;
    g += `<rect x="${(x0 + wa).toFixed(1)}" y="${y0}" width="${wb.toFixed(1)}" height="${hgt.toFixed(1)}" fill="color-mix(in srgb, var(--accent) 14%, var(--surface))" stroke="var(--accent)" stroke-width="1.5"/>`;
    g += `<text x="${(x0 + wa / 2).toFixed(1)}" y="${(y0 + hgt / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-ink)">${k * a}</text>`;
    g += `<text x="${(x0 + wa + wb / 2).toFixed(1)}" y="${(y0 + hgt / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-ink)">${k * b}</text>`;
    g += `<text x="${(x0 + wa / 2).toFixed(1)}" y="${(y0 + hgt + 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--text)">${a}</text>`;
    g += `<text x="${(x0 + wa + wb / 2).toFixed(1)}" y="${(y0 + hgt + 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--text)">${b}</text>`;
    g += `<text x="${(x0 - 8).toFixed(1)}" y="${(y0 + hgt / 2 + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--text)">${k}</text>`;
    g += `</svg>`; svgHost.innerHTML = g;
    readout.innerHTML = `${k} × (${a} + ${b}) = ${k}×${a} + ${k}×${b} = ${k * a} + ${k * b} = <strong>${k * (a + b)}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r06',
  titre: 'Calcul littéral (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '✖️',

  intro:
    "Le calcul littéral commence en 4ᵉ : développer avec la distributivité simple, réduire une expression " +
    "et calculer sa valeur pour un nombre donné. C'est la base directe du chapitre « Calcul littéral » de 3ᵉ " +
    "(double distributivité, factorisation) et de la résolution d'équations.",

  cours: [
    { type: 'propriete', titre: 'Distributivité simple', contenu: "Pour supprimer une parenthèse précédée d'un facteur, on multiplie ce facteur par chaque terme.", formule: 'k(a + b) = ka + kb, \\qquad k(a - b) = ka - kb' },
    { type: 'propriete', titre: 'Réduire', contenu: "On regroupe les termes « de même nature » : les $x$ ensemble, les nombres ensemble.", formule: 'ax + bx = (a+b)x' },
    { type: 'definition', titre: 'Calculer une expression', contenu: "Remplacer la lettre par un nombre (substitution), puis calculer en respectant les priorités." },
    { type: 'figure', titre: 'Développer, c\'est partager une aire', contenu: "Règle $k$, $a$ et $b$ : l'aire totale du rectangle $k \\times (a+b)$ est la somme des deux aires $k \\times a$ et $k \\times b$.", render: (host) => distributiviteFig(host) },
    { type: 'exemple', enonce: 'Développer $3(x + 4)$.', solution_etapes: ["On multiplie $3$ par chaque terme : $3 \\times x + 3 \\times 4$.", "Résultat : $3x + 12$."] },
  ],

  methode: [
    { etape: 1, titre: 'Développer', explication: "Multiplie le facteur de devant par chacun des termes de la parenthèse (attention aux signes)." },
    { etape: 2, titre: 'Réduire', explication: "Additionne les coefficients des $x$ ensemble, les nombres ensemble." },
    { etape: 3, titre: 'Substituer', explication: "Pour calculer une expression, remplace la lettre par le nombre, puis calcule." },
    { etape: 4, titre: 'Vérifier', explication: "Remplace $x$ par une valeur simple dans l'expression de départ et dans ta réponse : tu dois trouver le même nombre." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Développe :',
      generer() { const k = randInt(2, 6), a = randInt(1, 9); return { enonce: `$${k}(x + ${a})$`, reponse: `${k}*x + ${k * a}`, reponseTex: `${k}x + ${k * a}`, validation: 'expression' }; },
      indices: ['$k(a+b) = ka + kb$.', 'Multiplie le nombre par $x$, puis par la constante.', 'Écris les deux termes l\'un après l\'autre.'],
      correction_detaillee: () => `<p>On distribue le facteur sur chaque terme.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète le développement :',
      generer() { const k = randInt(2, 6), a = randInt(1, 9); return { enonce_complete: `$${k}(x + ${a}) = $ {0} $x + $ {1}`, champs: [{ reponse: k, validation: 'nombre' }, { reponse: k * a, validation: 'nombre' }], _v: { k, a } }; },
      indices: ['Le coefficient de $x$ est le facteur de devant.', 'Le terme constant est le facteur × la constante.', '$k \\times ' + 'a' + '$ pour le second champ.'],
      correction_etapes(st) { const { k, a } = st._v; return [`$${k} \\times x = ${k}x$ → premier champ $= ${k}$.`, `$${k} \\times ${a} = ${k * a}$ → second champ $= ${k * a}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Réduis (regroupe les termes semblables) :',
      generer() { const a = randInt(1, 6), c = randInt(1, 6), b = randInt(1, 9), d = randInt(1, 9); return { enonce: `$${a}x + ${b} + ${c}x + ${d}$`, reponse: `${a + c}*x + ${b + d}`, reponseTex: `${a + c}x + ${b + d}`, validation: 'expression' }; },
      indices: ['Sépare les $x$ et les nombres.', 'Additionne les coefficients des $x$.', 'Additionne les nombres entre eux.'],
      correction_detaillee: () => `<p>$ax + cx = (a+c)x$ et on additionne les nombres.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le développement :',
      generer() { const k = randInt(2, 6), a = randInt(1, 9); return { etapes: [`Repérer la distributivité : un facteur devant une parenthèse`, `Multiplier le facteur par chaque terme : $${k} \\times x + ${k} \\times ${a}$`, `Calculer : $${k}x + ${k * a}$`] }; },
      indices: ['On repère d\'abord la structure.', 'On distribue avant de calculer.', 'On termine par le calcul.'],
      correction_detaillee: () => `<p>Ordre : repérer la distributivité → multiplier chaque terme → calculer.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule la valeur de l\'expression :',
      generer() { const a = randInt(2, 6), b = randIntNonZero(-6, 9), x0 = randInt(-4, 6); return { enonce: `Calcule $${a}x + ${b < 0 ? '(' + b + ')' : b}$ pour $x = ${x0}$.`, reponse: a * x0 + b, validation: 'nombre', _v: { a, b, x0 } }; },
      indices: ['Remplace $x$ par la valeur donnée.', 'Effectue d\'abord la multiplication.', 'Ajoute ensuite le nombre (attention au signe).'],
      correction_etapes(st) { const { a, b, x0 } = st._v; return [`On remplace $x$ par $${x0}$ : $${a} \\times ${x0} + (${b})$.`, `Produit : $${a} \\times ${x0} = ${a * x0}$.`, `On ajoute : $${a * x0} + (${b}) = ${a * x0 + b}$.`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Développe (facteur avec coefficient) :',
      generer() { const k = randInt(2, 5), a = randInt(2, 5), b = randInt(1, 9); return { enonce: `$${k}(${a}x + ${b})$`, reponse: `${k * a}*x + ${k * b}`, reponseTex: `${k * a}x + ${k * b}`, validation: 'expression' }; },
      indices: ['Multiplie $k$ par chaque terme.', '$k \\times ax = (k a)x$.', 'N\'oublie pas le terme constant.'],
      correction_detaillee: () => `<p>$k(ax + b) = kax + kb$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Développe.', generer() { const k = randInt(2, 6), a = randInt(1, 9); return { question: `Développe $${k}(x + ${a})$.`, reponse: `${k}*x + ${k * a}`, validation: 'expression', explication: `$${k}x + ${k * a}$.` }; } },
    { type: 'qcm', question: 'Réduire $3x + 5x$ donne :', choix: ['8x', '15x', '8x^2', '3x + 5x'], correct: 0, explication: '$3x + 5x = (3+5)x = 8x$.' },
    { type: 'saisie', question: 'Calcule une expression.', generer() { const a = randInt(2, 6), b = randInt(1, 9), x0 = randInt(1, 6); return { question: `Calcule $${a}x + ${b}$ pour $x = ${x0}$.`, reponse: a * x0 + b, validation: 'nombre', explication: `$${a} \\times ${x0} + ${b} = ${a * x0 + b}$.` }; } },
    { type: 'vrai_faux', question: 'A-t-on $2(x + 3) = 2x + 3$ ?', reponse: false, explication: 'Non : $2(x+3) = 2x + 6$ (on distribue sur les deux termes).' },
    { type: 'saisie', question: 'Réduis.', generer() { const a = randInt(1, 6), c = randInt(1, 6), b = randInt(1, 9), d = randInt(1, 9); return { question: `Réduis $${a}x + ${b} + ${c}x + ${d}$.`, reponse: `${a + c}*x + ${b + d}`, validation: 'expression', explication: `$${a + c}x + ${b + d}$.` }; } },
  ],
};
