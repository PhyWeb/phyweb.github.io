import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UIManager, { MAX_PRINT_TABLE_POINTS } from '../../grapher/modules/ui.js';

describe('UIManager - generatePrintHTML et limitation du tableau d\'impression', () => {
  const createMockUIManager = (numPoints, numCols = 2, customData = null) => {
    const headers = Array.from({ length: numCols }, (_, i) => `Col_${i + 1}`);
    let table;
    if (customData) {
      table = customData;
    } else {
      table = Array.from({ length: numPoints }, (_, r) =>
        Array.from({ length: numCols }, (_, c) => (r + 1) * 10 + c)
      );
    }

    const dataMock = {
      settings: { significantDigits: 4 },
      getHeaders: () => headers,
      getTable: () => table
    };

    const editorMock = {
      getValue: () => ''
    };

    const grapherMock = {
      chart: null
    };

    const uiManager = new UIManager({}, dataMock, grapherMock, {}, editorMock, {});
    return { uiManager, headers, table };
  };

  it('doit définir la constante MAX_PRINT_TABLE_POINTS à 500', () => {
    assert.equal(MAX_PRINT_TABLE_POINTS, 500);
    assert.equal(UIManager.MAX_PRINT_TABLE_POINTS, 500);
  });

  it('doit générer tous les points sans message de troncature pour un petit volume (50 points)', () => {
    const { uiManager } = createMockUIManager(50, 2);
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test 50 points', 800, 500, 1);

    // Vérifie que la table flex est présente
    assert.ok(html.includes('<div class="flex-table">'), 'Doit contenir la flex-table');

    // Compte le nombre de colonnes de données (flex-col sans header-col)
    const matchesCol = html.match(/<div class="flex-col">/g) || [];
    assert.equal(matchesCol.length, 50, 'Doit contenir exactement 50 colonnes de données');

    // Le message de limitation ne doit PAS être présent
    assert.ok(!html.includes('print-table-notice'), 'Ne doit pas afficher de notice de limitation');
    assert.ok(!html.includes('Affichage limité'), 'Ne doit pas afficher le texte de limitation');
  });

  it('doit plafonner à MAX_PRINT_TABLE_POINTS (500) pour un grand volume (10 000 points) et afficher un avertissement', () => {
    const { uiManager } = createMockUIManager(10000, 3);
    
    const startTime = performance.now();
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test 10000 points', 800, 500, 1);
    const duration = performance.now() - startTime;

    // Vérifie la performance : doit s'exécuter en moins de 100ms (pas de freeze)
    assert.ok(duration < 100, `L'exécution a pris ${duration.toFixed(2)}ms, ce qui dépasse le seuil de fluidité (100ms)`);

    // Compte le nombre de colonnes de données
    const matchesCol = html.match(/<div class="flex-col">/g) || [];
    assert.equal(matchesCol.length, 500, 'Doit limiter le nombre de colonnes à 500');

    // Vérifie que le DOM reste léger (< 3000 divs au total)
    const totalDivs = (html.match(/<div/g) || []).length;
    assert.ok(totalDivs < 3000, `Nombre total de divs (${totalDivs}) excessif`);

    // Vérifie la présence de la notice d'avertissement avec les nombres clés
    assert.ok(html.includes('print-table-notice'), 'Doit inclure la classe print-table-notice');
    assert.ok(html.includes('500'), 'La notice doit mentionner la limite de 500 points');
    assert.ok(html.includes('10000') || html.includes('10\u202F000') || html.includes('10 000'), 'La notice doit mentionner le total de 10 000 points');
    assert.ok(html.includes('CSV'), 'La notice doit recommander l\'export CSV');
  });

  it('doit gérer le cas frontière de 500 points sans troncature', () => {
    const { uiManager } = createMockUIManager(500, 2);
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test 500 points', 800, 500, 1);

    const matchesCol = html.match(/<div class="flex-col">/g) || [];
    assert.equal(matchesCol.length, 500, 'Doit afficher les 500 points');
    assert.ok(!html.includes('print-table-notice'), 'Ne doit pas afficher de notice pour exactement 500 points');
  });

  it('doit tronquer et afficher la notice dès 501 points', () => {
    const { uiManager } = createMockUIManager(501, 2);
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test 501 points', 800, 500, 1);

    const matchesCol = html.match(/<div class="flex-col">/g) || [];
    assert.equal(matchesCol.length, 500, 'Doit afficher 500 points');
    assert.ok(html.includes('print-table-notice'), 'Doit afficher la notice pour 501 points');
    assert.ok(html.includes('501'), 'Doit mentionner le total de 501 points');
  });

  it('doit gérer un jeu de données vide (0 point) sans erreur', () => {
    const { uiManager } = createMockUIManager(0, 2);
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test vide', 800, 500, 1);

    assert.ok(typeof html === 'string');
    assert.ok(!html.includes('print-table-notice'));
  });

  it('doit formater correctement les cellules avec des valeurs nulles, NaN ou indéfinies', () => {
    const customData = [
      [1.23456, null],
      [NaN, undefined],
      ['', 42.9876]
    ];
    const { uiManager } = createMockUIManager(3, 2, customData);
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test format', 800, 500, 1);

    assert.ok(html.includes('1.235') || html.includes('1,235'), 'Doit formater avec les chiffres significatifs');
    assert.ok(html.includes('<div class="flex-cell"></div>'), 'Les valeurs vides/NaN doivent être des cellules vides');
  });

  it('doit supporter 50 000 points sans latence et avec une taille HTML réduite (< 200 Ko)', () => {
    const { uiManager } = createMockUIManager(50000, 2);
    
    const startTime = performance.now();
    const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test 50000 points', 800, 500, 1);
    const duration = performance.now() - startTime;

    assert.ok(duration < 100, `Génération pour 50000 points a pris ${duration.toFixed(2)}ms`);
    const sizeKB = Buffer.byteLength(html, 'utf8') / 1024;
    assert.ok(sizeKB < 200, `Taille HTML (${sizeKB.toFixed(2)} Ko) doit rester bien inférieure à 200 Ko`);
  });
});

