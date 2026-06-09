'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Clock, MapPin, QrCode, LogIn, LogOut, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

// Tipe data menyesuaikan dengan schema Prisma temanmu
interface Booking {
  id: string;
  slot_id: string;
  status: 'pending' | 'booked' | 'parked' | 'completed' | 'cancelled';
  created_at: string;
  entry_time: string | null;
  exit_time: string | null;
}

export default function BookingsPage() {
  const { currentUser: user, addToast } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data booking user dari database (Bisa disesuaikan kalau ada API khusus getReservations)
  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    // Asumsi tabel bernama 'reservations'
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.userID)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    // Auto refresh tiap 10 detik untuk cek status QRIS/Gate
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <div className="p-8 text-white">Memuat data tiket...</div>;
  if (bookings.length === 0) return <div className="p-8 text-white">Belum ada tiket parkir.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Tiket Parkir Aktif</h1>

      {bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').map((booking) => (
        <BookingCard key={booking.id} booking={booking} onRefresh={fetchBookings} />
      ))}

      <h2 className="text-xl font-bold text-slate-400 mt-12 mb-4">Riwayat Parkir</h2>
      <div className="opacity-70">
        {bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').map((booking) => (
          <BookingCard key={booking.id} booking={booking} onRefresh={fetchBookings} isHistory />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN CARD UNTUK MASING-MASING TIKET
// ==========================================
function BookingCard({ booking, onRefresh, isHistory = false }: { booking: Booking, onRefresh: () => void, isHistory?: boolean }) {
  const { addToast } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);

  // FASE 1: Mintakan QRIS ke backend kalau status masih pending
  useEffect(() => {
    if (booking.status === 'pending') {
      generateQris();
    }
  }, [booking.status]);

  const generateQris = async () => {
    try {
      const res = await fetch('/api/qris', {
        method: 'POST',
        body: JSON.stringify({ orderId: booking.id })
      });
      if (!res.ok) throw new Error('API route not found');
      const data = await res.json();
      if (data.sukses) setQrisUrl(data.urlGambarQris);
    } catch (error) {
      console.error("Gagal load QRIS", error);
      // Fallback if API doesn't exist yet
      setQrisUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRIS-${booking.id}`);
    }
  };

  // AKSI: Batalkan Booking (Memanggil API /api/gate/cancel)
  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan? (Jika sudah bayar, uang hangus)")) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/gate/cancel', {
        method: 'POST',
        body: JSON.stringify({ reservationId: booking.id })
      });
      if (!res.ok) throw new Error('API route not found');
      const data = await res.json();
      if (data.sukses) {
        addToast('success', 'Dibatalkan', data.pesan);
        onRefresh();
      } else {
        addToast('error', 'Gagal', data.pesan);
      }
    } catch (error) {
      addToast('error', 'API Error', 'Gagal membatalkan (API belum tersedia).');
    } finally {
      setActionLoading(false);
    }
  };

  // AKSI: Bayar (Memanggil API /api/qris/webhook buatan temanmu)
  const handleSimulatePayment = async () => {
    setActionLoading(true);
    try {
      // Pastikan payload sesuai dengan yang diharapkan backend: 
      // { orderId: string, transaction_status: string }
      const res = await fetch('/api/qris/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: booking.id,
          transaction_status: 'success'
        })
      });

      const data = await res.json();

      if (res.ok && data.sukses) {
        addToast('success', 'Pembayaran Berhasil', 'DP Parkir sudah lunas!');
        onRefresh(); // Refresh data supaya status berubah dari pending ke booked
      } else {
        addToast('error', 'API Error', data.pesan || 'Gagal memproses pembayaran');
      }
    } catch (error) {
      console.error("Payment Error:", error);
      addToast('error', 'System Error', 'Tidak dapat menghubungi server pembayaran');
    } finally {
      setActionLoading(false);
    }
  };

  // AKSI: Masuk Gerbang (Memanggil API /api/gate/entry)
  const handleEntry = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/gate/entry', {
        method: 'POST',
        body: JSON.stringify({ reservationId: booking.id })
      });
      if (!res.ok) throw new Error('API route not found');
      const data = await res.json();
      if (data.sukses) {
        addToast('success', 'Akses Dibuka', 'Silakan masuk ke area parkir!');
        onRefresh();
      } else {
        addToast('error', 'Gagal Masuk', data.pesan);
      }
    } catch (error) {
      addToast('error', 'API Error', 'Gagal masuk gerbang (API belum tersedia).');
    } finally {
      setActionLoading(false);
    }
  };

  // AKSI: Keluar Parkiran / Tap Out (Memanggil API /api/gate/exit)
  const handleExit = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/gate/exit', {
        method: 'POST',
        body: JSON.stringify({ reservationId: booking.id })
      });
      if (!res.ok) throw new Error('API route not found');
      const data = await res.json();
      if (data.sukses) {
        addToast('success', 'Terima Kasih', 'Anda berhasil keluar dari parkiran.');
        onRefresh();
      } else {
        addToast('error', 'Gagal Keluar', data.pesan);
      }
    } catch (error) {
      addToast('error', 'API Error', 'Gagal keluar gerbang (API belum tersedia).');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="glass-elevated p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 items-start">
      {/* Info Tiket Kiri */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
            booking.status === 'booked' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              booking.status === 'parked' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                booking.status === 'completed' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
            {booking.status}
          </span>
          <span className="text-xs text-slate-500 font-mono">ID: {booking.id.split('-')[0]}</span>
        </div>

        <div className="flex items-center gap-3 text-white">
          <MapPin className="text-[#00f0ff]" size={20} />
          <span className="font-bold text-lg">Slot: {booking.slot_id.slice(0, 8)}...</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Clock size={16} />
          <span>Dibuat: {new Date(booking.created_at).toLocaleString('id-ID')}</span>
        </div>
        {booking.entry_time && (
          <div className="flex items-center gap-3 text-emerald-400 text-sm">
            <LogIn size={16} />
            <span>Masuk: {new Date(booking.entry_time).toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Bagian Kanan: QRIS & Aksi berdasarkan Status */}
      {!isHistory && (
        <div className="w-full md:w-64 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">

          {/* FASE 1: PENDING (Bayar DP) */}
          {booking.status === 'pending' && (
            <>
              <p className="text-xs text-center text-slate-400 mb-2">Selesaikan DP (Rp 5.000) dalam 10 menit.</p>
              {qrisUrl ? (
                <div className="bg-white p-2 rounded-xl flex justify-center mb-2">
                  <img src={qrisUrl} alt="QRIS" className="w-32 h-32 object-contain" />
                </div>
              ) : (
                <div className="h-32 bg-white/5 rounded-xl flex items-center justify-center text-xs text-slate-500 animate-pulse">Memuat QRIS...</div>
              )}

              <button
                onClick={handleSimulatePayment}
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <CheckCircle size={16} /> Sudah Bayar
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <XCircle size={16} /> Batalkan
              </button>
            </>
          )}

          {/* FASE 2: BOOKED (Sudah DP, Belum Masuk Portal) */}
          {booking.status === 'booked' && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-center mb-2">
                <QrCode className="text-blue-400 mx-auto mb-2" size={24} />
                <p className="text-xs text-blue-300">Arahkan mobil Anda ke Gerbang Masuk.</p>
              </div>
              <button
                onClick={handleEntry}
                disabled={actionLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <LogIn size={16} /> Simulasi Masuk Portal
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full text-slate-400 hover:text-red-400 text-xs py-2 transition"
              >
                Batalkan (DP Hangus)
              </button>
            </>
          )}

          {/* FASE 3: PARKED (Sedang di dalam) */}
          {booking.status === 'parked' && (
            <>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center mb-2">
                <p className="text-xs text-emerald-400 mb-1">Status Parkir Aktif</p>
                <p className="text-lg font-bold text-white">1 Jam Pertama = Lunas</p>
                <p className="text-[10px] text-slate-400 mt-2">*Kelebihan waktu akan ditagih saat Tap Out</p>
              </div>
              <button
                onClick={handleExit}
                disabled={actionLoading}
                className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <LogOut size={16} /> Tap Out / Keluar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}