import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Common } from '../../common/common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Audio - Correctifs d\'interface, de configuration et de typage', () => {
  it('Common.colors contient primaryRGB avec la bonne valeur', () => {
    if (!document.documentElement) {
      document.documentElement = {
        addEventListener: () => {},
        removeEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false }
      };
    }
    const common = new Common('TestApp');
    assert.equal(common.colors.primaryRGB, 'rgb(0, 209, 178)');
    assert.equal(common.colors.primary, 'hsl(171, 100.00%, 41.00%)');
  });

  it('audio/index.html a max="60" pour #sample-length-input', () => {
    const htmlPath = path.resolve(__dirname, '../../audio/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(
      html,
      /<input[^>]*id="sample-length-input"[^>]*max="60"/,
      'L\'élément #sample-length-input doit avoir max="60"'
    );
  });

  it('audio/main.js convertit la fréquence en nombre sur change', () => {
    const mainPath = path.resolve(__dirname, '../../audio/main.js');
    const main = fs.readFileSync(mainPath, 'utf8');

    assert.ok(
      main.includes('recSampleRate = parseFloat($("#rec-samplerate-select").value);'),
      'recSampleRate doit être converti avec parseFloat()'
    );

    assert.ok(
      main.includes('$("#save-samplerate-select").addEventListener("change", () => {'),
      'save-samplerate-select doit écouter l\'événement change'
    );
    assert.ok(
      main.includes('baseSampleRate / parseFloat($("#save-samplerate-select").value);'),
      'displaySampleRateLvl doit utiliser parseFloat sur la valeur du select'
    );
  });

  it('audio/main.js met à jour l\'axe X avec setExtremes dans recordGraphDraw', () => {
    const mainPath = path.resolve(__dirname, '../../audio/main.js');
    const main = fs.readFileSync(mainPath, 'utf8');

    assert.ok(
      main.includes('recWaveChart.xAxis[0].setExtremes(0, recWaveData.getDuration(), false);'),
      'recWaveChart doit appeler setExtremes sur xAxis[0]'
    );
    assert.ok(
      !main.includes('recWaveChart.xAxis.max = recWaveData.getDuration();'),
      'L\'ancienne assignation inopérante xAxis.max doit être retirée'
    );
  });

  it('audio/main.js formate l\'étiquette d\'amplification avec virgule et une décimale', () => {
    const mainPath = path.resolve(__dirname, '../../audio/main.js');
    const main = fs.readFileSync(mainPath, 'utf8');

    assert.ok(
      main.includes('$("#amplification-label").innerHTML = "x " + parseFloat(audio.gain).toFixed(1).replace(\'.\', \',\');'),
      'L\'étiquette d\'amplification doit formater avec toFixed(1) et remplacer le point par une virgule'
    );
  });

  it('audio/main.js initialise range avec [0, rtLength] lors de la sauvegarde depuis le Temps Réel', () => {
    const mainPath = path.resolve(__dirname, '../../audio/main.js');
    const main = fs.readFileSync(mainPath, 'utf8');

    // Vérifie que tabManager.activeTab == 0 a [0, rtLength]
    const rtSaveBlockMatch = main.match(/if\s*\(\s*tabManager\.activeTab\s*==\s*0\s*\)\s*\{[\s\S]*?else\s*\{/);
    assert.ok(rtSaveBlockMatch, 'Le bloc if(tabManager.activeTab == 0) doit être présent');
    assert.ok(
      rtSaveBlockMatch[0].includes('range: {xRange: [0, rtLength], yRange: [undefined, undefined]}'),
      'L\'onglet Temps Réel doit avoir xRange: [0, rtLength]'
    );

    // Et que le bloc else a [undefined, undefined]
    const elseBlockMatch = main.match(/else\s*\{[\s\S]*?tabManager\.newTab/);
    assert.ok(elseBlockMatch, 'Le bloc else doit être présent');
    assert.ok(
      elseBlockMatch[0].includes('range: {xRange: [undefined, undefined], yRange: [undefined, undefined]}'),
      'L\'onglet Acquisition doit conserver xRange: [undefined, undefined]'
    );
  });

  it('audio/main.js exporte vers Grapher avec le commentaire PhyWeb Audio', () => {
    const mainPath = path.resolve(__dirname, '../../audio/main.js');
    const main = fs.readFileSync(mainPath, 'utf8');

    assert.ok(
      main.includes('exportToPW(series, {rowMustBeComplete : false}, "Audio", "// Enregistrement PhyWeb Audio");'),
      'L\'export vers Grapher doit porter le commentaire // Enregistrement PhyWeb Audio'
    );
    assert.ok(
      !main.includes('exportToPW(series, {rowMustBeComplete : false}, "Audio", "// Enregistrement PhyWeb Tracker");'),
      'L\'ancien commentaire PhyWeb Tracker doit être retiré'
    );
  });

  it('audio/index.html et audio.css gèrent correctement les ombres de la navbar et de la barre d\'onglets sans double ombre', () => {
    const htmlPath = path.resolve(__dirname, '../../audio/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Le conteneur parent ne doit pas avoir has-box-shadow (sinon double ombre quand tab-bar est masqué)
    assert.match(
      html,
      /<div class="p-0 has-background-white">\s*<nav class="navbar has-box-shadow/,
      'Le conteneur ne doit pas avoir has-box-shadow, mais la navbar doit l\'avoir'
    );

    // #tab-bar doit avoir has-box-shadow pour projeter l'ombre inférieure sous les onglets
    assert.match(
      html,
      /<div class="[^"]*has-box-shadow[^"]*" id="tab-bar"/,
      '#tab-bar doit avoir has-box-shadow'
    );

    // audio.css doit définir z-index < 30 pour que l'ombre de la navbar passe par-dessus tab-bar
    const cssPath = path.resolve(__dirname, '../../audio/lib/audio.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.match(
      css,
      /#tab-bar\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*10;/,
      '#tab-bar doit être position: relative avec z-index: 10 dans audio.css'
    );

    // Retrait du petit trait à la jonction entre navbar et tab-bar (pas de bordure ni d'anneau 1px de box-shadow)
    assert.match(
      css,
      /\.navbar\s*\{[^}]*border-bottom:\s*none[^}]*box-shadow:\s*rgba\(9,\s*10,\s*12,\s*0\.1\)\s*0px\s*8px\s*16px\s*-2px/,
      'La navbar doit avoir border-bottom: none et une ombre sans anneau 1px'
    );
    assert.match(
      css,
      /#tab-bar\s*\{[^}]*border-top:\s*none[^}]*box-shadow:\s*rgba\(9,\s*10,\s*12,\s*0\.1\)\s*0px\s*8px\s*16px\s*-2px/,
      '#tab-bar doit avoir border-top: none et une ombre sans anneau 1px'
    );

    // #save-tabs vide ne doit pas avoir de border-bottom (qui remonterait en haut à y=0 et créerait un trait entre les barres)
    assert.match(
      css,
      /#save-tabs:empty[^{]*\{[^}]*border-bottom:\s*none/s,
      '#save-tabs:empty doit supprimer border-bottom'
    );
    assert.match(
      html,
      /<ul id="save-tabs"><\/ul>/,
      '#save-tabs doit être strictement vide dans le HTML initial'
    );
  });
});
