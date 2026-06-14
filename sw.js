// =====================================================================
//  sw.js — Service Worker (hors-ligne + installation PWA)
//  Stratégie : "stale-while-revalidate" — on sert depuis le cache
//  immédiatement (rapide + hors-ligne), et on met à jour en arrière-plan.
//  Bumper VERSION force le rafraîchissement de tous les fichiers.
// =====================================================================

const VERSION = 'v6';
const CACHE = 'maths3eme-' + VERSION;

// Coquille de l'application (chemins relatifs à l'emplacement du SW = racine)
const CORE = [
  './', './index.html', './manifest.json',
  './css/style.css',
  './js/app.js', './js/engine.js', './js/render.js', './js/aide_memoire.js',
  './js/chapters/c01_calcul_litteral.js',
  './js/chapters/c02_identites_remarquables.js',
  './js/chapters/c03_equations_1er_degre.js',
  './js/chapters/c04_equations_produit.js',
  './js/chapters/c05_arithmetique.js',
  './js/chapters/c06_puissances_racines.js',
  './js/chapters/c07_notion_de_fonction.js',
  './js/chapters/c08_fonctions_lineaires_affines.js',
  './js/chapters/c09_variations_lecture_graphique.js',
  './js/chapters/c10_thales.js',
  './js/chapters/c11_trigonometrie.js',
  './js/chapters/c12_transformations_plan.js',
  './js/chapters/c13_homothetie.js',
  './js/chapters/c14_geometrie_espace.js',
  './js/chapters/c15_statistiques.js',
  './js/chapters/c16_probabilites.js',
  './js/chapters/c17_algorithmique.js',
  './js/chapters/r01_pythagore.js',
  './js/chapters/r02_nombres_relatifs.js',
  './js/chapters/r03_fractions.js',
  './js/chapters/r04_proportionnalite.js',
  './js/chapters/r05_cosinus.js',
  './icons/icon-192.png', './icons/icon-512.png',
];

// Bibliothèques CDN (mises en cache au mieux, pour le hors-ligne)
const CDN = [
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
  'https://cdn.jsdelivr.net/npm/jsxgraph@1.10.1/distrib/jsxgraph.css',
  'https://cdn.jsdelivr.net/npm/jsxgraph@1.10.1/distrib/jsxgraphcore.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);                              // indispensable
    await Promise.allSettled(CDN.map((u) => cache.add(u))); // au mieux
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req).then((res) => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
      }
      return res;
    }).catch(() => null);
    return cached || (await network) || (await caches.match('./index.html'));
  })());
});
