// =====================================================================
//  fusion.js — Fusion de deux progressions (appareil ↔ sauvegarde en ligne)
//
//  Utilisé quand un élève travaille sur plusieurs appareils : au lieu
//  d'écraser une progression par l'autre, on garde le meilleur de chacune
//  (XP max, badges réunis, compteurs d'exercices max, historique réuni…).
//  Module pur (sans DOM) : testable dans Node (tools/test_backend.mjs).
// =====================================================================

const clone = (o) => JSON.parse(JSON.stringify(o));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Réunit deux dictionnaires { id: { date } } en gardant la date la plus ancienne. */
function unionDates(a = {}, b = {}) {
  const out = { ...a };
  for (const k in b) {
    if (!out[k] || (b[k] && num(b[k].date) && num(b[k].date) < num(out[k].date))) out[k] = b[k];
  }
  return out;
}

function fusionExercice(a, b) {
  if (!a || typeof a !== 'object') return b;
  if (!b || typeof b !== 'object') return a;
  return {
    seen: Math.max(num(a.seen), num(b.seen)),
    ok: Math.max(num(a.ok), num(b.ok)),
    ko: Math.max(num(a.ko), num(b.ko)),
    last: Math.max(num(a.last), num(b.last)),
  };
}

function meilleurScore(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return parseInt(b, 10) > parseInt(a, 10) ? b : a;
}

function fusionChapitre(a, b, recent) {
  if (!a) return b;
  if (!b) return a;
  const exercices = { ...(a.exercices || {}) };
  for (const id in (b.exercices || {})) exercices[id] = fusionExercice(exercices[id], b.exercices[id]);
  return {
    ...recent,
    xp: Math.max(num(a.xp), num(b.xp)),
    exercices,
    quizPassed: !!(a.quizPassed || b.quizPassed),
    quizScore: meilleurScore(a.quizScore, b.quizScore),
    review: !!(recent && recent.review), // « à revoir » : dernier état connu
  };
}

/**
 * Fusionne la progression locale et la progression en ligne.
 * @param {Object|null} local
 * @param {Object|null} distant
 * @returns {Object} nouvelle progression (les entrées ne sont pas modifiées)
 */
export function fusionner(local, distant) {
  if (!distant) return clone(local);
  if (!local) return clone(distant);
  const localRecent = num(local.updatedAt) >= num(distant.updatedAt);
  const recent = localRecent ? local : distant;
  const out = clone(recent);

  out.xp = Math.max(num(local.xp), num(distant.xp));
  out.badges = unionDates(local.badges, distant.badges);
  out.achievements = unionDates(local.achievements, distant.achievements);
  out.examPassed = !!(local.examPassed || distant.examPassed);
  out.updatedAt = Math.max(num(local.updatedAt), num(distant.updatedAt));

  // Chapitres
  out.chapters = {};
  const ids = new Set([...Object.keys(local.chapters || {}), ...Object.keys(distant.chapters || {})]);
  for (const id of ids) {
    const a = (local.chapters || {})[id], b = (distant.chapters || {})[id];
    out.chapters[id] = clone(fusionChapitre(a, b, (recent.chapters || {})[id] || a || b));
  }

  // Historique d'XP : un point par jour, on garde la valeur la plus haute.
  const hist = new Map();
  [...(local.history || []), ...(distant.history || [])].forEach((h) => {
    if (h && h.d) hist.set(h.d, Math.max(num(hist.get(h.d)), num(h.xp)));
  });
  out.history = [...hist.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1)).slice(-90).map(([d, xp]) => ({ d, xp }));

  // Activité (exercices réussis par jour) : max par jour.
  const act = { ...(local.activite || {}) };
  for (const d in (distant.activite || {})) act[d] = Math.max(num(act[d]), num(distant.activite[d]));
  out.activite = act;

  // Série de jours et compteur du jour : la plus récente, sinon la plus grande.
  const sl = local.streak || {}, sd = distant.streak || {};
  out.streak = (sl.lastDay || '') === (sd.lastDay || '')
    ? { count: Math.max(num(sl.count), num(sd.count)), lastDay: sl.lastDay || null }
    : ((sl.lastDay || '') > (sd.lastDay || '') ? { ...sl } : { ...sd });
  const dl = local.daily || {}, dd = distant.daily || {};
  out.daily = (dl.d || '') === (dd.d || '')
    ? { d: dl.d || null, count: Math.max(num(dl.count), num(dd.count)) }
    : ((dl.d || '') > (dd.d || '') ? { ...dl } : { ...dd });

  // Réglages d'affichage : ceux de l'appareil. Classe : la plus récemment choisie.
  const setL = local.settings || {}, setD = distant.settings || {};
  out.settings = { ...setD, ...setL };
  if (num(setD.niveauAt) > num(setL.niveauAt) || (!setL.niveau && setD.niveau)) {
    out.settings.niveau = setD.niveau;
    out.settings.niveauAt = setD.niveauAt;
  }
  return out;
}

/** JSON à clés triées : deux progressions identiques ont la même signature. */
export function signature(obj) {
  return JSON.stringify(obj, (k, v) => (v && typeof v === 'object' && !Array.isArray(v)
    ? Object.keys(v).sort().reduce((o, key) => { o[key] = v[key]; return o; }, {})
    : v));
}
