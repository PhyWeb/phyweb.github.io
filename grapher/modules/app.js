import IOManager from './ioManager.js';
import { alertModal } from '../../common/common.js';

const $ = document.querySelector.bind(document);

// Utilitaire : split tabulations ou au moins 2 espaces
function splitFlexible(line) {
  return line.trim().split(/\t| {2,}/);
}

function isTabularData(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return false;

  const colCounts = lines.map(line => splitFlexible(line).length);
  const firstCount = colCounts[0];

  const sameCount = colCounts.filter(c => c === firstCount).length;

  return sameCount >= lines.length - 1 && firstCount >= 2;
}

/*----------------------------------------------------------------------------------------------
-------------------------------------------------APP--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class App {
  constructor(data, spreadsheet, grapher, calculation, editor, uiUpdater) {
    this.data = data;
    this.spreadsheet = spreadsheet;
    this.grapher = grapher;
    this.calculation = calculation;
    this.editor = editor;
    this.uiUpdater = uiUpdater;

    this.ioManager = new IOManager(this);
  }

  addCurve(title, unit) {
    let curve = this.spreadsheet.addCurve(title, unit);

    if(this.data.curves.length === 1){
      this.grapher.setXCurve(title);
    }

    if(this.data.curves.length === 2){
      this.grapher.updateChart([title]);
    }

    // Update the calculation tab
    this.uiUpdater.updateCalculationUI();

    // Update the sorting options
    this.uiUpdater.updateSortUI();

    return curve;
  }

  deleteCurve(curveTitle){
    // First, find and delete any models dependent on this curve
    const modelsToDelete = this.data.models.filter(model => model.x.title === curveTitle || model.y.title === curveTitle);

    if (modelsToDelete.length > 0) {
      console.log(`Deleting ${modelsToDelete.length} model(s) dependent on curve "${curveTitle}".`);
      modelsToDelete.forEach(model => {
        this.deleteModel(model.id);

        // remove the model's UI panel
        const modelPanel = document.querySelector(`article[data-model-id="${model.id}"]`);
        if (modelPanel) {
          modelPanel.remove();
        }
      });
    }

    // Delete the curve
    this.data.deleteCurve(curveTitle);

    // Update the graph if needed
    this.grapher.deleteCurve(curveTitle);

    // Update the spreadsheet
    this.spreadsheet.update();

    // Update the calculation tab
    this.uiUpdater.updateCalculationUI();

    // Update the sorting options
    this.uiUpdater.updateSortUI();
  }

  resetSession() {
    // Vider toutes les annotations (données + affichage)
    this.grapher.clearAllAnnotations();

    // Supprimer tous les modèles existants
    const allModelIds = this.data.models.map(m => m.id);
    allModelIds.forEach(modelId => this.deleteModel(modelId));

    // Vider le panneau des modèles dans l'interface et mettre à jour les boutons
    $('#model-list').innerHTML = '';
    this.uiUpdater.updateRecalculateButtonVisibility();
    this.uiUpdater.updateModelToolVisibility();

    // Delete all curves
    this.data.deleteAllCurves();
    // Conserver uniquement les paramètres de type 'model'
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

    this.uiUpdater.clearActiveTool();

    // Update the graph
    this.grapher.deleteAllCurves(); 

    // Update the calculation
    this.calculation.clear();

    // clear the spreadsheet
    this.spreadsheet.clear();

    // Update the calculation tab
    this.uiUpdater.updateCalculationUI();

    // Update the sorting options
    this.uiUpdater.updateSortUI();
  }

  deleteRow(startRow, amount) {
    // On vérifie que les arguments sont valides
    if (typeof startRow === 'undefined' || typeof amount === 'undefined' || amount < 1) {
      return;
    }
    
    this.data.deleteRow(startRow, amount);

    this.spreadsheet.update();
    this.grapher.updateChart();
  }

  async addModel(x, y, type) {
    let model = await this.data.addModel(x, y, type);

    if (model) {
      this.grapher.addModelSeries(model);
      this.grapher.updateModelVisibility();
      this.grapher.chart.redraw();

      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateRecalculateButtonVisibility();

      this.uiUpdater.updateModelToolVisibility();

      return model;
    } else {
      alertModal({
        title: "Modélisation impossible",
        body: "Pour créer un modèle, vous devez avoir au moins deux grandeurs dans votre tableur.",
        confirm: "OK"
      });
    }
  }

  /**
   * Recalcule tous les modèles existants.
   */
  async recalculateAllModels() {
    if (this.data.models.length === 0) {
      return;
    }

    try {
      for (const model of this.data.models) {
        // Recalcule les paramètres du modèle
        await model.fit();
         // Met à jour le panneau du modèle avec les nouveaux résultats
        this.uiUpdater.updateModelPanel(model);
      }
      
      // Met à jour la visibilité et redessine le graphique
      this.grapher.updateModelVisibility();
      this.grapher.chart.redraw();
      
      // Met à jour l'interface utilisateur de calcul (pour les paramètres) et ferme la modale
      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateRecalculateButtonVisibility();

    } catch (e) {
      console.error("Erreur lors du recalcul des modèles:", e);
      alertModal({
        type: "danger",
        title: "Erreur de recalcul",
        body: "Une erreur est survenue lors du recalcul des modèles. Veuillez vérifier la console pour plus de détails.",
        confirm: "OK"
      });
    }
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
      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateRecalculateButtonVisibility();
  }

  applyCalculation(text) {
    // Fonction pour capturer l'état des données calculées
    const getCalculatedState = () => {
      const calculatedCurves = this.data.curves.filter(curve => curve.type === "calculation");
      const calculatedParams = {};
      for (const key in this.data.parameters) {
        if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
          const param = this.data.parameters[key];
          if (param && param.type !== 'model') {
            calculatedParams[key] = param;
          }
        }
      }
      // On utilise JSON.stringify pour une comparaison simple et efficace
      return JSON.stringify({ curves: calculatedCurves, params: calculatedParams });
    };

    // On capture l'état initial AVANT toute modification
    const initialStateJSON = getCalculatedState();

    // --- Phase 1: Analyse et Validation ---
    const formulasToEvaluate = [];
    const parsingWarnings = [];

    if (!text || text.trim() === "") {
      this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
      // Conserver uniquement les paramètres de type 'model'
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

      const finalStateJSON = getCalculatedState();
      if (initialStateJSON !== finalStateJSON) {
        this.spreadsheet.update();
        this.grapher.updateChart();
        this.uiUpdater.updateCalculationUI();
      }
      return;
    }

    const lines = text.trim().split('\n');
    const validSymbolRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/; // Ne commence PAS par un underscore
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

      if (!validSymbolRegex.test(variableName)) {
        alertModal({
          title: "Symbole invalide",
          body: `Le symbole "${variableName}" est invalide. Il doit commencer par une lettre et ne peut contenir que des lettres, des chiffres et des underscores.`,
          confirm: "OK"
        });
        return;
      }

      if (modelParameterNames.includes(variableName)) {
        alertModal({
          title: "Conflit de nom",
          body: `Le symbole "${variableName}" est un paramètre de modèle et ne peut pas être redéfini.`,
          confirm: "OK"
        });
        return;
      }

      if (rawCurveTitles.includes(variableName)) {
          alertModal({
              title: "Conflit de nom",
              body: `Le symbole "${variableName}" est déjà utilisé par une grandeur non-calculée et ne peut pas être redéfini ici.`,
              confirm: "OK"
          });
          return;
      }

      if (definedInBlock.has(variableName)) {
          alertModal({
              title: "Symbole dupliqué",
              body: `Le symbole "${variableName}" est défini plusieurs fois dans ce bloc de calcul.`,
              confirm: "OK"
          });
          return;
      }
      definedInBlock.add(variableName);

      formulasToEvaluate.push({ variableName, expression, unit });
    }

    // --- Phase de nettoyage des dépendances ---
    // 1. Identifier les grandeurs calculées qui vont être supprimées
    const newCalculatedTitles = new Set(formulasToEvaluate.map(f => f.variableName));
    const calculatedCurvesToDelete = this.data.curves.filter(
      curve => curve.type === 'calculation' && !newCalculatedTitles.has(curve.title)
    );

    // 2. Si des grandeurs calculées sont supprimées, supprimer les modèles dépendants
    if (calculatedCurvesToDelete.length > 0) {
      calculatedCurvesToDelete.forEach(curve => {
        this.grapher.deleteCurve(curve.title); // Supprime la courbe du graphique
        console.log(`Deleting calculated curve "${curve.title}" as it is no longer defined.`);
        const modelsToDelete = this.data.models.filter(
          model => model.x.title === curve.title || model.y.title === curve.title
        );

        modelsToDelete.forEach(model => {
          console.log(`Deleting model ${model.id} because it depends on the deleted calculated curve "${curve.title}".`);
          // Supprimer le modèle (données et graphique)
          this.deleteModel(model.id);

          // Supprimer le panneau UI du modèle
          const modelPanel = document.querySelector(`article[data-model-id="${model.id}"]`);
          if (modelPanel) {
            modelPanel.remove();
          }
        });
      });
    }

    // --- Phase 2: Exécution (uniquement si toutes les validations sont passées) ---
    this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
    // Conserver uniquement les paramètres de type 'model'
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
    // Ajoute toutes les courbes au scope
    this.data.curves.forEach(curve => {
      initialScope[curve.title] = curve; 
    });
    // Ajoute tous les paramètres au scope
    for (const key in this.data.parameters) {
        if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
            initialScope[key] = this.data.parameters[key];
        }
    }
    
    const { results, errors } = this.calculation.evaluateBlock(formulasToEvaluate, initialScope);

    // --- Phase 3: Mise à jour des données et de l'interface ---
    results.forEach(result => {
      if (result.type === 'parameter') {
        this.data.parameters[result.variableName] = result.data;
      } else {
        const newCurve = this.addCurve(result.variableName, result.unit);
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
      alertModal({
        title: "Erreurs de calcul",
        body: allErrors.join('\n'),
        confirm: "OK"
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

    // On capture le nouvel état
    const finalStateJSON = getCalculatedState();

    // On compare et on met à jour l'UI uniquement si nécessaire
    if (initialStateJSON !== finalStateJSON) {
      // Si un tri était actif avant le recalcul, on le réapplique
      if (this.data.lastSortVariable) {
        if (this.data.getCurveByTitle(this.data.lastSortVariable)) {
          this.data.sortDataBy(this.data.lastSortVariable);
        } else {
          this.data.clearSort();
        }
      }

      // Met à jour le tableur, le graphique et l'UI
      this.spreadsheet.update();
      this.grapher.updateChart();
      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateSortUI();
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

    // retourne si il y a eu des erreurs ou non
    return allErrors.length === 0;
  }

}
export {App};