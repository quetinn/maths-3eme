// =====================================================================
//  r08_puissances.js — Rappel de 4ᵉ : puissances d'un nombre, de 10,
//  produit de puissances de même base.
//  Figure interactive : a^n = a × a × … × a (sliders base / exposant).
// =====================================================================

import { randInt, pick } from '../engine.js';

function puissancesFig(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>base a <input type="range" min="2" max="5" value="2" data-a> <span class="fig-val" data-av></span></label>
      <label>exposant n <input type="range" min="1" max="6" value="3" data-n> <span class="fig-val" data-nv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, n = +wrap.querySelector('[data-n]').value;
    wrap.querySelector('[data-av]').textContent = a; wrap.querySelector('[data-nv]').textContent = n;
    const W = 320, H = 56, M = 14, bw = Math.min(40, (W - 2 * M) / n);
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="facteurs de la puissance">`;
    for (let i = 0; i < n; i++) { const x = M + i * bw; g += `<rect x="${x.toFixed(1)}" y="12" width="${(bw - 6).toFixed(1)}" height="30" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="${(x + (bw - 6) / 2).toFixed(1)}" y="32" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-ink)">${a}</text>`; }
    g += `</svg>`; svgHost.innerHTML = g;
    readout.innerHTML = `${a}<sup>${n}</sup> = ${Array(n).fill(a).join(' × ')} = <strong>${Math.pow(a, n)}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r08',
  titre: 'Puissances (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '²',

  intro:
    "Les puissances, découvertes en 4ᵉ, sont une écriture courte d'un produit de facteurs égaux. Les puissances " +
    "de 10 permettent d'écrire de très grands (ou très petits) nombres. C'est la base du chapitre « Puissances " +
    "et racines » de 3ᵉ (notation scientifique, règles de calcul).",

  cours: [
    { type: 'definition', titre: 'Puissance d\'un nombre', contenu: "$a^n$ est le produit de $n$ facteurs tous égaux à $a$. On lit « $a$ exposant $n$ ».", formule: 'a^n = \\underbrace{a \\times a \\times \\dots \\times a}_{n \\text{ facteurs}}' },
    { type: 'propriete', titre: 'Cas particuliers', contenu: "$a^1 = a$ et (pour $a \\neq 0$) $a^0 = 1$.", formule: 'a^1 = a, \\qquad a^0 = 1' },
    { type: 'propriete', titre: 'Puissances de 10', contenu: "$10^n$ est le nombre $1$ suivi de $n$ zéros.", formule: '10^3 = 1\\,000, \\qquad 10^6 = 1\\,000\\,000' },
    { type: 'propriete', titre: 'Produit de même base', contenu: "Pour une même base, on additionne les exposants.", formule: 'a^m \\times a^n = a^{m+n}' },
    { type: 'figure', titre: 'Une puissance, c\'est un produit', contenu: "Règle la base $a$ et l'exposant $n$ : $a^n$ est le produit de $n$ facteurs égaux à $a$.", render: (host) => puissancesFig(host) },
    { type: 'exemple', enonce: 'Calculer $2^4$.', solution_etapes: ["$2^4 = 2 \\times 2 \\times 2 \\times 2$.", "$= 4 \\times 2 \\times 2 = 8 \\times 2 = 16$."] },
  ],

  methode: [
    { etape: 1, titre: 'Compter les facteurs', explication: "$a^n$ = on écrit $a$ multiplié par lui-même $n$ fois." },
    { etape: 2, titre: 'Calculer pas à pas', explication: "On multiplie les facteurs un par un." },
    { etape: 3, titre: 'Puissances de 10', explication: "$10^n$ : un $1$ suivi de $n$ zéros." },
    { etape: 4, titre: 'Produit de même base', explication: "Même base → on additionne les exposants, puis on calcule." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la puissance :',
      generer() { const a = randInt(2, 5), n = randInt(2, 4); return { enonce: `Calcule $${a}^{${n}}$.`, reponse: Math.pow(a, n), validation: 'nombre' }; },
      indices: ['$a^n$ : multiplie $a$ par lui-même $n$ fois.', 'Procède étape par étape.', 'Ex. $2^3 = 2 \\times 2 \\times 2 = 8$.'],
      correction_detaillee: () => `<p>On effectue le produit de $n$ facteurs égaux à la base.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète :',
      generer() { const a = randInt(2, 5), n = randInt(2, 4); return { enonce_complete: `$${a}^{${n}}$ est le produit de {0} facteurs égaux à $${a}$, et vaut {1}`, champs: [{ reponse: n, validation: 'nombre' }, { reponse: Math.pow(a, n), validation: 'nombre' }], _v: { a, n } }; },
      indices: ['L\'exposant indique le nombre de facteurs.', 'On multiplie la base autant de fois.', 'Calcule le produit pour le second champ.'],
      correction_etapes(st) { const { a, n } = st._v; return [`L'exposant est $${n}$ : il y a $${n}$ facteurs.`, `$${Array(n).fill(a).join(' \\times ')} = ${Math.pow(a, n)}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Écris la puissance de 10 sous forme de nombre :',
      generer() { const n = randInt(2, 6); return { enonce: `Combien vaut $10^{${n}}$ ?`, reponse: Math.pow(10, n), validation: 'nombre' }; },
      indices: ['$10^n$ : un $1$ suivi de $n$ zéros.', 'Compte bien le nombre de zéros.', 'Ex. $10^3 = 1000$.'],
      correction_detaillee: () => `<p>$10^n$ est le nombre $1$ suivi de $n$ zéros.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul de la puissance :',
      generer() { const a = randInt(2, 4), n = 3; return { etapes: [`Écrire la puissance comme un produit : $${a}^{3} = ${a} \\times ${a} \\times ${a}$`, `Multiplier les deux premiers : $${a} \\times ${a} = ${a * a}$`, `Multiplier par le dernier : $${a * a} \\times ${a} = ${a * a * a}$`] }; },
      indices: ['On transforme d\'abord la puissance en produit.', 'On multiplie les facteurs un par un.', 'On obtient la valeur finale.'],
      correction_detaillee: () => `<p>Ordre : écrire le produit → multiplier pas à pas → valeur finale.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Produit de même base — calcule :',
      generer() { const a = pick([2, 3]), m = randInt(2, 3), n = randInt(2, 3); return { enonce: `Calcule $${a}^{${m}} \\times ${a}^{${n}}$.`, reponse: Math.pow(a, m + n), validation: 'nombre', _v: { a, m, n } }; },
      indices: ['Même base : on additionne les exposants.', '$a^m \\times a^n = a^{m+n}$.', 'Puis on calcule la puissance obtenue.'],
      correction_etapes(st) { const { a, m, n } = st._v; return [`Même base $${a}$ : on additionne les exposants, $${m} + ${n} = ${m + n}$.`, `$${a}^{${m}} \\times ${a}^{${n}} = ${a}^{${m + n}}$.`, `On calcule : $${a}^{${m + n}} = ${Math.pow(a, m + n)}$.`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'qcm', consigne: 'Choisis l\'écriture correcte :',
      generer() { const a = pick([2, 3, 5]), m = randInt(2, 4), n = randInt(2, 4); const choix = [`${a}^{${m + n}}`, `${a}^{${m * n}}`, `${a}^{${m}} + ${a}^{${n}}`, `${2 * a}^{${m + n}}`]; return { enonce: `$${a}^{${m}} \\times ${a}^{${n}}$ est égal à :`, choix, correct: 0 }; },
      indices: ['Même base : on additionne les exposants.', 'On ne multiplie PAS les exposants.', '$a^m \\times a^n = a^{m+n}$.'],
      correction_detaillee: () => `<p>$a^m \\times a^n = a^{m+n}$ (on additionne les exposants).</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Calcule une puissance.', generer() { const a = randInt(2, 5), n = randInt(2, 4); return { question: `Combien vaut $${a}^{${n}}$ ?`, reponse: Math.pow(a, n), validation: 'nombre', explication: `$${a}^{${n}} = ${Math.pow(a, n)}$.` }; } },
    { type: 'saisie', question: 'Puissance de 10.', generer() { const n = randInt(2, 6); return { question: `Combien vaut $10^{${n}}$ ?`, reponse: Math.pow(10, n), validation: 'nombre', explication: `Un 1 suivi de ${n} zéros : $${Math.pow(10, n)}$.` }; } },
    { type: 'qcm', question: '$10^4$ est égal à :', choix: ['10 000', '40', '1 000', '100 000'], correct: 0, explication: 'Un 1 suivi de 4 zéros : $10\\,000$.' },
    { type: 'vrai_faux', question: 'A-t-on $2^3 = 6$ ?', reponse: false, explication: 'Non : $2^3 = 2 \\times 2 \\times 2 = 8$ (et non $2 \\times 3$).' },
    { type: 'qcm', question: '$5^2 \\times 5^3$ est égal à :', choix: ['5^5', '5^6', '25^5', '10^5'], correct: 0, explication: 'Même base : $5^{2+3} = 5^5$.' },
  ],
};
