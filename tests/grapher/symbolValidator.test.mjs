import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import SymbolValidator from '../../grapher/modules/symbolValidator.js';

describe('SymbolValidator', () => {
  const validator = new SymbolValidator({ curves: [], parameters: {} });

  describe('Validation des symboles autorisés', () => {
    it('doit accepter les noms de variables simples', () => {
      assert.equal(validator.validate('v').isValid, true);
      assert.equal(validator.validate('t').isValid, true);
      assert.equal(validator.validate('x').isValid, true);
      assert.equal(validator.validate('theta').isValid, true);
    });

    it('doit accepter les variables avec des chiffres (sans underscore)', () => {
      assert.equal(validator.validate('v0').isValid, true);
      assert.equal(validator.validate('x1').isValid, true);
      assert.equal(validator.validate('t2').isValid, true);
    });

    it('doit accepter les lettres accentuées et les bornes Unicode autorisées', () => {
      assert.equal(validator.validate('énergie').isValid, true);
      assert.equal(validator.validate('durée').isValid, true);
      assert.equal(validator.validate('À').isValid, true);
      assert.equal(validator.validate('Ö').isValid, true);
      assert.equal(validator.validate('Ø').isValid, true);
      assert.equal(validator.validate('ö').isValid, true);
      assert.equal(validator.validate('ø').isValid, true);
      assert.equal(validator.validate('ÿ').isValid, true);
      assert.equal(validator.validate('Élève').isValid, true);
    });
  });

  describe('Interdiction des underscores et caractères spéciaux', () => {
    it('doit refuser les noms contenant un underscore', () => {
      assert.equal(validator.validate('v_0').isValid, false);
      assert.equal(validator.validate('t_s').isValid, false);
      assert.equal(validator.validate('a_x').isValid, false);
      assert.equal(validator.validate('E_c').isValid, false);
    });

    it('doit refuser les noms contenant des unités ou opérateurs classiques', () => {
      assert.equal(validator.validate('a_m/s').isValid, false);
      assert.equal(validator.validate('v+1').isValid, false);
      assert.equal(validator.validate('x*2').isValid, false);
    });

    it('doit refuser les opérateurs arithmétiques Unicode × (\\u00D7) et ÷ (\\u00F7)', () => {
      assert.equal(validator.validate('×').isValid, false);
      assert.equal(validator.validate('÷').isValid, false);
      assert.equal(validator.validate('a×b').isValid, false);
      assert.equal(validator.validate('a÷b').isValid, false);
      assert.equal(validator.validate('v×1').isValid, false);
      assert.equal(validator.validate('x÷2').isValid, false);
    });

    it('doit refuser les noms commençant par un chiffre', () => {
      assert.equal(validator.validate('1x').isValid, false);
      assert.equal(validator.validate('0v').isValid, false);
    });

    it('doit refuser les symboles vides', () => {
      assert.equal(validator.validate('').isValid, false);
      assert.equal(validator.validate('   ').isValid, false);
    });
  });
});

