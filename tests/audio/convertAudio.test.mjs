import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { convertFloat32ToInt16, convertInt16ToFloat32 } from '../../audio/modules/audio.js';

describe('Audio - Conversion Float32 vers Int16 (convertFloat32ToInt16)', () => {
  describe('Vérification et preuve du bug historique de la condition de boucle i < (l + _start)', () => {
    it('met en évidence le débordement de lecture et d\'écriture de l\'ancienne formule', () => {
      // Buffer source de 5 éléments
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      const l = 2;
      const _start = 3; // On souhaite extraire les 2 derniers éléments (indices 3 et 4)

      const buggyWrittenIndices = [];
      const buggyReadIndices = [];
      const buggyBuf = new Int16Array(l); // Taille 2

      // Reproduction exacte de la boucle buggée (audio/modules/audio.js lignes 269-272)
      for (let i = 0; i < (l + _start); i++) {
        buggyReadIndices.push(i + _start);
        const s = Math.max(-1, Math.min(1, buffer[i + _start]));
        buggyWrittenIndices.push(i);
        buggyBuf[i] = s < 0 ? s * 32768 : s * 32767;
      }

      // 1. La condition i < (l + _start) exécute 5 itérations (l + _start = 5) au lieu de 2 (l = 2)
      assert.equal(buggyReadIndices.length, 5, 'L\'ancienne boucle effectue l + _start itérations au lieu de l');

      // 2. Les indices de lecture 5, 6, 7 dépassent la longueur du buffer (5 éléments, indices 0..4)
      assert.deepEqual(buggyReadIndices, [3, 4, 5, 6, 7]);
      assert.ok(buggyReadIndices.some(idx => idx >= buffer.length), 'L\'ancienne boucle lit au-delà de buffer.length');

      // 3. Les indices d\'écriture 2, 3, 4 dépassent la capacité du tableau Int16Array(2)
      assert.deepEqual(buggyWrittenIndices, [0, 1, 2, 3, 4]);
      assert.ok(buggyWrittenIndices.some(idx => idx >= l), 'L\'ancienne boucle tente d\'écrire au-delà de buf.length');
    });

    it('la fonction convertFloat32ToInt16 ne doit jamais lire d\'indice hors limites sur le buffer source', () => {
      const rawData = [0.1, 0.2, 0.3, 0.4, 0.5];
      const readIndices = [];

      // Détection des lectures via un Proxy
      const proxy = new Proxy(rawData, {
        get(target, prop) {
          if (typeof prop === 'string' && !Number.isNaN(Number(prop))) {
            readIndices.push(Number(prop));
          }
          return target[prop];
        }
      });

      // On demande 2 échantillons à partir de l'index 3 (indices 3 et 4)
      const res = convertFloat32ToInt16(proxy, 2, 3);

      assert.equal(res.length, 2);
      // Tous les indices lus doivent strictement appartenir à l'intervalle [3, 4]
      assert.deepEqual(readIndices, [3, 4], 'Seuls les indices demandés [3, 4] doivent être lus');
      assert.ok(readIndices.every(idx => idx < rawData.length), 'Aucun indice supérieur ou égal à la taille du buffer ne doit être lu');
    });

    it('la fonction convertFloat32ToInt16 ne doit pas exécuter plus de l itérations', () => {
      const buffer = new Float32Array(100);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = (i - 50) / 50;
      }

      const l = 20;
      const _start = 80; // Tranche finale : 80 à 99 (80 + 20 = 100)
      const readCount = [];

      const proxy = new Proxy(buffer, {
        get(target, prop) {
          if (typeof prop === 'string' && !Number.isNaN(Number(prop))) {
            readCount.push(Number(prop));
          }
          return target[prop];
        }
      });

      const result = convertFloat32ToInt16(proxy, l, _start);

      assert.equal(result.length, l);
      assert.equal(readCount.length, l, `Le nombre d'accès en lecture doit valoir exactement ${l}, pas ${l + _start}`);
      assert.equal(readCount[0], 80);
      assert.equal(readCount[readCount.length - 1], 99);
    });
  });

  describe('Conversions et précision mathématique', () => {
    it('convertit un buffer complet sans offset par défaut', () => {
      const floatData = new Float32Array([0, 0.5, -0.5, 1.0, -1.0]);
      const intData = convertFloat32ToInt16(floatData);

      assert.equal(intData.length, 5);
      assert.equal(intData[0], 0);
      assert.equal(intData[1], Math.trunc(0.5 * 32767));
      assert.equal(intData[2], Math.trunc(-0.5 * 32768));
      assert.equal(intData[3], 32767);
      assert.equal(intData[4], -32768);
    });

    it('sature (clamp) correctement les valeurs au-delà de [-1.0, 1.0]', () => {
      const floatData = new Float32Array([1.5, 999, -1.5, -999]);
      const intData = convertFloat32ToInt16(floatData);

      assert.equal(intData[0], 32767);
      assert.equal(intData[1], 32767);
      assert.equal(intData[2], -32768);
      assert.equal(intData[3], -32768);
    });

    it('effectue un aller-retour cohérent avec convertInt16ToFloat32', () => {
      const original = new Float32Array([-1.0, -0.75, -0.5, 0, 0.25, 0.5, 0.75, 1.0]);
      const int16 = convertFloat32ToInt16(original);
      const reconstructed = convertInt16ToFloat32(int16);

      assert.equal(reconstructed.length, original.length);
      for (let i = 0; i < original.length; i++) {
        // La tolérance de quantification 16 bits est ~ 1 / 32767 ≈ 0.000035
        assert.ok(Math.abs(reconstructed[i] - original[i]) < 0.0001, `Erreur de quantification trop grande à l'indice ${i}`);
      }
    });
  });

  describe('Gestion des cas limites et robustesse', () => {
    it('gère un buffer vide ou longueur nulle sans erreur', () => {
      const resEmpty = convertFloat32ToInt16(new Float32Array(0));
      assert.equal(resEmpty.length, 0);

      const resZeroLen = convertFloat32ToInt16(new Float32Array(10), 0);
      assert.equal(resZeroLen.length, 0);
    });

    it('gère des entrées nulles ou indéfinies sans lever d\'exception', () => {
      assert.equal(convertFloat32ToInt16(null).length, 0);
      assert.equal(convertFloat32ToInt16(undefined).length, 0);
    });

    it('ne plante pas si la longueur demandée dépasse les données disponibles', () => {
      const buffer = new Float32Array([0.5, -0.5]);
      // On demande 10 échantillons à partir de l'index 1 (alors qu'il n'en reste qu'1 seul)
      const res = convertFloat32ToInt16(buffer, 10, 1);

      assert.equal(res.length, 10);
      assert.equal(res[0], Math.round(-0.5 * 32768));
      // Les échantillons manquants doivent être à 0 et non corrompus par des NaN
      for (let i = 1; i < 10; i++) {
        assert.equal(res[i], 0);
      }
    });
  });
});

