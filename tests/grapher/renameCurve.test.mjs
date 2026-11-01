import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import App from '../../grapher/modules/app.js';
import { updateFormulasReferences } from '../../grapher/modules/ioManager.js';

describe('IOManager - updateFormulasReferences', () => {
  it('ne remplace pas les sous-mots (ex: x dans exp, flux, max)', () => {
    const text = 'y = exp(2) + max(3, 4) * flux';
    const result = updateFormulasReferences(text, { x: 'x_new' });
    assert.equal(result, 'y = exp(2) + max(3, 4) * flux');
  });

  it('ne remplace pas une variable plus courte préfixée ou suffixée par des lettres/chiffres/underscores (v dans v0 ou vx_max)', () => {
    const text = 'res = v0 * t + vx_max';
    const result = updateFormulasReferences(text, { v: 'v_new' });
    assert.equal(result, 'res = v0 * t + vx_max');
  });

  it('remplace la variable isolée dans des expressions mathématiques', () => {
    assert.equal(updateFormulasReferences('x + 2', { x: 'x_new' }), 'x_new + 2');
    assert.equal(updateFormulasReferences('2 + x', { x: 'x_new' }), '2 + x_new');
    assert.equal(updateFormulasReferences('x * 2', { x: 'x_new' }), 'x_new * 2');
    assert.equal(updateFormulasReferences('(x)', { x: 'x_new' }), '(x_new)');
  });

  it('remplace la variable passée en argument d\'une fonction sans toucher au nom de la fonction (ex: exp(x))', () => {
    const text = 'y = exp(x) + sin(x) / cos(x)';
    const result = updateFormulasReferences(text, { x: 'x_new' });
    assert.equal(result, 'y = exp(x_new) + sin(x_new) / cos(x_new)');
  });

  it('gère correctement les retours à la ligne et les multi-occurrences', () => {
    const text = 'y = 2 * x + 1\nz = x^2';
    const result = updateFormulasReferences(text, { x: 'pos_x' });
    assert.equal(result, 'y = 2 * pos_x + 1\nz = pos_x^2');
  });

  it('gère les grandeurs avec accents', () => {
    const text = 'E = m * durée';
    const result = updateFormulasReferences(text, { durée: 'temps' });
    assert.equal(result, 'E = m * temps');
  });

  it('retourne le texte d\'origine si text est vide ou null', () => {
    assert.equal(updateFormulasReferences('', { x: 'x_new' }), '');
    assert.equal(updateFormulasReferences(null, { x: 'x_new' }), null);
  });
});

describe('App - renameCurve (Mise à jour automatique des formules)', () => {
  let app;
  let toasts = [];
  let updatedEditorContent = null;
  let updateCalculationUICalled = 0;
  
  beforeEach(() => {
    toasts = [];
    updatedEditorContent = null;
    updateCalculationUICalled = 0;

    // Intercepter la création des toasts
    global.__querySelectorOverride = (sel) => {
      if (sel === '.toast-container') {
        return {
          appendChild: (el) => {
            toasts.push({
              className: el.className,
              innerHTML: el.innerHTML
            });
          }
        };
      }
      return null;
    };

    app = Object.create(App.prototype);
    
    // Mock des dépendances nécessaires pour éviter les erreurs
    app.symbolValidator = {
      validate: () => ({ isValid: true })
    };
    
    app.grapher = {
      currentXCurve: 't',
      chart: {
        series: [],
        redraw: () => {}
      },
      setXCurve: () => {},
      updateChart: () => {}
    };

    app.data = {
      getCurveByTitle: (title) => ({ title, unit: '' }),
      models: []
    };

    app.spreadsheet = { update: () => {} };

    app.uiManager = {
      updateSortUI: () => {},
      updateXAxisSelector: () => {},
      updateCalculationUI: () => {
        updateCalculationUICalled++;
      },
      updateModelPanel: () => {}
    };
  });

  it('ne met pas à jour quand le nom court (x) est une sous-chaîne d\'une autre fonction (exp)', () => {
    app.editor = {
      getValue: () => 'exp(2)',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(toasts.length, 0, 'Il ne doit pas y avoir de toast si x est dans exp');
    assert.equal(updatedEditorContent, null, 'L\'éditeur ne doit pas être modifié');
  });

  it('ne met pas à jour quand le nom court (v) est une sous-chaîne d\'une variable plus longue (v0)', () => {
    app.editor = {
      getValue: () => 'v0 * t',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('v', 'v_new', 'm/s');

    assert.equal(toasts.length, 0, 'Il ne doit pas y avoir de toast si v est dans v0');
    assert.equal(updatedEditorContent, null, 'L\'éditeur ne doit pas être modifié');
  });

  it('met à jour et affiche un toast d\'information quand le nom est explicitement utilisé dans la formule (x)', () => {
    app.editor = {
      getValue: () => 'x + 2',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(updatedEditorContent, 'x_new + 2', 'L\'éditeur doit contenir la formule mise à jour');
    assert.equal(toasts.length, 1, 'Il doit y avoir un toast d\'information');
    assert.ok(toasts[0].className.includes('is-info'), 'Le toast doit être de type is-info');
    assert.ok(toasts[0].innerHTML.includes('Les formules utilisant &quot;x&quot; ont été mises à jour avec &quot;x_new&quot;.') ||
              toasts[0].innerHTML.includes('Les formules utilisant "x" ont été mises à jour avec "x_new".'),
              'Le toast doit contenir le message de confirmation');
    assert.ok(updateCalculationUICalled >= 2, 'updateCalculationUI doit être appelé pour rafraîchir l\'éditeur');
  });

  it('met à jour quand le nom est explicitement utilisé au début (x*2)', () => {
    app.editor = {
      getValue: () => 'x*2',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(updatedEditorContent, 'x_new*2');
    assert.equal(toasts.length, 1);
  });

  it('met à jour quand le nom est explicitement utilisé à la fin (2+x)', () => {
    app.editor = {
      getValue: () => '2+x',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(updatedEditorContent, '2+x_new');
    assert.equal(toasts.length, 1);
  });

  it('met à jour uniquement le paramètre de fonction dans exp(x)', () => {
    app.editor = {
      getValue: () => 'y = exp(x)',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(updatedEditorContent, 'y = exp(x_new)');
    assert.equal(toasts.length, 1);
  });

  it('ne fait rien si oldTitle === newTitle', () => {
    app.editor = {
      getValue: () => 'x + 2',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x', 'm');

    assert.equal(updatedEditorContent, null);
    assert.equal(toasts.length, 0);
  });

  it('ne fait rien si l\'éditeur est vide', () => {
    app.editor = {
      getValue: () => '',
      setValue: (val) => { updatedEditorContent = val; }
    };

    app.renameCurve('x', 'x_new', 'm');

    assert.equal(updatedEditorContent, null);
    assert.equal(toasts.length, 0);
  });
});
