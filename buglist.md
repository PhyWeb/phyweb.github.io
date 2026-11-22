Oui, ton architecture est globalement propre et bien découpée, mais l’audit complet du code fait ressortir **plusieurs bugs concrets et erreurs de logique métier** — certains pouvant bloquer l’utilisateur ou fausser silencieusement des résultats physiques.

Voici la liste classée par impact, avec les scénarios de reproduction et les pistes de correction.

---

### 1. Bugs critiques (résultats faux, blocages ou plantages)


#### E. Tableaux creux (`sparse arrays`) dans `Data.getTable()` et export CSV corrompu (`data.js`, `ioManager.js`)
* **Problème :** Dans `Data.getTable()`, la longueur max `size` est calculée mais **jamais utilisée**. `curve.forEach(...)` saute les trous des tableaux creux (ex. si on saisit une valeur en ligne 5 en laissant les lignes 0–4 vides dans cette colonne) et laisse des lignes de longueurs différentes dans `table`.
* **Conséquence :** `generateCSV()` produit un CSV avec un nombre incohérent de colonnes par ligne, voire plante (`row.map` sur un trou `undefined`).
* **Correction :** Construire `table` avec une double boucle indexée `for (let j = 0; j < size; j++)` initialisant chaque cellule à `curve[j] ?? null`.

---

### 2. Erreurs de logique métier majeures

#### B. `updateFormulasReferences()` corrompt les unités et commentaires lors d’un renommage (`ioManager.js`, `app.js`)
* **Scénario :** Tu as une grandeur `s` (distance) et une formule `v_m/s = diff(s, t) # vitesse en m/s`. Tu renommes la courbe `s` en `d`.
* **Problème :** La regex `(?<![a-zA-Z0-9À-ÿ_])s(?![a-zA-Z0-9À-ÿ_])` s’applique sur tout le texte brut : elle transforme `v_m/s` en **`v_m/d`** et modifie le commentaire !
* **Problème inverse :** Si un fichier `.pw` ou `.rw3` renomme une variable calculée (ex. `v-1` -> `v1`), une ligne `v-1_m/s = ...` ne sera pas remplacée à gauche du `=` car `_` est interdit dans le lookahead `(?![a-zA-Z0-9À-ÿ_])`.

#### C. Suppression d’un modèle pendant le mode « Ajuster les bornes » (`edit-bounds`) (`ui.js`, `grapher.js`)
* Si le mode `edit-bounds` est actif sur un modèle et que l’utilisateur clique sur la corbeille de ce modèle (ou supprime une courbe dont il dépend), les poignées et la bande grise restent affichées sur le graphe avec `grapher.editingModel` pointant sur le modèle supprimé. Déplacer une poignée relance `fit()` sur le modèle détruit et plante ensuite dans `updateModelPanel()`.
* De plus, dans `grapher.js` (`handleMouseUp` en mode `edit-bounds`) :
  * Si on rapproche trop les poignées (< 2 points), `fit()` échoue **sans toast** et **sans restaurer** les anciennes bornes valides.
  * Quand le recalcul réussit, `uiManager.updateCalculationUI()` n’est pas appelé : la barre latérale *Calculs* affiche encore les anciennes valeurs des paramètres.
  * Zoomer ou redimensionner la fenêtre pendant `edit-bounds` laisse les poignées à leurs anciens pixels (`drawModelBounds` n’est pas rafraîchi sur `redraw`).

#### D. Sauvegarder en `.csv` ou `.rw3` efface l’alerte de données non sauvegardées (`ui.js`)
* Dans `initSaveModal()`, `#download-file-button` appelle systématiquement `this.markAsSaved()`, même pour un export `.csv` (qui prévient pourtant que *« Les courbes calculées, modèles et annotations seront perdus »*) ou `.rw3` (qui perd les modèles et annotations). Si l’utilisateur quitte ensuite la page, aucun avertissement ne lui signale qu’il perd son travail.
* **Correction :** N’appeler `this.markAsSaved()` que si `selectedFormat === 'pw'` (ou s’il n’y a rien de perdu par le format choisi).

#### E. Dérivée seconde (`diff(diff(x, t), t)`) avec `derivateEdges = false` (`calculation.js`)
* Dans `numericalDerivative()`, `isEdgePoint(i)` vérifie uniquement la proximité aux indices `0` et `n - 1` du tableau, sans tenir compte des `null` en début/fin de `yArr`.
* Sur une dérivée seconde (où `v = diff(x, t)` commence et finit déjà par des `null`), les vrais bords du domaine valide de `v` ne sont pas reconnus comme bords : le code saute les stencils 5 et 3 points et retombe silencieusement sur une différence finie à 2 points, contredisant le réglage `derivateEdges = false`.

#### F. `Model.getHighResData()` envoie `NaN` et `±Infinity` à Highcharts (`data.js`)
* Pour les modèles `ln` et `log`, comme `includeOriginOnAutoZoom` est `true` par défaut, `xAxis.min` vaut très souvent `0`. `Math.log(0)` produit `-Infinity` (et `NaN` si `minX < 0`). Même problème pour `power` (`x <= 0`), ou `exp1`/`exp2`/`damped*` si le paramètre de temps vaut `0`.
* **Correction :** Remplacer tout `y` non fini (`!Number.isFinite(y)`) par `null` dans `getHighResData()`.

