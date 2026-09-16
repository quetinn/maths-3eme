# Maths Collège — Plateforme interactive (5ᵉ, 4ᵉ, 3ᵉ)

SPA pédagogique de mathématiques pour le collège en **vanilla JS multi-fichiers**,
sans build step, conçue pour **GitHub Pages**. Cours, méthodes pas-à-pas, exercices
auto-corrigés à génération aléatoire, quiz bilan, XP et badges.

## Structure

```
index.html              Shell SPA + chargement des CDN (KaTeX, JSXGraph, Chart.js)
css/style.css           Design mobile-first, palette douce, accents par thème
js/programme.js         Registre des NIVEAUX, THÈMES et CHAPITRES (ordre de progression)
js/app.js               Routeur (#/…), store localStorage, accueil par niveau, pages
js/stats.js             Statistiques de progression (maîtrise, erreurs, résumé tuteur)
js/cloud.js             Comptes élèves + synchronisation avec le Google Sheet
js/fusion.js            Fusion de deux progressions (plusieurs appareils)
js/config.js            URL du script Google (sauvegarde en ligne)
backend/Code.gs         Serveur de sauvegarde (Google Apps Script) + INSTALLATION.md
tools/                  test_chapitres.mjs et test_backend.mjs (tests), mock_sheets.mjs
js/engine.js            Moteur d'exercices : génération, validation, indices, quiz
js/render.js            KaTeX, traceur de fonctions SVG, JSXGraph, Chart.js
js/brevet.js            Problèmes type brevet (situation + sous-questions)
js/chapters/commun.js   Outils des chapitres : figures SVG, tableaux, blocs Scratch
js/chapters/5e/vNN_*.js Chapitres de 5ᵉ (17, nouveau programme 2026)
js/chapters/4e/rNN_*.js Chapitres de 4ᵉ (18)
js/chapters/3e/cNN_*.js Chapitres de 3ᵉ (17)
serve.py                Serveur statique sans cache pour le dev local (optionnel)
```

## Niveaux, thèmes et programmes

- **3ᵉ et 4ᵉ** : programme de cycle 4 actuel. **5ᵉ** : nouveau programme (BO n°10 du
  5 mars 2026), en vigueur en 5ᵉ depuis la rentrée 2026 (4ᵉ en 2027, 3ᵉ en 2028).
- Chaque niveau est découpé en 5 thèmes : Nombres et calculs · Proportionnalité et
  fonctions · Géométrie et grandeurs · Données et probabilités · Algorithmique.
- L'élève indique **sa classe** au premier lancement (modifiable dans ⚙️ Réglages) ; son
  programme s'affiche en premier, mais les onglets 5ᵉ/4ᵉ/3ᵉ donnent accès à tout le collège.
- Les **52 chapitres** sont rédigés (cours, méthode, 8 à 11 exercices générés aléatoirement,
  quiz bilan). Un chapitre avec `module: null` dans `programme.js` apparaîtrait « En préparation ».
- Chaque correction reprend **les valeurs du tirage** de l'élève (pas de corrigé générique) ;
  `node tools/test_chapitres.mjs` le vérifie automatiquement.
- Les identifiants de chapitre ne changent jamais (clé de la progression) :
  `c` = 3ᵉ, `r` = 4ᵉ, `v` = 5ᵉ.

### Version express / complète

Chaque chapitre s'affiche en **⚡ Express** (l'essentiel : définitions et propriétés,
méthode en bref, un exercice par niveau, quiz) ou en **📚 Complète** (tout). Le choix se
fait sur la page du chapitre ou dans les Réglages. Un chapitre peut préciser son contenu
express : `express: { cours: [0, 2], exercices: ['e01', 'e03', 'e05'] }`.

## Comptes élèves et sauvegarde en ligne (Google Sheets)

- Le tuteur crée chaque compte (**pseudo + code à 4 chiffres + classe**) dans l'**Espace tuteur**
  (`#/prof`, protégé par mot de passe). L'élève se connecte une fois par appareil.
- **Local d'abord** : la progression est enregistrée sur l'appareil puis envoyée au Google Sheet
  5 s après chaque progrès (et en quittant la page). À l'ouverture, la version en ligne est
  récupérée et **fusionnée** : travailler sur l'ordi puis sur le téléphone ne perd rien.
- Le tuteur voit chaque élève dans l'Espace tuteur (activité, ce qui coince, maîtrise par
  chapitre) et dans l'onglet « Élèves » du Google Sheet.
