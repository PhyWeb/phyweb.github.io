import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';
import { Calculation } from '../../grapher/modules/calculation.js';

if (!global.CodeMirror) {
  global.CodeMirror = {
    defineMode: (name, modeFactory) => {
      global.CodeMirror._modes = global.CodeMirror._modes || {};
      global.CodeMirror._modes[name] = modeFactory;
    }
  };
}

describe('Coloration syntaxique CodeMirror (mode phyweb-calc)', () => {
  let ui;
  let mode;

  beforeEach(() => {
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
    global.CodeMirror.defineMode = (name, factory) => {
      if (name === 'phyweb-calc') {
        definedFactory = factory;
      }
    };

    const mockData = {
      curves: [
        { title: 't', unit: 's' },
        { title: 'x', unit: 'm' },
        { title: 'y', unit: 'm' },
        { title: 'v', unit: 'm.s^-1' },
        { title: 'a', unit: 'm.s^-2' }
      ],
      parameters: {
        R: { value: 8.314, unit: 'J/(mol.K)' },
        NA: { value: 6.022e23, unit: 'mol^-1' },
        sigma: { value: 5.67e-8, unit: 'W/(m^2.K^4)' },
        k: { value: 20, unit: 'N.m^-1' },
        E: { value: 100, unit: '(kW.h)' },
        m: { value: 2.5, unit: 'kg' }
      },
      models: []
    };

    const calc = new Calculation({ derivatePoints: 5, derivateEdges: true });
    ui = new UIManager(null, mockData, null, calc, null, null);
    ui.editor = { setOption: () => {} };
    ui.updateCalculationUI();

    assert.ok(definedFactory, 'Le mode phyweb-calc doit être défini');
    mode = definedFactory();
  });

  // Simule l'analyse complète d'une ligne de code par CodeMirror
  function tokenizeLine(lineText) {
    const tokens = [];
    let pos = 0;
    let matched = '';

    const stream = {
      string: lineText,
      get pos() {
        return pos;
      },
      eatSpace: () => {
        const rest = lineText.slice(pos);
        const match = rest.match(/^\s+/);
        if (match) {
          pos += match[0].length;
          return true;
        }
        return false;
      },
      match: (regex) => {
        const rest = lineText.slice(pos);
        const m = rest.match(regex);
        if (m && m.index === 0) {
          matched = m[0];
          pos += matched.length;
          return true;
        }
        return false;
      },
      current: () => matched,
      next: () => {
        matched = lineText.slice(pos, pos + 1);
        pos++;
        return matched;
      },
      eol: () => pos >= lineText.length
    };

    while (!stream.eol()) {
      const style = mode.token(stream);
      if (style !== null && style !== undefined) {
        tokens.push({ text: stream.current(), style });
      }
    }

    return tokens;
  }

  describe('Coloration des grandeurs et paramètres avec unités complexes (^ et parenthèses)', () => {
    it('doit colorer entièrement une grandeur avec unité contenant ^ et - (ex: v_m.s^-1)', () => {
      const tokens = tokenizeLine('v_m.s^-1 = diff(x, t)');
      // Le premier token doit être v_m.s^-1 avec le style variable-2
      assert.strictEqual(tokens[0].text, 'v_m.s^-1');
      assert.strictEqual(tokens[0].style, 'variable-2');
      assert.strictEqual(tokens[1].text, '=');
      assert.strictEqual(tokens[1].style, 'operator');
    });

    it('doit colorer entièrement une grandeur avec unité contenant ^ et -2 (ex: a_m.s^-2)', () => {
      const tokens = tokenizeLine('a_m.s^-2 = diff(v, t)');
      assert.strictEqual(tokens[0].text, 'a_m.s^-2');
      assert.strictEqual(tokens[0].style, 'variable-2');
    });

    it('doit colorer entièrement un paramètre avec unité contenant des parenthèses (ex: R_J/(mol.K))', () => {
      const tokens = tokenizeLine('R_J/(mol.K) = 8.314');
      assert.strictEqual(tokens[0].text, 'R_J/(mol.K)');
      assert.strictEqual(tokens[0].style, 'def');
      assert.strictEqual(tokens[1].text, '=');
      assert.strictEqual(tokens[1].style, 'operator');
      assert.strictEqual(tokens[2].text, '8.314');
      assert.strictEqual(tokens[2].style, 'number');
    });

    it('doit colorer entièrement une constante avec unité contenant ^-1 (ex: NA_mol^-1)', () => {
      const tokens = tokenizeLine('NA_mol^-1 = 6.022e23');
      assert.strictEqual(tokens[0].text, 'NA_mol^-1');
      assert.strictEqual(tokens[0].style, 'def');
      assert.strictEqual(tokens[1].text, '=');
      assert.strictEqual(tokens[1].style, 'operator');
      assert.strictEqual(tokens[2].text, '6.022e23');
      assert.strictEqual(tokens[2].style, 'number');
    });

    it('doit colorer entièrement une unité combinant parenthèses et puissances (ex: sigma_W/(m^2.K^4))', () => {
      const tokens = tokenizeLine('sigma_W/(m^2.K^4) = 5.67e-8');
      assert.strictEqual(tokens[0].text, 'sigma_W/(m^2.K^4)');
      assert.strictEqual(tokens[0].style, 'def');
      assert.strictEqual(tokens[1].text, '=');
      assert.strictEqual(tokens[1].style, 'operator');
      assert.strictEqual(tokens[2].text, '5.67e-8');
      assert.strictEqual(tokens[2].style, 'number');
    });

    it('doit colorer entièrement une unité entre parenthèses (ex: E_(kW.h))', () => {
      const tokens = tokenizeLine('E_(kW.h) = 100');
      assert.strictEqual(tokens[0].text, 'E_(kW.h)');
      assert.strictEqual(tokens[0].style, 'def');
    });

    it('doit supporter une affectation sans espace avant le signe = (ex: R_J/(mol.K)=8.314)', () => {
      const tokens = tokenizeLine('R_J/(mol.K)=8.314');
      assert.strictEqual(tokens[0].text, 'R_J/(mol.K)');
      assert.strictEqual(tokens[0].style, 'def');
      assert.strictEqual(tokens[1].text, '=');
      assert.strictEqual(tokens[1].style, 'operator');
      assert.strictEqual(tokens[2].text, '8.314');
      assert.strictEqual(tokens[2].style, 'number');
    });

    it('doit colorer l\'unité complexe même lorsque le signe = n\'est pas encore saisi', () => {
      const tokensR = tokenizeLine('R_J/(mol.K)');
      assert.strictEqual(tokensR[0].text, 'R_J/(mol.K)');
      assert.strictEqual(tokensR[0].style, 'def');

      const tokensV = tokenizeLine('v_m.s^-1');
      assert.strictEqual(tokensV[0].text, 'v_m.s^-1');
      assert.strictEqual(tokensV[0].style, 'variable-2');
    });
  });

  describe('Préservation de la coloration des expressions sur le membre de droite', () => {
    it('ne doit pas fusionner une variable et une puissance sur le membre de droite (ex: v^2)', () => {
      const tokens = tokenizeLine('Ec = 0.5 * m * v^2');
      const vToken = tokens.find(t => t.text === 'v');
      const powToken = tokens.find(t => t.text === '^');
      const numToken = tokens.find(t => t.text === '2');

      assert.ok(vToken, 'v doit être un token distinct');
      assert.strictEqual(vToken.style, 'variable-2');
      assert.ok(powToken, '^ doit être un opérateur distinct');
      assert.strictEqual(powToken.style, 'operator');
      assert.ok(numToken, '2 doit être un nombre distinct');
      assert.strictEqual(numToken.style, 'number');
    });

    it('ne doit pas fusionner deux variables séparées par une division sans espaces (ex: a/b)', () => {
      const tokens = tokenizeLine('y = x/t');
      assert.strictEqual(tokens[2].text, 'x');
      assert.strictEqual(tokens[2].style, 'variable-2');
      assert.strictEqual(tokens[3].text, '/');
      assert.strictEqual(tokens[3].style, 'operator');
      assert.strictEqual(tokens[4].text, 't');
      assert.strictEqual(tokens[4].style, 'variable-2');
    });

    it('doit colorer correctement les fonctions et leurs arguments', () => {
      const tokens = tokenizeLine('v = diff(x, t)');
      assert.strictEqual(tokens[2].text, 'diff');
      assert.strictEqual(tokens[2].style, 'phyweb-function-warning');
      assert.strictEqual(tokens[3].text, '(');
      assert.strictEqual(tokens[3].style, 'operator');
      assert.strictEqual(tokens[4].text, 'x');
      assert.strictEqual(tokens[4].style, 'variable-2');
      assert.strictEqual(tokens[5].text, ',');
      assert.strictEqual(tokens[5].style, 'operator');
      assert.strictEqual(tokens[6].text, 't');
      assert.strictEqual(tokens[6].style, 'variable-2');
      assert.strictEqual(tokens[7].text, ')');
      assert.strictEqual(tokens[7].style, 'operator');
    });

    it('doit colorer pi et ses variantes PI / Pi en "def"', () => {
      const tokens1 = tokenizeLine('c = 2 * pi * x');
      const piToken1 = tokens1.find(t => t.text === 'pi');
      assert.strictEqual(piToken1.style, 'def');

      const tokens2 = tokenizeLine('c = 2 * PI * x');
      const piToken2 = tokens2.find(t => t.text === 'PI');
      assert.strictEqual(piToken2.style, 'def');
    });

    it('doit colorer les nombres en notation scientifique', () => {
      const tokens = tokenizeLine('k = 1.602e-19');
      const numToken = tokens.find(t => t.text === '1.602e-19');
      assert.ok(numToken, '1.602e-19 doit être un token unique');
      assert.strictEqual(numToken.style, 'number');
    });
  });

  describe('Commentaires', () => {
    it('doit colorer toute la ligne comme commentaire pour #, // et \'', () => {
      const tokensHash = tokenizeLine('# commentaire avec ( et ^');
      assert.strictEqual(tokensHash.length, 1);
      assert.strictEqual(tokensHash[0].style, 'comment');

      const tokensSlash = tokenizeLine('// commentaire');
      assert.strictEqual(tokensSlash.length, 1);
      assert.strictEqual(tokensSlash[0].style, 'comment');

      const tokensQuote = tokenizeLine('\' commentaire');
      assert.strictEqual(tokensQuote.length, 1);
      assert.strictEqual(tokensQuote[0].style, 'comment');
    });
  });
});
