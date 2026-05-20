import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Mengambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()

  // FUNGSI LOGOUT (Server Action)
  const signOut = async () => {
    'use server'
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    await supabase.auth.signOut() 
    redirect('/login') 
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* 1. NAVBAR (Baris Atas) */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-800 shadow-sm">
        <h1 className="text-xl font-bold text-blue-500">
          Aplikasi Parkir 🚗
        </h1>

        {/* Tombol Logout dipindah ke sini */}
        <form action={signOut}>
          <button 
            type="submit" 
            className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
          >
            Keluar
          </button>
        </form>
      </header>

      {/* 2. KONTEN UTAMA (Tengah Layar) */}
      <main className="flex flex-col items-center mt-12 px-4">
        
        {/* Info User */}
        <div className="mb-8 text-center">
          <p className="text-gray-400">
            Selamat datang! Kamu berhasil login dengan ID:
          </p>
          <p className="text-sm text-green-400 font-mono mt-1">
            {user?.id}
          </p>
        </div>

        {/* Area Pemetaan Lahan Parkir */}
        <div className="w-full max-w-4xl p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 flex items-center justify-center min-h-[300px]">
          <p className="text-gray-500 text-lg">
            Area Denah Parkir & Fitur Booking (Segera Hadir)
          </p>
        </div>
        
      </main>
    </div>
  )
}