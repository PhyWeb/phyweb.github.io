import { formatUnit } from '../../../common/formatter.js';
import { alertModal, showToast } from '../../../common/common.js';
import { populateColorSelect } from './colorPicker.js';
import { buildSeriesMarkerOptions } from '../grapher/highchartsSetup.js';

const $ = (selector) => document.querySelector(selector);

export default class CurveModalsUI {
  constructor(ui) {
    this.ui = ui;
  }

  updateSortUI() {
    const select = $('#sort-variable-select');

    if (select) {
      const selectedValue = this.ui.data.lastSortVariable || select.value;
      select.innerHTML = ''; // Vide les options

      const defaultOption = document.createElement('option');
      defaultOption.textContent = "Trier par...";
      defaultOption.value = "";
      defaultOption.disabled = true;
      select.appendChild(defaultOption);

      this.ui.data.curves.forEach(curve => {
        const option = document.createElement('option');
        option.value = curve.title;
        option.textContent = curve.title;
        select.appendChild(option);
      });

      // Restaure la sélection si elle est toujours valide
      if (this.ui.data.curves.some(c => c.title === selectedValue)) {
        select.value = selectedValue;
      } else {
        select.value = ""; // Sinon, sélectionne le placeholder
      }
    }

    this.updateSortDirectionUI();
  }

  updateSortDirectionUI() {
    const isDesc = this.ui.data?.lastSortDirection === 'desc';
    const sortBtn = $('#sort-button');
    const sortBtnIcon = $('#sort-button-icon');
    const dirBtn = $('#sort-direction-button');
    const dirIcon = $('#sort-direction-icon');

    if (sortBtn) {
      sortBtn.title = isDesc ? 'Trier par ordre décroissant' : 'Trier par ordre croissant';
    }
    if (sortBtnIcon && sortBtnIcon.classList) {
      sortBtnIcon.classList.toggle('fa-arrow-down-short-wide', !isDesc);
      sortBtnIcon.classList.toggle('fa-arrow-up-wide-short', isDesc);
    }
    if (dirBtn) {
      dirBtn.title = isDesc
        ? 'Ordre décroissant (cliquer pour passer en croissant)'
        : 'Ordre croissant (cliquer pour passer en décroissant)';
      if (typeof dirBtn.setAttribute === 'function') {
        dirBtn.setAttribute('aria-pressed', isDesc ? 'true' : 'false');
      }
    }
    if (dirIcon && dirIcon.classList) {
      dirIcon.classList.toggle('fa-arrow-down', !isDesc);
      dirIcon.classList.toggle('fa-arrow-up', isDesc);
    }
  }

