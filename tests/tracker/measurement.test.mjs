import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker Measurement Module', () => {
  it('doit utiliser les timestamps réels quand ils sont fournis', () => {
    const measurement = new MEASUREMENT();
    const fakePlayer = {
      setFrame: () => {}
    };

    const mockDecodedVideo = {
      width: 1920,
      height: 1080,
      duration: 1000,
      frames: [{}, {}, {}, {}],
      timestamps: [0.0, 0.0333, 0.0667, 0.1000]
    };

    measurement.init(mockDecodedVideo, fakePlayer);

    assert.equal(measurement.series[0].length, 4);
    assert.equal(measurement.series[0][0], 0.0);
    assert.equal(measurement.series[0][1], 0.0333);
    assert.equal(measurement.series[0][2], 0.0667);
    assert.equal(measurement.series[0][3], 0.1000);
  });

  it('doit calculer le temps uniforme si les timestamps réels ne sont pas fournis (rétrocompatibilité)', () => {
    const measurement = new MEASUREMENT();
    const fakePlayer = {
      setFrame: () => {}
    };

    const mockDecodedVideo = {
      width: 1920,
      height: 1080,
      duration: 2000, // 2000 ms
      frames: [{}, {}, {}] // 3 frames -> 0, 2/3 s, 4/3 s
    };

    measurement.init(mockDecodedVideo, fakePlayer);

    assert.equal(measurement.series[0].length, 3);
    assert.equal(measurement.series[0][0], 0);
    assert.equal(measurement.series[0][1].toFixed(4), ((2000 / 3) * 1 / 1000).toFixed(4));
    assert.equal(measurement.series[0][2].toFixed(4), ((2000 / 3) * 2 / 1000).toFixed(4));
  });
});

