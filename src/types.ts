// src/types.ts

/**
 * Baby Profile Model
 * ------------------
 * Basic information about the baby.
 */
export interface BabyProfile {
  id: string; // unique ID
  name: string;
  birthDate: string; // ISO string: YYYY-MM-DD
  gender: 'male' | 'female';
}

/**
 * Growth Measurement Model
 * ------------------------
 * Each entry captured when the parent logs measurement.
 * Values must be stored in SI units:
 *  - weight: kg
 *  - height: cm
 *  - head circumference: cm
 * Percentiles are optional because they are computed later.
 */
export interface GrowthMeasurement {
  id: string; // unique measurement ID
  date: string; // ISO date: YYYY-MM-DD
  ageInDays: number; // calculated from birthDate -> date
  weightKg: number;
  heightCm: number;
  headCm: number;
  weightPercentile?: number; // 0-100
  heightPercentile?: number;
  headPercentile?: number;
}

/**
 * App Storage Schema
 * ------------------
 * This helps define the full structure stored in AsyncStorage.
 * Useful for migrations.
 */
export interface AppDataSchema {
  schemaVersion: number;
  babyProfile: BabyProfile | null;
  measurements: GrowthMeasurement[];
}
