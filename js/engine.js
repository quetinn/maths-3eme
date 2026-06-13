// =====================================================================
//  engine.js — Moteur d'exercices
//  - Génération paramétrique aléatoire (helpers de tirage)
//  - Validation tolérante multi-format : 0.5 = 1/2 = 0,5
//    et équivalence d'expressions algébriques par échantillonnage
//  - Indices progressifs (révélés à la demande)
//  - Correction détaillée révélable
//  - Score + compteur de tentatives par exercice
//  - Montage d'un exercice et d'un quiz bilan dans le DOM
// =====================================================================

import { renderMath, katexInline } from './render.js';

// ---------------------------------------------------------------------
//  1. Helpers de génération paramétrique
// ---------------------------------------------------------------------

/** Entier aléatoire dans [min, max] (bornes incluses). */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Entier non nul dans [min, max]. */
export function randIntNonZero(min, max) {
  let n = 0;
  do { n = randInt(min, max); } while (n === 0);
  return n;
}

/** Élément aléatoire d'un tableau. */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** +1 ou -1 au hasard. */
export function randSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

/** PGCD (utile pour fractions irréductibles, arithmétique...). */
export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

// ---------------------------------------------------------------------
//  2. Formatage LaTeX utilitaire (pour rédiger des énoncés concis)
// ---------------------------------------------------------------------

/** Signe explicite : 3 -> "+ 3", -3 -> "- 3" (avec espaces). */
export function signed(n) {
  return n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
}

/** Coefficient devant une variable : 1 -> "", -1 -> "-", 3 -> "3". */
export function coef(n, varName = 'x') {
  if (n === 1) return varName;
  if (n === -1) return `-${varName}`;
  return `${n}${varName}`;
}

/** Terme signé pour un coefficient devant une variable : "+ 3x", "- x". */
export function signedCoef(n, varName = 'x') {
  if (n === 0) return '';
  const abs = Math.abs(n);
  const c = abs === 1 ? varName : `${abs}${varName}`;
  return n < 0 ? `- ${c}` : `+ ${c}`;
}

// ---------------------------------------------------------------------
//  3. Validation des réponses
// ---------------------------------------------------------------------

const ALLOWED_EXPR = /^[0-9xX+\-*/.()^,²³·×√\s]*$/;

/** Normalise une saisie : virgules, signes unicode, puissances, casse. */
export function normalize(s) {
  return String(s)
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/−/g, '-')   // U+2212 moins mathématique
    .replace(/·/g, '*')
    .replace(/×/g, '*')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .toLowerCase();
}

/** Évalue un nombre saisi : décimal, fraction "a/b", ou expression simple. */
export function parseNumber(s) {
  const n = normalize(s);
  if (n === '' ) return NaN;
  // Fraction simple a/b
  const frac = n.match(/^(-?\d+\.?\d*)\/(-?\d+\.?\d*)$/);
  if (frac) {
    const num = parseFloat(frac[1]);
    const den = parseFloat(frac[2]);
    if (den === 0) return NaN;
    return num / den;
  }
  if (/^-?\d*\.?\d+$/.test(n)) return parseFloat(n);
  // dernier recours : évaluation arithmétique sécurisée
  return evalExprAt(n, 0);
}

