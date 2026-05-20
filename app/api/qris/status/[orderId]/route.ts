import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json({ 
        sukses: false, 
        pesan: "Invalid" 
      }, { status: 400 });
    }

    const booking = await prisma.reservations.findUnique({
      where: { 
        id: orderId 
      },
      select: { 
        status: true 
      } 
    });

    if (!booking) {
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