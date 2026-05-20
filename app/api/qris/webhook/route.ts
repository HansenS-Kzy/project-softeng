import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { orderId, transaction_status } = body; 

    console.log(`Pembayaran untuk pesanan: ${orderId}`);
    console.log(`Status: ${transaction_status}`);

    if (!orderId || !transaction_status) {
      return NextResponse.json({ 
        sukses: false, 
        pesan: "Data tidak lengkap" 
      }, { status: 400 });
    }

    let databaseStatus = "";

    if (transaction_status === "completed" || transaction_status === "success") {
      databaseStatus = "completed";
    } 
    else if (transaction_status === "cancel" || transaction_status === "cancelled") {
      databaseStatus = "cancelled"; 
    } 
    else {
      return NextResponse.json({ 
        sukses: false,
        pesan: `Invalid action: ${transaction_status}` 
      }, { status: 400 });
    }

    const updateBooking = await prisma.reservations.update({
      where: { 
        id: orderId 
      },
      data: { 
        status: databaseStatus 
      },
    });

    return NextResponse.json({
      sukses: true,
      pesan: `Action berhasil dilakukan`,
      data: updateBooking
    }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ 
      sukses: false, 
      pesan: "Error" 
    }, { status: 500 });
  }
}