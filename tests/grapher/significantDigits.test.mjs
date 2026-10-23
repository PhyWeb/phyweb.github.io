import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, clearSavedSettings } from '../../grapher/modules/settingsManager.js';
import Data from '../../grapher/modules/data.js';
import { formatNumber } from '../../common/formatter.js';

describe('Harmonisation des chiffres significatifs par défaut (4)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('settingsManager.js', () => {
    it('DEFAULT_SETTINGS doit avoir significantDigits fixé à 4', () => {
      assert.strictEqual(DEFAULT_SETTINGS.significantDigits, 4);
    });

    it('loadSettings() doit retourner significantDigits: 4 par défaut sans localStorage', () => {
      const settings = loadSettings();
      assert.strictEqual(settings.significantDigits, 4);
    });

    it('loadSettings() doit conserver la valeur stockée si définie', () => {
      saveSettings({ significantDigits: 2 });
      const settings = loadSettings();
      assert.strictEqual(settings.significantDigits, 2);
    });

    it('clearSavedSettings() doit supprimer les réglages et loadSettings() revient à 4', () => {
      saveSettings({ significantDigits: 6 });
      clearSavedSettings();
      const settings = loadSettings();
      assert.strictEqual(settings.significantDigits, 4);
    });
  });

  describe('Data (data.js)', () => {
    it('doit initialiser significantDigits à 4 par défaut sans arguments', () => {
      const data = new Data();
      assert.strictEqual(data.settings.significantDigits, 4);
    });

    it('doit initialiser significantDigits à 4 si un objet vide est fourni', () => {
      const data = new Data({});
      assert.strictEqual(data.settings.significantDigits, 4);
    });

    it('doit respecter significantDigits si spécifié explicitement dans initialSettings', () => {
      const data = new Data({ significantDigits: 5 });
      assert.strictEqual(data.settings.significantDigits, 5);
    });
  });

  describe('formatNumber (formatter.js)', () => {
    it('doit utiliser 4 chiffres significatifs par défaut si le paramètre est omis', () => {
      // 1.23456 avec 4 chiffres significatifs -> 1.235 -> "1,235"
      const result = formatNumber(1.23456);
      assert.strictEqual(result, '1,235');
    });

    it('doit formater avec notation scientifique à 4 chiffres significatifs si >= 10^4', () => {
      // 123456 avec 4 chiffres significatifs -> 1.235·10⁵
      const result = formatNumber(123456);
      assert.strictEqual(result, '1,235·10⁵');
    });
  });
});

