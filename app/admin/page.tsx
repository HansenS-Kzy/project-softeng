import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Cek User Login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Cek Role Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Akses Ditolak 🛑</h1>
        <p className="text-gray-600">Halaman ini khusus untuk Admin Parkir.</p>
        <Link href="/" className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  // 3. Ambil Data Slot, User, dan Data Booking
  const { data: slots } = await supabase
    .from('parking_slots')
    .select('*')
    .order('slot_code', { ascending: true })

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  // 🔥 FITUR BARU: Ambil data reservasi aktif beserta nama pemesannya
  const { data: activeBookings } = await supabase
    .from('reservations')
    .select('slot_id, profiles(full_name)')
    .eq('status', 'pending')

  // 4. LOGIKA TAMBAH LAHAN
  const addSlot = async (formData: FormData) => {
    'use server'
    const slotName = formData.get('slotName') as string
    if (!slotName) return

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    const { error } = await supabase.from('parking_slots').insert({ 
      slot_code: slotName, 
      status: 'available' 
    })
    
    if (error) {
      console.error("GAGAL MENAMBAH SLOT:", error)
    }
    revalidatePath('/admin')
  }

  // 5. LOGIKA UBAH ROLE USER
  const toggleUserRole = async (formData: FormData) => {
    'use server'
    const targetUserId = formData.get('userId') as string
    const currentRole = formData.get('currentRole') as string
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId)
    revalidatePath('/admin')
  }

  // TAMPILAN HALAMAN (UI)
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Kiri & Tengah: Kelola Parkir */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Dashboard Admin 🛠️</h1>
            <Link href="/" className="text-sm text-gray-500 hover:underline">← Kembali</Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4">Tambah Slot Parkir Baru</h2>
            <form action={addSlot} className="flex gap-4">
              <input 
                type="text" 
                name="slotName" 
                placeholder="Contoh: A1, B3..." 
                className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-blue-500"
                required
              />
              <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded transition-colors">
                Tambah
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Daftar Slot Saat Ini</h2>
            {slots && slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {slots.map((slot) => {
                  // 🔥 FITUR BARU: Mencocokkan lahan parkir dengan tiket reservasi
                  const bookingInfo = activeBookings?.find(b => b.slot_id === slot.id)
                  const bookerName = (bookingInfo?.profiles as any)?.full_name

                  return (
                    <div key={slot.id} className="border border-gray-200 rounded-lg p-4 text-center bg-gray-50 flex flex-col justify-center">
                      <p className="font-bold text-lg">{slot.slot_code}</p>
                      <p className={`text-xs mt-1 font-semibold ${slot.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                        {slot.status === 'available' ? 'Kosong' : 'Terisi'}
                      </p>
                      
                      {/* 🔥 FITUR BARU: Menampilkan nama user jika slot sedang terisi */}
                      {slot.status !== 'available' && bookerName && (
                        <p className="mt-2 text-[11px] font-bold text-blue-800 bg-blue-100 py-1 px-2 rounded break-words">
                          👤 {bookerName}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">Belum ada lahan parkir.</p>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Manajemen Pengguna */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            👥 Kelola Akses User
          </h2>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
            {allUsers && allUsers.map((u) => (
              <div key={u.id} className="p-3 border-b border-gray-100 last:border-0 flex flex-col gap-2">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{u.full_name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    Role: {u.role.toUpperCase()}
                  </span>
                </div>

                {u.id !== user.id && (
                  <form action={toggleUserRole}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="currentRole" value={u.role} />
                    <button 
                      type="submit"
                      className={`text-xs font-semibold py-1 px-3 rounded w-full transition-colors text-center ${
                        u.role === 'admin' 
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' 
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {u.role === 'admin' ? 'Turunkan Jadi User' : 'Jadikan Admin'}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}