import { calculatePaymentAmounts } from '@/lib/utils/payment';

describe('Payment Calculation', () => {
  it('should calculate correct platform fee', () => {
    const shiftAmount = 10000;
    const platformFee = 1200;

    const result = calculatePaymentAmounts(shiftAmount, platformFee);

    expect(result.totalAmount).toBe(10000);
    expect(result.platformFee).toBe(1200);
    expect(result.workerAmount).toBe(8800); // 10000 - 1200
  });

  it('should handle zero fee', () => {
    const result = calculatePaymentAmounts(5000, 0);

    expect(result.workerAmount).toBe(5000);
  });

  it('should not allow negative amounts', () => {
    expect(() => calculatePaymentAmounts(-1000, 1200)).toThrow();
  });
});
