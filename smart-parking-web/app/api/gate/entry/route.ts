import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json();
    
    // Cek tiket
    const { data: booking, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();
    
    if (fetchError || !booking || booking.status !== 'booked') {
      return NextResponse.json({ sukses: false, pesan: "Tiket belum lunas atau tidak valid!" }, { status: 400 });
    }

    // Buka palang & Catat waktu masuk
    await supabase
      .from('reservations')
      .update({ status: 'parked', entry_time: new Date().toISOString() })
      .eq('id', reservationId);

    return NextResponse.json({ sukses: true, pesan: "Palang Terbuka!" });
  } catch (error: any) {
    console.error("Entry Gate Error:", error);
    return NextResponse.json({ sukses: false, pesan: "Error Server" }, { status: 500 });
  }
}
