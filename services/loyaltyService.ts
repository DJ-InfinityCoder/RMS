/**
 * Loyalty Service
 *
 * Manages loyalty points threshold logic and payment restrictions.
 * Threshold: 800 points
 *   - >= 800: User can pay after order (postpaid / cash allowed)
 *   - <  800: User must pay before placing order (prepaid only)
 */

// ─── Constants ───────────────────────────────────────────────────────────────

export const LOYALTY_THRESHOLD = 800;
export const INITIAL_LOYALTY_POINTS = 1000;

// ─── Payment Restriction ────────────────────────────────────────────────────

export type PaymentRestriction = 'prepaid' | 'postpaid';

/**
 * Determines the payment restriction for a user based on their loyalty points.
 *
 * @param loyaltyPoints - The user's current loyalty points
 * @returns 'postpaid' if user can order first and pay later, 'prepaid' otherwise
 */
export const getPaymentRestriction = (loyaltyPoints: number): PaymentRestriction => {
  return loyaltyPoints >= LOYALTY_THRESHOLD ? 'postpaid' : 'prepaid';
};

/**
 * Whether the user can use Cash/Pay-later for orders.
 */
export const canPayLater = (loyaltyPoints: number): boolean => {
  return loyaltyPoints >= LOYALTY_THRESHOLD;
};

/**
 * Returns a user-facing message about their payment status.
 */
export const getPaymentStatusMessage = (loyaltyPoints: number): {
  message: string;
  isRestricted: boolean;
} => {
  if (loyaltyPoints >= LOYALTY_THRESHOLD) {
    return {
      message: 'Cash & Online payments available',
      isRestricted: false,
    };
  }
  return {
    message: `Online payment required (${loyaltyPoints}/${LOYALTY_THRESHOLD} pts)`,
    isRestricted: true,
  };
};

/**
 * Calculate points to award for a completed order.
 * Simple rule: 10 points per ₹100 spent.
 */
export const calculateOrderPoints = (orderAmount: number): number => {
  return Math.floor(orderAmount / 100) * 10;
};
