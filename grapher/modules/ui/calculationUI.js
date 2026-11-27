import { formatNumber, formatUnit } from '../../../common/formatter.js';
import { showToast } from '../../../common/common.js';
import { stripInlineComment } from '../calculation.js';
import { FUNCTION_ALIASES, normalizeFunctionAliases } from '../calculation/expressionPreprocessor.js';

const $ = (selector) => document.querySelector(selector);

const FUNCTION_CATEGORIES = [
  {
    title: 'Usuelles & Puissances',
    functions: [
      { name: 'sqrt', desc: 'Racine carrée' },
      { name: 'cbrt', desc: 'Racine cubique' },
      { name: 'abs', desc: 'Valeur absolue' },
      { name: 'exp', desc: 'Exponentielle e^x' },
      { name: 'ln', desc: 'Logarithme népérien' },
      { name: 'log', desc: 'Logarithme base 10' }
    ]
  },
  {
    title: 'Statistiques',
    functions: [
      { name: 'mean', desc: 'Moyenne : mean(x)' },
      { name: 'median', desc: 'Médiane : median(x)' },
      { name: 'std', desc: 'Écart-type : std(x)' },
      { name: 'min', desc: 'Minimum : min(x)' },
      { name: 'max', desc: 'Maximum : max(x)' },
      { name: 'sum', desc: 'Somme : sum(x)' }
    ]
  },
  {
    title: 'Analyse',
    functions: [
      { name: 'diff', desc: 'Dérivée : diff(y, x)', tagClass: 'is-warning is-light' },
      { name: 'integrate', desc: 'Primitive : integrate(y, x)', tagClass: 'is-warning is-light' },
      { name: 'smooth', desc: 'Lissage : smooth(y, n)', tagClass: 'is-warning is-light' }
    ]
  },
  {
    title: 'Trigonométrie (rad)',
    functions: [
      { name: 'sin', desc: 'Sinus' },
      { name: 'cos', desc: 'Cosinus' },
      { name: 'tan', desc: 'Tangente' },
      { name: 'asin', desc: 'Arc sinus' },
      { name: 'acos', desc: 'Arc cosinus' },
      { name: 'atan', desc: 'Arc tangente' },
      { name: 'atan2', desc: 'Arc tangente : atan2(y, x)' }
    ]
  },
  {
    title: 'Hyperboliques',
    functions: [
      { name: 'sinh', desc: 'Sinus hyp.' },
      { name: 'cosh', desc: 'Cosinus hyp.' },
      { name: 'tanh', desc: 'Tangente hyp.' },
      { name: 'asinh', desc: 'Arc sinus hyp.' },
      { name: 'acosh', desc: 'Arc cosinus hyp.' },
      { name: 'atanh', desc: 'Arc tangente hyp.' }
    ]
  },
  {
    title: 'Arrondis',
    functions: [
      { name: 'round', desc: 'Arrondi au plus proche' },
      { name: 'floor', desc: 'Arrondi inférieur' },
      { name: 'ceil', desc: 'Arrondi supérieur' }
    ]
  }
];

const CONSTANT_CATEGORIES = [
  {
    title: 'Mécanique & Gravitation',
    constants: [
      { symbol: 'g', value: '9.81', unit: 'N/kg', desc: 'Intensité de la pesanteur (9,81 N/kg)' },
      { symbol: 'G', value: '6.674e-11', unit: 'N.m²/kg²', desc: 'Constante gravitationnelle (6,674×10<sup>-11</sup> N·m<sup>2</sup>·kg<sup>-2</sup>)' }
    ]
  },
  {
    title: 'Ondes, Optique & Quantique',
    constants: [
      { symbol: 'c', value: '2.998e8', unit: 'm/s', desc: 'Célérité de la lumière (2,998×10<sup>8</sup> m/s)' },
      { symbol: 'h', value: '6.626e-34', unit: 'J.s', desc: 'Constante de Planck (6,626×10<sup>-34</sup> J·s)' },
      { symbol: 'qe', label: 'q<sub>e</sub>', value: '1.602e-19', unit: 'C', desc: 'Charge élémentaire (1,602×10<sup>-19</sup> C)' }
    ]
  },
  {
    title: 'Thermodynamique & Chimie',
    constants: [
      { symbol: 'NA', label: 'N<sub>A</sub>', value: '6.022e23', unit: 'mol^-1', desc: "Constante d'Avogadro (6,022×10<sup>23</sup> mol<sup>-1</sup>)" },
      { symbol: 'R', value: '8.314', unit: 'J/(mol.K)', desc: 'Constante des gaz parfaits (8,314 J·mol<sup>-1</sup>·K<sup>-1</sup>)' },
      { symbol: 'kB', label: 'k<sub>B</sub>', value: '1.381e-23', unit: 'J/K', desc: 'Constante de Boltzmann (1,381×10<sup>-23</sup> J/K)' },
      { symbol: 'F', value: '9.649e4', unit: 'C/mol', desc: 'Constante de Faraday (9,649×10<sup>4</sup> C/mol)' }
    ]
  },
  {
    title: 'Mathématiques',
    constants: [
      { symbol: 'pi', isNative: true, desc: 'Nombre π (3,14159...)' }
    ]
  }
];