#### G. Outils du grapheur (`grapher.js`) : plusieurs comportements incohérents
1. **Mode `tangent` / `tangent-method` :** Si la souris bouge de ≥ 5 px pendant le clic, `handleMouseMove` tombe dans le `else` du mode libre et dessine un segment temporaire rouge avec lignes Δx/Δy bleues.
2. **Clic lent ignoré :** La condition `if (distance < 5 && duration < 300)` dans `handleMouseUp` ignore complètement un clic immobile qui dure plus de 300 ms (fréquent sur trackpad).
3. **Fallback involontaire en mode libre :** En mode `data` ou `model`, si `snappedDataPoint` / `snappedModelPoint` est `null`, `handleMouseUp` tombe dans le `else` du mode libre et pose une annotation libre. En mode libre, cliquer dans les marges (hors `plotBox`) crée quand même une annotation invisible et affiche le bouton « Effacer les annotations ».
4. **Annotations non liées à l’axe X et non clippées :** Changer l’abscisse X laisse les anciennes annotations tracées aux anciennes coordonnées sur le nouveau repère. De plus, les segments, tangentes et méthodes des tangentes ne sont pas clippés à la zone de tracé (`plotBox`) : lors d’un zoom ou d’une tangente raide (saut de pH), la droite traverse les axes et la légende.

#### H. Insertion d’une constante physique en cours de saisie (`ui.js`)
* Dans `initCalculationControls()`, cliquer sur une constante (`g`, `c`, `NA`…) appelle immédiatement `this.app.applyCalculation(this.editor.getValue())` même si l’utilisateur était au milieu d’une ligne incomplète (ex. `v = sqrt(2 * `). Cela affiche une erreur rouge et **vide la courbe calculée en cours** (`existingCurve.length = 0`).
* De plus, la détection d’une constante déjà déclarée compare `Number(cleanRhs)` sans remplacer la virgule par un point : si l’utilisateur avait écrit `g = 9,81`, l’appli refuse en affirmant que `g` a une autre valeur.

---

### 3. Bugs mineurs, désynchronisations d’UI et nettoyage

2. **Effacement de tous les calculs (`app.js`) :** Quand `applyCalculation("")` supprime les courbes calculées, il filtre `this.data.curves` directement sans passer par `this.data.deleteCurve()`, et n’appelle ni `updateSortUI()` ni `updateXAxisSelector()`.
3. **Suppression d’une courbe brute (`app.js`) :** `deleteCurve()` n’appelle pas `this.uiManager.setCalculationsStale(true)`. Une grandeur calculée qui dépendait de la courbe supprimée reste affichée sans proposer de recalculer.
4. **Croissance infinie de lignes `null` dans Handsontable (`spreadsheet.js`) :** Appuyer sur `Suppr` sur la ligne vide du bas (`minSpareRows`) appelle `data.setValue(col, actualRow, null)`, ce qui augmente `curve.length` et recrée une nouvelle ligne vide. De plus, `handleAfterChange` ne filtre pas `oldVal === newVal`.
5. **Redimensionnement (`main.js`, `ui.js`) :** `resize()` met Handsontable à `height: 0` si l’onglet Tableur est caché ; à l’inverse, cliquer sur `#grapheur-tab` n’appelle pas `this.grapher.chart.reflow()` (le graphique ne s’adapte pas si la fenêtre a été redimensionnée depuis un autre onglet).
6. **Bouton « Exporter / Imprimer » sur l’écran d’accueil (`ui.js`) :** Contrairement à « Sauvegarder », aucun test ne vérifie si une session est ouverte : il révèle le panneau Grapheur sous `#empty-state-container`.
7. **Import CSV & RW3 (`ioManager.js`) :**
   * Dans `loadData()`, `parseFloat("1 200.5")` renvoie `1` au lieu de `1200.5` (les espaces ne sont pas retirés contrairement à `parseCellValue`).
   * Un CSV à 1 seule colonne ne contient pas de `\t`, donc `splitFlexible` découpe sur les doubles espaces.
   * Dans `loadRW3File()`, `setXCurve(chosenX, false)` est appelé après `loadData()` sans `resetZoom()`, donc si l’axe X du RW3 n’est pas la 1ère colonne, les bornes X peuvent rester sur celles de la 1ère colonne. De plus, `loadData()` exécute `applyCalculation()` *avant* que `this.app.pendingRW3` ne soit défini.
   * `generateRW3()` utilise `leftPart.lastIndexOf('_')` alors que `app.js` utilise `leftPart.split('_')[0]` (incohérent si une unité contient `_`).
8. **Modales (`ui.js`, HTML) :**
   * `openEditModelModal` : `pointsDansIntervalle` ne vérifie que `model.x` sans vérifier `model.y[i]`.
   * `openAddModelModal` : filtre les séries modèles par `!series.name.startsWith('Modèle')` au lieu de `!series.options.id?.startsWith('model-')`.
   * `Data.addModel` : accède à `y.color` sans vérifier que `x` et `y` existent (rendant le `else` de `app.addModel` inatteignable).
   * Plusieurs modales sont ouvertes via `.classList.add('is-active')` au lieu de `this.common.modalManager.openModal(...)`, ce qui court-circuite le hook `onModalOpen` (désélection Handsontable).
   * `#download-modal` et `#init-session-modal` cumulent `data-modal-confirm` et un listener `keydown` sur `Enter` sans `stopPropagation()` : si ton `ModalManager` dans `common.js` gère aussi `Enter`, la confirmation se déclenche deux fois.
   * Dans le HTML : attribut `style` dupliqué sur la `.box` de `#empty-state-container` (`width: 600px` est ignoré par le navigateur), une balise `</div>` fermante en trop après `#calculs-panel`, et attribut `step="any"` manquant sur `#parameter-value-input`, `#model-edit-borne-debut-input`, `#model-edit-borne-fin-input` et `#compute-model-x-input`.

Si tu veux, je peux te proposer les correctifs précis fichier par fichier en commençant par les plus critiques (`symbolValidator.js` + `data.js`, `calculation.js`, et l’export `×10ⁿ` dans `ui.js`).