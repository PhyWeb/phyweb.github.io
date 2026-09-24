import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resampleLinear } from '../../audio/modules/audio.js';

describe('Audio - Rééchantillonnage et interpolation linéaire (Playback Resampling)', () => {
  describe('Vérification et preuve du bug historique', () => {
    it('met en évidence les défaillances de l\'ancienne formule d\'interpolation (overshoot et NaN)', () => {
      const _data = [0, 10, 20];
      const factor = 2;
      const buggyPrepData = [];

      // Reproduction exacte du code buggé historique (audio/main.js ligne 1593-1598)
      for (let i = 0; i < _data.length; i++) {
        buggyPrepData[i * factor] = _data[i];
        for (let j = 1; j < factor; j++) {
          buggyPrepData[i * factor + j] = (_data[i + 1] - _data[i]) / factor * j + _data[i + 1];
        }
      }

      // 1. La formule historique produisait 15 au lieu de 5 (overshoot causé par + _data[i + 1])
      assert.equal(buggyPrepData[1], 15, 'L\'ancienne formule génère 15 au lieu de 5');
      // 2. La formule historique produisait 25 au lieu de 15
      assert.equal(buggyPrepData[3], 25, 'L\'ancienne formule génère 25 au lieu de 15');
      // 3. La dernière itération accédait à _data[3] (undefined), ce qui injectait NaN
      assert.ok(Number.isNaN(buggyPrepData[5]), 'L\'ancienne formule injectait NaN sur le dernier échantillon');
    });

    it('la fonction corrigée resampleLinear résout l\'overshoot et élimine tout NaN', () => {
      const data = [0, 10, 20];
      const factor = 2;
      const resampled = resampleLinear(data, factor);

      assert.equal(resampled[0], 0);
      assert.equal(resampled[1], 5, 'L\'échantillon intermédiaire doit valoir exactement 5');
      assert.equal(resampled[2], 10);
      assert.equal(resampled[3], 15, 'L\'échantillon intermédiaire doit valoir exactement 15');
      assert.equal(resampled[4], 20);
      assert.equal(resampled[5], 20, 'Le dernier échantillon répète la valeur de fin sans NaN');
      assert.ok(!Number.isNaN(resampled[5]), 'Aucun NaN ne doit être présent');
    });
  });

  describe('Précision de l\'interpolation linéaire (upsampling)', () => {
    it('doit interpoler fidèlement avec une pente positive sans dépassement (overshoot)', () => {
      const data = [0, 10];
      const factor = 2;
      const result = resampleLinear(data, factor);

      assert.equal(result.length, 4);
      assert.equal(result[0], 0);
      assert.equal(result[1], 5);
      assert.equal(result[2], 10);
      assert.equal(result[3], 10);
    });

    it('doit interpoler fidèlement avec une pente négative sans creux artificiel (undershoot)', () => {
      const data = [20, 10, 0];
      const factor = 2;
      const result = resampleLinear(data, factor);

      assert.equal(result.length, 6);
      assert.equal(result[0], 20);
      assert.equal(result[1], 15);
      assert.equal(result[2], 10);
      assert.equal(result[3], 5);
      assert.equal(result[4], 0);
      assert.equal(result[5], 0);
    });

    it('doit interpoler correctement avec un facteur 4 (sous-échantillonnage quart de fréquence)', () => {
      const data = [0, 100];
      const factor = 4;
      const result = resampleLinear(data, factor);

      assert.equal(result.length, 8);
      assert.equal(result[0], 0);
      assert.equal(result[1], 25);
      assert.equal(result[2], 50);
      assert.equal(result[3], 75);
      assert.equal(result[4], 100);
      assert.equal(result[5], 100);
      assert.equal(result[6], 100);
      assert.equal(result[7], 100);
    });

    it('doit préserver la linéarité et la continuité sur un tableau multi-points', () => {
      const data = [1000, 2000, 3000];
      const factor = 4;
      const result = resampleLinear(data, factor);

      assert.equal(result.length, 12);
      // Pente constante : le pas doit être régulier
      assert.equal(result[0], 1000);
      assert.equal(result[1], 1250);
      assert.equal(result[2], 1500);
      assert.equal(result[3], 1750);
      assert.equal(result[4], 2000);
      assert.equal(result[5], 2250);
      assert.equal(result[6], 2500);
      assert.equal(result[7], 2750);
      assert.equal(result[8], 3000);
      assert.equal(result[9], 3000);
      assert.equal(result[10], 3000);
      assert.equal(result[11], 3000);
    });

    it('ne doit jamais dépasser l\'amplitude maximale ou minimale du signal source', () => {
      const data = new Int16Array([5000, 15000, 30000, 10000, -20000]);
      const factor = 8;
      const result = resampleLinear(data, factor);

      const minVal = Math.min(...data);
      const maxVal = Math.max(...data);

      for (let i = 0; i < result.length; i++) {
        assert.ok(result[i] >= minVal, `Valeur à l'indice ${i} (${result[i]}) inférieure au minimum (${minVal})`);
        assert.ok(result[i] <= maxVal, `Valeur à l'indice ${i} (${result[i]}) supérieure au maximum (${maxVal})`);
      }
    });
  });

  describe('Protection contre les NaN et intégrité de fin de buffer', () => {
    it('doit garantir 100% de valeurs numériques finies sur un buffer audio réaliste (1024 échantillons)', () => {
      const size = 1024;
      const buffer = new Int16Array(size);
      for (let i = 0; i < size; i++) {
        buffer[i] = Math.round(Math.sin((2 * Math.PI * i) / 100) * 20000);
      }

      for (const factor of [2, 4, 8]) {
        const result = resampleLinear(buffer, factor);
        assert.equal(result.length, size * factor);

        for (let i = 0; i < result.length; i++) {
          assert.ok(Number.isFinite(result[i]), `L'échantillon ${i} pour facteur ${factor} n'est pas fini`);
          assert.ok(!Number.isNaN(result[i]), `L'échantillon ${i} pour facteur ${factor} est NaN`);
        }

        // Vérification spécifique de la queue du buffer (les factor - 1 derniers échantillons)
        const lastOriginalVal = buffer[size - 1];
        for (let j = 1; j < factor; j++) {
          const tailIdx = (size - 1) * factor + j;
          assert.equal(result[tailIdx], lastOriginalVal, `L'échantillon de fin ${tailIdx} doit être ${lastOriginalVal}`);
        }
      }
    });
  });

  describe('Gestion des cas limites et robustesse', () => {
    it('doit gérer un tableau vide sans erreur', () => {
      const emptyArray = [];
      const result = resampleLinear(emptyArray, 2);
      assert.equal(result.length, 0);

      const emptyTyped = new Int16Array(0);
      const resultTyped = resampleLinear(emptyTyped, 4);
      assert.equal(resultTyped.length, 0);
    });

    it('doit gérer les valeurs nulles ou indéfinies sans exception', () => {
      assert.equal(resampleLinear(null, 2).length, 0);
      assert.equal(resampleLinear(undefined, 2).length, 0);
    });

    it('doit gérer un tableau à élément unique sans produire de NaN', () => {
      const data = [1234];
      const factor = 4;
      const result = resampleLinear(data, factor);

      assert.equal(result.length, 4);
      for (let i = 0; i < 4; i++) {
        assert.equal(result[i], 1234);
        assert.ok(!Number.isNaN(result[i]));
      }
    });

    it('doit retourner les données d\'origine si factor <= 1', () => {
      const data = [10, 20, 30];
      assert.equal(resampleLinear(data, 1), data);
      assert.equal(resampleLinear(data, 0.5), data);
      assert.equal(resampleLinear(data, 0), data);
      assert.equal(resampleLinear(data, -2), data);
    });

    it('doit supporter aussi bien les Array standards que les Int16Array et Float32Array', () => {
      const standardArr = [10, 20];
      const int16Arr = new Int16Array([10, 20]);
      const float32Arr = new Float32Array([10, 20]);

      const resStandard = resampleLinear(standardArr, 2);
      const resInt16 = resampleLinear(int16Arr, 2);
      const resFloat32 = resampleLinear(float32Arr, 2);

      assert.deepEqual(Array.from(resStandard), [10, 15, 20, 20]);
      assert.deepEqual(Array.from(resInt16), [10, 15, 20, 20]);
      assert.deepEqual(Array.from(resFloat32), [10, 15, 20, 20]);
    });

    it('doit supporter un facteur non entier sans produire de NaN', () => {
      const data = [0, 100];
      const factor = 2.5;
      const result = resampleLinear(data, factor);

      assert.equal(result.length, 5);
      for (let i = 0; i < result.length; i++) {
        assert.ok(Number.isFinite(result[i]));
        assert.ok(!Number.isNaN(result[i]));
      }
    });
  });
});

