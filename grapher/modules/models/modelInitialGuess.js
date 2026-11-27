/**
 * Estime des paramètres initiaux basés sur les données pour aider l'algorithme d'ajustement.
 * @param {string} type - Le type de modèle (ex: 'linear', 'affine', 'sin', ...).
 * @param {Array<Array<number>>} data - Les données [x, y].
 * @returns {Array<number>|null} Les paramètres estimés ou null.
 */
export function estimateInitialGuess(type, data) {
  const n = data.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  let minX = data[0][0], maxX = data[0][0];
  let minY = data[0][1], maxY = data[0][1];

  for (let i = 0; i < n; i++) {
    const x = data[i][0];
    const y = data[i][1];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  // Régression linéaire (y = mx + p)
  const denominator = (n * sumXX - sumX * sumX);
  let slope = 1, intercept = 0;
  if (Math.abs(denominator) > 1e-9) {
    slope = (n * sumXY - sumX * sumY) / denominator;
    intercept = (sumY - slope * sumX) / n;
  }

  switch (type) {
    case 'linear': // y = ax
      return [sumXX !== 0 ? sumXY / sumXX : 1];

    case 'affine': // y = ax + b
      return [slope, intercept];

    case 'quadratic': // y = ax^2 + bx + c
      {
        const x1 = data[0][0], y1 = data[0][1];
        const x3 = data[n - 1][0], y3 = data[n - 1][1];
        const mid = Math.floor(n / 2);
        const x2 = data[mid][0], y2 = data[mid][1];

        const denom = (x1 - x2) * (x1 - x3) * (x2 - x3);
        if (Math.abs(denom) < 1e-9) return [0, slope, intercept];

        const a = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / denom;
        const b = (x3 * x3 * (y1 - y2) + x2 * x2 * (y3 - y1) + x1 * x1 * (y2 - y3)) / denom;
        const c = (x2 * x3 * (x2 - x3) * y1 + x3 * x1 * (x3 - x1) * y2 + x1 * x2 * (x1 - x2) * y3) / denom;
        return [a, b, c];
      }

    case 'power': // y = a*x^b
      {
        let sLnX = 0, sLnY = 0, sLnXLnY = 0, sLnXLnX = 0;
        let count = 0;
        for (let i = 0; i < n; i++) {
          if (data[i][0] > 0 && data[i][1] > 0) {
            const lx = Math.log(data[i][0]);
            const ly = Math.log(data[i][1]);
            sLnX += lx; sLnY += ly;
            sLnXLnY += lx * ly; sLnXLnX += lx * lx;
            count++;
          }
        }
        if (count < 2) return [1, 1];
        const denomPow = (count * sLnXLnX - sLnX * sLnX);
        if (Math.abs(denomPow) < 1e-9) return [1, 1];
        const b = (count * sLnXLnY - sLnX * sLnY) / denomPow;
        const lnA = (sLnY - b * sLnX) / count;
        return [Math.exp(lnA), b];
      }

    case 'exp1': // y = a*e^(-x/b)
      {
        const defaultTau = (maxX > minX) ? (maxX - minX) / 3 : 1;
        const isNegative = (minY < 0 && Math.abs(minY) > Math.abs(maxY));
        const sign = isNegative ? -1 : 1;
        const defaultA = isNegative ? (minY !== 0 ? minY : -1) : (maxY !== 0 ? maxY : 1);

        let sX = 0, sLnY = 0, sXLnY = 0, sXX_exp = 0;
        let count = 0;
        for (let i = 0; i < n; i++) {
          const val = sign * data[i][1];
          if (val > 0) {
            const x = data[i][0];
            const ly = Math.log(val);
            sX += x; sLnY += ly;
            sXLnY += x * ly; sXX_exp += x * x;
            count++;
          }
        }
        if (count < 2) return [defaultA, defaultTau];
        const denomExp = (count * sXX_exp - sX * sX);
        if (Math.abs(denomExp) < 1e-9) return [defaultA, defaultTau];
        const m = (count * sXLnY - sX * sLnY) / denomExp; // m = -1/b
        const b = Math.abs(m) > 1e-9 ? -1.0 / m : defaultTau;
        const interceptExp = (sLnY - m * sX) / count; // ln(|a|)

        // Évite un dépassement exponentiel si x0 >> tau
        let a;
        if (interceptExp > 700) {
          a = defaultA;
        } else if (interceptExp < -700) {
          a = 0;
        } else {
          a = sign * Math.exp(interceptExp);
        }

        if (!Number.isFinite(a)) a = defaultA;
        if (!Number.isFinite(b) || b === 0) b = defaultTau;

        return [a, b];
      }

    case 'exp2': // y = a*(1 - e^(-x/b))
      {
        const defaultTau = (maxX > minX) ? (maxX - minX) / 3 : 1;
        const isNegative = (minY < 0 && Math.abs(minY) > Math.abs(maxY));
        const a = isNegative
          ? (minY !== 0 ? minY * 1.05 : -1)
          : (maxY > 0 ? maxY * 1.05 : 1);

        let sX = 0, sLnDiff = 0, sXLnDiff = 0, sXX_exp2 = 0;
        let count = 0;
        for (let i = 0; i < n; i++) {
          const diff = isNegative ? (data[i][1] - a) : (a - data[i][1]);
          if (diff > 0) {
            const x = data[i][0];
            const ldiff = Math.log(diff);
            sX += x; sLnDiff += ldiff;
            sXLnDiff += x * ldiff; sXX_exp2 += x * x;
            count++;
          }
        }
        if (count < 2) return [a, defaultTau];
        const denomExp2 = (count * sXX_exp2 - sX * sX);
        if (Math.abs(denomExp2) < 1e-9) return [a, defaultTau];
        const m = (count * sXLnDiff - sX * sLnDiff) / denomExp2; // m = -1/b
        // Pour une relaxation physique, ln(diff) décroît avec x => m < 0 et b = -1/m > 0
        const b = (m < -1e-9) ? -1.0 / m : defaultTau;
        return [a, b];
      }

    case 'ln': // y = a*ln(x) + b
      {
        let sLnX = 0, sY_ln = 0, sLnXY = 0, sLnXLnX = 0;
        let count = 0;
        for (let i = 0; i < n; i++) {
          if (data[i][0] > 0) {
            const lx = Math.log(data[i][0]);
            const y = data[i][1];
            sLnX += lx; sY_ln += y;
            sLnXY += lx * y; sLnXLnX += lx * lx;
            count++;
          }
        }
        if (count < 2) return [1, 1];
        const denomLn = (count * sLnXLnX - sLnX * sLnX);
        if (Math.abs(denomLn) < 1e-9) return [1, 1];
        const a = (count * sLnXY - sLnX * sY_ln) / denomLn;
        const b = (sY_ln - a * sLnX) / count;
        return [a, b];
      }

    case 'log': // y = a*log10(x) + b
      {
        let sLogX = 0, sY_log = 0, sLogXY = 0, sLogXLogX = 0;
        let count = 0;
        for (let i = 0; i < n; i++) {
          if (data[i][0] > 0) {
            const lx = Math.log10(data[i][0]);
            const y = data[i][1];
            sLogX += lx; sY_log += y;
            sLogXY += lx * y; sLogXLogX += lx * lx;
            count++;
          }
        }
        if (count < 2) return [1, 1];
        const denomLog = (count * sLogXLogX - sLogX * sLogX);
        if (Math.abs(denomLog) < 1e-9) return [1, 1];
        const a = (count * sLogXY - sLogX * sY_log) / denomLog;
        const b = (sY_log - a * sLogX) / count;
        return [a, b];
      }

    case 'sin': // y = a*sin(bx+c) + d
    case 'cos': // y = a*cos(bx+c) + d
    case 'dampedsin': // y = a*sin(bx+c)*exp(-x/d) + e
    case 'dampedcos': // y = a*cos(bx+c)*exp(-x/d) + e
      {
        const a = (maxY - minY) / 2 || 1;
        const d = (maxY + minY) / 2;

        // On s'assure que les points sont ordonnés selon x pour analyser la séquence temporelle
        const pts = [...data].sort((p1, p2) => p1[0] - p2[0]);

        let crossings = 0;
        for (let i = 1; i < n; i++) {
          if ((pts[i][1] - d) * (pts[i - 1][1] - d) < 0) {
            crossings++;
          }
        }

        let b = 1;
        if (crossings > 0 && maxX !== minX) {
          b = Math.PI * crossings / (maxX - minX);
        } else if (maxX !== minX) {
          b = Math.PI / (maxX - minX);
        }

        // Estimation robuste de la phase initiale au premier point x0
        const x0 = pts[0][0];
        const y0 = pts[0][1];
        const normalizedY0 = Math.max(-1, Math.min(1, (y0 - d) / a));

        // Détection de la tendance (croissante ou décroissante) sur les premiers points
        const sampleCount = Math.min(n - 1, 3);
        let slopeSum = 0;
        for (let j = 1; j <= sampleCount; j++) {
          const dx = pts[j][0] - x0;
          if (dx > 0) {
            slopeSum += (pts[j][1] - y0) / dx;
          }
        }
        const isIncreasing = slopeSum >= 0;

        let phi0 = 0;
        if (type === 'cos' || type === 'dampedcos') {
          const theta = Math.acos(normalizedY0);
          phi0 = isIncreasing ? -theta : theta;
        } else {
          const theta = Math.asin(normalizedY0);
          phi0 = isIncreasing ? theta : (Math.PI - theta);
        }

        let c = phi0 - b * x0;
        // Normalisation de la phase dans l'intervalle [-PI, PI]
        c = ((c + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

        if (type.includes('damped')) {
          const decay = (maxX - minX) || 1;
          return [a, b, c, decay, d];
        } else {
          return [a, b, c, d];
        }
      }

    default:
      return null;
  }
}
