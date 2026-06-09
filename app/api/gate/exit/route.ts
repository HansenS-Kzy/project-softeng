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

    // 1. Ubah status jadi completed dan catat exit_time
    await prisma.reservations.update({
      where: { id: reservationId },
      data: { 
        status: 'completed', 
        exit_time: new Date() 
      }
    });

    // 2. Ubah lahan parkir jadi available
    if (booking.slot_id) {
      await prisma.parking_slots.update({
        where: { id: booking.slot_id },
        data: { status: 'available' }
      });
    }

    return NextResponse.json({ sukses: true, pesan: "Berhasil keluar" }, { status: 200 });

  } catch (error) {
    console.error("Exit Gate Error:", error);
    return NextResponse.json({ sukses: false, pesan: "Error Server" }, { status: 500 });
  }
}