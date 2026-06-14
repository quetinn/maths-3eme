// =====================================================================
//  r09_statistiques.js — Rappel de 4ᵉ : moyenne, étendue, effectifs
//  et fréquences.
//  Figure interactive : 4 valeurs réglables + ligne de moyenne.
// =====================================================================

import { randInt, pick } from '../engine.js';

const moyenneFig = (host) => {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      ${[1, 2, 3, 4].map((i) => `<label>v${i} <input type="range" min="1" max="10" value="${[6, 8, 4, 10][i - 1]}" data-v="${i}"> <span class="fig-val" data-vv="${i}"></span></label>`).join('')}
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const vals = [1, 2, 3, 4].map((i) => +wrap.querySelector(`[data-v="${i}"]`).value);
    vals.forEach((v, i) => { wrap.querySelector(`[data-vv="${i + 1}"]`).textContent = v; });
    const m = vals.reduce((a, b) => a + b, 0) / 4;
    const W = 320, H = 130, M = 18, bw = 50, gap = 18, base = H - 22, sc = 9;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="diagramme en barres et moyenne">`;
    vals.forEach((v, i) => { const x = M + i * (bw + gap), h = v * sc; g += `<rect x="${x}" y="${(base - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="${x + bw / 2}" y="${base + 14}" text-anchor="middle" font-size="11" fill="var(--text)">${v}</text>`; });
    const my = base - m * sc;
    g += `<line x1="${M - 4}" y1="${my.toFixed(1)}" x2="${W - 6}" y2="${my.toFixed(1)}" stroke="var(--ok)" stroke-width="2" stroke-dasharray="5 3"/>`;
    g += `<text x="${W - 8}" y="${(my - 4).toFixed(1)}" text-anchor="end" font-size="11" font-weight="700" fill="var(--ok)">moyenne ${Math.round(m * 10) / 10}</text>`;
    g += `</svg>`; svgHost.innerHTML = g;
    readout.innerHTML = `Moyenne = (${vals.join(' + ')}) ÷ 4 = <strong>${Math.round(m * 100) / 100}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
};

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export default {
  id: 'r09',
  titre: 'Statistiques (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '📊',

  intro:
    "En 4ᵉ, on apprend à résumer une série de données : la moyenne, l'étendue, les effectifs et les fréquences. " +
    "Ces outils sont repris et complétés en 3ᵉ (médiane, quartiles, diagrammes en boîte). On révise ici les " +
    "calculs de base, indispensables pour lire un tableau ou un sondage.",

  cours: [
    { type: 'definition', titre: 'Moyenne', contenu: "On additionne toutes les valeurs et on divise par leur nombre (l'effectif total).", formule: '\\bar{x} = \\dfrac{\\text{somme des valeurs}}{\\text{effectif total}}' },
    { type: 'definition', titre: 'Étendue', contenu: "La différence entre la plus grande et la plus petite valeur.", formule: '\\text{étendue} = \\max - \\min' },
    { type: 'definition', titre: 'Effectif et fréquence', contenu: "L'<strong>effectif</strong> d'une valeur est le nombre de fois où elle apparaît. La <strong>fréquence</strong> est l'effectif divisé par l'effectif total (souvent en %).", formule: 'f = \\dfrac{\\text{effectif}}{\\text{effectif total}}' },
    { type: 'figure', titre: 'La moyenne « équilibre » les valeurs', contenu: "Règle les quatre valeurs : la ligne pointillée (la moyenne) se déplace. Elle se situe toujours « au milieu ».", render: (host) => moyenneFig(host) },
    { type: 'exemple', enonce: 'Moyenne de $4 ; 8 ; 6 ; 10$.', solution_etapes: ["Somme : $4 + 8 + 6 + 10 = 28$.", "Effectif : $4$ valeurs.", "Moyenne : $28 \\div 4 = 7$."] },
  ],

  methode: [
    { etape: 1, titre: 'Pour la moyenne', explication: "Additionne toutes les valeurs, puis divise par leur nombre." },
    { etape: 2, titre: 'Pour l\'étendue', explication: "Repère le maximum et le minimum, puis soustrais." },
    { etape: 3, titre: 'Pour une fréquence', explication: "Divise l'effectif de la valeur par l'effectif total." },
    { etape: 4, titre: 'En pourcentage', explication: "Multiplie la fréquence par $100$ pour l'exprimer en %." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule la moyenne :',
      generer() { const m = randInt(5, 13), data = shuffle([m - 2, m - 1, m, m + 1, m + 2]); return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la moyenne.`, reponse: m, validation: 'nombre' }; },
      indices: ['Additionne toutes les valeurs.', 'Compte combien il y en a.', 'Divise la somme par ce nombre.'],
      correction_detaillee: () => `<p>Moyenne $= \\dfrac{\\text{somme}}{\\text{effectif}}$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète le calcul de la moyenne :',
      generer() { const data = Array.from({ length: 4 }, () => randInt(2, 12)); const s = data.reduce((a, b) => a + b, 0); return { enonce_complete: `Série $${data.join(' \\;;\\; ')}$ : somme = {0}$,\\;$ moyenne = somme ÷ 4 = {1}`, champs: [{ reponse: s, validation: 'nombre' }, { reponse: s / 4, validation: 'nombre', tolerance: 0.01 }], _v: { data, s } }; },
      indices: ['On additionne d\'abord toutes les valeurs.', 'Il y a 4 valeurs.', 'On divise la somme par 4.'],
      correction_etapes(st) { const { data, s } = st._v; return [`Somme : $${data.join(' + ')} = ${s}$.`, `Moyenne : $${s} \\div 4 = ${Math.round(s / 4 * 100) / 100}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule l\'étendue :',
      generer() { const data = Array.from({ length: 6 }, () => randInt(2, 20)); return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule l'étendue.`, reponse: Math.max(...data) - Math.min(...data), validation: 'nombre' }; },
      indices: ['Repère la plus grande valeur.', 'Repère la plus petite.', 'Étendue $= \\max - \\min$.'],
      correction_detaillee: () => `<p>Étendue $= \\max - \\min$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul de la moyenne :',
      generer() { const data = Array.from({ length: 4 }, () => randInt(2, 12)); const s = data.reduce((a, b) => a + b, 0); return { etapes: [`On additionne les valeurs : $${data.join(' + ')} = ${s}$`, `On compte l'effectif : 4 valeurs`, `On divise : $${s} \\div 4 = ${Math.round(s / 4 * 100) / 100}$`] }; },
      indices: ['On additionne d\'abord.', 'On compte le nombre de valeurs.', 'On divise en dernier.'],
      correction_detaillee: () => `<p>Ordre : additionner → compter → diviser.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule la moyenne (arrondi au dixième) :',
      generer() { const data = Array.from({ length: 5 }, () => randInt(2, 18)); const s = data.reduce((a, b) => a + b, 0); return { enonce: `Série : $${data.join(' \\;;\\; ')}$. Calcule la moyenne.`, reponse: Math.round(s / 5 * 10) / 10, validation: 'nombre', tolerance: 0.02, _v: { data, s } }; },
      indices: ['Additionne les 5 valeurs.', 'Divise par 5.', 'Arrondis au dixième.'],
      correction_etapes(st) { const { data, s } = st._v; return [`Somme : $${data.join(' + ')} = ${s}$.`, `Moyenne : $${s} \\div 5 = ${Math.round(s / 5 * 10) / 10}$ (arrondie au dixième).`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule la fréquence (décimal ou pourcentage) :',
      generer() { const tot = pick([20, 25, 40, 50]), eff = randInt(2, tot - 1); return { enonce: `Dans un groupe de $${tot}$ personnes, $${eff}$ font du sport. Quelle est la fréquence (décimal) ?`, reponse: eff / tot, validation: 'nombre', tolerance: 0.005 }; },
      indices: ['Fréquence $= \\dfrac{\\text{effectif}}{\\text{effectif total}}$.', 'Divise l\'effectif par le total.', 'Tu peux donner un décimal (ex. 0,4).'],
      correction_detaillee: () => `<p>$f = \\dfrac{\\text{effectif}}{\\text{effectif total}}$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Calcule une moyenne.', generer() { const m = randInt(5, 13), data = shuffle([m - 2, m - 1, m, m + 1, m + 2]); return { question: `Moyenne de $${data.join(' ; ')}$ ?`, reponse: m, validation: 'nombre', explication: `Somme $= ${5 * m}$, moyenne $= ${5 * m} \\div 5 = ${m}$.` }; } },
    { type: 'saisie', question: 'Calcule une étendue.', generer() { const data = Array.from({ length: 5 }, () => randInt(2, 20)); const mn = Math.min(...data), mx = Math.max(...data); return { question: `Étendue de $${data.join(' ; ')}$ ?`, reponse: mx - mn, validation: 'nombre', explication: `$${mx} - ${mn} = ${mx - mn}$.` }; } },
    { type: 'qcm', question: 'La fréquence d\'une valeur est :', choix: ['effectif ÷ effectif total', 'effectif × total', 'la plus grande valeur', 'la somme des valeurs'], correct: 0, explication: '$f = \\dfrac{\\text{effectif}}{\\text{effectif total}}$.' },
    { type: 'vrai_faux', question: 'L\'étendue d\'une série peut être négative.', reponse: false, explication: 'Non : c\'est max − min, toujours positif ou nul.' },
    { type: 'saisie', question: 'Moyenne de $4 ; 8 ; 6 ; 10$ ?', reponse: 7, validation: 'nombre', explication: '$28 \\div 4 = 7$.' },
  ],
};
