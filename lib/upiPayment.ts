import { Linking, Alert } from 'react-native';
import { getStoredUserId } from '@/api/userApi';
import {
  initiatePayment,
  verifyPayment,
  failPayment,
  getRestaurantUpiId,
} from '@/api/paymentApi';

/**
 * Secure UPI Payment Flow:
 * 1. Check user session (auth guard)
 * 2. Fetch restaurant UPI ID from server
 * 3. Create INITIATED payment record on server
 * 4. Open UPI app with the real restaurant UPI ID
 * 5. After user confirms, verify payment on server → VERIFIED
 * 6. Only VERIFIED payments can proceed to order creation
 */

interface SecurePaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  error?: string;
}

/**
 * Step 1 & 2: Initiate secure payment — requires auth, creates server record
 */
export const initiateSecureUPIPayment = async (
  amount: number,
  restaurantId: string,
  restaurantName: string,
  orderId: string
): Promise<SecurePaymentResult> => {
  try {
    // ── Auth Guard ──────────────────────────────────────────────────────
    const userId = await getStoredUserId();
    if (!userId) {
      Alert.alert('Login Required', 'Please log in to make a payment.');
      return { success: false, error: 'Not authenticated' };
    }

    // ── Fetch UPI ID from server ────────────────────────────────────────
    const upiId = await getRestaurantUpiId(restaurantId);
    if (!upiId) {
      Alert.alert('Payment Error', 'Restaurant payment setup is incomplete. Contact support.');
      return { success: false, error: 'No UPI ID configured' };
    }

    // ── Create INITIATED payment record on server ───────────────────────
    const payment = await initiatePayment({
      orderId,
      amount,
      method: 'UPI',
      restaurantUpiId: upiId,
    });

    // ── Build UPI URL with restaurant's real UPI ID ─────────────────────
    const txnRef = `RMS-${payment.id.slice(0, 8)}-${Date.now()}`;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(restaurantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order from ' + restaurantName)}&tr=${txnRef}`;

    const supported = await Linking.canOpenURL(upiUrl);
    if (!supported) {
      await failPayment(payment.id);
      Alert.alert(
        'UPI Not Supported',
        'No compatible UPI apps found. Please install Google Pay, PhonePe, or Paytm.'
      );
      return { success: false, error: 'UPI not supported' };
    }

    // ── Open UPI app ────────────────────────────────────────────────────
    await Linking.openURL(upiUrl);

    return {
      success: true,
      paymentId: payment.id,
      transactionId: txnRef,
    };
  } catch (err: any) {
    console.error('UPI Payment Error:', err);
    Alert.alert('Payment Error', 'Failed to initiate payment. Please try again.');
    return { success: false, error: err.message };
  }
};

/**
 * Step 3: Verify payment on server after user confirms in UPI app.
 * This is the anti-fraud gate — only server-verified payments proceed.
 */
export const confirmPaymentOnServer = async (
  paymentId: string,
  transactionId: string
): Promise<boolean> => {
  try {
    const userId = await getStoredUserId();
    if (!userId) {
      return false;
    }

    const verified = await verifyPayment({
      paymentId,
      transactionId,
    });

    return verified.status === 'VERIFIED';
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return false;
  }
};

/**
 * Cancel an initiated payment (user declined or error occurred).
 */
export const cancelPayment = async (paymentId: string): Promise<void> => {
  try {
    await failPayment(paymentId);
  } catch (err) {
    console.error('Failed to cancel payment:', err);
  }
};
