// src/utils/stat.ts
// Small stat helpers: inverse standard normal CDF (probit) and LMS inverse

/**
 * Approximate inverse standard normal CDF (probit)
 * Implementation: Peter J. Acklam's rational approximation
 * Reference widely used in numeric code; accurate to ~1e-9 in range.
 */
export function stdNormalInv(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('p must be in (0,1)');
  }

  // Coefficients in rational approximations
  const a1 = -3.969683028665376e+01;
  const a2 = 2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 = 1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 = 2.506628277459239e+00;

  const b1 = -5.447609879822406e+01;
  const b2 = 1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 = 6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;

  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 = 4.374664141464968e+00;
  const c6 = 2.938163982698783e+00;

  const d1 = 7.784695709041462e-03;
  const d2 = 3.224671290700398e-01;
  const d3 = 2.445134137142996e+00;
  const d4 = 3.754408661907416e+00;

  // Define break-points.
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q, r, x;

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    x =
      ((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6;
    x = x / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    return -x;
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    x =
      ((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6;
    x = x * q / ((((b1 * r + b2) * r + b3) * r + b4) * r + b5) + 1;
    // The formula above is slightly rearranged; better use standard implementation:
    // We'll use another standard central rational approximation:
    r = q * q;
    x =
      q *
      (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    return x;
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      ((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6;
    x = x / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    return x;
  }
}

/**
 * Given LMS parameters and a z-score, return the measurement value
 * Inverse of lmsToZ:
 * If L === 0: value = M * exp(S * z)
 * else: value = M * (1 + L*S*z)^(1/L)
 */
export function valueFromZ(L: number, M: number, S: number, z: number): number {
  if (L === 0) {
    return M * Math.exp(S * z);
  }
  const inner = 1 + L * S * z;
  // guard against negative inner (extreme z)
  if (inner <= 0) {
    // fallback: return NaN to ignore this point
    return NaN;
  }
  return M * Math.pow(inner, 1 / L);
}
