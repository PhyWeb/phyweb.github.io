/**
 * Calcule la dérivée numérique de y par rapport à x. Gère les valeurs null et les grilles à pas variable.
 * @param {Array<number|null>} y Le tableau des valeurs de la fonction.
 * @param {Array<number|null>} x Le tableau des points de la variable (ex: le temps).
 * @param {number} [points=5] Le nombre de points à utiliser pour le stencil (3, 5, ou 7).
 * @param {boolean} [calculateEdges=true] Si false, les points sur les bords qui ne peuvent pas utiliser le stencil complet retourneront null.
 * @returns {Array<number|null>} La dérivée numérique.
 */
export function numericalDerivative(y, x, points = 5, calculateEdges = true) {
  const toArr = (v) => (v && v.toArray ? v.toArray() : v);
  const yArr = toArr(y);
  const xArr = toArr(x);

  const nMin = Math.min(yArr.length, xArr.length);
  const nMax = Math.max(yArr.length, xArr.length);

  if (nMin < points) {
    throw new Error(`Pas assez de points pour une dérivation à ${points} points. Il en faut au moins ${points}.`);
  }

  const n = nMin;
  let direction = 0; // 1 pour croissant, -1 pour décroissant
  let prevX = null;
  for (let i = 0; i < n; i++) {
    const currentX = xArr[i];
    if (currentX === null || currentX === undefined || !isFinite(currentX)) continue;
    if (prevX !== null) {
      const diffX = currentX - prevX;
      if (diffX === 0) {
        throw new Error("la grandeur de dérivation contient deux valeurs identiques consécutives.");
      }
      const stepDir = Math.sign(diffX);
      if (direction === 0) {
        direction = stepDir;
      } else if (stepDir !== direction) {
        throw new Error("la grandeur de dérivation n'est pas triée. Veuillez trier vos données dans le tableur.");
      }
    }
    prevX = currentX;
  }

  const result = new Array(nMax).fill(null);

  // Vérification de la régularité du pas d'échantillonnage
  const isUniformSpacing = (coords, startIdx, count) => {
    if (startIdx < 0 || startIdx + count > coords.length) return false;
    for (let k = 0; k < count; k++) {
      if (coords[startIdx + k] === null || coords[startIdx + k] === undefined || !Number.isFinite(coords[startIdx + k])) {
        return false;
      }
    }
    const firstStep = coords[startIdx + 1] - coords[startIdx];
    if (firstStep === 0) return false;
    const tol = 1e-3 * Math.abs(firstStep);
    for (let k = 1; k < count - 1; k++) {
      const step = coords[startIdx + k + 1] - coords[startIdx + k];
      if (Math.sign(step) !== Math.sign(firstStep) || Math.abs(step - firstStep) > tol) {
        return false;
      }
    }
    return true;
  };

  const isValidPoint = (idx) =>
    idx >= 0 && idx < n &&
    yArr[idx] !== null && yArr[idx] !== undefined && Number.isFinite(yArr[idx]) &&
    xArr[idx] !== null && xArr[idx] !== undefined && Number.isFinite(xArr[idx]);

  const hasValidWindow = (startIdx, count) => {
    if (startIdx < 0 || startIdx + count > n) return false;
    for (let k = 0; k < count; k++) {
      if (!isValidPoint(startIdx + k)) return false;
    }
    return true;
  };

  // Repère les bornes [segStart[i], segEnd[i]] de chaque segment contigu de points valides
  const segStart = new Array(n).fill(-1);
  const segEnd = new Array(n).fill(-1);
  let currentStart = -1;
  for (let i = 0; i < n; i++) {
    if (isValidPoint(i)) {
      if (currentStart === -1) currentStart = i;
      segStart[i] = currentStart;
    } else if (currentStart !== -1) {
      for (let k = currentStart; k < i; k++) segEnd[k] = i - 1;
      currentStart = -1;
    }
  }
  if (currentStart !== -1) {
    for (let k = currentStart; k < n; k++) segEnd[k] = n - 1;
  }

  const isEdgePoint = (i) => {
    const start = segStart[i];
    const end = segEnd[i];
    if (start === -1 || end === -1) return true;
    if (i === start || i === end) return true;

    const segLen = end - start + 1;
    const distStart = i - start;
    const distEnd = end - i;

    if (points >= 7) {
      const startWin = Math.min(7, segLen);
      const endWin = Math.min(7, segLen);
      if ((distStart === 1 || distStart === 2) && isUniformSpacing(xArr, start, startWin)) return true;
      if ((distEnd === 1 || distEnd === 2) && isUniformSpacing(xArr, end - endWin + 1, endWin)) return true;
    }
    if (points >= 5) {
      const startWin = Math.min(5, segLen);
      const endWin = Math.min(5, segLen);
      if (distStart === 1 && isUniformSpacing(xArr, start, startWin)) return true;
      if (distEnd === 1 && isUniformSpacing(xArr, end - endWin + 1, endWin)) return true;
    }
    return false;
  };

  let warnedNonUniform = false;

  for (let i = 0; i < n; i++) {
    if (!isValidPoint(i)) {
      continue;
    }

    const isEdge = isEdgePoint(i);

    if (isEdge && !calculateEdges) {
      continue;
    }

    let computed = false;

    // Stencil uniforme à 7 points (ordre 6)
    if (points >= 7 && i >= 3 && i < n - 3) {
      const hasAllValues = hasValidWindow(i - 3, 7);
      if (hasAllValues && isUniformSpacing(xArr, i - 3, 7)) {
        const h = (xArr[i + 3] - xArr[i - 3]) / 6;
        if (h !== 0) {
          result[i] = (-yArr[i - 3] + 9 * yArr[i - 2] - 45 * yArr[i - 1] + 45 * yArr[i + 1] - 9 * yArr[i + 2] + yArr[i + 3]) / (60 * h);
          computed = true;
        }
      } else if (hasAllValues && !warnedNonUniform && points >= 7) {
        console.warn("Dérivation : pas variable détecté pour le stencil à 7 points. Utilisation du schéma adapté au pas variable.");
        warnedNonUniform = true;
      }
    }

    // Stencil uniforme à 5 points (ordre 4)
    if (!computed && points >= 5 && i >= 2 && i < n - 2) {
      const hasAllValues = hasValidWindow(i - 2, 5);
      if (hasAllValues && isUniformSpacing(xArr, i - 2, 5)) {
        const h = (xArr[i + 2] - xArr[i - 2]) / 4;
        if (h !== 0) {
          result[i] = (yArr[i - 2] - 8 * yArr[i - 1] + 8 * yArr[i + 1] - yArr[i + 2]) / (12 * h);
          computed = true;
        }
      } else if (hasAllValues && !warnedNonUniform && points >= 5) {
        console.warn("Dérivation : pas variable détecté pour le stencil à 5 points. Utilisation du schéma adapté au pas variable.");
        warnedNonUniform = true;
      }
    }

    // Schéma non-uniforme à 3 points (Lagrange / différences finies d'ordre 2 pour pas variable)
    if (!computed && i >= 1 && i < n - 1) {
      if (isValidPoint(i - 1) && isValidPoint(i + 1)) {
        const h1 = xArr[i] - xArr[i - 1];
        const h2 = xArr[i + 1] - xArr[i];
        if (h1 !== 0 && h2 !== 0 && (h1 + h2) !== 0) {
          result[i] = (Math.pow(h1, 2) * (yArr[i + 1] - yArr[i]) + Math.pow(h2, 2) * (yArr[i] - yArr[i - 1])) / (h1 * h2 * (h1 + h2));
          computed = true;
        }
      }
    }

    // Repli sur différences finies à 2 points aux extrémités ou près des points manquants
    if (!computed && calculateEdges) {
      if (i + 1 < n && isValidPoint(i + 1)) {
        const dx = xArr[i + 1] - xArr[i];
        if (dx !== 0) {
          result[i] = (yArr[i + 1] - yArr[i]) / dx;
          computed = true;
        }
      } else if (i - 1 >= 0 && isValidPoint(i - 1)) {
        const dx = xArr[i] - xArr[i - 1];
        if (dx !== 0) {
          result[i] = (yArr[i] - yArr[i - 1]) / dx;
          computed = true;
        }
      }
    }
  }
  return result;
}

