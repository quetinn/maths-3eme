// =====================================================================
//  v15_statistiques.js — 5ᵉ : série statistique, effectifs, fréquences,
//  moyenne (simple et pondérée), lecture et construction de diagrammes
//  (barres, circulaire). Figure interactive : diagramme en barres.
// =====================================================================

import { randInt, pick } from '../../engine.js';
import { tex, dec, arrondi, tableau, svg, txt, poly } from '../commun.js';

/** Diagramme en barres (SVG maison, sans bibliothèque). */
function figBarres(labels, valeurs, { W = 300, H = 180, couleur = 'var(--accent)' } = {}) {
  const M = 26, base = H - 28, max = Math.max(...valeurs, 1);
  const largeur = (W - 2 * M) / valeurs.length;
  let s = `<line x1="${M - 6}" y1="${base}" x2="${W - M + 6}" y2="${base}" stroke="var(--muted)" stroke-width="1.5"/>`;
  valeurs.forEach((v, i) => {
    const h = (v / max) * (base - 24), x = M + i * largeur + largeur * 0.18, w = largeur * 0.64;
    s += poly([[x, base - h], [x + w, base - h], [x + w, base], [x, base]], { fill: 'var(--accent-soft)', c: couleur, w: 1.6 });
    s += txt(x + w / 2, base - h - 5, String(v), { size: 11, c: 'var(--accent-ink)' });
    s += txt(x + w / 2, base + 15, String(labels[i]), { size: 11, c: 'var(--muted)', bold: false });
  });
  return svg(W, H, s, 'diagramme en barres', 'fig-chap');
}

/** Diagramme circulaire (SVG maison). */
function figCirculaire(labels, valeurs) {
  const C = [95, 95], R = 72, total = valeurs.reduce((a, b) => a + b, 0) || 1;
  const COULEURS = ['var(--t-nombres)', 'var(--t-fonctions)', 'var(--t-geometrie)', 'var(--t-donnees)', 'var(--t-algo)'];
  let angle = -90, s = '';
  valeurs.forEach((v, i) => {
    const a = (v / total) * 360, fin = angle + a;
    const P = (d) => [C[0] + R * Math.cos((d * Math.PI) / 180), C[1] + R * Math.sin((d * Math.PI) / 180)];
    const [x1, y1] = P(angle), [x2, y2] = P(fin);
    s += `<path d="M ${C[0]} ${C[1]} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${a > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${COULEURS[i % 5]}" fill-opacity="0.55" stroke="var(--surface)" stroke-width="1.5"/>`;
    const [lx, ly] = P(angle + a / 2);
    s += txt(C[0] + (lx - C[0]) * 0.62, C[1] + (ly - C[1]) * 0.62 + 4, String(labels[i]), { size: 11, c: 'var(--text)' });
    angle = fin;
  });
  return svg(190, 190, s, 'diagramme circulaire', 'fig-chap');
}

function moyenneInteractive(host) {
  const wrap = document.createElement('div'); wrap.className = 'fig-interactive';
  wrap.innerHTML = `
    <div class="fig-controls">
      <label>note 1 <input type="range" min="0" max="20" value="8" data-a> <span class="fig-val" data-av></span></label>
      <label>note 2 <input type="range" min="0" max="20" value="12" data-b> <span class="fig-val" data-bv></span></label>
      <label>note 3 <input type="range" min="0" max="20" value="16" data-c> <span class="fig-val" data-cv></span></label>
    </div>
    <div data-svg></div><div class="fig-readout" data-out></div>`;
  function draw() {
    const n = ['a', 'b', 'c'].map((k) => +wrap.querySelector(`[data-${k}]`).value);
    ['a', 'b', 'c'].forEach((k, i) => { wrap.querySelector(`[data-${k}v]`).textContent = n[i]; });
    const s = n[0] + n[1] + n[2], m = arrondi(s / 3, 2);
    wrap.querySelector('[data-svg]').innerHTML = figBarres(['note 1', 'note 2', 'note 3'], n);
    wrap.querySelector('[data-out]').innerHTML = `Somme : ${n.join(' + ')} = <strong>${s}</strong> &nbsp;·&nbsp; Moyenne : ${s} ÷ 3 = <strong>${dec(m)}</strong><br>La moyenne est toujours comprise entre la plus petite et la plus grande valeur.`;
  }
  wrap.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw)); draw();
  host.appendChild(wrap);
}

