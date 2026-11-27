import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHexColor, getContrastingTextColor, populateColorSelect } from '../../grapher/modules/ui.js';

function createDomMock(tag = 'div') {
  const listeners = {};
  const classes = new Set();
  const children = [];

  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    value: '',
    textContent: '',
    type: '',
    style: {},
    dataset: {},
    children,
    parentElement: null,
    parentNode: null,
    nextSibling: null,
    _innerHTML: '',
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(html) {
      this._innerHTML = html;
      this.children.length = 0;
    },
    get className() {
      return Array.from(classes).join(' ');
    },
    set className(val) {
      classes.clear();
      String(val || '').split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    },
    classList: {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        } else if (force) {
          classes.add(c);
        } else {
          classes.delete(c);
        }
      },
      contains: (c) => classes.has(c)
    },
    appendChild(child) {
      child.parentElement = el;
      child.parentNode = el;
      children.push(child);
      return child;
    },
    insertBefore(newNode, refNode) {
      newNode.parentElement = el;
      newNode.parentNode = el;
      const idx = refNode ? children.indexOf(refNode) : -1;
      if (idx === -1) children.push(newNode);
      else children.splice(idx, 0, newNode);
      return newNode;
    },
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatchEvent(event) {
      const evt = event || { type: 'click', target: el };
      if (!evt.target && !(evt instanceof Event)) evt.target = el;
      if (!evt.stopPropagation) {
        evt._stopped = false;
        evt.stopPropagation = () => { evt._stopped = true; };
      }
      if (listeners[evt.type]) {
        listeners[evt.type].forEach(fn => fn(evt));
      }
    },
    closest(sel) {
      let cur = el;
      while (cur) {
        if (sel === '.select' && cur.classList.contains('select')) return cur;
        cur = cur.parentElement;
      }
      return null;
    },
    querySelector(sel) {
      return el.querySelectorAll(sel)[0] || null;
    },
    querySelectorAll(sel) {
      const out = [];
      const matches = (node) => {
        if (sel.startsWith('.custom-color-dropdown[data-target="')) {
          const target = sel.slice('.custom-color-dropdown[data-target="'.length, -2);
          return node.classList.contains('custom-color-dropdown') && node.dataset.target === target;
        }
        if (sel === '.dropdown-trigger button') return node.tagName === 'BUTTON' && node.dataset.role === 'trigger';
        if (sel === '.color-swatch-preview') return node.classList.contains('color-swatch-preview');
        if (sel === '.dropdown-menu') return node.classList.contains('dropdown-menu');
        if (sel === '.dropdown-content') return node.classList.contains('dropdown-content');
        if (sel === '.color-swatches-grid') return node.classList.contains('color-swatches-grid');
        if (sel === '.color-picker-native') return node.classList.contains('color-picker-native');
        if (sel === '.color-option-btn') return node.classList.contains('color-option-btn');
        return false;
      };
      const walk = (node) => {
        for (const child of node.children || []) {
          if (matches(child)) out.push(child);
          walk(child);
        }
      };
      walk(el);
      return out;
    }
  };

  return el;
}

function attachDropdownStructure(dropdown) {
  const triggerBtn = createDomMock('button');
  triggerBtn.dataset.role = 'trigger';
  const previewSpan = createDomMock('span');
  previewSpan.className = 'color-swatch-preview';
  triggerBtn.appendChild(previewSpan);

  const dropdownMenu = createDomMock('div');
  dropdownMenu.className = 'dropdown-menu';
  const dropdownContent = createDomMock('div');
  dropdownContent.className = 'dropdown-content';
  const swatchesGrid = createDomMock('div');
  swatchesGrid.className = 'color-swatches-grid';
  const nativeInput = createDomMock('input');
  nativeInput.type = 'color';
  nativeInput.className = 'color-picker-native';

  dropdownContent.appendChild(swatchesGrid);
  dropdownContent.appendChild(nativeInput);
  dropdownMenu.appendChild(dropdownContent);
  dropdown.appendChild(triggerBtn);
  dropdown.appendChild(dropdownMenu);
}