/**
 * Calcule la primitive numérique de y par rapport à x via la méthode des trapèzes cumulés.
 * @param {Array<number|null>} y Le tableau des valeurs de la fonction à intégrer.
 * @param {Array<number|null>} x Le tableau des points de la variable d'intégration.
 * @param {number} [initialValue=0] La valeur initiale de la primitive au premier point.
 * @returns {Array<number|null>} La primitive numérique cumulée.
 */
export function numericalIntegration(y, x, initialValue = 0) {
  const toArr = (v) => (v && v.toArray ? v.toArray() : v);
  const yArr = toArr(y);
  const xArr = toArr(x);

  const nMin = Math.min(yArr.length, xArr.length);
  const nMax = Math.max(yArr.length, xArr.length);

  if (nMin < 2) {
    throw new Error("Pas assez de points pour calculer une primitive. Il en faut au moins 2.");
  }

  let direction = 0; // 1 pour croissant, -1 pour décroissant
  let prevX = null;
  for (let i = 0; i < nMin; i++) {
    const currentX = xArr[i];
    if (currentX === null || currentX === undefined || !Number.isFinite(currentX)) continue;
    if (prevX !== null) {
      const diffX = currentX - prevX;
      if (diffX === 0) {
        throw new Error("la grandeur d'intégration contient deux valeurs identiques consécutives.");
      }
      const stepDir = Math.sign(diffX);
      if (direction === 0) {
        direction = stepDir;
      } else if (stepDir !== direction) {
        throw new Error("la grandeur d'intégration n'est pas triée. Veuillez trier vos données dans le tableur.");
      }
    }
    prevX = currentX;
  }

  const result = new Array(nMax).fill(null);
  let cumulativeSum = Number(initialValue) || 0;
  let prevValidIdx = -1;

  for (let i = 0; i < nMin; i++) {
    const xVal = xArr[i];
    const yVal = yArr[i];
    const isValid = xVal !== null && xVal !== undefined && Number.isFinite(xVal) &&
      yVal !== null && yVal !== undefined && Number.isFinite(yVal);

    if (!isValid) {
      continue;
    }

    if (prevValidIdx === -1) {
      result[i] = cumulativeSum;
      prevValidIdx = i;
    } else {
      const dx = xVal - xArr[prevValidIdx];
      cumulativeSum += 0.5 * (yArr[prevValidIdx] + yVal) * dx;
      result[i] = cumulativeSum;
      prevValidIdx = i;
    }
  }

  return result;
}

