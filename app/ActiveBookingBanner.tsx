'use client'

import { useEffect, useState } from 'react'

// Harga sementara (Nanti bisa diganti dengan tarikan data dari tabel pengaturan Admin)
const HARGA_PER_JAM = 5000 

interface Props {
  slotCode: string
  startTime: string // Waktu saat user klik tombol booking (created_at)
}

export default function ActiveBookingBanner({ slotCode, startTime }: Props) {
  const [waktuBerjalan, setWaktuBerjalan] = useState('Menghitung...')
  const [totalHarga, setTotalHarga] = useState(HARGA_PER_JAM)

  useEffect(() => {
    const hitungDurasi = () => {
      const waktuMulai = new Date(startTime).getTime()
      const waktuSekarang = new Date().getTime()
      const selisihMilidetik = waktuSekarang - waktuMulai

      // 1. Hitung format Teks (Berapa Jam Berapa Menit)
      const jam = Math.floor(selisihMilidetik / (1000 * 60 * 60))
      const menit = Math.floor((selisihMilidetik % (1000 * 60 * 60)) / (1000 * 60))
      setWaktuBerjalan(`${jam} Jam ${menit} Menit`)

      // 2. Hitung Harga (Logika Parkir Standar: Lewat 1 menit = Masuk jam berikutnya)
      // Math.ceil akan membulatkan ke atas. Minimal terhitung 1 Jam.
      const totalJamTerhitung = Math.max(1, Math.ceil(selisihMilidetik / (1000 * 60 * 60)))
      setTotalHarga(totalJamTerhitung * HARGA_PER_JAM)
    }

    // Jalankan pertama kali saat halaman dibuka
    hitungDurasi()

    // Buat interval agar mesin menghitung ulang setiap 1 menit (60.000 ms)
    const interval = setInterval(hitungDurasi, 60000)
    
    // Bersihkan memori saat user pindah halaman
    return () => clearInterval(interval)
  }, [startTime])

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
      <div className="mt-4 sm:mt-0 bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-right min-w-[200px]">
        <p className="text-xs text-gray-500 font-semibold mb-1">Total Tagihan Sementara</p>
        <p className="text-3xl font-black text-green-600">
          Rp {totalHarga.toLocaleString('id-ID')}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">*(Tarif Rp {HARGA_PER_JAM.toLocaleString('id-ID')}/jam)</p>
        
        <button className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-3 rounded-lg shadow transition-colors flex justify-center items-center gap-2">
          📱 Bayar Pakai QRIS
        </button>
      </div>
    </div>
  )
}