import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { enforceIntegerInputs } from '../../common/common.js';

class MockKeyboardEvent extends Event {
  constructor(type, options = {}) {
    super(type, { cancelable: true });
    this.key = options.key || '';
  }
}

class MockInputElement extends EventTarget {
  constructor(initialValue = '') {
    super();
    this.value = initialValue;
  }
}

describe('enforceIntegerInputs - Validation des inputs numériques entiers', () => {
  let mockInput;
  let originalQSAllOverride;

  beforeEach(() => {
    mockInput = new MockInputElement();
    originalQSAllOverride = global.__querySelectorAllOverride;
    global.__querySelectorAllOverride = (sel) => {
      if (sel === 'input.integer') {
        return [mockInput];
      }
      return [];
    };
  });

  afterEach(() => {
    global.__querySelectorAllOverride = originalQSAllOverride;
  });

  it('bloque la touche "e" minuscule lors de keydown', () => {
    enforceIntegerInputs();
    const evt = new MockKeyboardEvent('keydown', { key: 'e' });
    mockInput.dispatchEvent(evt);
    assert.strictEqual(evt.defaultPrevented, true, '"e" doit être bloqué via preventDefault()');
  });

  it('bloque la touche "E" majuscule lors de keydown (reproduction et correction du bug)', () => {
    enforceIntegerInputs();
    const evt = new MockKeyboardEvent('keydown', { key: 'E' });
    mockInput.dispatchEvent(evt);
    assert.strictEqual(evt.defaultPrevented, true, '"E" majuscule doit être bloqué via preventDefault()');
  });

  it('bloque les caractères non entiers ".", "-", "+", "," lors de keydown', () => {
    enforceIntegerInputs();
    ['.', '-', '+', ','].forEach((char) => {
      const evt = new MockKeyboardEvent('keydown', { key: char });
      mockInput.dispatchEvent(evt);
      assert.strictEqual(evt.defaultPrevented, true, `"${char}" doit être bloqué via preventDefault()`);
    });
  });

  it('autorise les chiffres 0-9 lors de keydown', () => {
    enforceIntegerInputs();
    for (let i = 0; i <= 9; i++) {
      const evt = new MockKeyboardEvent('keydown', { key: String(i) });
      mockInput.dispatchEvent(evt);
      assert.strictEqual(evt.defaultPrevented, false, `Le chiffre "${i}" ne doit pas être bloqué`);
    }
  });

  it('autorise les touches de contrôle et de navigation', () => {
    enforceIntegerInputs();
    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'].forEach((key) => {
      const evt = new MockKeyboardEvent('keydown', { key });
      mockInput.dispatchEvent(evt);
      assert.strictEqual(evt.defaultPrevented, false, `La touche "${key}" ne doit pas être bloquée`);
    });
  });

  it('supprime les caractères non numériques lors de l événement input', () => {
    enforceIntegerInputs();
    mockInput.value = '12a34b';
    const evt = new Event('input');
    mockInput.dispatchEvent(evt);
    assert.strictEqual(mockInput.value, '1234');
  });

  it('ne modifie pas une valeur déjà entièrement numérique lors de l événement input', () => {
    enforceIntegerInputs();
    mockInput.value = '42';
    const evt = new Event('input');
    mockInput.dispatchEvent(evt);
    assert.strictEqual(mockInput.value, '42');
  });

  it('gère l absence totale d éléments input.integer sans erreur (cas de /audio)', () => {
    global.__querySelectorAllOverride = () => [];
    assert.doesNotThrow(() => {
      enforceIntegerInputs();
    });
  });

  it('bloque "E" et "e" pour plusieurs inputs simultanément', () => {
    const input1 = new MockInputElement();
    const input2 = new MockInputElement();
    global.__querySelectorAllOverride = (sel) => sel === 'input.integer' ? [input1, input2] : [];

    enforceIntegerInputs();

    const evt1 = new MockKeyboardEvent('keydown', { key: 'E' });
    const evt2 = new MockKeyboardEvent('keydown', { key: 'e' });
    input1.dispatchEvent(evt1);
    input2.dispatchEvent(evt2);

    assert.strictEqual(evt1.defaultPrevented, true);
    assert.strictEqual(evt2.defaultPrevented, true);
  });
});
