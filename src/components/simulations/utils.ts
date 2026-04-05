/**
 * Complementary error function approximation
 * erfc(x) = 1 - erf(x)
 */
export function erfc(x: number): number {
  // Simple approximation for Q function calculations
  // Using Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) *
    t * Math.exp(-x * x);

  return sign === 1 ? 1 - y : 1 + y;
}

/**
 * Q function: Q(x) = 0.5 * erfc(x / sqrt(2))
 */
export function qFunc(x: number): number {
  return 0.5 * erfc(x / Math.sqrt(2));
}
