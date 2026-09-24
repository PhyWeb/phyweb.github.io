import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Fourier from '../../audio/modules/fourier.js';

describe('Audio - Fourier Transform & Zero Padding (audio/modules/fourier.js)', () => {
  describe('Preuve du bug historique dans computeNormalizedFft avec _zeroPadding == true', () => {
    it('met en évidence le débordement d\'indice de lecture [i*2+1] et l\'injection de NaN sur la 2e moitié', () => {
      const N = 256;
      const fourier = new Fourier(N);
      const inputData = { data: new Float32Array(N).fill(1) };
      const rawFft = fourier.computeFft(inputData, true);

      assert.equal(rawFft.real.length, 512, 'Le tableau brut FFT avec zero-padding doit avoir une longueur de 512');

      const outOfBoundsReadIndices = [];
      for (let i = 0; i < rawFft.real.length; i++) {
        const readIndex = i * 2 + 1;
        if (readIndex >= rawFft.real.length) {
          outOfBoundsReadIndices.push({ i, readIndex });
        }
      }

      // La moitié exacte des itérations (de 256 à 511) tentait de lire hors limites (indices 513 à 1023)
      assert.equal(outOfBoundsReadIndices.length, 256);
      assert.equal(outOfBoundsReadIndices[0].i, 256);
      assert.equal(outOfBoundsReadIndices[0].readIndex, 513);
      assert.equal(outOfBoundsReadIndices[255].i, 511);
      assert.equal(outOfBoundsReadIndices[255].readIndex, 1023);
    });

    it('prouve l\'erreur de calcul du pas fréquentiel historique (_result.step = hzPerSample * 2 au lieu de / 2)', () => {
      const sampleRate = 44100;
      const N = 256;
      const hzPerSample = sampleRate / N; // 172.265625 Hz

      // Le pas théorique avec zero-padding x2 (512 points) est sampleRate / (N * 2) = 86.1328125 Hz
      const expectedStep = sampleRate / (N * 2);
      const buggyStep = hzPerSample * 2; // 344.53125 Hz

      assert.equal(buggyStep / expectedStep, 4, 'L\'ancien pas était 4 fois trop grand par rapport à la résolution réelle');
    });
  });

  describe('Validation de computeNormalizedFft sans zero-padding (_zeroPadding == false)', () => {
    it('calcule correctement le spectre sans NaN et avec le bon pas fréquentiel', () => {
      const N = 256;
      const sampleRate = 44100;
      const fourier = new Fourier(N);

      // Onde cosinus à 16 cycles dans le buffer
      const signal = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        signal[i] = Math.cos((2 * Math.PI * 16 * i) / N);
      }

      const result = { data: new Float32Array(N / 2), step: 0 };
      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, false);

      // Pas fréquentiel
      const expectedStep = sampleRate / N;
      assert.ok(Math.abs(result.step - expectedStep) < 1e-4);

      // Aucun NaN
      for (let i = 0; i < result.data.length; i++) {
        assert.ok(!Number.isNaN(result.data[i]), `NaN détecté à l'indice ${i}`);
      }

      // Pic à l'indice 16
      let maxVal = -1;
      let maxIdx = -1;
      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i] > maxVal) {
          maxVal = result.data[i];
          maxIdx = i;
        }
      }
      assert.equal(maxIdx, 16);
      assert.ok(maxVal > 0.8 && maxVal <= 1.05, `Amplitude attendue proche de 1.0, reçu: ${maxVal}`);
    });
  });

  describe('Validation de computeNormalizedFft corrigé avec zero-padding (_zeroPadding == true)', () => {
    it('ne doit produire aucun NaN dans l\'intégralité des données spectrales', () => {
      const N = 256;
      const sampleRate = 44100;
      const fourier = new Fourier(N);

      const signal = new Float32Array(N).fill(1);
      const result = { data: new Float32Array(N * 2), step: 0 };

      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, true);

      const nanIndices = [];
      for (let i = 0; i < result.data.length; i++) {
        if (Number.isNaN(result.data[i])) {
          nanIndices.push(i);
        }
      }

      assert.equal(nanIndices.length, 0, `Des NaN ont été trouvés aux indices : ${nanIndices.slice(0, 10).join(', ')}...`);
    });

    it('calcule le pas fréquentiel correct (divisé par 2 grâce au doublement de points)', () => {
      const N = 256;
      const sampleRate = 44100;
      const fourier = new Fourier(N);

      const signal = new Float32Array(N).fill(0);
      const result = { data: new Float32Array(N), step: 0 };

      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, true);

      const expectedStep = sampleRate / (N * 2);
      assert.ok(Math.abs(result.step - expectedStep) < 1e-4, `Pas attendu ${expectedStep}, reçu ${result.step}`);
    });

    it('détecte correctement le pic spectral d\'un signal sinusoïdal sans décalage ni distorsion', () => {
      const N = 256;
      const sampleRate = 44100;
      const fourier = new Fourier(N);

      // Signal sinusoïdal de 16 périodes (fréquence 16 * sampleRate / N = 2756.25 Hz)
      const signal = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        signal[i] = Math.cos((2 * Math.PI * 16 * i) / N);
      }

      const result = { data: new Float32Array(N), step: 0 };
      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, true);

      // Avec zero-padding x2 (512 points), le pic de 16 cycles se trouve au bin 32
      let maxVal = -1;
      let maxIdx = -1;
      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i] > maxVal) {
          maxVal = result.data[i];
          maxIdx = i;
        }
      }

      assert.equal(maxIdx, 32, `Le pic doit être localisé au bin 32, trouvé au bin ${maxIdx}`);
      const detectedFreq = maxIdx * result.step;
      const expectedFreq = (16 * sampleRate) / N;
      assert.ok(Math.abs(detectedFreq - expectedFreq) < 1e-3, `Fréquence attendue: ${expectedFreq}, détectée: ${detectedFreq}`);
      assert.ok(maxVal > 0.8 && maxVal <= 1.05, `Amplitude normalisée attendue proche de 1.0, reçu: ${maxVal}`);
    });

    it('respecte strictement la taille du tableau récepteur _result.data sans déborder', () => {
      const N = 256;
      const sampleRate = 44100;
      const fourier = new Fourier(N);

      const signal = new Float32Array(N).fill(1);
      // Taille cible plus petite que le rawFft (ex: 64 points)
      const smallTarget = new Float32Array(64);
      const result = { data: smallTarget, step: 0 };

      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, true);

      assert.equal(result.data.length, 64);
      for (let i = 0; i < result.data.length; i++) {
        assert.ok(!Number.isNaN(result.data[i]));
      }
    });

    it('gère correctement un Array JavaScript standard sans l\'agrandir artificiellement', () => {
      const N = 256;
      const sampleRate = 44100;
      const fourier = new Fourier(N);

      const signal = new Float32Array(N).fill(1);
      const standardArray = new Array(128).fill(0);
      const result = { data: standardArray, step: 0 };

      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, true);

      // La taille ne doit pas avoir explosé à 512
      assert.equal(result.data.length, 128);
      for (let i = 0; i < result.data.length; i++) {
        assert.ok(!Number.isNaN(result.data[i]));
      }
    });

    it('fonctionne avec des tailles arbitraires non puissances de 2 (fallback Bluestein)', () => {
      const N = 300;
      const sampleRate = 44100;
      const fourier = new Fourier(256); // N différent de nayuki.n

      const signal = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        signal[i] = Math.sin((2 * Math.PI * 10 * i) / N);
      }

      const result = { data: new Float32Array(N), step: 0 };
      fourier.computeNormalizedFft({ data: signal }, result, sampleRate, true);

      for (let i = 0; i < result.data.length; i++) {
        assert.ok(!Number.isNaN(result.data[i]));
      }
      assert.equal(result.step, sampleRate / (N * 2));
    });
  });
});

