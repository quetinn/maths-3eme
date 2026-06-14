// =====================================================================
//  r02_nombres_relatifs.js — Rappel de 4ᵉ : additionner, soustraire,
//  multiplier et diviser des nombres relatifs (règles des signes).
//  Figure interactive : droite graduée (sliders a et b → saut + somme).
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';

const par = (n) => (n < 0 ? `(${n})` : `${n}`); // met les négatifs entre parenthèses

// Droite graduée interactive : on règle a et b, on voit le « saut » et a+b.
function ligneRelatifs(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>a <input type="range" min="-9" max="9" value="-3" data-a> <span class="fig-val" data-av></span></label>
      <label>b <input type="range" min="-9" max="9" value="5" data-b> <span class="fig-val" data-bv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, b = +wrap.querySelector('[data-b]').value, s = a + b;
    wrap.querySelector('[data-av]').textContent = a; wrap.querySelector('[data-bv]').textContent = b;
    const W = 320, H = 96, M = 16, lo = -10, hi = 10, y0 = 64;
    const X = (v) => M + (v - lo) / (hi - lo) * (W - 2 * M);
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="droite graduée">`;
    g += `<line x1="${M}" y1="${y0}" x2="${W - M}" y2="${y0}" stroke="var(--muted)" stroke-width="1.5"/>`;
    for (let i = lo; i <= hi; i++) { const x = X(i); g += `<line x1="${x}" y1="${y0 - 3}" x2="${x}" y2="${y0 + 3}" stroke="var(--muted)"/>`; if (i % 5 === 0) g += `<text x="${x}" y="${y0 + 17}" text-anchor="middle" font-size="10" fill="var(--muted)">${i}</text>`; }
    const x1 = X(a), x2 = X(s);
    g += `<path d="M ${x1} ${y0 - 2} Q ${(x1 + x2) / 2} ${y0 - 30} ${x2} ${y0 - 2}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
    g += `<circle cx="${x1}" cy="${y0}" r="4" fill="var(--t-fonctions)"/>`;
    g += `<circle cx="${x2}" cy="${y0}" r="5" fill="var(--ok)"/>`;
    g += `<text x="${(x1 + x2) / 2}" y="${y0 - 32}" text-anchor="middle" font-size="11" fill="var(--accent-ink)">+${b < 0 ? '' : ''}${b}</text>`;
    g += `</svg>`;
    svgHost.innerHTML = g;
    readout.innerHTML = `${par(a)} + ${par(b)} = <strong>${s}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
  host.appendChild(wrap);
}

export default {
  id: 'r02',
  titre: 'Nombres relatifs',
  theme: 'rappels',
  priorite: false,
  icone: '➕',

  intro:
    "Les nombres relatifs (positifs et négatifs), vus en 4ᵉ, servent à mesurer des températures, des dettes, " +
    "des altitudes… Surtout, maîtriser les <strong>règles des signes</strong> est indispensable en 3ᵉ : calcul " +
    "littéral, équations, fonctions… une erreur de signe et tout le calcul est faux. On révise ici les quatre " +
    "opérations sur les relatifs.",

  cours: [
    { type: 'propriete', titre: 'Additionner', contenu: "Mêmes signes : on additionne les distances à zéro et on garde le signe. Signes différents : on soustrait, et on garde le signe du plus « grand ».", formule: '(-3) + (-5) = -8, \\qquad (-7) + (4) = -3' },
    { type: 'propriete', titre: 'Soustraire', contenu: "Soustraire un nombre, c'est ajouter son opposé.", formule: 'a - b = a + (-b), \\qquad 5 - (-3) = 5 + 3 = 8' },
    { type: 'propriete', titre: 'Multiplier / diviser (règle des signes)', contenu: "Deux nombres de <strong>même signe</strong> donnent un résultat positif ; de <strong>signes contraires</strong>, un résultat négatif.", formule: '(+)\\times(+) = +,\\ (-)\\times(-) = +,\\ (+)\\times(-) = -' },
    { type: 'figure', titre: 'Additionner sur la droite graduée', contenu: "Règle $a$ (point de départ) et $b$ (le saut) : un saut vers la droite si $b>0$, vers la gauche si $b<0$.", render: (host) => ligneRelatifs(host) },
    { type: 'exemple', enonce: 'Calculer $(-4) - (-9)$.', solution_etapes: ["Soustraire $-9$, c'est ajouter $+9$ : $(-4) + 9$.", "Signes différents : $9 - 4 = 5$, signe du plus grand (positif).", "Résultat : $5$."] },
  ],

  methode: [
    { etape: 1, titre: 'Transformer les soustractions', explication: "Remplace chaque « $- (\\dots)$ » par « $+ (\\text{opposé})$ »." },
    { etape: 2, titre: 'Regarder les signes', explication: "Mêmes signes → additionner ; signes différents → soustraire." },
    { etape: 3, titre: 'Pour les produits/quotients', explication: "Compte les signes « $-$ » : un nombre pair de « $-$ » donne $+$, impair donne $-$." },
    { etape: 4, titre: 'Respecter les priorités', explication: "Parenthèses, puis multiplications/divisions, puis additions/soustractions." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la somme :',
      generer() { const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9); return { enonce: `$${par(a)} + ${par(b)}$`, reponse: a + b, validation: 'nombre' }; },
      indices: ['Mêmes signes : on additionne et on garde le signe.', 'Signes différents : on soustrait les distances à zéro.', 'Le résultat prend le signe du plus « grand ».'],
      correction_detaillee: () => `<p>On compare les signes, puis on additionne ou on soustrait les distances à zéro.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la différence :',
      generer() { const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9); return { enonce: `$${par(a)} - ${par(b)}$`, reponse: a - b, validation: 'nombre' }; },
      indices: ['Soustraire, c\'est ajouter l\'opposé.', '$a - (-b) = a + b$.', 'Réécris en addition, puis calcule.'],
      correction_detaillee: () => `<p>On transforme la soustraction en addition de l'opposé, puis on calcule.</p>`,
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule le produit :',
      generer() { const a = randIntNonZero(-9, 9), b = randIntNonZero(-8, 8); return { enonce: `$${par(a)} \\times ${par(b)}$`, reponse: a * b, validation: 'nombre' }; },
      indices: ['Multiplie d\'abord les distances à zéro.', 'Mêmes signes → positif ; signes contraires → négatif.', 'Détermine le signe à la fin.'],
      correction_detaillee: () => `<p>On multiplie les nombres puis on applique la règle des signes.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'qcm', consigne: 'Choisis le bon signe du résultat :',
      generer() {
        const cas = [
          { e: '(-6) \\times (-4)', s: '+' }, { e: '(-7) \\times (3)', s: '-' },
          { e: '(8) \\div (-2)', s: '-' }, { e: '(-15) \\div (-5)', s: '+' },
        ];
        const c = pick(cas); const choix = ['positif (+)', 'négatif (−)'];
        return { enonce: `Quel est le signe de $${c.e}$ ?`, choix, correct: c.s === '+' ? 0 : 1 };
      },
      indices: ['Compte le nombre de signes « − ».', 'Pair de « − » → positif.', 'Impair de « − » → négatif.'],
      correction_detaillee: () => `<p>Le signe dépend de la parité du nombre de facteurs négatifs.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule (respecte les priorités) :',
      generer() { const a = randIntNonZero(-8, 8), b = randIntNonZero(-6, 6), c = randIntNonZero(-6, 6); return { enonce: `$${par(a)} + ${par(b)} \\times ${par(c)}$`, reponse: a + b * c, validation: 'nombre', _v: { a, b, c } }; },
      indices: ['La multiplication est prioritaire sur l\'addition.', 'Calcule d\'abord le produit (attention au signe).', 'Ajoute ensuite le premier nombre.'],
      correction_etapes(st) {
        const { a, b, c } = st._v;
        return [
          `Priorité à la multiplication : $${par(b)} \\times ${par(c)} = ${b * c}$.`,
          `On effectue l'addition : $${par(a)} + ${par(b * c)} = ${a + b * c}$.`,
        ];
      },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule le quotient :',
      generer() { const q = randIntNonZero(-9, 9), b = randIntNonZero(-6, 6); const a = q * b; return { enonce: `$${par(a)} \\div ${par(b)}$`, reponse: q, validation: 'nombre' }; },
      indices: ['Divise les distances à zéro.', 'Applique la règle des signes (comme pour le produit).', 'Mêmes signes → positif.'],
      correction_detaillee: () => `<p>On divise les nombres puis on applique la règle des signes.</p>`,
    },
    {
      id: 'e07', niveau: 1, type: 'complete', consigne: 'Complète le calcul (soustraction → addition de l\'opposé) :',
      generer() { const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9); return { enonce_complete: `$${par(a)} - ${par(b)} = ${par(a)} + $ {0} $= $ {1}`, champs: [{ reponse: -b, validation: 'nombre' }, { reponse: a - b, validation: 'nombre' }], _v: { a, b } }; },
      indices: ['Soustraire $b$, c\'est ajouter son opposé.', 'L\'opposé de $b$ a le signe contraire.', 'Calcule ensuite la somme.'],
      correction_etapes(st) { const { a, b } = st._v; return [`L'opposé de $${par(b)}$ est $${-b}$ : $${par(a)} + ${par(-b)}$.`, `On calcule : $${a - b}$.`]; },
    },
    {
      id: 'e08', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul avec priorités :',
      generer() { const a = randIntNonZero(-7, 7), b = randIntNonZero(-5, 5), c = randIntNonZero(-5, 5); return { etapes: [`Repérer la priorité : la multiplication avant l'addition`, `Calculer le produit : $${par(b)} \\times ${par(c)} = ${b * c}$`, `Effectuer l'addition : $${par(a)} + ${par(b * c)} = ${a + b * c}$`] }; },
      indices: ['On repère d\'abord l\'opération prioritaire.', 'On calcule la multiplication avant l\'addition.', 'On termine par l\'addition.'],
      correction_detaillee: () => `<p>Ordre : repérer la priorité → calculer le produit → effectuer l'addition.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Calcule une somme.', generer() { const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9); return { question: `Calcule $${par(a)} + ${par(b)}$.`, reponse: a + b, validation: 'nombre', explication: `Le résultat est $${a + b}$.` }; } },
    { type: 'qcm', question: 'Le produit de deux nombres négatifs est :', choix: ['positif', 'négatif', 'nul', 'impossible'], correct: 0, explication: 'Mêmes signes (deux « − ») → résultat positif.' },
    { type: 'saisie', question: 'Calcule une différence.', generer() { const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9); return { question: `Calcule $${par(a)} - ${par(b)}$.`, reponse: a - b, validation: 'nombre', explication: `$${par(a)} + ${par(-b)} = ${a - b}$.` }; } },
    { type: 'vrai_faux', question: 'A-t-on $5 - (-3) = 2$ ?', reponse: false, explication: 'Non : $5 - (-3) = 5 + 3 = 8$.' },
    { type: 'saisie', question: 'Calcule un produit.', generer() { const a = randIntNonZero(-8, 8), b = randIntNonZero(-8, 8); return { question: `Calcule $${par(a)} \\times ${par(b)}$.`, reponse: a * b, validation: 'nombre', explication: `Règle des signes : $${a * b}$.` }; } },
  ],
};
