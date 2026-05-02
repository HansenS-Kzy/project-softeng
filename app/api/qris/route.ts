import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body; 

    console.log(`Request QRIS pesanan: ${orderId}`);

    const cekSemuaData = await prisma.reservations.findMany();
    console.log("ISI DATABASE MENURUT PRISMA:", cekSemuaData);

    const booking = await prisma.reservations.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!booking) { 
      return NextResponse.json({
        sukses: false,
        pesan: "Gagal: ID Booking (Reservation) tidak ditemukan di database!"
      }, { status: 404 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const urlGambarQris = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Qris_Bohongan${orderId}`;

    await prisma.reservations.update({
      where: { 
        id: orderId 
      },
      data: { 
        status: "pending"
      },
    });

    return NextResponse.json({
      sukses: true,
      pesan: "Berhasil QRIS",
      orderId: orderId,
      urlGambarQris: urlGambarQris
    }, { status: 200 });

  } catch (error) {
    console.error("Error", error);
    return NextResponse.json({ 
      sukses: false, 
      pesan: "Error pada database" 
    }, { status: 500 });
  }
}