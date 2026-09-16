// =====================================================================
//  commun.js — Outils partagés par les chapitres (5ᵉ et 4ᵉ)
//  - écriture des nombres (virgule française, parenthèses des négatifs)
//  - petites figures SVG (segments, polygones, arcs d'angle, repères)
//  - tableaux de valeurs, blocs de programme façon Scratch
//  Tout est renvoyé sous forme de chaînes HTML : utilisable dans un
//  énoncé, une correction ou un bloc de cours `figure`.
// =====================================================================

// ------------------------------------------------------------ Nombres

/** Arrondi à n décimales (sans erreurs d'affichage du type 0,30000000004). */
export const arrondi = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

/** Nombre pour du texte : 3.5 → « 3,5 ». */
export const dec = (x, n = 6) => String(arrondi(x, n)).replace('.', ',').replace('-', '−');

/** Nombre pour du LaTeX : 3.5 → « 3{,}5 » (sans espace parasite). */
export const tex = (x, n = 6) => String(arrondi(x, n)).replace('.', '{,}');

/** Met un négatif entre parenthèses (LaTeX) : -3 → « (-3) ». */
export const par = (x) => (x < 0 ? `(${tex(x)})` : tex(x));

/** Signe explicite pour un terme : 3 → « + 3 », -3 → « - 3 ». */
export const sgn = (x) => (x < 0 ? `- ${tex(-x)}` : `+ ${tex(x)}`);

/** Mélange un tableau (copie). */
export function melanger(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Fraction LaTeX. */
export const frac = (a, b) => `\\dfrac{${tex(a)}}{${tex(b)}}`;

/** PGCD. */
export function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }

/** Fraction simplifiée en LaTeX (« 3 » si entière). */
export function fracSimple(a, b) {
  const g = pgcd(a, b), n = a / g, d = b / g;
  if (d === 1) return tex(n);
  return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
}

// ------------------------------------------------------------ Tableaux

/**
 * Tableau HTML à lignes : lignes = [['x', 1, 2, 3], ['y', 4, 8, 12]].
 * La 1ʳᵉ cellule de chaque ligne est un en-tête. Les cellules sont du HTML
 * (on peut y mettre du $LaTeX$).
 */
export function tableau(lignes, { classe = '' } = {}) {
  return `<div class="tab-wrap"><table class="tab-math ${classe}"><tbody>${lignes.map((l) =>
    `<tr>${l.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// ------------------------------------------------------------ Programmes

/** Pseudo-code (bloc monospace). */
export const code = (lignes) => `<pre class="pseudocode">${lignes.join('\n')}</pre>`;

const CAT = { evt: 'evt', mvt: 'mvt', ctl: 'ctl', var: 'var', ope: 'ope', app: 'app', sty: 'sty', cap: 'cap' };

function libelleBloc(s) {
  // Texte échappé (« < », « > » des comparaisons), puis « [50] » → valeur dans une bulle blanche.
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\[([^\]]*)\]/g, '<span class="sb-val">$1</span>');
}

/**
 * Programme en blocs façon Scratch.
 *   'evt:quand ⚑ est cliqué'                         bloc simple (catégorie:texte)
 *   ['ctl:répéter [4] fois', [ ...blocs ]]           bloc « C » (boucle, si…)
 *   ['ctl:si … alors', [ ... ], 'sinon', [ ... ]]    bloc « si … sinon »
 * Catégories : evt, mvt, ctl, var, ope, app, sty, cap.
 */
