// src/utils/units.ts

/** Weight conversions */
export const lbToKg = (lb: number): number => lb * 0.45359237;
export const kgToLb = (kg: number): number => kg / 0.45359237;

/** Length conversions */
export const inToCm = (inch: number): number => inch * 2.54;
export const cmToIn = (cm: number): number => cm / 2.54;

/** Optional rounding helpers for UI display */
export const round1 = (value: number): number =>
  Math.round(value * 10) / 10;
