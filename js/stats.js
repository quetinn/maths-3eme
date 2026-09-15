// =====================================================================
//  stats.js — Statistiques de progression calculées sur UNE progression
//  (celle de l'appareil, ou celle d'un élève vue depuis l'espace tuteur).
//  Fonctions pures : elles lisent `data` sans le modifier.
// =====================================================================

import { CHAPTERS, THEMES, chaptersOf, chapterById } from './programme.js';

export const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const VIDE = { xp: 0, exercices: {}, quizPassed: false, quizScore: null, review: false };
export const chapitre = (data, id) => (data && data.chapters && data.chapters[id]) || VIDE;

export function aCommence(data, id) {
  const c = chapitre(data, id);
  return c.xp > 0 || Object.keys(c.exercices || {}).length > 0;
}

/** Maîtrise (0–100) : exercices réussis (60 %) + quiz validé (40 %). */
export function maitrise(data, id) {
  const c = chapitre(data, id);
  let tentes = 0, reussis = 0;
  for (const exId in (c.exercices || {})) {
    const e = c.exercices[exId];
    if (typeof e === 'object' && e) { tentes++; if ((e.ok || 0) > 0) reussis++; }
    else if (e === true) { tentes++; reussis++; }
  }
  const quiz = c.quizPassed ? 1 : 0;
  if (!tentes && !quiz) return 0;
  return Math.round(((tentes ? reussis / tentes : 0) * 0.6 + quiz * 0.4) * 100);
}

export function libelleMaitrise(pct) {
  if (pct >= 85) return '🏆 Maîtrisé';
  if (pct >= 60) return '🌳 Solide';
  if (pct >= 30) return '🌿 En progrès';
  if (pct > 0) return '🌱 Débuté';
  return 'À commencer';
}

export function erreursChapitre(data, id) {
  const c = chapitre(data, id);
  let ok = 0, ko = 0;
  for (const exId in (c.exercices || {})) { const e = c.exercices[exId]; if (typeof e === 'object' && e) { ok += e.ok || 0; ko += e.ko || 0; } }
  return { ok, ko, total: ok + ko, rate: ok + ko ? ko / (ok + ko) : 0 };
}

/** Chapitres « qui coincent » : marqués à revoir, ou ≥ 2 erreurs et ≥ 40 % d'erreurs. */
export function chapitresFragiles(data) {
  return CHAPTERS
    .map((c) => ({ c, ...erreursChapitre(data, c.id), review: !!chapitre(data, c.id).review }))
    .filter((x) => x.review || (x.ko >= 2 && x.rate >= 0.4))
    .sort((a, b) => (b.review - a.review) || (b.rate - a.rate));
}

export function erreursParTheme(data) {
  return THEMES.map((t) => {
    let ok = 0, ko = 0;
    CHAPTERS.filter((c) => c.theme === t.id).forEach((c) => { const e = erreursChapitre(data, c.id); ok += e.ok; ko += e.ko; });
    return { t, ok, ko, total: ok + ko, rate: ok + ko ? ko / (ok + ko) : 0 };
  }).filter((x) => x.total > 0).sort((a, b) => b.rate - a.rate);
}

/** Progression sur les chapitres DISPONIBLES (les « en préparation » ne comptent pas). */
export function progression(data, liste) {
  const dispo = liste.filter((c) => c.module);
  const done = dispo.filter((c) => chapitre(data, c.id).quizPassed).length;
  return { done, total: dispo.length, pct: dispo.length ? Math.round((done / dispo.length) * 100) : 0 };
}
export const progressionNiveau = (data, niveau) => progression(data, chaptersOf(niveau));
export const progressionTheme = (data, theme, niveau) => progression(data, chaptersOf(niveau, theme));

/** Exercices réussis sur les `jours` derniers jours (journal `data.activite`). */
export function exosReussis(data, jours = 7) {
  const act = (data && data.activite) || {};
  let n = 0;
  for (let i = 0; i < jours; i++) n += act[ymd(new Date(Date.now() - i * 86400000))] || 0;
  return n;
}

/** Série de jours d'affilée encore valable (dernière activité aujourd'hui ou hier). */
export function serieActuelle(data) {
  const s = (data && data.streak) || {};
  const ok = s.lastDay === ymd() || s.lastDay === ymd(new Date(Date.now() - 86400000));
  return ok ? (s.count || 0) : 0;
}

/** Résumé recopié dans l'onglet « Élèves » du Google Sheet. */
export function resumePourTuteur(data) {
  const niveau = (data.settings && data.settings.niveau) || '';
  const p = niveau ? progressionNiveau(data, niveau) : { done: 0, total: 0 };
  const dernier = data.last && chapterById(data.last);
  return {
    niveau,
    niveauAt: (data.settings && data.settings.niveauAt) || 0,
    xp: data.xp || 0,
    valides: niveau ? `${p.done} sur ${p.total}` : '',
    exos7j: exosReussis(data, 7),
    serie: serieActuelle(data),
    coince: chapitresFragiles(data).slice(0, 3).map((w) => w.c.titre).join(', '),
    dernier: dernier ? `${dernier.titre} (${dernier.niveau})` : '',
  };
}