  initSpreadsheetControls() {
    this.ui.updateSortUI();
    this.ui.updateXAxisSelector();

    const applySort = () => {
      const selectedVariable = $('#sort-variable-select')?.value;
      if (selectedVariable) {
        const direction = this.ui.data?.lastSortDirection === 'desc' ? 'desc' : 'asc';
        const orderChanged = this.ui.data.sortDataBy(selectedVariable, direction);
        this.ui.spreadsheet.update();
        this.ui.grapher.updateChart();
        const hasEmptyCalcCurve = Boolean(
          this.ui.data?.curves && this.ui.data.curves.some(c => c.type === 'calculation' && c.length === 0)
        );
        if ((orderChanged || hasEmptyCalcCurve) && this.ui.hasOrderDependentFormulas()) {
          this.ui.setCalculationsStale(true);
        }
      }
    };

    // Ajouter l'écouteur pour le bouton de tri
    $('#sort-button').addEventListener('click', applySort);

    // Ajouter l'écouteur pour la bascule croissant / décroissant
    const sortDirectionBtn = $('#sort-direction-button');
    if (sortDirectionBtn) {
      sortDirectionBtn.addEventListener('click', () => {
        if (this.ui.data) {
          this.ui.data.lastSortDirection = this.ui.data.lastSortDirection === 'desc' ? 'asc' : 'desc';
        }
        this.updateSortDirectionUI();
        applySort();
      });
    }

    // Ajouter l'écouteur pour le recalcul des grandeurs depuis le tableur
    const recalculateSpreadsheetBtn = document.getElementById('recalculate-spreadsheet-button');
    if (recalculateSpreadsheetBtn) {
      recalculateSpreadsheetBtn.addEventListener('click', () => {
        const text = typeof this.ui.editor?.getValue === 'function' ? this.ui.editor.getValue() : '';
        const success = this.ui.app.applyCalculation(text);
        if (success) {
          showToast("Grandeurs recalculées avec succès.", "is-success", 2500);
        }
      });
    }

    document.getElementById('page-prev-button').addEventListener('click', () => {
      if (this.ui.spreadsheet.currentPage > 0) {
        this.ui.spreadsheet.currentPage--;
        this.ui.spreadsheet.update();
      }
    });

    document.getElementById('page-next-button').addEventListener('click', () => {
      const totalRows = this.ui.data.getTable().length;
      if ((this.ui.spreadsheet.currentPage + 1) * this.ui.spreadsheet.pageSize < totalRows) {
        this.ui.spreadsheet.currentPage++;
        this.ui.spreadsheet.update();
      }
    });

    document.getElementById('page-first-button').addEventListener('click', () => {
      if (this.ui.spreadsheet.currentPage > 0) {
        this.ui.spreadsheet.currentPage = 0;
        this.ui.spreadsheet.update();
        this.ui.spreadsheet.focusFirstCell(false);
      }
    });

    document.getElementById('page-last-button').addEventListener('click', () => {
      const totalRows = this.ui.data.getTable().length;
      const totalPages = Math.ceil(totalRows / this.ui.spreadsheet.pageSize);

      if (this.ui.spreadsheet.currentPage < totalPages - 1) {
        this.ui.spreadsheet.currentPage = totalPages - 1;
        this.ui.spreadsheet.update();
        this.ui.spreadsheet.focusFirstCell(false);
      }
    });

    const pageInput = document.getElementById('page-input');
    if (pageInput) {
      // Valider avec la touche Entrée
      pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.target.blur(); // Déclenche le blur pour valider
        }
      });

      // Valider quand on sort du champ
      pageInput.addEventListener('change', (e) => {
        const totalRows = this.ui.data.getTable().length;
        const totalPages = Math.ceil(totalRows / this.ui.spreadsheet.pageSize);

        let targetPage = parseInt(e.target.value, 10) - 1; // Passage en index 0

        // Sécurisation des bornes
        if (isNaN(targetPage) || targetPage < 0) targetPage = 0;
        if (targetPage >= totalPages) targetPage = totalPages - 1;

        if (targetPage !== this.ui.spreadsheet.currentPage) {
          this.ui.spreadsheet.currentPage = targetPage;
          this.ui.spreadsheet.update();
        } else {
          // Remet la valeur correcte si l'utilisateur a tapé n'importe quoi
          e.target.value = this.ui.spreadsheet.currentPage + 1;
        }
      });
    }

    this.ui.initAddCurveModal();
    this.ui.initDeleteCurveModal();
    this.ui.initDeleteLineButton();
    this.ui.initEditHeaderModal();
  }

  /**
   * Initialise la modale d'ajout de courbe et gère les événements associés.
   */
  initAddCurveModal() {
    // Références aux éléments de la modale
    const addCurveModal = $('#add-curve-modal');
    const radioButtons = addCurveModal.querySelectorAll('input[name="creation-type"]');
    const addCurveConfirmButton = $('#add-curve-confirm-button');

    // Panels de la modale
    const emptyCurvePanel = $('#empty-curve-panel');
    const calcCurvePanel = $('#calc-curve-panel');
    const derivateCurvePanel = $('#derivate-curve-panel');
    const integrateCurvePanel = $('#integrate-curve-panel');
    const smoothCurvePanel = $('#smooth-curve-panel');
    const parameterPanel = $('#parameter-panel');
    const allPanels = [emptyCurvePanel, calcCurvePanel, derivateCurvePanel, integrateCurvePanel, smoothCurvePanel, parameterPanel].filter(Boolean);

    // Références aux champs de saisie pour chaque panneau
    const emptyCurveSymbolInput = $('#empty-curve-symbol-input');
    const emptyCurveUnitInput = $('#empty-curve-unit-input');

    const calcCurveSymbolInput = $('#calc-curve-symbol-input');
    const calcCurveUnitInput = $('#calc-curve-unit-input');
    const calcCurveFormulaInput = $('#calc-curve-formula-input');

    const derivateCurveSymbolInput = $('#derivate-curve-symbol-input');
    const derivateCurveUnitInput = $('#derivate-curve-unit-input');
    const derivateNumeratorSelect = $('#derivate-numerator-select');
    const derivateDenominatorSelect = $('#derivate-denominator-select');

    const integrateCurveSymbolInput = $('#integrate-curve-symbol-input');
    const integrateCurveUnitInput = $('#integrate-curve-unit-input');
    const integrateOperandSelect = $('#integrate-operand-select');
    const integrateVariableSelect = $('#integrate-variable-select');
    const integrateInitialValueInput = $('#integrate-initial-value-input');

    const smoothCurveSymbolInput = $('#smooth-curve-symbol-input');
    const smoothCurveUnitInput = $('#smooth-curve-unit-input');
    const smoothOperandSelect = $('#smooth-operand-select');
    const smoothPointsSelect = $('#smooth-points-select');

    const parameterSymbolInput = $('#parameter-symbol-input');
    const parameterUnitInput = $('#parameter-unit-input');
    const parameterValueInput = $('#parameter-value-input');

    const allSymbolInputs = [emptyCurveSymbolInput, calcCurveSymbolInput, derivateCurveSymbolInput, integrateCurveSymbolInput, smoothCurveSymbolInput, parameterSymbolInput].filter(Boolean);
    const allUnitInputs = [emptyCurveUnitInput, calcCurveUnitInput, derivateCurveUnitInput, integrateCurveUnitInput, smoothCurveUnitInput, parameterUnitInput].filter(Boolean);

    // Synchronise le symbole entre tous les panneaux
    allSymbolInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', (e) => {
          const val = (e && e.target && e.target.value !== undefined) ? e.target.value : input.value;
          allSymbolInputs.forEach(otherInput => {
            if (otherInput !== input && otherInput) {
              otherInput.value = val;
            }
          });
        });
      }
    });

    // Synchronise l'unité entre tous les panneaux
    allUnitInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', (e) => {
          const val = (e && e.target && e.target.value !== undefined) ? e.target.value : input.value;
          allUnitInputs.forEach(otherInput => {
            if (otherInput !== input && otherInput) {
              otherInput.value = val;
            }
          });
        });
      }
    });

    // Bonus ergonomique : pré-remplissage de l'unité lors du choix d'une grandeur à lisser
    if (smoothOperandSelect) {
      smoothOperandSelect.addEventListener('change', () => {
        if (smoothCurveUnitInput && !smoothCurveUnitInput.value.trim() && smoothOperandSelect.value && !smoothOperandSelect.value.startsWith('Choisir')) {
          const selectedCurve = (typeof this.ui.data?.getCurveByTitle === 'function')
            ? this.ui.data.getCurveByTitle(smoothOperandSelect.value)
            : this.ui.data?.curves?.find(c => c.title === smoothOperandSelect.value);
          if (selectedCurve && selectedCurve.unit) {
            smoothCurveUnitInput.value = selectedCurve.unit;
            allUnitInputs.forEach(otherInput => {
              if (otherInput) otherInput.value = selectedCurve.unit;
            });
          }
        }
      });
    }

    /**
     * Met à jour le panneau visible en fonction du bouton radio sélectionné.
     */
    function updateVisiblePanel() {
      const selectedValue = addCurveModal.querySelector('input[name="creation-type"]:checked').value;
      allPanels.forEach(panel => panel.classList.add('is-hidden'));

      switch (selectedValue) {
        case 'empty-curve':
          if (emptyCurvePanel) emptyCurvePanel.classList.remove('is-hidden');
          break;
        case 'calc-curve':
          if (calcCurvePanel) calcCurvePanel.classList.remove('is-hidden');
          break;
        case 'derivate-curve':
          if (derivateCurvePanel) derivateCurvePanel.classList.remove('is-hidden');
          break;
        case 'integrate-curve':
          if (integrateCurvePanel) integrateCurvePanel.classList.remove('is-hidden');
          break;
        case 'smooth-curve':
          if (smoothCurvePanel) smoothCurvePanel.classList.remove('is-hidden');
          break;
        case 'parameter':
          if (parameterPanel) parameterPanel.classList.remove('is-hidden');
          break;
      }
    }

    /**
     * Peuple les menus déroulants pour la dérivation avec les courbes disponibles.
     * @param {string[]} curveNames - Un tableau des noms des courbes (ex: ['t', 'x', 'y']).
     */
    function populateDerivativeSelects(curveNames) {
      // Peuple les menus déroulants pour la grandeur dérivée
      if (derivateNumeratorSelect && derivateDenominatorSelect) {
        derivateNumeratorSelect.innerHTML = '';
        derivateDenominatorSelect.innerHTML = '';

        if (!curveNames || curveNames.length === 0) {
          const optNoneNum = document.createElement('option');
          optNoneNum.value = '';
          optNoneNum.textContent = 'Aucune grandeur';
          optNoneNum.disabled = true;
          optNoneNum.selected = true;
          derivateNumeratorSelect.appendChild(optNoneNum);

          const optNoneDenom = document.createElement('option');
          optNoneDenom.value = '';
          optNoneDenom.textContent = 'Aucune grandeur';
          optNoneDenom.disabled = true;
          optNoneDenom.selected = true;
          derivateDenominatorSelect.appendChild(optNoneDenom);

          derivateNumeratorSelect.disabled = true;
          derivateDenominatorSelect.disabled = true;
        } else if (curveNames.length === 1) {
          const optReqNum = document.createElement('option');
          optReqNum.value = '';
          optReqNum.textContent = '2 grandeurs requises';
          optReqNum.disabled = true;
          optReqNum.selected = true;
          derivateNumeratorSelect.appendChild(optReqNum);

          const optReqDenom = document.createElement('option');
          optReqDenom.value = '';
          optReqDenom.textContent = '2 grandeurs requises';
          optReqDenom.disabled = true;
          optReqDenom.selected = true;
          derivateDenominatorSelect.appendChild(optReqDenom);

          derivateNumeratorSelect.disabled = true;
          derivateDenominatorSelect.disabled = true;
        } else {
          derivateNumeratorSelect.disabled = false;
          derivateDenominatorSelect.disabled = false;

          curveNames.forEach(name => {
            const optionNum = document.createElement('option');
            optionNum.value = name;
            optionNum.textContent = name;
            derivateNumeratorSelect.appendChild(optionNum);

            const optionDenom = document.createElement('option');
            optionDenom.value = name;
            optionDenom.textContent = name;
            derivateDenominatorSelect.appendChild(optionDenom);
          });

          // Pré-sélectionne la 2ème colonne au numérateur et la 1ère colonne au dénominateur (ex: dx/dt ou dv/dt)
          derivateNumeratorSelect.value = curveNames[1];
          derivateDenominatorSelect.value = curveNames[0];
        }
      }

      // Peuple les menus déroulants pour la grandeur intégrée
      if (integrateOperandSelect && integrateVariableSelect) {
        integrateOperandSelect.innerHTML = '';
        integrateVariableSelect.innerHTML = '';

        if (!curveNames || curveNames.length === 0) {
          const optNoneOp = document.createElement('option');
          optNoneOp.value = '';
          optNoneOp.textContent = '';
          optNoneOp.disabled = true;
          optNoneOp.selected = true;
          integrateOperandSelect.appendChild(optNoneOp);

          const optNoneVar = document.createElement('option');
          optNoneVar.value = '';
          optNoneVar.textContent = '';
          optNoneVar.disabled = true;
          optNoneVar.selected = true;
          integrateVariableSelect.appendChild(optNoneVar);

          integrateOperandSelect.disabled = true;
          integrateVariableSelect.disabled = true;
          const tooltip = "Aucune grandeur disponible";
          integrateOperandSelect.title = tooltip;
          integrateVariableSelect.title = tooltip;
          if (integrateOperandSelect.parentElement) integrateOperandSelect.parentElement.title = tooltip;
          if (integrateVariableSelect.parentElement) integrateVariableSelect.parentElement.title = tooltip;
        } else if (curveNames.length === 1) {
          const optReqOp = document.createElement('option');
          optReqOp.value = '';
          optReqOp.textContent = '';
          optReqOp.disabled = true;
          optReqOp.selected = true;
          integrateOperandSelect.appendChild(optReqOp);

          const optReqVar = document.createElement('option');
          optReqVar.value = '';
          optReqVar.textContent = '';
          optReqVar.disabled = true;
          optReqVar.selected = true;
          integrateVariableSelect.appendChild(optReqVar);

          integrateOperandSelect.disabled = true;
          integrateVariableSelect.disabled = true;
          const tooltip = "2 grandeurs nécessaires";
          integrateOperandSelect.title = tooltip;
          integrateVariableSelect.title = tooltip;
          if (integrateOperandSelect.parentElement) integrateOperandSelect.parentElement.title = tooltip;
          if (integrateVariableSelect.parentElement) integrateVariableSelect.parentElement.title = tooltip;
        } else {
          integrateOperandSelect.disabled = false;
          integrateVariableSelect.disabled = false;
          integrateOperandSelect.title = '';
          integrateVariableSelect.title = '';
          if (integrateOperandSelect.parentElement) integrateOperandSelect.parentElement.title = '';
          if (integrateVariableSelect.parentElement) integrateVariableSelect.parentElement.title = '';

          curveNames.forEach(name => {
            const optionOp = document.createElement('option');
            optionOp.value = name;
            optionOp.textContent = name;
            integrateOperandSelect.appendChild(optionOp);

            const optionVar = document.createElement('option');
            optionVar.value = name;
            optionVar.textContent = name;
            integrateVariableSelect.appendChild(optionVar);
          });

          // Pré-sélectionne la 2ème colonne dans le 1er dropdown et la 1ère colonne après le 'd'
          integrateOperandSelect.value = curveNames[1];
          integrateVariableSelect.value = curveNames[0];
        }
      }
    }

    /**
     * Réinitialise tous les champs de la modale à leur état par défaut.
     */
    const resetAddCurveModal = () => {
      emptyCurveSymbolInput.value = "";
      emptyCurveUnitInput.value = "";
      calcCurveSymbolInput.value = "";
      calcCurveUnitInput.value = "";
      calcCurveFormulaInput.value = "";
      derivateCurveSymbolInput.value = "";
      derivateCurveUnitInput.value = "";
      if (integrateCurveSymbolInput) integrateCurveSymbolInput.value = "";
      if (integrateCurveUnitInput) integrateCurveUnitInput.value = "";
      if (integrateInitialValueInput) integrateInitialValueInput.value = "0";
      if (smoothCurveSymbolInput) smoothCurveSymbolInput.value = "";
      if (smoothCurveUnitInput) smoothCurveUnitInput.value = "";
      if (smoothPointsSelect) smoothPointsSelect.value = "5";
      parameterSymbolInput.value = "";
      parameterUnitInput.value = "";
      parameterValueInput.value = "";

      const curveNames = this.ui.data.curves.map(c => c.title);
      populateDerivativeSelects(curveNames);

      if (smoothOperandSelect) {
        smoothOperandSelect.innerHTML = '';
        const optDefault = document.createElement('option');
        optDefault.value = 'Choisir grandeur';
        optDefault.textContent = 'Choisir grandeur';
        smoothOperandSelect.appendChild(optDefault);

        curveNames.forEach(name => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          smoothOperandSelect.appendChild(option);
        });
        smoothOperandSelect.value = 'Choisir grandeur';
      }
    };

    /**
     * Récupère et valide les entrées de la modale en fonction du type sélectionné.
     * @param {string} selectedType - La valeur du bouton radio coché.
     * @returns {object|null} Un objet contenant les informations ou null si la validation échoue.
     */
    const getModalInputs = (selectedType) => {
      let symbol, unit, formulaLine;

      // Fonction pour nettoyer l'unité
      const processUnit = (element) => {
        let value = element.value.trim().replace(/\s+/g, ''); // Retire les espaces
        element.value = value; // Met à jour l'affichage
        return value;
      };

      const buildVarWithUnit = (sym, u) => u ? `${sym}_${u}` : sym;

      switch (selectedType) {
        case 'calc-curve': {
          symbol = calcCurveSymbolInput.value.trim();
          unit = processUnit(calcCurveUnitInput);
          const formula = calcCurveFormulaInput.value.trim();
          if (!symbol || !formula) {
            showToast("Veuillez remplir le symbole et la formule.", "is-warning");
            return null;
          }
          const validationResult = this.ui.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            showToast(validationResult.message, "is-danger");
            return null;
          }

          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;
          return { type: 'formula', formulaLine };
        }

        case 'derivate-curve': {
          symbol = derivateCurveSymbolInput.value.trim();
          unit = processUnit(derivateCurveUnitInput);
          const numerator = derivateNumeratorSelect ? derivateNumeratorSelect.value : '';
          const denominator = derivateDenominatorSelect ? derivateDenominatorSelect.value : '';

          const curveCount = this.ui.data?.curves?.length || 0;
          if (curveCount === 0) {
            showToast("Aucune grandeur n'est disponible pour calculer une dérivée.", "is-warning");
            return null;
          }
          if (curveCount < 2) {
            showToast("Il faut au moins 2 grandeurs pour calculer une dérivée.", "is-warning");
            return null;
          }

          if (!symbol || !numerator || !denominator || numerator.startsWith('Choisir') || denominator.startsWith('Choisir')) {
            showToast("Veuillez remplir le symbole et choisir les deux grandeurs à dériver.", "is-warning");
            return null;
          }

          if (numerator === denominator) {
            showToast("Les deux grandeurs à dériver doivent être distinctes.", "is-warning");
            return null;
          }

          const validationResult = this.ui.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            showToast(validationResult.message, "is-danger");
            return null;
          }

          const formula = `diff(${numerator}, ${denominator})`;
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;

          return { type: 'formula', formulaLine };
        }

        case 'integrate-curve': {
          symbol = integrateCurveSymbolInput.value.trim();
          unit = processUnit(integrateCurveUnitInput);
          const operand = integrateOperandSelect ? integrateOperandSelect.value : '';
          const variable = integrateVariableSelect ? integrateVariableSelect.value : '';

          const curveCount = this.ui.data?.curves?.length || 0;
          if (curveCount === 0) {
            showToast("Aucune grandeur n'est disponible pour calculer une primitive.", "is-warning");
            return null;
          }
          if (curveCount < 2) {
            showToast("Il faut au moins 2 grandeurs pour calculer une primitive.", "is-warning");
            return null;
          }

          if (!symbol || !operand || !variable || operand.startsWith('Choisir') || variable.startsWith('Choisir')) {
            showToast("Veuillez remplir le symbole et choisir la grandeur et la variable d'intégration.", "is-warning");
            return null;
          }

          if (operand === variable) {
            showToast("La grandeur à intégrer et la variable d'intégration doivent être distinctes.", "is-warning");
            return null;
          }

          const validationResult = this.ui.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            showToast(validationResult.message, "is-danger");
            return null;
          }

          const initValStr = integrateInitialValueInput ? integrateInitialValueInput.value.trim().replace(',', '.') : '0';
          const initVal = initValStr !== '' ? Number(initValStr) : 0;
          const formula = (Number.isFinite(initVal) && initVal !== 0)
            ? `integrate(${operand}, ${variable}, ${initVal})`
            : `integrate(${operand}, ${variable})`;

          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;
          return { type: 'formula', formulaLine };
        }

        case 'smooth-curve': {
          symbol = smoothCurveSymbolInput ? smoothCurveSymbolInput.value.trim() : '';
          unit = smoothCurveUnitInput ? processUnit(smoothCurveUnitInput) : '';
          const operand = smoothOperandSelect ? smoothOperandSelect.value : '';

          if (!symbol || !operand || operand.startsWith('Choisir')) {
            showToast("Veuillez remplir le symbole et choisir la grandeur à lisser.", "is-warning");
            return null;
          }

          const validationResult = this.ui.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            showToast(validationResult.message, "is-danger");
            return null;
          }

          const pts = (smoothPointsSelect && parseInt(smoothPointsSelect.value, 10)) || 5;
          const formula = (pts && pts !== 5)
            ? `smooth(${operand}, ${pts})`
            : `smooth(${operand})`;

          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${formula}`;
          return { type: 'formula', formulaLine };
        }

        case 'parameter': {
          symbol = parameterSymbolInput.value.trim();
          unit = processUnit(parameterUnitInput);
          const value = parameterValueInput.value.trim();
          if (!symbol || !value) {
            showToast("Veuillez remplir le symbole et la valeur.", "is-warning");
            return null;
          }
          const validationResult = this.ui.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            showToast(validationResult.message, "is-danger");
            return null;
          }
          formulaLine = `${buildVarWithUnit(symbol, unit)} = ${value}`;
          return { type: 'formula', formulaLine };
        }

        case 'empty-curve': {
          symbol = emptyCurveSymbolInput.value.trim();
          unit = processUnit(emptyCurveUnitInput);
          if (!symbol) {
            showToast("Veuillez entrer un symbole.", "is-warning");
            return null;
          }
          const validationResult = this.ui.app.symbolValidator.validate(symbol);
          if (!validationResult.isValid) {
            showToast(validationResult.message, "is-danger");
            return null;
          }
          return { type: 'empty-curve', symbol, unit };
        }
        default:
          console.error("Type de création inconnu:", selectedType);
          return null;
      }
    };

    /**
     * Gère le changement de sélection des boutons radio pour afficher le panneau correspondant.
     */
    radioButtons.forEach(radio => {
      radio.addEventListener('change', updateVisiblePanel);
    });

    /**
     * Gère l'ouverture de la modale pour ajouter une courbe vide ou une courbe de calcul.
     */
    $('#add-curve-button').addEventListener("click", () => {
      resetAddCurveModal();
      addCurveModal.querySelector('input[value="empty-curve"]').click();
      this.ui.common.modalManager.openModal(addCurveModal);
      $('#empty-curve-symbol-input').focus();
    });
    $('#add-curve-calculation-button').addEventListener("click", () => {
      resetAddCurveModal();
      addCurveModal.querySelector('input[value="calc-curve"]').click();
      this.ui.common.modalManager.openModal(addCurveModal);
      $('#calc-curve-symbol-input').focus();
    });

    /**
     * Gère la confirmation de l'ajout de la courbe ou du paramètre.
     */
    addCurveConfirmButton.addEventListener('click', () => {
      const selectedType = addCurveModal.querySelector('input[name="creation-type"]:checked').value;
      const newEntry = getModalInputs(selectedType);

      if (!newEntry) {
        return;
      }

      if (newEntry.type === 'empty-curve') {
        this.ui.app.addCurve(newEntry.symbol, newEntry.unit);
      } else {
        const currentText = this.ui.editor.getValue();
        const separator = currentText.trim() === '' ? '' : '\n\n';
        const newContent = currentText.trimEnd() + separator + newEntry.formulaLine;

        this.ui.editor.setValue(newContent);
        this.ui.app.applyCalculation(this.ui.editor.getValue());
      }

      // Fermer la modale
      this.ui.common.modalManager.closeAllModals();
    });

    // Initialise l'état de la modale au chargement
    updateVisiblePanel();
  }

  /**
   * Initialise la modale de suppression de courbe et gère les événements associés.
   */
  initDeleteCurveModal() {
    $("#delete-curve-button").addEventListener("click", () => {
      if (this.ui.data.curves.length === 0) {
        return;
      }

      const selectElement = $("#delete-curve-select");
      selectElement.innerHTML = ""; // Vide les anciennes options

      // Peuple le menu déroulant avec les grandeurs disponibles
      this.ui.data.curves.forEach(curve => {
        if (curve.type === "calculation") return; // On ne peut pas supprimer les grandeurs calculées ici
        const option = document.createElement("option");
        option.value = curve.title;
        const formattedUnit = formatUnit(curve.unit);
        option.textContent = formattedUnit ? `${curve.title} (${formattedUnit})` : curve.title;
        selectElement.appendChild(option);
      });

      this.ui.common.modalManager.openModal($("#delete-curve-modal"));
    });

    $("#delete-curve-confirm-button").addEventListener("click", () => {
      const curveTitleToDelete = $("#delete-curve-select").value;

      if (curveTitleToDelete) {
        this.ui.app.deleteCurve(curveTitleToDelete);
      }

      this.ui.common.modalManager.closeAllModals();
    });
  }

  /**
   * Initialise le bouton de suppression de lignes et gère les événements associés.
   */
  initDeleteLineButton() {
    $("#delete-line-button").addEventListener("click", () => {
      const selectedRange = this.ui.spreadsheet.hot.getSelectedRangeLast();

      if (!selectedRange) {
        showToast("Veuillez sélectionner une ou plusieurs lignes à supprimer.", "is-warning");
        return;
      }

      const startRow = Math.min(selectedRange.from.row, selectedRange.to.row);
      const endRow = Math.max(selectedRange.from.row, selectedRange.to.row);
      const amount = (endRow - startRow) + 1;
      const rowLabel = amount > 1 ? 'lignes' : 'ligne';

      const pageOffset = (typeof this.ui.spreadsheet.getPageOffset === 'function')
        ? this.ui.spreadsheet.getPageOffset()
        : (this.ui.spreadsheet.currentPage || 0) * (this.ui.spreadsheet.pageSize || 0);
      const actualStartRow = pageOffset + startRow;

      // Vérifie si toutes les lignes sélectionnées sont vides
      const isEmptyValue = (v) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || Number.isNaN(v);
      const curves = this.ui.data?.curves || [];
      let allEmpty = true;

      for (let r = actualStartRow; r < actualStartRow + amount; r++) {
        const rowHasData = curves.some(curve => !isEmptyValue(curve[r]));
        if (rowHasData) {
          allEmpty = false;
          break;
        }
      }

      // Si toutes les lignes sélectionnées sont vides, on supprime directement sans modale
      if (allEmpty) {
        this.ui.app.deleteRow(actualStartRow, amount);
        return;
      }

      alertModal({
        type: "danger",
        title: "Confirmer la suppression",
        body: `<p>Êtes-vous sûr de vouloir supprimer <strong>${amount} ${rowLabel}</strong> ?<br>Cette action est irréversible.</p>`,
        confirm: {
          label: "Supprimer",
          type: "danger", // Pour un bouton rouge
          cb: () => {
            this.ui.app.deleteRow(actualStartRow, amount);
          }
        },
        cancel: "Annuler"
      });
    });
  }

  /**
   * Initialise la modale d'édition de l'en-tête de courbe et gère les événements associés.
   */
  initEditHeaderModal() {
    const modal = $('#edit-header-modal');
    if (!modal) return;

    const symbolInput = document.getElementById('edit-header-symbol-input');
    const unitInput = document.getElementById('edit-header-unit-input');
    const saveButton = document.getElementById('edit-header-save-button');
    const cancelButton = modal.querySelector('.modal-close-button');
    const closeButton = modal.querySelector('.delete');
    const background = modal.querySelector('.modal-background');

    let currentCurveOriginalTitle = null;

    // Méthode pour ouvrir la modale avec les bonnes données (exposée sur UIManager)
    this.ui.openEditHeaderModal = (curve) => {
      currentCurveOriginalTitle = curve.title;
      if (symbolInput) symbolInput.value = curve.title;
      if (unitInput) unitInput.value = curve.unit || '';
      if (this.ui.common && this.ui.common.modalManager) {
        this.ui.common.modalManager.openModal(modal);
      } else {
        modal.classList.add('is-active');
      }
      if (symbolInput && typeof symbolInput.focus === 'function') {
        symbolInput.focus();
      }
    };

    const closeModal = () => {
      if (this.ui.common && this.ui.common.modalManager) {
        this.ui.common.modalManager.closeModal(modal);
      } else {
        modal.classList.remove('is-active');
      }
      currentCurveOriginalTitle = null;
    };

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const newSymbol = symbolInput ? symbolInput.value.trim() : '';
        const newUnit = unitInput ? unitInput.value.trim() : '';

        if (!newSymbol) {
          showToast("Veuillez entrer un symbole.", "is-danger");
          return;
        }

        if (currentCurveOriginalTitle) {
          this.ui.app.renameCurve(currentCurveOriginalTitle, newSymbol, newUnit);
        }

        closeModal();
      });
    }

    // Ajout des écouteurs pour fermer la modale
    [cancelButton, closeButton, background].forEach(el => {
      if (el) el.addEventListener('click', closeModal);
    });
  }

  /**
   * Initialise la modale de choix et de personnalisation des courbes.
   */
  initChooseCurvesModal() {
    /**
     * Gère le remplissage des menus déroulants et l'ouverture de la modale.
     */
    $("#choose-curves-button").addEventListener("click", () => {
      if (this.ui.data.curves.length === 0) {
        return;
      }
      populateCurveMenu();
      populateCurveSelect();
      populateColorSelect(document.getElementById("curveColorPicker"));
      populateLineWidthSelect();
      populateMarkersRadiusSelect();

      // Cherche la première courbe affichée (cochée) et la sélectionne
      const firstCheckedCurve = $("#choose-curves-menu").querySelector("input:checked");

      if (this.ui.data.curves.length === 1) {
        // EXCEPTION : S'il n'y a qu'une seule courbe au total, on force sa sélection (cochée ou non)
        const firstCurve = $("#choose-curves-menu").querySelector("a");
        if (firstCurve) firstCurve.click();
      } else if (firstCheckedCurve) {
        firstCheckedCurve.closest("a").click();
      } else {
        // Si aucune courbe n'est cochée, masquer le panneau de détails
        $("#curve-details-panel").classList.add("is-hidden");
      }

      $("#choose-x-curve-select").value = this.ui.grapher.currentXCurve; // Sélection de la grandeur X active

      $("#choose-curves-modal").classList.add("is-active");
    });

    /**
     * Remplit le menu des courbes disponibles dans la modale.
     * Ajoute les écouteurs d'événements pour la sélection et la gestion des cases à cocher.
     */
    const populateCurveMenu = () => {
      const menu = $("#choose-curves-menu");
      const panel = $("#curve-details-panel");
      menu.innerHTML = "";

      this.ui.data.curves.forEach(curve => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const formattedUnit = formatUnit(curve.unit);
        a.dataset.title = curve.title;
        a.title = formattedUnit ? `${curve.title} (${formattedUnit})` : curve.title;

        const input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("mr-2");
        const isXCurve = curve.title === this.ui.grapher.currentXCurve;
        const s = this.ui.grapher.chart.series.find(s => s.name === curve.title);
        input.checked = !!s?.visible;
        if (isXCurve) {
          input.disabled = true;
          input.style.visibility = "hidden";
        }

        const span = document.createElement("span");
        span.classList.add("ml-2", "curve-menu-label");
        if (formattedUnit) {
          span.innerHTML = `${curve.title} <span class="has-text-grey is-size-7">(${formattedUnit})</span>`;
        } else {
          span.innerHTML = curve.title;
        }

        const colorSwatch = document.createElement("span");
        colorSwatch.classList.add("curve-color-swatch");
        colorSwatch.style.backgroundColor = curve.color;
        colorSwatch.style.width = '16px';
        colorSwatch.style.height = '16px';
        colorSwatch.style.display = 'inline-block';
        colorSwatch.style.border = '1px solid #dbdbdb';
        colorSwatch.style.verticalAlign = 'middle';
        colorSwatch.style.marginLeft = '5px';

        a.appendChild(input);
        a.appendChild(colorSwatch);
        a.appendChild(span);

        li.appendChild(a);
        menu.appendChild(li);

        // Gestionnaire d'événement pour la case à cocher
        input.addEventListener("change", (e) => {
          e.stopPropagation(); // Empêche l'événement de se propager au lien parent
          const activeCurves = Array.from(menu.querySelectorAll("input:checked")).map(
            (cb) => cb.closest("a").dataset.title
          );
          this.ui.grapher.setVisibilityFromList(activeCurves);
        });

        // Gestionnaire de sélection au clic sur l'élément de liste
        a.addEventListener("click", (e) => {
          if (e.target.type !== 'checkbox') {
            e.preventDefault();
          }

          // Désactivation des autres éléments de la liste
          menu.querySelectorAll("a").forEach(item => item.classList.remove("is-active"));
          // Activation de l'élément sélectionné
          a.classList.add("is-active");

          // Remplissage et affichage du panneau de détails
          populateCurveDetails(curve);
          panel.classList.remove("is-hidden");
        });
      });

      // Sélection de la première courbe par défaut si disponible
      const firstCurveAnchor = menu.querySelector("a");
      if (firstCurveAnchor) {
        firstCurveAnchor.click();
      }
    };

    /**
     * Remplit le panneau des détails d'une courbe sélectionnée.
     */
    const populateCurveDetails = (curve) => {
      const panel = $("#curve-details-panel");
      panel.setAttribute("data-active-curve", curve.title);

      // Configuration du sélecteur de couleur
      const colorPicker = $("#curveColorPicker");
      colorPicker.value = curve.color;
      colorPicker.style.color = curve.color;

      // Configuration des options de marqueurs
      const markerToggle = $("#curveMarkerToggle");
      markerToggle.checked = curve.markers;
      const markerUIs = panel.querySelectorAll(".curveMarkerUI");
      markerUIs.forEach(el => el.classList.toggle("is-hidden", !curve.markers));
      $("#curveMarkerRadiusSelect").value = curve.markerRadius;
      $("#curveMarkerSymbolSelect").value = curve.markerSymbol;

      // Configuration du style de tracé
      const lineToggle = $("#curveLineToggle");
      lineToggle.checked = curve.line;
      const lineUIs = panel.querySelectorAll(".curveLineUI");
      lineUIs.forEach(el => el.classList.toggle("is-hidden", !curve.line));
      $("#curveLineWidthSelect").value = curve.lineWidth;
      $("#curveLineStyleSelect").value = curve.lineStyle;
    };

    /**
     * Remplit le menu déroulant des courbes X disponibles.
     */
    const populateCurveSelect = () => {
      $("#choose-x-curve-select").innerHTML = "";

      this.ui.data.curves.forEach(element => {
        let option = document.createElement("option");
        option.innerHTML = element.title;

        // Sélection de la grandeur X active
        if (element.title === this.ui.grapher.currentXCurve) {
          option.selected = true;
        }

        $("#choose-x-curve-select").appendChild(option);
      });
    };

    /**
     * Gère le changement de courbe X sélectionnée.
     */
    $("#choose-x-curve-select").addEventListener("change", () => {
      // Mise à jour de l'axe X dans le grapheur
      this.ui.grapher.setXCurve($("#choose-x-curve-select").value, true);
      this.ui.updateAllModelPanelVisibilityIcons();
      this.ui.updateXAxisSelector();
      populateCurveMenu();
    });

    /**
     * Remplit le menu déroulant des épaisseurs de ligne disponibles.
     */
    function populateLineWidthSelect() {
      const select = document.getElementById("curveLineWidthSelect");
      select.innerHTML = ""; // Réinitialisation des options
      for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
    }

    /**
     * Remplit le menu déroulant tailles des symboles de marqueurs disponibles.
     */
    function populateMarkersRadiusSelect() {
      const select = document.getElementById("curveMarkerRadiusSelect");
      select.innerHTML = ""; // Réinitialisation des options
      for (let i = 1; i <= 15; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
    }

    $("#choose-curves-confirm-button").addEventListener("click", () => {
      this.ui.common.modalManager.closeAllModals();
    });

    /**
     * Gère les changements dans les options de la courbe (couleur, marqueurs, ligne, etc.)
     * et met à jour la courbe en conséquence.
     */
    $("#choose-curves-modal").addEventListener('change', (e) => {
      const panel = $("#curve-details-panel");
      const activeCurveTitle = panel.getAttribute("data-active-curve");

      const curve = this.ui.data.getCurveByTitle(activeCurveTitle);
      if (!curve) {
        console.error("Impossible de trouver la courbe :", activeCurveTitle);
        return;
      }

      const targetId = e.target.id;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

      switch (targetId) {
        case 'curveColorPicker':
          curve.color = value;
          e.target.style.color = value;
          break;
        case 'curveMarkerToggle':
          curve.markers = value;
          panel.querySelectorAll(".curveMarkerUI").forEach(el => el.classList.toggle("is-hidden", !value));
          break;
        case 'curveMarkerRadiusSelect':
          curve.markerRadius = parseInt(value, 10);
          break;
        case 'curveMarkerSymbolSelect':
          curve.markerSymbol = value;
          break;
        case 'curveLineToggle':
          curve.line = value;
          panel.querySelectorAll(".curveLineUI").forEach(el => el.classList.toggle("is-hidden", !value));
          break;
        case 'curveLineWidthSelect':
          curve.lineWidth = parseInt(value, 10);
          break;
        case 'curveLineStyleSelect':
          curve.lineStyle = value;
          break;
      }

      // Mise à jour du graphique avec les nouveaux paramètres
      const series = this.ui.grapher.chart.series.find(s => s.name === activeCurveTitle);
      if (series) {
        series.update({
          color: curve.color,
          lineWidth: curve.line ? curve.lineWidth : 0,
          dashStyle: curve.lineStyle,
          marker: buildSeriesMarkerOptions(curve)
        });
      }

      // Mise à jour de la pastille de couleur dans la liste
      const activeAnchor = $(`#choose-curves-menu a[data-title="${activeCurveTitle}"]`);
      if (activeAnchor) {
        activeAnchor.querySelector('span:nth-child(2)').style.backgroundColor = curve.color;
      }
    });
  }
}
