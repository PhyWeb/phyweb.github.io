import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Tableau Périodique - Structure de défilement et contrôle de fenêtre (#app / .app-content)', () => {
  const htmlPath = path.join(rootDir, 'applets/tableau/index.html');
  const cssPath = path.join(rootDir, 'applets/tableau/style.css');
  const commonCssPath = path.join(rootDir, 'common/common.css');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const commonCssContent = fs.readFileSync(commonCssPath, 'utf8');

  it('prouve que common.css verrouille le scroll global (body, html { overflow: hidden; })', () => {
    assert.match(
      commonCssContent,
      /body,\s*html\s*\{[^}]*overflow:\s*hidden/s,
      'common.css doit définir overflow: hidden sur body, html'
    );
    assert.match(
      commonCssContent,
      /\.app-content\s*\{[^}]*overflow-y:\s*auto/s,
      'common.css attend .app-content pour gérer le défilement vertical'
    );
  });

  it('tableau/index.html doit contenir <div id="app"> englobant la barre de navigation et le contenu', () => {
    assert.match(
      htmlContent,
      /<div\s+id=["']app["']/,
      'tableau/index.html doit avoir un conteneur racine <div id="app">'
    );
    assert.match(
      htmlContent,
      /<div\s+class=["'][^"']*app-content[^"']*["']/,
      'tableau/index.html doit avoir un conteneur défilant .app-content'
    );
  });

  it('#navbar-container et .app-content doivent être enfants de #app dans le bon ordre', () => {
    const appIndex = htmlContent.indexOf('id="app"');
    const navbarIndex = htmlContent.indexOf('id="navbar-container"');
    const appContentIndex = htmlContent.indexOf('class="app-content"');
    const sectionIndex = htmlContent.indexOf('<section');

    assert.ok(appIndex !== -1, '#app doit exister');
    assert.ok(navbarIndex > appIndex, '#navbar-container doit être à l\'intérieur de #app');
    assert.ok(appContentIndex > navbarIndex, '.app-content doit être placé après #navbar-container');
    assert.ok(sectionIndex > appContentIndex, '<section> doit être enveloppée dans .app-content');
  });

  it('tableau/style.css doit attribuer le padding-bottom pour le footer flottant sur .app-content', () => {
    assert.match(
      cssContent,
      /\.app-content\s*\{[^}]*padding-bottom:\s*100px/s,
      '.app-content doit avoir padding-bottom: 100px pour éviter la superposition avec #global-controls'
    );
  });
});

