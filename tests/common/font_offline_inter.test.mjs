import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Inter font - Hébergement local et autonomie hors-ligne', () => {
  const commonCssPath = path.join(rootDir, 'common/common.css');
  const fontsDirPath = path.join(rootDir, 'common/assets/fonts');
  const licensesPath = path.join(rootDir, 'common/licenses.json');

  const commonCssContent = fs.readFileSync(commonCssPath, 'utf8');

  it('common.css ne doit pas importer de police Google Fonts distante', () => {
    assert.doesNotMatch(
      commonCssContent,
      /@import\s+url\(['"]?https?:\/\/fonts\.googleapis\.com/i,
      'common.css ne doit plus dépendre de fonts.googleapis.com'
    );
  });

  it('common.css doit définir @font-face pointant vers le fichier local InterVariable.woff2', () => {
    assert.match(
      commonCssContent,
      /@font-face\s*\{[^}]*font-family:\s*['"]Inter['"][^}]*url\(['"]\.\/assets\/fonts\/InterVariable\.woff2['"]\)/s,
      'common.css doit déclarer @font-face pour Inter avec ./assets/fonts/InterVariable.woff2'
    );
  });

  it('les fichiers de police .woff2 doivent exister localement avec l en-tête WOFF2 valide', () => {
    const requiredFonts = ['InterVariable.woff2', 'InterVariable-Italic.woff2'];

    for (const fontFile of requiredFonts) {
      const fontPath = path.join(fontsDirPath, fontFile);
      assert.ok(fs.existsSync(fontPath), `Le fichier de police ${fontFile} doit être présent dans common/assets/fonts/`);

      const buffer = fs.readFileSync(fontPath);
      assert.ok(buffer.length > 50000, `${fontFile} doit être d'une taille plausible (> 50 Ko)`);

      const magic = buffer.subarray(0, 4).toString('ascii');
      assert.equal(magic, 'wOF2', `${fontFile} doit commencer par la signature magique wOF2`);
    }
  });

  it('la licence de la police Inter doit être renseignée dans licenses.json et OFL.txt', () => {
    const oflPath = path.join(fontsDirPath, 'OFL.txt');
    assert.ok(fs.existsSync(oflPath), 'OFL.txt doit être présent dans common/assets/fonts/');

    const licenses = JSON.parse(fs.readFileSync(licensesPath, 'utf8'));
    const interLicense = licenses.find(item => item.name === 'Inter');
    assert.ok(interLicense, 'Inter doit être référencé dans licenses.json');
    assert.match(interLicense.license, /OFL/i, 'La licence Inter doit être de type OFL');
  });
});

