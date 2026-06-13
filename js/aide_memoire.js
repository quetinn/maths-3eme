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
      { titre: 'Opérations sur les fractions', formules: ['\\dfrac{a}{b}+\\dfrac{c}{b} = \\dfrac{a+c}{b}', '\\dfrac{a}{b}\\times\\dfrac{c}{d} = \\dfrac{a\\times c}{b\\times d}', '\\dfrac{a}{b}\\div\\dfrac{c}{d} = \\dfrac{a}{b}\\times\\dfrac{d}{c}'] },
      { titre: 'Priorités opératoires', formules: ['1)\\ \\text{parenthèses}', '2)\\ \\text{puissances}', '3)\\ \\times \\ \\text{et}\\ \\div', '4)\\ + \\ \\text{et}\\ -'] },
      { titre: 'Règles des signes', formules: ['(+)\\times(+) = +,\\quad (-)\\times(-) = +', '(+)\\times(-) = -,\\quad (-)\\times(+) = -', '-(a+b) = -a-b,\\quad -(a-b) = -a+b'] },
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
      { titre: 'Quartiles & box-plot', formules: ['Q_1 : \\text{au moins } 25\\% \\text{ des données} \\le Q_1', 'Q_3 : \\text{au moins } 75\\% \\text{ des données} \\le Q_3', '\\text{écart interquartile} = Q_3 - Q_1'] },
      { titre: 'Probabilités', formules: ['P = \\dfrac{\\text{cas favorables}}{\\text{cas possibles}}', '0 \\le P \\le 1', 'P(\\overline{A}) = 1 - P(A)'] },
    ],
  },
  {
    theme: 'algo', titre: 'Algorithmique', icone: '💻',
    fiches: [
      { titre: 'Variable et affectation', formules: ['x \\leftarrow 5 \\ \\ (x \\text{ reçoit } 5)', 'x \\leftarrow x + 1 \\ \\ (\\text{on augmente } x \\text{ de } 1)'] },
      { titre: 'Condition (si … sinon)', formules: ['\\text{si } test : \\ \\text{instructions A}', '\\text{sinon} : \\ \\text{instructions B}', '\\Rightarrow \\text{une seule branche s\'exécute}'] },
      { titre: 'Boucle « pour »', formules: ['\\text{pour } i \\text{ de } 1 \\text{ à } n : \\ \\dots', '\\Rightarrow \\text{le bloc est répété } n \\text{ fois}'] },
      { titre: 'Boucle « tant que »', formules: ['\\text{tant que } test : \\ \\dots', '\\Rightarrow \\text{répété tant que } test \\text{ est vrai}'] },
    ],
  },
];
