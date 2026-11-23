import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { updateFormulasReferences } from '../../grapher/modules/ioManager.js';

describe('Vérification Correction Bug B - updateFormulasReferences', () => {
  it('Scénario 1: préserve l\'unité v_m/s et le commentaire lors du renommage de s en d', () => {
    const input = 'v_m/s = diff(s, t) # vitesse en m/s';
    const output = updateFormulasReferences(input, { s: 'd' });
    assert.equal(output, 'v_m/s = diff(d, t) # vitesse en m/s');
  });

  it('Scénario 2: problème inverse - v-1_m/s est correctement remplacé par v1_m/s', () => {
    const input = 'v-1_m/s = diff(x, t)';
    const output = updateFormulasReferences(input, { 'v-1': 'v1' });
    assert.equal(output, 'v1_m/s = diff(x, t)');
  });

  it('Scénario 3: met à jour la variable définie sur le LHS tout en préservant son unité', () => {
    const input = 's_m = 2 * t';
    const output = updateFormulasReferences(input, { s: 'd' });
    assert.equal(output, 'd_m = 2 * t');
  });

  it('Scénario 4: gère les commentaires pleine ligne, // et \'', () => {
    const input = [
      '# Commentaire en m/s pour s',
      '// Commentaire slash pour s',
      '\' Commentaire regressi pour s',
      'v_m/s = diff(s, t) # vitesse en m/s',
      'a_m/s^2 = diff(v, t) // accélération en m/s^2',
      'd_km = s / 1000 \' distance en km'
    ].join('\n');

    const expected = [
      '# Commentaire en m/s pour s',
      '// Commentaire slash pour s',
      '\' Commentaire regressi pour s',
      'v_m/s = diff(pos, t) # vitesse en m/s',
      'a_m/s^2 = diff(v, t) // accélération en m/s^2',
      'd_km = pos / 1000 \' distance en km'
    ].join('\n');

    const output = updateFormulasReferences(input, { s: 'pos' });
    assert.equal(output, expected);
  });
});
