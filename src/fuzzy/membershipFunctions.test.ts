import { trapezoid, triangle } from './membershipFunctions';

describe('trapezoid', () => {
  // shape: 0 below a, rising a->b, flat 1 between b and c, falling c->d, 0 above d
  const a = 0;
  const b = 0;
  const c = 50;
  const d = 100;

  it('is 0 below the start of the shape', () => {
    expect(trapezoid(-10, a, b, c, d)).toBe(0);
  });

  it('is 1 across the flat plateau', () => {
    expect(trapezoid(0, a, b, c, d)).toBe(1);
    expect(trapezoid(25, a, b, c, d)).toBe(1);
    expect(trapezoid(50, a, b, c, d)).toBe(1);
  });

  it('falls linearly between c and d', () => {
    expect(trapezoid(75, a, b, c, d)).toBeCloseTo(0.5);
  });

  it('is 0 at and beyond d', () => {
    expect(trapezoid(100, a, b, c, d)).toBe(0);
    expect(trapezoid(150, a, b, c, d)).toBe(0);
  });

  it('rises linearly between a and b when they differ', () => {
    expect(trapezoid(75, 50, 100, 150, 200)).toBeCloseTo(0.5);
    expect(trapezoid(50, 50, 100, 150, 200)).toBe(0);
    expect(trapezoid(100, 50, 100, 150, 200)).toBe(1);
  });
});

describe('triangle', () => {
  const a = 50;
  const b = 150;
  const c = 250;

  it('is 0 at and outside the extremes', () => {
    expect(triangle(50, a, b, c)).toBe(0);
    expect(triangle(250, a, b, c)).toBe(0);
    expect(triangle(0, a, b, c)).toBe(0);
    expect(triangle(300, a, b, c)).toBe(0);
  });

  it('is 1 exactly at the peak', () => {
    expect(triangle(150, a, b, c)).toBe(1);
  });

  it('rises linearly from a to b', () => {
    expect(triangle(100, a, b, c)).toBeCloseTo(0.5);
  });

  it('falls linearly from b to c', () => {
    expect(triangle(200, a, b, c)).toBeCloseTo(0.5);
  });
});
