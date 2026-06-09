import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default function LoginPage() {
  const signIn = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(error)
      return redirect('/login?message=Gagal login, cek email/password')
    }

    return redirect('/') 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <form className="flex flex-col w-full max-w-sm gap-4 p-8 bg-gray-900 rounded-lg shadow-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Masuk ke Akun</h1>

        <label className="text-gray-300">Email</label>
        <input 
          className="px-4 py-2 text-black rounded" 
          name="email" 
          type="email" 
          placeholder="contoh@binus.ac.id"
          required 
        />

        <label className="text-gray-300 mt-2">Password</label>
        <input 
          className="px-4 py-2 text-black rounded" 
          name="password" 
          type="password" 
          placeholder="Masukkan password"
          required 
        />

        <button formAction={signIn} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded mt-6">
          Sign In
        </button>

        {/* Link untuk pindah ke halaman Register */}
        <div className="text-center mt-4 text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Daftar di sini
          </Link>
        </div>
      </form>
    </div>
  )
}