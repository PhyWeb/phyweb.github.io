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

  describe('Interdiction des mots réservés (fonctions et constantes mathématiques)', () => {
    it('doit refuser les constantes mathématiques réservées (e, pi)', () => {
      assert.equal(validator.validate('e').isValid, false);
      assert.equal(validator.validate('pi').isValid, false);
      assert.equal(validator.validate('PI').isValid, false);
    });

    it('doit refuser les fonctions mathématiques scalaires (sin, cos, exp, log, sqrt, etc.)', () => {
      assert.equal(validator.validate('sin').isValid, false);
      assert.equal(validator.validate('cos').isValid, false);
      assert.equal(validator.validate('tan').isValid, false);
      assert.equal(validator.validate('asin').isValid, false);
      assert.equal(validator.validate('acos').isValid, false);
      assert.equal(validator.validate('atan').isValid, false);
      assert.equal(validator.validate('exp').isValid, false);
      assert.equal(validator.validate('log').isValid, false);
      assert.equal(validator.validate('ln').isValid, false);
      assert.equal(validator.validate('sqrt').isValid, false);
      assert.equal(validator.validate('cbrt').isValid, false);
      assert.equal(validator.validate('abs').isValid, false);
      assert.equal(validator.validate('round').isValid, false);
      assert.equal(validator.validate('floor').isValid, false);
      assert.equal(validator.validate('ceil').isValid, false);
    });

    it('doit refuser les fonctions personnalisées comme diff', () => {
      assert.equal(validator.validate('diff').isValid, false);
    });

    it('doit être insensible à la casse pour les mots réservés (ex: Sin, COS, Diff, Pi, SQRT)', () => {
      assert.equal(validator.validate('Sin').isValid, false);
      assert.equal(validator.validate('COS').isValid, false);
      assert.equal(validator.validate('Diff').isValid, false);
      assert.equal(validator.validate('Pi').isValid, false);
      assert.equal(validator.validate('SQRT').isValid, false);
    });

    it('doit accepter les symboles valides contenant un mot réservé comme sous-chaîne', () => {
      assert.equal(validator.validate('sinus').isValid, true);
      assert.equal(validator.validate('piston').isValid, true);
      assert.equal(validator.validate('difficile').isValid, true);
      assert.equal(validator.validate('effort').isValid, true);
      assert.equal(validator.validate('point').isValid, true);
      assert.equal(validator.validate('exp1').isValid, true);
      assert.equal(validator.validate('cosinus').isValid, true);
    });

    it('doit refuser un mot réservé même si présent dans ignoreList', () => {
      assert.equal(validator.validate('sin', { ignoreList: ['sin'] }).isValid, false);
      assert.equal(validator.validate('diff', { ignoreList: ['diff'] }).isValid, false);
    });

    it('doit renvoyer un message d\'erreur explicite pour les mots réservés', () => {
      const resSin = validator.validate('sin');
      assert.equal(resSin.isValid, false);
      assert.match(resSin.message, /mot réservé/i);

      const resDiff = validator.validate('diff');
      assert.equal(resDiff.isValid, false);
      assert.match(resDiff.message, /mot réservé/i);
    });
  });
});


