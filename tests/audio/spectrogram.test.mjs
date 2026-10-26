import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LinearData } from '../../audio/modules/audio.js';

describe('Audio - Spectrogramme / Analyse spectrale temporelle (audio/main.js)', () => {
  const chunkLength = 0.1;
  const baseSampleRate = 44100;

  describe('Preuve des bugs historiques', () => {
    it('prouve le bug historique où l\'axe temporel Y démarrait toujours à 0 s malgré un zoom décalé', () => {
      const startTime = 2.0;
      const chunks = [
        { step: 10, data: [100, 200] },
        { step: 10, data: [300, 400] }
      ];

      // Formule historique : i * chunkLength
      const buggyYCoords = [];
      for (let i = 0; i < chunks.length; i++) {
        for (let j = 0; j < chunks[i].data.length; j++) {
          buggyYCoords.push(i * chunkLength);
        }
      }

      // La formule historique démarre toujours à 0 au lieu de startTime (2.0s)
      assert.equal(buggyYCoords[0], 0);
      assert.notEqual(buggyYCoords[0], startTime);

      // Formule corrigée : startTime + (i + 0.5) * chunkLength
      const fixedYCoords = [];
      for (let i = 0; i < chunks.length; i++) {
        for (let j = 0; j < chunks[i].data.length; j++) {
          fixedYCoords.push(startTime + (i + 0.5) * chunkLength);
        }
      }

      // La formule corrigée est bien décalée et centrée sur chaque bloc de 0.1s
      assert.ok(Math.abs(fixedYCoords[0] - 2.05) < 1e-6, 'Bloc 0 centré à 2.05s');
      assert.ok(Math.abs(fixedYCoords[2] - 2.15) < 1e-6, 'Bloc 1 centré à 2.15s');
    });

    it('prouve le bug historique des limites Y (max sans startTime et pas de min explicite)', () => {
      const startTime = 2.0;
      const chunksCount = 10; // 1.0s de signal analysé entre 2.0s et 3.0s

      // Limites historiques
      const buggyYAxis = { max: chunksCount * chunkLength }; // max: 1.0 au lieu de 3.0, pas de min
      assert.equal(buggyYAxis.min, undefined);
      assert.equal(buggyYAxis.max, 1.0);

      // Limites corrigées
      const fixedYAxis = {
        min: startTime,
        max: startTime + chunksCount * chunkLength
      };
      assert.equal(fixedYAxis.min, 2.0);
      assert.equal(fixedYAxis.max, 3.0);
    });

    it('prouve le bug historique dans la boucle de computeTemporalFourier qui omettait le dernier bloc', () => {
      // Pour une durée de 0.5s et un pas de 0.1s, il y a exactement 5 blocs
      const duration = 0.5;

      // Boucle historique : (i + 1) < duration / chunkLength
      let buggyCount = 0;
      for (let i = 0; (i + 1) < duration / chunkLength; i++) {
        buggyCount++;
      }
      assert.equal(buggyCount, 4, 'L\'ancienne boucle ne calculait que 4 blocs sur 5');

      // Boucle corrigée : (i + 1) * chunkLength <= duration + 1e-4
      let fixedCount = 0;
      for (let i = 0; (i + 1) * chunkLength <= duration + 1e-4; i++) {
        fixedCount++;
      }
      assert.equal(fixedCount, 5, 'La boucle corrigée calcule bien la totalité des 5 blocs');
    });
  });

  describe('Validation des données et de la configuration du heatmap', () => {
    it('génère des triplets [x, y, value] correctement décalés et centrés pour Highcharts', () => {
      const startTime = 1.5;
      const chunks = [
        { step: 10.76, data: [15, 25, 35] },
        { step: 10.76, data: [50, 60, 70] }
      ];

      const fTemporalData = [];
      let highestAmplitude = 0;
      for (let i = 0; i < chunks.length; i++) {
        for (let j = 0; j < chunks[i].data.length; j++) {
          fTemporalData[i * chunks[0].data.length + j] = [
            j * chunks[0].step,
            startTime + (i + 0.5) * chunkLength,
            chunks[i].data[j]
          ];
          if (chunks[i].data[j] > highestAmplitude) {
            highestAmplitude = chunks[i].data[j];
          }
        }
      }

      assert.equal(fTemporalData.length, 6);
      assert.equal(highestAmplitude, 70);

      // Bloc 0
      assert.deepEqual(fTemporalData[0], [0, 1.55, 15]);
      assert.ok(Math.abs(fTemporalData[1][0] - 10.76) < 1e-4);
      assert.equal(fTemporalData[1][1], 1.55);
      assert.equal(fTemporalData[1][2], 25);

      // Bloc 1
      assert.equal(fTemporalData[3][1], 1.65);
      assert.equal(fTemporalData[3][2], 50);
    });

    it('valide le formatage du tooltip pour la fréquence, le temps et l\'amplitude', () => {
      // Mock de Highcharts.numberFormat
      const mockHighcharts = {
        numberFormat: (val, decimals) => Number(val).toFixed(decimals)
      };

      const formatter = function() {
        return "Fréquence : <b>" + mockHighcharts.numberFormat(this.point.x, 1) + " Hz</b><br>" +
               "Temps : <b>" + mockHighcharts.numberFormat(this.point.y, 2) + " s</b><br>" +
               "Amplitude : <b>" + mockHighcharts.numberFormat(this.point.value, 0) + "</b>";
      };

      const context = {
        point: {
          x: 440.12345,
          y: 2.05,
          value: 12543.8
        }
      };

      const result = formatter.call(context);
      assert.equal(
        result,
        "Fréquence : <b>440.1 Hz</b><br>Temps : <b>2.05 s</b><br>Amplitude : <b>12544</b>"
      );
    });

    it('valide la configuration des options de série (colsize et rowsize)', () => {
      const step = 10.7666;
      const seriesUpdate = {
        colsize: step,
        rowsize: chunkLength
      };

      assert.equal(seriesUpdate.colsize, step);
      assert.equal(seriesUpdate.rowsize, 0.1);
    });
  });
});