export function scratch(blocs) {
  const un = (b) => {
    if (Array.isArray(b)) {
      const [tete, corps, sinon, corps2] = b;
      const [cat, txt] = decoupe(tete);
      return `<div class="sb-c sb-${cat}"><div class="sb sb-${cat}">${libelleBloc(txt)}</div>` +
        `<div class="sb-corps">${(corps || []).map(un).join('')}</div>` +
        (sinon ? `<div class="sb sb-${cat} sb-mid">${libelleBloc(sinon)}</div><div class="sb-corps">${(corps2 || []).map(un).join('')}</div>` : '') +
        `<div class="sb sb-${cat} sb-fin"></div></div>`;
    }
    const [cat, txt] = decoupe(b);
    return `<div class="sb sb-${cat}">${libelleBloc(txt)}</div>`;
  };
  const decoupe = (s) => { const m = String(s).match(/^(\w{3}):(.*)$/); return m && CAT[m[1]] ? [m[1], m[2]] : ['ctl', s]; };
  return `<div class="scratch" role="img" aria-label="programme en blocs">${blocs.map(un).join('')}</div>`;
}

/**
 * Tracé du stylo d'un lutin (façon Scratch) : actions = [['avancer', 50], ['tourner', 90], …].
 * Le lutin part vers la droite ; « tourner » est dans le sens des aiguilles d'une montre (↻).
 * Renvoie un SVG mis à l'échelle automatiquement.
 */
export function traceLutin(actions, { W = 220, H = 200, label = 'tracé du lutin' } = {}) {
  let x = 0, y = 0, a = 0; const pts = [[0, 0]];
  actions.forEach(([k, v]) => {
    if (k === 'avancer') { x += v * Math.cos(a * Math.PI / 180); y += v * Math.sin(a * Math.PI / 180); pts.push([x, y]); }
    else if (k === 'tourner') a += v; // y vers le bas à l'écran : +a = sens horaire
  });
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const M = 18, k = Math.min((W - 2 * M) / ((x1 - x0) || 1), (H - 2 * M) / ((y1 - y0) || 1));
  const P = (p) => [M + (p[0] - x0) * k + ((W - 2 * M) - (x1 - x0) * k) / 2, M + (p[1] - y0) * k + ((H - 2 * M) - (y1 - y0) * k) / 2];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${f1(P(p)[0])} ${f1(P(p)[1])}`).join(' ');
  const [sx, sy] = P(pts[0]);
  return svg(W, H, `<path d="${d}" fill="none" stroke="var(--t-algo)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${f1(sx)}" cy="${f1(sy)}" r="5" fill="var(--accent)"/>`, label);
}

// ------------------------------------------------------------ SVG

const f1 = (v) => (Math.round(v * 10) / 10).toString();

/** Enveloppe SVG (responsive, thémée). */
export const svg = (W, H, contenu, label = 'figure', classe = '') =>
  `<svg viewBox="0 0 ${W} ${H}" class="svg-plot fig-chap ${classe}" role="img" aria-label="${label}">${contenu}</svg>`;

/** Segment [AB]. o : { c: couleur, w: épaisseur, dash: pointillés } */
export const seg = (A, B, o = {}) =>
  `<line x1="${f1(A[0])}" y1="${f1(A[1])}" x2="${f1(B[0])}" y2="${f1(B[1])}" stroke="${o.c || 'var(--text)'}" stroke-width="${o.w || 2}" stroke-linecap="round"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`;

/** Polygone. o : { c, w, fill, dash } */
export const poly = (pts, o = {}) =>
  `<polygon points="${pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="${o.fill || 'none'}" stroke="${o.c || 'var(--text)'}" stroke-width="${o.w || 2}" stroke-linejoin="round"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`;

/** Texte. o : { c, size, anchor, bold } */
export const txt = (x, y, s, o = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" fill="${o.c || 'var(--text)'}" font-size="${o.size || 13}" text-anchor="${o.anchor || 'middle'}" font-weight="${o.bold === false ? 400 : 600}">${s}</text>`;

/** Point marqué d'une croix + son nom décalé de (dx, dy). */
export const point = (P, nom = '', dx = 0, dy = -9, c = 'var(--accent-ink)') =>
  `<path d="M ${f1(P[0] - 3.5)} ${f1(P[1] - 3.5)} L ${f1(P[0] + 3.5)} ${f1(P[1] + 3.5)} M ${f1(P[0] - 3.5)} ${f1(P[1] + 3.5)} L ${f1(P[0] + 3.5)} ${f1(P[1] - 3.5)}" stroke="${c}" stroke-width="2"/>` +
  (nom ? txt(P[0] + dx, P[1] + dy + 4, nom, { c }) : '');

/** Cercle. */
export const cercle = (C, r, o = {}) =>
  `<circle cx="${f1(C[0])}" cy="${f1(C[1])}" r="${f1(r)}" fill="${o.fill || 'none'}" stroke="${o.c || 'var(--text)'}" stroke-width="${o.w || 2}"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`;

/** Milieu de deux points. */
export const milieu = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];

/** Point à la fraction t du segment [AB]. */
export const surSegment = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];