/** Transforme une expression normalisée en code JS évaluable. */
function toJs(expr) {
  let s = normalize(expr);
  s = s.replace(/√(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)'); // √9
  s = s.replace(/√\(/g, 'Math.sqrt(');                 // √(...)
  s = s.replace(/(\d)([x(])/g, '$1*$2');               // 2x -> 2*x, 3( -> 3*(
  s = s.replace(/([x)])(\()/g, '$1*$2');               // x( -> x*(, )( -> )*(
  s = s.replace(/(\))([x\d])/g, '$1*$2');              // )x, )3
  s = s.replace(/\^/g, '**');                          // puissance
  return s;
}

/** Évalue une expression en x = val. NaN si invalide. */
export function evalExprAt(expr, val) {
  if (!ALLOWED_EXPR.test(expr)) return NaN;
  try {
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `"use strict"; return (${toJs(expr)});`);
    const y = f(val);
    return typeof y === 'number' ? y : NaN;
  } catch (e) {
    return NaN;
  }
}

const APPROX = 1e-6;
function nearly(a, b, tol = APPROX) {
  return Math.abs(a - b) <= tol * (1 + Math.abs(b));
}

/** Teste la primalité d'un entier (utile en arithmétique). */
export function isPrime(n) {
  n = Math.abs(Math.round(n));
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

/** Découpe une saisie en liste de nombres (séparateurs ; espace « ou »). */
export function parseNumberList(s) {
  return String(s)
    .replace(/[a-zA-Z]\s*=/g, ' ') // x= , S= …
    .replace(/\bou\b/gi, ' ')
    .replace(/;/g, ' ')
    .replace(/[{}]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseNumber)
    .filter(Number.isFinite);
}

/** Compare deux ensembles de nombres sans tenir compte de l'ordre. */
function sameNumberSet(a, b, tol = APPROX) {
  if (a.length !== b.length) return false;
  const aa = [...a].sort((x, y) => x - y);
  const bb = [...b].sort((x, y) => x - y);
  return aa.every((v, i) => nearly(v, bb[i], tol));
}

/**
 * Compare deux expressions algébriques (en x) par échantillonnage.
 * Reconnaît les formes développées ET factorisées équivalentes.
 */
export function exprEqual(userStr, refStr) {
  if (!ALLOWED_EXPR.test(String(userStr))) return false;
  const samples = [-3, -2, -1.5, -0.5, 0, 0.5, 1, 1.5, 2, 3, 4];
  let valid = 0;
  for (const x of samples) {
    const u = evalExprAt(userStr, x);
    const r = evalExprAt(refStr, x);
    if (!Number.isFinite(r)) continue;       // point hors domaine de la réf.
    if (!Number.isFinite(u)) return false;   // l'utilisateur diverge où la réf existe
    if (!nearly(u, r)) return false;
    valid++;
  }
  return valid >= 4;
}

/**
 * Vérifie qu'une saisie est bien une forme factorisée (un produit),
 * et non la forme développée. On retire les groupes entre parenthèses ;
 * s'il reste une addition au niveau supérieur, ce n'est pas factorisé.
 */
export function isProductForm(s) {
  const norm = normalize(s);
  if (!norm.includes('(')) return false;
  let t = norm, prev;
  do { prev = t; t = t.replace(/\([^()]*\)/g, '1'); } while (t !== prev);
  t = t.replace(/^-/, ''); // un signe moins en tête est toléré
  return !/[+\-]/.test(t);
}

/**
 * Vérifie une réponse selon la stratégie demandée.
 * @param {string} userInput  saisie brute
 * @param {Object} data       { reponse, validation, accepte, tolerance }
 *    validation :
 *      'expression' (def.) | 'nombre' | 'texte' | 'factorisation'
 *      'solutions' (ensemble de nombres) | 'fraction_irreductible'
 *      'notation_scientifique' | 'facteurs_premiers'
 *    accepte    : formes alternatives acceptées (tableau)
 *    tolerance  : tolérance numérique (mode 'nombre', def. 1e-6)
 * @returns {boolean}
 */
export function checkAnswer(userInput, data) {
  const raw = String(userInput ?? '').trim();
  if (raw === '') return false;
  const mode = data.validation || 'expression';
  const refNum = () => (typeof data.reponse === 'number' ? data.reponse : parseNumber(data.reponse));

  if (mode === 'factorisation') {
    if (!isProductForm(raw)) return false;
    return exprEqual(raw, data.reponse) || (data.accepte || []).some((a) => exprEqual(raw, a));
  }

  if (mode === 'nombre') {
    const tol = data.tolerance || APPROX;
    // tolère « x = 3 », « S = 5 » … en retirant l'affectation de variable
    const cleaned = raw.replace(/^[a-zA-Z]\s*=\s*/, '');
    const u = parseNumber(cleaned);
    const r = refNum();
    if (Number.isFinite(u) && Number.isFinite(r) && nearly(u, r, tol)) return true;
    return (data.accepte || []).some((a) => nearly(parseNumber(a), r, tol));
  }

  if (mode === 'solutions') {
    const ref = Array.isArray(data.reponse) ? data.reponse.map(Number) : parseNumberList(data.reponse);
    return sameNumberSet(parseNumberList(raw), ref, data.tolerance || APPROX);
  }

  if (mode === 'fraction_irreductible') {
    const r = refNum();
    const m = normalize(raw).match(/^(-?\d+)\/(-?\d+)$/);
    if (m) {
      const a = +m[1], b = +m[2];
      if (b === 0 || gcd(a, b) !== 1) return false;       // doit être irréductible
      return nearly(a / b, r);
    }
    // si la référence est entière, on accepte l'entier
    if (Number.isInteger(r)) return nearly(parseNumber(raw), r);
    return false;
  }

  if (mode === 'notation_scientifique') {
    const r = refNum();
    const m = normalize(raw).match(/^(-?\d+(?:\.\d+)?)\*?10\^(-?\d+)$/);
    if (!m) return false;
    const mant = +m[1], exp = +m[2];
    if (Math.abs(mant) < 1 || Math.abs(mant) >= 10) return false; // 1 ≤ |a| < 10
    return nearly(mant * Math.pow(10, exp), r);
  }

  if (mode === 'facteurs_premiers') {
    const N = refNum();
    if (!nearly(evalExprAt(raw, 0), N)) return false;       // le produit doit valoir N
    const parts = normalize(raw).split('*');
    return parts.every((p) => {
      const mm = p.match(/^(\d+)(?:\^(\d+))?$/);
      return mm && isPrime(+mm[1]);                          // chaque base est première
    });
  }

  if (mode === 'texte') {
    const u = normalize(raw);
    if (u === normalize(data.reponse)) return true;
    return (data.accepte || []).some((a) => normalize(a) === u);
  }

  // mode 'expression' (défaut) — équivalence algébrique tolérante
  if (exprEqual(raw, data.reponse)) return true;
  return (data.accepte || []).some((a) => exprEqual(raw, a));
}

// ---------------------------------------------------------------------
//  4. Messages d'encouragement (ton positif, jamais punitif)
// ---------------------------------------------------------------------

const ENCOURAGE_OK = [
  'Bravo ! 🎉', 'Parfait ! ✨', 'Excellent ! 👏', 'Tout juste ! 🌟', 'Super travail ! 💪',
];
const ENCOURAGE_RETRY = [
  'Pas tout à fait — réessaie, tu y es presque !',
  'Ce n\'est pas ça, mais ne lâche rien 💪',
  'Erreur fréquente — relis l\'énoncé et retente.',
  'Presque ! Un indice peut t\'aider.',
];

// ---------------------------------------------------------------------
//  5. Montage d'un exercice interactif
// ---------------------------------------------------------------------

let _exId = 0;

/**
 * Monte un exercice dans le conteneur.
 * @param {HTMLElement} container
 * @param {Object} exercice  { id, niveau, type, consigne, generer(), indices[], correction_detaillee }
 * @param {Object} hooks     { onCorrect(xp), onAttempt() }
 */
// Insère du texte à la position du curseur d'un champ.
function insertAtCursor(inp, text) {
  const s = inp.selectionStart ?? inp.value.length;
  const e = inp.selectionEnd ?? inp.value.length;
  if (text === '⌫') {
    if (s === e && s > 0) { inp.value = inp.value.slice(0, s - 1) + inp.value.slice(e); inp.setSelectionRange(s - 1, s - 1); }
    else { inp.value = inp.value.slice(0, s) + inp.value.slice(e); inp.setSelectionRange(s, s); }
  } else {
    inp.value = inp.value.slice(0, s) + text + inp.value.slice(e);
    const p = s + text.length; inp.setSelectionRange(p, p);
  }
  inp.focus();
}

const KEYPAD = ['x', '²', '³', '√', '(', ')', '/', '×', '−', ';', '⌫'];
const keypadHtml = () => `<div class="keypad" data-keypad>` +
  KEYPAD.map((k) => `<button type="button" class="key" data-key="${k}">${k}</button>`).join('') + `</div>`;

// Lecture à voix haute (synthèse vocale du navigateur).
function speakEl(wrap) {
  if (!window.speechSynthesis) return;
  const parts = [];
  const c = wrap.querySelector('.ex-consigne'); if (c) parts.push(c.textContent);
  const e = wrap.querySelector('.ex-enonce'); if (e) parts.push(e.textContent);
  const txt = parts.join('. ').replace(/\s+/g, ' ').trim();
  if (!txt) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'fr-FR'; u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export function mountExercise(container, exercice, hooks = {}) {
  const uid = `ex-${++_exId}`;
  const niveauXP = { 1: 5, 2: 10, 3: 20 }[exercice.niveau] || 5;
  let state = null;
  let hintsShown = 0, attempts = 0, solved = false, correctionStep = 0;
  let order = null;          // ordre courant (type ordonner_etapes)
  let lastInput = null;      // dernier champ focalisé (pour le clavier)

  const wrap = document.createElement('div');
  wrap.className = 'exercice';
  wrap.dataset.niveau = exercice.niveau;
  container.appendChild(wrap);

  const type = exercice.type;

  function inputZone() {
    if (type === 'vrai_faux') {
      return `<div class="vf-group" role="group" aria-label="Vrai ou faux">
          <button class="btn btn-choice" data-vf="vrai">Vrai</button>
          <button class="btn btn-choice" data-vf="faux">Faux</button></div>`;
    }
    if (type === 'qcm' || state.choix) {
      return `<div class="qcm-group" role="radiogroup">` +
        state.choix.map((c, i) => `<button class="btn btn-choice" data-choice="${i}">${katexInline(c)}</button>`).join('') + `</div>`;
    }
    if (type === 'ordonner_etapes') {
      return `<ul class="ordonner" data-ordonner></ul>
        <div class="answer-row"><button class="btn btn-primary" data-act="check">Vérifier l'ordre</button></div>`;
    }
    if (type === 'complete') {
      const parts = String(state.enonce_complete || state.enonce).split(/\{(\d+)\}/);
      let html = '<div class="complete-zone">';
      parts.forEach((p, i) => {
        if (i % 2 === 1) html += `<input type="text" class="complete-input" data-idx="${p}" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Champ ${+p + 1}">`;
        else html += `<span class="complete-txt">${p}</span>`;
      });
      html += '</div>' + keypadHtml() + `<div class="answer-row"><button class="btn btn-primary" data-act="check">Vérifier</button></div>`;
      return html;
    }
    // saisie (défaut)
    return `<div class="answer-row">
        <input type="text" class="answer-input" id="${uid}-in" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse…" aria-label="Réponse">
        <button class="btn btn-primary" data-act="check">Vérifier</button></div>` + keypadHtml();
  }

  function render() {
    state = exercice.generer();
    hintsShown = 0; attempts = 0; solved = false; correctionStep = 0; lastInput = null;
    order = null;

    const consigne = state.consigne || exercice.consigne || '';
    const enonceHtml = type === 'complete' ? '' : `<div class="ex-enonce">${state.enonce}</div>`;
    const speakBtn = window.speechSynthesis ? '<button class="btn btn-ghost" data-act="speak" title="Lire à voix haute">🔊</button>' : '';

    wrap.innerHTML = `
      <div class="ex-head">
        <span class="ex-level lvl-${exercice.niveau}">Niveau ${exercice.niveau}</span>
        <span class="ex-attempts" data-attempts></span>
      </div>
      ${consigne ? `<p class="ex-consigne">${consigne}</p>` : ''}
      ${enonceHtml}
      <div class="ex-visuel" data-visuel></div>
      ${inputZone()}
      <div class="ex-feedback" data-feedback aria-live="polite"></div>
      <div class="ex-tools">
        <button class="btn btn-ghost" data-act="hint">💡 Indice</button>
        <button class="btn btn-ghost" data-act="solution">📖 Correction</button>
        ${speakBtn}
        <button class="btn btn-ghost" data-act="new">🔄 Nouvel exercice</button>
      </div>
      <div class="ex-hints" data-hints></div>
      <div class="ex-solution" data-solution hidden></div>`;

    renderMath(wrap);
    const visuelEl = wrap.querySelector('[data-visuel]');
    if (typeof state.visuel === 'function') { try { state.visuel(visuelEl); } catch (e) { console.error('[engine] visuel exercice :', e); } }
    else visuelEl.remove();

    if (type === 'ordonner_etapes') initOrdonner();
    bind();
  }

  // — Type "ordonner les étapes" —
  function initOrdonner() {
    const n = state.etapes.length;
    order = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    if (order.every((v, i) => v === i)) order.reverse(); // éviter de tomber déjà rangé
    drawOrdonner();
  }
  function drawOrdonner() {
    const ul = wrap.querySelector('[data-ordonner]');
    ul.innerHTML = order.map((orig, i) => `
      <li class="ord-item">
        <span class="ord-text">${state.etapes[orig]}</span>
        <span class="ord-btns">
          <button class="ord-move" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Monter">▲</button>
          <button class="ord-move" data-down="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Descendre">▼</button>
        </span></li>`).join('');
    renderMath(ul);
    ul.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.up; [order[i - 1], order[i]] = [order[i], order[i - 1]]; drawOrdonner(); }));
    ul.querySelectorAll('[data-down]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.down; [order[i + 1], order[i]] = [order[i], order[i + 1]]; drawOrdonner(); }));
  }

  function bind() {
    const fb = wrap.querySelector('[data-feedback]');

    const onResult = (ok) => {
      attempts++;
      if (typeof hooks.onAttempt === 'function') hooks.onAttempt(exercice.id, ok);
      wrap.querySelector('[data-attempts]').textContent = attempts > 0 ? `Tentatives : ${attempts}` : '';
      if (ok && !solved) {
        solved = true;
        fb.className = 'ex-feedback is-ok';
        const malus = Math.min(niveauXP - 2, (hintsShown * 2) + Math.max(0, attempts - 1) * 2);
        const xp = Math.max(2, niveauXP - malus);
        fb.innerHTML = `<span class="fb-icon">✓</span> ${pick(ENCOURAGE_OK)} <em>+${xp} XP</em>`;
        wrap.classList.add('solved');
        if (typeof hooks.onCorrect === 'function') hooks.onCorrect(xp, exercice.id);
      } else if (ok && solved) {
        fb.className = 'ex-feedback is-ok'; fb.innerHTML = `<span class="fb-icon">✓</span> Toujours juste !`;
      } else {
        fb.className = 'ex-feedback is-err'; fb.innerHTML = `<span class="fb-icon">✗</span> ${pick(ENCOURAGE_RETRY)}`;
      }
    };

    // Suivi du dernier champ focalisé + clavier mathématique
    wrap.querySelectorAll('.answer-input, .complete-input').forEach((inp) => {
      inp.addEventListener('focus', () => { lastInput = inp; });
    });
    const keypad = wrap.querySelector('[data-keypad]');
    if (keypad) {
      lastInput = wrap.querySelector('.answer-input, .complete-input');
      keypad.querySelectorAll('[data-key]').forEach((k) => {
        k.addEventListener('click', () => { const t = lastInput || wrap.querySelector('.answer-input, .complete-input'); if (t) insertAtCursor(t, k.dataset.key); });
      });
    }

    const checkBtn = wrap.querySelector('[data-act="check"]');

    if (type === 'ordonner_etapes') {
      checkBtn.addEventListener('click', () => onResult(order.every((v, i) => v === i)));
    } else if (type === 'complete') {
      const inputs = [...wrap.querySelectorAll('.complete-input')];
      const check = () => onResult(state.champs.every((c, i) => checkAnswer(inputs[i] ? inputs[i].value : '', c)));
      checkBtn.addEventListener('click', check);
      inputs.forEach((inp) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); }));
    } else {
      const input = wrap.querySelector('.answer-input');
      if (input && checkBtn) {
        const check = () => onResult(checkAnswer(input.value, state));
        checkBtn.addEventListener('click', check);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
      }
    }

    wrap.querySelectorAll('[data-choice]').forEach((btn) => btn.addEventListener('click', () => {
      wrap.querySelectorAll('[data-choice]').forEach((b) => b.classList.remove('picked'));
      btn.classList.add('picked'); onResult(parseInt(btn.dataset.choice, 10) === state.correct);
    }));
    wrap.querySelectorAll('[data-vf]').forEach((btn) => btn.addEventListener('click', () => {
      wrap.querySelectorAll('[data-vf]').forEach((b) => b.classList.remove('picked'));
      btn.classList.add('picked'); onResult((btn.dataset.vf === 'vrai') === !!state.reponse);
    }));

    // Indices
    wrap.querySelector('[data-act="hint"]').addEventListener('click', () => {
      const hints = exercice.indices || [];
      const box = wrap.querySelector('[data-hints]');
      if (hintsShown >= hints.length) { box.innerHTML = `<p class="hint">Plus d'indice — tente la correction 📖</p>`; return; }
      const p = document.createElement('p'); p.className = 'hint';
      p.innerHTML = `<strong>Indice ${hintsShown + 1} :</strong> ${hints[hintsShown]}`;
      box.appendChild(p); renderMath(p); hintsShown++;
    });

    // Lecture à voix haute
    const speak = wrap.querySelector('[data-act="speak"]');
    if (speak) speak.addEventListener('click', () => speakEl(wrap));

    // Correction (pas-à-pas si correction_etapes, sinon détaillée)
    wrap.querySelector('[data-act="solution"]').addEventListener('click', () => revealCorrection());

    wrap.querySelector('[data-act="new"]').addEventListener('click', render);
  }

  function revealCorrection() {
    const sol = wrap.querySelector('[data-solution]');
    sol.hidden = false;
    const etapes = typeof exercice.correction_etapes === 'function' ? exercice.correction_etapes(state) : exercice.correction_etapes;
    if (Array.isArray(etapes) && etapes.length) {
      if (correctionStep === 0) sol.innerHTML = `<h4>Correction pas-à-pas</h4><ol class="corr-steps"></ol><button class="btn btn-ghost" data-act="next-step">Étape suivante →</button>`;
      const ol = sol.querySelector('.corr-steps');
      if (correctionStep < etapes.length) {
        const li = document.createElement('li'); li.innerHTML = etapes[correctionStep]; ol.appendChild(li); renderMath(li); correctionStep++;
      }
      const nb = sol.querySelector('[data-act="next-step"]');
      if (correctionStep >= etapes.length) { nb.remove(); appendReponse(sol); }
      else { nb.onclick = () => revealCorrection(); }
      return;
    }
    // correction détaillée classique
    let html = exercice.correction_detaillee;
    if (typeof html === 'function') html = html(state);
    sol.innerHTML = `<h4>Correction détaillée</h4>${html || ''}`;
    appendReponse(sol);
    renderMath(sol);
  }
  function appendReponse(sol) {
    if (type === 'qcm' || type === 'vrai_faux' || type === 'ordonner_etapes') return;
    let rep = '';
    if (type === 'complete') rep = state.champs.map((c) => c.reponseTex || c.reponse).join(' ; ');
    else rep = state.reponseTex ? katexInline(state.reponseTex) : (typeof state.reponse === 'string' ? katexInline(state.reponse) : state.reponse);
    if (rep !== '' && rep !== undefined) { const p = document.createElement('p'); p.className = 'sol-answer'; p.innerHTML = `Réponse : <strong>${rep}</strong>`; sol.appendChild(p); renderMath(p); }
  }

  render();
  return { regenerate: render };
}

