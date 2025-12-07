import { ageInDays } from '../src/utils/age';

describe('ageInDays', () => {
  test('calculates correct age for same date', () => {
    expect(ageInDays('2024-01-01', '2024-01-01')).toBe(0);
  });

  test('calculates correct age difference', () => {
    expect(ageInDays('2024-01-01', '2024-01-10')).toBe(9);
  });

  test('handles leap year correctly', () => {
    expect(ageInDays('2020-02-29', '2020-03-01')).toBe(1);
  });
});