/** Direction (en degrés, sens trigonométrique à l'écran) de S vers P. */
export const direction = (S, P) => Math.atan2(S[1] - P[1], P[0] - S[0]) * 180 / Math.PI;

/**
 * Arc d'angle de sommet S entre les directions d1 et d2 (degrés, sens direct),
 * avec étiquette facultative placée sur la bissectrice.
 */
export function arcAngle(S, d1, d2, r = 22, etiquette = '', o = {}) {
  let a1 = d1, a2 = d2;
  while (a2 < a1) a2 += 360;
  if (a2 - a1 > 360) a2 -= 360;
  const P = (a) => [S[0] + r * Math.cos(a * Math.PI / 180), S[1] - r * Math.sin(a * Math.PI / 180)];
  const [x1, y1] = P(a1), [x2, y2] = P(a2);
  const grand = a2 - a1 > 180 ? 1 : 0;
  let s = `<path d="M ${f1(x1)} ${f1(y1)} A ${r} ${r} 0 ${grand} 0 ${f1(x2)} ${f1(y2)}" fill="${o.fill || 'none'}" stroke="${o.c || 'var(--t-geometrie)'}" stroke-width="${o.w || 2}"/>`;
  if (etiquette) {
    const m = (a1 + a2) / 2, R = r + (o.decal || 13);
    s += txt(S[0] + R * Math.cos(m * Math.PI / 180), S[1] - R * Math.sin(m * Math.PI / 180) + 4, etiquette, { c: o.c || 'var(--t-geometrie)', size: o.size || 12 });
  }
  return s;
}

/** Marque d'angle droit au sommet S, côtés vers A et B. */
export function angleDroit(S, A, B, t = 11) {
  const u = (P) => { const dx = P[0] - S[0], dy = P[1] - S[1], n = Math.hypot(dx, dy) || 1; return [dx / n * t, dy / n * t]; };
  const [ax, ay] = u(A), [bx, by] = u(B);
  return `<path d="M ${f1(S[0] + ax)} ${f1(S[1] + ay)} L ${f1(S[0] + ax + bx)} ${f1(S[1] + ay + by)} L ${f1(S[0] + bx)} ${f1(S[1] + by)}" fill="none" stroke="var(--muted)" stroke-width="1.5"/>`;
}

/** Petits traits de codage (longueurs égales) au milieu de [AB]. */
export function codage(A, B, n = 1, c = 'var(--t-geometrie)') {
  const [mx, my] = milieu(A, B);
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L * 6, ny = dx / L * 6, ux = dx / L * 4, uy = dy / L * 4;
  let s = '';
  for (let i = 0; i < n; i++) {
    const k = (i - (n - 1) / 2);
    s += `<line x1="${f1(mx + ux * k - nx)}" y1="${f1(my + uy * k - ny)}" x2="${f1(mx + ux * k + nx)}" y2="${f1(my + uy * k + ny)}" stroke="${c}" stroke-width="2"/>`;
  }
  return s;
}

/**
 * Repère quadrillé : renvoie { X, Y, fond } où X(x), Y(y) convertissent des
 * coordonnées en pixels et `fond` est le SVG de la grille + axes gradués.
 */
