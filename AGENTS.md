# Instructions Agent — Projet PhyWeb

Ce fichier définit l'architecture du projet **PhyWeb** ainsi que les règles strictes d'utilisation des outils sous Windows / VS Code.

---

## 1. Règles d'utilisation des outils (CRITIQUE)

### Exploration et édition de fichiers
- **Outils natifs prioritaires :** Utilise **systématiquement** tes outils intégrés (`read_file`, `grep_search`, `list_dir`, `find_by_name`, `edit_file` / `write_file`) pour lire, chercher et modifier le code.
- **Pas de PowerShell pour lire le code :** N'utilise **JAMAIS** de commandes PowerShell ou Unix (`Get-Content`, `cat`, `head`, `tail`, `Get-ChildItem`, `ls`, `dir`, `Select-String`, `rg`) dans le terminal pour inspecter des fichiers ou explorer l'arborescence.

### Usage du terminal (PowerShell)
- Réserve l'exécution de commandes dans le terminal aux cas suivants :
  1. **Exécution des tests unitaires** (`node --test ...` ou `npm test`).
  2. **Commandes Git en lecture seule** (`git status`, `git diff`, `git log`, `git grep`, `git blame`, `git ls-files`).
  3. **Vérifications ponctuelles d'environnement** (`node -v`).
- **Actions destructrices interdites sans accord explicite :** Ne lance jamais `git checkout`, `git reset`, `git clean` ou `Remove-Item` sur des fichiers du dépôt sans l'avoir demandé à l'utilisateur au préalable.
- **Évite les `node -e "..."` complexes en ligne de commande :** Sous Windows PowerShell, l'échappement des guillemets et des retours à la ligne dans `node -e` provoque régulièrement des erreurs et des demandes de permission bloquantes. Si un test de comportement est nécessaire, écris ou complète un fichier de test propre dans `tests/`.

---

## 2. Architecture du projet PhyWeb

PhyWeb est une suite d'applications scientifiques et pédagogiques (Web & Desktop via **Electron**). Le code utilise des **ES Modules** natifs (`import` / `export`).

### Structure des répertoires principaux
- **`grapher/`** : Tableur-grapheur scientifique et modélisation mathématique.
  - `grapher/main.js` : Point d'entrée du grapheur.
  - `grapher/modules/` : Logique modulaire (`data.js` pour les séries/modèles/courbes, `ui.js`, `ioManager.js`, `fitterWorker.js`, `symbolValidator.js`, etc.).
  - Utilise notamment **Highcharts** pour le rendu graphique.
- **`tracker/`** : Pointage vidéo image par image et étude cinématique.
  - `tracker/main.js` : Point d'entrée du tracker vidéo.
  - `tracker/modules/` : Gestion du lecteur et du pointage (`player.js`, `measurement.js`, extraction vidéo via WebCodecs / `VideoDecoder`, gestion HiDPI/zoom).
- **`audio/`** : Acquisition et analyse de signaux sonores (temporel, spectre de Fourier/FFT, rééchantillonnage).
  - `audio/main.js` et `audio/index.html`.
- **`applets/`** : Mini-applications et simulations dédiées par thème (ex. `applets/optique/index.html`).
- **`common/`** : Code et bibliothèques partagés entre les applications.
  - `common/common.js` (configuration partagée, intégration `electronSetup`, gestion des onglets `tabmanager`, validation des entrées).
  - Dépendances embarquées pour le démultiplexage vidéo : `common/mp4box/`, `common/web-demuxer/`.
- **`tests/`** : Suite de tests unitaires et d'intégration en `.mjs`.
  - `tests/helpers/setup.mjs` : Initialisation de l'environnement de test et des mocks DOM/globaux.
  - Sous-dossiers par module : `tests/grapher/`, `tests/tracker/`, `tests/audio/`, `tests/common/`.
- **Racine & Electron** :
  - `index.html`, `preload.js`, `package.json` pour l'enveloppe Electron et le portail d'accueil.

---

## 3. Exécution des tests et validation

Le projet utilise le **runner de test natif de Node.js** (`node --test`).

- **Lancer un fichier de test spécifique (à privilégier après une modification) :**
  ```powershell
  node --test tests/tracker/measurement.test.mjs
  ```
- **Lancer tous les tests d'un module :**
  ```powershell
  node --test tests/grapher/*.test.mjs
  node --test tests/tracker/*.test.mjs
  node --test tests/audio/*.test.mjs
  node --test tests/common/*.test.mjs
  ```
- **Lancer l'intégralité de la suite de tests :**
  ```powershell
  node --test
  ```

### Workflow attendu lors d'une modification
1. **Lecture ciblée :** Inspecte les fichiers concernés avec `read_file` et `grep_search`.
2. **Modification minimale :** Préserve le style du code existant (vanilla JS moderne, ES Modules, pas de dépendances externes inutiles).
3. **Vérification systématique :** Exécute le fichier `.test.mjs` correspondant au module touché via `node --test` pour garantir l'absence de régression.