const SERIES = [
  { titre: 'Sport préféré des élèves', labels: ['foot', 'danse', 'judo', 'tennis'] },
  { titre: 'Couleur préférée', labels: ['bleu', 'vert', 'rouge', 'jaune'] },
  { titre: 'Animal de compagnie', labels: ['chien', 'chat', 'poisson', 'aucun'] },
  { titre: 'Moyen de transport', labels: ['bus', 'vélo', 'à pied', 'voiture'] },
];

export default {
  id: 'v15',
  titre: 'Statistiques : effectifs, fréquences, moyenne',
  theme: 'donnees', niveau: '5e',
  icone: '📊',

  intro:
    "Sondages, résultats sportifs, notes de la classe, météo… Les statistiques servent à <strong>résumer</strong> " +
    "beaucoup de données par quelques nombres : effectifs, fréquences, moyenne. Savoir lire un diagramme et calculer " +
    "une moyenne est utile partout, et c'est la base des chapitres de 4ᵉ et de 3ᵉ (médiane, étendue, quartiles).",

  cours: [
    {
      type: 'definition', titre: 'Effectif et effectif total',
      contenu: "Dans une série statistique, l'<strong>effectif</strong> d'une valeur est le nombre de fois où elle apparaît. L'<strong>effectif total</strong> est le nombre total de données : c'est la somme de tous les effectifs.",
    },
    {
      type: 'definition', titre: 'Fréquence',
      contenu: "La <strong>fréquence</strong> d'une valeur est le quotient de son effectif par l'effectif total. On peut l'écrire en fraction, en nombre décimal, ou en pourcentage (en multipliant par $100$). La somme de toutes les fréquences vaut $1$ (soit $100\\,\\%$).",
      formule: 'f = \\dfrac{\\text{effectif}}{\\text{effectif total}} \\qquad f\\,\\% = \\dfrac{\\text{effectif}}{\\text{effectif total}} \\times 100',
    },
    {
      type: 'propriete', titre: 'Moyenne',
      contenu: "La <strong>moyenne</strong> d'une série est la somme de toutes les valeurs divisée par leur nombre. Quand les valeurs se répètent (ou sont affectées de coefficients), on calcule une <strong>moyenne pondérée</strong> : on multiplie chaque valeur par son effectif, on additionne, puis on divise par l'effectif total.",
      formule: '\\bar{x} = \\dfrac{\\text{somme des valeurs}}{\\text{effectif total}} \\qquad \\bar{x} = \\dfrac{n_1 x_1 + n_2 x_2 + \\dots}{n_1 + n_2 + \\dots}',
    },
    {
      type: 'propriete', titre: 'Diagrammes',
      contenu: "Un <strong>diagramme en barres</strong> représente les effectifs par des barres de hauteurs proportionnelles. Dans un <strong>diagramme circulaire</strong>, le disque entier ($360°$) représente l'effectif total : l'angle d'un secteur est proportionnel à l'effectif.",
      formule: '\\text{angle} = \\dfrac{\\text{effectif}}{\\text{effectif total}} \\times 360°',
    },
    { type: 'figure', titre: 'Trois notes, une moyenne', contenu: "Modifie les notes : la moyenne « équilibre » la série.", render: (host) => moyenneInteractive(host) },
    {
      type: 'exemple', enonce: "Dans une classe de $25$ élèves, $10$ font du foot. Calculer la fréquence (en %) puis l'angle du secteur correspondant dans un diagramme circulaire.",
      solution_etapes: [
        "Fréquence : $\\dfrac{10}{25} = 0{,}4$, soit $0{,}4 \\times 100 = 40\\,\\%$.",
        "Angle : $\\dfrac{10}{25} \\times 360 = 0{,}4 \\times 360 = 144°$.",
        "Le secteur « foot » mesure donc $144°$.",
      ],
    },
  ],

  methode: [
    { etape: 1, titre: 'Organiser les données', explication: "Range les valeurs et leurs effectifs dans un tableau : une ligne pour les valeurs, une pour les effectifs." },
    { etape: 2, titre: "Calculer l'effectif total", explication: "Additionne tous les effectifs : c'est le dénominateur de toutes les fréquences." },
    { etape: 3, titre: 'Fréquence ou angle', explication: "Fréquence : effectif ÷ effectif total (× 100 pour des %). Angle : fréquence × 360°." },
    { etape: 4, titre: 'Moyenne', explication: "Somme des (valeur × effectif) ÷ effectif total. Vérifie : la moyenne est entre la plus petite et la plus grande valeur." },
  ],

  exercices: [
    {
      id: 'e01', niveau: 1, type: 'saisie', consigne: "Calcule l'effectif total :",
      generer() {
        const s = pick(SERIES), eff = s.labels.map(() => randInt(2, 15));
        const total = eff.reduce((a, b) => a + b, 0);
        return {
          enonce: `${s.titre} :${tableau([['choix', ...s.labels], ['effectif', ...eff]])}Quel est l'effectif total ?`,
          reponse: total, validation: 'nombre', _v: { eff, total },
        };
      },
      indices: ["L'effectif total est le nombre de personnes interrogées.", 'Additionne tous les effectifs du tableau.', "N'oublie aucune colonne."],
      correction_etapes: (st) => [`On additionne tous les effectifs : $${st._v.eff.join(' + ')}$.`, `Effectif total $= ${st._v.total}$.`],
    },
    {
      id: 'e02', niveau: 1, type: 'saisie', consigne: 'Calcule la fréquence (en %) :',
      generer() {
        const total = pick([20, 25, 50, 200, 40, 10]), eff = randInt(1, total - 1);
        if (!Number.isInteger((eff * 1000) / total)) return this.generer();
        return { enonce: `Sur $${total}$ élèves interrogés, $${eff}$ préfèrent les mathématiques. Quelle est la fréquence en pourcentage ?`, reponse: arrondi((eff * 100) / total, 2), validation: 'nombre', _v: { eff, total } };
      },
      indices: ['Fréquence $= \\dfrac{\\text{effectif}}{\\text{effectif total}}$.', 'Multiplie ensuite par $100$ pour avoir des %.', 'Vérifie : le résultat doit être entre 0 et 100.'],
      correction_etapes: (st) => [
        `$\\dfrac{${st._v.eff}}{${st._v.total}} = ${tex(arrondi(st._v.eff / st._v.total, 4))}$.`,
        `En pourcentage : $${tex(arrondi(st._v.eff / st._v.total, 4))} \\times 100 = ${tex(arrondi((st._v.eff * 100) / st._v.total, 2))}\\,\\%$.`,
      ],
    },
    {
      id: 'e03', niveau: 1, type: 'saisie', consigne: 'Calcule la moyenne :',
      generer() {
        // On tire les premières notes, la dernière est ajustée pour que la moyenne tombe juste.
        const n = pick([4, 5]); let notes = [], somme = 0, m = 0;
        do {
          notes = []; somme = 0;
          for (let i = 0; i < n - 1; i++) { const v = randInt(2, 20); notes.push(v); somme += v; }
          m = randInt(5, 17); notes.push(m * n - somme);
        } while (notes[n - 1] < 1 || notes[n - 1] > 20);
        somme = m * n;
        return { enonce: `Voici les notes d'un élève : $${notes.join(' \\;;\\; ')}$. Calcule sa moyenne.`, reponse: arrondi(somme / n, 2), validation: 'nombre', tolerance: 0.005, _v: { notes, somme, n } };
      },
      indices: ['Additionne toutes les notes.', 'Divise par le nombre de notes.', 'La moyenne est comprise entre la plus petite et la plus grande note.'],
      correction_etapes: (st) => [
        `Somme : $${st._v.notes.join(' + ')} = ${st._v.somme}$.`,
        `Moyenne : $${st._v.somme} \\div ${st._v.n} = ${tex(arrondi(st._v.somme / st._v.n, 2))}$.`,
      ],
    },
    {
      id: 'e04', niveau: 2, type: 'saisie', consigne: 'Calcule la moyenne pondérée (au dixième) :',
      generer() {
        const valeurs = [randInt(0, 5), randInt(6, 12), randInt(13, 20)];
        const eff = [randInt(2, 8), randInt(2, 8), randInt(2, 8)];
        const total = eff.reduce((a, b) => a + b, 0);
        const somme = valeurs.reduce((a, v, i) => a + v * eff[i], 0);
        return {
          enonce: `Résultats d'un contrôle :${tableau([['note', ...valeurs], ['effectif', ...eff]])}Calcule la moyenne de la classe (arrondie au dixième).`,
          reponse: arrondi(somme / total, 1), validation: 'nombre', tolerance: 0.05, _v: { valeurs, eff, total, somme },
        };
      },
      indices: ['Chaque note doit être comptée autant de fois que son effectif.', 'Calcule chaque produit valeur × effectif, puis additionne.', "Divise par l'effectif total."],
      correction_etapes: (st) => [
        `Produits : $${st._v.valeurs.map((v, i) => `${v} \\times ${st._v.eff[i]}`).join(' \\;;\\; ')}$.`,
        `Somme : $${st._v.valeurs.map((v, i) => v * st._v.eff[i]).join(' + ')} = ${st._v.somme}$ ; effectif total : $${st._v.eff.join(' + ')} = ${st._v.total}$.`,
        `Moyenne : $${st._v.somme} \\div ${st._v.total} \\approx ${tex(arrondi(st._v.somme / st._v.total, 1))}$.`,
      ],
    },
    {
      id: 'e05', niveau: 2, type: 'saisie', consigne: "Diagramme circulaire — calcule l'angle (en degrés) :",
      generer() {
        const total = pick([20, 24, 30, 36, 40, 60, 72, 90, 120]), eff = randInt(1, total - 1);
        if (!Number.isInteger((eff * 360) / total)) return this.generer();
        const s = pick(SERIES);
        return {
          enonce: `Sur $${total}$ élèves, $${eff}$ ont choisi « ${s.labels[0]} ». Quel est l'angle du secteur correspondant dans un diagramme circulaire ?`,
          reponse: (eff * 360) / total, validation: 'nombre', _v: { eff, total },
          visuel: (h) => { h.innerHTML = figCirculaire([s.labels[0], 'autres'], [eff, total - eff]); },
        };
      },
      indices: ['Le disque entier représente $360°$ et l\'effectif total.', "L'angle est proportionnel à l'effectif.", 'Angle $= \\dfrac{\\text{effectif}}{\\text{total}} \\times 360$.'],
      correction_etapes: (st) => [
        `$\\dfrac{${st._v.eff}}{${st._v.total}} \\times 360 = ${tex(arrondi(st._v.eff / st._v.total, 4))} \\times 360$.`,
        `Angle $= ${(st._v.eff * 360) / st._v.total}°$.`,
      ],
    },
    {
      id: 'e06', niveau: 2, type: 'qcm', consigne: 'Lis le diagramme en barres :',
      generer() {
        const s = pick(SERIES), eff = s.labels.map(() => randInt(2, 18));
        const maxi = Math.max(...eff);
        if (eff.filter((e) => e === maxi).length > 1) return this.generer();
        const i = eff.indexOf(maxi);
        return {
          enonce: `${s.titre} — quel choix a le plus grand effectif ?`,
          choix: [...s.labels], correct: i, ordre_fixe: true, _v: { labels: s.labels, eff, i },
          visuel: (h) => { h.innerHTML = figBarres(s.labels, eff); },
        };
      },
      indices: ['La hauteur de chaque barre donne l\'effectif.', 'Cherche la barre la plus haute.', 'Lis le nom écrit sous cette barre.'],
      correction_etapes: (st) => [
        `Effectifs lus sur le diagramme : ${st._v.labels.map((l, i) => `${l} : $${st._v.eff[i]}$`).join(', ')}.`,
        `Le plus grand effectif est $${st._v.eff[st._v.i]}$ : c'est « ${st._v.labels[st._v.i]} ».`,
      ],
    },
    {
      id: 'e07', niveau: 3, type: 'saisie', consigne: 'Problème — quelle note manque-t-il ?',
      generer() {
        const notes = [randInt(4, 16), randInt(4, 16), randInt(4, 16)];
        const cible = randInt(8, 15), somme = notes.reduce((a, b) => a + b, 0);
        const manquante = cible * 4 - somme;
        if (manquante < 0 || manquante > 20) return this.generer();
        return { enonce: `Un élève a obtenu $${notes.join('$, $')}$. Quelle note doit-il avoir au 4ᵉ contrôle pour que sa moyenne des 4 notes soit exactement $${cible}$ ?`, reponse: manquante, validation: 'nombre', _v: { notes, cible, somme, manquante } };
      },
      indices: ['Pour une moyenne de $m$ sur 4 notes, la somme doit valoir $4 \\times m$.', 'Calcule la somme des notes déjà obtenues.', 'La note manquante est la différence.'],
      correction_etapes: (st) => [
        `Pour une moyenne de $${st._v.cible}$ sur $4$ notes, la somme doit être $4 \\times ${st._v.cible} = ${4 * st._v.cible}$.`,
        `Somme actuelle : $${st._v.notes.join(' + ')} = ${st._v.somme}$.`,
        `Note manquante : $${4 * st._v.cible} - ${st._v.somme} = ${st._v.manquante}$.`,
      ],
    },
    {
      id: 'e08', niveau: 3, type: 'vrai_faux', consigne: 'Vrai ou faux ?',
      generer() {
        const [e, r, why] = pick([
          ['La moyenne d\'une série est toujours l\'une des valeurs de la série.', false, 'Faux : la moyenne de $8$ et $9$ vaut $8{,}5$, qui n\'est pas dans la série.'],
          ['La somme de toutes les fréquences d\'une série vaut $1$ (soit $100\\,\\%$).', true, 'Vrai : chaque donnée est comptée une fois.'],
          ['La moyenne est toujours comprise entre la plus petite et la plus grande valeur.', true, 'Vrai : c\'est une « valeur d\'équilibre » de la série.'],
          ['Si tous les effectifs doublent, la moyenne double aussi.', false, 'Faux : la moyenne ne change pas (numérateur et dénominateur sont doublés).'],
          ['Dans un diagramme circulaire, un effectif deux fois plus grand donne un angle deux fois plus grand.', true, 'Vrai : les angles sont proportionnels aux effectifs.'],
          ['Une fréquence peut être supérieure à $1$.', false, 'Faux : un effectif ne peut pas dépasser l\'effectif total.'],
        ]);
        return { enonce: e, reponse: r, _v: { why } };
      },
      indices: ['Teste sur un petit exemple chiffré.', 'Rappelle-toi la définition de la fréquence.', 'La moyenne « équilibre » la série.'],
      correction_etapes: (st) => [st._v.why],
    },
    {
      id: 'e09', niveau: 1, type: 'complete', consigne: 'Complète le calcul de la moyenne :',
      generer() {
        const n = 4, notes = Array.from({ length: n }, () => randInt(2, 20));
        const somme = notes.reduce((a, b) => a + b, 0);
        return {
          enonce_complete: `Notes : $${notes.join(' \\;;\\; ')}$. Somme $=$ {0} $\\;$ puis moyenne $=$ {1}`,
          champs: [{ reponse: somme, validation: 'nombre' }, { reponse: arrondi(somme / n, 2), validation: 'nombre', tolerance: 0.005 }], _v: { notes, somme, n },
        };
      },
      indices: ['Additionne toutes les notes.', 'Divise la somme par le nombre de notes (4).', 'Tu peux donner un résultat décimal.'],
      correction_etapes: (st) => [`Somme : $${st._v.notes.join(' + ')} = ${st._v.somme}$.`, `Moyenne : $${st._v.somme} \\div ${st._v.n} = ${tex(arrondi(st._v.somme / st._v.n, 2))}$.`],
    },
    {
      id: 'e10', niveau: 2, type: 'ordonner_etapes', consigne: "Remets dans l'ordre le calcul d'une moyenne pondérée :",
      generer() {
        const v = [randInt(2, 8), randInt(9, 15)], e = [randInt(2, 6), randInt(2, 6)];
        const total = e[0] + e[1], somme = v[0] * e[0] + v[1] * e[1];
        return {
          etapes: [
            `Multiplier chaque valeur par son effectif : $${v[0]} \\times ${e[0]} = ${v[0] * e[0]}$ et $${v[1]} \\times ${e[1]} = ${v[1] * e[1]}$`,
            `Additionner ces produits : $${v[0] * e[0]} + ${v[1] * e[1]} = ${somme}$`,
            `Calculer l'effectif total : $${e[0]} + ${e[1]} = ${total}$`,
            `Diviser : $${somme} \\div ${total} \\approx ${tex(arrondi(somme / total, 2))}$`,
          ],
        };
      },
      indices: ['On commence par les produits valeur × effectif.', 'On additionne ensuite ces produits.', "On divise en dernier par l'effectif total."],
      correction_detaillee: (st) => `<ol>${st.etapes.map((e) => `<li>${e}</li>`).join('')}</ol>`,
    },
  ],

  quiz_bilan: [
    {
      type: 'saisie', question: 'Moyenne simple.',
      generer() { const a = randInt(2, 20), b = randInt(2, 20), c = randInt(2, 20); const somme = a + b + c; return { question: `Calcule la moyenne de $${a}$, $${b}$ et $${c}$ (arrondie au dixième).`, reponse: arrondi(somme / 3, 1), validation: 'nombre', tolerance: 0.05, explication: `$(${a} + ${b} + ${c}) \\div 3 = ${somme} \\div 3 \\approx ${tex(arrondi(somme / 3, 1))}$.` }; },
    },
    { type: 'qcm', question: 'La fréquence d\'une valeur se calcule par :', choix: ['effectif ÷ effectif total', 'effectif total ÷ effectif', 'effectif × 360', 'somme des valeurs ÷ effectif'], correct: 0, explication: 'Fréquence $= \\dfrac{\\text{effectif}}{\\text{effectif total}}$.' },
    { type: 'saisie', question: 'Sur $50$ élèves, $20$ prennent le bus. Quelle est la fréquence en % ?', reponse: 40, validation: 'nombre', explication: '$\\dfrac{20}{50} \\times 100 = 40\\,\\%$.' },
    {
      type: 'saisie', question: 'Angle du diagramme circulaire.',
      generer() { const total = pick([20, 30, 36, 40, 60]), eff = total / pick([2, 3, 4]); return { question: `Sur $${total}$ personnes, $${eff}$ ont répondu « oui ». Quel est l'angle du secteur (en degrés) ?`, reponse: (eff * 360) / total, validation: 'nombre', explication: `$\\dfrac{${eff}}{${total}} \\times 360 = ${(eff * 360) / total}°$.` }; },
    },
    { type: 'vrai_faux', question: 'La moyenne peut être plus grande que toutes les valeurs de la série.', reponse: false, explication: 'Non : elle est toujours comprise entre la plus petite et la plus grande valeur.' },
  ],
};
