// =====================================================================
//  programme.js — Registre des niveaux, thèmes et chapitres (5ᵉ → 3ᵉ)
//
//  - Les chapitres sont classés par NIVEAU puis par THÈME, dans un ordre
//    logique de progression (l'ordre du tableau fait foi).
//  - `module: null` = chapitre prévu mais pas encore rédigé (« Bientôt »).
//  - Les identifiants ne changent jamais (ils servent de clé à la progression
//    sauvegardée) : c = 3ᵉ, r = 4ᵉ (anciens « rappels »), v = 5ᵉ (V romain).
//  - Programmes : 3ᵉ et 4ᵉ suivent le programme de cycle 4 actuel ; la 5ᵉ suit
//    le nouveau programme (BO n°10 du 5 mars 2026, en vigueur en 5ᵉ depuis
//    la rentrée 2026).
// =====================================================================

export const NIVEAUX = [
  { id: '5e', label: '5ᵉ', long: 'Cinquième' },
  { id: '4e', label: '4ᵉ', long: 'Quatrième' },
  { id: '3e', label: '3ᵉ', long: 'Troisième' },
];

export const THEMES = [
  { id: 'nombres_calculs', label: 'Nombres et calculs',             icone: '🔢' },
  { id: 'fonctions',       label: 'Proportionnalité et fonctions',  icone: '📈' },
  { id: 'geometrie',       label: 'Géométrie et grandeurs',         icone: '📐' },
  { id: 'donnees',         label: 'Données et probabilités',        icone: '📊' },
  { id: 'algo',            label: 'Algorithmique et programmation', icone: '💻' },
];

const ch = (niveau, id, titre, theme, icone, fichier) => ({
  id, niveau, titre, theme, icone, module: fichier ? `./chapters/${niveau}/${fichier}` : null,
});