describe('Color picker libre dans le sélecteur de couleurs de /grapher', () => {
  let origGetOptions;

  beforeEach(() => {
    origGetOptions = global.Highcharts.getOptions;
    global.Highcharts.getOptions = () => ({ colors: ['#2caffe', '#544fc5'] });
    global.__createElementOverride = (tag) => {
      const node = createDomMock(tag);
      const origDesc = Object.getOwnPropertyDescriptor(node, 'innerHTML');
      Object.defineProperty(node, 'innerHTML', {
        get() { return origDesc.get.call(this); },
        set(html) {
          origDesc.set.call(this, html);
          if (typeof html === 'string' && html.includes('color-picker-native')) {
            attachDropdownStructure(this);
          }
        }
      });
      return node;
    };
  });

  afterEach(() => {
    global.Highcharts.getOptions = origGetOptions;
    delete global.__createElementOverride;
  });

  it('normalizeHexColor convertit #rgb, #RRGGBB et rgb() en #rrggbb', () => {
    assert.equal(normalizeHexColor('#2CAFFE'), '#2caffe');
    assert.equal(normalizeHexColor('#f0a'), '#ff00aa');
    assert.equal(normalizeHexColor('rgb(18, 52, 86)'), '#123456');
    assert.equal(normalizeHexColor('invalid'), '#000000');
  });

  it('getContrastingTextColor retourne du texte foncé sur fond clair et blanc sur fond foncé', () => {
    assert.equal(getContrastingTextColor('#ffffff'), '#1f2937');
    assert.equal(getContrastingTextColor('#ffff00'), '#1f2937');
    assert.equal(getContrastingTextColor('#ffe08a'), '#1f2937');
    assert.equal(getContrastingTextColor('#000000'), '#ffffff');
    assert.equal(getContrastingTextColor('#544fc5'), '#ffffff');
    assert.equal(getContrastingTextColor('#2caffe'), '#ffffff');
  });

  it('permet de choisir une couleur libre via <input type="color"> et synchronise le select et l’aperçu', () => {
    const control = createDomMock('div');
    const selectWrapper = createDomMock('div');
    selectWrapper.className = 'select';
    const select = createDomMock('select');
    select.id = 'curveColorPicker';

    selectWrapper.appendChild(select);
    control.appendChild(selectWrapper);

    let changeEvents = 0;
    select.addEventListener('change', () => { changeEvents += 1; });

    populateColorSelect(select);

    const dropdown = control.querySelector('.custom-color-dropdown[data-target="curveColorPicker"]');
    assert.ok(dropdown, 'Le dropdown personnalisé doit être créé');

    const nativeInput = dropdown.querySelector('.color-picker-native');
    const previewSpan = dropdown.querySelector('.color-swatch-preview');
    assert.ok(nativeInput, 'Le color picker natif doit être présent dans le dropdown');

    // Ouverture du dropdown puis sélection d'une couleur libre hors palette
    dropdown.classList.add('is-active');
    nativeInput.value = '#e6194b';
    const inputEvt = { type: 'input', target: nativeInput, _stopped: false, stopPropagation() { this._stopped = true; } };
    nativeInput.dispatchEvent(inputEvt);

    assert.equal(inputEvt._stopped, true, 'L’événement input du color picker ne doit pas se propager');
    assert.equal(select.value, '#e6194b');
    assert.equal(previewSpan.style.backgroundColor, '#e6194b');
    assert.equal(changeEvents, 1);

    const customOpt = select.children.find(opt => opt.value === '#e6194b');
    assert.ok(customOpt, 'Une option personnalisée doit être ajoutée dans le <select>');
    assert.equal(customOpt.dataset.customColor, 'true');

    // Validation finale sur change : ferme le dropdown sans dupliquer l'événement
    const changeEvt = { type: 'change', target: nativeInput, _stopped: false, stopPropagation() { this._stopped = true; } };
    nativeInput.dispatchEvent(changeEvt);
    assert.equal(changeEvt._stopped, true);
    assert.equal(changeEvents, 1);
    assert.equal(dropdown.classList.contains('is-active'), false);
  });

  it('conserve et affiche correctement une couleur personnalisée assignée par script', () => {
    const control = createDomMock('div');
    const selectWrapper = createDomMock('div');
    selectWrapper.className = 'select';
    const select = createDomMock('select');
    select.id = 'model-edit-color-picker';

    selectWrapper.appendChild(select);
    control.appendChild(selectWrapper);

    populateColorSelect(select);
    select.value = '#12ab34';

    const dropdown = control.querySelector('.custom-color-dropdown[data-target="model-edit-color-picker"]');
    const nativeInput = dropdown.querySelector('.color-picker-native');
    const previewSpan = dropdown.querySelector('.color-swatch-preview');

    assert.equal(select.value, '#12ab34');
    assert.equal(previewSpan.style.backgroundColor, '#12ab34');
    assert.equal(nativeInput.value, '#12ab34');
    assert.ok(select.children.some(opt => opt.value === '#12ab34'));
  });
});
