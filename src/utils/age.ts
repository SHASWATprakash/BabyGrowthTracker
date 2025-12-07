// src/utils/age.ts

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * Calculate age in days from birthDate to measurementDate.
 * Both should be ISO strings in format YYYY-MM-DD.
 */
export function ageInDays(birthISO: string, dateISO: string): number {
  const birth = dayjs.utc(birthISO).startOf('day');
  const date = dayjs.utc(dateISO).startOf('day');
  return date.diff(birth, 'day');
}
