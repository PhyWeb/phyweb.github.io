import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobalShortcuts } from '../../common/common.js';

class MockKeyboardEvent extends Event {
  constructor(type, options = {}) {
    super(type, { cancelable: true });
    this.key = options.key || '';
    this.ctrlKey = Boolean(options.ctrlKey);
    this.altKey = Boolean(options.altKey);
    this.metaKey = Boolean(options.metaKey);
    this._modifiers = options.modifiers || {};
  }

  getModifierState(keyArg) {
    return Boolean(this._modifiers[keyArg]);
  }
}

describe('setupGlobalShortcuts - Gestion des raccourcis et immunité AltGr', () => {
  it('déclenche les raccourcis Ctrl classiques (Ctrl+S, Ctrl+O, Ctrl+N)', () => {
    let saved = false;
    let opened = false;
    let created = false;

    setupGlobalShortcuts({
      onSave: () => { saved = true; },
      onOpen: () => { opened = true; },
      onNew: () => { created = true; }
    });

    const evtSave = new MockKeyboardEvent('keydown', { key: 's', ctrlKey: true });
    global.document.dispatchEvent(evtSave);
    assert.strictEqual(saved, true);
    assert.strictEqual(evtSave.defaultPrevented, true);

    const evtOpen = new MockKeyboardEvent('keydown', { key: 'o', ctrlKey: true });
    global.document.dispatchEvent(evtOpen);
    assert.strictEqual(opened, true);
    assert.strictEqual(evtOpen.defaultPrevented, true);

    const evtNew = new MockKeyboardEvent('keydown', { key: 'n', ctrlKey: true });
    global.document.dispatchEvent(evtNew);
    assert.strictEqual(created, true);
    assert.strictEqual(evtNew.defaultPrevented, true);
  });

  it('déclenche les raccourcis Alt classiques (Alt+1, Alt+2, Alt+3)', () => {
    let tab1 = false;
    let tab2 = false;
    let tab3 = false;

    setupGlobalShortcuts({
      onTab1: () => { tab1 = true; },
      onTab2: () => { tab2 = true; },
      onTab3: () => { tab3 = true; }
    });

    const evt1 = new MockKeyboardEvent('keydown', { key: '1', altKey: true });
    global.document.dispatchEvent(evt1);
    assert.strictEqual(tab1, true);
    assert.strictEqual(evt1.defaultPrevented, true);

    const evt2 = new MockKeyboardEvent('keydown', { key: '2', altKey: true });
    global.document.dispatchEvent(evt2);
    assert.strictEqual(tab2, true);
    assert.strictEqual(evt2.defaultPrevented, true);

    const evt3 = new MockKeyboardEvent('keydown', { key: '3', altKey: true });
    global.document.dispatchEvent(evt3);
    assert.strictEqual(tab3, true);
    assert.strictEqual(evt3.defaultPrevented, true);
  });

  it('déclenche les raccourcis Ctrl+Alt légitimes (sans AltGr)', () => {
    let debugCalled = false;
    let newCalled = false;

    setupGlobalShortcuts({
      onDebug: () => { debugCalled = true; },
      onNew: () => { newCalled = true; }
    });

    const evtDebug = new MockKeyboardEvent('keydown', {
      key: 'd',
      ctrlKey: true,
      altKey: true,
      modifiers: { AltGraph: false }
    });
    global.document.dispatchEvent(evtDebug);
    assert.strictEqual(debugCalled, true);
    assert.strictEqual(evtDebug.defaultPrevented, true);

    const evtNew = new MockKeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      altKey: true,
      modifiers: { AltGraph: false }
    });
    global.document.dispatchEvent(evtNew);
    assert.strictEqual(newCalled, true);
    assert.strictEqual(evtNew.defaultPrevented, true);
  });

  it('ne déclenche PAS les raccourcis lors de l appui sur la touche AltGr (Windows)', () => {
    let debugCalled = false;
    let newCalled = false;
    let saveCalled = false;

    setupGlobalShortcuts({
      onDebug: () => { debugCalled = true; },
      onNew: () => { newCalled = true; },
      onSave: () => { saveCalled = true; }
    });

    // Sous Windows, AltGr émet ctrlKey: true et altKey: true ainsi que getModifierState('AltGraph') === true
    const evtAltGrN = new MockKeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      altKey: true,
      modifiers: { AltGraph: true }
    });
    global.document.dispatchEvent(evtAltGrN);
    assert.strictEqual(newCalled, false, 'AltGr+N ne doit pas déclencher onNew');
    assert.strictEqual(evtAltGrN.defaultPrevented, false);

    const evtAltGrD = new MockKeyboardEvent('keydown', {
      key: 'd',
      ctrlKey: true,
      altKey: true,
      modifiers: { AltGraph: true }
    });
    global.document.dispatchEvent(evtAltGrD);
    assert.strictEqual(debugCalled, false, 'AltGr+D ne doit pas déclencher onDebug');
    assert.strictEqual(evtAltGrD.defaultPrevented, false);

    const evtAltGrS = new MockKeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      altKey: true,
      modifiers: { AltGraph: true }
    });
    global.document.dispatchEvent(evtAltGrS);
    assert.strictEqual(saveCalled, false, 'AltGr+S ne doit pas déclencher onSave');
    assert.strictEqual(evtAltGrS.defaultPrevented, false);
  });
});

