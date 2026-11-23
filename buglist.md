Oui, ton architecture est globalement propre et bien découpée, mais l’audit complet du code fait ressortir **plusieurs bugs concrets et erreurs de logique métier** — certains pouvant bloquer l’utilisateur ou fausser silencieusement des résultats physiques.

Voici la liste classée par impact, avec les scénarios de reproduction et les pistes de correction.

### 2. Erreurs de logique métier majeures

#### D. Sauvegarder en `.csv` ou `.rw3` efface l’alerte de données non sauvegardées (`ui.js`)
* Dans `initSaveModal()`, `#download-file-button` appelle systématiquement `this.markAsSaved()`, même pour un export `.csv` (qui prévient pourtant que *« Les courbes calculées, modèles et annotations seront perdus »*) ou `.rw3` (qui perd les modèles et annotations). Si l’utilisateur quitte ensuite la page, aucun avertissement ne lui signale qu’il perd son travail.
* **Correction :** N’appeler `this.markAsSaved()` que si `selectedFormat === 'pw'` (ou s’il n’y a rien de perdu par le format choisi).

#### F. `Model.getHighResData()` envoie `NaN` et `±Infinity` à Highcharts (`data.js`)
* Pour les modèles `ln` et `log`, comme `includeOriginOnAutoZoom` est `true` par défaut, `xAxis.min` vaut très souvent `0`. `Math.log(0)` produit `-Infinity` (et `NaN` si `minX < 0`). Même problème pour `power` (`x <= 0`), ou `exp1`/`exp2`/`damped*` si le paramètre de temps vaut `0`.
* **Correction :** Remplacer tout `y` non fini (`!Number.isFinite(y)`) par `null` dans `getHighResData()`.

#### G. Outils du grapheur (`grapher.js`) : plusieurs comportements incohérents
1. **Mode `tangent` / `tangent-method` :** Si la souris bouge de ≥ 5 px pendant le clic, `handleMouseMove` tombe dans le `else` du mode libre et dessine un segment temporaire rouge avec lignes Δx/Δy bleues.
2. **Clic lent ignoré :** La condition `if (distance < 5 && duration < 300)` dans `handleMouseUp` ignore complètement un clic immobile qui dure plus de 300 ms (fréquent sur trackpad).
3. **Fallback involontaire en mode libre :** En mode `data` ou `model`, si `snappedDataPoint` / `snappedModelPoint` est `null`, `handleMouseUp` tombe dans le `else` du mode libre et pose une annotation libre. En mode libre, cliquer dans les marges (hors `plotBox`) crée quand même une annotation invisible et affiche le bouton « Effacer les annotations ».
4. **Annotations non liées à l’axe X et non clippées :** Changer l’abscisse X laisse les anciennes annotations tracées aux anciennes coordonnées sur le nouveau repère. De plus, les segments, tangentes et méthodes des tangentes ne sont pas clippés à la zone de tracé (`plotBox`) : lors d’un zoom ou d’une tangente raide (saut de pH), la droite traverse les axes et la légende.

---

### 3. Bugs mineurs, désynchronisations d’UI et nettoyage

3. **Suppression d’une courbe brute (`app.js`) :** `deleteCurve()` n’appelle pas `this.uiManager.setCalculationsStale(true)`. Une grandeur calculée qui dépendait de la courbe supprimée reste affichée sans proposer de recalculer.
4. **Croissance infinie de lignes `null` dans Handsontable (`spreadsheet.js`) :** Appuyer sur `Suppr` sur la ligne vide du bas (`minSpareRows`) appelle `data.setValue(col, actualRow, null)`, ce qui augmente `curve.length` et recrée une nouvelle ligne vide. De plus, `handleAfterChange` ne filtre pas `oldVal === newVal`.
5. **Redimensionnement (`main.js`, `ui.js`) :** `resize()` met Handsontable à `height: 0` si l’onglet Tableur est caché ; à l’inverse, cliquer sur `#grapheur-tab` n’appelle pas `this.grapher.chart.reflow()` (le graphique ne s’adapte pas si la fenêtre a été redimensionnée depuis un autre onglet).
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