export const CHAPTERS = [
  // ------------------------------------------------------------------ 5ᵉ
  // Nouveau programme 2026 — chapitres à rédiger (versions express + complète).
  ch('5e', 'v01', 'Priorités opératoires et enchaînements de calculs', 'nombres_calculs', '🧮', null),
  ch('5e', 'v02', 'Nombres relatifs : repérage, addition, soustraction', 'nombres_calculs', '➕', null),
  ch('5e', 'v03', 'Fractions : comparer, additionner, soustraire', 'nombres_calculs', '🍰', null),
  ch('5e', 'v04', 'Carrés et cubes', 'nombres_calculs', '²', null),
  ch('5e', 'v05', 'Calcul littéral : formules, substitution, équations simples', 'nombres_calculs', '✏️', null),
  ch('5e', 'v06', 'Proportionnalité et pourcentages', 'fonctions', '⚖️', null),
  ch('5e', 'v07', 'Dépendance entre deux grandeurs', 'fonctions', '📈', null),
  ch('5e', 'v08', 'Repérage sur une droite et dans le plan', 'geometrie', '📍', null),
  ch('5e', 'v09', 'Angles et parallélisme', 'geometrie', '📏', null),
  ch('5e', 'v10', 'Triangles', 'geometrie', '🔺', null),
  ch('5e', 'v11', 'Parallélogrammes', 'geometrie', '▱', null),
  ch('5e', 'v12', 'Symétrie centrale', 'geometrie', '🔄', null),
  ch('5e', 'v13', 'Solides : patrons et perspective', 'geometrie', '🧊', null),
  ch('5e', 'v14', 'Aires et volumes', 'geometrie', '📦', null),
  ch('5e', 'v15', 'Statistiques : effectifs, fréquences, moyenne', 'donnees', '📊', null),
  ch('5e', 'v16', 'Premières probabilités', 'donnees', '🎲', null),
  ch('5e', 'v17', 'Programmation par blocs', 'algo', '💻', null),

  // ------------------------------------------------------------------ 4ᵉ
  ch('4e', 'r02', 'Nombres relatifs', 'nombres_calculs', '➕', 'r02_nombres_relatifs.js'),
  ch('4e', 'r03', 'Opérations sur les fractions', 'nombres_calculs', '🍰', 'r03_fractions.js'),
  ch('4e', 'r08', 'Puissances', 'nombres_calculs', '²', 'r08_puissances.js'),
  ch('4e', 'r06', 'Calcul littéral', 'nombres_calculs', '✖️', 'r06_calcul_litteral.js'),
  ch('4e', 'r07', 'Équations', 'nombres_calculs', '⚖️', 'r07_equations.js'),
  ch('4e', 'r15', 'Divisibilité et nombres premiers', 'nombres_calculs', '🧮', null),
  ch('4e', 'r04', 'Proportionnalité', 'fonctions', '⚖️', 'r04_proportionnalite.js'),
  ch('4e', 'r16', 'Vitesses et grandeurs composées', 'fonctions', '🚲', null),
  ch('4e', 'r01', 'Théorème de Pythagore', 'geometrie', '📐', 'r01_pythagore.js'),
  ch('4e', 'r05', 'Cosinus dans le triangle rectangle', 'geometrie', '📐', 'r05_cosinus.js'),
  ch('4e', 'r13', 'Théorème de Thalès (triangles emboîtés)', 'geometrie', '📐', null),
  ch('4e', 'r11', 'Translation et symétries', 'geometrie', '🔄', 'r11_transformations.js'),
  ch('4e', 'r14', 'Rotation', 'geometrie', '🔃', null),
  ch('4e', 'r12', 'Aires, périmètres et volumes', 'geometrie', '📦', 'r12_aires_volumes.js'),
  ch('4e', 'r17', 'Pyramides et cônes', 'geometrie', '🔻', null),
  ch('4e', 'r09', 'Statistiques', 'donnees', '📊', 'r09_statistiques.js'),
  ch('4e', 'r10', 'Probabilités', 'donnees', '🎲', 'r10_probabilites.js'),
  ch('4e', 'r18', 'Algorithmique (Scratch)', 'algo', '💻', null),

  // ------------------------------------------------------------------ 3ᵉ
  ch('3e', 'c01', 'Calcul littéral', 'nombres_calculs', '🔢', 'c01_calcul_litteral.js'),
  ch('3e', 'c02', 'Identités remarquables', 'nombres_calculs', '🟰', 'c02_identites_remarquables.js'),
  ch('3e', 'c03', 'Équations du 1er degré', 'nombres_calculs', '⚖️', 'c03_equations_1er_degre.js'),
  ch('3e', 'c04', 'Équations-produit', 'nombres_calculs', '✖️', 'c04_equations_produit.js'),
  ch('3e', 'c05', 'Arithmétique', 'nombres_calculs', '🧮', 'c05_arithmetique.js'),
  ch('3e', 'c06', 'Puissances et racines', 'nombres_calculs', '√', 'c06_puissances_racines.js'),
  ch('3e', 'c07', 'Notion de fonction', 'fonctions', '📈', 'c07_notion_de_fonction.js'),
  ch('3e', 'c08', 'Fonctions linéaires & affines', 'fonctions', '📉', 'c08_fonctions_lineaires_affines.js'),
  ch('3e', 'c09', 'Sens de variation', 'fonctions', '〽️', 'c09_variations_lecture_graphique.js'),
  ch('3e', 'c10', 'Théorème de Thalès', 'geometrie', '📐', 'c10_thales.js'),
  ch('3e', 'c11', 'Trigonométrie', 'geometrie', '🔺', 'c11_trigonometrie.js'),
  ch('3e', 'c12', 'Transformations du plan', 'geometrie', '🔄', 'c12_transformations_plan.js'),
  ch('3e', 'c13', 'Homothétie', 'geometrie', '🔎', 'c13_homothetie.js'),
  ch('3e', 'c14', 'Géométrie dans l\'espace', 'geometrie', '🧊', 'c14_geometrie_espace.js'),
  ch('3e', 'c15', 'Statistiques', 'donnees', '📊', 'c15_statistiques.js'),
  ch('3e', 'c16', 'Probabilités', 'donnees', '🎲', 'c16_probabilites.js'),
  ch('3e', 'c17', 'Algorithmique', 'algo', '💻', 'c17_algorithmique.js'),
];

// Numérotation « Chapitre n » à l'intérieur de chaque niveau.
NIVEAUX.forEach((n) => CHAPTERS.filter((c) => c.niveau === n.id).forEach((c, i) => { c.num = i + 1; }));

export const chapterById = (id) => CHAPTERS.find((c) => c.id === id);
export const themeById = (id) => THEMES.find((t) => t.id === id);
export const niveauById = (id) => NIVEAUX.find((n) => n.id === id);
export const chaptersOf = (niveau, theme) => CHAPTERS.filter((c) => c.niveau === niveau && (!theme || c.theme === theme));