// ---------------------------------------------------------------------
//  6. Montage du quiz bilan
//  Valide le chapitre (>= 80 %) → débloque le badge.
// ---------------------------------------------------------------------

/**
 * @param {HTMLElement} container
 * @param {Array} questions  [{ type:'qcm'|'saisie'|'vrai_faux', question, choix?, correct?, reponse?, validation?, explication? }]
 * @param {Object} hooks     { onPass(xp), onComplete(score,total) }
 */
export function mountQuiz(container, questions, hooks = {}, opts = {}) {
  let idx = 0;
  let score = 0;
  const total = questions.length;
  const answered = new Array(total).fill(false);
  const mode = opts.mode || 'chapitre'; // 'chapitre' | 'examen'

  const wrap = document.createElement('div');
  wrap.className = 'quiz';
  container.appendChild(wrap);

  function renderQuestion() {
    // Question génératale : si elle fournit generer(), on tire des valeurs.
    const base = questions[idx];
    const q = typeof base.generer === 'function' ? Object.assign({}, base, base.generer()) : base;
    const isVF = q.type === 'vrai_faux';
    const isQcm = q.type === 'qcm';

    let body;
    if (isVF) {
      body = `<div class="vf-group">
        <button class="btn btn-choice" data-vf="vrai">Vrai</button>
        <button class="btn btn-choice" data-vf="faux">Faux</button></div>`;
    } else if (isQcm) {
      body = `<div class="qcm-group">` +
        q.choix.map((c, i) => `<button class="btn btn-choice" data-choice="${i}">${katexInline(c)}</button>`).join('') +
        `</div>`;
    } else {
      body = `<div class="answer-row">
        <input type="text" class="answer-input" placeholder="Ta réponse…" autocomplete="off" spellcheck="false">
        <button class="btn btn-primary" data-act="valid">OK</button></div>`;
    }

    wrap.innerHTML = `
      <div class="quiz-progress">Question ${idx + 1} / ${total}</div>
      <div class="quiz-bar"><span style="width:${(idx / total) * 100}%"></span></div>
      <p class="quiz-question">${q.question}</p>
      <div class="ex-visuel" data-visuel></div>
      ${body}
      <div class="ex-feedback" data-feedback aria-live="polite"></div>
    `;
    renderMath(wrap);
    const visuelEl = wrap.querySelector('[data-visuel]');
    if (typeof q.visuel === 'function') {
      try { q.visuel(visuelEl); } catch (e) { console.error('[engine] visuel quiz :', e); }
    } else { visuelEl.remove(); }

    const fb = wrap.querySelector('[data-feedback]');

    const resolve = (ok) => {
      if (answered[idx]) return;
      answered[idx] = true;
      if (ok) score++;
      fb.className = ok ? 'ex-feedback is-ok' : 'ex-feedback is-err';
      fb.innerHTML = (ok ? '<span class="fb-icon">✓</span> Correct ! ' : '<span class="fb-icon">✗</span> ')
        + (q.explication ? q.explication : (ok ? '' : 'Réponse incorrecte.'));
      renderMath(fb);
      const next = document.createElement('button');
      next.className = 'btn btn-primary quiz-next';
      next.textContent = idx + 1 < total ? 'Question suivante →' : 'Voir mon résultat';
      next.addEventListener('click', () => { idx++; idx < total ? renderQuestion() : renderResult(); });
      fb.appendChild(next);
      wrap.querySelectorAll('button[data-choice],button[data-vf],[data-act="valid"]')
        .forEach((b) => { b.disabled = true; });
    };

    wrap.querySelectorAll('[data-choice]').forEach((b) =>
      b.addEventListener('click', () => {
        b.classList.add('picked');
        resolve(parseInt(b.dataset.choice, 10) === q.correct);
      }));
    wrap.querySelectorAll('[data-vf]').forEach((b) =>
      b.addEventListener('click', () => {
        b.classList.add('picked');
        resolve((b.dataset.vf === 'vrai') === !!q.reponse);
      }));
    const input = wrap.querySelector('.answer-input');
    if (input) {
      const v = () => resolve(checkAnswer(input.value, q));
      wrap.querySelector('[data-act="valid"]').addEventListener('click', v);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') v(); });
    }
  }

  function renderResult() {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 80;
    const xp = score * 10 + (passed ? 50 : 0);
    let msg;
    if (mode === 'examen') {
      msg = pct >= 80 ? '🎉 Excellent ! Tu es prêt·e.' : pct >= 50 ? '👍 Pas mal — continue à t\'entraîner.' : '💪 Courage, retravaille les chapitres concernés.';
    } else {
      msg = passed ? '🏅 Chapitre validé ! Badge débloqué.' : 'Presque ! Atteins 80 % pour décrocher le badge. Réessaie quand tu veux.';
    }
    wrap.innerHTML = `
      <div class="quiz-result ${passed ? 'pass' : 'fail'}">
        <div class="quiz-score">${score} / ${total}</div>
        <p>${msg}</p>
        <p class="quiz-xp">+${xp} XP</p>
        <button class="btn btn-ghost" data-act="retry">🔄 ${mode === 'examen' ? 'Refaire un examen' : 'Refaire le quiz'}</button>
      </div>`;
    wrap.querySelector('[data-act="retry"]').addEventListener('click', () => {
      idx = 0; score = 0; answered.fill(false); renderQuestion();
    });
    if (typeof hooks.onComplete === 'function') hooks.onComplete(score, total);
    if (passed && typeof hooks.onPass === 'function') hooks.onPass(xp);
  }

  renderQuestion();
}
