import { Linking, Alert } from 'react-native';

const UPI_APPS = {
  gpay: 'com.google.android.apps.nbu.paisa.user',
  phonepe: 'com.phonepe.app',
  paytm: 'net.one97.paytm', // Added Paytm
};

/**
 * Opens a UPI app for payment
 * @param amount Amount to pay
 * @param restaurantName Name of the restaurant
 */
export const openUPIPayment = async (amount: number, restaurantName: string) => {
  // In a real app, you would use your business UPI ID
  const vpa = 'yourupi@upi'; 
  const name = 'RMS App';
  const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order from ' + restaurantName)}`;

  try {
    const supported = await Linking.canOpenURL(upiUrl);

    if (!supported) {
      Alert.alert(
        'UPI Not Supported', 
        'No compatible UPI apps were found on this device. Please install Google Pay, PhonePe, or Paytm.'
      );
      return false;
    }

    // Attempt to open the generic UPI picker first
    await Linking.openURL(upiUrl);
    
    // Since Linking.openURL doesn't return a "status" of the transaction,
    // we normally show an alert asking the user to confirm they finished.
    return true;
  } catch (err) {
    console.error('UPI Error:', err);
    Alert.alert('Payment Error', 'Failed to open UPI payment app');
    return false;
  }
};
