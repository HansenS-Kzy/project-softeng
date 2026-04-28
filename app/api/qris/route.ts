import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, nominal } = body;

    console.log(`Request QRIS pesanan: ${orderId}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      sukses: true,
      pesan: "Berhasil generate QRIS",
      orderId: orderId,
      nominal: nominal,
      urlGambarQris: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Pembayaran_Parkir_Dummy_Untuk_${orderId}`
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      sukses: false, 
      pesan: "Error" 
    }, { status: 500 });
  }
}