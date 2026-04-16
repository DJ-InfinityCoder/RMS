import { supabase } from '@/lib/supabase';

export interface BookingData {
  restaurant_id: string;
  user_id: string;
  time_slot: string;
  guests: number;
}

export const createTableBooking = async (data: BookingData) => {
  try {
    const { data: booking, error } = await supabase
      .from('table_reservations')
      .insert([
        {
          restaurant_id: data.restaurant_id,
          user_id: data.user_id,
          time_slot: data.time_slot,
          guests: data.guests,
          status: 'CONFIRMED'
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
    return booking;
  } catch (err: any) {
    throw new Error(err.message || 'Failed to create booking');
  }
};
