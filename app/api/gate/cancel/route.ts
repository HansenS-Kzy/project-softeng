import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ sukses: false, pesan: "ID tidak valid" }, { status: 400 });
    }

    const booking = await prisma.reservations.findUnique({
      where: { id: reservationId }
    });

    if (!booking) {
      return NextResponse.json({ sukses: false, pesan: "Booking tidak ditemukan" }, { status: 404 });
    }

    // Status ke cancel
    await prisma.reservations.update({
      where: { id: reservationId },
      data: { status: 'cancelled' } 
    });

    // Jadi available
    if (booking.slot_id) {
      await prisma.parking_slots.update({
        where: { id: booking.slot_id },
        data: { status: 'available' }
      });
    }

    return NextResponse.json({ sukses: true, pesan: "Booking dibatalkan" }, { status: 200 });

  } catch (error: any) {
    console.error("Cancel Booking Error:", error);
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}