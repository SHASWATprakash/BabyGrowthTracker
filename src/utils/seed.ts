// src/utils/seed.ts
import { GrowthMeasurement } from '../types';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

/**
 * Quick fallback id generator for POC (not cryptographically secure).
 * Uses timestamp + random component in base36 to reduce collisions.
 */
function quickId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9)
    .toString(36)
    .padStart(6, '0')}`;
}

/**
 * Generate an id using uuidv4() if it works, otherwise fallback to quickId().
 * We wrap in try/catch because uuidv4() may throw in RN if crypto.getRandomValues isn't available.
 */
function safeId(): string {
  try {
    // uuidv4 may throw at runtime if crypto.getRandomValues is missing
    const id = uuidv4();
    if (typeof id === 'string' && id.length > 0) return id;
    return quickId();
  } catch (e) {
    // fallback for environments without WebCrypto/native polyfill
    return quickId();
  }
}

export function seedMeasurements(birthDate: string): GrowthMeasurement[] {
  // create a few monthly points from birthDate at 0,1,2,3,6,9,12 months
  const months = [0, 1, 2, 3, 6, 9, 12];
  return months.map((m, idx) => {
    const date = dayjs(birthDate).add(m, 'month').format('YYYY-MM-DD');
    const ageInDays = Math.round(dayjs(date).diff(dayjs(birthDate), 'day'));
    const weightKg = Number((3 + idx * 0.5).toFixed(2)); // simple growth
    return {
      id: safeId(),
      date,
      ageInDays,
      weightKg,
      heightCm: Number((48 + idx * 2).toFixed(1)),
      headCm: Number((34 + idx * 0.5).toFixed(1)),
    };
  });
}
