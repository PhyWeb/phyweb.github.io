import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Data from '../../grapher/modules/data.js';
import IOManager from '../../grapher/modules/ioManager.js';
import { stripInlineComment, splitCodeAndComment } from '../../grapher/modules/io/formulaUtils.js';
import { moveUnitSuffixToLHS } from '../../grapher/modules/io/rw3Codec.js';

function createMockApp(data, calcText = '') {
  let editorText = calcText;
  return {
    data,
    editor: {
      getValue: () => editorText,
      setValue: (v) => { editorText = v; }
    },
    spreadsheet: { focusFirstCell: () => {}, update: () => {} },
    grapher: {
      currentXCurve: null,
      chart: { xAxis: [{ setExtremes: () => {} }], yAxis: [{ setExtremes: () => {} }], series: [] },
      setXCurve(x) { this.currentXCurve = x; },
      updateChart: () => {},
      reorderLegendByVisibility: () => {},
      setVisibilityFromList: () => {}
    },
    uiManager: {
      updateCalculationUI: () => {},
      updateSortUI: () => {},
      updateXAxisSelector: () => {}
    },
    pendingRW3: null,
    resetSession() {
      this.data.curves = [];
      editorText = '';
    },
    addCurve(title, unit) {
      return this.data.addCurve(title, unit);
    },
    applyCalculation: () => true
  };
}

describe('IOManager - Codecs RW3, CSV et utilitaires de formules', () => {
  it('generateCSV gère les formats d\'unités row, parentheses et none', () => {
    const data = new Data();
    const t = data.addCurve('t', 's'); t.push(0, 1.5);
    const u = data.addCurve('U', 'V'); u.push(2.5, 5);
    const io = new IOManager(createMockApp(data));

    const csvRow = io.generateCSV(';', 'row');
    assert.ok(csvRow.startsWith('t;U\r\ns;V\r\n0;2,5'));

    const csvParen = io.generateCSV(';', 'parentheses');
    assert.ok(csvParen.startsWith('t (s);U (V)\r\n0;2,5'));

    const csvNone = io.generateCSV(';', 'none');
    assert.ok(csvNone.startsWith('t;U\r\n0;2,5'));
  });

  it('generateRW3 exporte les grandeurs mesurées, valeurs FR et convertit MEMO GRANDEURS', () => {
    const data = new Data();
    const t = data.addCurve('t', 's'); t.push(0, 0.5);
    const x = data.addCurve('élongation', 'm'); x.push(1.2, 2.4);
    const v = data.addCurve('v', 'm/s', undefined, undefined, undefined, undefined, 'calculation');
    v.type = 'calculation';
    v.push(2.4, 2.4);

    const calcScript = "// Vitesse\nv_m/s = diff(élongation, t)\n# constante\ng_N/kg = 9.81";
    const io = new IOManager(createMockApp(data, calcScript));
    const rw3 = io.generateRW3();

    assert.ok(rw3.includes('EVARISTE REGRESSI WINDOWS 1.0'));
    assert.ok(rw3.includes('£2 NOM VAR\nt\nelongation\n'));
    assert.ok(rw3.includes('£2 UNITE VAR\ns\nm\n'));
    assert.ok(rw3.includes('&2 VALEUR VAR\n0\t1,2\n0,5\t2,4'));
    assert.ok(rw3.includes("£4 MEMO GRANDEURS\n'Vitesse\nv = diff(elongation, t)\n'constante\ng = 9.81"));
  });

  it('loadRW3File charge les constantes, formules MEMO, GRAPHE VAR et pendingRW3', async () => {
    const data = new Data();
    const app = createMockApp(data);
    const io = new IOManager(app);

    const rw3Content = [
      'EVARISTE REGRESSI WINDOWS 1.0',
      '£3 NOM VAR',
      't',
      'x',
      'Ec',
      '£3 GENRE VAR',
      '0',
      '0',
      '1',
      '£3 UNITE VAR',
      's',
      'm',
      'J',
      '£1 NOM CONST',
      'm',
      '£1 UNITE CONST',
      'kg',
      '&1 VALEUR CONST',
      '0,5',
      '&2 VALEUR VAR',
      '0\t1,0',
      '1\t3,0',
      '£1 MEMO GRANDEURS',
      'Ec = 0.5 * m * x^2',
      '&1 X',
      't',
      '&2 Y',
      'x',
      'Ec'
    ].join('\n');

    const buf = new TextEncoder().encode(rw3Content).buffer;
    await io.loadRW3File({ arrayBuffer: async () => buf });

    assert.deepEqual(data.curves.map(c => c.title), ['t', 'x']);
    assert.equal(app.grapher.currentXCurve, 't');
    assert.ok(app.editor.getValue().includes('m_kg = 0,5'));
    assert.ok(app.editor.getValue().includes('Ec = 0.5 * m * x^2'));
    assert.deepEqual(app.pendingRW3, { x: 't', y: ['Ec'] });
  });

  it('moveUnitSuffixToLHS déplace un suffixe d\'unité commun vers le membre de gauche', () => {
    assert.equal(moveUnitSuffixToLHS('Em = Ec_J + Ep_J'), 'Em_J = Ec + Ep');
    assert.equal(moveUnitSuffixToLHS('E = Ec_J + Ep_kJ'), 'E = Ec_J + Ep_kJ');
  });

  it('splitCodeAndComment et stripInlineComment partagent la même gestion des commentaires', () => {
    assert.equal(stripInlineComment('2 * x # commentaire'), '2 * x');
    assert.equal(stripInlineComment('2 * x // commentaire'), '2 * x');
    assert.equal(stripInlineComment("2 * x ' commentaire regressi"), '2 * x');
    assert.deepEqual(splitCodeAndComment('a = 1 # note'), { code: 'a = 1 ', comment: '# note' });
  });
});
