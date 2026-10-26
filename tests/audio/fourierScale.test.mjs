import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Audio - Échelle du spectre de Fourier (Linéaire / dB)', () => {
  const htmlPath = path.resolve(__dirname, '../../audio/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const mainPath = path.resolve(__dirname, '../../audio/main.js');
  const main = fs.readFileSync(mainPath, 'utf8');

  describe('1. Structure HTML (audio/index.html)', () => {
    it('contient le sélecteur d\'échelle dans #rt-panel avec #rt-fourier-scale-panel', () => {
      assert.ok(
        html.includes('id="rt-fourier-scale-panel"'),
        'Le panneau Temps Réel doit contenir #rt-fourier-scale-panel'
      );
      assert.ok(
        html.includes('Échelle du spectre'),
        'Le titre doit être "Échelle du spectre"'
      );
    });

    it('contient le sélecteur d\'échelle dans #rec-panel avec #rec-fourier-scale-panel', () => {
      assert.ok(
        html.includes('id="rec-fourier-scale-panel"'),
        'Le panneau Acquisition doit contenir #rec-fourier-scale-panel'
      );
      const recPartIndex = html.indexOf('id="rec-fourier-scale-panel"');
      const saveBtnIndex = html.indexOf('id="rec-save-to-tab-button"');
      assert.ok(
        recPartIndex !== -1 && saveBtnIndex !== -1 && recPartIndex < saveBtnIndex,
        '#rec-fourier-scale-panel doit se trouver juste avant #rec-save-to-tab-button'
      );
    });

    it('contient le sélecteur d\'échelle dans #save-panel avant #save-fourier-replot-button', () => {
      const fourierSettingsIndex = html.indexOf('id="fourier-settings-panel"');
      const replotBtnIndex = html.indexOf('id="save-fourier-replot-button"');
      const saveSection = html.substring(fourierSettingsIndex, replotBtnIndex);

      assert.ok(
        saveSection.includes('fourier-scale-lin') && saveSection.includes('fourier-scale-db'),
        '#fourier-settings-panel doit contenir les classes .fourier-scale-lin et .fourier-scale-db avant le bouton replot'
      );
      assert.ok(
        saveSection.includes('Échelle'),
        'Le bloc d\'échelle dans la sauvegarde doit afficher le titre "Échelle"'
      );
    });

    it('tous les sélecteurs possèdent les classes fourier-scale-lin et fourier-scale-db avec "is-active" sur lin par défaut', () => {
      const linMatches = html.match(/class="[^"]*fourier-scale-lin[^"]*"/g) || [];
      const dbMatches = html.match(/class="[^"]*fourier-scale-db[^"]*"/g) || [];

      assert.equal(linMatches.length, 3, 'Il doit y avoir 3 boutons pour l\'échelle linéaire');
      assert.equal(dbMatches.length, 3, 'Il doit y avoir 3 boutons pour l\'échelle en décibels');

      linMatches.forEach(cls => {
        assert.ok(cls.includes('is-active'), 'L\'option linéaire doit être active par défaut (is-active)');
      });
      dbMatches.forEach(cls => {
        assert.ok(!cls.includes('is-active'), 'L\'option dB ne doit pas être active par défaut');
      });
    });
  });

  describe('2. Logique mathématique de conversion dB / Linéaire (formatFourierArrayForDisplay)', () => {
    const DB_MIN = -80;
    const DB_REF = 32768;

    function formatFourierArrayForDisplay(_array, fourierDbScale) {
      if (!fourierDbScale) {
        return Array.from(_array);
      }
      let copy = new Array(_array.length);
      for (let i = 0; i < _array.length; i++) {
        let val = _array[i];
        if (val <= 0) {
          copy[i] = DB_MIN;
        } else {
          let db = 20 * Math.log10(val / DB_REF);
          copy[i] = Math.max(DB_MIN, db);
        }
      }
      return copy;
    }

    it('retourne une copie identique des données en échelle linéaire (fourierDbScale = false)', () => {
      const input = [0, 100, 500, 32768];
      const result = formatFourierArrayForDisplay(input, false);

      assert.deepEqual(result, input);
      assert.notEqual(result, input, 'Doit retourner une nouvelle instance de tableau');
    });

    it('calcule exactement 0 dB FS pour la pleine échelle (val = 32768)', () => {
      const input = [32768];
      const result = formatFourierArrayForDisplay(input, true);

      assert.equal(result[0], 0, '32768 / 32768 donne 0 dB FS');
    });

    it('calcule environ -6.02 dB FS pour la demi-échelle (val = 16384)', () => {
      const input = [16384];
      const result = formatFourierArrayForDisplay(input, true);
      const expected = 20 * Math.log10(0.5);

      assert.ok(Math.abs(result[0] - expected) < 1e-6, `Attendu ${expected}, obtenu ${result[0]}`);
    });

    it('clamping à -80 dB pour les valeurs nulles ou négatives', () => {
      const input = [0, -10, -500];
      const result = formatFourierArrayForDisplay(input, true);

      assert.equal(result[0], -80);
      assert.equal(result[1], -80);
      assert.equal(result[2], -80);
    });

    it('clamping à DB_MIN (-80 dB) pour les amplitudes très faibles (< -80 dB)', () => {
      // 1 / 32768 -> 20 * log10(1/32768) = -90.3 dB -> doit être clampé à -80 dB
      const input = [1];
      const result = formatFourierArrayForDisplay(input, true);

      assert.equal(result[0], -80, 'Une valeur donnant -90 dB doit être bridée à DB_MIN (-80 dB)');
    });
  });

  describe('3. Intégration et conformité du code dans audio/main.js', () => {
    it('déclare let fourierDbScale = false et les constantes DB_MIN et DB_REF', () => {
      assert.ok(main.includes('let fourierDbScale = false;'), 'Doit déclarer let fourierDbScale = false');
      assert.ok(main.includes('const DB_MIN = -80;'), 'Doit déclarer const DB_MIN = -80');
      assert.ok(main.includes('const DB_REF = 32768;'), 'Doit déclarer const DB_REF = 32768');
    });

    it('masque #rt-fourier-scale-panel et #rec-fourier-scale-panel en mode simple', () => {
      const simpleModeBlock = main.substring(main.indexOf('$("#simple-mode-button").addEventListener'));
      assert.ok(
        simpleModeBlock.includes('$("#rt-fourier-scale-panel").style.display = "none";'),
        'simple-mode-button doit masquer #rt-fourier-scale-panel'
      );
      assert.ok(
        simpleModeBlock.includes('$("#rec-fourier-scale-panel").style.display = "none";'),
        'simple-mode-button doit masquer #rec-fourier-scale-panel'
      );
    });

    it('met à jour les axes Y et tooltips dans updateFourierChartsAxisScale', () => {
      assert.ok(
        main.includes('function updateFourierChartsAxisScale()'),
        'Doit définir updateFourierChartsAxisScale'
      );
      assert.ok(
        main.includes('const yTitle = fourierDbScale ? "Niveau (dB)" : "Amplitude";'),
        'Titre Y conditionné par fourierDbScale'
      );
      assert.ok(
        main.includes('const yMin = fourierDbScale ? DB_MIN : 0;'),
        'Min Y conditionné par fourierDbScale'
      );
      assert.ok(
        main.includes('threshold: yThreshold'),
        'threshold mis à jour sur la série'
      );
      assert.ok(
        main.includes('Highcharts.numberFormat(this.y, decimals) + unit'),
        'Tooltip formaté selon fourierDbScale'
      );
    });

    it('synchronise l\'état visuel et les écouteurs pour .fourier-scale-lin et .fourier-scale-db', () => {
      assert.ok(
        main.includes('document.querySelectorAll(".fourier-scale-lin").forEach'),
        'Écouteurs attachés sur .fourier-scale-lin'
      );
      assert.ok(
        main.includes('document.querySelectorAll(".fourier-scale-db").forEach'),
        'Écouteurs attachés sur .fourier-scale-db'
      );
    });

    it('utilise formatFourierArrayForDisplay dans realtimeDraw, recordGraphDraw, saveDraw et onFourierReplotButtonClick', () => {
      assert.ok(
        main.includes('rtFourierChart.series[0].setData(formatFourierArrayForDisplay(rtFourierData.getData())'),
        'realtimeDraw doit appeler formatFourierArrayForDisplay'
      );
      assert.ok(
        main.includes('recFourierChart.series[0].setData(formatFourierArrayForDisplay(recFourierData.getData()))'),
        'recordGraphDraw doit appeler formatFourierArrayForDisplay'
      );
      assert.ok(
        main.includes('savFourierChart.series[0].setData(formatFourierArrayForDisplay(saves[tabManager.activeTab-2].fLinearData.getData()), false)'),
        'saveDraw doit appeler formatFourierArrayForDisplay'
      );
      assert.ok(
        main.includes('savFourierChart.series[0].setData(formatFourierArrayForDisplay(saves[tabManager.activeTab-2].fLinearData.getData()))'),
        'onFourierReplotButtonClick doit appeler formatFourierArrayForDisplay'
      );
    });
  });
});