export function repere({ xmin = -5, xmax = 5, ymin = -5, ymax = 5, W = 300, H = null, pas = 1, marge = 20 } = {}) {
  const u = (W - 2 * marge) / (xmax - xmin);
  H = H || Math.round(2 * marge + u * (ymax - ymin));
  const X = (x) => marge + (x - xmin) * u;
  const Y = (y) => H - marge - (y - ymin) * u;
  let fond = '';
  for (let x = xmin; x <= xmax; x += pas) fond += `<line x1="${f1(X(x))}" y1="${f1(Y(ymin))}" x2="${f1(X(x))}" y2="${f1(Y(ymax))}" stroke="var(--border)" stroke-width="1"/>`;
  for (let y = ymin; y <= ymax; y += pas) fond += `<line x1="${f1(X(xmin))}" y1="${f1(Y(y))}" x2="${f1(X(xmax))}" y2="${f1(Y(y))}" stroke="var(--border)" stroke-width="1"/>`;
  if (xmin <= 0 && xmax >= 0) fond += `<line x1="${f1(X(0))}" y1="${f1(Y(ymin))}" x2="${f1(X(0))}" y2="${f1(Y(ymax))}" stroke="var(--muted)" stroke-width="1.6"/>`;
  if (ymin <= 0 && ymax >= 0) fond += `<line x1="${f1(X(xmin))}" y1="${f1(Y(0))}" x2="${f1(X(xmax))}" y2="${f1(Y(0))}" stroke="var(--muted)" stroke-width="1.6"/>`;
  const ox = xmin <= 0 && xmax >= 0 ? 0 : xmin, oy = ymin <= 0 && ymax >= 0 ? 0 : ymin;
  for (let x = xmin; x <= xmax; x += pas) if (x !== ox) fond += txt(X(x), Y(oy) + 13, String(x).replace('-', '−'), { c: 'var(--muted)', size: 10, bold: false });
  for (let y = ymin; y <= ymax; y += pas) if (y !== oy) fond += txt(X(ox) - 8, Y(y) + 4, String(y).replace('-', '−'), { c: 'var(--muted)', size: 10, bold: false, anchor: 'end' });
  fond += txt(X(ox) - 7, Y(oy) + 13, '0', { c: 'var(--muted)', size: 10, bold: false });
  return { X, Y, W, H, u, fond };
}

/**
 * Droite graduée : de `min` à `max`, une graduation tous les `pas`,
 * étiquettes tous les `etiq` pas (ou seulement pour les valeurs de `seulement`).
 * points = [{ x, nom }].
 */
export function droiteGraduee({ min = -5, max = 5, pas = 1, etiq = 1, points = [], W = 320, seulement = null } = {}) {
  const M = 22, H = 70, y0 = 40;
  const X = (v) => M + (v - min) / (max - min) * (W - 2 * M);
  let s = seg([M - 8, y0], [W - M + 8, y0], { c: 'var(--muted)', w: 1.6 });
  const n = Math.round((max - min) / pas);
  for (let i = 0; i <= n; i++) {
    const v = arrondi(min + i * pas, 6), x = X(v);
    const fort = seulement ? seulement.some((w) => Math.abs(w - v) < 1e-9) : i % etiq === 0;
    s += seg([x, y0 - (fort ? 6 : 3.5)], [x, y0 + (fort ? 6 : 3.5)], { c: 'var(--muted)', w: fort ? 1.6 : 1 });
    if (fort) s += txt(x, y0 + 22, dec(v), { c: 'var(--muted)', size: 11, bold: false });
  }
  points.forEach((p) => { s += `<circle cx="${f1(X(p.x))}" cy="${y0}" r="4.5" fill="var(--accent)"/>` + txt(X(p.x), y0 - 12, p.nom, { c: 'var(--accent-ink)' }); });
  return svg(W, H, s, 'droite graduée', 'fig-droite');
}
