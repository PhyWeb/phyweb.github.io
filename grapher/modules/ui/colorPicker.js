const EXTRA_CUSTOMIZATION_COLORS = ['#000000'];

/**
 * Normalise une couleur CSS (#rgb, #rrggbb, rgb/rgba) en format hexadécimal #rrggbb
 * compatible avec <input type="color">.
 * @param {string} color
 * @returns {string}
 */
export function normalizeHexColor(color) {
  if (typeof color !== 'string') return '#000000';
  const trimmed = color.trim();
  const fullHex = trimmed.match(/^#([0-9a-f]{6})$/i);
  if (fullHex) return `#${fullHex[1].toLowerCase()}`;

  const shortHex = trimmed.match(/^#([0-9a-f]{3})$/i);
  if (shortHex) {
    const [r, g, b] = shortHex[1].toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgbMatch) {
    const toHex = (n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0');
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }

  return '#000000';
}

/**
 * Retourne une couleur de texte contrastée ('#1f2937' sur fond clair, '#ffffff' sur fond foncé)
 * d'après la luminance relative WCAG de la couleur d'arrière-plan.
 * @param {string} color
 * @returns {string}
 */
export function getContrastingTextColor(color) {
  const hex = normalizeHexColor(color);
  const toLinear = (channelHex) => {
    const c = parseInt(channelHex, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(hex.slice(1, 3));
  const g = toLinear(hex.slice(3, 5));
  const b = toLinear(hex.slice(5, 7));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#1f2937' : '#ffffff';
}

/**
 * S'assure que le <select> natif contient une <option> correspondant à la couleur
 * donnée (y compris pour une couleur personnalisée choisie via le color picker).
 * @param {HTMLSelectElement} selectElement
 * @param {string} color
 */
function ensureSelectColorOption(selectElement, color) {
  if (!selectElement || !color) return;
  const options = Array.from(selectElement.options || selectElement.children || []);
  const existing = options.find(opt => opt.value === color);
  if (existing) return;

  let customOption = options.find(opt => opt.dataset?.customColor === 'true');
  if (!customOption) {
    customOption = document.createElement('option');
    customOption.dataset.customColor = 'true';
    customOption.textContent = "■■■■■■■■■";
    selectElement.appendChild(customOption);
  }
  customOption.value = color;
  customOption.style.color = color;
}

/**
 * Retourne la palette de couleurs proposée dans les sélecteurs de personnalisation.
 * @returns {string[]}
 */
export function getCustomizationColors() {
  const baseColors = Highcharts.getOptions()?.colors || [];
  const existing = new Set(baseColors.map(color => String(color).toLowerCase()));
  const extras = EXTRA_CUSTOMIZATION_COLORS.filter(color => !existing.has(color.toLowerCase()));
  return [...baseColors, ...extras];
}

/**
 * Remplit un élément <select> avec la palette de couleurs et génère
 * un sélecteur visuel Bulma affichant un bloc de couleur uni et un sélecteur
 * de couleur libre (<input type="color">).
 * @param {HTMLSelectElement} selectElement
 */
export function populateColorSelect(selectElement) {
  if (!selectElement) return;
  const colors = getCustomizationColors();

  // Maintien du <select> natif caché pour compatibilité totale avec le reste du code
  selectElement.innerHTML = "";
  colors.forEach((color) => {
    const option = document.createElement('option');
    option.value = color;
    option.style.color = color;
    option.textContent = "■■■■■■■■■";
    selectElement.appendChild(option);
  });

  // Création ou récupération du wrapper dropdown personnalisé
  if (!selectElement || typeof selectElement.closest !== 'function') return;
  const selectWrapper = selectElement.closest('.select');
  if (!selectWrapper) return;

  selectWrapper.style.display = 'none';

  let customDropdown = selectWrapper.parentElement.querySelector(`.custom-color-dropdown[data-target="${selectElement.id}"]`);
  if (!customDropdown) {
    customDropdown = document.createElement('div');
    customDropdown.className = 'dropdown is-fullwidth custom-color-dropdown';
    customDropdown.dataset.target = selectElement.id;
    customDropdown.style.width = '100%';
    customDropdown.style.minWidth = '115px';

    customDropdown.innerHTML = `
      <div class="dropdown-trigger" style="width: 100%;">
        <button type="button" class="button is-fullwidth is-justify-content-space-between px-3" aria-haspopup="true">
          <span class="color-swatch-preview" style="display: block; flex-grow: 1; height: 18px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.15);"></span>
          <span class="icon is-small ml-2">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" role="menu" style="width: 100%; min-width: 180px;">
        <div class="dropdown-content p-2">
          <div class="color-swatches-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;"></div>
          <div class="custom-color-picker-row">
            <label class="custom-color-picker-label">
              <span>Autre couleur…</span>
              <input type="color" class="color-picker-native" title="Choisir une couleur personnalisée" aria-label="Choisir une couleur personnalisée">
            </label>
          </div>
        </div>
      </div>
    `;

    selectWrapper.parentElement.insertBefore(customDropdown, selectWrapper.nextSibling);

    const triggerBtn = customDropdown.querySelector('.dropdown-trigger button');
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Ferme les autres sélecteurs de couleur éventuellement ouverts
      document.querySelectorAll('.custom-color-dropdown.is-active').forEach(el => {
        if (el !== customDropdown) el.classList.remove('is-active');
      });
      customDropdown.classList.toggle('is-active');
    });

    const dropdownMenu = customDropdown.querySelector('.dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    const nativeColorInput = customDropdown.querySelector('.color-picker-native');
    if (nativeColorInput) {
      nativeColorInput.addEventListener('input', (e) => {
        e.stopPropagation();
        const pickedColor = nativeColorInput.value;
        selectElement.value = pickedColor;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      });

      nativeColorInput.addEventListener('change', (e) => {
        e.stopPropagation();
        const pickedColor = nativeColorInput.value;
        if (selectElement.value !== pickedColor) {
          selectElement.value = pickedColor;
          selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
        customDropdown.classList.remove('is-active');
      });
    }

    document.addEventListener('click', () => {
      customDropdown.classList.remove('is-active');
    });
  }

  const updatePreview = (color) => {
    const previewSpan = customDropdown.querySelector('.color-swatch-preview');
    const nativeColorInput = customDropdown.querySelector('.color-picker-native');
    if (previewSpan && color) {
      previewSpan.style.backgroundColor = color;
    }
    const normalized = color ? normalizeHexColor(color) : null;
    if (nativeColorInput && normalized) {
      nativeColorInput.value = normalized;
    }
    if (typeof customDropdown.querySelectorAll === 'function') {
      customDropdown.querySelectorAll('.color-option-btn').forEach(btn => {
        const isSelected = Boolean(normalized && btn.dataset?.color?.toLowerCase() === normalized);
        btn.classList.toggle('is-selected', isSelected);
      });
    }
  };

  // Peuplement des blocs de couleur prédéfinis dans le menu
  const swatchesGrid = customDropdown.querySelector('.color-swatches-grid') || customDropdown.querySelector('.dropdown-content');
  swatchesGrid.innerHTML = '';

  colors.forEach((color) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'button is-small p-1 color-option-btn';
    item.dataset.color = color;
    item.style.height = '28px';
    item.style.border = '1px solid #dbdbdb';
    item.innerHTML = `<span style="display: block; width: 100%; height: 100%; border-radius: 3px; background-color: ${color};"></span>`;

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement.value = color;
      updatePreview(color);
      customDropdown.classList.remove('is-active');
      // Déclenche l'événement 'change' natif pour mettre à jour la courbe ou le modèle
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    swatchesGrid.appendChild(item);
  });

  // Synchronisation si selectElement.value est modifié par script (à l'ouverture d'une modale)
  if (!selectElement._colorObserverAttached) {
    const descriptor = typeof HTMLSelectElement !== 'undefined'
      ? Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')
      : null;
    if (descriptor && typeof descriptor.get === 'function' && typeof descriptor.set === 'function') {
      Object.defineProperty(selectElement, 'value', {
        get() {
          return descriptor.get.call(this);
        },
        set(val) {
          ensureSelectColorOption(this, val);
          descriptor.set.call(this, val);
          updatePreview(val);
        }
      });
    } else {
      let internalValue = selectElement.value || '';
      Object.defineProperty(selectElement, 'value', {
        get() {
          return internalValue;
        },
        set(val) {
          ensureSelectColorOption(this, val);
          internalValue = val;
          updatePreview(val);
        }
      });
    }
    selectElement._colorObserverAttached = true;
  }

  updatePreview(selectElement.value || colors[0]);
}