- Installation : [`backend/INSTALLATION.md`](backend/INSTALLATION.md). Tant que `js/config.js`
  est vide, le site fonctionne sans comptes (progression sur l'appareil, export fichier).
- Tests : `node tools/test_backend.mjs`.

## Fonctionnalités

- **Suivi** : XP, niveau, badges, maîtrise par chapitre, réussites/erreurs par exercice,
  série de jours, historique d'XP ; **tableau de bord** (`#/tableau`) avec « ce qui coince ».
- **Types d'exercices** : saisie, QCM (choix mélangés), vrai/faux, ordonner les étapes,
  « complète le calcul », avec clavier mathématique, lecture à voix haute et correction
  pas-à-pas. Difficulté adaptative.
- **Examen blanc** (`#/examen`, par niveau et par thème), **Brevet blanc** (`#/brevet`),
  **révision du jour** (`#/revise`), **aide-mémoire** (`#/formulaire`),
  **fiches imprimables** pour le tuteur (`#/fiche`), **diagnostic** (`#/diagnostic`).
- **PWA** installable + hors-ligne (`sw.js` : réseau d'abord pour le site, cache en secours).

## Lancer en local

Les modules ES ne fonctionnent pas en `file://` : il faut un serveur HTTP.

```bash
python serve.py              # serveur sans cache (recommandé en dev) → http://localhost:8124
node tools/test_chapitres.mjs # vérifie les 52 chapitres (générateurs, corrections, figures)
node tools/mock_sheets.mjs   # (option) faux Google Sheets → http://localhost:8125/exec
```

`test_chapitres.mjs` rejoue chaque exercice 150 fois : générateur sans erreur, réponse attendue
acceptée par le correcteur, énoncé non recopiable, QCM sans doublon, correction qui reprend les
valeurs tirées. `DETAIL=1` affiche les avertissements, un identifiant de chapitre en argument
(`node tools/test_chapitres.mjs v09`) limite la vérification.

Pour utiliser le faux Google Sheets en local : dans la console du navigateur,
`localStorage.setItem('mc_api_dev', 'http://localhost:8125/exec')` (mot de passe tuteur : `tuteur-test`).

## Déployer sur GitHub Pages

1. Pousser le dépôt (branche `main`).
2. *Settings → Pages → Source : branche `main`, dossier `/ (root)`*.
3. Aucun build : `git push` suffit.

## Ajouter un chapitre

1. Créer `js/chapters/<niveau>/<id>_nom.js` (copier `5e/v10_triangles.js` comme gabarit ;
   les imports sont `../../engine.js`, `../../render.js` et `../commun.js` pour les figures).
2. Dans `js/programme.js`, renseigner le nom du fichier sur l'entrée du chapitre.
3. Ajouter le fichier à `CORE` dans `sw.js` et incrémenter `VERSION`.

### Schéma d'un chapitre

```js
export default {
  id, titre, theme, niveau, icone,
  intro,                                   // « à quoi ça sert » (HTML, KaTeX $…$)
  cours:   [{ type, titre, contenu, formule } | { type:'exemple', enonce, solution_etapes }],
  methode: [{ etape, titre, explication }],
  express?: { cours: [index], exercices: [ids] },
  exercices: [{
    id, niveau /*1|2|3*/,
    type /*'saisie'|'qcm'|'vrai_faux'|'ordonner_etapes'|'complete'*/, consigne,
    generer() { return { enonce, reponse, reponseTex?, validation, choix?, correct?, _v?,
      // ordonner_etapes : { etapes: [..] (ordre correct) }
      // complete        : { enonce_complete: "… {0} … {1}", champs: [{reponse, validation}] }
    }; },
    indices: [ "…", "…", "…" ],
    correction_detaillee: (state) => "HTML",   // OU correction_etapes: (state) => ["étape 1", …]
  }],
  quiz_bilan: [{ type, question, choix?, correct?, reponse?, validation?, explication }],
};
```

**Validation (`validation`)** :

- `'nombre'` : la saisie doit être un **résultat** (décimal, fraction `a/b`, `a×10^n`,
  unité finale tolérée). Un calcul recopié (`(-3)+(-5)`, `2/7+3/7`) est refusé, sauf
  option `calcul: true`. `tolerance` est un **écart absolu** (réponse au dixième → `0.05`,
  au degré → `0.5`). `accepte` : autres valeurs justes (ex. résultat avec π ≈ 3,14).
- `'expression'` : équivalence algébrique par échantillonnage. Si la réponse attendue n'a
  pas de parenthèses, la saisie doit être **réduite et développée** (`forme: 'libre'` pour
  désactiver) : recopier `(x+3)(x+4)` ne suffit pas.
- `'factorisation'` (forme produit obligatoire), `'solutions'` (ensemble de nombres séparés
  par `;`), `'texte'`, `'fraction_irreductible'`, `'notation_scientifique'`, `'facteurs_premiers'`.
- QCM : les choix sont mélangés et dédoublonnés automatiquement (`ordre_fixe: true` pour
  garder l'ordre).

**Visuels** : un exercice (ou une question de quiz) peut renvoyer `visuel: (container) => {…}` ;
un bloc de cours peut être `{ type: 'figure', render(host) }`. Helpers dans `render.js` :
`plotFunction`, `mountJSXGraph`, `mountChart`, `mountBoxPlot`. Un exercice peut aussi
fournir `texteOral` (chaîne ou `(state) => string`) pour la lecture à voix haute.
