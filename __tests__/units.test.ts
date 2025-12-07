import { lbToKg, kgToLb, inToCm, cmToIn } from '../src/utils/units';

describe('unit conversions', () => {
  test('lb to kg', () => {
    expect(lbToKg(10)).toBeCloseTo(4.5359, 3);
  });

  test('kg to lb', () => {
    expect(kgToLb(10)).toBeCloseTo(22.0462, 3);
  });

  test('inch to cm', () => {
    expect(inToCm(1)).toBe(2.54);
  });

  test('cm to inch', () => {
    expect(cmToIn(2.54)).toBeCloseTo(1.0, 3);
  });
});
