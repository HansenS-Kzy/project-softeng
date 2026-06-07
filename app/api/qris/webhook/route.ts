import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, transaction_status } = body; 

    if (!orderId || !transaction_status) {
      return NextResponse.json({ sukses: false, pesan: "Data tidak lengkap" }, { status: 400 });
    }

    if (transaction_status === "completed" || transaction_status === "success") {
      // 1. Cari data booking
      const booking = await prisma.reservations.findUnique({
        where: { id: orderId }
      });

      if (!booking) {
        return NextResponse.json({ sukses: false, pesan: "Booking tidak ditemukan" }, { status: 404 });
      }

      // Ubah dari pending jadi booked
      if (booking.status === "pending") {
        await prisma.reservations.update({
          where: { id: orderId },
          data: { status: "booked" },
        });

        // Catat pembayaran ke tabel payments
        await prisma.payments.create({
          data: {
            reservation_id: orderId,
            amount: 5000,
            status: "success"
          }
        });
      } 
      // Bayar Sisa Biaya Tambahan
      else if (booking.status === "parked") {
        await prisma.payments.create({
          data: {
            reservation_id: orderId,
            amount: 5000,
            status: "success"
          }
        });
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