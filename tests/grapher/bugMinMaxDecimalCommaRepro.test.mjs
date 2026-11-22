import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Calculation from '../../grapher/modules/calculation.js';

describe('Vérification et non-régression du bug : virgules décimales dans min, max et hypot', () => {
  const calc = new Calculation({ derivatePoints: 5, derivateEdges: true });

  it('ne doit pas découper les décimaux dans min(x, 0,5) et min(x; 0,5)', () => {
    assert.equal(calc.preprocessExpression('min(x, 0,5)'), 'min(x, 0.5)');
    assert.equal(calc.preprocessExpression('min(x; 0,5)'), 'min(x, 0.5)');
    assert.equal(calc.evaluate('min(x, 0,5)', { x: 2 }), 0.5);
    assert.equal(calc.evaluate('min(x; 0,5)', { x: 2 }), 0.5);
  });

  it('ne doit pas découper les décimaux dans max(1,5, 2,5) et max(1,5; 2,5)', () => {
    assert.equal(calc.preprocessExpression('max(1,5, 2,5)'), 'max(1.5, 2.5)');
    assert.equal(calc.preprocessExpression('max(1,5; 2,5)'), 'max(1.5, 2.5)');
    assert.equal(calc.evaluate('max(1,5; 2,5)', {}), 2.5);
  });

  it('ne doit pas découper les décimaux dans hypot(0,3; 0,4)', () => {
    assert.equal(calc.preprocessExpression('hypot(0,3; 0,4)'), 'hypot(0.3, 0.4)');
    assert.equal(calc.evaluate('hypot(0,3; 0,4)', {}), 0.5);
  });

  it('min(1,5,2,5)', () => {
    const clean = calc.preprocessExpression('min(1,5,2,5)');
    console.log('min(1,5,2,5) ->', clean);
    try {
      const res = calc.evaluate('min(1,5,2,5)', {});
      console.log('evaluate("min(1,5,2,5)") ->', res);
    } catch (err) {
      console.log('evaluate error:', err.message);
    }
  });

  it('doit préserver les appels variadiques standards min(2, 3, 4) et min(2; 3; 4)', () => {
    assert.equal(calc.preprocessExpression('min(2, 3, 4)'), 'min(2, 3, 4)');
    assert.equal(calc.evaluate('min(2, 3, 4)', {}), 2);
    assert.equal(calc.preprocessExpression('min(2; 3; 4)'), 'min(2, 3, 4)');
    assert.equal(calc.evaluate('min(2; 3; 4)', {}), 2);
  });
});
