// =====================================================================
//  test_backend.mjs — Tests du serveur de sauvegarde et de la fusion
//  Lancer : node tools/test_backend.mjs
// =====================================================================

import assert from 'node:assert/strict';
import { creerEnvironnement } from './mock_sheets.mjs';
import { fusionner, signature } from '../js/fusion.js';

let reussis = 0;
function test(nom, fn) {
  try { fn(); reussis++; console.log('  ✔ ' + nom); }
  catch (e) { console.error('  ✘ ' + nom + '\n    ' + (e.stack || e.message)); process.exitCode = 1; }
}

console.log('Serveur (backend/Code.gs)');

const env = creerEnvironnement();
const { appeler, feuilles, api } = env;
const config = () => feuilles.get('Config').grille;
const ligneEleve = (pseudo) => feuilles.get('Élèves').grille.find((l) => String(l[0]).toLowerCase() === pseudo.toLowerCase());

test('installer crée les onglets et ne duplique rien si relancé', () => {
  api.installer(); api.installer();
  assert.deepEqual([...feuilles.keys()].sort(), ['Config', 'Sauvegardes', 'Élèves']);
  assert.equal(feuilles.get('Élèves').grille.length, 1);
  assert.equal(config().length, 2);
});

test('espace tuteur refusé tant que le mot de passe par défaut est en place', () => {
  const r = appeler({ action: 'tuteur_connexion', motDePasse: 'a-changer' });
  assert.equal(r.ok, false); assert.equal(r.code, 'CONFIG');
});

config()[0][1] = 'MonMotDePasse!';
let jetonTuteur;

test('connexion tuteur : mauvais mot de passe puis bon', () => {
  assert.equal(appeler({ action: 'tuteur_connexion', motDePasse: 'faux' }).code, 'IDENTIFIANTS');
  const r = appeler({ action: 'tuteur_connexion', motDePasse: 'MonMotDePasse!' });
  assert.equal(r.ok, true); jetonTuteur = r.jeton;
});

test('le tuteur crée des élèves (pseudo unique, code à 4 chiffres, classe)', () => {
  assert.equal(appeler({ action: 'tuteur_creer', jeton: jetonTuteur, pseudo: 'Léa', code: '0042', niveau: '3e' }).ok, true);
  assert.equal(appeler({ action: 'tuteur_creer', jeton: jetonTuteur, pseudo: 'tom_4', code: '1234', niveau: '4e' }).ok, true);
  assert.equal(appeler({ action: 'tuteur_creer', jeton: jetonTuteur, pseudo: 'LÉA', code: '1111', niveau: '3e' }).code, 'EXISTE');
  assert.equal(appeler({ action: 'tuteur_creer', jeton: jetonTuteur, pseudo: 'a b', code: '1111' }).code, 'PSEUDO');
  assert.equal(appeler({ action: 'tuteur_creer', jeton: jetonTuteur, pseudo: 'zoe', code: '12a4' }).code, 'CODE');
  assert.equal(appeler({ action: 'tuteur_creer', jeton: 'faux', pseudo: 'zoe', code: '1234' }).code, 'JETON_TUTEUR');
  assert.equal(ligneEleve('léa')[1], '0042');
});

let jetonLea;
test("connexion élève (pseudo insensible à la casse), sans sauvegarde au départ", () => {
  const r = appeler({ action: 'connexion', pseudo: 'lÉa', code: '0042' });
  assert.equal(r.ok, true);
  assert.equal(r.eleve.pseudo, 'Léa'); assert.equal(r.eleve.niveau, '3e');
  assert.equal(r.donnees, null); assert.equal(r.maj, 0);
  jetonLea = r.jeton;
});

test('un code saisi à la main comme nombre (42) est relu « 0042 »', () => {
  ligneEleve('léa')[1] = 42;
  assert.equal(appeler({ action: 'connexion', pseudo: 'Léa', code: '0042' }).ok, true);
  ligneEleve('léa')[1] = '0042';
});

test('5 codes faux → pseudo bloqué, même avec le bon code', () => {
  for (let i = 0; i < 5; i++) assert.equal(appeler({ action: 'connexion', pseudo: 'tom_4', code: '0000' }).code, 'IDENTIFIANTS');
  assert.equal(appeler({ action: 'connexion', pseudo: 'tom_4', code: '1234' }).code, 'BLOQUE');
  assert.equal(appeler({ action: 'connexion', pseudo: 'Léa', code: '0042' }).ok, true); // les autres ne sont pas bloqués
  env.cache.clear();
});

