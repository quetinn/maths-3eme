// =====================================================================
//  test_chapitres.mjs — Vérifie tous les chapitres rédigés (sans navigateur)
//
//    node tools/test_chapitres.mjs            → tous les chapitres
//    node tools/test_chapitres.mjs v01 r13    → seulement ceux-là
//
//  Pour chaque exercice / question de quiz, sur de nombreux tirages :
//   - le générateur ne plante pas, aucun « undefined » / « NaN » affiché ;
//   - la réponse attendue est acceptée par le correcteur (checkAnswer) ;
//   - un calcul recopié depuis l'énoncé n'est pas accepté ;
//   - QCM : au moins 2 choix, index correct valide, pas de doublon ;
//   - la correction se construit et reprend les valeurs du tirage.
// =====================================================================

import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Mini-DOM factice : suffit pour exécuter les figures et les visuels (SVG en chaînes,
// curseurs…) et vérifier qu'ils ne produisent ni erreur ni « NaN ».
const journal = [];
function faux() {
  const enfants = {};
  let html = '';
  return {
    get innerHTML() { return html; }, set innerHTML(v) { html = String(v); journal.push(html); },
    set textContent(v) { journal.push(String(v)); }, get textContent() { return ''; },
    className: '', style: {}, value: '3', dataset: { idx: '0' }, disabled: false, hidden: false,
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild(c) { return c; }, prepend() {}, remove() {}, setAttribute(k, v) { journal.push(String(v)); }, addEventListener() {},
    querySelector(sel) { return (enfants[sel] ||= faux()); }, querySelectorAll() { return []; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 300 }),
  };
}
globalThis.document = { createElement: faux, createElementNS: faux };
globalThis.window = globalThis;
globalThis.requestAnimationFrame = (f) => f();
function executerVisuel(ou, f) {
  journal.length = 0;
  try { f(faux()); } catch (e) { problemes.push(`${ou} : figure en échec (${e.message})`); return; }
  const s = journal.join(' ');
  if (suspect(s)) problemes.push(`${ou} : figure suspecte → ${s.match(/.{0,80}(undefined|NaN|Infinity).{0,40}/)?.[0]}`);
}
const imp = (rel) => import(pathToFileURL(path.join(racine, rel)).href);

const { CHAPTERS } = await imp('js/programme.js');
const { checkAnswer, prepareChoices, decouperTrous } = await imp('js/engine.js');

// Modes où la réponse stockée (un nombre) n'est pas la saisie attendue (« 2^3×3 », « 5/9 »…).
const auto = (st) => !['facteurs_premiers', 'fraction_irreductible', 'notation_scientifique'].includes(st.validation);

const filtre = process.argv.slice(2);
const TIRAGES = 150;
const problemes = [];
const avertissements = [];
let nbChap = 0, nbTirages = 0;

const texte = (v) => (typeof v === 'function' ? '' : Array.isArray(v) ? v.join(' ') : String(v ?? ''));
const suspect = (s) => /undefined|NaN|\[object |Infinity/.test(s);

// Convertit un morceau LaTeX d'énoncé en saisie clavier (« 3 \times 4 » → « 3*4 »).
function texVersSaisie(t) {
  return t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\{,\}/g, ',').replace(/\\times/g, '*').replace(/\\div/g, '/')
    .replace(/\\left|\\right|\\[,;!]|\\quad/g, '').replace(/[{}]/g, '').trim();
}

