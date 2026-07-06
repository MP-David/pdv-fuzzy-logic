/**
 * Trapezoidal membership function: 0 below `a`, rises linearly a->b,
 * plateau at 1 between b and c, falls linearly c->d, 0 at and above d.
 * Degenerates into a "shoulder" (no rising/falling edge) when a===b or c===d.
 */
export function trapezoid(x: number, a: number, b: number, c: number, d: number): number {
  if (x < a || x > d) {
    return 0;
  }
  if (x >= b && x <= c) {
    return 1;
  }
  if (x < b) {
    // a < b here: if a === b this branch is unreachable (empty range), so no div-by-zero.
    return (x - a) / (b - a);
  }
  // c < x < d here: if c === d this branch is unreachable, so no div-by-zero.
  return (d - x) / (d - c);
}

/**
 * Triangular membership function: 0 outside [a, c], rises linearly a->b,
 * peaks at 1 at b, falls linearly b->c.
 */
export function triangle(x: number, a: number, b: number, c: number): number {
  return trapezoid(x, a, b, b, c);
}