export default class CalculationUI {
  constructor(ui) {
    this.ui = ui;
  }

  /**
   * Met à jour l'interface utilisateur de la section Calcul en fonction des courbes, paramètres et fonctions disponibles.
   */
  updateCalculationUI() {
    let populateList = (containerId, items, options = {}) => {
      const { isParameter = false } = options;
      const containerElement = document.getElementById(containerId);
      if (!containerElement) return;
      containerElement.innerHTML = ''; // Vide le conteneur

      const colors = {
        variable: '#008000',
        parameter: '#7b1fa2'
      };

      const ul = document.createElement('ul');
      ul.className = 'menu-list';

      if (isParameter) {
        const significantDigits = this.ui.data?.settings?.significantDigits ?? 4;
        for (const [key, param] of Object.entries(items)) {
          const li = document.createElement('li');
          const a = document.createElement('a');

          const formattedUnit = formatUnit(param.unit);
          const unitText = formattedUnit ? ` ${formattedUnit}` : '';
          const displayValue = formatNumber(param.value, significantDigits, { html: true });
          const plainValue = formatNumber(param.value, significantDigits);

          a.innerHTML = `<span style="color: ${colors.parameter}; font-weight: bold;">${key}</span> = ${displayValue}<span style="color: #7a7a7a;">${unitText}</span>`;
          a.title = `${key} = ${plainValue}${unitText}`;
          a.dataset.value = key;
          li.appendChild(a);
          ul.appendChild(li);
        }
      } else { // C'est une grandeur
        items.forEach(curve => {
          const li = document.createElement('li');
          const a = document.createElement('a');

          const formattedUnit = formatUnit(curve.unit);
          const unitText = formattedUnit ? ` (${formattedUnit})` : '';

          a.innerHTML = `<span style="color: ${colors.variable}; font-weight: bold;">${curve.title}</span><span style="color: #7a7a7a;">${unitText}</span>`;
          a.title = `${curve.title}${unitText}`;
          a.dataset.value = curve.title; // On insère toujours juste le nom
          li.appendChild(a);
          ul.appendChild(li);
        });
      }
      containerElement.appendChild(ul);
    };

    populateList('calculation-sidebar-curves', this.ui.data.curves);
    populateList('calculation-sidebar-params', this.ui.data.parameters, { isParameter: true });

    // Génère le contenu du méga-dropdown des fonctions s'il est vide
    const functionsContent = document.getElementById('calculation-functions-content');
    const hasChildren = functionsContent && (
      (functionsContent.children && functionsContent.children.length > 0) ||
      (functionsContent.childNodes && functionsContent.childNodes.length > 0) ||
      functionsContent._initialized
    );
    if (functionsContent && !hasChildren) {
      functionsContent._initialized = true;

      const columnsDiv = document.createElement('div');
      columnsDiv.className = 'columns is-multiline is-variable is-3';

      FUNCTION_CATEGORIES.forEach(category => {
        const col = document.createElement('div');
        col.className = 'column is-4';

        const label = document.createElement('p');
        label.className = 'menu-label mb-2';
        label.textContent = category.title;
        col.appendChild(label);

        category.functions.forEach(fn => {
          const a = document.createElement('a');
          a.className = 'dropdown-item p-1 is-flex is-align-items-center is-justify-content-space-between';
          if (!a.dataset) a.dataset = {};
          a.dataset.value = `${fn.name}()`;
          if (a.setAttribute) a.setAttribute('data-value', `${fn.name}()`);
          a.style.borderRadius = '4px';

          const tagClass = fn.tagClass || 'is-link is-light';
          a.innerHTML = `<span class="tag ${tagClass} has-text-weight-bold" style="font-family: monospace;">${fn.name}</span><span class="is-size-7 has-text-grey ml-2">${fn.desc}</span>`;
          col.appendChild(a);
        });

        columnsDiv.appendChild(col);
      });

      functionsContent.appendChild(columnsDiv);
    }

    // Génère le contenu du méga-dropdown des constantes s'il est vide
    const constantsContent = document.getElementById('calculation-constants-content');
    const hasConstantsChildren = constantsContent && (
      (constantsContent.children && constantsContent.children.length > 0) ||
      (constantsContent.childNodes && constantsContent.childNodes.length > 0) ||
      constantsContent._initialized
    );
    if (constantsContent && !hasConstantsChildren) {
      constantsContent._initialized = true;

      const columnsDiv = document.createElement('div');
      columnsDiv.className = 'columns is-multiline is-variable is-3';

      CONSTANT_CATEGORIES.forEach(category => {
        const col = document.createElement('div');
        col.className = 'column is-6';

        const label = document.createElement('p');
        label.className = 'menu-label mb-2';
        label.textContent = category.title;
        col.appendChild(label);

        category.constants.forEach(item => {
          const a = document.createElement('a');
          a.className = 'dropdown-item p-1 is-flex is-align-items-center is-justify-content-space-between';
          if (!a.dataset) a.dataset = {};
          a.dataset.symbol = item.symbol;
          a.dataset.value = item.value || '';
          a.dataset.unit = item.unit || '';
          a.dataset.native = item.isNative ? 'true' : 'false';
          if (a.setAttribute) {
            a.setAttribute('data-symbol', item.symbol);
            a.setAttribute('data-value', item.value || '');
            a.setAttribute('data-unit', item.unit || '');
            a.setAttribute('data-native', item.isNative ? 'true' : 'false');
          }
          a.style.borderRadius = '4px';

          a.innerHTML = `<span class="tag is-purple-light has-text-weight-bold" style="font-family: monospace; flex-shrink: 0;"><span style="display: inline-block; line-height: normal;">${item.label || item.symbol}</span></span><span class="is-size-7 has-text-grey ml-2" style="white-space: nowrap;">${item.desc}</span>`;
          col.appendChild(a);
        });

        columnsDiv.appendChild(col);
      });

      constantsContent.appendChild(columnsDiv);
    }

    const curveNames = this.ui.data.curves.map(c => c.title);
    const parameterNames = Object.keys(this.ui.data.parameters);
    const functionNames = this.ui.calculation.getAvailableFunctions();

    CodeMirror.defineMode("phyweb-calc", function() {
      return {
        token: function(stream) {
          if (stream.eatSpace()) return null;

          // --- Commentaires ---
          if (stream.match(/^#.*/) || stream.match(/^\/\/.*/) || stream.match(/^'.*/)) return "comment";

          // Détection de la position par rapport au signe '=' (membre de gauche vs membre de droite)
          const line = typeof stream.string === 'string' ? stream.string : '';
          const eqIndex = line.indexOf('=');
          const pos = typeof stream.pos === 'number' ? stream.pos : 0;
          const isLHS = eqIndex === -1 || pos < eqIndex;

          const wordRegex = isLHS
            ? /^[a-zA-ZÀ-ÿ_][a-zA-Z0-9À-ÿ]*(?:_[^=\s,#;]+)?/
            : /^[a-zA-ZÀ-ÿ_][a-zA-Z0-9À-ÿ]*(?:_[a-zA-Z0-9À-ÿ]+)?/;

          if (stream.match(/^π/)) {
            return "def";
          }

          if (stream.match(wordRegex)) {
            const word = stream.current();

            if (['diff', 'integrate', 'smooth'].includes(word)) {
              return "phyweb-function-warning";
            }

            if (functionNames.includes(word)) {
              return "phyweb-function";
            }

            const aliasTarget = !isLHS ? FUNCTION_ALIASES[word.toLowerCase()] : undefined;
            if (aliasTarget && /^\s*\(/.test(line.slice(stream.pos))) {
              if (['diff', 'integrate', 'smooth'].includes(aliasTarget)) {
                return "phyweb-function-warning";
              }
              if (functionNames.includes(aliasTarget)) {
                return "phyweb-function";
              }
            }

            const baseName = word.split('_')[0];
            if (curveNames.includes(baseName)) {
              return "variable-2";
            }
            if (parameterNames.includes(baseName) || word.toLowerCase() === 'pi' || baseName.toLowerCase() === 'pi') {
              return "def";
            }

            // Si le mot n'est pas reconnu, il n'est pas coloré.
            return null;
          }

          if (stream.match(/^[0-9]+([,.][0-9]+)?([eE][+-]?[0-9]+)?/)) return "number";
          if (stream.match(/^[⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)) return "number";
          if (stream.match(/^[=+\-*/^(),]/)) return "operator";

          stream.next();
          return null;
        }
      };
    });

    this.ui.editor.setOption("mode", "phyweb-calc");
  }

  /**
   * Vérifie si le script de l'éditeur de calculs contient au moins une formule valide
   * (ignore les lignes vides, les commentaires et le texte sans assignation '=').
   * @param {string} [text] - Texte optionnel à analyser (par défaut le contenu de l'éditeur)
   * @returns {boolean}
   */
  hasCalculationFormulas(text) {
    const rawText = typeof text === 'string'
      ? text
      : (typeof this.ui.editor?.getValue === 'function' ? this.ui.editor.getValue() : '');

    if (!rawText || typeof rawText !== 'string') {
      return false;
    }

    const lines = rawText.split('\n');
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
        continue;
      }

      const leftPart = parts[0].trim();
      const expression = parts.slice(1).join('=').trim();
      const variableName = leftPart.split('_')[0].trim().replace(/\s+/g, '');

      if (variableName.length > 0 && expression.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Vérifie si le script de l'éditeur de calculs contient au moins une formule
   * dont le résultat dépend de l'ordre des lignes (dérivation, intégration, lissage,
   * somme cumulée ou indexation directe).
   * @param {string} [text] - Texte optionnel à analyser (par défaut le contenu de l'éditeur)
   * @returns {boolean}
   */
  hasOrderDependentFormulas(text) {
    const rawText = typeof text === 'string'
      ? text
      : (typeof this.ui.editor?.getValue === 'function' ? this.ui.editor.getValue() : '');

    if (!rawText || typeof rawText !== 'string') {
      return false;
    }

    const orderDependentPattern = /(?:\b(?:diff|integrate|smooth|cumsum)\s*\()|(?:[\w)]\s*\[)/i;
    const lines = rawText.split('\n');

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
        continue;
      }

      const leftPart = parts[0].trim();
      const rawExpression = parts.slice(1).join('=').trim();
      const expression = normalizeFunctionAliases(stripInlineComment(rawExpression));
      const variableName = leftPart.split('_')[0].trim().replace(/\s+/g, '');

      if (variableName.length > 0 && expression.length > 0 && orderDependentPattern.test(expression)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Marque les calculs de grandeurs comme obsolètes ou à jour, et affiche/masque
   * le bouton de recalcul dans la barre d'outils du tableur.
   * @param {boolean} isStale
   */
  setCalculationsStale(isStale) {
    if (isStale) {
      const hasCalcCurves = Boolean(this.ui.data?.curves && this.ui.data.curves.some(c => c.type === 'calculation'));
      const hasUserParams = Boolean(this.ui.data?.parameters && Object.values(this.ui.data.parameters).some(p => p && p.type !== 'model'));
      const hasEditorFormulas = this.ui.hasCalculationFormulas();
      if (!hasCalcCurves && !hasUserParams && !hasEditorFormulas) {
        isStale = false;
      }
    }

    this.ui.calculationsStale = Boolean(isStale);

    const recalculateButton = document.getElementById('recalculate-spreadsheet-button');
    if (recalculateButton) {
      recalculateButton.classList.toggle('is-hidden', !this.ui.calculationsStale);
    }
  }

  /**
   * Initialise les contrôles de calcul et gère les événements associés.
   */
  initCalculationControls() {
    // Initialisation de l'éditeur de code
    let initializeEditor = () => {
      this.ui.editor.getWrapperElement().classList.add('textarea');
      this.ui.editor.getWrapperElement().classList.add('p-0');

      // Raccourcis clavier
      this.ui.editor.setOption("extraKeys", {
        "Ctrl-Enter": () => {
          $("#apply-calculation-button").click();
        },
        "Cmd-Enter": () => { // Pour les utilisateurs Mac
          $("#apply-calculation-button").click();
        }
      });

      // Met à jour l'affichage quand on change d'onglet
      $("#calculs-tab").addEventListener("click", () => {
        setTimeout(() => {
          this.ui.editor.refresh();

          const currentCursor = this.ui.editor.getCursor();
          if (currentCursor.line === 0 && currentCursor.ch === 0) {
            const lastLineIndex = this.ui.editor.lastLine();
            const lastLineContent = this.ui.editor.getLine(lastLineIndex);
            if (lastLineContent !== "") {
              this.ui.editor.replaceRange('\n', { line: lastLineIndex, ch: lastLineContent.length });
            }
            this.ui.editor.setCursor(this.ui.editor.lastLine(), 0);
          }

          this.ui.editor.focus();
        }, 1);
      });
    };

    /**
     * Insère du texte dans CodeMirror.
     * @param {string} textToInsert - Le texte à insérer.
     */
    const insertTextInEditor = (textToInsert) => {
      let finalInsert = textToInsert;
      let cursorOffset = textToInsert.length;

      if (textToInsert.endsWith('()')) {
        const twoArgFunctions = ['diff()', 'integrate()', 'atan2()'];
        finalInsert = twoArgFunctions.includes(textToInsert)
          ? `${textToInsert.slice(0, -2)}(,)`
          : textToInsert.slice(0, -1);
        cursorOffset = finalInsert.indexOf(',') !== -1 ? finalInsert.indexOf(',') : finalInsert.length;
      }

      this.ui.editor.replaceSelection(finalInsert);
      const cursor = this.ui.editor.getCursor();
      this.ui.editor.setCursor({ line: cursor.line, ch: cursor.ch - (finalInsert.length - cursorOffset) });
      this.ui.editor.focus();
    };

    initializeEditor(); // Initialise l'éditeur
    this.ui.updateCalculationUI(); // Met à jour l'UI une première fois

    $("#apply-calculation-button").addEventListener("click", () => {
      const success = this.ui.app.applyCalculation(this.ui.editor.getValue());

      if (success) {
        const checkmark = $('#calculation-success-checkmark');
        checkmark.innerHTML = '<i class="fas fa-check-circle"></i>';
        checkmark.classList.add('show');

        setTimeout(() => {
          checkmark.classList.remove('show');
          checkmark.innerHTML = '';
        }, 2000);
      }
    });

    // Écoute les clics sur la barre latérale (event delegation)
    $('#calculation-sidebar').addEventListener('click', (e) => {
      const link = e.target.closest('a');

      if (link) {
        e.preventDefault();
        const text = link.dataset.value;
        if (text) {
          insertTextInEditor(text);
        }
      }
    });

    // Gestion de l'ouverture/fermeture du dropdown des fonctions
    const functionsDropdown = document.getElementById('functions-dropdown');
    const constantsDropdown = document.getElementById('constants-dropdown');

    if (functionsDropdown) {
      const trigger = functionsDropdown.querySelector?.('.dropdown-trigger');
      if (trigger) {
        trigger.addEventListener('click', (event) => {
          event.stopPropagation();
          if (constantsDropdown) {
            constantsDropdown.classList.remove('is-active');
          }
          functionsDropdown.classList.toggle('is-active');
        });
      }

      document.addEventListener('click', (event) => {
        if (!functionsDropdown.contains || !functionsDropdown.contains(event.target)) {
          functionsDropdown.classList.remove('is-active');
        }
      });
    }

    // Gestion de l'ouverture/fermeture du dropdown des constantes
    if (constantsDropdown) {
      const trigger = constantsDropdown.querySelector?.('.dropdown-trigger');
      if (trigger) {
        trigger.addEventListener('click', (event) => {
          event.stopPropagation();
          if (functionsDropdown) {
            functionsDropdown.classList.remove('is-active');
          }
          constantsDropdown.classList.toggle('is-active');
        });
      }

      document.addEventListener('click', (event) => {
        if (!constantsDropdown.contains || !constantsDropdown.contains(event.target)) {
          constantsDropdown.classList.remove('is-active');
        }
      });
    }

    // Écouteur de clic (event delegation) sur les boutons rapides d'exposants
    const exponentsToolbar = document.getElementById('calculation-exponents-toolbar');
    if (exponentsToolbar) {
      exponentsToolbar.addEventListener('click', (e) => {
        const btn = e.target?.closest ? e.target.closest('button[data-value]') : null;
        if (!btn) return;
        e.preventDefault();
        const value = btn.dataset?.value || btn.getAttribute?.('data-value');
        if (value) {
          insertTextInEditor(value);
        }
      });
    }

    // Écouteur de clic (event delegation) sur le méga-dropdown des fonctions
    const functionsContent = document.getElementById('calculation-functions-content');
    if (functionsContent) {
      functionsContent.addEventListener('click', (e) => {
        const link = e.target?.closest ? e.target.closest('a[data-value]') : null;
        if (link) {
          e.preventDefault();
          const value = link.dataset?.value || link.getAttribute?.('data-value');
          if (value) {
            insertTextInEditor(value);
          }
          if (functionsDropdown) {
            functionsDropdown.classList.remove('is-active');
          }
        }
      });
    }

    // Écouteur de clic (event delegation) sur le méga-dropdown des constantes
    const constantsContent = document.getElementById('calculation-constants-content');
    if (constantsContent) {
      constantsContent.addEventListener('click', (e) => {
        const link = e.target?.closest ? e.target.closest('a[data-symbol]') : null;
        if (!link) return;
        e.preventDefault();

        const symbol = link.dataset?.symbol || link.getAttribute?.('data-symbol');
        const value = link.dataset?.value || link.getAttribute?.('data-value') || '';
        const unit = link.dataset?.unit || link.getAttribute?.('data-unit') || '';
        const isNative = (link.dataset?.native || link.getAttribute?.('data-native')) === 'true';

        if (!symbol) return;

        if (isNative) {
          insertTextInEditor(symbol);
          if (constantsDropdown) {
            constantsDropdown.classList.remove('is-active');
          }
          return;
        }

        // Cas d'une constante physique (g, c, NA...)
        const isUsedBySpreadsheet = this.ui.data.curves.some(c => c.title === symbol && c.type !== 'calculation');
        const isUsedByModel = this.ui.data.parameters?.[symbol]?.type === 'model';
        if (isUsedBySpreadsheet || isUsedByModel) {
          const source = isUsedBySpreadsheet ? "une grandeur du tableur" : "un paramètre de modèle";
          showToast(`Le symbole "${symbol}" est déjà utilisé par ${source}.`, "is-warning");
          return;
        }

        // Vérifie si une ligne déclarant ce symbole existe déjà dans l'éditeur
        const editorText = this.ui.editor.getValue();
        const declRegex = new RegExp(`^\\s*${symbol}(?:_[^=\\s]+)?\\s*=\\s*(.*)$`, 'm');
        const declMatch = editorText.match(declRegex);
        let alreadyDeclared = false;
        if (declMatch) {
          const rhs = declMatch[1].trim();
          const cleanRhs = rhs.split(/(?:#|\/\/|')/)[0].trim();
          const normalizedRhs = cleanRhs.replace(/,/g, '.');
          const normalizedValue = value.replace(/,/g, '.');
          const isSame = normalizedRhs === normalizedValue || (
            normalizedRhs !== '' &&
            normalizedValue !== '' &&
            !isNaN(Number(normalizedRhs)) &&
            !isNaN(Number(normalizedValue)) &&
            Number(normalizedRhs) === Number(normalizedValue)
          );
          if (!isSame) {
            showToast(`Le symbole "${symbol}" est déjà défini dans l'éditeur avec une autre valeur.`, "is-warning");
            return;
          }
          alreadyDeclared = true;
        }

        const cursor = this.ui.editor.getCursor();
        const currentLineText = this.ui.editor.getLine(cursor.line) || '';
        const textBeforeCursor = currentLineText.slice(0, cursor.ch);
        const isWritingRightHandSide = textBeforeCursor.includes('=');

        if (!alreadyDeclared) {
          const defLine = `${unit ? symbol + '_' + unit : symbol} = ${value}\n`;
          this.ui.editor.replaceRange(defLine, { line: 0, ch: 0 });

          if (isWritingRightHandSide) {
            insertTextInEditor(symbol);
          } else if (cursor.line === 0 && cursor.ch === 0) {
            this.ui.editor.setCursor({ line: 1, ch: 0 });
          }
        } else {
          if (isWritingRightHandSide) {
            insertTextInEditor(symbol);
          }
        }

        if (constantsDropdown) {
          constantsDropdown.classList.remove('is-active');
        }
        this.ui.editor.focus();
      });
    }
  }
}
