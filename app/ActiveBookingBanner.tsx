'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const HARGA_PER_JAM = 5000 

interface Props {
  slotCode: string
  startTime: string 
  reservationId: string 
  expiredAt?: string
  status: string 
}

export default function ActiveBookingBanner({ slotCode, startTime, reservationId, expiredAt, status }: Props) {
  const router = useRouter()
  
  const [isPaid, setIsPaid] = useState(status === 'booked' || status === 'parked') 
  const isParked = status === 'parked' 

  const [waktuBerjalan, setWaktuBerjalan] = useState('Menghitung...')
  const [totalHarga, setTotalHarga] = useState(HARGA_PER_JAM)
  const [urlQris, setUrlQris] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [sisaWaktuDP, setSisaWaktuDP] = useState<string>('') // Timer 10 Menit DP
  const [sisaWaktuMasuk, setSisaWaktuMasuk] = useState<string>('') // Timer 1 Jam Masuk Gerbang
  const [faseKeluar, setFaseKeluar] = useState<'idle' | 'bayar_argo' | 'qr_keluar'>('idle')

  // Buat cancle
  const handleCancelBooking = async (isDPPaid: boolean) => {
    // Jika sudah bayar DP
    const pesanKonfirmasi = isDPPaid
      ? "WARNING:\n\nJika Anda membatalkan booking, uang DP akan HANGUS dan tidak dikembalikan.\n\nApakah Anda yakin ingin tetap membatalkan?"
      : "Apakah Anda yakin ingin membatalkan booking parkiran ini?";

    const konfirmasi = window.confirm(pesanKonfirmasi);
    if (!konfirmasi) return;

    try {
      const res = await fetch('/api/gate/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId })
      });
      if (res.ok) {
        alert(isDPPaid ? 'Booking dibatalkan. Lahan dibebaskan & DP hangus.' : 'Booking berhasil dibatalkan gratis.');
        window.location.reload();
      }
    } catch (err) {
      alert('Gagal memproses pembatalan ke server.');
    }
  }

  // Biaya per jam
  useEffect(() => {
    if (!isParked) return;

    const hitungDurasi = () => {
      const waktuMulai = new Date(startTime).getTime()
      const waktuSekarang = new Date().getTime()
      const selisihMilidetik = waktuSekarang - waktuMulai

      const jam = Math.floor(selisihMilidetik / (1000 * 60 * 60))
      const menit = Math.floor((selisihMilidetik % (1000 * 60 * 60)) / (1000 * 60))
      setWaktuBerjalan(`${jam} Jam ${menit} Menit`)

      const totalJamTerhitung = Math.ceil(selisihMilidetik / (1000 * 60 * 60))
      const jamKenaArgo = Math.max(0, totalJamTerhitung - 1)
      setTotalHarga(jamKenaArgo * HARGA_PER_JAM)
    }

    hitungDurasi()
    const interval = setInterval(hitungDurasi, 60000)
    return () => clearInterval(interval)
  }, [startTime, isParked])

  // Cek status lunas
  useEffect(() => {
    if (!urlQris || isPaid) return; 

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/qris/status/${reservationId}`);
        const data = await response.json();
        if (data.status === 'booked') {
          setIsPaid(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error cek status:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [urlQris, isPaid, reservationId]);

  // Timer Bayar DP
  useEffect(() => {
    if (!expiredAt || isPaid) return;

    const interval = setInterval(() => {
      const waktuSekarang = new Date().getTime();
      const batasWaktu = new Date(expiredAt).getTime();
      const sisaMilidetik = batasWaktu - waktuSekarang;

      if (sisaMilidetik <= 0) {
        clearInterval(interval);
        alert('Waktu pembayaran habis! Booking dibatalkan');
        window.location.reload(); 
      } else {
        const m = Math.floor(sisaMilidetik / 60000);
        const s = Math.floor((sisaMilidetik % 60000) / 1000);
        setSisaWaktuDP(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt, isPaid]);

  //  Timer masuk gerbang
  useEffect(() => {
    if (!isPaid || isParked) return;

    const interval = setInterval(async () => {
      const waktuSekarang = new Date().getTime();
      // Batas waktu masuk 1 jam dari waktu booking dibuat
      const batasMasuk = new Date(startTime).getTime() + (60 * 60 * 1000); 
      const sisaMilidetik = batasMasuk - waktuSekarang;

      if (sisaMilidetik <= 0) {
        clearInterval(interval);
        alert('Batas waktu masuk parkiran (1 jam) telah habis! Booking hangus dan uang DP tidak dikembalikan.');
        try {
          await fetch('/api/gate/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reservationId })
          });
        } catch (e) { console.error(e); }
        window.location.reload();
      } else {
        const m = Math.floor(sisaMilidetik / 60000);
        const s = Math.floor((sisaMilidetik % 60000) / 1000);
        setSisaWaktuMasuk(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaid, isParked, startTime, reservationId]);

  const handleBayarQRIS = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: reservationId }),
      })
      const data = await response.json()
      if (data.sukses) setUrlQris(data.urlGambarQris)
      else alert(data.pesan)
    } catch (error) {
      alert("Error saat memproses QRIS")
    } finally {
      setLoading(false)
    }
  }

  const handleSimulasiWebhook = async () => {
    try {
      alert("Memproses pembayaran ke database, mohon tunggu..."); 
      const response = await fetch('/api/qris/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: reservationId,
          transaction_status: "success" 
        }),
      });
      const data = await response.json();
      if (data.sukses) {
        alert("Pembayaran Berhasil! Memuat Tiket Masuk...");
        setIsPaid(true);
      } else {
        alert("Pembayaran Gagal: " + data.pesan);
      }
    } catch (error) {
      alert("⚠️ Gagal konek ke API Webhook.");
    }
  }

  return (
    <div className="w-full bg-blue-50 border-2 border-blue-200 p-5 rounded-xl mb-8 flex flex-col sm:flex-row items-center justify-between shadow-sm">
      {/* KIRI: INFO STATUS & WAKTU */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Status Parkir Kamu</p>
        <h3 className="text-lg font-black text-blue-900 mt-1">
          Parkiran: <span className="text-xl text-blue-600 bg-blue-100 px-3 py-1 rounded-lg mx-1">{slotCode}</span>
        </h3>
        
        {isParked ? (
          <p className="text-sm text-gray-700 mt-2 font-medium">
            Waktu berjalan: <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-100">{waktuBerjalan}</span>
          </p>
        ) : isPaid ? (
          <div className="mt-2">
            <p className="text-sm text-orange-600 font-medium">⏳ Silakan menuju gerbang parkir...</p>
            <p className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded mt-1 inline-block">
              Batas Masuk Gerbang: {sisaWaktuMasuk || 'Loading...'}
            </p>
          </div>
        ) : (
          <div className="mt-2">
             <p className="text-sm text-red-600 font-medium">⚠️ Menunggu Pembayaran DP</p>
             <p className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded mt-1 inline-block">
               Sisa Waktu Bayar: {sisaWaktuDP || 'Loading...'}
             </p>
          </div>
        )}
      </div>

      {/* KANAN: KONTROL */}
      <div className="mt-4 sm:mt-0 bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-right min-w-[200px] flex flex-col items-end">
        
        {/* FASE 1: BELUM BAYAR DP */}
        {!isPaid && (
          <>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Tagihan Awal</p>
            <p className="text-3xl font-black text-green-600">Rp 5.000</p>
            <button onClick={handleBayarQRIS} disabled={loading} className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-3 rounded-lg shadow disabled:bg-gray-400">
              {loading ? '⏳ Memproses...' : '📱 Bayar Pakai QRIS'}
            </button>
            {urlQris && (
              <div className="mt-4 flex flex-col items-center bg-gray-50 p-2 rounded border w-full">
                <p className="text-xs font-bold mb-1">Qris Pembayaran:</p>
                <img src={urlQris} alt="QR Code" className="w-[100px] h-[100px]" />
                <button onClick={handleSimulasiWebhook} className="mt-3 text-[10px] bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded w-full font-bold">
                  Simulasi Bayar DP
                </button>
              </div>
            )}
            {/* Cancle sebelum bayar */}
            <button 
              onClick={() => handleCancelBooking(false)}
              className="mt-3 text-xs font-medium text-gray-400 hover:text-red-500 underline transition w-full text-center"
            >
              Batalkan Booking
            </button>
          </>
        )}

        {/* FASE 2: TIKET MASUK */}
        {isPaid && !isParked && (
          <div className="flex flex-col items-center bg-green-50 p-4 rounded-xl border border-green-400 w-full mt-2">
            <p className="text-sm font-black text-green-700 mb-2">TIKET MASUK AKTIF</p>
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reservationId}`} alt="QR Tiket" className="w-[100px] h-[100px]" />
            </div>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/gate/entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reservationId })
                  });
                  if (res.ok) {
                    alert('Portal Terbuka! Jam pertama gratis dan akan terkena Biaya 5000 per Jam');
                    window.location.reload();
                  }
                } catch (err) { alert('Error koneksi gerbang'); }
              }}
              className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg"
            >
              Scan Portal Masuk
            </button>

            {/* Cancle Masuk */}
            <button 
              onClick={() => handleCancelBooking(true)}
              className="mt-3 text-[10px] font-bold text-red-500 hover:text-red-700 underline transition"
            >
              Batal Masuk (Uang DP hangus)
            </button>
          </div>
        )}

        {/* FASE 3: SUDAH PARKIR */}
        {isParked && (
          <>
            <p className="text-xs text-gray-500 font-semibold mb-1">Tagihan Keluar Gerbang</p>
            <p className="text-3xl font-black text-red-600">Rp {totalHarga.toLocaleString('id-ID')}</p>
            {totalHarga === 0 ? (
              <p className="text-[10px] text-green-500 mt-1 font-bold">*(1 Jam Pertama Gratis / Cover DP)</p>
            ) : (
              <p className="text-[10px] text-gray-400 mt-1">*(Tarif Rp {HARGA_PER_JAM.toLocaleString('id-ID')}/jam)</p>
            )}
            
            <div className="w-full mt-4 border-t border-dashed border-gray-300 pt-4">
              {faseKeluar === 'idle' && (
                <button 
                  onClick={() => totalHarga === 0 ? setFaseKeluar('qr_keluar') : setFaseKeluar('bayar_argo')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow"
                >
                  Proses Keluar
                </button>
              )}

              {faseKeluar === 'bayar_argo' && (
                <div className="flex flex-col items-center bg-orange-50 p-3 rounded border border-orange-300 w-full">
                  <p className="text-xs font-bold text-orange-700 mb-2">Bayar Sisa Argo:</p>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=BAYAR-${totalHarga}`} alt="QRIS Argo" className="w-[100px] h-[100px]" />
                  <button 
                    onClick={() => {
                      alert('Pembayaran Lunas! Memuat Tiket Keluar...');
                      setFaseKeluar('qr_keluar');
                    }}
                    className="mt-3 text-[10px] bg-orange-600 text-white hover:bg-orange-700 px-2 py-2 rounded w-full font-bold shadow"
                  >
                    Simulasi Bayar Rp {totalHarga.toLocaleString('id-ID')}
                  </button>
                </div>
              )}

              {faseKeluar === 'qr_keluar' && (
                <div className="flex flex-col items-center bg-blue-50 p-3 rounded border border-blue-400 w-full">
                  <p className="text-xs font-black text-blue-800 mb-2">TIKET KELUAR</p>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=EXIT-${reservationId}`} alt="QR Tiket Keluar" className="w-[100px] h-[100px]" />
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/gate/exit', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reservationId })
                        });
                        if (res.ok) {
                          alert('Terima Kasih dan Sampai Jumpa');
                          window.location.reload(); 
                        }
                      } catch (err) { alert('Error API gerbang keluar'); }
                    }}
                    className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg shadow"
                  >
                     Scan Portal Keluar
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}