import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { reservationId } = await request.json();
  
  // Cek tiket
  const booking = await prisma.reservations.findUnique({ where: { id: reservationId } });
  
  if (!booking || booking.status !== 'booked') {
    return NextResponse.json({ sukses: false, pesan: "Tiket belum lunas atau tidak valid!" }, { status: 400 });
  }

  // Buka palang & Catat waktu masuk
  await prisma.reservations.update({
    where: { id: reservationId },
    data: { status: 'parked', entry_time: new Date() } // Waktu Masuk
  });

  return NextResponse.json({ sukses: true, pesan: "Palang Terbuka!" });
}