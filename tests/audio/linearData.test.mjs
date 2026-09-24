import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LinearData } from '../../audio/modules/audio.js';

describe('Audio - Sous-échantillonnage temporel (LinearData.getData)', () => {
  describe('Vérification et preuve du bug historique (audio/main.js ligne 1210)', () => {
    it('met en évidence le débordement de lecture et d\'écriture de l\'ancienne formule', () => {
      // Buffer source de 6 éléments
      const data = new Int16Array([10, 20, 30, 40, 50, 60]);
      const _downSampling = 2;

      // data2 a pour taille data.length / _downSampling = 3 éléments
      const buggyData2 = new Int16Array(data.length / _downSampling);
      const buggyReadIndices = [];
      const buggyWriteIndices = [];

      // Reproduction exacte du code buggé historique (audio/main.js ligne 1210)
      for (let i = 0; i < data.length; i++) {
        buggyWriteIndices.push(i);
        buggyReadIndices.push(i * _downSampling);
        buggyData2[i] = data[i * _downSampling];
      }

      // 1. La boucle historique s'exécute data.length (6) fois au lieu de data2.length (3) fois
      assert.equal(buggyWriteIndices.length, 6, 'L\'ancienne boucle effectue data.length (6) itérations au lieu de 3');

      // 2. Les indices d'écriture 3, 4, 5 débordent de buggyData2 (capacité 3, indices 0..2)
      assert.deepEqual(buggyWriteIndices, [0, 1, 2, 3, 4, 5]);
      const outOfBoundsWrites = buggyWriteIndices.filter(idx => idx >= buggyData2.length);
      assert.deepEqual(outOfBoundsWrites, [3, 4, 5], 'Les indices d\'écriture 3, 4, 5 débordent silencieusement du tableau cible Int16Array');

      // 3. Les indices de lecture 6, 8, 10 débordent du tableau source data (taille 6, indices 0..5)
      assert.deepEqual(buggyReadIndices, [0, 2, 4, 6, 8, 10]);
      const outOfBoundsReads = buggyReadIndices.filter(idx => idx >= data.length);
      assert.deepEqual(outOfBoundsReads, [6, 8, 10], 'Les indices de lecture 6, 8, 10 lisent au-delà de la fin du tableau source');
    });

    it('prouve que l\'ancienne formule corromprait un Array standard en l\'étendant artificiellement', () => {
      const source = [10, 20, 30, 40, 50, 60];
      const _downSampling = 2;
      const target = new Array(source.length / _downSampling); // taille prévue 3

      // Exécution de l'ancienne boucle
      for (let i = 0; i < source.length; i++) {
        target[i] = source[i * _downSampling];
      }

      // Sur un Array JS standard, l'écriture hors limites agrandit le tableau à 6 au lieu de 3
      assert.equal(target.length, 6, 'Un tableau Array standard est étendu à 6 éléments');
      assert.equal(target[3], undefined, 'Les éléments au-delà de la capacité prévue reçoivent undefined');
    });

    it('met en évidence le gaspillage massif d\'itérations lors de forts sous-échantillonnages', () => {
      const dataLength = 48000;
      const _downSampling = 16;
      const expectedIterations = dataLength / _downSampling; // 3000

      let buggyIterations = 0;
      for (let i = 0; i < dataLength; i++) {
        buggyIterations++;
      }

      assert.equal(buggyIterations, 48000);
      assert.equal(buggyIterations - expectedIterations, 45000, '45 000 itérations (93.75%) étaient du pur gaspillage hors limites');
    });
  });

  describe('Validation de la logique corrigée LinearData.getData()', () => {
    it('la boucle corrigée ne doit exécuter que targetLength itérations sans aucun débordement', () => {
      const rawData = new Int16Array([100, 200, 300, 400, 500, 600, 700, 800]);
      const readIndices = [];

      // Espionnage des lectures via Proxy
      const proxy = new Proxy(rawData, {
        get(target, prop) {
          if (typeof prop === 'string' && !Number.isNaN(Number(prop))) {
            readIndices.push(Number(prop));
          }
          return target[prop];
        }
      });

      const linear = new LinearData(proxy, 1);
      const result = linear.getData(2);

      // Pour un tableau de 8 éléments avec downsampling 2, la taille doit être 4
      assert.equal(result.length, 4);

      // Exactement 4 lectures d'indices
      assert.equal(readIndices.length, 4, 'Exactement 4 lectures doivent être effectuées');
      assert.deepEqual(readIndices, [0, 2, 4, 6], 'Seuls les indices sous-échantillonnés [0, 2, 4, 6] doivent être lus');

      // Aucune lecture hors limites
      assert.ok(readIndices.every(idx => idx < rawData.length), 'Aucun indice supérieur ou égal à rawData.length ne doit être lu');

      // Valeurs correctes
      assert.deepEqual(Array.from(result), [100, 300, 500, 700]);
    });

    it('retourne les données originales sans copie inutile lorsque _downSampling <= 1 et _length est undefined', () => {
      const raw = new Int16Array([1, 2, 3, 4]);
      const linear = new LinearData(raw);

      assert.strictEqual(linear.getData(1), raw, 'getData(1) doit retourner la référence directe aux données');
      assert.strictEqual(linear.getData(0), raw, 'getData(0) doit retourner la référence directe aux données');
      assert.strictEqual(linear.getData(-1), raw, 'getData(-1) doit retourner la référence directe aux données');
    });

    it('sous-échantillonne correctement pour divers facteurs entiers (2, 3, 4, 8)', () => {
      const values = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
      const linear = new LinearData(new Int16Array(values));

      // Facteur 2 (16 / 2 = 8 éléments)
      assert.deepEqual(Array.from(linear.getData(2)), [0, 20, 40, 60, 80, 100, 120, 140]);

      // Facteur 3 (Math.floor(16 / 3) = 5 éléments : indices 0, 3, 6, 9, 12)
      assert.deepEqual(Array.from(linear.getData(3)), [0, 30, 60, 90, 120]);

      // Facteur 4 (16 / 4 = 4 éléments : indices 0, 4, 8, 12)
      assert.deepEqual(Array.from(linear.getData(4)), [0, 40, 80, 120]);

      // Facteur 8 (16 / 8 = 2 éléments : indices 0, 8)
      assert.deepEqual(Array.from(linear.getData(8)), [0, 80]);
    });

    it('gère les facteurs non entiers (ex: 2.5) avec des indices entiers sans injecter de NaN/undefined', () => {
      const values = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
      const linear = new LinearData(new Int16Array(values));

      // 10 / 2.5 = 4 éléments
      const result = linear.getData(2.5);
      assert.equal(result.length, 4);

      // Indices attendus : Math.floor(0*2.5)=0, Math.floor(1*2.5)=2, Math.floor(2*2.5)=5, Math.floor(3*2.5)=7
      assert.deepEqual(Array.from(result), [0, 20, 50, 70]);
      for (let i = 0; i < result.length; i++) {
        assert.ok(!Number.isNaN(result[i]));
      }
    });
  });

  describe('Préservation des types et support Float32Array (TODO PAS QUE INT16)', () => {
    it('conserve le type Int16Array quand la source est Int16Array', () => {
      const src = new Int16Array([10, 20, 30, 40]);
      const linear = new LinearData(src);
      const res = linear.getData(2);

      assert.ok(res instanceof Int16Array, 'Le résultat doit être une instance de Int16Array');
      assert.equal(res.length, 2);
    });

    it('conserve le type Float32Array et préserve la précision décimale (résout la troncature de Int16)', () => {
      const src = new Float32Array([0.1, 0.25, 0.5, 0.75, 1.0, 1.25]);
      const linear = new LinearData(src);
      const res = linear.getData(2);

      assert.ok(res instanceof Float32Array, 'Le résultat doit être une instance de Float32Array');
      assert.equal(res.length, 3);
      assert.ok(Math.abs(res[0] - 0.1) < 1e-6, '0.1 ne doit pas être tronqué à 0 par un Int16Array');
      assert.ok(Math.abs(res[1] - 0.5) < 1e-6);
      assert.ok(Math.abs(res[2] - 1.0) < 1e-6);
    });

    it('conserve le type Float64Array', () => {
      const src = new Float64Array([1.111, 2.222, 3.333, 4.444]);
      const linear = new LinearData(src);
      const res = linear.getData(2);

      assert.ok(res instanceof Float64Array, 'Le résultat doit être une instance de Float64Array');
      assert.equal(res.length, 2);
      assert.equal(res[0], 1.111);
      assert.equal(res[1], 3.333);
    });

    it('supporte les tableaux standards Array', () => {
      const src = [100, 200, 300, 400];
      const linear = new LinearData(src);
      const res = linear.getData(2);

      assert.ok(Array.isArray(res), 'Le résultat doit être un Array');
      assert.deepEqual(res, [100, 300]);
    });
  });

  describe('Extraction avec durée temporelle (_length) et sample rate', () => {
    it('calcule exactement le nombre d\'échantillons selon step (1 / sampleRate)', () => {
      // 100 échantillons à 1000 Hz => step = 1/1000 = 0.001 s
      const buffer = new Int16Array(100);
      for (let i = 0; i < buffer.length; i++) buffer[i] = i;

      const linear = new LinearData(buffer, 1 / 1000);

      // On demande _length = 0.04s (40 ms = 40 échantillons) avec downsampling 2 => 20 échantillons
      const res = linear.getData(2, 0.04);
      assert.equal(res.length, 20);
      assert.equal(res[0], 0);
      assert.equal(res[19], 38); // 19 * 2
    });

    it('limite l\'extraction à la taille du buffer source si _length dépasse les données disponibles', () => {
      // Buffer de 10 échantillons à 100 Hz
      const buffer = new Int16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const linear = new LinearData(buffer, 1 / 100);

      // On demande 1 seconde (100 échantillons), mais le buffer n'en a que 10
      const res = linear.getData(1, 1.0);
      assert.equal(res.length, 10);
      assert.deepEqual(Array.from(res), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('permet de spécifier un sampleRate explicite en 4e argument', () => {
      const buffer = new Int16Array(50);
      for (let i = 0; i < buffer.length; i++) buffer[i] = i * 2;

      const linear = new LinearData(buffer, 1); // step = 1 par défaut
      // _sampleRate explicite = 200 Hz, _length = 0.1 s => 20 échantillons, downsampling = 2 => 10 échantillons
      const res = linear.getData(2, 0.1, false, 200);
      assert.equal(res.length, 10);
      assert.equal(res[0], 0);
      assert.equal(res[9], 36);
    });
  });

  describe('Fonctions utilitaires : getDuration() et stabilize()', () => {
    it('getDuration calcule fidèlement durée = longueur * step', () => {
      const data = new Int16Array(48000);
      const linear = new LinearData(data, 1 / 48000);
      assert.equal(linear.getDuration(), 1.0);

      const empty = new LinearData(new Int16Array(0), 1 / 48000);
      assert.equal(empty.getDuration(), 0);
    });

    it('stabilize trouve le maximum dans les premiers 10% et décale les données', () => {
      // 100 points : les 10 premiers % sont les indices 0 à 9
      const data = new Int16Array(100);
      data[4] = 1000; // Pic maximal à l'index 4
      data[20] = 5000; // Pic encore plus haut mais APRÈS les 10% (doit être ignoré)

      const linear = new LinearData(data, 1);
      const stabilized = linear.stabilize();

      assert.equal(stabilized.length, 96);
      assert.equal(stabilized[0], 1000, 'Le signal stabilisé doit débuter au pic maximal de la première tranche');
    });

    it('getData avec stabilize = true combine la stabilisation et le sous-échantillonnage', () => {
      const data = new Int16Array(100);
      data[4] = 999;
      data[6] = 555;

      const linear = new LinearData(data, 1);
      const result = linear.getData(2, undefined, true);

      assert.equal(result.length, 48); // Math.floor(96 / 2)
      assert.equal(result[0], 999);
      assert.equal(result[1], 555); // (4 + 2 = index 6)
    });
  });

  describe('Robustesse et cas limites', () => {
    it('gère un buffer vide sans erreur', () => {
      const linear = new LinearData(new Int16Array(0));
      const res = linear.getData(2);
      assert.equal(res.length, 0);
    });

    it('gère des données nulles ou indéfinies sans planter', () => {
      const linearNull = new LinearData(null);
      assert.strictEqual(linearNull.getData(2), null);

      const linearUndef = new LinearData(undefined);
      assert.strictEqual(linearUndef.getData(2), undefined);
    });

    it('gère un facteur de sous-échantillonnage supérieur à la longueur des données', () => {
      const data = new Int16Array([10, 20, 30]);
      const linear = new LinearData(data);
      // Facteur 10 > longueur 3 => targetLength = Math.floor(3 / 10) = 0
      const res = linear.getData(10);
      assert.equal(res.length, 0);
    });
  });
});
