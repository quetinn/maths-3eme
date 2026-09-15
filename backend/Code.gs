/**
 * =====================================================================
 *  Maths Collège — serveur de sauvegarde (Google Apps Script)
 * =====================================================================
 *  Ce script transforme un Google Sheet en « base de données » pour le site :
 *   - onglet « Élèves »      : 1 ligne par élève (pseudo, code, classe + résumé
 *                               de progression lisible par le tuteur) ;
 *   - onglet « Sauvegardes » : la progression complète (JSON découpé) ;
 *   - onglet « Config »      : le mot de passe de l'espace tuteur.
 *
 *  Installation : voir backend/INSTALLATION.md (≈ 10 minutes, une seule fois).
 *
 *  Sécurité (adaptée à un petit groupe d'élèves) :
 *   - un élève ne lit/écrit QUE sa propre progression (pseudo + code à 4 chiffres) ;
 *   - 5 essais ratés → pseudo bloqué 15 minutes ;
 *   - le site ne garde pas le code mais un « jeton » signé : si le tuteur change
 *     le code, les appareils déjà connectés doivent se reconnecter ;
 *   - l'espace tuteur est protégé par le mot de passe de l'onglet Config.
 * =====================================================================
 */

const VERSION_API = 1;
const FEUILLE_ELEVES = 'Élèves';
const FEUILLE_SAUVEGARDES = 'Sauvegardes';
const FEUILLE_CONFIG = 'Config';
const NIVEAUX = ['5e', '4e', '3e'];
const MDP_DEFAUT = 'a-changer';

// Colonnes de l'onglet « Élèves » (numérotées à partir de 1).
const COL = { pseudo: 1, code: 2, classe: 3, synchro: 4, xp: 5, valides: 6, exos7j: 7, serie: 8, coince: 9, dernier: 10, classeMaj: 11 };
const ENTETES_ELEVES = ['Pseudo', 'Code', 'Classe', 'Dernière synchro', 'XP', 'Chapitres validés', 'Exos réussis (7 j)',
  'Série (jours)', 'À retravailler', 'Dernier chapitre ouvert', '(technique) classe modifiée le'];

const TAILLE_PART = 45000;   // une cellule Google Sheets contient au plus 50 000 caractères
const MAX_PARTS = 20;
const MAX_ECHECS = 5;
const BLOCAGE_SECONDES = 15 * 60;

// ---------------------------------------------------------------------
//  Installation (à lancer une fois depuis l'éditeur : ▶ Exécuter « installer »)
// ---------------------------------------------------------------------

function installer() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const eleves = ss.getSheetByName(FEUILLE_ELEVES) || ss.insertSheet(FEUILLE_ELEVES);
  if (eleves.getLastRow() === 0) eleves.appendRow(ENTETES_ELEVES);
  eleves.setFrozenRows(1);
  eleves.getRange(1, 1, 1, ENTETES_ELEVES.length).setFontWeight('bold');
  eleves.getRange('B:B').setNumberFormat('@'); // les codes restent du texte (« 0042 » garde ses zéros)
  eleves.getRange('C:C').setNumberFormat('@');
  eleves.hideColumns(COL.classeMaj);

  const sauvegardes = ss.getSheetByName(FEUILLE_SAUVEGARDES) || ss.insertSheet(FEUILLE_SAUVEGARDES);
  if (sauvegardes.getLastRow() === 0) sauvegardes.appendRow(['Pseudo', 'Mise à jour (ms)', 'Nombre de parts', 'Données (ne pas modifier)']);
  sauvegardes.setFrozenRows(1);

  const config = ss.getSheetByName(FEUILLE_CONFIG) || ss.insertSheet(FEUILLE_CONFIG);
  if (config.getLastRow() === 0) {
    config.appendRow(['Mot de passe tuteur', MDP_DEFAUT]);
    config.appendRow(['↑ Remplace « a-changer » par ton mot de passe (8 caractères minimum). Garde ce fichier privé.', '']);
  }

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SECRET')) props.setProperty('SECRET', Utilities.getUuid() + Utilities.getUuid());
  return 'Installation terminée ✔';
}

// ---------------------------------------------------------------------
//  Points d'entrée web
// ---------------------------------------------------------------------

function doGet() {
  return json({ ok: true, service: 'maths-college', version: VERSION_API });
}

function doPost(e) {
  let reponse;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = ACTIONS[req.action];
    if (!action) throw erreur('ACTION', 'Action inconnue.');
    reponse = Object.assign({ ok: true }, action(req));
  } catch (err) {
    reponse = err && err.codeErreur
      ? Object.assign({ ok: false, code: err.codeErreur, erreur: err.message }, err.extra || {})
      : { ok: false, code: 'SERVEUR', erreur: 'Erreur du serveur : ' + (err && err.message) };
  }
  return json(reponse);
}

