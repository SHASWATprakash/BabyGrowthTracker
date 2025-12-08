// src/utils/lms.ts
// LMS helpers: interpolate LMS parameters and convert value -> percentile

export type Sex = 'male' | 'female';

export interface LmsPoint {
  ageDays: number;
  L: number;
  M: number;
  S: number;
}

// Data shape expected: { male: LmsPoint[], female: LmsPoint[] }
export interface LmsTable {
  male: LmsPoint[];
  female: LmsPoint[];
}

/**
 * Error function (erf) approximation
 * Abramowitz & Stegun formula — accurate enough for growth chart percentiles
 */
export const Erf = (x: number): number => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absx = Math.abs(x);
  const t = 1 / (1 + p * absx);

  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absx * absx));

  return sign * y;
};

/**
 * Standard normal CDF — uses erf()
 */
export function stdNormalCDF(z: number): number {
  return 0.5 * (1 + Erf(z / Math.SQRT2));
}

/**
 * LMS → Z-score
 */
export function lmsToZ(value: number, L: number, M: number, S: number): number {
  // guarded: avoid invalid operations
  if (!isFinite(value) || value <= 0 || !isFinite(M) || M <= 0 || !isFinite(S)) {
    return NaN;
  }
  if (L === 0) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Z → Percentile
 */
export function zToPercentile(z: number): number {
  if (!isFinite(z)) return NaN;
  return stdNormalCDF(z) * 100;
}

/**
 * Simple linear interpolation
 */
function lerp(x0: number, y0: number, x1: number, y1: number, x: number): number {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * Interpolate LMS values from knots by age in days.
 */
export function interpolateLmsForAge(
  table: LmsPoint[],
  ageDays: number,
): { L: number; M: number; S: number } {
  if (!table || table.length === 0) {
    throw new Error('LMS table is empty');
  }

  // clamp to range
  if (ageDays <= table[0].ageDays) {
    const t = table[0];
    return { L: t.L, M: t.M, S: t.S };
  }
  const last = table[table.length - 1];
  if (ageDays >= last.ageDays) {
    return { L: last.L, M: last.M, S: last.S };
  }

  // find bounding interval (first index such that next.ageDays >= ageDays)
  let i = 0;
  while (i < table.length - 1 && table[i + 1].ageDays < ageDays) {
    i++;
  }

  const a = table[i];
  const b = table[i + 1];

  return {
    L: lerp(a.ageDays, a.L, b.ageDays, b.L, ageDays),
    M: lerp(a.ageDays, a.M, b.ageDays, b.M, ageDays),
    S: lerp(a.ageDays, a.S, b.ageDays, b.S, ageDays),
  };
}

/**
 * Main API: compute z and percentile from value + age in days + sex + LMS table
 */
export function percentileFor(
  value: number,
  ageDays: number,
  sex: Sex,
  table: LmsTable,
): { z: number; percentile: number } {
  const sexTable = sex === 'male' ? table.male : table.female;
  const { L, M, S } = interpolateLmsForAge(sexTable, ageDays);
  const z = lmsToZ(value, L, M, S);
  const percentile = zToPercentile(z);
  return { z, percentile };
}

/**
 * Convenience wrapper: returns percentile number (0-100) or null if computation invalid.
 * Named `valueToPercentile` because other utils expect that API.
 */
export function valueToPercentile(
  table: LmsTable,
  sex: Sex,
  ageDays: number,
  value: number,
): number | null {
  try {
    const { percentile } = percentileFor(value, ageDays, sex, table);
    if (!Number.isFinite(percentile) || Number.isNaN(percentile)) return null;
    return percentile;
  } catch (e) {
    return null;
  }
}

export default {
  Erf,
  stdNormalCDF,
  lmsToZ,
  zToPercentile,
  interpolateLmsForAge,
  percentileFor,
  valueToPercentile,
};
