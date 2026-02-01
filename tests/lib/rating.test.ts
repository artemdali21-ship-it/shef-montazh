import { calculateNewRating } from '@/lib/utils/rating';

describe('Rating Calculation', () => {
  it('should calculate correct average rating', () => {
    const currentRating = 4.5;
    const totalShifts = 10;
    const newRating = 5;

    const result = calculateNewRating(currentRating, totalShifts, newRating);

    expect(result).toBeCloseTo(4.545, 2);
  });

  it('should handle first rating', () => {
    const result = calculateNewRating(0, 0, 5);
    expect(result).toBe(5);
  });

  it('should not exceed 5.0', () => {
    const result = calculateNewRating(4.9, 100, 5);
    expect(result).toBeLessThanOrEqual(5.0);
  });

  it('should not go below 1.0', () => {
    const result = calculateNewRating(1.1, 100, 1);
    expect(result).toBeGreaterThanOrEqual(1.0);
  });
});