/** Déclencheur simple : quand le tuteur modifie la classe dans le tableur, on la date. */
function onEdit(e) {
  if (!e || !e.range) return;
  const f = e.range.getSheet();
  if (f.getName() !== FEUILLE_ELEVES || e.range.getRow() < 2) return;
  if (e.range.getColumn() <= COL.classe && e.range.getLastColumn() >= COL.classe) {
    for (let r = e.range.getRow(); r <= e.range.getLastRow(); r++) f.getRange(r, COL.classeMaj).setValue(Date.now());
  }
}

// ---------------------------------------------------------------------
//  Actions
// ---------------------------------------------------------------------

const ACTIONS = {
  ping() { return { version: VERSION_API }; },

  // — Élève —
  connexion(req) {
    const k = cle(req.pseudo);
    if (!k || !req.code) throw erreur('IDENTIFIANTS', 'Entre ton pseudo et ton code.');
    verifierBlocage(k);
    const t = trouverEleve(req.pseudo);
    if (!t || codeCellule(t.valeurs[COL.code - 1]) !== String(req.code).trim()) {
      noterEchec(k);
      throw erreur('IDENTIFIANTS', 'Pseudo ou code incorrect.');
    }
    effacerEchecs(k);
    const s = lireSauvegarde(t.valeurs[0]);
    return { jeton: jetonEleve(t), eleve: infoEleve(t), donnees: s.donnees, maj: s.maj };
  },

  charger(req) {
    const t = authEleve(req);
    const s = lireSauvegarde(t.valeurs[0]);
    return { eleve: infoEleve(t), donnees: s.donnees, maj: s.maj };
  },

  // `base` = version de la sauvegarde que l'appareil a vue en dernier. Si quelqu'un
  // (autre appareil) a sauvegardé entre-temps → CONFLIT : l'appareil fusionne et renvoie.
  sauver(req) {
    const t = authEleve(req);
    if (!req.donnees || typeof req.donnees !== 'object') throw erreur('DONNEES', 'Sauvegarde invalide.');
    return avecVerrou(() => {
      const s = lireSauvegarde(t.valeurs[0]);
      if (s.maj && Number(req.base || 0) !== s.maj) {
        throw erreur('CONFLIT', 'Une sauvegarde plus récente existe.', { donnees: s.donnees, maj: s.maj, eleve: infoEleve(t) });
      }
      const maj = ecrireSauvegarde(String(t.valeurs[0]), req.donnees, s.ligne);
      majResume(t, req.resume || {});
      return { maj, eleve: infoEleve(trouverEleve(t.valeurs[0])) };
    });
  },

  // — Tuteur —
  tuteur_connexion(req) {
    verifierBlocage('__tuteur');
    const mdp = motDePasseTuteur();
    if (String(req.motDePasse || '') !== mdp) {
      noterEchec('__tuteur');
      throw erreur('IDENTIFIANTS', 'Mot de passe incorrect.');
    }
    effacerEchecs('__tuteur');
    return { jeton: signer('tuteur:' + mdp) };
  },

  tuteur_liste(req) {
    authTuteur(req);
    const vals = feuille(FEUILLE_ELEVES).getDataRange().getValues();
    const eleves = vals.slice(1).filter((l) => cle(l[0])).map((l) => ({
      pseudo: String(l[COL.pseudo - 1]), code: codeCellule(l[COL.code - 1]), niveau: String(l[COL.classe - 1] || ''),
      synchro: l[COL.synchro - 1] instanceof Date ? l[COL.synchro - 1].getTime() : Number(l[COL.synchro - 1]) || 0,
      xp: Number(l[COL.xp - 1]) || 0, valides: String(l[COL.valides - 1] || ''), exos7j: Number(l[COL.exos7j - 1]) || 0,
      serie: Number(l[COL.serie - 1]) || 0, coince: String(l[COL.coince - 1] || ''), dernier: String(l[COL.dernier - 1] || ''),
    }));
    return { eleves, urlFeuille: SpreadsheetApp.getActiveSpreadsheet().getUrl() };
  },

  tuteur_eleve(req) {
    authTuteur(req);
    const t = trouverEleve(req.pseudo);
    if (!t) throw erreur('INTROUVABLE', 'Élève introuvable.');
    const s = lireSauvegarde(t.valeurs[0]);
    return { eleve: Object.assign(infoEleve(t), { code: codeCellule(t.valeurs[COL.code - 1]) }), donnees: s.donnees, maj: s.maj };
  },

  tuteur_creer(req) {
    authTuteur(req);
    const pseudo = String(req.pseudo || '').trim();
    if (!pseudoValide(pseudo)) throw erreur('PSEUDO', 'Pseudo invalide : 2 à 20 lettres, chiffres, - ou _ (sans espace).');
    if (!codeValide(req.code)) throw erreur('CODE', 'Le code doit contenir exactement 4 chiffres.');
    if (req.niveau && NIVEAUX.indexOf(req.niveau) < 0) throw erreur('NIVEAU', 'Classe invalide.');
    return avecVerrou(() => {
      if (trouverEleve(pseudo)) throw erreur('EXISTE', 'Ce pseudo existe déjà.');
      const f = feuille(FEUILLE_ELEVES);
      const ligne = f.getLastRow() + 1;
      f.getRange(ligne, 1, 1, ENTETES_ELEVES.length).setValues([[pseudo, String(req.code), req.niveau || '', '', 0, '', 0, 0, '', '', Date.now()]]);
      return { eleve: infoEleve(trouverEleve(pseudo)) };
    });
  },

  tuteur_modifier(req) {
    authTuteur(req);
    return avecVerrou(() => {
      const t = trouverEleve(req.pseudo);
      if (!t) throw erreur('INTROUVABLE', 'Élève introuvable.');
      if (req.code != null) {
        if (!codeValide(req.code)) throw erreur('CODE', 'Le code doit contenir exactement 4 chiffres.');
        t.feuille.getRange(t.ligne, COL.code).setValue(String(req.code));
      }
      if (req.niveau != null) {
        if (NIVEAUX.indexOf(req.niveau) < 0) throw erreur('NIVEAU', 'Classe invalide.');
        t.feuille.getRange(t.ligne, COL.classe).setValue(req.niveau);
        t.feuille.getRange(t.ligne, COL.classeMaj).setValue(Date.now());
      }
      const maj = trouverEleve(req.pseudo);
      return { eleve: Object.assign(infoEleve(maj), { code: codeCellule(maj.valeurs[COL.code - 1]) }) };
    });
  },
};

