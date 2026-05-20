'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createParkingSlot(formData: FormData) {
  const slotName = formData.get('slotName') as string
  
  if (!slotName) {
    return { error: 'Nama/Kode slot parkir tidak boleh kosong!' }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Ambil data sesi user saat ini
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak. Silakan login.' }

  // 2. CEK OTORISASI: Apakah user ini adalah Admin?
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ilegal! Hanya Admin yang boleh menambah lahan.' }
  }

  // 3. Eksekusi penambahan lahan ke database
  const { error } = await supabase
    .from('parking_slots')
    .insert({
      name: slotName,       
      status: 'available'  
    })

  if (error) {
    console.error(error)
    return { error: 'Gagal menyimpan ke database. Cek kembali koneksi.' }
  }

  // 4. Refresh tampilan agar slot baru langsung muncul
  revalidatePath('/admin') 
  
  return { success: true, message: `Lahan parkir ${slotName} berhasil ditambahkan!` }
}