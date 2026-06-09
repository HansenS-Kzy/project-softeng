import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body; 

    console.log(`Request QRIS pesanan: ${orderId}`);

    const { data: booking, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !booking) { 
      return NextResponse.json({
        sukses: false,
        pesan: "Gagal: ID Booking tidak ada di database!"
      }, { status: 404 });
    }

    // Simulasi delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const urlGambarQris = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Qris_Bohongan${orderId}`;

    await supabase
      .from('reservations')
      .update({ status: "pending" })
      .eq('id', orderId);

    return NextResponse.json({
      sukses: true,
      pesan: "Berhasil generate QRIS",
      orderId: orderId,
      urlGambarQris: urlGambarQris
    }, { status: 200 });

  } catch (error) {
    console.error("Error", error);
    return NextResponse.json({ 
      sukses: false, 
      pesan: "Error" 
    }, { status: 500 });
  }
}
