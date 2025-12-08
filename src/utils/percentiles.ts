// src/utils/percentiles.ts
import whoWeight from '../data/who-weight-age.json';
import whoLength from '../data/who-length-age.json';
import whoHead from '../data/who-head-age.json';
import { GrowthMeasurement } from '../types';
import { valueToPercentile } from './lms'; // your function converting value->percentile using LMS and interpolation

export function recalcMeasurementPercentiles(sex: 'male' | 'female', m: GrowthMeasurement): GrowthMeasurement {
  const res: GrowthMeasurement = { ...m };
  try {
    res.weightPercentile = Number((valueToPercentile(whoWeight as any, sex, m.ageInDays, m.weightKg) ?? NaN).toFixed(2));
  } catch (e) { /* leave undefined */ }
  try {
    res.heightPercentile = Number((valueToPercentile(whoLength as any, sex, m.ageInDays, m.heightCm) ?? NaN).toFixed(2));
  } catch (e) {}
  try {
    res.headPercentile = Number((valueToPercentile(whoHead as any, sex, m.ageInDays, m.headCm) ?? NaN).toFixed(2));
  } catch (e) {}
  return res;
}
