import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ sukses: false, pesan: "ID tidak valid" }, { status: 400 });
    }

    const { data: booking, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ sukses: false, pesan: "Booking tidak ditemukan" }, { status: 404 });
    }

    // Status ke cancel
    await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);

    // Jadi available
    if (booking.slot_id) {
      await supabase
        .from('parking_slots')
        .update({ status: 'available' })
        .eq('id', booking.slot_id);
    }

    return NextResponse.json({ sukses: true, pesan: "Booking dibatalkan" }, { status: 200 });

  } catch (error: any) {
    console.error("Cancel Booking Error:", error);
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}
