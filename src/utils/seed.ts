// src/utils/seed.ts
import { GrowthMeasurement } from '../types';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

export function seedMeasurements(birthDate: string) : GrowthMeasurement[] {
  // create 6 monthly points from birthDate at 1,2,3,6,9,12 months
  const months = [0, 1, 2, 3, 6, 9, 12];
  return months.map((m, idx) => {
    const date = dayjs(birthDate).add(m, 'month').format('YYYY-MM-DD');
    const ageInDays = Math.round((dayjs(date).diff(dayjs(birthDate), 'day')));
    const weightKg = Number((3 + idx * 0.5).toFixed(2)); // simple growth
    return {
      id: uuidv4(),
      date,
      ageInDays,
      weightKg,
      heightCm: Number((48 + idx * 2).toFixed(1)),
      headCm: Number((34 + idx * 0.5).toFixed(1)),
    };
  });
}