// ---------------------------------------------------------------------
//  Élèves
// ---------------------------------------------------------------------

function cle(pseudo) { return String(pseudo == null ? '' : pseudo).trim().toLowerCase(); }
function pseudoValide(p) { return /^[A-Za-zÀ-ÖØ-öø-ÿ0-9_-]{2,20}$/.test(p); }
function codeValide(c) { return /^\d{4}$/.test(String(c == null ? '' : c).trim()); }
// Un code saisi à la main dans une cellule « nombre » perd ses zéros : on les rajoute.
function codeCellule(v) { return typeof v === 'number' ? String(v).padStart(4, '0') : String(v == null ? '' : v).trim(); }

function trouverEleve(pseudo) {
  const k = cle(pseudo);
  if (!k) return null;
  const f = feuille(FEUILLE_ELEVES);
  const vals = f.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (cle(vals[i][COL.pseudo - 1]) === k) return { feuille: f, ligne: i + 1, valeurs: vals[i] };
  }
  return null;
}

function infoEleve(t) {
  return {
    pseudo: String(t.valeurs[COL.pseudo - 1]),
    niveau: NIVEAUX.indexOf(String(t.valeurs[COL.classe - 1])) >= 0 ? String(t.valeurs[COL.classe - 1]) : '',
    niveauAt: Number(t.valeurs[COL.classeMaj - 1]) || 0,
  };
}

/** Recopie dans l'onglet « Élèves » le résumé envoyé par le site (lisible par le tuteur). */
function majResume(t, r) {
  if (!r || !Object.keys(r).length) { // pas de résumé : on ne touche qu'à la date de synchro
    t.feuille.getRange(t.ligne, COL.synchro).setValue(new Date());
    return;
  }
  const texte = (v) => String(v == null ? '' : v).replace(/^[=+\-@]+/, '').slice(0, 200); // pas de formule
  const nombre = (v) => (isFinite(Number(v)) ? Number(v) : 0);
  let classe = t.valeurs[COL.classe - 1];
  let classeMaj = Number(t.valeurs[COL.classeMaj - 1]) || 0;
  // L'élève a changé de classe dans le site APRÈS la dernière modification du tuteur.
  if (NIVEAUX.indexOf(r.niveau) >= 0 && nombre(r.niveauAt) > classeMaj) { classe = r.niveau; classeMaj = nombre(r.niveauAt); }
  t.feuille.getRange(t.ligne, COL.classe, 1, COL.classeMaj - COL.classe + 1).setValues([[
    classe, new Date(), nombre(r.xp), texte(r.valides), nombre(r.exos7j), nombre(r.serie), texte(r.coince), texte(r.dernier), classeMaj,
  ]]);
}