const donneesA = { xp: 120, updatedAt: 1000, chapters: { c01: { xp: 50, exercices: { e01: { seen: 3, ok: 2, ko: 1, last: 5 } }, quizPassed: false } }, settings: { niveau: '3e' } };
let majA;
test('sauvegarde puis rechargement (JSON découpé en parts)', () => {
  const r = appeler({ action: 'sauver', pseudo: 'Léa', jeton: jetonLea, base: 0, donnees: donneesA,
    resume: { niveau: '3e', xp: 120, valides: '0 sur 17', exos7j: 4, serie: 2, coince: '=HYPERLINK("x")', dernier: 'Calcul littéral (3e)' } });
  assert.equal(r.ok, true); majA = r.maj;
  const c = appeler({ action: 'charger', pseudo: 'Léa', jeton: jetonLea });
  assert.deepEqual(c.donnees, donneesA); assert.equal(c.maj, majA);
  const l = ligneEleve('léa');
  assert.equal(l[4], 120); assert.equal(l[5], '0 sur 17');
  assert.ok(!String(l[8]).startsWith('='), 'pas de formule injectée dans le tableur');
  assert.ok(feuilles.get('Sauvegardes').grille[1][3].startsWith('~'));
});

test('grosse sauvegarde (> 45 000 caractères) : plusieurs parts, relue à l’identique', () => {
  const gros = { ...donneesA, bourrage: 'x'.repeat(120000) };
  const r = appeler({ action: 'sauver', pseudo: 'Léa', jeton: jetonLea, base: majA, donnees: gros });
  assert.equal(r.ok, true);
  assert.equal(feuilles.get('Sauvegardes').grille[1][2], 3);
  assert.deepEqual(appeler({ action: 'charger', pseudo: 'Léa', jeton: jetonLea }).donnees, gros);
  const r2 = appeler({ action: 'sauver', pseudo: 'Léa', jeton: jetonLea, base: r.maj, donnees: donneesA });
  assert.equal(feuilles.get('Sauvegardes').grille[1][2], 1);
  assert.equal(feuilles.get('Sauvegardes').grille[1][4], '', 'anciennes parts effacées');
  assert.deepEqual(appeler({ action: 'charger', pseudo: 'Léa', jeton: jetonLea }).donnees, donneesA);
  majA = r2.maj;
});

test('conflit : un autre appareil a sauvegardé entre-temps', () => {
  const r = appeler({ action: 'sauver', pseudo: 'Léa', jeton: jetonLea, base: 1, donnees: { xp: 1 } });
  assert.equal(r.ok, false); assert.equal(r.code, 'CONFLIT');
  assert.deepEqual(r.donnees, donneesA); assert.equal(r.maj, majA);
});

test('jeton invalide ou pseudo d’un autre élève refusé', () => {
  assert.equal(appeler({ action: 'charger', pseudo: 'Léa', jeton: 'bidon' }).code, 'JETON');
  assert.equal(appeler({ action: 'charger', pseudo: 'tom_4', jeton: jetonLea }).code, 'JETON');
});

test('le tuteur voit la liste et le détail d’un élève', () => {
  const l = appeler({ action: 'tuteur_liste', jeton: jetonTuteur });
  assert.equal(l.eleves.length, 2);
  const lea = l.eleves.find((e) => e.pseudo === 'Léa');
  assert.equal(lea.code, '0042'); assert.equal(lea.xp, 120); assert.ok(lea.synchro > 0);
  const d = appeler({ action: 'tuteur_eleve', jeton: jetonTuteur, pseudo: 'léa' });
  assert.deepEqual(d.donnees, donneesA);
});

test('changer le code invalide les appareils connectés', () => {
  const r = appeler({ action: 'tuteur_modifier', jeton: jetonTuteur, pseudo: 'Léa', code: '9876' });
  assert.equal(r.eleve.code, '9876');
  assert.equal(appeler({ action: 'charger', pseudo: 'Léa', jeton: jetonLea }).code, 'JETON');
  assert.equal(appeler({ action: 'connexion', pseudo: 'Léa', code: '0042' }).code, 'IDENTIFIANTS');
  jetonLea = appeler({ action: 'connexion', pseudo: 'Léa', code: '9876' }).jeton;
  assert.ok(jetonLea);
});

test('classe : la modification la plus récente gagne (tuteur ↔ élève)', () => {
  const avant = appeler({ action: 'charger', pseudo: 'Léa', jeton: jetonLea });
  // l'élève choisit la 4e dans le site, après la création du compte
  appeler({ action: 'sauver', pseudo: 'Léa', jeton: jetonLea, base: avant.maj, donnees: donneesA, resume: { niveau: '4e', niveauAt: Date.now() + 1000 } });
  assert.equal(ligneEleve('léa')[2], '4e');
  // puis le tuteur remet la 3e
  const t = appeler({ action: 'tuteur_modifier', jeton: jetonTuteur, pseudo: 'Léa', niveau: '3e' });
  assert.equal(t.eleve.niveau, '3e');
  // un vieil envoi de l'élève ne réécrase pas le choix du tuteur
  const c = appeler({ action: 'charger', pseudo: 'Léa', jeton: jetonLea });
  appeler({ action: 'sauver', pseudo: 'Léa', jeton: jetonLea, base: c.maj, donnees: donneesA, resume: { niveau: '4e', niveauAt: 5 } });
  assert.equal(ligneEleve('léa')[2], '3e');
});

