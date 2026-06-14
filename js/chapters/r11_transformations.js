// =====================================================================
//  r11_transformations.js — Rappel de 4ᵉ : symétrie axiale, symétrie
//  centrale, translation (effet sur les coordonnées).
//  Figure interactive : translation d'un point (slider du vecteur).
// =====================================================================

import { randInt, randIntNonZero, pick } from '../engine.js';

function translationFig(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>vecteur a <input type="range" min="-5" max="5" value="3" data-a> <span class="fig-val" data-av></span></label>
      <label>vecteur b <input type="range" min="-5" max="5" value="2" data-b> <span class="fig-val" data-bv></span></label>
    </div>
    <div data-svg></div>
    <div class="fig-readout" data-readout></div>`;
  const svgHost = wrap.querySelector('[data-svg]'), readout = wrap.querySelector('[data-readout]');
  const Mx = -2, My = -1;
  function draw() {
    const a = +wrap.querySelector('[data-a]').value, b = +wrap.querySelector('[data-b]').value;
    wrap.querySelector('[data-av]').textContent = a; wrap.querySelector('[data-bv]').textContent = b;
    const px = Mx + a, py = My + b;
    const S = 168, c = S / 2, u = 13;
    const X = (x) => c + x * u, Y = (y) => c - y * u;
    let g = `<svg viewBox="0 0 ${S} ${S}" class="svg-plot" role="img" aria-label="repère et translation">`;
    for (let i = -6; i <= 6; i++) { g += `<line x1="${X(i)}" y1="0" x2="${X(i)}" y2="${S}" stroke="var(--border)"/><line x1="0" y1="${Y(i)}" x2="${S}" y2="${Y(i)}" stroke="var(--border)"/>`; }
    g += `<line x1="0" y1="${c}" x2="${S}" y2="${c}" stroke="var(--muted)" stroke-width="1.5"/><line x1="${c}" y1="0" x2="${c}" y2="${S}" stroke="var(--muted)" stroke-width="1.5"/>`;
    g += `<line x1="${X(Mx)}" y1="${Y(My)}" x2="${X(px)}" y2="${Y(py)}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    g += `<circle cx="${X(Mx)}" cy="${Y(My)}" r="4" fill="var(--t-fonctions)"/><text x="${X(Mx) - 8}" y="${Y(My) + 14}" font-size="12" fill="var(--text)">M</text>`;
    g += `<circle cx="${X(px)}" cy="${Y(py)}" r="5" fill="var(--ok)"/><text x="${X(px) + 6}" y="${Y(py) - 6}" font-size="12" fill="var(--accent-ink)" font-weight="700">M'</text>`;
    g += `</svg>`; svgHost.innerHTML = g;
    readout.innerHTML = `M(${Mx} ; ${My}) translaté du vecteur (${a} ; ${b}) → M'(<strong>${px}</strong> ; <strong>${py}</strong>)`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

export default {
  id: 'r11',
  titre: 'Translation et symétries (4ᵉ)',
  theme: 'rappels',
  priorite: false,
  icone: '🔄',

  intro:
    "Les transformations conservent les longueurs et les angles : la figure image est superposable à la figure " +
    "de départ. On révise la symétrie axiale (pliage), la symétrie centrale (demi-tour) et la translation " +
    "(glissement), et leur effet sur les coordonnées — une base pour les transformations de 3ᵉ (rotation, homothétie).",

  cours: [
    { type: 'definition', titre: 'Translation', contenu: "Glisser une figure selon un vecteur. Le point $M(x;y)$ translaté du vecteur $(a;b)$ devient $M'(x+a\\,;y+b)$." },
    { type: 'definition', titre: 'Symétrie axiale', contenu: "Pliage le long d'un axe. Par rapport à l'axe des abscisses : $M(x;y) \\mapsto M'(x\\,;-y)$. Par rapport à l'axe des ordonnées : $M(x;y) \\mapsto M'(-x\\,;y)$." },
    { type: 'definition', titre: 'Symétrie centrale', contenu: "Demi-tour autour d'un centre. Par rapport à l'origine $O$ : $M(x;y) \\mapsto M'(-x\\,;-y)$." },
    { type: 'figure', titre: 'Translation d\'un point', contenu: "Règle le vecteur $(a;b)$ : le point $M$ glisse vers son image $M'$ en ajoutant le vecteur à ses coordonnées.", render: (host) => translationFig(host) },
    { type: 'exemple', enonce: '$M(2;-3)$ translaté du vecteur $(4;1)$. Coordonnées de $M\\,\'$ ?', solution_etapes: ["On ajoute le vecteur : $M'(2+4\\,;-3+1)$.", "$M'(6\\,;-2)$."] },
  ],

  methode: [
    { etape: 1, titre: 'Identifier la transformation', explication: "Translation (vecteur), symétrie axiale (axe) ou symétrie centrale (centre) ?" },
    { etape: 2, titre: 'Appliquer la règle', explication: "Translation : $(x+a\\,;y+b)$. Axe des abscisses : $(x\\,;-y)$. Centre $O$ : $(-x\\,;-y)$." },
    { etape: 3, titre: 'Calculer chaque coordonnée', explication: "Traite l'abscisse, puis l'ordonnée (attention aux signes)." },
    { etape: 4, titre: 'Vérifier', explication: "Les longueurs sont conservées : la figure image a la même taille." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: 'Translation — donne l\'ABSCISSE de l\'image :',
      generer() { const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5), a = randIntNonZero(-4, 4), b = randIntNonZero(-4, 4); return { enonce: `$M(${x}\\,;${y})$ translaté du vecteur $(${a}\\,;${b})$. Abscisse de $M'$ ?`, reponse: x + a, validation: 'nombre' }; },
      indices: ['On ajoute le vecteur aux coordonnées.', "L'abscisse de $M'$ est $x + a$.", 'Attention aux signes.'],
      correction_detaillee: () => `<p>$M'(x+a\\,;y+b)$ : l'abscisse est $x+a$.</p>`,
    },
    {
      id: 'e02', niveau: 1, type: 'complete', consigne: 'Complète les coordonnées de l\'image (translation) :',
      generer() { const x = randIntNonZero(-4, 4), y = randIntNonZero(-4, 4), a = randIntNonZero(-4, 4), b = randIntNonZero(-4, 4); return { enonce_complete: `$M(${x}\\,;${y})$ translaté du vecteur $(${a}\\,;${b})$ : $M'($ {0} $;$ {1} $)$`, champs: [{ reponse: x + a, validation: 'nombre' }, { reponse: y + b, validation: 'nombre' }], _v: { x, y, a, b } }; },
      indices: ['Abscisse : $x + a$.', 'Ordonnée : $y + b$.', 'On ajoute le vecteur.'],
      correction_etapes(st) { const { x, y, a, b } = st._v; return [`Abscisse : $${x} + (${a}) = ${x + a}$.`, `Ordonnée : $${y} + (${b}) = ${y + b}$.`]; },
    },
    {
      id: 'e03', niveau: 2, type: 'saisie', consigne: 'Symétrie centrale (origine) — donne l\'ORDONNÉE de l\'image :',
      generer() { const x = randIntNonZero(-6, 6), y = randIntNonZero(-6, 6); return { enonce: `$M(${x}\\,;${y})$. Ordonnée de son symétrique par rapport à $O$ ?`, reponse: -y, validation: 'nombre' }; },
      indices: ['La symétrie centrale change les deux signes.', "$M'(-x\\,;-y)$.", "L'ordonnée devient $-y$."],
      correction_detaillee: () => `<p>Par symétrie de centre $O$ : $M'(-x\\,;-y)$.</p>`,
    },
    {
      id: 'e04', niveau: 2, type: 'ordonner_etapes', consigne: 'Remets dans l\'ordre l\'application d\'une translation :',
      generer() { const x = randIntNonZero(-4, 4), y = randIntNonZero(-4, 4), a = randIntNonZero(-4, 4), b = randIntNonZero(-4, 4); return { etapes: [`Identifier la transformation : translation de vecteur $(${a}\\,;${b})$`, `Appliquer la règle : on ajoute le vecteur aux coordonnées`, `Calculer l'abscisse : $${x} + (${a}) = ${x + a}$`, `Calculer l'ordonnée : $${y} + (${b}) = ${y + b}$`] }; },
      indices: ['On identifie d\'abord la transformation.', 'On applique la règle avant de calculer.', 'On traite les deux coordonnées.'],
      correction_detaillee: () => `<p>Ordre : identifier → appliquer la règle → abscisse → ordonnée.</p>`,
    },
    {
      id: 'e05', niveau: 3, type: 'saisie', consigne: 'Symétrie axiale (axe des abscisses) — donne l\'ORDONNÉE :',
      generer() { const x = randIntNonZero(-6, 6), y = randIntNonZero(-6, 6); return { enonce: `$M(${x}\\,;${y})$. Symétrique par rapport à l'axe des abscisses : son ordonnée ?`, reponse: -y, validation: 'nombre', _v: { x, y } }; },
      indices: ['Symétrie par rapport à l\'axe des $x$ : l\'abscisse ne change pas.', 'L\'ordonnée change de signe.', "$M'(x\\,;-y)$."],
      correction_etapes(st) { const { x, y } = st._v; return [`Par rapport à l'axe des abscisses : $M(x;y) \\mapsto M'(x\\,;-y)$.`, `L'abscisse reste $${x}$, l'ordonnée devient $-(${y}) = ${-y}$.`]; },
    },
    {
      id: 'e06', niveau: 3, type: 'qcm', consigne: 'Quelle transformation ?',
      generer() { const cas = [{ e: 'fait glisser la figure sans la tourner', good: 'translation' }, { e: "fait faire un demi-tour autour d'un point", good: 'symétrie centrale' }, { e: 'agit comme un pliage le long d\'une droite', good: 'symétrie axiale' }]; const c = pick(cas); const choix = ['translation', 'symétrie centrale', 'symétrie axiale']; return { enonce: `La transformation qui ${c.e} est :`, choix, correct: choix.indexOf(c.good) }; },
      indices: ['Translation = glissement.', 'Symétrie centrale = demi-tour.', 'Symétrie axiale = pliage.'],
      correction_detaillee: () => `<p>Glissement → translation ; demi-tour → symétrie centrale ; pliage → symétrie axiale.</p>`,
    },
  ],

  quiz_bilan: [
    { type: 'saisie', question: "Translation : abscisse de l'image.", generer() { const x = randIntNonZero(-5, 5), y = randIntNonZero(-5, 5), a = randIntNonZero(-4, 4), b = randIntNonZero(-4, 4); return { question: `$M(${x};${y})$ translaté du vecteur $(${a};${b})$ : abscisse de $M'$ ?`, reponse: x + a, validation: 'nombre', explication: `$${x} + (${a}) = ${x + a}$.` }; } },
    { type: 'qcm', question: "Une transformation qui conserve les longueurs s'appelle :", choix: ['une isométrie', 'une homothétie', 'une projection', 'une dilatation'], correct: 0, explication: 'Translation, symétrie et rotation sont des isométries.' },
    { type: 'saisie', question: 'Symétrie centrale : ordonnée de l\'image.', generer() { const x = randIntNonZero(-6, 6), y = randIntNonZero(-6, 6); return { question: `Symétrique de $M(${x};${y})$ par rapport à $O$ : son ordonnée ?`, reponse: -y, validation: 'nombre', explication: `$M'(-x;-y)$ → ordonnée $= ${-y}$.` }; } },
    { type: 'vrai_faux', question: "La symétrie par rapport à l'axe des ordonnées change le signe de l'abscisse.", reponse: true, explication: "$M(x;y) \\mapsto M'(-x;y)$." },
    { type: 'saisie', question: 'Symétrie axiale (axe des abscisses) : ordonnée de l\'image.', generer() { const x = randIntNonZero(-6, 6), y = randIntNonZero(-6, 6); return { question: `Symétrique de $M(${x};${y})$ par rapport à l'axe des abscisses : son ordonnée ?`, reponse: -y, validation: 'nombre', explication: `$M'(x;-y)$ → ordonnée $= ${-y}$.` }; } },
  ],
};
