import IOManager, { updateFormulasReferences } from './ioManager.js';
import { showToast } from '../../common/common.js';
import SymbolValidator from './symbolValidator.js'; 

const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
-------------------------------------------------APP--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class App {
  constructor(data, spreadsheet, grapher, calculation, editor, uiManager) {
    this.data = data;
    this.spreadsheet = spreadsheet;
    spreadsheet.build(uiManager);
    this.grapher = grapher;
    this.calculation = calculation;
    this.editor = editor;
    this.uiManager = uiManager;

    this.symbolValidator = new SymbolValidator(this.data);

    this.ioManager = new IOManager(this);
  }

  addCurve(title, unit, line, markers, type){
    let curve = this.spreadsheet.addCurve(title, unit, undefined, undefined, line, markers, type);

    if(this.data.curves.length === 1){
      this.grapher.setXCurve(title);
    }

    if(this.data.curves.length === 2){
      this.grapher.updateChart([title]);
    }

    // Mise à jour du tableur et des sélecteurs de l'interface
    this.spreadsheet.update();
    this.uiManager.updateCalculationUI();
    this.uiManager.updateSortUI();
    this.uiManager.updateXAxisSelector();

    return curve;
  }

  deleteCurve(curveTitle){
    // Suppression des modèles dépendant de cette grandeur
    const modelsToDelete = this.data.models.filter(model => model.x.title === curveTitle || model.y.title === curveTitle);

    if (modelsToDelete.length > 0) {
      console.log(`Deleting ${modelsToDelete.length} model(s) dependent on curve "${curveTitle}".`);
      modelsToDelete.forEach(model => {
        this.deleteModel(model.id);

        // Suppression de la carte du modèle dans le panneau latéral
        const modelPanel = document.querySelector(`article[data-model-id="${model.id}"]`);
        if (modelPanel) {
          modelPanel.remove();
        }
      });
    }

    // Suppression de la grandeur et rafraîchissement des vues
    this.data.deleteCurve(curveTitle);
    this.grapher.deleteCurve(curveTitle);
    this.spreadsheet.update();
    this.uiManager.updateCalculationUI();
    this.uiManager.updateSortUI();
    this.uiManager.updateXAxisSelector();
  }


  renameCurve(oldTitle, newTitle, newUnit) {
    // Validation du symbole via le SymbolValidator
    const validationResult = this.symbolValidator.validate(newTitle, { ignoreList: [oldTitle] });
    if (!validationResult.isValid) {
      showToast(validationResult.message, "is-danger");
      return;
    }

    const isXCurve = this.grapher.currentXCurve === oldTitle;

    // Mise à jour des données
    const curve = this.data.getCurveByTitle(oldTitle);
    if (curve) {
        curve.title = newTitle;
        curve.unit = newUnit;
    } else {
        console.error(`renameCurve: La courbe "${oldTitle}" n'a pas été trouvée.`);
        return;
    }

    // Mettre à jour les modèles qui utilisent cette courbe
    this.data.models.forEach(model => {
        if (model.x.title === oldTitle) model.x.title = newTitle;
        if (model.y.title === oldTitle) model.y.title = newTitle;
    });

    // Mettre à jour le nom de la série pour la légende
    const seriesToUpdate = this.grapher.chart.series.find(s => s.name === oldTitle);
    if (seriesToUpdate) {
        seriesToUpdate.update({
            name: newTitle,
            unit: newUnit // Assure que l'unité est aussi à jour pour les tooltips/légendes
        }, false); // 'false' pour ne pas redessiner tout de suite
    }

    // Mettre à jour l'abscisse si la courbe renommée était l'abscisse
    if (isXCurve) {
        // Cette méthode mettra à jour la propriété et appellera updateChart(), qui redessinera le graphique, y compris le label de l'axe.
        this.grapher.setXCurve(newTitle);
    } else {
        // Si ce n'était pas l'axe X, on force quand même un redessin pour la légende.
        this.grapher.chart.redraw();
    }

    // Rafraîchir l'interface utilisateur
    this.spreadsheet.update();
    this.grapher.updateChart();
    this.uiManager.updateSortUI();
    this.uiManager.updateXAxisSelector();
    this.uiManager.updateCalculationUI();
    this.data.models.forEach(model => this.uiManager.updateModelPanel(model));
    
    // Mise à jour automatique des références dans l'éditeur de calculs
    if (oldTitle !== newTitle && this.editor && typeof this.editor.getValue === 'function' && this.editor.getValue()) {
      const currentCalcText = this.editor.getValue();
      const updatedCalcText = updateFormulasReferences(currentCalcText, { [oldTitle]: newTitle });
      if (updatedCalcText !== currentCalcText) {
        if (typeof this.editor.setValue === 'function') {
          this.editor.setValue(updatedCalcText);
        }
        if (this.uiManager && typeof this.uiManager.updateCalculationUI === 'function') {
          this.uiManager.updateCalculationUI();
        }
        showToast(`Les formules utilisant "${oldTitle}" ont été mises à jour avec "${newTitle}".`, "is-info", 4000);
      }
    }
  }

  resetSession() {
    // Vider toutes les annotations (données + affichage)
    this.grapher.clearAllAnnotations();

    // Supprimer tous les modèles existants
    const allModelIds = this.data.models.map(m => m.id);
    allModelIds.forEach(modelId => this.deleteModel(modelId));

    // Vider le panneau des modèles dans l'interface et mettre à jour les boutons
    $('#model-list').innerHTML = '';
    this.uiManager.updateRecalculateButtonVisibility();
    this.uiManager.updateModelToolVisibility();

    // Réinitialisation des courbes, paramètres et affichages
    this.data.deleteAllCurves();
    this.data.parameters = {};
    this.uiManager.clearActiveTool();
    this.grapher.deleteAllCurves(); 
    this.editor.setValue('');
    this.calculation.clear();
    this.spreadsheet.clear();
    this.uiManager.updateCalculationUI();
    this.uiManager.updateSortUI();
    this.uiManager.updateXAxisSelector();

    // Réinitialisation de l'état de sauvegarde
    if (this.uiManager && typeof this.uiManager.resetSavedState === 'function') {
      this.uiManager.resetSavedState();
    }
    if (this.uiManager && typeof this.uiManager.setCalculationsStale === 'function') {
      this.uiManager.setCalculationsStale(false);
    }
  }

  deleteRow(startRow, amount) {
    if (typeof startRow === 'undefined' || typeof amount === 'undefined' || amount < 1 || startRow < 0) {
      return;
    }
    this.data.deleteRow(startRow, amount);
    this.spreadsheet.update();
    this.grapher.updateChart();
    if (this.uiManager && typeof this.uiManager.setCalculationsStale === 'function') {
      this.uiManager.setCalculationsStale(true);
    }
  }

  async addModel(x, y, type) {
    let model = await this.data.addModel(x, y, type);

    if (model) {
      this.grapher.addModelSeries(model);
      this.grapher.updateModelVisibility();
      this.grapher.chart.redraw();

      this.uiManager.updateCalculationUI();
      this.uiManager.updateRecalculateButtonVisibility();

      this.uiManager.updateModelToolVisibility();

      return model;
    } else {
      showToast("Pour créer un modèle, vous devez avoir au moins deux grandeurs dans votre tableur.", "is-danger");
    }
  }

  /**
   * Recalcule tous les modèles existants.
   */
  async recalculateAllModels() {
      if (this.data.models.length === 0) {
          return { successful: [], failed: [] }; 
      }

      const results = await Promise.allSettled(this.data.models.map(model => model.fit()));
      const successful = [];
      const failed = [];

      results.forEach((res, index) => {
        const model = this.data.models[index];
        if (res.status === 'fulfilled') {
          successful.push(model);
        } else {
          failed.push({ model, error: res.reason });
        }
      });

      return { successful, failed };
  }

  deleteModel(modelID) {
    const model = this.data.models.find(m => m.id === modelID);
    if (!model) return;

    // Supprime la série du graphique
    const series = this.grapher.chart.get(`model-${model.id}`);
    if (series) {
      series.remove();
    }

    // Supprime le modèle de l'objet de données
    this.data.deleteModel(modelID);

    // Met à jour l'UI
    this.uiManager.updateCalculationUI();
    this.uiManager.updateRecalculateButtonVisibility();
    this.uiManager.updateModelToolVisibility();
  }

  applyCalculation(text) {
    // Analyse syntaxique et validation des formules
    const formulasToEvaluate = [];
    const parsingWarnings = [];

    if (!text || text.trim() === "") {
      this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
      // Conservation des paramètres de modèles existants
      const parametersToKeep = {};
      for (const key in this.data.parameters) {
        if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
          const param = this.data.parameters[key];
          if (param && param.type === 'model') {
              parametersToKeep[key] = param;
          }
        }
      }
      this.data.parameters = parametersToKeep;

      this.spreadsheet.update();
      this.grapher.updateChart();
      this.uiManager.updateCalculationUI();
      if (this.uiManager && typeof this.uiManager.setCalculationsStale === 'function') {
        this.uiManager.setCalculationsStale(false);
      }
      return true;
    }

    const lines = text.trim().split('\n');
    const definedInBlock = new Set();
    const rawCurveTitles = this.data.curves.filter(c => c.type !== 'calculation').map(c => c.title);
    const modelParameterNames = Object.keys(this.data.parameters).filter(key => this.data.parameters[key].type === 'model');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine === '' ||
        trimmedLine.startsWith('#') ||
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith("'") 
      ) {
        continue;
      }

      const parts = trimmedLine.split('=');
      if (parts.length < 2) {
        parsingWarnings.push(`Syntaxe invalide (ignorée) : "${trimmedLine}"`);
        continue;
      }

      const leftPart = parts[0].trim();
      const expression = parts.slice(1).join('=').trim();
      const leftParts = leftPart.split('_');
      
      const variableName = leftParts[0].trim().replace(/\s+/g, '');
      const unit = leftParts.length > 1 ? leftParts.slice(1).join('_').trim().replace(/\s+/g, '') : '';

      // Validation des symboles (conflits avec modèles, grandeurs existantes ou doublons)
      if (modelParameterNames.includes(variableName)) {
        showToast(`Le symbole "${variableName}" est un paramètre de modèle et ne peut pas être redéfini.`, "is-danger");
        return;
      }

      if (rawCurveTitles.includes(variableName)) {
        showToast(`Le symbole "${variableName}" est une grandeur existante et ne peut pas être redéfini.`, "is-danger");
        return;
      }

      const validationResult = this.symbolValidator.validate(variableName);
      if (!validationResult.isValid && !validationResult.message.includes('déjà utilisé')) {
        showToast(validationResult.message, "is-danger");
        return;
      }

      if (definedInBlock.has(variableName)) {
        showToast(`Le symbole "${variableName}" est défini plusieurs fois dans ce bloc de calcul.`, "is-danger");
        return;
      }
      definedInBlock.add(variableName);

      formulasToEvaluate.push({ variableName, expression, unit });
    }

    // Suppression des grandeurs calculées obsolètes et des modèles associés
    const newCalculatedTitles = new Set(formulasToEvaluate.map(f => f.variableName));
    const calculatedCurvesToDelete = this.data.curves.filter(
      curve => curve.type === 'calculation' && !newCalculatedTitles.has(curve.title)
    );

    if (calculatedCurvesToDelete.length > 0) {
      calculatedCurvesToDelete.forEach(curve => {
        this.grapher.deleteCurve(curve.title);
        console.log(`Deleting calculated curve "${curve.title}" as it is no longer defined.`);
        const modelsToDelete = this.data.models.filter(
          model => model.x.title === curve.title || model.y.title === curve.title
        );

        modelsToDelete.forEach(model => {
          console.log(`Deleting model ${model.id} because it depends on the deleted calculated curve "${curve.title}".`);
          this.deleteModel(model.id);

          const modelPanel = document.querySelector(`article[data-model-id="${model.id}"]`);
          if (modelPanel) {
            modelPanel.remove();
          }
        });
      });
    }

    // Évaluation des expressions
    this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
    const parametersToKeep = {};
    for (const key in this.data.parameters) {
      if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
        const param = this.data.parameters[key];
        if (param && param.type === 'model') {
            parametersToKeep[key] = param;
        }
      }
    }
    this.data.parameters = parametersToKeep;

    const initialScope = {};
    this.data.curves.forEach(curve => {
      initialScope[curve.title] = curve; 
    });
    for (const key in this.data.parameters) {
        if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
            initialScope[key] = this.data.parameters[key];
        }
    }
    
    const { results, errors } = this.calculation.evaluateBlock(formulasToEvaluate, initialScope);

    // Intégration des résultats dans les données
    results.forEach(result => {
      if (result.type === 'parameter') {
        this.data.parameters[result.variableName] = result.data;
      } else {
        const newCurve = this.addCurve(result.variableName, result.unit, undefined, undefined, 'calculation');
        newCurve.type = "calculation";
        newCurve.length = 0;
        const dataToAdd = result.data;
        if (dataToAdd) {
            for (let i = 0; i < dataToAdd.length; i++) {
                newCurve.push(dataToAdd[i]);
            }
        }
      }
    });

    const allErrors = [
      ...parsingWarnings,
      ...errors.map(err => `Calcul impossible pour "${err.variableName}": ${err.error}`)
    ];

    if (allErrors.length > 0) {
      console.error("Erreurs de calcul:", allErrors);
      allErrors.forEach(errMsg => {
        showToast(errMsg, "is-danger", 6000);
      });
    }

    // Si un tri était actif avant le recalcul, on le réapplique
    if (this.data.lastSortVariable) {
      if (this.data.getCurveByTitle(this.data.lastSortVariable)) {
        this.data.sortDataBy(this.data.lastSortVariable);
      } else {
        this.data.clearSort();
      }
    }

    // Met à jour le tableur, le graphique et l'UI avec les données remplies
    this.spreadsheet.update();
    this.grapher.updateChart();
    this.uiManager.updateCalculationUI();
    this.uiManager.updateSortUI();
    this.uiManager.updateXAxisSelector();
    if (this.uiManager && typeof this.uiManager.setCalculationsStale === 'function') {
      this.uiManager.setCalculationsStale(false);
    }

    // Si un RW3 a été chargé juste avant, on ajoute les courbes demandées
    if (this.pendingRW3 && Array.isArray(this.pendingRW3.y)) {
      const existing = this.data.curves.map(c => c.title);
      const want = this.pendingRW3.y.filter(t => existing.includes(t));
      if (want.length) {
        const currentList = this.grapher.chart?.series?.map(s => s.name) || [];
        const merged = Array.from(new Set([...currentList, ...want]));
        this.grapher.updateChart(merged);
      }
      this.pendingRW3 = null;
    }

    return allErrors.length === 0;
  }

}
export {App};