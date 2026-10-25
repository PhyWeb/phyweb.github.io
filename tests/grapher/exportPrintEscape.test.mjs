import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UIManager, { escapeHTML } from '../../grapher/modules/ui.js';

describe('UIManager - Sécurisation et échappement HTML dans generatePrintHTML', () => {
  const createMockUIManager = (calcText = '', headers = [], table = []) => {
    const dataMock = {
      settings: { significantDigits: 4 },
      getHeaders: () => headers,
      getTable: () => table
    };

    const editorMock = {
      getValue: () => calcText
    };

    const grapherMock = {
      chart: null
    };

    const uiManager = new UIManager({}, dataMock, grapherMock, {}, editorMock, {});
    return { uiManager };
  };

  describe('Fonction utilitaire escapeHTML', () => {
    it('doit retourner une chaîne vide pour les valeurs nulles, indéfinies ou vides', () => {
      assert.equal(escapeHTML(''), '');
      assert.equal(escapeHTML(null), '');
      assert.equal(escapeHTML(undefined), '');
    });

    it('doit convertir &, <, >, ", \' en entités HTML', () => {
      const input = '<div class="test" data-val=\'42\'>A & B > C</div>';
      const expected = '&lt;div class=&quot;test&quot; data-val=&#39;42&#39;&gt;A &amp; B &gt; C&lt;/div&gt;';
      assert.equal(escapeHTML(input), expected);
    });
  });

  describe('Échappement du titre (title)', () => {
    it('doit neutraliser les balises de script et de style dans le titre', () => {
      const { uiManager } = createMockUIManager();
      const rawTitle = '<script>alert("XSS")</script>';
      const html = uiManager.generatePrintHTML(false, false, false, '1cm', rawTitle, 800, 500, 1);

      assert.ok(!html.includes('<script>alert("XSS")</script>'));
      assert.ok(html.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'));
      assert.ok(html.includes('display: block'));
    });

    it('doit échapper les caractères spéciaux &, <, >, ", \' dans le titre', () => {
      const { uiManager } = createMockUIManager();
      const rawTitle = 'Rapport : Mesure <A> & "B" > C \'D\'';
      const html = uiManager.generatePrintHTML(false, false, false, '1cm', rawTitle, 800, 500, 1);

      assert.ok(!html.includes('<A>'));
      assert.ok(html.includes('&lt;A&gt;'));
      assert.ok(html.includes('&amp;'));
      assert.ok(html.includes('&quot;B&quot;'));
      assert.ok(html.includes('&gt; C &#39;D&#39;'));
    });

    it('doit masquer le titre s\'il est vide', () => {
      const { uiManager } = createMockUIManager();
      const html = uiManager.generatePrintHTML(false, false, false, '1cm', '', 800, 500, 1);

      assert.ok(html.includes('display: none'));
    });
  });

  describe('Échappement des calculs (calcText)', () => {
    it('doit préserver les comparaisons (<, >) et opérateurs logiques (&&) sans générer de balises cassées', () => {
      const { uiManager } = createMockUIManager('// Calcul seuil\nif (x < 10 && y > 20) {\n  y = x * 2;\n}');
      const html = uiManager.generatePrintHTML(false, false, true, '1cm', 'Test', 800, 500, 1);

      assert.ok(!html.includes('if (x < 10'));
      assert.ok(html.includes('if (x &lt; 10 &amp;&amp; y &gt; 20)'));
    });

    it('doit empêcher la fermeture prématurée de la balise <pre> avec </pre>', () => {
      const { uiManager } = createMockUIManager('</pre><div id="injected">Pwned</div><pre>');
      const html = uiManager.generatePrintHTML(false, false, true, '1cm', 'Test', 800, 500, 1);

      assert.ok(!html.includes('<div id="injected">Pwned</div>'));
      assert.ok(html.includes('&lt;/pre&gt;&lt;div id=&quot;injected&quot;&gt;Pwned&lt;/div&gt;&lt;pre&gt;'));
    });

    it('doit afficher un texte par défaut si les calculs sont vides', () => {
      const { uiManager } = createMockUIManager('   ');
      const html = uiManager.generatePrintHTML(false, false, true, '1cm', 'Test', 800, 500, 1);

      assert.ok(html.includes('<pre>Aucun calcul enregistré.</pre>'));
    });
  });

  describe('Échappement des en-têtes de colonnes (headers)', () => {
    it('doit échapper les chevrons et caractères spéciaux dans les en-têtes de tableau', () => {
      const headers = ['Grandeur <X>', 'Ratio U & I', 'Sensibilité "S"'];
      const table = [[1, 2, 3]];
      const { uiManager } = createMockUIManager('', headers, table);
      const html = uiManager.generatePrintHTML(false, true, false, '1cm', 'Test', 800, 500, 1);

      assert.ok(!html.includes('<X>'));
      assert.ok(html.includes('<div class="flex-cell row-header">Grandeur &lt;X&gt;</div>'));
      assert.ok(html.includes('<div class="flex-cell row-header">Ratio U &amp; I</div>'));
      assert.ok(html.includes('<div class="flex-cell row-header">Sensibilité &quot;S&quot;</div>'));
    });
  });
});
