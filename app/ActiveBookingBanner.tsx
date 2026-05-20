'use client'

import { useEffect, useState } from 'react'

const HARGA_PER_JAM = 5000 

interface Props {
  slotCode: string
  startTime: string 
  reservationId: string 
}

export default function ActiveBookingBanner({ slotCode, startTime, reservationId }: Props) {
  const [waktuBerjalan, setWaktuBerjalan] = useState('Menghitung...')
  const [totalHarga, setTotalHarga] = useState(HARGA_PER_JAM)
  
  const [urlQris, setUrlQris] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false) // State penanda lunas

  // 1. Hitung Durasi Parkir
  useEffect(() => {
    const hitungDurasi = () => {
      const waktuMulai = new Date(startTime).getTime()
      const waktuSekarang = new Date().getTime()
      const selisihMilidetik = waktuSekarang - waktuMulai

      const jam = Math.floor(selisihMilidetik / (1000 * 60 * 60))
      const menit = Math.floor((selisihMilidetik % (1000 * 60 * 60)) / (1000 * 60))
      setWaktuBerjalan(`${jam} Jam ${menit} Menit`)

      const totalJamTerhitung = Math.max(1, Math.ceil(selisihMilidetik / (1000 * 60 * 60)))
      setTotalHarga(totalJamTerhitung * HARGA_PER_JAM)
    }

    hitungDurasi()
    const interval = setInterval(hitungDurasi, 60000)
    return () => clearInterval(interval)
  }, [startTime])

  // 2. Polling: Mata-mata untuk cek status Lunas tiap 3 detik
  useEffect(() => {
    if (!urlQris || isPaid) return; 

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/qris/status/${reservationId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          setIsPaid(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error cek status:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [urlQris, isPaid, reservationId]);

  // 3. Fungsi memunculkan gambar QRIS
  const handleBayarQRIS = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: reservationId }),
      })
      
      const data = await response.json()
      if (data.sukses) {
        setUrlQris(data.urlGambarQris)
      } else {
        alert(data.pesan)
      }
    } catch (error) {
      console.error(error)
      alert("Error saat memproses QRIS")
    } finally {
      setLoading(false)
    }
  }

  const handleSimulasiWebhook = async () => {
    try {
      alert("Mohon ditunggu"); 

      const response = await fetch('/api/qris/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: reservationId,
          transaction_status: "success" 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pembayaran Berhasil");
      } else {
        alert("Pembayaran gagal: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Gagal simulasi webhook", error);
      alert("⚠️ Gagal konek ke API Webhook. Coba buka Inspect Element -> Console!");
    }
  }

  return (
    <div className="w-full bg-blue-50 border-2 border-blue-200 p-5 rounded-xl mb-8 flex flex-col sm:flex-row items-center justify-between shadow-sm animate-pulse">
      {/* Kiri: Info Waktu */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Status Parkir Kamu</p>
        <h3 className="text-lg font-black text-blue-900 mt-1">
          📌 Lapak: <span className="text-xl text-blue-600 bg-blue-100 px-3 py-1 rounded-lg mx-1">{slotCode}</span>
        </h3>
        <p className="text-sm text-gray-700 mt-2 font-medium">
          Waktu berjalan: <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-100">{waktuBerjalan}</span>
        </p>
      </div>

      {/* Kanan: Info Harga & Tombol Bayar */}
      <div className="mt-4 sm:mt-0 bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-right min-w-[200px] flex flex-col items-end">
        <p className="text-xs text-gray-500 font-semibold mb-1">Total Tagihan Sementara</p>
        <p className="text-3xl font-black text-green-600">
          Rp {totalHarga.toLocaleString('id-ID')}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">*(Tarif Rp {HARGA_PER_JAM.toLocaleString('id-ID')}/jam)</p>

        {!isPaid && (
          <button 
            onClick={handleBayarQRIS}
            disabled={loading}
            className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-3 rounded-lg shadow transition-colors flex justify-center items-center gap-2 disabled:bg-gray-400"
          >
            {loading ? '⏳ Memproses...' : '📱 Bayar Pakai QRIS'}
          </button>
        )}

        {urlQris && !isPaid && (
          <div className="mt-4 flex flex-col items-center bg-gray-50 p-2 rounded border border-gray-200 w-full relative">
            <p className="text-xs font-bold mb-1 text-gray-700">Scan untuk Lunas:</p>
            <img src={urlQris} alt="QR Code" className="w-[120px] h-[120px]" />
            <p className="text-[9px] text-gray-400 font-mono mt-1 w-[120px] truncate" title={reservationId}>
              ID: {reservationId}
            </p>

            <button 
              onClick={handleSimulasiWebhook}
              className="mt-3 text-[10px] bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200 px-2 py-1 rounded w-full font-bold"
            >
              Simulasi Bayar
            </button>
          </div>
        )}

        {isPaid && (
          <div className="mt-4 flex flex-col items-center bg-green-100 p-3 rounded border border-green-400 w-full">
            <p className="text-sm font-black text-green-700">✅ PEMBAYARAN LUNAS!</p>
            <p className="text-xs text-green-600 mt-1">Palang parkir telah terbuka.</p>
          </div>
        )}
      </div>
    </div>
  )
}