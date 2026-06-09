import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, transaction_status } = body; 

    if (!orderId || !transaction_status) {
      return NextResponse.json({ sukses: false, pesan: "Data tidak lengkap" }, { status: 400 });
    }

    if (transaction_status === "completed" || transaction_status === "success") {
      // 1. Cari data booking
      const { data: booking, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !booking) {
        return NextResponse.json({ sukses: false, pesan: "Booking tidak ditemukan" }, { status: 404 });
      }

      // Ubah dari pending jadi booked
      if (booking.status === "pending") {
        await supabase
          .from('reservations')
          .update({ status: "booked" })
          .eq('id', orderId);

        // Catat pembayaran ke tabel payments
        await supabase
          .from('payments')
          .insert([{
            reservation_id: orderId,
            amount: 5000,
            status: "success"
          }]);
      } 
      // Bayar Sisa Biaya Tambahan
      else if (booking.status === "parked") {
        await supabase
          .from('payments')
          .insert([{
            reservation_id: orderId,
            amount: 5000,
            status: "success"
          }]);
      }

      return NextResponse.json({ sukses: true, pesan: `Pembayaran berhasil diproses` }, { status: 200 });
    } else {
       return NextResponse.json({ sukses: true, pesan: "Batal" }, { status: 200 });
    }

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ sukses: false, pesan: "Error" }, { status: 500 });
  }
}
