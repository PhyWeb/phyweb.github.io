import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

describe('UIManager - initTools dropdown behavior', () => {
  let ui;
  let mockGrapher;
  let activeModes;
  let toolsDropdownClasses;
  let triggerListeners;
  let itemListeners;
  let docListeners;
  let toolsDropdown;
  let toolsTrigger;
  let toolDataBtn;
  let checkmarkContainer;

  beforeEach(() => {
    activeModes = [];
    toolsDropdownClasses = new Set();
    triggerListeners = [];
    itemListeners = [];
    docListeners = [];

    mockGrapher = {
      setCrosshairMode: (mode) => {
        activeModes.push(mode);
      },
      chart: null
    };

    checkmarkContainer = {
      innerHTML: ''
    };

    toolDataBtn = {
      id: 'tool-crosshair-data',
      textContent: 'Réticule Donnée',
      querySelector: (sel) => {
        if (sel === '.tool-checkmark-container') return checkmarkContainer;
        return null;
      },
      addEventListener: (type, fn) => {
        if (type === 'click') itemListeners.push(fn);
      }
    };

    toolsTrigger = {
      addEventListener: (type, fn) => {
        if (type === 'click') triggerListeners.push(fn);
      }
    };

    toolsDropdown = {
      classList: {
        add: (cls) => toolsDropdownClasses.add(cls),
        remove: (cls) => toolsDropdownClasses.delete(cls),
        toggle: (cls) => {
          if (toolsDropdownClasses.has(cls)) {
            toolsDropdownClasses.delete(cls);
            return false;
          } else {
            toolsDropdownClasses.add(cls);
            return true;
          }
        },
        contains: (cls) => toolsDropdownClasses.has(cls)
      },
      querySelector: (sel) => {
        if (sel === '.dropdown-trigger') return toolsTrigger;
        return null;
      },
      addEventListener: (type, fn) => {
        // If someone incorrectly added a click listener to toolsDropdown:
      }
    };

    const toolsButtonText = { textContent: 'Outils' };
    const zoomButton = {
      classList: {
        remove: () => {},
        add: () => {}
      }
    };

    global.__querySelectorOverride = (sel) => {
      if (sel === '#tools-dropdown') return toolsDropdown;
      if (sel === '#tools-button-text') return toolsButtonText;
      if (sel === '#zoom-button') return zoomButton;
      return {
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        querySelector: () => null,
        querySelectorAll: () => []
      };
    };

    global.__querySelectorAllOverride = (sel) => {
      if (sel === '.tool-item') return [toolDataBtn];
      return [];
    };

    // Override document.addEventListener to capture listeners
    const origAddEventListener = global.document.addEventListener;
    global.document.addEventListener = (type, fn) => {
      if (type === 'click') docListeners.push(fn);
      if (origAddEventListener) origAddEventListener(type, fn);
    };

    ui = Object.create(UIManager.prototype);
    ui.grapher = mockGrapher;
    ui.activeToolElement = null;
    ui.isZoomEnabled = false;
  });

  it('doit ouvrir le dropdown au clic sur le déclencheur et le fermer au clic sur un outil', () => {
    ui.initTools();

    assert.equal(triggerListeners.length, 1, 'Le listener doit être attaché au dropdown-trigger');
    assert.equal(itemListeners.length, 1, 'Le listener doit être attaché aux tool items');

    // 1. Clic sur le déclencheur pour ouvrir le menu
    const mockTriggerEvent = { stopPropagation: () => {} };
    triggerListeners[0](mockTriggerEvent);
    assert.equal(toolsDropdownClasses.has('is-active'), true, 'Le dropdown doit être ouvert');

    // 2. Clic sur l\'outil "Réticule Donnée"
    itemListeners[0]();

    // 3. Vérifications
    assert.equal(toolsDropdownClasses.has('is-active'), false, 'Le dropdown doit être fermé après sélection');
    assert.equal(mockGrapher.activeToolElement, undefined);
    assert.deepEqual(activeModes, ['data'], 'Le mode data doit avoir été activé');
    assert.equal(checkmarkContainer.innerHTML, '<i class="fa-solid fa-check"></i>');
  });

  it('doit fermer le dropdown lors d\'un clic à l\'extérieur', () => {
    ui.initTools();

    // Ouvre le dropdown
    toolsDropdownClasses.add('is-active');
    assert.equal(toolsDropdownClasses.has('is-active'), true);

    // Clic sur le document
    for (const listener of docListeners) {
      listener();
    }
    assert.equal(toolsDropdownClasses.has('is-active'), false, 'Le dropdown doit être fermé au clic document');
  });
});