function verifierEtat(ou, type, st, exo) {
  const affichage = [st.enonce, st.question, st.enonce_complete, st.consigne, st.explication, texte(st.etapes), texte(st.choix)].map(texte).join(' ');
  if (suspect(affichage)) problemes.push(`${ou} : texte suspect → ${affichage.slice(0, 160)}`);

  if (type === 'qcm' || Array.isArray(st.choix)) {
    const p = prepareChoices(st);
    if (!Array.isArray(st.choix) || st.choix.length < 2) problemes.push(`${ou} : moins de 2 choix`);
    else if (typeof st.correct !== 'number' || st.correct < 0 || st.correct >= st.choix.length) problemes.push(`${ou} : index correct hors borne`);
    else if (p.choix.length !== st.choix.length) problemes.push(`${ou} : choix en double (${st.choix.join(' | ')})`);
    return;
  }
  if (type === 'vrai_faux') {
    if (typeof st.reponse !== 'boolean') problemes.push(`${ou} : vrai_faux sans réponse booléenne`);
    return;
  }
  if (type === 'ordonner_etapes') {
    if (!Array.isArray(st.etapes) || st.etapes.length < 3) problemes.push(`${ou} : moins de 3 étapes`);
    else if (new Set(st.etapes).size !== st.etapes.length) problemes.push(`${ou} : étapes en double`);
    return;
  }
  if (type === 'complete') {
    const trous = decouperTrous(st.enonce_complete).filter((p, i) => i % 2).sort();
    if (!Array.isArray(st.champs) || trous.join() !== st.champs.map((c, i) => i).join()) problemes.push(`${ou} : cases [${trous}] pour ${st.champs?.length} champs`);
    (st.champs || []).forEach((c, i) => {
      if (!auto(c)) return;
      if (!checkAnswer(String(c.reponse), c)) problemes.push(`${ou} : champ ${i} refuse sa propre réponse (${c.reponse})`);
    });
    return;
  }
  // saisie
  if (st.reponse === undefined) { problemes.push(`${ou} : pas de réponse`); return; }
  const rep = Array.isArray(st.reponse) ? st.reponse.join(' ; ') : String(st.reponse);
  if (auto(st) && !checkAnswer(rep, st)) problemes.push(`${ou} : refuse sa propre réponse (${rep}, ${st.validation || 'expression'})`);
  // Calcul recopié depuis l'énoncé : ne doit pas passer (sauf s'il EST la réponse).
  if (st.validation === 'nombre' && !st.calcul) {
    for (const m of String(st.enonce || st.question || '').matchAll(/\$([^$]+)\$/g)) {
      const saisie = texVersSaisie(m[1]);
      if (!/[-+*/]/.test(saisie.replace(/^-/, '')) || /[a-z=<>]/i.test(saisie)) continue;
      if (checkAnswer(saisie, st)) problemes.push(`${ou} : l'énoncé recopié « ${saisie} » est accepté`);
    }
  }
}

/** Vrai si deux tirages successifs donnent des énoncés différents (exercice réellement paramétré). */
function enonceVariable(exo) {
  const lire = () => {
    try { const st = exo.generer(); return [st.enonce, st.question, st.enonce_complete, texte(st.choix)].map(texte).join('|'); }
    catch (e) { return ''; }
  };
  const ref = lire();
  for (let i = 0; i < 12; i++) if (lire() !== ref) return true;
  return false;
}

function verifierCorrection(ou, exo, st) {
  const f = exo.correction_etapes || exo.correction_detaillee;
  if (!f) { problemes.push(`${ou} : pas de correction`); return; }
  let out;
  try { out = typeof f === 'function' ? f(st) : f; }
  catch (e) { problemes.push(`${ou} : correction en échec (${e.message})`); return; }
  const s = texte(out);
  if (!s.trim()) problemes.push(`${ou} : correction vide`);
  if (suspect(s)) problemes.push(`${ou} : correction suspecte → ${s.slice(0, 160)}`);
  // Correction « générique » : elle ignore le tirage alors que l'énoncé, lui, change.
  if (typeof f === 'function' && f.length === 0 && exo.generer && enonceVariable(exo)) avertissements.push(`${ou} : correction générique (ne reprend pas les valeurs)`);
}

