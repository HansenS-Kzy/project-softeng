import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <div className="p-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800 text-center">
        <h1 className="text-3xl font-bold text-blue-500 mb-4">
          Beranda Aplikasi Parkir 🚗
        </h1>
        <p className="text-gray-400 mb-6">
          Selamat datang! Kamu berhasil login dengan ID: <br/>
          <span className="text-xs text-green-400">{user?.id}</span>
        </p>
        
        <p>herrick gay</p>

        {/* Nanti kita akan taruh denah parkir di sini */}
        <div className="p-4 border border-dashed border-gray-600 rounded">
          Area Denah Parkir (Segera Hadir)
        </div>
      </div>
    </div>
  )
}