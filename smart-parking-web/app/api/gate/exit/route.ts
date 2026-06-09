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

    // 1. Ubah status jadi completed dan catat exit_time
    await supabase
      .from('reservations')
      .update({ status: 'completed', exit_time: new Date().toISOString() })
      .eq('id', reservationId);

    // 2. Ubah lahan parkir jadi available
    if (booking.slot_id) {
      await supabase
        .from('parking_slots')
        .update({ status: 'available' })
        .eq('id', booking.slot_id);
    }

    return NextResponse.json({ sukses: true, pesan: "Berhasil keluar" }, { status: 200 });

  } catch (error) {
    console.error("Exit Gate Error:", error);
    return NextResponse.json({ sukses: false, pesan: "Error Server" }, { status: 500 });
  }
}
