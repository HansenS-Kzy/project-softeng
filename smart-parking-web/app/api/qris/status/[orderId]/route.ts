import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> } 
) {
  try {
    const { orderId } = await params; 

    if (!orderId) {
      return NextResponse.json({ sukses: false, pesan: "Invalid" }, { status: 400 });
    }

    const { data: booking, error: fetchError } = await supabase
      .from('reservations')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ 
        sukses: false, 
        pesan: "Invalid" 
      }, { status: 404 });
    }

    return NextResponse.json({
      sukses: true,
      pesan: "Berhasil",
      status: booking.status
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ 
      sukses: false, 
      pesan: "Error" 
    }, { status: 500 });
  }
}
