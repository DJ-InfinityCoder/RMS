import { supabase } from '@/lib/supabase';
import { getStoredUserId } from './userApi';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentStatus = 'INITIATED' | 'VERIFIED' | 'FAILED' | 'REFUNDED';
export type PaymentMethodType = 'UPI' | 'CARD' | 'CASH';

export interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  transaction_id: string | null;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethodType;
  upi_id_used: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethodType;
  restaurantUpiId?: string;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  transactionId: string;
}

// ─── Auth Guard ──────────────────────────────────────────────────────────────

const requireAuth = async (): Promise<string> => {
  const userId = await getStoredUserId();
  if (!userId) {
    throw new Error('Authentication required. Please log in.');
  }
  return userId;
};

// ─── Payment Operations ──────────────────────────────────────────────────────

/**
 * Step 1: Initiate a payment record (INITIATED status) before opening UPI app.
 * This creates a server-side record that prevents false entries.
 */
export const initiatePayment = async (
  request: InitiatePaymentRequest
): Promise<PaymentRecord> => {
  const userId = await requireAuth();

  const { data, error } = await supabase
    .from('payments')
    .insert({
      order_id: request.orderId,
      user_id: userId,
      amount: request.amount,
      status: 'INITIATED',
      method: request.method,
      upi_id_used: request.restaurantUpiId || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to initiate payment: ' + error.message);
  }

  return data;
};

/**
 * Step 2: After UPI app confirms, verify payment on the server side.
 * Only sets status to VERIFIED if the payment was in INITIATED state.
 * This is the critical anti-fraud gate — only VERIFIED payments proceed.
 */
export const verifyPayment = async (
  request: VerifyPaymentRequest
): Promise<PaymentRecord> => {
  const userId = await requireAuth();

  // First, check the payment exists and belongs to this user
  const { data: existing, error: fetchError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', request.paymentId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Payment not found or unauthorized');
  }

  if (existing.status !== 'INITIATED') {
    throw new Error(`Payment already in ${existing.status} state`);
  }

  // Update to VERIFIED with transaction_id and timestamp
  const { data, error } = await supabase
    .from('payments')
    .update({
      status: 'VERIFIED',
      transaction_id: request.transactionId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', request.paymentId)
    .eq('user_id', userId)
    .eq('status', 'INITIATED') // Double-check: only update if still INITIATED
    .select()
    .single();

  if (error) {
    throw new Error('Failed to verify payment: ' + error.message);
  }

  return data;
};

/**
 * Mark payment as failed (e.g., user cancelled or UPI app returned error).
 */
export const failPayment = async (paymentId: string): Promise<void> => {
  const userId = await requireAuth();

  const { error } = await supabase
    .from('payments')
    .update({ status: 'FAILED' })
    .eq('id', paymentId)
    .eq('user_id', userId)
    .eq('status', 'INITIATED');

  if (error) {
    console.error('Failed to mark payment as failed:', error.message);
  }
};

/**
 * Get payment history for the current user (last 15 days only).
 */
export const getPaymentHistory = async (): Promise<PaymentRecord[]> => {
  const userId = await requireAuth();

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', fifteenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch payment history: ' + error.message);
  }

  return data || [];
};

/**
 * Get payment for a specific order.
 */
export const getPaymentByOrderId = async (orderId: string): Promise<PaymentRecord | null> => {
  const userId = await requireAuth();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching payment:', error.message);
    return null;
  }

  return data;
};

/**
 * Get the UPI ID for a restaurant.
 */
export const getRestaurantUpiId = async (restaurantId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('upi_id')
    .eq('id', restaurantId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.upi_id;
};

/**
 * Cleanup: Delete old payment records (> 15 days).
 * Call this periodically (e.g., on app startup).
 */
export const cleanupOldPayments = async (): Promise<void> => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    await supabase
      .from('payments')
      .delete()
      .lt('created_at', fifteenDaysAgo.toISOString());
  } catch (error) {
    console.error('Payment cleanup error:', error);
  }
};