/**
 * Calcule la moyenne mobile centrée d'un tableau y.
 * @param {Array<number|null>} y Le tableau des valeurs à lisser.
 * @param {number} [windowSize=5] La taille de la fenêtre de lissage (entier >= 3).
 * @returns {Array<number|null>} Les valeurs lissées.
 */
export function movingAverageSmooth(y, windowSize = 5) {
  const toArr = (v) => (v && v.toArray ? v.toArray() : v);
  const yArr = toArr(y);

  const w = Math.round(Number(windowSize));
  if (!Number.isFinite(w) || w < 3) {
    throw new Error("La fenêtre de lissage doit être un entier supérieur ou égal à 3.");
  }

  const half = Math.floor((w - 1) / 2);

  if (!yArr || yArr.length < w) {
    throw new Error(`Pas assez de points pour un lissage sur ${w} points.`);
  }

  const result = new Array(yArr.length).fill(null);

  for (let i = 0; i < yArr.length; i++) {
    const valI = yArr[i];
    if (valI === null || valI === undefined || !Number.isFinite(valI)) {
      result[i] = null;
      continue;
    }

    const maxHalf = Math.min(half, i, yArr.length - 1 - i);
    let sum = 0;
    let count = 0;

    for (let j = i - maxHalf; j <= i + maxHalf; j++) {
      const val = yArr[j];
      if (val !== null && val !== undefined && Number.isFinite(val)) {
        sum += val;
        count++;
      }
    }

    result[i] = count > 0 ? sum / count : null;
  }

  return result;
}
