// =====================================================================
//  render.js — Rendu visuel
//  - Formules mathématiques via KaTeX (auto-render)
//  - Traceur de fonctions SVG interactif (lecture image / antécédent)
//  - Intégration JSXGraph (figures géométriques dynamiques)
//  - Helper Chart.js (statistiques)
//
//  Les bibliothèques KaTeX / JSXGraph / Chart.js sont chargées par CDN
//  dans index.html et exposées en global (window.katex, window.JXG, etc.).
//  Ce module n'importe rien : il est en bas de la chaîne de dépendances.
// =====================================================================

const MATH_DELIMS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '$', right: '$', display: false },
  { left: '\\(', right: '\\)', display: false },
];

/** Échappe le HTML pour éviter toute injection dans les énoncés. */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Rend toutes les formules LaTeX contenues dans un élément.
 * Utilise l'extension auto-render de KaTeX ($...$ et $$...$$).
 */
export function renderMath(el) {
  if (!el) return;
  if (typeof window.renderMathInElement === 'function') {
    try {
      window.renderMathInElement(el, {
        delimiters: MATH_DELIMS,
        throwOnError: false,
        strict: 'ignore', // tolère les lettres accentuées françaises dans \text{}
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      });
    } catch (e) {
      console.warn('[render] KaTeX auto-render a échoué :', e);
    }
  }
}

/** Rend une formule LaTeX en ligne et renvoie le HTML (chaîne). */
export function katexInline(tex) {
  if (window.katex) {
    try {
      return window.katex.renderToString(tex, { throwOnError: false, displayMode: false });
    } catch (e) {
      return escapeHtml(tex);
    }
  }
  return escapeHtml(tex);
}

/**
 * Rend le libellé d'un choix (QCM / vrai-faux) en HTML.
 *
 * Un choix peut être :
 *   - du texte en prose      → « une homothétie », « croissante »…
 *   - une expression math nue → « 5x + 2 », « \dfrac{a}{b} », « 10^{12} »…
 *   - un mélange texte + $…$  → « L'image de $4$ par $f$ est $2$. »
 *
 * Historiquement TOUS les choix passaient par `katexInline`, donc en mode
 * mathématique KaTeX où les espaces sont supprimés : « une homothétie »
 * s'affichait « unehomothétie ». On route désormais chaque choix vers le
 * bon rendu : la prose reste du texte (espaces préservés), les maths nues
 * passent par KaTeX, et le mélange est laissé au passage `renderMath` du
 * conteneur (qui ne traite que les segments délimités par `$…$`).
 */
export function renderChoiceHTML(c) {
  const s = String(c);
  // Mélange texte + maths délimitées : on échappe et on laisse renderMath
  // (appelé sur le conteneur après injection) traiter les segments $…$.
  if (s.includes('$')) return escapeHtml(s);
  // Prose : présence d'un mot de 2 lettres ou plus, sans signal LaTeX (\ ^ _).
  if (/[a-zàâäéèêëïîôöùûüç]{2,}/i.test(s) && !/[\\^_]/.test(s)) return escapeHtml(s);
  // Nombres / symboles seuls (« 10 000 », « 0 et 1 »… déjà capté ci-dessus) :
  // pas de lettre ni de signal LaTeX → garder l'espacement d'origine.
  if (!/[a-zA-Z]/.test(s) && !/[\\^_]/.test(s)) return escapeHtml(s);
  // Sinon : expression mathématique compacte (5x+2, (x-4)(x+4), f(x)=2x, \dfrac…).
  return katexInline(s);
}

/** Rend une formule LaTeX centrée (display) et renvoie le HTML (chaîne). */
export function katexBlock(tex) {
  if (window.katex) {
    try {
      return window.katex.renderToString(tex, { throwOnError: false, displayMode: true });
    } catch (e) {
      return escapeHtml(tex);
    }
  }
  return escapeHtml(tex);
}

// ---------------------------------------------------------------------
//  Traceur de fonctions SVG interactif
//  Affiche une ou plusieurs courbes, repère gradué, et permet de lire
//  l'image d'un x au clic (chapitres 7, 8, 9).
// ---------------------------------------------------------------------

const SVGNS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

