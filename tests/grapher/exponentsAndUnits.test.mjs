import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { formatUnit } from '../../common/formatter.js';
import { Calculation } from '../../grapher/modules/calculation.js';
import { Data } from '../../grapher/modules/data.js';
import UIManager from '../../grapher/modules/ui.js';

describe('Formatage des exposants dans les unités (formatUnit)', () => {
  it('convertit les exposants positifs et négatifs avec ^ en exposants Unicode', () => {
    assert.strictEqual(formatUnit('m/s^2'), 'm/s²');
    assert.strictEqual(formatUnit('m.s^-1'), 'm.s⁻¹');
    assert.strictEqual(formatUnit('m.s^-2'), 'm.s⁻²');
    assert.strictEqual(formatUnit('mol^-1'), 'mol⁻¹');
    assert.strictEqual(formatUnit('J.mol^-1.K^-1'), 'J.mol⁻¹.K⁻¹');
    assert.strictEqual(formatUnit('W/(m^2.K^4)'), 'W/(m².K⁴)');
    assert.strictEqual(formatUnit('10^-3 mol/L'), '10⁻³ mol/L');
    assert.strictEqual(formatUnit('cm^3'), 'cm³');
    assert.strictEqual(formatUnit('s^+2'), 's⁺²');
  });

  it('supporte les exposants entre parenthèses ex: m.s^(-1)', () => {
    assert.strictEqual(formatUnit('m.s^(-1)'), 'm.s⁻¹');
    assert.strictEqual(formatUnit('m/s^(2)'), 'm/s²');
    assert.strictEqual(formatUnit('10^(-12) W/m^(2)'), '10⁻¹² W/m²');
  });

  it('convertit les astérisques * en point médian · sans toucher aux points normaux', () => {
    assert.strictEqual(formatUnit('N*m'), 'N·m');
    assert.strictEqual(formatUnit('m*s^-1'), 'm·s⁻¹');
    assert.strictEqual(formatUnit('J*mol^-1*K^-1'), 'J·mol⁻¹·K⁻¹');
    assert.strictEqual(formatUnit('W/(m^2*K^4)'), 'W/(m²·K⁴)');
    assert.strictEqual(formatUnit('m.s^-1'), 'm.s⁻¹');
    assert.strictEqual(formatUnit('0.1 mol/L'), '0.1 mol/L');
    assert.strictEqual(formatUnit('u.a.'), 'u.a.');
  });

  it('préserve les unités déjà en Unicode, sans exposant, vides ou incomplètes', () => {
    assert.strictEqual(formatUnit('m/s²'), 'm/s²');
    assert.strictEqual(formatUnit('m·s⁻¹'), 'm·s⁻¹');
    assert.strictEqual(formatUnit('kg'), 'kg');
    assert.strictEqual(formatUnit(''), '');
    assert.strictEqual(formatUnit(null), '');
    assert.strictEqual(formatUnit(undefined), '');
    assert.strictEqual(formatUnit('m^'), 'm^');
    assert.strictEqual(formatUnit('m^n'), 'm^n');
  });

  it('formate les unités dans Data.getHeaders() sans modifier curve.unit en interne', () => {
    const data = new Data();
    const curve = data.addCurve('a', 'm.s^-2');
    assert.strictEqual(curve.unit, 'm.s^-2');
    assert.deepStrictEqual(data.getHeaders(), ['a (m.s⁻²)']);
  });
});

