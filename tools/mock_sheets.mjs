// =====================================================================
//  mock_sheets.mjs — Simulateur local de Google Sheets + Apps Script
//
//  Exécute le VRAI backend (backend/Code.gs) dans Node, avec de fausses
//  implémentations de SpreadsheetApp, CacheService, etc. Sert à :
//   - tester le backend (tools/test_backend.mjs) ;
//   - développer le site sans Google : `node tools/mock_sheets.mjs`
//     puis, dans la console du site en local :
//     localStorage.setItem('mc_api_dev', 'http://localhost:8125/exec')
// =====================================================================

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHmac, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const CODE_GS = fileURLToPath(new URL('../backend/Code.gs', import.meta.url));

// --- Fausse feuille : grille de valeurs, indices à partir de 1 comme Apps Script ---
class FausseFeuille {
  constructor(nom) { this.nom = nom; this.grille = []; }
  getName() { return this.nom; }
  getLastRow() { return this.grille.length; }
  getLastColumn() { return this.grille.reduce((m, l) => Math.max(m, l.length), 0); }
  appendRow(valeurs) { this.grille.push([...valeurs]); return this; }
  getDataRange() { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  getRange(ligne, col = 1, nbLignes = 1, nbCols = 1) {
    if (typeof ligne === 'string') return new FaussePlage(this, 1, 1, 0, 0); // plages A1 : mise en forme seulement
    return new FaussePlage(this, ligne, col, nbLignes, nbCols);
  }
  setFrozenRows() { return this; }
  hideColumns() { return this; }
}
class FaussePlage {
  constructor(f, l, c, nl, nc) { Object.assign(this, { f, l, c, nl, nc }); }
  getSheet() { return this.f; }
  getRow() { return this.l; }
  getColumn() { return this.c; }
  getLastRow() { return this.l + this.nl - 1; }
  getLastColumn() { return this.c + this.nc - 1; }
  getValues() {
    const out = [];
    for (let i = 0; i < this.nl; i++) {
      const ligne = this.f.grille[this.l - 1 + i] || [];
      out.push(Array.from({ length: this.nc }, (_, j) => (ligne[this.c - 1 + j] ?? '')));
    }
    return out;
  }
  getValue() { return this.getValues()[0][0]; }
  setValues(v) {
    v.forEach((ligne, i) => {
      const L = this.l - 1 + i;
      while (this.f.grille.length <= L) this.f.grille.push([]);
      ligne.forEach((val, j) => { this.f.grille[L][this.c - 1 + j] = val; });
    });
    return this;
  }
  setValue(val) { return this.setValues([[val]]); }
  setNumberFormat() { return this; }
  setFontWeight() { return this; }
}

export function creerEnvironnement() {
  const feuilles = new Map();
  const classeur = {
    getSheetByName: (n) => feuilles.get(n) || null,
    insertSheet: (n) => { const f = new FausseFeuille(n); feuilles.set(n, f); return f; },
    getUrl: () => 'https://docs.google.com/spreadsheets/d/FAUX/edit',
  };
  const proprietes = new Map();
  const cache = new Map();
  const globals = {
    SpreadsheetApp: { getActiveSpreadsheet: () => classeur },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => proprietes.get(k) ?? null, setProperty: (k, v) => proprietes.set(k, v) }) },
    CacheService: { getScriptCache: () => ({
      get: (k) => { const e = cache.get(k); return e && e.fin > Date.now() ? e.v : null; },
      put: (k, v, s) => cache.set(k, { v, fin: Date.now() + s * 1000 }),
      remove: (k) => cache.delete(k),
    }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: {
      getUuid: () => randomUUID(),
      computeHmacSha256Signature: (texte, cle) => [...createHmac('sha256', cle).update(texte).digest()],
      base64EncodeWebSafe: (octets) => Buffer.from(octets).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (contenu) => ({ contenu, setMimeType() { return this; }, getContent() { return this.contenu; } }),
    },
    Date, JSON, Math, Number, String, Object, Array, Error, isFinite,
  };
  const contexte = vm.createContext(globals);
  vm.runInContext(readFileSync(CODE_GS, 'utf8') + '\n;globalThis.__api = { installer, doPost, doGet, onEdit };', contexte);
  const api = contexte.__api;
  return {
    api,
    feuilles,
    cache,
    /** Appelle doPost comme le ferait Google et renvoie la réponse JSON. */
    appeler: (corps) => JSON.parse(api.doPost({ postData: { contents: JSON.stringify(corps) } }).getContent()),
  };
}

// --- Serveur HTTP de développement (port 8125) ---
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const env = creerEnvironnement();
  env.api.installer();
  env.feuilles.get('Config').grille[0][1] = process.env.MDP_TUTEUR || 'tuteur-test';
  const port = Number(process.env.PORT || 8125);
  createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (req.method === 'GET') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(env.api.doGet().getContent()); return; }
    let corps = '';
    req.on('data', (c) => { corps += c; });
    req.on('end', () => {
      const sortie = env.api.doPost({ postData: { contents: corps } }).getContent();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(sortie);
    });
  }).listen(port, () => console.log(`Faux Google Sheets sur http://localhost:${port}/exec (mot de passe tuteur : ${env.feuilles.get('Config').grille[0][1]})`));
}
