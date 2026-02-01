export function calculateNewRating(
  currentRating: number,
  totalShifts: number,
  newRating: number
): number {
  if (totalShifts === 0) return newRating;

  const sum = currentRating * totalShifts + newRating;
  const newAverage = sum / (totalShifts + 1);

  // Ограничиваем 1.0 - 5.0
  return Math.max(1.0, Math.min(5.0, newAverage));
}
