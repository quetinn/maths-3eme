// =====================================================================
//  aide_memoire.js — Formulaire : toutes les formules clés, par thème.
//  Affiché sur la route #/formulaire (rendu KaTeX).
// =====================================================================

export default [
  {
    theme: 'nombres_calculs', titre: 'Nombres et calculs', icone: '🔢',
    fiches: [
      { titre: 'Développer / factoriser', formules: ['k(a+b) = ka + kb', '(a+b)(c+d) = ac+ad+bc+bd', 'ka + kb = k(a+b)'] },
      { titre: 'Identités remarquables', formules: ['(a+b)^2 = a^2 + 2ab + b^2', '(a-b)^2 = a^2 - 2ab + b^2', '(a+b)(a-b) = a^2 - b^2'] },
      { titre: 'Équations', formules: ['ax + b = 0 \\iff x = -\\dfrac{b}{a}', 'A \\times B = 0 \\iff A=0 \\text{ ou } B=0'] },
      { titre: 'Puissances', formules: ['a^m \\times a^n = a^{m+n}', '\\dfrac{a^m}{a^n} = a^{m-n}', '(a^m)^n = a^{mn}', 'a^0 = 1,\\quad a^{-n} = \\dfrac{1}{a^n}'] },
      { titre: 'Racines & notation scientifique', formules: ['\\sqrt{a}\\times\\sqrt{a} = a', '\\sqrt{a^2} = a\\ (a\\ge0)', 'a \\times 10^n \\ \\text{avec}\\ 1 \\le a < 10'] },
      { titre: 'Fractions & PGCD', formules: ['\\dfrac{a}{b} = \\dfrac{a\\div d}{b\\div d}\\ (d=\\text{PGCD})', '\\text{irréductible} \\iff \\text{PGCD}(a,b)=1'] },
    ],
  },
  {
    theme: 'fonctions', titre: 'Fonctions', icone: '📈',
    fiches: [
      { titre: 'Vocabulaire', formules: ['f(a) = b \\;:\\; b \\text{ image de } a,\\ a \\text{ antécédent de } b'] },
      { titre: 'Fonction linéaire', formules: ['f(x) = ax', '\\text{droite passant par l\'origine}', 'a = \\dfrac{f(x)}{x}'] },
      { titre: 'Fonction affine', formules: ['f(x) = ax + b', 'a = \\dfrac{y_B - y_A}{x_B - x_A}\\ \\text{(coef. directeur)}', 'b \\;:\\; \\text{ordonnée à l\'origine}'] },
    ],
  },
  {
    theme: 'geometrie', titre: 'Géométrie', icone: '📐',
    fiches: [
      { titre: 'Thalès', formules: ['\\dfrac{OM}{OA} = \\dfrac{ON}{OB} = \\dfrac{MN}{AB}'] },
      { titre: 'Trigonométrie (triangle rectangle)', formules: ['\\cos\\alpha = \\dfrac{\\text{adj}}{\\text{hyp}}', '\\sin\\alpha = \\dfrac{\\text{opp}}{\\text{hyp}}', '\\tan\\alpha = \\dfrac{\\text{opp}}{\\text{adj}}'] },
      { titre: 'Pythagore (rappel)', formules: ['BC^2 = AB^2 + AC^2 \\ \\text{(rectangle en } A)'] },
      { titre: 'Homothétie (rapport k)', formules: ['\\text{longueurs} \\times k', '\\text{aires} \\times k^2', '\\text{volumes} \\times k^3'] },
      { titre: 'Volumes', formules: ['V_{cube} = a^3', 'V_{pavé} = L\\ell h', 'V_{pyramide/cône} = \\dfrac13 B h', 'V_{cône} = \\dfrac13 \\pi r^2 h', 'V_{boule} = \\dfrac43 \\pi r^3'] },
    ],
  },
  {
    theme: 'donnees', titre: 'Données et probabilités', icone: '📊',
    fiches: [
      { titre: 'Statistiques', formules: ['\\bar{x} = \\dfrac{\\text{somme des valeurs}}{\\text{effectif total}}', '\\text{étendue} = \\max - \\min', '\\text{médiane : valeur centrale (série ordonnée)}'] },
      { titre: 'Probabilités', formules: ['P = \\dfrac{\\text{cas favorables}}{\\text{cas possibles}}', '0 \\le P \\le 1', 'P(\\overline{A}) = 1 - P(A)'] },
    ],
  },
];