/**
 * Trace une (ou plusieurs) fonction(s) dans un conteneur SVG interactif.
 *
 * @param {HTMLElement} container  élément hôte
 * @param {Function|Array} fns     fn(x)->y, ou tableau [{fn, color, label}]
 * @param {Object} opts
 *    xmin,xmax,ymin,ymax  fenêtre (ymin/ymax auto si null)
 *    width,height         dimensions du SVG (responsive via viewBox)
 *    grid                 affiche la grille (def. true)
 *    interactive          lecture au clic (def. true)
 *    markers              [{x,y,label}] points à marquer
 *    onPick               callback({x,y}) au clic sur le repère
 * @returns {Object} API { addMarker, clearMarkers, redraw }
 */
export function plotFunction(container, fns, opts = {}) {
  const o = Object.assign(
    {
      xmin: -6, xmax: 6, ymin: null, ymax: null,
      width: 360, height: 300,
      grid: true, interactive: true,
      markers: [], onPick: null,
    },
    opts
  );

  const curves = (typeof fns === 'function')
    ? [{ fn: fns, color: 'var(--accent, #4a7)', label: '' }]
    : fns;

  // Détermination automatique de la fenêtre verticale si non fournie.
  let { ymin, ymax } = o;
  if (ymin === null || ymax === null) {
    let lo = Infinity, hi = -Infinity;
    for (const c of curves) {
      for (let i = 0; i <= 200; i++) {
        const x = o.xmin + (i / 200) * (o.xmax - o.xmin);
        const y = safeEval(c.fn, x);
        if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi) { lo = -6; hi = 6; }
    const pad = (hi - lo) * 0.15 || 1;
    ymin = ymin === null ? Math.floor(lo - pad) : ymin;
    ymax = ymax === null ? Math.ceil(hi + pad) : ymax;
  }

  const W = o.width, H = o.height, M = 28; // marges
  const px = (x) => M + ((x - o.xmin) / (o.xmax - o.xmin)) * (W - 2 * M);
  const py = (y) => H - M - ((y - ymin) / (ymax - ymin)) * (H - 2 * M);
  const ux = (sx) => o.xmin + ((sx - M) / (W - 2 * M)) * (o.xmax - o.xmin);

  container.innerHTML = '';
  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'svg-plot',
    role: 'img',
    'aria-label': 'Graphique de fonction',
  });

  // --- Grille ---
  if (o.grid) {
    const g = svg('g', { class: 'plot-grid' });
    for (let x = Math.ceil(o.xmin); x <= o.xmax; x++) {
      g.appendChild(svg('line', { x1: px(x), y1: M, x2: px(x), y2: H - M }));
    }
    for (let y = Math.ceil(ymin); y <= ymax; y++) {
      g.appendChild(svg('line', { x1: M, y1: py(y), x2: W - M, y2: py(y) }));
    }
    root.appendChild(g);
  }

  // --- Axes ---
  const axes = svg('g', { class: 'plot-axes' });
  const y0 = Math.max(ymin, Math.min(ymax, 0));
  const x0 = Math.max(o.xmin, Math.min(o.xmax, 0));
  axes.appendChild(svg('line', { x1: M, y1: py(y0), x2: W - M, y2: py(y0) })); // axe X
  axes.appendChild(svg('line', { x1: px(x0), y1: M, x2: px(x0), y2: H - M })); // axe Y
  // Graduations chiffrées (espacées pour rester lisibles sur mobile)
  const stepX = Math.max(1, Math.round((o.xmax - o.xmin) / 8));
  for (let x = Math.ceil(o.xmin); x <= o.xmax; x += stepX) {
    if (x === 0) continue;
    const t = svg('text', { x: px(x), y: py(y0) + 14, class: 'plot-tick', 'text-anchor': 'middle' });
    t.textContent = x;
    axes.appendChild(t);
  }
  const stepY = Math.max(1, Math.round((ymax - ymin) / 8));
  for (let y = Math.ceil(ymin); y <= ymax; y += stepY) {
    if (y === 0) continue;
    const t = svg('text', { x: px(x0) - 6, y: py(y) + 4, class: 'plot-tick', 'text-anchor': 'end' });
    t.textContent = y;
    axes.appendChild(t);
  }
  root.appendChild(axes);

  // --- Courbes ---
  for (const c of curves) {
    let d = '';
    let pen = false;
    for (let i = 0; i <= 400; i++) {
      const x = o.xmin + (i / 400) * (o.xmax - o.xmin);
      const y = safeEval(c.fn, x);
      if (!Number.isFinite(y) || y < ymin - 5 || y > ymax + 5) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${px(x).toFixed(1)},${py(y).toFixed(1)} `;
      pen = true;
    }
    root.appendChild(svg('path', { d, class: 'plot-curve', style: `stroke:${c.color || 'var(--accent,#4a7)'}` }));
  }

  // --- Couche interactive (marqueurs + lecture au clic) ---
  const markerLayer = svg('g', { class: 'plot-markers' });
  root.appendChild(markerLayer);

  function drawMarker({ x, y, label, color }) {
    const cy = py(y);
    const cx = px(x);
    const grp = svg('g');
    // lignes de rappel pointillées vers les axes
    grp.appendChild(svg('line', { x1: cx, y1: cy, x2: cx, y2: py(y0), class: 'plot-help' }));
    grp.appendChild(svg('line', { x1: cx, y1: cy, x2: px(x0), y2: cy, class: 'plot-help' }));
    grp.appendChild(svg('circle', { cx, cy, r: 5, class: 'plot-point', style: color ? `fill:${color}` : '' }));
    if (label) {
      const t = svg('text', { x: cx + 8, y: cy - 8, class: 'plot-label' });
      t.textContent = label;
      grp.appendChild(t);
    }
    markerLayer.appendChild(grp);
  }

  function clearMarkers() { markerLayer.innerHTML = ''; }

  (o.markers || []).forEach(drawMarker);

  if (o.interactive && curves.length) {
    root.style.cursor = 'crosshair';
    const readout = document.createElement('div');
    readout.className = 'plot-readout';
    readout.textContent = 'Touche la courbe pour lire un point';

    const pick = (evt) => {
      const rect = root.getBoundingClientRect();
      const clientX = (evt.touches ? evt.touches[0].clientX : evt.clientX);
      const sx = ((clientX - rect.left) / rect.width) * W;
      const x = Math.round(ux(sx) * 10) / 10;
      const y = safeEval(curves[0].fn, x);
      if (!Number.isFinite(y)) return;
      clearMarkers();
      drawMarker({ x, y, label: `(${x} ; ${Math.round(y * 100) / 100})` });
      readout.innerHTML = `Point lu : image de <strong>${x}</strong> = <strong>${Math.round(y * 100) / 100}</strong>`;
      if (typeof o.onPick === 'function') o.onPick({ x, y });
    };
    root.addEventListener('click', pick);
    root.addEventListener('touchstart', (e) => { e.preventDefault(); pick(e); }, { passive: false });

    container.appendChild(root);
    container.appendChild(readout);
  } else {
    container.appendChild(root);
  }

  return {
    addMarker: drawMarker,
    clearMarkers,
  };
}

function safeEval(fn, x) {
  try {
    const y = fn(x);
    return typeof y === 'number' ? y : NaN;
  } catch (e) {
    return NaN;
  }
}

// ---------------------------------------------------------------------
//  Intégration JSXGraph (figures géométriques dynamiques)
// ---------------------------------------------------------------------

let _jxgCount = 0;

/**
 * Crée un plateau JSXGraph et appelle le builder pour le peupler.
 * @param {HTMLElement} container
 * @param {Function} builder  (board, JXG) => void
 * @param {Object} attrs      attributs initBoard (boundingbox, axis...)
 * @returns {Object|null} le board, ou null si JSXGraph indisponible
 */
export function mountJSXGraph(container, builder, attrs = {}) {
  if (!window.JXG) {
    container.innerHTML = '<p class="notice">⚠️ JSXGraph n\'est pas chargé.</p>';
    return null;
  }
  const id = `jxg-${++_jxgCount}`;
  const box = document.createElement('div');
  box.id = id;
  box.className = 'jxg-board';
  container.appendChild(box);

  const board = window.JXG.JSXGraph.initBoard(id, Object.assign({
    boundingbox: [-6, 6, 6, -6],
    axis: true,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
    pan: { enabled: false },
  }, attrs));

  try {
    builder(board, window.JXG);
  } catch (e) {
    console.error('[render] erreur dans le builder JSXGraph :', e);
  }
  return board;
}

// ---------------------------------------------------------------------
//  Helper Chart.js (statistiques, chapitre 15)
// ---------------------------------------------------------------------

/**
 * Crée un graphique Chart.js dans un <canvas> ajouté au conteneur.
 * @returns {Object|null} l'instance Chart, ou null si indisponible
 */
export function mountChart(container, config) {
  if (!window.Chart) {
    container.innerHTML = '<p class="notice">⚠️ Chart.js n\'est pas chargé.</p>';
    return null;
  }
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  return new window.Chart(canvas, config);
}

// ---------------------------------------------------------------------
//  Diagramme en boîte (box-plot) — médiane, quartiles, étendue
//  Rendu en SVG (réutilise le style .svg-plot, contrasté en thème sombre).
//  Chart.js n'a pas de box-plot natif sans plugin : le SVG est plus fiable
//  et entièrement thémable (moustaches + boîte + médiane + graduations).
// ---------------------------------------------------------------------

/**
 * Trace un diagramme en boîte horizontal.
 * @param {HTMLElement} container
 * @param {Object} stats  { min, q1, med, q3, max }
 * @param {Object} opts   width, height, min/max (bornes de l'axe), titre
 */
export function mountBoxPlot(container, stats, opts = {}) {
  const o = Object.assign({ width: 360, height: 150 }, opts);
  const { min, q1, med, q3, max } = stats;
  let lo = o.min != null ? o.min : min;
  let hi = o.max != null ? o.max : max;
  const pad = ((hi - lo) || 1) * 0.12;
  lo -= pad; hi += pad;

  const W = o.width, H = o.height, ML = 18, MR = 18;
  const axisY = H - 26, boxTop = 38, boxBot = axisY - 16, cy = (boxTop + boxBot) / 2;
  const X = (v) => ML + ((v - lo) / (hi - lo)) * (W - ML - MR);

  container.innerHTML = '';
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svg-plot boxplot', role: 'img', 'aria-label': `Diagramme en boîte : minimum ${min}, premier quartile ${q1}, médiane ${med}, troisième quartile ${q3}, maximum ${max}` });

  // Moustaches (min→Q1 et Q3→max)
  root.appendChild(svg('line', { x1: X(min), y1: cy, x2: X(q1), y2: cy, class: 'bp-whisker' }));
  root.appendChild(svg('line', { x1: X(q3), y1: cy, x2: X(max), y2: cy, class: 'bp-whisker' }));
  // Extrémités (min, max)
  [min, max].forEach((v) => root.appendChild(svg('line', { x1: X(v), y1: boxTop + 5, x2: X(v), y2: boxBot - 5, class: 'bp-cap' })));
  // Boîte (Q1 → Q3)
  root.appendChild(svg('rect', { x: X(q1), y: boxTop, width: Math.max(1, X(q3) - X(q1)), height: boxBot - boxTop, rx: 3, class: 'bp-box' }));
  // Médiane
  root.appendChild(svg('line', { x1: X(med), y1: boxTop, x2: X(med), y2: boxBot, class: 'bp-median' }));
  // Axe
  root.appendChild(svg('line', { x1: ML, y1: axisY, x2: W - MR, y2: axisY, class: 'plot-axes' }));

  // Étiquettes : valeur sous l'axe, rôle au-dessus de la boîte (en évitant les doublons)
  const seen = new Set();
  const tick = (v, role) => {
    const x = X(v);
    root.appendChild(svg('line', { x1: x, y1: axisY - 3, x2: x, y2: axisY + 3, class: 'plot-axes' }));
    const key = `${Math.round(x)}`;
    if (!seen.has(key)) {
      const tv = svg('text', { x, y: axisY + 15, class: 'plot-tick', 'text-anchor': 'middle' });
      tv.textContent = (Math.round(v * 100) / 100);
      root.appendChild(tv);
      seen.add(key);
    }
    if (role) {
      const tr = svg('text', { x, y: boxTop - 6, class: 'bp-role', 'text-anchor': 'middle' });
      tr.textContent = role;
      root.appendChild(tr);
    }
  };
  tick(min, 'min'); tick(q1, 'Q1'); tick(med, 'Méd'); tick(q3, 'Q3'); tick(max, 'max');

  container.appendChild(root);
  return root;
}