// ---------------------------------------------------------------------
//  Sauvegardes (JSON découpé en parts de 45 000 caractères)
// ---------------------------------------------------------------------

function lireSauvegarde(pseudo) {
  const f = feuille(FEUILLE_SAUVEGARDES);
  const vals = f.getDataRange().getValues();
  const k = cle(pseudo);
  for (let i = 1; i < vals.length; i++) {
    if (cle(vals[i][0]) !== k) continue;
    const n = Number(vals[i][2]) || 0;
    // chaque part est préfixée par « ~ » pour qu'elle ne soit jamais lue comme une formule
    const texte = vals[i].slice(3, 3 + n).map((p) => String(p).replace(/^~/, '')).join('');
    let donnees = null;
    try { donnees = texte ? JSON.parse(texte) : null; } catch (e) { donnees = null; }
    return { ligne: i + 1, maj: Number(vals[i][1]) || 0, donnees };
  }
  return { ligne: 0, maj: 0, donnees: null };
}

function ecrireSauvegarde(pseudo, donnees, ligne) {
  const texte = JSON.stringify(donnees);
  const parts = [];
  for (let i = 0; i < texte.length; i += TAILLE_PART) parts.push('~' + texte.slice(i, i + TAILLE_PART));
  if (parts.length > MAX_PARTS) throw erreur('TROP_GROS', 'Sauvegarde trop volumineuse.');
  const f = feuille(FEUILLE_SAUVEGARDES);
  const maj = Date.now();
  const ligneCible = ligne || f.getLastRow() + 1;
  const largeur = Math.max(f.getLastColumn(), 3 + parts.length);
  const valeurs = [pseudo, maj, parts.length].concat(parts);
  while (valeurs.length < largeur) valeurs.push(''); // efface les anciennes parts en trop
  f.getRange(ligneCible, 1, 1, largeur).setValues([valeurs]);
  return maj;
}

// ---------------------------------------------------------------------
//  Authentification, blocage, utilitaires
// ---------------------------------------------------------------------

function signer(texte) {
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret) throw erreur('INSTALL', "Le script n'est pas installé : lance la fonction « installer » dans l'éditeur.");
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(texte, secret));
}

function jetonEleve(t) { return signer('eleve:' + cle(t.valeurs[COL.pseudo - 1]) + ':' + codeCellule(t.valeurs[COL.code - 1])); }

function authEleve(req) {
  const t = trouverEleve(req.pseudo);
  if (!t || String(req.jeton || '') !== jetonEleve(t)) throw erreur('JETON', 'Ta session a expiré (code changé ?) : reconnecte-toi.');
  return t;
}

function motDePasseTuteur() {
  const v = String(feuille(FEUILLE_CONFIG).getRange(1, 2).getValue() || '').trim();
  if (!v || v === MDP_DEFAUT || v.length < 8) {
    throw erreur('CONFIG', 'Choisis d\'abord ton mot de passe tuteur dans l\'onglet « Config » du Google Sheet (8 caractères minimum).');
  }
  return v;
}

function authTuteur(req) {
  if (String(req.jeton || '') !== signer('tuteur:' + motDePasseTuteur())) throw erreur('JETON_TUTEUR', 'Session tuteur expirée : reconnecte-toi.');
}

function verifierBlocage(k) {
  if (CacheService.getScriptCache().get('bloque:' + k)) throw erreur('BLOQUE', 'Trop d\'essais ratés : réessaie dans 15 minutes.');
}
function noterEchec(k) {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('echecs:' + k) || 0) + 1;
  if (n >= MAX_ECHECS) { cache.put('bloque:' + k, '1', BLOCAGE_SECONDES); cache.remove('echecs:' + k); }
  else cache.put('echecs:' + k, String(n), BLOCAGE_SECONDES);
}
function effacerEchecs(k) { CacheService.getScriptCache().remove('echecs:' + k); }

function avecVerrou(fn) {
  const verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try { return fn(); } finally { verrou.releaseLock(); }
}

function feuille(nom) {
  const f = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
  if (!f) throw erreur('INSTALL', "Onglet « " + nom + " » introuvable : lance la fonction « installer » dans l'éditeur.");
  return f;
}

function erreur(code, message, extra) {
  const e = new Error(message);
  e.codeErreur = code;
  e.extra = extra;
  return e;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
