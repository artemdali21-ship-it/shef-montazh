export interface PaymentAmounts {
  totalAmount: number;
  platformFee: number;
  workerAmount: number;
}

export function calculatePaymentAmounts(
  shiftAmount: number,
  platformFee: number
): PaymentAmounts {
  if (shiftAmount < 0 || platformFee < 0) {
    throw new Error('Amounts cannot be negative');
  }

  const workerAmount = shiftAmount - platformFee;

  if (workerAmount < 0) {
    throw new Error('Platform fee cannot exceed shift amount');
  }

  return {
    totalAmount: shiftAmount,
    platformFee,
    workerAmount,
  };
}