describe('Exposants Unicode dans les calculs (Calculation)', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculation({ derivatePoints: 5, derivateEdges: true });
  });

  it('prétraite tous les exposants Unicode en syntaxe math.js', () => {
    assert.strictEqual(calc.preprocessSpecialCharacters('x²'), 'x^2');
    assert.strictEqual(calc.preprocessSpecialCharacters('x³'), 'x^3');
    assert.strictEqual(calc.preprocessSpecialCharacters('x¹²'), 'x^12');
    assert.strictEqual(calc.preprocessSpecialCharacters('t⁻¹'), 't^(-1)');
    assert.strictEqual(calc.preprocessSpecialCharacters('10⁻³'), '10^(-3)');
    assert.strictEqual(calc.preprocessSpecialCharacters('(x + 1)⁻²'), '(x + 1)^(-2)');
    assert.strictEqual(calc.preprocessSpecialCharacters('x⁺³'), 'x^(+3)');
  });

  it('évalue correctement les expressions avec exposants Unicode sur scalaires et tableaux', () => {
    const scope = {
      x: [1, 2, 4],
      t: [2, 4, 8]
    };

    const resCube = calc.evaluate('x³', scope);
    assert.deepStrictEqual(resCube, [1, 8, 64]);

    const resInv = calc.evaluate('t⁻¹', scope);
    assert.deepStrictEqual(resInv, [0.5, 0.25, 0.125]);

    const resSci = calc.evaluate('2,5 * 10⁻³', scope);
    assert.ok(Math.abs(resSci - 0.0025) < 1e-12);

    const resCombo = calc.evaluate('(x + 1)² - t⁻²', scope);
    assert.deepStrictEqual(resCombo, [4 - 0.25, 9 - 0.0625, 25 - 1 / 64]);
  });

  it('conserve la syntaxe brute des unités lors de evaluateBlock', () => {
    const { results, errors } = calc.evaluateBlock(
      [{ variableName: 'v', expression: 'x * t⁻¹', unit: 'm.s^-1' }],
      { x: [2, 4, 6], t: [1, 2, 3] }
    );
    assert.strictEqual(errors.length, 0);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].unit, 'm.s^-1');
    assert.deepStrictEqual(results[0].data, [2, 2, 2]);
  });
});

describe('Coloration syntaxique et boutons rapides dans l\'onglet Calculs', () => {
  it('colore les exposants Unicode sur le membre de droite dans le mode phyweb-calc', () => {
    global.__createElementOverride = (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      id: '',
      style: {},
      dataset: {},
      innerHTML: '',
      children: [],
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      setAttribute() {},
      removeAttribute() {}
    });

    let definedFactory = null;
    global.CodeMirror = {
      defineMode: (name, factory) => {
        if (name === 'phyweb-calc') definedFactory = factory;
      }
    };

    const mockData = {
      curves: [{ title: 't', unit: 's' }, { title: 'v', unit: 'm.s^-1' }],
      parameters: {},
      models: []
    };
    const calc = new Calculation({ derivatePoints: 5, derivateEdges: true });
    const ui = new UIManager(null, mockData, null, calc, null, null);
    ui.editor = { setOption: () => {} };
    ui.updateCalculationUI();

    const mode = definedFactory();
    const lineText = 'y = v² + t⁻¹ + 10⁻³';
    let pos = 0;
    let matched = '';
    const tokens = [];
    const stream = {
      string: lineText,
      get pos() { return pos; },
      eatSpace: () => {
        const m = lineText.slice(pos).match(/^\s+/);
        if (m) { pos += m[0].length; return true; }
        return false;
      },
      match: (regex) => {
        const m = lineText.slice(pos).match(regex);
        if (m && m.index === 0) { matched = m[0]; pos += matched.length; return true; }
        return false;
      },
      current: () => matched,
      next: () => { matched = lineText.slice(pos, pos + 1); pos++; return matched; },
      eol: () => pos >= lineText.length
    };
    while (!stream.eol()) {
      const style = mode.token(stream);
      if (style) tokens.push({ text: stream.current(), style });
    }

    assert.ok(tokens.some(t => t.text === 'v' && t.style === 'variable-2'));
    assert.ok(tokens.some(t => t.text === '²' && t.style === 'number'));
    assert.ok(tokens.some(t => t.text === 't' && t.style === 'variable-2'));
    assert.ok(tokens.some(t => t.text === '⁻¹' && t.style === 'number'));
    assert.ok(tokens.some(t => t.text === '⁻³' && t.style === 'number'));
  });

  it('expose la barre de boutons rapides d\'exposants dans grapher/index.html', () => {
    const html = fs.readFileSync(path.resolve('grapher/index.html'), 'utf8');
    assert.ok(html.includes('id="calculation-exponents-toolbar"'));
    assert.ok(html.includes('data-value="²"'));
    assert.ok(html.includes('data-value="³"'));
    assert.ok(html.includes('data-value="⁻¹"'));
    assert.ok(html.includes('data-value="^"'));
    assert.ok(html.includes('data-value="10^"'));
  });
});
