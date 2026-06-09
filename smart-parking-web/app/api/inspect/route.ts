import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Get columns of vehicles and payments by inserting nothing and reading schema
  const vehiclesCols = await supabase.from('vehicles').select('*').limit(0);
  const paymentsCols = await supabase.from('payments').select('*').limit(0);

  // Also get all existing data
  const [profiles, parking_slots, reservations, vehicles, payments] = await Promise.all([
    supabase.from('profiles').select('*').limit(5),
    supabase.from('parking_slots').select('*').limit(5),
    supabase.from('reservations').select('*').limit(5),
    supabase.from('vehicles').select('*').limit(5),
    supabase.from('payments').select('*').limit(5),
  ]);

  return NextResponse.json({
    connected: true,
    tables: {
      profiles: { data: profiles.data, error: profiles.error },
      parking_slots: { data: parking_slots.data, error: parking_slots.error },
      reservations: { data: reservations.data, error: reservations.error },
      vehicles: { data: vehicles.data, error: vehicles.error, colsError: vehiclesCols.error },
      payments: { data: payments.data, error: payments.error, colsError: paymentsCols.error },
    }
  });
}