describe('Audio - Conversion Int16 vers Float32 (convertInt16ToFloat32)', () => {
  describe('Vérification et preuve du bug historique de la variable non déclarée s', () => {
    it('prouve qu\'une variable non déclarée s lève une ReferenceError en mode strict (ES modules)', () => {
      // Reproduction exacte du code historique non corrigé
      function buggyConvertInt16ToFloat32(buffer) {
        'use strict';
        let l = buffer.length;
        let buf = new Float32Array(l);
        while (l--) {
          // Sans let/const/var, en mode strict (implicite dans les modules ES), l'assignation lève ReferenceError
          s = Math.max(-32768, Math.min(32767, buffer[l]));
          buf[l] = s < 0 ? s / 32768 : s / 32767;
        }
        return buf;
      }

      assert.throws(
        () => buggyConvertInt16ToFloat32(new Int16Array([100])),
        {
          name: 'ReferenceError',
          message: /s is not defined/
        },
        'L\'assignation d\'une variable non déclarée s doit lever ReferenceError en mode strict'
      );
    });

    it('la fonction exportée convertInt16ToFloat32 s\'exécute sans ReferenceError en mode strict', () => {
      assert.doesNotThrow(() => {
        const input = new Int16Array([0, 1000, -2000, 32767, -32768]);
        const res = convertInt16ToFloat32(input);
        assert.equal(res.length, 5);
      });
    });
  });

  describe('Conversions et précision mathématique', () => {
    it('convertit fidèlement les bornes extrêmes et le zéro', () => {
      const input = new Int16Array([-32768, 0, 32767]);
      const res = convertInt16ToFloat32(input);

      assert.equal(res.length, 3);
      assert.equal(res[0], -1.0, '-32768 doit correspondre exactement à -1.0');
      assert.equal(res[1], 0.0, '0 doit correspondre exactement à 0.0');
      assert.equal(res[2], 1.0, '32767 doit correspondre exactement à 1.0');
    });

    it('convertit les valeurs intermédiaires positives et négatives avec la formule asymétrique 32768 / 32767', () => {
      const input = new Int16Array([-16384, 16383]);
      const res = convertInt16ToFloat32(input);

      assert.equal(res[0], Math.fround(-16384 / 32768));
      assert.equal(res[1], Math.fround(16383 / 32767));
    });

    it('sature (clamp) correctement les valeurs dépassant la plage [-32768, 32767]', () => {
      // Même si l'entrée est un tableau classique avec des valeurs hors de la plage Int16
      const input = [-50000, 50000];
      const res = convertInt16ToFloat32(input);

      assert.equal(res[0], -1.0, 'Les valeurs inférieures à -32768 doivent saturer à -1.0');
      assert.equal(res[1], 1.0, 'Les valeurs supérieures à 32767 doivent saturer à 1.0');
    });
  });

  describe('Gestion des cas limites et robustesse', () => {
    it('gère un buffer vide sans erreur', () => {
      const resEmpty = convertInt16ToFloat32(new Int16Array(0));
      assert.equal(resEmpty.length, 0);
      assert.ok(resEmpty instanceof Float32Array);
    });

    it('gère des entrées nulles ou indéfinies sans lever d\'exception', () => {
      const resNull = convertInt16ToFloat32(null);
      assert.equal(resNull.length, 0);
      assert.ok(resNull instanceof Float32Array);

      const resUndef = convertInt16ToFloat32(undefined);
      assert.equal(resUndef.length, 0);
      assert.ok(resUndef instanceof Float32Array);
    });

    it('supporte aussi bien les Array standards que les Int16Array', () => {
      const arrayInput = [-32768, 0, 32767];
      const res = convertInt16ToFloat32(arrayInput);
      assert.equal(res.length, 3);
      assert.equal(res[0], -1.0);
      assert.equal(res[1], 0.0);
      assert.equal(res[2], 1.0);
    });
  });
});