test('onEdit : modifier la classe à la main dans le tableur la date', () => {
  const f = feuilles.get('Élèves');
  const ligne = f.grille.findIndex((l) => l[0] === 'tom_4') + 1;
  f.grille[ligne - 1][10] = 0;
  api.onEdit({ range: f.getRange(ligne, 3) });
  assert.ok(f.grille[ligne - 1][10] > 0);
});

test('action inconnue et corps invalide', () => {
  assert.equal(appeler({ action: 'supprimer_tout' }).code, 'ACTION');
  assert.equal(JSON.parse(api.doPost({ postData: { contents: '{pas du json' } }).getContent()).code, 'SERVEUR');
});

console.log('\nFusion de progressions (js/fusion.js)');

test('fusion : garde le meilleur de chaque appareil', () => {
  const tel = {
    xp: 200, updatedAt: 2000, last: 'c02', examPassed: false,
    badges: { c01: { date: 50 } }, achievements: { first: { date: 10 } },
    chapters: { c01: { xp: 30, quizPassed: true, quizScore: '4/5', review: false, exercices: { e01: { seen: 5, ok: 4, ko: 1, last: 900 } } } },
    history: [{ d: '2026-09-10', xp: 150 }, { d: '2026-09-12', xp: 200 }],
    activite: { '2026-09-12': 6 }, streak: { count: 2, lastDay: '2026-09-12' }, daily: { d: '2026-09-12', count: 6 },
    settings: { theme: 'dark', niveau: '3e', niveauAt: 100 },
  };
  const ordi = {
    xp: 150, updatedAt: 1500, last: 'c05', examPassed: true,
    badges: { c01: { date: 40 }, c05: { date: 60 } }, achievements: {},
    chapters: {
      c01: { xp: 40, quizPassed: false, quizScore: '5/5', review: true, exercices: { e01: { seen: 2, ok: 2, ko: 0, last: 950 }, e02: { seen: 1, ok: 0, ko: 1, last: 960 } } },
      c05: { xp: 10, exercices: {} },
    },
    history: [{ d: '2026-09-11', xp: 150 }], activite: { '2026-09-11': 3, '2026-09-12': 2 },
    streak: { count: 5, lastDay: '2026-09-11' }, daily: { d: '2026-09-11', count: 3 },
    settings: { theme: 'light', niveau: '4e', niveauAt: 50 },
  };
  const f = fusionner(tel, ordi);
  assert.equal(f.xp, 200);
  assert.equal(f.last, 'c02', 'le plus récent donne le dernier chapitre');
  assert.equal(f.examPassed, true);
  assert.deepEqual(Object.keys(f.badges).sort(), ['c01', 'c05']);
  assert.equal(f.badges.c01.date, 40);
  assert.equal(f.chapters.c01.quizPassed, true);
  assert.equal(f.chapters.c01.quizScore, '5/5');
  assert.equal(f.chapters.c01.review, false, '« à revoir » suit l’appareil le plus récent');
  assert.deepEqual(f.chapters.c01.exercices.e01, { seen: 5, ok: 4, ko: 1, last: 950 });
  assert.ok(f.chapters.c01.exercices.e02 && f.chapters.c05);
  assert.deepEqual(f.history.map((h) => h.d), ['2026-09-10', '2026-09-11', '2026-09-12']);
  assert.deepEqual(f.activite, { '2026-09-11': 3, '2026-09-12': 6 });
  assert.deepEqual(f.streak, { count: 2, lastDay: '2026-09-12' });
  assert.equal(f.settings.theme, 'dark', 'thème de l’appareil local');
  assert.equal(f.settings.niveau, '3e', 'classe choisie le plus récemment');
  assert.equal(tel.xp, 200, 'les entrées ne sont pas modifiées');
});

test('fusion : un côté vide renvoie une copie de l’autre ; signature stable', () => {
  const a = { xp: 3, chapters: {}, settings: { b: 1, a: 2 } };
  assert.deepEqual(fusionner(a, null), a);
  assert.deepEqual(fusionner(null, a), a);
  assert.equal(signature({ b: 1, a: { d: 1, c: 2 } }), signature({ a: { c: 2, d: 1 }, b: 1 }));
  assert.equal(signature(fusionner(a, a)), signature(fusionner(a, a)));
});

console.log(`\n${reussis} test(s) réussi(s)${process.exitCode ? ' — ÉCHECS ci-dessus' : ''}.`);
