# Brief projet — Plateforme interactive Maths 3ème

> Document de référence pour la génération du code dans une autre conversation.

---

## Contexte

Outil pédagogique pour une élève passant en 3ème, utilisé :
- **En cours particuliers** avec son tuteur, sur les 4 chapitres prioritaires marqués ⭐
- **En autonomie** pendant l'été et à la rentrée pour le reste du programme

Hébergé sur **GitHub Pages** (URL publique, accès en ligne, pas de hors-ligne requis).  
Programme couvert : **cycle 4 actuel** (applicable en 3ème jusqu'à la rentrée 2028).

---

## Choix techniques

**Stack : Vanilla JS, multi-fichiers, GitHub Pages**

- CDN autorisés : **KaTeX** (formules), **JSXGraph** (géométrie interactive), **Chart.js** (statistiques)
- Architecture multi-fichiers : moteur d'app séparé des données pédagogiques
- Chaque chapitre = un fichier JS de contenu indépendant → maintenable, extensible
- Déploiement : `git push` sur la branche `main`, GitHub Pages activé → lien stable

### Structure des fichiers

```
/
├── index.html                        ← shell SPA (navigation, page d'accueil)
├── css/
│   └── style.css                     ← design mobile-first, variables CSS par thème
├── js/
│   ├── app.js                        ← routeur, localStorage, progression, badges, XP
│   ├── engine.js                     ← moteur d'exercices (génération, correction, feedback)
│   ├── render.js                     ← rendu KaTeX, graphiques SVG, intégration JSXGraph
│   └── chapters/
│       ├── c01_calcul_litteral.js
│       ├── c02_identites_remarquables.js
│       ├── c03_equations_1er_degre.js
│       ├── c04_equations_produit.js
│       ├── c05_arithmetique.js
│       ├── c06_puissances_racines.js
│       ├── c07_notion_de_fonction.js
│       ├── c08_fonctions_lineaires_affines.js
│       ├── c09_variations_lecture_graphique.js
│       ├── c10_thales.js
│       ├── c11_trigonometrie.js
│       ├── c12_transformations_plan.js
│       ├── c13_homothetie.js
│       ├── c14_geometrie_espace.js
│       ├── c15_statistiques.js
│       ├── c16_probabilites.js
│       └── c17_algorithmique.js      ← section bonus
└── assets/
    └── (icônes SVG, badges)
```

---

## Architecture d'un fichier chapitre (schéma de données)

```js
export default {
  id: "c01",
  titre: "Calcul littéral",
  theme: "nombres_calculs",   // nombres_calculs | fonctions | geometrie | donnees | algo
  priorite: true,             // true pour les 4 chapitres ⭐ prioritaires été
  icone: "🔢",

  cours: [
    {
      type: "definition",     // definition | propriete | exemple
      titre: "Développer",
      contenu: "Développer une expression, c'est...",
      formule: "k(a+b) = ka + kb"
    },
    {
      type: "propriete",
      titre: "Double distributivité",
      contenu: "...",
      formule: "(a+b)(c+d) = ac + ad + bc + bd"
    },
    {
      type: "exemple",
      enonce: "Développer (2x+3)(x−1)",
      solution_etapes: [
        "Appliquer la double distributivité...",
        "..."
      ]
    }
  ],

  methode: [
    { etape: 1, titre: "Identifier les facteurs", explication: "..." },
    { etape: 2, titre: "Appliquer la distributivité", explication: "..." }
  ],

  exercices: [
    {
      id: "e01",
      niveau: 1,              // 1=découverte | 2=application | 3=défi
      type: "saisie",         // saisie | qcm | vrai_faux | ordonner_etapes
      generer: () => {
        // Tire a, b aléatoirement dans une plage adaptée au niveau
        // Retourne { enonce, reponse }
      },
      indices: [
        "Commence par identifier les deux facteurs...",
        "Rappel : (a+b)(c+d) = ac + ad + bc + bd",
        "La réponse est de la forme ax² + bx + c"
      ],
      correction_detaillee: "Étape 1 : ... Étape 2 : ..."
    }
  ],

  quiz_bilan: [
    // 5 questions courtes, valident le chapitre et débloquent le badge
  ]
}
```

**Points clés du moteur d'exercices :**
- Génération **paramétrique/aléatoire** : variété infinie sans rédiger des dizaines d'énoncés
- Validation **tolérante** sur les formats équivalents : `0.5 = 1/2 = 0,5`
- **Indices progressifs** : 3 niveaux, révélés à la demande
- **Correction détaillée** : révélable après réponse (bonne ou mauvaise)
- **Plages de paramètres** adaptées au niveau : entiers simples en niveau 1, négatifs/décimaux en niveau 3

---

## Programme complet — 17 chapitres

### ⭐ Séparation visuelle sur la page d'accueil

La page d'accueil affiche un **bandeau ou section distincte** intitulé  
**"⭐ Par où commencer — Chapitres prioritaires"** regroupant les 4 chapitres ci-dessous  
avec une mise en avant visuelle (couleur, icône étoile).  
**Tous les autres chapitres sont immédiatement accessibles** : pas de verrouillage, pas d'ordre imposé.

---

### Thème 1 — Nombres et calculs

| # | Chapitre | Priorité | Type d'exercices interactifs |
|---|---|:---:|---|
| 1 | Calcul littéral (développement, factorisation) | ⭐ | Génération aléatoire (a, b, c tirés au sort) ; ordonner les étapes |
| 2 | Identités remarquables `(a+b)²`, `(a−b)²`, `(a+b)(a−b)` | ⭐ | Reconnaître + appliquer ; QCM sur la forme ; correction détaillée |
| 3 | Équations du 1er degré | | Résolution guidée étape par étape |
| 4 | Équations-produit (`A × B = 0`) | | Factorisation → résolution ; glisser-déposer les étapes |
| 5 | Arithmétique (nombres premiers, PGCD, fractions irréductibles) | | Tests de primalité ; décomposition guidée |
| 6 | Puissances et racines carrées (notation scientifique) | | Calculs avec exposants ; écrire en notation scientifique |

### Thème 2 — Fonctions

| # | Chapitre | Priorité | Type d'exercices interactifs |
|---|---|:---:|---|
| 7 | Notion de fonction (image, antécédent, tableau, graphe) | ⭐ | Lecture interactive sur graphique SVG cliquable |
| 8 | Fonctions linéaires et affines (`y = ax + b`) | ⭐ | Traceur interactif ; associer expression ↔ droite ; calculer f(x) |
| 9 | Sens de variation, lecture graphique | | Compléter un tableau de valeurs ; identifier min/max sur graphe |

### Thème 3 — Géométrie

| # | Chapitre | Priorité | Type d'exercices interactifs |
|---|---|:---:|---|
| 10 | Théorème de Thalès et réciproque | ⭐ | Figure JSXGraph avec valeurs modifiables ; calculer un côté inconnu |
| 11 | Trigonométrie (cos, sin, tan dans le triangle rectangle) | ⭐ | Figure dynamique ; calculer côté ou angle ; identifier le bon rapport |
| 12 | Transformations du plan (translation, rotation, symétries) | | Appliquer sur figure SVG ; retrouver l'image d'un point |
| 13 | Homothétie et effets sur aires (×k²) et volumes (×k³) | | Calculer aire/volume après agrandissement ou réduction |
| 14 | Géométrie dans l'espace (pyramide, cône, sphère, sections, volumes) | | Calculer des volumes ; identifier des sections planes |

### Thème 4 — Données et probabilités

| # | Chapitre | Type d'exercices interactifs |
|---|---|---|
| 15 | Statistiques (moyenne, médiane, quartiles, diagrammes) | Calculer sur jeu de données ; lecture de box-plot (Chart.js) |
| 16 | Probabilités (expériences aléatoires, calcul de probabilités) | Simulateur de tirage animé (dé, urne, pièce) ; calcul de probabilités |

### Thème 5 — Algorithmique *(section bonus)*

| # | Chapitre | Type d'exercices interactifs |
|---|---|---|
| 17 | Algorithmes (variables, boucles, conditions) | Lire/compléter un pseudo-code ; tracer l'exécution pas à pas |

---

## Gabarit uniforme d'un chapitre (5 étapes)

Chaque chapitre suit **strictement** ce gabarit, dans cet ordre :

1. **Intro "À quoi ça sert"**  
   2-3 phrases. Ancrage concret, exemple du quotidien ou lien avec d'autres matières.

2. **Cours essentiel**  
   Définitions + propriétés clés + 1-2 exemples résolus. Rendu propre via KaTeX. Court et ciblé.

3. **Méthode pas-à-pas**  
   Le "comment on fait" sur un exercice type. Étapes numérotées, révélables progressivement au clic.

4. **Exercices interactifs — 3 niveaux**  
   - Niveau 1 *Découverte* : paramètres simples, entiers positifs
   - Niveau 2 *Application* : paramètres variés, peut inclure négatifs
   - Niveau 3 *Défi* : situation complexe, étapes multiples  
   Pour chaque exercice : génération aléatoire, indices progressifs (3 niveaux), correction détaillée révélable, bouton "Nouvel exercice".

5. **Quiz de bilan**  
   5 questions rapides (QCM ou saisie courte). Valide le chapitre → débloque le badge.

---

## Fonctionnalités transversales

### Navigation et organisation

- **Page d'accueil** : carte de tous les chapitres regroupés par thème
- **Section ⭐ prioritaires** bien visible, chapitres mis en avant mais rien de verrouillé
- Barre de progression globale + par thème visible depuis l'accueil
- Bouton **"Reprendre"** ramenant au dernier chapitre ouvert

### Progression et motivation

- Avancement stocké en **localStorage** (persiste entre les sessions)
- **Badge** débloqué à la complétion du quiz bilan de chaque chapitre
- **Score XP** cumulé, barre de niveau (pas d'ordre imposé)
- Messages d'encouragement contextuels à l'erreur (ton positif, pas punitif)
- Compteur de tentatives et score par exercice

### Outils visuels intégrés

- **Traceur de fonctions SVG** interactif : cliquer sur la courbe pour lire image/antécédent (chapitre 7, 8, 9)
- **Figures géométriques dynamiques** via JSXGraph : points déplaçables, valeurs recalculées en temps réel (chapitres 10, 11)
- **Diagrammes statistiques** via Chart.js (chapitre 15)
- **Simulateur de tirage** animé (chapitre 16)

---

## Design et UX

- **Mobile-first** : gros boutons tactiles, interface utilisable sur téléphone
- Palette sobre et douce, lisibilité maximale, couleur d'accent différente par thème
- Formules mathématiques rendues via **KaTeX** (CDN, rapide et léger)
- Feedback visuel immédiat : ✓ vert avec animation, rouge doux avec indication de l'erreur
- Ton **encourageant**, accessible, jamais condescendant
- Police lisible, taille confortable, contrastes accessibles

---

## Déploiement GitHub Pages

- Repo public, branche `main` = source GitHub Pages
- **Pas de build step** (vanilla JS, zéro bundler) → déploiement immédiat
- URL finale : `https://[username].github.io/[repo-name]`
- Ajout de chapitres ou corrections : `git push` suffit

---

## Stratégie de génération (ordre recommandé)

Vu le volume (17 chapitres), générer en plusieurs passes dans des conversations séparées :

### Passe 1 — Shell et moteur complet

Génère : `index.html` + `style.css` + `app.js` + `engine.js` + `render.js`  
+ un chapitre exemple fonctionnel pour valider le moteur : `c01_calcul_litteral.js`

### Passe 2 — Chapitres ⭐ prioritaires

Génère les 4 chapitres prioritaires :
- `c01_calcul_litteral.js` (si non fait en passe 1) + `c02_identites_remarquables.js`
- `c07_notion_de_fonction.js` + `c08_fonctions_lineaires_affines.js`
- `c10_thales.js` + `c11_trigonometrie.js`

### Passe 3 — Thème Nombres (compléter)

`c03_equations_1er_degre.js`, `c04_equations_produit.js`, `c05_arithmetique.js`, `c06_puissances_racines.js`

### Passe 4 — Géométrie

`c09_variations_lecture_graphique.js`, `c12_transformations_plan.js`, `c13_homothetie.js`, `c14_geometrie_espace.js`

### Passe 5 — Données + Algo

`c15_statistiques.js`, `c16_probabilites.js`, `c17_algorithmique.js`

---

## Prompt d'amorçage — Passe 1

Coller tel quel dans une nouvelle conversation :

---

> Construis le **shell complet d'une SPA pédagogique de maths 3ème** (programme français cycle 4 actuel) en **vanilla JS multi-fichiers**, hébergée sur GitHub Pages.
>
> **Fichiers à générer dans cette passe :**
> - `index.html` : shell SPA avec routeur, page d'accueil affichant tous les chapitres en 5 thèmes, section distincte "⭐ Chapitres prioritaires" (4 chapitres mis en avant, rien de verrouillé), barre de progression globale, bouton Reprendre
> - `css/style.css` : design mobile-first, variables CSS par thème, palette douce, gros boutons tactiles, rendu KaTeX propre
> - `js/app.js` : routeur SPA, gestion localStorage (progression par chapitre, XP, badges, dernier chapitre ouvert)
> - `js/engine.js` : moteur d'exercices — génération paramétrique aléatoire, validation multi-format (0.5 = 1/2 = 0,5), indices progressifs 3 niveaux, correction détaillée révélable, score, compteur de tentatives
> - `js/render.js` : rendu KaTeX, traceur de fonctions SVG interactif (lecture image/antécédent au clic), intégration JSXGraph pour figures géométriques dynamiques
> - `js/chapters/c01_calcul_litteral.js` : chapitre exemple complet avec cours (définitions + propriétés + exemples résolus), méthode pas-à-pas, 6 exercices répartis sur 3 niveaux générés aléatoirement avec indices et correction, quiz bilan 5 questions
>
> **CDN autorisés :** KaTeX, JSXGraph, Chart.js  
> **Gabarit de chapitre :** intro "à quoi ça sert" → cours court KaTeX → méthode pas-à-pas → exercices 3 niveaux (découverte/application/défi) avec génération aléatoire, indices, correction → quiz bilan  
> **Schéma de données du chapitre :** [coller le schéma JS de la section "Architecture d'un fichier chapitre" ci-dessus]

---

*Brief généré le 13 juin 2026.*
