// =====================================================================
//  r10_probabilites.js — Rappel de 4ᵉ : expérience aléatoire, probabilité
//  d'un événement, échelle de probabilité.
//  Figure interactive : roue de la chance (sliders favorables / total).
// =====================================================================

import { randInt, pick, gcd } from '../engine.js';

function roueFig(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>secteurs gagnants <input type="range" min="0" max="4" value="2" data-f> <span class="fig-val" data-fv></span></label>
      <label>secteurs en tout <input type="range" min="2" max="8" value="6" data-t> <span class="fig-val" data-tv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  const fIn = wrap.querySelector('[data-f]'), tIn = wrap.querySelector('[data-t]');
  function draw() {
    let t = +tIn.value; fIn.max = t; let f = Math.min(+fIn.value, t); fIn.value = f;
    wrap.querySelector('[data-fv]').textContent = f; wrap.querySelector('[data-tv]').textContent = t;
    const cx = 70, cy = 78, r = 60, step = 360 / t;
    let g = `<svg viewBox="0 0 ${320} ${160}" class="svg-plot" role="img" aria-label="roue de probabilité">`;
    for (let i = 0; i < t; i++) {
      const a0 = (-90 + i * step) * Math.PI / 180, a1 = (-90 + (i + 1) * step) * Math.PI / 180;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      g += `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${i < f ? 'var(--accent)' : 'var(--surface-2)'}" stroke="var(--surface)" stroke-width="1.5"/>`;
    }
    const [ra, rb] = (() => { const gd = gcd(f, t) || 1; return f === 0 ? [0, 1] : [f / gd, t / gd]; })();
    g += `<text x="160" y="60" font-size="14" fill="var(--text)">P(gagner) = ${f}/${t}</text>`;
    g += `<text x="160" y="86" font-size="14" fill="var(--accent-ink)" font-weight="700">= ${f === 0 ? '0' : ra + '/' + rb} ≈ ${(f / t).toFixed(2).replace('.', ',')}</text>`;
    g += `</svg>`; svgHost.innerHTML = g;
    readout.innerHTML = `Probabilité de gagner = secteurs gagnants ÷ total = <strong>${f}/${t}</strong>`;
  }
  fIn.addEventListener('input', draw); tIn.addEventListener('input', draw); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r10',
  titre: 'Probabilités (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '🎲',

  intro:
    "Les probabilités, introduites en 4ᵉ, mesurent la « chance » qu'un événement se produise, entre $0$ " +
    "(impossible) et $1$ (certain). On révise le vocabulaire (issue, événement) et le calcul d'une probabilité " +
    "dans une situation d'équiprobabilité. C'est la base du chapitre « Probabilités » de 3ᵉ.",

  cours: [
    { type: 'definition', titre: 'Vocabulaire', contenu: "Une <strong>expérience aléatoire</strong> a plusieurs <strong>issues</strong> possibles. Un <strong>événement</strong> regroupe certaines issues (ex. « obtenir un nombre pair »)." },
    { type: 'propriete', titre: 'Probabilité (équiprobabilité)', contenu: "Quand toutes les issues ont la même chance, la probabilité d'un événement est :", formule: 'P = \\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}' },
    { type: 'propriete', titre: 'Échelle de probabilité', contenu: "Une probabilité est toujours comprise entre $0$ (impossible) et $1$ (certain).", formule: '0 \\le P \\le 1' },
    { type: 'figure', titre: 'La roue de la chance', contenu: "Règle le nombre de secteurs gagnants et le total : la probabilité de gagner est la part de roue colorée.", render: (host) => roueFig(host) },
    { type: 'exemple', enonce: 'On lance un dé équilibré. Probabilité d\'obtenir un nombre pair ?', solution_etapes: ["Cas possibles : $6$ faces.", "Cas favorables (pairs) : $2, 4, 6$ → $3$ faces.", "$P = \\dfrac{3}{6} = \\dfrac{1}{2}$."] },
  ],

  methode: [
    { etape: 1, titre: 'Compter les issues possibles', explication: "Le nombre total d'issues (le dénominateur)." },
    { etape: 2, titre: 'Compter les cas favorables', explication: "Combien d'issues réalisent l'événement (le numérateur) ?" },
    { etape: 3, titre: 'Écrire la probabilité', explication: "$P = \\dfrac{\\text{favorables}}{\\text{possibles}}$, puis on simplifie." },
    { etape: 4, titre: 'Vérifier l\'échelle', explication: "Le résultat doit être entre $0$ et $1$." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Probabilité avec une urne (fraction ou décimal) :',
      generer() { const k = randInt(2, 5), autres = randInt(3, 7), n = k + autres; return { enonce: `Une urne contient $${k}$ boules rouges et $${autres}$ boules vertes. Probabilité de tirer une rouge ?`, reponse: k / n, validation: 'nombre', tolerance: 0.01, reponseTex: `\\dfrac{${k}}{${n}}` }; },
      indices: ['Compte le nombre total de boules.', 'Compte les boules favorables (rouges).', '$P = \\dfrac{\\text{rouges}}{\\text{total}}$.'],
      correction_detaillee: () => `<p>$P = \\dfrac{\\text{favorables}}{\\text{total}}$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète le calcul de la probabilité :',
      generer() { const k = randInt(2, 5), autres = randInt(3, 7), n = k + autres; return { enonce_complete: `Urne : $${k}$ rouges et $${autres}$ vertes. Total = {0} boules$.\\;$ $P(\\text{rouge}) = $ {1}`, champs: [{ reponse: n, validation: 'nombre' }, { reponse: k / n, validation: 'nombre', tolerance: 0.01 }], _v: { k, autres, n } }; },
      indices: ['Total = rouges + vertes.', '$P = \\dfrac{\\text{rouges}}{\\text{total}}$.', 'Fraction ou décimal accepté.'],
      correction_etapes(st) { const { k, autres, n } = st._v; return [`Total : $${k} + ${autres} = ${n}$ boules.`, `$P(\\text{rouge}) = \\dfrac{${k}}{${n}}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'qcm', consigne: 'Choisis la bonne réponse :',
      generer() { const cas = [{ e: 'Un événement certain a pour probabilité :', good: '1', ch: ['1', '0', '\\dfrac12', '100'] }, { e: 'Un événement impossible a pour probabilité :', good: '0', ch: ['0', '1', '\\dfrac12', '-1'] }, { e: 'Avec une pièce équilibrée, $P(\\text{pile})$ vaut :', good: '\\dfrac12', ch: ['\\dfrac12', '\\dfrac13', '1', '0'] }]; const c = pick(cas); return { enonce: c.e, choix: c.ch, correct: c.ch.indexOf(c.good) }; },
      indices: ['Une probabilité va de 0 à 1.', '0 = impossible, 1 = certain.', 'Une pièce : 2 issues équiprobables.'],
      correction_detaillee: () => `<p>$P = 0$ : impossible ; $P = 1$ : certain ; pièce : $\\dfrac12$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre le calcul d\'une probabilité :',
      generer() { const fav = pick([2, 3, 4]); const g = gcd(fav, 6); return { etapes: [`Compter les issues possibles : 6 faces du dé`, `Compter les cas favorables : ${fav} faces`, `Écrire la probabilité : $P = \\dfrac{${fav}}{6}$`, `Simplifier : $\\dfrac{${fav / g}}{${6 / g}}$`] }; },
      indices: ['On compte d\'abord toutes les issues.', 'Puis les cas favorables.', 'On simplifie en dernier.'],
      correction_detaillee: () => `<p>Ordre : issues possibles → cas favorables → écrire $P$ → simplifier.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Probabilité avec un dé (pense à simplifier) — fraction ou décimal :',
      generer() { const events = [{ e: 'un nombre pair', fav: 3 }, { e: 'un multiple de 3', fav: 2 }, { e: 'un nombre supérieur à 4', fav: 2 }, { e: 'un nombre inférieur à 5', fav: 4 }]; const ev = pick(events); const g = gcd(ev.fav, 6); return { enonce: `On lance un dé à 6 faces. Probabilité d'obtenir ${ev.e} ?`, reponse: ev.fav / 6, validation: 'nombre', tolerance: 0.01, reponseTex: `\\dfrac{${ev.fav / g}}{${6 / g}}`, _v: { fav: ev.fav, g } }; },
      indices: ['Liste les faces favorables.', 'Mets ce nombre sur 6.', 'Simplifie la fraction si possible.'],
      correction_etapes(st) { const { fav, g } = st._v; const simp = g > 1 ? ` = \\dfrac{${fav / g}}{${6 / g}}` : ''; return [`6 issues équiprobables (faces 1 à 6).`, `Cas favorables : $${fav}$.`, `$P = \\dfrac{${fav}}{6}${simp}$.`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux :',
      generer() { const props = [{ e: 'Une probabilité peut valoir $1{,}5$.', r: false }, { e: 'Un événement certain a une probabilité de $1$.', r: true }, { e: 'Une probabilité est toujours positive ou nulle.', r: true }, { e: 'Une probabilité de $0$ signifie « certain ».', r: false }]; const p = pick(props); return { enonce: p.e, reponse: p.r }; },
      indices: ['Une probabilité est entre 0 et 1.', '0 = impossible, 1 = certain.', 'Elle ne dépasse jamais 1.'],
      correction_detaillee: () => `<p>$0 \\le P \\le 1$ : $0$ impossible, $1$ certain.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: 'Probabilité avec une urne.', generer() { const k = randInt(2, 5), autres = randInt(3, 7), n = k + autres; return { question: `Urne : $${k}$ rouges, $${autres}$ vertes. $P(\\text{rouge})$ (fraction ou décimal) ?`, reponse: k / n, validation: 'nombre', tolerance: 0.01, explication: `$\\dfrac{${k}}{${n}}$.` }; } },
    { type: 'qcm', question: 'Une probabilité est toujours comprise entre :', choix: ['0 et 1', '0 et 100', '-1 et 1', '1 et 6'], correct: 0, explication: 'De $0$ (impossible) à $1$ (certain).' },
    { type: 'saisie', question: 'Probabilité avec un dé.', generer() { const ev = pick([{ e: 'un nombre pair', f: 3 }, { e: 'un multiple de 3', f: 2 }, { e: 'un 6', f: 1 }]); return { question: `Dé à 6 faces : $P($ ${ev.e} $)$ (fraction ou décimal) ?`, reponse: ev.f / 6, validation: 'nombre', tolerance: 0.01, explication: `$\\dfrac{${ev.f}}{6}$.` }; } },
    { type: 'vrai_faux', question: 'Un événement impossible a une probabilité de 1.', reponse: false, explication: 'Non : un événement impossible a une probabilité de $0$.' },
    { type: 'qcm', question: 'Avec une pièce équilibrée, $P(\\text{face})$ vaut :', choix: ['\\dfrac12', '1', '0', '\\dfrac16'], correct: 0, explication: '2 issues équiprobables : $\\dfrac12$.' },
  ],
};
