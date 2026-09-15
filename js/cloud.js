// =====================================================================
//  cloud.js — Comptes élèves (pseudo + code) et synchronisation automatique
//              avec le Google Sheet (backend/Code.gs)
//
//  Principe « local d'abord » : la progression est toujours enregistrée sur
//  l'appareil, puis envoyée en ligne quelques secondes après chaque progrès.
//  À l'ouverture du site, on récupère la version en ligne et on FUSIONNE
//  (travail sur plusieurs appareils sans rien perdre).
// =====================================================================

import { SHEETS_API_URL } from './config.js';
import { fusionner, signature } from './fusion.js';

const CLE_COMPTE = 'mc_compte';
const CLE_TUTEUR = 'mc_tuteur';
const DELAI_ENVOI = 5000;           // anti-rebond après un progrès
const DELAI_RELECTURE = 2 * 60000;  // relire la version en ligne au retour sur l'onglet

const estLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);

/** URL du backend. En local, on peut viser le simulateur (tools/mock_sheets.mjs). */
export function apiUrl() {
  if (estLocal) { try { const dev = localStorage.getItem('mc_api_dev'); if (dev) return dev; } catch (e) { /* ignore */ } }
  return SHEETS_API_URL;
}
export const enLigneDisponible = () => !!apiUrl();

/** Appel du backend. Lève une erreur { code, message, reponse } si ok:false ou réseau. */
export async function appeler(action, params = {}) {
  let rep;
  try {
    // text/plain = requête « simple » : pas de pré-vérification CORS (exigé par Apps Script)
    const r = await fetch(apiUrl(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, ...params }) });
    rep = await r.json();
  } catch (e) {
    throw Object.assign(new Error(navigator.onLine === false ? 'Pas de connexion Internet.' : 'Serveur de sauvegarde injoignable.'), { code: 'RESEAU' });
  }
  if (!rep.ok) throw Object.assign(new Error(rep.erreur || 'Erreur inconnue.'), { code: rep.code, reponse: rep });
  return rep;
}

const lireJSON = (cle) => { try { return JSON.parse(localStorage.getItem(cle) || 'null'); } catch (e) { return null; } };
const ecrireJSON = (cle, v) => { try { if (v == null) localStorage.removeItem(cle); else localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* ignore */ } };

export const Compte = {
  lire: () => lireJSON(CLE_COMPTE),     // { pseudo, jeton, maj, derniereSynchro }
  ecrire: (c) => ecrireJSON(CLE_COMPTE, c),
  effacer: () => ecrireJSON(CLE_COMPTE, null),
};
export const Tuteur = {
  lire: () => lireJSON(CLE_TUTEUR),     // { jeton }
  ecrire: (t) => ecrireJSON(CLE_TUTEUR, t),
  effacer: () => ecrireJSON(CLE_TUTEUR, null),
};

/**
 * Crée le gestionnaire de synchronisation.
 * @param {Object} o
 *   lireDonnees()        → progression courante (objet)
 *   ecrireDonnees(d)     remplace la progression (et l'enregistre sur l'appareil, SANS relancer d'envoi)
 *   resume(d)            → résumé lisible pour le tableur du tuteur
 *   appliquerEleve(e)    infos du compte venant du serveur ({ pseudo, niveau, niveauAt })
 *   onChange()           la progression a été modifiée par une fusion (redessiner)
 *   onStatut(statut)     'deconnecte' | 'synchro' | 'ok' | 'en-attente' | 'hors-ligne' | 'erreur' | 'reconnexion'
 */
