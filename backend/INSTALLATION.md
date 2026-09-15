# Installer la sauvegarde en ligne (Google Sheets)

À faire **une seule fois**, avec ton compte Google (≈ 10 minutes). Ensuite :

- tu crées les comptes de tes élèves (pseudo + code à 4 chiffres) dans l'**Espace tuteur** du site ;
- chaque élève se connecte une fois par appareil : sa progression est sauvegardée automatiquement ;
- tu suis tout le monde dans l'Espace tuteur du site **et** directement dans le Google Sheet.

---

## 1. Créer le Google Sheet

1. Va sur <https://sheets.new> (connecté·e à ton compte Google).
2. Renomme le fichier, par exemple **« Maths Collège — élèves »**.

## 2. Coller le script

1. Dans le Google Sheet : menu **Extensions → Apps Script**.
2. Un éditeur s'ouvre avec un fichier `Code.gs` contenant `function myFunction() {…}`.
   **Efface tout** son contenu.
3. Colle à la place **tout le contenu** du fichier [`backend/Code.gs`](Code.gs) de ce dépôt.
4. Clique sur 💾 **Enregistrer** (ou Ctrl + S). Tu peux renommer le projet « Maths Collège ».

## 3. Lancer l'installation

1. En haut de l'éditeur, dans la liste des fonctions, choisis **`installer`**, puis clique **▶ Exécuter**.
2. Google demande une autorisation (c'est normal : c'est ton propre script qui accède à ton propre fichier) :
   - **Examiner les autorisations** → choisis ton compte ;
   - si l'écran « Google n'a pas validé cette application » apparaît : **Paramètres avancés** →
     **Accéder à Maths Collège (non sécurisé)** ;
   - **Autoriser**.
3. Le journal d'exécution affiche « Exécution terminée ». Retourne dans le Google Sheet :
   trois onglets sont apparus : **Élèves**, **Sauvegardes**, **Config**.

## 4. Choisir le mot de passe de l'Espace tuteur

Dans l'onglet **Config**, case **B1** : remplace `a-changer` par ton mot de passe
(**8 caractères minimum**). Il sert uniquement à ouvrir l'Espace tuteur du site.

## 5. Publier le script (« application web »)

1. Dans l'éditeur Apps Script : bouton bleu **Déployer → Nouveau déploiement**.
2. Clique sur la roue ⚙️ à côté de « Sélectionner le type » → **Application Web**.
3. Remplis :
   - **Description** : `Maths Collège`
   - **Exécuter en tant que** : **Moi**
   - **Qui peut accéder** : **Tout le monde**
     (obligatoire pour que tes élèves, qui n'ont pas de compte Google, puissent sauvegarder ;
     chaque élève ne peut lire que **sa** progression, grâce à son pseudo et son code)
4. **Déployer**, puis copie l'**URL de l'application Web** (elle se termine par `/exec`).

Vérification : colle cette URL dans ton navigateur. Tu dois voir
`{"ok":true,"service":"maths-college","version":1}`.

## 6. Relier le site au script

Dans le fichier [`js/config.js`](../js/config.js), colle l'URL :

```js
export const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfy…/exec';
```

puis publie le site (`git push`). (Tu peux aussi simplement envoyer l'URL à Claude.)

## 7. Créer les comptes des élèves

1. Ouvre le site, puis **📊 Tableau de bord → 👩‍🏫 Espace tuteur** (ou directement l'adresse du site suivie de `#/prof`).
2. Entre ton mot de passe tuteur.
3. **Ajouter un élève** : un pseudo (sans espace, pas le nom complet), un code à 4 chiffres (proposé
   au hasard), sa classe → **Créer le compte**.
4. Donne le pseudo et le code à l'élève. Sur la page d'accueil, il clique sur
   « J'ai un pseudo et un code », et c'est tout.

---

## Au quotidien

| Besoin | Où |
|---|---|
| Voir la progression de chacun | Espace tuteur (📈 Détails) ou onglet **Élèves** du Google Sheet |
| Code oublié | Espace tuteur → 🔑 Voir le code, ou 🎲 Nouveau code |
| Changer la classe d'un élève | Espace tuteur (liste déroulante) ou colonne **Classe** du Sheet (`5e`, `4e` ou `3e`) |
| Supprimer un élève | Dans le Google Sheet : supprime sa ligne dans **Élèves** et dans **Sauvegardes** |

Bon à savoir :

- **Ne modifie pas** l'onglet **Sauvegardes** à la main (il contient la progression complète, découpée).
- Après **5 codes faux**, le pseudo est bloqué 15 minutes (protection contre les essais au hasard).
- Changer le code d'un élève le déconnecte de ses appareils : il devra se reconnecter avec le nouveau code.
- Changer le mot de passe tuteur (Config!B1) déconnecte l'Espace tuteur : reconnecte-toi avec le nouveau.
- Hors ligne, le site continue de fonctionner : la progression est envoyée dès le retour d'Internet.
- Le Google Sheet reste **privé** dans ton Drive : ne le partage pas (il contient les codes).

## Mettre à jour le script plus tard

Si `backend/Code.gs` change : recolle le nouveau contenu dans l'éditeur, enregistre, puis
**Déployer → Gérer les déploiements → ✏️ (modifier) → Version : Nouvelle version → Déployer**.
L'URL reste la même : rien à changer dans le site.

## Pour le développement (sans Google)

```bash
node tools/test_backend.mjs     # tests automatiques du script et de la fusion
node tools/mock_sheets.mjs      # faux Google Sheets sur http://localhost:8125/exec
```

Puis, dans la console du navigateur sur le site en local :
`localStorage.setItem('mc_api_dev', 'http://localhost:8125/exec')` (mot de passe tuteur : `tuteur-test`).
