import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default function RegisterPage() {
  const signUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phoneNumber = formData.get('phoneNumber') as string

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, 
          phone_number: phoneNumber, 
        },
      },
    })

    if (error) {
      console.error(error)
      return redirect('/register?message=Gagal mendaftar')
    }
    
    // Jika sukses, arahkan pengguna kembali ke halaman login
    return redirect('/login?message=Berhasil mendaftar! Silakan Sign In')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <form className="flex flex-col w-full max-w-sm gap-4 p-8 bg-gray-900 rounded-lg shadow-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Buat Akun Baru</h1>

        <label className="text-gray-300">Nama Lengkap</label>
        <input className="px-4 py-2 text-black rounded" name="fullName" type="text" placeholder="Masukkan nama lengkap" required />

        <label className="text-gray-300 mt-2">Nomor Telepon</label>
        <input className="px-4 py-2 text-black rounded" name="phoneNumber" type="tel" placeholder="Contoh: 081234567890" required />

        <label className="text-gray-300 mt-2">Email</label>
        <input className="px-4 py-2 text-black rounded" name="email" type="email" placeholder="contoh@binus.ac.id" required />

        <label className="text-gray-300 mt-2">Password</label>
        <input className="px-4 py-2 text-black rounded" name="password" type="password" placeholder="Minimal 6 karakter" required />

        <button formAction={signUp} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded mt-6">
          Register
        </button>

        {/* Link untuk pindah ke halaman Login */}
        <div className="text-center mt-4 text-sm text-gray-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Masuk di sini
          </Link>
        </div>
      </form>
    </div>
  )
}