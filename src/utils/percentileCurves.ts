// src/utils/percentileCurves.ts
import { LmsTable } from './lms';
import { stdNormalInv, valueFromZ } from './stat';

export const DEFAULT_PERCENTILES = [3, 10, 25, 50, 75, 90, 97];

/**
 * Convert months -> approximate days
 */
function monthsToDays(months: number): number {
  return Math.round(months * 30.4375); // average month length
}

/**
 * Build percentile curves for a given LmsTable (male/female) and percentile list.
 * Steps:
 *  - iterate ageMonths from 0..maxMonths step `stepMonths`
 *  - interpolate LMS for each ageDays (use interpolateLmsForAge from lms.ts)
 *  - compute z = stdNormalInv(p/100)
 *  - compute value = inverse LMS (valueFromZ)
 *
 * Returns: { [percentile]: Array<{ x: number (months), y: number (value in SI)> } }
 */
import { interpolateLmsForAge } from './lms';

export function buildPercentileCurves(
  table: LmsTable,
  sex: 'male' | 'female',
  percentiles: number[] = DEFAULT_PERCENTILES,
  maxMonths = 60,
  stepMonths = 0.5,
) {
  const curves: Record<string, { x: number; y: number }[]> = {};
  percentiles.forEach((p) => (curves[p] = []));

  const sexTable = sex === 'male' ? table.male : table.female;
  const maxAgeDays = sexTable[sexTable.length - 1]?.ageDays ?? monthsToDays(maxMonths);

  const finalMonths = Math.min(maxMonths, Math.floor(maxAgeDays / 30.4375));

  for (let m = 0; m <= finalMonths; m += stepMonths) {
    const ageDays = monthsToDays(m);
    const { L, M, S } = interpolateLmsForAge(sexTable, ageDays);

    percentiles.forEach((p) => {
      const prob = p / 100;
      const z = stdNormalInv(prob);
      const val = valueFromZ(L, M, S, z);
      curves[p].push({ x: m, y: Number(val.toFixed(3)) });
    });
  }

  return curves;
}