export function creerSynchro(o) {
  let statut = Compte.lire() ? 'ok' : 'deconnecte';
  let enAttente = false, enCours = false, relancer = false, minuteur = null, derniereLecture = 0;

  const setStatut = (s) => { statut = s; o.onStatut && o.onStatut(s); };

  const sync = {
    get statut() { return statut; },
    get enAttente() { return enAttente; },
    compte: () => Compte.lire(),

    /** À appeler après chaque progrès enregistré sur l'appareil. */
    planifier() {
      if (!Compte.lire() || !enLigneDisponible()) return;
      enAttente = true;
      if (statut === 'ok') setStatut('en-attente');
      clearTimeout(minuteur);
      minuteur = setTimeout(() => sync.pousser(), DELAI_ENVOI);
    },

    /** Envoie la progression. En cas de conflit : fusion puis nouvel envoi. */
    async pousser(essai = 0) {
      const c = Compte.lire();
      if (!c || !enLigneDisponible()) return false;
      if (enCours) { relancer = true; return false; }
      enCours = true; clearTimeout(minuteur);
      setStatut('synchro');
      let conflit = null;
      try {
        const donnees = o.lireDonnees();
        const rep = await appeler('sauver', { pseudo: c.pseudo, jeton: c.jeton, base: c.maj || 0, donnees, resume: o.resume(donnees) });
        Compte.ecrire({ ...c, maj: rep.maj, derniereSynchro: Date.now() });
        if (rep.eleve) o.appliquerEleve(rep.eleve);
        enAttente = false;
        setStatut('ok');
        return true;
      } catch (e) {
        if (e.code === 'CONFLIT' && essai < 3) { conflit = e.reponse; }
        else {
          enAttente = true;
          setStatut(e.code === 'JETON' ? 'reconnexion' : (e.code === 'RESEAU' ? 'hors-ligne' : 'erreur'));
          return false;
        }
      } finally {
        enCours = false;
        if (relancer && !conflit) { relancer = false; sync.planifier(); }
      }
      // Un autre appareil a sauvegardé entre-temps : on fusionne puis on renvoie.
      o.ecrireDonnees(fusionner(o.lireDonnees(), conflit.donnees));
      Compte.ecrire({ ...Compte.lire(), maj: conflit.maj });
      if (conflit.eleve) o.appliquerEleve(conflit.eleve);
      o.onChange && o.onChange();
      return sync.pousser(essai + 1);
    },

    /** Récupère la version en ligne, fusionne, et renvoie si l'appareil avait du nouveau. */
    async tirer() {
      const c = Compte.lire();
      if (!c || !enLigneDisponible() || enCours) return;
      derniereLecture = Date.now();
      setStatut('synchro');
      try {
        const rep = await appeler('charger', { pseudo: c.pseudo, jeton: c.jeton });
        if (rep.eleve) o.appliquerEleve(rep.eleve);
        const local = o.lireDonnees();
        const fus = fusionner(local, rep.donnees);
        Compte.ecrire({ ...c, maj: rep.maj, derniereSynchro: Date.now() });
        if (signature(fus) !== signature(local)) { o.ecrireDonnees(fus); o.onChange && o.onChange(); }
        if (enAttente || !rep.donnees || signature(fus) !== signature(rep.donnees)) await sync.pousser();
        else setStatut('ok');
      } catch (e) {
        setStatut(e.code === 'JETON' ? 'reconnexion' : (e.code === 'RESEAU' ? 'hors-ligne' : 'erreur'));
      }
    },

    /**
     * Connexion d'un élève. La progression déjà présente sur l'appareil est
     * fusionnée si elle est anonyme ; si elle appartient à un AUTRE élève
     * (ordinateur partagé), elle est remplacée.
     */
    async connecter(pseudo, code) {
      const rep = await appeler('connexion', { pseudo: String(pseudo).trim(), code: String(code).trim() });
      const local = o.lireDonnees();
      const autreEleve = local.proprietaire && local.proprietaire.toLowerCase() !== rep.eleve.pseudo.toLowerCase();
      Compte.ecrire({ pseudo: rep.eleve.pseudo, jeton: rep.jeton, maj: rep.maj, derniereSynchro: Date.now() });
      const base = autreEleve ? null : local;
      const fus = fusionner(base, rep.donnees) || {};
      fus.proprietaire = rep.eleve.pseudo;
      o.ecrireDonnees(fus);
      o.appliquerEleve(rep.eleve);
      o.onChange && o.onChange();
      enAttente = !rep.donnees || signature(o.lireDonnees()) !== signature(rep.donnees);
      if (enAttente) await sync.pousser(); else setStatut('ok');
      return rep.eleve;
    },

    /** Déconnexion : envoie d'abord ce qui reste. Renvoie false si l'envoi a échoué. */
    async deconnecter({ forcer = false } = {}) {
      if (enAttente && !forcer) { const ok = await sync.pousser(); if (!ok) return false; }
      clearTimeout(minuteur);
      Compte.effacer();
      enAttente = false;
      setStatut('deconnecte');
      return true;
    },

    /** Dernier envoi quand on quitte la page (sans attendre de réponse). */
    envoyerEnPartant() {
      const c = Compte.lire();
      if (!c || !enAttente || !enLigneDisponible() || !navigator.sendBeacon) return;
      const donnees = o.lireDonnees();
      const corps = JSON.stringify({ action: 'sauver', pseudo: c.pseudo, jeton: c.jeton, base: c.maj || 0, donnees, resume: o.resume(donnees) });
      navigator.sendBeacon(apiUrl(), new Blob([corps], { type: 'text/plain;charset=utf-8' }));
    },

    /** Branche les évènements du navigateur (retour en ligne, onglet visible/caché). */
    demarrer() {
      window.addEventListener('online', () => { if (enAttente) sync.pousser(); else sync.tirer(); });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') sync.envoyerEnPartant();
        else if (Date.now() - derniereLecture > DELAI_RELECTURE) sync.tirer();
      });
      window.addEventListener('pagehide', () => sync.envoyerEnPartant());
      if (Compte.lire()) sync.tirer();
    },
  };
  return sync;
}