for (const meta of CHAPTERS.filter((c) => c.module && (!filtre.length || filtre.includes(c.id)))) {
  let chap;
  try { chap = (await imp(path.join('js', meta.module))).default; }
  catch (e) { problemes.push(`${meta.id} : import impossible (${e.message})`); continue; }
  nbChap++;
  const id = meta.id;
  if (chap.id !== id) problemes.push(`${id} : id du module = ${chap.id}`);
  if (chap.niveau !== meta.niveau) problemes.push(`${id} : niveau ${chap.niveau} ≠ ${meta.niveau}`);
  if (chap.theme !== meta.theme) problemes.push(`${id} : thème ${chap.theme} ≠ ${meta.theme}`);
  for (const k of ['titre', 'intro']) if (!chap[k]) problemes.push(`${id} : champ ${k} manquant`);
  if (!chap.cours?.length) problemes.push(`${id} : cours vide`);
  if (!chap.methode?.length) problemes.push(`${id} : méthode vide`);
  if ((chap.quiz_bilan || []).length < 5) problemes.push(`${id} : quiz de moins de 5 questions`);
  for (const n of [1, 2, 3]) if (!(chap.exercices || []).some((e) => e.niveau === n)) problemes.push(`${id} : aucun exercice de niveau ${n}`);
  const ids = (chap.exercices || []).map((e) => e.id);
  if (new Set(ids).size !== ids.length) problemes.push(`${id} : identifiants d'exercice en double`);
  if (chap.express) {
    (chap.express.exercices || []).forEach((e) => { if (!ids.includes(e)) problemes.push(`${id} : express → exercice ${e} inconnu`); });
    (chap.express.cours || []).forEach((i) => { if (!chap.cours[i]) problemes.push(`${id} : express → bloc de cours ${i} inconnu`); });
  }
  for (const b of chap.cours || []) {
    if (suspect([b.titre, b.contenu, b.formule, b.enonce, texte(b.solution_etapes)].map(texte).join(' '))) problemes.push(`${id} : bloc de cours suspect (${b.titre || b.enonce})`);
    if (typeof b.render === 'function') executerVisuel(`${id}/cours « ${b.titre} »`, b.render);
  }

  for (const exo of chap.exercices || []) {
    const ou = `${id}/${exo.id}`;
    if ((exo.indices || []).length < 2) problemes.push(`${ou} : moins de 2 indices`);
    let premier = true;
    for (let t = 0; t < (exo.generer ? TIRAGES : 1); t++) {
      let st;
      try { st = exo.generer ? exo.generer() : exo; nbTirages++; }
      catch (e) { problemes.push(`${ou} : générateur en échec (${e.message})`); break; }
      const avant = problemes.length;
      verifierEtat(ou, exo.type, st, exo);
      if (premier || problemes.length === avant) verifierCorrection(ou, exo, st);
      if (typeof st.visuel === 'function' && t < 20) executerVisuel(ou, st.visuel);
      premier = false;
      if (problemes.length - avant > 0) break; // un signalement par exercice suffit
    }
  }
  (chap.quiz_bilan || []).forEach((q, i) => {
    const ou = `${id}/quiz${i + 1}`;
    for (let t = 0; t < (q.generer ? TIRAGES : 1); t++) {
      let st;
      try { st = q.generer ? Object.assign({}, q, q.generer()) : q; nbTirages++; }
      catch (e) { problemes.push(`${ou} : générateur en échec (${e.message})`); break; }
      const avant = problemes.length;
      verifierEtat(ou, q.type, st, q);
      if (!st.question) problemes.push(`${ou} : question vide`);
      if (typeof st.visuel === 'function' && t < 20) executerVisuel(ou, st.visuel);
      if (problemes.length > avant) break;
    }
  });
}

// Les avertissements identiques (même exercice) ne sont listés qu'une fois.
const avert = [...new Set(avertissements)];
console.log(`${nbChap} chapitres · ${nbTirages} tirages`);
if (avert.length) {
  console.log(`\n${avert.length} correction(s) générique(s) :`);
  if (process.env.DETAIL) avert.forEach((a) => console.log('  ~ ' + a));
}
if (problemes.length) {
  console.log(`\n${problemes.length} problème(s) :`);
  [...new Set(problemes)].forEach((p) => console.log('  ✗ ' + p));
  process.exit(1);
}
console.log('\n✓ Aucun problème.');
