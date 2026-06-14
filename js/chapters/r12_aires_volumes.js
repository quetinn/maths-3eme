// =====================================================================
//  r12_aires_volumes.js — Rappel de 4ᵉ : aires usuelles, périmètre,
//  volume du pavé droit.
//  Figure interactive : rectangle réglable (aire + périmètre).
// =====================================================================

import { randInt, pick } from '../engine.js';

const r1 = (x) => Math.round(x * 10) / 10;

function rectangleFig(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>longueur L <input type="range" min="2" max="9" value="6" data-l> <span class="fig-val" data-lv></span></label>
      <label>largeur ℓ <input type="range" min="1" max="6" value="3" data-w> <span class="fig-val" data-wv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  function draw() {
    const L = +wrap.querySelector('[data-l]').value, w = +wrap.querySelector('[data-w]').value;
    wrap.querySelector('[data-lv]').textContent = L; wrap.querySelector('[data-wv]').textContent = w;
    const u = 26, W = 320, H = 180, x0 = (W - L * u) / 2, y0 = (H - w * u) / 2;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="svg-plot" role="img" aria-label="rectangle">`;
    g += `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(L * u).toFixed(1)}" height="${(w * u).toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>`;
    g += `<text x="${(x0 + L * u / 2).toFixed(1)}" y="${(y0 - 8).toFixed(1)}" text-anchor="middle" font-size="12" fill="var(--text)">L = ${L}</text>`;
    g += `<text x="${(x0 - 10).toFixed(1)}" y="${(y0 + w * u / 2 + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="var(--text)">ℓ = ${w}</text>`;
    g += `<text x="${(x0 + L * u / 2).toFixed(1)}" y="${(y0 + w * u / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-ink)">aire ${L * w}</text>`;
    g += `</svg>`; svgHost.innerHTML = g;
    readout.innerHTML = `Aire = L × ℓ = ${L} × ${w} = <strong>${L * w}</strong> &nbsp;·&nbsp; Périmètre = 2 × (L + ℓ) = <strong>${2 * (L + w)}</strong>`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r12',
  titre: 'Aires, périmètres et volumes (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '📦',

  intro:
    "Calculer une aire, un périmètre ou un volume, c'est utile au quotidien (peinture, clôture, contenance) " +
    "et indispensable en 3ᵉ (géométrie dans l'espace, homothétie). On révise ici les formules d'aires usuelles, " +
    "le périmètre et le volume du pavé droit. Attention aux unités : aire en cm², volume en cm³.",

  cours: [
    { type: 'propriete', titre: 'Aires usuelles', contenu: "Rectangle, triangle, disque.", formule: 'A_{rect} = L \\times \\ell, \\quad A_{tri} = \\dfrac{b \\times h}{2}, \\quad A_{disque} = \\pi r^2' },
    { type: 'propriete', titre: 'Périmètres', contenu: "Le périmètre est la longueur du contour.", formule: 'P_{rect} = 2(L + \\ell), \\qquad P_{cercle} = 2 \\pi r' },
    { type: 'propriete', titre: 'Volume du pavé droit', contenu: "On multiplie les trois dimensions.", formule: 'V_{pavé} = L \\times \\ell \\times h' },
    { type: 'figure', titre: 'Aire et périmètre d\'un rectangle', contenu: "Règle la longueur et la largeur : l'aire (L × ℓ) et le périmètre (2 × (L + ℓ)) se mettent à jour.", render: (host) => rectangleFig(host) },
    { type: 'exemple', enonce: 'Aire d\'un rectangle de $7$ cm sur $4$ cm.', solution_etapes: ["$A = L \\times \\ell = 7 \\times 4$.", "$A = 28$ cm²."] },
  ],

  methode: [
    { etape: 1, titre: 'Reconnaître la figure', explication: "Rectangle, triangle, disque, pavé ? Chacun a sa formule." },
    { etape: 2, titre: 'Repérer les dimensions', explication: "Longueur, largeur, base, hauteur, rayon selon le cas." },
    { etape: 3, titre: 'Appliquer la formule', explication: "N'oublie pas le $\\div 2$ pour le triangle, le $\\pi$ pour le disque." },
    { etape: 4, titre: 'Soigner les unités', explication: "Aire en unités², volume en unités³." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Calcule l\'aire du rectangle :',
      generer() { const L = randInt(3, 12), w = randInt(2, 9); return { enonce: `Rectangle de longueur $${L}$ cm et largeur $${w}$ cm. Aire ?`, reponse: L * w, validation: 'nombre' }; },
      indices: ['$A = L \\times \\ell$.', 'Multiplie la longueur par la largeur.', 'Le résultat est en cm².'],
      correction_detaillee: () => `<p>$A = L \\times \\ell$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète le calcul du périmètre :',
      generer() { const L = randInt(3, 12), w = randInt(2, 9); return { enonce_complete: `Rectangle $L = ${L}$, $\\ell = ${w}$. $P = 2 \\times (L + \\ell) = 2 \\times $ {0} $= $ {1}`, champs: [{ reponse: L + w, validation: 'nombre' }, { reponse: 2 * (L + w), validation: 'nombre' }], _v: { L, w } }; },
      indices: ['On additionne L et ℓ d\'abord.', 'On multiplie la somme par 2.', '$P = 2(L + \\ell)$.'],
      correction_etapes(st) { const { L, w } = st._v; return [`$L + \\ell = ${L} + ${w} = ${L + w}$.`, `$P = 2 \\times ${L + w} = ${2 * (L + w)}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Calcule l\'aire du triangle :',
      generer() { const b = 2 * randInt(2, 7), h = randInt(3, 10); return { enonce: `Triangle de base $${b}$ cm et hauteur $${h}$ cm. Aire ?`, reponse: (b * h) / 2, validation: 'nombre' }; },
      indices: ['$A = \\dfrac{b \\times h}{2}$.', 'Multiplie la base par la hauteur.', 'Divise par 2.'],
      correction_detaillee: () => `<p>$A = \\dfrac{b \\times h}{2}$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul du volume d\'un pavé :',
      generer() { const L = randInt(3, 8), w = randInt(2, 6), h = randInt(2, 6); return { etapes: [`Reconnaître un pavé droit : $V = L \\times \\ell \\times h$`, `Multiplier deux dimensions : $${L} \\times ${w} = ${L * w}$`, `Multiplier par la hauteur : $${L * w} \\times ${h} = ${L * w * h}$`] }; },
      indices: ['On choisit la bonne formule.', 'On multiplie les dimensions une par une.', 'On obtient le volume.'],
      correction_detaillee: () => `<p>Ordre : formule du pavé → multiplier deux dimensions → multiplier par la hauteur.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Calcule l\'aire du disque (arrondi au dixième, π ≈ 3,14) :',
      generer() { const r = randInt(2, 7); return { enonce: `Disque de rayon $${r}$ cm. Aire (au dixième) ?`, reponse: r1(Math.PI * r * r), validation: 'nombre', tolerance: 0.02, _v: { r } }; },
      indices: ['$A = \\pi r^2$.', 'Calcule d\'abord $r^2$.', 'Multiplie par $\\pi$ et arrondis.'],
      correction_etapes(st) { const { r } = st._v; const a = r1(Math.PI * r * r); return [`Formule : $A = \\pi r^2$.`, `$r^2 = ${r * r}$, donc $A = \\pi \\times ${r * r}$.`, `$A \\approx ${String(a).replace('.', '{,}')}$ cm².`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'saisie', consigne: 'Calcule le volume du pavé droit :',
      generer() { const L = randInt(3, 9), w = randInt(2, 7), h = randInt(2, 8); return { enonce: `Pavé droit $${L} \\times ${w} \\times ${h}$ cm. Volume ?`, reponse: L * w * h, validation: 'nombre' }; },
      indices: ['$V = L \\times \\ell \\times h$.', 'Multiplie les trois dimensions.', 'Le résultat est en cm³.'],
      correction_detaillee: () => `<p>$V = L \\times \\ell \\times h$.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Aire d\'un rectangle.', generer() { const L = randInt(3, 12), w = randInt(2, 9); return { question: `Aire d'un rectangle $${L}$ cm × $${w}$ cm ?`, reponse: L * w, validation: 'nombre', explication: `$${L} \\times ${w} = ${L * w}$ cm².` }; } },
    { type: 'qcm', question: 'L\'aire d\'un triangle est :', choix: ['\\dfrac{b \\times h}{2}', 'b \\times h', '2 \\times b \\times h', 'b + h'], correct: 0, explication: '$A = \\dfrac{b \\times h}{2}$.' },
    { type: 'saisie', question: 'Périmètre d\'un rectangle.', generer() { const L = randInt(3, 12), w = randInt(2, 9); return { question: `Périmètre d'un rectangle $${L}$ cm × $${w}$ cm ?`, reponse: 2 * (L + w), validation: 'nombre', explication: `$2 \\times (${L} + ${w}) = ${2 * (L + w)}$ cm.` }; } },
    { type: 'vrai_faux', question: 'Le volume d\'un pavé s\'exprime en cm².', reponse: false, explication: 'Non : un volume s\'exprime en cm³ (une aire en cm²).' },
    { type: 'saisie', question: 'Volume d\'un pavé.', generer() { const L = randInt(3, 8), w = randInt(2, 6), h = randInt(2, 6); return { question: `Volume d'un pavé $${L} \\times ${w} \\times ${h}$ cm ?`, reponse: L * w * h, validation: 'nombre', explication: `$${L} \\times ${w} \\times ${h} = ${L * w * h}$ cm³.` }; } },
  ],
};
